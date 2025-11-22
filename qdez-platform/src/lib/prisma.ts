// src/lib/prisma.ts
// Prisma Client 单例模式
// 在开发环境中防止热重载时创建多个实例

import { PrismaClient } from '@prisma/client'

// 声明全局类型
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// 创建 Prisma Client 实例
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

// 在非生产环境中将实例保存到全局变量
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma