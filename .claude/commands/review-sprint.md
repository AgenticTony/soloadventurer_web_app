---
description: Review current sprint status — test baseline, git state, and the next sprint to run
---

!`echo "=== Test baseline (jest) ===" && npx jest --listTests 2>&1 | wc -l | xargs echo "test files:"`
!`echo "" && echo "=== Git status ===" && git status --short`
!`echo "" && echo "=== Recent commits ===" && git log --oneline -10`
!`echo "" && echo "=== Sprint docs ===" && ls -1 docs/sprints 2>/dev/null`

## Your job

Read the sprint files in `docs/sprints/`. Identify:

1. The next sprint in execution order that isn't marked complete (check the
   completion summaries in `docs/` — e.g. `Sprint-01-Completion-Summary.md`).
2. Its scope and whether it depends on unfinished work.
3. Whether it can run in parallel with anything.

Present a short summary and ask if the user wants to proceed with that sprint.
