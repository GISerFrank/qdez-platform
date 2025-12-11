// src/app/test-cloudinary/page.tsx
// Cloudinary 配置测试页面

'use client'

import { useState } from 'react'

interface TestResult {
  success: boolean
  message?: string
  error?: string
  [key: string]: any
}

export default function TestCloudinaryPage() {
  const [connectionResult, setConnectionResult] = useState<TestResult | null>(null)
  const [uploadResult, setUploadResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // 测试连接
  const testConnection = async () => {
    setLoading(true)
    setConnectionResult(null)

    try {
      const response = await fetch('/api/test-cloudinary')
      const data = await response.json()
      setConnectionResult(data)
    } catch (error) {
      setConnectionResult({
        success: false,
        error: '请求失败: ' + (error instanceof Error ? error.message : String(error)),
      })
    } finally {
      setLoading(false)
    }
  }

  // 测试上传
  const testUpload = async () => {
    if (!selectedFile) {
      setUploadResult({ success: false, error: '请先选择文件' })
      return
    }

    setUploadLoading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/test-cloudinary', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setUploadResult(data)
    } catch (error) {
      setUploadResult({
        success: false,
        error: '上传失败: ' + (error instanceof Error ? error.message : String(error)),
      })
    } finally {
      setUploadLoading(false)
    }
  }

  return (
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-2xl mb-8">
          <span className="text-yellow-300">▸</span> Cloudinary 配置测试
          <span className="text-yellow-300">◂</span>
        </h1>

        {/* 连接测试 */}
        <div className="pixel-container p-6 mb-8">
          <h2 className="text-lg mb-4 text-yellow-300">🔌 连接测试</h2>
          <p className="text-xs opacity-70 mb-4">
            测试 Cloudinary API 连接是否正常
          </p>

          <button
              className="pixel-btn"
              onClick={testConnection}
              disabled={loading}
          >
            {loading ? '测试中...' : '测试连接'}
          </button>

          {connectionResult && (
              <div className={`mt-4 p-4 border-2 ${
                  connectionResult.success
                      ? 'border-green-500 bg-green-900/20'
                      : 'border-red-500 bg-red-900/20'
              }`}>
            <pre className="text-xs whitespace-pre-wrap overflow-auto">
              {JSON.stringify(connectionResult, null, 2)}
            </pre>
              </div>
          )}
        </div>

        {/* 上传测试 */}
        <div className="pixel-container p-6 mb-8">
          <h2 className="text-lg mb-4 text-yellow-300">📤 上传测试</h2>
          <p className="text-xs opacity-70 mb-4">
            测试文件上传功能（文件将上传到 qdez-test 文件夹）
          </p>

          <div className="mb-4">
            <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="pixel-input"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar,.txt,.md"
            />
            {selectedFile && (
                <p className="text-xs mt-2 opacity-70">
                  已选择: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
            )}
          </div>

          <button
              className="pixel-btn"
              onClick={testUpload}
              disabled={uploadLoading || !selectedFile}
          >
            {uploadLoading ? '上传中...' : '测试上传'}
          </button>

          {uploadResult && (
              <div className={`mt-4 p-4 border-2 ${
                  uploadResult.success
                      ? 'border-green-500 bg-green-900/20'
                      : 'border-red-500 bg-red-900/20'
              }`}>
            <pre className="text-xs whitespace-pre-wrap overflow-auto">
              {JSON.stringify(uploadResult, null, 2)}
            </pre>

                {uploadResult.success && uploadResult.data?.url && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <a
                          href={uploadResult.data.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pixel-btn text-xs"
                      >
                        查看文件
                      </a>
                      {uploadResult.data.downloadUrl && (
                          <a
                              href={uploadResult.data.downloadUrl}
                              className="pixel-btn text-xs pixel-btn-success"
                          >
                            下载文件 ({uploadResult.data.originalFileName})
                          </a>
                      )}
                    </div>
                )}
              </div>
          )}
        </div>

        {/* 支持的文件类型 */}
        <div className="pixel-container p-6">
          <h2 className="text-lg mb-4 text-yellow-300">📁 支持的文件类型</h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <h3 className="text-sm mb-2">📄 文档</h3>
              <ul className="opacity-70 space-y-1">
                <li>PDF (最大 50MB)</li>
                <li>DOC, DOCX (最大 50MB)</li>
                <li>PPT, PPTX (最大 100MB)</li>
                <li>XLS, XLSX (最大 50MB)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm mb-2">🖼️ 图片</h3>
              <ul className="opacity-70 space-y-1">
                <li>JPG, PNG (最大 10MB)</li>
                <li>GIF, WEBP (最大 10MB)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm mb-2">📦 压缩包</h3>
              <ul className="opacity-70 space-y-1">
                <li>ZIP (最大 100MB)</li>
                <li>RAR, 7Z (最大 100MB)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm mb-2">📝 文本</h3>
              <ul className="opacity-70 space-y-1">
                <li>TXT (最大 10MB)</li>
                <li>MD (最大 10MB)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="mt-8">
          <a href="/" className="pixel-btn text-xs">
            ← 返回首页
          </a>
        </div>
      </div>
  )
}