// src/types/forum.ts
// 论坛系统相关的 TypeScript 类型定义

import { PostStatus } from '@prisma/client'

// ==========================================
// 基础类型
// ==========================================

export type { PostStatus }

// 帖子分类
export type PostCategory = 
  | 'study'        // 学习交流
  | 'life'         // 生活分享
  | 'career'       // 求职招聘
  | 'visa'         // 签证问题
  | 'housing'      // 租房信息
  | 'travel'       // 旅游攻略
  | 'other'        // 其他

// 排序方式
export type PostSortBy = 
  | 'latest'           // 最新
  | 'hot'              // 最热
  | 'mostCommented'    // 最多评论
  | 'mostLiked'        // 最多点赞

// 评论排序方式
export type CommentSortBy =
  | 'latest'           // 最新
  | 'mostLiked'        // 最多点赞

// ==========================================
// 帖子相关类型
// ==========================================

// 帖子作者信息（精简版）
export interface PostAuthor {
  id: string
  username: string
  name: string
  displayName: string | null
  avatarUrl: string | null
  currentSchool: string | null
  major: string | null
}

// 帖子基本信息（列表页使用）
export interface PostListItem {
  id: string
  title: string
  content: string  // 摘要/前100字
  category: string
  authorId: string
  author: PostAuthor
  viewCount: number
  likeCount: number
  commentCount: number
  isPinned: boolean
  isFeatured: boolean
  status: PostStatus
  createdAt: string
  updatedAt: string
  tags?: string[]  // 标签名称数组
}

// 帖子完整信息（详情页使用）
export interface PostDetail extends PostListItem {
  content: string  // 完整内容
  isLiked?: boolean      // 当前用户是否点赞
  isBookmarked?: boolean // 当前用户是否收藏
}

// 创建帖子的数据
export interface CreatePostData {
  title: string
  content: string
  category: PostCategory | string
  tags?: string[]  // 标签名称数组
}

// 更新帖子的数据
export interface UpdatePostData {
  title?: string
  content?: string
  category?: PostCategory | string
  tags?: string[]
}

// ==========================================
// 评论相关类型
// ==========================================

// 评论作者信息（精简版）
export interface CommentAuthor {
  id: string
  username: string
  name: string
  displayName: string | null
  avatarUrl: string | null
}

// 评论基本信息
export interface CommentItem {
  id: string
  content: string
  postId: string
  authorId: string
  author: CommentAuthor
  parentId: string | null
  likeCount: number
  createdAt: string
  updatedAt: string
  isLiked?: boolean  // 当前用户是否点赞
  replies?: CommentItem[]  // 回复列表（嵌套）
}

// 创建评论的数据
export interface CreateCommentData {
  content: string
  parentId?: string  // 回复评论时提供
}

// 更新评论的数据
export interface UpdateCommentData {
  content: string
}

// ==========================================
// 标签相关类型
// ==========================================

// 标签信息
export interface Tag {
  id: string
  name: string
  description: string | null
  useCount: number
  createdAt: string
}

// ==========================================
// API 响应类型
// ==========================================

// 帖子列表响应
export interface PostListResponse {
  success: true
  data: {
    posts: PostListItem[]
    total: number
    page: number
    totalPages: number
    hasMore: boolean
  }
}

// 帖子详情响应
export interface PostDetailResponse {
  success: true
  data: {
    post: PostDetail
  }
}

// 创建/更新帖子响应
export interface PostMutationResponse {
  success: true
  data: {
    post: PostDetail
  }
}

// 删除帖子响应
export interface DeletePostResponse {
  success: true
  message: string
}

// 点赞响应
export interface LikeResponse {
  success: true
  data: {
    liked: boolean      // 当前状态
    likeCount: number   // 总点赞数
  }
}

// 评论列表响应
export interface CommentListResponse {
  success: true
  data: {
    comments: CommentItem[]
    total: number
  }
}

// 创建/更新评论响应
export interface CommentMutationResponse {
  success: true
  data: {
    comment: CommentItem
  }
}

// 删除评论响应
export interface DeleteCommentResponse {
  success: true
  message: string
}

// 分类列表响应
export interface CategoryListResponse {
  success: true
  data: {
    categories: CategoryInfo[]
  }
}

// 分类信息
export interface CategoryInfo {
  value: PostCategory | string
  label: string
  count: number
}

// 标签列表响应
export interface TagListResponse {
  success: true
  data: {
    tags: Tag[]
  }
}

// 搜索响应
export interface SearchResponse {
  success: true
  data: {
    posts: PostListItem[]
    total: number
    page: number
    totalPages: number
  }
}

// 错误响应
export interface ErrorResponse {
  success: false
  error: string
  details?: any
}

// ==========================================
// 请求参数类型
// ==========================================

// 帖子列表查询参数
export interface PostListQuery {
  page?: number
  limit?: number
  category?: PostCategory | string
  sort?: PostSortBy
  tag?: string
}

// 评论列表查询参数
export interface CommentListQuery {
  page?: number
  limit?: number
  sort?: CommentSortBy
}

// 搜索查询参数
export interface SearchQuery {
  q: string
  page?: number
  limit?: number
}

// 标签查询参数
export interface TagQuery {
  popular?: boolean
  limit?: number
}

// ==========================================
// 表单状态类型
// ==========================================

// 帖子表单状态
export interface PostFormState {
  title: string
  content: string
  category: PostCategory | string
  tags: string[]
}

// 评论表单状态
export interface CommentFormState {
  content: string
  parentId?: string
}

// ==========================================
// 前端状态类型
// ==========================================

// 帖子列表状态
export interface PostListState {
  posts: PostListItem[]
  total: number
  page: number
  totalPages: number
  loading: boolean
  error: string | null
  hasMore: boolean
}

// 帖子详情状态
export interface PostDetailState {
  post: PostDetail | null
  loading: boolean
  error: string | null
}

// 评论列表状态
export interface CommentListState {
  comments: CommentItem[]
  total: number
  loading: boolean
  error: string | null
}

// ==========================================
// 工具类型
// ==========================================

// API 响应类型（联合类型）
export type ApiResponse<T = any> = 
  | (T & { success: true })
  | ErrorResponse

// 分页元数据
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}
