'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  tip: string | null
  visible: boolean
}

export default function CoachOverlay({ tip, visible }: Props) {
  return (
    <AnimatePresence>
      {visible && tip && (
        <motion.div
          key={tip}
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          style={{
            position: 'fixed', bottom: 100, right: 24, zIndex: 200,
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)',
            borderRadius: 14, padding: '12px 16px', maxWidth: 280,
            backdropFilter: 'blur(16px)',
          }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#10b981',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                Coach
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                {tip}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
