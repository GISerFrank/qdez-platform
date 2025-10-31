'use client'

import { forumPosts } from '@/lib/mockData'

export default function ForumPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl">
          <span className="text-yellow-300">▸</span> 论坛板块 
          <span className="text-yellow-300">◂</span>
        </h2>
        <button className="pixel-btn">+ 发新帖</button>
      </div>

      {/* 搜索和筛选 */}
      <div className="mb-8">
        <input 
          type="text" 
          className="pixel-search" 
          placeholder="搜索帖子标题、内容、作者..."
        />
        <div className="flex gap-3 mt-4 flex-wrap">
          <button className="pixel-btn text-xs">全部</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">申请经验</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">生活攻略</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">学习交流</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">实习求职</button>
          <button className="pixel-btn text-xs pixel-btn-secondary">闲聊吐槽</button>
        </div>
      </div>

      {/* 论坛帖子列表 */}
      <div>
        {forumPosts.map(post => (
          <div key={post.id} className="post-card">
            <div className="mb-3">
              {post.hot && <span className="badge badge-hot">HOT</span>}
              <span className="post-tag">{post.category}</span>
              {post.tags.map(tag => (
                <span key={tag} className="text-xs opacity-60 mr-2">#{tag}</span>
              ))}
            </div>
            <h3 className="text-sm mb-3 cursor-pointer hover:text-yellow-300">
              {post.title}
            </h3>
            <p className="text-xs leading-relaxed opacity-80">{post.content}</p>
            <div className="post-meta">
              <span>👤 {post.author} {post.school}</span>
              <span className="mx-2">|</span>
              <span>💬 {post.replies} 回复</span>
              <span className="mx-2">|</span>
              <span>👁️ {post.views} 浏览</span>
              <span className="mx-2">|</span>
              <span>⏰ {post.time}</span>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="pixel-btn text-xs">👍 {post.likes}</button>
              <button className="pixel-btn text-xs">查看详情</button>
            </div>
          </div>
        ))}
      </div>

      {/* 分页 */}
      <div className="text-center mt-8">
        <button className="pixel-btn">上一页</button>
        <span className="mx-4 text-sm">第 1 页 / 共 42 页</span>
        <button className="pixel-btn">下一页</button>
      </div>
    </div>
  )
}
