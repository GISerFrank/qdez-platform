// src/app/api/qa/answers/[id]/vote/route.ts
// 答案投票 API（赞同/反对）

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { idParamSchema, voteSchema } from '@/lib/qa/validation'

/**
 * POST /api/qa/answers/[id]/vote
 * 对答案投票（赞同/反对）
 *
 * 逻辑：
 * - 如果用户未投票 → 添加投票
 * - 如果用户已投同类票 → 取消投票
 * - 如果用户已投异类票 → 切换投票类型
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

        // 3. 解析请求体
        const body = await request.json()
        const bodyResult = voteSchema.safeParse(body)

        if (!bodyResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid vote type',
                    details: bodyResult.error.errors,
                },
                { status: 400 }
            )
        }

        const { voteType } = bodyResult.data

        // 4. 检查答案是否存在
        const answer = await prisma.answer.findUnique({
            where: { id: answerId },
            select: {
                id: true,
                upvotes: true,
                downvotes: true,
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

        // 5. 查询用户当前的投票状态
        const existingVote = await prisma.answerVote.findUnique({
            where: {
                answerId_userId: {
                    answerId,
                    userId: currentUserId,
                },
            },
        })

        // 6. 使用事务处理投票逻辑
        const result = await prisma.$transaction(async (tx) => {
            let newVoteType: 'UPVOTE' | 'DOWNVOTE' | null = voteType
            let upvoteDelta = 0
            let downvoteDelta = 0

            if (!existingVote) {
                // 情况1：用户未投票 → 添加投票
                await tx.answerVote.create({
                    data: {
                        answerId,
                        userId: currentUserId,
                        voteType,
                    },
                })

                if (voteType === 'UPVOTE') {
                    upvoteDelta = 1
                } else {
                    downvoteDelta = 1
                }
            } else if (existingVote.voteType === voteType) {
                // 情况2：用户已投同类票 → 取消投票
                await tx.answerVote.delete({
                    where: {
                        answerId_userId: {
                            answerId,
                            userId: currentUserId,
                        },
                    },
                })

                if (voteType === 'UPVOTE') {
                    upvoteDelta = -1
                } else {
                    downvoteDelta = -1
                }

                newVoteType = null
            } else {
                // 情况3：用户已投异类票 → 切换投票类型
                await tx.answerVote.update({
                    where: {
                        answerId_userId: {
                            answerId,
                            userId: currentUserId,
                        },
                    },
                    data: {
                        voteType,
                    },
                })

                if (voteType === 'UPVOTE') {
                    upvoteDelta = 1
                    downvoteDelta = -1
                } else {
                    upvoteDelta = -1
                    downvoteDelta = 1
                }
            }

            // 更新答案的投票计数
            const updatedAnswer = await tx.answer.update({
                where: { id: answerId },
                data: {
                    upvotes: { increment: upvoteDelta },
                    downvotes: { increment: downvoteDelta },
                },
                select: {
                    upvotes: true,
                    downvotes: true,
                },
            })

            return {
                voteType: newVoteType,
                upvotes: updatedAnswer.upvotes,
                downvotes: updatedAnswer.downvotes,
            }
        })

        // 7. 返回响应
        return NextResponse.json({
            success: true,
            data: {
                voteType: result.voteType,
                upvotes: result.upvotes,
                downvotes: result.downvotes,
                voteScore: result.upvotes - result.downvotes,
            },
        })
    } catch (error) {
        console.error('Vote error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        )
    }
}