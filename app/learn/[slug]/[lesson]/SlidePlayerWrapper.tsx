'use client'
import { useRouter } from 'next/navigation'
import SlidePlayer from '@/components/slides/SlidePlayer'
import type { Topic } from '@/lib/topics/schema'

export default function SlidePlayerWrapper({ topic, lessonIndex }: { topic: Topic; lessonIndex: number }) {
  const router = useRouter()
  const lesson = topic.lessons[lessonIndex]
  const nextLesson = topic.lessons[lessonIndex + 1]

  return (
    <SlidePlayer
      lesson={lesson}
      topicTitle={topic.title}
      onComplete={() => {
        if (nextLesson) router.push(`/learn/${topic.slug}/${lessonIndex + 1}`)
        else router.push(`/learn/${topic.slug}/interview`)
      }}
    />
  )
}
