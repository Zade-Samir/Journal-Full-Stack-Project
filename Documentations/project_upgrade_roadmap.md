# 🛠️ Journal App — Upgrade Roadmap
### From "Working Personal Project" → Portfolio Piece That Gets You Hired

> Based on your current `FullStack_copy` project (Eureka + API Gateway + Auth Service + Journal Service + React frontend) mapped against your `java_fullstack_roadmap.md`.

---

## 📊 Where You Already Stand (Give Yourself Credit)

You're not starting from zero — you've already implemented things many "full stack" candidates skip:

- ✅ Real microservices architecture (Eureka Service Discovery + API Gateway + independent services)
- ✅ JWT-based auth with a gateway-level filter (`JwtAuthenticationFilter`)
- ✅ OAuth2 login flow (`OAuth2SuccessHandler`) — Google/GitHub-style SSO
- ✅ DTO pattern (not exposing entities directly) + MapStruct mapping
- ✅ Global exception handling (`@ControllerAdvice` style) with custom exceptions
- ✅ Bean validation (`@Valid`)
- ✅ Role-based access control (`@PreAuthorize("hasAnyRole(...)")`)
- ✅ Pagination (`Pageable`/`Page`)
- ✅ Swagger/OpenAPI dependency already added
- ✅ Soft delete pattern, auto-save endpoint (nice UX touch)
- ✅ React 19 + Vite + Tailwind + React Router + Protected Routes on the frontend

This is genuinely above "tutorial project" level. The gap isn't concepts — it's **depth, rigor, and the "industry-grade" layer** (Phase 3, 6, 7 in your roadmap). Below is what to add, in priority order.

---

## 🎯 Priority 1 — Things That Get Flagged in a Code Review (Do These First)

These are cheap to fix and are exactly what a senior engineer or interviewer will notice in the first 5 minutes.

- [ ] **Remove committed secrets/log files** — `journalLog.log` (60K) is committed. Add `*.log`, `application-prod.properties` (if it has real secrets), and IDE files to `.gitignore` at the root.
- [ ] **Externalize all secrets** — confirm `DB_PASSWORD` and JWT signing secret are never hardcoded; use environment variables or a `.env` + `.env.example` pattern.
- [ ] **Fix `spring.application.name=journal-servicex`** — looks like a typo (extra "x"), will confuse Eureka registration naming.
- [ ] **Add a root-level `README.md`** — architecture diagram (even ASCII), how to run all 4 services + frontend locally, tech stack list, screenshots (you already have some!).
- [ ] **Clean up stray files** — `.DS_Store`, loose screenshots (`login.jpg`, `Untitled design.png`) sitting in project root instead of a `docs/` or `assets/` folder.
- [ ] **Consistent package naming** — `com.samir.*` vs `com.example.journal_service` — pick one base package convention across all services.

---

## 🎯 Priority 2 — Phase 3: Databases & Persistence (Your Biggest Gap)

Your roadmap calls this out hard, and it's the thinnest part of your current project.

- [ ] **Database migrations with Flyway** — right now you're using `ddl-auto=update`, which is fine for a solo project but is an instant red flag in interviews. Add `flyway-core` dependency + versioned SQL migration scripts (`V1__init_schema.sql`) for both auth-service and journal-service.
- [ ] **Add Redis** — use it for:
  - Caching the "today's journal" lookup (cache-aside pattern)
  - Storing JWT refresh tokens or a token blacklist for logout
  - Rate limiting counters (ties into Priority 4 below)
- [ ] **Fix N+1 / fetch strategy awareness** — audit your `@ManyToOne`/`@OneToMany` (if any) for `FetchType.LAZY` vs `EAGER`. Even if you don't have relationships yet, add a `User` ↔ `Journal` foreign key relationship properly modeled with JPA instead of just matching by email string — this also lets you demonstrate `@OneToMany`/`@ManyToOne` correctly.
- [ ] **Add database indexes** — index `user_email` / `created_date` columns on the Journal table since you query by user + date range.
- [ ] **Connection pooling awareness** — explicitly configure HikariCP pool size in `application.properties` and be able to explain the settings.
- [ ] **(Stretch) Try PostgreSQL** for one service instead of MySQL, and be able to explain the differences — your roadmap explicitly recommends this.

---

## 🎯 Priority 3 — Phase 7: Testing (Currently Missing Entirely)

Right now each service only has the auto-generated `*ApplicationTests.java` (context-load test). This is the #1 thing that will hurt you in interviews — "projects without tests won't get you hired at good companies" is literally in your own roadmap.

- [ ] **Unit tests with JUnit 5 + Mockito** — test `JournalServiceImpl` and `AuthServiceImpl` business logic in isolation (mock the repositories).
- [ ] **Controller tests with MockMvc** — test `JournalController` and `AuthController` endpoints, including validation failures and 401/403 cases.
- [ ] **Integration tests with Testcontainers** — spin up a real MySQL container in tests instead of mocking the DB entirely. This is a huge interview talking point.
- [ ] **Frontend tests** — add Jest + React Testing Library for at least your core components (`JournalModal`, `ProtectedRoute`, `EmotionSelector`).
- [ ] **Target 70-80% meaningful coverage** on the service layer — not 100%, just the logic that matters.

---

## 🎯 Priority 4 — Phase 2: Spring Ecosystem Depth (You Know the Basics, Now Go Deeper)

- [ ] **Resilience4j Circuit Breaker** — add it to the API Gateway or wherever journal-service calls auth-service (if it does), so you can talk about handling downstream failures gracefully.
- [ ] **Spring Boot Actuator** — expose `/actuator/health`, `/actuator/metrics` on each service. Directly referenced in your roadmap and takes ~10 minutes to add.
- [ ] **Rate limiting at the Gateway** — Spring Cloud Gateway has built-in `RequestRateLimiter` (Redis-backed). This combines nicely with the Redis addition above and is a real OWASP-adjacent talking point.
- [ ] **Refresh tokens** — you have JWT access tokens; add a refresh token flow (short-lived access token + longer-lived refresh token stored securely) — a very common interview question ("how do you handle token expiry?").
- [ ] **API versioning** — even just prefixing routes with `/api/v1/...` shows you're thinking ahead.
- [ ] **Config Server (Spring Cloud Config)** — you already have Eureka + Gateway; adding a Config Server completes the "real microservices" story and centralizes your `application.properties` across services.
- [ ] **Distributed tracing** — Micrometer + Zipkin so you can trace a request across gateway → auth-service → journal-service. Very impressive for a personal project.

---

## 🎯 Priority 5 — Phase 6: DevOps (Zero Docker/CI Currently — High ROI to Add)

This is currently completely absent from your project and is one of the highest-leverage additions for a "full stack" resume.

- [ ] **Dockerfile per service** — multi-stage builds (Maven build stage → slim JRE runtime stage) for `auth-service`, `journal-service`, `api-gateway`, `eureka-server`, and a separate one for the React frontend (build with Vite → serve with nginx).
- [ ] **docker-compose.yml** — spin up MySQL, Redis, all 4 backend services, and the frontend with a single `docker compose up`. This alone is a massive upgrade — right now you have `start.bat`/`start.sh` which suggests manual process starting.
- [ ] **GitHub Actions CI pipeline** — on every push: build → run tests → (optionally) SonarQube/Checkstyle lint. Add a badge to your README.
- [ ] **(Stretch) Deploy it somewhere real** — Render/Railway/AWS free tier for backend, Vercel/Netlify for frontend. A live demo link is worth more than any bullet point on a resume.

---

## 🎯 Priority 6 — Phase 7: Security Hardening (OWASP Mindset)

- [ ] **CORS review** — you have a `CorsConfig` in the gateway; make sure it's not `allowedOrigins("*")` combined with credentials — a classic OWASP gotcha to be aware of and explain.
- [ ] **Input sanitization** — beyond `@Valid`, check you're not vulnerable to basic injection issues (Spring Data JPA protects you from SQL injection by default if you avoid native/concatenated queries — verify you don't have any).
- [ ] **Secrets scanning** — add Dependabot (free on GitHub) to your repo for dependency vulnerability alerts.
- [ ] **Password policy** — confirm BCrypt strength factor and add basic password complexity validation on registration.
- [ ] **Logout / token invalidation** — right now JWTs are likely stateless with no revocation; the Redis blacklist idea above solves this and is a common real-world gap interviewers probe.

---

## 🎯 Priority 7 — Phase 4: Frontend Polish

- [ ] **React Query (TanStack Query)** — replace manual `fetch`/`axios` + `useState`/`useEffect` data fetching with React Query for caching, loading/error states, and refetching. This is explicitly called out in your roadmap as "replaces most Redux data-fetching use cases" and is very in-demand.
- [ ] **React Hook Form + Zod** — for your Login/Register/JournalModal forms — cleaner validation than manual state handling.
- [ ] **Axios interceptors** — centralize attaching the JWT to headers and handling 401 → redirect to login, instead of repeating this logic per request.
- [ ] **Code splitting** — `React.lazy` + `Suspense` for routes like `Archive`, `Completion` so the initial bundle is smaller.
- [ ] **Loading/Error/Empty states** — audit each page (`Home`, `Archive`) to make sure all three states are handled gracefully, not just the happy path.
- [ ] **Accessibility pass** — basic ARIA labels, keyboard navigation for the modal, color contrast check (Tailwind makes this easy to verify).

---

## 🎯 Priority 8 — System Design Talking Points (Phase 5)

You don't need to *build* all of these into the journal app, but you should be able to **whiteboard and explain** them using this project as the example, since interviewers will ask "how would you scale this?":

- [ ] Practice explaining: "If this app had 1M users, what breaks first?" (Answer using your actual architecture: DB connection pool exhaustion → add read replicas / caching → Eureka becomes a bottleneck → etc.)
- [ ] Understand **CAP theorem** in the context of your MySQL choice vs a NoSQL alternative for journal entries.
- [ ] Be ready to discuss **Saga pattern** — e.g., "what happens if journal-service saves but a notification-service call fails?" (even hypothetically, since you don't have that service yet)
- [ ] Practice the **"design a notification service"** and **"design a URL shortener"** exercises from your roadmap — unrelated to this project, but do them alongside it as separate practice.

---

## 🧭 Suggested Order of Attack (Given You're Solo)

1. **Week 1-2:** Priority 1 (cleanup) + Priority 3 (testing) — cheap, high credibility impact
2. **Week 3-4:** Priority 2 (Flyway + Redis + DB relationships)
3. **Week 5-6:** Priority 5 (Docker + Compose + basic CI)
4. **Week 7-8:** Priority 4 (Actuator, refresh tokens, rate limiting, Config Server)
5. **Ongoing:** Priority 6 (security), Priority 7 (frontend polish), Priority 8 (talk through it out loud / write it up as an ADR or blog post)

Each time you finish a chunk, **write a short note in your README changelog** — "added Flyway migrations", "added Docker Compose setup" — this becomes a great story for "tell me about a project you improved over time" interview questions.

---

## 📌 One Thing to Resist

Don't add Kafka, Kubernetes, or GraphQL to this project just because they're on the roadmap. Your roadmap itself says **"depth beats breadth."** This journal app is a great vehicle for Phases 2, 3, 6, and 7. Save Kafka/event-driven architecture and Kubernetes for a **second, different project** (e.g., an e-commerce or notification system) where they're a more natural fit — bolting them onto a personal journal app will look forced in an interview.
