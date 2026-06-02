'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { z } from 'zod'
import { SlideQuizSchema } from '@/lib/topics/schema'

type Props = { slide: z.infer<typeof SlideQuizSchema>; active: boolean }

const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]
const OPTION_LETTERS = ['A', 'B', 'C', 'D']

export default function SlideQuiz({ slide, active }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null

  if (!active) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '32px 40px', gap: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
          padding: '3px 10px', borderRadius: 6,
        }}>Quick Check</span>
      </div>

      <h3 style={{ fontSize: 'clamp(1.1rem,2.5vw,1.5rem)', fontWeight: 700, color: '#f0f4ff', margin: 0, lineHeight: 1.35 }}>
        {slide.question}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {slide.options.map((opt, i) => {
          const isCorrect = i === slide.answer
          const isSelected = i === selected
          let bg = 'rgba(255,255,255,0.04)'
          let border = 'rgba(255,255,255,0.1)'
          let color = '#c4cde0'
          if (answered) {
            if (isCorrect) { bg = 'rgba(16,185,129,0.12)'; border = 'rgba(16,185,129,0.4)'; color = '#6ee7b7' }
            else if (isSelected) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.35)'; color = '#fca5a5' }
          } else if (isSelected) {
            bg = 'rgba(124,58,237,0.15)'; border = '#7c3aed'; color = '#c4b5fd'
          }
          return (
            <motion.button
              key={i}
              onClick={() => !answered && setSelected(i)}
              whileHover={answered ? {} : { scale: 1.01 }}
              whileTap={answered ? {} : { scale: 0.99 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 12, cursor: answered ? 'default' : 'pointer',
                background: bg, border: `1px solid ${border}`,
                transition: 'all 0.2s ease', textAlign: 'left',
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 11, fontWeight: 800,
                background: 'rgba(255,255,255,0.07)', color, flexShrink: 0,
              }}>
                {answered && isCorrect ? '✓' : answered && isSelected ? '✗' : OPTION_LETTERS[i]}
              </span>
              <span style={{ fontSize: 14, color, lineHeight: 1.4 }}>{opt}</span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '14px 18px', borderRadius: 12,
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
            }}
          >
            <p style={{ fontSize: 13, color: '#c4b5fd', lineHeight: 1.6, margin: 0 }}>
              💡 {slide.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
