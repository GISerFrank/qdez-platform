// src/app/resources/[id]/edit/page.tsx
// 编辑资源页面

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import type { Resource, ResourceCategory } from '@/types/resource'
import { RESOURCE_CATEGORIES, formatFileSize, getFileFormatIcon } from '@/types/resource'

export default function EditResourcePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()

  // 表单状态
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // 资源信息
  const [resource, setResource] = useState<Resource | null>(null)
  const [categories, setCategories] = useState<ResourceCategory[]>([])

  // UI 状态
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取资源详情
  useEffect(() => {
    fetchResource()
    fetchCategories()
  }, [id])

  // 检查权限
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login?redirect=' + encodeURIComponent(`/resources/${id}/edit`))
    }
    
    if (resource && session?.user?.id !== resource.authorId) {
      router.push(`/resources/${id}`)
    }
  }, [authStatus, resource, session, id, router])

  const fetchResource = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/resources/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '获取资源失败')
      }

      const res = data.data
      setResource(res)
      setTitle(res.title)
      setDescription(res.description)
      setCategoryId(res.categoryId)
      setTags(res.tags?.map((t: any) => t.name) || [])
    } catch (err) {
      console.error('Fetch resource error:', err)
      setError(err instanceof Error ? err.message : '获取资源失败')
    } finally {
      setLoading(false)
    }
  }

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

  // 添加标签
  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  // 移除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('请输入资源标题')
      return
    }

    if (!description.trim() || description.length < 10) {
      setError('请输入资源描述（至少10个字）')
      return
    }

    if (!categoryId) {
      setError('请选择资源分类')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch(`/api/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          categoryId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '更新失败')
      }

      // 成功后跳转
      router.push(`/resources/${id}`)
    } catch (err) {
      console.error('Update error:', err)
      setError(err instanceof Error ? err.message : '更新失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 加载中
  if (loading || authStatus === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4 animate-bounce">📝</div>
        <p className="text-sm opacity-70">加载中...</p>
      </div>
    )
  }

  // 错误或资源不存在
  if (error && !resource) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="pixel-container p-12 text-center">
          <div className="text-6xl mb-4">😢</div>
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/resources" className="pixel-btn">
            返回资源库
          </Link>
        </div>
      </div>
    )
  }

  if (!resource) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link href={`/resources/${id}`} className="pixel-btn text-xs">
          ← 返回资源详情
        </Link>
      </div>

      {/* 标题 */}
      <h1 className="text-2xl mb-8">
        <span className="text-yellow-300">▸</span> 编辑资源
        <span className="text-yellow-300">◂</span>
      </h1>

      {/* 提示 */}
      <div className="pixel-container p-4 mb-8 border-yellow-500">
        <p className="text-xs opacity-80">
          📢 编辑资源后需要重新审核。文件无法修改，如需更换文件请删除后重新上传。
        </p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="pixel-container p-4 mb-6 border-red-500 bg-red-900/20">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 文件信息（只读） */}
        <div className="pixel-container p-6 mb-6">
          <h3 className="text-sm mb-4 text-yellow-300">📁 文件信息</h3>
          <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded">
            <span className="text-3xl">{getFileFormatIcon(resource.fileFormat)}</span>
            <div>
              <p className="text-sm">{resource.fileName}</p>
              <p className="text-xs opacity-60">
                {resource.fileFormat?.toUpperCase()} · {formatFileSize(resource.fileSize)}
              </p>
            </div>
          </div>
          <p className="text-xs opacity-50 mt-2">
            ⚠️ 文件无法修改，如需更换请删除资源后重新上传
          </p>
        </div>

        {/* 资源信息 */}
        <div className="pixel-container p-6 mb-6">
          <h3 className="text-sm mb-4 text-yellow-300">📝 资源信息</h3>

          {/* 标题 */}
          <div className="mb-4">
            <label className="block text-xs mb-2 opacity-70">
              资源标题 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              className="pixel-input"
              placeholder="请输入资源标题（最多200字）"
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-xs opacity-50 mt-1 text-right">
              {title.length}/200
            </p>
          </div>

          {/* 分类 */}
          <div className="mb-4">
            <label className="block text-xs mb-2 opacity-70">
              资源分类 <span className="text-red-400">*</span>
            </label>
            <select
              className="pixel-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">请选择分类</option>
              {Object.entries(RESOURCE_CATEGORIES).map(([key, { label, icon }]) => (
                <option key={key} value={key}>
                  {icon} {label}
                </option>
              ))}
            </select>
          </div>

          {/* 描述 */}
          <div className="mb-4">
            <label className="block text-xs mb-2 opacity-70">
              资源描述 <span className="text-red-400">*</span>
            </label>
            <textarea
              className="pixel-textarea"
              placeholder="请详细描述资源内容、用途、适合人群等（至少10个字）"
              rows={6}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-xs opacity-50 mt-1 text-right">
              {description.length}/5000
            </p>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-xs mb-2 opacity-70">
              标签（可选，最多5个）
            </label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-pink-900/50 text-xs rounded"
                >
                  #{tag}
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {tags.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="pixel-input flex-1"
                  placeholder="输入标签后按回车添加"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
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
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-4">
          <button
            type="button"
            className="pixel-btn pixel-btn-secondary flex-1"
            onClick={() => router.back()}
          >
            取消
          </button>
          <button
            type="submit"
            className="pixel-btn flex-1"
            disabled={!title.trim() || !categoryId || submitting}
          >
            {submitting ? '保存中...' : '保存修改'}
          </button>
        </div>
      </form>
    </div>
  )
}
