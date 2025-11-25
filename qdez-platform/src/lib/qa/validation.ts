// src/lib/qa/validation.ts
// 问答系统的 Zod 验证 schemas

import { z } from 'zod'
import { PostStatus } from '@prisma/client'

// ==========================================
// 问题验证
// ==========================================

// 创建问题验证（复用 createPostSchema）
export const createQuestionSchema = z.object({
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

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>

// 更新问题验证（复用 updatePostSchema）
export const updateQuestionSchema = z.object({
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

export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>

// ==========================================
// 答案验证
// ==========================================

// 创建答案验证（复用 createCommentSchema，去掉 parentId）
export const createAnswerSchema = z.object({
  content: z
      .string()
      .min(1, '答案内容不能为空')
      .max(5000, '答案最多5000字符')
      .trim(),
})

export type CreateAnswerInput = z.infer<typeof createAnswerSchema>

// 更新答案验证
export const updateAnswerSchema = z.object({
  content: z
      .string()
      .min(1, '答案内容不能为空')
      .max(5000, '答案最多5000字符')
      .trim(),
})

export type UpdateAnswerInput = z.infer<typeof updateAnswerSchema>

// ==========================================
// 投票验证
// ==========================================

export const voteSchema = z.object({
  voteType: z.enum(['UPVOTE', 'DOWNVOTE']),
})

export type VoteInput = z.infer<typeof voteSchema>

// ==========================================
// 查询参数验证
// ==========================================

// 问题列表查询参数验证
export const questionListQuerySchema = z.object({
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
      .enum(['latest', 'hot', 'mostAnswered', 'unanswered'])
      .default('latest'),

  solved: z
      .string()
      .transform(val => val === 'true' ? true : val === 'false' ? false : undefined)
      .optional(),  // 🆕 筛选已解决/未解决

  tag: z
      .string()
      .optional(),
})

export type QuestionListQuery = z.infer<typeof questionListQuerySchema>

// 答案列表查询参数验证
export const answerListQuerySchema = z.object({
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
      .enum(['latest', 'votes'])  // 🆕 按投票数排序
      .default('votes'),
})

export type AnswerListQuery = z.infer<typeof answerListQuerySchema>

// ID参数验证
export const idParamSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
})

export type IdParam = z.infer<typeof idParamSchema>