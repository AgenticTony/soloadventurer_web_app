#!/usr/bin/env python3
"""Regenerate the checkbox-driven fields of ``.claude/state/sprint-progress.json``
from the live checkbox state in ``docs/sprints/*.md``.

The state file is contractually "derived solely from checkbox state" (see its
``generated_note``), but nothing in the repo regenerates it — so it drifts after
every merged PR. This script keeps it current.

Refreshed (checkbox-derived):
  - per sprint: ``checkboxes.{done,todo,total}``, ``completion_pct``, ``done``
  - per story (best-effort, via ``###`` section headings, exact name match):
    ``done_count``, ``todo_count``, ``total``, ``completion_pct``, ``done``
  - ``summary.completed_100pct``, ``summary.needs_human_review``, ``sprint_count``
Created: a sprint doc with no state entry is materialized (see ``build_sprint``)
rather than skipped. Skipping is what let PHASE_W and PHASE_A_PUBLIC_SURFACE stay
invisible to the loop for eight days after they were written.
Preserved on EXISTING entries (NOT derivable from checkboxes):
``needs_human_review``, ``verified``, ``review_reasons``, ``git_reconciliation``,
``flagged``, ``flag_reason``, and the ``generated_note`` methodology text.

Usage:
  python3 scripts/regen-sprint-progress.py         # update in place
  python3 scripts/regen-sprint-progress.py --check  # dry-run; exit 1 on drift

Idempotent: a second run is a no-op.
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATE = os.path.join(REPO, ".claude", "state", "sprint-progress.json")
SPRINT_DIR = os.path.join(REPO, "docs", "sprints")

DONE_RE = re.compile(r"- \[x\]", re.IGNORECASE)
TODO_RE = re.compile(r"- \[ \]")
H3_RE = re.compile(r"^###\s+(.+?)\s*$")
# An H2 closes the current story bucket. Without this, the "Definition of Done"
# boxes (an H2 section) get attributed to whichever story happened to be last.
H2_RE = re.compile(r"^##\s+(?!#)(.+?)\s*$")
NEEDS_HUMAN_RE = re.compile(r"\[needs_human:\s*true\]", re.IGNORECASE)

# Phase id -> sprint_number. New phase docs must be registered here so the
# generated entry carries the FOUNDATIONS §9 letter rather than a guess.
SPRINT_NUMBERS = {
    "PHASE_0_BLOCKERS": "0",
    "PHASE_A_LAY_THE_SPINE": "A",
    "PHASE_A_PUBLIC_SURFACE": "A",
    "PHASE_B_CLOSE_THE_LOOP": "B",
    "PHASE_C_AGENT_LAYER": "C",
    "PHASE_D_TRUST_LAYER": "D",
    "PHASE_E_SCALE": "E",
    "PHASE_W_FOUNDATION_UPGRADE": "W",
}


def norm(name: str) -> str:
    """Normalize a heading/story name for exact fuzzy matching."""
    return re.sub(r"[^a-z0-9 ]+", " ", name.lower()).strip()


def count_file(path: str):
    """Return (done, total, sections, needs_human) for one sprint .md.

    ``sections`` is keyed by the normalized ``###`` heading and preserves both
    the original heading (``name``) and document order, so a missing sprint can
    be materialized into the state file from the doc alone.
    """
    done = total = 0
    sections: dict[str, dict] = {}
    needs_human = False
    current = None
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            if NEEDS_HUMAN_RE.search(line):
                needs_human = True
            heading = H3_RE.match(line)
            if heading:
                original = heading.group(1)
                current = norm(original)
                sections.setdefault(current, {"name": original, "done": 0, "total": 0})
                continue
            if H2_RE.match(line):
                # Leaving the Stories section — subsequent boxes (Definition of
                # Done, etc.) belong to the sprint, not to the preceding story.
                current = None
                continue
            is_done = bool(DONE_RE.search(line))
            is_todo = bool(TODO_RE.search(line))
            if is_done or is_todo:
                total += 1
                if is_done:
                    done += 1
                if current is not None:
                    sections[current]["total"] += 1
                    if is_done:
                        sections[current]["done"] += 1
    return done, total, sections, needs_human


def build_sprint(sid: str, md: str, sections: dict, needs_human: bool) -> dict:
    """Materialize a state entry for a sprint doc that has none yet.

    Judgment fields get conservative defaults: ``needs_human_review`` follows the
    established convention (a ``[needs_human: true]`` annotation anywhere in the
    doc — a ``[safety: true]`` alone does not trigger it, matching every
    hand-set entry), and ``verified`` starts empty for a human to fill.
    """
    if sid not in SPRINT_NUMBERS:
        print(
            f"warning: {sid} is not in SPRINT_NUMBERS — sprint_number will be null; "
            "add it to the map",
            file=sys.stderr,
        )
    stories = [
        {
            "name": sec["name"],
            "done": None if sec["total"] == 0 else (sec["done"] == sec["total"]),
            "done_count": sec["done"],
            "todo_count": sec["total"] - sec["done"],
            "total": sec["total"],
            "completion_pct": pct(sec["done"], sec["total"]),
        }
        for sec in sections.values()
        if sec["name"].lower().startswith("story")
    ]
    return {
        "id": sid,
        "sprint_number": SPRINT_NUMBERS.get(sid),
        "repo": "web",
        "file": md,
        "checkboxes": {"done": 0, "todo": 0, "total": 0},
        "completion_pct": None,
        "done": None,
        "verified": {
            "section": "Definition of Done / Acceptance Criteria",
            "done": 0,
            "todo": 0,
            "total": 0,
            "all_checked": False,
        },
        "needs_human_review": needs_human,
        "review_reasons": (
            ["Phase has needs-human/safety stories (see .md annotations)"] if needs_human else []
        ),
        "flagged": False,
        "flag_reason": None,
        "git_reconciliation": f"Entry materialized from {os.path.basename(md)} by regen-sprint-progress.py",
        "story_count": len(stories),
        "stories": stories,
    }


def prettier_format(path: str) -> None:
    """Normalize ``path`` with the repo's prettier.

    ``json.dump`` always explodes arrays onto multiple lines; prettier collapses
    short ones. Without this the script's own output fails the repo's format
    gate, so a regen could never be committed as-is.
    """
    if not shutil.which("npx"):
        print("warning: npx not found — skipping prettier; run it before committing", file=sys.stderr)
        return
    try:
        subprocess.run(
            ["npx", "--no-install", "prettier", "--write", path],
            cwd=REPO,
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except (subprocess.CalledProcessError, OSError):
        print("warning: prettier failed — run it before committing", file=sys.stderr)


def pct(done: int, total: int) -> float | None:
    """Completion %. ``None`` when there are no checkboxes — matches the
    original generator's 'not derivable' signal for checkbox-less sprints."""
    return round(100.0 * done / total, 1) if total else None


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="dry-run: report drift, write nothing, exit 1 if drift",
    )
    args = parser.parse_args()

    if not os.path.exists(STATE):
        print(f"error: state file not found: {STATE}", file=sys.stderr)
        return 2

    data = json.load(open(STATE, encoding="utf-8"))
    by_id = {s["id"]: s for s in data.get("sprints", [])}

    changes: list[tuple] = []

    for md in sorted(glob.glob(os.path.join(SPRINT_DIR, "*.md"))):
        sid = os.path.splitext(os.path.basename(md))[0]
        done, total, sections, needs_human = count_file(md)

        sprint = by_id.get(sid)
        if not sprint:
            # A new phase doc: materialize an entry rather than silently skipping
            # it. Skipping is what let PHASE_W / PHASE_A_PUBLIC_SURFACE sit
            # invisible to the loop from 2026-07-08 to 2026-07-16.
            sprint = build_sprint(sid, md, sections, needs_human)
            data.setdefault("sprints", []).append(sprint)
            by_id[sid] = sprint
            changes.append((sid, "CREATED_JSON_ENTRY", "—", f"{done}/{total}"))

        cb = sprint.setdefault("checkboxes", {"done": 0, "todo": 0, "total": 0})
        old_done, old_total = cb.get("done"), cb.get("total")
        if (old_done, old_total) != (done, total):
            changes.append((sid, "checkboxes", f"{old_done}/{old_total}", f"{done}/{total}"))
        # ``todo`` was never refreshed here, so it drifted out of step with
        # done/total (8 done + 11 todo != 14 total). Derive it.
        cb["done"], cb["todo"], cb["total"] = done, total - done, total

        new_pct = pct(done, total)
        if sprint.get("completion_pct") != new_pct:
            changes.append((sid, "completion_pct", sprint.get("completion_pct"), new_pct))
        sprint["completion_pct"] = new_pct

        new_done = None if total == 0 else (done == total)
        if sprint.get("done") != new_done:
            changes.append((sid, "done", sprint.get("done"), new_done))
        sprint["done"] = new_done

        # story-level: refresh only where a ### section name matches exactly AND
        # its scope (total) matches the recorded story scope. A differing total
        # means the original generator grouped this story differently than H3
        # sections — preserve it rather than impose a regrouping.
        for story in sprint.get("stories", []):
            key = norm(story.get("name", ""))
            if not key or key not in sections:
                continue
            sd, stot = sections[key]["done"], sections[key]["total"]
            if stot != story.get("total"):
                continue
            if story.get("done_count") != sd:
                changes.append(
                    (sid, story.get("name"), f"{story.get('done_count')}/{stot}", f"{sd}/{stot}")
                )
            story["done_count"] = sd
            story["todo_count"] = stot - sd
            story["completion_pct"] = pct(sd, stot)
            story["done"] = None if stot == 0 else (sd == stot)

    old_c100 = data.get("summary", {}).get("completed_100pct")
    new_c100 = sum(1 for s in data["sprints"] if s.get("done"))
    if old_c100 != new_c100:
        changes.append(("summary", "completed_100pct", old_c100, new_c100))
    data.setdefault("summary", {})["completed_100pct"] = new_c100

    new_nhr = sum(1 for s in data["sprints"] if s.get("needs_human_review"))
    if data["summary"].get("needs_human_review") != new_nhr:
        changes.append(("summary", "needs_human_review", data["summary"].get("needs_human_review"), new_nhr))
    data["summary"]["needs_human_review"] = new_nhr

    new_count = len(data["sprints"])
    if data.get("sprint_count") != new_count:
        changes.append(("summary", "sprint_count", data.get("sprint_count"), new_count))
    data["sprint_count"] = new_count

    drift = bool(changes)
    sprint_keys = {"checkboxes", "completion_pct", "done", "CREATED_JSON_ENTRY"}
    for row in changes:
        if row[0] == "summary":
            label = "summary"
        elif row[1] in sprint_keys:
            label = "sprint"
        else:
            label = "story"
        print(f"  [{label}] {row[0]:<30} {row[1]}: {row[2]} -> {row[3]}")
    if not drift:
        print("no drift — sprint-progress.json matches docs/sprints/*.md")

    if args.check:
        return 1 if drift else 0

    if drift:
        fd, tmp = tempfile.mkstemp(dir=os.path.dirname(STATE), suffix=".json")
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2, ensure_ascii=False)
            fh.write("\n")
        os.replace(tmp, STATE)
        prettier_format(STATE)
        print(f"\nupdated {os.path.relpath(STATE, REPO)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
