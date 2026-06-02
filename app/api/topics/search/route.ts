import { NextRequest, NextResponse } from 'next/server'
import { searchTopics } from '@/lib/topics/store'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (q.length < 2) return NextResponse.json({ topics: [] })
  try {
    const topics = await searchTopics(q)
    return NextResponse.json({ topics })
  } catch {
    return NextResponse.json({ topics: [] })
  }
}
