'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { SlideCarouselSchema } from '@/lib/topics/schema'

type Props = { slide: z.infer<typeof SlideCarouselSchema>; active: boolean }

export default function SlideCarousel({ slide, active }: Props) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (!active) { setIdx(0); return }
    const t = setInterval(() => setIdx(i => (i + 1) % slide.items.length), 3000)
    return () => clearInterval(t)
  }, [active, slide.items.length])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '28px 32px', gap: 20 }}
    >
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollSnapType: 'x mandatory' }}>
        {slide.items.map((item, i) => (
          <motion.div
            key={i}
            onClick={() => setIdx(i)}
            animate={{
              background: i === idx ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
              borderColor: i === idx ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)',
            }}
            style={{
              minWidth: 200, flexShrink: 0, scrollSnapAlign: 'start',
              border: '1px solid', borderRadius: 12, padding: '18px 20px', cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: i === idx ? '#c4b5fd' : '#8892a4', marginBottom: 8 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(180,190,220,0.6)', lineHeight: 1.55 }}>
              {item.body}
            </div>
          </motion.div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {slide.items.map((_, i) => (
          <motion.button
            key={i} onClick={() => setIdx(i)}
            animate={{ width: i === idx ? 20 : 6, background: i === idx ? '#7c3aed' : 'rgba(255,255,255,0.2)' }}
            style={{ height: 6, borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }}
          />
        ))}
      </div>
    </motion.div>
  )
}
