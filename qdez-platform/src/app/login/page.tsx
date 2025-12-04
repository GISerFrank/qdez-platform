/**
 * 登录页面 - 集成 NextAuth.js
 *
 * 修改说明：
 * ✅ 保留所有原有的 UI、动画、背景效果
 * ✅ 保留像素字加载动画
 * ✅ 保留山海背景 Canvas 动画
 * ✅ 保留所有样式和主题切换
 * ⚠️ 只修改登录逻辑：从 localStorage 改为 NextAuth
 * ⚠️ 表单字段：username/email + password
 */

'use client'

import { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toPinyin } from '@/lib/utils'
import { signIn } from 'next-auth/react'  // ✅ 新增：NextAuth

// 地区数据定义（保持原有）
const locations = {
  arizona: {
    chinese: '美国亚利桑那',
    localName: 'Arizona',
    icon: '🌵',
    theme: 'arizona'
  },
  tokyo: {
    chinese: '日本东京',
    localName: 'Tokyo',
    icon: '🗼',
    theme: 'tokyo'
  },
  london: {
    chinese: '英国伦敦',
    localName: 'London',
    icon: '🏰',
    theme: 'london'
  },
  paris: {
    chinese: '法国巴黎',
    localName: 'Paris',
    icon: '🗼',
    theme: 'paris'
  },
  sydney: {
    chinese: '澳大利亚悉尼',
    localName: 'Sydney',
    icon: '🏖️',
    theme: 'sydney'
  }
}

export default function LoginPage() {
  const router = useRouter()

  // ⚠️ 修改：表单状态从 className, name 改为 identifier, password
  const [identifier, setIdentifier] = useState('')  // 用户名或邮箱
  const [password, setPassword] = useState('')      // 密码
  const [location, setLocation] = useState('')      // 保留地区选择（可选）

  // ✅ 保留：原有状态
  const [showLocationDisplay, setShowLocationDisplay] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')  // ✅ 新增：错误提示

  // ✅ 保留：Canvas 和动画 refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const schoolNameRef = useRef<HTMLDivElement>(null)
  const acronymRef = useRef<HTMLDivElement>(null)

  // ✅ 保留：地区选择处理
  const handleLocationChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLocation = e.target.value
    setLocation(newLocation)

    if (newLocation) {
      setShowLocationDisplay(true)
      // ✅ 保留：主题切换
      document.documentElement.setAttribute('data-theme', newLocation)
    } else {
      setShowLocationDisplay(false)
      document.documentElement.removeAttribute('data-theme')
    }
  }

  // ⚠️ 修改：表单提交逻辑
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // ⚠️ 新逻辑：使用 NextAuth 登录
      const result = await signIn('credentials', {
        identifier,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      } else {
        // ✅ 成功后保持原有的加载动画流程
        // 加载动画会在 useEffect 中处理
        // 2秒后跳转到 campus
      }
    } catch (err) {
      setError('登录失败，请重试')
      setIsLoading(false)
    }
  }

  // ✅ 保留：点阵字模型（完全不变）
  const charMatrix: Record<string, number[][]> = {
    '青': [
      [0,0,0,0,0,1,1,0,0,0,0,0],
      [0,0,0,1,1,1,1,1,1,0,0,0],
      [0,0,0,0,1,1,1,1,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,1,1,1,1,0,0,0,0],
      [0,0,0,0,1,0,0,1,0,0,0,0],
      [0,0,0,0,1,1,1,1,0,0,0,0],
      [0,0,0,0,1,0,0,1,0,0,0,0],
      [0,0,0,0,1,1,1,1,0,0,0,0],
      [0,0,0,0,1,0,0,1,0,0,0,0],
      [0,0,0,0,1,0,1,1,0,0,0,0],
    ],
    '岛': [
      [0,0,0,0,0,1,0,0,0,0,0,0],
      [0,0,0,0,1,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,1,1,0,0,0,0],
      [0,0,1,0,0,0,0,1,0,0,0,0],
      [0,0,1,1,1,1,1,1,0,0,0,0],
      [0,0,1,0,0,0,0,1,0,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,1,0],
      [0,0,0,0,1,0,0,0,0,0,1,0],
      [0,1,0,0,1,0,0,1,0,0,1,0],
      [0,1,0,0,1,0,0,1,0,0,1,0],
      [0,1,1,1,1,1,1,1,0,0,1,0],
      [0,0,0,0,0,0,1,1,1,1,1,0]
    ],
    '二': [
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    '中': [
      [0,0,0,0,0,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,0,0,0,1,1,0,0,0,1,0],
      [0,1,0,0,0,1,1,0,0,0,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,0,0,0,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,0,0,0,0,0]
    ]
  }

  // ✅ 保留：渲染像素字（完全不变）
  const renderPixelChar = (char: string) => {
    const matrix = charMatrix[char]
    if (!matrix) return null

    return (
        <div className="pixel-char">
          {matrix.map((row, rowIndex) =>
              row.map((cell, cellIndex) => (
                  <div
                      key={`${rowIndex}-${cellIndex}`}
                      className={`pixel-cell ${cell ? 'on' : ''}`}
                  />
              ))
          )}
        </div>
    )
  }

  // 🔥 完全重写：四个字同时逐行扫描 + 背景立即显示
  useEffect(() => {
    if (!isLoading) return

    const chars = ['青', '岛', '二', '中']
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    if (!canvas || !ctx || !schoolNameRef.current) return

    // ===== 1. 初始化 Canvas 尺寸 =====
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let animationFrame = 0

    // ===== 2. 获取时间颜色 =====
    const getTimeColors = () => {
      const hour = new Date().getHours()

      if (hour >= 0 && hour < 5) {
        return {
          sky: ['#0a0e27', '#1a1a2e', '#16213e', '#0f3460'],
          mountains: { near: '#16213e', mid: '#0f3460', far: '#1a1a2e' },
          wave: '#533483',
          stars: true,
          celestial: 'moon'
        }
      } else if (hour >= 5 && hour < 7) {
        return {
          sky: ['#2b2d42', '#8d99ae', '#edf2f4', '#ef233c'],
          mountains: { near: '#2b2d42', mid: '#8d99ae', far: '#edf2f4' },
          wave: '#d90429',
          stars: false,
          celestial: 'sunrise'
        }
      } else if (hour >= 7 && hour < 9) {
        return {
          sky: ['#ffd60a', '#ffc300', '#ffb703', '#fb8500'],
          mountains: { near: '#ffb703', mid: '#fb8500', far: '#e85d04' },
          wave: '#faa307',
          stars: false,
          celestial: 'sunrise'
        }
      } else if (hour >= 9 && hour < 12) {
        return {
          sky: ['#4cc9f0', '#4895ef', '#4361ee', '#3f37c9'],
          mountains: { near: '#4cc9f0', mid: '#4895ef', far: '#4361ee' },
          wave: '#72ddf7',
          stars: false,
          celestial: 'sun'
        }
      } else if (hour >= 12 && hour < 15) {
        return {
          sky: ['#4cc9f0', '#4895ef', '#4361ee', '#3f37c9'],
          mountains: { near: '#4cc9f0', mid: '#4895ef', far: '#4361ee' },
          wave: '#72ddf7',
          stars: false,
          celestial: 'sun'
        }
      } else if (hour >= 15 && hour < 18) {
        return {
          sky: ['#ffd60a', '#ffc300', '#ffb703', '#fb8500'],
          mountains: { near: '#ffb703', mid: '#fb8500', far: '#e85d04' },
          wave: '#faa307',
          stars: false,
          celestial: 'sun'
        }
      } else if (hour >= 18 && hour < 20) {
        return {
          sky: ['#ff6d00', '#ff8500', '#ff9e00', '#e85d04'],
          mountains: { near: '#d00000', mid: '#9d0208', far: '#6a040f' },
          wave: '#dc2f02',
          stars: true,
          celestial: 'sunset'
        }
      } else {
        return {
          sky: ['#03045e', '#023e8a', '#0077b6', '#0096c7'],
          mountains: { near: '#023e8a', mid: '#0077b6', far: '#0096c7' },
          wave: '#00b4d8',
          stars: true,
          celestial: 'moon'
        }
      }
    }

    const colors = getTimeColors()

    // ===== 3. 背景绘制函数 =====
    const drawPixelMountain = (x: number, y: number, width: number, height: number, color: string, opacity: number) => {
      ctx.globalAlpha = opacity
      ctx.fillStyle = color
      const pixelSize = 8
      const points: [number, number][] = []

      for (let i = 0; i <= width; i += pixelSize * 2) {
        const h = height * (0.5 + Math.random() * 0.5)
        points.push([x + i, y - h])
      }

      points.forEach((point, i) => {
        if (i < points.length - 1) {
          const [x1, y1] = point
          const [x2, y2] = points[i + 1]
          ctx.beginPath()
          ctx.moveTo(Math.floor(x1 / pixelSize) * pixelSize, Math.floor(y1 / pixelSize) * pixelSize)
          ctx.lineTo(Math.floor(x2 / pixelSize) * pixelSize, Math.floor(y2 / pixelSize) * pixelSize)
          ctx.lineTo(Math.floor(x2 / pixelSize) * pixelSize, y)
          ctx.lineTo(Math.floor(x1 / pixelSize) * pixelSize, y)
          ctx.closePath()
          ctx.fill()
        }
      })
      ctx.globalAlpha = 1
    }

    const drawPixelWaves = (startY: number, width: number, height: number, frame: number) => {
      const pixelSize = 4
      ctx.fillStyle = colors.wave
      for (let x = 0; x < width; x += pixelSize) {
        const wave1 = Math.sin((x + frame) * 0.01) * 10
        const wave2 = Math.sin((x + frame) * 0.02) * 5
        const y = startY + wave1 + wave2
        for (let py = Math.floor(y / pixelSize) * pixelSize; py < height; py += pixelSize) {
          ctx.fillRect(x, py, pixelSize, pixelSize)
        }
      }
    }

    const drawStars = (width: number, height: number, frame: number) => {
      ctx.fillStyle = '#ffffff'
      const starCount = 100
      for (let i = 0; i < starCount; i++) {
        const x = (i * 137.508) % width
        const y = (i * 197.123) % (height * 0.6)
        const twinkle = Math.sin(frame * 0.05 + i) * 0.5 + 0.5
        ctx.globalAlpha = twinkle
        ctx.fillRect(Math.floor(x / 4) * 4, Math.floor(y / 4) * 4, 4, 4)
      }
      ctx.globalAlpha = 1
    }

    const drawMoon = (x: number, y: number) => {
      ctx.fillStyle = '#f0f0f0'
      const radius = 40
      const pixelSize = 4
      for (let px = x - radius; px < x + radius; px += pixelSize) {
        for (let py = y - radius; py < y + radius; py += pixelSize) {
          const dx = px - x
          const dy = py - y
          if (dx * dx + dy * dy < radius * radius) {
            ctx.fillRect(Math.floor(px / pixelSize) * pixelSize, Math.floor(py / pixelSize) * pixelSize, pixelSize, pixelSize)
          }
        }
      }
    }

    const drawSun = (x: number, y: number, intensity: number = 1) => {
      const pixelSize = 6
      const radius = 50
      ctx.fillStyle = `rgba(255, 220, 0, ${intensity})`
      for (let px = x - radius; px < x + radius; px += pixelSize) {
        for (let py = y - radius; py < y + radius; py += pixelSize) {
          const dx = px - x
          const dy = py - y
          if (dx * dx + dy * dy < radius * radius) {
            ctx.fillRect(Math.floor(px / pixelSize) * pixelSize, Math.floor(py / pixelSize) * pixelSize, pixelSize, pixelSize)
          }
        }
      }
      ctx.globalAlpha = 0.3
      const rayCount = 12
      const rayLength = 80
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2
        const rayX = x
        const rayY = y
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

    // ===== 4. 背景动画循环（立即开始）=====
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 天空渐变
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, colors.sky[0])
      gradient.addColorStop(0.4, colors.sky[1])
      gradient.addColorStop(0.6, colors.sky[2])
      gradient.addColorStop(1, colors.sky[3])
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerY = canvas.height * 0.6

      // 山峰
      drawPixelMountain(canvas.width * 0.2, centerY, 150, 100, colors.mountains.far, 0.6)
      drawPixelMountain(canvas.width * 0.5, centerY, 200, 130, colors.mountains.mid, 0.7)
      drawPixelMountain(canvas.width * 0.75, centerY, 180, 110, colors.mountains.far, 0.6)
      drawPixelMountain(canvas.width * 0.1, centerY, 120, 80, colors.mountains.near, 0.8)
      drawPixelMountain(canvas.width * 0.85, centerY, 140, 90, colors.mountains.near, 0.8)

      // 波浪
      drawPixelWaves(centerY, canvas.width, canvas.height, animationFrame)

      // 星星
      if (colors.stars) {
        drawStars(canvas.width, canvas.height, animationFrame)
      }

      // 天体
      if (colors.celestial === 'moon') {
        drawMoon(canvas.width * 0.8, canvas.height * 0.2)
      } else if (colors.celestial === 'sun') {
        drawSun(canvas.width * 0.8, canvas.height * 0.2)
      } else if (colors.celestial === 'sunrise') {
        drawSun(canvas.width * 0.15, canvas.height * 0.3, 0.7)
      } else if (colors.celestial === 'sunset') {
        drawSun(canvas.width * 0.85, canvas.height * 0.35, 0.8)
      }

      animationFrame++
      requestAnimationFrame(animate)
    }

    // 🔥 立即开始背景动画
    animate()

    // ===== 5. 初始化四个字符容器 =====
    chars.forEach(() => {
      const charDiv = document.createElement('div')
      charDiv.className = 'pixel-char'
      charDiv.style.display = 'grid'
      charDiv.style.gridTemplateColumns = 'repeat(12, 1fr)'
      charDiv.style.gridTemplateRows = 'repeat(12, 1fr)'
      charDiv.style.gap = '2px'
      charDiv.style.width = '120px'
      charDiv.style.height = '120px'
      charDiv.style.margin = '0 15px'
      schoolNameRef.current!.appendChild(charDiv)
    })

    // ===== 6. 四个字同时逐行扫描 =====
    let currentRow = 0
    const scanInterval = setInterval(() => {
      if (currentRow >= 12) {
        clearInterval(scanInterval)

        // 所有行扫描完成，显示缩写
        setTimeout(() => {
          if (acronymRef.current) {
            const letters = ['Q', 'D', 'E', 'Z']
            let letterIndex = 0

            const letterInterval = setInterval(() => {
              if (letterIndex < letters.length) {
                acronymRef.current!.textContent += letters[letterIndex] + ' '
                letterIndex++
              } else {
                clearInterval(letterInterval)
                // 跳转
                setTimeout(() => {
                  router.push('/')
                }, 500)
              }
            }, 200)
          }
        }, 300)
        return
      }

      // 🔥 关键：同时渲染四个字的当前行
      chars.forEach((char, charIndex) => {
        const matrix = charMatrix[char]
        const row = matrix[currentRow]
        const charDiv = schoolNameRef.current!.children[charIndex] as HTMLElement

        // 添加当前行的12个像素格子
        row.forEach((cell) => {
          const cellDiv = document.createElement('div')
          cellDiv.style.width = '100%'
          cellDiv.style.height = '100%'
          if (cell) {
            cellDiv.style.background = '#e0f8cf'
            cellDiv.style.border = '1px solid #e0f8cf'
            cellDiv.style.boxShadow = '0 0 8px #e0f8cf'
          } else {
            cellDiv.style.background = 'transparent'
            cellDiv.style.border = '1px solid #444'
          }
          charDiv.appendChild(cellDiv)
        })
      })

      currentRow++
    }, 30)

    return () => {
      clearInterval(scanInterval)
    }

  }, [isLoading, router])

  const selectedLocation = location ? locations[location as keyof typeof locations] : null

  return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* ✅ 保留：登录表单卡片 */}
        <div
            id="login-card"
            className="pixel-border w-full max-w-md p-6"
            style={{ display: isLoading ? 'none' : 'block' }}
        >
          <div className="text-center mb-6">
            <h1 className="text-lg">ALUMNI LOGIN</h1>
            <p className="text-xs mt-2 text-yellow-300">输入用户名或邮箱和密码</p>
          </div>

          <form id="login-form" className="space-y-4" onSubmit={handleSubmit}>
            {/* ⚠️ 修改：用户名或邮箱输入框 */}
            <div>
              <label className="block text-xs mb-1">USERNAME / EMAIL</label>
              <input
                  type="text"
                  placeholder="zhangsan 或 zhangsan@example.com"
                  className="pixel-input w-full"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
              />
            </div>

            {/* ⚠️ 修改：密码输入框 */}
            <div>
              <label className="block text-xs mb-1">PASSWORD</label>
              <input
                  type="password"
                  placeholder="输入密码"
                  className="pixel-input w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
            </div>

            {/* ✅ 保留（可选）：地区选择 - 用于主题切换 */}
            <div>
              <label className="block text-xs mb-1">THEME (可选)</label>
              <select
                  id="location-select"
                  className="pixel-input w-full"
                  value={location}
                  onChange={handleLocationChange}
              >
                <option value="">DEFAULT</option>
                <option value="arizona">美国亚利桑那</option>
                <option value="tokyo">日本东京</option>
                <option value="london">英国伦敦</option>
                <option value="paris">法国巴黎</option>
                <option value="sydney">澳大利亚悉尼</option>
              </select>
            </div>

            {/* ✅ 保留：地区信息显示 */}
            <div
                id="location-display"
                className={`mt-3 p-2 bg-gray-800 ${showLocationDisplay ? '' : 'hidden'}`}
            >
              <div className="flex items-center gap-2">
                <span id="location-icon" className="icon">{selectedLocation?.icon}</span>
                <div>
                  <p className="text-xs" id="location-chinese">{selectedLocation?.chinese}</p>
                  <p className="text-xs text-cyan-300 font-bold" id="location-local-name">{selectedLocation?.localName}</p>
                </div>
              </div>
            </div>

            {/* ✅ 新增：错误提示 */}
            {error && (
                <div className="mt-2 text-center text-xs text-red-400">
                  {error}
                </div>
            )}

            {/* ✅ 保留：提交按钮 */}
            <button type="submit" className="pixel-btn w-full mt-4" disabled={isLoading}>
              {isLoading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>

          {/* ✅ 新增：注册链接 */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-400">
              还没有账号？{' '}
              <a href="/register" className="text-indigo-400 hover:text-indigo-300">
                注册
              </a>
            </p>
          </div>
        </div>

        {/* ✅ 完全保留：加载动画屏幕 */}
        <div
            id="loading-screen"
            className="absolute inset-0 flex flex-col items-center justify-center bg-black overflow-hidden"
            style={{ display: isLoading ? 'flex' : 'none' }}
        >
          <canvas
              id="mountain-sea-bg"
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
          />
          <div className="relative z-10 flex flex-col items-center">
            <div id="school-name" ref={schoolNameRef} className="flex mb-8" />
            <div id="acronym" ref={acronymRef} className="text-2xl text-green-400 tracking-widest" />
          </div>
        </div>
      </div>
  )
}