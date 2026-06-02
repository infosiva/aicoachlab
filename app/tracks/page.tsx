'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { TRACKS, DIFFICULTY_ORDER, type Track } from '@/lib/tracks/exercises'

const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }

function useProgress() {
  const [progress, setProgress] = useState<Record<string, Record<string, number>>>({})
  useEffect(() => {
    try {
      const raw = localStorage.getItem('aicoachlab_progress')
      if (raw) setProgress(JSON.parse(raw))
    } catch {}
  }, [])
  return progress
}

function TrackCard({ track, progress }: { track: Track; progress: Record<string, Record<string, number>> }) {
  const router = useRouter()
  const trackProgress = progress[track.id] ?? {}
  const completed = Object.keys(trackProgress).filter(s => (trackProgress[s] ?? 0) >= 70).length
  const total = track.exercises.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  const byDifficulty = DIFFICULTY_ORDER.map(d => ({
    d,
    count: track.exercises.filter(e => e.difficulty === d).length,
  }))

  return (
    <motion.div
      variants={fadeUp}
      onClick={() => router.push(`/tracks/${track.id}`)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 16,
        padding: '28px 28px 24px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      whileHover={{
        borderColor: track.color + '55',
        boxShadow: `0 0 32px ${track.glow}`,
      }}
      whileTap={{ scale: 0.99 }}
    >
      {/* glow blob */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 160, height: 160,
        borderRadius: '50%', background: track.glow, filter: 'blur(50px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: track.color + '22', border: `1px solid ${track.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: track.color, fontWeight: 700,
          }}>
            {track.icon}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#f0f4ff' }}>
              {track.label}
            </div>
            <div style={{ fontSize: 13, color: '#8892a4', marginTop: 2 }}>{track.description}</div>
          </div>
        </div>
        <ChevronRight size={18} color="#4a5568" />
      </div>

      {/* difficulty breakdown */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {byDifficulty.map(({ d, count }) => count > 0 && (
          <div key={d} style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
            padding: '3px 8px', borderRadius: 6,
            background: d === 'easy' ? '#10b98122' : d === 'medium' ? '#f59e0b22' : '#ef444422',
            color: d === 'easy' ? '#10b981' : d === 'medium' ? '#f59e0b' : '#ef4444',
            border: `1px solid ${d === 'easy' ? '#10b98133' : d === 'medium' ? '#f59e0b33' : '#ef444433'}`,
          }}>
            {count} {d}
          </div>
        ))}
      </div>

      {/* progress bar */}
      <div style={{ marginTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#8892a4' }}>{completed}/{total} exercises</span>
          <span style={{ fontSize: 12, color: pct === 100 ? track.color : '#8892a4', fontWeight: 600 }}>
            {pct === 100 ? '✓ Complete' : `${pct}%`}
          </span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease, delay: 0.3 }}
            style={{ height: '100%', background: track.color, borderRadius: 99 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function TracksPage() {
  const router = useRouter()
  const progress = useProgress()

  const totalExercises = TRACKS.reduce((s, t) => s + t.exercises.length, 0)
  const totalCompleted = TRACKS.reduce((s, t) => {
    const tp = progress[t.id] ?? {}
    return s + Object.keys(tp).filter(slug => (tp[slug] ?? 0) >= 70).length
  }, 0)

  return (
    <div style={{
      minHeight: '100dvh', background: '#040408', color: '#f0f4ff',
      fontFamily: 'var(--font-body, system-ui)', padding: '0 0 80px',
    }}>
      {/* atmosphere */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '20%', width: 500, height: 400,
          borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '15%', width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(14,165,233,0.1) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
        {/* nav */}
        <div style={{ paddingTop: 28, paddingBottom: 8 }}>
          <button
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8892a4', cursor: 'pointer', fontSize: 14, padding: 0 }}
          >
            <ArrowLeft size={16} /> Home
          </button>
        </div>

        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          style={{ paddingTop: 40, paddingBottom: 40 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
              color: '#7c3aed', background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.25)', borderRadius: 6,
              padding: '4px 10px',
            }}>
              PRACTICE TRACKS
            </div>
            {totalCompleted > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#10b981' }}>
                <CheckCircle size={14} />
                {totalCompleted}/{totalExercises} completed
              </div>
            )}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 800, margin: 0, lineHeight: 1.15, color: '#f0f4ff',
          }}>
            Master interview skills<br />
            <span style={{ color: '#7c3aed' }}>one exercise at a time</span>
          </h1>
          <p style={{ color: '#8892a4', fontSize: 16, marginTop: 14, lineHeight: 1.6, maxWidth: 540 }}>
            Structured tracks like Exercism — pick a topic, work through graded exercises, get AI feedback, see model answers after each submission.
          </p>
        </motion.div>

        {/* track grid */}
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}
        >
          {TRACKS.map(track => (
            <TrackCard key={track.id} track={track} progress={progress} />
          ))}
        </motion.div>

        {/* how it works */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{
            marginTop: 60, padding: '32px 28px', background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#8892a4', letterSpacing: 1, marginBottom: 20 }}>HOW IT WORKS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { step: '01', title: 'Pick a track', desc: 'Choose the interview type you want to master' },
              { step: '02', title: 'Select an exercise', desc: 'Easy → Medium → Hard, unlocked as you progress' },
              { step: '03', title: 'Write your answer', desc: 'No time pressure. Think it through properly.' },
              { step: '04', title: 'Get AI feedback', desc: 'Scored against specific criteria, not vibes' },
              { step: '05', title: 'See model answer', desc: 'Expert-level answer revealed after submission' },
              { step: '06', title: 'Track progress', desc: 'Your scores saved locally per exercise' },
            ].map(({ step, title, desc }) => (
              <div key={step}>
                <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700, marginBottom: 4 }}>{step}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#c8d0e0', marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 12, color: '#5a6470', lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
