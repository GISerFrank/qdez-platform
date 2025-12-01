// src/app/qa/page.tsx
// 问答中心列表页 - 参考 forum/page.tsx 结构

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { Question } from '@/types/qa'
import { formatRelativeTime, formatCount } from '@/lib/forum/utils'

// 问答分类
const QA_CATEGORIES = [
  { value: 'all', label: '全部问题' },
  { value: 'application', label: '申请流程' },
  { value: 'school', label: '选校定位' },
  { value: 'visa', label: '签证问题' },
  { value: 'preparation', label: '入学准备' },
  { value: 'academic', label: '学业规划' },
  { value: 'life', label: '生活适应' },
  { value: 'career', label: '职业发展' },
]

export default function QAPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 状态管理
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 筛选状态
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('latest')
  const [solvedFilter, setSolvedFilter] = useState<string>('all') // all | solved | unsolved

  // 从URL读取初始参数
  useEffect(() => {
    const category = searchParams.get('category') || 'all'
    const sort = searchParams.get('sort') || 'latest'
    const solved = searchParams.get('solved') || 'all'
    const pageNum = parseInt(searchParams.get('page') || '1')

    setSelectedCategory(category)
    setSortBy(sort)
    setSolvedFilter(solved)
    setPage(pageNum)
  }, [searchParams])

  // 获取问题列表
  useEffect(() => {
    fetchQuestions()
  }, [page, selectedCategory, sortBy, solvedFilter])

  const fetchQuestions = async () => {
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

      if (solvedFilter !== 'all') {
        params.append('solved', solvedFilter === 'solved' ? 'true' : 'false')
      }

      const response = await fetch(`/api/qa/questions?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取问题失败')
      }

      setQuestions(data.data.questions)
      setTotal(data.data.total)
      setTotalPages(data.data.totalPages)
    } catch (err) {
      console.error('Fetch questions error:', err)
      setError(err instanceof Error ? err.message : '获取问题失败')
    } finally {
      setLoading(false)
    }
  }

  // 切换分类
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setPage(1)
    updateURL({ category, page: 1 })
  }

  // 切换排序
  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    setPage(1)
    updateURL({ sort, page: 1 })
  }

  // 切换已解决筛选
  const handleSolvedFilterChange = (filter: string) => {
    setSolvedFilter(filter)
    setPage(1)
    updateURL({ solved: filter, page: 1 })
  }

  // 更新URL
  const updateURL = (updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === 'all' || value === 1) {
        params.delete(key)
      } else {
        params.set(key, value.toString())
      }
    })

    router.push(`/qa?${params.toString()}`)
  }

  // 翻页
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    updateURL({ page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading && questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-20">
          <div className="text-yellow-300 animate-pulse">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl">
          <span className="text-yellow-300">▸</span> 问答中心
          <span className="text-yellow-300">◂</span>
        </h2>
        <Link href="/qa/new">
          <button className="pixel-btn">+ 提问</button>
        </Link>
      </div>

      {/* 筛选栏 */}
      <div className="mb-8 space-y-4">
        {/* 分类筛选 */}
        <div className="flex gap-3 flex-wrap">
          {QA_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`pixel-btn text-xs ${
                selectedCategory === cat.value
                  ? 'pixel-btn-primary'
                  : 'pixel-btn-secondary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 状态和排序 */}
        <div className="flex gap-3 flex-wrap items-center">
          {/* 已解决筛选 */}
          <button
            onClick={() => handleSolvedFilterChange('all')}
            className={`pixel-btn text-xs ${
              solvedFilter === 'all' ? 'pixel-btn-primary' : ''
            }`}
          >
            全部
          </button>
          <button
            onClick={() => handleSolvedFilterChange('unsolved')}
            className={`pixel-btn text-xs pixel-btn-success ${
              solvedFilter === 'unsolved' ? 'pixel-btn-primary' : ''
            }`}
          >
            未解决
          </button>
          <button
            onClick={() => handleSolvedFilterChange('solved')}
            className={`pixel-btn text-xs ${
              solvedFilter === 'solved' ? 'pixel-btn-primary' : ''
            }`}
          >
            已解决
          </button>

          <div className="mx-4 text-xs opacity-50">|</div>

          {/* 排序选择 */}
          <button
            onClick={() => handleSortChange('latest')}
            className={`pixel-btn text-xs ${
              sortBy === 'latest' ? 'pixel-btn-primary' : ''
            }`}
          >
            最新
          </button>
          <button
            onClick={() => handleSortChange('hot')}
            className={`pixel-btn text-xs ${
              sortBy === 'hot' ? 'pixel-btn-primary' : ''
            }`}
          >
            最热
          </button>
          <button
            onClick={() => handleSortChange('unanswered')}
            className={`pixel-btn text-xs ${
              sortBy === 'unanswered' ? 'pixel-btn-primary' : ''
            }`}
          >
            待解决
          </button>
          <button
            onClick={() => handleSortChange('mostAnswered')}
            className={`pixel-btn text-xs ${
              sortBy === 'mostAnswered' ? 'pixel-btn-primary' : ''
            }`}
          >
            热门回答
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="pixel-container mb-8 p-4 border-red-500">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchQuestions}
            className="pixel-btn text-xs mt-2"
          >
            重试
          </button>
        </div>
      )}

      {/* 问题列表 */}
      {questions.length === 0 && !loading ? (
        <div className="pixel-container p-8 text-center">
          <p className="text-gray-400 mb-4">还没有问题</p>
          <Link href="/qa/new">
            <button className="pixel-btn text-xs">+ 发布第一个问题</button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map(question => (
            <div key={question.id} className="qa-card hover:border-yellow-500 transition-colors">
              {/* 问题状态和分类 */}
              <div className="mb-3 flex items-center gap-2">
                <span className={`answer-count ${question.solved ? 'solved' : ''}`}>
                  {question.solved ? '✓ 已解决' : `${question.answerCount || 0} 回答`}
                </span>
                <span className="post-tag">{QA_CATEGORIES.find(c => c.value === question.category)?.label || question.category}</span>
                {question.tags && question.tags.map(tag => (
                  <span key={tag} className="text-xs opacity-60">#{tag}</span>
                ))}
              </div>

              {/* 问题标题 */}
              <Link href={`/qa/${question.id}`}>
                <h3 className="text-sm mb-3 cursor-pointer hover:text-yellow-300 transition-colors">
                  {question.title}
                </h3>
              </Link>

              {/* 问题内容摘要 */}
              <p className="text-xs leading-relaxed opacity-80 mb-4 line-clamp-2">
                {question.content.substring(0, 150)}
                {question.content.length > 150 && '...'}
              </p>

              {/* 元数据 */}
              <div className="post-meta flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs">
                  <span>👤 {question.author.displayName || question.author.name}</span>
                  {/*{question.author.currentSchool && (*/}
                  {/*  <span className="opacity-60">{question.author.currentSchool}</span>*/}
                  {/*)}*/}
                  <span>👁️ {formatCount(question.views)} 浏览</span>
                  <span>💬 {formatCount(question.answerCount || 0)} 回答</span>
                  <span>👍 {formatCount(question.likeCount || 0)} 点赞</span>
                </div>
                <div className="text-xs opacity-60">
                  {formatRelativeTime(question.createdAt)}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="mt-4">
                <Link href={`/qa/${question.id}`}>
                  <button className="pixel-btn text-xs">
                    {question.solved ? '查看解决方案' : '查看回答'}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="pixel-btn text-xs"
          >
            上一页
          </button>
          <span className="text-sm">
            第 {page} 页 / 共 {totalPages} 页
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="pixel-btn text-xs"
          >
            下一页
          </button>
        </div>
      )}

      {/* 统计信息 */}
      {!loading && (
        <div className="text-center mt-8 text-xs opacity-60">
          共 {formatCount(total)} 个问题
        </div>
      )}
    </div>
  )
}
