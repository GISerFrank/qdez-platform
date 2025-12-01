// src/app/api/qa/questions/[id]/like/route.ts
// 问题点赞 API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { idParamSchema } from '@/lib/qa/validation'

/**
 * POST /api/qa/questions/[id]/like
 * 点赞/取消点赞问题
 */
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }  // ✅ 改这里
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
                likeCount: true,
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

        // 4. 查询是否已点赞
        const existingLike = await prisma.questionLike.findUnique({
            where: {
                questionId_userId: {
                    questionId,
                    userId: currentUserId,
                },
            },
        })

        // 5. 使用事务处理点赞/取消点赞
        const result = await prisma.$transaction(async (tx) => {
            let isLiked: boolean

            if (existingLike) {
                // 已点赞 → 取消点赞
                await tx.questionLike.delete({
                    where: {
                        questionId_userId: {
                            questionId,
                            userId: currentUserId,
                        },
                    },
                })

                await tx.question.update({
                    where: { id: questionId },
                    data: {
                        likeCount: { decrement: 1 },
                    },
                })

                isLiked = false
            } else {
                // 未点赞 → 添加点赞
                await tx.questionLike.create({
                    data: {
                        questionId,
                        userId: currentUserId,
                    },
                })

                await tx.question.update({
                    where: { id: questionId },
                    data: {
                        likeCount: { increment: 1 },
                    },
                })

                isLiked = true
            }

            // 获取更新后的点赞数
            const updatedQuestion = await tx.question.findUnique({
                where: { id: questionId },
                select: { likeCount: true },
            })

            return {
                isLiked,
                likeCount: updatedQuestion?.likeCount || 0,
            }
        })

        // 6. 返回响应
        return NextResponse.json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error('Like question error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        )
    }
}