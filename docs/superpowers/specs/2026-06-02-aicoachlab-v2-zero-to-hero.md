# AICoachLab v2 — Zero to Hero Learning Platform
**Date:** 2026-06-02  
**Status:** Approved for implementation

---

## 1. Vision

AICoachLab becomes a full upskilling platform. User types any topic → AI generates an animated, voiced, interactive lesson deck → mid-lesson chatbot answers questions → mock interview unlocks at end. No other platform closes the learn → practice → interview loop in one session, with on-demand dynamic content.

Existing routes (`/tracks`, `/interview`) unchanged. New `/learn` tree added alongside.

---

## 2. Competitive Differentiation

From research:
- **Nobody generates lessons on demand** — Coursera/Udemy/Scrimba are all pre-authored
- **Nobody does mid-lesson contextual AI chat** — Khanmigo/Educative treat chat as a sidebar help desk; ours knows which slide you're on
- **Nobody closes learn→interview in one session** — Pramp/Leetcode are separate products
- **Voice narration on dynamic content** — zero competitors do this

---

## 3. Route Map

```
/learn                        → homepage: trending topics + "what do you want to learn?" input
/learn/[slug]                 → topic overview: concept map, lesson nodes, time estimate
/learn/[slug]/[lesson-index]  → slide player: animated + voiced + chatbot overlay
/learn/[slug]/interview       → mock interview seeded from lesson content
/tracks                       → existing (unchanged)
/interview                    → existing (unchanged)
```

---

## 4. Auth & Freemium Gates

| State | Limit | Features |
|---|---|---|
| Anonymous | 3 topic generations | No progress save, no voice |
| Signed in (free, magic link) | 10 topics | Progress saved, voice on, bookmark slides |
| Paid (future, Hub flag) | Unlimited | PDF export, team seats, custom voice |

Gate trigger: 4th topic request → magic link signup modal (no password, email only).  
Pricing section: OFF by default via `toggle_aicoachlab_pricing` Edge Config flag.  
Voice: OFF for anonymous users (cost saving), ON for signed-in free users.

---

## 5. Data Model

### Topic (stored in Supabase `topics` table)
```ts
interface Topic {
  id: string
  slug: string               // url-safe: "rag-retrieval-augmented-generation"
  title: string              // "RAG: Retrieval-Augmented Generation"
  description: string
  tags: string[]
  estimatedMins: number
  prerequisites: string[]
  requestCount: number       // for trending sort
  createdAt: string
  lessons: Lesson[]
}
```

### Lesson
```ts
interface Lesson {
  index: number
  title: string
  slides: Slide[]
  audioUrls: string[]        // Vercel Blob URLs, one per slide, pre-generated
}
```

### Slide (discriminated union)
```ts
type Slide =
  | { type: 'concept';   heading: string; body: string; icon?: string; narrationText: string }
  | { type: 'code';      lang: string; lines: string[]; highlight?: number[]; narrationText: string }
  | { type: 'diagram';   svgMarkup: string; caption: string; narrationText: string }
  | { type: 'video';     url: string; caption: string; narrationText: string }
  | { type: 'carousel';  items: { label: string; body: string }[]; narrationText: string }
  | { type: 'quiz';      question: string; options: string[]; answer: number; explanation: string }
```

Each slide has `narrationText` — sent to ElevenLabs at generation time, audio cached to Vercel Blob.

---

## 6. AI Generation Pipeline

Triggered when user submits a topic that doesn't exist in DB yet.

```
User input: "video generation with fal.ai"
     ↓
1. Slug + existence check (Supabase)
   → exists: return cached topic
   → new: proceed
     ↓
2. Claude Haiku 3.5 — generate lesson outline JSON
   Prompt: strict schema with Zod, 3 lessons × 6–8 slides each
   Fallback: Groq llama-3.3-70b
     ↓
3. Validate with Zod schema — retry once on failure
     ↓
4. Store topic + lessons in Supabase
     ↓
5. Parallel: ElevenLabs Multilingual v2 TTS per slide narrationText
   → Upload MP3 to Vercel Blob
   → Store URL in slide.audioUrl
     ↓
6. Return topic to client (audio generation continues async)
```

Generation time estimate: ~8–12s for outline, ~15s for audio (async, shown as "preparing voice...")

### Generation prompt template
```
System: You are a curriculum designer. Generate a complete learning module as JSON.
Follow this schema exactly. Output ONLY valid JSON, no prose.

User: Topic: "${userInput}"
Generate 3 lessons. Each lesson has 6-8 slides.
Cover: intro concept, core mechanics, code example (real runnable code), 
common pitfalls, advanced pattern, quiz.
Use real library names, real API calls, real code. No pseudo-code.
```

---

## 7. Slide Player UI

### Layout
```
┌─────────────────────────────────────────────┐
│  [←] Lesson 2 of 3  ●●●○○○○  [🔊] [Chat]  │  ← top bar
├─────────────────────────────────────────────┤
│                                             │
│           SLIDE CONTENT                    │  ← 70vh
│        (animated in per type)              │
│                                             │
├─────────────────────────────────────────────┤
│  [← Prev]        3 / 8        [Next →]     │  ← bottom nav
└─────────────────────────────────────────────┘
│  [💬 Chatbot panel — slides up on tap]      │  ← floating
```

### Animations (Framer Motion)
- **All slides**: `opacity: 0, y: 12` → `opacity: 1, y: 0`, 200ms, `cubicBezier(0.23,1,0.32,1)`
- **Concept slide**: heading first, then body staggered in 80ms per line
- **Code slide**: lines reveal top-to-bottom, 40ms per line, cursor blink on active line, left-border pulse highlight on referenced lines
- **Diagram slide**: SVG `stroke-dashoffset` animate on path elements, `anime.js` for timeline control
- **Carousel**: horizontal snap-scroll, swipeable, auto-advance every 3s

### Code animation detail
- Monospace font (JetBrains Mono already in stack)
- Lines clip-path reveal + syntax highlighting via `shiki` or `prism-react-renderer`
- Active line: `border-left: 2px solid #a78bfa` pulsing
- For "handwritten" feel: `feTurbulence` SVG filter with `baseFrequency="0.02"` on the code block container
- `rough-notation` circle/underline highlights on key terms (e.g. circle around `embed()`, underline `similarity search`)

---

## 8. Voice Narration

### Pre-generated (lesson slides)
- Model: `eleven_multilingual_v2`
- Voice: "Sarah" (warm, authoritative, tutor-appropriate)
- Generated async after topic created, stored in Vercel Blob
- Client polls `/api/topics/[slug]/audio-status` until ready
- Fallback: slides work without audio if generation pending

### Live streaming (chatbot replies)
- Model: `eleven_turbo_v2_5` (~300ms TTFB)
- WebSocket streaming, first chunk plays before generation completes
- Same "Sarah" voice — user hears consistent tutor throughout
- Mute toggle in top bar, preference saved to localStorage

### Cost controls
- Anonymous users: no voice (saves ~$2.73/lesson in TTS cost)
- Voice only triggers on signed-in users
- Cache audio aggressively — same topic shared across all users (one generation per topic, not per user)

---

## 9. Mid-Lesson Chatbot

- Trigger: "Chat" button top-right OR typing in floating input
- Slides up from bottom (mobile bottom-sheet pattern, existing `§3 mobile chatbot pattern`)
- System prompt includes: current slide JSON + topic title + lesson title
- Model: `llama-3.1-8b-instant` via Groq (fast, cheap for chat)
- Voice reply: streams via ElevenLabs Turbo v2.5 (signed-in only)
- Rate limit: 10 req/hr per fingerprint (existing `createChatRoute` pattern)
- Scope enforcement: "I'm your AICoachLab tutor. For anything else, try Google or ChatGPT!"
- On dismiss: resumes slide narration from where it paused

---

## 10. Trending Topics Homepage (`/learn`)

```
┌────────────────────────────────────────────┐
│  🔥 What do you want to learn?             │
│  [________________________] [Generate →]   │
│  e.g. "RAG", "Kubernetes", "fal.ai video" │
├────────────────────────────────────────────┤
│  TRENDING THIS WEEK                        │
│  [RAG] [AI Agents] [MCP] [LangGraph]      │
│  [Video Gen] [System Design] [TypeScript]  │
├────────────────────────────────────────────┤
│  YOUR TOPICS (signed in)                   │
│  [Resume: RAG — Lesson 2/3 — 4 min left]  │
└────────────────────────────────────────────┘
```

- Trending = `requestCount DESC` from topics table, last 7 days
- Worldtrends integration: `/api/trends` feeds into trending seeds (tech category)
- Search: fuzzy match against existing topics first → if no match → offer to generate

---

## 11. Mock Interview Integration

At lesson completion → "Test yourself" CTA → `/learn/[slug]/interview`

- Reuses existing `/api/interview/route.ts`
- Seeds questions from lesson slide content (quiz slides + concept slides → interview questions)
- Persona: same interviewer personas from `lib/interview/personas.ts`
- Completion: score + "share result" card

---

## 12. Tech Stack Changes

| Addition | Purpose | Already in project? |
|---|---|---|
| `@eleven-labs/elevenlabs-js` | TTS pre-gen + streaming | No — add |
| `anime.js` | SVG stroke-dashoffset timelines | No — add |
| `rough-notation` | Code term highlights | No — add |
| `shiki` | Syntax highlighting in slides | No — check |
| Supabase `topics` table | Dynamic topic storage | Supabase already wired |
| Vercel Blob | Audio file storage | Check if BLOB_READ_WRITE_TOKEN set |
| `zod` | Lesson JSON validation | Likely already present |

---

## 13. New API Routes

```
POST /api/topics/generate          → generate new topic (Haiku + ElevenLabs)
GET  /api/topics/[slug]            → fetch existing topic + lessons
GET  /api/topics/[slug]/audio-status → poll audio generation progress
GET  /api/topics/trending           → top 8 topics by requestCount
GET  /api/topics/search?q=...       → fuzzy search existing topics
POST /api/topics/[slug]/complete    → mark lesson complete, unlock interview
```

---

## 14. Supabase Schema

```sql
create table topics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  tags text[],
  estimated_mins int,
  prerequisites text[],
  request_count int default 1,
  lessons jsonb not null,  -- full Lesson[] serialised
  audio_ready boolean default false,
  created_at timestamptz default now()
);

create table user_topic_progress (
  user_id text not null,  -- fingerprint or auth user id
  topic_slug text not null,
  lesson_index int default 0,
  slide_index int default 0,
  completed boolean default false,
  updated_at timestamptz default now(),
  primary key (user_id, topic_slug)
);
```

---

## 15. Required Env Vars (not yet set)

```bash
ELEVENLABS_API_KEY=...          # elevenlabs.io → Profile → API Keys
BLOB_READ_WRITE_TOKEN=...       # Vercel dashboard → Storage → Blob → token
# Both must be added to agents/.env.shared + synced via set-vercel-env.ts
```

## 16. Out of Scope (v1)

- PDF export (paid tier, later)
- Team seats / shared workspaces
- Custom voice selection
- User-uploaded content
- Remotion video export (architecture supports it, implement later)
- Certificate generation
- Mobile app

---

## 16. Implementation Order

1. Supabase schema + `/api/topics/*` routes
2. Lesson generation (Haiku 3.5 + Zod validation)
3. `/learn` homepage + topic overview page
4. Slide player component + animation system
5. ElevenLabs pre-gen audio pipeline
6. Mid-lesson chatbot with slide context
7. Voice streaming for chatbot
8. Mock interview integration at lesson end
9. Auth gate (3 free → magic link)
10. Trending topics feed
