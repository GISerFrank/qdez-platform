// src/app/api/forum/search/route.ts
// 搜索帖子 API

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { searchQuerySchema } from '@/lib/forum/validation'
import {
  calculateOffset,
  generatePaginationMeta,
  getAuthorSelect,
} from '@/lib/forum/utils'

/**
 * GET /api/forum/search
 * 搜索帖子
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 解析查询参数
    const { searchParams } = new URL(request.url)
    const queryResult = searchQuerySchema.safeParse({
      q: searchParams.get('q') || '',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    })

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: queryResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { q, page, limit } = queryResult.data

    // 2. 构建搜索条件
    const where = {
      status: 'PUBLISHED' as const,
      OR: [
        {
          title: {
            contains: q,
            mode: 'insensitive' as const, // 不区分大小写
          },
        },
        {
          content: {
            contains: q,
            mode: 'insensitive' as const,
          },
        },
      ],
    }

    // 3. 查询总数
    const total = await prisma.post.count({ where })

    // 4. 查询帖子列表
    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        authorId: true,
        author: {
          select: getAuthorSelect(),
        },
        viewCount: true,
        likeCount: true,
        commentCount: true,
        isPinned: true,
        isFeatured: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }, // 搜索结果按时间排序
      ],
      skip: calculateOffset(page, limit),
      take: limit,
    })

    // 5. 格式化数据
    const formattedPosts = posts.map(post => ({
      ...post,
      tags: post.tags.map(t => t.tag.name),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }))

    // 6. 生成分页元数据
    const paginationMeta = generatePaginationMeta(total, page, limit)

    // 7. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        posts: formattedPosts,
        ...paginationMeta,
        query: q, // 返回搜索关键词
      },
    })
  } catch (error) {
    console.error('Search posts error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
