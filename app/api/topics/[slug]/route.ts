import { NextRequest, NextResponse } from 'next/server'
import { getTopicBySlug, incrementRequestCount } from '@/lib/topics/store'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const topic = await getTopicBySlug(slug)
  if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
  await incrementRequestCount(slug)
  return NextResponse.json({ topic })
}
