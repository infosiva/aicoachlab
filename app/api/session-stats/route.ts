import { NextResponse } from 'next/server'

let sessionCounts = { sessionsStarted: 0, questionsAnswered: 0, tracksCompleted: 0 }

export async function GET() { return NextResponse.json(sessionCounts) }

export async function POST(req: Request) {
  const { event } = await req.json()
  if (event === 'session_started') sessionCounts.sessionsStarted++
  if (event === 'question_answered') sessionCounts.questionsAnswered++
  if (event === 'track_completed') sessionCounts.tracksCompleted++
  return NextResponse.json({ ok: true })
}
