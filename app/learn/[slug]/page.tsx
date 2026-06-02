import { notFound } from 'next/navigation'
import { getTopicBySlug } from '@/lib/topics/store'
import LearnTopicClient from './LearnTopicClient'

export default async function LearnTopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const topic = await getTopicBySlug(slug)
  if (!topic) notFound()
  return <LearnTopicClient topic={topic} />
}
