'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
// 去掉了 RESOURCE_CATEGORIES 的引用，因为我们要用数据库的数据
import { formatFileSize } from '@/types/resource'

// 简单的接口定义，确保 TypeScript 不报错
interface Category {
  id: string
  name: string
  icon?: string | null
}

// 允许的文件类型
const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/zip': 'ZIP',
  'application/x-rar-compressed': 'RAR',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'text/plain': 'TXT',
  'text/markdown': 'MD',
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export default function UploadResourcePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 表单状态
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // 文件状态
  const [file, setFile] = useState<File | null>(null)
  const [uploadedFile, setUploadedFile] = useState<{
    fileUrl: string
    filePublicId: string
    fileName: string
    fileSize: number
    fileType: string
    fileFormat: string
  } | null>(null)

  // UI状态
  const [categories, setCategories] = useState<Category[]>([]) // 使用 Category 接口
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 检查登录状态
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=' + encodeURIComponent('/resources/upload'))
    }
  }, [status, router])

  // 获取分类
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/resources/categories')
      const data = await response.json()
      if (data.success) {
        // 后端返回的是 name, icon, id 等字段
        setCategories(data.data || [])
      }
    } catch (err) {
      console.error('Fetch categories error:', err)
      setError('无法加载分类列表，请刷新重试')
    }
  }

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // 验证文件类型
    if (!Object.keys(ALLOWED_TYPES).includes(selectedFile.type)) {
      setError('不支持的文件类型')
      return
    }

    // 验证文件大小
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('文件大小不能超过 100MB')
      return
    }

    setFile(selectedFile)
    setError(null)
  }

  // 上传文件
  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setUploadProgress(0)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)

      // 模拟进度
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/resources/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '上传失败')
      }

      setUploadedFile(data.data)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setUploading(false)
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

    if (!uploadedFile) {
      setError('请先上传文件')
      return
    }

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

      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          categoryId,
          tagIds: [],
          ...uploadedFile,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '提交失败')
      }

      // 成功后跳转
      router.push('/resources/my?tab=uploaded&success=1')
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-4xl mb-4 animate-bounce">📤</div>
          <p className="text-sm opacity-70">加载中...</p>
        </div>
    )
  }

  return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="mb-6">
          <Link href="/resources" className="pixel-btn text-xs">
            ← 返回资源库
          </Link>
        </div>

        <h1 className="text-2xl mb-8">
          <span className="text-yellow-300">▸</span> 上传资源
          <span className="text-yellow-300">◂</span>
        </h1>

        <div className="pixel-container p-4 mb-8 border-yellow-500">
          <p className="text-xs opacity-80">
            📢 上传的资源需要经过审核后才会公开显示。请确保资源内容合规，不侵犯他人版权。
          </p>
        </div>

        {error && (
            <div className="pixel-container p-4 mb-6 border-red-500 bg-red-900/20">
              <p className="text-xs text-red-400">{error}</p>
            </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="pixel-container p-6 mb-6">
            <h3 className="text-sm mb-4 text-yellow-300">📁 上传文件</h3>

            {!uploadedFile ? (
                <>
                  <div
                      className="border-2 border-dashed border-gray-600 rounded p-8 text-center cursor-pointer hover:border-pink-500 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={Object.keys(ALLOWED_TYPES).join(',')}
                        onChange={handleFileSelect}
                    />

                    {file ? (
                        <div>
                          <p className="text-3xl mb-2">📄</p>
                          <p className="text-sm mb-1">{file.name}</p>
                          <p className="text-xs opacity-60">{formatFileSize(file.size)}</p>
                        </div>
                    ) : (
                        <div>
                          <p className="text-4xl mb-2">📤</p>
                          <p className="text-sm mb-2">点击或拖拽文件到此处</p>
                          <p className="text-xs opacity-60">
                            支持 PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, RAR, 图片等格式
                          </p>
                          <p className="text-xs opacity-60">最大 100MB</p>
                        </div>
                    )}
                  </div>

                  {file && !uploading && (
                      <button
                          type="button"
                          className="pixel-btn mt-4 w-full"
                          onClick={handleUpload}
                      >
                        上传文件
                      </button>
                  )}

                  {uploading && (
                      <div className="mt-4">
                        <div className="progress-bar">
                          <div
                              className="progress-fill"
                              style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-center mt-2 opacity-70">
                          上传中... {uploadProgress}%
                        </p>
                      </div>
                  )}
                </>
            ) : (
                <div className="flex items-center gap-4">
                  <span className="text-3xl">✅</span>
                  <div className="flex-1">
                    <p className="text-sm">{uploadedFile.fileName}</p>
                    <p className="text-xs opacity-60">
                      {uploadedFile.fileFormat.toUpperCase()} · {formatFileSize(uploadedFile.fileSize)}
                    </p>
                  </div>
                  <button
                      type="button"
                      className="pixel-btn text-xs"
                      onClick={() => {
                        setUploadedFile(null)
                        setFile(null)
                      }}
                  >
                    重新上传
                  </button>
                </div>
            )}
          </div>

          <div className="pixel-container p-6 mb-6">
            <h3 className="text-sm mb-4 text-yellow-300">📝 资源信息</h3>

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
            </div>

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
                {/* 🔄 这里现在使用从 API 获取的 categories 数组 */}
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon || '📁'} {category.name}
                    </option>
                ))}
              </select>
            </div>

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
            </div>

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
                disabled={!uploadedFile || !title.trim() || !categoryId || submitting}
            >
              {submitting ? '提交中...' : '提交审核'}
            </button>
          </div>
        </form>
      </div>
  )
}