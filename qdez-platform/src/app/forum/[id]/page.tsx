// src/app/forum/[id]/page.tsx
// 帖子详情页

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { PostDetail, CommentItem } from '@/types/forum'
import { POST_CATEGORIES, formatRelativeTime, formatCount } from '@/lib/forum/utils'

interface PageProps {
  params: {
    id: string
  }
}

export default function Page({ params }: PageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentContent, setCommentContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPostDetail()
    fetchComments()
  }, [params.id])

  // 获取帖子详情
  const fetchPostDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/forum/posts/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取帖子失败')
      }

      setPost(data.data.post)
    } catch (err) {
      console.error('Fetch post error:', err)
      setError(err instanceof Error ? err.message : '获取帖子失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取评论列表
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/forum/posts/${params.id}/comments?sort=latest`)
      const data = await response.json()

      if (response.ok) {
        setComments(data.data.comments)
      }
    } catch (err) {
      console.error('Fetch comments error:', err)
    }
  }

  // 点赞帖子
  const handleLikePost = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`/api/forum/posts/${params.id}/like`, {
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok) {
        setPost(prev => prev ? {
          ...prev,
          isLiked: data.data.liked,
          likeCount: data.data.likeCount,
        } : null)
      }
    } catch (err) {
      console.error('Like post error:', err)
    }
  }

  // 发表评论
  const handleSubmitComment = async (parentId?: string) => {
    if (!session) {
      router.push('/login')
      return
    }

    if (!commentContent.trim()) {
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/forum/posts/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentContent.trim(),
          ...(parentId && { parentId }),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '发表评论失败')
      }

      // 刷新评论列表
      await fetchComments()
      
      // 更新帖子评论数
      setPost(prev => prev ? {
        ...prev,
        commentCount: prev.commentCount + 1,
      } : null)

      // 清空输入
      setCommentContent('')
      setReplyingTo(null)
    } catch (err) {
      console.error('Submit comment error:', err)
      alert(err instanceof Error ? err.message : '发表评论失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 点赞评论
  const handleLikeComment = async (commentId: string) => {
    if (!session) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`/api/forum/comments/${commentId}/like`, {
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok) {
        // 更新评论点赞状态
        setComments(prev => updateCommentLike(prev, commentId, data.data.liked, data.data.likeCount))
      }
    } catch (err) {
      console.error('Like comment error:', err)
    }
  }

  // 递归更新评论点赞状态
  const updateCommentLike = (
    comments: CommentItem[],
    commentId: string,
    liked: boolean,
    likeCount: number
  ): CommentItem[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, isLiked: liked, likeCount }
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentLike(comment.replies, commentId, liked, likeCount),
        }
      }
      return comment
    })
  }

  // 删除帖子
  const handleDeletePost = async () => {
    if (!confirm('确定要删除这个帖子吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/forum/posts/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('帖子已删除')
        router.push('/forum')
      } else {
        const data = await response.json()
        throw new Error(data.error || '删除失败')
      }
    } catch (err) {
      console.error('Delete post error:', err)
      alert(err instanceof Error ? err.message : '删除失败')
    }
  }

  // 渲染评论
  const renderComment = (comment: CommentItem, isReply: boolean = false) => (
    <div
      key={comment.id}
      className={`${isReply ? 'ml-8 mt-3' : ''} border-l-2 border-cyan-500 pl-4 py-3`}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="text-xs opacity-70">
          👤 {comment.author.displayName || comment.author.name}
        </div>
        <div className="text-xs opacity-50">
          {formatRelativeTime(comment.createdAt)}
        </div>
      </div>
      
      <p className="text-xs leading-relaxed mb-3">{comment.content}</p>
      
      <div className="flex gap-3">
        <button
          className={`pixel-btn text-xs ${comment.isLiked ? 'bg-yellow-600' : ''}`}
          onClick={() => handleLikeComment(comment.id)}
        >
          👍 {formatCount(comment.likeCount)}
        </button>
        <button
          className="pixel-btn text-xs"
          onClick={() => setReplyingTo(comment.id)}
        >
          💬 回复
        </button>
      </div>

      {/* 回复表单 */}
      {replyingTo === comment.id && (
        <div className="mt-4 p-3 bg-gray-800 bg-opacity-50">
          <textarea
            className="w-full bg-gray-900 border border-cyan-500 p-2 text-xs"
            rows={3}
            placeholder="输入回复内容..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <button
              className="pixel-btn text-xs"
              onClick={() => handleSubmitComment(comment.id)}
              disabled={submitting}
            >
              {submitting ? '发送中...' : '发送回复'}
            </button>
            <button
              className="pixel-btn text-xs pixel-btn-secondary"
              onClick={() => {
                setReplyingTo(null)
                setCommentContent('')
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 嵌套回复 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <div className="text-sm opacity-70">加载中...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="pixel-container p-6 bg-red-900 bg-opacity-50 border-red-500">
          <p className="text-red-300 text-sm mb-4">❌ {error || '帖子不存在'}</p>
          <Link href="/forum" className="pixel-btn text-xs">
            返回论坛
          </Link>
        </div>
      </div>
    )
  }

  const isAuthor = session?.user?.id === post.authorId

  return (
    <div className="container mx-auto px-4 py-16">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link href="/forum" className="pixel-btn text-xs">
          ← 返回论坛
        </Link>
      </div>

      {/* 帖子内容 */}
      <div className="post-card">
        {/* 标题和操作 */}
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-lg">{post.title}</h1>
          {isAuthor && (
            <div className="flex gap-2">
              <Link href={`/forum/${post.id}/edit`} className="pixel-btn text-xs">
                ✏️ 编辑
              </Link>
              <button
                className="pixel-btn text-xs bg-red-900"
                onClick={handleDeletePost}
              >
                🗑️ 删除
              </button>
            </div>
          )}
        </div>

        {/* 标签 */}
        <div className="mb-4">
          {post.isPinned && <span className="badge badge-featured">📌 置顶</span>}
          {post.isFeatured && <span className="badge badge-featured">⭐ 精华</span>}
          <span className="post-tag">
            {POST_CATEGORIES[post.category]?.icon || '💬'} {POST_CATEGORIES[post.category]?.label || post.category}
          </span>
          {post.tags?.map(tag => (
            <span key={tag} className="text-xs opacity-60 mr-2">#{tag}</span>
          ))}
        </div>

        {/* 作者信息 */}
        <div className="flex items-center gap-3 mb-4 text-xs opacity-70">
          <span>
            👤 {post.author.displayName || post.author.name}
            {post.author.currentSchool && ` · ${post.author.currentSchool}`}
          </span>
          <span>⏰ {formatRelativeTime(post.createdAt)}</span>
          <span>👁️ {formatCount(post.viewCount)} 浏览</span>
        </div>

        {/* 内容 */}
        <div className="prose prose-invert max-w-none mb-6">
          <div className="text-xs leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* 互动按钮 */}
        <div className="flex gap-3 pt-4 border-t border-cyan-500">
          <button
            className={`pixel-btn text-xs ${post.isLiked ? 'bg-yellow-600' : ''}`}
            onClick={handleLikePost}
          >
            👍 {formatCount(post.likeCount)}
          </button>
          <button className="pixel-btn text-xs">
            💬 {formatCount(post.commentCount)} 评论
          </button>
        </div>
      </div>

      {/* 评论区 */}
      <div className="mt-8">
        <h2 className="text-lg mb-4">
          <span className="text-yellow-300">▸</span> 评论 ({comments.length})
        </h2>

        {/* 发表评论 */}
        {session ? (
          <div className="post-card mb-6">
            <textarea
              className="w-full bg-gray-900 border border-cyan-500 p-3 text-xs"
              rows={4}
              placeholder="发表你的评论..."
              value={replyingTo === null ? commentContent : ''}
              onChange={(e) => {
                if (replyingTo === null) {
                  setCommentContent(e.target.value)
                }
              }}
            />
            <div className="mt-3">
              <button
                className="pixel-btn text-xs"
                onClick={() => handleSubmitComment()}
                disabled={submitting || !commentContent.trim()}
              >
                {submitting ? '发送中...' : '发表评论'}
              </button>
            </div>
          </div>
        ) : (
          <div className="post-card mb-6 text-center">
            <p className="text-xs opacity-70 mb-3">请先登录后发表评论</p>
            <Link href="/login" className="pixel-btn text-xs">
              登录
            </Link>
          </div>
        )}

        {/* 评论列表 */}
        {comments.length === 0 ? (
          <div className="post-card text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-xs opacity-70">还没有评论，来发表第一个吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="post-card">
                {renderComment(comment)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
