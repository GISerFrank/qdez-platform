// src/app/api/forum/comments/[id]/like/route.ts
// 评论点赞/取消点赞 API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { idParamSchema } from '@/lib/forum/validation'

/**
 * POST /api/forum/comments/[id]/like
 * 点赞或取消点赞评论
 */
export async function POST(
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

    const { id: commentId } = paramResult.data
    const userId = session.user.id

    // 3. 检查评论是否存在
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        authorId: true,
      },
    })

    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Comment not found',
        },
        { status: 404 }
      )
    }

    // 4. 检查是否已点赞
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    })

    let liked: boolean
    let likeCount: number

    // 5. 使用事务处理点赞/取消点赞
    if (existingLike) {
      // 取消点赞
      await prisma.$transaction([
        // 删除点赞记录
        prisma.commentLike.delete({
          where: {
            id: existingLike.id,
          },
        }),
        // 减少评论点赞数
        prisma.comment.update({
          where: { id: commentId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        }),
      ])

      liked = false
    } else {
      // 添加点赞
      await prisma.$transaction(async (tx) => {
        // 创建点赞记录
        await tx.commentLike.create({
          data: {
            commentId,
            userId,
          },
        })

        // 增加评论点赞数
        await tx.comment.update({
          where: { id: commentId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
        })

        // 如果点赞的不是自己的评论，给评论作者增加积分
        if (comment.authorId !== userId) {
          await tx.user.update({
            where: { id: comment.authorId },
            data: {
              points: {
                increment: 1, // 评论获得点赞奖励1积分
              },
            },
          })
        }
      })

      liked = true
    }

    // 6. 查询更新后的点赞数
    const updatedComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        likeCount: true,
      },
    })

    likeCount = updatedComment!.likeCount

    // 7. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        liked,
        likeCount,
      },
    })
  } catch (error) {
    console.error('Like comment error:', error)

    // 处理唯一约束冲突（并发点赞）
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Like operation conflict, please try again',
        },
        { status: 409 }
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
