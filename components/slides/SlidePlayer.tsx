'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'
import type { Lesson, Slide } from '@/lib/topics/schema'
import SlideConceptCard from './SlideConceptCard'
import SlideCodeReveal from './SlideCodeReveal'
import SlideCarousel from './SlideCarousel'
import SlideQuiz from './SlideQuiz'
import SlideChatOverlay from './SlideChatOverlay'

interface Props {
  lesson: Lesson
  topicTitle: string
  onComplete: () => void
}

export default function SlidePlayer({ lesson, topicTitle, onComplete }: Props) {
  const [idx, setIdx] = useState(0)
  const [voiceOn, setVoiceOn] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const slide: Slide = lesson.slides[idx]
  const total = lesson.slides.length
  const isLast = idx === total - 1

  useEffect(() => {
    const url = lesson.audioUrls?.[idx]
    if (!url || !voiceOn) return
    const audio = new Audio(url)
    audioRef.current = audio
    audio.play().catch(() => {})
    return () => { audio.pause(); audio.src = '' }
  }, [idx, lesson.audioUrls, voiceOn])

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => {
    if (isLast) { onComplete(); return }
    setIdx(i => i + 1)
  }, [isLast, onComplete])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  return (
    <div style={{
      minHeight: '100vh', background: '#07080f', display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', sans-serif", color: '#f0f4ff', position: 'relative',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px',
        borderBottom: '1px solid rgba(124,58,237,0.1)',
        background: 'rgba(7,8,15,0.9)', backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(180,190,220,0.6)' }}>
          {lesson.title}
        </div>

        <div style={{ display: 'flex', gap: 5, flex: 1, justifyContent: 'center' }}>
          {lesson.slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setIdx(i)}
              animate={{ width: i === idx ? 20 : 6, background: i < idx ? '#7c3aed' : i === idx ? '#a78bfa' : 'rgba(255,255,255,0.15)' }}
              style={{ height: 6, borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.25s' }}
            />
          ))}
        </div>

        <button
          onClick={() => setVoiceOn(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.6 }}
        >
          {voiceOn ? <Volume2 size={16} color="#a78bfa" /> : <VolumeX size={16} color="rgba(167,139,250,0.4)" />}
        </button>

        <div style={{ fontSize: 12, color: 'rgba(180,190,220,0.4)', minWidth: 40, textAlign: 'right' }}>
          {idx + 1}/{total}
        </div>
      </div>

      {/* Slide area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: '65vh' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            style={{ position: 'absolute', inset: 0 }}
          >
            {slide.type === 'concept'  && <SlideConceptCard slide={slide} active />}
            {slide.type === 'code'     && <SlideCodeReveal  slide={slide} active />}
            {slide.type === 'carousel' && <SlideCarousel    slide={slide} active />}
            {slide.type === 'quiz'     && <SlideQuiz        slide={slide} active />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', borderTop: '1px solid rgba(124,58,237,0.1)',
      }}>
        <motion.button
          onClick={prev} disabled={idx === 0}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: idx === 0 ? 'rgba(180,190,220,0.25)' : 'rgba(180,190,220,0.7)',
            cursor: idx === 0 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600,
          }}
        >
          <ChevronLeft size={16} /> Back
        </motion.button>

        <motion.button
          onClick={next}
          whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(124,58,237,0.4)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 10,
            background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none',
            color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700,
          }}
        >
          {isLast ? '🎯 Take mock interview' : 'Next'} <ChevronRight size={16} />
        </motion.button>
      </div>

      <SlideChatOverlay
        topicTitle={topicTitle}
        lessonTitle={lesson.title}
        currentSlide={slide}
        voiceEnabled={voiceOn}
      />
    </div>
  )
}
