'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Node { id: string; label: string; x: number; y: number; color: string }
interface Edge { from: string; to: string; label?: string }
interface Step { label: string; narration: string; nodes: Node[]; edges: Edge[] }

interface Props {
  step: Step | null
  stepIndex: number
}

export default function ConceptCanvas({ step, stepIndex }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!step || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    for (const edge of step.edges) {
      const from = step.nodes.find(n => n.id === edge.from)
      const to = step.nodes.find(n => n.id === edge.to)
      if (!from || !to) continue

      const fx = from.x * W
      const fy = from.y * H
      const tx = to.x * W
      const ty = to.y * H

      ctx.beginPath()
      ctx.moveTo(fx, fy)
      ctx.lineTo(tx, ty)
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      ctx.lineWidth = 2
      ctx.stroke()

      const angle = Math.atan2(ty - fy, tx - fx)
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(tx - 12 * Math.cos(angle - 0.4), ty - 12 * Math.sin(angle - 0.4))
      ctx.lineTo(tx - 12 * Math.cos(angle + 0.4), ty - 12 * Math.sin(angle + 0.4))
      ctx.closePath()
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.fill()

      if (edge.label) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '11px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(edge.label, (fx + tx) / 2, (fy + ty) / 2 - 8)
      }
    }

    for (const node of step.nodes) {
      const x = node.x * W
      const y = node.y * H
      const r = 36

      const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2)
      grad.addColorStop(0, node.color + '44')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, r * 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = node.color + '33'
      ctx.fill()
      ctx.strokeStyle = node.color
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 12px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const words = node.label.split(' ')
      if (words.length > 2) {
        ctx.fillText(words.slice(0, 2).join(' '), x, y - 7)
        ctx.fillText(words.slice(2).join(' '), x, y + 9)
      } else {
        ctx.fillText(node.label, x, y)
      }
    }
  }, [step, stepIndex])

  if (!step) return null

  return (
    <motion.div
      key={stepIndex}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <canvas
        ref={canvasRef}
        width={700}
        height={420}
        style={{ width: '100%', height: 'auto', borderRadius: 16,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      />
    </motion.div>
  )
}
