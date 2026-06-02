'use client'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { SlideConceptSchema } from '@/lib/topics/schema'

type Props = { slide: z.infer<typeof SlideConceptSchema>; active: boolean }

const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]

export default function SlideConceptCard({ slide, active }: Props) {
  if (!active) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
      style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '40px 48px', gap: 24,
      }}
    >
      {slide.icon && (
        <motion.span
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease }}
          style={{ fontSize: 56, lineHeight: 1 }}
        >
          {slide.icon}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease }}
        style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: '#f0f4ff',
          margin: 0,
        }}
      >
        {slide.heading}
      </motion.h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        style={{
          fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
          color: 'rgba(200,210,240,0.75)',
          lineHeight: 1.75,
          maxWidth: 640,
          margin: 0,
        }}
      >
        {slide.body}
      </motion.div>
    </motion.div>
  )
}
