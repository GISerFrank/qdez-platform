// src/app/api/user/privacy/route.ts
// 用户隐私设置管理 - 匹配当前schema

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// 定义隐私设置的验证Schema（匹配你的JSON结构）
const privacySettingsSchema = z.object({
  profilePublic: z.boolean().optional(),
  locationPublic: z.boolean().optional(),
  contactPublic: z.boolean().optional(),
  searchable: z.boolean().optional(),
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
        privacySettings: true,  // ✅ 使用正确的字段名（JSON类型）
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
      privacy: user.privacySettings || {
        profilePublic: true,
        locationPublic: true,
        contactPublic: false,
        searchable: true,
      },
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

    const newSettings = validationResult.data;

    // 4. 获取当前设置
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { privacySettings: true },
    });

    if (!currentUser) {
      return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
      );
    }

    // 5. 合并旧设置和新设置
    const currentSettings = currentUser.privacySettings as Record<string, any> || {
      profilePublic: true,
      locationPublic: true,
      contactPublic: false,
      searchable: true,
    };

    const mergedSettings = {
      ...currentSettings,
      ...newSettings,
    };

    // 6. 更新数据库
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        privacySettings: mergedSettings,  // ✅ 直接保存JSON对象
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        privacySettings: true,
        updatedAt: true,
      },
    });

    // 7. 返回更新后的隐私设置
    return NextResponse.json({
      success: true,
      message: "Privacy settings updated successfully",
      privacy: updatedUser.privacySettings,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        updatedAt: updatedUser.updatedAt,
      },
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