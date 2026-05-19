'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const MODES = [
  {
    id: 'blindfold',
    title: 'Blindfold Mode',
    emoji: '🎭',
    tagline: 'Bot or human? You decide.',
    desc: "Interview with a mystery interviewer. Only at the end do you find out if it was AI or human. Most people can't tell. Can you?",
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.5)',
    href: '/interview/blindfold',
    badge: '🔥 Most viral',
    stats: ['4 rounds', 'Voice-first', 'Reveal at end'],
  },
  {
    id: 'live',
    title: 'Live Coach',
    emoji: '🎯',
    tagline: 'Real-time mid-answer feedback.',
    desc: "AI coach whispers tips as you speak. Filler word counter, STAR method tracker, pacing alerts — like having a coach in your ear.",
    color: '#10b981',
    glow: 'rgba(16,185,129,0.5)',
    href: '/interview/live',
    badge: '⚡ Most useful',
    stats: ['STAR tracker', 'Filler count', '8s interrupts'],
  },
  {
    id: 'learn',
    title: 'Concept Cinema',
    emoji: '🎬',
    tagline: 'Watch concepts come alive.',
    desc: "Say a topic. Watch it animate onto a canvas with voice narration — system design, algorithms, frameworks. No one teaches like this.",
    color: '#f97316',
    glow: 'rgba(249,115,22,0.5)',
    href: '/interview/learn',
    badge: '✨ Most unique',
    stats: ['Animated canvas', 'Voice narrated', 'Any concept'],
  },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] as [number,number,number,number] } },
}

export default function InterviewHub() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#040408', color: '#f0f4ff',
      fontFamily: 'var(--font-body, system-ui)', overflow: 'hidden', position: 'relative' }}>

      {/* ── Background atmosphere ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {/* Primary glow — top center */}
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 600, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.22) 0%, transparent 70%)',
          filter: 'blur(60px)' }} />
        {/* Secondary glow — bottom right */}
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)' }} />
        {/* Tertiary — bottom left */}
        <div style={{ position: 'absolute', bottom: '20%', left: '-8%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)' }} />
        {/* Dot grid overlay */}
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, black 20%, transparent 80%)' }} />
        {/* Horizontal lines — subtle depth */}
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '100% 80px',
          maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)' }} />
      </div>

      {/* ── Content ── */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1160, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Hero */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          style={{ textAlign: 'center', paddingTop: 88, paddingBottom: 64 }}>
          <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 16px', background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.3)', borderRadius: 99,
            fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa',
              boxShadow: '0 0 8px #a78bfa', display: 'inline-block' }} />
            Interview Platform v2 · aicoachlab.app
          </motion.div>

          <motion.h1 variants={fadeUp}
            style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', fontWeight: 900,
              letterSpacing: '-0.04em', lineHeight: 1.06, margin: '0 0 20px' }}>
            <span style={{ color: '#f0f4ff' }}>Train like a champion.</span>
            <br />
            <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #38bdf8 60%, #10b981 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Interview like one.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp}
            style={{ fontSize: 'clamp(1rem, 2vw, 1.18rem)', color: 'rgba(167,243,208,0.5)',
              maxWidth: 540, margin: '0 auto 16px', lineHeight: 1.65 }}>
            Three AI-powered modes no one has built together. Voice-first, real-time, animated. Built different.
          </motion.p>

          {/* Social proof */}
          <motion.div variants={fadeUp}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 20, fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 24 }}>
            <span>🎭 Blindfold reveal</span>
            <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
            <span>⚡ Live STAR tracking</span>
            <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
            <span>🎬 Animated concepts</span>
          </motion.div>
        </motion.div>

        {/* Mode cards */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 20 }}>
          {MODES.map((m) => (
            <motion.div key={m.id}
              variants={fadeUp}
              whileHover={{ y: -8, scale: 1.015 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => router.push(m.href)}
              style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 22, padding: '32px 28px 26px',
                transition: 'border-color 0.3s' }}
              onHoverStart={e => (e.currentTarget as HTMLElement).style.borderColor = m.color + '55'}
              onHoverEnd={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'}>

              {/* Card glow on hover */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 0.4s',
                background: `radial-gradient(ellipse at top left, ${m.glow.replace('0.5', '0.08')} 0%, transparent 60%)`,
                pointerEvents: 'none' }}
                className={`card-glow-${m.id}`} />

              {/* Top glow orb */}
              <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180,
                borderRadius: '50%', background: `radial-gradient(circle, ${m.glow.replace('0.5', '0.2')} 0%, transparent 70%)`,
                filter: 'blur(30px)', pointerEvents: 'none' }} />

              {/* Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700,
                padding: '4px 11px', borderRadius: 99, marginBottom: 22,
                background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}35` }}>
                {m.badge}
              </div>

              <div style={{ fontSize: 52, marginBottom: 18, filter: 'drop-shadow(0 0 16px currentColor)' }}>
                {m.emoji}
              </div>

              <h2 style={{ fontSize: 21, fontWeight: 850, margin: '0 0 5px', color: '#f0f4ff',
                letterSpacing: '-0.03em' }}>{m.title}</h2>

              <div style={{ fontSize: 12, fontWeight: 700, color: m.color, marginBottom: 14,
                letterSpacing: '0.01em' }}>{m.tagline}</div>

              <p style={{ fontSize: 13.5, color: 'rgba(167,243,208,0.5)', lineHeight: 1.7, margin: '0 0 24px' }}>
                {m.desc}
              </p>

              {/* Stats chips */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {m.stats.map(s => (
                  <span key={s} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                    {s}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
                fontWeight: 700, color: m.color, letterSpacing: '-0.01em' }}>
                Start now
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
                  →
                </motion.span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={{ textAlign: 'center', marginTop: 52, fontSize: 12,
            color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>
          Voice-powered · No account needed · Built on Groq + Web Speech API
        </motion.div>
      </div>
    </div>
  )
}
