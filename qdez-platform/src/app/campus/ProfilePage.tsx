'use client'

import { achievementsData } from '@/lib/mockData'

interface ProfilePageProps {
  userInfo: any
}

export default function ProfilePage({ userInfo }: ProfilePageProps) {
  const unlockedAchievements = 
    achievementsData.contribution.filter(a => a.unlocked).length +
    achievementsData.learning.filter(a => a.unlocked).length +
    achievementsData.social.filter(a => a.unlocked).length

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
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-lg mb-2">{userInfo?.name || '游客'}</h3>
            <p className="text-xs opacity-70">{userInfo?.school || '未登录'}</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span>📍 当前位置:</span>
              <span>{userInfo?.locationData?.chinese || '--'}</span>
            </div>
            <div className="flex justify-between">
              <span>🎓 专业:</span>
              <span>{userInfo?.major || '--'}</span>
            </div>
            <div className="flex justify-between">
              <span>📅 入学年份:</span>
              <span>{userInfo?.year || '--'}</span>
            </div>
            <div className="flex justify-between">
              <span>⭐ 积分:</span>
              <span>0</span>
            </div>
          </div>

          <div className="mt-6">
            <button className="pixel-btn w-full mb-3">编辑资料</button>
            <button className="pixel-btn pixel-btn-secondary w-full">查看成就</button>
          </div>
        </div>

        {/* 活动统计 */}
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="stat-card">
              <div className="text-sm mb-2">发帖数</div>
              <div className="stat-number">12</div>
            </div>
            <div className="stat-card">
              <div className="text-sm mb-2">回复数</div>
              <div className="stat-number">47</div>
            </div>
            <div className="stat-card">
              <div className="text-sm mb-2">提问数</div>
              <div className="stat-number">8</div>
            </div>
            <div className="stat-card">
              <div className="text-sm mb-2">解答数</div>
              <div className="stat-number">23</div>
            </div>
          </div>

          {/* 我的帖子 */}
          <div className="pixel-container p-6">
            <h3 className="text-lg mb-4 text-yellow-300">我的帖子</h3>
            <div className="space-y-3">
              <div className="text-xs opacity-70 text-center py-8">
                {userInfo ? '暂无帖子' : '登录后查看你的帖子和活动记录'}
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

            <h4 className="text-sm mb-4">社交达人</h4>
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
