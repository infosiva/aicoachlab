'use client'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { SlideCodeSchema } from '@/lib/topics/schema'

type Props = { slide: z.infer<typeof SlideCodeSchema>; active: boolean }

const LANG_COLOR: Record<string, string> = {
  typescript: '#3178c6', javascript: '#f7df1e', python: '#3776ab',
  bash: '#4eaa25', sql: '#e38c00', default: '#7c3aed',
}

export default function SlideCodeReveal({ slide, active }: Props) {
  const [visibleLines, setVisibleLines] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const annotationsApplied = useRef(false)

  useEffect(() => {
    if (!active) { setVisibleLines(0); annotationsApplied.current = false; return }
    setVisibleLines(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    slide.lines.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), 120 * i + 200))
    })
    return () => timers.forEach(clearTimeout)
  }, [active, slide.lines])

  // rough-notation highlights after all lines revealed
  useEffect(() => {
    if (visibleLines < slide.lines.length || annotationsApplied.current) return
    if (!slide.keyTerms?.length) return
    annotationsApplied.current = true
    setTimeout(async () => {
      if (!containerRef.current) return
      const { annotate } = await import('rough-notation')
      const codeEls = containerRef.current.querySelectorAll('code')
      codeEls.forEach(el => {
        const text = el.textContent ?? ''
        slide.keyTerms?.forEach(term => {
          if (text.includes(term)) {
            const ann = annotate(el as HTMLElement, {
              type: 'underline',
              color: '#a78bfa',
              strokeWidth: 2,
              padding: 1,
            })
            ann.show()
          }
        })
      })
    }, 100)
  }, [visibleLines, slide.lines.length, slide.keyTerms])

  const langColor = LANG_COLOR[slide.lang] ?? LANG_COLOR.default

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '28px 32px', gap: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: langColor, background: `${langColor}18`, border: `1px solid ${langColor}35`,
          padding: '3px 10px', borderRadius: 6,
        }}>
          {slide.lang}
        </span>
      </div>

      <div
        ref={containerRef}
        style={{
          flex: 1,
          background: 'rgba(10,12,20,0.95)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: 14,
          padding: '20px 24px',
          overflow: 'auto',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 'clamp(12px, 1.4vw, 15px)',
          lineHeight: 1.7,
        }}
      >
        {slide.lines.slice(0, visibleLines).map((line, i) => {
          const isHighlighted = slide.highlight?.includes(i)
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                display: 'flex',
                borderLeft: isHighlighted ? '2px solid #a78bfa' : '2px solid transparent',
                paddingLeft: 12,
                background: isHighlighted ? 'rgba(124,58,237,0.08)' : 'transparent',
                borderRadius: 4,
              }}
            >
              <span style={{ color: 'rgba(120,130,160,0.4)', minWidth: 28, userSelect: 'none', fontSize: '0.85em' }}>
                {i + 1}
              </span>
              <code style={{ color: '#e2e8f0', whiteSpace: 'pre' }}>{line}</code>
              {i === visibleLines - 1 && visibleLines < slide.lines.length && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  style={{ color: '#a78bfa', marginLeft: 2 }}
                >▊</motion.span>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
