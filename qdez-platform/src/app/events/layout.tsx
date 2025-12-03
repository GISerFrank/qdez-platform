// src/app/events/layout.tsx
// 活动布局 - 复用主页面的 Navigation 和 Footer

import EventsLayoutClient from './EventsLayoutClient'

export default function ForumLayout({ children }: { children: React.ReactNode }) {
    return <EventsLayoutClient>{children}</EventsLayoutClient>
}