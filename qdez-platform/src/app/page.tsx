'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import Navigation from './campus/Navigation'
import HomePage from './campus/HomePage'
import Footer from './campus/Footer'

// 国家图标映射
function getCountryIcon(country?: string | null): string {
  const iconMap: Record<string, string> = {
    '美国': '🌵',
    '日本': '🗼',
    '英国': '🏰',
    '法国': '🗼',
    '澳大利亚': '🏖️',
  }
  return country ? (iconMap[country] || '🌍') : '🌍'
}

export default function MainPage() {
  const { data: session, status } = useSession()
  const [userInfo, setUserInfo] = useState<any>(null)

  // 主题管理：基于 NextAuth session
  useEffect(() => {
    const themes = ['theme-default', 'theme-arizona', 'theme-tokyo', 'theme-london', 'theme-paris', 'theme-sydney']

    if (session?.user) {
      // 已登录：根据用户国家设置主题
      themes.forEach(t => document.body.classList.remove(t))

      if (!document.body.classList.contains('scanlines')) {
        document.body.classList.add('scanlines')
      }

      // 根据国家映射主题
      const countryThemeMap: Record<string, string> = {
        '美国': 'arizona',
        '日本': 'tokyo',
        '英国': 'london',
        '法国': 'paris',
        '澳大利亚': 'sydney',
      }

      const theme = session.user.country ? countryThemeMap[session.user.country] : 'default'
      document.body.classList.add(`theme-${theme}`)

      // 构造用户信息对象
      setUserInfo({
        name: session.user.displayName || session.user.name,
        locationData: {
          icon: getCountryIcon(session.user.country),
          chinese: session.user.country || '未设置',
        }
      })
    } else {
      // 未登录：使用默认主题
      themes.forEach(t => document.body.classList.remove(t))
      document.body.classList.add('theme-default')
      setUserInfo(null)
    }
  }, [session])

  // 登出处理
  const handleLogout = async () => {
    if (confirm('确定要登出吗？')) {
      // 清除旧的 localStorage 数据（兼容）
      localStorage.removeItem('qdez_user')
      localStorage.removeItem('userInfo')

      // 使用 NextAuth 登出
      await signOut({ callbackUrl: '/login' })
    }
  }

  return (
      <>
        <Navigation
            currentPage="home"
            userInfo={userInfo}
            onLogout={handleLogout}
        />

        <main className="min-h-screen">
          <HomePage />
        </main>

        <Footer />
      </>
  )
}