'use client'

import { useEffect, useRef, type CSSProperties } from 'react'

interface ParticlesCanvasProps {
  className?: string
  style?: CSSProperties
  /** Densidade base de partículas (ajustada pela área). Default 160. */
  density?: number
  /**
   * Fade de transparência no final (base do canvas). Fração 0..1 onde o fade
   * começa (ex.: 0.6 = opaco até 60%, transparente em 100%). undefined = sem fade.
   */
  fadeBottom?: number
}

/**
 * Pó dourado em canvas para seções escuras.
 * Movimento sincronizado ao scroll (parallax por profundidade); sem loop ocioso.
 * prefers-reduced-motion: 1 quadro estático. Pausa fora da tela (IntersectionObserver).
 * Decorativo (aria-hidden). Fundo transparente, composita sobre o que estiver atrás.
 */
export function ParticlesCanvas({ className, style, density = 160, fadeBottom }: ParticlesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0,
      height = 0,
      visible = true,
      ticking = false

    type Particle = {
      bx: number
      by: number
      r: number
      depth: number
      alpha: number
      hue: number
      sat: number
      light: number
      seed: number
      drift: number
      ember: boolean
    }
    let particles: Particle[] = []

    const seed = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(density, Math.max(70, (width * height) / 7000)))
      particles = Array.from({ length: count }, () => {
        const ember = Math.random() < 0.12
        return {
          bx: Math.random(),
          by: Math.random(),
          r: ember ? 1.6 + Math.random() * 1.4 : 0.4 + Math.random() * 1.4,
          depth: 0.12 + Math.random() * 0.9,
          alpha: ember ? 0.55 + Math.random() * 0.3 : 0.22 + Math.random() * 0.45,
          hue: 38 + Math.random() * 8, // 38 a 46 = ouro (mude p/ recolorir)
          sat: 45 + Math.random() * 18,
          light: 58 + Math.random() * 22,
          seed: Math.random() * Math.PI * 2,
          drift: 6 + Math.random() * 18,
          ember,
        }
      })
    }

    const sectionProgress = () => {
      const rect = canvas.getBoundingClientRect()
      return window.innerHeight - rect.top // 0 ao entrar, aumenta ao sair
    }

    const draw = () => {
      const progress = reduced ? 0 : sectionProgress()
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        const travel = progress * p.depth * 0.35
        let y = (p.by * height - travel) % height
        if (y < 0) y += height
        const x = p.bx * width + Math.sin(p.seed + progress * 0.0016) * p.drift
        ctx.beginPath()
        if (p.ember) {
          ctx.shadowColor = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 0.9)`
          ctx.shadowBlur = 6
        } else {
          ctx.shadowBlur = 0
        }
        ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${p.alpha})`
        ctx.arc(x, y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0
    }

    const onScroll = () => {
      if (reduced || !visible) return
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          draw()
          ticking = false
        })
      }
    }

    seed()
    draw()
    const onResize = () => {
      seed()
      draw()
    }
    window.addEventListener('resize', onResize, { passive: true })
    if (!reduced) window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) draw()
      },
      { threshold: 0 },
    )
    io.observe(canvas)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [density])

  // Fade de transparência no final: máscara CSS que apaga as partículas
  // suavemente até virar transparente na base (revela o fundo, não pinta cor).
  const fadeStyle: CSSProperties =
    fadeBottom != null
      ? (() => {
          const g = `linear-gradient(to bottom, #000 ${Math.round(fadeBottom * 100)}%, transparent 100%)`
          return { WebkitMaskImage: g, maskImage: g }
        })()
      : {}

  return <canvas ref={canvasRef} className={className} aria-hidden="true" style={{ ...fadeStyle, ...style }} />
}
