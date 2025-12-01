// src/app/api/qa/questions/[id]/answers/route.ts
// 答案列表和创建 API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import {
  createAnswerSchema,
  answerListQuerySchema,
  idParamSchema,
} from '@/lib/qa/validation'
import { calculateOffset } from '@/lib/forum/utils'

// 获取答案作者信息的选择字段
function getAnswerAuthorSelect() {
  return {
    id: true,
    username: true,
    name: true,
    displayName: true,
    avatarUrl: true,
  }
}

/**
 * GET /api/qa/questions/[id]/answers
 * 获取问题的答案列表
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }  // ✅ 改这里
) {
  try {
    // 1. 验证问题 ID
    const params = await context.params  // ✅ 加这行
    const paramResult = idParamSchema.safeParse(params)

    if (!paramResult.success) {
      return NextResponse.json(
          {
            success: false,
            error: 'Invalid question ID',
          },
          { status: 400 }
      )
    }

    const { id: questionId } = paramResult.data

    // 2. 检查问题是否存在
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, status: true },
    })

    if (!question) {
      return NextResponse.json(
          {
            success: false,
            error: 'Question not found',
          },
          { status: 404 }
      )
    }

    // 3. 解析查询参数
    const { searchParams } = new URL(request.url)
    const queryResult = answerListQuerySchema.safeParse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
      sort: searchParams.get('sort') || 'votes',
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

    // 5. 查询答案总数
    const total = await prisma.answer.count({
      where: {
        questionId,
      },
    })

    // 6. 构建排序条件（采纳答案优先）
    const orderBy = sort === 'votes'
        ? [
          { isAccepted: 'desc' as const },  // 🆕 采纳的答案永远在最上面
          { upvotes: 'desc' as const },     // 🆕 然后按赞同数
          { createdAt: 'desc' as const },   // 最后按时间
        ]
        : [{ createdAt: 'desc' as const }]  // latest: 最新的在前

    // 7. 查询答案列表
    const answers = await prisma.answer.findMany({
      where: {
        questionId,
        // 🆕 问答没有嵌套回复，不需要 parentId 过滤
      },
      select: {
        id: true,
        content: true,
        questionId: true,
        authorId: true,
        author: {
          select: getAnswerAuthorSelect(),
        },
        isAccepted: true,  // 🆕 是否被采纳
        upvotes: true,     // 🆕 赞同数
        downvotes: true,   // 🆕 反对数
        likeCount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // 🆕 问答没有 replies
      },
      orderBy,
      skip: calculateOffset(page, limit),
      take: limit,
    })

    // 8. 如果用户已登录，查询投票状态和点赞状态
    let votedAnswers = new Map<string, 'UPVOTE' | 'DOWNVOTE'>()
    let likedAnswerIds = new Set<string>()

    if (currentUserId) {
      const answerIds = answers.map(a => a.id)

      // 🆕 查询投票状态（而不是点赞状态）
      const votes = await prisma.answerVote.findMany({
        where: {
          answerId: { in: answerIds },
          userId: currentUserId,
        },
        select: {
          answerId: true,
          voteType: true,  // 🆕 UPVOTE 或 DOWNVOTE
        },
      })

      votedAnswers = new Map(votes.map(v => [v.answerId, v.voteType]))

      // 查询点赞状态（问答答案同时支持投票和点赞）
      const likes = await prisma.answerLike.findMany({
        where: {
          answerId: { in: answerIds },
          userId: currentUserId,
        },
        select: {
          answerId: true,
        },
      })

      likedAnswerIds = new Set(likes.map(like => like.answerId))
    }

    // 9. 格式化数据
    const formattedAnswers = answers.map(answer => ({
      ...answer,
      createdAt: answer.createdAt.toISOString(),
      updatedAt: answer.updatedAt.toISOString(),
      voteScore: answer.upvotes - answer.downvotes,  // 🆕 投票分数
      userVote: votedAnswers.get(answer.id) || null,  // 🆕 用户的投票
      isLiked: likedAnswerIds.has(answer.id),
      // 🆕 问答没有 replies
    }))

    // 10. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        answers: formattedAnswers,
        total,
      },
    })
  } catch (error) {
    console.error('Get answers error:', error)
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
 * POST /api/qa/questions/[id]/answers
 * 发表答案
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

    // 2. 验证问题 ID
    const params = await context.params  // ✅ 加这行
    const paramResult = idParamSchema.safeParse(params)

    if (!paramResult.success) {
      return NextResponse.json(
          {
            success: false,
            error: 'Invalid question ID',
          },
          { status: 400 }
      )
    }

    const { id: questionId } = paramResult.data

    // 3. 检查问题是否存在
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        status: true,
        authorId: true,
      },
    })

    if (!question) {
      return NextResponse.json(
          {
            success: false,
            error: 'Question not found',
          },
          { status: 404 }
      )
    }

    if (question.status === 'DELETED') {
      return NextResponse.json(
          {
            success: false,
            error: 'Cannot answer a deleted question',
          },
          { status: 400 }
      )
    }

    // 4. 解析请求体
    const body = await request.json()

    // 5. 验证数据
    const validationResult = createAnswerSchema.safeParse(body)

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
    // 🆕 问答不需要 parentId

    // 6. 使用事务创建答案
    const answer = await prisma.$transaction(async (tx) => {
      // 6.1 创建答案
      const newAnswer = await tx.answer.create({
        data: {
          content,
          questionId,
          authorId: session.user.id,
          // 🆕 问答不需要 parentId
        },
        include: {
          author: {
            select: getAnswerAuthorSelect(),
          },
        },
      })

      // 6.2 增加用户积分（回答问题奖励）
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          points: {
            increment: 3, // 回答问题奖励3积分
          },
        },
      })

      return newAnswer
    })

    // 7. 格式化响应数据
    const formattedAnswer = {
      ...answer,
      createdAt: answer.createdAt.toISOString(),
      updatedAt: answer.updatedAt.toISOString(),
      voteScore: 0,  // 🆕 新答案投票分数为0
      userVote: null,  // 🆕 新答案没有投票
      isLiked: false,
    }

    // 8. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        answer: formattedAnswer,
      },
    })
  } catch (error) {
    console.error('Create answer error:', error)
    return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
        },
        { status: 500 }
    )
  }
}