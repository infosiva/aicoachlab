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
        { "type": "carousel", "items": [{"label": "...", "body": "..."}, {"label": "...", "body": "..."}, {"label": "...", "body": "..."}], "narrationText": "..." },
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

  const jsonStr = raw.includes('```')
    ? raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    : raw.trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error(`AI returned invalid JSON: ${jsonStr.slice(0, 200)}`)
  }

  const result = TopicSchema.safeParse(parsed)
  if (!result.success) {
    const groqRaw = await generateWithGroq(userTopic)
    if (!groqRaw) throw new Error(`Zod validation failed: ${result.error.message}`)
    const groqParsed = JSON.parse(groqRaw)
    const groqResult = TopicSchema.safeParse(groqParsed)
    if (!groqResult.success) throw new Error('Both AI providers returned invalid schema')
    return groqResult.data
  }

  const topic = result.data
  if (!topic.slug || topic.slug.includes(' ')) {
    topic.slug = slugify(topic.title || userTopic)
  }

  return topic
}
