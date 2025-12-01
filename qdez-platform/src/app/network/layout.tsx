// src/app/network/layout.tsx
// 问答布局 - 复用主页面的 Navigation 和 Footer

import NetworkLayoutClient from './NetworkLayoutClient'

export default function NetworkLayout({ children }: { children: React.ReactNode }) {
    return <NetworkLayoutClient>{children}</NetworkLayoutClient>
}