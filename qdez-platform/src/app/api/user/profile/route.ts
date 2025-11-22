// src/app/api/user/profile/route.ts
// 用户资料API - 完全匹配当前schema

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// 定义资料更新的验证Schema
const updateProfileSchema = z.object({
  // 基础信息（可选）
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(5000).optional().nullable(),

  // 留学信息（可选）
  country: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  currentSchool: z.string().max(200).optional().nullable(),
  major: z.string().max(100).optional().nullable(),
  degree: z.string().max(50).optional().nullable(),
  enrollmentYear: z.number().int().min(2000).max(2050).optional().nullable(),
  expectedGradYear: z.number().int().min(2000).max(2050).optional().nullable(),

  // 地理位置（可选）
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),

  // 联系方式（可选）
  wechat: z.string().max(100).optional().nullable(),
  linkedin: z.string().max(200).optional().nullable(),
  instagram: z.string().max(200).optional().nullable(),
  github: z.string().max(200).optional().nullable(),
  personalWebsite: z.string().url().max(200).optional().nullable(),
});

/**
 * GET /api/user/profile
 * 获取当前登录用户的完整资料
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
      );
    }

    // 2. 从数据库获取用户完整信息
    const userData = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        // 基础信息
        id: true,
        username: true,
        email: true,
        name: true,
        displayName: true,
        avatarUrl: true,  // ✅ 使用正确的字段名
        bio: true,

        // 二中身份
        qdezEnrollmentYear: true,
        qdezGraduationYear: true,
        qdezClass: true,

        // 留学信息
        currentSchool: true,
        major: true,
        degree: true,
        enrollmentYear: true,
        expectedGradYear: true,

        // 地理位置
        country: true,
        city: true,
        location: true,
        latitude: true,
        longitude: true,

        // 联系方式
        wechat: true,
        linkedin: true,
        instagram: true,
        github: true,
        personalWebsite: true,

        // 隐私设置
        privacySettings: true,

        // 系统信息
        role: true,
        status: true,
        points: true,
        availableInvites: true,
        isVerified: true,
        verifiedAt: true,
        emailVerified: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,

        // ❌ 暂时不查询统计数据，因为关联表还未创建
        // _count: {
        //   select: {
        //     posts: true,
        //     comments: true,
        //   },
        // },
      },
    });

    if (!userData) {
      return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
      );
    }

    // 3. 返回用户资料
    return NextResponse.json({
      success: true,
      user: {
        // 基础信息
        id: userData.id,
        username: userData.username,
        email: userData.email,
        name: userData.name,
        displayName: userData.displayName,
        avatar: userData.avatarUrl,  // ✅ 返回时使用统一的字段名
        bio: userData.bio,

        // 二中身份
        qdezEnrollmentYear: userData.qdezEnrollmentYear,
        qdezGraduationYear: userData.qdezGraduationYear,
        qdezClass: userData.qdezClass,

        // 留学信息
        currentSchool: userData.currentSchool,
        major: userData.major,
        degree: userData.degree,
        enrollmentYear: userData.enrollmentYear,
        expectedGradYear: userData.expectedGradYear,

        // 地理位置
        country: userData.country,
        city: userData.city,
        location: userData.location,
        latitude: userData.latitude,
        longitude: userData.longitude,

        // 联系方式
        wechat: userData.wechat,
        linkedin: userData.linkedin,
        instagram: userData.instagram,
        github: userData.github,
        personalWebsite: userData.personalWebsite,

        // 隐私设置
        privacySettings: userData.privacySettings,

        // 系统信息
        role: userData.role,
        status: userData.status,
        points: userData.points,
        availableInvites: userData.availableInvites,
        isVerified: userData.isVerified,
        verifiedAt: userData.verifiedAt,
        emailVerified: userData.emailVerified,
        emailVerifiedAt: userData.emailVerifiedAt,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        lastLoginAt: userData.lastLoginAt,

        // ✅ 暂时返回占位统计数据
        stats: {
          posts: 0,
          comments: 0,
          questions: 0,
          answers: 0,
          resources: 0,
          events: 0,
        },
      },
    });

  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * 更新当前用户的资料
 */
export async function PUT(request: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
      );
    }

    // 2. 解析请求体
    const body = await request.json();

    // 3. 验证数据
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
          {
            error: "Validation failed",
            details: validationResult.error.errors,
          },
          { status: 400 }
      );
    }

    const data = validationResult.data;

    // 4. 更新数据库
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        qdezEnrollmentYear: true,
        qdezGraduationYear: true,
        qdezClass: true,
        country: true,
        city: true,
        location: true,
        latitude: true,
        longitude: true,
        currentSchool: true,
        major: true,
        degree: true,
        enrollmentYear: true,
        expectedGradYear: true,
        wechat: true,
        linkedin: true,
        instagram: true,
        github: true,
        personalWebsite: true,
        updatedAt: true,
      },
    });

    // 5. 返回更新后的用户信息
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        ...updatedUser,
        avatar: updatedUser.avatarUrl, // ✅ 统一字段名
      },
    });

  } catch (error) {
    console.error("Update profile error:", error);

    // Prisma错误处理
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
      );
    }

    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
    );
  }
}