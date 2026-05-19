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
    <div style={{ minHeight: '100vh', background: '#030a06', color: '#f0f4ff', fontFamily: 'var(--font-body, system-ui)' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.push('/interview')}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13 }}>
          ← Back
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 800 }}>🎭 Blindfold Mode</div>
        {phase === 'interview' && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Round {roundCount + 1}/{MAX_ROUNDS}</div>
        )}
      </div>

      {/* Setup */}
      {phase === 'setup' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎭</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.03em' }}>
            Who are you talking to?
          </h1>
          <p style={{ color: 'rgba(167,243,208,0.55)', fontSize: 15, margin: '0 0 36px', lineHeight: 1.6 }}>
            Interview with a mystery interviewer. Find out at the end if it was human or AI. Most people cannot tell.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
            {ROLES.map(r => (
              <button key={r.id} onClick={() => setRole(r.id)}
                style={{ padding: '14px 16px', borderRadius: 12,
                  border: `2px solid ${role === r.id ? '#8b5cf6' : 'rgba(255,255,255,0.08)'}`,
                  background: role === r.id ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                  color: '#f0f4ff', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s' }}>
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
        </motion.div>
      )}

      {/* Interview */}
      {phase === 'interview' && (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28,
            padding: '16px 20px', background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.6), rgba(99,102,241,0.4))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>?</div>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: m.role === 'candidate' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%', padding: '14px 18px', fontSize: 15, lineHeight: 1.6, color: '#f0f4ff',
                    borderRadius: m.role === 'candidate' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: m.role === 'candidate' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)',
                    border: m.role === 'candidate' ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.08)',
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

          {!loading && (
            <div style={{ textAlign: 'center' }}>
              <VoiceInput onTranscript={handleAnswer} accentColor="#8b5cf6" placeholder="Tap to answer" />
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
