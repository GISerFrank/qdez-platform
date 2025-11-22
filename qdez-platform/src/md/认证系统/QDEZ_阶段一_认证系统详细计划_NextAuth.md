# 阶段一：认证系统详细计划

## 📋 概述

- **目标**：使用 NextAuth.js 实现完整的用户认证系统
- **预计时间**：2-3天
- **技术方案**：NextAuth.js + Prisma Adapter + Database Session
- **依赖**：已完成的注册系统、数据库用户表

---

## 🎯 功能清单

| 功能 | 说明 | 优先级 |
|------|------|--------|
| **Credentials登录** | 用户名/邮箱 + 密码登录 | 必须 |
| **Session管理** | 数据库存储，支持主动撤销 | 必须 |
| **当前用户API** | 获取登录用户信息 | 必须 |
| **路由保护** | 中间件保护需要登录的页面 | 必须 |
| **登出功能** | 清除session | 必须 |
| **记住我** | 延长session有效期 | 可选 |
| **OAuth登录** | 微信/Google/GitHub | 后续扩展 |

---

## 📁 需要创建/修改的文件

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # NextAuth API路由
│   └── login/
│       └── page.tsx              # 修改登录页面
├── lib/
│   └── auth.ts                   # NextAuth配置
├── types/
│   └── next-auth.d.ts            # 类型扩展
└── middleware.ts                 # 路由保护中间件

prisma/
└── schema.prisma                 # 添加Session表
```

---

## 🔧 详细实现步骤

### Step 1: 安装依赖

```bash
pnpm add next-auth @auth/prisma-adapter
```

---

### Step 2: 更新 Prisma Schema

在 `prisma/schema.prisma` 中添加 NextAuth 需要的表：

```prisma
// NextAuth Session表
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// NextAuth Account表（用于OAuth，先添加以备后用）
model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

// 在现有User模型中添加关联
model User {
  // ... 现有字段保持不变 ...
  
  // 添加NextAuth关联
  accounts Account[]
  sessions Session[]
}
```

然后运行：

```bash
pnpm db:push
```

---

### Step 3: 创建 NextAuth 配置

**文件：`src/lib/auth.ts`**

```typescript
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  // 使用数据库Session策略
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30天
    updateAge: 24 * 60 * 60,   // 24小时更新一次
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "用户名或邮箱", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("请输入用户名和密码");
        }

        // 查找用户（支持用户名或邮箱登录）
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: credentials.identifier },
              { email: credentials.identifier },
            ],
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("用户名或密码错误");
        }

        // 验证密码
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("用户名或密码错误");
        }

        // 更新最后登录时间
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // 返回用户信息（会被存入session）
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
        };
      },
    }),
  ],

  callbacks: {
    // 自定义session内容
    async session({ session, user }) {
      // 从数据库获取完整用户信息
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          displayName: true,
          avatar: true,
          currentSchool: true,
          major: true,
          country: true,
          city: true,
          qdezClass: true,
          qdezEnrollmentYear: true,
          points: true,
          role: true,
        },
      });

      if (fullUser) {
        session.user = {
          ...session.user,
          ...fullUser,
        };
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  // 开发环境允许HTTP
  ...(process.env.NODE_ENV === "development" && {
    cookies: {
      sessionToken: {
        name: "next-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: false,
        },
      },
    },
  }),
};
```

---

### Step 4: 创建 API 路由

**文件：`src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

---

### Step 5: 扩展 TypeScript 类型

**文件：`src/types/next-auth.d.ts`**

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      name: string;
      displayName?: string;
      avatar?: string;
      currentSchool?: string;
      major?: string;
      country?: string;
      city?: string;
      qdezClass?: string;
      qdezEnrollmentYear?: number;
      points: number;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
  }
}
```

---

### Step 6: 创建路由保护中间件

**文件：`src/middleware.ts`**

```typescript
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // 已登录用户访问登录页，重定向到主平台
    if (req.nextUrl.pathname === "/login" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/campus", req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // 公开路由
        const publicPaths = [
          "/",
          "/login",
          "/register",
          "/invite",
          "/api/auth",
          "/api/invite-codes/validate",
          "/api/auth/check-availability",
          "/api/auth/register",
        ];
        
        // 检查是否是公开路由
        const isPublicPath = publicPaths.some(
          path => pathname === path || pathname.startsWith(path + "/")
        );
        
        if (isPublicPath) {
          return true;
        }
        
        // 其他路由需要登录
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico
     * - 公共资源
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
```

---

### Step 7: 创建 Auth Provider

**文件：`src/components/AuthProvider.tsx`**

```typescript
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

在根布局中使用：

**修改：`src/app/layout.tsx`**

```typescript
import AuthProvider from "@/components/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### Step 8: 修改登录页面

**修改：`src/app/login/page.tsx`**

核心改动：

```typescript
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push("/campus");
    }
  };

  return (
    // 保持现有的像素风格UI
    // 修改表单为用户名/邮箱 + 密码
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="用户名或邮箱"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        className="pixel-input"
      />
      <input
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="pixel-input"
      />
      {error && <p className="error-text">{error}</p>}
      <button type="submit" disabled={isLoading} className="pixel-btn">
        {isLoading ? "登录中..." : "登录"}
      </button>
    </form>
  );
}
```

---

### Step 9: 在组件中使用

```typescript
"use client";

import { useSession, signOut } from "next-auth/react";

export default function SomeComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>加载中...</div>;
  }

  if (!session) {
    return <div>请先登录</div>;
  }

  return (
    <div>
      <p>欢迎, {session.user.name}!</p>
      <p>学校: {session.user.currentSchool}</p>
      <button onClick={() => signOut({ callbackUrl: "/login" })}>
        登出
      </button>
    </div>
  );
}
```

---

## 🔐 环境变量配置

在 `.env.local` 中添加：

```bash
# NextAuth配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-at-least-32-characters-long

# 生成NEXTAUTH_SECRET的方法：
# openssl rand -base64 32
```

---

## ✅ 测试清单

### 登录功能

- [ ] 正确的用户名+密码可以登录
- [ ] 正确的邮箱+密码可以登录
- [ ] 错误密码显示错误提示
- [ ] 不存在的用户显示错误提示
- [ ] 登录成功后跳转到 /campus
- [ ] 数据库Session表有新记录

### Session管理

- [ ] 刷新页面保持登录状态
- [ ] useSession 返回正确的用户信息
- [ ] Session包含自定义字段（学校、专业等）
- [ ] 登出后Session记录被删除

### 路由保护

- [ ] 未登录访问 /campus 重定向到 /login
- [ ] 已登录可以访问 /campus
- [ ] 已登录访问 /login 重定向到 /campus
- [ ] 公开路由（/register, /invite）无需登录

### 安全性

- [ ] Cookie设置了httpOnly
- [ ] 密码不会出现在session中
- [ ] 用户改密码后可以让旧session失效（通过删除数据库记录）

---

## 🔒 Database Session 的优势

1. **可以主动撤销** - 删除数据库记录即可让session失效
2. **用户改密码** - 可以清除该用户所有session
3. **查看活跃设备** - 可以显示用户在哪些设备登录
4. **安全审计** - 可以记录登录历史
5. **强制登出** - 管理员可以强制某用户下线

---

## 📝 与自建JWT的区别

| 维度 | 自建JWT | NextAuth + Database Session |
|------|---------|----------------------------|
| 代码量 | 多，需要自己处理各种情况 | 少，框架处理 |
| Session撤销 | 困难 | 简单，删数据库记录 |
| Token刷新 | 需要自己实现 | 自动处理 |
| CSRF保护 | 需要自己实现 | 内置 |
| OAuth扩展 | 需要大量代码 | 加几行配置 |
| 类型安全 | 需要自己定义 | 有完整类型支持 |

---

## 📅 后续扩展

完成基础认证后，可以方便地添加：

1. **OAuth登录** - 微信、Google、GitHub
2. **邮箱验证** - 使用NextAuth的VerificationToken
3. **两步验证** - 2FA
4. **设备管理** - 查看和管理登录设备

---

## 🚀 下一步

认证系统完成后，继续实现：

1. **阶段二：个人中心** - 使用 `useSession()` 获取用户信息
2. **阶段三：论坛系统** - 发帖时关联 `session.user.id`
3. **其他需要用户身份的功能**

---

准备好开始实现了吗？告诉我「开始写代码」！
