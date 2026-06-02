import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Free chain: Groq → NVIDIA NIM → Gemini. No paid APIs.
const GROQ_KEY   = process.env.GROQ_API_KEY
const NVIDIA_KEY = process.env.NVIDIA_API_KEY
const GEMINI_KEY = process.env.GEMINI_API_KEY

interface ChatMessage { role: 'user' | 'assistant' | 'system'; content: string; }

async function tryGroq(messages: ChatMessage[]): Promise<string | null> {
  if (!GROQ_KEY) return null
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages, max_tokens: 300, temperature: 0.7 }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? null
  } catch { return null }
}

async function tryNvidia(messages: ChatMessage[]): Promise<string | null> {
  if (!NVIDIA_KEY) return null
  try {
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${NVIDIA_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'meta/llama-3.1-8b-instruct', messages, max_tokens: 300, temperature: 0.7 }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? null
  } catch { return null }
}

async function tryGemini(messages: ChatMessage[]): Promise<string | null> {
  if (!GEMINI_KEY) return null
  try {
    const systemMsg = messages.find(m => m.role === 'system')
    const convo = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
    const body: Record<string, unknown> = { contents: convo }
    if (systemMsg) body.systemInstruction = { parts: [{ text: systemMsg.content }] }
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null
  } catch { return null }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json()
    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt || 'You are a helpful AI coach assistant.' },
      ...messages.slice(-10), // keep last 10 turns max
    ]

    const reply =
      await tryGroq(chatMessages) ||
      await tryNvidia(chatMessages) ||
      await tryGemini(chatMessages) ||
      "I'm having trouble connecting right now. Please try again in a moment."

    return NextResponse.json({ message: reply })
  } catch {
    return NextResponse.json({ message: 'Error processing request.' }, { status: 500 })
  }
}
