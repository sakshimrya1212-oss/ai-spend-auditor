# Dev Log

## Day 1 — 2026-05-16

**Hours worked:** 3

**What I did:** Set up Next.js project with TypeScript and Tailwind. Created the main spend input form with all 6 tools (Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, Windsurf). Added localStorage persistence so form state survives page reloads. Researched current pricing for all tools.

**What I learned:** Next.js App Router file structure is different from Pages Router — `app/api/route.ts` instead of `pages/api/index.ts`. Took some time to get used to it.

**Blockers / what I'm stuck on:** Figuring out the right folder structure for dynamic API routes like `/api/audit/[id]`.

**Plan for tomorrow:** Build the audit engine with hardcoded rules and connect Supabase.

---

## Day 2 — 2026-05-17

**Hours worked:** 4

**What I did:** Built the audit engine in `/api/audit/route.ts`. Wrote rules for each tool — plan fit, team size checks, use case mismatches. Set up Supabase project, created audits table, connected it to the app. Tested POST endpoint with Postman.

**What I learned:** Supabase's new API key format (sb_publishable vs sb_secret) is different from older anon/service_role format. Took time to figure out which key goes where.

**Blockers / what I'm stuck on:** Next.js 15 params are now Promises — `params.id` throws error, need `await params` first.

**Plan for tomorrow:** Build results page and fix params issue.

---

## Day 3 — 2026-05-18

**Hours worked:** 3

**What I did:** Built the results page at `/audit/[id]/page.tsx`. Fixed the params Promise issue in the GET API route. Added per-tool breakdown cards with color coding — red for overspending, yellow for switch, green for optimal. Added hero savings display.

**What I learned:** In Next.js 15, dynamic route params in API routes must be awaited: `const { id } = await params`. This is a breaking change from Next.js 14.

**Blockers / what I'm stuck on:** `total_monthly_savings` coming as undefined from DB — field name mismatch between what audit engine saves and what results page reads.

**Plan for tomorrow:** Add Anthropic API summary, email capture, and leads API.

---

## Day 4 — 2026-05-19

**Hours worked:** 3

**What I did:** Integrated Anthropic API for personalized audit summary. Added graceful fallback template when API fails or key is missing. Built `/api/leads` route for email capture. Added Resend email sending. Built email form on results page — shown after savings are displayed, never before.

**What I learned:** API failures need to be caught silently on the server — crashing the whole audit because the summary failed would be bad UX. Fallback template handles this well.

**Blockers / what I'm stuck on:** Resend requires a verified domain for custom from addresses. Using onboarding@resend.dev for now.

**Plan for tomorrow:** Add shareable URL, Open Graph tags, deploy to Vercel.

---

## Day 5 — 2026-05-20

**Hours worked:** 2

**What I did:** Added Open Graph meta tags to results page for clean link previews on Twitter and Slack. Set up GitHub repository and pushed all code. Deployed to Vercel with environment variables. Tested full flow end to end on live URL.

**What I learned:** Vercel environment variables must be set before deploy — app crashes silently if Supabase keys are missing. Always check Function logs in Vercel dashboard.

**Blockers / what I'm stuck on:** NEXT_PUBLIC_APP_URL needs to be updated after first deploy since URL is not known beforehand.

**Plan for tomorrow:** Write tests for audit engine, set up GitHub Actions CI.

---

## Day 6 — 2026-05-21

**Hours worked:** 2

**What I did:** Wrote 5 unit tests for the audit engine covering key rules — Cursor Business downgrade, Copilot Individual suggestion, Claude Team vs Pro, high savings Credex CTA trigger, optimal spend detection. Set up GitHub Actions CI workflow to run lint and tests on every push.

**What I learned:** Testing pure functions is much easier than testing React components. Keeping the audit engine as a pure function (input → output, no side effects) made it trivially testable.

**Blockers / what I'm stuck on:** GitHub Actions needs Node version specified explicitly or it picks an old default.

**Plan for tomorrow:** Write all required MD files, final polish, submit.

---

## Day 7 — 2026-05-22

**Hours worked:** 2

**What I did:** Wrote README, ARCHITECTURE, REFLECTION, PRICING_DATA, PROMPTS, TESTS markdown files. Did final end-to-end test on live Vercel URL. Fixed minor UI issues on mobile. Submitted assignment.

**What I learned:** Writing documentation forces you to articulate decisions you made instinctively. ARCHITECTURE.md made me realize I should add DB indexes before scaling.

**Blockers / what I'm stuck on:** None — project complete.

**Plan for tomorrow:** Week 2 would focus on PDF export and benchmark mode.