// src/app/profile/layout.tsx
// 个人主页布局 - 复用主页面的 Navigation 和 Footer

import ProfileLayoutClient from './ProfileLayoutClient'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <ProfileLayoutClient>{children}</ProfileLayoutClient>
}