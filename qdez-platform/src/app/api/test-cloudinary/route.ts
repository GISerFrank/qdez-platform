// src/app/api/test-cloudinary/route.ts
// Cloudinary 连接测试 API

import { NextRequest, NextResponse } from 'next/server'
import cloudinary, {
  validateFileType,
  getMaxFileSize,
  uploadToCloudinary,
  generateDownloadUrl,
  ALLOWED_FILE_TYPES
} from '@/lib/cloudinary'

/**
 * GET /api/test-cloudinary
 * 测试 Cloudinary 连接和配置
 */
export async function GET() {
  try {
    // 1. 检查环境变量
    const envCheck = {
      CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
    }

    const missingEnv = Object.entries(envCheck)
        .filter(([_, exists]) => !exists)
        .map(([key]) => key)

    if (missingEnv.length > 0) {
      return NextResponse.json({
        success: false,
        error: '缺少环境变量',
        missingEnv,
        hint: '请在 .env.local 中添加 Cloudinary 配置',
      }, { status: 500 })
    }

    // 2. 测试 Cloudinary 连接
    const pingResult = await cloudinary.api.ping()

    // 3. 获取账户使用情况
    let usageInfo = null
    try {
      const usage = await cloudinary.api.usage()
      usageInfo = {
        storage: {
          used: formatBytes(usage.storage.usage),
          limit: formatBytes(usage.storage.limit),
          percentage: ((usage.storage.usage / usage.storage.limit) * 100).toFixed(1) + '%',
        },
        bandwidth: {
          used: formatBytes(usage.bandwidth.usage),
          limit: formatBytes(usage.bandwidth.limit),
          percentage: ((usage.bandwidth.usage / usage.bandwidth.limit) * 100).toFixed(1) + '%',
        },
        requests: usage.requests,
        resources: usage.resources,
      }
    } catch (e) {
      // 有些账户可能没有 usage API 权限
      usageInfo = 'Unable to fetch (this is normal for some account types)'
    }

    // 4. 返回测试结果
    return NextResponse.json({
      success: true,
      message: '✅ Cloudinary 连接成功！',
      config: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        // 不暴露完整的 API Key 和 Secret
        apiKeyPrefix: process.env.CLOUDINARY_API_KEY?.substring(0, 6) + '***',
      },
      ping: pingResult,
      usage: usageInfo,
      supportedFileTypes: Object.keys(ALLOWED_FILE_TYPES).length + ' 种文件类型',
    })

  } catch (error) {
    console.error('Cloudinary test error:', error)
    return NextResponse.json({
      success: false,
      error: '连接 Cloudinary 失败',
      details: error instanceof Error ? error.message : String(error),
      hint: '请检查 API 凭证是否正确',
    }, { status: 500 })
  }
}

/**
 * POST /api/test-cloudinary
 * 测试文件上传功能
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({
        success: false,
        error: '请选择文件',
      }, { status: 400 })
    }

    // 验证文件类型
    if (!validateFileType(file.type)) {
      return NextResponse.json({
        success: false,
        error: '不支持的文件类型',
        fileType: file.type,
        supportedTypes: Object.keys(ALLOWED_FILE_TYPES),
      }, { status: 400 })
    }

    // 验证文件大小
    const maxSize = getMaxFileSize(file.type)
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: `文件大小超过限制（最大 ${formatBytes(maxSize)}）`,
        fileSize: formatBytes(file.size),
        maxSize: formatBytes(maxSize),
      }, { status: 400 })
    }

    // 读取文件并上传
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await uploadToCloudinary(
        buffer,
        file.name,
        file.type,
        {
          folder: 'qdez-test', // 测试文件夹
          tags: ['test', 'upload-test'],
        }
    )

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || '上传失败',
      }, { status: 500 })
    }

    // 🔴 修改这里：
    // 1. 获取格式
    const fmt = result.data!.format?.toLowerCase() || ''

    // 2. 判断是否应该使用 image 资源类型 (包括 pdf!)
    // 必须与 cloudinary.ts 中的上传逻辑保持一致
    const isImageResource = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'bmp', 'tiff'].includes(fmt)

    // 3. 确定最终类型
    const resType = isImageResource ? 'image' : 'raw'

    // 生成下载链接
    const downloadUrl = generateDownloadUrl(
        result.data!.publicId,
        file.name,
        resType // 现在这里会正确传入 'image'
    )

    console.log('Upload result:', {
      publicId: result.data!.publicId,
      format: result.data!.format,
      fileName: file.name,
      resourceType: resType,
      downloadUrl,
    })

    return NextResponse.json({
      success: true,
      message: '✅ 文件上传成功！',
      data: {
        publicId: result.data!.publicId,
        url: result.data!.secureUrl,
        downloadUrl,
        format: result.data!.format,
        size: formatBytes(result.data!.bytes),
        originalFileName: file.name,
        resourceType: resType,
        ...(result.data!.width && {
          dimensions: `${result.data!.width}x${result.data!.height}`,
        }),
      },
      note: '这是测试上传，文件保存在 qdez-test 文件夹中',
    })

  } catch (error) {
    console.error('Upload test error:', error)
    return NextResponse.json({
      success: false,
      error: '上传测试失败',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}

// 格式化字节数
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}