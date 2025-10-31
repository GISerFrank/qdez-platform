'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { locations } from '@/lib/mockData'

export default function LoginPage() {
  const router = useRouter()
  const [className, setClassName] = useState('')
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [namePinyin, setNamePinyin] = useState('')
  const [showNameDisplay, setShowNameDisplay] = useState(false)
  const [showLocationDisplay, setShowLocationDisplay] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const schoolNameRef = useRef<HTMLDivElement>(null)
  const acronymRef = useRef<HTMLDivElement>(null)

  // ✅ 修复：设置初始主题
  useEffect(() => {
    // 页面加载时设置默认主题
    document.body.classList.add('theme-default')
    
    // 清理函数：组件卸载时移除主题类
    return () => {
      const themes = ['theme-default', 'theme-arizona', 'theme-tokyo', 'theme-london', 'theme-paris', 'theme-sydney']
      themes.forEach(t => document.body.classList.remove(t))
    }
  }, [])

  // 简化拼音转换
  const mockPinyin: Record<string, string> = {
    '张': 'Zhang', '王': 'Wang', '李': 'Li', '刘': 'Liu', '陈': 'Chen', '杨': 'Yang', '赵': 'Zhao', '黄': 'Huang',
    '周': 'Zhou', '吴': 'Wu', '徐': 'Xu', '孙': 'Sun', '胡': 'Hu', '朱': 'Zhu', '高': 'Gao', '林': 'Lin',
    '一': 'Yi', '二': 'Er', '三': 'San', '四': 'Si', '五': 'Wu', '六': 'Liu', '七': 'Qi', '八': 'Ba', '九': 'Jiu',
    '明': 'Ming', '华': 'Hua', '强': 'Qiang', '伟': 'Wei', '芳': 'Fang', '静': 'Jing', '丽': 'Li'
  }

  const toPinyin = (name: string) => {
    return name.split('').map(c => mockPinyin[c] || c).join(' ')
  }

  // 处理姓名输入
  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    setName(value)
    if (value) {
      setNamePinyin(toPinyin(value))
      setShowNameDisplay(true)
    } else {
      setShowNameDisplay(false)
    }
  }

  // 处理地点选择
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setLocation(val)
    if (val && locations[val as keyof typeof locations]) {
      setShowLocationDisplay(true)
      // ✅ 修复：移除所有主题类后再添加新的
      const themes = ['theme-default', 'theme-arizona', 'theme-tokyo', 'theme-london', 'theme-paris', 'theme-sydney']
      themes.forEach(t => document.body.classList.remove(t))
      document.body.classList.add(`theme-${val}`)
    } else {
      setShowLocationDisplay(false)
      const themes = ['theme-default', 'theme-arizona', 'theme-tokyo', 'theme-london', 'theme-paris', 'theme-sydney']
      themes.forEach(t => document.body.classList.remove(t))
      document.body.classList.add('theme-default')
    }
  }

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!location) {
      alert('SELECT LOCATION!')
      return
    }

    // 保存用户信息到 localStorage
    const userInfo = {
      className,
      name,
      namePinyin: toPinyin(name),
      location,
      locationData: locations[location as keyof typeof locations],
      loginTime: new Date().toISOString(),
      theme: location
    }

    localStorage.setItem('qdez_user', JSON.stringify(userInfo))
    console.log('用户信息已保存:', userInfo)

    // 开始加载动画
    setIsLoading(true)
  }

  // 点阵字模型（省略中间部分，保持原有代码）
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

  // 渲染像素字（省略，保持原有代码）
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

  // 加载动画和背景绘制（保持原有代码，这里省略以节省空间）
  // 加载动画和背景绘制（已修改为光栅扫描）
  useEffect(() => {
    if (!isLoading) return

    // 1. 构建像素字 DOM 结构
    if (schoolNameRef.current) {
      schoolNameRef.current.innerHTML = '' // 清空容器
      const chars = ['青', '岛', '二', '中']

      // 遍历每个字符
      chars.forEach(char => {
        const charEl = document.createElement('div')
        charEl.className = 'pixel-char'
        charEl.style.cssText = 'display: grid; grid-template-columns: repeat(12, 1fr); grid-template-rows: repeat(12, 1fr); gap: 2px; margin: 0 15px; width: 120px; height: 120px;'

        const matrix = charMatrix[char]
        if (matrix) {
          // 遍历 12x12 矩阵
          matrix.forEach((row, rowIndex) => {
            row.forEach((cell) => {
              const cellDiv = document.createElement('div')

              // 关键：存储行号 (data-row) 和点亮状态 (data-on)
              cellDiv.dataset.row = String(rowIndex)
              cellDiv.dataset.on = String(cell) // '1' 或 '0'

              // 初始状态：所有单元格都是 "off"
              cellDiv.className = 'pixel-cell'
              cellDiv.style.cssText = 'width: 100%; height: 100%; background: transparent; border: 1px solid #444; box-shadow: none; transition: background 0.05s ease, border-color 0.05s ease, box-shadow 0.05s ease;' // 添加平滑过渡

              charEl.appendChild(cellDiv)
            })
          })
        }

        schoolNameRef.current?.appendChild(charEl)
      })

      // 2. 启动光栅扫描动画
      let currentRow = 0
      const totalRows = 12
      const scanSpeedMs = 80 // 每一行扫描的速度（毫秒），你可以调整这个值

      function scanRow(row: number) {
        if (row >= totalRows) return // 扫描完成

        // 查找所有属于当前行 (data-row) 且需要点亮 (data-on="1") 的单元格
        const cellsToLight = schoolNameRef.current?.querySelectorAll(
            `.pixel-cell[data-row="${row}"][data-on="1"]`
        )

        // 点亮它们
        cellsToLight?.forEach(cell => {
          // 强制类型转换为 HTMLElement 来访问 style
          const htmlCell = cell as HTMLElement
          // 应用 "on" 样式
          htmlCell.style.background = '#e0f8cf'
          htmlCell.style.borderColor = '#e0f8cf'
          htmlCell.style.boxShadow = '0 0 8px #e0f8cf'
        })

        // 安排下一行的扫描
        setTimeout(() => scanRow(row + 1), scanSpeedMs)
      }

      // 从第 0 行开始扫描
      scanRow(0)
    }

    // --- 后续动画和跳转（保持不变）---

    // 扫描总耗时: 12 * 80ms = 960ms
    // 在 1500ms 后显示 QDEZ
    setTimeout(() => {
      const bgContainer = acronymRef.current
      if (bgContainer) {

        // --- 1. 配置背景容器 (acronymRef) ---
        bgContainer.innerHTML = '' // 清空
        bgContainer.style.display = 'flex'
        bgContainer.style.gap = '0.75rem' // 字母间距

        // --- 背景样式 (初始状态) ---
        bgContainer.style.opacity = '0'
        bgContainer.style.transform = 'scaleY(0.8)' // Y轴上轻微压缩，准备展开
        bgContainer.style.background = 'rgba(22, 22, 22, 0.7)' // 深色半透明背景
        bgContainer.style.padding = '0.5rem 1.5rem' // 内边距
        bgContainer.style.borderRadius = '4px' // 轻微圆角
        bgContainer.style.border = '1px solid #444' // 匹配边框风格
        // 关键：毛玻璃效果 (如果浏览器支持)
        bgContainer.style.backdropFilter = 'blur(3px)'
        bgContainer.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out, backdrop-filter 0.5s ease-out'

        // --- 2. 触发背景动画 ---
        // 我们使用一个极短的 (10ms) timeout 来确保 CSS 能够捕获到初始状态和最终状态的转变
        setTimeout(() => {
          bgContainer.style.opacity = '1'
          bgContainer.style.transform = 'scaleY(1)' // 展开
        }, 10);

        // --- 3. 安排字母动画 (在背景动画开始后 500ms) ---
        const letters = ['Q', 'D', 'E', 'Z']
        const letterAppearSpeed = 150 // 每个字母出现的间隔

        setTimeout(() => {
          // 在背景动画完成后，开始逐个显示字母
          letters.forEach((letter, index) => {
            const span = document.createElement('span')
            span.textContent = letter

            // --- 字母初始状态：透明、模糊、缩小 ---
            span.style.opacity = '0'
            span.style.filter = 'blur(8px)' // 焦外效果
            span.style.transform = 'scale(0.5)' // 缩小
            span.style.transition = 'opacity 0.4s ease, filter 0.4s ease, transform 0.4s ease'

            bgContainer.appendChild(span)

            // --- 4. 触发交错的字母动画 ---
            setTimeout(() => {
              // 动画到最终状态：清晰、正常大小
              span.style.opacity = '1'
              span.style.filter = 'blur(0)'
              span.style.transform = 'scale(1)'
            }, index * letterAppearSpeed) // 0ms, 150ms, 300ms, 450ms
          })
        }, 500) // 500ms 等待背景动画完成
      }

      // 2秒后跳转（保持不变）
      // 这个2秒是从 QDEZ 动画 *开始* 时计算的，总时长不变
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }, 1500)

    drawMountainSeaBackground()
  }, [isLoading, router]) // 依赖项不变

  // 绘制山海背景动画
  const drawMountainSeaBackground = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

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
    let animationFrame = 0

    const drawPixelMountain = (x: number, baseY: number, width: number, height: number, color: string, opacity: number) => {
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

    const drawPixelWaves = (seaLevel: number, width: number, height: number, frame: number) => {
      const pixelSize = 6

      for (let layer = 0; layer < 3; layer++) {
        ctx.fillStyle = colors.waves[layer]
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

    const drawStars = (width: number, height: number, frame: number) => {
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

    const drawMoon = (x: number, y: number) => {
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

    const drawSun = (x: number, y: number, opacity = 1) => {
      ctx.fillStyle = '#FFD700'
      ctx.globalAlpha = opacity

      const sunSize = 40
      const pixelSize = 4

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

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, colors.sky[0])
      gradient.addColorStop(0.4, colors.sky[1])
      gradient.addColorStop(0.6, colors.sky[2])
      gradient.addColorStop(1, colors.sky[3])
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerY = canvas.height * 0.6

      drawPixelMountain(canvas.width * 0.2, centerY, 150, 100, colors.mountains.far, 0.6)
      drawPixelMountain(canvas.width * 0.5, centerY, 200, 130, colors.mountains.mid, 0.7)
      drawPixelMountain(canvas.width * 0.75, centerY, 180, 110, colors.mountains.far, 0.6)

      drawPixelMountain(canvas.width * 0.1, centerY, 120, 80, colors.mountains.near, 0.8)
      drawPixelMountain(canvas.width * 0.85, centerY, 140, 90, colors.mountains.near, 0.8)

      drawPixelWaves(centerY, canvas.width, canvas.height, animationFrame)

      if (colors.stars) {
        drawStars(canvas.width, canvas.height, animationFrame)
      }

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

    animate()
  }

  const selectedLocation = location ? locations[location as keyof typeof locations] : null

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* 登录表单 */}
      <div id="login-card" className="pixel-border w-full max-w-md p-6" style={{ display: isLoading ? 'none' : 'block' }}>
        <div className="text-center mb-6">
          <h1 className="text-lg">ALUMNI LOGIN</h1>
          <p className="text-xs mt-2 text-yellow-300">输入班级与姓名</p>
        </div>

        <form id="login-form" className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs mb-1">CLASS</label>
            <input
              type="text"
              id="class-input"
              placeholder="高三3班"
              className="pixel-input w-full"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs mb-1">NAME</label>
            <input
              type="text"
              id="name-input"
              placeholder="张三"
              className="pixel-input w-full cursor"
              value={name}
              onChange={handleNameInput}
              required
            />
          </div>

          <div>
            <label className="block text-xs mb-1">LOCATION</label>
            <select
              id="location-select"
              className="pixel-input w-full"
              value={location}
              onChange={handleLocationChange}
              required
            >
              <option value="">SELECT</option>
              <option value="arizona">美国亚利桑那</option>
              <option value="tokyo">日本东京</option>
              <option value="london">英国伦敦</option>
              <option value="paris">法国巴黎</option>
              <option value="sydney">澳大利亚悉尼</option>
            </select>
          </div>

          <div id="location-display" className={`mt-3 p-2 bg-gray-800 ${showLocationDisplay ? '' : 'hidden'}`}>
            <div className="flex items-center gap-2">
              <span id="location-icon" className="icon">{selectedLocation?.icon}</span>
              <div>
                <p className="text-xs" id="location-chinese">{selectedLocation?.chinese}</p>
                <p className="text-xs text-cyan-300 font-bold" id="location-local-name">{selectedLocation?.localName}</p>
              </div>
            </div>
          </div>

          <div id="name-display" className={`mt-2 text-center text-xs text-green-300 ${showNameDisplay ? '' : 'hidden'}`}>
            NAME: <span id="name-pinyin">{namePinyin}</span>
          </div>

          <button type="submit" className="pixel-btn w-full mt-4">START</button>
        </form>
      </div>

      {/* 加载动画屏 */}
      <div id="loading-screen" className="absolute inset-0 flex flex-col items-center justify-center bg-black overflow-hidden" style={{ display: isLoading ? 'flex' : 'none' }}>
        <canvas id="mountain-sea-bg" ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>
        <div className="relative z-10 flex flex-col items-center">
          <div id="school-name" ref={schoolNameRef} className="flex mb-8"></div>
          <div id="acronym" ref={acronymRef} className="text-2xl text-green-400 tracking-widest"></div>
        </div>
      </div>
    </div>
  )
}
