'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import ConceptCanvas from '@/components/interview/ConceptCanvas'

const SUGGESTED = [
  'Hash Map internals', 'CAP theorem', 'STAR method', 'Load balancer design',
  'TCP vs UDP', 'REST vs GraphQL', 'Database indexing', 'Binary search',
  'Microservices vs monolith', 'How OAuth works', 'Consistent hashing', 'Rate limiting',
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

  const currentStep = script?.steps[stepIndex] ?? null

  return (
    <div style={{ minHeight: '100vh', background: '#030a06', color: '#f0f4ff', fontFamily: 'var(--font-body, system-ui)' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.push('/interview')}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13 }}>
          ← Back
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 16 }}>🎬 Concept Cinema</div>
        {playing && <div style={{ fontSize: 12, color: '#f97316' }}>● Narrating…</div>}
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && explain(input)}
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
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>{script.title}</h2>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                Step {stepIndex + 1} / {script.steps.length}
              </div>
            </div>

            <ConceptCanvas step={currentStep} stepIndex={stepIndex} />

            <AnimatePresence mode="wait">
              <motion.div key={stepIndex}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ margin: '20px 0', padding: '18px 22px',
                  background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 14 }}>
                <div style={{ fontSize: 11, color: '#f97316', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', marginBottom: 8 }}>
                  {currentStep?.label}
                </div>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, margin: 0 }}>
                  {currentStep?.narration}
                </p>
              </motion.div>
            </AnimatePresence>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              {script.steps.map((s, i) => (
                <button key={i} onClick={() => goToStep(i)}
                  style={{ padding: '8px 16px', borderRadius: 99, border: 'none', cursor: 'pointer',
                    background: i === stepIndex ? '#f97316' : 'rgba(255,255,255,0.06)',
                    color: i === stepIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                    fontSize: 13, fontWeight: i === stepIndex ? 700 : 400, transition: 'all 0.2s' }}>
                  {i + 1}. {s.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => goToStep(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: stepIndex === 0 ? 'rgba(255,255,255,0.2)' : '#f0f4ff',
                  cursor: stepIndex === 0 ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600 }}>
                ← Previous
              </button>
              {stepIndex < script.steps.length - 1 ? (
                <button onClick={() => goToStep(stepIndex + 1)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', fontSize: 14, fontWeight: 700 }}>
                  Next →
                </button>
              ) : (
                <button onClick={() => { setScript(null); setInput('') }}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', fontSize: 14, fontWeight: 700 }}>
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
