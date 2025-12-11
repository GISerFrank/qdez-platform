import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const ratingSchema = z.object({
    rating: z.number().min(1).max(5),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/resources/[id]/rating
 * 评分资源
 */
export async function POST(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: '请先登录' },
                { status: 401 }
            );
        }

        // 验证资源存在
        const resource = await prisma.resource.findUnique({
            where: { id },
        });

        if (!resource || resource.status !== 'APPROVED') {
            return NextResponse.json(
                { success: false, error: '资源不存在' },
                { status: 404 }
            );
        }

        // 不能给自己的资源评分
        if (resource.authorId === session.user.id) {
            return NextResponse.json(
                { success: false, error: '不能给自己的资源评分' },
                { status: 400 }
            );
        }

        // 解析请求体
        const body = await request.json();
        const validationResult = ratingSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { success: false, error: '评分必须是1-5的整数' },
                { status: 400 }
            );
        }

        const { rating } = validationResult.data;

        // 创建或更新评分
        await prisma.resourceRating.upsert({
            where: {
                resourceId_userId: {
                    resourceId: id,
                    userId: session.user.id,
                },
            },
            create: {
                resourceId: id,
                userId: session.user.id,
                rating,
            },
            update: {
                rating,
                updatedAt: new Date(),
            },
        });

        // 重新计算平均评分
        const stats = await prisma.resourceRating.aggregate({
            where: { resourceId: id },
            _avg: { rating: true },
            _count: { rating: true },
        });

        // 更新资源的评分汇总
        await prisma.resource.update({
            where: { id },
            data: {
                ratingAvg: stats._avg.rating || 0,
                ratingCount: stats._count.rating,
            },
        });

        return NextResponse.json({
            success: true,
            message: '评分成功',
            data: {
                userRating: rating,
                ratingAvg: stats._avg.rating || 0,
                ratingCount: stats._count.rating,
            },
        });

    } catch (error) {
        console.error('Rating error:', error);
        return NextResponse.json(
            { success: false, error: '评分失败' },
            { status: 500 }
        );
    }
}