// src/app/api/qa/questions/[id]/accept/route.ts
// 采纳最佳答案 API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { idParamSchema } from '@/lib/qa/validation'
import { z } from 'zod'

// 请求体验证
const acceptAnswerSchema = z.object({
    answerId: z.string().cuid('Invalid answer ID'),
})

/**
 * POST /api/qa/questions/[id]/accept
 * 采纳最佳答案
 *
 * 权限：只有提问者可以采纳答案
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 1. 验证用户登录
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                },
                { status: 401 }
            )
        }

        const currentUserId = session.user.id

        // 2. 验证问题ID
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

        // 3. 解析请求体
        const body = await request.json()
        const bodyResult = acceptAnswerSchema.safeParse(body)

        if (!bodyResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request data',
                    details: bodyResult.error.errors,
                },
                { status: 400 }
            )
        }

        const { answerId } = bodyResult.data

        // 4. 查询问题（验证提问者身份）
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            select: {
                id: true,
                authorId: true,
                solved: true,
                acceptedAnswerId: true,
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

        // 5. 验证权限：只有提问者可以采纳答案
        if (question.authorId !== currentUserId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Only the question author can accept an answer',
                },
                { status: 403 }
            )
        }

        // 6. 验证答案是否属于该问题
        const answer = await prisma.answer.findUnique({
            where: { id: answerId },
            select: {
                id: true,
                questionId: true,
                authorId: true,
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

        if (answer.questionId !== questionId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Answer does not belong to this question',
                },
                { status: 400 }
            )
        }

        // 7. 使用事务更新问题和答案状态
        const result = await prisma.$transaction(async (tx) => {
            // 如果之前有采纳的答案，取消它
            if (question.acceptedAnswerId) {
                await tx.answer.update({
                    where: { id: question.acceptedAnswerId },
                    data: { isAccepted: false },
                })
            }

            // 更新新的采纳答案
            const updatedAnswer = await tx.answer.update({
                where: { id: answerId },
                data: { isAccepted: true },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                },
            })

            // 更新问题状态为已解决
            const updatedQuestion = await tx.question.update({
                where: { id: questionId },
                data: {
                    solved: true,
                    acceptedAnswerId: answerId,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                    _count: {
                        select: {
                            answers: true,
                            likes: true,
                        },
                    },
                },
            })

            // TODO: 奖励被采纳答案的作者积分
            // await tx.user.update({
            //   where: { id: answer.authorId },
            //   data: { points: { increment: 50 } },
            // })

            return { updatedQuestion, updatedAnswer }
        })

        // 8. 格式化响应
        const formattedQuestion = {
            ...result.updatedQuestion,
            createdAt: result.updatedQuestion.createdAt.toISOString(),
            updatedAt: result.updatedQuestion.updatedAt.toISOString(),
            likeCount: result.updatedQuestion._count.likes,
            answerCount: result.updatedQuestion._count.answers,
        }

        const formattedAnswer = {
            ...result.updatedAnswer,
            createdAt: result.updatedAnswer.createdAt.toISOString(),
            updatedAt: result.updatedAnswer.updatedAt.toISOString(),
        }

        // 9. 返回响应
        return NextResponse.json({
            success: true,
            data: {
                question: formattedQuestion,
                answer: formattedAnswer,
            },
        })
    } catch (error) {
        console.error('Accept answer error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        )
    }
}