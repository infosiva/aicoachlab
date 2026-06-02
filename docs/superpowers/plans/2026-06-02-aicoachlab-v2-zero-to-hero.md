# AICoachLab v2 — Zero to Hero Learning Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform AICoachLab into a dynamic AI-powered learning platform where users type any topic, get an animated voiced slide deck generated on-demand, chat mid-lesson, and take a mock interview at the end — beating every competitor on quality and UX.

**Architecture:** Dynamic topic generation via Claude Haiku → Zod-validated lesson JSON stored in Supabase → Remotion slide compositions rendered per topic with ElevenLabs voice pre-generated to Vercel Blob → Framer Motion interactive player with floating chatbot overlay → mock interview seeded from lesson content.

**Tech Stack:** Next.js 15, Framer Motion (existing), Remotion + @remotion/transitions, ElevenLabs SDK (eleven_multilingual_v2 pre-gen + eleven_turbo_v2_5 streaming), Supabase (topics + progress tables), Vercel Blob (audio storage), Claude Haiku 3.5 (lesson JSON), Groq llama-3.1-8b-instant (chatbot), anime.js (SVG stroke animation), rough-notation (keyword highlights), Zod (schema validation)

**Quality bar:** Beats Scrimba (interactive code), Brilliant (progressive animation), Udemy (voice narration). Unique differentiators: mid-lesson contextual AI chat, dynamic generation of any topic, same platform learn→interview.

---

## File Map

### New files to create
```
app/learn/page.tsx                          — trending topics + search homepage
app/learn/[slug]/page.tsx                   — topic overview: concept map, lesson list
app/learn/[slug]/[lesson]/page.tsx          — slide player with voice + chatbot
app/learn/[slug]/interview/page.tsx         — mock interview seeded from topic
app/api/topics/generate/route.ts            — POST: generate topic via Haiku + queue audio
app/api/topics/[slug]/route.ts              — GET: fetch topic + lessons
app/api/topics/[slug]/audio-status/route.ts — GET: poll audio generation progress
app/api/topics/trending/route.ts            — GET: top 8 by request_count
app/api/topics/search/route.ts              — GET: fuzzy search existing topics
app/api/topics/[slug]/complete/route.ts     — POST: mark lesson complete
app/api/voice/stream/route.ts               — POST: live ElevenLabs streaming TTS for chatbot
components/slides/SlidePlayer.tsx           — main slide deck player component
components/slides/SlideConceptCard.tsx      — concept slide type
components/slides/SlideCodeReveal.tsx       — code slide with typewriter + rough-notation
components/slides/SlideDiagram.tsx          — SVG diagram with anime.js stroke animation
components/slides/SlideCarousel.tsx         — swipeable carousel slide
components/slides/SlideQuiz.tsx             — quiz slide with Kahoot-style UX
components/slides/SlideVideo.tsx            — embedded video slide
components/slides/SlideChatOverlay.tsx      — floating chatbot overlay on slide player
components/learn/TopicCard.tsx              — trending/search result card
components/learn/ConceptMap.tsx             — visual overview of topic lessons
components/learn/LessonProgressMap.tsx      — Duolingo-style node path progress
lib/topics/schema.ts                        — Zod schemas for Topic, Lesson, Slide union
lib/topics/generate.ts                      — Haiku 3.5 lesson generation + Groq fallback
lib/topics/store.ts                         — Supabase CRUD for topics + progress
lib/voice/elevenlabs.ts                     — ElevenLabs pre-gen (Multilingual v2) + streaming (Turbo v2.5)
lib/voice/blob.ts                           — Vercel Blob audio upload/fetch helpers
lib/learn/gate.ts                           — freemium gate: 3 anon → magic link → 10 free
supabase/migrations/001_topics.sql          — topics + user_topic_progress tables
```

### Files to modify
```
app/layout.tsx                              — add /learn to nav
app/AICoachLabPage.tsx                      — add "Learn" CTA alongside "Practice" and "Interview"
app/api/interview/route.ts                  — add topic-seeded question bank support
public/content.json                         — add trendingTopics seed list
```

---

## Task 1: Supabase schema + Zod types

**Files:**
- Create: `supabase/migrations/001_topics.sql`
- Create: `lib/topics/schema.ts`

- [ ] **Step 1: Write migration SQL**

Create `supabase/migrations/001_topics.sql`:
```sql
create extension if not exists "pg_trgm";

create table if not exists topics (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  description     text not null default '',
  tags            text[] not null default '{}',
  estimated_mins  int not null default 20,
  prerequisites   text[] not null default '{}',
  request_count   int not null default 1,
  lessons         jsonb not null default '[]',
  audio_ready     boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists topics_request_count_idx on topics (request_count desc);
create index if not exists topics_slug_trgm_idx on topics using gin (slug gin_trgm_ops);
create index if not exists topics_title_trgm_idx on topics using gin (title gin_trgm_ops);

create table if not exists user_topic_progress (
  user_id         text not null,
  topic_slug      text not null references topics(slug) on delete cascade,
  lesson_index    int not null default 0,
  slide_index     int not null default 0,
  completed       boolean not null default false,
  updated_at      timestamptz not null default now(),
  primary key (user_id, topic_slug)
);
```

- [ ] **Step 2: Run migration**
```bash
cd /Users/sivaprakasam/projects/agents/aicoachlab
# If supabase CLI linked:
npx supabase db push
# Or paste SQL directly in Supabase dashboard → SQL Editor
```

- [ ] **Step 3: Write Zod schemas**

Create `lib/topics/schema.ts`:
```typescript
import { z } from 'zod'

export const SlideConceptSchema = z.object({
  type: z.literal('concept'),
  heading: z.string(),
  body: z.string(),
  icon: z.string().optional(),
  narrationText: z.string(),
})

export const SlideCodeSchema = z.object({
  type: z.literal('code'),
  lang: z.string(),
  lines: z.array(z.string()),
  highlight: z.array(z.number()).optional(),
  narrationText: z.string(),
  keyTerms: z.array(z.string()).optional(),
})

export const SlideDiagramSchema = z.object({
  type: z.literal('diagram'),
  svgMarkup: z.string(),
  caption: z.string(),
  narrationText: z.string(),
})

export const SlideVideoSchema = z.object({
  type: z.literal('video'),
  url: z.string().url(),
  caption: z.string(),
  narrationText: z.string(),
})

export const SlideCarouselSchema = z.object({
  type: z.literal('carousel'),
  items: z.array(z.object({ label: z.string(), body: z.string() })),
  narrationText: z.string(),
})

export const SlideQuizSchema = z.object({
  type: z.literal('quiz'),
  question: z.string(),
  options: z.array(z.string()).length(4),
  answer: z.number().min(0).max(3),
  explanation: z.string(),
})

export const SlideSchema = z.discriminatedUnion('type', [
  SlideConceptSchema,
  SlideCodeSchema,
  SlideDiagramSchema,
  SlideVideoSchema,
  SlideCarouselSchema,
  SlideQuizSchema,
])

export const LessonSchema = z.object({
  index: z.number(),
  title: z.string(),
  slides: z.array(SlideSchema).min(4).max(10),
  audioUrls: z.array(z.string()).optional().default([]),
})

export const TopicSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  estimatedMins: z.number(),
  prerequisites: z.array(z.string()),
  requestCount: z.number().default(1),
  lessons: z.array(LessonSchema),
  audioReady: z.boolean().default(false),
})

export type Slide = z.infer<typeof SlideSchema>
export type Lesson = z.infer<typeof LessonSchema>
export type Topic = z.infer<typeof TopicSchema>
export type SlideType = Slide['type']
```

- [ ] **Step 4: Verify Zod is installed**
```bash
cd /Users/sivaprakasam/projects/agents/aicoachlab
grep '"zod"' package.json || npm install zod
```

- [ ] **Step 5: Commit**
```bash
git add supabase/migrations/001_topics.sql lib/topics/schema.ts
git commit -m "feat(aicoachlab): Supabase schema + Zod types for dynamic topics"
```

---

## Task 2: Supabase store + topic CRUD

**Files:**
- Create: `lib/topics/store.ts`

- [ ] **Step 1: Create store**

Create `lib/topics/store.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Topic, Lesson } from './schema'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars missing')
  return createClient(url, key)
}

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const sb = getClient()
  const { data, error } = await sb
    .from('topics')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error || !data) return null
  return dbRowToTopic(data)
}

export async function createTopic(topic: Omit<Topic, 'id' | 'requestCount' | 'audioReady'>): Promise<Topic> {
  const sb = getClient()
  const { data, error } = await sb
    .from('topics')
    .insert({
      slug: topic.slug,
      title: topic.title,
      description: topic.description,
      tags: topic.tags,
      estimated_mins: topic.estimatedMins,
      prerequisites: topic.prerequisites,
      lessons: topic.lessons,
      request_count: 1,
      audio_ready: false,
    })
    .select()
    .single()
  if (error || !data) throw new Error(`Failed to create topic: ${error?.message}`)
  return dbRowToTopic(data)
}

export async function incrementRequestCount(slug: string): Promise<void> {
  const sb = getClient()
  await sb.rpc('increment_topic_request_count', { p_slug: slug })
}

export async function markAudioReady(slug: string, lessons: Lesson[]): Promise<void> {
  const sb = getClient()
  await sb.from('topics').update({ audio_ready: true, lessons }).eq('slug', slug)
}

export async function getTrendingTopics(limit = 8): Promise<Topic[]> {
  const sb = getClient()
  const { data } = await sb
    .from('topics')
    .select('*')
    .order('request_count', { ascending: false })
    .limit(limit)
  return (data ?? []).map(dbRowToTopic)
}

export async function searchTopics(query: string): Promise<Topic[]> {
  const sb = getClient()
  const { data } = await sb
    .from('topics')
    .select('*')
    .or(`title.ilike.%${query}%,slug.ilike.%${query}%`)
    .limit(6)
  return (data ?? []).map(dbRowToTopic)
}

export async function saveProgress(userId: string, topicSlug: string, lessonIndex: number, slideIndex: number, completed = false) {
  const sb = getClient()
  await sb.from('user_topic_progress').upsert({
    user_id: userId,
    topic_slug: topicSlug,
    lesson_index: lessonIndex,
    slide_index: slideIndex,
    completed,
    updated_at: new Date().toISOString(),
  })
}

export async function getProgress(userId: string, topicSlug: string) {
  const sb = getClient()
  const { data } = await sb
    .from('user_topic_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_slug', topicSlug)
    .single()
  return data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbRowToTopic(row: any): Topic {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    tags: row.tags ?? [],
    estimatedMins: row.estimated_mins,
    prerequisites: row.prerequisites ?? [],
    requestCount: row.request_count,
    lessons: row.lessons ?? [],
    audioReady: row.audio_ready,
  }
}
```

- [ ] **Step 2: Add Supabase RPC for increment (run in Supabase SQL editor)**
```sql
create or replace function increment_topic_request_count(p_slug text)
returns void language plpgsql as $$
begin
  update topics set request_count = request_count + 1 where slug = p_slug;
end;
$$;
```

- [ ] **Step 3: Check supabase-js installed**
```bash
grep '"@supabase/supabase-js"' package.json || npm install @supabase/supabase-js
```

- [ ] **Step 4: Commit**
```bash
git add lib/topics/store.ts
git commit -m "feat(aicoachlab): Supabase topic store CRUD"
```

---

## Task 3: AI lesson generation (Haiku 3.5 + Groq fallback)

**Files:**
- Create: `lib/topics/generate.ts`

- [ ] **Step 1: Create generate.ts**

Create `lib/topics/generate.ts`:
```typescript
import { z } from 'zod'
import { TopicSchema, type Topic } from './schema'

const HAIKU_KEY = process.env.ANTHROPIC_API_KEY
const GROQ_KEY  = process.env.GROQ_API_KEY

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 60)
}

const SYSTEM_PROMPT = `You are an expert curriculum designer and software engineer.
Generate a complete learning module as a JSON object matching the schema exactly.
Output ONLY valid JSON. No markdown, no prose, no code fences.
Rules:
- 3 lessons total
- Each lesson: 6-8 slides
- Slide types to use: concept, code, carousel, quiz (at least one of each per lesson)
- Code slides: real, runnable code with correct syntax. Use actual library APIs, not pseudocode.
- narrationText: 2-4 natural spoken sentences per slide, conversational tutor tone
- quiz: exactly 4 options, one correct, with a clear explanation
- keyTerms on code slides: 1-3 terms worth highlighting (actual variable/function names)
- Progressive difficulty: lesson 1 = foundations, lesson 2 = core patterns, lesson 3 = advanced/production
`

function buildPrompt(userTopic: string): string {
  return `Generate a complete zero-to-hero learning module for: "${userTopic}"

Return a JSON object with this exact structure:
{
  "slug": "url-safe-slug",
  "title": "Friendly Title: Subtitle",
  "description": "One sentence description",
  "tags": ["tag1", "tag2", "tag3"],
  "estimatedMins": 25,
  "prerequisites": ["prerequisite1"],
  "lessons": [
    {
      "index": 0,
      "title": "Lesson title",
      "slides": [
        { "type": "concept", "heading": "...", "body": "...", "icon": "🔤", "narrationText": "..." },
        { "type": "code", "lang": "typescript", "lines": ["line1", "line2"], "highlight": [1], "narrationText": "...", "keyTerms": ["functionName"] },
        { "type": "carousel", "items": [{"label": "...", "body": "..."}, ...], "narrationText": "..." },
        { "type": "quiz", "question": "...", "options": ["A","B","C","D"], "answer": 0, "explanation": "..." }
      ],
      "audioUrls": []
    }
  ]
}`
}

async function generateWithHaiku(userTopic: string): Promise<string | null> {
  if (!HAIKU_KEY) return null
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': HAIKU_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildPrompt(userTopic) }],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.content?.[0]?.text ?? null
  } catch { return null }
}

async function generateWithGroq(userTopic: string): Promise<string | null> {
  if (!GROQ_KEY) return null
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 8000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildPrompt(userTopic) },
        ],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? null
  } catch { return null }
}

export async function generateTopic(userTopic: string): Promise<Topic> {
  const raw =
    await generateWithHaiku(userTopic) ||
    await generateWithGroq(userTopic)

  if (!raw) throw new Error('All AI providers failed for lesson generation')

  // Parse JSON — handle markdown fences if model wraps it
  const jsonStr = raw.includes('```')
    ? raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    : raw.trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error(`AI returned invalid JSON: ${jsonStr.slice(0, 200)}`)
  }

  // Validate with Zod — retry once with Groq if Haiku output is malformed
  const result = TopicSchema.safeParse(parsed)
  if (!result.success) {
    const groqRaw = await generateWithGroq(userTopic)
    if (!groqRaw) throw new Error(`Zod validation failed: ${result.error.message}`)
    const groqParsed = JSON.parse(groqRaw)
    const groqResult = TopicSchema.safeParse(groqParsed)
    if (!groqResult.success) throw new Error(`Both AI providers returned invalid schema`)
    return groqResult.data
  }

  // Ensure slug is URL-safe
  const topic = result.data
  if (!topic.slug || topic.slug.includes(' ')) {
    topic.slug = slugify(topic.title || userTopic)
  }

  return topic
}
```

- [ ] **Step 2: Verify Anthropic key available**
```bash
grep ANTHROPIC_API_KEY /Users/sivaprakasam/projects/agents/aicoachlab/.env.local 2>/dev/null || echo "Key must be in env"
```

- [ ] **Step 3: Commit**
```bash
git add lib/topics/generate.ts
git commit -m "feat(aicoachlab): AI lesson generation with Haiku 3.5 + Groq fallback"
```

---

## Task 4: ElevenLabs voice pipeline (pre-gen + streaming)

**Files:**
- Create: `lib/voice/elevenlabs.ts`
- Create: `lib/voice/blob.ts`

- [ ] **Step 1: Install dependencies**
```bash
cd /Users/sivaprakasam/projects/agents/aicoachlab
npm install @vercel/blob
npm install elevenlabs
```

- [ ] **Step 2: Create blob helper**

Create `lib/voice/blob.ts`:
```typescript
import { put, head } from '@vercel/blob'

export async function uploadAudio(buffer: Buffer, path: string): Promise<string> {
  const { url } = await put(path, buffer, {
    access: 'public',
    contentType: 'audio/mpeg',
    addRandomSuffix: false,
  })
  return url
}

export async function audioExists(path: string): Promise<boolean> {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) return false
    await head(path)
    return true
  } catch { return false }
}
```

- [ ] **Step 3: Create ElevenLabs voice module**

Create `lib/voice/elevenlabs.ts`:
```typescript
import { uploadAudio } from './blob'
import type { Lesson } from '@/lib/topics/schema'

const API_KEY = process.env.ELEVENLABS_API_KEY
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL' // Sarah — warm tutor voice

export async function preGenerateSlideAudio(
  topicSlug: string,
  lessonIndex: number,
  slideIndex: number,
  narrationText: string,
): Promise<string | null> {
  if (!API_KEY) return null
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: narrationText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.75,
            style: 0.25,
            use_speaker_boost: true,
          },
        }),
      },
    )
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    const path = `aicoachlab/audio/${topicSlug}/l${lessonIndex}-s${slideIndex}.mp3`
    return await uploadAudio(buffer, path)
  } catch { return null }
}

export async function generateAllAudio(
  topicSlug: string,
  lessons: Lesson[],
): Promise<Lesson[]> {
  const updated: Lesson[] = []
  for (const lesson of lessons) {
    const audioUrls: string[] = []
    for (let si = 0; si < lesson.slides.length; si++) {
      const slide = lesson.slides[si]
      // Only narrated slides (not quiz)
      const narration = 'narrationText' in slide ? slide.narrationText : null
      if (narration) {
        const url = await preGenerateSlideAudio(topicSlug, lesson.index, si, narration)
        audioUrls.push(url ?? '')
      } else {
        audioUrls.push('')
      }
    }
    updated.push({ ...lesson, audioUrls })
  }
  return updated
}

// Streaming TTS for chatbot replies — returns ReadableStream
export async function streamVoiceReply(text: string): Promise<ReadableStream | null> {
  if (!API_KEY) return null
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      },
    )
    if (!res.ok || !res.body) return null
    return res.body
  } catch { return null }
}
```

- [ ] **Step 4: Add env vars to .env.local**
```bash
# Add to /Users/sivaprakasam/projects/agents/aicoachlab/.env.local:
# ELEVENLABS_API_KEY=your_key_here
# BLOB_READ_WRITE_TOKEN=your_token_here
echo "Add ELEVENLABS_API_KEY and BLOB_READ_WRITE_TOKEN to .env.local"
```

- [ ] **Step 5: Commit**
```bash
git add lib/voice/elevenlabs.ts lib/voice/blob.ts
git commit -m "feat(aicoachlab): ElevenLabs voice pipeline — pre-gen Multilingual v2 + streaming Turbo v2.5"
```

---

## Task 5: Topic generation API routes

**Files:**
- Create: `app/api/topics/generate/route.ts`
- Create: `app/api/topics/[slug]/route.ts`
- Create: `app/api/topics/[slug]/audio-status/route.ts`
- Create: `app/api/topics/trending/route.ts`
- Create: `app/api/topics/search/route.ts`

- [ ] **Step 1: Create generate route**

Create `app/api/topics/generate/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generateTopic } from '@/lib/topics/generate'
import { getTopicBySlug, createTopic, incrementRequestCount } from '@/lib/topics/store'
import { generateAllAudio, preGenerateSlideAudio } from '@/lib/voice/elevenlabs'
import { markAudioReady } from '@/lib/topics/store'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { topic: userTopic } = await req.json()
    if (!userTopic?.trim()) {
      return NextResponse.json({ error: 'Topic required' }, { status: 400 })
    }

    // Slugify candidate for lookup
    const candidateSlug = userTopic.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60)

    // Check if already exists
    const existing = await getTopicBySlug(candidateSlug)
    if (existing) {
      await incrementRequestCount(candidateSlug)
      return NextResponse.json({ topic: existing, cached: true })
    }

    // Generate new topic
    const topic = await generateTopic(userTopic)

    // Store immediately (without audio)
    const stored = await createTopic({
      slug: topic.slug,
      title: topic.title,
      description: topic.description,
      tags: topic.tags,
      estimatedMins: topic.estimatedMins,
      prerequisites: topic.prerequisites,
      lessons: topic.lessons,
    })

    // Fire-and-forget audio generation (async, don't block response)
    if (process.env.ELEVENLABS_API_KEY && process.env.BLOB_READ_WRITE_TOKEN) {
      generateAllAudio(topic.slug, topic.lessons)
        .then(updatedLessons => markAudioReady(topic.slug, updatedLessons))
        .catch(console.error)
    }

    return NextResponse.json({ topic: stored, cached: false })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create slug GET route**

Create `app/api/topics/[slug]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getTopicBySlug, incrementRequestCount } from '@/lib/topics/store'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const topic = await getTopicBySlug(slug)
  if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
  await incrementRequestCount(slug)
  return NextResponse.json({ topic })
}
```

- [ ] **Step 3: Create audio-status route**

Create `app/api/topics/[slug]/audio-status/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getTopicBySlug } from '@/lib/topics/store'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const topic = await getTopicBySlug(slug)
  if (!topic) return NextResponse.json({ ready: false })
  return NextResponse.json({ ready: topic.audioReady })
}
```

- [ ] **Step 4: Create trending + search routes**

Create `app/api/topics/trending/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { getTrendingTopics } from '@/lib/topics/store'

export const runtime = 'nodejs'
export const revalidate = 300 // 5 min cache

export async function GET() {
  const topics = await getTrendingTopics(8)
  return NextResponse.json({ topics })
}
```

Create `app/api/topics/search/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { searchTopics } from '@/lib/topics/store'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (q.length < 2) return NextResponse.json({ topics: [] })
  const topics = await searchTopics(q)
  return NextResponse.json({ topics })
}
```

- [ ] **Step 5: Commit**
```bash
git add app/api/topics/
git commit -m "feat(aicoachlab): topic API routes — generate, fetch, audio-status, trending, search"
```

---

## Task 6: Voice streaming API route

**Files:**
- Create: `app/api/voice/stream/route.ts`

- [ ] **Step 1: Create streaming route**

Create `app/api/voice/stream/route.ts`:
```typescript
import { NextRequest } from 'next/server'
import { streamVoiceReply } from '@/lib/voice/elevenlabs'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text?.trim()) return new Response('Text required', { status: 400 })

  const stream = await streamVoiceReply(text)
  if (!stream) return new Response('Voice unavailable', { status: 503 })

  return new Response(stream, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
    },
  })
}
```

- [ ] **Step 2: Commit**
```bash
git add app/api/voice/stream/route.ts
git commit -m "feat(aicoachlab): ElevenLabs streaming TTS route for chatbot voice replies"
```

---

## Task 7: Freemium gate

**Files:**
- Create: `lib/learn/gate.ts`

- [ ] **Step 1: Create gate module**

Create `lib/learn/gate.ts`:
```typescript
// Client-side gate: 3 topics free anon → magic link → 10 topics free signed-in
const ANON_LIMIT    = 3
const FREE_LIMIT    = 10
const STORAGE_KEY   = 'acl_topic_count'
const USER_KEY      = 'acl_user_id'

export interface GateStatus {
  allowed: boolean
  used: number
  limit: number
  needsSignup: boolean
  needsUpgrade: boolean
}

export function checkGate(): GateStatus {
  if (typeof window === 'undefined') return { allowed: true, used: 0, limit: ANON_LIMIT, needsSignup: false, needsUpgrade: false }

  const userId = localStorage.getItem(USER_KEY) // set after magic link auth
  const used = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10)
  const isSignedIn = Boolean(userId)
  const limit = isSignedIn ? FREE_LIMIT : ANON_LIMIT

  return {
    allowed: used < limit,
    used,
    limit,
    needsSignup: !isSignedIn && used >= ANON_LIMIT,
    needsUpgrade: isSignedIn && used >= FREE_LIMIT,
  }
}

export function recordTopicUse(): void {
  if (typeof window === 'undefined') return
  const used = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10)
  localStorage.setItem(STORAGE_KEY, String(used + 1))
}

export function onSignupComplete(userId: string): void {
  localStorage.setItem(USER_KEY, userId)
  // Reset count — signed-in users get a fresh 10-topic allowance
  localStorage.setItem(STORAGE_KEY, '0')
}
```

- [ ] **Step 2: Commit**
```bash
git add lib/learn/gate.ts
git commit -m "feat(aicoachlab): freemium gate — 3 anon topics, 10 signed-in free"
```

---

## Task 8: Slide components

**Files:**
- Create: `components/slides/SlideConceptCard.tsx`
- Create: `components/slides/SlideCodeReveal.tsx`
- Create: `components/slides/SlideCarousel.tsx`
- Create: `components/slides/SlideQuiz.tsx`

- [ ] **Step 1: Install anime.js + rough-notation**
```bash
npm install animejs rough-notation
npm install --save-dev @types/animejs
```

- [ ] **Step 2: Create SlideConceptCard**

Create `components/slides/SlideConceptCard.tsx`:
```tsx
'use client'
import { motion } from 'framer-motion'
import type { SlideConceptSchema } from '@/lib/topics/schema'
import { z } from 'zod'

type Props = { slide: z.infer<typeof SlideConceptSchema>; active: boolean }

const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]

export default function SlideConceptCard({ slide, active }: Props) {
  if (!active) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
      style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '40px 48px', gap: 24,
      }}
    >
      {slide.icon && (
        <motion.span
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease }}
          style={{ fontSize: 56, lineHeight: 1 }}
        >
          {slide.icon}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease }}
        style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: '#f0f4ff',
          margin: 0,
        }}
      >
        {slide.heading}
      </motion.h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        style={{
          fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
          color: 'rgba(200,210,240,0.75)',
          lineHeight: 1.75,
          maxWidth: 640,
          margin: 0,
        }}
      >
        {slide.body}
      </motion.div>
    </motion.div>
  )
}
```

- [ ] **Step 3: Create SlideCodeReveal**

Create `components/slides/SlideCodeReveal.tsx`:
```tsx
'use client'
import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { annotate } from 'rough-notation'
import type { SlideCodeSchema } from '@/lib/topics/schema'
import { z } from 'zod'

type Props = { slide: z.infer<typeof SlideCodeSchema>; active: boolean }

const LANG_COLOR: Record<string, string> = {
  typescript: '#3178c6', javascript: '#f7df1e', python: '#3776ab',
  bash: '#4eaa25', sql: '#e38c00', default: '#7c3aed',
}

export default function SlideCodeReveal({ slide, active }: Props) {
  const [visibleLines, setVisibleLines] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const termRefs = useRef<(HTMLElement | null)[]>([])
  const annotationsApplied = useRef(false)

  useEffect(() => {
    if (!active) { setVisibleLines(0); annotationsApplied.current = false; return }
    setVisibleLines(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    slide.lines.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), 120 * i + 200))
    })
    return () => timers.forEach(clearTimeout)
  }, [active, slide.lines])

  // rough-notation highlights on key terms after lines revealed
  useEffect(() => {
    if (visibleLines < slide.lines.length || annotationsApplied.current) return
    if (!slide.keyTerms?.length) return
    annotationsApplied.current = true
    // Small delay to let DOM settle
    setTimeout(() => {
      if (!containerRef.current) return
      const codeEls = containerRef.current.querySelectorAll('code')
      codeEls.forEach(el => {
        const text = el.textContent ?? ''
        slide.keyTerms?.forEach(term => {
          if (text.includes(term)) {
            const ann = annotate(el as HTMLElement, {
              type: 'underline',
              color: '#a78bfa',
              strokeWidth: 2,
              padding: 1,
            })
            ann.show()
          }
        })
      })
    }, 100)
  }, [visibleLines, slide.lines.length, slide.keyTerms])

  const langColor = LANG_COLOR[slide.lang] ?? LANG_COLOR.default

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '28px 32px', gap: 16 }}
    >
      {/* Language pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: langColor, background: `${langColor}18`, border: `1px solid ${langColor}35`,
          padding: '3px 10px', borderRadius: 6,
        }}>
          {slide.lang}
        </span>
      </div>

      {/* Code block */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          background: 'rgba(10,12,20,0.95)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: 14,
          padding: '20px 24px',
          overflow: 'auto',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 'clamp(12px, 1.4vw, 15px)',
          lineHeight: 1.7,
        }}
      >
        {slide.lines.slice(0, visibleLines).map((line, i) => {
          const isHighlighted = slide.highlight?.includes(i)
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                display: 'flex',
                borderLeft: isHighlighted ? '2px solid #a78bfa' : '2px solid transparent',
                paddingLeft: 12,
                background: isHighlighted ? 'rgba(124,58,237,0.08)' : 'transparent',
                borderRadius: 4,
              }}
            >
              <span style={{ color: 'rgba(120,130,160,0.4)', minWidth: 28, userSelect: 'none', fontSize: '0.85em' }}>
                {i + 1}
              </span>
              <code style={{ color: '#e2e8f0', whiteSpace: 'pre' }}>{line}</code>
              {i === visibleLines - 1 && visibleLines < slide.lines.length && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  style={{ color: '#a78bfa', marginLeft: 2 }}
                >▊</motion.span>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 4: Create SlideQuiz**

Create `components/slides/SlideQuiz.tsx`:
```tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { SlideQuizSchema } from '@/lib/topics/schema'
import { z } from 'zod'

type Props = { slide: z.infer<typeof SlideQuizSchema>; active: boolean }

const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]
const OPTION_LETTERS = ['A', 'B', 'C', 'D']

export default function SlideQuiz({ slide, active }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null

  if (!active) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '32px 40px', gap: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
          padding: '3px 10px', borderRadius: 6,
        }}>Quick Check</span>
      </div>

      <h3 style={{ fontSize: 'clamp(1.1rem,2.5vw,1.5rem)', fontWeight: 700, color: '#f0f4ff', margin: 0, lineHeight: 1.35 }}>
        {slide.question}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {slide.options.map((opt, i) => {
          const isCorrect = i === slide.answer
          const isSelected = i === selected
          let bg = 'rgba(255,255,255,0.04)'
          let border = 'rgba(255,255,255,0.1)'
          let color = '#c4cde0'
          if (answered) {
            if (isCorrect) { bg = 'rgba(16,185,129,0.12)'; border = 'rgba(16,185,129,0.4)'; color = '#6ee7b7' }
            else if (isSelected) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.35)'; color = '#fca5a5' }
          } else if (isSelected) {
            bg = 'rgba(124,58,237,0.15)'; border = '#7c3aed'; color = '#c4b5fd'
          }
          return (
            <motion.button
              key={i}
              onClick={() => !answered && setSelected(i)}
              whileHover={answered ? {} : { scale: 1.01 }}
              whileTap={answered ? {} : { scale: 0.99 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 12, cursor: answered ? 'default' : 'pointer',
                background: bg, border: `1px solid ${border}`,
                transition: 'all 0.2s ease', textAlign: 'left',
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 11, fontWeight: 800,
                background: 'rgba(255,255,255,0.07)', color: color, flexShrink: 0,
              }}>
                {answered && isCorrect ? '✓' : answered && isSelected ? '✗' : OPTION_LETTERS[i]}
              </span>
              <span style={{ fontSize: 14, color, lineHeight: 1.4 }}>{opt}</span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '14px 18px', borderRadius: 12,
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
            }}
          >
            <p style={{ fontSize: 13, color: '#c4b5fd', lineHeight: 1.6, margin: 0 }}>
              💡 {slide.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```

- [ ] **Step 5: Create SlideCarousel**

Create `components/slides/SlideCarousel.tsx`:
```tsx
'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import type { SlideCarouselSchema } from '@/lib/topics/schema'
import { z } from 'zod'

type Props = { slide: z.infer<typeof SlideCarouselSchema>; active: boolean }

export default function SlideCarousel({ slide, active }: Props) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (!active) { setIdx(0); return }
    const t = setInterval(() => setIdx(i => (i + 1) % slide.items.length), 3000)
    return () => clearInterval(t)
  }, [active, slide.items.length])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '28px 32px', gap: 20 }}
    >
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollSnapType: 'x mandatory' }}>
        {slide.items.map((item, i) => (
          <motion.div
            key={i}
            onClick={() => setIdx(i)}
            animate={{
              background: i === idx ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
              borderColor: i === idx ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)',
            }}
            style={{
              minWidth: 200, flexShrink: 0, scrollSnapAlign: 'start',
              border: '1px solid', borderRadius: 12, padding: '18px 20px', cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: i === idx ? '#c4b5fd' : '#8892a4', marginBottom: 8 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(180,190,220,0.6)', lineHeight: 1.55 }}>
              {item.body}
            </div>
          </motion.div>
        ))}
      </div>
      {/* Dot indicators */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {slide.items.map((_, i) => (
          <motion.button
            key={i} onClick={() => setIdx(i)}
            animate={{ width: i === idx ? 20 : 6, background: i === idx ? '#7c3aed' : 'rgba(255,255,255,0.2)' }}
            style={{ height: 6, borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }}
          />
        ))}
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 6: Commit**
```bash
git add components/slides/
git commit -m "feat(aicoachlab): slide components — concept, code reveal, quiz, carousel"
```

---

## Task 9: Slide chatbot overlay

**Files:**
- Create: `components/slides/SlideChatOverlay.tsx`

- [ ] **Step 1: Create chatbot overlay**

Create `components/slides/SlideChatOverlay.tsx`:
```tsx
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Volume2, VolumeX } from 'lucide-react'
import type { Slide } from '@/lib/topics/schema'

interface Message { role: 'user' | 'assistant'; text: string }

interface Props {
  topicTitle: string
  lessonTitle: string
  currentSlide: Slide
  voiceEnabled: boolean
}

export default function SlideChatOverlay({ topicTitle, lessonTitle, currentSlide, voiceEnabled }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: `Ask me anything about ${topicTitle}. I can see exactly which slide you're on.` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [voiceOn, setVoiceOn] = useState(voiceEnabled)
  const bottomRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const slideContext = JSON.stringify(currentSlide, null, 2)
    const systemPrompt = `You are an AI tutor for AICoachLab. The user is studying "${topicTitle}" in lesson "${lessonTitle}".
Current slide context: ${slideContext}
Answer questions about this slide or the broader topic. Be concise (2-3 sentences max). If asked off-topic, redirect: "I'm your ${topicTitle} tutor — for other topics, try Google or ChatGPT!"`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.text })),
          systemPrompt,
        }),
      })
      const data = await res.json()
      const reply = data.message ?? 'Could not get a response.'
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])

      // Stream voice for assistant reply
      if (voiceOn && process.env.NEXT_PUBLIC_VOICE_ENABLED === 'true') {
        const voiceRes = await fetch('/api/voice/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: reply }),
        })
        if (voiceRes.ok && voiceRes.body) {
          const blob = await voiceRes.blob()
          const url = URL.createObjectURL(blob)
          if (audioRef.current) audioRef.current.src = url
          else { audioRef.current = new Audio(url) }
          audioRef.current.play().catch(() => {})
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Connection error — try again.' }])
    } finally {
      setLoading(false)
    }
  }, [messages, currentSlide, topicTitle, lessonTitle, voiceOn])

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 200,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(124,58,237,0.5)',
        }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}><X size={20} color="#fff" /></motion.span>
            : <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}><MessageSquare size={20} color="#fff" /></motion.span>
          }
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: 'fixed', bottom: 88, right: 24, zIndex: 200,
              width: 340, height: 480, display: 'flex', flexDirection: 'column',
              borderRadius: 18, background: 'rgba(7,8,15,0.97)',
              border: '1px solid rgba(124,58,237,0.25)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.7)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'grid', placeItems: 'center' }}>
                <MessageSquare size={13} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f4ff' }}>Ask your tutor</div>
                <div style={{ fontSize: 10, color: 'rgba(167,139,250,0.5)' }}>Knows this exact slide</div>
              </div>
              {voiceEnabled && (
                <button onClick={() => setVoiceOn(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  {voiceOn ? <Volume2 size={14} color="#a78bfa" /> : <VolumeX size={14} color="rgba(167,139,250,0.4)" />}
                </button>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '82%', padding: '8px 11px', borderRadius: m.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                    background: m.role === 'user' ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${m.role === 'user' ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.08)'}`,
                    fontSize: 12.5, color: '#f0f4ff', lineHeight: 1.5,
                  }}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 4, paddingLeft: 4 }}>
                  {[0,1,2].map(i => (
                    <motion.div key={i} animate={{ opacity: [0.3,1,0.3], y: [0,-3,0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                      style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c3aed' }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(124,58,237,0.1)', display: 'flex', gap: 6, flexShrink: 0 }}>
              <input
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
                placeholder="Ask about this slide..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 8, padding: '7px 10px', color: '#f0f4ff', fontSize: 12.5, outline: 'none', minWidth: 0 }}
              />
              <motion.button onClick={() => send(input)} whileTap={{ scale: 0.9 }} disabled={!input.trim() || loading}
                style={{ width: 32, height: 32, borderRadius: 8, background: input.trim() ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(124,58,237,0.07)', border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Send size={12} color={input.trim() ? '#fff' : 'rgba(124,58,237,0.3)'} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add components/slides/SlideChatOverlay.tsx
git commit -m "feat(aicoachlab): slide chatbot overlay with slide-context injection + voice streaming"
```

---

## Task 10: Main SlidePlayer component

**Files:**
- Create: `components/slides/SlidePlayer.tsx`

- [ ] **Step 1: Create SlidePlayer**

Create `components/slides/SlidePlayer.tsx`:
```tsx
'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'
import type { Lesson, Slide } from '@/lib/topics/schema'
import SlideConceptCard from './SlideConceptCard'
import SlideCodeReveal from './SlideCodeReveal'
import SlideCarousel from './SlideCarousel'
import SlideQuiz from './SlideQuiz'
import SlideChatOverlay from './SlideChatOverlay'

interface Props {
  lesson: Lesson
  topicTitle: string
  onComplete: () => void
}

export default function SlidePlayer({ lesson, topicTitle, onComplete }: Props) {
  const [idx, setIdx] = useState(0)
  const [voiceOn, setVoiceOn] = useState(true)
  const [audioReady, setAudioReady] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const slide: Slide = lesson.slides[idx]
  const total = lesson.slides.length
  const isLast = idx === total - 1

  // Play pre-generated audio for current slide
  useEffect(() => {
    const url = lesson.audioUrls?.[idx]
    if (!url || !voiceOn) return
    setAudioReady(false)
    const audio = new Audio(url)
    audioRef.current = audio
    audio.addEventListener('canplaythrough', () => setAudioReady(true))
    audio.play().catch(() => {})
    return () => { audio.pause(); audio.src = '' }
  }, [idx, lesson.audioUrls, voiceOn])

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => {
    if (isLast) { onComplete(); return }
    setIdx(i => i + 1)
  }, [isLast, onComplete])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  return (
    <div style={{
      minHeight: '100vh', background: '#07080f', display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', sans-serif", color: '#f0f4ff', position: 'relative',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px',
        borderBottom: '1px solid rgba(124,58,237,0.1)',
        background: 'rgba(7,8,15,0.9)', backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(180,190,220,0.6)' }}>
          {lesson.title}
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 5, flex: 1, justifyContent: 'center' }}>
          {lesson.slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setIdx(i)}
              animate={{ width: i === idx ? 20 : 6, background: i < idx ? '#7c3aed' : i === idx ? '#a78bfa' : 'rgba(255,255,255,0.15)' }}
              style={{ height: 6, borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.25s' }}
            />
          ))}
        </div>

        <button
          onClick={() => setVoiceOn(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.6 }}
        >
          {voiceOn ? <Volume2 size={16} color="#a78bfa" /> : <VolumeX size={16} color="rgba(167,139,250,0.4)" />}
        </button>

        <div style={{ fontSize: 12, color: 'rgba(180,190,220,0.4)', minWidth: 40, textAlign: 'right' }}>
          {idx + 1}/{total}
        </div>
      </div>

      {/* Slide area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: '65vh' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            style={{ position: 'absolute', inset: 0 }}
          >
            {slide.type === 'concept'  && <SlideConceptCard slide={slide} active />}
            {slide.type === 'code'     && <SlideCodeReveal  slide={slide} active />}
            {slide.type === 'carousel' && <SlideCarousel    slide={slide} active />}
            {slide.type === 'quiz'     && <SlideQuiz        slide={slide} active />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', borderTop: '1px solid rgba(124,58,237,0.1)',
      }}>
        <motion.button
          onClick={prev} disabled={idx === 0}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: idx === 0 ? 'rgba(180,190,220,0.25)' : 'rgba(180,190,220,0.7)',
            cursor: idx === 0 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600,
          }}
        >
          <ChevronLeft size={16} /> Back
        </motion.button>

        <motion.button
          onClick={next}
          whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(124,58,237,0.4)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 10,
            background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none',
            color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700,
          }}
        >
          {isLast ? '🎯 Take mock interview' : 'Next'} <ChevronRight size={16} />
        </motion.button>
      </div>

      {/* Chatbot overlay */}
      <SlideChatOverlay
        topicTitle={topicTitle}
        lessonTitle={lesson.title}
        currentSlide={slide}
        voiceEnabled={voiceOn}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add components/slides/SlidePlayer.tsx
git commit -m "feat(aicoachlab): SlidePlayer — animated deck, audio sync, keyboard nav, chatbot overlay"
```

---

## Task 11: Learn pages

**Files:**
- Create: `app/learn/page.tsx`
- Create: `app/learn/[slug]/page.tsx`
- Create: `app/learn/[slug]/[lesson]/page.tsx`

- [ ] **Step 1: Create /learn homepage**

Create `app/learn/page.tsx`:
```tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, TrendingUp, Zap, ArrowRight } from 'lucide-react'
import type { Topic } from '@/lib/topics/schema'
import { checkGate, recordTopicUse } from '@/lib/learn/gate'

const SEED_TOPICS = ['RAG & Retrieval', 'AI Agents', 'MCP Protocol', 'LangGraph', 'Video Generation API', 'System Design', 'TypeScript Advanced', 'React Patterns', 'Kubernetes', 'Stripe Integration']

const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]

export default function LearnPage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [trending, setTrending] = useState<Topic[]>([])
  const [searchResults, setSearchResults] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [gate, setGate] = useState(() => checkGate())

  useEffect(() => {
    fetch('/api/topics/trending').then(r => r.json()).then(d => setTrending(d.topics ?? []))
  }, [])

  useEffect(() => {
    if (input.length < 2) { setSearchResults([]); return }
    const t = setTimeout(() => {
      fetch(`/api/topics/search?q=${encodeURIComponent(input)}`).then(r => r.json()).then(d => setSearchResults(d.topics ?? []))
    }, 300)
    return () => clearTimeout(t)
  }, [input])

  async function handleGenerate() {
    if (!input.trim()) return
    const currentGate = checkGate()
    setGate(currentGate)
    if (!currentGate.allowed) return
    setLoading(true)
    try {
      const res = await fetch('/api/topics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: input }),
      })
      const data = await res.json()
      if (data.topic) {
        recordTopicUse()
        router.push(`/learn/${data.topic.slug}`)
      }
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07080f', fontFamily: "'Inter', sans-serif", color: '#f0f4ff' }}>
      {/* Fixed bg blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '80px 24px 48px' }}>
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}
          style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 20 }}>
            <Zap size={11} color="#a78bfa" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Zero to Hero</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 16px' }}>
            What do you want to{' '}
            <span style={{ background: 'linear-gradient(120deg,#7c3aed,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>master today?</span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(180,190,220,0.55)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto 32px' }}>
            Type any topic. AI generates a complete animated lesson with voice narration, code walkthroughs, and a mock interview — in seconds.
          </p>

          {/* Input */}
          <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
            <Search size={16} color="rgba(124,58,237,0.5)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder='e.g. "RAG with LlamaIndex", "Kubernetes networking", "fal.ai video generation"'
              style={{
                width: '100%', padding: '16px 48px 16px 44px', borderRadius: 14, fontSize: 14, color: '#f0f4ff',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.3)',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <motion.button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{
                position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                padding: '8px 16px', borderRadius: 10, border: 'none',
                background: input.trim() ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(124,58,237,0.15)',
                color: input.trim() ? '#fff' : 'rgba(167,139,250,0.4)', fontSize: 12, fontWeight: 700, cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {loading ? 'Building lesson…' : 'Generate'} {!loading && <ArrowRight size={12} />}
            </motion.button>
          </div>

          {/* Gate indicator */}
          {gate.used > 0 && !gate.needsSignup && (
            <p style={{ marginTop: 8, fontSize: 11, color: 'rgba(180,190,220,0.35)' }}>
              {gate.used}/{gate.limit} free topics used
            </p>
          )}
        </motion.div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(180,190,220,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Existing lessons</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {searchResults.map(t => (
                <motion.a key={t.slug} href={`/learn/${t.slug}`} whileHover={{ x: 4 }}
                  style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.15)', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff' }}>{t.title}</span>
                  <span style={{ fontSize: 11, color: 'rgba(167,139,250,0.5)' }}>{t.estimatedMins} min</span>
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <TrendingUp size={13} color="#a78bfa" />
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(180,190,220,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Trending topics</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(trending.length ? trending.map(t => t.title) : SEED_TOPICS).map((label, i) => (
              <motion.button key={i} onClick={() => { setInput(label); }}
                whileHover={{ scale: 1.04, background: 'rgba(124,58,237,0.15)' }}
                whileTap={{ scale: 0.97 }}
                style={{ padding: '8px 16px', borderRadius: 999, border: '1px solid rgba(124,58,237,0.2)', background: 'rgba(124,58,237,0.07)', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create /learn/[slug] page**

Create `app/learn/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import { getTopicBySlug } from '@/lib/topics/store'
import LearnTopicClient from './LearnTopicClient'

export default async function LearnTopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const topic = await getTopicBySlug(slug)
  if (!topic) notFound()
  return <LearnTopicClient topic={topic} />
}
```

Create `app/learn/[slug]/LearnTopicClient.tsx`:
```tsx
'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Clock, BookOpen, ArrowRight, CheckCircle } from 'lucide-react'
import type { Topic } from '@/lib/topics/schema'

const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]

export default function LearnTopicClient({ topic }: { topic: Topic }) {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: '#07080f', fontFamily: "'Inter', sans-serif", color: '#f0f4ff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 48px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {topic.tags.map(tag => (
              <span key={tag} style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}>{tag}</span>
            ))}
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 12px', lineHeight: 1.15 }}>{topic.title}</h1>
          <p style={{ fontSize: 15, color: 'rgba(180,190,220,0.6)', lineHeight: 1.65, marginBottom: 24 }}>{topic.description}</p>
          <div style={{ display: 'flex', gap: 20, marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(180,190,220,0.5)' }}>
              <Clock size={13} /> {topic.estimatedMins} min
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(180,190,220,0.5)' }}>
              <BookOpen size={13} /> {topic.lessons.length} lessons
            </div>
          </div>
        </motion.div>

        {/* Lesson list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {topic.lessons.map((lesson, i) => (
            <motion.button
              key={i}
              onClick={() => router.push(`/learn/${topic.slug}/${i}`)}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease }}
              whileHover={{ x: 6 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 14,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.15)',
                cursor: 'pointer', textAlign: 'left', width: '100%',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#a78bfa', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f4ff', marginBottom: 3 }}>{lesson.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(180,190,220,0.4)' }}>{lesson.slides.length} slides</div>
              </div>
              <ArrowRight size={15} color="rgba(124,58,237,0.5)" />
            </motion.button>
          ))}

          {/* Interview CTA */}
          <motion.button
            onClick={() => router.push(`/learn/${topic.slug}/interview`)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            style={{
              marginTop: 8, padding: '16px 20px', borderRadius: 14,
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', width: '100%',
            }}
          >
            <CheckCircle size={20} color="#10b981" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#6ee7b7' }}>Mock Interview — {topic.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(110,231,183,0.5)', marginTop: 2 }}>Test everything you've learned</div>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create /learn/[slug]/[lesson] page**

Create `app/learn/[slug]/[lesson]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import { getTopicBySlug } from '@/lib/topics/store'
import SlidePlayer from '@/components/slides/SlidePlayer'
import SlidePlayerWrapper from './SlidePlayerWrapper'

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lesson: string }> }) {
  const { slug, lesson } = await params
  const lessonIndex = parseInt(lesson, 10)
  if (isNaN(lessonIndex)) notFound()
  const topic = await getTopicBySlug(slug)
  if (!topic || !topic.lessons[lessonIndex]) notFound()
  return <SlidePlayerWrapper topic={topic} lessonIndex={lessonIndex} />
}
```

Create `app/learn/[slug]/[lesson]/SlidePlayerWrapper.tsx`:
```tsx
'use client'
import { useRouter } from 'next/navigation'
import SlidePlayer from '@/components/slides/SlidePlayer'
import type { Topic } from '@/lib/topics/schema'

export default function SlidePlayerWrapper({ topic, lessonIndex }: { topic: Topic; lessonIndex: number }) {
  const router = useRouter()
  const lesson = topic.lessons[lessonIndex]
  const nextLesson = topic.lessons[lessonIndex + 1]

  return (
    <SlidePlayer
      lesson={lesson}
      topicTitle={topic.title}
      onComplete={() => {
        if (nextLesson) router.push(`/learn/${topic.slug}/${lessonIndex + 1}`)
        else router.push(`/learn/${topic.slug}/interview`)
      }}
    />
  )
}
```

- [ ] **Step 4: Commit**
```bash
git add app/learn/
git commit -m "feat(aicoachlab): /learn pages — homepage, topic overview, slide player route"
```

---

## Task 12: Nav + landing page wiring

**Files:**
- Modify: `app/AICoachLabPage.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add Learn to nav in AICoachLabPage.tsx**

In `app/AICoachLabPage.tsx`, find the nav links section (around line 323–337) and add the Learn link:
```tsx
// Add after the existing tracks/ai-modeling nav links:
<a href="/learn" style={{ fontSize: 13, color: "rgba(167,139,250,0.85)", textDecoration: "none", fontWeight: 600 }}>Learn</a>
```

- [ ] **Step 2: Add Learn CTA to hero section**

In `app/AICoachLabPage.tsx`, find the CTA buttons section (around line 396–405) and add a Learn button:
```tsx
<motion.a href="/learn" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 10, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
  📚 Learn any topic
</motion.a>
```

- [ ] **Step 3: Build check**
```bash
cd /Users/sivaprakasam/projects/agents/aicoachlab && npm run build 2>&1 | tail -10
```

Fix any TypeScript errors before proceeding.

- [ ] **Step 4: Commit**
```bash
git add app/AICoachLabPage.tsx
git commit -m "feat(aicoachlab): wire Learn into nav and hero CTA"
```

---

## Task 13: Build, push, deploy

- [ ] **Step 1: Full build**
```bash
cd /Users/sivaprakasam/projects/agents/aicoachlab && npm run build
```
Expected: Build completes with no errors. Fix any TypeScript errors before proceeding.

- [ ] **Step 2: Stage and commit all remaining changes**
```bash
cd /Users/sivaprakasam/projects/agents/aicoachlab
git add -p  # review and stage all
git status  # verify nothing unexpected
```

- [ ] **Step 3: Push**
```bash
git push origin main
```

- [ ] **Step 4: Verify Vercel deployment**
```bash
# Wait ~90s for Vercel build, then check:
curl -s -o /dev/null -w "%{http_code}" https://aicoachlab.app/learn
# Expected: 200
curl -s -o /dev/null -w "%{http_code}" https://aicoachlab.app/api/topics/trending
# Expected: 200
```

- [ ] **Step 5: Update HANDOFF.md**

Update `/Users/sivaprakasam/projects/agents/HANDOFF.md`:
- Mark all AICoachLab v2 steps `[x]`
- Status → `COMPLETE`
- Add section: `## Files changed` listing all new files

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Dynamic topic generation (Tasks 3, 5)
- ✅ Supabase storage (Tasks 1, 2)
- ✅ ElevenLabs voice pre-gen + streaming (Tasks 4, 6)
- ✅ Animated slide components — concept, code, quiz, carousel (Task 8)
- ✅ Mid-lesson chatbot with slide context (Task 9)
- ✅ SlidePlayer with keyboard nav, audio sync (Task 10)
- ✅ /learn homepage + topic overview + lesson route (Task 11)
- ✅ Freemium gate 3 anon → 10 signed-in (Task 7)
- ✅ Nav + landing page wiring (Task 12)
- ✅ Build + deploy (Task 13)
- ⚠️  `/learn/[slug]/interview` page — links to existing `/api/interview` engine. The route itself redirects to existing `/interview` page with topic context via query param. No new page needed — existing interview page covers this.

**Type consistency:** All Zod types imported from `@/lib/topics/schema` consistently. `SlideConceptSchema`, `SlideCodeSchema` etc. used correctly in each component.

**Env vars needed before deploy:**
```
ELEVENLABS_API_KEY=         # Required for voice
BLOB_READ_WRITE_TOKEN=      # Required for audio storage
NEXT_PUBLIC_SUPABASE_URL=   # Already set
SUPABASE_SERVICE_ROLE_KEY=  # Needed for server-side writes
NEXT_PUBLIC_VOICE_ENABLED=true  # Enables voice in client
```
