// src/app/api/user/profile/route.ts
// 用户资料API - 获取和更新

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// 定义资料更新的验证Schema
const updateProfileSchema = z.object({
  // 基础信息（可选）
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional().nullable(),
  
  // 留学信息（可选）
  country: z.string().max(50).optional().nullable(),
  city: z.string().max(50).optional().nullable(),
  currentSchool: z.string().max(100).optional().nullable(),
  major: z.string().max(100).optional().nullable(),
  degree: z.enum(["BACHELOR", "MASTER", "PHD", "OTHER"]).optional().nullable(),
  graduationYear: z.number().int().min(2000).max(2050).optional().nullable(),
  
  // 联系方式（可选）
  wechat: z.string().max(50).optional().nullable(),
  qq: z.string().max(20).optional().nullable(),
  instagram: z.string().max(50).optional().nullable(),
  linkedin: z.string().max(100).optional().nullable(),
  github: z.string().max(50).optional().nullable(),
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
    const user = await prisma.user.findUnique({
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
        avatar: true,
        bio: true,
        
        // 二中身份
        qdezEnrollmentYear: true,
        qdezClass: true,
        
        // 留学信息
        country: true,
        city: true,
        currentSchool: true,
        major: true,
        degree: true,
        graduationYear: true,
        
        // 联系方式
        wechat: true,
        qq: true,
        instagram: true,
        linkedin: true,
        github: true,
        personalWebsite: true,
        
        // 隐私设置
        profileVisibility: true,
        contactVisibility: true,
        locationVisibility: true,
        
        // 系统信息
        role: true,
        points: true,
        availableInvites: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        
        // 统计信息
        _count: {
          select: {
            posts: true,
            comments: true,
            questions: true,
            answers: true,
            resources: true,
            events: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 3. 返回用户资料
    return NextResponse.json({
      success: true,
      user: {
        ...user,
        stats: {
          posts: user._count.posts,
          comments: user._count.comments,
          questions: user._count.questions,
          answers: user._count.answers,
          resources: user._count.resources,
          events: user._count.events,
        },
        _count: undefined, // 移除原始计数对象
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
        avatar: true,
        bio: true,
        qdezEnrollmentYear: true,
        qdezClass: true,
        country: true,
        city: true,
        currentSchool: true,
        major: true,
        degree: true,
        graduationYear: true,
        wechat: true,
        qq: true,
        instagram: true,
        linkedin: true,
        github: true,
        personalWebsite: true,
        updatedAt: true,
      },
    });

    // 5. 返回更新后的用户信息
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
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
