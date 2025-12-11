import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { z } from 'zod';
import React from 'react';

// 更新资源验证
const updateResourceSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    categoryId: z.string().optional(),
    tagIds: z.array(z.string()).optional(),
});

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/resources/[id]
 * 获取资源详情
 */
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        // 查询资源
        const resource = await prisma.resource.findUnique({
            where: { id },
            include: {
                category: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        displayName: true,
                        avatarUrl: true,
                        currentSchool: true,
                    },
                },
                tags: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
        });

        if (!resource) {
            return NextResponse.json(
                { success: false, error: '资源不存在' },
                { status: 404 }
            );
        }

        // 非作者只能看到已审核通过的资源
        if (resource.status !== 'APPROVED' && resource.authorId !== session?.user?.id) {
            return NextResponse.json(
                { success: false, error: '资源不存在' },
                { status: 404 }
            );
        }

        // 增加浏览次数
        await prisma.resource.update({
            where: { id },
            data: { views: { increment: 1 } },
        });

        // 获取当前用户的评分和收藏状态
        let userRating = null;
        let isFavorited = false;

        if (session?.user?.id) {
            const [rating, favorite] = await Promise.all([
                prisma.resourceRating.findUnique({
                    where: {
                        resourceId_userId: {
                            resourceId: id,
                            userId: session.user.id,
                        },
                    },
                }),
                prisma.resourceFavorite.findUnique({
                    where: {
                        resourceId_userId: {
                            resourceId: id,
                            userId: session.user.id,
                        },
                    },
                }),
            ]);

            userRating = rating?.rating || null;
            isFavorited = !!favorite;
        }

        // 格式化返回数据
        const formattedResource = {
            ...resource,
            tags: resource.tags.map(t => t.tag),
            userRating,
            isFavorited,
        };

        return NextResponse.json({
            success: true,
            data: formattedResource,
        });

    } catch (error) {
        console.error('Get resource error:', error);
        return NextResponse.json(
            { success: false, error: '获取资源详情失败' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/resources/[id]
 * 更新资源（仅作者可操作）
 */
export async function PUT(
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

        // 查询资源
        const resource = await prisma.resource.findUnique({
            where: { id },
        });

        if (!resource) {
            return NextResponse.json(
                { success: false, error: '资源不存在' },
                { status: 404 }
            );
        }

        // 验证权限
        if (resource.authorId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: '无权编辑此资源' },
                { status: 403 }
            );
        }

        // 解析请求体
        const body = await request.json();
        const validationResult = updateResourceSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { success: false, error: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // 更新资源（编辑后需要重新审核）
        const updatedResource = await prisma.resource.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description && { description: data.description }),
                ...(data.categoryId && { categoryId: data.categoryId }),
                status: 'PENDING', // 重新进入审核
                updatedAt: new Date(),
            },
            include: {
                category: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                    },
                },
            },
        });

        // 更新标签
        if (data.tagIds) {
            // 删除旧标签
            await prisma.resourceTag.deleteMany({
                where: { resourceId: id },
            });

            // 添加新标签
            if (data.tagIds.length > 0) {
                await prisma.resourceTag.createMany({
                    data: data.tagIds.map(tagId => ({
                        resourceId: id,
                        tagId,
                    })),
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: '资源已更新，等待重新审核',
            data: updatedResource,
        });

    } catch (error) {
        console.error('Update resource error:', error);
        return NextResponse.json(
            { success: false, error: '更新资源失败' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/resources/[id]
 * 删除资源（仅作者可操作）
 */
export async function DELETE(
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

        // 查询资源
        const resource = await prisma.resource.findUnique({
            where: { id },
        });

        if (!resource) {
            return NextResponse.json(
                { success: false, error: '资源不存在' },
                { status: 404 }
            );
        }

        // 验证权限
        if (resource.authorId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: '无权删除此资源' },
                { status: 403 }
            );
        }

        // 从 Cloudinary 删除文件
        await deleteFromCloudinary(resource.filePublicId);

        // 软删除资源
        await prisma.resource.update({
            where: { id },
            data: {
                status: 'DELETED',
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: '资源已删除',
        });

    } catch (error) {
        console.error('Delete resource error:', error);
        return NextResponse.json(
            { success: false, error: '删除资源失败' },
            { status: 500 }
        );
    }
}