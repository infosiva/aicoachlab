import { neon } from '@neondatabase/serverless'
import type { Topic, Lesson } from './schema'

function sql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL missing')
  return neon(url)
}

export async function ensureTable(): Promise<void> {
  const db = sql()
  await db`
    create table if not exists acl_topics (
      slug            text primary key,
      title           text not null,
      description     text not null default '',
      tags            jsonb not null default '[]',
      estimated_mins  int not null default 20,
      prerequisites   jsonb not null default '[]',
      request_count   int not null default 1,
      lessons         jsonb not null default '[]',
      audio_ready     boolean not null default false,
      created_at      timestamptz not null default now()
    )
  `
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTopic(row: any): Topic {
  return {
    id: row.slug,
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

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  try {
    const db = sql()
    const rows = await db`select * from acl_topics where slug = ${slug} limit 1`
    if (!rows.length) return null
    return rowToTopic(rows[0])
  } catch { return null }
}

export async function createTopic(topic: Omit<Topic, 'id' | 'requestCount' | 'audioReady'>): Promise<Topic> {
  const db = sql()
  await ensureTable()
  const rows = await db`
    insert into acl_topics (slug, title, description, tags, estimated_mins, prerequisites, lessons)
    values (
      ${topic.slug}, ${topic.title}, ${topic.description},
      ${JSON.stringify(topic.tags)}, ${topic.estimatedMins},
      ${JSON.stringify(topic.prerequisites)}, ${JSON.stringify(topic.lessons)}
    )
    on conflict (slug) do update set request_count = acl_topics.request_count + 1
    returning *
  `
  return rowToTopic(rows[0])
}

export async function incrementRequestCount(slug: string): Promise<void> {
  try {
    const db = sql()
    await db`update acl_topics set request_count = request_count + 1 where slug = ${slug}`
  } catch { /* ignore */ }
}

export async function markAudioReady(slug: string, lessons: Lesson[]): Promise<void> {
  const db = sql()
  await db`update acl_topics set audio_ready = true, lessons = ${JSON.stringify(lessons)} where slug = ${slug}`
}

export async function getTrendingTopics(limit = 8): Promise<Topic[]> {
  try {
    const db = sql()
    await ensureTable()
    const rows = await db`select * from acl_topics order by request_count desc limit ${limit}`
    return rows.map(rowToTopic)
  } catch { return [] }
}

export async function searchTopics(query: string): Promise<Topic[]> {
  try {
    const db = sql()
    const q = `%${query}%`
    const rows = await db`
      select * from acl_topics
      where title ilike ${q} or slug ilike ${q}
      limit 6
    `
    return rows.map(rowToTopic)
  } catch { return [] }
}

export async function saveProgress(
  userId: string,
  topicSlug: string,
  lessonIndex: number,
  slideIndex: number,
  completed = false,
) {
  try {
    const db = sql()
    await db`
      create table if not exists acl_topic_progress (
        user_id      text not null,
        topic_slug   text not null,
        lesson_index int not null default 0,
        slide_index  int not null default 0,
        completed    boolean not null default false,
        updated_at   timestamptz not null default now(),
        primary key (user_id, topic_slug)
      )
    `
    await db`
      insert into acl_topic_progress (user_id, topic_slug, lesson_index, slide_index, completed, updated_at)
      values (${userId}, ${topicSlug}, ${lessonIndex}, ${slideIndex}, ${completed}, now())
      on conflict (user_id, topic_slug) do update set
        lesson_index = ${lessonIndex}, slide_index = ${slideIndex},
        completed = ${completed}, updated_at = now()
    `
  } catch { /* ignore */ }
}

export async function getProgress(userId: string, topicSlug: string) {
  try {
    const db = sql()
    const rows = await db`
      select * from acl_topic_progress where user_id = ${userId} and topic_slug = ${topicSlug} limit 1
    `
    return rows[0] ?? null
  } catch { return null }
}
