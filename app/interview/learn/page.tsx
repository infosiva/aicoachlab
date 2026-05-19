'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import ConceptCanvas from '@/components/interview/ConceptCanvas'

const SUGGESTED = [
  { label: 'Hash Map internals', emoji: '#️⃣' },
  { label: 'CAP theorem', emoji: '⚖️' },
  { label: 'STAR method', emoji: '⭐' },
  { label: 'Load balancer', emoji: '⚡' },
  { label: 'TCP vs UDP', emoji: '🔌' },
  { label: 'REST vs GraphQL', emoji: '🔗' },
  { label: 'Database indexing', emoji: '📚' },
  { label: 'Binary search', emoji: '🔍' },
  { label: 'Microservices', emoji: '🧩' },
  { label: 'OAuth flow', emoji: '🔐' },
  { label: 'Consistent hashing', emoji: '🔄' },
  { label: 'Rate limiting', emoji: '🚦' },
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
    try {
      const res = await fetch('/api/interview/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept }),
      })
      const data = await res.json()
      setScript(data)
      if (data.steps?.[0]) narrate(data.steps[0].narration)
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  function narrate(text: string) {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.9; utt.pitch = 1.0
    setPlaying(true)
    utt.onend = () => setPlaying(false)
    window.speechSynthesis.speak(utt)
  }

  function goToStep(i: number) {
    if (!script) return
    setStepIndex(i)
    narrate(script.steps[i].narration)
  }

  const currentStep = script?.steps[stepIndex] ?? null

  return (
    <div style={{ minHeight: '100dvh', background: '#040408', color: '#f0f4ff',
      fontFamily: 'var(--font-body, system-ui)', position: 'relative', overflow: 'hidden' }}>

      {/* Atmosphere */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '30%',
          width: 600, height: 500, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(249,115,22,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '20%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,88,12,0.1) 0%, transparent 70%)',
          filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 10%, black, transparent)' }} />
      </div>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12,
        backdropFilter: 'blur(16px)', background: 'rgba(4,4,8,0.7)' }}>
        <motion.button onClick={() => router.push('/interview')}
          whileHover={{ x: -3 }} whileTap={{ scale: 0.94 }}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 13 }}>
          ← Back
        </motion.button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em' }}>
          🎬 Concept Cinema
        </div>
        <AnimatePresence>
          {playing && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              style={{ fontSize: 11, color: '#f97316', fontWeight: 700,
                background: 'rgba(249,115,22,0.12)', padding: '3px 10px', borderRadius: 99,
                border: '1px solid rgba(249,115,22,0.25)' }}>
              ● Narrating
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 820, margin: '0 auto',
        padding: '28px 16px 48px' }}>

        {/* Search bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && explain(input)}
              placeholder="Type any CS or interview concept…"
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, padding: '14px 18px', color: '#f0f4ff', fontSize: 15, outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(249,115,22,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
          <motion.button onClick={() => explain(input)} disabled={loading}
            whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(249,115,22,0.4)' }}
            whileTap={{ scale: 0.95 }}
            style={{ padding: '14px 22px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: loading ? 'rgba(249,115,22,0.25)' : 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#fff', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
              boxShadow: loading ? 'none' : '0 0 20px rgba(249,115,22,0.3)',
              transition: 'all 0.3s', flexShrink: 0 }}>
            {loading ? '⏳' : '▶ Explain'}
          </motion.button>
        </motion.div>

        {/* Suggestions — wrap nicely on mobile */}
        {!script && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
            {SUGGESTED.map((s, i) => (
              <motion.button key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                onClick={() => { setInput(s.label); explain(s.label) }}
                whileHover={{ scale: 1.05, borderColor: 'rgba(249,115,22,0.4)' }}
                whileTap={{ scale: 0.95 }}
                style={{ padding: '7px 13px', borderRadius: 99,
                  border: '1px solid rgba(249,115,22,0.2)',
                  background: 'rgba(249,115,22,0.07)', color: 'rgba(255,255,255,0.55)',
                  fontSize: 12, cursor: 'pointer', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>{s.emoji}</span> {s.label}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Loading state — cinematic */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '64px 0' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{ fontSize: 56, display: 'inline-block', marginBottom: 20,
                  filter: 'drop-shadow(0 0 20px rgba(249,115,22,0.6))' }}>
                🎬
              </motion.div>
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, letterSpacing: '0.06em' }}>
                Generating visual explanation…
              </motion.div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
                {['Parsing concept', 'Building nodes', 'Writing narration', 'Scripting animation'].map((s, i) => (
                  <motion.div key={s}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.4 }}
                    style={{ fontSize: 10, color: 'rgba(249,115,22,0.6)', padding: '3px 10px',
                      background: 'rgba(249,115,22,0.08)', borderRadius: 99,
                      border: '1px solid rgba(249,115,22,0.15)' }}>
                    {s}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Script viewer */}
        <AnimatePresence>
          {script && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800, margin: 0,
                  letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #f0f4ff, #f97316)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {script.title}
                </h2>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 99 }}>
                  {stepIndex + 1} / {script.steps.length}
                </div>
              </div>

              {/* Canvas with glow border */}
              <div style={{ borderRadius: 18, overflow: 'hidden',
                boxShadow: '0 0 60px rgba(249,115,22,0.12), 0 0 0 1px rgba(249,115,22,0.2)',
                marginBottom: 20 }}>
                <ConceptCanvas step={currentStep} stepIndex={stepIndex} />
              </div>

              {/* Narration card */}
              <AnimatePresence mode="wait">
                <motion.div key={stepIndex}
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.3 }}
                  style={{ margin: '0 0 20px', padding: '18px 22px',
                    background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.18)',
                    borderRadius: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <motion.button
                    onClick={() => narrate(currentStep?.narration ?? '')}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
                      borderRadius: '50%', width: 36, height: 36, fontSize: 14, cursor: 'pointer',
                      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🔊
                  </motion.button>
                  <div>
                    <div style={{ fontSize: 10, color: '#f97316', fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', marginBottom: 8 }}>{currentStep?.label}</div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, margin: 0 }}>
                      {currentStep?.narration}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Step pills — scrollable on mobile */}
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16,
                scrollbarWidth: 'none' }}>
                {script.steps.map((s, i) => (
                  <motion.button key={i} onClick={() => goToStep(i)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    style={{ padding: '8px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
                      background: i === stepIndex
                        ? 'linear-gradient(135deg, #f97316, #ea580c)'
                        : 'rgba(255,255,255,0.06)',
                      color: i === stepIndex ? '#fff' : 'rgba(255,255,255,0.45)',
                      fontSize: 12, fontWeight: i === stepIndex ? 700 : 400,
                      whiteSpace: 'nowrap', flexShrink: 0,
                      boxShadow: i === stepIndex ? '0 0 16px rgba(249,115,22,0.4)' : 'none' }}>
                    {i + 1}. {s.label}
                  </motion.button>
                ))}
              </div>

              {/* Prev / Next */}
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button onClick={() => goToStep(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}
                  whileHover={{ scale: stepIndex === 0 ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{ flex: 1, padding: '13px', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    color: stepIndex === 0 ? 'rgba(255,255,255,0.2)' : '#f0f4ff',
                    cursor: stepIndex === 0 ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600 }}>
                  ← Prev
                </motion.button>
                {stepIndex < script.steps.length - 1 ? (
                  <motion.button onClick={() => goToStep(stepIndex + 1)}
                    whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(249,115,22,0.4)' }}
                    whileTap={{ scale: 0.96 }}
                    style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: '#fff', fontSize: 14, fontWeight: 700,
                      boxShadow: '0 0 16px rgba(249,115,22,0.3)' }}>
                    Next →
                  </motion.button>
                ) : (
                  <motion.button onClick={() => { setScript(null); setInput('') }}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                    style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: '#fff', fontSize: 14, fontWeight: 700 }}>
                    Learn another →
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile-safe bottom padding */}
      <style>{`
        @media (max-width: 640px) {
          input { font-size: 16px !important; }
        }
      `}</style>
    </div>
  )
}
