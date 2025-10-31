'use client'

import { useEffect, useRef } from 'react'

interface MountainSeaBackgroundProps {
  theme?: string
}

export default function MountainSeaBackground({ theme = 'default' }: MountainSeaBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let animationFrameId: number
    let frame = 0

    // 根据时间获取场景配色
    const getTimeBasedColors = () => {
      const hour = new Date().getHours()
      
      if (hour >= 0 && hour < 5) {
        return {
          sky: ['#0a0a1a', '#1a1a35', '#0f2847', '#051f3e'],
          mountains: { far: '#1a2a4a', mid: '#2a3a5a', near: '#3a4a6a' },
          waves: ['#0f3a5f', '#1a4a6f', '#255a7f'],
          celestial: 'moon',
          stars: true
        }
      } else if (hour >= 5 && hour < 7) {
        return {
          sky: ['#1a1a35', '#2a3a5a', '#4a5a7a', '#3a4a6a'],
          mountains: { far: '#2a3a5a', mid: '#3a4a6a', near: '#4a5a7a' },
          waves: ['#2a4a6f', '#3a5a7f', '#4a6a8f'],
          celestial: 'moon',
          stars: true
        }
      } else if (hour >= 7 && hour < 9) {
        return {
          sky: ['#4a3a5a', '#6a5a7a', '#8a7a9a', '#5a6a8a'],
          mountains: { far: '#4a5a7a', mid: '#5a6a8a', near: '#6a7a9a' },
          waves: ['#4a6a8f', '#5a7a9f', '#6a8aaf'],
          celestial: 'sunrise',
          stars: false
        }
      } else if (hour >= 9 && hour < 12) {
        return {
          sky: ['#87CEEB', '#B0E0E6', '#ADD8E6', '#87CEFA'],
          mountains: { far: '#5a7a9a', mid: '#6a8aaa', near: '#7a9aba' },
          waves: ['#5a8aaf', '#6a9abf', '#7aaacf'],
          celestial: 'sun',
          stars: false
        }
      } else if (hour >= 12 && hour < 15) {
        return {
          sky: ['#87CEEB', '#B0E0E6', '#87CEFA', '#6495ED'],
          mountains: { far: '#6a8aaa', mid: '#7a9aba', near: '#8aaaca' },
          waves: ['#6a9abf', '#7aaacf', '#8abadf'],
          celestial: 'sun',
          stars: false
        }
      } else if (hour >= 15 && hour < 18) {
        return {
          sky: ['#B0C4DE', '#C0D4EE', '#A0B4CE', '#8094AE'],
          mountains: { far: '#7a9aba', mid: '#8aaaca', near: '#9abada' },
          waves: ['#7aaacf', '#8abadf', '#9acaef'],
          celestial: 'sun',
          stars: false
        }
      } else if (hour >= 18 && hour < 20) {
        return {
          sky: ['#6a5a7a', '#5a4a6a', '#4a3a5a', '#3a2a4a'],
          mountains: { far: '#4a5a7a', mid: '#3a4a6a', near: '#2a3a5a' },
          waves: ['#4a6a8f', '#3a5a7f', '#2a4a6f'],
          celestial: 'sunset',
          stars: true
        }
      } else {
        return {
          sky: ['#0a0a1a', '#1a1a35', '#0f2847', '#051f3e'],
          mountains: { far: '#1a2a4a', mid: '#2a3a5a', near: '#3a4a6a' },
          waves: ['#0f3a5f', '#1a4a6f', '#255a7f'],
          celestial: 'moon',
          stars: true
        }
      }
    }

    const colors = getTimeBasedColors()

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, colors.sky[0])
      gradient.addColorStop(0.4, colors.sky[1])
      gradient.addColorStop(0.6, colors.sky[2])
      gradient.addColorStop(1, colors.sky[3])
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerY = canvas.height * 0.6

      // 绘制远山
      drawPixelMountain(ctx, canvas.width * 0.2, centerY, 150, 100, colors.mountains.far, 0.6)
      drawPixelMountain(ctx, canvas.width * 0.5, centerY, 200, 130, colors.mountains.mid, 0.7)
      drawPixelMountain(ctx, canvas.width * 0.75, centerY, 180, 110, colors.mountains.far, 0.6)

      // 绘制近山
      drawPixelMountain(ctx, canvas.width * 0.1, centerY, 120, 80, colors.mountains.near, 0.8)
      drawPixelMountain(ctx, canvas.width * 0.85, centerY, 140, 90, colors.mountains.near, 0.8)

      // 绘制海浪
      drawPixelWaves(ctx, centerY, canvas.width, canvas.height, frame, colors.waves)

      // 绘制星星
      if (colors.stars) {
        drawStars(ctx, canvas.width, canvas.height, frame)
      }

      // 绘制天体
      if (colors.celestial === 'moon') {
        drawMoon(ctx, canvas.width * 0.8, canvas.height * 0.2)
      } else if (colors.celestial === 'sun') {
        drawSun(ctx, canvas.width * 0.8, canvas.height * 0.2)
      } else if (colors.celestial === 'sunrise') {
        drawSun(ctx, canvas.width * 0.15, canvas.height * 0.3, 0.7)
      } else if (colors.celestial === 'sunset') {
        drawSun(ctx, canvas.width * 0.85, canvas.height * 0.35, 0.8)
      }

      frame++
      animationFrameId = requestAnimationFrame(animate)
    }

    const drawPixelMountain = (
      ctx: CanvasRenderingContext2D,
      x: number,
      baseY: number,
      width: number,
      height: number,
      color: string,
      opacity: number
    ) => {
      ctx.fillStyle = color
      ctx.globalAlpha = opacity

      const pixelSize = 8
      const peakX = x
      const peakY = baseY - height

      for (let py = peakY; py < baseY; py += pixelSize) {
        const progress = (py - peakY) / height
        const currentWidth = width * progress

        for (let px = peakX - currentWidth / 2; px < peakX + currentWidth / 2; px += pixelSize) {
          if (Math.random() > 0.85) continue
          ctx.fillRect(Math.floor(px / pixelSize) * pixelSize, Math.floor(py / pixelSize) * pixelSize, pixelSize, pixelSize)
        }
      }

      ctx.globalAlpha = 1
    }

    const drawPixelWaves = (
      ctx: CanvasRenderingContext2D,
      seaLevel: number,
      width: number,
      height: number,
      frame: number,
      waveColors: string[]
    ) => {
      const pixelSize = 6

      for (let layer = 0; layer < 3; layer++) {
        ctx.fillStyle = waveColors[layer]
        ctx.globalAlpha = 0.3 + layer * 0.1

        const waveY = seaLevel + layer * 15
        const amplitude = 8
        const frequency = 0.02
        const speed = 0.02

        for (let x = 0; x < width; x += pixelSize) {
          const y = waveY + Math.sin(x * frequency + frame * speed + layer) * amplitude

          for (let py = y; py < height; py += pixelSize) {
            if (Math.random() > 0.7) continue
            ctx.fillRect(Math.floor(x / pixelSize) * pixelSize, Math.floor(py / pixelSize) * pixelSize, pixelSize, pixelSize)
          }
        }
      }

      ctx.globalAlpha = 1
    }

    const drawStars = (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
      ctx.fillStyle = '#e0f8cf'
      const starCount = 50

      for (let i = 0; i < starCount; i++) {
        const x = (Math.sin(i * 12.9898) * 43758.5453) % 1 * width
        const y = (Math.sin(i * 78.233) * 43758.5453) % 1 * (height * 0.5)
        const size = Math.abs((Math.sin(i * 43.123) * 43758.5453) % 1) * 2 + 1

        const twinkle = Math.abs(Math.sin(frame * 0.05 + i))
        ctx.globalAlpha = twinkle * 0.8 + 0.2

        if (i % 2 === 0) {
          ctx.fillRect(Math.floor(x), Math.floor(y), size, size)
        } else {
          ctx.fillRect(Math.floor(x) - 1, Math.floor(y), 3, 1)
          ctx.fillRect(Math.floor(x), Math.floor(y) - 1, 1, 3)
        }
      }

      ctx.globalAlpha = 1
    }

    const drawMoon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      ctx.fillStyle = '#ffd700'
      ctx.globalAlpha = 0.9

      const moonSize = 35
      const pixelSize = 4

      for (let py = -moonSize; py <= moonSize; py += pixelSize) {
        for (let px = -moonSize; px <= moonSize; px += pixelSize) {
          const centerX = px + pixelSize / 2
          const centerY = py + pixelSize / 2
          const distance = Math.sqrt(centerX * centerX + centerY * centerY)

          if (distance < moonSize) {
            ctx.fillRect(x + px, y + py, pixelSize, pixelSize)
          }
        }
      }

      // 月晕
      ctx.fillStyle = '#ffeb3b'
      ctx.globalAlpha = 0.15
      for (let py = -moonSize - 10; py <= moonSize + 10; py += pixelSize) {
        for (let px = -moonSize - 10; px <= moonSize + 10; px += pixelSize) {
          const centerX = px + pixelSize / 2
          const centerY = py + pixelSize / 2
          const distance = Math.sqrt(centerX * centerX + centerY * centerY)

          if (distance > moonSize && distance < moonSize + 10) {
            ctx.fillRect(x + px, y + py, pixelSize, pixelSize)
          }
        }
      }

      ctx.globalAlpha = 1
    }

    const drawSun = (ctx: CanvasRenderingContext2D, x: number, y: number, opacity: number = 1) => {
      ctx.fillStyle = '#FFD700'
      ctx.globalAlpha = opacity

      const sunSize = 40
      const pixelSize = 4

      // 太阳主体
      for (let py = -sunSize; py <= sunSize; py += pixelSize) {
        for (let px = -sunSize; px <= sunSize; px += pixelSize) {
          const centerX = px + pixelSize / 2
          const centerY = py + pixelSize / 2
          const distance = Math.sqrt(centerX * centerX + centerY * centerY)

          if (distance < sunSize) {
            ctx.fillRect(x + px, y + py, pixelSize, pixelSize)
          }
        }
      }

      // 太阳光晕
      ctx.fillStyle = '#FFA500'
      ctx.globalAlpha = opacity * 0.4
      for (let py = -sunSize - 12; py <= sunSize + 12; py += pixelSize) {
        for (let px = -sunSize - 12; px <= sunSize + 12; px += pixelSize) {
          const centerX = px + pixelSize / 2
          const centerY = py + pixelSize / 2
          const distance = Math.sqrt(centerX * centerX + centerY * centerY)

          if (distance > sunSize && distance < sunSize + 12) {
            ctx.fillRect(x + px, y + py, pixelSize, pixelSize)
          }
        }
      }

      // 太阳光芒
      ctx.fillStyle = '#FFD700'
      ctx.globalAlpha = opacity * 0.6
      const rayCount = 8
      const rayLength = 25
      for (let i = 0; i < rayCount; i++) {
        const angle = (Math.PI * 2 * i) / rayCount
        const rayX = x + Math.cos(angle) * (sunSize + 8)
        const rayY = y + Math.sin(angle) * (sunSize + 8)
        const rayEndX = rayX + Math.cos(angle) * rayLength
        const rayEndY = rayY + Math.sin(angle) * rayLength

        const steps = Math.floor(rayLength / pixelSize)
        for (let step = 0; step < steps; step++) {
          const t = step / steps
          const px = rayX + (rayEndX - rayX) * t
          const py = rayY + (rayEndY - rayY) * t
          ctx.fillRect(Math.floor(px / pixelSize) * pixelSize, Math.floor(py / pixelSize) * pixelSize, pixelSize, pixelSize)
        }
      }

      ctx.globalAlpha = 1
    }

    animate()

    // 窗口大小改变时重新调整画布
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  )
}
