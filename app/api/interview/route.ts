import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const GROQ_KEY = process.env.GROQ_API_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

const QUESTION_BANKS: Record<string, string[]> = {
  swe: [
    'Explain the difference between process and thread. When would you use one over the other?',
    'What is a deadlock and how do you prevent it?',
    'Explain Big O notation. What is the time complexity of binary search?',
    'What is the difference between stack and heap memory?',
    'Describe how a hash map works internally.',
    'What is a closure in JavaScript/Python? Give an example.',
    'Explain the CAP theorem.',
    'What is the difference between SQL and NoSQL databases?',
    'How does garbage collection work?',
    'Explain REST vs GraphQL. When would you choose each?',
    'What is a race condition? How do you debug one?',
    'Explain the SOLID principles.',
  ],
  pm: [
    'How would you prioritise features when you have more requests than capacity?',
    'Walk me through how you would define success metrics for a new feature.',
    'How do you decide when a product is ready to ship?',
    'Describe how you handle stakeholder disagreements.',
    'How would you research user needs for a market you\'re new to?',
    'Walk me through a product you use every day and how you\'d improve it.',
    'How do you measure product-market fit?',
    'Describe your framework for writing a PRD.',
    'How do you handle a situation where engineering says a feature is too complex?',
    'What\'s your approach to A/B testing?',
  ],
  data: [
    'Explain the bias-variance tradeoff.',
    'What is overfitting and how do you prevent it?',
    'When would you use a random forest over a logistic regression?',
    'Explain how gradient boosting works.',
    'What is the difference between precision and recall?',
    'How do you handle class imbalance in a dataset?',
    'What is cross-validation and why is it important?',
    'Explain the curse of dimensionality.',
    'What is a confusion matrix?',
    'How would you approach building a recommendation system from scratch?',
  ],
  system: [
    'Design a URL shortener like bit.ly.',
    'How would you design Twitter\'s feed ranking?',
    'Design a distributed cache.',
    'How would you build a real-time notification system?',
    'Design a rate limiter.',
    'How would you scale a database that is hitting its limits?',
    'Design a file storage system like Dropbox.',
    'How would you design a search autocomplete system?',
    'Explain how you would design a chat application.',
    'Design an API gateway.',
  ],
}

const ROLE_LABELS: Record<string, string> = {
  swe: 'Senior Software Engineer at a FAANG company',
  pm: 'Senior Product Manager at a top-tier tech company',
  data: 'Senior Data Scientist at a tech company',
  system: 'Principal Engineer conducting a system design interview',
}

async function callGroq(messages: { role: string; content: string }[], maxTokens = 200) {
  if (!GROQ_KEY) throw new Error('no groq key')
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: maxTokens, messages }),
  })
  const d = await res.json()
  return d.choices?.[0]?.message?.content?.trim() ?? ''
}

async function callAnthropic(messages: { role: string; content: string }[], maxTokens = 200) {
  if (!ANTHROPIC_KEY) throw new Error('no anthropic key')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: maxTokens, messages }),
  })
  const d = await res.json()
  return d.content?.[0]?.text?.trim() ?? ''
}

async function callAI(messages: { role: string; content: string }[], maxTokens = 200) {
  try { return await callGroq(messages, maxTokens) } catch {}
  try { return await callAnthropic(messages, maxTokens) } catch {}
  throw new Error('No AI provider available')
}

// POST /api/interview
// action: "question" | "grade"
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, role = 'swe', questionIndex = 0, answer = '', history = [] } = body

    if (action === 'question') {
      const bank = QUESTION_BANKS[role] ?? QUESTION_BANKS.swe
      const q = bank[questionIndex % bank.length]
      const roleLabel = ROLE_LABELS[role] ?? ROLE_LABELS.swe

      // Bot introduces itself and asks the question with personality
      const intro = questionIndex === 0
        ? `You are a ${roleLabel}. You are interviewing a candidate. Be direct, professional, slightly challenging. Introduce yourself in one sentence then ask this question naturally: "${q}". Total response: 3 sentences max.`
        : `You are a ${roleLabel}. The candidate just answered. Ask this next interview question naturally with brief transition: "${q}". 2 sentences max.`

      const botMessage = await callAI([{ role: 'user', content: intro }], 120)
      return NextResponse.json({ question: q, botMessage, questionIndex })
    }

    if (action === 'grade') {
      const bank = QUESTION_BANKS[role] ?? QUESTION_BANKS.swe
      const q = bank[questionIndex % bank.length]

      const gradePrompt = `You are an expert ${ROLE_LABELS[role] ?? 'interviewer'} grading a candidate answer.

Question: "${q}"
Candidate answer: "${answer}"

Respond with JSON only (no markdown, no explanation outside JSON):
{
  "score": <0-10>,
  "verdict": "<Excellent|Good|Partial|Poor>",
  "feedback": "<2 sentences: what was good, what was missing>",
  "botReply": "<1-2 sentences the interviewer would say out loud — encouraging but honest>",
  "keyPoint": "<the single most important thing they should know>"
}`

      const raw = await callAI([{ role: 'user', content: gradePrompt }], 250)

      let gradeData: Record<string, unknown>
      try {
        gradeData = JSON.parse(raw)
      } catch {
        gradeData = {
          score: 5,
          verdict: 'Partial',
          feedback: raw.slice(0, 200),
          botReply: 'Thanks for your answer. Let\'s move on.',
          keyPoint: 'Review the core concept.',
        }
      }

      return NextResponse.json(gradeData)
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
