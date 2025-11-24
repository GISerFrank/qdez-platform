// src/app/forum/search/page.tsx
// 搜索结果页面

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { PostListItem } from '@/types/forum'
import { POST_CATEGORIES, formatRelativeTime, formatCount } from '@/lib/forum/utils'

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchInput, setSearchInput] = useState(query)

  useEffect(() => {
    if (query) {
      setSearchInput(query)
      fetchSearchResults()
    } else {
      setLoading(false)
    }
  }, [query, page])

  const fetchSearchResults = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: '20',
      })

      const response = await fetch(`/api/forum/search?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '搜索失败')
      }

      setPosts(data.data.posts)
      setTotal(data.data.total)
      setTotalPages(data.data.totalPages)
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : '搜索失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setPage(1)
      router.push(`/forum/search?q=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link href="/forum" className="pixel-btn text-xs">
          ← 返回论坛
        </Link>
      </div>

      {/* 搜索框 */}
      <div className="mb-8">
        <h2 className="text-2xl mb-4">
          <span className="text-yellow-300">▸</span> 搜索帖子
        </h2>
        <form onSubmit={handleSearch}>
          <div className="flex gap-3">
            <input
              type="text"
              className="flex-1 pixel-search"
              placeholder="输入关键词搜索..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="pixel-btn">
              🔍 搜索
            </button>
          </div>
        </form>
      </div>

      {/* 搜索结果 */}
      {query && (
        <>
          {/* 结果统计 */}
          <div className="mb-6 text-sm opacity-70">
            搜索 "<strong className="text-yellow-300">{query}</strong>" 
            {!loading && ` - 找到 ${total} 个结果`}
          </div>

          {/* 加载状态 */}
          {loading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <div className="text-sm opacity-70">搜索中...</div>
            </div>
          )}

          {/* 错误状态 */}
          {error && (
            <div className="pixel-container p-6 bg-red-900 bg-opacity-50 border-red-500">
              <p className="text-red-300 text-sm">❌ {error}</p>
            </div>
          )}

          {/* 搜索结果列表 */}
          {!loading && !error && (
            <>
              {posts.length === 0 ? (
                <div className="pixel-container p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-sm opacity-70 mb-2">没有找到相关帖子</p>
                  <p className="text-xs opacity-50">试试其他关键词吧</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {posts.map(post => (
                      <div key={post.id} className="post-card">
                        {/* 标签和分类 */}
                        <div className="mb-3">
                          {post.isPinned && <span className="badge badge-featured">📌 置顶</span>}
                          {post.isFeatured && <span className="badge badge-featured">⭐ 精华</span>}
                          <span className="post-tag">
                            {POST_CATEGORIES[post.category]?.icon || '💬'} {POST_CATEGORIES[post.category]?.label || post.category}
                          </span>
                          {post.tags?.map(tag => (
                            <span key={tag} className="text-xs opacity-60 mr-2">#{tag}</span>
                          ))}
                        </div>

                        {/* 标题 */}
                        <Link href={`/forum/${post.id}`}>
                          <h3 className="text-sm mb-3 cursor-pointer hover:text-yellow-300">
                            {post.title}
                          </h3>
                        </Link>

                        {/* 内容摘要 */}
                        <p className="text-xs leading-relaxed opacity-80 line-clamp-2">
                          {post.content}
                        </p>

                        {/* 元信息 */}
                        <div className="post-meta">
                          <span>
                            👤 {post.author.displayName || post.author.name}
                            {post.author.currentSchool && ` · ${post.author.currentSchool}`}
                          </span>
                          <span className="mx-2">|</span>
                          <span>💬 {formatCount(post.commentCount)} 回复</span>
                          <span className="mx-2">|</span>
                          <span>👁️ {formatCount(post.viewCount)} 浏览</span>
                          <span className="mx-2">|</span>
                          <span>⏰ {formatRelativeTime(post.createdAt)}</span>
                        </div>

                        {/* 操作按钮 */}
                        <div className="mt-4 flex gap-3">
                          <button className="pixel-btn text-xs">
                            👍 {formatCount(post.likeCount)}
                          </button>
                          <Link href={`/forum/${post.id}`} className="pixel-btn text-xs">
                            查看详情
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 分页 */}
                  {totalPages > 1 && (
                    <div className="text-center mt-8 flex justify-center items-center gap-4">
                      <button
                        className="pixel-btn text-xs"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >
                        上一页
                      </button>
                      <span className="text-sm">
                        第 {page} 页 / 共 {totalPages} 页
                      </span>
                      <button
                        className="pixel-btn text-xs"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                      >
                        下一页
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* 初始状态（没有搜索关键词） */}
      {!query && !loading && (
        <div className="pixel-container p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-sm opacity-70 mb-2">输入关键词开始搜索</p>
          <p className="text-xs opacity-50">可以搜索帖子标题、内容或作者</p>
        </div>
      )}
    </div>
  )
}
