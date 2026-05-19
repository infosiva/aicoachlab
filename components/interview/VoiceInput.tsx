'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onTranscript: (text: string) => void
  onInterimTranscript?: (text: string) => void
  disabled?: boolean
  placeholder?: string
  accentColor?: string
}

export default function VoiceInput({
  onTranscript, onInterimTranscript, disabled, placeholder = 'Click mic to speak…', accentColor = '#10b981'
}: Props) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [supported, setSupported] = useState(true)
  const recRef = useRef<any>(null)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) setSupported(false)
  }, [])

  const start = useCallback(() => {
    if (disabled || !supported) return
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    rec.onstart = () => setListening(true)
    rec.onend = () => { setListening(false); setInterim('') }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let final = ''; let inter = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '
        else inter += e.results[i][0].transcript
      }
      if (inter) { setInterim(inter); onInterimTranscript?.(inter) }
      if (final.trim()) { onTranscript(final.trim()); setInterim('') }
    }
    rec.onerror = () => setListening(false)
    recRef.current = rec
    rec.start()
  }, [disabled, supported, onTranscript, onInterimTranscript])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
  }, [])

  const pulse = {
    scale: [1, 1.15, 1],
    boxShadow: [
      `0 0 0 0 ${accentColor}44`,
      `0 0 0 16px ${accentColor}00`,
      `0 0 0 0 ${accentColor}00`,
    ],
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <motion.button
        onClick={listening ? stop : start}
        disabled={disabled || !supported}
        animate={listening ? pulse : {}}
        transition={listening ? { duration: 1.2, repeat: Infinity } : {}}
        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
        style={{ width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          background: listening ? accentColor : 'rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.3s', opacity: disabled ? 0.4 : 1 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke={listening ? '#fff' : 'rgba(255,255,255,0.7)'} strokeWidth="2" strokeLinecap="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </motion.button>

      <div style={{ fontSize: 12, color: listening ? accentColor : 'rgba(255,255,255,0.35)',
        fontWeight: listening ? 700 : 400, letterSpacing: '0.05em', textTransform: 'uppercase',
        transition: 'all 0.3s' }}>
        {!supported ? 'Voice not supported in this browser' : listening ? '● Recording…' : placeholder}
      </div>

      <AnimatePresence>
        {interim && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic',
              textAlign: 'center', maxWidth: 400 }}>
            {interim}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
