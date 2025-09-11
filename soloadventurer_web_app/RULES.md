# RULES.md — Core Standards & Innovation Flexibility

> These rules establish standards for code quality, architecture, workflow, and safety, while allowing space for innovation.  
> Core rules are non-negotiable; flexibility clauses allow for considered deviations or improvements.

---

## 1. Core Rules (Non-Negotiable)

1. **Schema-First Flow**  
   - Always update the GraphQL schema first.  
   - Then run type generation (codegen).  
   - Then implement resolvers, UI, or other parts depending on that schema.

2. **Security & Privacy Musts**  
   - No secrets, credentials, or private keys committed to version control. Use environment variables, AWS Parameter Store / Secrets Manager.  
   - Media uploads must use presigned URLs with file type and size limits.  
   - Authorization checks enforced server-side for any sensitive operations (profiles, messages, connections, blocking, reporting).  
   - Location data defaults to city-level; more precise only with explicit user consent.

3. **Testing Standards**  
   - Critical paths must have unit tests, component / UI tests, and end-to-end tests.  
   - Domain logic and resolver code must have ≥ 80% unit test coverage.  
   - CI pipelines must run tests; failing tests block merges.

4. **Code Quality**  
   - TypeScript in strict mode; avoid `any` except in rare, documented cases.  
   - ESLint + Prettier / formatter must pass before merging.  
   - Clean, readable code: good naming, small functions, minimal duplication (DRY).  

5. **Branch & Commit Workflow**  
   - Branch names follow: `feature/S##-T##-short-description` or `bugfix/S##-T##-short-description`.  
   - Commit messages follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:` etc.).  
   - PRs must link to relevant sprint/task issue(s), pass CI, have code review before merging.

6. **Responsiveness, Performance & Scalability**  
   - Avoid over-fetching data in GraphQL queries (request only needed fields).  
   - Use batching/dataloaders to prevent N+1 problems.  
   - Cache frequently used data where appropriate (Redis, etc.).  
   - Use CDN for static/media content.

7. **Safety & Moderation**  
   - Features for report / block must be present wherever users interact (profiles, posts, messages).  
   - Verification badge system must be implemented as designed.  
   - Moderation dashboard or equivalent must handle reports appropriately.

---

## 2. Innovation & Flexibility Clauses

These rules allow for growth, experimentation, and adopting newer / better techniques when justified:

- **Propose Alternatives**  
  Developers or the AI may suggest new patterns, libraries, or architectural designs *if* they provide clear reasoning: pros/cons, trade-offs, risk (performance, security, maintainability). Such proposals must be recorded via an ADR (Architectural Decision Record).

- **Prototype / Experimental Code**  
  Allowed to create prototypes or experiments that may not follow all conventions (naming, style, etc.), *provided* they are clearly labeled as prototype / sandbox. These should *not* be merged into production without review and alignment with core rules.

- **Selective Loosening**  
  For internal tooling, non-customer facing parts (scripts, admin tools), or low-risk components, some style and performance tolerances may be relaxed, within reason. Any such relaxation must be clearly noted and temporary.

- **Continuous Review**  
  Periodically (e.g. end of sprint or per major milestone), review what new tools/techniques have emerged. If something is promising, evaluate whether to adopt it project-wide (via ADR).  

---

## 3. Code Design Principles & Best Practices

To guide the innovation and core paths, the following principles should always be favored:

- **SOLID Principles**: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion — applied where relevant.  
- **Separation of Concerns & Modularity**: Keep UI, domain/business logic, API/resolvers, infra separated.  
- **Clean Architecture / Layered Design**: Make lower layers (data access, business logic) independent of UI or transport layer.  
- **YAGNI ("You Ain't Gonna Need It")**: Avoid implementing features / complexity before seeing need.  
- **DRY ("Don't Repeat Yourself")**: Minimize duplication of logic.  
- **Performance Awareness**: Lazy loading, code splitting, caching, efficient queries.  

---

## 4. Workflow & Review

- All PRs must include links to sprint/task IDs.  
- Any deviation from core rules must be justified in the PR and reviewed by at least one senior/architect.  
- Use templates for issues & PRs to enforce consistency.  
- Daily communication / stand-ups should highlight any technical debt or potential rule conflicts early.  

---

## 5. Enforcement & Escalation

- CI pipelines block merges for violations of core rules (tests failing, lint errors, etc.).  
- Code reviews must check for core rule compliance.  
- ADRs must be updated when core rules are changed or when innovations are adopted.  
- In case of disagreement or uncertainty, escalate to lead dev or architecture owner for decision.

---

## 6. What This Doesn't Do

- This is *not* a rule that all code paths must be identical in style; variation in experiments, prototypes, or low-risk areas is okay under "Innovation Clauses".  
- It does *not* prevent the use of modern/new/unusual tools or libraries — those are welcome if they pass the justification process.  
- It does *not* prescribe specific UI designs or micro-optimizations unless they affect performance or security.

---

> **Bottom Line:**  
> We aim for consistency, security, performance, and maintainability — *but* we trust developers and LLMs to innovate, propose, and evolve when it's beneficial. Any fundamental changes go through clear documentation (ADR) and code review.