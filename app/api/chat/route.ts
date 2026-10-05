import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Free chain: Groq -> Gemini -> Cerebras. 60 req/hr/IP. Never 500.
const SYSTEM =
  "You are the AICoachLab assistant. Help with tech interview prep: mock interviews, system design, coding rounds, behavioural (STAR) answers, and the AICoachLab app. Keep replies under 120 words. If asked anything outside interview prep or AICoachLab, reply: \"I'm trained for AICoachLab. For that, try Google or ChatGPT!\""
const FALLBACK = "I can't reach the AI right now. Please try again in a moment."

type Msg = { role: 'user' | 'assistant' | 'system'; content: string }

const hits = new Map<string, { n: number; reset: number }>()
function limited(ip: string) {
  const now = Date.now()
  const e = hits.get(ip)
  if (!e || e.reset < now) { hits.set(ip, { n: 1, reset: now + 3_600_000 }); return false }
  return ++e.n > 60
}

async function openai(url: string, key: string | undefined, model: string, messages: Msg[]) {
  if (!key) return null
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, max_tokens: 300, temperature: 0.7 }),
      signal: AbortSignal.timeout(15_000),
    })
    if (!r.ok) return null
    return (await r.json()).choices?.[0]?.message?.content ?? null
  } catch { return null }
}

async function gemini(messages: Msg[]) {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  try {
    const contents = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }],
    }))
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`,
      {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: SYSTEM }] } }),
        signal: AbortSignal.timeout(15_000),
      },
    )
    if (!r.ok) return null
    return (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text ?? null
  } catch { return null }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (limited(ip)) {
    return NextResponse.json({ message: 'Chat limit reached (60 per hour). Please try again later.' }, { status: 429 })
  }
  try {
    const body = await req.json()
    const history: Msg[] = (Array.isArray(body?.messages) ? body.messages : [])
      .filter((m: Msg) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-10)
      .map((m: Msg) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    if (!history.length) return NextResponse.json({ message: 'Ask me something about interview prep.' })
    const messages: Msg[] = [{ role: 'system', content: SYSTEM }, ...history]

    const reply =
      (await openai('https://api.groq.com/openai/v1/chat/completions', process.env.GROQ_API_KEY, 'llama-3.3-70b-versatile', messages)) ||
      (await gemini(messages)) ||
      (await openai('https://api.cerebras.ai/v1/chat/completions', process.env.CEREBRAS_API_KEY, 'llama3.1-8b', messages)) ||
      FALLBACK
    return NextResponse.json({ message: reply })
  } catch {
    return NextResponse.json({ message: FALLBACK })
  }
}
