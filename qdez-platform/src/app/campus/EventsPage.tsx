'use client'

import { useState } from 'react'
import { eventsData } from '@/lib/mockData'

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const upcomingEvents = eventsData.filter(e => e.status === 'upcoming')
  const pastEvents = eventsData.filter(e => e.status === 'past')

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl">
          <span className="text-yellow-300">▸</span> 活动日历 
          <span className="text-yellow-300">◂</span>
        </h2>
        <button className="pixel-btn">+ 创建活动</button>
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
          <div>
            {upcomingEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-date">
                  <span className="event-day">{event.date.split('-')[2]}</span>
                  <span className="event-month">{event.date.split('-')[1]}月</span>
                </div>
                <div className="mb-3">
                  <span className="post-tag">{event.type}</span>
                </div>
                <h3 className="text-sm mb-3">{event.title}</h3>
                <p className="text-xs leading-relaxed opacity-80 mb-4">{event.description}</p>
                <div className="post-meta mb-4">
                  <span>📍 {event.location}</span>
                  <span className="mx-2">|</span>
                  <span>⏰ {event.time}</span>
                  <span className="mx-2">|</span>
                  <span>👤 {event.organizer}</span>
                  <span className="mx-2">|</span>
                  <span>👥 {event.attendees}/{event.maxAttendees || '不限'}</span>
                </div>
                <div className="flex gap-3">
                  <button className="pixel-btn text-xs pixel-btn-success">查看详情</button>
                  <button className="pixel-btn text-xs">我要报名</button>
                </div>
              </div>
            ))}
          </div>

          {/* 往期活动 */}
          <h3 className="text-lg mb-6 mt-12 text-yellow-300">📜 往期活动</h3>
          <div>
            {pastEvents.map(event => (
              <div key={event.id} className="event-card" style={{ opacity: 0.7 }}>
                <div className="event-date">
                  <span className="event-day">{event.date.split('-')[2]}</span>
                  <span className="event-month">{event.date.split('-')[1]}月</span>
                </div>
                <div className="mb-3">
                  <span className="post-tag">{event.type}</span>
                  <span className="badge" style={{ background: '#666' }}>已结束</span>
                </div>
                <h3 className="text-sm mb-3">{event.title}</h3>
                <p className="text-xs leading-relaxed opacity-80">{event.description}</p>
              </div>
            ))}
          </div>
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
