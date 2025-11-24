// src/app/forum/page.tsx
// 论坛首页 - 连接真实API

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { PostListItem, PostCategory } from '@/types/forum'
import { POST_CATEGORIES } from '@/lib/forum/utils'
import { formatRelativeTime, formatCount } from '@/lib/forum/utils'

export default function ForumPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // 状态管理
    const [posts, setPosts] = useState<PostListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // 筛选和搜索状态
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('latest')
    const [searchQuery, setSearchQuery] = useState('')

    // 从URL读取初始参数
    useEffect(() => {
        const category = searchParams.get('category') || 'all'
        const sort = searchParams.get('sort') || 'latest'
        const pageNum = parseInt(searchParams.get('page') || '1')

        setSelectedCategory(category)
        setSortBy(sort)
        setPage(pageNum)
    }, [searchParams])

    // 获取帖子列表
    useEffect(() => {
        fetchPosts()
    }, [page, selectedCategory, sortBy])

    const fetchPosts = async () => {
        try {
            setLoading(true)
            setError(null)

            // 构建查询参数
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                sort: sortBy,
            })

            if (selectedCategory && selectedCategory !== 'all') {
                params.append('category', selectedCategory)
            }

            const response = await fetch(`/api/forum/posts?${params}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || '获取帖子失败')
            }

            setPosts(data.data.posts)
            setTotal(data.data.total)
            setTotalPages(data.data.totalPages)
        } catch (err) {
            console.error('Fetch posts error:', err)
            setError(err instanceof Error ? err.message : '获取帖子失败')
        } finally {
            setLoading(false)
        }
    }

    // 搜索处理
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/forum/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    // 分类切换
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category)
        setPage(1) // 重置到第一页

        // 更新 URL
        const params = new URLSearchParams()
        if (category !== 'all') params.append('category', category)
        params.append('sort', sortBy)
        params.append('page', '1')
        router.push(`/forum?${params}`)
    }

    // 排序切换
    const handleSortChange = (sort: string) => {
        setSortBy(sort)
        setPage(1)

        const params = new URLSearchParams()
        if (selectedCategory !== 'all') params.append('category', selectedCategory)
        params.append('sort', sort)
        params.append('page', '1')
        router.push(`/forum?${params}`)
    }

    // 分页处理
    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return

        setPage(newPage)
        const params = new URLSearchParams()
        if (selectedCategory !== 'all') params.append('category', selectedCategory)
        params.append('sort', sortBy)
        params.append('page', newPage.toString())
        router.push(`/forum?${params}`)

        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="container mx-auto px-4 py-16">
            {/* 标题和发帖按钮 */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl">
                    <span className="text-yellow-300">▸</span> 论坛板块
                    <span className="text-yellow-300">◂</span>
                </h2>
                <Link href="/forum/new" className="pixel-btn">
                    + 发新帖
                </Link>
            </div>

            {/* 搜索和筛选 */}
            <div className="mb-8">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="pixel-search"
                        placeholder="搜索帖子标题、内容、作者..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                {/* 分类筛选 */}
                <div className="flex gap-3 mt-4 flex-wrap">
                    <button
                        className={`pixel-btn text-xs ${selectedCategory === 'all' ? '' : 'pixel-btn-secondary'}`}
                        onClick={() => handleCategoryChange('all')}
                    >
                        全部
                    </button>
                    {Object.entries(POST_CATEGORIES).map(([value, { label, icon }]) => (
                        <button
                            key={value}
                            className={`pixel-btn text-xs ${selectedCategory === value ? '' : 'pixel-btn-secondary'}`}
                            onClick={() => handleCategoryChange(value)}
                        >
                            {icon} {label}
                        </button>
                    ))}
                </div>

                {/* 排序选项 */}
                <div className="flex gap-3 mt-4">
                    <button
                        className={`pixel-btn text-xs ${sortBy === 'latest' ? '' : 'pixel-btn-secondary'}`}
                        onClick={() => handleSortChange('latest')}
                    >
                        🕐 最新
                    </button>
                    <button
                        className={`pixel-btn text-xs ${sortBy === 'hot' ? '' : 'pixel-btn-secondary'}`}
                        onClick={() => handleSortChange('hot')}
                    >
                        🔥 最热
                    </button>
                    <button
                        className={`pixel-btn text-xs ${sortBy === 'mostCommented' ? '' : 'pixel-btn-secondary'}`}
                        onClick={() => handleSortChange('mostCommented')}
                    >
                        💬 最多评论
                    </button>
                    <button
                        className={`pixel-btn text-xs ${sortBy === 'mostLiked' ? '' : 'pixel-btn-secondary'}`}
                        onClick={() => handleSortChange('mostLiked')}
                    >
                        👍 最多点赞
                    </button>
                </div>
            </div>

            {/* 加载状态 */}
            {loading && (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">⏳</div>
                    <div className="text-sm opacity-70">加载中...</div>
                </div>
            )}

            {/* 错误状态 */}
            {error && (
                <div className="pixel-container p-6 bg-red-900 bg-opacity-50 border-red-500">
                    <p className="text-red-300 text-sm">❌ {error}</p>
                    <button
                        className="pixel-btn text-xs mt-4"
                        onClick={fetchPosts}
                    >
                        重试
                    </button>
                </div>
            )}

            {/* 帖子列表 */}
            {!loading && !error && (
                <>
                    {posts.length === 0 ? (
                        <div className="pixel-container p-12 text-center">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-sm opacity-70 mb-4">还没有帖子</p>
                            <Link href="/forum/new" className="pixel-btn text-xs">
                                发布第一个帖子
                            </Link>
                        </div>
                    ) : (
                        <div>
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
                    )}

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
                第 {page} 页 / 共 {totalPages} 页 (共 {total} 个帖子)
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
        </div>
    )
}