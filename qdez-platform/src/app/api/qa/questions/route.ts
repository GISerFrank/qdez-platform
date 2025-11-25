// src/app/api/qa/questions/route.ts
// 帖子列表和创建 API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createQuestionSchema, questionListQuerySchema } from '@/lib/qa/validation'
import {
  calculateOffset,
  generatePaginationMeta,
  getSortOrderBy,
  getAuthorSelect,
} from '@/lib/forum/utils'

/**
 * GET /api/forum/posts
 * 获取帖子列表
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 解析查询参数
    const { searchParams } = new URL(request.url)
    const queryResult = questionListQuerySchema.safeParse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      category: searchParams.get('category') || undefined,
      sort: searchParams.get('sort') || 'latest',
      tag: searchParams.get('tag') || undefined,
    })

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: queryResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { page, limit, category, sort, tag } = queryResult.data

    // 2. 构建查询条件
    const where: any = {
      status: 'PUBLISHED', // 只显示已发布的帖子
    }

    if (category) {
      where.category = category
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: tag,
          },
        },
      }
    }

    // 3. 查询总数
    const total = await prisma.post.count({ where })

    // 4. 查询帖子列表
    const questions = await prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        authorId: true,
        author: {
          select: getAuthorSelect(),
        },
        viewCount: true,
        likeCount: true,
        commentCount: true,
        isPinned: true,
        isFeatured: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' }, // 置顶帖子优先
        getSortOrderBy(sort),
      ],
      skip: calculateOffset(page, limit),
      take: limit,
    })

    // 5. 格式化数据
    const formattedPosts = questions.map(post => ({
      ...post,
      tags: post.tags.map(t => t.tag.name),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }))

    // 6. 生成分页元数据
    const paginationMeta = generatePaginationMeta(total, page, limit)

    // 7. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        posts: formattedPosts,
        ...paginationMeta,
      },
    })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/forum/posts
 * 创建新帖子
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // 2. 解析请求体
    const body = await request.json()

    // 3. 验证数据
    const validationResult = createQuestionSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { title, content, category, tags = [] } = validationResult.data

    // 4. 使用事务创建帖子和标签
    const post = await prisma.$transaction(async (tx) => {
      // 4.1 创建帖子
      const newPost = await tx.post.create({
        data: {
          title,
          content,
          category,
          authorId: session.user.id,
          status: 'PUBLISHED',
        },
        include: {
          author: {
            select: getAuthorSelect(),
          },
        },
      })

      // 4.2 处理标签
      if (tags.length > 0) {
        for (const tagName of tags) {
          // 查找或创建标签
          const tag = await tx.tag.upsert({
            where: { name: tagName },
            update: {
              useCount: {
                increment: 1,
              },
            },
            create: {
              name: tagName,
              useCount: 1,
            },
          })

          // 关联标签到帖子
          await tx.postTag.create({
            data: {
              postId: newPost.id,
              tagId: tag.id,
            },
          })
        }
      }

      // 4.3 增加用户积分（发帖奖励）
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          points: {
            increment: 5, // 发帖奖励5积分
          },
        },
      })

      return newPost
    })

    // 5. 重新查询完整数据（包含标签）
    const fullPost = await prisma.post.findUnique({
      where: { id: post.id },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        authorId: true,
        author: {
          select: getAuthorSelect(),
        },
        viewCount: true,
        likeCount: true,
        commentCount: true,
        isPinned: true,
        isFeatured: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    // 6. 格式化数据
    const formattedPost = {
      ...fullPost,
      tags: fullPost!.tags.map(t => t.tag.name),
      createdAt: fullPost!.createdAt.toISOString(),
      updatedAt: fullPost!.updatedAt.toISOString(),
    }

    // 7. 返回响应
    return NextResponse.json(
      {
        success: true,
        data: {
          post: formattedPost,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create post error:', error)

    // Prisma 错误处理
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category or user',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
