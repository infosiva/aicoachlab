import { NextRequest, NextResponse } from 'next/server'
import { getExercise } from '@/lib/tracks/exercises'
import { AI_LIMITER } from '@/lib/rateLimit'

export const runtime = 'nodejs'

const GROQ_KEY = process.env.GROQ_API_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

async function callGroq(messages: { role: string; content: string }[], maxTokens = 400) {
  if (!GROQ_KEY) throw new Error('no groq key')
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: maxTokens, messages }),
  })
  const d = await res.json()
  return d.choices?.[0]?.message?.content?.trim() ?? ''
}

async function callAnthropic(messages: { role: string; content: string }[], maxTokens = 400) {
  if (!ANTHROPIC_KEY) throw new Error('no anthropic key')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: maxTokens, messages }),
  })
  const d = await res.json()
  return d.content?.[0]?.text?.trim() ?? ''
}

async function callAI(messages: { role: string; content: string }[], maxTokens = 400) {
  try { return await callGroq(messages, maxTokens) } catch {}
  try { return await callAnthropic(messages, maxTokens) } catch {}
  throw new Error('No AI provider available')
}

export async function POST(req: NextRequest) {
  const limited = AI_LIMITER.check(req); if (limited) return limited
  try {
    const { trackId, slug, answer } = await req.json()
    const exercise = getExercise(trackId, slug)
    if (!exercise) return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    if (!answer?.trim()) return NextResponse.json({ error: 'Answer is empty' }, { status: 400 })

    const criteria = exercise.scoringCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')

    const prompt = `You are an expert interviewer grading a candidate's written answer to an interview question.

QUESTION:
${exercise.question}

SCORING CRITERIA (what a strong answer must cover):
${criteria}

CANDIDATE ANSWER:
${answer}

Grade this answer. Return ONLY valid JSON with NO markdown fences:
{
  "score": <integer 0-100>,
  "verdict": "<Excellent|Good|Partial|Needs Work>",
  "criteriaScores": [
    { "criterion": "<criterion text>", "met": <true|false>, "note": "<1 sentence why>" }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "coachNote": "<2-3 sentences of specific, actionable coaching — what to add or change to score 90+>"
}`

    const raw = await callAI([{ role: 'user', content: prompt }], 500)

    let result: Record<string, unknown>
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      result = JSON.parse(cleaned)
    } catch {
      result = {
        score: 50,
        verdict: 'Partial',
        criteriaScores: exercise.scoringCriteria.map(c => ({ criterion: c, met: false, note: 'Could not parse detailed feedback.' })),
        strengths: ['Answer provided'],
        gaps: ['Could not parse detailed feedback'],
        coachNote: 'Review the model answer carefully and compare your structure against the scoring criteria.',
      }
    }

    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
