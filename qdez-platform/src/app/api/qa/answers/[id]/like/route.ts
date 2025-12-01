// src/app/api/qa/answers/[id]/like/route.ts
// 答案点赞 API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { idParamSchema } from '@/lib/qa/validation'

/**
 * POST /api/qa/answers/[id]/like
 * 点赞/取消点赞答案
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

        // 2. 验证答案ID
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

        const { id: answerId } = paramResult.data

        // 3. 检查答案是否存在
        const answer = await prisma.answer.findUnique({
            where: { id: answerId },
            select: {
                id: true,
                likeCount: true,
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

        // 4. 查询是否已点赞
        const existingLike = await prisma.answerLike.findUnique({
            where: {
                answerId_userId: {
                    answerId,
                    userId: currentUserId,
                },
            },
        })

        // 5. 使用事务处理点赞/取消点赞
        const result = await prisma.$transaction(async (tx) => {
            let isLiked: boolean

            if (existingLike) {
                // 已点赞 → 取消点赞
                await tx.answerLike.delete({
                    where: {
                        answerId_userId: {
                            answerId,
                            userId: currentUserId,
                        },
                    },
                })

                await tx.answer.update({
                    where: { id: answerId },
                    data: {
                        likeCount: { decrement: 1 },
                    },
                })

                isLiked = false
            } else {
                // 未点赞 → 添加点赞
                await tx.answerLike.create({
                    data: {
                        answerId,
                        userId: currentUserId,
                    },
                })

                await tx.answer.update({
                    where: { id: answerId },
                    data: {
                        likeCount: { increment: 1 },
                    },
                })

                isLiked = true
            }

            // 获取更新后的点赞数
            const updatedAnswer = await tx.answer.findUnique({
                where: { id: answerId },
                select: { likeCount: true },
            })

            return {
                isLiked,
                likeCount: updatedAnswer?.likeCount || 0,
            }
        })

        // 6. 返回响应
        return NextResponse.json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error('Like answer error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        )
    }
}