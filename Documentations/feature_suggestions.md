# 🌱 Feature Roadmap — Daily Reflection Journal App
### Personal use today → Public, free-hosted product tomorrow

> Based on your actual app: a daily reflection journal (what I did / best & worst moment / lessons / gratitude / short & long-term goals / mood tracking / auto-save / streaks / archive with search & date filters), running on Eureka + API Gateway + Auth Service + Journal Service + React frontend.

This doc groups features into three tracks:
- **🟢 Track A — Personal use, polish what exists** (do these regardless of public plans)
- **🔵 Track B — "Ready for other people" features** (needed once real strangers use it)
- **🟣 Track C — Growth/delight features** (what makes people come back daily)

For each feature: what it is, why it matters, and **which service(s) it touches** — so you know if it's a frontend-only change, needs a new microservice, or just extends an existing one.

---

## 🟢 Track A — Deepen What You Already Have

### 1. Mood Analytics Dashboard
**What:** A page/section showing mood trends over time — a calendar heatmap (like GitHub's contribution graph) colored by mood, plus a simple line/bar chart of mood frequency over the last 30/90 days.
**Why:** You're already capturing `mood` per entry — this data is sitting unused. This is the single highest "wow factor per hour of work" feature you can build, and it's a great excuse to use **Recharts or Chart.js** (resume-relevant).
**Services:** Frontend-only for the chart. Journal-service needs one new read endpoint: `GET /journal/stats?range=30d` that aggregates mood counts — a good excuse to practice JPQL `GROUP BY` queries or a `@Query` with aggregation (roadmap Phase 3 topic).

### 2. Real Streak Calculation (Currently Hardcoded)
**What:** Your `Completion.jsx` currently shows a hardcoded `"12 Days"` streak. Replace with a real calculation: consecutive days with a journal entry.
**Why:** Trivial to spot as fake in a demo; also a nice small algorithm problem (contiguous date-range logic) worth being able to explain.
**Services:** Journal-service — add a `GET /journal/streak` endpoint that queries entry dates and computes the current streak server-side (don't compute in the frontend; you want this centralized so it's consistent across devices).

### 3. Weekly/Monthly Reflection Summary
**What:** An auto-generated "week in review" — pulls together the week's entries and surfaces patterns: most common mood, gratitude themes, goals marked done vs not.
**Why:** Turns your journal from "just storage" into something that gives value back. Also a natural place to eventually plug in AI summarization (see Track C).
**Services:** Journal-service — new endpoint aggregating a date range. Frontend — new page or a widget on Home.

### 4. Goal Tracking, Properly
**What:** Right now short/long-term goals look like free-text array fields re-entered per journal entry. Promote goals to first-class entities: a `Goal` with title, target date, status (`not_started`/`in_progress`/`done`), and link daily journal entries to goals via a join table or foreign key.
**Why:** This is a real data-modeling upgrade — practice for `@OneToMany`/`@ManyToMany` relationships (explicitly on your roadmap under JPA). It also makes "what did I do for my goal today" meaningfully queryable later ("show me all entries related to Goal X").
**Services:** New table + entity in journal-service (or a new `goal-service` if you want more microservices practice — see note below). New endpoints: `GET/POST/PUT /goals`, and journal entries reference a `goalId`.

> **New microservice or not?** For this one, I'd keep it inside journal-service. Splitting it into a separate `goal-service` mainly adds inter-service call complexity (Feign client, more Eureka config) without much real benefit at this data size — save a new service for something that's genuinely a separate bounded context (see Track C's Notification Service, which *is* worth splitting out).

---

## 🔵 Track B — Making It Safe & Usable For Strangers

If real people you don't know will use this, these stop being "nice to have" and become non-negotiable. This is also where your roadmap's Phase 7 (Security) and Phase 6 (DevOps) become directly relevant.

### 5. Email Verification on Signup
**What:** Send a verification link/code on registration; block login (or limit features) until verified.
**Why:** Without this, anyone can register with a fake or someone else's email, and you have no way to do password-reset emails safely.
**Services:** Auth-service — needs an email-sending capability (Spring Boot + JavaMailSender, or a free transactional email API like Resend/Brevo — SMTP servers are often blocked on free hosting tiers, so an HTTP-based email API is safer). New table/column for `verified` status + verification token with expiry.

### 6. Forgot Password / Reset Flow
**What:** "Forgot password" → email with a time-limited reset link → set new password.
**Why:** You *will* get support requests for this the moment more than 5 people use it. It's also a classic interview scenario ("how do you securely handle password resets") — token expiry, one-time use, hashing the reset token itself.
**Services:** Auth-service. Same email infrastructure as #5, so build them together.

### 7. Rate Limiting on Auth Endpoints
**What:** Limit login/register attempts per IP (e.g., 5 attempts per minute) to prevent brute-force and to keep your free-tier hosting from getting hammered.
**Why:** Public-facing auth endpoints without rate limiting are the #1 most probed attack surface, and free hosting tiers have tight resource/quota limits — a bot hammering `/login` can eat your whole monthly quota.
**Services:** Best done at the API Gateway (Spring Cloud Gateway `RequestRateLimiter`, Redis-backed) since it protects all services at once, not just auth.

### 8. Account Deletion & Data Export (Basic Privacy Compliance)
**What:** "Delete my account" (hard delete of user + their journals) and "export my data" (download all entries as JSON).
**Why:** Once this is public, even informally, people will ask "can I delete my data?" — and if you ever have EU users, this edges toward GDPR expectations. Cheap to build now, awkward to bolt on later once you have real user data to migrate.
**Services:** Both auth-service (delete user) and journal-service (delete/export their entries) — this is a good forcing function to implement a proper "delete cascade" or async cleanup pattern across services.

### 9. Terms of Use / Privacy Notice Page
**What:** A simple static page: what data you store, that it's a personal project, no warranty, etc.
**Why:** A journal app stores people's private thoughts — even as a hobby project, a one-paragraph honest disclaimer ("this is a personal project, don't put anything you can't afford to lose, no formal SLA") protects you and sets expectations.
**Services:** Frontend only — a static page/route.

### 10. Backups
**What:** Automated periodic DB backup (even a simple daily `mysqldump` to cloud storage, or use your hosting provider's built-in backup if on a managed DB).
**Why:** The moment this is "for the public," you're responsible for other people's private journal entries. Losing them because a free-tier DB got reset is the kind of thing that erodes trust fast (and free hosts *do* occasionally wipe free-tier databases without much notice).
**Services:** Infrastructure/DevOps concern, not app code — but worth documenting in your README as "how backups work" once live.

### 11. Basic Abuse/Content Limits
**What:** Max entry length, max entries per day, max account creations per IP/day.
**Why:** Free hosting tiers (Render, Railway, Fly.io free tiers, etc.) have hard resource/storage caps. One person scripting thousands of journal entries could exhaust your free-tier database storage or bandwidth.
**Services:** Journal-service (validation limits) + API Gateway (rate limiting, reuses #7).

---

## 🟣 Track C — Growth & Delight (What Makes This a "Product")

These aren't required for personal or small-scale public use, but they're what separates "I built a CRUD app" from "I built a product people use daily" — great for a portfolio narrative and for actually retaining users if you go public.

### 12. Daily Reminder Notifications
**What:** Optional email (or push notification, if you go PWA — see #16) reminding the user to journal if they haven't yet today, sent once daily.
**Why:** Journaling apps live or die on habit formation. This is *the* feature that turns one-time signups into daily active users.
**Services:** This is a great candidate for a **new microservice**: `notification-service`. Reasons it's worth splitting out (unlike Goals above):
  - It's a genuinely separate concern (scheduled jobs, not request/response)
  - It needs its own scheduler (`@Scheduled` cron job or a lightweight queue) checking "who hasn't journaled today" and calling the email API
  - It's exactly the kind of service your roadmap's "Design a notification service" system-design exercise describes — you'd be building the real thing instead of just whiteboarding it
  - It can grow independently later (SMS, push, digest emails) without touching journal-service or auth-service

### 13. Data Export as PDF ("Print My Year")
**What:** Generate a nicely formatted PDF of a date range of entries — a "yearbook" of your reflections.
**Why:** Emotionally sticky feature — "download my year in review as a PDF" is the kind of thing people screenshot and share, which is free marketing if this goes public.
**Services:** Could live in journal-service (using a Java PDF library like OpenPDF/iText) or as a small dedicated `export-service` if you want the practice — either is defensible; I'd start inside journal-service and only split it out if it gets complex.

### 14. Tagging / Themes on Entries
**What:** Let users tag entries (`#work`, `#family`, `#health`) and filter the archive by tag, in addition to the existing mood/date filters.
**Why:** Cheap to build (many-to-many `Journal` ↔ `Tag`), directly reuses your existing Archive search/filter UI, and makes the archive genuinely more useful as entry count grows.
**Services:** Journal-service — new `Tag` entity + join table.

### 15. AI-Assisted Prompts / Reflection Suggestions
**What:** If a user leaves "best moment" blank, offer a gentle AI-generated prompt suggestion ("Was there a small win today you might be overlooking?"). Optionally, an AI-generated weekly summary of their entries (ties into #3).
**Why:** Your own roadmap flags "AI/ML Integration — massive demand in 2025+" as a high-income specialization. This is a low-risk, well-scoped way to add a real LLM integration (e.g., calling the Claude or another API) to a project that isn't just "wrap ChatGPT in a chatbot."
**Services:** Could be a thin new `ai-service` (keeps API keys and prompt logic isolated, and lets you rate-limit/cache AI calls separately — important since AI APIs cost money per call) or a module inside journal-service if you want to keep it simpler. Given you'll want to control costs and add caching around this specifically, I'd lean toward a small dedicated service.

### 16. Make It Installable (PWA)
**What:** Add a web app manifest + service worker so the journal can be "installed" on a phone home screen and works offline for drafting (syncs when back online).
**Why:** You mentioned wanting to use it "from any device with a website link" — a PWA gets you 90% of a mobile app experience for free, with zero app-store submission process. Offline draft support also protects against your free-tier backend having cold starts or brief downtime (common on free hosting).
**Services:** Frontend only (Vite has PWA plugins). No backend changes required, though you'd want a local-first draft cache (IndexedDB) that syncs to the auto-save endpoint you already have.

### 17. Dark Mode Sync Across Devices
**What:** You already have a `GlobalThemeToggle` — check if the preference is just local (localStorage) or synced to the user's account. If local-only, sync it as a small user-preference field.
**Why:** Small, cheap, and "it remembers my settings on every device" is the kind of polish that makes an app feel finished.
**Services:** Auth-service (or a small `UserPreferences` field) + frontend context update.

### 18. Multi-Factor Login Options (Later-Stage)
**What:** Once you have real public users, consider optional TOTP-based 2FA (Google Authenticator style) for people who want extra protection on something as personal as a journal.
**Why:** Not needed at small scale, but worth knowing you'd add it here — it's a natural "security depth" story for interviews ("I designed it so 2FA could be added without restructuring auth").
**Services:** Auth-service.

---

## 🚀 On Deployment (Personal Now → Public Later)

Since you mentioned wanting a deployed link you can use from any device, and possibly opening it up publicly later, a few deployment-specific notes:

- **Start with "deployed but not publicly advertised."** Deploy now for your own use (this is genuinely the best real-world test environment), but don't add a public sign-up call-to-action until Track B items (5, 6, 7, 8, 9, 10, 11) are done. A live link only you know about is a great low-stakes way to catch bugs.
- **Free-tier hosting reality check for your stack:**
  - 4 separate Spring Boot services (Eureka + Gateway + Auth + Journal) means 4 separate always-on processes — most free tiers (Render, Railway free tier, Fly.io) either sleep idle services or have tight monthly hour limits. Budget for cold-start delays on the first request after idle.
  - Consider whether you truly need Eureka + Gateway running 24/7 for a 1-user (or small-user) deployment — they're great for the portfolio/learning story, but for the *actual public deployment* you might route the frontend directly to the services via fixed URLs and keep Eureka/Gateway as something you run locally to demo the "real microservices" setup in interviews. This is a legitimate, honest trade-off to make and explain.
  - MySQL needs a free managed DB (PlanetScale, Aiven free tier, Railway's free Postgres/MySQL) — factor in their storage/row limits given #11 above (abuse limits).
- **Frontend:** Vercel or Netlify free tier is a very easy, reliable choice for the React/Vite app and won't have the cold-start issues your backend will.
- **Document the live URL and architecture trade-offs in your README** — "here's what I run 24/7 vs what I demo locally, and why" is itself a good engineering-judgment story to tell.

---

## 📋 Suggested Build Order

1. **Track A #2 (real streak)** — quick win, removes a fake data point
2. **Track B #5, #6 (email verify + password reset)** — do together, same email infra
3. **Track B #7, #11 (rate limiting + abuse limits)** — protects your free-tier resources before more people touch it
4. **Track A #1 (mood dashboard)** — high visual payoff for portfolio demos
5. **Track B #8, #9, #10 (deletion, privacy notice, backups)** — do before sharing the link with anyone outside close friends
6. **Track C #16 (PWA)** — matches your "use from any device" goal directly
7. **Track A #3, #4 and Track C #12, #13, #14** — pick based on what excites you; all are solid
8. **Track C #15 (AI prompts)** — save for once the core app is rock solid; it's the most "impressive in an interview" but also the most optional
