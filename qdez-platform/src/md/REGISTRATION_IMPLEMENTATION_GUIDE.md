# QDEZ 校友平台 - 注册功能完整实施指南

## 📋 项目概览

**目标**：实现基于邀请码的分步注册系统

**特色**：
- ✅ 邀请码制度（混合策略）
- ✅ 4步分步注册流程
- ✅ 像素风格 UI
- ✅ 完整的隐私控制
- ✅ 校友特色功能（班级归属、地理位置、学术网络）

---

## 🎯 已完成部分

### ✅ 第一阶段：数据库设计（已完成）

**完成内容：**
1. 更新了 Prisma Schema（`prisma/schema.prisma`）
2. 创建了邀请码表（`invite_codes`）
3. 扩展了用户表（`users`）
4. 数据库运行在 `localhost:5433`

**重要配置：**
- 数据库：`qdez_alumni`
- 用户：`postgres`
- 密码：`password`
- `.env.local` 中的连接字符串：
  ```
  DATABASE_URL="postgresql://postgres:password@localhost:5433/qdez_alumni?schema=public"
  ```

### ✅ 第二阶段：邀请码系统基础（已完成）

**完成文件：**
1. `src/lib/invite-code.ts` - 邀请码生成工具
2. `src/app/api/invite-codes/route.ts` - 邀请码 CRUD
3. `src/app/api/invite-codes/generate-batch/route.ts` - 批量生成

**已有测试数据：**
- 16 个测试邀请码已生成
- 格式：`QDEZ-2025-XXXXXX`

---

## 🚀 待实施部分

### 第三阶段：邀请码验证 API

#### 文件：`src/app/api/invite-codes/validate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Invite code is required' },
        { status: 400 }
      );
    }

    const inviteCode = await prisma.inviteCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        generator: {
          select: {
            username: true,
            name: true,
            currentSchool: true,
          },
        },
      },
    });

    if (!inviteCode) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid invite code',
      });
    }

    if (!inviteCode.isActive) {
      return NextResponse.json({
        valid: false,
        error: 'This invite code has been deactivated',
      });
    }

    if (new Date() > inviteCode.expiresAt) {
      return NextResponse.json({
        valid: false,
        error: 'This invite code has expired',
      });
    }

    if (inviteCode.currentUses >= inviteCode.maxUses) {
      return NextResponse.json({
        valid: false,
        error: 'This invite code has been fully used',
      });
    }

    return NextResponse.json({
      valid: true,
      inviteCode: {
        code: inviteCode.code,
        type: inviteCode.type,
        expiresAt: inviteCode.expiresAt,
        generator: inviteCode.generator,
      },
    });
  } catch (error) {
    console.error('Error validating invite code:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### 第四阶段：用户注册 API

#### 4.1 安装依赖

```bash
pnpm add zod bcryptjs
pnpm add -D @types/bcryptjs
```

#### 4.2 文件：`src/lib/validation.ts`

```typescript
import { z } from 'zod';

export const step1Schema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  username: z
    .string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名最多20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  password: z
    .string()
    .min(8, '密码至少8个字符')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, '密码必须包含字母和数字'),
  confirmPassword: z.string(),
  inviteCode: z.string().min(1, '邀请码不能为空'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

export const step2Schema = z.object({
  name: z.string().min(2, '请输入真实姓名').max(50),
  qdezEnrollmentYear: z
    .number()
    .min(1980, '年份不合理')
    .max(new Date().getFullYear(), '年份不能是未来'),
  qdezGraduationYear: z
    .number()
    .min(1980)
    .max(new Date().getFullYear() + 10)
    .optional(),
  qdezClass: z.string().min(1, '请输入班级').max(50),
});

export const step3Schema = z.object({
  country: z.string().optional(),
  city: z.string().optional(),
  currentSchool: z.string().max(200).optional(),
  major: z.string().max(100).optional(),
  degree: z.enum(['本科', '硕士', '博士', '其他']).optional(),
  enrollmentYear: z.number().min(1980).max(2100).optional(),
  expectedGradYear: z.number().min(1980).max(2100).optional(),
});

export const step4Schema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  wechat: z.string().max(100).optional(),
  linkedin: z.string().url('请输入有效的 LinkedIn URL').optional().or(z.literal('')),
  website: z.string().url('请输入有效的网址').optional().or(z.literal('')),
  privacySettings: z.object({
    profilePublic: z.boolean(),
    locationPublic: z.boolean(),
    contactPublic: z.boolean(),
    searchable: z.boolean(),
  }).optional(),
});

export const completeRegistrationSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema);
```

#### 4.3 文件：`src/app/api/auth/check-availability/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { username, email } = await request.json();

    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      return NextResponse.json({
        field: 'username',
        available: !existingUser,
      });
    }

    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      return NextResponse.json({
        field: 'email',
        available: !existingUser,
      });
    }

    return NextResponse.json(
      { error: 'Username or email required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 4.4 文件：`src/app/api/auth/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { completeRegistrationSchema } from '@/lib/validation';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = completeRegistrationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

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

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        name: data.name,
        qdezEnrollmentYear: data.qdezEnrollmentYear,
        qdezGraduationYear: data.qdezGraduationYear,
        qdezClass: data.qdezClass,
        country: data.country,
        city: data.city,
        currentSchool: data.currentSchool,
        major: data.major,
        degree: data.degree,
        enrollmentYear: data.enrollmentYear,
        expectedGradYear: data.expectedGradYear,
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
        invitedBy: inviteCode.generatedBy,
        usedInviteCodeId: inviteCode.id,
        availableInvites: 1,
        points: 10,
      },
    });

    await prisma.inviteCode.update({
      where: { id: inviteCode.id },
      data: {
        currentUses: inviteCode.currentUses + 1,
        usedAt: new Date(),
        usedBy: user.id,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

---

### 第五阶段：前端页面

#### 5.1 更新 `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

@layer base {
  body {
    @apply bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100;
    font-family: 'Press Start 2P', monospace;
  }
}

@layer components {
  .pixel-border {
    border: 4px solid;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.5);
    @apply border-indigo-500;
  }

  .pixel-btn {
    @apply bg-indigo-600 text-white border-4 border-white px-6 py-3 text-xs;
    box-shadow: 4px 4px 0 #000;
    transition: transform 0.1s, box-shadow 0.1s;
  }

  .pixel-btn:hover {
    @apply opacity-90;
  }

  .pixel-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 #000;
  }

  .pixel-btn:disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .pixel-btn-secondary {
    @apply bg-purple-600;
  }

  .pixel-btn-success {
    @apply bg-green-600;
  }

  .pixel-input {
    @apply bg-gray-800 text-gray-100 border-3 border-indigo-500 px-4 py-3 text-xs outline-none;
    box-shadow: 2px 2px 0 #000;
  }

  .pixel-input:focus {
    @apply border-yellow-400;
    box-shadow: 0 0 10px rgba(250, 204, 21, 0.5);
  }

  .pixel-input::placeholder {
    @apply text-gray-500;
  }

  .pixel-container {
    @apply pixel-border bg-gray-800 bg-opacity-90 p-8;
    backdrop-filter: blur(10px);
  }

  .progress-bar {
    @apply h-4 bg-gray-700 relative overflow-hidden pixel-border;
  }

  .progress-fill {
    @apply h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500;
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
  }

  .scanlines {
    position: relative;
  }

  .scanlines::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.15),
      rgba(0, 0, 0, 0.15) 1px,
      transparent 1px,
      transparent 2px
    );
    pointer-events: none;
    z-index: 1000;
  }

  .blink {
    animation: blink 1s infinite;
  }

  @keyframes blink {
    50% { opacity: 0; }
  }

  .error-text {
    @apply text-red-400 text-xs mt-2;
    text-shadow: 1px 1px 0 #000;
  }

  .success-text {
    @apply text-green-400 text-xs mt-2;
    text-shadow: 1px 1px 0 #000;
  }
}
```

#### 5.2 注册页面基础框架：`src/app/register/page.tsx`

**注意**：完整的表单步骤实现较长，建议拆分成组件。这里提供主框架：

```typescript
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get('code');
  
  const [currentStep, setCurrentStep] = useState(codeFromUrl ? 1 : 0);
  const [inviteCode, setInviteCode] = useState(codeFromUrl || '');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    qdezEnrollmentYear: 2018,
    qdezGraduationYear: undefined,
    qdezClass: '',
    country: '',
    city: '',
    currentSchool: '',
    major: '',
    degree: '' as '' | '本科' | '硕士' | '博士' | '其他',
    enrollmentYear: undefined,
    expectedGradYear: undefined,
    displayName: '',
    bio: '',
    wechat: '',
    linkedin: '',
    website: '',
    privacySettings: {
      profilePublic: true,
      locationPublic: true,
      contactPublic: false,
      searchable: true,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // 邀请码验证页面
  if (currentStep === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 scanlines">
        <div className="pixel-container w-full max-w-md">
          <h1 className="text-2xl mb-4 text-center">🎓 QDEZ ALUMNI</h1>
          <form onSubmit={async (e) => {
            e.preventDefault();
            // 验证逻辑
          }}>
            <input
              type="text"
              className="pixel-input w-full uppercase"
              placeholder="QDEZ-2025-XXXXXX"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            />
            <button type="submit" className="pixel-btn w-full mt-4">
              CONTINUE →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 注册步骤 1-4
  return (
    <div className="min-h-screen flex items-center justify-center p-4 scanlines">
      <div className="pixel-container w-full max-w-2xl">
        <div className="mb-8">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
          <p className="text-xs text-center mt-2">STEP {currentStep}/4</p>
        </div>
        
        {/* 这里根据 currentStep 渲染不同的表单步骤 */}
        <div className="text-center">
          <p>表单步骤 {currentStep}</p>
          {/* 实际实现时替换为具体的步骤组件 */}
        </div>
      </div>
    </div>
  );
}
```

---

### 第六阶段：动态邀请页面

#### 文件：`src/app/invite/[code]/page.tsx`

```typescript
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function InvitePage({
  params,
}: {
  params: { code: string };
}) {
  const { code } = params;

  const inviteCode = await prisma.inviteCode.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      generator: {
        select: {
          username: true,
          name: true,
          currentSchool: true,
          qdezGraduationYear: true,
        },
      },
    },
  });

  if (!inviteCode) {
    notFound();
  }

  const isValid =
    inviteCode.isActive &&
    new Date() < inviteCode.expiresAt &&
    inviteCode.currentUses < inviteCode.maxUses;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 scanlines">
      <div className="pixel-container w-full max-w-2xl text-center">
        <pre className="text-xs text-indigo-400 mb-6">
{`  ██████╗ ██████╗ ███████╗███████╗
 ██╔═══██╗██╔══██╗██╔════╝╚══███╔╝
 ██║   ██║██║  ██║█████╗    ███╔╝ 
 ██║▄▄ ██║██║  ██║██╔══╝   ███╔╝  
 ╚██████╔╝██████╔╝███████╗███████╗
  ╚══▀▀═╝ ╚═════╝ ╚══════╝╚══════╝`}
        </pre>

        <h1 className="text-xl mb-4">青岛二中校友会邀请您</h1>
        
        <div className="pixel-border bg-gray-900 bg-opacity-50 p-6 mb-8">
          <div className="text-sm mb-4">
            INVITE CODE: <span className="text-yellow-400">{code}</span>
          </div>
          
          {inviteCode.generator && (
            <div className="text-xs text-gray-400">
              邀请人：{inviteCode.generator.name || inviteCode.generator.username}
            </div>
          )}
        </div>

        {isValid ? (
          <Link
            href={`/register?code=${code}`}
            className="pixel-btn pixel-btn-success inline-block"
          >
            立即注册 →
          </Link>
        ) : (
          <div className="text-red-400 text-xs">邀请码无效或已过期</div>
        )}
      </div>
    </div>
  );
}
```

---

## 📝 实施步骤

### Step 1: 创建 API 路由（30分钟）
1. 创建邀请码验证 API
2. 创建用户名/邮箱检查 API
3. 创建注册 API
4. 使用 Postman 测试

### Step 2: 创建前端基础（1小时）
1. 更新全局样式
2. 创建注册页面框架
3. 实现邀请码验证步骤

### Step 3: 实现注册步骤（2小时）
1. Step 1: 基础账号
2. Step 2: 二中身份
3. Step 3: 留学信息
4. Step 4: 完善资料

### Step 4: 创建邀请页面（30分钟）
1. 动态路由页面
2. 美化样式
3. 测试不同邀请码状态

### Step 5: 测试与优化（1小时）
1. 完整注册流程测试
2. 错误处理优化
3. 用户体验优化

---

## 🧪 测试清单

- [ ] 邀请码验证 API 正常工作
- [ ] 用户名检查 API 实时响应
- [ ] 密码验证符合要求
- [ ] 完整注册流程成功
- [ ] 邀请码状态正确更新
- [ ] 用户数据正确保存
- [ ] 动态邀请页面显示正确
- [ ] 错误提示友好清晰

---

## 💡 开发提示

1. **使用 Prisma Studio 查看数据**
   ```bash
   pnpm db:studio
   ```

2. **查看服务器日志**
   - IDEA 中的 Run 窗口会显示所有 console.log
   
3. **测试 API 的快捷方式**
   - 使用 Postman 或 Insomnia
   - 或在浏览器 DevTools Console 中使用 fetch

4. **实时重载**
   - Next.js 支持热重载，保存文件即可看到效果

---

## 🎯 下一个对话开始时

在新对话中说：

> "我要继续实现 QDEZ 平台注册功能。请先阅读项目文件，特别是已完成的数据库模型和邀请码系统。我们要从第三阶段开始：创建邀请码验证 API。"

然后把这个文档的内容作为参考！

---

祝开发顺利！🚀
