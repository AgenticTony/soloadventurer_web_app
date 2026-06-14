#!/usr/bin/env python3
"""Regenerate the checkbox-driven fields of ``.claude/state/sprint-progress.json``
from the live checkbox state in ``docs/sprints/*.md``.

The state file is contractually "derived solely from checkbox state" (see its
``generated_note``), but nothing in the repo regenerates it — so it drifts after
every merged PR. This script keeps it current.

Refreshed (checkbox-derived):
  - per sprint: ``checkboxes.{done,total}``, ``completion_pct``, ``done``
  - per story (best-effort, via ``###`` section headings, exact name match):
    ``done_count``, ``todo_count``, ``total``, ``completion_pct``, ``done``
  - ``summary.completed_100pct``
Preserved (NOT derivable from checkboxes): ``needs_human_review``,
``verified``, ``review_reasons``, ``git_reconciliation``, ``flagged``,
``flag_reason``, and the ``generated_note`` methodology text.

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
import sys
import tempfile

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATE = os.path.join(REPO, ".claude", "state", "sprint-progress.json")
SPRINT_DIR = os.path.join(REPO, "docs", "sprints")

DONE_RE = re.compile(r"- \[x\]", re.IGNORECASE)
TODO_RE = re.compile(r"- \[ \]")
H3_RE = re.compile(r"^###\s+(.+?)\s*$")


def norm(name: str) -> str:
    """Normalize a heading/story name for exact fuzzy matching."""
    return re.sub(r"[^a-z0-9 ]+", " ", name.lower()).strip()


def count_file(path: str):
    """Return (done, total, {norm_section: {done, total}}) for one sprint .md."""
    done = total = 0
    sections: dict[str, dict[str, int]] = {}
    current = None
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            heading = H3_RE.match(line)
            if heading:
                current = norm(heading.group(1))
                sections.setdefault(current, {"done": 0, "total": 0})
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
    return done, total, sections


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
        sprint = by_id.get(sid)
        if not sprint:
            changes.append((sid, "NO_JSON_ENTRY", "—", "—"))
            continue

        done, total, sections = count_file(md)

        cb = sprint.setdefault("checkboxes", {"done": 0, "total": 0})
        old_done, old_total = cb.get("done"), cb.get("total")
        if (old_done, old_total) != (done, total):
            changes.append((sid, "checkboxes", f"{old_done}/{old_total}", f"{done}/{total}"))
        cb["done"], cb["total"] = done, total

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

    drift = bool(changes)
    sprint_keys = {"checkboxes", "completion_pct", "done", "NO_JSON_ENTRY"}
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
        print(f"\nupdated {os.path.relpath(STATE, REPO)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
