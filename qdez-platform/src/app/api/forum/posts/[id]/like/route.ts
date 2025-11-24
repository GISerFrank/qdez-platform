// src/app/api/forum/posts/[id]/like/route.ts
// 帖子点赞/取消点赞 API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { idParamSchema } from '@/lib/forum/validation'

/**
 * POST /api/forum/posts/[id]/like
 * 点赞或取消点赞帖子
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
          error: 'Invalid post ID',
        },
        { status: 400 }
      )
    }

    const { id: postId } = paramResult.data
    const userId = session.user.id

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
          error: 'Cannot like a deleted post',
        },
        { status: 400 }
      )
    }

    // 4. 检查是否已点赞
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
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
        prisma.postLike.delete({
          where: {
            id: existingLike.id,
          },
        }),
        // 减少帖子点赞数
        prisma.post.update({
          where: { id: postId },
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
        await tx.postLike.create({
          data: {
            postId,
            userId,
          },
        })

        // 增加帖子点赞数
        await tx.post.update({
          where: { id: postId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
        })

        // 如果点赞的不是自己的帖子，给作者增加积分
        if (post.authorId !== userId) {
          await tx.user.update({
            where: { id: post.authorId },
            data: {
              points: {
                increment: 1, // 获得点赞奖励1积分
              },
            },
          })
        }
      })

      liked = true
    }

    // 6. 查询更新后的点赞数
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likeCount: true,
      },
    })

    likeCount = updatedPost!.likeCount

    // 7. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        liked,
        likeCount,
      },
    })
  } catch (error) {
    console.error('Like post error:', error)

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
