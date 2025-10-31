import type { Metadata } from 'next'
import { Press_Start_2P } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'

// ✅ 使用 Next.js Font Optimization 加载 Press Start 2P
const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-press-start',
})

export const metadata: Metadata = {
  title: 'QDEZ Alumni Platform',
  description: '青岛二中留学互助平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      {/* ✅ 添加字体类名到 body */}
      <body className={pressStart2P.className}>
        {children}
      </body>
    </html>
  )
}
