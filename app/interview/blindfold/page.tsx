'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import VoiceInput from '@/components/interview/VoiceInput'
import BlindReveal from '@/components/interview/BlindReveal'
import { getRandomPersona, speakWithPersona, type Persona } from '@/lib/interview/personas'

const ROLES = [
  { id: 'swe', label: '💻 SWE', sub: 'Algorithms & systems' },
  { id: 'pm', label: '📋 PM', sub: 'Product & metrics' },
  { id: 'system', label: '🏗️ System Design', sub: 'Scale & architecture' },
  { id: 'behavioural', label: '🤝 Behavioural', sub: 'STAR stories' },
]

type Phase = 'setup' | 'interview' | 'reveal'
interface Message { role: 'interviewer' | 'candidate'; content: string }

export default function BlindFoldPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('setup')
  const [role, setRole] = useState('behavioural')
  const [persona] = useState<Persona>(() => getRandomPersona())
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [revealData, setRevealData] = useState<any>(null)
  const [roundCount, setRoundCount] = useState(0)
  const historyRef = useRef<{ role: string; content: string }[]>([])
  const MAX_ROUNDS = 4

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return
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
      setLoading(true)
      const res = await fetch('/api/interview/blindfold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grade', role, answer, conversationHistory: historyRef.current }),
      })
      const data = await res.json()
      setRevealData(data)
      setLoading(false)
      setPhase('reveal')
      return
    }

    setLoading(true)
    const res = await fetch('/api/interview/blindfold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'respond', role, personaPrompt: persona.systemPrompt, answer, conversationHistory: historyRef.current }),
    })
    const { text } = await res.json()
    historyRef.current.push({ role: 'assistant', content: text })
    setMessages(m => [...m, { role: 'interviewer', content: text }])
    setLoading(false)
    speak(text)
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#040408', color: '#f0f4ff',
      fontFamily: 'var(--font-body, system-ui)', position: 'relative', overflow: 'hidden' }}>

      {/* Atmosphere */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 500, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 20%, black, transparent)' }} />
      </div>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12,
        backdropFilter: 'blur(16px)', background: 'rgba(4,4,8,0.7)' }}>
        <motion.button onClick={() => router.push('/interview')}
          whileHover={{ x: -3 }} whileTap={{ scale: 0.94 }}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)',
            cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
          ← Back
        </motion.button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 800,
          letterSpacing: '-0.02em' }}>🎭 Blindfold Mode</div>
        {phase === 'interview' && (
          <div style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 700,
            background: 'rgba(139,92,246,0.12)', padding: '3px 10px', borderRadius: 99,
            border: '1px solid rgba(139,92,246,0.25)' }}>
            {roundCount + 1}/{MAX_ROUNDS}
          </div>
        )}
      </div>

      {/* Setup */}
      {phase === 'setup' && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
          style={{ position: 'relative', zIndex: 10, maxWidth: 560, margin: '0 auto',
            padding: '48px 20px', textAlign: 'center' }}>

          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}
            style={{ fontSize: 72, marginBottom: 24, display: 'block',
              filter: 'drop-shadow(0 0 24px rgba(139,92,246,0.5))' }}>
            🎭
          </motion.div>

          <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontWeight: 900,
            margin: '0 0 14px', letterSpacing: '-0.04em',
            background: 'linear-gradient(135deg, #f0f4ff, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Who are you talking to?
          </h1>
          <p style={{ color: 'rgba(167,243,208,0.5)', fontSize: 15, lineHeight: 1.65, maxWidth: 420, margin: '0 auto 40px' }}>
            Interview with a mystery interviewer. Human or AI? Find out only at the end. Most people cannot tell.
          </p>

          {/* Role grid — 2 cols on mobile, 2 cols on desktop */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32, textAlign: 'left' }}>
            {ROLES.map(r => (
              <motion.button key={r.id} onClick={() => setRole(r.id)}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{ padding: '14px 16px', borderRadius: 14,
                  border: `2px solid ${role === r.id ? '#8b5cf6' : 'rgba(255,255,255,0.07)'}`,
                  background: role === r.id ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.025)',
                  color: '#f0f4ff', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s',
                  boxShadow: role === r.id ? '0 0 20px rgba(139,92,246,0.2)' : 'none' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{r.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{r.sub}</div>
              </motion.button>
            ))}
          </div>

          <motion.button onClick={startInterview} disabled={loading}
            whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(139,92,246,0.5)' }}
            whileTap={{ scale: 0.96 }}
            style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: loading ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              color: '#fff', fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em',
              boxShadow: loading ? 'none' : '0 0 28px rgba(139,92,246,0.35)',
              transition: 'box-shadow 0.3s' }}>
            {loading ? 'Connecting…' : 'Enter the interview →'}
          </motion.button>

          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 14, letterSpacing: '0.04em' }}>
            VOICE-FIRST · SPEAK YOUR ANSWERS · MIC REQUIRED
          </p>
        </motion.div>
      )}

      {/* Interview */}
      {phase === 'interview' && (
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 680, margin: '0 auto',
          padding: '24px 16px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 56px)' }}>

          {/* Mystery interviewer card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24,
              padding: '14px 18px', background: 'rgba(139,92,246,0.07)',
              border: '1px solid rgba(139,92,246,0.2)', borderRadius: 16 }}>
            <motion.div
              animate={{ boxShadow: ['0 0 0 0 rgba(139,92,246,0.4)', '0 0 0 8px rgba(139,92,246,0)', '0 0 0 0 rgba(139,92,246,0)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.7), rgba(99,102,241,0.5))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>?</motion.div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Mystery Interviewer</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Identity revealed at the end</div>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {[0,1,2].map(i => (
                <motion.div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6' }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </motion.div>

          {/* Message thread — flex-grow to push voice input to bottom */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24,
            overflowY: 'auto', paddingRight: 4 }}>
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  style={{
                    alignSelf: m.role === 'candidate' ? 'flex-end' : 'flex-start',
                    maxWidth: '82%', padding: '13px 17px', fontSize: 14, lineHeight: 1.6, color: '#f0f4ff',
                    borderRadius: m.role === 'candidate' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: m.role === 'candidate'
                      ? 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.15))'
                      : 'rgba(255,255,255,0.055)',
                    border: m.role === 'candidate' ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: m.role === 'candidate' ? '0 4px 20px rgba(139,92,246,0.15)' : 'none',
                  }}>
                  {m.content}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ alignSelf: 'flex-start', padding: '13px 18px',
                  background: 'rgba(255,255,255,0.04)', borderRadius: '18px 18px 18px 4px',
                  border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 6, alignItems: 'center' }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(139,92,246,0.6)' }}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </motion.div>
            )}
          </div>

          {/* Voice input — pinned to bottom */}
          {!loading && (
            <div style={{ textAlign: 'center', paddingTop: 8,
              borderTop: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16 }}>
              <VoiceInput onTranscript={handleAnswer} accentColor="#8b5cf6" placeholder="Tap to speak your answer" />
            </div>
          )}
        </div>
      )}

      {/* Reveal */}
      {phase === 'reveal' && revealData && (
        <BlindReveal
          isHuman={persona.isHuman}
          personaName={persona.name}
          personaTitle={persona.title}
          score={revealData.score ?? 72}
          verdict={revealData.verdict ?? 'Solid performance overall.'}
          topStrength={revealData.top_strength ?? 'Clear communication'}
          topImprovement={revealData.top_improvement ?? 'Add more quantified results'}
          onRestart={() => { setPhase('setup'); setMessages([]); setRoundCount(0) }}
        />
      )}
    </div>
  )
}
