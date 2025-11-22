# Prisma Schema 更新说明

## 📝 需要在你的 `prisma/schema.prisma` 中添加以下内容

### 1. 添加 Session 表（NextAuth 必需）

在你的 schema 文件末尾添加：

```prisma
// NextAuth Session表 - 用于存储用户会话
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

### 2. 添加 Account 表（用于 OAuth，先添加以备后用）

```prisma
// NextAuth Account表 - 用于OAuth登录（微信、Google等）
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
```

### 3. 在现有 User 模型中添加关联

在你的 `User` model 中添加以下两行（添加到模型末尾）：

```prisma
model User {
  // ... 你现有的所有字段保持不变 ...
  
  // 添加 NextAuth 关联（添加这两行）
  accounts Account[]
  sessions Session[]
  
  // ... 其他已有的关联保持不变 ...
}
```

### 4. 执行数据库迁移

```bash
# 生成 Prisma 客户端
pnpm db:generate

# 推送到数据库
pnpm db:push
```

## ✅ 验证

运行以下命令验证表是否创建成功：

```bash
docker exec qdez-postgres psql -U postgres -d qdez_alumni -c "\dt"
```

你应该看到新增的表：
- `sessions`
- `accounts`

## 📋 完整的 User 模型示例

如果你不确定如何修改，这是一个完整的 User 模型示例：

```prisma
model User {
  id       String @id @default(cuid())
  username String @unique
  email    String @unique
  
  passwordHash String @map("password_hash")
  
  name        String
  displayName String? @map("display_name")
  avatar      String?
  bio         String?
  
  // 二中信息
  qdezEnrollmentYear  Int    @map("qdez_enrollment_year")
  qdezGraduationYear  Int?   @map("qdez_graduation_year")
  qdezClass           String @map("qdez_class")
  
  // 留学信息
  country        String?
  city           String?
  currentSchool  String? @map("current_school")
  major          String?
  degree         String?
  enrollmentYear Int?    @map("enrollment_year")
  expectedGradYear Int?  @map("expected_grad_year")
  
  // 联系方式
  wechat   String?
  linkedin String?
  website  String?
  
  // 隐私设置
  privacySettings Json @default("{\"profilePublic\":true,\"locationPublic\":true,\"contactPublic\":false,\"searchable\":true}") @map("privacy_settings")
  
  // 积分和邀请
  points            Int @default(0)
  availableInvites  Int @default(0) @map("available_invites")
  
  // 邀请关系
  invitedBy         String? @map("invited_by")
  usedInviteCodeId  String? @map("used_invite_code_id")
  invitedByUser     User?   @relation("UserInvites", fields: [invitedBy], references: [id])
  invitedUsers      User[]  @relation("UserInvites")
  
  // 生成的邀请码
  generatedInviteCodes InviteCode[] @relation("GeneratedCodes")
  
  // 系统字段
  role        String   @default("user")
  isActive    Boolean  @default(true) @map("is_active")
  lastLoginAt DateTime? @map("last_login_at")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  // NextAuth 关联（新增）
  accounts Account[]
  sessions Session[]
  
  // 其他关联（如果你已有这些表）
  posts     Post[]
  comments  Comment[]
  questions Question[]
  answers   Answer[]
  
  @@map("users")
}
```

---

**⚠️ 重要提示**：
- 不要删除任何现有字段
- 只需要添加 `accounts Account[]` 和 `sessions Session[]` 这两行
- 添加完成后记得运行 `pnpm db:push`
