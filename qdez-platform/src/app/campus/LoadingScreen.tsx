'use client'

import { useEffect, useRef } from 'react'
import MountainSeaBackground from './MountainSeaBackground'

export default function LoadingScreen() {
  const schoolNameRef = useRef<HTMLDivElement>(null)
  const acronymRef = useRef<HTMLDivElement>(null)

  // 点阵字模（12x12）—— 青岛二中
  const charMatrix: Record<string, number[][]> = {
    '青': [
      [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0],
    ],
    '岛': [
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
      [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0]
    ],
    '二': [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    '中': [
      [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0],
      [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0]
    ]
  }

  useEffect(() => {
    const schoolName = schoolNameRef.current
    const acronym = acronymRef.current

    if (!schoolName || !acronym) return

    // 渲染像素字
    const chars = ['青', '岛', '二', '中']
    schoolName.innerHTML = ''

    chars.forEach(char => {
      const matrix = charMatrix[char]
      if (!matrix) return

      const charDiv = document.createElement('div')
      charDiv.className = 'inline-block mx-4'
      charDiv.style.width = '120px'
      charDiv.style.height = '120px'
      charDiv.style.display = 'grid'
      charDiv.style.gridTemplateColumns = 'repeat(12, 1fr)'
      charDiv.style.gridTemplateRows = 'repeat(12, 1fr)'
      charDiv.style.gap = '2px'

      matrix.forEach(row => {
        row.forEach(cell => {
          const cellDiv = document.createElement('div')
          cellDiv.style.width = '100%'
          cellDiv.style.height = '100%'
          cellDiv.style.background = cell ? '#e0f8cf' : 'transparent'
          cellDiv.style.border = cell ? '1px solid #e0f8cf' : '1px solid #444'
          cellDiv.style.boxShadow = cell ? '0 0 8px #e0f8cf' : 'none'
          cellDiv.style.transition = 'background 0.1s'
          charDiv.appendChild(cellDiv)
        })
      })

      schoolName.appendChild(charDiv)
    })

    // 延迟显示缩写
    setTimeout(() => {
      acronym.textContent = 'Q D E Z'
    }, 1500)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black overflow-hidden">
      <MountainSeaBackground />

      <div className="relative z-10 flex flex-col items-center">
        <div
          ref={schoolNameRef}
          className="flex mb-8"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(224, 248, 207, 0.5))'
          }}
        ></div>
        <div
          ref={acronymRef}
          className="text-2xl text-green-400 tracking-widest"
          style={{
            textShadow: '0 0 20px rgba(16, 185, 129, 0.8)'
          }}
        ></div>
      </div>
    </div>
  )
}
