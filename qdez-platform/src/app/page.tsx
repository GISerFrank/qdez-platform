'use client'

import { useState, useEffect } from 'react'
import Navigation from './campus/Navigation'
import HomePage from './campus/HomePage'
import ForumPage from './campus/ForumPage'
import QAPage from './campus/QAPage'
import ResourcesPage from './campus/ResourcesPage'
import EventsPage from './campus/EventsPage'
import NetworkPage from './campus/NetworkPage'
import ProfilePage from './campus/ProfilePage'
import Footer from './campus/Footer'

export default function MainPage() {
  const [currentPage, setCurrentPage] = useState('home')
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    const userInfoStr = localStorage.getItem('qdez_user')
    if (userInfoStr) {
      try {
        const user = JSON.parse(userInfoStr)
        setUserInfo(user)

        // ✅ 使用 classList 而不是 className
        const themes = ['theme-default', 'theme-arizona', 'theme-tokyo', 'theme-london', 'theme-paris', 'theme-sydney']
        themes.forEach(t => document.body.classList.remove(t))

        if (!document.body.classList.contains('scanlines')) {
          document.body.classList.add('scanlines')
        }

        if (user.theme) {
          document.body.classList.add(`theme-${user.theme}`)
        } else {
          document.body.classList.add('theme-default')
        }
      } catch (e) {
        console.error('解析用户信息失败:', e)
        localStorage.removeItem('qdez_user')
      }
    } else {
      // 未登录时也设置默认主题
      const themes = ['theme-default', 'theme-arizona', 'theme-tokyo', 'theme-london', 'theme-paris', 'theme-sydney']
      themes.forEach(t => document.body.classList.remove(t))
      document.body.classList.add('theme-default')
    }
  }, [])

  const handleLogout = () => {
    if (confirm('确定要登出吗？')) {
      localStorage.removeItem('qdez_user')
      setUserInfo(null)
      window.location.reload()
    }
  }

  return (
    <>
      <Navigation 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        userInfo={userInfo}
        onLogout={handleLogout}
      />

      <main>
        {/* ✅ 修复：使用 display 控制显示，而不是条件渲染 */}
        {/* 这样可以保持组件实例，避免重复挂载 */}
        
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

        {/* ⭐ 特别注意：NetworkPage 必须保持挂载状态 */}
        <div style={{ display: currentPage === 'network' ? 'block' : 'none' }}>
          <NetworkPage />
        </div>

        <div style={{ display: currentPage === 'profile' ? 'block' : 'none' }}>
          <ProfilePage userInfo={userInfo} />
        </div>
      </main>

      <Footer />
    </>
  )
}
