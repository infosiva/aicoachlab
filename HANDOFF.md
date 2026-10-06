# HANDOFF — AI tooling interview guides on ai-core
**Date:** 2026-10-06  **Status:** IN PROGRESS
**Goal:** `/guides` section teaching AI-tooling interview answers, built on ai-core (RAG, memory, gateway, tracing, evals); owner pastes reference lists over time.

## DESIGN LOCK (landing/app shell redesign, 2026-10-06)
- Background: near-black plum `#0c0714` + animated aurora (3 blurred radial blobs, magenta/violet/teal), reduced-motion respected
- Accent: magenta `#ec13d6` (check-palettes.mjs: 0 collisions across 66 projects); text on accent uses `--ink` `#0c0714`
- Archetype: T9 Bento Grid Dashboard (split hero + 4-tile bento), fits 1280x800 and 375x812
- Logo: speech-bubble with 3 voice bars + "AI<Coach>Lab" wordmark (components/Logo.tsx, app/icon.svg); no app/icon.tsx/png
- Demo panel: cycles real questions + coach notes from lib/guides (no invented exchanges)

## Design decisions (recorded before code)
- Retrieval: plain vector + reranker (ai-core `/answer`), NOT agentic, NOT graph. Questions are single-hop; prove on golden set.
- Prompt/context: system prompt from ai-core prompt registry (`/v1/prompts`), k=5 chunks, answer capped (~250 tokens), role hint (<=60 chars) only. Cache: ai-core gateway cache.
- Models: all LLM calls via ai-core gateway (`core-chat` / `core-auto`). `core-premium` never used.
- Free tier only. No new paid tool. No fal.ai.
- Pillars: gateway, routing, cost (ai-core caps), RAG, observability (Phoenix), evals (golden set), limits/budgets (tenant `aicoachlab`), swappability (tools.yaml). Gap, not faked: pillars 10-13.
- Design: reuse locked aicoachlab design (magenta `#ec13d6`, dark aurora, bento). No new palette.

## Amendments found while planning (missed in first plan)
1. `app/api/chat/route.ts` uses Groq `llama-3.3-70b-versatile`, which no longer exists (ai-core README), so Groq always fails silently and Gemini answers. Move to ai-core gateway.
2. Chat rate limit is an in-memory Map (per serverless instance, not a real limit). Replace with ai-core tenant limits.
3. Tenant creation (`tenants_api`) is not exposed on api.prismlane.app; needs VPS access. OWNER APPROVAL needed (shared infra).
4. `AI_CORE_URL` + `AI_CORE_KEY` must be added to the aicoachlab Vercel project env (sivaprakasam team). OWNER APPROVAL needed. Server-side only.
5. Credit the source of each reference (image 1: Rathnakumar Udayakumar, @rathanuday). We transcribe tool names/layers as facts; we do not republish the image.
6. Honesty: no invented stats, salaries, or "asked at Company X". Model/tool names carry an "as of 2026-10" note.
7. SEO/CRO: sitemap entries, per-guide metadata, JSON-LD (Article/FAQPage), analytics events (guide viewed, ask used, practice started).
8. A11y + 375px/1280px screenshots + visual-qa gate before any push.
9. Deferred (privacy): CV/JD upload per user. Release 1 = guides + Ask box + memory. Decision recorded as default; owner can reopen.

## Files to touch
- `docs/references/01-ai-coding-agent-ecosystem.md` — reference transcription (source of truth, uploaded to ai-core)
- `lib/guides/ai-coding-ecosystem.ts` — layers, tools, questions, answer patterns, red flags
- `app/guides/page.tsx`, `app/guides/[slug]/page.tsx` — index + guide
- `app/api/guides/ask/route.ts` — server route -> ai-core `/answer`
- `lib/aicore.ts` — one tiny server-only client wrapper (ai-core TS SDK)
- `app/api/chat/route.ts` — route via ai-core gateway
- `lib/tracks/exercises.ts` — "AI Tooling" track (practice link-up)
- `app/sitemap.ts`, navbar link
- `scripts/ingest-guides.mjs` — uploads docs/references/* to collection `aicoachlab-guides`
- `evals/guides-golden.jsonl` — ~20 questions incl. unanswerable

## Steps
- [x] ai-core live check (`/healthz` 200, 2026-10-06)
- [x] HANDOFF written
- [x] 1 reference doc 01 written
- [x] 4a guides data `lib/guides/ai-coding-ecosystem.ts` (9 layers, 25 questions)
- [ ] 2 OWNER approved ("yes") tenant `aicoachlab` + Vercel env; BLOCKED: auto-mode classifier denied writing the minted tenant key to a local file; Vercel CLI not installed
- [ ] 3 ingest script + collection ingest verified (query returns right layer)
- [x] 4 guides data + pages (375/1280 screenshots taken; navbar link still open)
- [ ] 5 Ask route + UI, grounded answer with citations
- [ ] 6 chat route via gateway
- [ ] 7 memory-driven next question
- [ ] 8 golden set run (hit@5 >= 0.80, unanswerable refused), limits exceeded on purpose, Phoenix trace seen
- [ ] 9 build + tsc + visual-qa; NO commit/push without owner say-so

## Success criteria
- Query "which vector DB for small RAG" returns the Context & Knowledge layer chunk first.
- Ask box answer has citations; off-topic question refused.
- 61st request in an hour from one key is 429 from ai-core.
- Trace for an Ask call visible in Phoenix, no query text recorded.

## Resume from here if interrupted
Done: reference doc 01, guides data, `lib/guides/index.ts`, `/guides` + `/guides/[slug]` pages (FAQ JSON-LD), sitemap entries; tsc clean for these files. Next: step 2 needs the owner to run the tenant create + Vercel env set (see chat for commands); then ingest/Ask/chat steps.
