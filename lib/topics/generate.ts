import { TopicSchema, type Topic } from './schema'

// Free model fallback chain — no paid APIs ever
// 1. Groq llama-3.3-70b    — 6k req/day free, fastest
// 2. Gemini 2.0 Flash       — 1500 req/day free
// 3. NVIDIA NIM llama-3.1-70b — free tier on build.nvidia.com
const GROQ_KEY    = process.env.GROQ_API_KEY
const GEMINI_KEY  = process.env.GEMINI_API_KEY
const NVIDIA_KEY  = process.env.NVIDIA_API_KEY

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
- Slide types: concept, code, carousel, quiz (at least one of each per lesson)
- Code slides: real runnable code, actual library APIs, not pseudocode
- narrationText: 2-4 natural spoken sentences, conversational tutor tone
- quiz: exactly 4 options, one correct answer index, clear explanation
- keyTerms on code slides: 1-3 actual variable/function names worth highlighting
- Progressive difficulty: lesson 1 = foundations, lesson 2 = patterns, lesson 3 = advanced/production`

function buildPrompt(userTopic: string): string {
  return `Generate a complete zero-to-hero learning module for: "${userTopic}"

Return a JSON object:
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
        { "type": "code", "lang": "typescript", "lines": ["const x = 1", "console.log(x)"], "highlight": [0], "narrationText": "...", "keyTerms": ["x"] },
        { "type": "carousel", "items": [{"label": "A", "body": "..."}, {"label": "B", "body": "..."}, {"label": "C", "body": "..."}], "narrationText": "..." },
        { "type": "quiz", "question": "...", "options": ["A","B","C","D"], "answer": 0, "explanation": "..." }
      ],
      "audioUrls": []
    }
  ]
}`
}

function parseJSON(raw: string): unknown | null {
  const cleaned = raw.includes('```')
    ? raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    : raw.trim()
  try { return JSON.parse(cleaned) } catch { return null }
}

// Primary: Groq llama-3.3-70b — free, fast, 6k req/day
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

// Fallback 2: NVIDIA NIM llama-3.1-70b — free tier
async function generateWithNvidia(userTopic: string): Promise<string | null> {
  if (!NVIDIA_KEY) return null
  try {
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${NVIDIA_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        max_tokens: 8000,
        temperature: 0.3,
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

// Fallback 3: Gemini 2.0 Flash — free 15 req/min 1500/day
async function generateWithGemini(userTopic: string): Promise<string | null> {
  if (!GEMINI_KEY) return null
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: SYSTEM_PROMPT + '\n\n' + buildPrompt(userTopic) }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 8000 },
        }),
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null
  } catch { return null }
}

export async function generateTopic(userTopic: string): Promise<Topic> {
  const raw = await generateWithGroq(userTopic)
    || await generateWithNvidia(userTopic)
    || await generateWithGemini(userTopic)
  if (!raw) throw new Error('All AI providers failed — check GROQ_API_KEY, NVIDIA_API_KEY, or GEMINI_API_KEY')

  const parsed = parseJSON(raw)
  if (!parsed) throw new Error(`AI returned invalid JSON: ${raw.slice(0, 200)}`)

  const result = TopicSchema.safeParse(parsed)
  if (!result.success) {
    // One retry with Gemini if Groq output was malformed
    const retry = await generateWithGemini(userTopic)
    if (!retry) throw new Error(`Schema validation failed: ${result.error.message}`)
    const retryParsed = parseJSON(retry)
    const retryResult = TopicSchema.safeParse(retryParsed)
    if (!retryResult.success) throw new Error('Both providers returned invalid schema')
    return fixSlug(retryResult.data, userTopic)
  }

  return fixSlug(result.data, userTopic)
}

function fixSlug(topic: Topic, fallback: string): Topic {
  if (!topic.slug || topic.slug.includes(' ')) topic.slug = slugify(topic.title || fallback)
  return topic
}
