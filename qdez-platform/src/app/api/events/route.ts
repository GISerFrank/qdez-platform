import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// 创建活动验证
const createEventSchema = z.object({
    title: z.string().min(1, '请输入标题').max(200, '标题最多200字'),
    description: z.string().min(10, '描述至少10个字').max(5000, '描述最多5000字'),
    type: z.string().min(1, '请选择活动类型'),
    date: z.string().datetime('请选择有效的日期时间'),
    time: z.string().min(1, '请输入活动时间'),
    location: z.string().min(1, '请输入活动地点').max(200, '地点最多200字'),
    isOnline: z.boolean().optional(),
    maxAttendees: z.number().int().positive().optional(),
})

/**
 * GET /api/events
 * 获取活动列表
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        const page = parseInt(searchParams.get('page') || '1')
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
        const status = searchParams.get('status') as 'UPCOMING' | 'PAST' | null
        const type = searchParams.get('type')

        // 构建查询条件
        const where: any = {}

        if (status) {
            where.status = status
        }

        if (type) {
            where.type = type
        }

        // 查询活动
        const [events, total] = await Promise.all([
            prisma.event.findMany({
                where,
                orderBy: [
                    { date: 'desc' },
                    { createdAt: 'desc' }
                ],
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    type: true,
                    date: true,
                    time: true,
                    location: true,
                    isOnline: true,
                    maxAttendees: true,
                    attendeeCount: true,
                    viewCount: true,
                    status: true,
                    createdAt: true,
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
            }),
            prisma.event.count({ where })
        ])

        return NextResponse.json({
            success: true,
            data: {
                events,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        })

    } catch (error) {
        console.error('获取活动列表失败:', error)
        return NextResponse.json(
            { success: false, error: '获取活动列表失败' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/events
 * 创建新活动
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: '请先登录' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const validatedData = createEventSchema.parse(body)

        const event = await prisma.event.create({
            data: {
                ...validatedData,
                date: new Date(validatedData.date),
                organizerId: session.user.id,
            },
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
        }, { status: 201 })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('创建活动失败:', error)
        return NextResponse.json(
            { success: false, error: '创建活动失败' },
            { status: 500 }
        )
    }
}