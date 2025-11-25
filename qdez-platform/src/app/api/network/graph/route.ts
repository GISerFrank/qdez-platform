// src/app/api/network/graph/route.ts
// 获取关系网络图数据API

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { parseGraphQuery } from '@/lib/network/validation'
import { isLocationPublic } from '@/lib/network/utils'
import {
  buildMajorGraph,
  buildSchoolGraph,
  buildCityGraph,
  buildAllGraph,
} from '@/lib/network/utils'
import { GraphNode, GraphLink } from '@/types/network'

/**
 * GET /api/network/graph
 * 获取关系网络图数据
 * 
 * Query参数：
 * - type: 'major' | 'school' | 'city' | 'all' (默认'all')
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 解析查询参数
    const { searchParams } = new URL(request.url)
    
    let query
    try {
      query = parseGraphQuery(searchParams)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters' },
        { status: 400 }
      )
    }

    // 2. 查询所有活跃用户（位置公开的）
    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        major: true,
        currentSchool: true,
        city: true,
        privacySettings: true,
      },
    })

    // 3. 过滤位置公开的用户
    const publicUsers = users.filter(user => isLocationPublic(user.privacySettings))

    // 4. 根据类型构建图数据
    let nodes: GraphNode[] = []
    let links: GraphLink[] = []

    switch (query.type) {
      case 'major':
        const majorGraph = buildMajorGraph(publicUsers)
        nodes = majorGraph.nodes
        links = majorGraph.links
        break

      case 'school':
        const schoolGraph = buildSchoolGraph(publicUsers)
        nodes = schoolGraph.nodes
        links = schoolGraph.links
        break

      case 'city':
        const cityGraph = buildCityGraph(publicUsers)
        nodes = cityGraph.nodes
        links = cityGraph.links
        break

      case 'all':
      default:
        const allGraph = buildAllGraph(publicUsers)
        nodes = allGraph.nodes
        links = allGraph.links
        break
    }

    // 5. 计算统计数据
    const uniqueMajors = new Set(publicUsers.map(u => u.major).filter(Boolean))
    const uniqueSchools = new Set(publicUsers.map(u => u.currentSchool).filter(Boolean))
    const uniqueCities = new Set(publicUsers.map(u => u.city).filter(Boolean))

    // 6. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        nodes,
        links,
        stats: {
          totalUsers: publicUsers.length,
          totalMajors: uniqueMajors.size,
          totalSchools: uniqueSchools.size,
          totalCities: uniqueCities.size,
        },
      },
    })

  } catch (error) {
    console.error('Get graph data error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
