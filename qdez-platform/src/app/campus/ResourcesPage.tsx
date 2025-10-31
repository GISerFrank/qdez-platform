'use client'

import { resourcesData } from '@/lib/mockData'

export default function ResourcesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl">
          <span className="text-yellow-300">▸</span> 资源库 
          <span className="text-yellow-300">◂</span>
        </h2>
        <button className="pixel-btn">+ 上传资源</button>
      </div>

      {/* 资源分类 */}
      <div className="mb-8">
        <div className="flex gap-3 flex-wrap">
          <button className="pixel-btn text-xs">全部资源</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">📚 学习资料</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">📄 文书模板</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">💼 简历模板</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">📊 数据报告</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">🎬 视频教程</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">🔗 实用工具</button>
        </div>
      </div>

      {/* 资源列表 */}
      <div>
        {resourcesData.map(resource => (
          <div key={resource.id} className="resource-card">
            <div className="mb-3">
              {resource.featured && <span className="badge badge-featured">精选</span>}
              <span className="resource-type">{resource.type}</span>
            </div>
            <h3 className="text-sm mb-3">{resource.title}</h3>
            <p className="text-xs leading-relaxed opacity-80">{resource.description}</p>
            <div className="post-meta">
              <span>👤 {resource.author} {resource.school}</span>
              <span className="mx-2">|</span>
              <span>⬇️ {resource.downloads} 下载</span>
              <span className="mx-2">|</span>
              <span>⏰ {resource.time}</span>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="pixel-btn text-xs pixel-btn-success">下载资源</button>
              <button className="pixel-btn text-xs">👍 {resource.likes}</button>
            </div>
          </div>
        ))}
      </div>

      {/* 分页 */}
      <div className="text-center mt-8">
        <button className="pixel-btn">上一页</button>
        <span className="mx-4 text-sm">第 1 页 / 共 15 页</span>
        <button className="pixel-btn">下一页</button>
      </div>
    </div>
  )
}
