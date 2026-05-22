# 💸 AI Spend Auditor

A free tool that audits your team's AI tool spending and finds exactly where you're overpaying — instant results, no login required. Built for startups, dev teams, and anyone paying for multiple AI subscriptions.

🔗 **Live:** https://ai-spend-auditor-rose.vercel.app

## Screenshots

> Add 3 screenshots here after deployment (form page, results page, email capture)

## Quick Start

```bash
git clone https://github.com/sakshimrya1212-oss/ai-spend-auditor.git
cd ai-spend-auditor
npm install
cp .env.local.example .env.local
# Fill in your keys in .env.local
npm run dev
```

Open http://localhost:3000

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
RESEND_API_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=
```

## Decisions

1. **Next.js over plain React** — API routes built-in, no separate backend needed. Saved ~2 hours of setup.

2. **Hardcoded audit rules over AI** — Audit math needs to be deterministic and defensible. AI hallucinations in financial recommendations would break trust. Rules are transparent and auditable.

3. **Supabase over Firebase** — Postgres gives proper relational queries. Free tier is generous. SQL is easier to reason about than Firestore.

4. **Honeypot over CAPTCHA** — hCaptcha adds friction before value is shown. Honeypot is invisible to real users and catches most bots with zero UX cost.

5. **Email after value, never before** — Capturing email before showing results kills conversion. Show savings first, then ask for email to "send the report."