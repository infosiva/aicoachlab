'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Volume2, VolumeX } from 'lucide-react'
import type { Slide } from '@/lib/topics/schema'

interface Message { role: 'user' | 'assistant'; text: string }

interface Props {
  topicTitle: string
  lessonTitle: string
  currentSlide: Slide
  voiceEnabled: boolean
}

export default function SlideChatOverlay({ topicTitle, lessonTitle, currentSlide, voiceEnabled }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: `Ask me anything about ${topicTitle}. I can see exactly which slide you're on.` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [voiceOn, setVoiceOn] = useState(voiceEnabled)
  const bottomRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const slideContext = JSON.stringify(currentSlide, null, 2)
    const systemPrompt = `You are an AI tutor for AICoachLab. The user is studying "${topicTitle}" in lesson "${lessonTitle}".
Current slide context: ${slideContext}
Answer questions about this slide or the broader topic. Be concise (2-3 sentences max). If asked off-topic, redirect: "I'm your ${topicTitle} tutor — for other topics, try Google or ChatGPT!"`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.text })),
          systemPrompt,
        }),
      })
      const data = await res.json()
      const reply = data.message ?? 'Could not get a response.'
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])

      if (voiceOn && process.env.NEXT_PUBLIC_VOICE_ENABLED === 'true') {
        const voiceRes = await fetch('/api/voice/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: reply }),
        })
        if (voiceRes.ok && voiceRes.body) {
          const blob = await voiceRes.blob()
          const url = URL.createObjectURL(blob)
          if (audioRef.current) audioRef.current.src = url
          else { audioRef.current = new Audio(url) }
          audioRef.current.play().catch(() => {})
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Connection error — try again.' }])
    } finally {
      setLoading(false)
    }
  }, [messages, currentSlide, topicTitle, lessonTitle, voiceOn])

  return (
    <>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 200,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(124,58,237,0.5)',
        }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}><X size={20} color="#fff" /></motion.span>
            : <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}><MessageSquare size={20} color="#fff" /></motion.span>
          }
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: 'fixed', bottom: 88, right: 24, zIndex: 200,
              width: 340, height: 480, display: 'flex', flexDirection: 'column',
              borderRadius: 18, background: 'rgba(7,8,15,0.97)',
              border: '1px solid rgba(124,58,237,0.25)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.7)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'grid', placeItems: 'center' }}>
                <MessageSquare size={13} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f4ff' }}>Ask your tutor</div>
                <div style={{ fontSize: 10, color: 'rgba(167,139,250,0.5)' }}>Knows this exact slide</div>
              </div>
              {voiceEnabled && (
                <button onClick={() => setVoiceOn(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  {voiceOn ? <Volume2 size={14} color="#a78bfa" /> : <VolumeX size={14} color="rgba(167,139,250,0.4)" />}
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '82%', padding: '8px 11px',
                    borderRadius: m.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                    background: m.role === 'user' ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${m.role === 'user' ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.08)'}`,
                    fontSize: 12.5, color: '#f0f4ff', lineHeight: 1.5,
                  }}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 4, paddingLeft: 4 }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                      style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c3aed' }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(124,58,237,0.1)', display: 'flex', gap: 6, flexShrink: 0 }}>
              <input
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
                placeholder="Ask about this slide..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 8, padding: '7px 10px', color: '#f0f4ff', fontSize: 12.5, outline: 'none', minWidth: 0 }}
              />
              <motion.button onClick={() => send(input)} whileTap={{ scale: 0.9 }} disabled={!input.trim() || loading}
                style={{ width: 32, height: 32, borderRadius: 8, background: input.trim() ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(124,58,237,0.07)', border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Send size={12} color={input.trim() ? '#fff' : 'rgba(124,58,237,0.3)'} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
