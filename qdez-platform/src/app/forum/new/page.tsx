// src/app/forum/new/page.tsx
// 发布新帖子页面

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { POST_CATEGORIES } from '@/lib/forum/utils'

export default function Page() {
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
      setError('请输入标题')
      return
    }
    if (!formData.content.trim()) {
      setError('请输入内容')
      return
    }
    if (!formData.category) {
      setError('请选择分类')
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/forum/posts', {
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

      // 成功后跳转到帖子详情
      router.push(`/forum/${data.data.post.id}`)
    } catch (err) {
      console.error('Submit post error:', err)
      setError(err instanceof Error ? err.message : '发布失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <div className="text-sm opacity-70">加载中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      {/* 标题 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl">
          <span className="text-yellow-300">▸</span> 发布新帖子
        </h1>
        <Link href="/forum" className="pixel-btn text-xs">
          取消
        </Link>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="pixel-container p-4 bg-red-900 bg-opacity-50 border-red-500 mb-6">
          <p className="text-red-300 text-xs">❌ {error}</p>
        </div>
      )}

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 标题 */}
        <div className="post-card">
          <label className="block text-xs mb-2 text-yellow-300">
            标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full bg-gray-900 border border-cyan-500 p-3 text-sm"
            placeholder="请输入帖子标题（1-200字符）"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            maxLength={200}
            required
          />
          <div className="text-xs opacity-50 mt-2 text-right">
            {formData.title.length} / 200
          </div>
        </div>

        {/* 分类 */}
        <div className="post-card">
          <label className="block text-xs mb-2 text-yellow-300">
            分类 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(POST_CATEGORIES).map(([value, { label, icon }]) => (
              <button
                key={value}
                type="button"
                className={`pixel-btn text-xs ${
                  formData.category === value ? '' : 'pixel-btn-secondary'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, category: value }))}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* 内容 */}
        <div className="post-card">
          <label className="block text-xs mb-2 text-yellow-300">
            内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full bg-gray-900 border border-cyan-500 p-3 text-xs leading-relaxed"
            rows={15}
            placeholder="请输入帖子内容... 支持换行和简单格式"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            maxLength={50000}
            required
          />
          <div className="text-xs opacity-50 mt-2 text-right">
            {formData.content.length} / 50000
          </div>
        </div>

        {/* 标签 */}
        <div className="post-card">
          <label className="block text-xs mb-2 text-yellow-300">
            标签（选填，最多5个）
          </label>
          
          {/* 已添加的标签 */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-900 border border-cyan-500 text-xs"
                >
                  #{tag}
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 添加标签 */}
          {formData.tags.length < 5 && (
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-gray-900 border border-cyan-500 p-2 text-xs"
                placeholder="输入标签名称（如：留学、CS、求职）"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                maxLength={50}
              />
              <button
                type="button"
                className="pixel-btn text-xs"
                onClick={handleAddTag}
              >
                添加
              </button>
            </div>
          )}
          
          <p className="text-xs opacity-50 mt-2">
            💡 提示：标签可以帮助其他人更容易找到你的帖子
          </p>
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="pixel-btn"
            disabled={submitting}
          >
            {submitting ? '发布中...' : '🚀 发布帖子'}
          </button>
          <Link href="/forum" className="pixel-btn pixel-btn-secondary">
            取消
          </Link>
        </div>

        {/* 提示信息 */}
        <div className="post-card bg-blue-900 bg-opacity-30 border-blue-500">
          <p className="text-xs leading-relaxed">
            📝 <strong>发帖须知：</strong>
            <br />
            • 请文明发言，尊重他人
            <br />
            • 发布有价值的内容，避免灌水
            <br />
            • 选择正确的分类，方便其他人查找
            <br />
            • 发帖成功后将获得 <strong className="text-yellow-300">5 积分</strong> 奖励
          </p>
        </div>
      </form>
    </div>
  )
}
