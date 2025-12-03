// src/app/resources/page.tsx
// 资源库首页 - 连接真实API

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { ResourceListItem, ResourceCategory } from '@/types/resource'
import { 
  RESOURCE_CATEGORIES, 
  formatRelativeTime, 
  formatCount, 
  formatFileSize,
  formatRating,
  getFileFormatIcon 
} from '@/types/resource'

function ResourcesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 状态管理
  const [resources, setResources] = useState<ResourceListItem[]>([])
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 筛选和搜索状态
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [searchQuery, setSearchQuery] = useState('')

  // 从URL读取初始参数
  useEffect(() => {
    const category = searchParams.get('category') || 'all'
    const sort = searchParams.get('sort') || 'newest'
    const pageNum = parseInt(searchParams.get('page') || '1')

    setSelectedCategory(category)
    setSortBy(sort)
    setPage(pageNum)
  }, [searchParams])

  // 获取分类列表
  useEffect(() => {
    fetchCategories()
  }, [])

  // 获取资源列表
  useEffect(() => {
    fetchResources()
  }, [page, selectedCategory, sortBy])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/resources/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (err) {
      console.error('Fetch categories error:', err)
    }
  }

  const fetchResources = async () => {
    try {
      setLoading(true)
      setError(null)

      // 构建查询参数
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy: sortBy,
      })

      if (selectedCategory && selectedCategory !== 'all') {
        params.append('categoryId', selectedCategory)
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim())
      }

      const response = await fetch(`/api/resources?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取资源失败')
      }

      setResources(data.data?.resources || [])
      setTotal(data.data?.total || 0)
      setTotalPages(data.data?.totalPages || 1)
    } catch (err) {
      console.error('Fetch resources error:', err)
      setError(err instanceof Error ? err.message : '获取资源失败')
    } finally {
      setLoading(false)
    }
  }

  // 搜索处理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchResources()
  }

  // 分类切换
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setPage(1)

    // 更新 URL
    const params = new URLSearchParams()
    if (category !== 'all') params.append('category', category)
    params.append('sort', sortBy)
    params.append('page', '1')
    router.push(`/resources?${params}`)
  }

  // 排序切换
  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    setPage(1)

    const params = new URLSearchParams()
    if (selectedCategory !== 'all') params.append('category', selectedCategory)
    params.append('sort', sort)
    params.append('page', '1')
    router.push(`/resources?${params}`)
  }

  // 分页处理
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return

    setPage(newPage)
    const params = new URLSearchParams()
    if (selectedCategory !== 'all') params.append('category', selectedCategory)
    params.append('sort', sortBy)
    params.append('page', newPage.toString())
    router.push(`/resources?${params}`)

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* 标题和上传按钮 */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl">
          <span className="text-yellow-300">▸</span> 资源库
          <span className="text-yellow-300">◂</span>
        </h2>
        <Link href="/resources/upload" className="pixel-btn">
          + 上传资源
        </Link>
      </div>

      {/* 搜索框 */}
      <div className="mb-6">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            className="pixel-search"
            placeholder="搜索资源标题、描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* 分类筛选 */}
      <div className="mb-6">
        <div className="flex gap-3 flex-wrap">
          <button
            className={`pixel-btn text-xs ${selectedCategory === 'all' ? '' : 'pixel-btn-secondary'}`}
            onClick={() => handleCategoryChange('all')}
          >
            全部资源
          </button>
          {Object.entries(RESOURCE_CATEGORIES).map(([key, { label, icon }]) => (
            <button
              key={key}
              className={`pixel-btn text-xs ${selectedCategory === key ? '' : 'pixel-btn-secondary'}`}
              onClick={() => handleCategoryChange(key)}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* 排序选项 */}
      <div className="mb-8 flex gap-4 items-center">
        <span className="text-xs opacity-70">排序：</span>
        <div className="flex gap-2">
          {[
            { value: 'newest', label: '最新' },
            { value: 'downloads', label: '下载最多' },
            { value: 'rating', label: '评分最高' },
            { value: 'popular', label: '最热门' },
          ].map(option => (
            <button
              key={option.value}
              className={`text-xs px-3 py-1 border-2 transition-colors ${
                sortBy === option.value
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-gray-600 text-gray-400 hover:border-gray-400'
              }`}
              onClick={() => handleSortChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="text-xs opacity-50 ml-auto">
          共 {total} 个资源
        </span>
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
              <div className="text-6xl mb-4">📭</div>
              <p className="text-sm opacity-70 mb-2">暂无资源</p>
              <p className="text-xs opacity-50 mb-6">成为第一个分享资源的人吧！</p>
              <Link href="/resources/upload" className="pixel-btn">
                上传资源
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {resources.map(resource => (
                  <Link
                    key={resource.id}
                    href={`/resources/${resource.id}`}
                    className="block"
                  >
                    <div className="resource-card hover:translate-y-[-4px] transition-transform cursor-pointer">
                      {/* 标签行 */}
                      <div className="mb-3 flex items-center gap-2">
                        {resource.featured && (
                          <span className="badge badge-featured">精选</span>
                        )}
                        <span className="resource-type">
                          {resource.category?.icon || '📄'} {resource.category?.name || '资源'}
                        </span>
                        {resource.fileFormat && (
                          <span className="text-xs opacity-60">
                            {getFileFormatIcon(resource.fileFormat)} {resource.fileFormat.toUpperCase()}
                          </span>
                        )}
                        <span className="text-xs opacity-50">
                          {formatFileSize(resource.fileSize)}
                        </span>
                      </div>

                      {/* 标题 */}
                      <h3 className="text-sm mb-3 hover:text-yellow-300 transition-colors">
                        {resource.title}
                      </h3>

                      {/* 描述 */}
                      <p className="text-xs leading-relaxed opacity-80 line-clamp-2">
                        {resource.description}
                      </p>

                      {/* 元信息 */}
                      <div className="post-meta mt-3">
                        <span>
                          👤 {resource.author.displayName || resource.author.name}
                          {resource.author.currentSchool && ` · ${resource.author.currentSchool}`}
                        </span>
                        <span className="mx-2">|</span>
                        <span>⬇️ {formatCount(resource.downloads)} 下载</span>
                        <span className="mx-2">|</span>
                        <span>
                          ⭐ {formatRating(resource.ratingAvg)} ({resource.ratingCount})
                        </span>
                        <span className="mx-2">|</span>
                        <span>⏰ {formatRelativeTime(resource.createdAt)}</span>
                      </div>

                      {/* 操作按钮 */}
                      <div className="mt-4 flex gap-3">
                        <span className="pixel-btn text-xs pixel-btn-success pointer-events-none">
                          查看详情
                        </span>
                        <span className="pixel-btn text-xs pointer-events-none">
                          ❤️ {resource._count?.favorites || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
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

export default function ResourcesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4 animate-bounce">📚</div>
        <p className="text-sm opacity-70">加载中...</p>
      </div>
    }>
      <ResourcesPageContent />
    </Suspense>
  )
}
