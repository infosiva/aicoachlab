import { NextRequest, NextResponse } from 'next/server'
import { AI_LIMITER } from '@/lib/rateLimit'
import Groq from 'groq-sdk'

let _g: Groq | null = null
function groq() { if (!_g) _g = new Groq({ apiKey: process.env.GROQ_API_KEY! }); return _g }

export async function POST(req: NextRequest) {
  const limited = AI_LIMITER.check(req); if (limited) return limited
  const { action, role, personaPrompt, answer, question, conversationHistory } = await req.json()

  if (action === 'question') {
    const res = await groq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: `${personaPrompt}\n\nYou are interviewing for a ${role} role. Ask ONE opening interview question. Keep it under 40 words. No preamble — just the question.` },
        { role: 'user', content: 'Start the interview.' },
      ],
      max_tokens: 120,
      temperature: 0.8,
    })
    return NextResponse.json({ text: res.choices[0].message.content })
  }

  if (action === 'respond') {
    const messages = [
      { role: 'system' as const, content: `${personaPrompt}\n\nYou are interviewing for a ${role} role. React briefly to their answer (1 sentence acknowledgement), then ask ONE follow-up question. Total: under 60 words.` },
      ...(conversationHistory || []),
      { role: 'user' as const, content: answer },
    ]
    const res = await groq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 150,
      temperature: 0.85,
    })
    return NextResponse.json({ text: res.choices[0].message.content })
  }

  if (action === 'grade') {
    const res = await groq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert interview coach. Evaluate the candidate\'s performance in JSON format.' },
        {
          role: 'user',
          content: `Role: ${role}\n\nConversation:\n${conversationHistory?.map((m: any) => `${m.role}: ${m.content}`).join('\n')}\n\nCandidate answer: ${answer}\n\nReturn JSON: { "score": 0-100, "clarity": 0-10, "depth": 0-10, "confidence": 0-10, "top_strength": "string", "top_improvement": "string", "verdict": "string under 40 words" }`,
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })
    const data = JSON.parse(res.choices[0].message.content || '{}')
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
