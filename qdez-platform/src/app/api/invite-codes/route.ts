import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateInviteCode, generateMeaningfulCode, calculateExpiryDate } from '@/lib/invite-code';

const prisma = new PrismaClient();

/**
 * GET /api/invite-codes
 * 查询邀请码（需要管理员权限 - 后续添加认证）
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (code) {
            // 查询单个邀请码
            const inviteCode = await prisma.inviteCode.findUnique({
                where: { code },
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

            if (!inviteCode) {
                return NextResponse.json(
                    { error: 'Invite code not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(inviteCode);
        }

        // 查询所有邀请码（管理员功能）
        const inviteCodes = await prisma.inviteCode.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                generator: {
                    select: {
                        username: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(inviteCodes);
    } catch (error) {
        console.error('Error fetching invite codes:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/invite-codes
 * 生成新邀请码
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            type = 'random',
            theme,
            expiresInDays = 30,
            generatedBy, // 用户ID（后续从session获取）
            note,
        } = body;

        // 生成邀请码
        let code: string;
        if (type === 'meaningful' && theme) {
            code = generateInviteCode({
                type: 'custom',
                customCode: generateMeaningfulCode(theme),
                expiresInDays,
            });
        } else {
            code = generateInviteCode({ type, expiresInDays });
        }

        // 检查是否重复
        const existing = await prisma.inviteCode.findUnique({
            where: { code },
        });

        if (existing) {
            // 如果重复，重新生成
            return POST(request);
        }

        // 创建邀请码
        const inviteCode = await prisma.inviteCode.create({
            data: {
                code,
                type: generatedBy ? 'USER_GENERATED' : 'ADMIN_GENERATED',
                generatedBy: generatedBy || null,
                expiresAt: calculateExpiryDate(expiresInDays),
                note,
                metadata: {
                    theme,
                    generatedAt: new Date().toISOString(),
                },
            },
        });

        return NextResponse.json(inviteCode, { status: 201 });
    } catch (error) {
        console.error('Error creating invite code:', error);
        return NextResponse.json(
            { error: 'Failed to create invite code' },
            { status: 500 }
        );
    }
}