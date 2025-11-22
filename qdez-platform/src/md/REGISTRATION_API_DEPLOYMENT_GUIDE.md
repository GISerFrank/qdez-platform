# 邀请码功能部署指南

## 📦 已创建的文件

我为您创建了以下4个文件：

1. **validate-route.ts** - 邀请码验证 API
2. **check-availability-route.ts** - 用户名/邮箱检查 API
3. **validation.ts** - 表单验证 Schema
4. **register-route.ts** - 用户注册 API

## 🚀 部署步骤

### 第一步：安装依赖

在您的项目根目录，打开终端运行：

```bash
pnpm add zod bcryptjs
pnpm add -D @types/bcryptjs
```

### 第二步：复制文件到项目

#### 1. 邀请码验证 API
```
文件: validate-route.ts
目标路径: src/app/api/invite-codes/validate/route.ts
```

在 IDEA 中：
- 右键 `src/app/api/invite-codes` 文件夹
- 选择 `New` → `Directory`
- 输入 `validate`
- 右键 `validate` 文件夹 → `New` → `File`
- 输入 `route.ts`
- 复制 `validate-route.ts` 的内容到这个文件

#### 2. 用户名/邮箱检查 API
```
文件: check-availability-route.ts
目标路径: src/app/api/auth/check-availability/route.ts
```

在 IDEA 中：
- 右键 `src/app/api` 文件夹
- 选择 `New` → `Directory`
- 输入 `auth`
- 右键 `auth` 文件夹 → `New` → `Directory`
- 输入 `check-availability`
- 右键 `check-availability` 文件夹 → `New` → `File`
- 输入 `route.ts`
- 复制 `check-availability-route.ts` 的内容到这个文件

#### 3. 验证 Schema
```
文件: validation.ts
目标路径: src/lib/validation.ts
```

在 IDEA 中：
- 右键 `src/lib` 文件夹
- 选择 `New` → `File`
- 输入 `validation.ts`
- 复制 `validation.ts` 的内容到这个文件

#### 4. 用户注册 API
```
文件: register-route.ts
目标路径: src/app/api/auth/register/route.ts
```

在 IDEA 中：
- 右键 `src/app/api/auth` 文件夹
- 选择 `New` → `Directory`
- 输入 `register`
- 右键 `register` 文件夹 → `New` → `File`
- 输入 `route.ts`
- 复制 `register-route.ts` 的内容到这个文件

### 第三步：验证项目结构

完成后，您的项目结构应该是这样的：

```
src/
├── app/
│   └── api/
│       ├── invite-codes/
│       │   ├── route.ts                 (已有)
│       │   ├── generate-batch/
│       │   │   └── route.ts             (已有)
│       │   └── validate/
│       │       └── route.ts             ✅ 新增
│       └── auth/
│           ├── check-availability/
│           │   └── route.ts             ✅ 新增
│           └── register/
│               └── route.ts             ✅ 新增
└── lib/
    ├── invite-code.ts                   (已有)
    └── validation.ts                    ✅ 新增
```

## 🧪 测试 API

### 1. 启动开发服务器

```bash
pnpm dev
```

### 2. 测试邀请码验证 API

在浏览器控制台或使用 Postman：

```javascript
fetch('http://localhost:3000/api/invite-codes/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: 'QDEZ-2025-XXXXXX' })
})
.then(r => r.json())
.then(console.log);
```

预期响应：
```json
{
  "valid": true,
  "inviteCode": {
    "code": "QDEZ-2025-XXXXXX",
    "type": "ADMIN",
    "expiresAt": "2025-12-31T00:00:00.000Z",
    "currentUses": 0,
    "maxUses": 10,
    "generator": {
      "username": "admin",
      "name": "管理员"
    }
  }
}
```

### 3. 测试用户名检查 API

```javascript
fetch('http://localhost:3000/api/auth/check-availability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'zhangsan' })
})
.then(r => r.json())
.then(console.log);
```

预期响应：
```json
{
  "field": "username",
  "available": true,
  "message": "Username available"
}
```

### 4. 测试完整注册流程

```javascript
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    // Step 1: 基础账号
    email: "zhangsan@example.com",
    username: "zhangsan",
    password: "Password123",
    confirmPassword: "Password123",
    inviteCode: "QDEZ-2025-XXXXXX",
    
    // Step 2: 二中身份
    name: "张三",
    qdezEnrollmentYear: 2018,
    qdezGraduationYear: 2021,
    qdezClass: "高三3班",
    
    // Step 3: 留学信息
    country: "美国",
    city: "波士顿",
    currentSchool: "MIT",
    major: "计算机科学",
    degree: "本科",
    enrollmentYear: 2021,
    expectedGradYear: 2025,
    
    // Step 4: 完善资料
    displayName: "张三 | MIT CS",
    bio: "热爱编程的二中校友",
    wechat: "zhangsan_wechat",
    linkedin: "https://linkedin.com/in/zhangsan",
    website: "https://zhangsan.com",
    privacySettings: {
      profilePublic: true,
      locationPublic: true,
      contactPublic: false,
      searchable: true
    }
  })
})
.then(r => r.json())
.then(console.log);
```

预期响应：
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "clx...",
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "name": "张三",
    ...
  }
}
```

## ✅ 测试清单

- [ ] 邀请码验证 API 正常工作
- [ ] 无效邀请码返回正确错误
- [ ] 过期邀请码返回正确错误
- [ ] 已用完的邀请码返回正确错误
- [ ] 用户名检查 API 实时响应
- [ ] 邮箱检查 API 实时响应
- [ ] 重复用户名注册失败
- [ ] 重复邮箱注册失败
- [ ] 密码不一致注册失败
- [ ] 完整注册流程成功
- [ ] 注册后邀请码使用次数+1
- [ ] 新用户获得初始积分和邀请额度

## 🐛 常见问题

### Q1: Prisma Client 未生成

**错误**: `Cannot find module '@prisma/client'`

**解决**:
```bash
pnpm db:generate
```

### Q2: 导入路径错误

**错误**: `Cannot find module '@/lib/validation'`

**解决**: 确保 `tsconfig.json` 中有以下配置：
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Q3: bcryptjs 类型错误

**解决**:
```bash
pnpm add -D @types/bcryptjs
```

### Q4: 数据库连接失败

**检查**:
1. 数据库是否运行: `docker-compose ps`
2. 端口是否正确: `.env.local` 中的端口是 `5433`
3. 数据库表是否创建: `pnpm db:push`

## 📝 下一步

现在邀请码后端功能已完成！您可以：

1. ✅ 使用 Postman 或浏览器测试所有 API
2. ✅ 开始开发注册页面前端
3. ✅ 实现登录功能
4. ✅ 继续开发其他模块（论坛、问答等）

## 💡 API 文档

### 1. 邀请码验证
- **URL**: `POST /api/invite-codes/validate`
- **请求体**: `{ "code": "QDEZ-2025-XXXXXX" }`
- **响应**: `{ valid: true/false, inviteCode?: {...}, error?: "..." }`

### 2. 用户名/邮箱检查
- **URL**: `POST /api/auth/check-availability`
- **请求体**: `{ "username": "zhangsan" }` 或 `{ "email": "..." }`
- **响应**: `{ field: "username/email", available: true/false }`

### 3. 用户注册
- **URL**: `POST /api/auth/register`
- **请求体**: 完整的4步注册数据（见测试示例）
- **响应**: `{ success: true, user: {...} }` 或 `{ error: "..." }`

---

祝开发顺利！🚀
