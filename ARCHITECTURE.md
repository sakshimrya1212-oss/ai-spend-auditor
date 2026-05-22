# Architecture

## System Diagram

```mermaid
graph TD
    A[User - Browser] -->|Fills form| B[Next.js Frontend]
    B -->|POST /api/audit| C[Audit Engine]
    C -->|Rules-based logic| D[Results Calculated]
    D -->|Save to DB| E[Supabase Postgres]
    D -->|Generate summary| F[Anthropic API]
    F -->|100-word summary| D
    D -->|Return audit ID| B
    B -->|Redirect| G[Results Page /audit/id]
    G -->|GET /api/audit/id| E
    G -->|Email capture| H[/api/leads]
    H -->|Save lead| E
    H -->|Send email| I[Resend API]
```

## Data Flow

1. User fills form with tools, plans, seats, team size, use case
2. POST to `/api/audit` — audit engine runs hardcoded rules
3. Each tool evaluated: right plan? cheaper alternative? wrong use case?
4. Savings calculated per tool, totaled
5. Anthropic API called for personalized 100-word summary
6. Audit saved to Supabase with unique nanoid
7. User redirected to `/audit/[id]` — results fetched from DB
8. Email captured after value shown — lead saved, confirmation sent via Resend

## Why This Stack

- **Next.js 15** — Full-stack in one repo. API routes eliminate need for separate backend. Vercel deploy is one click.
- **TypeScript** — Type safety catches bugs at compile time. Audit engine logic is complex enough to need it.
- **Supabase** — Postgres with REST API. Free tier handles MVP load. No ORM needed for simple queries.
- **Tailwind CSS** — Utility-first means fast UI iteration. No context switching between CSS files.
- **Resend** — Best DX for transactional email. Free tier covers MVP volume.
- **nanoid** — Collision-resistant short IDs for shareable URLs.

## Scaling to 10k Audits/Day

1. **Database** — Add indexes on `id` and `created_at`. Enable Supabase connection pooling.
2. **API Routes** — Move audit engine to Edge Runtime for lower latency.
3. **Caching** — Cache audit results in Redis — same ID should not hit DB every time.
4. **Rate Limiting** — Add Upstash Redis rate limiting on `/api/audit` — max 10 requests per IP per hour.
5. **Email** — Move to queue-based sending (BullMQ) to avoid blocking API response.
6. **CDN** — Results pages are mostly static after first load — add ISR (Incremental Static Regeneration).