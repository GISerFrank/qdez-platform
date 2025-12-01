// src/app/api/forum/posts/[id]/route.ts
// 帖子详情、更新、删除 API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { updatePostSchema, idParamSchema } from '@/lib/forum/validation'
import { canEditPost, canDeletePost, getAuthorSelect } from '@/lib/forum/utils'

/**
 * GET /api/forum/posts/[id]
 * 获取帖子详情
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }  // ✅ 改这里
) {
  try {
    // 1. 验证 ID 格式
    const params = await context.params  // ✅ 加这行
    const paramResult = idParamSchema.safeParse(params)
    
    if (!paramResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid post ID',
        },
        { status: 400 }
      )
    }

    const { id } = paramResult.data

    // 2. 查询帖子
    const post = await prisma.post.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: 'Post not found',
        },
        { status: 404 }
      )
    }

    // 3. 检查帖子状态
    if (post.status === 'DELETED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Post has been deleted',
        },
        { status: 404 }
      )
    }

    // 4. 获取当前用户（如果已登录）
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id

    // 5. 检查点赞状态（如果已登录）
    let isLiked = false
    let isBookmarked = false

    if (currentUserId) {
      const [like, bookmark] = await Promise.all([
        prisma.postLike.findUnique({
          where: {
            postId_userId: {
              postId: id,
              userId: currentUserId,
            },
          },
        }),
        prisma.bookmark.findUnique({
          where: {
            postId_userId: {
              postId: id,
              userId: currentUserId,
            },
          },
        }),
      ])

      isLiked = !!like
      isBookmarked = !!bookmark
    }

    // 6. 增加浏览次数
    await prisma.post.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    // 7. 格式化数据
    const formattedPost = {
      ...post,
      tags: post.tags.map(t => t.tag.name),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      isLiked,
      isBookmarked,
    }

    // 8. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        post: formattedPost,
      },
    })
  } catch (error) {
    console.error('Get post detail error:', error)
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
 * PUT /api/forum/posts/[id]
 * 更新帖子
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }  // ✅ 改这里
) {
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

    // 2. 验证 ID 格式
    const params = await context.params  // ✅ 加这行
    const paramResult = idParamSchema.safeParse(params)
    
    if (!paramResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid post ID',
        },
        { status: 400 }
      )
    }

    const { id } = paramResult.data

    // 3. 查询帖子
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: {
        authorId: true,
        status: true,
      },
    })

    if (!existingPost) {
      return NextResponse.json(
        {
          success: false,
          error: 'Post not found',
        },
        { status: 404 }
      )
    }

    if (existingPost.status === 'DELETED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot update deleted post',
        },
        { status: 400 }
      )
    }

    // 4. 检查权限
    const isAdmin = session.user.role === 'ADMIN'
    if (!canEditPost(existingPost.authorId, session.user.id, isAdmin)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You can only edit your own posts',
        },
        { status: 403 }
      )
    }

    // 5. 解析请求体
    const body = await request.json()

    // 6. 验证数据
    const validationResult = updatePostSchema.safeParse(body)

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

    const { title, content, category, tags } = validationResult.data

    // 7. 使用事务更新帖子和标签
    const updatedPost = await prisma.$transaction(async (tx) => {
      // 7.1 更新帖子基本信息
      const post = await tx.post.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content && { content }),
          ...(category && { category }),
        },
      })

      // 7.2 更新标签（如果提供）
      if (tags !== undefined) {
        // 删除旧的标签关联
        await tx.postTag.deleteMany({
          where: { postId: id },
        })

        // 创建新的标签关联
        if (tags.length > 0) {
          for (const tagName of tags) {
            const tag = await tx.tag.upsert({
              where: { name: tagName },
              update: {
                useCount: {
                  increment: 1,
                },
              },
              create: {
                name: tagName,
                slug: tagName.toLowerCase().replace(/\s+/g, '-'),
                useCount: 1,
              },
            })

            await tx.postTag.create({
              data: {
                postId: id,
                tagId: tag.id,
              },
            })
          }
        }
      }

      return post
    })

    // 8. 重新查询完整数据
    const fullPost = await prisma.post.findUnique({
      where: { id },
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

    // 9. 格式化数据
    const formattedPost = {
      ...fullPost,
      tags: fullPost!.tags.map(t => t.tag.name),
      createdAt: fullPost!.createdAt.toISOString(),
      updatedAt: fullPost!.updatedAt.toISOString(),
    }

    // 10. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        post: formattedPost,
      },
    })
  } catch (error) {
    console.error('Update post error:', error)
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
 * DELETE /api/forum/posts/[id]
 * 删除帖子（软删除）
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }  // ✅ 改这里
) {
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

    // 2. 验证 ID 格式
    const params = await context.params  // ✅ 加这行
    const paramResult = idParamSchema.safeParse(params)
    
    if (!paramResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid post ID',
        },
        { status: 400 }
      )
    }

    const { id } = paramResult.data

    // 3. 查询帖子
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: {
        authorId: true,
        status: true,
      },
    })

    if (!existingPost) {
      return NextResponse.json(
        {
          success: false,
          error: 'Post not found',
        },
        { status: 404 }
      )
    }

    if (existingPost.status === 'DELETED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Post already deleted',
        },
        { status: 400 }
      )
    }

    // 4. 检查权限
    const isAdmin = session.user.role === 'ADMIN'
    if (!canDeletePost(existingPost.authorId, session.user.id, isAdmin)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You can only delete your own posts',
        },
        { status: 403 }
      )
    }

    // 5. 软删除帖子
    await prisma.post.update({
      where: { id },
      data: {
        status: 'DELETED',
      },
    })

    // 6. 返回响应
    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
