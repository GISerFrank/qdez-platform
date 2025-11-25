// src/lib/network/validation.ts
// 校友网络API的Zod验证schemas

import { z } from 'zod'

// ==========================================
// 校友列表查询参数
// ==========================================

export const alumniListQuerySchema = z.object({
  country: z.string().optional(),
  city: z.string().optional(),
  school: z.string().optional(),
  major: z.string().optional(),
  qdezClass: z.string().optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(1000))
    .optional()
    .default('500'),
})

export type AlumniListQuery = z.infer<typeof alumniListQuerySchema>

// ==========================================
// 关系网络查询参数
// ==========================================

export const graphQuerySchema = z.object({
  type: z
    .enum(['major', 'school', 'city', 'all'])
    .optional()
    .default('all'),
})

export type GraphQuery = z.infer<typeof graphQuerySchema>

// ==========================================
// 搜索查询参数
// ==========================================

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(100).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  school: z.string().optional(),
  major: z.string().optional(),
  qdezClass: z.string().optional(),
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1))
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(50))
    .optional()
    .default('20'),
})

export type SearchQuery = z.infer<typeof searchQuerySchema>

// ==========================================
// ID参数验证
// ==========================================

export const idParamSchema = z.object({
  id: z.string().cuid('Invalid user ID'),
})

export type IdParam = z.infer<typeof idParamSchema>

// ==========================================
// 工具函数：从URLSearchParams解析查询参数
// ==========================================

export function parseAlumniListQuery(searchParams: URLSearchParams): AlumniListQuery {
  return alumniListQuerySchema.parse({
    country: searchParams.get('country') || undefined,
    city: searchParams.get('city') || undefined,
    school: searchParams.get('school') || undefined,
    major: searchParams.get('major') || undefined,
    qdezClass: searchParams.get('qdezClass') || undefined,
    limit: searchParams.get('limit') || '500',
  })
}

export function parseGraphQuery(searchParams: URLSearchParams): GraphQuery {
  return graphQuerySchema.parse({
    type: searchParams.get('type') || 'all',
  })
}

export function parseSearchQuery(searchParams: URLSearchParams): SearchQuery {
  return searchQuerySchema.parse({
    q: searchParams.get('q') || undefined,
    country: searchParams.get('country') || undefined,
    city: searchParams.get('city') || undefined,
    school: searchParams.get('school') || undefined,
    major: searchParams.get('major') || undefined,
    qdezClass: searchParams.get('qdezClass') || undefined,
    page: searchParams.get('page') || '1',
    limit: searchParams.get('limit') || '20',
  })
}
