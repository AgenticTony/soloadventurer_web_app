# Sprint 7.1: Stabilize + Commit + Build Fix

**SoloAdventurer Web App - Sprint 7.1**
**Duration**: 1-2 days
**Status**: 🔄 Ready to Start
**Dependencies**: None (immediate priority)

---

## Sprint Goal

Land the 47-file working tree cleanup, fix the build, restore CI/CD. Get the codebase to a clean, shippable state before any new feature work.

---

## Why This Sprint Exists

48 files are uncommitted (+1,311 / -11,091 lines of dead-code removal from Sprints 7-8). The build is broken (ESLint errors). CI/CD workflows were deleted. No new work should start until the codebase is clean and the build passes.

---

## Tasks

- [ ] **Commit Sprint 7-8 working tree cleanup**
  - [ ] Review all 48 changed files — confirm each deletion is intentional dead code
  - [ ] Stage modified files (not screenshots, not .playwright-mcp/)
  - [ ] Commit with descriptive message: `refactor(sprint7-8): Remove dead WebSocket/GraphQL/chat layer, consolidate Supabase connections`
  - [ ] Push to origin
  - [ ] **Test:** Clean working tree after commit

- [ ] **Fix ESLint errors blocking build**
  - [ ] Run `npm run build` to identify current errors
  - [ ] Resolve `no-explicit-any` errors across modified files
  - [ ] Resolve unescaped entity errors
  - [ ] **Test:** `npx next build` exits 0

- [ ] **Restore CI/CD pipeline**
  - [ ] Create `.github/workflows/ci.yml`
  - [ ] Steps: typecheck → lint → test → build
  - [ ] Node 20+ (current LTS)
  - [ ] Trigger on push/PR to main
  - [ ] **Test:** CI pipeline runs green on push

## Verification

1. `git status` — clean working tree (minus untracked screenshots/docs)
2. `npm run build` — exits 0
3. `npm run typecheck` — zero errors
4. CI pipeline runs green on push
