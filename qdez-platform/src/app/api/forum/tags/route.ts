// src/app/api/forum/tags/route.ts
// 标签列表 API

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { tagQuerySchema } from '@/lib/forum/validation'

/**
 * GET /api/forum/tags
 * 获取标签列表
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 解析查询参数
    const { searchParams } = new URL(request.url)
    const queryResult = tagQuerySchema.safeParse({
      popular: searchParams.get('popular'),
      limit: searchParams.get('limit'),
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

    const { popular, limit } = queryResult.data

    // 2. 构建查询
    const query: any = {
      orderBy: {
        useCount: 'desc', // 按使用次数降序
      },
    }

    if (limit) {
      query.take = limit
    }

    if (popular) {
      // 只返回使用次数 > 0 的标签
      query.where = {
        useCount: {
          gt: 0,
        },
      }
    }

    // 3. 查询标签
    const tags = await prisma.tag.findMany(query)

    // 4. 格式化数据
    const formattedTags = tags.map(tag => ({
      ...tag,
      createdAt: tag.createdAt.toISOString(),
    }))

    // 5. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        tags: formattedTags,
      },
    })
  } catch (error) {
    console.error('Get tags error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
