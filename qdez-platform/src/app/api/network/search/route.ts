// src/app/api/network/search/route.ts
// 校友搜索API

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { parseSearchQuery } from '@/lib/network/validation'
import { calculateOffset, generatePaginationMeta, isLocationPublic } from '@/lib/network/utils'
import { SearchResultItem } from '@/types/network'

/**
 * GET /api/network/search
 * 搜索校友
 * 
 * Query参数：
 * - q: 搜索关键词（搜索姓名、学校、专业）
 * - country: 按国家筛选
 * - city: 按城市筛选
 * - school: 按学校筛选
 * - major: 按专业筛选
 * - qdezClass: 按班级筛选
 * - page: 页码，默认1
 * - limit: 每页数量，默认20
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 解析查询参数
    const { searchParams } = new URL(request.url)
    
    let query
    try {
      query = parseSearchQuery(searchParams)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters' },
        { status: 400 }
      )
    }

    // 2. 构建查询条件
    const where: any = {
      status: 'ACTIVE',
    }

    // 关键词搜索
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { displayName: { contains: query.q, mode: 'insensitive' } },
        { currentSchool: { contains: query.q, mode: 'insensitive' } },
        { major: { contains: query.q, mode: 'insensitive' } },
        { city: { contains: query.q, mode: 'insensitive' } },
        { qdezClass: { contains: query.q, mode: 'insensitive' } },
      ]
    }

    // 筛选条件
    if (query.country) {
      where.country = { contains: query.country, mode: 'insensitive' }
    }

    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' }
    }

    if (query.school) {
      where.currentSchool = { contains: query.school, mode: 'insensitive' }
    }

    if (query.major) {
      where.major = { contains: query.major, mode: 'insensitive' }
    }

    if (query.qdezClass) {
      where.qdezClass = { contains: query.qdezClass, mode: 'insensitive' }
    }

    // 3. 查询总数
    const total = await prisma.user.count({ where })

    // 4. 查询数据
    const offset = calculateOffset(query.page, query.limit)
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        displayName: true,
        avatarUrl: true,
        currentSchool: true,
        major: true,
        city: true,
        country: true,
        qdezClass: true,
        qdezEnrollmentYear: true,
        privacySettings: true,
      },
      skip: offset,
      take: query.limit,
      orderBy: [
        { qdezEnrollmentYear: 'desc' },
        { name: 'asc' },
      ],
    })

    // 5. 过滤并转换结果（只返回位置公开或可搜索的用户）
    const results: SearchResultItem[] = users
      .filter(user => {
        // 检查是否可搜索（默认可搜索）
        const settings = typeof user.privacySettings === 'string' 
          ? JSON.parse(user.privacySettings) 
          : user.privacySettings || {}
        return settings.searchable !== false
      })
      .map(user => ({
        id: user.id,
        name: user.name,
        displayName: user.displayName,
        avatar: user.avatarUrl,
        school: user.currentSchool,
        major: user.major,
        city: isLocationPublic(user.privacySettings) ? user.city : null,
        country: isLocationPublic(user.privacySettings) ? user.country : null,
        qdezClass: user.qdezClass,
        qdezEnrollmentYear: user.qdezEnrollmentYear,
      }))

    // 6. 生成分页信息
    const pagination = generatePaginationMeta(total, query.page, query.limit)

    // 7. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        results,
        ...pagination,
      },
    })

  } catch (error) {
    console.error('Search alumni error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
