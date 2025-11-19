import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 检查用户名/邮箱是否可用 API
 * POST /api/auth/check-availability
 *
 * 请求体:
 * { "username": "zhangsan" }
 * 或
 * { "email": "zhangsan@example.com" }
 *
 * 响应:
 * { field: "username", available: true/false }
 */
export async function POST(request: NextRequest) {
    try {
        const { username, email } = await request.json();

        // 检查用户名
        if (username) {
            const existingUser = await prisma.user.findUnique({
                where: { username },
            });

            return NextResponse.json({
                field: 'username',
                available: !existingUser,
                message: existingUser ? 'Username already taken' : 'Username available',
            });
        }

        // 检查邮箱
        if (email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            return NextResponse.json({
                field: 'email',
                available: !existingUser,
                message: existingUser ? 'Email already registered' : 'Email available',
            });
        }

        // 如果没有提供用户名或邮箱
        return NextResponse.json(
            { error: 'Username or email required' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error checking availability:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}