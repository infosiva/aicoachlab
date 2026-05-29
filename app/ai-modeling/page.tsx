'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCircuit, CheckCircle, ExternalLink, ArrowLeft, Award } from 'lucide-react'

const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]

interface WeekItem {
  week: string
  title: string
  tag: string
  color: string
  desc: string
  colab: string
}

const curriculum: WeekItem[] = [
  { week: 'Week 1', title: 'AI/ML Mental Models', tag: 'Foundations', color: '#818cf8', desc: 'What AI actually is, how models learn, key vocabulary. No code needed.', colab: '' },
  { week: 'Week 2', title: 'Data — Collect, Clean, Label', tag: 'Data', color: '#34d399', desc: 'Pandas basics, dataset quality, labeling strategies. First Colab notebook.', colab: 'https://colab.research.google.com/github/google/eng-edu/raw/main/ml/cc/exercises/pandas_dataframe_ultraquick_tutorial.ipynb' },
  { week: 'Week 3', title: 'Your First Model', tag: 'scikit-learn', color: '#60a5fa', desc: 'Train a classifier in 20 lines. Understand accuracy, precision, recall.', colab: 'https://colab.research.google.com/github/google/eng-edu/raw/main/ml/cc/exercises/intro_to_ml_fairness.ipynb' },
  { week: 'Week 4', title: 'Neural Networks from Scratch', tag: 'PyTorch', color: '#f472b6', desc: 'Build a neural net, understand backprop, train on MNIST.', colab: '' },
  { week: 'Week 5', title: 'Fine-tuning LLMs', tag: 'HuggingFace + LoRA', color: '#fb923c', desc: 'Fine-tune Llama/Mistral on custom data with LoRA/QLoRA on free GPU.', colab: '' },
  { week: 'Week 6', title: 'Deploy a Model', tag: 'Replicate + Modal', color: '#4ade80', desc: 'Serve your model via API. Cost-effective inference strategies.', colab: '' },
  { week: 'Week 7', title: 'Agents & Tool Use', tag: 'Claude API', color: '#a78bfa', desc: 'Build an AI agent with tools, memory, and structured output.', colab: '' },
  { week: 'Week 8', title: 'Ship a Real Product', tag: 'Full Stack', color: '#f59e0b', desc: 'Combine everything into a deployable AI-powered app.', colab: '' },
]

const STORAGE_KEY = (n: number) => `aimodeling_week_${n}`
const PROGRESS_KEY = 'aimodeling_progress'

export default function AIModelingPage() {
  const [completed, setCompleted] = useState<boolean[]>(Array(8).fill(false))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const next = curriculum.map((_, i) => {
      try {
        return localStorage.getItem(STORAGE_KEY(i + 1)) === 'done'
      } catch {
        return false
      }
    })
    setCompleted(next)
    setMounted(true)
  }, [])

  const completedCount = completed.filter(Boolean).length
  const allDone = completedCount === 8
  const pct = Math.round((completedCount / 8) * 100)

  function toggleWeek(idx: number) {
    const next = [...completed]
    next[idx] = !next[idx]
    setCompleted(next)
    try {
      localStorage.setItem(STORAGE_KEY(idx + 1), next[idx] ? 'done' : '')
      localStorage.setItem(PROGRESS_KEY, completedCount.toString())
    } catch {}
  }

  function handleCertificate() {
    const cert = document.getElementById('acl-certificate')
    if (!cert) return
    cert.style.display = 'block'
    window.print()
    cert.style.display = 'none'
  }

  return (
    <div style={{
      background: '#0a0a0f',
      minHeight: '100vh',
      fontFamily: 'var(--font-body, system-ui)',
      color: '#f0f4ff',
      overflowX: 'hidden',
    }}>
      {/* hidden certificate div for print */}
      <div id="acl-certificate" style={{ display: 'none' }}>
        <div style={{ padding: 60, textAlign: 'center', fontFamily: 'Georgia, serif' }}>
          <h1 style={{ fontSize: 36, marginBottom: 12 }}>Certificate of Completion</h1>
          <p style={{ fontSize: 20, marginBottom: 8 }}>Zero to Hero: AI Modeling</p>
          <p style={{ fontSize: 16, color: '#555', marginBottom: 32 }}>8-Week Hands-on Curriculum</p>
          <p style={{ fontSize: 14, color: '#777' }}>Issued by AICoachLab · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.45, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '-15%', left: '-5%',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{
            position: 'absolute', bottom: '5%', right: '-5%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(129,140,248,0.2) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* back nav */}
        <div style={{ paddingTop: 28, paddingBottom: 4 }}>
          <a
            href="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#8892a4', fontSize: 14, textDecoration: 'none' }}
          >
            <ArrowLeft size={16} /> Home
          </a>
        </div>

        {/* hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          style={{ paddingTop: 36, paddingBottom: 40 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1.4,
              color: '#a78bfa', background: 'rgba(167,139,250,0.1)',
              border: '1px solid rgba(167,139,250,0.3)', borderRadius: 5,
              padding: '3px 10px',
            }}>LEARNING TRACK</span>
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 999,
              background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.2)',
              color: 'rgba(167,139,250,0.8)',
            }}>8 weeks · hands-on · no fluff</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BrainCircuit size={28} color="#a78bfa" />
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800,
                letterSpacing: '-0.03em', margin: 0,
                background: 'linear-gradient(120deg,#a78bfa,#818cf8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Zero to Hero: AI Modeling
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: 15, color: 'rgba(180,190,220,0.6)', lineHeight: 1.5 }}>
                From first principles to shipping a real AI product — no fluff, all hands-on.
              </p>
            </div>
          </div>

          {/* progress bar */}
          {mounted && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,139,250,0.15)',
              borderRadius: 12, padding: '16px 20px', marginTop: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: '#8892a4' }}>
                  {completedCount} of 8 weeks complete
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: allDone ? '#a78bfa' : '#f0f4ff' }}>
                  {pct}%
                </span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, ease, delay: 0.3 }}
                  style={{
                    height: '100%', borderRadius: 99,
                    background: 'linear-gradient(90deg,#818cf8,#a78bfa)',
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* week cards — vertical timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {curriculum.map((item, idx) => {
            const done = mounted ? completed[idx] : false
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease, delay: 0.1 + idx * 0.06 }}
                whileHover={{ x: 3 }}
                style={{
                  background: done ? `${item.color}0d` : 'rgba(255,255,255,0.025)',
                  border: done ? `1px solid ${item.color}40` : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14,
                  padding: '20px 22px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 18,
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                {/* week badge */}
                <div style={{
                  flexShrink: 0,
                  width: 44, height: 44, borderRadius: 11,
                  background: done ? `${item.color}22` : 'rgba(167,139,250,0.08)',
                  border: `1px solid ${done ? item.color + '50' : 'rgba(167,139,250,0.2)'}`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {done ? (
                    <CheckCircle size={20} color={item.color} />
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', lineHeight: 1.2, textAlign: 'center' }}>
                      W{idx + 1}
                    </span>
                  )}
                </div>

                {/* content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{
                      fontSize: 11, color: 'rgba(180,190,220,0.4)',
                      fontWeight: 500, flexShrink: 0,
                    }}>{item.week}</span>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 999,
                      background: `${item.color}18`, color: item.color, fontWeight: 600,
                    }}>{item.tag}</span>
                  </div>
                  <div style={{
                    fontSize: 16, fontWeight: 600, color: done ? 'rgba(240,244,255,0.55)' : '#f0f4ff',
                    textDecoration: done ? 'line-through' : 'none',
                    marginBottom: 4,
                  }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(180,190,220,0.5)', lineHeight: 1.55 }}>
                    {item.desc}
                  </div>

                  {/* actions row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
                    {item.colab && (
                      <a
                        href={item.colab}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 12, fontWeight: 600,
                          color: item.color, textDecoration: 'none',
                          padding: '5px 12px', borderRadius: 8,
                          background: `${item.color}12`,
                          border: `1px solid ${item.color}30`,
                        }}
                      >
                        <ExternalLink size={12} /> Open in Colab
                      </a>
                    )}
                    <button
                      onClick={() => toggleWeek(idx)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        padding: '5px 12px', borderRadius: 8,
                        background: done ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
                        border: done ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.1)',
                        color: done ? '#10b981' : 'rgba(180,190,220,0.55)',
                      }}
                    >
                      <CheckCircle size={12} color={done ? '#10b981' : 'rgba(180,190,220,0.3)'} />
                      {done ? 'Completed' : 'Mark complete'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* certificate CTA */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.6 }}
            style={{
              marginTop: 40, padding: '28px 24px', borderRadius: 16, textAlign: 'center',
              background: allDone ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.02)',
              border: allDone ? '1px solid rgba(167,139,250,0.35)' : '1px solid rgba(255,255,255,0.06)',
              transition: 'background 0.3s, border 0.3s',
            }}
          >
            <Award size={32} color={allDone ? '#a78bfa' : 'rgba(180,190,220,0.2)'} style={{ marginBottom: 12 }} />
            <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: allDone ? '#f0f4ff' : 'rgba(180,190,220,0.35)' }}>
              {allDone ? 'You did it! Claim your certificate.' : `Complete all 8 weeks to unlock your certificate (${completedCount}/8 done)`}
            </p>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: allDone ? 'rgba(167,139,250,0.7)' : 'rgba(180,190,220,0.25)' }}>
              {allDone ? 'Download a certificate of completion for your portfolio.' : 'Mark each week complete as you finish it.'}
            </p>
            <motion.button
              onClick={allDone ? handleCertificate : undefined}
              whileHover={allDone ? { scale: 1.04, boxShadow: '0 0 28px rgba(167,139,250,0.4)' } : {}}
              whileTap={allDone ? { scale: 0.97 } : {}}
              disabled={!allDone}
              style={{
                padding: '10px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                cursor: allDone ? 'pointer' : 'not-allowed',
                background: allDone ? 'linear-gradient(135deg,#a78bfa,#818cf8)' : 'rgba(255,255,255,0.05)',
                color: allDone ? '#fff' : 'rgba(180,190,220,0.3)',
                border: 'none',
                transition: 'background 0.3s',
              }}
            >
              Download Certificate
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @media print {
          body > *:not(#acl-certificate) { display: none !important; }
          #acl-certificate { display: block !important; }
        }
      `}</style>
    </div>
  )
}
