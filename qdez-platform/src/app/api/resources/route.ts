import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// 创建资源验证
const createResourceSchema = z.object({
    title: z.string().min(1, '请输入标题').max(200, '标题最多200字'),
    description: z.string().min(10, '描述至少10个字').max(5000, '描述最多5000字'),
    categoryId: z.string().min(1, '请选择分类'),
    tagIds: z.array(z.string()).optional(),
    fileUrl: z.string().url('无效的文件URL'),
    filePublicId: z.string().min(1),
    fileName: z.string().min(1),
    fileSize: z.number().positive(),
    fileType: z.string().min(1),
    fileFormat: z.string().optional(),
    thumbnailUrl: z.string().url().optional(),
});

/**
 * GET /api/resources
 * 获取资源列表
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // 解析查询参数
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        const categoryId = searchParams.get('categoryId');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'newest';
        const featured = searchParams.get('featured') === 'true';

        // 构建查询条件
        const where: any = {
            status: 'APPROVED', // 只显示已审核通过的资源
        };

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (featured) {
            where.featured = true;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // 排序方式
        let orderBy: any = { createdAt: 'desc' };
        switch (sortBy) {
            case 'downloads':
                orderBy = { downloads: 'desc' };
                break;
            case 'rating':
                orderBy = { ratingAvg: 'desc' };
                break;
            case 'popular':
                orderBy = [{ downloads: 'desc' }, { ratingAvg: 'desc' }];
                break;
        }

        // 查询
        const [resources, total] = await Promise.all([
            prisma.resource.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    categoryId: true,
                    fileFormat: true,
                    fileSize: true,
                    downloads: true,
                    ratingAvg: true,
                    ratingCount: true,
                    status: true,
                    featured: true,
                    createdAt: true,
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

    } catch (error) {
        console.error('Get resources error:', error);
        return NextResponse.json(
            { success: false, error: '获取资源列表失败' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/resources
 * 创建新资源（需登录，创建后待审核）
 */
export async function POST(request: NextRequest) {
    try {
        // 1. 验证登录
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: '请先登录' },
                { status: 401 }
            );
        }

        // 2. 解析请求体
        const body = await request.json();

        // 3. 验证数据
        const validationResult = createResourceSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: validationResult.error.errors[0].message
                },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // 4. 验证分类存在
        const category = await prisma.resourceCategory.findUnique({
            where: { id: data.categoryId },
        });

        if (!category) {
            return NextResponse.json(
                { success: false, error: '分类不存在' },
                { status: 400 }
            );
        }

        // 5. 创建资源
        const resource = await prisma.resource.create({
            data: {
                title: data.title,
                description: data.description,
                categoryId: data.categoryId,
                authorId: session.user.id,
                fileUrl: data.fileUrl,
                filePublicId: data.filePublicId,
                fileName: data.fileName,
                fileSize: data.fileSize,
                fileType: data.fileType,
                fileFormat: data.fileFormat,
                thumbnailUrl: data.thumbnailUrl,
                status: 'PENDING', // 默认待审核
                // 创建标签关联
                ...(data.tagIds && data.tagIds.length > 0 && {
                    tags: {
                        create: data.tagIds.map(tagId => ({
                            tagId,
                        })),
                    },
                }),
            },
            include: {
                category: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: '资源已提交，等待审核',
            data: resource,
        });

    } catch (error) {
        console.error('Create resource error:', error);
        return NextResponse.json(
            { success: false, error: '创建资源失败' },
            { status: 500 }
        );
    }
}