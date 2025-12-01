// src/app/qa/new/page.tsx
// 发布新问题页面 - 参考 forum/new/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// 问答分类
const QA_CATEGORIES = [
  { value: 'application', label: '申请流程' },
  { value: 'school', label: '选校定位' },
  { value: 'visa', label: '签证问题' },
  { value: 'preparation', label: '入学准备' },
  { value: 'academic', label: '学业规划' },
  { value: 'life', label: '生活适应' },
  { value: 'career', label: '职业发展' },
]

export default function NewQuestionPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 检查登录状态
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // 添加标签
  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
      setTagInput('')
    }
  }

  // 移除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 验证
    if (!formData.title.trim()) {
      setError('请输入问题标题')
      return
    }
    if (formData.title.length < 10) {
      setError('问题标题至少10个字符')
      return
    }
    if (!formData.content.trim()) {
      setError('请详细描述你的问题')
      return
    }
    if (formData.content.length < 20) {
      setError('问题描述至少20个字符')
      return
    }
    if (!formData.category) {
      setError('请选择问题分类')
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/qa/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
          tags: formData.tags,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '发布失败')
      }

      // 成功后跳转到问题详情
      router.push(`/qa/${data.data.question.id}`)
    } catch (err) {
      console.error('Submit question error:', err)
      setError(err instanceof Error ? err.message : '发布失败')
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-20">
          <div className="text-yellow-300 animate-pulse">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl">
          <span className="text-yellow-300">▸</span> 提出问题
          <span className="text-yellow-300">◂</span>
        </h1>
        <Link href="/qa">
          <button className="pixel-btn text-xs">取消</button>
        </Link>
      </div>

      {/* 提示信息 */}
      <div className="pixel-container p-4 mb-6 border-yellow-500">
        <h3 className="text-sm mb-2 text-yellow-300">💡 提问小贴士</h3>
        <ul className="text-xs space-y-1 opacity-80">
          <li>• 用清晰的标题概括问题</li>
          <li>• 详细描述问题背景和你已尝试的解决方法</li>
          <li>• 选择合适的分类和标签，方便其他人找到</li>
          <li>• 尊重社区规则，文明友善地提问</li>
        </ul>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="pixel-container p-4 mb-6 border-red-500">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 问题标题 */}
        <div className="pixel-container p-6">
          <label className="block text-sm mb-2">
            问题标题 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-black border border-gray-700 p-3 text-sm focus:border-yellow-500 outline-none"
            placeholder="例如：如何选择适合自己的研究生项目？"
            maxLength={200}
            disabled={submitting}
          />
          <div className="text-xs opacity-50 mt-2">
            {formData.title.length} / 200
          </div>
        </div>

        {/* 问题描述 */}
        <div className="pixel-container p-6">
          <label className="block text-sm mb-2">
            详细描述 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full bg-black border border-gray-700 p-3 text-sm min-h-[200px] focus:border-yellow-500 outline-none"
            placeholder="详细描述你的问题，包括：&#10;1. 问题的具体情况&#10;2. 你已经尝试过的方法&#10;3. 你期望的结果&#10;&#10;清晰的描述能帮助大家更好地理解和回答你的问题！"
            disabled={submitting}
          />
          <div className="text-xs opacity-50 mt-2">
            {formData.content.length} 字符
          </div>
        </div>

        {/* 分类选择 */}
        <div className="pixel-container p-6">
          <label className="block text-sm mb-3">
            问题分类 <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {QA_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                className={`pixel-btn text-xs ${
                  formData.category === cat.value
                    ? 'pixel-btn-primary'
                    : ''
                }`}
                disabled={submitting}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 标签 */}
        <div className="pixel-container p-6">
          <label className="block text-sm mb-2">
            标签（可选，最多5个）
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              className="flex-1 bg-black border border-gray-700 p-2 text-xs focus:border-yellow-500 outline-none"
              placeholder="输入标签后按回车"
              maxLength={20}
              disabled={submitting || formData.tags.length >= 5}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="pixel-btn text-xs"
              disabled={submitting || formData.tags.length >= 5 || !tagInput.trim()}
            >
              添加
            </button>
          </div>
          
          {/* 已添加的标签 */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800 text-xs"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-red-400 hover:text-red-300"
                    disabled={submitting}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting || !formData.title || !formData.content || !formData.category}
            className="pixel-btn flex-1"
          >
            {submitting ? '发布中...' : '发布问题'}
          </button>
          <Link href="/qa" className="flex-1">
            <button
              type="button"
              className="pixel-btn w-full"
              disabled={submitting}
            >
              取消
            </button>
          </Link>
        </div>
      </form>

      {/* 底部说明 */}
      <div className="text-xs text-center opacity-50 mt-8">
        发布问题即表示你同意遵守社区规范
      </div>
    </div>
  )
}
