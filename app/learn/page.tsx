'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, TrendingUp, Zap, ArrowRight } from 'lucide-react'
import type { Topic } from '@/lib/topics/schema'
import { checkGate, recordTopicUse } from '@/lib/learn/gate'

const SEED_TOPICS = [
  'RAG & Retrieval', 'AI Agents', 'MCP Protocol', 'LangGraph',
  'Video Generation API', 'System Design', 'TypeScript Advanced',
  'React Patterns', 'Kubernetes', 'Stripe Integration',
]

const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]

export default function LearnPage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [trending, setTrending] = useState<Topic[]>([])
  const [searchResults, setSearchResults] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [gate, setGate] = useState(() => checkGate())

  useEffect(() => {
    fetch('/api/topics/trending')
      .then(r => r.json())
      .then(d => setTrending(d.topics ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (input.length < 2) { setSearchResults([]); return }
    const t = setTimeout(() => {
      fetch(`/api/topics/search?q=${encodeURIComponent(input)}`)
        .then(r => r.json())
        .then(d => setSearchResults(d.topics ?? []))
        .catch(() => {})
    }, 300)
    return () => clearTimeout(t)
  }, [input])

  async function handleGenerate() {
    if (!input.trim()) return
    const currentGate = checkGate()
    setGate(currentGate)
    if (!currentGate.allowed) return
    setLoading(true)
    try {
      const res = await fetch('/api/topics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: input }),
      })
      const data = await res.json()
      if (data.topic) {
        recordTopicUse()
        router.push(`/learn/${data.topic.slug}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07080f', fontFamily: "'Inter', sans-serif", color: '#f0f4ff' }}>
      {/* bg blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '80px 24px 48px' }}>
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}
          style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 20 }}>
            <Zap size={11} color="#a78bfa" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Zero to Hero</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 16px' }}>
            What do you want to{' '}
            <span style={{ background: 'linear-gradient(120deg,#7c3aed,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>master today?</span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(180,190,220,0.55)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto 32px' }}>
            Type any topic. AI generates a complete animated lesson with code walkthroughs and a mock interview — in seconds.
          </p>

          <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
            <Search size={16} color="rgba(124,58,237,0.5)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder='e.g. "RAG with LlamaIndex", "Kubernetes networking", "Stripe webhooks"'
              style={{
                width: '100%', padding: '16px 120px 16px 44px', borderRadius: 14, fontSize: 14, color: '#f0f4ff',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.3)',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <motion.button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{
                position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                padding: '8px 16px', borderRadius: 10, border: 'none',
                background: input.trim() ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(124,58,237,0.15)',
                color: input.trim() ? '#fff' : 'rgba(167,139,250,0.4)', fontSize: 12, fontWeight: 700,
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {loading ? 'Building…' : 'Generate'} {!loading && <ArrowRight size={12} />}
            </motion.button>
          </div>

          {gate.used > 0 && !gate.needsSignup && (
            <p style={{ marginTop: 8, fontSize: 11, color: 'rgba(180,190,220,0.35)' }}>
              {gate.used}/{gate.limit} free topics used
            </p>
          )}
          {gate.needsSignup && (
            <p style={{ marginTop: 8, fontSize: 12, color: '#f59e0b' }}>
              Free limit reached — sign up for 10 more free topics
            </p>
          )}
        </motion.div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(180,190,220,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Existing lessons</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {searchResults.map(t => (
                <motion.a key={t.slug} href={`/learn/${t.slug}`} whileHover={{ x: 4 }}
                  style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.15)', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff' }}>{t.title}</span>
                  <span style={{ fontSize: 11, color: 'rgba(167,139,250,0.5)' }}>{t.estimatedMins} min</span>
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <TrendingUp size={13} color="#a78bfa" />
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(180,190,220,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Trending topics</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(trending.length ? trending.map(t => t.title) : SEED_TOPICS).map((label, i) => (
              <motion.button key={i} onClick={() => setInput(label)}
                whileHover={{ scale: 1.04, background: 'rgba(124,58,237,0.15)' }}
                whileTap={{ scale: 0.97 }}
                style={{ padding: '8px 16px', borderRadius: 999, border: '1px solid rgba(124,58,237,0.2)', background: 'rgba(124,58,237,0.07)', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
