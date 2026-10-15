# Folio — resume builder + interview coach

Folio merges two earlier projects (the **Portfolio / Resume Builder** and **InterviewGPT**) into one app, so the resume you build is the same document every interview tool practises against.

- **Build** — upload a PDF/DOCX/TXT resume, have it structured and rewritten for a target role, edit it in a live editor, pick one of ten templates, export to PDF, and share a read-only public link.
- **Practise** — mock interviews (one question at a time, scored debrief), a coaching chat that has read your resume, recruiter-style resume review, job-description matching, STAR behavioural questions, and adaptive DSA practice with server-side grading.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, server actions, `proxy.ts`), React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui (radix), Instrument Serif + Geist |
| Database | Postgres on [Neon](https://neon.tech) via Drizzle ORM (`@neondatabase/serverless` HTTP driver; `postgres-js` for any non-Neon URL) |
| Auth | [Better Auth](https://better-auth.com) — email + password (scrypt-hashed), DB sessions |
| AI | Vercel AI SDK v7 + [OpenRouter](https://openrouter.ai) **free** models, structured output validated with zod |
| Resume parsing | `unpdf` / `mammoth` text extraction on the server (files never leave it) |

### AI models

Each task uses a slot with a primary model and fallbacks; OpenRouter moves to the next model when one is busy. Override any slot with an env var (see `.env.example`).

| Slot | Used for | Default models |
|---|---|---|
| `structured` | resume parsing, job match, STAR, DSA generation | Nemotron 3 Super → Nemotron 3 Ultra → Gemma 4 31B |
| `chat` | coaching chat, mock interviews, resume review | Nemotron 3 Ultra → Nemotron 3 Super → Gemma 4 31B |
| `code` | grading DSA solutions | Nemotron 3 Ultra → Nemotron 3 Super → North Mini Code |

Free models are rate-limited and can take 20–60 s per request. `pnpm ai:smoke` runs every AI task once to check the current models.

## Getting started

```bash
pnpm install
cp .env.example .env.local     # fill in DATABASE_URL, BETTER_AUTH_SECRET, OPENROUTER_API_KEY
pnpm db:migrate                # create tables
pnpm db:seed                   # optional: demo account + demo content
pnpm dev
```

No Neon database yet? Any Postgres works locally:

```bash
docker run -d --name folio-pg -e POSTGRES_PASSWORD=localdev -e POSTGRES_DB=folio \
  -p 127.0.0.1:54329:5432 postgres:17-alpine
# DATABASE_URL=postgres://postgres:localdev@127.0.0.1:54329/folio
```

### Demo account

`pnpm db:seed` creates `demo@example.com` / `folio-demo-2026` (also reachable from the **Explore the demo account** button on the login page). It contains two tailored resumes (one with a public link at `/r/alex-rivera-demo`), a coaching chat, a resume review, a finished mock interview, a job match, a STAR set, DSA attempts and example reviews. Re-running the seed resets only the demo user's data.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` / `build` / `start` | Next.js |
| `pnpm lint` / `typecheck` | ESLint (flat config) / `tsc --noEmit` |
| `pnpm db:generate` | Generate a migration after editing `lib/db/schema.ts` |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Seed the demo account |
| `pnpm ai:smoke` | Call each AI task once against OpenRouter |

## Project layout

```
app/
  (marketing)/   landing, features, pricing, reviews, feedback, templates
  (auth)/        login, signup
  (app)/         dashboard, resume/{new,[id],[id]/edit}, interview/{[chatId],new,review,job-match,star,dsa}
  r/[slug]/      public read-only resume
  api/auth/      Better Auth handler
  api/chat/      streaming chat (history loaded server-side, persisted on finish)
lib/
  db/            Drizzle schema + client
  ai/            model slots, prompts, zod output schemas, tasks, daily quota
  actions/       server actions (every one checks the session + resource ownership)
  resume/        canonical resume schema, text extraction, template registry, sample data
components/
  resume-templates/  ten pure, prop-driven templates
  resume/ interview/ marketing/ ui/
scripts/         seed + AI smoke test
```

## Security

Run `pnpm security:check` to execute the upload, prompt-fencing and rate-limit regression checks.

**Accounts & access**
- Better Auth hashes passwords (scrypt) and uses httpOnly session cookies. Every server action and route handler re-checks the session and ownership, so other users' IDs return 404.
- DSA reference solutions and unrevealed hints never reach the browser before submission; grading happens on the server.

**Rate limiting** (stored in Postgres, so limits hold across serverless instances)
| Limit | Value |
|---|---|
| Sign-in attempts | 5 / minute / IP |
| Sign-ups | 5 / hour / IP |
| Other auth endpoints | 60 / minute / IP |
| AI requests | daily per-plan quota (30 / 100 / 300), max 6 per minute, plus a global daily cap (`AI_GLOBAL_DAILY_LIMIT`, default 2000) to protect the shared OpenRouter key |
| Uploads | 10 / hour |
| New resumes / conversations | 20 / 40 per hour |
| Other writes | 90 / minute |
Failed AI calls are refunded to the quota. Auth limits key on `x-forwarded-for`, which Vercel sets; behind another proxy, make sure it overwrites that header.

**Prompt injection**
- Resumes, job descriptions and code solutions are wrapped in per-request random `<untrusted-…>` tags, and the system prompts tell the model to treat them as data. Lookalike tags inside the content are stripped, so text can't close the fence early.
- Structured outputs are validated against zod schemas with length caps, and every call has an output-token cap.
- The coaching chat is scoped to careers and ignores persona or rule changes; the DSA grader ignores claims made inside solutions.
- Model output is rendered with react-markdown (no raw HTML, `javascript:` links stripped, images disabled), and the CSP blocks third-party requests, so injected content can't exfiltrate data.

**File uploads**
- Max 5 MB (enforced by Next's 6 MB body limit and again on the server). The type is checked from the file's bytes and must match the extension.
- PDFs are parsed text-only, capped at 10 pages; the bundled pdf.js has no eval-based font path.
- DOCX archives are checked via the zip central directory (30 MB uncompressed, 2,000 entries) before parsing, which blocks zip bombs.
- TXT must be valid UTF-8. Parsing times out after 15 s. Control, zero-width and bidi-override characters are stripped.
- Files are parsed in memory and discarded: never written to disk, stored, or sent anywhere. Only the extracted text (≤ 30k characters) is sent to the model.

**HTTP**
- Strict CSP (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`), HSTS, `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy` and `Permissions-Policy`.
- Server actions get Next's built-in Origin check; auth cookies are `SameSite=Lax`.

**Known advisory:** `pnpm audit --prod` reports one moderate advisory, `sprintf-js` via `mammoth`'s CLI argument parser. That code is never called and no patched version has been published.

## Deployment (Vercel)

1. Create a Neon project and copy the **pooled** connection string.
2. Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (your production URL) and `OPENROUTER_API_KEY` in Vercel.
3. Run `pnpm db:migrate` (and optionally `pnpm db:seed`) against the Neon database once.
4. Deploy. AI-heavy routes set `maxDuration = 120`.
