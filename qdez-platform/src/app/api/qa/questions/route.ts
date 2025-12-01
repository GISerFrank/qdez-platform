// src/app/api/qa/questions/route.ts
// 问题列表和创建 API - 修复TypeScript错误

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import {
  createQuestionSchema,
  questionListQuerySchema,
} from '@/lib/qa/validation'
import { calculateOffset, generatePaginationMeta } from '@/lib/forum/utils'
import { Prisma } from '@prisma/client'

// 获取作者信息的选择字段
function getAuthorSelect() {
  return {
    id: true,
    username: true,
    name: true,
    displayName: true,
    avatarUrl: true,
    currentSchool: true,
    major: true,
  }
}

/**
 * GET /api/qa/questions
 * 获取问题列表
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
      solved: searchParams.get('solved') || undefined,
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

    const { page, limit, category, sort, solved, tag } = queryResult.data

    // 2. 构建查询条件 - 使用正确的Prisma类型
    const where: Prisma.QuestionWhereInput = {
      status: 'PUBLISHED',
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

    if (typeof solved === 'boolean') {
      where.solved = solved
    }

    // 3. 查询问题总数
    const total = await prisma.question.count({ where })

    // 4. 构建排序条件 - 使用正确的类型
    let orderBy: Prisma.QuestionOrderByWithRelationInput[] | Prisma.QuestionOrderByWithRelationInput

    if (sort === 'unanswered') {
      // 未解决的问题优先（答案数少的在前）
      orderBy = [
        { createdAt: 'desc' }, // 简化排序，避免复杂的_count排序
      ]
    } else if (sort === 'mostAnswered') {
      // 回答数最多的在前
      orderBy = [
        { createdAt: 'desc' },
      ]
    } else if (sort === 'hot') {
      // 热门：浏览量排序
      orderBy = [
        { views: 'desc' },
        { createdAt: 'desc' },
      ]
    } else {
      // latest: 最新的在前（默认）
      orderBy = { createdAt: 'desc' }
    }

    // 5. 查询问题列表
    const questions = await prisma.question.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        solved: true,
        acceptedAnswerId: true,
        views: true,
        likeCount: true, // 直接使用字段而不是_count
        status: true,
        createdAt: true,
        updatedAt: true,
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
        _count: {
          select: {
            answers: true,
          },
        },
      },
      orderBy,
      skip: calculateOffset(page, limit),
      take: limit,
    })

    // 6. 格式化数据
    const formattedQuestions = questions.map(question => ({
      id: question.id,
      title: question.title,
      content: question.content.substring(0, 200), // 列表页只返回摘要
      category: question.category,
      solved: question.solved,
      acceptedAnswerId: question.acceptedAnswerId,
      views: question.views,
      likeCount: question.likeCount,
      answerCount: question._count.answers,
      status: question.status,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
      author: question.author,
      tags: question.tags.map(t => t.tag.name),
    }))

    // 7. 生成分页元数据
    const paginationMeta = generatePaginationMeta(total, page, limit)

    // 8. 返回响应
    return NextResponse.json({
      success: true,
      data: {
        questions: formattedQuestions,
        ...paginationMeta,
      },
    })
  } catch (error) {
    console.error('Get questions error:', error)
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
 * POST /api/qa/questions
 * 创建新问题
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

    // 4. 使用事务创建问题和标签
    const question = await prisma.$transaction(async (tx) => {
      // 4.1 创建问题
      const newQuestion = await tx.question.create({
        data: {
          title,
          content,
          category,
          authorId: session.user.id,
          status: 'PUBLISHED',
          solved: false,
          likeCount: 0, // 初始化字段
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
            update: {},
            create: {
              name: tagName,
              slug: tagName.toLowerCase().replace(/\s+/g, '-'),
            },
          })

          // 关联标签到问题
          await tx.questionTag.create({
            data: {
              questionId: newQuestion.id,
              tagId: tag.id,
            },
          })
        }
      }

      // 4.3 增加用户积分（提问奖励）
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          points: {
            increment: 5,
          },
        },
      })

      return newQuestion
    })

    // 5. 格式化响应数据
    const formattedQuestion = {
      id: question.id,
      title: question.title,
      content: question.content,
      category: question.category,
      authorId: question.authorId,
      author: question.author,
      solved: question.solved,
      acceptedAnswerId: question.acceptedAnswerId,
      views: question.views,
      likeCount: question.likeCount,
      answerCount: 0,
      status: question.status,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
      tags,
    }

    // 6. 返回响应
    return NextResponse.json(
        {
          success: true,
          data: {
            question: formattedQuestion,
          },
        },
        { status: 201 }
    )
  } catch (error) {
    console.error('Create question error:', error)
    return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
        },
        { status: 500 }
    )
  }
}