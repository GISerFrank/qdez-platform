// src/app/resources/[id]/page.tsx
// 资源详情页

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import type { Resource, ResourceReview } from '@/types/resource'
import {
  formatRelativeTime,
  formatCount,
  formatFileSize,
  formatRating,
  getFileFormatIcon,
  generateStars,
  RESOURCE_CATEGORIES,
} from '@/types/resource'

// 星级评分组件
function RatingStars({ 
  rating, 
  interactive = false, 
  onRate 
}: { 
  rating: number
  interactive?: boolean
  onRate?: (rating: number) => void 
}) {
  const [hoverRating, setHoverRating] = useState(0)
  const displayRating = hoverRating || rating

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-xl transition-transform ${
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
        >
          {star <= displayRating ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}

// 评论项组件
function ReviewItem({ 
  review, 
  onLike,
  onReply,
  currentUserId 
}: { 
  review: ResourceReview
  onLike: (id: string) => void
  onReply: (id: string) => void
  currentUserId?: string
}) {
  return (
    <div className="border-l-2 border-pink-500 pl-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs">
          👤 {review.author.displayName || review.author.name}
        </span>
        <span className="text-xs opacity-50">
          {formatRelativeTime(review.createdAt)}
        </span>
      </div>
      <p className="text-xs leading-relaxed opacity-90 mb-2">
        {review.content}
      </p>
      <div className="flex gap-3">
        <button
          className={`text-xs ${review.isLiked ? 'text-yellow-400' : 'opacity-60 hover:opacity-100'}`}
          onClick={() => onLike(review.id)}
        >
          👍 {review.likes}
        </button>
        <button
          className="text-xs opacity-60 hover:opacity-100"
          onClick={() => onReply(review.id)}
        >
          💬 回复
        </button>
      </div>
      
      {/* 嵌套回复 */}
      {review.replies && review.replies.length > 0 && (
        <div className="mt-3 ml-4 space-y-3">
          {review.replies.map((reply) => (
            <ReviewItem
              key={reply.id}
              review={reply}
              onLike={onLike}
              onReply={onReply}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ResourceDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session } = useSession()

  // 状态管理
  const [resource, setResource] = useState<Resource | null>(null)
  const [reviews, setReviews] = useState<ResourceReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 交互状态
  const [userRating, setUserRating] = useState<number>(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  
  // 评论状态
  const [reviewContent, setReviewContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)

  // 获取资源详情
  useEffect(() => {
    fetchResource()
    fetchReviews()
  }, [id])

  const fetchResource = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/resources/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取资源失败')
      }

      setResource(data.data)
      setUserRating(data.data.userRating || 0)
      setIsFavorited(data.data.isFavorited || false)
    } catch (err) {
      console.error('Fetch resource error:', err)
      setError(err instanceof Error ? err.message : '获取资源失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/resources/${id}/reviews`)
      const data = await response.json()

      if (data.success) {
        setReviews(data.data?.reviews || [])
      }
    } catch (err) {
      console.error('Fetch reviews error:', err)
    }
  }

  // 下载资源
  const handleDownload = async () => {
    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent(`/resources/${id}`))
      return
    }

    try {
      setIsDownloading(true)
      const response = await fetch(`/api/resources/${id}/download`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取下载链接失败')
      }

      // 打开下载链接
      window.open(data.data.downloadUrl, '_blank')
      
      // 更新下载数
      if (resource) {
        setResource({
          ...resource,
          downloads: resource.downloads + 1,
        })
      }
    } catch (err) {
      console.error('Download error:', err)
      alert(err instanceof Error ? err.message : '下载失败')
    } finally {
      setIsDownloading(false)
    }
  }

  // 评分
  const handleRate = async (rating: number) => {
    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent(`/resources/${id}`))
      return
    }

    try {
      const response = await fetch(`/api/resources/${id}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      })
      const data = await response.json()

      if (data.success) {
        setUserRating(rating)
        if (resource) {
          setResource({
            ...resource,
            ratingAvg: data.data.ratingAvg,
            ratingCount: data.data.ratingCount,
          })
        }
      }
    } catch (err) {
      console.error('Rate error:', err)
    }
  }

  // 收藏
  const handleFavorite = async () => {
    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent(`/resources/${id}`))
      return
    }

    try {
      const response = await fetch(`/api/resources/${id}/favorite`, {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        setIsFavorited(data.data.isFavorited)
      }
    } catch (err) {
      console.error('Favorite error:', err)
    }
  }

  // 提交评论
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent(`/resources/${id}`))
      return
    }

    if (!reviewContent.trim()) return

    try {
      setSubmittingReview(true)
      const response = await fetch(`/api/resources/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: reviewContent,
          parentId: replyingTo,
        }),
      })
      const data = await response.json()

      if (data.success) {
        setReviewContent('')
        setReplyingTo(null)
        fetchReviews()
      } else {
        alert(data.error || '发表评论失败')
      }
    } catch (err) {
      console.error('Submit review error:', err)
      alert('发表评论失败')
    } finally {
      setSubmittingReview(false)
    }
  }

  // 点赞评论
  const handleLikeReview = async (reviewId: string) => {
    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent(`/resources/${id}`))
      return
    }

    try {
      await fetch(`/api/resources/reviews/${reviewId}/like`, {
        method: 'POST',
      })
      fetchReviews()
    } catch (err) {
      console.error('Like review error:', err)
    }
  }

  // 删除资源
  const handleDelete = async () => {
    if (!confirm('确定要删除这个资源吗？')) return

    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        router.push('/resources')
      } else {
        alert(data.error || '删除失败')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('删除失败')
    }
  }

  // 加载状态
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4 animate-bounce">📚</div>
        <p className="text-sm opacity-70">加载中...</p>
      </div>
    )
  }

  // 错误状态
  if (error || !resource) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="pixel-container p-12 text-center">
          <div className="text-6xl mb-4">😢</div>
          <p className="text-red-400 mb-4">{error || '资源不存在'}</p>
          <Link href="/resources" className="pixel-btn">
            返回资源库
          </Link>
        </div>
      </div>
    )
  }

  const isAuthor = session?.user?.id === resource.authorId

  return (
    <div className="container mx-auto px-4 py-16">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link href="/resources" className="pixel-btn text-xs">
          ← 返回资源库
        </Link>
      </div>

      {/* 资源详情卡片 */}
      <div className="resource-card">
        {/* 标题和操作 */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-lg mb-2">{resource.title}</h1>
            <div className="flex items-center gap-2">
              {resource.featured && (
                <span className="badge badge-featured">精选</span>
              )}
              <span className="resource-type">
                {resource.category?.icon} {resource.category?.name}
              </span>
              {resource.status === 'PENDING' && (
                <span className="badge" style={{ background: '#f59e0b' }}>待审核</span>
              )}
            </div>
          </div>
          {isAuthor && (
            <div className="flex gap-2">
              <Link href={`/resources/${id}/edit`} className="pixel-btn text-xs">
                ✏️ 编辑
              </Link>
              <button
                className="pixel-btn text-xs bg-red-900"
                onClick={handleDelete}
              >
                🗑️ 删除
              </button>
            </div>
          )}
        </div>

        {/* 文件信息 */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-gray-900/50 rounded">
          <span className="text-3xl">{getFileFormatIcon(resource.fileFormat)}</span>
          <div>
            <p className="text-sm">{resource.fileName}</p>
            <p className="text-xs opacity-60">
              {resource.fileFormat?.toUpperCase()} · {formatFileSize(resource.fileSize)}
            </p>
          </div>
        </div>

        {/* 作者信息 */}
        <div className="flex items-center gap-3 mb-4 text-xs opacity-70">
          <span>
            👤 {resource.author.displayName || resource.author.name}
            {resource.author.currentSchool && ` · ${resource.author.currentSchool}`}
          </span>
          <span>⏰ {formatRelativeTime(resource.createdAt)}</span>
          <span>👁️ {formatCount(resource.views)} 浏览</span>
          <span>⬇️ {formatCount(resource.downloads)} 下载</span>
        </div>

        {/* 描述 */}
        <div className="mb-6">
          <h3 className="text-sm mb-2 text-yellow-300">📝 资源描述</h3>
          <p className="text-xs leading-relaxed whitespace-pre-wrap opacity-90">
            {resource.description}
          </p>
        </div>

        {/* 标签 */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              {resource.tags.map((tag) => (
                <span key={tag.id} className="text-xs opacity-60">
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 评分区域 */}
        <div className="mb-6 p-4 bg-gray-900/30 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-2">平均评分</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl text-yellow-400">
                  {formatRating(resource.ratingAvg)}
                </span>
                <RatingStars rating={resource.ratingAvg} />
                <span className="text-xs opacity-60">
                  ({resource.ratingCount} 人评分)
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm mb-2">我的评分</p>
              <RatingStars
                rating={userRating}
                interactive={!!session}
                onRate={handleRate}
              />
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4 border-t border-pink-500">
          <button
            className="pixel-btn pixel-btn-success"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? '获取中...' : '⬇️ 下载资源'}
          </button>
          <button
            className={`pixel-btn ${isFavorited ? 'bg-yellow-600' : ''}`}
            onClick={handleFavorite}
          >
            {isFavorited ? '❤️ 已收藏' : '🤍 收藏'}
          </button>
        </div>
      </div>

      {/* 评论区 */}
      <div className="mt-8">
        <h2 className="text-lg mb-4">
          <span className="text-yellow-300">▸</span> 评论 ({reviews.length})
        </h2>

        {/* 发表评论 */}
        {session ? (
          <div className="resource-card mb-6">
            <form onSubmit={handleSubmitReview}>
              {replyingTo && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs opacity-70">回复评论</span>
                  <button
                    type="button"
                    className="text-xs text-red-400"
                    onClick={() => setReplyingTo(null)}
                  >
                    取消
                  </button>
                </div>
              )}
              <textarea
                className="w-full bg-gray-900 border border-pink-500 p-3 text-xs rounded"
                rows={4}
                placeholder="发表你的评论..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="pixel-btn text-xs"
                  disabled={!reviewContent.trim() || submittingReview}
                >
                  {submittingReview ? '发送中...' : '发表评论'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="resource-card mb-6 text-center py-6">
            <p className="text-sm opacity-70 mb-3">登录后发表评论</p>
            <Link
              href={`/login?redirect=${encodeURIComponent(`/resources/${id}`)}`}
              className="pixel-btn text-xs"
            >
              去登录
            </Link>
          </div>
        )}

        {/* 评论列表 */}
        {reviews.length === 0 ? (
          <div className="pixel-container p-8 text-center">
            <p className="text-sm opacity-70">暂无评论，来发表第一条评论吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="resource-card">
                <ReviewItem
                  review={review}
                  onLike={handleLikeReview}
                  onReply={(id) => setReplyingTo(id)}
                  currentUserId={session?.user?.id}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
