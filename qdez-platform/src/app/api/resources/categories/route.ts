import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/resources/categories
 * 获取资源分类列表（树形结构）
 */
export async function GET(request: NextRequest) {
    try {
        // 获取所有分类
        const categories = await prisma.resourceCategory.findMany({
            orderBy: [
                { sortOrder: 'asc' },
                { name: 'asc' },
            ],
            include: {
                _count: {
                    select: {
                        resources: {
                            where: { status: 'APPROVED' },
                        },
                    },
                },
            },
        });

        // 构建树形结构
        const categoryMap = new Map();
        const rootCategories: any[] = [];

        // 第一遍：创建所有分类的映射
        categories.forEach(cat => {
            categoryMap.set(cat.id, {
                ...cat,
                resourceCount: cat._count.resources,
                children: [],
            });
        });

        // 第二遍：构建树形关系
        categories.forEach(cat => {
            const category = categoryMap.get(cat.id);
            if (cat.parentId) {
                const parent = categoryMap.get(cat.parentId);
                if (parent) {
                    parent.children.push(category);
                }
            } else {
                rootCategories.push(category);
            }
        });

        return NextResponse.json({
            success: true,
            data: rootCategories,
        });

    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json(
            { success: false, error: '获取分类失败' },
            { status: 500 }
        );
    }
}