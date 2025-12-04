'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '../campus/Navigation'
import Footer from '../campus/Footer'

interface QALayoutClientProps {
  children: ReactNode
}

export default function QALayoutClient({ children }: QALayoutClientProps) {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    // 从 localStorage 读取用户信息
    const userInfoStr = localStorage.getItem('qdez_user')
    if (userInfoStr) {
      try {
        const user = JSON.parse(userInfoStr)
        setUserInfo(user)

        // 应用主题
        const themes = ['theme-default', 'theme-arizona', 'theme-tokyo', 'theme-london', 'theme-paris', 'theme-sydney']
        themes.forEach(t => document.body.classList.remove(t))

        if (user.theme) {
          document.body.classList.add(`theme-${user.theme}`)
        } else {
          document.body.classList.add('theme-default')
        }
      } catch (e) {
        console.error('解析用户信息失败:', e)
      }
    }
  }, [])

  const handleLogout = () => {
    if (confirm('确定要登出吗？')) {
      localStorage.removeItem('qdez_user')
      router.push('/login')
    }
  }

  return (
      <>
        {/* 导航栏 - 复用主页面的 Navigation 组件 */}
        <Navigation
            currentPage="qa"
            userInfo={userInfo}
            onLogout={handleLogout}
        />

        {/* 主内容区域 */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* 页脚 - 复用主页面的 Footer 组件 */}
        <Footer />
      </>
  )
}