'use client'

import { qaData } from '@/lib/mockData'

export default function QAPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl">
          <span className="text-yellow-300">▸</span> 问答中心 
          <span className="text-yellow-300">◂</span>
        </h2>
        <button className="pixel-btn">+ 提问</button>
      </div>

      {/* 标签筛选 */}
      <div className="mb-8">
        <div className="flex gap-3 flex-wrap">
          <button className="pixel-btn text-xs">全部问题</button>
          <button className="pixel-btn text-xs pixel-btn-success">未解决</button>
          <button className="pixel-btn text-xs">已解决</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">申请流程</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">选校定位</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">签证问题</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">入学准备</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">学业规划</button>
        </div>
      </div>

      {/* 问答列表 */}
      <div>
        {qaData.map(qa => (
          <div key={qa.id} className="qa-card">
            <div className="mb-3">
              <span className={`answer-count ${qa.solved ? 'solved' : ''}`}>
                {qa.solved ? '✓ 已解决' : `${qa.answers} 回答`}
              </span>
              <span className="post-tag">{qa.category}</span>
            </div>
            <h3 className="text-sm mb-3 cursor-pointer hover:text-yellow-300">
              {qa.title}
            </h3>
            <p className="text-xs leading-relaxed opacity-80">{qa.content}</p>
            <div className="post-meta">
              <span>👤 {qa.author} {qa.school}</span>
              <span className="mx-2">|</span>
              <span>👁️ {qa.views} 浏览</span>
              <span className="mx-2">|</span>
              <span>⏰ {qa.time}</span>
            </div>
            <div className="mt-4">
              <button className="pixel-btn text-xs">查看回答</button>
            </div>
          </div>
        ))}
      </div>

      {/* 分页 */}
      <div className="text-center mt-8">
        <button className="pixel-btn">上一页</button>
        <span className="mx-4 text-sm">第 1 页 / 共 23 页</span>
        <button className="pixel-btn">下一页</button>
      </div>
    </div>
  )
}
