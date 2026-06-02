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
