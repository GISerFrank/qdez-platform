import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createReviewSchema = z.object({
    content: z.string().min(1, '请输入评论内容').max(2000, '评论最多2000字'),
    parentId: z.string().optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/resources/[id]/reviews
 * 获取资源评论列表
 */
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

        const session = await getServerSession(authOptions);

        // 查询顶级评论
        const [reviews, total] = await Promise.all([
            prisma.resourceReview.findMany({
                where: {
                    resourceId: id,
                    parentId: null,
                    status: 'PUBLISHED',
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                    replies: {
                        where: { status: 'PUBLISHED' },
                        orderBy: { createdAt: 'asc' },
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    username: true,
                                    name: true,
                                    displayName: true,
                                    avatarUrl: true,
                                },
                            },
                            _count: {
                                select: { reviewLikes: true },
                            },
                        },
                    },
                    _count: {
                        select: { reviewLikes: true },
                    },
                },
            }),
            prisma.resourceReview.count({
                where: {
                    resourceId: id,
                    parentId: null,
                    status: 'PUBLISHED',
                },
            }),
        ]);

        // 获取当前用户的点赞状态
        let userLikedReviewIds: string[] = [];
        if (session?.user?.id) {
            const likes = await prisma.resourceReviewLike.findMany({
                where: {
                    userId: session.user.id,
                    reviewId: {
                        in: reviews.flatMap(r => [r.id, ...r.replies.map(reply => reply.id)]),
                    },
                },
                select: { reviewId: true },
            });
            userLikedReviewIds = likes.map(l => l.reviewId);
        }

        // 格式化返回数据
        const formattedReviews = reviews.map(review => ({
            ...review,
            likes: review._count.reviewLikes,
            isLiked: userLikedReviewIds.includes(review.id),
            replies: review.replies.map(reply => ({
                ...reply,
                likes: reply._count.reviewLikes,
                isLiked: userLikedReviewIds.includes(reply.id),
            })),
        }));

        return NextResponse.json({
            success: true,
            data: {
                reviews: formattedReviews,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json(
            { success: false, error: '获取评论失败' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/resources/[id]/reviews
 * 发表评论
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

        // 解析请求体
        const body = await request.json();
        const validationResult = createReviewSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { success: false, error: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const { content, parentId } = validationResult.data;

        // 如果是回复，验证父评论存在
        if (parentId) {
            const parentReview = await prisma.resourceReview.findUnique({
                where: { id: parentId },
            });

            if (!parentReview || parentReview.resourceId !== id) {
                return NextResponse.json(
                    { success: false, error: '回复的评论不存在' },
                    { status: 400 }
                );
            }
        }

        // 创建评论
        const review = await prisma.resourceReview.create({
            data: {
                resourceId: id,
                authorId: session.user.id,
                content,
                parentId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: '评论发表成功',
            data: {
                ...review,
                likes: 0,
                isLiked: false,
                replies: [],
            },
        });

    } catch (error) {
        console.error('Create review error:', error);
        return NextResponse.json(
            { success: false, error: '发表评论失败' },
            { status: 500 }
        );
    }
}