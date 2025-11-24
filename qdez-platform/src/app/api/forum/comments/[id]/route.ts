// src/app/api/forum/comments/[id]/route.ts
// 评论更新、删除 API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { updateCommentSchema, idParamSchema } from '@/lib/forum/validation'
import { canEditComment, canDeleteComment } from '@/lib/forum/utils'

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
 * PUT /api/forum/comments/[id]
 * 更新评论
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const paramResult = idParamSchema.safeParse(params)
    
    if (!paramResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid comment ID',
        },
        { status: 400 }
      )
    }

    const { id } = paramResult.data

    // 3. 查询评论
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        postId: true,
      },
    })

    if (!existingComment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Comment not found',
        },
        { status: 404 }
      )
    }

    // 4. 检查权限
    const isAdmin = session.user.role === 'ADMIN'
    if (!canEditComment(existingComment.authorId, session.user.id, isAdmin)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You can only edit your own comments',
        },
        { status: 403 }
      )
    }

    // 5. 解析请求体
    const body = await request.json()

    // 6. 验证数据
    const validationResult = updateCommentSchema.safeParse(body)

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

    const { content } = validationResult.data

    // 7. 更新评论
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content,
      },
      include: {
        author: {
          select: getCommentAuthorSelect(),
        },
      },
    })

    // 8. 格式化数据
    const formattedComment = {
      ...updatedComment,
      createdAt: updatedComment.createdAt.toISOString(),
      updatedAt: updatedComment.updatedAt.toISOString(),
    }

    // 9. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        comment: formattedComment,
      },
    })
  } catch (error) {
    console.error('Update comment error:', error)
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
 * DELETE /api/forum/comments/[id]
 * 删除评论
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const paramResult = idParamSchema.safeParse(params)
    
    if (!paramResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid comment ID',
        },
        { status: 400 }
      )
    }

    const { id } = paramResult.data

    // 3. 查询评论
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        postId: true,
        parentId: true,
        _count: {
          select: {
            replies: true, // 统计回复数
          },
        },
      },
    })

    if (!existingComment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Comment not found',
        },
        { status: 404 }
      )
    }

    // 4. 检查权限
    const isAdmin = session.user.role === 'ADMIN'
    if (!canDeleteComment(existingComment.authorId, session.user.id, isAdmin)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You can only delete your own comments',
        },
        { status: 403 }
      )
    }

    // 5. 使用事务删除评论
    await prisma.$transaction(async (tx) => {
      // 5.1 删除评论（级联删除回复）
      await tx.comment.delete({
        where: { id },
      })

      // 5.2 减少帖子评论数
      // 计算要减少的数量：当前评论 + 所有回复
      const decrementAmount = 1 + existingComment._count.replies

      await tx.post.update({
        where: { id: existingComment.postId },
        data: {
          commentCount: {
            decrement: decrementAmount,
          },
        },
      })
    })

    // 6. 返回响应
    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
