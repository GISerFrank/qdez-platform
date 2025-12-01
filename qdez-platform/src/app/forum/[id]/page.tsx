// src/app/forum/[id]/page.tsx
// 帖子详情页 - 修复 Next.js 15 params Promise 问题

'use client'

import { useState, useEffect, use } from 'react'  // ✅ 导入 use
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { PostDetail, CommentItem } from '@/types/forum'
import { POST_CATEGORIES, formatRelativeTime, formatCount } from '@/lib/forum/utils'

interface PageProps {
  params: Promise<{  // ✅ params 是 Promise
    id: string
  }>
}

export default function Page({ params }: PageProps) {
  const router = useRouter()
  const { data: session } = useSession()

  // ✅ 使用 React.use() unwrap params
  const { id } = use(params)

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
  }, [id])  // ✅ 依赖改为 id

  // 获取帖子详情
  const fetchPostDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/forum/posts/${id}`)
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
      const response = await fetch(`/api/forum/posts/${id}/comments?sort=latest`)
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
      const response = await fetch(`/api/forum/posts/${id}/like`, {
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
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              isLiked: data.data.liked,
              likeCount: data.data.likeCount,
            }
          }
          // 处理嵌套回复
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                  reply.id === commentId
                      ? { ...reply, isLiked: data.data.liked, likeCount: data.data.likeCount }
                      : reply
              ),
            }
          }
          return comment
        }))
      }
    } catch (err) {
      console.error('Like comment error:', err)
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
      const response = await fetch(`/api/forum/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentContent,
          parentId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setCommentContent('')
        setReplyingTo(null)
        await fetchComments()
      } else {
        throw new Error(data.error || '发表评论失败')
      }
    } catch (err) {
      console.error('Submit comment error:', err)
      alert(err instanceof Error ? err.message : '发表评论失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 删除帖子
  const handleDeletePost = async () => {
    if (!confirm('确定要删除这篇帖子吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/forum/posts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('删除成功')
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

  // 渲染评论（包括嵌套回复）
  const renderComment = (comment: CommentItem, isReply = false) => (
      <div
          key={comment.id}
          className={`${isReply ? 'ml-12 mt-3' : 'mb-4'} bg-[#1a1a35]/50 border border-gray-700 p-4`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold">
            {comment.author.displayName?.[0] || comment.author.name?.[0] || '?'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-yellow-300">
              {comment.author.displayName || comment.author.name}
            </span>
              <span className="text-xs text-gray-500">
              {formatRelativeTime(comment.createdAt)}
            </span>
            </div>
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button
              onClick={() => handleLikeComment(comment.id)}
              className={`flex items-center gap-1 ${
                  comment.isLiked ? 'text-red-400' : 'text-gray-400'
              } hover:text-red-300`}
          >
            <span>{comment.isLiked ? '❤️' : '🤍'}</span>
            <span>{formatCount(comment.likeCount)}</span>
          </button>

          {!isReply && (
              <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-cyan-400 hover:text-cyan-300"
              >
                💬 回复
              </button>
          )}

          {session?.user?.id === comment.authorId && (
              <button className="text-red-400 hover:text-red-300">
                🗑️ 删除
              </button>
          )}
        </div>

        {/* 回复输入框 */}
        {replyingTo === comment.id && (
            <div className="mt-3 pl-11">
          <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder={`回复 @${comment.author.displayName || comment.author.name}...`}
              className="w-full bg-[#0a0a1a] border border-gray-700 p-3 text-sm text-gray-300 focus:border-cyan-500 focus:outline-none min-h-[80px]"
          />
              <div className="flex gap-2 mt-2">
                <button
                    onClick={() => handleSubmitComment(comment.id)}
                    disabled={submitting || !commentContent.trim()}
                    className="pixel-btn text-xs"
                >
                  {submitting ? '发送中...' : '发送回复'}
                </button>
                <button
                    onClick={() => {
                      setReplyingTo(null)
                      setCommentContent('')
                    }}
                    className="pixel-btn pixel-btn-secondary text-xs"
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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <div className="inline-block animate-spin text-3xl mb-4">⚙️</div>
            <div>加载中...</div>
          </div>
        </div>
    )
  }

  if (error || !post) {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-400">
            <div className="text-3xl mb-4">❌</div>
            <div>{error || '帖子不存在'}</div>
            <Link href="/forum" className="pixel-btn mt-4 inline-block">
              返回论坛
            </Link>
          </div>
        </div>
    )
  }

  return (
      <div className="container mx-auto px-4 py-8">
        {/* 面包屑导航 */}
        <div className="text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-cyan-400">首页</Link>
          <span className="mx-2">/</span>
          <Link href="/forum" className="hover:text-cyan-400">论坛</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-400">{post.title}</span>
        </div>

        {/* 帖子内容 */}
        <div className="bg-[#1a1a35]/80 border border-gray-700 p-6 mb-6">
          {/* 分类标签 */}
          <div className="flex items-center gap-3 mb-4">
          <span className="post-tag">
            {POST_CATEGORIES.find(c => c.id === post.category)?.label || post.category}
          </span>
            {post.isPinned && <span className="badge badge-hot">置顶</span>}
            {post.tags?.map(tag => (
                <span key={tag} className="text-xs text-cyan-400">#{tag}</span>
            ))}
          </div>

          {/* 标题 */}
          <h1 className="text-2xl mb-4 text-yellow-300">{post.title}</h1>

          {/* 作者信息 */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center font-bold">
              {post.author.displayName?.[0] || post.author.name?.[0] || '?'}
            </div>
            <div>
              <div className="text-sm text-yellow-300">
                {post.author.displayName || post.author.name}
              </div>
              <div className="text-xs text-gray-500">
                {formatRelativeTime(post.createdAt)}
                {post.updatedAt !== post.createdAt && (
                    <span className="ml-2">(已编辑)</span>
                )}
              </div>
            </div>
          </div>

          {/* 内容 */}
          <div className="text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">
            {post.content}
          </div>

          {/* 操作栏 */}
          <div className="flex items-center gap-6 pt-4 border-t border-gray-700">
            <button
                onClick={handleLikePost}
                className={`flex items-center gap-2 ${
                    post.isLiked ? 'text-red-400' : 'text-gray-400'
                } hover:text-red-300`}
            >
              <span className="text-xl">{post.isLiked ? '❤️' : '🤍'}</span>
              <span>{formatCount(post.likeCount)} 点赞</span>
            </button>

            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-xl">💬</span>
              <span>{formatCount(post.commentCount)} 评论</span>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-xl">👁️</span>
              <span>{formatCount(post.viewCount)} 浏览</span>
            </div>

            {session?.user?.id === post.authorId && (
                <div className="ml-auto flex gap-3">
                  <Link
                      href={`/forum/${id}/edit`}
                      className="text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    ✏️ 编辑
                  </Link>
                  <button
                      onClick={handleDeletePost}
                      className="text-red-400 hover:text-red-300 text-sm"
                  >
                    🗑️ 删除
                  </button>
                </div>
            )}
          </div>
        </div>

        {/* 评论区 */}
        <div className="bg-[#1a1a35]/80 border border-gray-700 p-6">
          <h2 className="text-xl mb-6 flex items-center gap-2">
            <span className="text-yellow-300">💬</span>
            全部评论
            <span className="text-sm text-gray-500">({comments.length})</span>
          </h2>

          {/* 发表评论 */}
          {session ? (
              <div className="mb-6">
            <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="写下你的评论..."
                className="w-full bg-[#0a0a1a] border border-gray-700 p-4 text-gray-300 focus:border-cyan-500 focus:outline-none min-h-[100px]"
            />
                <div className="flex justify-end mt-3">
                  <button
                      onClick={() => handleSubmitComment()}
                      disabled={submitting || !commentContent.trim()}
                      className="pixel-btn"
                  >
                    {submitting ? '发送中...' : '发表评论'}
                  </button>
                </div>
              </div>
          ) : (
              <div className="mb-6 text-center py-8 bg-[#0a0a1a] border border-gray-700">
                <div className="text-gray-400 mb-3">登录后才能发表评论</div>
                <Link href="/login" className="pixel-btn">
                  立即登录
                </Link>
              </div>
          )}

          {/* 评论列表 */}
          {comments.length > 0 ? (
              <div>
                {comments.map(comment => renderComment(comment))}
              </div>
          ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">💭</div>
                <div>还没有评论，快来抢沙发吧！</div>
              </div>
          )}
        </div>
      </div>
  )
}