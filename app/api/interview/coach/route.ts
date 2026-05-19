import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export async function POST(req: NextRequest) {
  const { action, transcript, role, questionIndex, conversationHistory } = await req.json()

  if (action === 'interrupt') {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a silent interview coach watching a candidate answer.
Give ONE brief coaching tip (under 20 words) based on what they've said so far.
ONLY output the tip. No preamble. Be specific and actionable.
Examples:
- "Add a specific metric to this point"
- "You said 'um' 3 times — pause instead"
- "Explain the business impact of this decision"
- "Missing the Result from your STAR answer"`,
        },
        { role: 'user', content: `Question index: ${questionIndex}\n\nCandidate so far: "${transcript}"` },
      ],
      max_tokens: 60,
      temperature: 0.4,
    })
    return NextResponse.json({ tip: res.choices[0].message.content?.trim() })
  }

  if (action === 'question') {
    const QUESTION_BANKS: Record<string, string[]> = {
      swe: [
        "Tell me about a time you had to debug a hard production issue. What was your process?",
        "How would you design a URL shortener like bit.ly?",
        "Describe the most technically challenging project you've worked on.",
        "How do you decide between writing more tests vs shipping faster?",
        "Walk me through how you'd approach a 10x performance optimisation.",
      ],
      pm: [
        "How would you define the success metrics for a new onboarding flow?",
        "Walk me through how you'd prioritise a backlog of 50 feature requests.",
        "Describe a product decision you made that you later regretted.",
        "How do you handle engineering saying a feature is 'too hard'?",
        "What's your framework for deciding what NOT to build?",
      ],
      behavioural: [
        "Tell me about a time you disagreed with your manager. What happened?",
        "Describe a project where things went wrong. How did you handle it?",
        "Tell me about a time you had to learn something completely new very fast.",
        "How do you handle competing priorities and tight deadlines?",
        "Describe a time you had to influence without authority.",
      ],
    }
    const bank = QUESTION_BANKS[role] ?? QUESTION_BANKS.behavioural
    const q = bank[questionIndex % bank.length]
    return NextResponse.json({ question: q })
  }

  if (action === 'fullgrade') {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert interview coach. Grade this interview session in JSON.' },
        {
          role: 'user',
          content: `Role: ${role}\n\nFull session:\n${(conversationHistory || []).map((m: any) => `Q: ${m.question}\nA: ${m.answer}`).join('\n\n')}\n\nReturn JSON: { "overall": 0-100, "scores": { "clarity": 0-10, "structure": 0-10, "examples": 0-10, "impact": 0-10 }, "strengths": ["str1","str2"], "improvements": ["imp1","imp2"], "star_usage": 0-100, "summary": "string under 50 words" }`,
        },
      ],
      max_tokens: 400,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })
    return NextResponse.json(JSON.parse(res.choices[0].message.content || '{}'))
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
