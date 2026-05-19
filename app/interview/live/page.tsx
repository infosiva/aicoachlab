'use client'
import { useState, useRef, useCallback } from 'react'
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

type Phase = 'setup' | 'question' | 'result'

interface SessionRound { question: string; answer: string; fillerCount: number; starScore: number }

export default function LiveCoachPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('setup')
  const [role, setRole] = useState('behavioural')
  const [question, setQuestion] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [coachTip, setCoachTip] = useState<string | null>(null)
  const [showTip, setShowTip] = useState(false)
  const [star, setStar] = useState({ situation: false, task: false, action: false, result: false, score: 0, missing: [] as string[], tips: [] as string[] })
  const [fillers, setFillers] = useState({ count: 0, rate: 0 })
  const [rounds, setRounds] = useState<SessionRound[]>([])
  const [finalGrade, setFinalGrade] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const interruptRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const transcriptRef = useRef('')
  const MAX_QUESTIONS = 3

  function startInterruptTimer() {
    if (interruptRef.current) clearInterval(interruptRef.current)
    interruptRef.current = setInterval(async () => {
      const t = transcriptRef.current
      if (t.length < 30) return
      try {
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
      } catch { /* ignore interrupt errors */ }
    }, 8000)
  }

  function stopInterruptTimer() {
    if (interruptRef.current) clearInterval(interruptRef.current)
  }

  async function loadQuestion(idx: number) {
    setLoading(true)
    setCurrentTranscript('')
    transcriptRef.current = ''
    setStar({ situation: false, task: false, action: false, result: false, score: 0, missing: [], tips: [] })
    setFillers({ count: 0, rate: 0 })
    const res = await fetch('/api/interview/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'question', role, questionIndex: idx }),
    })
    const { question: q } = await res.json()
    setQuestion(q)
    setPhase('question')
    setLoading(false)
    if (typeof window !== 'undefined') {
      const utt = new SpeechSynthesisUtterance(q)
      utt.rate = 0.95
      window.speechSynthesis.speak(utt)
    }
    startInterruptTimer()
  }

  function handleInterim(text: string) {
    const combined = transcriptRef.current + ' ' + text
    transcriptRef.current = combined
    setCurrentTranscript(combined)
    setStar(trackSTAR(combined))
    const f = analyseFillers(combined)
    setFillers({ count: f.count, rate: f.rate })
  }

  function handleFinalTranscript(text: string) {
    const combined = (transcriptRef.current + ' ' + text).trim()
    transcriptRef.current = combined
    setCurrentTranscript(combined)
  }

  async function submitAnswer() {
    stopInterruptTimer()
    const finalAnalysis = analyseFillers(currentTranscript)
    const finalStar = trackSTAR(currentTranscript)
    const newRound: SessionRound = { question, answer: currentTranscript, fillerCount: finalAnalysis.count, starScore: finalStar.score }
    const newRounds = [...rounds, newRound]
    setRounds(newRounds)

    if (questionIndex + 1 >= MAX_QUESTIONS) {
      setLoading(true)
      const res = await fetch('/api/interview/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fullgrade', role, conversationHistory: newRounds.map(r => ({ question: r.question, answer: r.answer })) }),
      })
      const grade = await res.json()
      setFinalGrade(grade)
      setLoading(false)
      setPhase('result')
    } else {
      const nextIdx = questionIndex + 1
      setQuestionIndex(nextIdx)
      loadQuestion(nextIdx)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030a06', color: '#f0f4ff', fontFamily: 'var(--font-body, system-ui)' }}>
      <CoachOverlay tip={coachTip} visible={showTip} />

      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.push('/interview')}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13 }}>
          ← Back
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 16 }}>🎯 Live Coach</div>
        {phase === 'question' && <div style={{ fontSize: 12, color: '#10b981' }}>● Coach active</div>}
      </div>

      {/* Setup */}
      {phase === 'setup' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: 520, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎯</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.03em' }}>Real-time coaching</h1>
          <p style={{ color: 'rgba(167,243,208,0.55)', fontSize: 15, margin: '0 0 36px', lineHeight: 1.6 }}>
            Answer questions by speaking. A coach whispers tips as you go — filler words, STAR tracking, pacing.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
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
          <motion.button onClick={() => loadQuestion(0)} disabled={loading}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: 16, fontWeight: 800 }}>
            {loading ? 'Preparing…' : 'Start coaching →'}
          </motion.button>
        </motion.div>
      )}

      {/* Question + answering */}
      {phase === 'question' && (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
              <div key={i} style={{ height: 4, flex: 1, borderRadius: 99,
                background: i <= questionIndex ? '#10b981' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '24px 28px', marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 12 }}>Question {questionIndex + 1}</div>
            <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.55, margin: 0 }}>{question}</p>
          </motion.div>

          {/* STAR tracker */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            {([
              { label: 'S', full: 'Situation', done: star.situation, color: '#8b5cf6' },
              { label: 'T', full: 'Task', done: star.task, color: '#3b82f6' },
              { label: 'A', full: 'Action', done: star.action, color: '#10b981' },
              { label: 'R', full: 'Result', done: star.result, color: '#f97316' },
            ] as const).map(s => (
              <div key={s.label} style={{ padding: '10px 12px', borderRadius: 10, textAlign: 'center',
                background: s.done ? `${s.color}22` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${s.done ? s.color + '44' : 'rgba(255,255,255,0.07)'}`,
                transition: 'all 0.4s' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: s.done ? s.color : 'rgba(255,255,255,0.2)' }}>{s.label}</div>
                <div style={{ fontSize: 9, color: s.done ? s.color : 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.full}</div>
              </div>
            ))}
          </div>

          {fillers.count > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10, padding: '8px 14px', marginBottom: 20, fontSize: 12,
              color: 'rgba(255,255,255,0.6)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>⚠ {fillers.count} filler words</span>
              <span>({fillers.rate}% rate) — pause instead</span>
            </div>
          )}

          {currentTranscript && (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px',
              marginBottom: 24, fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
              minHeight: 60, border: '1px solid rgba(255,255,255,0.07)' }}
              dangerouslySetInnerHTML={{ __html: analyseFillers(currentTranscript).highlighted }} />
          )}

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <VoiceInput onTranscript={handleFinalTranscript} onInterimTranscript={handleInterim}
              accentColor="#10b981" placeholder="Tap mic to answer" />
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
            <h2 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.03em' }}>Session Complete</h2>
            <div style={{ fontSize: 48, fontWeight: 900,
              color: (finalGrade.overall ?? 70) >= 70 ? '#10b981' : '#f59e0b' }}>
              {finalGrade.overall ?? 72}
            </div>
            <p style={{ color: 'rgba(167,243,208,0.55)', fontSize: 14, margin: '8px 0 0' }}>{finalGrade.summary}</p>
          </div>

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

          <AnimatePresence>
            {finalGrade.strengths?.slice(0, 2).map((s: string, i: number) => (
              <div key={i} style={{ background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '12px 14px',
                fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, marginBottom: 8 }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>✓ </span>{s}
              </div>
            ))}
          </AnimatePresence>

          <motion.button onClick={() => { setPhase('setup'); setRounds([]); setQuestionIndex(0); setFinalGrade(null) }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: 15, fontWeight: 700,
              marginTop: 24 }}>
            Practice again →
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
