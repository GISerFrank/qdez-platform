import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateInviteCode, generateMeaningfulCode, calculateExpiryDate } from '@/lib/invite-code';

const prisma = new PrismaClient();

/**
 * POST /api/invite-codes/generate-batch
 * 批量生成邀请码（管理员功能）
 */
export async function POST() {
    try {
        const themes = ['BOSTON', 'MIT', 'STANFORD', 'HARVARD', 'CS2025', 'AUTUMN'];
        const inviteCodes = [];

        // 生成10个随机邀请码
        for (let i = 0; i < 10; i++) {
            const code = generateInviteCode({ type: 'random' });

            inviteCodes.push({
                code,
                type: 'ADMIN_GENERATED' as const,
                expiresAt: calculateExpiryDate(90), // 90天有效期
                note: `初始批次 #${i + 1}`,
            });
        }

        // 生成6个主题邀请码
        for (const theme of themes) {
            const code = generateInviteCode({
                type: 'custom',
                customCode: generateMeaningfulCode(theme),
            });

            inviteCodes.push({
                code,
                type: 'SPECIAL' as const,
                expiresAt: calculateExpiryDate(180), // 180天有效期
                note: `主题邀请码: ${theme}`,
                metadata: { theme },
            });
        }

        // 批量插入数据库
        const created = await prisma.inviteCode.createMany({
            data: inviteCodes,
            skipDuplicates: true,
        });

        return NextResponse.json({
            message: `Successfully generated ${created.count} invite codes`,
            count: created.count,
        });
    } catch (error) {
        console.error('Error generating batch invite codes:', error);
        return NextResponse.json(
            { error: 'Failed to generate invite codes' },
            { status: 500 }
        );
    }
}