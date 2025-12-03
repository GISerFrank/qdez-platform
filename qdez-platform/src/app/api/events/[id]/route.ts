import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// 更新活动验证
const updateEventSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    type: z.string().min(1).optional(),
    date: z.string().datetime().optional(),
    time: z.string().min(1).optional(),
    location: z.string().min(1).max(200).optional(),
    isOnline: z.boolean().optional(),
    maxAttendees: z.number().int().positive().optional(),
    status: z.enum(['UPCOMING', 'ONGOING', 'PAST', 'CANCELLED']).optional(),
})

/**
 * GET /api/events/[id]
 * 获取活动详情
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        const eventId = params.id

        // 获取活动详情
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizer: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        displayName: true,
                        avatar: true,
                    }
                },
                attendees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                displayName: true,
                                avatar: true,
                            }
                        }
                    }
                }
            }
        })

        if (!event) {
            return NextResponse.json(
                { success: false, error: '活动不存在' },
                { status: 404 }
            )
        }

        // 增加浏览次数
        await prisma.event.update({
            where: { id: eventId },
            data: { viewCount: { increment: 1 } }
        })

        // 检查当前用户是否已报名
        let isAttending = false
        if (session?.user?.id) {
            const attendee = await prisma.eventAttendee.findUnique({
                where: {
                    eventId_userId: {
                        eventId,
                        userId: session.user.id
                    }
                }
            })
            isAttending = !!attendee
        }

        return NextResponse.json({
            success: true,
            data: {
                event,
                isAttending
            }
        })

    } catch (error) {
        console.error('获取活动详情失败:', error)
        return NextResponse.json(
            { success: false, error: '获取活动详情失败' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/events/[id]
 * 更新活动
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: '请先登录' },
                { status: 401 }
            )
        }

        const eventId = params.id

        // 检查活动是否存在
        const existingEvent = await prisma.event.findUnique({
            where: { id: eventId }
        })

        if (!existingEvent) {
            return NextResponse.json(
                { success: false, error: '活动不存在' },
                { status: 404 }
            )
        }

        // 检查权限（只有组织者可以编辑）
        if (existingEvent.organizerId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: '只有活动组织者可以编辑' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const validatedData = updateEventSchema.parse(body)

        // 处理日期
        const updateData: any = { ...validatedData }
        if (validatedData.date) {
            updateData.date = new Date(validatedData.date)
        }

        const event = await prisma.event.update({
            where: { id: eventId },
            data: updateData,
            include: {
                organizer: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        displayName: true,
                        avatar: true,
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: { event }
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('更新活动失败:', error)
        return NextResponse.json(
            { success: false, error: '更新活动失败' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/events/[id]
 * 删除活动
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: '请先登录' },
                { status: 401 }
            )
        }

        const eventId = params.id

        // 检查活动是否存在
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        })

        if (!event) {
            return NextResponse.json(
                { success: false, error: '活动不存在' },
                { status: 404 }
            )
        }

        // 检查权限
        if (event.organizerId !== session.user.id) {
            return NextResponse.json(
                { success: false, error: '只有活动组织者可以删除' },
                { status: 403 }
            )
        }

        await prisma.event.delete({
            where: { id: eventId }
        })

        return NextResponse.json({
            success: true,
            message: '活动已删除'
        })

    } catch (error) {
        console.error('删除活动失败:', error)
        return NextResponse.json(
            { success: false, error: '删除活动失败' },
            { status: 500 }
        )
    }
}