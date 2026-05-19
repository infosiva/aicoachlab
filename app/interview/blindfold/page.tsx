'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Mic, MicOff, Volume2, ArrowLeft, Clock } from 'lucide-react'
import { getRandomPersona, speakWithPersona, type Persona } from '@/lib/interview/personas'

// ── Design tokens (OLED dark + gold reveal) ───────────────────────────────────
const C = {
  bg:        '#0A0A14',
  surface:   'rgba(255,255,255,0.03)',
  border:    'rgba(255,255,255,0.07)',
  purple:    '#8b5cf6',
  purpleGlow:'rgba(139,92,246,0.35)',
  gold:      '#CA8A04',
  goldLight: '#fbbf24',
  goldGlow:  'rgba(202,138,4,0.4)',
  green:     '#10b981',
  red:       '#ef4444',
  text:      '#f8fafc',
  muted:     'rgba(248,250,252,0.45)',
  ease:      'cubic-bezier(0.23, 1, 0.32, 1)',
}

const ROLES = [
  { id: 'swe',         label: 'Software Engineer',  icon: '{ }',  sub: 'Algorithms · Systems · Design' },
  { id: 'pm',          label: 'Product Manager',     icon: '◈',   sub: 'Strategy · Metrics · Roadmap' },
  { id: 'system',      label: 'System Design',       icon: '⬡',   sub: 'Scale · Architecture · Trade-offs' },
  { id: 'behavioural', label: 'Behavioural',         icon: '◎',   sub: 'Leadership · STAR · Conflict' },
]

type Phase = 'setup' | 'interview' | 'reveal'

interface Message {
  role: 'interviewer' | 'candidate'
  content: string
  timestamp: number
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '12px 16px',
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: '18px 18px 18px 4px', width: 'fit-content' }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          style={{ width: 7, height: 7, borderRadius: '50%', background: C.muted }}
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }} />
      ))}
    </div>
  )
}

// ── Waveform (voice visualiser) ───────────────────────────────────────────────
function VoiceWave({ active, color }: { active: boolean; color: string }) {
  const bars = 5
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 24 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div key={i}
          style={{ width: 3, borderRadius: 99, background: color, originY: 0.5 }}
          animate={active ? {
            height: [6, 18 + Math.random() * 10, 6],
            opacity: [0.5, 1, 0.5],
          } : { height: 4, opacity: 0.3 }}
          transition={active ? {
            duration: 0.5 + Math.random() * 0.3,
            repeat: Infinity,
            delay: i * 0.08,
            ease: 'easeInOut',
          } : { duration: 0.2 }}
        />
      ))}
    </div>
  )
}

// ── Dramatic reveal ───────────────────────────────────────────────────────────
function RevealScreen({
  persona, score, verdict, topStrength, topImprovement, onRestart
}: {
  persona: Persona; score: number; verdict: string
  topStrength: string; topImprovement: string; onRestart: () => void
}) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    // 0 → darkness → 1 → identity flash → 2 → details
    const t1 = setTimeout(() => setStage(1), 600)
    const t2 = setTimeout(() => setStage(2), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ position: 'fixed', inset: 0, zIndex: 50,
        background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px', overflowY: 'auto' }}>

      {/* Stage 1 — identity reveal */}
      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div key="suspense" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
            style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: C.muted, fontWeight: 600 }}>
              Revealing identity…
            </motion.div>
          </motion.div>
        )}

        {stage >= 1 && (
          <motion.div key="reveal"
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

            {/* Giant identity icon with blur crossfade */}
            <motion.div
              initial={{ filter: 'blur(20px)', scale: 0.8 }}
              animate={{ filter: 'blur(0px)', scale: 1 }}
              transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
              style={{ fontSize: 88, marginBottom: 12,
                filter: `drop-shadow(0 0 40px ${persona.isHuman ? '#60a5fa88' : C.purpleGlow})` }}>
              {persona.isHuman ? '👤' : '🤖'}
            </motion.div>

            {/* Gold flash label */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 16px', borderRadius: 99, marginBottom: 16,
                background: persona.isHuman ? 'rgba(96,165,250,0.12)' : `${C.purpleGlow}`,
                border: `1px solid ${persona.isHuman ? 'rgba(96,165,250,0.35)' : C.purple + '55'}`,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: persona.isHuman ? '#60a5fa' : C.purple }}>
              {persona.isHuman ? '— Real Human —' : '— AI Model —'}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900,
                letterSpacing: '-0.04em', margin: '0 0 4px', color: C.text }}>
              {persona.name}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              style={{ color: C.muted, fontSize: 13, margin: '0 0 32px' }}>
              {persona.title}
            </motion.p>

            {/* Score — animates up */}
            {stage >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}>

                <div style={{ background: 'rgba(255,255,255,0.03)',
                  border: `1px solid rgba(255,255,255,0.07)`,
                  borderRadius: 20, padding: '24px 28px', marginBottom: 16 }}>
                  <ScoreCounter target={score} />
                  <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, marginTop: 12, marginBottom: 0 }}>
                    {verdict}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: 14, padding: '14px 16px', textAlign: 'left' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.green,
                      textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                      Strength
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                      {topStrength}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(202,138,4,0.07)', border: '1px solid rgba(202,138,4,0.22)',
                    borderRadius: 14, padding: '14px 16px', textAlign: 'left' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.goldLight,
                      textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                      Work On
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                      {topImprovement}
                    </div>
                  </div>
                </div>

                <motion.button onClick={onRestart}
                  whileHover={{ scale: 1.03, boxShadow: `0 0 40px ${C.purpleGlow}` }}
                  whileTap={{ scale: 0.97 }}
                  style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none',
                    cursor: 'pointer', fontWeight: 800, fontSize: 15, color: '#fff',
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    boxShadow: `0 0 24px ${C.purpleGlow}`,
                    transition: `box-shadow 300ms ${C.ease}`,
                    letterSpacing: '-0.02em' }}>
                  Interview again →
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Animated score counter ────────────────────────────────────────────────────
function ScoreCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0)
  const color = target >= 75 ? C.green : target >= 55 ? C.goldLight : C.red

  useEffect(() => {
    let n = 0
    const step = () => {
      n += Math.ceil((target - n) * 0.12) || 1
      if (n >= target) { setDisplay(target); return }
      setDisplay(n)
      requestAnimationFrame(step)
    }
    const t = setTimeout(() => requestAnimationFrame(step), 200)
    return () => clearTimeout(t)
  }, [target])

  return (
    <div>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.3 }}
        style={{ fontSize: 64, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.05em' }}>
        {display}
      </motion.div>
      <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase',
        letterSpacing: '0.12em', marginTop: 4 }}>
        Performance score
      </div>
    </div>
  )
}

// ── Voice input button ────────────────────────────────────────────────────────
function MicButton({ listening, disabled, onToggle }: {
  listening: boolean; disabled: boolean; onToggle: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <motion.button
        onClick={onToggle}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.07 } : {}}
        whileTap={!disabled ? { scale: 0.93 } : {}}
        animate={listening ? {
          boxShadow: [
            `0 0 0 0 ${C.purpleGlow}`,
            `0 0 0 20px rgba(139,92,246,0)`,
            `0 0 0 0 rgba(139,92,246,0)`,
          ],
        } : {}}
        transition={listening ? { duration: 1.4, repeat: Infinity } : {}}
        style={{ width: 76, height: 76, borderRadius: '50%', border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: listening
            ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
            : 'rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
          transition: `background 250ms ${C.ease}` }}>
        {listening
          ? <MicOff size={26} color="#fff" />
          : <Mic size={26} color="rgba(255,255,255,0.7)" />}
      </motion.button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <VoiceWave active={listening} color={C.purple} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: listening ? C.purple : C.muted,
          transition: `color 200ms` }}>
          {listening ? 'Listening…' : 'Tap to speak'}
        </span>
        <VoiceWave active={listening} color={C.purple} />
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BlindFoldPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('setup')
  const [role, setRole] = useState('behavioural')
  const [persona] = useState<Persona>(getRandomPersona)
  const [messages, setMessages] = useState<Message[]>([])
  const [listening, setListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(false)
  const [roundCount, setRoundCount] = useState(0)
  const [revealData, setRevealData] = useState<any>(null)
  const historyRef = useRef<{ role: string; content: string }[]>([])
  const recRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const MAX_ROUNDS = 4

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const speak = useCallback((text: string, onDone?: () => void) => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const utt = speakWithPersona(text, persona)
    setInterviewerSpeaking(true)
    utt.onend = () => { setInterviewerSpeaking(false); onDone?.() }
    utt.onerror = () => { setInterviewerSpeaking(false); onDone?.() }
    window.speechSynthesis.speak(utt)
  }, [persona])

  function startVoice() {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) { alert('Voice not supported — please use Chrome or Edge'); return }
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join(' ')
        .trim()
      if (transcript) handleAnswer(transcript)
    }
    recRef.current = rec
    rec.start()
  }

  function stopVoice() {
    recRef.current?.stop()
    setListening(false)
  }

  function toggleMic() {
    if (listening) stopVoice()
    else startVoice()
  }

  async function startInterview() {
    setLoading(true)
    const res = await fetch('/api/interview/blindfold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'question', role, personaPrompt: persona.systemPrompt }),
    })
    const { text } = await res.json()
    historyRef.current = [{ role: 'assistant', content: text }]
    const msg: Message = { role: 'interviewer', content: text, timestamp: Date.now() }
    setMessages([msg])
    setPhase('interview')
    setLoading(false)
    // Small pause before speaking — feels more human
    setTimeout(() => speak(text), 400)
  }

  async function handleAnswer(answer: string) {
    if (!answer.trim() || loading) return
    stopVoice()
    const candidateMsg: Message = { role: 'candidate', content: answer, timestamp: Date.now() }
    setMessages(m => [...m, candidateMsg])
    historyRef.current.push({ role: 'user', content: answer })
    const newRound = roundCount + 1
    setRoundCount(newRound)

    setLoading(true)

    if (newRound >= MAX_ROUNDS) {
      const res = await fetch('/api/interview/blindfold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grade', role, answer, conversationHistory: historyRef.current }),
      })
      const data = await res.json()
      setRevealData(data)
      setLoading(false)
      // Pause for drama before reveal
      setTimeout(() => setPhase('reveal'), 800)
      return
    }

    const res = await fetch('/api/interview/blindfold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'respond', role,
        personaPrompt: persona.systemPrompt,
        answer, conversationHistory: historyRef.current,
      }),
    })
    const { text } = await res.json()
    historyRef.current.push({ role: 'assistant', content: text })
    const interviewerMsg: Message = { role: 'interviewer', content: text, timestamp: Date.now() }
    setMessages(m => [...m, interviewerMsg])
    setLoading(false)
    setTimeout(() => speak(text), 300)
  }

  // ── Setup screen ─────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div style={{ minHeight: '100dvh', background: C.bg, color: C.text,
        fontFamily: 'Inter, system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>

        {/* Atmosphere */}
        <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
            width: 700, height: 600, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.16) 0%, transparent 68%)',
            filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            maskImage: 'radial-gradient(ellipse 70% 55% at 50% 25%, black, transparent)' }} />
        </div>

        {/* Header */}
        <div style={{ position: 'relative', zIndex: 10, padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.button onClick={() => router.push('/interview')}
            whileHover={{ x: -3 }} whileTap={{ scale: 0.94 }}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: C.muted, display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
            <ArrowLeft size={14} /> Back
          </motion.button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 700,
            letterSpacing: '-0.02em', color: C.text }}>
            Blindfold Mode
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          style={{ position: 'relative', zIndex: 10, maxWidth: 540, margin: '0 auto',
            padding: '52px 20px 40px', textAlign: 'center' }}>

          {/* Question mark avatar — the whole point */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 96, height: 96, borderRadius: '50%', margin: '0 auto 28px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.15))',
              border: '2px solid rgba(139,92,246,0.35)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 42, fontWeight: 900, color: C.purple,
              boxShadow: `0 0 60px ${C.purpleGlow}` }}>
            ?
          </motion.div>

          <h1 style={{ fontSize: 'clamp(1.65rem, 5vw, 2.4rem)', fontWeight: 900,
            letterSpacing: '-0.04em', margin: '0 0 14px', lineHeight: 1.1,
            background: `linear-gradient(135deg, ${C.text} 0%, rgba(139,92,246,0.9) 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Who are you<br />talking to?
          </h1>

          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.65, maxWidth: 400,
            margin: '0 auto 40px' }}>
            Interview with a mystery interviewer. Human or AI — you only find out at the end.
            Most people cannot tell the difference.
          </p>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
            {ROLES.map(r => (
              <motion.button key={r.id} onClick={() => setRole(r.id)}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                style={{ padding: '14px 16px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                  border: `2px solid ${role === r.id ? C.purple : C.border}`,
                  background: role === r.id ? 'rgba(139,92,246,0.12)' : C.surface,
                  color: C.text, transition: `all 220ms ${C.ease}`,
                  boxShadow: role === r.id ? `0 0 20px rgba(139,92,246,0.2)` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 16, color: role === r.id ? C.purple : C.muted,
                    fontWeight: 700, fontFamily: 'monospace' }}>{r.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>{r.label}</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>{r.sub}</div>
              </motion.button>
            ))}
          </div>

          {/* Round indicators */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
            {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
              <div key={i} style={{ width: 28, height: 4, borderRadius: 99,
                background: 'rgba(255,255,255,0.1)' }} />
            ))}
            <span style={{ fontSize: 11, color: C.muted, marginLeft: 8, alignSelf: 'center' }}>
              {MAX_ROUNDS} questions
            </span>
          </div>

          <motion.button onClick={startInterview} disabled={loading}
            whileHover={!loading ? { scale: 1.03, boxShadow: `0 0 48px ${C.purpleGlow}` } : {}}
            whileTap={!loading ? { scale: 0.96 } : {}}
            style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 16,
              letterSpacing: '-0.02em', color: '#fff',
              background: loading
                ? 'rgba(139,92,246,0.25)'
                : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              boxShadow: loading ? 'none' : `0 0 32px ${C.purpleGlow}`,
              transition: `all 300ms ${C.ease}` }}>
            {loading ? 'Connecting…' : 'Enter the interview →'}
          </motion.button>

          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', marginTop: 14,
            letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Voice-first · Speak your answers · Chrome recommended
          </p>
        </motion.div>
      </div>
    )
  }

  // ── Interview screen ──────────────────────────────────────────────────────────
  if (phase === 'interview') {
    return (
      <div style={{ minHeight: '100dvh', background: C.bg, color: C.text,
        fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden' }}>

        {/* Subtle bg glow */}
        <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
            width: 600, height: 500, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)',
            filter: 'blur(80px)' }} />
        </div>

        {/* Header */}
        <div style={{ position: 'relative', zIndex: 10, padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
          background: 'rgba(10,10,20,0.8)',
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <motion.button onClick={() => { stopVoice(); setPhase('setup') }}
            whileHover={{ x: -3 }} whileTap={{ scale: 0.94 }}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: C.muted, display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
            <ArrowLeft size={14} /> Exit
          </motion.button>

          {/* Mystery interviewer identity */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <motion.div
              animate={{ boxShadow: interviewerSpeaking
                ? [`0 0 0 0 ${C.purpleGlow}`, `0 0 0 10px rgba(139,92,246,0)`, `0 0 0 0 rgba(139,92,246,0)`]
                : `0 0 0 0 rgba(0,0,0,0)` }}
              transition={{ duration: 1.6, repeat: interviewerSpeaking ? Infinity : 0 }}
              style={{ width: 32, height: 32, borderRadius: '50%',
                background: `linear-gradient(135deg, rgba(139,92,246,0.6), rgba(99,102,241,0.3))`,
                border: `2px solid ${interviewerSpeaking ? C.purple : 'rgba(139,92,246,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 900, color: C.purple,
                transition: `border-color 300ms` }}>?</motion.div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Mystery Interviewer</div>
              <div style={{ fontSize: 10, color: C.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
                {interviewerSpeaking
                  ? <><Volume2 size={10} color={C.purple} /> Speaking</>
                  : <>Identity hidden</>}
              </div>
            </div>
          </div>

          {/* Round progress */}
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
              <div key={i} style={{ width: 20, height: 4, borderRadius: 99,
                background: i < roundCount ? C.purple : 'rgba(255,255,255,0.1)',
                transition: `background 400ms ${C.ease}` }} />
            ))}
          </div>
        </div>

        {/* Message thread */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px',
          display: 'flex', flexDirection: 'column', gap: 14,
          maxWidth: 680, width: '100%', margin: '0 auto',
          boxSizing: 'border-box', position: 'relative', zIndex: 10 }}>

          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                style={{ alignSelf: m.role === 'candidate' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%' }}>
                <div style={{
                  padding: '13px 17px', fontSize: 14, lineHeight: 1.65, color: C.text,
                  borderRadius: m.role === 'candidate' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                  background: m.role === 'candidate'
                    ? 'linear-gradient(135deg, rgba(139,92,246,0.22), rgba(99,102,241,0.12))'
                    : C.surface,
                  border: `1px solid ${m.role === 'candidate' ? 'rgba(139,92,246,0.28)' : C.border}`,
                  boxShadow: m.role === 'candidate'
                    ? '0 4px 20px rgba(139,92,246,0.12)' : 'none',
                }}>
                  {m.content}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)',
                  marginTop: 5, textAlign: m.role === 'candidate' ? 'right' : 'left',
                  paddingLeft: m.role === 'interviewer' ? 4 : 0,
                  paddingRight: m.role === 'candidate' ? 4 : 0 }}>
                  {m.role === 'interviewer' ? 'Interviewer' : 'You'}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}>
              <TypingIndicator />
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice input — pinned bottom */}
        <div style={{ position: 'relative', zIndex: 10, flexShrink: 0,
          padding: '16px 20px 28px', borderTop: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)', background: 'rgba(10,10,20,0.85)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <AnimatePresence>
              {!loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  style={{ textAlign: 'center' }}>
                  <MicButton listening={listening} disabled={loading} onToggle={toggleMic} />
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 12,
                    letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {roundCount + 1} of {MAX_ROUNDS} · {role.toUpperCase()}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    )
  }

  // ── Reveal ────────────────────────────────────────────────────────────────────
  if (phase === 'reveal' && revealData) {
    return (
      <RevealScreen
        persona={persona}
        score={revealData.score ?? 72}
        verdict={revealData.verdict ?? 'Solid performance. A few things to work on.'}
        topStrength={revealData.top_strength ?? 'Clear communication'}
        topImprovement={revealData.top_improvement ?? 'Quantify your results more'}
        onRestart={() => {
          setPhase('setup')
          setMessages([])
          setRoundCount(0)
          setRevealData(null)
        }}
      />
    )
  }

  return null
}
