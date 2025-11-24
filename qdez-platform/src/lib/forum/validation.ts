// src/lib/forum/validation.ts
// 论坛系统的 Zod 验证 schemas

import { z } from 'zod'
import { PostStatus } from '@prisma/client'

// ==========================================
// 帖子验证
// ==========================================

// 创建帖子验证
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(200, '标题最多200字符')
    .trim(),
  
  content: z
    .string()
    .min(1, '内容不能为空')
    .max(50000, '内容最多50000字符'),
  
  category: z
    .string()
    .min(1, '请选择分类'),
  
  tags: z
    .array(z.string().max(50, '标签名称最多50字符'))
    .max(5, '最多添加5个标签')
    .optional()
    .default([]),
})

export type CreatePostInput = z.infer<typeof createPostSchema>

// 更新帖子验证
export const updatePostSchema = z.object({
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(200, '标题最多200字符')
    .trim()
    .optional(),
  
  content: z
    .string()
    .min(1, '内容不能为空')
    .max(50000, '内容最多50000字符')
    .optional(),
  
  category: z
    .string()
    .min(1, '请选择分类')
    .optional(),
  
  tags: z
    .array(z.string().max(50))
    .max(5, '最多添加5个标签')
    .optional(),
})

export type UpdatePostInput = z.infer<typeof updatePostSchema>

// 帖子状态更新验证（管理员功能）
export const updatePostStatusSchema = z.object({
  isPinned: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  status: z.nativeEnum(PostStatus).optional(),
})

export type UpdatePostStatusInput = z.infer<typeof updatePostStatusSchema>

// ==========================================
// 评论验证
// ==========================================

// 创建评论验证
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, '评论内容不能为空')
    .max(2000, '评论最多2000字符')
    .trim(),
  
  parentId: z
    .string()
    .cuid('无效的评论ID')
    .optional(),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>

// 更新评论验证
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, '评论内容不能为空')
    .max(2000, '评论最多2000字符')
    .trim(),
})

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>

// ==========================================
// 查询参数验证
// ==========================================

// 帖子列表查询参数验证
export const postListQuerySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1))
    .default('1'),
  
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(50))
    .default('20'),
  
  category: z
    .string()
    .optional(),
  
  sort: z
    .enum(['latest', 'hot', 'mostCommented', 'mostLiked'])
    .default('latest'),
  
  tag: z
    .string()
    .optional(),
})

export type PostListQuery = z.infer<typeof postListQuerySchema>

// 评论列表查询参数验证
export const commentListQuerySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1))
    .default('1'),
  
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .default('50'),
  
  sort: z
    .enum(['latest', 'mostLiked'])
    .default('latest'),
})

export type CommentListQuery = z.infer<typeof commentListQuerySchema>

// 搜索查询参数验证
export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, '搜索关键词不能为空')
    .max(100, '搜索关键词最多100字符'),
  
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1))
    .default('1'),
  
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(50))
    .default('20'),
})

export type SearchQuery = z.infer<typeof searchQuerySchema>

// 标签查询参数验证
export const tagQuerySchema = z.object({
  popular: z
    .string()
    .transform(val => val === 'true')
    .pipe(z.boolean())
    .optional(),
  
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(50))
    .optional(),
})

export type TagQuery = z.infer<typeof tagQuerySchema>

// ==========================================
// ID 参数验证
// ==========================================

// 验证帖子/评论 ID
export const idParamSchema = z.object({
  id: z.string().cuid('无效的ID格式'),
})

export type IdParam = z.infer<typeof idParamSchema>

// ==========================================
// 批量操作验证
// ==========================================

// 批量删除
export const batchDeleteSchema = z.object({
  ids: z
    .array(z.string().cuid())
    .min(1, '至少选择一项')
    .max(50, '最多一次删除50项'),
})

export type BatchDeleteInput = z.infer<typeof batchDeleteSchema>
