// src/app/api/user/avatar/route.ts
// 用户头像上传 - 匹配当前schema

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

/**
 * POST /api/user/avatar
 * 上传用户头像
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
      );
    }

    // 2. 解析表单数据
    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
      );
    }

    // 3. 验证文件类型
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
          { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" },
          { status: 400 }
      );
    }

    // 4. 验证文件大小（5MB限制）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
          { error: "File too large. Maximum size is 5MB" },
          { status: 400 }
      );
    }

    // 5. 创建上传目录
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 6. 生成文件名（用户ID + 时间戳 + 扩展名）
    const ext = path.extname(file.name);
    const fileName = `${session.user.id}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    // 7. 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 8. 更新数据库中的头像URL
    const avatarUrl = `/uploads/avatars/${fileName}`;

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        avatarUrl: avatarUrl,  // ✅ 使用正确的字段名
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
    });

    // 9. 返回成功响应
    return NextResponse.json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar: avatarUrl,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        avatar: updatedUser.avatarUrl,  // ✅ 返回时使用统一名称
      },
    });

  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
        { error: "Failed to upload avatar" },
        { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/avatar
 * 删除用户头像（恢复为默认头像）
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
      );
    }

    // 2. 更新数据库（设为null使用默认头像）
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        avatarUrl: null,  // ✅ 使用正确的字段名
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
    });

    // 3. 返回成功响应
    return NextResponse.json({
      success: true,
      message: "Avatar removed successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        avatar: updatedUser.avatarUrl,
      },
    });

  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
        { error: "Failed to remove avatar" },
        { status: 500 }
    );
  }
}