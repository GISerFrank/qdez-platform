'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '../campus/Navigation'
import Footer from '../campus/Footer'

interface ForumLayoutClientProps {
  children: ReactNode
}

export default function ForumLayoutClient({ children }: ForumLayoutClientProps) {
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

  const handlePageChange = (page: string) => {
    // 处理页面切换逻辑
    switch(page) {
      case 'home':
        // 跳转到主页
        router.push('/')
        break
      case 'forum':
        // 已经在论坛页面，不需要跳转
        break
      case 'profile':
        // 如果有独立的个人中心路由
        router.push('/profile')
        break
      default:
        // 其他页面（qa, resources, events, network）
        // 返回主页面并设置状态（通过 URL 参数）
        router.push(`/?page=${page}`)
    }
  }

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
        currentPage="forum"
        onPageChange={handlePageChange}
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
