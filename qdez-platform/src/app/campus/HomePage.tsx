'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
      <div>
        {/* Hero 区域 - 保留原版的统计数据展示 */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#1a1a35] to-[#2a2a4a] py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="pixel-title mb-6">QDEZ STUDY ABROAD PLATFORM</h1>
            <p className="pixel-subtitle mb-8">青岛二中留学互助社区 • 连接全球校友</p>

            {/* 统计卡片 - 原版设计 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              <div className="stat-card">
                <div className="text-sm mb-2">活跃用户</div>
                <div className="stat-number">268</div>
                <div className="text-xs text-gray-400">ACTIVE USERS</div>
              </div>
              <div className="stat-card">
                <div className="text-sm mb-2">论坛帖子</div>
                <div className="stat-number">1,247</div>
                <div className="text-xs text-gray-400">FORUM POSTS</div>
              </div>
              <div className="stat-card">
                <div className="text-sm mb-2">问答数量</div>
                <div className="stat-number">583</div>
                <div className="text-xs text-gray-400">Q&A THREADS</div>
              </div>
              <div className="stat-card">
                <div className="text-sm mb-2">资源分享</div>
                <div className="stat-number">342</div>
                <div className="text-xs text-gray-400">RESOURCES</div>
              </div>
            </div>

            {/* 快速操作按钮 - 新版Link设计 */}
            <div className="mt-12 flex gap-4 justify-center flex-wrap">
              <Link href="/forum" className="pixel-btn">
                浏览论坛
              </Link>
              <Link href="/qa" className="pixel-btn pixel-btn-secondary">
                发起提问
              </Link>
              <Link href="/network" className="pixel-btn pixel-btn-secondary">
                校友网络
              </Link>
            </div>
          </div>
        </div>

        {/* 功能板块 - 新版设计,增加hover效果 */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl mb-8 text-center">
            <span className="pixel-title-sm">功能导航</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 论坛板块 */}
            <Link href="/forum" className="feature-card group">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg mb-3">互助论坛</h3>
              <p className="text-sm opacity-70 mb-4">
                分享留学经验，讨论学习生活，建立海外互助社区
              </p>
              <div className="pixel-btn pixel-btn-sm mt-auto group-hover:bg-[var(--primary)]">
                进入论坛 →
              </div>
            </Link>

            {/* 问答板块 */}
            <Link href="/qa" className="feature-card group">
              <div className="text-4xl mb-4">❓</div>
              <h3 className="text-lg mb-3">问答系统</h3>
              <p className="text-sm opacity-70 mb-4">
                提出问题，分享答案，与学长学姐交流经验
              </p>
              <div className="pixel-btn pixel-btn-sm mt-auto group-hover:bg-[var(--primary)]">
                去提问 →
              </div>
            </Link>

            {/* 资源分享 */}
            <Link href="/resources" className="feature-card group">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg mb-3">资源分享</h3>
              <p className="text-sm opacity-70 mb-4">
                分享学习资料、申请攻略、实用工具
              </p>
              <div className="pixel-btn pixel-btn-sm mt-auto group-hover:bg-[var(--primary)]">
                浏览资源 →
              </div>
            </Link>

            {/* 活动管理 */}
            <Link href="/events" className="feature-card group">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg mb-3">活动管理</h3>
              <p className="text-sm opacity-70 mb-4">
                组织线上线下活动，增进校友感情
              </p>
              <div className="pixel-btn pixel-btn-sm mt-auto group-hover:bg-[var(--primary)]">
                查看活动 →
              </div>
            </Link>

            {/* 校友网络 */}
            <Link href="/network" className="feature-card group">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-lg mb-3">校友网络</h3>
              <p className="text-sm opacity-70 mb-4">
                地图可视化展示全球校友分布，建立联系
              </p>
              <div className="pixel-btn pixel-btn-sm mt-auto group-hover:bg-[var(--primary)]">
                查看地图 →
              </div>
            </Link>

            {/* 个人中心 */}
            <Link href="/profile" className="feature-card group">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-lg mb-3">个人中心</h3>
              <p className="text-sm opacity-70 mb-4">
                管理个人信息，查看我的内容和活动
              </p>
              <div className="pixel-btn pixel-btn-sm mt-auto group-hover:bg-[var(--primary)]">
                进入中心 →
              </div>
            </Link>
          </div>
        </div>

        {/* 最新动态 - 新版设计,使用真实链接 */}
        <div className="bg-[#1a1a35] py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl mb-8 text-center">
              <span className="pixel-title-sm">最新动态</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 论坛热帖 */}
              <div className="pixel-container p-6 hover:transform hover:-translate-y-1 transition-transform">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📝</div>
                  <div className="flex-1">
                    <h4 className="text-sm mb-2 text-[var(--primary)]">论坛热帖</h4>
                    <p className="text-xs opacity-70 mb-3">
                      "ASU春季选课攻略分享" - 10条回复
                    </p>
                    <Link href="/forum" className="text-xs text-[var(--primary)] hover:underline">
                      查看详情 →
                    </Link>
                  </div>
                </div>
              </div>

              {/* 热门问答 */}
              <div className="pixel-container p-6 hover:transform hover:-translate-y-1 transition-transform">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">❓</div>
                  <div className="flex-1">
                    <h4 className="text-sm mb-2 text-[var(--primary)]">热门问答</h4>
                    <p className="text-xs opacity-70 mb-3">
                      "如何申请校内工作？" - 5个回答
                    </p>
                    <Link href="/qa" className="text-xs text-[var(--primary)] hover:underline">
                      查看详情 →
                    </Link>
                  </div>
                </div>
              </div>

              {/* 即将开始的活动 */}
              <div className="pixel-container p-6 hover:transform hover:-translate-y-1 transition-transform">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📅</div>
                  <div className="flex-1">
                    <h4 className="text-sm mb-2 text-[var(--primary)]">即将开始</h4>
                    <p className="text-xs opacity-70 mb-3">
                      "东京校友聚会" - 12月15日
                    </p>
                    <Link href="/events" className="text-xs text-[var(--primary)] hover:underline">
                      查看详情 →
                    </Link>
                  </div>
                </div>
              </div>

              {/* 新增资源 */}
              <div className="pixel-container p-6 hover:transform hover:-translate-y-1 transition-transform">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📚</div>
                  <div className="flex-1">
                    <h4 className="text-sm mb-2 text-[var(--primary)]">新增资源</h4>
                    <p className="text-xs opacity-70 mb-3">
                      "GRE备考资料合集" - 刚刚上传
                    </p>
                    <Link href="/resources" className="text-xs text-[var(--primary)] hover:underline">
                      查看详情 →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 平台特色 - 新增部分 */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl mb-8 text-center">
            <span className="pixel-title-sm">平台特色</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-base mb-3">学长学姐经验</h3>
              <p className="text-xs opacity-70">
                直接与在读学长学姐交流，获取第一手留学经验和建议
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-base mb-3">互帮互助社区</h3>
              <p className="text-xs opacity-70">
                从选课到租房，从签证到就业，校友之间相互帮助
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-base mb-3">全球校友网络</h3>
              <p className="text-xs opacity-70">
                连接遍布全球的二中校友，建立持久的人脉关系
              </p>
            </div>
          </div>
        </div>
      </div>
  )
}