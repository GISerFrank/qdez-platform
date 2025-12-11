import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/resources/my
 * 获取我的资源或收藏
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: '请先登录' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'uploaded'; // 'uploaded' | 'favorites'
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

        if (type === 'favorites') {
            // 获取收藏的资源
            const [favorites, total] = await Promise.all([
                prisma.resourceFavorite.findMany({
                    where: { userId: session.user.id },
                    orderBy: { createdAt: 'desc' },
                    skip: (page - 1) * limit,
                    take: limit,
                    include: {
                        resource: {
                            include: {
                                category: {
                                    select: {
                                        id: true,
                                        name: true,
                                        icon: true,
                                    },
                                },
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                        displayName: true,
                                        avatarUrl: true,
                                        currentSchool: true,
                                    },
                                },
                            },
                        },
                    },
                }),
                prisma.resourceFavorite.count({
                    where: { userId: session.user.id },
                }),
            ]);

            return NextResponse.json({
                success: true,
                data: {
                    resources: favorites
                        .filter(f => f.resource.status === 'APPROVED')
                        .map(f => ({
                            ...f.resource,
                            favoritedAt: f.createdAt,
                        })),
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } else {
            // 获取上传的资源
            const status = searchParams.get('status'); // 可选筛选状态

            const where: any = { authorId: session.user.id };
            if (status) {
                where.status = status;
            } else {
                // 默认不显示已删除的
                where.status = { not: 'DELETED' };
            }

            const [resources, total] = await Promise.all([
                prisma.resource.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip: (page - 1) * limit,
                    take: limit,
                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                icon: true,
                            },
                        },
                        _count: {
                            select: {
                                favorites: true,
                                reviews: true,
                            },
                        },
                    },
                }),
                prisma.resource.count({ where }),
            ]);

            return NextResponse.json({
                success: true,
                data: {
                    resources,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            });
        }

    } catch (error) {
        console.error('Get my resources error:', error);
        return NextResponse.json(
            { success: false, error: '获取资源失败' },
            { status: 500 }
        );
    }
}