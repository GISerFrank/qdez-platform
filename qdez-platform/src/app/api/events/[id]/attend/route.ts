import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * POST /api/events/[id]/attend
 * 报名活动或取消报名
 */
export async function POST(
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
        const userId = session.user.id

        // 检查活动是否存在
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                _count: {
                    select: { attendees: true }
                }
            }
        })

        if (!event) {
            return NextResponse.json(
                { success: false, error: '活动不存在' },
                { status: 404 }
            )
        }

        // 检查活动是否已结束
        if (event.status === 'PAST' || event.status === 'CANCELLED') {
            return NextResponse.json(
                { success: false, error: '活动已结束或已取消' },
                { status: 400 }
            )
        }

        // 检查是否已报名
        const existingAttendee = await prisma.eventAttendee.findUnique({
            where: {
                eventId_userId: { eventId, userId }
            }
        })

        if (existingAttendee) {
            // 取消报名
            await prisma.$transaction([
                prisma.eventAttendee.delete({
                    where: {
                        eventId_userId: { eventId, userId }
                    }
                }),
                prisma.event.update({
                    where: { id: eventId },
                    data: { attendeeCount: { decrement: 1 } }
                })
            ])

            return NextResponse.json({
                success: true,
                data: {
                    attending: false,
                    attendeeCount: event.attendeeCount - 1
                }
            })
        } else {
            // 检查是否已满员
            if (event.maxAttendees && event._count.attendees >= event.maxAttendees) {
                return NextResponse.json(
                    { success: false, error: '活动已满员' },
                    { status: 400 }
                )
            }

            // 报名
            await prisma.$transaction([
                prisma.eventAttendee.create({
                    data: {
                        eventId,
                        userId,
                    }
                }),
                prisma.event.update({
                    where: { id: eventId },
                    data: { attendeeCount: { increment: 1 } }
                })
            ])

            return NextResponse.json({
                success: true,
                data: {
                    attending: true,
                    attendeeCount: event.attendeeCount + 1
                }
            })
        }

    } catch (error) {
        console.error('报名操作失败:', error)
        return NextResponse.json(
            { success: false, error: '操作失败' },
            { status: 500 }
        )
    }
}