'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Clock, BookOpen, ArrowRight, CheckCircle } from 'lucide-react'
import type { Topic } from '@/lib/topics/schema'

const ease: [number, number, number, number] = [0.23, 1, 0.32, 1]

export default function LearnTopicClient({ topic }: { topic: Topic }) {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: '#07080f', fontFamily: "'Inter', sans-serif", color: '#f0f4ff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 48px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {topic.tags.map(tag => (
              <span key={tag} style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}>{tag}</span>
            ))}
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 12px', lineHeight: 1.15 }}>{topic.title}</h1>
          <p style={{ fontSize: 15, color: 'rgba(180,190,220,0.6)', lineHeight: 1.65, marginBottom: 24 }}>{topic.description}</p>
          <div style={{ display: 'flex', gap: 20, marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(180,190,220,0.5)' }}>
              <Clock size={13} /> {topic.estimatedMins} min
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(180,190,220,0.5)' }}>
              <BookOpen size={13} /> {topic.lessons.length} lessons
            </div>
          </div>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {topic.lessons.map((lesson, i) => (
            <motion.button
              key={i}
              onClick={() => router.push(`/learn/${topic.slug}/${i}`)}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease }}
              whileHover={{ x: 6 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 14,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.15)',
                cursor: 'pointer', textAlign: 'left', width: '100%',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#a78bfa', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f4ff', marginBottom: 3 }}>{lesson.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(180,190,220,0.4)' }}>{lesson.slides.length} slides</div>
              </div>
              <ArrowRight size={15} color="rgba(124,58,237,0.5)" />
            </motion.button>
          ))}

          <motion.button
            onClick={() => router.push(`/learn/${topic.slug}/interview`)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            style={{
              marginTop: 8, padding: '16px 20px', borderRadius: 14,
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', width: '100%',
            }}
          >
            <CheckCircle size={20} color="#10b981" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#6ee7b7' }}>Mock Interview — {topic.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(110,231,183,0.5)', marginTop: 2 }}>Test everything you&#39;ve learned</div>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
