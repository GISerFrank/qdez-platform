'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { achievementsData } from '@/lib/mockData'

// 定义API返回的用户数据类型
interface UserProfile {
  id: string
  username: string
  email: string
  name: string | null
  displayName: string | null
  avatar: string | null
  bio: string | null
  qdezEnrollmentYear: number | null
  qdezGraduationYear: number | null
  qdezClass: string | null
  country: string | null
  city: string | null
  location: string | null
  currentSchool: string | null
  major: string | null
  degree: string | null
  enrollmentYear: number | null
  expectedGradYear: number | null
  wechat: string | null
  linkedin: string | null
  instagram: string | null
  github: string | null
  personalWebsite: string | null
  points: number
  availableInvites: number
  stats: {
    posts: number
    comments: number
    questions: number
    answers: number
    resources: number
    events: number
  }
}

// LocalStorage中的用户信息类型（兼容旧版本）
interface LocalUserInfo {
  name?: string
  school?: string
  major?: string
  year?: number
  enrollmentYear?: number
  locationData?: {
    chinese?: string
  }
  location?: {
    chinese?: string
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [localUserInfo, setLocalUserInfo] = useState<LocalUserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 从localStorage读取用户信息（兼容旧版本）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('userInfo')
        if (stored) {
          setLocalUserInfo(JSON.parse(stored))
        }
      } catch (err) {
        console.error('Error reading localStorage:', err)
      }
    }
  }, [])

  // 类型守卫：检查是否是LocalUserInfo
  const isLocalUserInfo = (data: UserProfile | LocalUserInfo | null): data is LocalUserInfo => {
    return data !== null && !('id' in data)
  }

  // 从API获取用户资料
  useEffect(() => {
    const fetchProfile = async () => {
      // 如果用户未登录，使用localStorage数据
      if (status === 'unauthenticated') {
        setLoading(false)
        return
      }

      // 如果还在加载session，等待
      if (status === 'loading') {
        return
      }

      try {
        setLoading(true)
        const response = await fetch('/api/user/profile', {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }

        const data = await response.json()
        if (data.success) {
          setProfile(data.user)
        } else {
          throw new Error(data.error || 'Failed to load profile')
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [status])

  // 计算已解锁成就数量
  const unlockedAchievements =
      achievementsData.contribution.filter(a => a.unlocked).length +
      achievementsData.learning.filter(a => a.unlocked).length +
      achievementsData.social.filter(a => a.unlocked).length

  // 决定显示哪个数据源（优先使用API数据，回退到localStorage）
  const displayData = profile || localUserInfo

  // 显示加载状态
  if (loading && status === 'authenticated') {
    return (
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl mb-8 text-center">
            <span className="text-yellow-300">▸</span> 个人中心
            <span className="text-yellow-300">◂</span>
          </h2>
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-sm">加载中...</div>
          </div>
        </div>
    )
  }

  // 显示错误状态
  if (error) {
    return (
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl mb-8 text-center">
            <span className="text-yellow-300">▸</span> 个人中心
            <span className="text-yellow-300">◂</span>
          </h2>
          <div className="text-center text-red-400 py-12">
            <div className="text-4xl mb-4">❌</div>
            <div className="text-sm">{error}</div>
            <button
                onClick={() => window.location.reload()}
                className="pixel-btn mt-4"
            >
              重试
            </button>
          </div>
        </div>
    )
  }

  return (
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl mb-8 text-center">
          <span className="text-yellow-300">▸</span> 个人中心
          <span className="text-yellow-300">◂</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 个人信息卡 */}
          <div className="pixel-container p-6 col-span-1" style={{ borderColor: '#06B6D4' }}>
            <div className="text-center mb-6">
              {/* 显示真实头像或默认emoji */}
              {profile?.avatar ? (
                  <img
                      src={profile.avatar}
                      alt="Avatar"
                      className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-cyan-500"
                      style={{ imageRendering: 'pixelated' }}
                  />
              ) : (
                  <div className="text-6xl mb-4">👤</div>
              )}
              <h3 className="text-lg mb-2">
                {profile?.displayName || profile?.name || (isLocalUserInfo(displayData) ? displayData.name : null) || '游客'}
              </h3>
              <p className="text-xs opacity-70">
                {profile?.currentSchool || (isLocalUserInfo(displayData) ? displayData.school : null) || '未登录'}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span>📍 当前位置:</span>
                <span>
                {profile?.city && profile?.country
                    ? `${profile.country}, ${profile.city}`
                    : isLocalUserInfo(displayData)
                        ? (displayData.locationData?.chinese || displayData.location?.chinese || '--')
                        : '--'}
              </span>
              </div>
              <div className="flex justify-between">
                <span>🎓 专业:</span>
                <span>
                {profile?.major || (isLocalUserInfo(displayData) ? displayData.major : null) || '--'}
              </span>
              </div>
              <div className="flex justify-between">
                <span>📅 入学年份:</span>
                <span>
                {profile?.enrollmentYear || (isLocalUserInfo(displayData) ? (displayData.enrollmentYear || displayData.year) : null) || '--'}
              </span>
              </div>
              <div className="flex justify-between">
                <span>⭐ 积分:</span>
                <span>{profile?.points ?? 0}</span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/profile/edit" className="pixel-btn w-full mb-3 block text-center">
                编辑资料
              </Link>
              <button className="pixel-btn pixel-btn-secondary w-full">查看成就</button>
            </div>
          </div>

          {/* 活动统计 */}
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="stat-card">
                <div className="text-sm mb-2">发帖数</div>
                <div className="stat-number">{profile?.stats.posts ?? 0}</div>
              </div>
              <div className="stat-card">
                <div className="text-sm mb-2">回复数</div>
                <div className="stat-number">{profile?.stats.comments ?? 0}</div>
              </div>
              <div className="stat-card">
                <div className="text-sm mb-2">提问数</div>
                <div className="stat-number">{profile?.stats.questions ?? 0}</div>
              </div>
              <div className="stat-card">
                <div className="text-sm mb-2">解答数</div>
                <div className="stat-number">{profile?.stats.answers ?? 0}</div>
              </div>
            </div>

            {/* 我的帖子 */}
            <div className="pixel-container p-6">
              <h3 className="text-lg mb-4 text-yellow-300">我的帖子</h3>
              <div className="space-y-3">
                <div className="text-xs opacity-70 text-center py-8">
                  {profile ? '暂无帖子' : '登录后查看你的帖子和活动记录'}
                </div>
              </div>
            </div>

            {/* 成就系统 */}
            <div className="pixel-container p-6 mt-8">
              <h3 className="text-lg mb-4 text-yellow-300">🏆 成就系统</h3>
              <div className="text-center mb-6">
                <div className="stat-number">{unlockedAchievements}</div>
                <div className="text-sm">已解锁成就</div>
              </div>

              <h4 className="text-sm mb-4">社区贡献</h4>
              <div className="flex flex-wrap gap-4 mb-6">
                {achievementsData.contribution.map(achievement => (
                    <div
                        key={achievement.id}
                        className={`text-center p-3 border-3 ${
                            achievement.unlocked ? 'border-yellow-400' : 'border-gray-600 opacity-30'
                        }`}
                        style={{
                          background: 'rgba(42, 42, 74, 0.8)',
                          width: '80px'
                        }}
                        title={achievement.desc}
                    >
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <div className="text-xs leading-tight">{achievement.name}</div>
                    </div>
                ))}
              </div>

              <h4 className="text-sm mb-4">学习成长</h4>
              <div className="flex flex-wrap gap-4 mb-6">
                {achievementsData.learning.map(achievement => (
                    <div
                        key={achievement.id}
                        className={`text-center p-3 border-3 ${
                            achievement.unlocked ? 'border-yellow-400' : 'border-gray-600 opacity-30'
                        }`}
                        style={{
                          background: 'rgba(42, 42, 74, 0.8)',
                          width: '80px'
                        }}
                        title={achievement.desc}
                    >
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <div className="text-xs leading-tight">{achievement.name}</div>
                    </div>
                ))}
              </div>

              <h4 className="text-sm mb-4">社交网络</h4>
              <div className="flex flex-wrap gap-4">
                {achievementsData.social.map(achievement => (
                    <div
                        key={achievement.id}
                        className={`text-center p-3 border-3 ${
                            achievement.unlocked ? 'border-yellow-400' : 'border-gray-600 opacity-30'
                        }`}
                        style={{
                          background: 'rgba(42, 42, 74, 0.8)',
                          width: '80px'
                        }}
                        title={achievement.desc}
                    >
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <div className="text-xs leading-tight">{achievement.name}</div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}