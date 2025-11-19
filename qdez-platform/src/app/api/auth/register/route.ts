import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { completeRegistrationSchema } from '@/lib/validation';

const prisma = new PrismaClient();

/**
 * 用户注册 API
 * POST /api/auth/register
 *
 * 请求体: 包含所有4个步骤的完整数据
 * 响应: { success: true, user: {...} } 或 { error: "错误信息" }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // 🔍 添加这行：打印收到的数据
        console.log('📥 Received body:', JSON.stringify(body, null, 2));

        // 1. 验证所有字段
        const validationResult = completeRegistrationSchema.safeParse(body);
        if (!validationResult.success) {
            // 🔍 添加这行：打印验证错误
            console.log('❌ Validation errors:', JSON.stringify(validationResult.error.errors, null, 2));

            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.errors
                },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // 2. 验证邀请码
        const inviteCode = await prisma.inviteCode.findUnique({
            where: { code: data.inviteCode.toUpperCase() },
        });

        if (!inviteCode || !inviteCode.isActive || new Date() > inviteCode.expiresAt) {
            return NextResponse.json(
                { error: 'Invalid or expired invite code' },
                { status: 400 }
            );
        }

        if (inviteCode.currentUses >= inviteCode.maxUses) {
            return NextResponse.json(
                { error: 'Invite code has been fully used' },
                { status: 400 }
            );
        }

        // 3. 检查用户名和邮箱是否已存在
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: data.username },
                    { email: data.email },
                ],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username or email already exists' },
                { status: 400 }
            );
        }

        // 4. 加密密码
        const passwordHash = await bcrypt.hash(data.password, 10);

        // 5. 创建用户（使用事务确保数据一致性）
        const result = await prisma.$transaction(async (tx) => {
            // 创建用户
            const user = await tx.user.create({
                data: {
                    // Step 1: 基础账号
                    username: data.username,
                    email: data.email,
                    passwordHash,

                    // Step 2: 二中身份
                    name: data.name,
                    qdezEnrollmentYear: data.qdezEnrollmentYear,
                    qdezGraduationYear: data.qdezGraduationYear,
                    qdezClass: data.qdezClass,

                    // Step 3: 留学信息
                    country: data.country,
                    city: data.city,
                    currentSchool: data.currentSchool,
                    major: data.major,
                    degree: data.degree,
                    enrollmentYear: data.enrollmentYear,
                    expectedGradYear: data.expectedGradYear,

                    // Step 4: 完善资料
                    displayName: data.displayName,
                    bio: data.bio,
                    wechat: data.wechat,
                    linkedin: data.linkedin,
                    website: data.website,
                    privacySettings: data.privacySettings || {
                        profilePublic: true,
                        locationPublic: true,
                        contactPublic: false,
                        searchable: true,
                    },

                    // 邀请码关联
                    invitedBy: inviteCode.generatedBy,
                    usedInviteCodeId: inviteCode.id,

                    // 初始奖励
                    availableInvites: 1, // 新用户获得1个邀请额度
                    points: 10, // 初始积分
                },
            });

            // 更新邀请码使用次数
            await tx.inviteCode.update({
                where: { id: inviteCode.id },
                data: {
                    currentUses: inviteCode.currentUses + 1,
                },
            });

            return user;
        });

        // 6. 返回成功（不返回敏感信息）
        const { passwordHash: _, ...userWithoutPassword } = result;

        return NextResponse.json({
            success: true,
            message: 'Registration successful',
            user: userWithoutPassword,
        }, { status: 201 });

    } catch (error) {
        console.error('Error during registration:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}