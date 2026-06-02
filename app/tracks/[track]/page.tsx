'use client'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, ChevronRight, CheckCircle, Lock } from 'lucide-react'
import { getTrack, DIFFICULTY_ORDER, DIFFICULTY_LABEL, DIFFICULTY_COLOR, type Exercise } from '@/lib/tracks/exercises'

const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }

function useProgress(trackId: string) {
  const [progress, setProgress] = useState<Record<string, number>>({})
  useEffect(() => {
    try {
      const raw = localStorage.getItem('aicoachlab_progress')
      if (raw) {
        const all = JSON.parse(raw)
        setProgress(all[trackId] ?? {})
      }
    } catch {}
  }, [trackId])
  return progress
}

function isUnlocked(exercise: Exercise, index: number, difficulty: string, progress: Record<string, number>, exercises: Exercise[]): boolean {
  if (difficulty === 'easy') return true
  // medium unlocks when at least 1 easy is ≥70
  if (difficulty === 'medium') {
    const easyExs = exercises.filter(e => e.difficulty === 'easy')
    return easyExs.some(e => (progress[e.slug] ?? 0) >= 70)
  }
  // hard unlocks when at least 1 medium is ≥70
  const mediumExs = exercises.filter(e => e.difficulty === 'medium')
  return mediumExs.some(e => (progress[e.slug] ?? 0) >= 70)
}

function scoreToVerdict(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Partial'
  return 'Needs Work'
}

function scoreColor(score: number): string {
  if (score >= 85) return '#10b981'
  if (score >= 70) return '#7c3aed'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export default function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track: trackId } = use(params)
  const router = useRouter()
  const track = getTrack(trackId)
  const progress = useProgress(trackId)

  if (!track) {
    return (
      <div style={{ minHeight: '100dvh', background: '#040408', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f4ff' }}>
        Track not found. <button onClick={() => router.push('/tracks')} style={{ marginLeft: 8, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}>Back</button>
      </div>
    )
  }

  const completed = track.exercises.filter(e => (progress[e.slug] ?? 0) >= 70).length
  const pct = Math.round((completed / track.exercises.length) * 100)

  return (
    <div style={{
      minHeight: '100dvh', background: '#040408', color: '#f0f4ff',
      fontFamily: 'var(--font-body, system-ui)', padding: '0 0 80px',
    }}>
      {/* atmosphere */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-15%', left: '25%', width: 600, height: 500,
          borderRadius: '50%', background: `radial-gradient(ellipse, ${track.glow} 0%, transparent 70%)`,
          filter: 'blur(80px)',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
        {/* nav */}
        <div style={{ paddingTop: 28, paddingBottom: 4 }}>
          <button
            onClick={() => router.push('/tracks')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8892a4', cursor: 'pointer', fontSize: 14, padding: 0 }}
          >
            <ArrowLeft size={16} /> All Tracks
          </button>
        </div>

        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          style={{ paddingTop: 32, paddingBottom: 36 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: track.color + '22', border: `1px solid ${track.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, color: track.color, fontWeight: 700,
            }}>
              {track.icon}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, margin: 0 }}>
                {track.label}
              </h1>
              <p style={{ color: '#8892a4', fontSize: 14, margin: '4px 0 0' }}>{track.description}</p>
            </div>
          </div>

          {/* progress */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '16px 20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#8892a4' }}>{completed} of {track.exercises.length} exercises completed</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? track.color : '#f0f4ff' }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease, delay: 0.3 }}
                style={{ height: '100%', background: track.color, borderRadius: 99 }}
              />
            </div>
          </div>
        </motion.div>

        {/* exercise list grouped by difficulty */}
        {DIFFICULTY_ORDER.map(difficulty => {
          const exercises = track.exercises.filter(e => e.difficulty === difficulty)
          if (exercises.length === 0) return null
          return (
            <div key={difficulty} style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 1,
                  padding: '3px 10px', borderRadius: 6,
                  background: DIFFICULTY_COLOR[difficulty] + '22',
                  color: DIFFICULTY_COLOR[difficulty],
                  border: `1px solid ${DIFFICULTY_COLOR[difficulty]}33`,
                }}>
                  {DIFFICULTY_LABEL[difficulty].toUpperCase()}
                </div>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
              </div>

              <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {exercises.map((exercise, idx) => {
                  const score = progress[exercise.slug]
                  const done = score !== undefined && score >= 70
                  const attempted = score !== undefined && score < 70
                  const unlocked = isUnlocked(exercise, idx, difficulty, progress, track.exercises)

                  return (
                    <motion.div
                      key={exercise.slug}
                      variants={fadeUp}
                      onClick={() => unlocked && router.push(`/tracks/${trackId}/${exercise.slug}`)}
                      style={{
                        background: done ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.025)',
                        border: done
                          ? '1px solid rgba(16,185,129,0.2)'
                          : attempted
                            ? `1px solid ${DIFFICULTY_COLOR[difficulty]}33`
                            : '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 12,
                        padding: '18px 20px',
                        cursor: unlocked ? 'pointer' : 'not-allowed',
                        opacity: unlocked ? 1 : 0.45,
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        display: 'flex', alignItems: 'center', gap: 16,
                      }}
                      whileHover={unlocked ? { borderColor: track.color + '55', boxShadow: `0 0 20px ${track.glow}` } : {}}
                    >
                      {/* status icon */}
                      <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)' }}>
                        {!unlocked
                          ? <Lock size={16} color="#4a5568" />
                          : done
                            ? <CheckCircle size={18} color="#10b981" />
                            : <span style={{ fontSize: 16 }}>📝</span>
                        }
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#e8edf5', marginBottom: 4 }}>
                          {exercise.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7589' }}>
                            <Clock size={11} /> {exercise.estimatedMins} min
                          </span>
                          {exercise.tags.slice(0, 3).map(t => (
                            <span key={t} style={{ fontSize: 11, color: '#5a6470', background: 'rgba(255,255,255,0.04)', padding: '2px 7px', borderRadius: 4 }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {score !== undefined && (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: scoreColor(score) }}>{score}</div>
                          <div style={{ fontSize: 11, color: scoreColor(score) }}>{scoreToVerdict(score)}</div>
                        </div>
                      )}

                      {unlocked && score === undefined && <ChevronRight size={16} color="#4a5568" />}
                      {!unlocked && (
                        <div style={{ fontSize: 11, color: '#4a5568', textAlign: 'right', flexShrink: 0 }}>
                          Complete an<br />easier exercise
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
