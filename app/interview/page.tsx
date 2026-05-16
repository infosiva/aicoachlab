'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

const ROLES = [
  { id: 'swe',    label: '💻 SWE',          desc: 'Algorithms, systems, code' },
  { id: 'pm',     label: '📋 Product',       desc: 'Strategy, metrics, prioritisation' },
  { id: 'data',   label: '📊 Data Science',  desc: 'ML, stats, model design' },
  { id: 'system', label: '🏗️ System Design', desc: 'Scale, architecture, tradeoffs' },
]

const TOTAL_QUESTIONS = 5
const TIME_LIMIT = 90 // seconds per question

type Phase = 'setup' | 'battle' | 'result'

interface Round {
  question: string
  botQuestion: string
  answer: string
  score: number
  verdict: string
  feedback: string
  botReply: string
  keyPoint: string
  timeUsed: number
}

export default function InterviewBattlePage() {
  const [phase, setPhase] = useState<Phase>('setup')
  const [role, setRole] = useState('swe')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [rounds, setRounds] = useState<Round[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [currentBotMessage, setCurrentBotMessage] = useState('')
  const [answer, setAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [loading, setLoading] = useState(false)
  const [grading, setGrading] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    setTimeLeft(TIME_LIMIT)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }, [stopTimer])

  useEffect(() => () => stopTimer(), [stopTimer])

  // Auto-submit when time hits 0
  useEffect(() => {
    if (timeLeft === 0 && phase === 'battle' && !grading) {
      handleGrade(true)
    }
  }, [timeLeft, phase, grading]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchQuestion(idx: number) {
    setLoading(true)
    setAnswer('')
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'question', role, questionIndex: idx }),
      })
      const d = await res.json()
      setCurrentQuestion(d.question)
      setCurrentBotMessage(d.botMessage)
      startTimer()
      setTimeout(() => textareaRef.current?.focus(), 300)
    } catch {
      setCurrentBotMessage('Let\'s begin. Tell me about your background.')
    } finally {
      setLoading(false)
    }
  }

  async function startBattle() {
    setPhase('battle')
    setQuestionIndex(0)
    setRounds([])
    setTotalScore(0)
    await fetchQuestion(0)
  }

  async function handleGrade(timedOut = false) {
    if (grading) return
    setGrading(true)
    stopTimer()
    const timeUsed = TIME_LIMIT - timeLeft

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grade', role, questionIndex, answer: answer || '(no answer — timed out)' }),
      })
      const d = await res.json()
      const round: Round = {
        question: currentQuestion,
        botQuestion: currentBotMessage,
        answer,
        score: d.score ?? 0,
        verdict: d.verdict ?? 'Unknown',
        feedback: d.feedback ?? '',
        botReply: d.botReply ?? '',
        keyPoint: d.keyPoint ?? '',
        timeUsed,
      }
      const newRounds = [...rounds, round]
      setRounds(newRounds)
      setTotalScore(newRounds.reduce((s, r) => s + r.score, 0))

      if (questionIndex + 1 >= TOTAL_QUESTIONS) {
        setPhase('result')
      } else {
        const nextIdx = questionIndex + 1
        setQuestionIndex(nextIdx)
        await fetchQuestion(nextIdx)
      }
    } catch {
      // skip failed grade
    } finally {
      setGrading(false)
    }
  }

  const maxScore = TOTAL_QUESTIONS * 10
  const percentage = Math.round((totalScore / maxScore) * 100)
  const grade = percentage >= 80 ? 'A' : percentage >= 65 ? 'B' : percentage >= 50 ? 'C' : 'D'
  const gradeColor = percentage >= 80 ? '#22c55e' : percentage >= 65 ? '#6366f1' : percentage >= 50 ? '#f59e0b' : '#ef4444'

  const timerPct = (timeLeft / TIME_LIMIT) * 100
  const timerColor = timeLeft > 30 ? '#22c55e' : timeLeft > 15 ? '#f59e0b' : '#ef4444'

  // ── Setup screen ────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'var(--font-body, system-ui)' }}>
        <div style={{ maxWidth: 540, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚔️</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f0f4ff', margin: 0, letterSpacing: '-0.03em' }}>
              Interview Battle
            </h1>
            <p style={{ color: 'rgba(165,180,252,0.7)', marginTop: 8, fontSize: '0.95rem' }}>
              {TOTAL_QUESTIONS} questions · {TIME_LIMIT}s each · AI grades every answer
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(100,116,139,0.8)', marginBottom: 10 }}>
              Choose your battle
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  style={{
                    padding: '0.9rem 1rem', borderRadius: 12,
                    border: `1.5px solid ${role === r.id ? '#6366f1' : 'rgba(99,102,241,0.15)'}`,
                    background: role === r.id ? 'rgba(99,102,241,0.12)' : 'rgba(10,15,30,0.8)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#f0f4ff', fontSize: '0.9rem' }}>{r.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(165,180,252,0.6)', marginTop: 2 }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'rgba(165,180,252,0.7)' }}>
            <strong style={{ color: '#818cf8' }}>How it works:</strong> The AI plays your interviewer. Answer each question in free text. You&apos;re scored 0–10 per round. Run out of time — bot wins that round. Final score determines your grade.
          </div>

          <button
            onClick={startBattle}
            style={{ width: '100%', padding: '1rem', borderRadius: 12, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', letterSpacing: '-0.01em' }}
          >
            Start battle →
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(100,116,139,0.6)', marginTop: 12 }}>
            Free · No login · Results stay in your browser
          </p>
        </div>
      </div>
    )
  }

  // ── Battle screen ────────────────────────────────────────────
  if (phase === 'battle') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body, system-ui)' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(99,102,241,0.15)', background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f0f4ff' }}>⚔️ Interview Battle</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(165,180,252,0.6)' }}>
              Q {questionIndex + 1}/{TOTAL_QUESTIONS}
            </span>
            {/* Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 60, height: 6, background: 'rgba(99,102,241,0.15)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${timerPct}%`, background: timerColor, borderRadius: 99, transition: 'width 1s linear, background 0.3s' }} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: timerColor, minWidth: 28, textAlign: 'right' }}>{timeLeft}s</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 680, margin: '0 auto', width: '100%', padding: '1.5rem' }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem' }}>
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
              <div key={i} style={{ height: 4, flex: 1, borderRadius: 99, background: i < questionIndex ? '#6366f1' : i === questionIndex ? '#818cf8' : 'rgba(99,102,241,0.15)' }} />
            ))}
          </div>

          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🤖</div>
                <p style={{ color: 'rgba(165,180,252,0.6)', fontSize: '0.9rem' }}>Interviewer is preparing…</p>
              </div>
            </div>
          ) : (
            <>
              {/* Bot message bubble */}
              <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '16px 16px 16px 4px', padding: '1rem 1.2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '1.1rem' }}>🤖</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#818cf8' }}>Interviewer</span>
                </div>
                <p style={{ margin: 0, color: '#f0f4ff', fontSize: '0.95rem', lineHeight: 1.6 }}>{currentBotMessage}</p>
              </div>

              {/* Show last round feedback inline */}
              {rounds.length > 0 && (
                <div style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
                  <span style={{ color: 'rgba(165,180,252,0.5)', marginRight: 8 }}>Prev:</span>
                  <span style={{ color: rounds[rounds.length-1].score >= 7 ? '#22c55e' : rounds[rounds.length-1].score >= 4 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>
                    {rounds[rounds.length-1].score}/10 · {rounds[rounds.length-1].verdict}
                  </span>
                  <span style={{ color: 'rgba(165,180,252,0.5)', marginLeft: 8 }}>{rounds[rounds.length-1].keyPoint}</span>
                </div>
              )}

              {/* Answer area */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(100,116,139,0.7)' }}>
                  Your answer
                </label>
                <textarea
                  ref={textareaRef}
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Type your answer here… speak naturally, as you would in a real interview"
                  rows={7}
                  disabled={grading}
                  style={{
                    width: '100%', padding: '1rem', borderRadius: 12, resize: 'vertical',
                    background: 'rgba(10,15,30,0.8)', border: '1.5px solid rgba(99,102,241,0.2)',
                    color: '#f0f4ff', fontSize: '0.92rem', lineHeight: 1.6,
                    outline: 'none', transition: 'border-color 0.15s', fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={() => handleGrade()}
                  disabled={grading || !answer.trim()}
                  style={{
                    padding: '0.9rem', borderRadius: 12, border: 'none',
                    background: grading ? 'rgba(99,102,241,0.4)' : '#6366f1',
                    color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                    cursor: grading || !answer.trim() ? 'not-allowed' : 'pointer',
                    opacity: !answer.trim() && !grading ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  {grading ? '⏳ Grading…' : 'Submit answer →'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(100,116,139,0.5)', margin: 0 }}>
                  Or wait for timer to end · Unanswered = 0 points
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Result screen ────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body, system-ui)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Score hero */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
            {percentage >= 80 ? '🏆' : percentage >= 65 ? '⭐' : percentage >= 50 ? '💪' : '📚'}
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: gradeColor, margin: 0 }}>Grade {grade}</h1>
          <p style={{ color: 'rgba(165,180,252,0.7)', margin: '8px 0 0', fontSize: '1rem' }}>
            {totalScore}/{maxScore} points · {percentage}%
          </p>
          <p style={{ color: 'rgba(100,116,139,0.7)', fontSize: '0.85rem', marginTop: 4 }}>
            {percentage >= 80 ? 'Outstanding — you\'re ready for the real thing.' : percentage >= 65 ? 'Solid performance. A bit more prep and you\'re there.' : percentage >= 50 ? 'Room to grow. Focus on the key points below.' : 'Keep practising — every session builds the muscle.'}
          </p>
        </div>

        {/* Round breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
          {rounds.map((r, i) => (
            <div key={i} style={{ background: 'rgba(10,15,30,0.8)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: '1rem 1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(100,116,139,0.6)' }}>Q{i+1}</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.87rem', color: '#f0f4ff', fontWeight: 600 }}>{r.question}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: r.score >= 7 ? '#22c55e' : r.score >= 4 ? '#f59e0b' : '#ef4444' }}>
                    {r.score}/10
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(165,180,252,0.5)' }}>{r.verdict}</div>
                </div>
              </div>
              {r.feedback && (
                <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: 'rgba(165,180,252,0.7)', lineHeight: 1.5 }}>{r.feedback}</p>
              )}
              {r.keyPoint && (
                <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: 8, padding: '0.4rem 0.7rem', fontSize: '0.76rem', color: '#818cf8' }}>
                  💡 {r.keyPoint}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => { setPhase('setup'); setRounds([]); setTotalScore(0); setQuestionIndex(0) }}
            style={{ flex: 1, padding: '0.9rem', borderRadius: 12, border: '1.5px solid rgba(99,102,241,0.3)', background: 'transparent', color: '#818cf8', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Try another role
          </button>
          <button
            onClick={startBattle}
            style={{ flex: 1, padding: '0.9rem', borderRadius: 12, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Battle again →
          </button>
        </div>

        {/* Affiliate / upgrade nudge */}
        <div style={{ marginTop: '1.5rem', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 12, padding: '1.2rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#f0f4ff', fontWeight: 700 }}>Want structured coaching on these topics?</p>
          <p style={{ margin: '4px 0 12px', fontSize: '0.8rem', color: 'rgba(165,180,252,0.6)' }}>AICoachLab covers all these areas with hands-on projects.</p>
          <a
            href="/#curriculum"
            style={{ display: 'inline-block', padding: '0.6rem 1.4rem', borderRadius: 10, background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}
          >
            See the curriculum →
          </a>
        </div>
      </div>
    </div>
  )
}
