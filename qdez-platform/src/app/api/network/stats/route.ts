// src/app/api/network/stats/route.ts
// 网络统计数据API

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { isLocationPublic } from '@/lib/network/utils'
import { DistributionItem, NetworkStats } from '@/types/network'

/**
 * GET /api/network/stats
 * 获取校友网络统计数据
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 查询所有活跃用户
    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        country: true,
        city: true,
        currentSchool: true,
        major: true,
        qdezClass: true,
        privacySettings: true,
      },
    })

    // 2. 过滤位置公开的用户（用于地理分布统计）
    const publicUsers = users.filter(user => isLocationPublic(user.privacySettings))

    // 3. 统计各维度分布
    const countryMap = new Map<string, number>()
    const cityMap = new Map<string, number>()
    const schoolMap = new Map<string, number>()
    const majorMap = new Map<string, number>()
    const classMap = new Map<string, number>()

    // 国家和城市统计（只统计位置公开的）
    publicUsers.forEach(user => {
      if (user.country) {
        countryMap.set(user.country, (countryMap.get(user.country) || 0) + 1)
      }
      if (user.city) {
        cityMap.set(user.city, (cityMap.get(user.city) || 0) + 1)
      }
    })

    // 学校、专业、班级统计（所有用户）
    users.forEach(user => {
      if (user.currentSchool) {
        schoolMap.set(user.currentSchool, (schoolMap.get(user.currentSchool) || 0) + 1)
      }
      if (user.major) {
        majorMap.set(user.major, (majorMap.get(user.major) || 0) + 1)
      }
      if (user.qdezClass) {
        classMap.set(user.qdezClass, (classMap.get(user.qdezClass) || 0) + 1)
      }
    })

    // 4. 转换为数组并排序
    const toSortedArray = (map: Map<string, number>, total: number): DistributionItem[] => {
      return Array.from(map.entries())
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / total) * 100 * 10) / 10,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20) // 只返回前20个
    }

    const totalAlumni = users.length

    const stats: NetworkStats = {
      totalAlumni,
      byCountry: toSortedArray(countryMap, publicUsers.length),
      byCity: toSortedArray(cityMap, publicUsers.length),
      bySchool: toSortedArray(schoolMap, totalAlumni),
      byMajor: toSortedArray(majorMap, totalAlumni),
      byQdezClass: toSortedArray(classMap, totalAlumni),
    }

    // 5. 返回响应
    return NextResponse.json({
      success: true,
      data: stats,
    })

  } catch (error) {
    console.error('Get network stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
