// src/app/forum/layout.tsx
// 论坛布局 - 复用主页面的 Navigation 和 Footer

import ForumLayoutClient from './ForumLayoutClient'

export default function ForumLayout({ children }: { children: React.ReactNode }) {
    return <ForumLayoutClient>{children}</ForumLayoutClient>
}