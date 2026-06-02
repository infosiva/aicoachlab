import { notFound } from 'next/navigation'
import { getTopicBySlug } from '@/lib/topics/store'
import SlidePlayerWrapper from './SlidePlayerWrapper'

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lesson: string }> }) {
  const { slug, lesson } = await params
  const lessonIndex = parseInt(lesson, 10)
  if (isNaN(lessonIndex)) notFound()
  const topic = await getTopicBySlug(slug)
  if (!topic || !topic.lessons[lessonIndex]) notFound()
  return <SlidePlayerWrapper topic={topic} lessonIndex={lessonIndex} />
}
