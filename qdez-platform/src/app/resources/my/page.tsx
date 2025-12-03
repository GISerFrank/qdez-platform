// src/app/resources/my/page.tsx
// 我的资源 / 我的收藏页面

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import type { ResourceListItem } from '@/types/resource'
import {
  formatRelativeTime,
  formatCount,
  formatFileSize,
  formatRating,
  getFileFormatIcon,
} from '@/types/resource'

// 资源状态标签
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    PENDING: { label: '待审核', color: 'bg-yellow-600' },
    APPROVED: { label: '已通过', color: 'bg-green-600' },
    REJECTED: { label: '已拒绝', color: 'bg-red-600' },
  }

  const { label, color } = config[status] || { label: status, color: 'bg-gray-600' }

  return (
    <span className={`text-xs px-2 py-1 ${color} rounded`}>
      {label}
    </span>
  )
}

function MyResourcesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status: authStatus } = useSession()

  // Tab 状态
  const [activeTab, setActiveTab] = useState<'uploaded' | 'favorites'>('uploaded')
  
  // 数据状态
  const [resources, setResources] = useState<ResourceListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 从 URL 读取初始 tab
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'favorites') {
      setActiveTab('favorites')
    }

    // 显示上传成功提示
    const success = searchParams.get('success')
    if (success === '1') {
      // 可以添加 toast 提示
    }
  }, [searchParams])

  // 检查登录状态
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login?redirect=' + encodeURIComponent('/resources/my'))
    }
  }, [authStatus, router])

  // 获取资源列表
  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchResources()
    }
  }, [authStatus, activeTab, page])

  const fetchResources = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        type: activeTab,
        page: page.toString(),
        limit: '20',
      })

      const response = await fetch(`/api/resources/my?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取资源失败')
      }

      setResources(data.data?.resources || [])
      setTotal(data.data?.total || 0)
      setTotalPages(data.data?.totalPages || 1)
    } catch (err) {
      console.error('Fetch my resources error:', err)
      setError(err instanceof Error ? err.message : '获取资源失败')
    } finally {
      setLoading(false)
    }
  }

  // 切换 Tab
  const handleTabChange = (tab: 'uploaded' | 'favorites') => {
    setActiveTab(tab)
    setPage(1)
    router.push(`/resources/my?tab=${tab}`)
  }

  // 分页
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 取消收藏
  const handleUnfavorite = async (resourceId: string) => {
    try {
      await fetch(`/api/resources/${resourceId}/favorite`, {
        method: 'POST',
      })
      // 刷新列表
      fetchResources()
    } catch (err) {
      console.error('Unfavorite error:', err)
    }
  }

  // 加载中
  if (authStatus === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4 animate-bounce">📚</div>
        <p className="text-sm opacity-70">加载中...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* 标题 */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl">
          <span className="text-yellow-300">▸</span> 我的资源
          <span className="text-yellow-300">◂</span>
        </h2>
        <Link href="/resources/upload" className="pixel-btn">
          + 上传资源
        </Link>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-4 mb-8">
        <button
          className={`pixel-btn ${activeTab === 'uploaded' ? '' : 'pixel-btn-secondary'}`}
          onClick={() => handleTabChange('uploaded')}
        >
          📤 我上传的
        </button>
        <button
          className={`pixel-btn ${activeTab === 'favorites' ? '' : 'pixel-btn-secondary'}`}
          onClick={() => handleTabChange('favorites')}
        >
          ❤️ 我的收藏
        </button>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4 animate-bounce">📚</div>
          <p className="text-sm opacity-70">加载中...</p>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="pixel-container p-6 text-center">
          <div className="text-4xl mb-4">😢</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button className="pixel-btn text-xs" onClick={fetchResources}>
            重试
          </button>
        </div>
      )}

      {/* 资源列表 */}
      {!loading && !error && (
        <>
          {resources.length === 0 ? (
            <div className="pixel-container p-12 text-center">
              <div className="text-6xl mb-4">
                {activeTab === 'uploaded' ? '📤' : '❤️'}
              </div>
              <p className="text-sm opacity-70 mb-2">
                {activeTab === 'uploaded' ? '你还没有上传过资源' : '你还没有收藏任何资源'}
              </p>
              <p className="text-xs opacity-50 mb-6">
                {activeTab === 'uploaded' 
                  ? '分享你的学习资料，帮助更多学弟学妹！' 
                  : '浏览资源库，收藏你喜欢的资源'}
              </p>
              <Link 
                href={activeTab === 'uploaded' ? '/resources/upload' : '/resources'} 
                className="pixel-btn"
              >
                {activeTab === 'uploaded' ? '上传资源' : '浏览资源'}
              </Link>
            </div>
          ) : (
            <>
              {/* 统计信息 */}
              <div className="mb-6 text-xs opacity-70">
                共 {total} 个{activeTab === 'uploaded' ? '资源' : '收藏'}
              </div>

              {/* 资源卡片列表 */}
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div key={resource.id} className="resource-card">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* 标签行 */}
                        <div className="mb-3 flex items-center gap-2">
                          {activeTab === 'uploaded' && (
                            <StatusBadge status={resource.status} />
                          )}
                          {resource.featured && (
                            <span className="badge badge-featured">精选</span>
                          )}
                          <span className="resource-type">
                            {resource.category?.icon} {resource.category?.name}
                          </span>
                          {resource.fileFormat && (
                            <span className="text-xs opacity-60">
                              {getFileFormatIcon(resource.fileFormat)} {resource.fileFormat.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* 标题 */}
                        <Link 
                          href={`/resources/${resource.id}`}
                          className="text-sm mb-3 block hover:text-yellow-300 transition-colors"
                        >
                          {resource.title}
                        </Link>

                        {/* 描述 */}
                        <p className="text-xs leading-relaxed opacity-80 line-clamp-2 mb-3">
                          {resource.description}
                        </p>

                        {/* 元信息 */}
                        <div className="post-meta">
                          <span>⬇️ {formatCount(resource.downloads)} 下载</span>
                          <span className="mx-2">|</span>
                          <span>⭐ {formatRating(resource.ratingAvg)}</span>
                          <span className="mx-2">|</span>
                          <span>⏰ {formatRelativeTime(resource.createdAt)}</span>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Link
                          href={`/resources/${resource.id}`}
                          className="pixel-btn text-xs"
                        >
                          查看
                        </Link>
                        {activeTab === 'uploaded' && resource.status !== 'DELETED' && (
                          <Link
                            href={`/resources/${resource.id}/edit`}
                            className="pixel-btn text-xs pixel-btn-secondary"
                          >
                            编辑
                          </Link>
                        )}
                        {activeTab === 'favorites' && (
                          <button
                            className="pixel-btn text-xs bg-red-900"
                            onClick={() => handleUnfavorite(resource.id)}
                          >
                            取消收藏
                          </button>
                        )}
                      </div>
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
    </div>
  )
}

export default function MyResourcesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4 animate-bounce">📚</div>
        <p className="text-sm opacity-70">加载中...</p>
      </div>
    }>
      <MyResourcesContent />
    </Suspense>
  )
}
