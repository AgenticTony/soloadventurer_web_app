---
name: triage
description: Morning triage — read CI failures, open issues, and stale PRs; append NEW findings to the state file. Report-only; writes no code.
---

1. Read `.claude/state/triage.json`. Do NOT repeat findings already in
   `findings`, `in_progress`, or `done`.

2. Gather signal. Use the GitHub MCP if available, else `gh`:
   - Failed/red CI runs from the last 24h: `gh run list --status failure`
   - Open issues labelled `bug` (and any `bug`-ish label this repo uses):
     `gh issue list --label bug`
   - PRs with unresolved review comments or stuck > 3 days:
     `gh pr list --state open`

3. For each NEW item, append an object to `findings`:

   ```json
   {
     "id": "<short-unique-id>",
     "source": "ci | issue | pr",
     "ref": "<run id / issue # / pr #>",
     "summary": "<one line>",
     "proposed_fix": "<one line>",
     "effort": "S | M | L",
     "found": "<YYYY-MM-DD>"
   }
   ```

   Set `last_run` to today's date (the loop driver passes the date; do not
   invent one).

4. Output a short human summary: what's new, what you'd fix first (smallest
   effort, highest signal), and why.

Hard rules:

- Do NOT fix anything. Do NOT write code. Do NOT open PRs. Report only.
- Do NOT move items between lists — the loop driver (loop.md) does that.
- If you can't reach GitHub (no auth / offline), say so and stop — never
  hallucinate findings to fill the list.
