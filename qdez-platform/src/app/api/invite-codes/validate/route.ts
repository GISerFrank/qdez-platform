import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 邀请码验证 API
 * POST /api/invite-codes/validate
 *
 * 请求体:
 * {
 *   "code": "QDEZ-2025-BOSTON3K"
 * }
 *
 * 响应:
 * 成功: { valid: true, inviteCode: {...} }
 * 失败: { valid: false, error: "错误信息" }
 */
export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();

        // 1. 检查邀请码是否提供
        if (!code) {
            return NextResponse.json(
                { valid: false, error: 'Invite code is required' },
                { status: 400 }
            );
        }

        // 2. 查询邀请码（包含生成者信息）
        const inviteCode = await prisma.inviteCode.findUnique({
            where: { code: code.toUpperCase() },
            include: {
                generator: {
                    select: {
                        username: true,
                        name: true,
                        currentSchool: true,
                    },
                },
            },
        });

        // 3. 检查邀请码是否存在
        if (!inviteCode) {
            return NextResponse.json({
                valid: false,
                error: 'Invalid invite code',
            });
        }

        // 4. 检查邀请码是否激活
        if (!inviteCode.isActive) {
            return NextResponse.json({
                valid: false,
                error: 'This invite code has been deactivated',
            });
        }

        // 5. 检查邀请码是否过期
        if (new Date() > inviteCode.expiresAt) {
            return NextResponse.json({
                valid: false,
                error: 'This invite code has expired',
            });
        }

        // 6. 检查邀请码使用次数
        if (inviteCode.currentUses >= inviteCode.maxUses) {
            return NextResponse.json({
                valid: false,
                error: 'This invite code has been fully used',
            });
        }

        // 7. 验证成功，返回邀请码信息
        return NextResponse.json({
            valid: true,
            inviteCode: {
                code: inviteCode.code,
                type: inviteCode.type,
                expiresAt: inviteCode.expiresAt,
                currentUses: inviteCode.currentUses,
                maxUses: inviteCode.maxUses,
                generator: inviteCode.generator,
            },
        });
    } catch (error) {
        console.error('Error validating invite code:', error);
        return NextResponse.json(
            { valid: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}