'use client'
import { motion } from 'framer-motion'

interface Props {
  isHuman: boolean
  personaName: string
  personaTitle: string
  score: number
  verdict: string
  topStrength: string
  topImprovement: string
  onRestart: () => void
}

export default function BlindReveal({ isHuman, personaName, personaTitle, score, verdict, topStrength, topImprovement, onRestart }: Props) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: 24 }}>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
        style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, padding: '48px 40px', maxWidth: 520, width: '100%',
          textAlign: 'center' }}>

        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.4 }}
          style={{ fontSize: 80, marginBottom: 16 }}>
          {isHuman ? '👤' : '🤖'}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}>
          <div style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: isHuman ? '#60a5fa' : '#a78bfa', fontWeight: 800, marginBottom: 8 }}>
            {isHuman ? '— Human interviewer —' : '— AI interviewer —'}
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f0f4ff', margin: '0 0 4px',
            letterSpacing: '-0.03em' }}>{personaName}</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 32px' }}>{personaTitle}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '20px 24px',
            marginBottom: 24, border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 48, fontWeight: 900,
            color: score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444',
            lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
            letterSpacing: '0.1em', marginTop: 4 }}>Performance Score</div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '12px 0 0', lineHeight: 1.5 }}>{verdict}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 12, padding: '12px 14px', textAlign: 'left' }}>
            <div style={{ fontSize: 10, color: '#10b981', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 6 }}>💪 Strength</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{topStrength}</div>
          </div>
          <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
            borderRadius: 12, padding: '12px 14px', textAlign: 'left' }}>
            <div style={{ fontSize: 10, color: '#f97316', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 6 }}>🎯 Improve</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{topImprovement}</div>
          </div>
        </motion.div>

        <motion.button onClick={onRestart}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff',
            fontSize: 15, fontWeight: 700 }}>
          Interview again →
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
