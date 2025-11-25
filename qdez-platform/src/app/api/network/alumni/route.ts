// src/app/api/network/alumni/route.ts
// 获取校友位置列表API（用于地图展示）

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { parseAlumniListQuery } from '@/lib/network/validation'
import { enrichUserCoordinates, isValidCoordinates } from '@/lib/network/geocode'
import { isLocationPublic } from '@/lib/network/utils'
import { AlumniMapData } from '@/types/network'

/**
 * GET /api/network/alumni
 * 获取位置公开的校友列表（用于地图展示）
 * 
 * Query参数：
 * - country: 按国家筛选
 * - city: 按城市筛选
 * - school: 按学校筛选
 * - major: 按专业筛选
 * - qdezClass: 按班级筛选
 * - limit: 限制数量，默认500
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 解析查询参数
    const { searchParams } = new URL(request.url)
    
    let query
    try {
      query = parseAlumniListQuery(searchParams)
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

    // 筛选条件
    if (query.country) {
      where.country = {
        contains: query.country,
        mode: 'insensitive',
      }
    }

    if (query.city) {
      where.city = {
        contains: query.city,
        mode: 'insensitive',
      }
    }

    if (query.school) {
      where.currentSchool = {
        contains: query.school,
        mode: 'insensitive',
      }
    }

    if (query.major) {
      where.major = {
        contains: query.major,
        mode: 'insensitive',
      }
    }

    if (query.qdezClass) {
      where.qdezClass = {
        contains: query.qdezClass,
        mode: 'insensitive',
      }
    }

    // 3. 查询数据库
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        displayName: true,
        avatarUrl: true,
        city: true,
        country: true,
        latitude: true,
        longitude: true,
        currentSchool: true,
        major: true,
        qdezClass: true,
        qdezEnrollmentYear: true,
        privacySettings: true,
      },
      take: query.limit,
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 4. 过滤并转换数据
    const alumni: AlumniMapData[] = []

    for (const user of users) {
      // 检查位置是否公开
      if (!isLocationPublic(user.privacySettings)) {
        continue
      }

      // 需要有城市或国家信息才能显示在地图上
      if (!user.city && !user.country) {
        continue
      }

      // 转换坐标
      const enriched = enrichUserCoordinates(user)

      // 验证坐标有效性
      if (!isValidCoordinates(enriched.lat, enriched.lng)) {
        continue
      }

      alumni.push({
        id: user.id,
        name: user.name,
        displayName: user.displayName,
        avatar: user.avatarUrl,
        lat: enriched.lat!,
        lng: enriched.lng!,
        city: user.city,
        country: user.country,
        school: user.currentSchool,
        major: user.major,
        qdezClass: user.qdezClass,
        qdezEnrollmentYear: user.qdezEnrollmentYear,
      })
    }

    // 5. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        alumni,
        total: alumni.length,
      },
    })

  } catch (error) {
    console.error('Get alumni list error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
