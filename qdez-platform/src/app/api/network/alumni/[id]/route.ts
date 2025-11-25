// src/app/api/network/alumni/[id]/route.ts
// 获取单个校友详情API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isLocationPublic, isContactPublic, isProfilePublic } from '@/lib/network/utils'

/**
 * GET /api/network/alumni/[id]
 * 获取单个校友详情（尊重隐私设置）
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 验证ID格式
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
          { success: false, error: 'Invalid user ID' },
          { status: 400 }
      )
    }

    // 获取当前登录用户
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id

    // 查询用户
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        // 二中信息
        qdezClass: true,
        qdezEnrollmentYear: true,
        qdezGraduationYear: true,
        // 教育信息
        currentSchool: true,
        major: true,
        degree: true,
        enrollmentYear: true,
        expectedGradYear: true,
        // 位置信息
        city: true,
        country: true,
        // 联系方式
        wechat: true,
        linkedin: true,
        instagram: true,
        github: true,
        personalWebsite: true,
        // 隐私设置
        privacySettings: true,
        // 统计
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
      )
    }

    // 判断是否是本人
    const isSelf = currentUserId === user.id

    // 构建响应数据（根据隐私设置过滤）
    const response: any = {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      avatar: user.avatarUrl,
      bio: user.bio,
      // 二中信息（始终公开）
      qdezClass: user.qdezClass,
      qdezEnrollmentYear: user.qdezEnrollmentYear,
      qdezGraduationYear: user.qdezGraduationYear,
      // 统计（始终公开）
      stats: {
        posts: user._count.posts,
        comments: user._count.comments,
        questions: 0,
        answers: 0,
      },
    }

    // 位置信息（根据隐私设置）
    if (isSelf || isLocationPublic(user.privacySettings)) {
      response.location = {
        city: user.city,
        country: user.country,
      }
    }

    // 教育信息（根据隐私设置）
    if (isSelf || isProfilePublic(user.privacySettings)) {
      response.education = {
        school: user.currentSchool,
        major: user.major,
        degree: user.degree,
        enrollmentYear: user.enrollmentYear,
        expectedGradYear: user.expectedGradYear,
      }
    }

    // 联系方式（根据隐私设置）
    if (isSelf || isContactPublic(user.privacySettings)) {
      response.contact = {
        wechat: user.wechat,
        linkedin: user.linkedin,
        instagram: user.instagram,
        github: user.github,
        personalWebsite: user.personalWebsite,
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user: response,
        isSelf,
      },
    })

  } catch (error) {
    console.error('Get alumni detail error:', error)
    return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
    )
  }
}