// src/app/api/forum/categories/route.ts
// 分类列表 API

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { POST_CATEGORIES } from '@/lib/forum/utils'

/**
 * GET /api/forum/categories
 * 获取所有分类及其帖子数量
 */
export async function GET() {
  try {
    // 1. 统计各分类的帖子数量
    const categoryCounts = await prisma.post.groupBy({
      by: ['category'],
      where: {
        status: 'PUBLISHED',
      },
      _count: {
        _all: true,
      },
    })

    // 2. 转换为 Map 方便查找
    const countMap = new Map(
      categoryCounts.map(item => [item.category, item._count._all])
    )

    // 3. 生成分类列表
    const categories = Object.entries(POST_CATEGORIES).map(([value, { label, icon }]) => ({
      value,
      label,
      icon,
      count: countMap.get(value) || 0,
    }))

    // 4. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        categories,
      },
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
