'use client'

interface HomePageProps {
  onPageChange: (page: string) => void
}

export default function HomePage({ onPageChange }: HomePageProps) {
  return (
    <div>
      {/* Hero 区域 */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1a1a35] to-[#2a2a4a] py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="pixel-title mb-6">QDEZ STUDY ABROAD PLATFORM</h1>
          <p className="pixel-subtitle mb-8">青岛二中留学互助社区 • 连接全球校友</p>
          
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

          <div className="mt-12 flex gap-4 justify-center flex-wrap">
            <button className="pixel-btn" onClick={() => onPageChange('forum')}>
              浏览论坛
            </button>
            <button className="pixel-btn pixel-btn-secondary" onClick={() => onPageChange('qa')}>
              提问求助
            </button>
            <button className="pixel-btn pixel-btn-success" onClick={() => onPageChange('resources')}>
              查看资源
            </button>
          </div>
        </div>
      </div>

      {/* 最新动态 */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl mb-8 text-center">
          <span className="text-yellow-300">▸</span> 最新动态 
          <span className="text-yellow-300">◂</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="post-card">
            <div className="mb-3">
              <span className="badge badge-hot">HOT</span>
              <span className="post-tag">申请经验</span>
            </div>
            <h3 className="text-sm mb-3">🎓 2025 Fall CS申请总结 - MIT/Stanford录取经验分享</h3>
            <p className="text-xs leading-relaxed opacity-80">
              详细分享我的申请时间线、文书准备、推荐信策略以及面试经验...
            </p>
            <div className="post-meta">
              <span>👤 张三 MIT&apos;25</span>
              <span className="mx-2">|</span>
              <span>💬 156 回复</span>
              <span className="mx-2">|</span>
              <span>⏰ 2天前</span>
            </div>
          </div>

          <div className="qa-card">
            <div className="mb-3">
              <span className="answer-count solved">✓ 已解决</span>
              <span className="post-tag">签证问题</span>
            </div>
            <h3 className="text-sm mb-3">📖 F1签证续签材料清单和注意事项？</h3>
            <p className="text-xs leading-relaxed opacity-80">
              准备回国续签F1，想问下最新的材料要求和流程...
            </p>
            <div className="post-meta">
              <span>👤 李四 UCLA&apos;24</span>
              <span className="mx-2">|</span>
              <span>12 个回答</span>
              <span className="mx-2">|</span>
              <span>1天前</span>
            </div>
          </div>

          <div className="resource-card">
            <div className="mb-3">
              <span className="badge badge-featured">精选</span>
              <span className="resource-type">📚 学习资料</span>
            </div>
            <h3 className="text-sm mb-3">GRE词汇速记宝典 + Anki卡组分享</h3>
            <p className="text-xs leading-relaxed opacity-80">
              整理了一套高频GRE词汇，配合Anki记忆曲线，已帮助30+学长学姐...
            </p>
            <div className="post-meta">
              <span>👤 王五 Berkeley&apos;23</span>
              <span className="mx-2">|</span>
              <span>⬇️ 289 下载</span>
              <span className="mx-2">|</span>
              <span>3天前</span>
            </div>
          </div>

          <div className="post-card">
            <div className="mb-3">
              <span className="badge badge-new">NEW</span>
              <span className="post-tag">生活攻略</span>
            </div>
            <h3 className="text-sm mb-3">🏠 波士顿租房避坑指南 - 超详细区域分析</h3>
            <p className="text-xs leading-relaxed opacity-80">
              在波士顿生活3年，整理了各区域租房的优缺点、价格区间...
            </p>
            <div className="post-meta">
              <span>👤 赵六 BU&apos;22</span>
              <span className="mx-2">|</span>
              <span>💬 45 回复</span>
              <span className="mx-2">|</span>
              <span>5小时前</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
