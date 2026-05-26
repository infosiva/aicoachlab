'use client'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Mic, MicOff, Send, RotateCcw, CheckCircle, ChevronRight } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  swe: 'Software Engineer', pm: 'Product Manager', system: 'System Design',
  behavioural: 'Behavioural', data: 'Data Science', frontend: 'Frontend Engineer',
}
const ROLE_COLORS: Record<string, string> = {
  swe: '#7c3aed', pm: '#0ea5e9', system: '#f59e0b',
  behavioural: '#10b981', data: '#ec4899', frontend: '#06b6d4',
}

const INTERVIEWER = { name: 'Alex Chen', title: 'Senior Engineering Manager', avatar: '🤖' }
const TOTAL_ROUNDS = 5
const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]

type Phase = 'setup' | 'interview' | 'results'
type Round = { question: string; answer: string; score: number; feedback: string; verdict: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionAny = any

function SpeakingWave({ active }: { active: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 20, justifyContent: 'center' }}>
      {[0,1,2,3,4].map(i => (
        <motion.div key={i}
          style={{ width: 3, borderRadius: 99, background: 'var(--violet-2)', originY: 1 }}
          animate={active
            ? { scaleY: [0.3, 1.5+i*0.2, 0.3], opacity: [0.5, 1, 0.5] }
            : { scaleY: 0.3, opacity: 0.3 }}
          transition={active
            ? { duration: 0.5+i*0.07, repeat: Infinity, delay: i*0.09, ease: 'easeInOut' }
            : { duration: 0.2 }} />
      ))}
    </div>
  )
}

function ClassicInterviewInner() {
  const router = useRouter()
  const params = useSearchParams()
  const role = params.get('role') ?? 'swe'
  const roleColor = ROLE_COLORS[role] ?? '#7c3aed'

  const [phase, setPhase] = useState<Phase>('setup')
  const [rounds, setRounds] = useState<Round[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const [grading, setGrading] = useState(false)
  const [interviewerMsg, setInterviewerMsg] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionAny | null>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) { onEnd?.(); return }
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 0.92; utter.pitch = 0.95; utter.volume = 1
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.name.includes('Daniel') || v.name.includes('Alex') || v.lang === 'en-US')
    if (preferred) utter.voice = preferred
    utter.onstart = () => setInterviewerSpeaking(true)
    utter.onend = () => { setInterviewerSpeaking(false); onEnd?.() }
    utter.onerror = () => { setInterviewerSpeaking(false); onEnd?.() }
    synthRef.current = utter
    window.speechSynthesis.speak(utter)
  }, [])

  const fetchQuestion = useCallback(async (roundNum: number) => {
    setLoading(true)
    setSubmitted(false)
    setAnswer('')
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'question', role, round: roundNum }),
      })
      const data = await res.json()
      const q = data.question ?? 'Tell me about a time you overcame a technical challenge.'
      setQuestion(q)
      const intro = roundNum === 0
        ? `Hello! I'm ${INTERVIEWER.name}, ${INTERVIEWER.title}. Welcome to your ${ROLE_LABELS[role]} interview. Let's get started. ${q}`
        : q
      setInterviewerMsg(q)
      speak(intro)
    } catch {
      const fallback = 'Tell me about your most challenging project and how you handled it.'
      setQuestion(fallback)
      setInterviewerMsg(fallback)
      speak(fallback)
    } finally {
      setLoading(false)
    }
  }, [role, speak])

  function startInterview() {
    setPhase('interview')
    setCurrentRound(0)
    setRounds([])
    fetchQuestion(0)
  }

  function startListening() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any
    const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let text = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript
      }
      setAnswer(text)
    }
    rec.onend = () => setListening(false)
    rec.start()
    recognitionRef.current = rec
    setListening(true)
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  function toggleMic() {
    if (listening) stopListening()
    else startListening()
  }

  async function submitAnswer() {
    if (!answer.trim() || grading) return
    stopListening()
    window.speechSynthesis.cancel()
    setGrading(true)
    setSubmitted(true)
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grade', role, question, answer }),
      })
      const data = await res.json()
      const round: Round = {
        question,
        answer,
        score: data.score ?? 70,
        feedback: data.feedback ?? 'Good attempt.',
        verdict: data.verdict ?? 'Satisfactory',
      }
      const newRounds = [...rounds, round]
      setRounds(newRounds)

      const botReply = data.botReply ?? `Thanks. Score: ${round.score} out of 100.`
      setInterviewerMsg(botReply)

      const nextRound = currentRound + 1
      if (nextRound >= TOTAL_ROUNDS) {
        speak(botReply + ' That wraps up our interview. Let me tally your results.', () => {
          setPhase('results')
        })
      } else {
        speak(botReply, () => {
          setCurrentRound(nextRound)
          fetchQuestion(nextRound)
        })
      }
    } catch {
      setGrading(false)
    } finally {
      setGrading(false)
    }
  }

  const avgScore = rounds.length
    ? Math.round(rounds.reduce((s, r) => s + r.score, 0) / rounds.length)
    : 0

  function scoreColor(s: number) {
    if (s >= 80) return 'var(--green)'
    if (s >= 60) return 'var(--amber)'
    return 'var(--red)'
  }

  // Setup phase
  if (phase === 'setup') return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif', padding: '24px' }}>

      {/* bg glow */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 700, height: 700, borderRadius: '50%',
          background: `radial-gradient(ellipse, ${roleColor}22 0%, transparent 65%)`,
          filter: 'blur(80px)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        style={{ position: 'relative', zIndex: 10, maxWidth: 520, width: '100%',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 24, padding: '40px 36px', textAlign: 'center' }}>

        <button onClick={() => router.push('/interview')}
          style={{ position: 'absolute', top: 20, left: 20, background: 'none', border: 'none',
            cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, padding: '6px 10px', borderRadius: 8 }}>
          <ArrowLeft size={13} /> Back
        </button>

        {/* Interviewer avatar */}
        <motion.div
          animate={{ boxShadow: [`0 0 30px ${roleColor}40`, `0 0 60px ${roleColor}25`, `0 0 30px ${roleColor}40`] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 96, height: 96, borderRadius: '50%', margin: '0 auto 20px',
            background: `linear-gradient(135deg, ${roleColor}33, ${roleColor}11)`,
            border: `2px solid ${roleColor}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42 }}>
          🤖
        </motion.div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: roleColor, marginBottom: 10 }}>Mock Interview</div>

        <h1 style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.04em',
          margin: '0 0 8px', lineHeight: 1.1 }}>
          {ROLE_LABELS[role] ?? 'Interview'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', margin: '0 0 28px', lineHeight: 1.6 }}>
          {TOTAL_ROUNDS} questions · Voice or text · AI scoring after each answer
        </p>

        {/* Interviewer card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
          background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 14,
          marginBottom: 28, textAlign: 'left' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: `${roleColor}20`, border: `1px solid ${roleColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            🤖
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{INTERVIEWER.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{INTERVIEWER.title}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 10, fontWeight: 600, color: 'var(--green)',
            padding: '4px 10px', background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)', borderRadius: 99 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)',
              boxShadow: '0 0 6px var(--green)', display: 'inline-block' }} />
            Ready
          </div>
        </div>

        <motion.button onClick={startInterview}
          whileHover={{ scale: 1.03, boxShadow: `0 0 48px ${roleColor}60` }}
          whileTap={{ scale: 0.97 }}
          style={{ width: '100%', padding: '15px 24px', borderRadius: 14, border: 'none',
            cursor: 'pointer', fontWeight: 800, fontSize: 16, color: '#fff',
            background: `linear-gradient(135deg, ${roleColor} 0%, ${roleColor}bb 100%)`,
            boxShadow: `0 0 28px ${roleColor}40`, letterSpacing: '-0.02em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Mic size={18} /> Start Interview <ChevronRight size={18} />
        </motion.button>

        <p style={{ marginTop: 14, fontSize: 11, color: 'var(--text-3)',
          letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          No signup · Groq-powered · ~8 min
        </p>
      </motion.div>
    </div>
  )

  // Results phase
  if (phase === 'results') return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)',
      fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' }}>

      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 500, borderRadius: '50%',
          background: `radial-gradient(ellipse, ${scoreColor(avgScore)}22 0%, transparent 65%)`,
          filter: 'blur(80px)' }} />
      </div>

      <nav style={{ position: 'sticky', top: 0, zIndex: 20, padding: '14px 24px',
        borderBottom: '1px solid var(--border)', backdropFilter: 'blur(16px)',
        background: 'rgba(7,8,15,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.push('/interview')}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <ArrowLeft size={14} /> Interview Hub
        </button>
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          AI<span style={{ color: 'var(--violet-2)' }}>Coach</span>Lab
        </div>
        <button onClick={startInterview}
          style={{ background: 'var(--violet-dim)', border: '1px solid rgba(124,58,237,0.3)',
            color: 'var(--violet-2)', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            padding: '6px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
          <RotateCcw size={12} /> Retry
        </button>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px', position: 'relative', zIndex: 10 }}>

        {/* Score hero */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease }}
          style={{ textAlign: 'center', marginBottom: 48 }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px',
            background: 'var(--violet-dim)', border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 99, fontSize: 11, fontWeight: 700, color: 'var(--violet-2)',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>
            Interview Complete
          </div>

          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
            style={{ width: 130, height: 130, borderRadius: '50%', margin: '0 auto 20px',
              background: `conic-gradient(${scoreColor(avgScore)} ${avgScore * 3.6}deg, var(--surface-2) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 60px ${scoreColor(avgScore)}40`,
              position: 'relative' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%',
              background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: scoreColor(avgScore),
                  letterSpacing: '-0.04em', lineHeight: 1 }}>{avgScore}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center' }}>/100</div>
              </div>
            </div>
          </motion.div>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em',
            margin: '0 0 10px' }}>
            {avgScore >= 80 ? 'Excellent performance!' : avgScore >= 60 ? 'Solid effort!' : 'Keep practicing!'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', margin: 0 }}>
            {TOTAL_ROUNDS} questions · {ROLE_LABELS[role]} interview
          </p>
        </motion.div>

        {/* Round breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {rounds.map((r, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, ease }}
              style={{ padding: '20px 22px', borderRadius: 16,
                background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)',
                  textTransform: 'uppercase', letterSpacing: '0.08em' }}>Q{i+1}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 700,
                    background: `${scoreColor(r.score)}18`, color: scoreColor(r.score) }}>
                    {r.verdict}
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: scoreColor(r.score) }}>
                    {r.score}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px', lineHeight: 1.4 }}>{r.question}</p>
              <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '0 0 10px', lineHeight: 1.6,
                padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 10,
                borderLeft: `3px solid ${roleColor}`, fontStyle: 'italic' }}>
                "{r.answer.length > 150 ? r.answer.slice(0, 150) + '…' : r.answer}"
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.55 }}>
                {r.feedback}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
          <motion.button onClick={startInterview}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ flex: 1, padding: '14px 20px', borderRadius: 12, border: 'none',
              cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#fff',
              background: `linear-gradient(135deg, ${roleColor} 0%, ${roleColor}bb 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <RotateCcw size={16} /> Try Again
          </motion.button>
          <motion.button onClick={() => router.push('/interview')}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ flex: 1, padding: '14px 20px', borderRadius: 12, cursor: 'pointer',
              fontWeight: 700, fontSize: 14, color: 'var(--text-2)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Other Roles <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  )

  // Interview phase
  const progress = ((currentRound) / TOTAL_ROUNDS) * 100

  return (
    <div style={{ height: '100dvh', background: 'var(--bg)', color: 'var(--text)',
      fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column',
      overflow: 'hidden' }}>

      {/* bg atmosphere */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '20%',
          width: 500, height: 400, borderRadius: '50%',
          background: `radial-gradient(ellipse, ${roleColor}18 0%, transparent 65%)`,
          filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '15%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
          filter: 'blur(80px)' }} />
      </div>

      {/* ── Top bar ── */}
      <div style={{ position: 'relative', zIndex: 20, flexShrink: 0,
        borderBottom: '1px solid var(--border)', backdropFilter: 'blur(16px)',
        background: 'rgba(7,8,15,0.85)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px' }}>
          <button onClick={() => { window.speechSynthesis?.cancel(); router.push('/interview') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <ArrowLeft size={13} /> Exit
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>
              Question {Math.min(currentRound + 1, TOTAL_ROUNDS)} of {TOTAL_ROUNDS}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{ROLE_LABELS[role]}</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: roleColor,
            background: `${roleColor}15`, padding: '4px 10px', borderRadius: 99,
            border: `1px solid ${roleColor}30` }}>
            {Math.round(progress)}%
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: 2, background: 'var(--surface-2)', position: 'relative' }}>
          <motion.div
            style={{ position: 'absolute', left: 0, top: 0, height: '100%',
              background: `linear-gradient(90deg, ${roleColor}, ${roleColor}aa)`,
              borderRadius: '0 99px 99px 0' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease }} />
        </div>
      </div>

      {/* ── Main interview room ── */}
      <div style={{ flex: 1, position: 'relative', zIndex: 10,
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 20, padding: '20px', overflow: 'hidden' }}>

        {/* ── LEFT: Interviewer ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Avatar card */}
          <div style={{ padding: '24px 20px', borderRadius: 20,
            background: 'var(--surface)', border: `1px solid ${interviewerSpeaking ? roleColor + '50' : 'var(--border)'}`,
            textAlign: 'center', transition: 'border-color 300ms',
            boxShadow: interviewerSpeaking ? `0 0 40px ${roleColor}25` : 'none' }}>

            <motion.div
              animate={interviewerSpeaking
                ? { boxShadow: [`0 0 0 0 ${roleColor}50`, `0 0 0 14px ${roleColor}00`, `0 0 0 0 ${roleColor}50`] }
                : { boxShadow: `0 0 0 0 ${roleColor}00` }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 14px',
                background: `linear-gradient(135deg, ${roleColor}33, ${roleColor}11)`,
                border: `2px solid ${interviewerSpeaking ? roleColor : roleColor + '40'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
              🤖
            </motion.div>

            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{INTERVIEWER.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12 }}>{INTERVIEWER.title}</div>
            <SpeakingWave active={interviewerSpeaking} />
          </div>

          {/* Question bubble */}
          <div style={{ flex: 1, padding: '20px', borderRadius: 18,
            background: `${roleColor}0c`,
            border: `1px solid ${roleColor}25`,
            overflow: 'auto' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: roleColor, marginBottom: 10 }}>
              Question {currentRound + 1}
            </div>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '8px 0' }}>
                  {[0,1,2].map(i => (
                    <motion.div key={i}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: roleColor }}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }} />
                  ))}
                </motion.div>
              ) : (
                <motion.p key={question}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease }}
                  style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.65,
                    color: 'var(--text)', margin: 0 }}>
                  {question}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT: You (candidate) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Your avatar card */}
          <div style={{ padding: '24px 20px', borderRadius: 20,
            background: 'var(--surface)', border: `1px solid ${listening ? 'rgba(16,185,129,0.5)' : 'var(--border)'}`,
            textAlign: 'center', transition: 'border-color 300ms',
            boxShadow: listening ? '0 0 40px rgba(16,185,129,0.2)' : 'none' }}>

            <motion.div
              animate={listening
                ? { boxShadow: ['0 0 0 0 rgba(16,185,129,0.5)', '0 0 0 14px rgba(16,185,129,0)', '0 0 0 0 rgba(16,185,129,0.5)'] }
                : { boxShadow: '0 0 0 0 rgba(16,185,129,0)' }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 14px',
                background: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(16,185,129,0.15))',
                border: `2px solid ${listening ? 'rgba(16,185,129,0.6)' : 'rgba(14,165,233,0.35)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                transition: 'border-color 300ms' }}>
              🧑‍💻
            </motion.div>

            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>You</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12 }}>
              {ROLE_LABELS[role]} Candidate
            </div>

            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center', height: 20 }}>
              {listening ? (
                [0,1,2,3,4].map(i => (
                  <motion.div key={i}
                    style={{ width: 3, borderRadius: 99, background: 'var(--green)', originY: 1 }}
                    animate={{ scaleY: [0.3, 1.2+i*0.15, 0.3] }}
                    transition={{ duration: 0.45+i*0.06, repeat: Infinity, delay: i*0.08, ease: 'easeInOut' }} />
                ))
              ) : (
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {submitted ? 'Answer submitted' : 'Tap mic to speak'}
                </span>
              )}
            </div>
          </div>

          {/* Answer area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Your answer will appear here as you speak, or type directly…"
              disabled={grading || submitted}
              style={{ flex: 1, resize: 'none', padding: '16px', borderRadius: 16,
                background: 'var(--surface)', border: '1px solid var(--border-2)',
                color: 'var(--text)', fontSize: 13, lineHeight: 1.7,
                fontFamily: 'inherit', outline: 'none', minHeight: 120,
                opacity: (grading || submitted) ? 0.6 : 1,
                transition: 'border-color 200ms' }}
              onFocus={e => e.target.style.borderColor = roleColor + '60'}
              onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
            />

            {/* Controls */}
            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button onClick={toggleMic}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
                disabled={grading || submitted}
                style={{ flex: '0 0 56px', height: 56, borderRadius: 14,
                  border: `1.5px solid ${listening ? 'rgba(16,185,129,0.5)' : 'var(--border)'}`,
                  cursor: (grading || submitted) ? 'not-allowed' : 'pointer',
                  background: listening
                    ? 'rgba(16,185,129,0.2)'
                    : 'var(--surface-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: listening ? 'var(--green)' : 'var(--text-3)',
                  transition: 'all 200ms' }}>
                {listening ? <Mic size={22} /> : <MicOff size={22} />}
              </motion.button>

              <motion.button onClick={submitAnswer}
                whileHover={(!answer.trim() || grading || submitted) ? {} : { scale: 1.02 }}
                whileTap={(!answer.trim() || grading || submitted) ? {} : { scale: 0.97 }}
                disabled={!answer.trim() || grading || submitted}
                style={{ flex: 1, height: 56, borderRadius: 14, border: 'none',
                  cursor: (!answer.trim() || grading || submitted) ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: 14, color: '#fff',
                  background: (!answer.trim() || grading || submitted)
                    ? 'var(--surface-2)'
                    : `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                  opacity: (!answer.trim() || grading || submitted) ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 250ms',
                  boxShadow: (!answer.trim() || grading || submitted) ? 'none' : `0 0 24px ${roleColor}40` }}>
                {grading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 18, height: 18, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff' }} />
                    Scoring…
                  </>
                ) : submitted ? (
                  <><CheckCircle size={18} /> Submitted</>
                ) : (
                  <><Send size={18} /> Submit Answer</>
                )}
              </motion.button>
            </div>

            {/* Feedback on submission */}
            <AnimatePresence>
              {submitted && rounds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ padding: '14px 16px', borderRadius: 12,
                    background: `${scoreColor(rounds[rounds.length-1]?.score ?? 70)}12`,
                    border: `1px solid ${scoreColor(rounds[rounds.length-1]?.score ?? 70)}30` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 22, fontWeight: 900,
                      color: scoreColor(rounds[rounds.length-1]?.score ?? 70) }}>
                      {rounds[rounds.length-1]?.score ?? '—'}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700,
                      color: scoreColor(rounds[rounds.length-1]?.score ?? 70),
                      textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {rounds[rounds.length-1]?.verdict}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>
                    {rounds[rounds.length-1]?.feedback}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile: stack vertically */}
      <style>{`
        @media (max-width: 700px) {
          .interview-room { grid-template-columns: 1fr !important; overflow: auto !important; height: auto !important; }
        }
      `}</style>
    </div>
  )
}

export default function ClassicInterview() {
  return (
    <Suspense>
      <ClassicInterviewInner />
    </Suspense>
  )
}
