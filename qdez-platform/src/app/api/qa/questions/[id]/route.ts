// src/app/api/qa/questions/[id]/route.ts
// 单个问题的详情、更新、删除 API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import {
  updateQuestionSchema,
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

// 检查是否可以编辑问题
function canEditQuestion(authorId: string, userId: string, isAdmin: boolean): boolean {
  return authorId === userId || isAdmin
}

/**
 * GET /api/qa/questions/[id]
 * 获取问题详情
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
            error: 'Invalid question ID',
          },
          { status: 400 }
      )
    }

    const { id } = paramResult.data

    // 2. 查询问题详情
    const question = await prisma.question.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        solved: true,  // 🆕 是否已解决
        acceptedAnswerId: true,  // 🆕 采纳的答案ID
        views: true,
        status: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: getAuthorSelect(),
        },
        // 🆕 包含采纳的答案详情
        acceptedAnswer: {
          select: {
            id: true,
            content: true,
            authorId: true,
            author: {
              select: getAuthorSelect(),
            },
            upvotes: true,
            downvotes: true,
            isAccepted: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            answers: true,  // 🆕 答案总数
            likes: true,
          },
        },
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

    // 3. 获取当前用户（如果已登录）
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id

    // 4. 查询当前用户的点赞状态
    let isLiked = false

    if (currentUserId) {
      const like = await prisma.questionLike.findUnique({
        where: {
          questionId_userId: {
            questionId: id,
            userId: currentUserId,
          },
        },
      })
      isLiked = !!like
    }

    // 5. 增加浏览次数
    await prisma.question.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    })

    // 6. 格式化数据
    const formattedQuestion = {
      ...question,
      tags: question.tags.map(t => t.tag.name),
      likeCount: question._count.likes,
      answerCount: question._count.answers,  // 🆕 答案数量
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
      // 🆕 格式化采纳的答案
      acceptedAnswer: question.acceptedAnswer ? {
        ...question.acceptedAnswer,
        createdAt: question.acceptedAnswer.createdAt.toISOString(),
        updatedAt: question.acceptedAnswer.updatedAt.toISOString(),
        voteScore: question.acceptedAnswer.upvotes - question.acceptedAnswer.downvotes,
      } : null,
      isLiked,
    }

    // 7. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        question: formattedQuestion,
      },
    })
  } catch (error) {
    console.error('Get question detail error:', error)
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
 * PUT /api/qa/questions/[id]
 * 更新问题
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
            error: 'Invalid question ID',
          },
          { status: 400 }
      )
    }

    const { id } = paramResult.data

    // 3. 查询问题
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      select: {
        authorId: true,
        status: true,
        solved: true,  // 🆕 检查是否已解决
      },
    })

    if (!existingQuestion) {
      return NextResponse.json(
          {
            success: false,
            error: 'Question not found',
          },
          { status: 404 }
      )
    }

    if (existingQuestion.status === 'DELETED') {
      return NextResponse.json(
          {
            success: false,
            error: 'Cannot update deleted question',
          },
          { status: 400 }
      )
    }

    // 4. 检查权限
    const isAdmin = session.user.role === 'ADMIN'
    if (!canEditQuestion(existingQuestion.authorId, session.user.id, isAdmin)) {
      return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: You can only edit your own questions',
          },
          { status: 403 }
      )
    }

    // 5. 解析请求体
    const body = await request.json()

    // 6. 验证数据
    const validationResult = updateQuestionSchema.safeParse(body)

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

    // 7. 使用事务更新问题
    const updatedQuestion = await prisma.$transaction(async (tx) => {
      // 7.1 更新问题基本信息
      const updated = await tx.question.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content && { content }),
          ...(category && { category }),
        },
        include: {
          author: {
            select: getAuthorSelect(),
          },
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

      // 7.2 如果提供了标签，更新标签
      if (tags) {
        // 删除旧的标签关联
        await tx.questionTag.deleteMany({
          where: { questionId: id },
        })

        // 创建新的标签关联
        for (const tagName of tags) {
          const tag = await tx.tag.upsert({
            where: { name: tagName },
            update: {},
            create: {
              name: tagName,
              slug: tagName.toLowerCase().replace(/\s+/g, '-'),
            },
          })

          await tx.questionTag.create({
            data: {
              questionId: id,
              tagId: tag.id,
            },
          })
        }
      }

      return updated
    })

    // 8. 格式化响应数据
    const formattedQuestion = {
      ...updatedQuestion,
      tags: tags || updatedQuestion.tags.map(t => t.tag.name),
      createdAt: updatedQuestion.createdAt.toISOString(),
      updatedAt: updatedQuestion.updatedAt.toISOString(),
    }

    // 9. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        question: formattedQuestion,
      },
    })
  } catch (error) {
    console.error('Update question error:', error)
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
 * DELETE /api/qa/questions/[id]
 * 删除问题（软删除）
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
            error: 'Invalid question ID',
          },
          { status: 400 }
      )
    }

    const { id } = paramResult.data

    // 3. 查询问题
    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      select: {
        authorId: true,
        status: true,
      },
    })

    if (!existingQuestion) {
      return NextResponse.json(
          {
            success: false,
            error: 'Question not found',
          },
          { status: 404 }
      )
    }

    if (existingQuestion.status === 'DELETED') {
      return NextResponse.json(
          {
            success: false,
            error: 'Question already deleted',
          },
          { status: 400 }
      )
    }

    // 4. 检查权限
    const isAdmin = session.user.role === 'ADMIN'
    if (!canEditQuestion(existingQuestion.authorId, session.user.id, isAdmin)) {
      return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: You can only delete your own questions',
          },
          { status: 403 }
      )
    }

    // 5. 软删除问题
    await prisma.question.update({
      where: { id },
      data: {
        status: 'DELETED',
      },
    })

    // 6. 返回响应
    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully',
    })
  } catch (error) {
    console.error('Delete question error:', error)
    return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
        },
        { status: 500 }
    )
  }
}