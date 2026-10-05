'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCircuit, CheckCircle, ExternalLink, ArrowLeft, Award } from 'lucide-react'

const ACCENT = '#ec13d6'
const ACCENT2 = '#a30d94'
const BG = '#fff7ed'
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
  { week: 'Week 1', title: 'AI/ML Mental Models', tag: 'Foundations', color: '#6366f1', desc: 'What AI actually is, how models learn, key vocabulary. No code needed.', colab: '' },
  { week: 'Week 2', title: 'Data — Collect, Clean, Label', tag: 'Data', color: '#059669', desc: 'Pandas basics, dataset quality, labeling strategies. First Colab notebook.', colab: 'https://colab.research.google.com/github/google/eng-edu/raw/main/ml/cc/exercises/pandas_dataframe_ultraquick_tutorial.ipynb' },
  { week: 'Week 3', title: 'Your First Model', tag: 'scikit-learn', color: '#2563eb', desc: 'Train a classifier in 20 lines. Understand accuracy, precision, recall.', colab: 'https://colab.research.google.com/github/google/eng-edu/raw/main/ml/cc/exercises/intro_to_ml_fairness.ipynb' },
  { week: 'Week 4', title: 'Neural Networks from Scratch', tag: 'PyTorch', color: '#db2777', desc: 'Build a neural net, understand backprop, train on MNIST.', colab: '' },
  { week: 'Week 5', title: 'Fine-tuning LLMs', tag: 'HuggingFace + LoRA', color: ACCENT2, desc: 'Fine-tune Llama/Mistral on custom data with LoRA/QLoRA on free GPU.', colab: '' },
  { week: 'Week 6', title: 'Deploy a Model', tag: 'Replicate + Modal', color: '#16a34a', desc: 'Serve your model via API. Cost-effective inference strategies.', colab: '' },
  { week: 'Week 7', title: 'Agents & Tool Use', tag: 'Claude API', color: '#7c3aed', desc: 'Build an AI agent with tools, memory, and structured output.', colab: '' },
  { week: 'Week 8', title: 'Ship a Real Product', tag: 'Full Stack', color: '#d97706', desc: 'Combine everything into a deployable AI-powered app.', colab: '' },
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
      background: BG,
      minHeight: '100vh',
      fontFamily: 'var(--font-body, system-ui)',
      color: '#0f172a',
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

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* back nav */}
        <div style={{ paddingTop: 28, paddingBottom: 4 }}>
          <a
            href="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 14, textDecoration: 'none' }}
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
              color: ACCENT2, background: 'rgba(236,19,214,0.1)',
              border: '1px solid rgba(236,19,214,0.3)', borderRadius: 5,
              padding: '3px 10px',
            }}>LEARNING TRACK</span>
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 999,
              background: 'rgba(236,19,214,0.07)', border: '1px solid rgba(236,19,214,0.2)',
              color: ACCENT2,
            }}>8 weeks · hands-on · no fluff</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'rgba(236,19,214,0.12)', border: '1px solid rgba(236,19,214,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BrainCircuit size={28} color={ACCENT2} />
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800,
                letterSpacing: '-0.03em', margin: 0,
                background: `linear-gradient(120deg,${ACCENT},${ACCENT2})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Zero to Hero: AI Modeling
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: 15, color: '#64748b', lineHeight: 1.5 }}>
                From first principles to shipping a real AI product — no fluff, all hands-on.
              </p>
            </div>
          </div>

          {/* progress bar */}
          {mounted && (
            <div style={{
              background: '#fff', border: '1px solid #fed7aa',
              borderRadius: 12, padding: '16px 20px', marginTop: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  {completedCount} of 8 weeks complete
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: allDone ? ACCENT2 : '#0f172a' }}>
                  {pct}%
                </span>
              </div>
              <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, ease, delay: 0.3 }}
                  style={{
                    height: '100%', borderRadius: 99,
                    background: `linear-gradient(90deg,${ACCENT},${ACCENT2})`,
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
                  background: done ? `${item.color}0d` : '#fff',
                  border: done ? `1px solid ${item.color}40` : '1px solid #e2e8f0',
                  boxShadow: done ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
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
                  background: done ? `${item.color}22` : 'rgba(236,19,214,0.08)',
                  border: `1px solid ${done ? item.color + '50' : 'rgba(236,19,214,0.2)'}`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {done ? (
                    <CheckCircle size={20} color={item.color} />
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT2, lineHeight: 1.2, textAlign: 'center' }}>
                      W{idx + 1}
                    </span>
                  )}
                </div>

                {/* content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{
                      fontSize: 11, color: '#94a3b8',
                      fontWeight: 500, flexShrink: 0,
                    }}>{item.week}</span>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 999,
                      background: `${item.color}18`, color: item.color, fontWeight: 600,
                    }}>{item.tag}</span>
                  </div>
                  <div style={{
                    fontSize: 16, fontWeight: 600, color: done ? '#94a3b8' : '#0f172a',
                    textDecoration: done ? 'line-through' : 'none',
                    marginBottom: 4,
                  }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>
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
                        background: done ? 'rgba(16,185,129,0.1)' : '#f8fafc',
                        border: done ? '1px solid rgba(16,185,129,0.3)' : '1px solid #e2e8f0',
                        color: done ? '#10b981' : '#64748b',
                      }}
                    >
                      <CheckCircle size={12} color={done ? '#10b981' : '#cbd5e1'} />
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
              background: allDone ? 'rgba(236,19,214,0.08)' : '#fff',
              border: allDone ? `1px solid rgba(236,19,214,0.35)` : '1px solid #e2e8f0',
              boxShadow: allDone ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'background 0.3s, border 0.3s',
            }}
          >
            <Award size={32} color={allDone ? ACCENT2 : '#cbd5e1'} style={{ marginBottom: 12 }} />
            <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: allDone ? '#0f172a' : '#94a3b8' }}>
              {allDone ? 'You did it! Claim your certificate.' : `Complete all 8 weeks to unlock your certificate (${completedCount}/8 done)`}
            </p>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: allDone ? ACCENT2 : '#94a3b8' }}>
              {allDone ? 'Download a certificate of completion for your portfolio.' : 'Mark each week complete as you finish it.'}
            </p>
            <motion.button
              onClick={allDone ? handleCertificate : undefined}
              whileHover={allDone ? { scale: 1.04, boxShadow: '0 0 28px rgba(236,19,214,0.35)' } : {}}
              whileTap={allDone ? { scale: 0.97 } : {}}
              disabled={!allDone}
              style={{
                padding: '10px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                cursor: allDone ? 'pointer' : 'not-allowed',
                background: allDone ? `linear-gradient(135deg,${ACCENT},${ACCENT2})` : '#f1f5f9',
                color: allDone ? '#fff' : '#94a3b8',
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
