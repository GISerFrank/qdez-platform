'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'  // ✅ 导入 useSession
import { signOut } from 'next-auth/react'  // ✅ 导入 signOut
import Navigation from './campus/Navigation'
import HomePage from './campus/HomePage'
import ForumPage from './forum/page'
import QAPage from './qa/page'
import ResourcesPage from './campus/ResourcesPage'
import EventsPage from './campus/EventsPage'
import NetworkPage from './network/page'
import ProfilePage from './profile/page'
import Footer from './campus/Footer'

export default function MainPage() {
  const [currentPage, setCurrentPage] = useState('home')
  const { data: session, status } = useSession()  // ✅ 使用 NextAuth session

  // ✅ 主题管理：基于 NextAuth session
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
    } else {
      // 未登录：使用默认主题
      themes.forEach(t => document.body.classList.remove(t))
      document.body.classList.add('theme-default')
    }
  }, [session])

  // ✅ 登出处理
  const handleLogout = async () => {
    if (confirm('确定要登出吗？')) {
      // 清除旧的 localStorage 数据（兼容）
      localStorage.removeItem('qdez_user')
      localStorage.removeItem('userInfo')

      // 使用 NextAuth 登出
      await signOut({ callbackUrl: '/login' })
    }
  }

  // ✅ 构造给 Navigation 的用户信息对象
  const userInfo = session?.user ? {
    name: session.user.displayName || session.user.name,
    locationData: {
      icon: getCountryIcon(session.user.country),
      chinese: session.user.country || '未设置',
    }
  } : null

  return (
      <>
        <Navigation
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            userInfo={userInfo}  // ✅ 传递 NextAuth session 数据
            onLogout={handleLogout}
        />

        <main>
          <div style={{ display: currentPage === 'home' ? 'block' : 'none' }}>
            <HomePage onPageChange={setCurrentPage} />
          </div>

          <div style={{ display: currentPage === 'forum' ? 'block' : 'none' }}>
            <ForumPage />
          </div>

          <div style={{ display: currentPage === 'qa' ? 'block' : 'none' }}>
            <QAPage />
          </div>

          <div style={{ display: currentPage === 'resources' ? 'block' : 'none' }}>
            <ResourcesPage />
          </div>

          <div style={{ display: currentPage === 'events' ? 'block' : 'none' }}>
            <EventsPage />
          </div>

          <div style={{ display: currentPage === 'network' ? 'block' : 'none' }}>
            <NetworkPage />
          </div>

          <div style={{ display: currentPage === 'profile' ? 'block' : 'none' }}>
            <ProfilePage />
          </div>
        </main>

        <Footer />
      </>
  )
}

// ✅ 辅助函数：根据国家返回图标
function getCountryIcon(country?: string): string {
  const iconMap: Record<string, string> = {
    '美国': '🌵',
    '日本': '🗼',
    '英国': '🏰',
    '法国': '🗼',
    '澳大利亚': '🏖️',
  }
  return country ? (iconMap[country] || '🌍') : '🌍'
}