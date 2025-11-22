// src/app/api/user/privacy/route.ts
// 用户隐私设置管理

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// 定义隐私设置的验证Schema
const privacySettingsSchema = z.object({
  profileVisibility: z.enum(["PUBLIC", "ALUMNI_ONLY", "PRIVATE"]).optional(),
  contactVisibility: z.enum(["PUBLIC", "ALUMNI_ONLY", "PRIVATE"]).optional(),
  locationVisibility: z.enum(["PUBLIC", "ALUMNI_ONLY", "PRIVATE"]).optional(),
});

/**
 * GET /api/user/privacy
 * 获取当前用户的隐私设置
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

    // 2. 从数据库获取隐私设置
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        profileVisibility: true,
        contactVisibility: true,
        locationVisibility: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 3. 返回隐私设置
    return NextResponse.json({
      success: true,
      privacy: user,
    });

  } catch (error) {
    console.error("Get privacy settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/privacy
 * 更新用户的隐私设置
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
    const validationResult = privacySettingsSchema.safeParse(body);
    
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

    // 4. 至少需要更新一个字段
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No privacy settings provided" },
        { status: 400 }
      );
    }

    // 5. 更新数据库
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
        profileVisibility: true,
        contactVisibility: true,
        locationVisibility: true,
        updatedAt: true,
      },
    });

    // 6. 返回更新后的隐私设置
    return NextResponse.json({
      success: true,
      message: "Privacy settings updated successfully",
      privacy: {
        profileVisibility: updatedUser.profileVisibility,
        contactVisibility: updatedUser.contactVisibility,
        locationVisibility: updatedUser.locationVisibility,
      },
      user: updatedUser,
    });

  } catch (error) {
    console.error("Update privacy settings error:", error);
    
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
