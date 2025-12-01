// src/app/api/forum/posts/[id]/comments/route.ts
// 评论列表和创建 API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import {
  createCommentSchema,
  commentListQuerySchema,
  idParamSchema,
} from '@/lib/forum/validation'
import { calculateOffset, generatePaginationMeta } from '@/lib/forum/utils'

// 获取评论作者信息的选择字段
function getCommentAuthorSelect() {
  return {
    id: true,
    username: true,
    name: true,
    displayName: true,
    avatarUrl: true,
  }
}

/**
 * GET /api/forum/posts/[id]/comments
 * 获取帖子的评论列表
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }  // ✅ 改这里
) {
  try {
    // 1. 验证帖子 ID
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

    const { id: postId } = paramResult.data

    // 2. 检查帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, status: true },
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

    // 3. 解析查询参数
    const { searchParams } = new URL(request.url)
    const queryResult = commentListQuerySchema.safeParse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
      sort: searchParams.get('sort') || 'latest',
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

    const { page, limit, sort } = queryResult.data

    // 4. 获取当前用户（如果已登录）
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id

    // 5. 查询评论总数（只统计顶级评论）
    const total = await prisma.comment.count({
      where: {
        postId,
        parentId: null, // 只统计顶级评论
      },
    })

    // 6. 构建排序条件
    const orderBy = sort === 'mostLiked'
      ? { likeCount: 'desc' as const }
      : { createdAt: 'desc' as const }

    // 7. 查询评论列表（只查询顶级评论）
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
      },
      select: {
        id: true,
        content: true,
        postId: true,
        authorId: true,
        author: {
          select: getCommentAuthorSelect(),
        },
        parentId: true,
        likeCount: true,
        createdAt: true,
        updatedAt: true,
        // 查询回复
        replies: {
          select: {
            id: true,
            content: true,
            postId: true,
            authorId: true,
            author: {
              select: getCommentAuthorSelect(),
            },
            parentId: true,
            likeCount: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: 'asc', // 回复按时间正序
          },
        },
      },
      orderBy,
      skip: calculateOffset(page, limit),
      take: limit,
    })

    // 8. 如果用户已登录，查询点赞状态
    let likedCommentIds: Set<string> = new Set()

    if (currentUserId) {
      // 收集所有评论ID（包括回复）
      const allCommentIds = comments.flatMap(comment => [
        comment.id,
        ...comment.replies.map(reply => reply.id),
      ])

      // 批量查询点赞状态
      const likes = await prisma.commentLike.findMany({
        where: {
          commentId: { in: allCommentIds },
          userId: currentUserId,
        },
        select: {
          commentId: true,
        },
      })

      likedCommentIds = new Set(likes.map(like => like.commentId))
    }

    // 9. 格式化数据
    const formattedComments = comments.map(comment => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      isLiked: likedCommentIds.has(comment.id),
      replies: comment.replies.map(reply => ({
        ...reply,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
        isLiked: likedCommentIds.has(reply.id),
      })),
    }))

    // 10. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        comments: formattedComments,
        total,
      },
    })
  } catch (error) {
    console.error('Get comments error:', error)
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
 * POST /api/forum/posts/[id]/comments
 * 发表评论或回复
 */
export async function POST(
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

    // 2. 验证帖子 ID
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

    const { id: postId } = paramResult.data

    // 3. 检查帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        status: true,
        authorId: true,
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

    if (post.status === 'DELETED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot comment on a deleted post',
        },
        { status: 400 }
      )
    }

    // 4. 解析请求体
    const body = await request.json()

    // 5. 验证数据
    const validationResult = createCommentSchema.safeParse(body)

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

    const { content, parentId } = validationResult.data

    // 6. 如果是回复，验证父评论
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: {
          id: true,
          postId: true,
        },
      })

      if (!parentComment) {
        return NextResponse.json(
          {
            success: false,
            error: 'Parent comment not found',
          },
          { status: 404 }
        )
      }

      if (parentComment.postId !== postId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Parent comment does not belong to this post',
          },
          { status: 400 }
        )
      }
    }

    // 7. 使用事务创建评论
    const comment = await prisma.$transaction(async (tx) => {
      // 7.1 创建评论
      const newComment = await tx.comment.create({
        data: {
          content,
          postId,
          authorId: session.user.id,
          ...(parentId && { parentId }),
        },
        include: {
          author: {
            select: getCommentAuthorSelect(),
          },
        },
      })

      // 7.2 增加帖子评论数
      await tx.post.update({
        where: { id: postId },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      })

      // 7.3 给评论者增加积分
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          points: {
            increment: 2, // 评论奖励2积分
          },
        },
      })

      // 7.4 如果评论的不是自己的帖子，给帖子作者增加积分
      if (post.authorId !== session.user.id) {
        await tx.user.update({
          where: { id: post.authorId },
          data: {
            points: {
              increment: 1, // 收到评论奖励1积分
            },
          },
        })
      }

      return newComment
    })

    // 8. 格式化数据
    const formattedComment = {
      ...comment,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      isLiked: false,
    }

    // 9. 返回响应
    return NextResponse.json(
      {
        success: true,
        data: {
          comment: formattedComment,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
