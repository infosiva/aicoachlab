// Stub — wire ELEVENLABS_API_KEY + npm install elevenlabs when ready
import type { Lesson } from '@/lib/topics/schema'

export async function preGenerateSlideAudio(
  _topicSlug: string,
  _lessonIndex: number,
  _slideIndex: number,
  _narrationText: string,
): Promise<string | null> {
  return null
}

export async function generateAllAudio(
  _topicSlug: string,
  lessons: Lesson[],
): Promise<Lesson[]> {
  return lessons
}

export async function streamVoiceReply(_text: string): Promise<ReadableStream | null> {
  return null
}
