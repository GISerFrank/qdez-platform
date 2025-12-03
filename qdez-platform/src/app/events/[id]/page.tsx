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
    status: string
    organizer: {
        id: string
        name: string
        displayName: string | null
        avatar: string | null
    }
    attendees: Array<{
        user: {
            id: string
            name: string
            displayName: string | null
            avatar: string | null
        }
    }>
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [event, setEvent] = useState<Event | null>(null)
    const [isAttending, setIsAttending] = useState(false)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchEvent()
    }, [params.id])

    const fetchEvent = async () => {
        try {
            const res = await fetch(`/api/events/${params.id}`)
            const data = await res.json()

            if (data.success) {
                setEvent(data.data.event)
                setIsAttending(data.data.isAttending)
            } else {
                alert('活动不存在')
                router.push('/events')
            }
        } catch (error) {
            console.error('获取活动详情失败:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAttend = async () => {
        try {
            setActionLoading(true)

            const res = await fetch(`/api/events/${params.id}/attend`, {
                method: 'POST',
            })

            const data = await res.json()

            if (data.success) {
                setIsAttending(data.data.attending)
                if (event) {
                    setEvent({
                        ...event,
                        attendeeCount: data.data.attendeeCount
                    })
                }
            } else {
                alert(data.error || '操作失败')
            }
        } catch (error) {
            console.error('操作失败:', error)
            alert('操作失败，请重试')
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="text-center opacity-70">加载中...</div>
            </div>
        )
    }

    if (!event) {
        return null
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        })
    }

    const canEdit = false // TODO: 检查是否是组织者

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            {/* 头部 */}
            <div className="post-card mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="mb-3">
                            <span className="post-tag">{event.type}</span>
                            {event.status === 'PAST' && (
                                <span className="badge ml-2" style={{ background: '#666' }}>已结束</span>
                            )}
                            {event.isOnline && (
                                <span className="badge ml-2" style={{ background: '#3b82f6' }}>线上活动</span>
                            )}
                        </div>
                        <h1 className="text-xl mb-4">{event.title}</h1>
                    </div>

                    {canEdit && (
                        <button
                            className="pixel-btn text-xs"
                            onClick={() => router.push(`/events/${event.id}/edit`)}
                        >
                            ✏️ 编辑
                        </button>
                    )}
                </div>

                {/* 元信息 */}
                <div className="post-meta mb-4">
                    <span>📅 {formatDate(event.date)}</span>
                    <span className="mx-2">|</span>
                    <span>⏰ {event.time}</span>
                    <span className="mx-2">|</span>
                    <span>📍 {event.location}</span>
                </div>

                <div className="post-meta mb-4">
                    <span>👤 组织者: {event.organizer.displayName || event.organizer.name}</span>
                    <span className="mx-2">|</span>
                    <span>
            👥 {event.attendeeCount}
                        {event.maxAttendees ? `/${event.maxAttendees}` : ''} 人参加
          </span>
                    <span className="mx-2">|</span>
                    <span>👁️ {event.viewCount} 浏览</span>
                </div>
            </div>

            {/* 描述 */}
            <div className="post-card mb-6">
                <h3 className="text-sm mb-3 text-yellow-300">📋 活动详情</h3>
                <div className="text-xs leading-relaxed whitespace-pre-wrap">
                    {event.description}
                </div>
            </div>

            {/* 报名按钮 */}
            {event.status === 'UPCOMING' && (
                <div className="post-card mb-6">
                    <button
                        className={`pixel-btn w-full ${isAttending ? 'pixel-btn-secondary' : ''}`}
                        onClick={handleAttend}
                        disabled={actionLoading || (!isAttending && event.maxAttendees !== null && event.attendeeCount >= event.maxAttendees)}
                    >
                        {actionLoading ? '处理中...' : isAttending ? '✅ 已报名 (点击取消)' : '🎫 我要报名'}
                    </button>

                    {!isAttending && event.maxAttendees !== null && event.attendeeCount >= event.maxAttendees && (
                        <p className="error-text mt-2 text-center">活动已满员</p>
                    )}
                </div>
            )}

            {/* 参与者列表 */}
            {event.attendees.length > 0 && (
                <div className="post-card">
                    <h3 className="text-sm mb-4 text-yellow-300">
                        👥 参与者 ({event.attendees.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {event.attendees.map(({ user }) => (
                            <div key={user.id} className="flex items-center gap-2 p-2 bg-gray-900 border border-gray-700">
                                <div className="w-8 h-8 bg-cyan-900 border border-cyan-500 flex items-center justify-center text-xs">
                                    {user.avatar ? '👤' : user.name[0]}
                                </div>
                                <span className="text-xs truncate">{user.displayName || user.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}