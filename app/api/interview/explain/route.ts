import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export async function POST(req: NextRequest) {
  const { concept } = await req.json()

  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a visual explainer. Given a CS/interview concept, return a JSON animation script.
Each step has: label (short title), narration (1-2 sentences spoken aloud), nodes (array of {id, label, x, y, color}), edges (array of {from, to, label}).
Return 4-6 steps that build progressively. Keep narration conversational, not textbook.
Node x,y are 0-1 fractions of canvas width/height. Use spread-out positions.
Colors: use hex codes like #8b5cf6, #10b981, #f97316, #3b82f6, #ef4444, #f59e0b.
Return ONLY valid JSON: { "title": "string", "steps": [ { "label": "string", "narration": "string", "nodes": [{"id":"string","label":"string","x":0.0,"y":0.0,"color":"#hex"}], "edges": [{"from":"string","to":"string","label":"string"}] } ] }`,
      },
      { role: 'user', content: `Explain: ${concept}` },
    ],
    max_tokens: 1500,
    temperature: 0.5,
    response_format: { type: 'json_object' },
  })

  try {
    const data = JSON.parse(res.choices[0].message.content || '{}')
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ title: concept, steps: [] }, { status: 200 })
  }
}
