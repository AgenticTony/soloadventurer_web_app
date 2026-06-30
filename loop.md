# Standing maintenance loop

Bare `/loop` (or `/loop 2h`) runs this. Each iteration keeps itself to a small,
predictable budget — the goal is trustworthy, merge-quality PRs, not throughput.

## Each iteration

1. Run the `triage` skill → it appends NEW findings to `.claude/state/triage.json`
   (report-only; it writes no code).

2. Pick the highest-priority finding with `effort: "S"` that is NOT already in
   `in_progress` or `done`. If none qualify, stop — nothing actionable this run.

3. Move it to `in_progress`, then run the `implementer` subagent on it
   (worktree-isolated — it gets its own checkout and cannot collide).

4. Run the `verifier` subagent on the implementer's branch.
   - FAIL → send the numbered findings back to the `implementer`; max 3 attempts.
     After 3 fails on the same finding, mark it `"needs_human"` and move on.
   - PASS → open a PR via `gh pr create` (or the GitHub MCP if available),
     link the relevant issue, move the finding to `done` with the PR URL.

5. Update `.claude/state/triage.json` (`last_run`, list moves) after every finding.

## Stop conditions

- No eligible findings, OR
- 3 findings processed this run, OR
- Verifier failed the same finding 3 times.

## Hard guardrails (non-negotiable)

- **You merge, never the loop.** Every PR waits for human review. Never run
  `gh pr merge`. Branch protection on `main` should enforce this.
- **Iteration caps everywhere** — max 3 attempts per finding, max 3 findings
  per run, max turns per `/goal`.
- **No-progress detection** — 3 verifier FAILs on one finding escalates to human.
- **Read what it ships.** Before approving a PR, read the full diff yourself.
  Comprehension debt is the failure mode: a smooth loop can ship code nobody
  understands. A passing label is a claim, not a proof.
- **Token budget** — keep triage cheap; spend verifier/implementer tokens only
  on actionable findings. Check `/cost` if spend looks high.
