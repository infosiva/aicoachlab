import { NextRequest, NextResponse } from 'next/server'
import { generateTopic } from '@/lib/topics/generate'
import { getTopicBySlug, createTopic, incrementRequestCount, markAudioReady } from '@/lib/topics/store'
import { generateAllAudio } from '@/lib/voice/elevenlabs'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { topic: userTopic } = await req.json()
    if (!userTopic?.trim()) {
      return NextResponse.json({ error: 'Topic required' }, { status: 400 })
    }

    const candidateSlug = userTopic.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60)

    const existing = await getTopicBySlug(candidateSlug)
    if (existing) {
      await incrementRequestCount(candidateSlug)
      return NextResponse.json({ topic: existing, cached: true })
    }

    const topic = await generateTopic(userTopic)

    const stored = await createTopic({
      slug: topic.slug,
      title: topic.title,
      description: topic.description,
      tags: topic.tags,
      estimatedMins: topic.estimatedMins,
      prerequisites: topic.prerequisites,
      lessons: topic.lessons,
    })

    // Fire-and-forget audio (no-op until ELEVENLABS_API_KEY set)
    if (process.env.ELEVENLABS_API_KEY && process.env.BLOB_READ_WRITE_TOKEN) {
      generateAllAudio(topic.slug, topic.lessons)
        .then(updatedLessons => markAudioReady(topic.slug, updatedLessons))
        .catch(console.error)
    }

    return NextResponse.json({ topic: stored, cached: false })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
