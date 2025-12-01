// src/app/qa/[id]/page.tsx
// 问题详情页 - 参考 forum/[id]/page.tsx 结构

'use client'

import {useState, useEffect, use} from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { Question, Answer } from '@/types/qa'
import { formatRelativeTime, formatCount } from '@/lib/forum/utils'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function QuestionDetailPage({ params }: PageProps) {
  const router = useRouter()
  const { data: session } = useSession()

  const { id } = use(params)
  
  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answerContent, setAnswerContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuestionDetail()
    fetchAnswers()
  }, [id])

  // 获取问题详情
  const fetchQuestionDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/qa/questions/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取问题失败')
      }

      setQuestion(data.data.question)
    } catch (err) {
      console.error('Fetch question error:', err)
      setError(err instanceof Error ? err.message : '获取问题失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取答案列表
  const fetchAnswers = async () => {
    try {
      const response = await fetch(`/api/qa/questions/${id}/answers?sort=votes`)
      const data = await response.json()

      if (response.ok) {
        setAnswers(data.data.answers)
      }
    } catch (err) {
      console.error('Fetch answers error:', err)
    }
  }

  // 点赞问题
  const handleLikeQuestion = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`/api/qa/questions/${id}/like`, {
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok) {
        setQuestion(prev => prev ? {
          ...prev,
          isLiked: data.data.isLiked,
          likeCount: data.data.likeCount,
        } : null)
      }
    } catch (err) {
      console.error('Like question error:', err)
    }
  }

  // 发表答案
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      router.push('/login')
      return
    }

    if (!answerContent.trim()) {
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/qa/questions/${id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: answerContent.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setAnswerContent('')
        fetchAnswers() // 刷新答案列表
        if (question) {
          setQuestion({
            ...question,
            answerCount: (question.answerCount || 0) + 1,
          })
        }
      } else {
        alert(data.error || '发表答案失败')
      }
    } catch (err) {
      console.error('Submit answer error:', err)
      alert('发表答案失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 对答案投票
  const handleVoteAnswer = async (answerId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => {
    if (!session) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`/api/qa/answers/${answerId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      })

      const data = await response.json()

      if (response.ok) {
        // 更新答案的投票状态
        setAnswers(prev => prev.map(answer => 
          answer.id === answerId
            ? {
                ...answer,
                userVote: data.data.voteType,
                upvotes: data.data.upvotes,
                downvotes: data.data.downvotes,
                voteScore: data.data.voteScore,
              }
            : answer
        ))
      }
    } catch (err) {
      console.error('Vote answer error:', err)
    }
  }

  // 点赞答案
  const handleLikeAnswer = async (answerId: string) => {
    if (!session) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`/api/qa/answers/${answerId}/like`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setAnswers(prev => prev.map(answer =>
          answer.id === answerId
            ? {
                ...answer,
                isLiked: data.data.isLiked,
                likeCount: data.data.likeCount,
              }
            : answer
        ))
      }
    } catch (err) {
      console.error('Like answer error:', err)
    }
  }

  // 采纳答案
  const handleAcceptAnswer = async (answerId: string) => {
    if (!session || !question || question.authorId !== session.user.id) {
      return
    }

    if (!confirm('确定要采纳这个答案吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/qa/questions/${id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answerId }),
      })

      const data = await response.json()

      if (response.ok) {
        // 刷新页面数据
        fetchQuestionDetail()
        fetchAnswers()
        alert('已采纳答案！')
      } else {
        alert(data.error || '采纳失败')
      }
    } catch (err) {
      console.error('Accept answer error:', err)
      alert('采纳失败')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-20">
          <div className="text-yellow-300 animate-pulse">加载中...</div>
        </div>
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="pixel-container p-8 text-center border-red-500">
          <p className="text-red-400 mb-4">{error || '问题不存在'}</p>
          <Link href="/qa">
            <button className="pixel-btn text-xs">返回列表</button>
          </Link>
        </div>
      </div>
    )
  }

  const isAuthor = session?.user?.id === question.authorId
  const canAccept = isAuthor && !question.solved

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link href="/qa">
          <button className="pixel-btn text-xs">← 返回列表</button>
        </Link>
      </div>

      {/* 问题详情 */}
      <div className="pixel-container p-6 mb-6">
        {/* 问题状态 */}
        <div className="flex items-center gap-2 mb-4">
          {question.solved && (
            <span className="answer-count solved">✓ 已解决</span>
          )}
          <span className="post-tag">{question.category}</span>
          {question.tags?.map(tag => (
            <span key={tag} className="text-xs opacity-60">#{tag}</span>
          ))}
        </div>

        {/* 问题标题 */}
        <h1 className="text-xl mb-4">{question.title}</h1>

        {/* 问题内容 */}
        <div className="text-sm leading-relaxed opacity-90 mb-6 whitespace-pre-wrap">
          {question.content}
        </div>

        {/* 问题元数据 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center gap-4 text-xs">
            <span>👤 {question.author.displayName || question.author.name}</span>
            {/*{question.author.currentSchool && (*/}
            {/*  <span className="opacity-60">{question.author.currentSchool}</span>*/}
            {/*)}*/}
            <span>👁️ {formatCount(question.views)} 浏览</span>
            <span>💬 {formatCount(question.answerCount || 0)} 回答</span>
          </div>
          <div className="text-xs opacity-60">
            {formatRelativeTime(question.createdAt)}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={handleLikeQuestion}
            className={`pixel-btn text-xs ${question.isLiked ? 'pixel-btn-primary' : ''}`}
          >
            👍 {question.isLiked ? '已' : ''}点赞 ({formatCount(question.likeCount || 0)})
          </button>
          
          {isAuthor && (
            <Link href={`/qa/${question.id}/edit`}>
              <button className="pixel-btn text-xs">编辑</button>
            </Link>
          )}
        </div>
      </div>

      {/* 答案列表 */}
      <div className="mb-6">
        <h2 className="text-lg mb-4">
          {answers.length} 个回答
          {question.solved && ' (已采纳最佳答案)'}
        </h2>

        {answers.length === 0 ? (
          <div className="pixel-container p-6 text-center">
            <p className="text-gray-400 mb-4">还没有回答</p>
            {session && (
              <p className="text-sm opacity-70">成为第一个回答者吧！</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map(answer => (
              <div
                key={answer.id}
                className={`pixel-container p-6 ${answer.isAccepted ? 'border-green-500' : ''}`}
              >
                {/* 采纳标记 */}
                {answer.isAccepted && (
                  <div className="answer-count solved mb-3">✓ 最佳答案</div>
                )}

                {/* 答案内容 */}
                <div className="text-sm leading-relaxed opacity-90 mb-4 whitespace-pre-wrap">
                  {answer.content}
                </div>

                {/* 答案元数据 */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-700">
                  <div className="flex items-center gap-4 text-xs">
                    <span>👤 {answer.author.displayName || answer.author.name}</span>
                    {/*{answer.author.currentSchool && (*/}
                    {/*  <span className="opacity-60">{answer.author.currentSchool}</span>*/}
                    {/*)}*/}
                  </div>
                  <div className="text-xs opacity-60">
                    {formatRelativeTime(answer.createdAt)}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-4 mt-4">
                  {/* 投票按钮 */}
                  <button
                    onClick={() => handleVoteAnswer(answer.id, 'UPVOTE')}
                    className={`pixel-btn text-xs ${answer.userVote === 'UPVOTE' ? 'pixel-btn-success' : ''}`}
                    disabled={!session}
                  >
                    ↑ 赞同 ({answer.upvotes})
                  </button>
                  <button
                    onClick={() => handleVoteAnswer(answer.id, 'DOWNVOTE')}
                    className={`pixel-btn text-xs ${answer.userVote === 'DOWNVOTE' ? 'pixel-btn-danger' : ''}`}
                    disabled={!session}
                  >
                    ↓ 反对 ({answer.downvotes})
                  </button>

                  {/* 点赞按钮 */}
                  <button
                    onClick={() => handleLikeAnswer(answer.id)}
                    className={`pixel-btn text-xs ${answer.isLiked ? 'pixel-btn-primary' : ''}`}
                    disabled={!session}
                  >
                    👍 ({formatCount(answer.likeCount || 0)})
                  </button>

                  {/* 采纳按钮 - 只有提问者且问题未解决时可见 */}
                  {canAccept && !answer.isAccepted && (
                    <button
                      onClick={() => handleAcceptAnswer(answer.id)}
                      className="pixel-btn text-xs pixel-btn-success"
                    >
                      采纳答案
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 回答表单 */}
      {session ? (
        <div className="pixel-container p-6">
          <h3 className="text-md mb-4">写下你的回答</h3>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              className="w-full bg-black border border-gray-700 p-4 text-sm min-h-[150px] focus:border-yellow-500 outline-none mb-4"
              placeholder="分享你的见解..."
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !answerContent.trim()}
              className="pixel-btn"
            >
              {submitting ? '发表中...' : '发表回答'}
            </button>
          </form>
        </div>
      ) : (
        <div className="pixel-container p-6 text-center">
          <p className="mb-4">登录后即可回答问题</p>
          <Link href="/login">
            <button className="pixel-btn">登录</button>
          </Link>
        </div>
      )}
    </div>
  )
}
