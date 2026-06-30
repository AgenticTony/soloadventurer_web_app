---
description: Commit all changes, push to a branch, and open a PR
---

Current branch: !`git branch --show-current`
Changed files:
!`git diff --stat`
!`git status --short`

## Steps

1. Review the changes above. If nothing is staged, stage everything with `git add -A`.
2. Write a conventional commit message based on the diff:
   - `feat:` new feature · `fix:` bug fix · `chore:` maintenance
   - `docs:` documentation · `refactor:` restructuring (no behavior change)
3. Commit with the message.
4. If on `main`, create a feature branch first: `git checkout -b <type>/<short-description>`, then commit there.
5. Push to origin with `git push -u origin HEAD`.
6. Open a PR with `gh pr create`:
   - Title: the commit subject line
   - Body: brief summary of what changed + a test plan + "Sources" (official doc URLs used, per CLAUDE.md docs grounding)
   - Keep it concise — 3–5 lines

Never run `gh pr merge`. PRs wait for human review.
