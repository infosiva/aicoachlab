/**
 * Voice shim for aicoachlab — delegates to shared voice chain.
 * Chain: ElevenLabs → VibeVoice-Realtime-0.5B (HF) → Google TTS
 * Env: ELEVENLABS_API_KEY, HF_TOKEN, GOOGLE_TTS_API_KEY
 */
import type { Lesson } from '@/lib/topics/schema'
import { tts, ttsStream } from '@/lib/voice'

export async function preGenerateSlideAudio(
  _topicSlug: string,
  _lessonIndex: number,
  _slideIndex: number,
  narrationText: string,
): Promise<string | null> {
  const result = await tts(narrationText)
  if (!result) return null
  return `data:audio/mpeg;base64,${result.audio.toString('base64')}`
}

export async function generateAllAudio(
  _topicSlug: string,
  lessons: Lesson[],
): Promise<Lesson[]> {
  return lessons
}

export async function streamVoiceReply(text: string): Promise<ReadableStream | null> {
  return ttsStream(text)
}
