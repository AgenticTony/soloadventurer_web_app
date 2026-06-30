---
name: go
description: Finish the current task end to end — self-test, simplify, verify, ship. Append to any implementation prompt, e.g. "add RLS to the trips table /go".
---

Take the task in this conversation through to a shipped PR. The order matters:
**simplify runs BEFORE verify**, so the verifier inspects the final code —
including whatever the simplifier changed. If verify ran first, nobody would
check the simplifier's work.

1. Self-test first: exercise the change end to end yourself before involving
   the simplifier. In this project that means:
   - Run the relevant unit tests: `npm test` (or scope it, e.g.
     `npx jest src/lib/supabase`).
   - Typecheck and lint: `npm run typecheck && npm run lint`.
   - For API routes / server behavior: start `npm run dev` and `curl` the
     endpoint, or drive it with the Playwright MCP. A passing Jest label is
     not proof — hit the real path.
     Fix anything you find.

2. Run the `code-simplifier` subagent, then re-run `npm test` and
   `npm run typecheck` to confirm the simplification broke nothing.

3. Run the `verifier` subagent on the simplified branch — this is the final
   gate before commit, so it catches any mistake the simplifier introduced.
   - FAIL → fix exactly the numbered findings, re-simplify, re-run the
     verifier. Repeat until PASS. The verifier must always see the final state.
   - If the same finding fails 3 times, stop and report it to me instead of
     grinding.

4. Run `/commit-push-pr`. The PR body must include:
   - Test evidence (the actual command output, trimmed)
   - "Sources": official doc URLs used (per CLAUDE.md docs grounding)
   - The verifier's verdict block, including any "REQUIRES LIVE INTEGRATION
     TEST" line verbatim (e.g. for Supabase Edge Functions / live auth flows)

Rules:

- Do not skip the verifier even for "trivial" changes — trivial is where
  regressions hide.
- Never weaken or delete existing tests to reach PASS.
- If the task is bigger than one PR, stop after a coherent first slice and
  say what you'd split out.
