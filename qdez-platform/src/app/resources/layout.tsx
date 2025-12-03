// src/app/resources/layout.tsx
// 问答布局 - 复用主页面的 Navigation 和 Footer

import ResourcesLayoutClient from './ResourcesLayoutClient'

export default function QALayout({ children }: { children: React.ReactNode }) {
    return <ResourcesLayoutClient>{children}</ResourcesLayoutClient>
}