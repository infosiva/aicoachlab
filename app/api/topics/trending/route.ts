import { NextResponse } from 'next/server'
import { getTrendingTopics } from '@/lib/topics/store'

export const runtime = 'nodejs'
export const revalidate = 300

export async function GET() {
  try {
    const topics = await getTrendingTopics(8)
    return NextResponse.json({ topics })
  } catch {
    return NextResponse.json({ topics: [] })
  }
}
