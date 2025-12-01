// src/app/forum/[id]/edit/page.tsx
// 编辑帖子页面 - 修复 Next.js 15 params Promise 问题

'use client'

import { useState, useEffect, use } from 'react'  // ✅ 导入 use
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { PostDetail } from '@/types/forum'
import { POST_CATEGORIES } from '@/lib/forum/utils'

interface PageProps {
  params: Promise<{  // ✅ params 是 Promise
    id: string
  }>
}

export default function Page({ params }: PageProps) {
  const router = useRouter()
  const { data: session, status } = useSession()

  // ✅ 使用 React.use() unwrap params
  const { id } = use(params)

  const [post, setPost] = useState<PostDetail | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 检查登录状态
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // 获取帖子数据
  useEffect(() => {
    if (status === 'authenticated') {
      fetchPost()
    }
  }, [id, status])  // ✅ 依赖改为 id

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/forum/posts/${id}`)  // ✅ 使用 id
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取帖子失败')
      }

      const postData = data.data.post

      // 检查权限
      if (postData.authorId !== session?.user?.id) {
        router.push(`/forum/${id}`)
        return
      }

      setPost(postData)
      setFormData({
        title: postData.title,
        content: postData.content,
        category: postData.category,
        tags: postData.tags || [],
      })
    } catch (err) {
      console.error('Fetch post error:', err)
      setError(err instanceof Error ? err.message : '获取帖子失败')
    } finally {
      setLoading(false)
    }
  }

  // 提交编辑
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      alert('请填写所有必填项')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/forum/posts/${id}`, {  // ✅ 使用 id
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '更新失败')
      }

      alert('更新成功！')
      router.push(`/forum/${id}`)
    } catch (err) {
      console.error('Update post error:', err)
      alert(err instanceof Error ? err.message : '更新失败')
    } finally {
      setSubmitting(false)
    }
  }

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

  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

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
          <Link href={`/forum/${id}`} className="hover:text-cyan-400">帖子详情</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-400">编辑</span>
        </div>

        {/* 编辑表单 */}
        <div className="bg-[#1a1a35]/80 border border-gray-700 p-6">
          <h1 className="text-2xl mb-6 text-yellow-300">✏️ 编辑帖子</h1>

          <form onSubmit={handleSubmit}>
            {/* 标题 */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                标题 <span className="text-red-400">*</span>
              </label>
              <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="请输入帖子标题..."
                  maxLength={100}
                  className="w-full bg-[#0a0a1a] border border-gray-700 px-4 py-3 text-gray-300 focus:border-cyan-500 focus:outline-none"
                  required
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {formData.title.length}/100
              </div>
            </div>

            {/* 分类 */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                分类 <span className="text-red-400">*</span>
              </label>
              <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-[#0a0a1a] border border-gray-700 px-4 py-3 text-gray-300 focus:border-cyan-500 focus:outline-none"
                  required
              >
                <option value="">请选择分类</option>
                {POST_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                ))}
              </select>
            </div>

            {/* 内容 */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                内容 <span className="text-red-400">*</span>
              </label>
              <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="请输入帖子内容..."
                  rows={12}
                  className="w-full bg-[#0a0a1a] border border-gray-700 px-4 py-3 text-gray-300 focus:border-cyan-500 focus:outline-none resize-y"
                  required
              />
              <div className="text-xs text-gray-500 mt-1">
                支持 Markdown 格式
              </div>
            </div>

            {/* 标签 */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                标签（最多5个）
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
                    placeholder="输入标签后按回车添加"
                    maxLength={20}
                    className="flex-1 bg-[#0a0a1a] border border-gray-700 px-4 py-2 text-gray-300 focus:border-cyan-500 focus:outline-none"
                    disabled={formData.tags.length >= 5}
                />
                <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={formData.tags.length >= 5}
                    className="pixel-btn pixel-btn-secondary"
                >
                  添加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-300 px-3 py-1 text-xs"
                    >
                  #{tag}
                      <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-400"
                      >
                    ×
                  </button>
                </span>
                ))}
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex gap-4 pt-4 border-t border-gray-700">
              <button
                  type="submit"
                  disabled={submitting}
                  className="pixel-btn"
              >
                {submitting ? '保存中...' : '💾 保存修改'}
              </button>
              <Link
                  href={`/forum/${id}`}
                  className="pixel-btn pixel-btn-secondary"
              >
                ❌ 取消
              </Link>
            </div>
          </form>
        </div>
      </div>
  )
}