// src/types/resource.ts
// 资源系统类型定义

// ==========================================
// 枚举类型
// ==========================================

export type ResourceStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELETED'

// ==========================================
// 资源分类
// ==========================================

export interface ResourceCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  parentId: string | null
  sortOrder: number
  children?: ResourceCategory[]
  resourceCount?: number
}

// ==========================================
// 资源相关类型
// ==========================================

// 资源作者信息
export interface ResourceAuthor {
  id: string
  username: string
  name: string
  displayName: string | null
  avatarUrl: string | null
  currentSchool: string | null
}

// 资源标签
export interface ResourceTagInfo {
  id: string
  name: string
  slug: string
}

// 资源列表项（精简版）
export interface ResourceListItem {
  id: string
  title: string
  description: string
  categoryId: string
  fileFormat: string | null
  fileSize: number
  downloads: number
  views: number
  ratingAvg: number
  ratingCount: number
  status: ResourceStatus
  featured: boolean
  createdAt: string
  category: {
    id: string
    name: string
    icon: string | null
  }
  author: ResourceAuthor
  tags?: ResourceTagInfo[]
  _count?: {
    favorites: number
    reviews: number
  }
}

// 资源详情（完整版）
export interface Resource {
  id: string
  title: string
  description: string
  categoryId: string
  authorId: string
  fileUrl: string
  filePublicId: string
  fileName: string
  fileSize: number
  fileType: string
  fileFormat: string | null
  thumbnailUrl: string | null
  downloads: number
  views: number
  ratingAvg: number
  ratingCount: number
  status: ResourceStatus
  featured: boolean
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
  category: ResourceCategory
  author: ResourceAuthor
  tags?: ResourceTagInfo[]
  // 当前用户状态
  userRating?: number | null
  isFavorited?: boolean
}

// ==========================================
// 评论相关类型
// ==========================================

export interface ResourceReviewAuthor {
  id: string
  username: string
  name: string
  displayName: string | null
  avatarUrl: string | null
}

export interface ResourceReview {
  id: string
  resourceId: string
  authorId: string
  content: string
  parentId: string | null
  likes: number
  createdAt: string
  updatedAt: string
  author: ResourceReviewAuthor
  replies?: ResourceReview[]
  isLiked?: boolean
}

// ==========================================
// API 请求类型
// ==========================================

export interface CreateResourceRequest {
  title: string
  description: string
  categoryId: string
  tagIds?: string[]
  fileUrl: string
  filePublicId: string
  fileName: string
  fileSize: number
  fileType: string
  fileFormat?: string
  thumbnailUrl?: string
}

export interface UpdateResourceRequest {
  title?: string
  description?: string
  categoryId?: string
  tagIds?: string[]
}

export interface CreateReviewRequest {
  content: string
  parentId?: string
}

// ==========================================
// API 响应类型
// ==========================================

export interface ResourceListResponse {
  success: boolean
  data?: {
    resources: ResourceListItem[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
  error?: string
}

export interface ResourceDetailResponse {
  success: boolean
  data?: Resource
  error?: string
}

export interface ResourceCategoryResponse {
  success: boolean
  data?: ResourceCategory[]
  error?: string
}

export interface ResourceReviewListResponse {
  success: boolean
  data?: {
    reviews: ResourceReview[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
  error?: string
}

export interface FileUploadResponse {
  success: boolean
  data?: {
    fileUrl: string
    filePublicId: string
    fileName: string
    fileSize: number
    fileType: string
    fileFormat: string
  }
  error?: string
}

export interface RatingResponse {
  success: boolean
  data?: {
    userRating: number
    ratingAvg: number
    ratingCount: number
  }
  error?: string
}

export interface FavoriteResponse {
  success: boolean
  data?: {
    isFavorited: boolean
  }
  message?: string
  error?: string
}

export interface DownloadResponse {
  success: boolean
  data?: {
    downloadUrl: string
    fileName: string
  }
  error?: string
}

// ==========================================
// 筛选和排序类型
// ==========================================

export type ResourceSortOption = 'newest' | 'downloads' | 'rating' | 'popular'

export interface ResourceFilters {
  categoryId?: string
  status?: ResourceStatus
  featured?: boolean
  authorId?: string
  search?: string
  sortBy?: ResourceSortOption
}

// ==========================================
// 常量定义
// ==========================================

// 资源分类配置（与 mockData 保持一致）
export const RESOURCE_CATEGORIES: Record<string, { label: string; icon: string }> = {
  'study': { label: '学习资料', icon: '📚' },
  'document': { label: '文书模板', icon: '📄' },
  'resume': { label: '简历模板', icon: '💼' },
  'report': { label: '数据报告', icon: '📊' },
  'video': { label: '视频教程', icon: '🎬' },
  'tool': { label: '实用工具', icon: '🔗' },
}

// 文件格式图标映射
export const FILE_FORMAT_ICONS: Record<string, string> = {
  'pdf': '📕',
  'doc': '📘',
  'docx': '📘',
  'ppt': '📙',
  'pptx': '📙',
  'xls': '📗',
  'xlsx': '📗',
  'zip': '📦',
  'rar': '📦',
  'jpg': '🖼️',
  'png': '🖼️',
  'gif': '🖼️',
  'mp4': '🎬',
  'txt': '📝',
  'md': '📝',
}

// 获取文件格式图标
export function getFileFormatIcon(format: string | null): string {
  if (!format) return '📄'
  return FILE_FORMAT_ICONS[format.toLowerCase()] || '📄'
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 格式化数字（如下载数）
export function formatCount(count: number): string {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

// 格式化相对时间
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSecs < 60) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  if (diffWeeks < 4) return `${diffWeeks}周前`
  if (diffMonths < 12) return `${diffMonths}个月前`
  
  return date.toLocaleDateString('zh-CN')
}

// 格式化评分显示
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

// 生成星级数组（用于渲染评分星星）
export function generateStars(rating: number): ('full' | 'half' | 'empty')[] {
  const stars: ('full' | 'half' | 'empty')[] = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating - fullStars >= 0.5

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push('full')
    } else if (i === fullStars && hasHalfStar) {
      stars.push('half')
    } else {
      stars.push('empty')
    }
  }

  return stars
}
