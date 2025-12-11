import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/resources/[id]/favorite
 * 收藏/取消收藏资源
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

        // 检查是否已收藏
        const existingFavorite = await prisma.resourceFavorite.findUnique({
            where: {
                resourceId_userId: {
                    resourceId: id,
                    userId: session.user.id,
                },
            },
        });

        if (existingFavorite) {
            // 取消收藏
            await prisma.resourceFavorite.delete({
                where: { id: existingFavorite.id },
            });

            return NextResponse.json({
                success: true,
                message: '已取消收藏',
                data: { isFavorited: false },
            });
        } else {
            // 添加收藏
            await prisma.resourceFavorite.create({
                data: {
                    resourceId: id,
                    userId: session.user.id,
                },
            });

            return NextResponse.json({
                success: true,
                message: '收藏成功',
                data: { isFavorited: true },
            });
        }

    } catch (error) {
        console.error('Favorite error:', error);
        return NextResponse.json(
            { success: false, error: '操作失败' },
            { status: 500 }
        );
    }
}