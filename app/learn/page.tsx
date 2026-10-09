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

const ACCENT = '#ec13d6'
const ACCENT2 = '#a30d94'
const BG = '#fff7ed'
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
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
      {/* nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: 'rgba(10,6,20,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(236,19,214,0.12)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, display: 'grid', placeItems: 'center', fontSize: 12, color: '#fff', fontWeight: 800 }}>A</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.2px' }}>AI<span style={{ color: ACCENT }}>Coach</span>Lab</span>
        </a>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <a href="/interview" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Interview</a>
          <a href="/tracks" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Tracks</a>
          <a href="/interview" style={{ fontSize: 12, fontWeight: 700, color: ACCENT, textDecoration: 'none', padding: '6px 14px', borderRadius: 8, border: `1px solid rgba(236,19,214,0.35)` }}>Mock interview →</a>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '48px 24px 48px' }}>
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}
          style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, background: 'rgba(236,19,214,0.1)', border: `1px solid rgba(236,19,214,0.3)`, marginBottom: 20 }}>
            <Zap size={11} color={ACCENT} />
            <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Zero to Hero</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 16px', color: '#0f172a' }}>
            What do you want to{' '}
            <span style={{ background: `linear-gradient(120deg,${ACCENT},${ACCENT2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>master today?</span>
          </h1>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.65, maxWidth: 480, margin: '0 auto 32px' }}>
            Type any topic. AI generates a complete animated lesson with code walkthroughs and a mock interview — in seconds.
          </p>

          <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
            <Search size={16} color="rgba(236,19,214,0.5)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder='e.g. "RAG with LlamaIndex", "Kubernetes networking", "Stripe webhooks"'
              style={{
                width: '100%', padding: '16px 120px 16px 44px', borderRadius: 14, fontSize: 14, color: '#0f172a',
                background: '#fff', border: `1px solid rgba(236,19,214,0.3)`,
                outline: 'none', boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            />
            <motion.button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{
                position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                padding: '8px 16px', borderRadius: 10, border: 'none',
                background: input.trim() ? `linear-gradient(135deg,${ACCENT},${ACCENT2})` : 'rgba(236,19,214,0.15)',
                color: input.trim() ? '#fff' : 'rgba(234,88,12,0.4)', fontSize: 12, fontWeight: 700,
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {loading ? 'Building…' : 'Generate'} {!loading && <ArrowRight size={12} />}
            </motion.button>
          </div>

          {gate.used > 0 && !gate.needsSignup && (
            <p style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
              {gate.used}/{gate.limit} free topics used
            </p>
          )}
          {gate.needsSignup && (
            <p style={{ marginTop: 8, fontSize: 12, color: '#dc2626' }}>
              Free limit reached — sign up for 10 more free topics
            </p>
          )}
        </motion.div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Existing lessons</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {searchResults.map(t => (
                <motion.a key={t.slug} href={`/learn/${t.slug}`} whileHover={{ x: 4 }}
                  style={{ padding: '12px 16px', borderRadius: 10, background: '#fff', border: `1px solid rgba(236,19,214,0.15)`, textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{t.title}</span>
                  <span style={{ fontSize: 11, color: ACCENT2 }}>{t.estimatedMins} min</span>
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <TrendingUp size={13} color={ACCENT} />
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Trending topics</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(trending.length ? trending.map(t => t.title) : SEED_TOPICS).map((label, i) => (
              <motion.button key={i} onClick={() => setInput(label)}
                whileHover={{ scale: 1.04, background: 'rgba(236,19,214,0.15)' }}
                whileTap={{ scale: 0.97 }}
                style={{ padding: '8px 16px', borderRadius: 999, border: `1px solid rgba(236,19,214,0.2)`, background: 'rgba(236,19,214,0.07)', color: ACCENT2, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
