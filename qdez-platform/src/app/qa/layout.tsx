// src/app/qa/layout.tsx
// 问答布局 - 复用主页面的 Navigation 和 Footer

import QALayoutClient from './QALayoutClient'

export default function QALayout({ children }: { children: React.ReactNode }) {
    return <QALayoutClient>{children}</QALayoutClient>
}