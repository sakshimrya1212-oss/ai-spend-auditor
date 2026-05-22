# Reflection

## 1. Hardest Bug

The hardest bug I hit was on Day 3 when the results page was showing a `TypeError: Cannot read properties of undefined (reading 'toFixed')` on `audit.total_monthly_savings`. 

My first hypothesis was that the audit engine was not calculating savings correctly and returning undefined. I added console.logs to the POST `/api/audit` route and confirmed savings were being calculated correctly — the numbers were right. So the engine was not the problem.

My second hypothesis was a field name mismatch. I checked what the audit engine was saving to Supabase (`total_monthly_savings`) versus what the results page was reading (`audit.total_monthly_savings`). They matched. Still undefined.

Then I realized the GET `/api/audit/[id]` route was returning a 404 — the results page was never actually getting data from the database. The real bug was in the params handling. Next.js 15 changed dynamic route params to be Promises — `params.id` throws an error instead of returning the ID. Fixing it to `const { id } = await params` resolved the 404, which then resolved the undefined savings.

The lesson: always check the network tab first. The root cause was upstream — a 404 on the API — not downstream in the UI logic where the error was surfacing.

---

## 2. Decision I Reversed

I initially planned to use the Anthropic API for the audit logic itself — feed the user's tools and spending into Claude and let it generate recommendations. This felt smart: flexible, no hardcoded rules, handles edge cases naturally.

I reversed this decision on Day 2 after thinking through the implications. AI-generated financial recommendations are non-deterministic — the same input can produce different outputs on different runs. A finance person reading "switch from Cursor Business to Pro, save $40/month" needs to trust that number. If the reasoning changes every time, the tool loses credibility.

Hardcoded rules are transparent, auditable, and defensible. I can point to exactly why a recommendation was made. I kept the Anthropic API only for the summary paragraph — a place where creativity and variation are actually desirable, not a liability.

---

## 3. Week 2 Builds

If I had a second week I would build three things. First, PDF export — the results page is designed to be screenshotted but a proper PDF report with the Credex logo would make it a shareable business document, not just a web page. Second, benchmark mode — "your AI spend per developer is $X, companies your size average $Y" requires collecting aggregate data across audits, which I now have in Supabase. Third, an embeddable widget so bloggers and newsletter writers can drop a `<script>` tag and let their audience run audits without leaving the page — this is the highest-leverage distribution mechanic available.

---

## 4. How I Used AI Tools

I used Claude (Sonnet) heavily throughout this project for code generation, debugging help, and architecture decisions. Specific uses: generating the initial form component structure, helping debug the Next.js 15 params Promise issue, writing the Supabase integration boilerplate, and drafting the audit engine rules which I then reviewed and refined.

I did not trust AI with: pricing data (verified every number against official vendor pages myself — AI pricing knowledge goes stale fast), the audit logic reasoning (needed to be defensible, so I wrote and reviewed every rule myself), and deployment configuration (environment variable setup and Vercel config I did manually to avoid subtle mistakes).

One specific time AI was wrong: Claude suggested using `npm audit fix --force` to fix the PostCSS vulnerability warning. This would have downgraded Next.js from version 16 to version 9 — a catastrophic breaking change. I caught it by reading the warning output carefully before running the command.

---

## 5. Self Rating

**Discipline: 7/10** — Stuck to the 7-day plan and shipped all MVP features, but caught myself over-engineering the audit engine rules when I should have moved faster to the next feature.

**Code Quality: 7/10** — TypeScript throughout, clean separation between audit engine logic and API routes, but test coverage is minimal and some components are longer than they should be.

**Design Sense: 7/10** — Dark theme with clear visual hierarchy, color-coded audit results, and a strong hero savings number. Mobile could use more polish and the email form feels utilitarian.

**Problem Solving: 8/10** — Debugged the Next.js 15 params bug systematically by checking network requests first rather than guessing at the UI layer. Good instinct to check upstream before downstream.

**Entrepreneurial Thinking: 8/10** — Email after value not before, Credex CTA only for high-savings cases, shareable URLs as viral loop, honest "you're spending well" message for optimal stacks. These are product decisions, not just engineering ones.