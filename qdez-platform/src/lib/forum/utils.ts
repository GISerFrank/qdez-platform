// src/lib/forum/utils.ts
// 论坛系统相关的工具函数

import { PostCategory, PostSortBy, CategoryInfo } from '@/types/forum'

// ==========================================
// 分类相关
// ==========================================

// 分类配置
export const POST_CATEGORIES: Record<string, { label: string; icon: string }> = {
  study: { label: '学习交流', icon: '📚' },
  life: { label: '生活分享', icon: '🌟' },
  career: { label: '求职招聘', icon: '💼' },
  visa: { label: '签证问题', icon: '🛂' },
  housing: { label: '租房信息', icon: '🏠' },
  travel: { label: '旅游攻略', icon: '✈️' },
  other: { label: '其他', icon: '💬' },
}

// 获取分类信息
export function getCategoryInfo(category: string): { label: string; icon: string } {
  return POST_CATEGORIES[category] || { label: category, icon: '💬' }
}

// 获取所有分类列表
export function getAllCategories(): CategoryInfo[] {
  return Object.entries(POST_CATEGORIES).map(([value, { label, icon }]) => ({
    value,
    label,
    count: 0, // 需要从数据库查询
  }))
}

// ==========================================
// 排序相关
// ==========================================

// 排序配置
export const SORT_OPTIONS: Record<PostSortBy, { label: string; icon: string }> = {
  latest: { label: '最新', icon: '🕐' },
  hot: { label: '最热', icon: '🔥' },
  mostCommented: { label: '最多评论', icon: '💬' },
  mostLiked: { label: '最多点赞', icon: '👍' },
}

// 获取排序信息
export function getSortInfo(sort: PostSortBy): { label: string; icon: string } {
  return SORT_OPTIONS[sort] || SORT_OPTIONS.latest
}

// ==========================================
// 内容处理
// ==========================================

// 生成帖子摘要
export function generateExcerpt(content: string, maxLength: number = 150): string {
  // 移除 Markdown 语法
  const plainText = content
    .replace(/#{1,6}\s/g, '')           // 移除标题标记
    .replace(/\*\*(.+?)\*\*/g, '$1')   // 移除粗体
    .replace(/\*(.+?)\*/g, '$1')       // 移除斜体
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // 移除链接
    .replace(/`(.+?)`/g, '$1')         // 移除行内代码
    .replace(/```[\s\S]*?```/g, '')    // 移除代码块
    .replace(/\n+/g, ' ')              // 换行转空格
    .trim()
  
  if (plainText.length <= maxLength) {
    return plainText
  }
  
  return plainText.slice(0, maxLength) + '...'
}

// 计算阅读时间（分钟）
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / wordsPerMinute)
  return Math.max(1, readingTime)
}

// ==========================================
// 格式化相关
// ==========================================

// 格式化数字（K/M 格式）
export function formatCount(count: number): string {
  if (count < 1000) {
    return count.toString()
  }
  
  if (count < 1000000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  
  return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
}

// 格式化相对时间
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
  if (seconds < 60) {
    return '刚刚'
  }
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}分钟前`
  }
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}小时前`
  }
  
  const days = Math.floor(hours / 24)
  if (days < 7) {
    return `${days}天前`
  }
  
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `${weeks}周前`
  }
  
  const months = Math.floor(days / 30)
  if (months < 12) {
    return `${months}个月前`
  }
  
  const years = Math.floor(months / 12)
  return `${years}年前`
}

// 格式化完整时间
export function formatFullTime(date: string | Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// ==========================================
// 验证相关
// ==========================================

// 验证是否为有效的分类
export function isValidCategory(category: string): boolean {
  return category in POST_CATEGORIES
}

// 验证标签名称
export function isValidTagName(name: string): boolean {
  // 标签名称规则：1-50字符，只允许中英文、数字、下划线
  const regex = /^[\u4e00-\u9fa5a-zA-Z0-9_]{1,50}$/
  return regex.test(name)
}

// 清理标签名称
export function sanitizeTagName(name: string): string {
  return name.trim().replace(/\s+/g, '_')
}

// ==========================================
// 分页相关
// ==========================================

// 计算总页数
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit)
}

// 计算偏移量
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit
}

// 生成分页元数据
export function generatePaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const totalPages = calculateTotalPages(total, limit)
  const hasMore = page < totalPages
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasMore,
  }
}

// ==========================================
// Prisma 查询辅助
// ==========================================

// 生成排序条件
export function getSortOrderBy(sort: PostSortBy) {
  switch (sort) {
    case 'latest':
      return { createdAt: 'desc' as const }
    case 'hot':
      // 热度 = 浏览数 * 0.1 + 点赞数 * 2 + 评论数 * 3
      // 需要在数据库层面计算，这里先用创建时间
      return { createdAt: 'desc' as const }
    case 'mostCommented':
      return { commentCount: 'desc' as const }
    case 'mostLiked':
      return { likeCount: 'desc' as const }
    default:
      return { createdAt: 'desc' as const }
  }
}

// 生成作者选择字段
export function getAuthorSelect() {
  return {
    id: true,
    username: true,
    name: true,
    displayName: true,
    avatarUrl: true,
    currentSchool: true,
    major: true,
  }
}

// ==========================================
// 安全相关
// ==========================================

// 检查用户是否有权限编辑帖子
export function canEditPost(postAuthorId: string, currentUserId: string, isAdmin: boolean = false): boolean {
  return postAuthorId === currentUserId || isAdmin
}

// 检查用户是否有权限删除帖子
export function canDeletePost(postAuthorId: string, currentUserId: string, isAdmin: boolean = false): boolean {
  return postAuthorId === currentUserId || isAdmin
}

// 检查用户是否有权限编辑评论
export function canEditComment(commentAuthorId: string, currentUserId: string, isAdmin: boolean = false): boolean {
  return commentAuthorId === currentUserId || isAdmin
}

// 检查用户是否有权限删除评论
export function canDeleteComment(commentAuthorId: string, currentUserId: string, isAdmin: boolean = false): boolean {
  return commentAuthorId === currentUserId || isAdmin
}

// ==========================================
// 文本处理
// ==========================================

// 转义HTML特殊字符（防XSS）
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, char => map[char])
}

// 提取 @提及 的用户名
export function extractMentions(content: string): string[] {
  const regex = /@([a-zA-Z0-9_]+)/g
  const matches = content.matchAll(regex)
  return Array.from(matches, match => match[1])
}

// ==========================================
// 统计相关
// ==========================================

// 计算帖子热度分数
export function calculateHotScore(
  viewCount: number,
  likeCount: number,
  commentCount: number,
  ageInHours: number
): number {
  // 热度算法：(浏览 * 0.1 + 点赞 * 2 + 评论 * 3) / (时间 + 2)^1.5
  const score = (viewCount * 0.1 + likeCount * 2 + commentCount * 3)
  const timeFactor = Math.pow(ageInHours + 2, 1.5)
  return score / timeFactor
}

// 计算帖子年龄（小时）
export function calculatePostAge(createdAt: string | Date): number {
  const now = new Date()
  const created = new Date(createdAt)
  const diffMs = now.getTime() - created.getTime()
  return diffMs / (1000 * 60 * 60)
}
