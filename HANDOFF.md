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

---
# SECTION 2 — Role Playbooks (added 2026-10-07)  Status: IN PROGRESS (research done, build not started)
**Goal:** `/roles` + `/roles/[slug]`: one realistic scenario per IT role, animated workflow, stack cards (what / why picked / what role must know / beginner mistake), depth tabs, grounded Ask. Same production-ready gate as the rest of aicoachlab.
**Demand evidence:** `docs/startup/demand-2026-10-07-it-roles.md` (agents repo). Role demand is verified; PRODUCT demand is a HYPOTHESIS (test: >=5% of role viewers start practice in 14 days, else stop at 2 roles).
**Roles, in order:** 1 AI Engineer, 2 Forward Deployed Engineer, 3 Data Engineer, 4 ML/MLOps, 5 Cybersecurity (AI+cloud), 6 DevOps/Platform/Cloud. Build 1+2 first, lock format, then 3-6.
**Content rule:** no invented salaries/stats/"asked at Company X". Tool names carry "as of 2026-10". Sources linked.

## Design decisions (before code)
- Retrieval: plain vector + reranker via ai-core `/answer`, not agentic, not graph (single-hop Q&A). Prove on golden set.
- Prompt/context: registry prompt, k=5, answer <=250 tokens, role hint only. Cache = ai-core gateway.
- Models: ai-core gateway `core-chat`; never `core-premium`. Free tier only.
- Design: reuse locked aicoachlab design (magenta #ec13d6, aurora, bento). Playbook page = app-shell, workflow rail left, stack card right, internal scroll panes (fit-in-viewport).
- Next.js here is NOT stock: read `node_modules/next/dist/docs/` before writing routes.

## Production-ready gate status (items from production-ready-gate.md)
- [ ] 1 design system/theme-loader/hub overrides/logo   - [ ] 2 hub control (model, limits, flags, GA4)
- [ ] 3/12/16 ai-core RAG: BLOCKED on tenant key (owner approval, see section 1 item 2-4). Exemption stated, not faked.
- [ ] 4 user state (per-user, not localStorage-only)   - [ ] 5/13 promo codes via hub access-codes
- [ ] 6/15 monitoring: GA4 hub id, Vercel Analytics, PostHog, events role_viewed / ask_used / practice_started / promo_redeem
- [ ] 7 chatbot + feedback in layout   - [ ] 8 landing fit-in-viewport, SEO/CRO, 404
- [ ] 9 build 0, 375+1280 screenshots read, visual-qa, security-gate, e2e-verify; NO push without owner say-so
- [ ] 10/11/14/17/18 UI skill stack, animated demo + <1MB WebP, global design lib, pick-design, FastAPI exemption note

## Steps
- [x] Demand research + evidence log
- [ ] Read Next docs in node_modules; audit which gate items aicoachlab already passes
- [x] `lib/roles/*.ts` + `RolePlaybook` component (AI Engineer, FDE) + /roles pages + sitemap + landing nav link; tsc+build clean, 375/1280 no overflow, mobile steps = horizontal scroller (2026-10-07). UNCOMMITTED.
- [ ] pages, sitemap, JSON-LD, nav link; 375/1280 screenshots
- [x] roles 3-6 (data-engineer, ml-mlops-engineer, cybersecurity-engineer, devops-platform-engineer): built, tsc + build green, VERIFIED demand rows only
- [ ] gate items above
## Resume from here if interrupted
Research done and logged. Next: Next.js docs read + gate audit of aicoachlab.

## 2026-10-07 ADDED SCOPE: "Bring your own job" (paste job spec or URL)
User flow: paste job text or URL -> (1) extract role + required stack -> (2) build the same playbook (scenario, workflow, stack cards) for THAT job -> (3) skill-gap vs the user's resume -> (4) free learning path per gap (Anthropic Academy, Hugging Face, Microsoft Learn, others) -> (5) tailored resume bullets.
Build order: ship preset roles first (1+2), then this. Same engine, input = extracted JD instead of preset data file.

### Decisions / constraints (before code)
- URL fetch = SSRF risk: server-side only, https only, block private/loopback/link-local IPs and redirects to them, size + time cap, strip to text. Many job boards block bots or need login: ALWAYS offer "paste the text" fallback; never scrape behind login. Do not store the fetched page beyond the session.
- Resume + JD are personal data: user-owned, per-user, delete button, never sent to logs/traces (no text in Phoenix), never in Jev state strings. Goes through ai-core upload-token pipeline (gate item 16), not local parse + prompt stuffing. BLOCKED on tenant key like section 1: state exemption, do not fake.
- Tailoring rule: rewrite ONLY what the resume already supports. Missing skill = shown as a gap with a learning link, NEVER inserted as a claim. Every suggested bullet shows the resume line it came from. No invented metrics/employers/dates.
- Learning resources: curated table `lib/learning/resources.ts`, each row {provider, title, url, skill tags, level, price, verifiedFreeOn}. Only rows with `verifiedFreeOn` set are shown as "Free"; others labelled "check price". `scripts/verify-resources.mjs` re-fetches URLs, flags dead links, run before release. Free-tier only: never recommend a paid course as free.
- Verified so far (2026-10-07): Hugging Face /learn lists 12 courses (LLM, Agents, Context, smol, Diffusion, Audio, Deep RL, CV, ML for Games/3D, Open-Source AI Cookbook); page itself does NOT state they are free -> verify per course before labelling Free. Anthropic /learn 308-redirects to academy.claude.com (free/cert wording not read). Microsoft Learn fetch unreadable. All three: PENDING verification.
- Extraction: LLM via ai-core gateway returns JSON {title, seniority, mustHave[], niceToHave[], tools[]}, schema-validated; unmatched tools shown as "unknown, not in our map", not guessed. Golden set of 10 real-style JDs, eval before release.
- Abuse: per-IP/user rate limit from hub, paste length cap (~12k chars), URL fetch limit separate and stricter.
- Gate extras: events jd_pasted / jd_url_fetched / gap_shown / resource_clicked / resume_tailored; promo codes can unlock extra tailorings; feedback widget on the result page.

### Steps (new)
- [ ] 10 learning resources table + verify script (verify each provider URL really free)
- [ ] 11 JD extractor (paste first, URL second) + schema + golden set
- [ ] 12 gap view: JD stack vs resume skills, each gap -> playbook card + free resource
- [ ] 13 resume tailoring with source-line citations, no invented claims
- [ ] 14 SSRF-safe URL fetch + tests (private IPs, redirects, size)
- [ ] 15 per-user delete + privacy copy; gate items for this flow

## Roles redesign v2 — ANIMATED SCOPE, lock, AI pillars (2026-10-07)
**Design lock:** bg #0c0714, accent #ec13d6, T9 layout kept. Index = search + ruled list + live preview pane (no card grid, no centered hero). Role page = breadcrumb + scenario + playbook (clickable flow, detail pane). Home link: nav brand + breadcrumb.
**ANIMATED SCOPE (transform/opacity only, ease-out .23,1,.32,1):**
- Index rows: entry stagger 30-80ms | why: orient, first view | trigger: mount | reduced-motion: opacity only.
- Preview pane swap: fade/slide 8px | why: state change legible | trigger: hover/focus row | reduced: fade.
- Playbook flow: auto-advances every 3.6s, progress bar, detail re-keys | why: explains workflow order | trigger: mount, pause button, click step stops autoplay | reduced: no autoplay, manual only.
- Press feedback scale(.97) on buttons/rows; hover gated (hover:hover)(pointer:fine).
**AI pillars:** exempt, static content, no model/RAG call; ai-core not used. Pillars 10-13 n/a.
**Not in scope:** ai-core Ask box, monitoring events, paste-a-JD, marketing.

## Roles feature (2026-10-07) — COMPLETE, live
- 18 roles in lib/roles (12 added), /roles list + /roles/[slug] playbooks, /terms page added (cookie banner linked to a 404).
- Verified live: 18/18 role pages 200; e2e-verify 10/10; visual-qa 20 pass/0 fail on /, /roles, playbook; Lighthouse mobile a11y 98 (heading-order fixed in 999bda8), BP/SEO 100.
- Commits: 4da8f3a roles, d0e623c terms, 999bda8 heading order.
- Open: cookie banner covers ~20% of mobile viewport until dismissed; /terms wording is generic, owner to review.

- Landing (2026-10-07): added How-it-works + 18 role playbook grid, sticky footer (7769b03, 22efeb5). Open: demo card empty until animation fills (mobile), cookie banner height, home page not re-run through full design stack/Lighthouse.
