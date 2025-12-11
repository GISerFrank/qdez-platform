import prisma from "@/lib/prisma";

// 资源分类数据
const resourceCategories = [
    { id: 'study-materials', name: '学习资料', slug: 'study-materials', icon: '📚', description: '课程笔记、教材、学习指南等', sortOrder: 1 },
    { id: 'essay-templates', name: '文书模板', slug: 'essay-templates', icon: '📝', description: '申请文书、推荐信模板等', sortOrder: 2 },
    { id: 'resume-templates', name: '简历模板', slug: 'resume-templates', icon: '📄', description: '中英文简历模板', sortOrder: 3 },
    { id: 'data-reports', name: '数据报告', slug: 'data-reports', icon: '📊', description: '行业报告、数据分析等', sortOrder: 4 },
    { id: 'video-tutorials', name: '视频教程', slug: 'video-tutorials', icon: '🎬', description: '教学视频、讲座录像等', sortOrder: 5 },
    { id: 'tools', name: '实用工具', slug: 'tools', icon: '🔧', description: '软件工具、插件等', sortOrder: 6 },
]

// 邀请码数据（管理员生成的初始邀请码）
const inviteCodes = [
    {
        code: 'QDEZ2025-ALPHA-001',
        type: 'ADMIN_GENERATED' as const,
        maxUses: 10,
        note: '内测邀请码 - 第一批'
    },
    {
        code: 'QDEZ2025-ALPHA-002',
        type: 'ADMIN_GENERATED' as const,
        maxUses: 10,
        note: '内测邀请码 - 第二批'
    },
    {
        code: 'QDEZ2025-ALPHA-003',
        type: 'ADMIN_GENERATED' as const,
        maxUses: 10,
        note: '内测邀请码 - 第三批'
    },
    {
        code: 'QDEZ-FOUNDER-2025',
        type: 'SPECIAL' as const,
        maxUses: 50,
        note: '创始成员专属邀请码'
    },
    {
        code: 'QDEZ-VIP-UNLIMITED',
        type: 'SPECIAL' as const,
        maxUses: 100,
        note: 'VIP 邀请码'
    },
]

async function main() {
    console.log(`Start seeding ...`)

    // 1. Seed 资源分类
    console.log(`\n📚 Seeding resource categories...`)
    for (const category of resourceCategories) {
        const result = await prisma.resourceCategory.upsert({
            where: { id: category.id },
            update: {},
            create: category,
        })
        console.log(`  ✓ Upserted category: ${result.name}`)
    }

    // 2. Seed 邀请码
    console.log(`\n🎫 Seeding invite codes...`)
    // 设置过期时间为 1 年后
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    for (const invite of inviteCodes) {
        const result = await prisma.inviteCode.upsert({
            where: { code: invite.code },
            update: {
                // 更新时不改变使用次数等状态，只更新备注和过期时间
                note: invite.note,
                expiresAt,
            },
            create: {
                code: invite.code,
                type: invite.type,
                maxUses: invite.maxUses,
                currentUses: 0,
                isActive: true,
                expiresAt,
                note: invite.note,
            },
        })
        console.log(`  ✓ Upserted invite code: ${result.code} (max: ${invite.maxUses} uses)`)
    }

    console.log(`\n✅ Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })