// src/app/api/qa/answers/[id]/route.ts
// 单个答案的详情、更新、删除 API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import {
  updateAnswerSchema,
  idParamSchema,
} from '@/lib/qa/validation'

// 获取作者信息的选择字段
function getAuthorSelect() {
  return {
    id: true,
    username: true,
    name: true,
    displayName: true,
    avatarUrl: true,
  }
}

// 检查是否可以编辑答案
function canEditAnswer(authorId: string, userId: string, isAdmin: boolean): boolean {
  return authorId === userId || isAdmin
}

/**
 * GET /api/qa/answers/[id]
 * 获取单个答案详情
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
            error: 'Invalid answer ID',
          },
          { status: 400 }
      )
    }

    const { id } = paramResult.data

    // 2. 查询答案详情
    const answer = await prisma.answer.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
        questionId: true,
        authorId: true,
        isAccepted: true,  // 🆕 是否被采纳
        upvotes: true,     // 🆕 赞同数
        downvotes: true,   // 🆕 反对数
        likeCount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: getAuthorSelect(),
        },
        question: {
          select: {
            id: true,
            title: true,
            authorId: true,
          },
        },
      },
    })

    if (!answer) {
      return NextResponse.json(
          {
            success: false,
            error: 'Answer not found',
          },
          { status: 404 }
      )
    }

    // 3. 获取当前用户（如果已登录）
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id

    // 4. 查询当前用户的投票和点赞状态
    let userVote: 'UPVOTE' | 'DOWNVOTE' | null = null
    let isLiked = false

    if (currentUserId) {
      // 查询投票状态
      const vote = await prisma.answerVote.findUnique({
        where: {
          answerId_userId: {
            answerId: id,
            userId: currentUserId,
          },
        },
      })
      userVote = vote ? vote.voteType : null

      // 查询点赞状态
      const like = await prisma.answerLike.findUnique({
        where: {
          answerId_userId: {
            answerId: id,
            userId: currentUserId,
          },
        },
      })
      isLiked = !!like
    }

    // 5. 格式化数据
    const formattedAnswer = {
      ...answer,
      createdAt: answer.createdAt.toISOString(),
      updatedAt: answer.updatedAt.toISOString(),
      voteScore: answer.upvotes - answer.downvotes,  // 🆕 投票分数
      userVote,  // 🆕 用户的投票
      isLiked,
    }

    // 6. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        answer: formattedAnswer,
      },
    })
  } catch (error) {
    console.error('Get answer detail error:', error)
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
 * PUT /api/qa/answers/[id]
 * 更新答案
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
            error: 'Invalid answer ID',
          },
          { status: 400 }
      )
    }

    const { id } = paramResult.data

    // 3. 查询答案
    const existingAnswer = await prisma.answer.findUnique({
      where: { id },
      select: {
        authorId: true,
        status: true,
        isAccepted: true,  // 🆕 检查是否被采纳
      },
    })

    if (!existingAnswer) {
      return NextResponse.json(
          {
            success: false,
            error: 'Answer not found',
          },
          { status: 404 }
      )
    }

    if (existingAnswer.status === 'DELETED') {
      return NextResponse.json(
          {
            success: false,
            error: 'Cannot update deleted answer',
          },
          { status: 400 }
      )
    }

    // 4. 检查权限
    const isAdmin = session.user.role === 'ADMIN'
    if (!canEditAnswer(existingAnswer.authorId, session.user.id, isAdmin)) {
      return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: You can only edit your own answers',
          },
          { status: 403 }
      )
    }

    // 5. 解析请求体
    const body = await request.json()

    // 6. 验证数据
    const validationResult = updateAnswerSchema.safeParse(body)

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

    // 7. 更新答案
    const updatedAnswer = await prisma.answer.update({
      where: { id },
      data: {
        content,
      },
      include: {
        author: {
          select: getAuthorSelect(),
        },
      },
    })

    // 8. 格式化响应数据
    const formattedAnswer = {
      ...updatedAnswer,
      createdAt: updatedAnswer.createdAt.toISOString(),
      updatedAt: updatedAnswer.updatedAt.toISOString(),
      voteScore: updatedAnswer.upvotes - updatedAnswer.downvotes,
    }

    // 9. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        answer: formattedAnswer,
      },
    })
  } catch (error) {
    console.error('Update answer error:', error)
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
 * DELETE /api/qa/answers/[id]
 * 删除答案（软删除）
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
            error: 'Invalid answer ID',
          },
          { status: 400 }
      )
    }

    const { id } = paramResult.data

    // 3. 查询答案
    const existingAnswer = await prisma.answer.findUnique({
      where: { id },
      select: {
        authorId: true,
        status: true,
        isAccepted: true,
        questionId: true,
      },
    })

    if (!existingAnswer) {
      return NextResponse.json(
          {
            success: false,
            error: 'Answer not found',
          },
          { status: 404 }
      )
    }

    if (existingAnswer.status === 'DELETED') {
      return NextResponse.json(
          {
            success: false,
            error: 'Answer already deleted',
          },
          { status: 400 }
      )
    }

    // 4. 检查权限
    const isAdmin = session.user.role === 'ADMIN'
    if (!canEditAnswer(existingAnswer.authorId, session.user.id, isAdmin)) {
      return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: You can only delete your own answers',
          },
          { status: 403 }
      )
    }

    // 5. 🆕 如果这是被采纳的答案，需要同时更新问题的状态
    if (existingAnswer.isAccepted) {
      await prisma.$transaction([
        // 取消问题的采纳答案
        prisma.question.update({
          where: { id: existingAnswer.questionId },
          data: {
            solved: false,
            acceptedAnswerId: null,
          },
        }),
        // 删除答案
        prisma.answer.update({
          where: { id },
          data: {
            status: 'DELETED',
          },
        }),
      ])
    } else {
      // 普通答案直接软删除
      await prisma.answer.update({
        where: { id },
        data: {
          status: 'DELETED',
        },
      })
    }

    // 6. 返回响应
    return NextResponse.json({
      success: true,
      message: 'Answer deleted successfully',
    })
  } catch (error) {
    console.error('Delete answer error:', error)
    return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
        },
        { status: 500 }
    )
  }
}