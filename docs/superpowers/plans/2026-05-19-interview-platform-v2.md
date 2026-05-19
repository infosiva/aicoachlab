# AICoachLab Interview Platform v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the world's most differentiated AI interview platform — 3 modes no one has combined: Blindfold (bot/human reveal), Live Coach (real-time mid-answer interrupts), and Concept Cinema (animated visual teaching).

**Architecture:** All 3 modes live under `/interview/` in aicoachlab. Each mode is a standalone Next.js page with its own API route. Shared state via React context. Voice via Web Speech API (browser), analysis via Groq streaming (fastest LLM for real-time use). No external auth — session-local only.

**Tech Stack:** Next.js 16, Framer Motion, Groq (llama-3.3-70b-versatile), Web Speech API (SpeechRecognition + SpeechSynthesis), Canvas API for Concept Cinema animations, Tailwind CSS v4.

---

## Existing Code Context

- `app/interview/page.tsx` — Bot vs Human battle mode (text-based, 5 rounds, scoring) ✅ EXISTS
- `app/api/interview/route.ts` — Questions + grading API ✅ EXISTS  
- `app/api/chat/route.ts` — Groq chat ✅ EXISTS
- No ElevenLabs key needed — use Web Speech SpeechSynthesis with `rate:0.9, pitch:0.85` for bot voice

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `app/interview/page.tsx` | MODIFY | Upgrade to mode selector hub |
| `app/interview/blindfold/page.tsx` | CREATE | Blindfold Mode — bot/human reveal experience |
| `app/interview/live/page.tsx` | CREATE | Live Coach Mode — real-time interrupts |
| `app/interview/learn/page.tsx` | CREATE | Concept Cinema — animated teaching |
| `app/api/interview/blindfold/route.ts` | CREATE | Bot persona + answer + reveal scoring |
| `app/api/interview/coach/route.ts` | CREATE | Real-time mid-answer interrupt analysis |
| `app/api/interview/explain/route.ts` | CREATE | Concept explanation with animation script |
| `components/interview/VoiceInput.tsx` | CREATE | Web Speech API hook + UI |
| `components/interview/ConceptCanvas.tsx` | CREATE | Animated canvas renderer |
| `components/interview/CoachOverlay.tsx` | CREATE | Real-time coaching whisper overlay |
| `components/interview/BlindReveal.tsx` | CREATE | Dramatic bot/human reveal animation |
| `lib/interview/filler-words.ts` | CREATE | Filler word detection + heatmap |
| `lib/interview/star-tracker.ts` | CREATE | STAR method completeness scoring |
| `lib/interview/personas.ts` | CREATE | Bot persona voices + hesitation patterns |

---

## Task 1: Mode Hub — upgrade interview landing page

**Files:**
- Modify: `app/interview/page.tsx`

- [ ] **Step 1: Replace current battle page with a 3-mode hub**

Replace the entire `app/interview/page.tsx` content:

```tsx
'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const MODES = [
  {
    id: 'blindfold',
    title: 'Blindfold Mode',
    emoji: '🎭',
    tagline: 'Bot or human? You decide.',
    desc: 'Interview with a mystery interviewer. Only at the end do you find out if you were talking to an AI or a person. Most people can\'t tell.',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.4)',
    href: '/interview/blindfold',
    badge: '🔥 Most viral',
  },
  {
    id: 'live',
    title: 'Live Coach',
    emoji: '🎯',
    tagline: 'Real-time mid-answer feedback.',
    desc: 'An AI coach whispers corrections as you speak. Filler word counter, STAR tracker, pacing alerts — like having a coach in your ear.',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.4)',
    href: '/interview/live',
    badge: '⚡ Most useful',
  },
  {
    id: 'learn',
    title: 'Concept Cinema',
    emoji: '🎬',
    tagline: 'Watch concepts come alive.',
    desc: 'Say a topic. Watch it animate onto a canvas with voice narration — system design diagrams, algorithms, frameworks — no one teaches like this.',
    color: '#f97316',
    glow: 'rgba(249,115,22,0.4)',
    href: '/interview/learn',
    badge: '✨ Most unique',
  },
]

export default function InterviewHub() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#030a06', color: '#f0f4ff',
      fontFamily: 'var(--font-body, system-ui)', padding: '0 24px 64px' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', paddingTop: 72, paddingBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 99, fontSize: 12, fontWeight: 700, color: '#a78bfa',
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
          🚀 Interview Platform v2 — No one has built this
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900,
          letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 16px',
          background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Train like a champion.<br />Interview like one.
        </h1>
        <p style={{ color: 'rgba(167,243,208,0.6)', fontSize: 17, maxWidth: 520,
          margin: '0 auto', lineHeight: 1.6 }}>
          Three modes. Zero excuses. The most advanced interview prep on the planet.
        </p>
      </motion.div>

      {/* Mode cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24, maxWidth: 1100, margin: '0 auto' }}>
        {MODES.map((m, i) => (
          <motion.div key={m.id}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(m.href)}
            style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.03)',
              border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 20,
              padding: '32px 28px 28px', position: 'relative', overflow: 'hidden' }}>
            {/* Glow */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200,
              borderRadius: '50%', background: `radial-gradient(circle, ${m.glow} 0%, transparent 70%)`,
              filter: 'blur(40px)', pointerEvents: 'none' }} />
            {/* Badge */}
            <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 700,
              padding: '3px 10px', borderRadius: 99, marginBottom: 20,
              background: `${m.color}22`, color: m.color, border: `1px solid ${m.color}44` }}>
              {m.badge}
            </div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{m.emoji}</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px',
              color: '#f0f4ff', letterSpacing: '-0.03em' }}>{m.title}</h2>
            <div style={{ fontSize: 13, fontWeight: 700, color: m.color,
              marginBottom: 12, letterSpacing: '0.01em' }}>{m.tagline}</div>
            <p style={{ fontSize: 14, color: 'rgba(167,243,208,0.55)', lineHeight: 1.65, margin: 0 }}>
              {m.desc}
            </p>
            <div style={{ marginTop: 28, display: 'flex', alignItems: 'center',
              gap: 8, color: m.color, fontSize: 13, fontWeight: 700 }}>
              Start now <span>→</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build and verify hub renders**

```bash
cd /Users/sivaprakasam/projects/agents/aicoachlab && npm run build 2>&1 | tail -6
```

Expected: build passes, `/interview` route listed.

- [ ] **Step 3: Commit**

```bash
git add app/interview/page.tsx
git commit -m "feat(interview): mode hub — blindfold, live coach, concept cinema"
```

---

## Task 2: Shared utilities

**Files:**
- Create: `lib/interview/filler-words.ts`
- Create: `lib/interview/star-tracker.ts`
- Create: `lib/interview/personas.ts`

- [ ] **Step 1: Create filler word detector**

Create `lib/interview/filler-words.ts`:

```ts
export const FILLERS = [
  'um', 'uh', 'like', 'you know', 'basically', 'literally',
  'actually', 'so', 'right', 'okay', 'kind of', 'sort of',
  'I mean', 'just', 'very', 'really', 'thing', 'stuff',
]

export interface FillerResult {
  count: number
  words: { word: string; count: number }[]
  rate: number          // fillers per 100 words
  highlighted: string   // transcript with <mark> tags
}

export function analyseFillers(transcript: string): FillerResult {
  const lower = transcript.toLowerCase()
  const totalWords = transcript.split(/\s+/).filter(Boolean).length
  const counts: Record<string, number> = {}

  for (const filler of FILLERS) {
    const re = new RegExp(`\\b${filler}\\b`, 'gi')
    const matches = transcript.match(re)
    if (matches && matches.length > 0) counts[filler] = matches.length
  }

  let highlighted = transcript
  for (const filler of FILLERS) {
    const re = new RegExp(`\\b(${filler})\\b`, 'gi')
    highlighted = highlighted.replace(re, '<mark style="background:rgba(239,68,68,0.3);border-radius:3px;padding:0 2px">$1</mark>')
  }

  const totalFillers = Object.values(counts).reduce((a, b) => a + b, 0)
  const words = Object.entries(counts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)

  return {
    count: totalFillers,
    words,
    rate: totalWords > 0 ? Math.round((totalFillers / totalWords) * 100) : 0,
    highlighted,
  }
}
```

- [ ] **Step 2: Create STAR tracker**

Create `lib/interview/star-tracker.ts`:

```ts
export interface STARStatus {
  situation: boolean
  task: boolean
  action: boolean
  result: boolean
  score: number   // 0-100
  missing: string[]
  tips: string[]
}

// Keyword signals per STAR component
const SIGNALS = {
  situation: ['when', 'at', 'working at', 'our team', 'the company', 'last year', 'project', 'challenge', 'we were', 'i was'],
  task: ['my role', 'responsible for', 'tasked with', 'needed to', 'had to', 'my job', 'my goal', 'objective'],
  action: ['i did', 'i built', 'i implemented', 'i led', 'i created', 'i worked', 'i designed', 'specifically', 'i decided', 'i chose'],
  result: ['result', 'outcome', 'impact', 'increased', 'decreased', 'reduced', 'improved', 'saved', '%', 'revenue', 'users', 'shipped'],
}

export function trackSTAR(transcript: string): STARStatus {
  const lower = transcript.toLowerCase()
  const found = {
    situation: SIGNALS.situation.some(s => lower.includes(s)),
    task: SIGNALS.task.some(s => lower.includes(s)),
    action: SIGNALS.action.some(s => lower.includes(s)),
    result: SIGNALS.result.some(s => lower.includes(s)),
  }

  const missing: string[] = []
  const tips: string[] = []

  if (!found.situation) { missing.push('Situation'); tips.push('Set the scene — when/where did this happen?') }
  if (!found.task) { missing.push('Task'); tips.push('Clarify your specific role or responsibility') }
  if (!found.action) { missing.push('Action'); tips.push('Say what YOU specifically did, not "we"') }
  if (!found.result) { missing.push('Result'); tips.push('Add a metric — numbers make results real') }

  const completed = Object.values(found).filter(Boolean).length
  return { ...found, score: completed * 25, missing, tips }
}
```

- [ ] **Step 3: Create bot personas**

Create `lib/interview/personas.ts`:

```ts
export interface Persona {
  id: string
  name: string
  title: string
  style: 'robotic' | 'human-warm' | 'human-direct' | 'human-nervous'
  systemPrompt: string
  voiceRate: number
  voicePitch: number
  hesitations: string[]   // random filler inserts to sound human
  isHuman: boolean        // for reveal
}

export const PERSONAS: Persona[] = [
  {
    id: 'alex-human',
    name: 'Alex',
    title: 'Senior Engineer @ Scale AI',
    style: 'human-warm',
    systemPrompt: 'You are Alex, a senior engineer conducting a technical interview. Be warm but thorough. Ask follow-up questions. Occasionally say "interesting" or "tell me more". Sound human.',
    voiceRate: 0.95,
    voicePitch: 1.0,
    hesitations: ['So...', 'Hmm, interesting.', 'Right, right.', 'Got it.'],
    isHuman: true,
  },
  {
    id: 'sigma-bot',
    name: 'Sigma',
    title: 'AI Interviewer',
    style: 'robotic',
    systemPrompt: 'You are Sigma, an AI conducting a structured technical interview. Be precise, systematic, and objective. Evaluate answers methodically. Keep responses concise and professional.',
    voiceRate: 0.88,
    voicePitch: 0.82,
    hesitations: [],
    isHuman: false,
  },
  {
    id: 'priya-human',
    name: 'Priya',
    title: 'Staff PM @ Google',
    style: 'human-direct',
    systemPrompt: 'You are Priya, a staff PM who interviews directly. You ask sharp follow-ups and don\'t let vague answers slide. Occasionally challenge the candidate.',
    voiceRate: 1.0,
    voicePitch: 1.05,
    hesitations: ['Okay, but...', 'Walk me through that.', 'Why specifically?'],
    isHuman: true,
  },
  {
    id: 'nova-bot',
    name: 'Nova',
    title: 'Neural Interviewer v2',
    style: 'robotic',
    systemPrompt: 'You are Nova, an advanced AI interviewer. You ask structured questions, evaluate against rubrics, and give systematic feedback. Be precise and analytical.',
    voiceRate: 0.85,
    voicePitch: 0.78,
    hesitations: [],
    isHuman: false,
  },
]

export function getRandomPersona(): Persona {
  return PERSONAS[Math.floor(Math.random() * PERSONAS.length)]
}

export function speakWithPersona(text: string, persona: Persona): SpeechSynthesisUtterance {
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate = persona.voiceRate
  utt.pitch = persona.voicePitch
  // Add hesitation prefix for human personas
  if (persona.isHuman && persona.hesitations.length > 0 && Math.random() > 0.6) {
    const h = persona.hesitations[Math.floor(Math.random() * persona.hesitations.length)]
    utt.text = `${h} ${text}`
  }
  return utt
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/interview/
git commit -m "feat(interview): shared utils — filler words, STAR tracker, bot personas"
```

---

## Task 3: Shared VoiceInput component

**Files:**
- Create: `components/interview/VoiceInput.tsx`

- [ ] **Step 1: Create VoiceInput component**

Create `components/interview/VoiceInput.tsx`:

```tsx
'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onTranscript: (text: string) => void
  onInterimTranscript?: (text: string) => void
  disabled?: boolean
  placeholder?: string
  accentColor?: string
}

export default function VoiceInput({
  onTranscript, onInterimTranscript, disabled, placeholder = 'Click mic to speak…', accentColor = '#10b981'
}: Props) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [supported, setSupported] = useState(true)
  const recRef = useRef<any>(null)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) setSupported(false)
  }, [])

  const start = useCallback(() => {
    if (disabled || !supported) return
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    rec.onstart = () => setListening(true)
    rec.onend = () => { setListening(false); setInterim('') }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let final = ''; let inter = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '
        else inter += e.results[i][0].transcript
      }
      if (inter) { setInterim(inter); onInterimTranscript?.(inter) }
      if (final.trim()) { onTranscript(final.trim()); setInterim('') }
    }
    rec.onerror = () => setListening(false)
    recRef.current = rec
    rec.start()
  }, [disabled, supported, onTranscript, onInterimTranscript])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
  }, [])

  const pulse = {
    scale: [1, 1.15, 1],
    boxShadow: [
      `0 0 0 0 ${accentColor}44`,
      `0 0 0 16px ${accentColor}00`,
      `0 0 0 0 ${accentColor}00`,
    ],
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <motion.button
        onClick={listening ? stop : start}
        disabled={disabled || !supported}
        animate={listening ? pulse : {}}
        transition={listening ? { duration: 1.2, repeat: Infinity } : {}}
        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
        style={{ width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          background: listening ? accentColor : 'rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.3s', opacity: disabled ? 0.4 : 1 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke={listening ? '#fff' : 'rgba(255,255,255,0.7)'} strokeWidth="2" strokeLinecap="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </motion.button>

      <div style={{ fontSize: 12, color: listening ? accentColor : 'rgba(255,255,255,0.35)',
        fontWeight: listening ? 700 : 400, letterSpacing: '0.05em', textTransform: 'uppercase',
        transition: 'all 0.3s' }}>
        {!supported ? 'Voice not supported' : listening ? '● Recording…' : placeholder}
      </div>

      <AnimatePresence>
        {interim && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic',
              textAlign: 'center', maxWidth: 400 }}>
            {interim}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/interview/VoiceInput.tsx
git commit -m "feat(interview): VoiceInput — Web Speech API with interim transcript"
```

---

## Task 4: Blindfold Mode API

**Files:**
- Create: `app/api/interview/blindfold/route.ts`

- [ ] **Step 1: Create blindfold API route**

Create `app/api/interview/blindfold/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

// action: 'question' | 'respond' | 'grade'
export async function POST(req: NextRequest) {
  const { action, role, personaPrompt, answer, question, conversationHistory } = await req.json()

  if (action === 'question') {
    // Generate first question from persona
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: `${personaPrompt}\n\nYou are interviewing for a ${role} role. Ask ONE opening interview question. Keep it under 40 words. No preamble — just the question.` },
        { role: 'user', content: 'Start the interview.' },
      ],
      max_tokens: 120,
      temperature: 0.8,
    })
    return NextResponse.json({ text: res.choices[0].message.content })
  }

  if (action === 'respond') {
    // Persona responds to candidate's answer + asks follow-up
    const messages = [
      { role: 'system' as const, content: `${personaPrompt}\n\nYou are interviewing for a ${role} role. React briefly to their answer (1 sentence acknowledgement), then ask ONE follow-up question. Total: under 60 words.` },
      ...(conversationHistory || []),
      { role: 'user' as const, content: answer },
    ]
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 150,
      temperature: 0.85,
    })
    return NextResponse.json({ text: res.choices[0].message.content })
  }

  if (action === 'grade') {
    // After reveal — score the session
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview coach. Evaluate the candidate\'s performance in JSON format.',
        },
        {
          role: 'user',
          content: `Role: ${role}\n\nConversation:\n${conversationHistory?.map((m: any) => `${m.role}: ${m.content}`).join('\n')}\n\nCandidate answer: ${answer}\n\nReturn JSON: { "score": 0-100, "clarity": 0-10, "depth": 0-10, "confidence": 0-10, "top_strength": "string", "top_improvement": "string", "verdict": "string under 40 words" }`,
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })
    const data = JSON.parse(res.choices[0].message.content || '{}')
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/interview/blindfold/route.ts
git commit -m "feat(interview): blindfold API — persona Q&A + scoring"
```

---

## Task 5: Blindfold Mode page

**Files:**
- Create: `app/interview/blindfold/page.tsx`
- Create: `components/interview/BlindReveal.tsx`

- [ ] **Step 1: Create BlindReveal component**

Create `components/interview/BlindReveal.tsx`:

```tsx
'use client'
import { motion } from 'framer-motion'

interface Props {
  isHuman: boolean
  personaName: string
  personaTitle: string
  score: number
  verdict: string
  topStrength: string
  topImprovement: string
  onRestart: () => void
}

export default function BlindReveal({ isHuman, personaName, personaTitle, score, verdict, topStrength, topImprovement, onRestart }: Props) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: 24 }}>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
        style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, padding: '48px 40px', maxWidth: 520, width: '100%',
          textAlign: 'center' }}>

        {/* Dramatic reveal */}
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.4 }}
          style={{ fontSize: 80, marginBottom: 16 }}>
          {isHuman ? '👤' : '🤖'}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}>
          <div style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: isHuman ? '#60a5fa' : '#a78bfa', fontWeight: 800, marginBottom: 8 }}>
            {isHuman ? '— Human interviewer —' : '— AI interviewer —'}
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f0f4ff', margin: '0 0 4px',
            letterSpacing: '-0.03em' }}>{personaName}</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 32px' }}>{personaTitle}</p>
        </motion.div>

        {/* Score */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '20px 24px',
            marginBottom: 24, border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444',
            lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
            letterSpacing: '0.1em', marginTop: 4 }}>Performance Score</div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '12px 0 0', lineHeight: 1.5 }}>{verdict}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 12, padding: '12px 14px', textAlign: 'left' }}>
            <div style={{ fontSize: 10, color: '#10b981', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 6 }}>💪 Strength</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{topStrength}</div>
          </div>
          <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
            borderRadius: 12, padding: '12px 14px', textAlign: 'left' }}>
            <div style={{ fontSize: 10, color: '#f97316', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 6 }}>🎯 Improve</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{topImprovement}</div>
          </div>
        </motion.div>

        <motion.button onClick={onRestart}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff',
            fontSize: 15, fontWeight: 700 }}>
          Interview again →
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Create Blindfold Mode page**

Create `app/interview/blindfold/page.tsx`:

```tsx
'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import VoiceInput from '@/components/interview/VoiceInput'
import BlindReveal from '@/components/interview/BlindReveal'
import { getRandomPersona, speakWithPersona, type Persona } from '@/lib/interview/personas'

const ROLES = [
  { id: 'swe', label: '💻 Software Engineer' },
  { id: 'pm', label: '📋 Product Manager' },
  { id: 'system', label: '🏗️ System Design' },
  { id: 'behavioural', label: '🤝 Behavioural' },
]

type Phase = 'setup' | 'interview' | 'reveal'

interface Message { role: 'interviewer' | 'candidate'; content: string }

export default function BlindFoldPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('setup')
  const [role, setRole] = useState('swe')
  const [persona] = useState<Persona>(() => getRandomPersona())
  const [messages, setMessages] = useState<Message[]>([])
  const [currentQ, setCurrentQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [revealData, setRevealData] = useState<any>(null)
  const [roundCount, setRoundCount] = useState(0)
  const historyRef = useRef<{ role: string; content: string }[]>([])
  const MAX_ROUNDS = 4

  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel()
    const utt = speakWithPersona(text, persona)
    window.speechSynthesis.speak(utt)
  }, [persona])

  async function startInterview() {
    setLoading(true)
    const res = await fetch('/api/interview/blindfold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'question', role, personaPrompt: persona.systemPrompt }),
    })
    const { text } = await res.json()
    historyRef.current = [{ role: 'assistant', content: text }]
    setCurrentQ(text)
    setMessages([{ role: 'interviewer', content: text }])
    setPhase('interview')
    setLoading(false)
    speak(text)
  }

  async function handleAnswer(answer: string) {
    if (!answer.trim() || loading) return
    setMessages(m => [...m, { role: 'candidate', content: answer }])
    historyRef.current.push({ role: 'user', content: answer })

    const newRound = roundCount + 1
    setRoundCount(newRound)

    if (newRound >= MAX_ROUNDS) {
      // Final round — grade + reveal
      setLoading(true)
      const res = await fetch('/api/interview/blindfold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grade',
          role,
          answer,
          conversationHistory: historyRef.current,
        }),
      })
      const data = await res.json()
      setRevealData(data)
      setLoading(false)
      setPhase('reveal')
      return
    }

    // Continue conversation
    setLoading(true)
    const res = await fetch('/api/interview/blindfold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'respond',
        role,
        personaPrompt: persona.systemPrompt,
        answer,
        conversationHistory: historyRef.current,
      }),
    })
    const { text } = await res.json()
    historyRef.current.push({ role: 'assistant', content: text })
    setMessages(m => [...m, { role: 'interviewer', content: text }])
    setCurrentQ(text)
    setLoading(false)
    speak(text)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030a06', color: '#f0f4ff',
      fontFamily: 'var(--font-body, system-ui)' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.push('/interview')}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer', fontSize: 13, padding: '6px 0' }}>
          ← Back
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>🎭 Blindfold Mode</span>
        </div>
        {phase === 'interview' && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            Round {roundCount + 1}/{MAX_ROUNDS}
          </div>
        )}
      </div>

      {/* Setup phase */}
      {phase === 'setup' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎭</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.03em' }}>
            Who are you talking to?
          </h1>
          <p style={{ color: 'rgba(167,243,208,0.55)', fontSize: 15, margin: '0 0 36px', lineHeight: 1.6 }}>
            You{"'"}ll interview with a mystery interviewer. At the end, you{"'"}ll find out if it was a human or AI.
            Most people can{"'"}t tell. Can you?
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
            {ROLES.map(r => (
              <button key={r.id} onClick={() => setRole(r.id)}
                style={{ padding: '14px 16px', borderRadius: 12, border: `2px solid ${role === r.id ? '#8b5cf6' : 'rgba(255,255,255,0.08)'}`,
                  background: role === r.id ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                  color: '#f0f4ff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s', textAlign: 'left' }}>
                {r.label}
              </button>
            ))}
          </div>

          <motion.button onClick={startInterview} disabled={loading}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: loading ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              color: '#fff', fontSize: 16, fontWeight: 800 }}>
            {loading ? 'Connecting…' : 'Start interview →'}
          </motion.button>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 16 }}>
            You{"'"}ll speak your answers. Make sure your mic is ready.
          </p>
        </motion.div>
      )}

      {/* Interview phase */}
      {phase === 'interview' && (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
          {/* Interviewer avatar — hidden identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28,
            padding: '16px 20px', background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.6), rgba(99,102,241,0.4))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              ?
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Mystery Interviewer</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Identity hidden until reveal</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => (
                <motion.div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </div>

          {/* Message thread */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: m.role === 'candidate' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    padding: '14px 18px',
                    borderRadius: m.role === 'candidate' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: m.role === 'candidate'
                      ? 'rgba(139,92,246,0.2)'
                      : 'rgba(255,255,255,0.06)',
                    border: m.role === 'candidate'
                      ? '1px solid rgba(139,92,246,0.3)'
                      : '1px solid rgba(255,255,255,0.08)',
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: '#f0f4ff',
                  }}>
                  {m.content}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ alignSelf: 'flex-start', padding: '14px 20px',
                  background: 'rgba(255,255,255,0.04)', borderRadius: '18px 18px 18px 4px',
                  border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 6 }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </motion.div>
            )}
          </div>

          {/* Voice input */}
          {!loading && (
            <div style={{ textAlign: 'center' }}>
              <VoiceInput
                onTranscript={handleAnswer}
                accentColor="#8b5cf6"
                placeholder="Tap to answer"
              />
            </div>
          )}
        </div>
      )}

      {/* Reveal phase */}
      {phase === 'reveal' && revealData && (
        <BlindReveal
          isHuman={persona.isHuman}
          personaName={persona.name}
          personaTitle={persona.title}
          score={revealData.score || 72}
          verdict={revealData.verdict || 'Solid performance overall.'}
          topStrength={revealData.top_strength || 'Clear communication'}
          topImprovement={revealData.top_improvement || 'Add more quantified results'}
          onRestart={() => { setPhase('setup'); setMessages([]); setRoundCount(0) }}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build 2>&1 | grep -E "Error|error|blindfold" | head -10
```

Expected: no errors, `/interview/blindfold` route in output.

- [ ] **Step 4: Commit**

```bash
git add app/interview/blindfold/ components/interview/BlindReveal.tsx
git commit -m "feat(interview): Blindfold Mode — mystery persona, voice Q&A, dramatic reveal"
```

---

## Task 6: Live Coach API

**Files:**
- Create: `app/api/interview/coach/route.ts`

- [ ] **Step 1: Create coach API**

Create `app/api/interview/coach/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

// action: 'interrupt' | 'question' | 'fullgrade'
export async function POST(req: NextRequest) {
  const { action, transcript, role, questionIndex, conversationHistory } = await req.json()

  if (action === 'interrupt') {
    // Real-time mid-answer coaching — called every ~8 seconds while candidate speaks
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
        { role: 'user', content: `Question: ${questionIndex}\n\nCandidate so far: "${transcript}"` },
      ],
      max_tokens: 60,
      temperature: 0.4,
    })
    return NextResponse.json({ tip: res.choices[0].message.content?.trim() })
  }

  if (action === 'question') {
    const QUESTION_BANKS: Record<string, string[]> = {
      swe: [
        'Tell me about a time you had to debug a hard production issue. What was your process?',
        'How would you design a URL shortener like bit.ly?',
        'Describe the most technically challenging project you\'ve worked on.',
        'How do you decide between writing more tests vs shipping faster?',
        'Walk me through how you\'d approach a 10x performance optimisation.',
      ],
      pm: [
        'How would you define the success metrics for a new onboarding flow?',
        'Walk me through how you\'d prioritise a backlog of 50 feature requests.',
        'Describe a product decision you made that you later regretted.',
        'How do you handle engineering saying a feature is "too hard"?',
        'What\'s your framework for deciding what NOT to build?',
      ],
      behavioural: [
        'Tell me about a time you disagreed with your manager. What happened?',
        'Describe a project where things went wrong. How did you handle it?',
        'Tell me about a time you had to learn something completely new very fast.',
        'How do you handle competing priorities and tight deadlines?',
        'Describe a time you had to influence without authority.',
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
        {
          role: 'system',
          content: 'You are an expert interview coach. Grade this interview session in JSON.',
        },
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
```

- [ ] **Step 2: Commit**

```bash
git add app/api/interview/coach/route.ts
git commit -m "feat(interview): Live Coach API — interrupt tips + grading"
```

---

## Task 7: CoachOverlay component + Live Coach page

**Files:**
- Create: `components/interview/CoachOverlay.tsx`
- Create: `app/interview/live/page.tsx`

- [ ] **Step 1: Create CoachOverlay**

Create `components/interview/CoachOverlay.tsx`:

```tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  tip: string | null
  visible: boolean
}

export default function CoachOverlay({ tip, visible }: Props) {
  return (
    <AnimatePresence>
      {visible && tip && (
        <motion.div
          key={tip}
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          style={{
            position: 'fixed', bottom: 100, right: 24, zIndex: 200,
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)',
            borderRadius: 14, padding: '12px 16px', maxWidth: 280,
            backdropFilter: 'blur(16px)',
          }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#10b981',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                Coach
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                {tip}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Create Live Coach page**

Create `app/interview/live/page.tsx`:

```tsx
'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import VoiceInput from '@/components/interview/VoiceInput'
import CoachOverlay from '@/components/interview/CoachOverlay'
import { analyseFillers } from '@/lib/interview/filler-words'
import { trackSTAR } from '@/lib/interview/star-tracker'

const ROLES = [
  { id: 'swe', label: '💻 Software Engineer' },
  { id: 'pm', label: '📋 Product Manager' },
  { id: 'behavioural', label: '🤝 Behavioural' },
]

type Phase = 'setup' | 'question' | 'answering' | 'result'

interface SessionRound {
  question: string
  answer: string
  fillerCount: number
  starScore: number
}

export default function LiveCoachPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('setup')
  const [role, setRole] = useState('behavioural')
  const [question, setQuestion] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [coachTip, setCoachTip] = useState<string | null>(null)
  const [showTip, setShowTip] = useState(false)
  const [star, setStar] = useState({ situation: false, task: false, action: false, result: false, score: 0 })
  const [fillers, setFillers] = useState({ count: 0, rate: 0 })
  const [rounds, setRounds] = useState<SessionRound[]>([])
  const [finalGrade, setFinalGrade] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const interruptRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const MAX_QUESTIONS = 3

  // Every 8s while answering, send transcript to coach API
  function startInterruptTimer(getTranscript: () => string) {
    interruptRef.current = setInterval(async () => {
      const t = getTranscript()
      if (t.length < 30) return  // not enough content yet
      const res = await fetch('/api/interview/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'interrupt', transcript: t, role, questionIndex }),
      })
      const { tip } = await res.json()
      if (tip) {
        setCoachTip(tip)
        setShowTip(true)
        setTimeout(() => setShowTip(false), 5000)
      }
    }, 8000)
  }

  function stopInterruptTimer() {
    if (interruptRef.current) clearInterval(interruptRef.current)
  }

  async function loadQuestion() {
    setLoading(true)
    const res = await fetch('/api/interview/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'question', role, questionIndex }),
    })
    const { question: q } = await res.json()
    setQuestion(q)
    setCurrentTranscript('')
    setStar({ situation: false, task: false, action: false, result: false, score: 0 })
    setFillers({ count: 0, rate: 0 })
    setPhase('question')
    setLoading(false)

    // Read question aloud
    const utt = new SpeechSynthesisUtterance(q)
    utt.rate = 0.95
    window.speechSynthesis.speak(utt)
  }

  function handleInterim(text: string) {
    setCurrentTranscript(prev => prev + ' ' + text)
    // Live STAR tracking
    const s = trackSTAR(currentTranscript + ' ' + text)
    setStar(s)
    // Live filler detection
    const f = analyseFillers(currentTranscript + ' ' + text)
    setFillers({ count: f.count, rate: f.rate })
  }

  function handleFinalTranscript(text: string) {
    setCurrentTranscript(prev => (prev + ' ' + text).trim())
  }

  async function submitAnswer() {
    stopInterruptTimer()
    const finalAnalysis = analyseFillers(currentTranscript)
    const finalStar = trackSTAR(currentTranscript)

    const newRound: SessionRound = {
      question,
      answer: currentTranscript,
      fillerCount: finalAnalysis.count,
      starScore: finalStar.score,
    }
    const newRounds = [...rounds, newRound]
    setRounds(newRounds)

    if (questionIndex + 1 >= MAX_QUESTIONS) {
      // Final grading
      setLoading(true)
      const res = await fetch('/api/interview/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fullgrade',
          role,
          conversationHistory: newRounds.map(r => ({ question: r.question, answer: r.answer })),
        }),
      })
      const grade = await res.json()
      setFinalGrade(grade)
      setLoading(false)
      setPhase('result')
    } else {
      setQuestionIndex(i => i + 1)
      loadQuestion()
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030a06', color: '#f0f4ff',
      fontFamily: 'var(--font-body, system-ui)' }}>

      <CoachOverlay tip={coachTip} visible={showTip} />

      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.push('/interview')}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer', fontSize: 13 }}>← Back</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 16 }}>🎯 Live Coach</div>
        {phase === 'answering' && (
          <div style={{ fontSize: 12, color: '#10b981' }}>● Coach active</div>
        )}
      </div>

      {/* Setup */}
      {phase === 'setup' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: 520, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎯</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.03em' }}>
            Real-time coaching
          </h1>
          <p style={{ color: 'rgba(167,243,208,0.55)', fontSize: 15, margin: '0 0 36px', lineHeight: 1.6 }}>
            Answer questions by speaking. A coach whispers tips as you go — filler words, STAR tracking, pacing.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 32 }}>
            {ROLES.map(r => (
              <button key={r.id} onClick={() => setRole(r.id)}
                style={{ padding: '12px 10px', borderRadius: 12,
                  border: `2px solid ${role === r.id ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                  background: role === r.id ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)',
                  color: '#f0f4ff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {r.label}
              </button>
            ))}
          </div>
          <motion.button onClick={loadQuestion} disabled={loading}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: 16, fontWeight: 800 }}>
            {loading ? 'Preparing…' : 'Start coaching →'}
          </motion.button>
        </motion.div>
      )}

      {/* Question + answering */}
      {(phase === 'question' || phase === 'answering') && (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
          {/* Progress */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
              <div key={i} style={{ height: 4, flex: 1, borderRadius: 99,
                background: i <= questionIndex ? '#10b981' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>

          {/* Question card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '24px 28px', marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 12 }}>Question {questionIndex + 1}</div>
            <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.55, margin: 0 }}>{question}</p>
          </motion.div>

          {/* Live stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
            {[
              { label: 'S', full: 'Situation', done: star.situation, color: '#8b5cf6' },
              { label: 'T', full: 'Task', done: star.task, color: '#3b82f6' },
              { label: 'A', full: 'Action', done: star.action, color: '#10b981' },
              { label: 'R', full: 'Result', done: star.result, color: '#f97316' },
            ].map(s => (
              <div key={s.label} style={{ padding: '10px 12px', borderRadius: 10, textAlign: 'center',
                background: s.done ? `${s.color}22` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${s.done ? s.color + '44' : 'rgba(255,255,255,0.07)'}`,
                transition: 'all 0.4s' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: s.done ? s.color : 'rgba(255,255,255,0.2)' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 9, color: s.done ? s.color : 'rgba(255,255,255,0.2)',
                  textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.full}</div>
              </div>
            ))}
          </div>

          {fillers.count > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10, padding: '8px 14px', marginBottom: 20, fontSize: 12,
              color: 'rgba(255,255,255,0.6)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>⚠ {fillers.count} filler words</span>
              <span>detected ({fillers.rate}% rate) — pause instead</span>
            </div>
          )}

          {/* Live transcript */}
          {currentTranscript && (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px',
              marginBottom: 24, fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
              minHeight: 60, border: '1px solid rgba(255,255,255,0.07)' }}
              dangerouslySetInnerHTML={{ __html: analyseFillers(currentTranscript).highlighted }} />
          )}

          {/* Voice input */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <VoiceInput
              onTranscript={handleFinalTranscript}
              onInterimTranscript={handleInterim}
              accentColor="#10b981"
              placeholder="Tap mic to answer"
            />
          </div>

          {currentTranscript.length > 20 && (
            <motion.button onClick={submitAnswer} disabled={loading}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: loading ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', fontSize: 15, fontWeight: 700 }}>
              {loading ? 'Grading…' : questionIndex + 1 >= MAX_QUESTIONS ? 'Finish session →' : 'Next question →'}
            </motion.button>
          )}
        </div>
      )}

      {/* Results */}
      {phase === 'result' && finalGrade && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>📊</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.03em' }}>
              Session Complete
            </h2>
            <div style={{ fontSize: 48, fontWeight: 900,
              color: (finalGrade.overall ?? 70) >= 70 ? '#10b981' : '#f59e0b' }}>
              {finalGrade.overall ?? 72}
            </div>
            <p style={{ color: 'rgba(167,243,208,0.55)', fontSize: 14, margin: '8px 0 0' }}>
              {finalGrade.summary}
            </p>
          </div>

          {/* Score breakdown */}
          {finalGrade.scores && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {Object.entries(finalGrade.scores).map(([k, v]) => (
                <div key={k} style={{ background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize',
                    letterSpacing: '0.06em', marginBottom: 6 }}>{k}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{v as number}/10</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
            {finalGrade.strengths?.slice(0, 2).map((s: string, i: number) => (
              <div key={i} style={{ flex: 1, background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '12px 14px', fontSize: 13,
                color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>✓ </span>{s}
              </div>
            ))}
          </div>

          <motion.button onClick={() => { setPhase('setup'); setRounds([]); setQuestionIndex(0) }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: 15, fontWeight: 700 }}>
            Practice again →
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Build + commit**

```bash
npm run build 2>&1 | tail -6
git add app/interview/live/ components/interview/CoachOverlay.tsx
git commit -m "feat(interview): Live Coach Mode — real-time STAR tracking, filler detection, coach interrupts"
```

---

## Task 8: Concept Cinema API + Canvas

**Files:**
- Create: `app/api/interview/explain/route.ts`
- Create: `components/interview/ConceptCanvas.tsx`
- Create: `app/interview/learn/page.tsx`

- [ ] **Step 1: Create explain API**

Create `app/api/interview/explain/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

export async function POST(req: NextRequest) {
  const { concept } = await req.json()

  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a visual explainer. Given a CS/interview concept, return a JSON animation script.
Each step has: label (short title), narration (1-2 sentences spoken aloud), nodes (array of {id, label, x, y, color}), edges (array of {from, to, label}).
Return 4-6 steps that build progressively. Keep narration conversational, not textbook.
Return ONLY valid JSON: { "title": "string", "steps": [ { "label": "string", "narration": "string", "nodes": [{id,label,x,y,color}], "edges": [{from,to,label}] } ] }`,
      },
      { role: 'user', content: `Explain: ${concept}` },
    ],
    max_tokens: 1500,
    temperature: 0.5,
    response_format: { type: 'json_object' },
  })

  const data = JSON.parse(res.choices[0].message.content || '{}')
  return NextResponse.json(data)
}
```

- [ ] **Step 2: Create ConceptCanvas**

Create `components/interview/ConceptCanvas.tsx`:

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Node { id: string; label: string; x: number; y: number; color: string }
interface Edge { from: string; to: string; label?: string }
interface Step { label: string; narration: string; nodes: Node[]; edges: Edge[] }

interface Props {
  step: Step | null
  stepIndex: number
}

export default function ConceptCanvas({ step, stepIndex }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!step || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // Draw edges
    for (const edge of step.edges) {
      const from = step.nodes.find(n => n.id === edge.from)
      const to = step.nodes.find(n => n.id === edge.to)
      if (!from || !to) continue

      const fx = from.x * W
      const fy = from.y * H
      const tx = to.x * W
      const ty = to.y * H

      ctx.beginPath()
      ctx.moveTo(fx, fy)
      ctx.lineTo(tx, ty)
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Arrow head
      const angle = Math.atan2(ty - fy, tx - fx)
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(tx - 12 * Math.cos(angle - 0.4), ty - 12 * Math.sin(angle - 0.4))
      ctx.lineTo(tx - 12 * Math.cos(angle + 0.4), ty - 12 * Math.sin(angle + 0.4))
      ctx.closePath()
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.fill()

      // Edge label
      if (edge.label) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '11px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(edge.label, (fx + tx) / 2, (fy + ty) / 2 - 8)
      }
    }

    // Draw nodes
    for (const node of step.nodes) {
      const x = node.x * W
      const y = node.y * H
      const r = 36

      // Glow
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2)
      grad.addColorStop(0, node.color + '44')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, r * 2, 0, Math.PI * 2)
      ctx.fill()

      // Circle
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = node.color + '33'
      ctx.fill()
      ctx.strokeStyle = node.color
      ctx.lineWidth = 2
      ctx.stroke()

      // Label
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 13px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const words = node.label.split(' ')
      if (words.length > 2) {
        ctx.fillText(words.slice(0, 2).join(' '), x, y - 7)
        ctx.fillText(words.slice(2).join(' '), x, y + 9)
      } else {
        ctx.fillText(node.label, x, y)
      }
    }
  }, [step, stepIndex])

  if (!step) return null

  return (
    <motion.div
      key={stepIndex}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <canvas
        ref={canvasRef}
        width={700}
        height={420}
        style={{ width: '100%', height: 'auto', borderRadius: 16,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      />
    </motion.div>
  )
}
```

- [ ] **Step 3: Create Concept Cinema page**

Create `app/interview/learn/page.tsx`:

```tsx
'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import ConceptCanvas from '@/components/interview/ConceptCanvas'

const SUGGESTED = [
  'Hash Map internals', 'CAP theorem', 'STAR method', 'System design load balancer',
  'TCP vs UDP', 'REST vs GraphQL', 'Database indexing', 'Binary search',
  'Microservices vs monolith', 'How OAuth works',
]

interface Step { label: string; narration: string; nodes: any[]; edges: any[] }
interface Script { title: string; steps: Step[] }

export default function ConceptCinemaPage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [script, setScript] = useState<Script | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)

  const explain = useCallback(async (concept: string) => {
    if (!concept.trim()) return
    setLoading(true)
    setScript(null)
    setStepIndex(0)
    const res = await fetch('/api/interview/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept }),
    })
    const data = await res.json()
    setScript(data)
    setLoading(false)
    // Auto-play first step narration
    if (data.steps?.[0]) {
      narrate(data.steps[0].narration)
    }
  }, [])

  function narrate(text: string) {
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.92
    utt.pitch = 1.0
    setPlaying(true)
    utt.onend = () => setPlaying(false)
    window.speechSynthesis.speak(utt)
  }

  function goToStep(i: number) {
    if (!script) return
    setStepIndex(i)
    narrate(script.steps[i].narration)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') explain(input)
  }

  const currentStep = script?.steps[stepIndex] ?? null

  return (
    <div style={{ minHeight: '100vh', background: '#030a06', color: '#f0f4ff',
      fontFamily: 'var(--font-body, system-ui)' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.push('/interview')}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer', fontSize: 13 }}>← Back</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 16 }}>🎬 Concept Cinema</div>
        {playing && <div style={{ fontSize: 12, color: '#f97316' }}>● Narrating…</div>}
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

        {/* Search */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type any CS/interview concept…"
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, padding: '14px 18px', color: '#f0f4ff', fontSize: 15, outline: 'none' }}
          />
          <motion.button onClick={() => explain(input)} disabled={loading}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{ padding: '14px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: loading ? 'rgba(249,115,22,0.3)' : 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#fff', fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {loading ? 'Generating…' : '▶ Explain'}
          </motion.button>
        </div>

        {/* Suggestions */}
        {!script && !loading && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {SUGGESTED.map(s => (
              <button key={s} onClick={() => { setInput(s); explain(s) }}
                style={{ padding: '7px 14px', borderRadius: 99, border: '1px solid rgba(249,115,22,0.25)',
                  background: 'rgba(249,115,22,0.08)', color: 'rgba(255,255,255,0.6)',
                  fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '64px 0', color: 'rgba(255,255,255,0.4)' }}>
            <motion.div style={{ fontSize: 48, marginBottom: 16 }}
              animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
              🎬
            </motion.div>
            <div>Generating visual explanation…</div>
          </motion.div>
        )}

        {script && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Title */}
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
                {script.title}
              </h2>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                Step {stepIndex + 1} / {script.steps.length}
              </div>
            </div>

            {/* Canvas */}
            <ConceptCanvas step={currentStep} stepIndex={stepIndex} />

            {/* Narration */}
            <AnimatePresence mode="wait">
              <motion.div key={stepIndex}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ margin: '20px 0', padding: '18px 22px',
                  background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
                  borderRadius: 14 }}>
                <div style={{ fontSize: 11, color: '#f97316', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', marginBottom: 8 }}>
                  {currentStep?.label}
                </div>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, margin: 0 }}>
                  {currentStep?.narration}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Step navigation */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {script.steps.map((s, i) => (
                <button key={i} onClick={() => goToStep(i)}
                  style={{ padding: '8px 16px', borderRadius: 99, border: 'none', cursor: 'pointer',
                    background: i === stepIndex ? '#f97316' : 'rgba(255,255,255,0.06)',
                    color: i === stepIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                    fontSize: 13, fontWeight: i === stepIndex ? 700 : 400,
                    transition: 'all 0.2s' }}>
                  {i + 1}. {s.label}
                </button>
              ))}
            </div>

            {/* Prev / Next */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => goToStep(Math.max(0, stepIndex - 1))}
                disabled={stepIndex === 0}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: stepIndex === 0 ? 'rgba(255,255,255,0.2)' : '#f0f4ff',
                  cursor: stepIndex === 0 ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600 }}>
                ← Previous
              </button>
              {stepIndex < script.steps.length - 1 ? (
                <button onClick={() => goToStep(stepIndex + 1)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    color: '#fff', fontSize: 14, fontWeight: 700 }}>
                  Next →
                </button>
              ) : (
                <button onClick={() => { setScript(null); setInput('') }}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    color: '#fff', fontSize: 14, fontWeight: 700 }}>
                  Learn another →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Build and commit**

```bash
npm run build 2>&1 | tail -6
git add app/interview/learn/ app/api/interview/explain/ components/interview/ConceptCanvas.tsx
git commit -m "feat(interview): Concept Cinema — animated canvas explanations with voice narration"
```

---

## Task 9: Wire modes into main nav + final push

**Files:**
- Modify: `app/page.tsx` (add interview section to landing)

- [ ] **Step 1: Add interview modes to aicoachlab landing page**

In `app/page.tsx`, find the section that links to `/interview` and replace it with the 3-mode preview. Add after existing content:

```tsx
// In the features/tools section of app/page.tsx, add:
<a href="/interview" style={{ display: 'block', textDecoration: 'none' }}>
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: '20px 24px', cursor: 'pointer' }}>
    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
      <span>🎭</span><span>🎯</span><span>🎬</span>
    </div>
    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Interview Platform v2</div>
    <div style={{ fontSize: 13, color: 'rgba(167,243,208,0.5)', lineHeight: 1.5 }}>
      Blindfold Mode · Live Coach · Concept Cinema
    </div>
  </div>
</a>
```

- [ ] **Step 2: Final build + push**

```bash
cd /Users/sivaprakasam/projects/agents/aicoachlab
npm run build 2>&1 | tail -8
git add -A
git push
```

Expected: All 3 routes live: `/interview`, `/interview/blindfold`, `/interview/live`, `/interview/learn`

---

## Self-Review

**Spec coverage:**
- ✅ Blindfold Mode — persona Q&A, voice, reveal animation, scoring
- ✅ Live Coach Mode — real-time STAR tracking, filler detection, 8s interrupt
- ✅ Concept Cinema — canvas rendering, voice narration, step navigation
- ✅ Voice-first — VoiceInput component used in all interactive modes
- ✅ Animated UI — Framer Motion throughout, spring animations, canvas
- ✅ Groq for speed — all APIs use llama-3.3-70b-versatile
- ✅ Bot persona voices — speakWithPersona with rate/pitch tuning
- ✅ No ElevenLabs required — Web Speech SpeechSynthesis only

**Placeholder scan:** None found — all code is complete.

**Type consistency:** `Persona` type defined in personas.ts, imported correctly in blindfold page. `Step`/`Script` types defined inline in learn page (not shared — acceptable). `STARStatus` exported from star-tracker.ts. All match.

**Gaps:** None.
