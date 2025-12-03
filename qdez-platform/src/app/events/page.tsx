'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Event {
    id: string
    title: string
    description: string
    type: string
    date: string
    time: string
    location: string
    isOnline: boolean
    maxAttendees: number | null
    attendeeCount: number
    viewCount: number
    status: 'UPCOMING' | 'ONGOING' | 'PAST' | 'CANCELLED'
    organizer: {
        id: string
        name: string
        displayName: string | null
    }
}

export default function EventsPage() {
    const router = useRouter()
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
    const [statusFilter, setStatusFilter] = useState<'UPCOMING' | 'PAST' | ''>('')

    useEffect(() => {
        fetchEvents()
    }, [statusFilter])

    const fetchEvents = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (statusFilter) params.append('status', statusFilter)

            const res = await fetch(`/api/events?${params}`)
            const data = await res.json()

            if (data.success) {
                setEvents(data.data.events)
            }
        } catch (error) {
            console.error('获取活动列表失败:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return {
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear()
        }
    }

    const upcomingEvents = events.filter(e => e.status === 'UPCOMING')
    const pastEvents = events.filter(e => e.status === 'PAST')

    return (
        <div className="container mx-auto px-4 py-16">
            {/* 头部 */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl">
                    <span className="text-yellow-300">▸</span> 活动日历
                    <span className="text-yellow-300">◂</span>
                </h2>
                <button
                    className="pixel-btn"
                    onClick={() => router.push('/events/new')}
                >
                    + 创建活动
                </button>
            </div>

            {/* 视图切换 */}
            <div className="flex gap-3 mb-8">
                <button
                    className={`pixel-btn text-xs ${viewMode === 'list' ? '' : 'pixel-btn-secondary'}`}
                    onClick={() => setViewMode('list')}
                >
                    列表视图
                </button>
                <button
                    className={`pixel-btn text-xs ${viewMode === 'calendar' ? '' : 'pixel-btn-secondary'}`}
                    onClick={() => setViewMode('calendar')}
                >
                    日历视图
                </button>
            </div>

            {viewMode === 'list' && (
                <>
                    {/* 即将到来的活动 */}
                    <h3 className="text-lg mb-6 text-yellow-300">📅 即将到来</h3>

                    {loading ? (
                        <div className="text-center py-12 opacity-70">加载中...</div>
                    ) : upcomingEvents.length === 0 ? (
                        <div className="text-center py-12 opacity-70">暂无即将到来的活动</div>
                    ) : (
                        <div className="space-y-6">
                            {upcomingEvents.map(event => {
                                const { day, month } = formatDate(event.date)
                                return (
                                    <div key={event.id} className="event-card">
                                        {/* 日期徽章 */}
                                        <div className="event-date">
                                            <span className="event-day">{day}</span>
                                            <span className="event-month">{month}月</span>
                                        </div>

                                        {/* 类型标签 */}
                                        <div className="mb-3">
                                            <span className="post-tag">{event.type}</span>
                                        </div>

                                        {/* 标题 */}
                                        <h3 className="text-sm mb-3">{event.title}</h3>

                                        {/* 描述 */}
                                        <p className="text-xs leading-relaxed opacity-80 mb-4 line-clamp-2">
                                            {event.description}
                                        </p>

                                        {/* 元信息 */}
                                        <div className="post-meta mb-4">
                                            <span>📍 {event.location}</span>
                                            <span className="mx-2">|</span>
                                            <span>⏰ {event.time}</span>
                                            <span className="mx-2">|</span>
                                            <span>👤 {event.organizer.displayName || event.organizer.name}</span>
                                            <span className="mx-2">|</span>
                                            <span>
                        👥 {event.attendeeCount}
                                                {event.maxAttendees ? `/${event.maxAttendees}` : ''}
                      </span>
                                        </div>

                                        {/* 操作按钮 */}
                                        <div className="flex gap-3">
                                            <button
                                                className="pixel-btn text-xs pixel-btn-success"
                                                onClick={() => router.push(`/events/${event.id}`)}
                                            >
                                                查看详情
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* 往期活动 */}
                    <h3 className="text-lg mb-6 mt-12 text-yellow-300">📜 往期活动</h3>

                    {pastEvents.length === 0 ? (
                        <div className="text-center py-12 opacity-70">暂无往期活动</div>
                    ) : (
                        <div className="space-y-6">
                            {pastEvents.map(event => {
                                const { day, month } = formatDate(event.date)
                                return (
                                    <div key={event.id} className="event-card opacity-70">
                                        <div className="event-date">
                                            <span className="event-day">{day}</span>
                                            <span className="event-month">{month}月</span>
                                        </div>

                                        <div className="mb-3">
                                            <span className="post-tag">{event.type}</span>
                                            <span className="badge ml-2" style={{ background: '#666' }}>已结束</span>
                                        </div>

                                        <h3 className="text-sm mb-3">{event.title}</h3>
                                        <p className="text-xs leading-relaxed opacity-80 line-clamp-2">
                                            {event.description}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </>
            )}

            {viewMode === 'calendar' && (
                <div className="pixel-container p-6">
                    <div className="text-center text-sm opacity-70 py-12">
                        日历视图功能开发中...
                    </div>
                </div>
            )}
        </div>
    )
}