// src/lib/cloudinary.ts
// Cloudinary 云存储配置和工具函数

import cloudinary from 'cloudinary'

// 使用 v2 API
const cloudinaryV2 = cloudinary.v2

// ==========================================
// 配置 Cloudinary
// ==========================================

cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ==========================================
// 文件类型配置
// ==========================================

// 允许的文件类型和大小限制
export const ALLOWED_FILE_TYPES: Record<string, {
  ext: string
  maxSize: number
  category: 'document' | 'image' | 'archive' | 'text'
}> = {
  // 文档类型
  'application/pdf': {
    ext: 'pdf',
    maxSize: 50 * 1024 * 1024, // 50MB
    category: 'document'
  },
  'application/msword': {
    ext: 'doc',
    maxSize: 50 * 1024 * 1024,
    category: 'document'
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    ext: 'docx',
    maxSize: 50 * 1024 * 1024,
    category: 'document'
  },
  'application/vnd.ms-powerpoint': {
    ext: 'ppt',
    maxSize: 100 * 1024 * 1024, // 100MB
    category: 'document'
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    ext: 'pptx',
    maxSize: 100 * 1024 * 1024,
    category: 'document'
  },
  'application/vnd.ms-excel': {
    ext: 'xls',
    maxSize: 50 * 1024 * 1024,
    category: 'document'
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    ext: 'xlsx',
    maxSize: 50 * 1024 * 1024,
    category: 'document'
  },

  // 图片类型
  'image/jpeg': {
    ext: 'jpg',
    maxSize: 10 * 1024 * 1024, // 10MB
    category: 'image'
  },
  'image/png': {
    ext: 'png',
    maxSize: 10 * 1024 * 1024,
    category: 'image'
  },
  'image/gif': {
    ext: 'gif',
    maxSize: 10 * 1024 * 1024,
    category: 'image'
  },
  'image/webp': {
    ext: 'webp',
    maxSize: 10 * 1024 * 1024,
    category: 'image'
  },

  // 压缩包类型
  'application/zip': {
    ext: 'zip',
    maxSize: 100 * 1024 * 1024, // 100MB
    category: 'archive'
  },
  'application/x-rar-compressed': {
    ext: 'rar',
    maxSize: 100 * 1024 * 1024,
    category: 'archive'
  },
  'application/x-7z-compressed': {
    ext: '7z',
    maxSize: 100 * 1024 * 1024,
    category: 'archive'
  },

  // 文本类型
  'text/plain': {
    ext: 'txt',
    maxSize: 10 * 1024 * 1024,
    category: 'text'
  },
  'text/markdown': {
    ext: 'md',
    maxSize: 10 * 1024 * 1024,
    category: 'text'
  },
}

// 文件类型分组
export const FILE_CATEGORIES = {
  document: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
  image: ['jpg', 'png', 'gif', 'webp'],
  archive: ['zip', 'rar', '7z'],
  text: ['txt', 'md'],
}

// ==========================================
// 验证函数
// ==========================================

/**
 * 验证文件类型是否允许
 */
export function validateFileType(mimeType: string): boolean {
  return mimeType in ALLOWED_FILE_TYPES
}

/**
 * 获取文件大小限制
 */
export function getMaxFileSize(mimeType: string): number {
  const config = ALLOWED_FILE_TYPES[mimeType]
  return config?.maxSize || 10 * 1024 * 1024 // 默认 10MB
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(mimeType: string): string {
  const config = ALLOWED_FILE_TYPES[mimeType]
  return config?.ext || 'bin'
}

/**
 * 获取文件分类
 */
export function getFileCategory(mimeType: string): string {
  const config = ALLOWED_FILE_TYPES[mimeType]
  return config?.category || 'unknown'
}

/**
 * 根据扩展名获取 MIME 类型
 */
export function getMimeTypeByExtension(ext: string): string | null {
  const lowerExt = ext.toLowerCase().replace('.', '')
  for (const [mimeType, config] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (config.ext === lowerExt) {
      return mimeType
    }
  }
  return null
}

// ==========================================
// 上传相关类型
// ==========================================

export interface UploadOptions {
  folder?: string
  publicId?: string
  resourceType?: 'auto' | 'image' | 'video' | 'raw'
  tags?: string[]
}

export interface UploadResult {
  success: boolean
  data?: {
    publicId: string
    url: string
    secureUrl: string
    format: string
    bytes: number
    width?: number
    height?: number
  }
  error?: string
}

// ==========================================
// 核心上传函数
// ==========================================

/**
 * 上传文件到 Cloudinary
 *
 * @param buffer - 文件 Buffer
 * @param fileName - 原始文件名
 * @param mimeType - 文件 MIME 类型
 * @param options - 上传选项
 * @returns 上传结果
 */
export async function uploadToCloudinary(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    // 1. 验证文件类型
    if (!validateFileType(mimeType)) {
      return { success: false, error: '不支持的文件类型' }
    }

    // 2. 获取文件配置
    const fileConfig = ALLOWED_FILE_TYPES[mimeType]
    const ext = getFileExtension(mimeType) // <--- 新增：获取后缀名

    // 3. 确定资源类型
    // 修改点 A：特别处理 PDF。虽然它是 document，但在 Cloudinary 中作为 'image' 上传
    // 可以获得预览图，也可以按文档查看。
    let resourceType: 'auto' | 'image' | 'video' | 'raw' = 'raw'

    if (fileConfig.category === 'image' || mimeType === 'application/pdf') {
      resourceType = 'image'
    }

    // 4. 生成唯一的 public_id
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 9)

    // 🔴 核心修改：只有 raw 类型才手动加后缀，image 类型(含PDF)不要加！
    let finalPublicId = options.publicId || `${timestamp}-${randomStr}`

    if (resourceType === 'raw' && !options.publicId) {
      finalPublicId += `.${ext}`
    }

    // 5. 构建上传配置
    const uploadConfig: Record<string, any> = {
      folder: options.folder || 'qdez-resources',
      public_id: finalPublicId,
      resource_type: options.resourceType || resourceType,
      tags: options.tags || [],
      use_filename: true,
      unique_filename: false, // 修改点 C：既然我们自己生成了带后缀的 ID，这里设为 false 避免 Cloudinary 再乱改名
    }

    // 6. 将 buffer 转换为 base64 data URI
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`

    // 7. 执行上传
    const result = await cloudinaryV2.uploader.upload(base64Data, uploadConfig)

    // 8. 返回成功结果
    return {
      success: true,
      data: {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      },
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '上传失败',
    }
  }
}

/**
 * 从 Cloudinary 删除文件
 *
 * @param publicId - 文件的 public_id
 * @param resourceType - 资源类型
 * @returns 删除结果
 */
export async function deleteFromCloudinary(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'raw'
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await cloudinaryV2.uploader.destroy(publicId, {
      resource_type: resourceType
    })

    if (result.result === 'ok' || result.result === 'not found') {
      return { success: true }
    }

    return { success: false, error: '删除失败' }
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除失败',
    }
  }
}

/**
 * 生成签名下载 URL（带过期时间）
 * 用于保护文件下载，防止未授权访问
 *
 * @param publicId - 文件的 public_id
 * @param originalFileName - 原始文件名（用于下载时显示正确的文件名）
 * @param expiresIn - 过期时间（秒），默认1小时
 * @returns 签名 URL
 */
export function generateSignedUrl(
    publicId: string,
    originalFileName?: string,
    expiresIn: number = 3600
): string {
  const timestamp = Math.floor(Date.now() / 1000) + expiresIn

  const options: Record<string, any> = {
    resource_type: 'raw',
    type: 'authenticated',
    sign_url: true,
    expires_at: timestamp,
  }

  // 如果提供了原始文件名，添加到下载配置
  if (originalFileName) {
    const encodedFileName = encodeURIComponent(originalFileName)
    options.flags = `attachment:${encodedFileName}`
  }

  return cloudinaryV2.url(publicId, options)
}

/**
 * 生成普通下载 URL
 * 用于公开资源的直接下载
 *
 * @param publicId - 文件的 public_id
 * @param originalFileName - 原始文件名（用于下载时显示正确的文件名）
 * @param resourceType - 资源类型
 * @returns 下载 URL
 */
export function generateDownloadUrl(
    publicId: string,
    originalFileName?: string,
    resourceType: 'image' | 'video' | 'raw' = 'raw'
): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME

  // 1. 处理文件名 - 去掉扩展名
  let attachmentFlag = 'fl_attachment'
  if (originalFileName) {
    const nameWithoutExt = originalFileName.replace(/\.[^/.]+$/, '')
    attachmentFlag = `fl_attachment:${encodeURIComponent(nameWithoutExt)}`
  }

  // 2. 构建 URL
  let url = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${attachmentFlag}/${publicId}`

  // 3. 如果是 image 类型且有文件名，补上后缀
  if (resourceType === 'image' && originalFileName) {
    const ext = originalFileName.split('.').pop()
    if (ext && !publicId.endsWith(`.${ext}`)) {
      url += `.${ext}`
    }
  }

  return url
}

/**
 * 生成图片缩略图 URL
 *
 * @param publicId - 图片的 public_id
 * @param width - 缩略图宽度
 * @param height - 缩略图高度
 * @returns 缩略图 URL
 */
export function generateThumbnailUrl(
    publicId: string,
    width: number = 200,
    height: number = 200
): string {
  return cloudinaryV2.url(publicId, {
    resource_type: 'image',
    transformation: [
      { width, height, crop: 'fill' },
      { quality: 'auto' },
      { format: 'auto' },
    ],
  })
}

// 导出 cloudinaryV2 实例供其他地方使用
export default cloudinaryV2