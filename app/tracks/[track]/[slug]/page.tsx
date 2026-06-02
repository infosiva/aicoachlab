'use client'
import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Clock, ChevronRight, CheckCircle, XCircle,
  Lightbulb, Eye, EyeOff, RotateCcw, Send, Loader2,
} from 'lucide-react'
import { getExercise, getTrack, DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '@/lib/tracks/exercises'

const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]

function saveScore(trackId: string, slug: string, score: number) {
  try {
    const raw = localStorage.getItem('aicoachlab_progress')
    const all = raw ? JSON.parse(raw) : {}
    if (!all[trackId]) all[trackId] = {}
    all[trackId][slug] = Math.max(all[trackId][slug] ?? 0, score)
    localStorage.setItem('aicoachlab_progress', JSON.stringify(all))
  } catch {}
}

function getBestScore(trackId: string, slug: string): number | null {
  try {
    const raw = localStorage.getItem('aicoachlab_progress')
    if (!raw) return null
    const all = JSON.parse(raw)
    const s = all[trackId]?.[slug]
    return s !== undefined ? s : null
  } catch { return null }
}

function ScoreRing({ score }: { score: number }) {
  const r = 36, c = 2 * Math.PI * r
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#7c3aed' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ position: 'relative', width: 88, height: 88 }}>
      <svg width={88} height={88} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={44} cy={44} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={6} />
        <motion.circle
          cx={44} cy={44} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${c}` }}
          animate={{ strokeDasharray: `${(score / 100) * c} ${c}` }}
          transition={{ duration: 1.2, ease }}
          style={{ strokeDashoffset: 0 }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}
        >
          {score}
        </motion.span>
        <span style={{ fontSize: 10, color: '#6b7589' }}>/100</span>
      </div>
    </div>
  )
}

type Phase = 'writing' | 'grading' | 'feedback'

interface GradeResult {
  score: number
  verdict: string
  criteriaScores: { criterion: string; met: boolean; note: string }[]
  strengths: string[]
  gaps: string[]
  coachNote: string
}

export default function ExercisePage({ params }: { params: Promise<{ track: string; slug: string }> }) {
  const { track: trackId, slug } = use(params)
  const router = useRouter()
  const exercise = getExercise(trackId, slug)
  const track = getTrack(trackId)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [phase, setPhase] = useState<Phase>('writing')
  const [answer, setAnswer] = useState('')
  const [grade, setGrade] = useState<GradeResult | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    if (exercise) setBestScore(getBestScore(trackId, slug))
  }, [trackId, slug, exercise])

  useEffect(() => {
    setWordCount(answer.trim() ? answer.trim().split(/\s+/).length : 0)
  }, [answer])

  if (!exercise || !track) {
    return (
      <div style={{ minHeight: '100dvh', background: '#040408', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f0f4ff' }}>
        Exercise not found.{' '}
        <button onClick={() => router.push(`/tracks/${trackId}`)} style={{ marginLeft: 8, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}>
          Back to track
        </button>
      </div>
    )
  }

  const diffColor = DIFFICULTY_COLOR[exercise.difficulty]
  const minWords = 50
  const canSubmit = wordCount >= minWords

  async function handleSubmit() {
    if (!canSubmit) return
    setPhase('grading')
    try {
      const res = await fetch('/api/tracks/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId, slug, answer }),
      })
      const data: GradeResult = await res.json()
      setGrade(data)
      saveScore(trackId, slug, data.score)
      setBestScore(prev => Math.max(prev ?? 0, data.score))
      setPhase('feedback')
    } catch {
      setPhase('writing')
      alert('Grading failed — check your connection.')
    }
  }

  function handleRetry() {
    setPhase('writing')
    setGrade(null)
    setShowModel(false)
    setAnswer('')
    textareaRef.current?.focus()
  }

  return (
    <div style={{
      minHeight: '100dvh', background: '#040408', color: '#f0f4ff',
      fontFamily: 'var(--font-body, system-ui)', padding: '0 0 100px',
    }}>
      {/* atmosphere */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-10%', right: '20%', width: 500, height: 400,
          borderRadius: '50%', background: `radial-gradient(ellipse, ${track.glow} 0%, transparent 70%)`,
          filter: 'blur(90px)',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
        {/* nav */}
        <div style={{ paddingTop: 28, paddingBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => router.push(`/tracks/${trackId}`)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8892a4', cursor: 'pointer', fontSize: 14, padding: 0 }}
          >
            <ArrowLeft size={16} /> {track.label}
          </button>
          {bestScore !== null && (
            <div style={{ fontSize: 13, color: bestScore >= 70 ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
              {bestScore >= 70 ? <CheckCircle size={14} /> : null}
              Best: {bestScore}/100
            </div>
          )}
        </div>

        {/* exercise header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          style={{ paddingTop: 32, paddingBottom: 28 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: '3px 10px', borderRadius: 6,
              background: diffColor + '22', color: diffColor, border: `1px solid ${diffColor}33`,
            }}>
              {DIFFICULTY_LABEL[exercise.difficulty].toUpperCase()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7589' }}>
              <Clock size={11} /> {exercise.estimatedMins} min
            </div>
            {exercise.tags.slice(0, 3).map(t => (
              <span key={t} style={{ fontSize: 11, color: '#5a6470', background: 'rgba(255,255,255,0.04)', padding: '2px 7px', borderRadius: 4 }}>
                {t}
              </span>
            ))}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, margin: '0 0 20px' }}>
            {exercise.title}
          </h1>

          {/* question card */}
          <div style={{
            background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14, padding: '24px 24px 20px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8892a4', letterSpacing: 1, marginBottom: 12 }}>QUESTION</div>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: '#d8e0f0', margin: 0 }}>{exercise.question}</p>
          </div>
        </motion.div>

        {/* hints */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <button
            onClick={() => setShowHints(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'none',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
              color: '#8892a4', cursor: 'pointer', fontSize: 13, padding: '8px 14px', marginBottom: 12,
            }}
          >
            <Lightbulb size={14} /> {showHints ? 'Hide hints' : 'Show hints'}
          </button>

          <AnimatePresence>
            {showHints && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                style={{ marginBottom: 16, overflow: 'hidden' }}
              >
                <div style={{
                  background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 12, padding: '16px 20px',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: 1, marginBottom: 12 }}>HINTS</div>
                  <ul style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {exercise.hints.map((h, i) => (
                      <li key={i} style={{ fontSize: 14, color: '#c8a850', lineHeight: 1.5 }}>{h}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* answer area — writing phase */}
        <AnimatePresence mode="wait">
          {phase !== 'feedback' ? (
            <motion.div key="writing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <textarea
                  ref={textareaRef}
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  disabled={phase === 'grading'}
                  placeholder="Write your answer here. Think through the structure before typing — quality over speed."
                  style={{
                    width: '100%', minHeight: 260, background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
                    color: '#e8edf5', fontSize: 15, lineHeight: 1.7, padding: '20px',
                    resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = track.color + '66' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                />
                {phase === 'grading' && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(4,7,8,0.7)', borderRadius: 14, backdropFilter: 'blur(4px)',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <Loader2 size={28} color={track.color} style={{ animation: 'spin 1s linear infinite' }} />
                      <div style={{ marginTop: 10, color: '#8892a4', fontSize: 14 }}>Grading your answer…</div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: wordCount < minWords ? '#6b7589' : '#10b981' }}>
                  {wordCount} words {wordCount < minWords ? `(min ${minWords})` : '✓'}
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || phase === 'grading'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: canSubmit ? track.color : 'rgba(255,255,255,0.05)',
                    color: canSubmit ? '#fff' : '#4a5568',
                    border: 'none', borderRadius: 10, padding: '12px 24px',
                    fontSize: 14, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'not-allowed',
                    transition: 'background 0.2s, transform 0.1s',
                  }}
                >
                  {phase === 'grading' ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                  {phase === 'grading' ? 'Grading…' : 'Submit Answer'}
                </button>
              </div>
            </motion.div>
          ) : (

            /* FEEDBACK PHASE */
            <motion.div key="feedback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
              {grade && (
                <>
                  {/* score header */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, padding: '28px 28px 24px', marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 24,
                  }}>
                    <ScoreRing score={grade.score} />
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#f0f4ff', marginBottom: 4 }}>{grade.verdict}</div>
                      <div style={{ fontSize: 14, color: '#8892a4', lineHeight: 1.5 }}>{grade.coachNote}</div>
                    </div>
                  </div>

                  {/* criteria checklist */}
                  <div style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 14, padding: '20px 20px 16px', marginBottom: 16,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#8892a4', letterSpacing: 1, marginBottom: 14 }}>SCORING CRITERIA</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {grade.criteriaScores.map((c, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          {c.met
                            ? <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                            : <XCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                          }
                          <div>
                            <div style={{ fontSize: 14, color: c.met ? '#c8d0e0' : '#8892a4', marginBottom: 2 }}>{c.criterion}</div>
                            <div style={{ fontSize: 12, color: c.met ? '#5a8a6a' : '#7a4a4a' }}>{c.note}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* strengths + gaps */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
                      borderRadius: 12, padding: '16px 18px',
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: 1, marginBottom: 10 }}>STRENGTHS</div>
                      <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {grade.strengths.map((s, i) => <li key={i} style={{ fontSize: 13, color: '#7ab898', lineHeight: 1.5 }}>{s}</li>)}
                      </ul>
                    </div>
                    <div style={{
                      background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
                      borderRadius: 12, padding: '16px 18px',
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: 1, marginBottom: 10 }}>GAPS</div>
                      <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {grade.gaps.map((g, i) => <li key={i} style={{ fontSize: 13, color: '#a87a7a', lineHeight: 1.5 }}>{g}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* model answer reveal */}
                  <div style={{ marginBottom: 20 }}>
                    <button
                      onClick={() => setShowModel(v => !v)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                        background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)',
                        borderRadius: 12, padding: '14px 18px', color: '#a78bfa',
                        cursor: 'pointer', fontSize: 14, fontWeight: 600,
                      }}
                    >
                      {showModel ? <EyeOff size={16} /> : <Eye size={16} />}
                      {showModel ? 'Hide model answer' : 'Reveal model answer'}
                    </button>

                    <AnimatePresence>
                      {showModel && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{
                            background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)',
                            borderRadius: '0 0 12px 12px', padding: '20px 20px',
                            borderTop: 'none',
                          }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: 1, marginBottom: 14 }}>MODEL ANSWER</div>
                            <div style={{
                              fontSize: 14, color: '#c0c8d8', lineHeight: 1.8,
                              whiteSpace: 'pre-wrap',
                              fontFamily: 'inherit',
                            }}>
                              {exercise.modelAnswer}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* actions */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={handleRetry}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10, padding: '12px 20px', color: '#8892a4',
                        cursor: 'pointer', fontSize: 14, fontWeight: 600,
                      }}
                    >
                      <RotateCcw size={15} /> Try again
                    </button>
                    <button
                      onClick={() => router.push(`/tracks/${trackId}`)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, flex: 1,
                        background: track.color, border: 'none',
                        borderRadius: 10, padding: '12px 20px', color: '#fff',
                        cursor: 'pointer', fontSize: 14, fontWeight: 700, justifyContent: 'center',
                      }}
                    >
                      Next exercise <ChevronRight size={16} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
