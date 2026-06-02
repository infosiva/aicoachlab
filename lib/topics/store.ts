import { createClient } from '@supabase/supabase-js'
import type { Topic, Lesson } from './schema'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars missing')
  return createClient(url, key)
}

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const sb = getClient()
  const { data, error } = await sb
    .from('topics')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error || !data) return null
  return dbRowToTopic(data)
}

export async function createTopic(topic: Omit<Topic, 'id' | 'requestCount' | 'audioReady'>): Promise<Topic> {
  const sb = getClient()
  const { data, error } = await sb
    .from('topics')
    .insert({
      slug: topic.slug,
      title: topic.title,
      description: topic.description,
      tags: topic.tags,
      estimated_mins: topic.estimatedMins,
      prerequisites: topic.prerequisites,
      lessons: topic.lessons,
      request_count: 1,
      audio_ready: false,
    })
    .select()
    .single()
  if (error || !data) throw new Error(`Failed to create topic: ${error?.message}`)
  return dbRowToTopic(data)
}

export async function incrementRequestCount(slug: string): Promise<void> {
  const sb = getClient()
  await sb.rpc('increment_topic_request_count', { p_slug: slug })
}

export async function markAudioReady(slug: string, lessons: Lesson[]): Promise<void> {
  const sb = getClient()
  await sb.from('topics').update({ audio_ready: true, lessons }).eq('slug', slug)
}

export async function getTrendingTopics(limit = 8): Promise<Topic[]> {
  const sb = getClient()
  const { data } = await sb
    .from('topics')
    .select('*')
    .order('request_count', { ascending: false })
    .limit(limit)
  return (data ?? []).map(dbRowToTopic)
}

export async function searchTopics(query: string): Promise<Topic[]> {
  const sb = getClient()
  const { data } = await sb
    .from('topics')
    .select('*')
    .or(`title.ilike.%${query}%,slug.ilike.%${query}%`)
    .limit(6)
  return (data ?? []).map(dbRowToTopic)
}

export async function saveProgress(
  userId: string,
  topicSlug: string,
  lessonIndex: number,
  slideIndex: number,
  completed = false,
) {
  const sb = getClient()
  await sb.from('user_topic_progress').upsert({
    user_id: userId,
    topic_slug: topicSlug,
    lesson_index: lessonIndex,
    slide_index: slideIndex,
    completed,
    updated_at: new Date().toISOString(),
  })
}

export async function getProgress(userId: string, topicSlug: string) {
  const sb = getClient()
  const { data } = await sb
    .from('user_topic_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_slug', topicSlug)
    .single()
  return data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbRowToTopic(row: any): Topic {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    tags: row.tags ?? [],
    estimatedMins: row.estimated_mins,
    prerequisites: row.prerequisites ?? [],
    requestCount: row.request_count,
    lessons: row.lessons ?? [],
    audioReady: row.audio_ready,
  }
}
