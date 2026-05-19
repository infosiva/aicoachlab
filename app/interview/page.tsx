'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const MODES = [
  {
    id: 'blindfold',
    title: 'Blindfold Mode',
    emoji: '🎭',
    tagline: 'Bot or human? You decide.',
    desc: "Interview with a mystery interviewer. Only at the end do you find out if you were talking to an AI or a person. Most people can't tell.",
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
    desc: "An AI coach whispers corrections as you speak. Filler word counter, STAR tracker, pacing alerts — like having a coach in your ear.",
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
    desc: "Say a topic. Watch it animate onto a canvas with voice narration — system design diagrams, algorithms, frameworks — no one teaches like this.",
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

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', paddingTop: 72, paddingBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 99, fontSize: 12, fontWeight: 700, color: '#a78bfa',
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
          🚀 Interview Platform v2
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
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
              padding: '32px 28px 28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200,
              borderRadius: '50%', background: `radial-gradient(circle, ${m.glow} 0%, transparent 70%)`,
              filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 700,
              padding: '3px 10px', borderRadius: 99, marginBottom: 20,
              background: `${m.color}22`, color: m.color, border: `1px solid ${m.color}44` }}>
              {m.badge}
            </div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{m.emoji}</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px',
              color: '#f0f4ff', letterSpacing: '-0.03em' }}>{m.title}</h2>
            <div style={{ fontSize: 13, fontWeight: 700, color: m.color,
              marginBottom: 12 }}>{m.tagline}</div>
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
