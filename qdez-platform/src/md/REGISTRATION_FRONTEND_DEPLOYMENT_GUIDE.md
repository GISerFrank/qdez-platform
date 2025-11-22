# 📝 注册页面前端 - 完整部署指南

## 🎉 已创建的文件

我为您创建了完整的注册页面前端，包括：

1. **page.tsx** - 主页面文件
2. **InviteCodeStep.tsx** - 邀请码验证组件
3. **Step1BasicInfo.tsx** - 步骤1：基础账号信息
4. **REGISTER_COMPONENTS.md** - 步骤2-4的完整代码

---

## 📂 文件部署位置

### 1. 主页面
```
page.tsx → src/app/register/page.tsx
```

### 2. 组件目录
创建组件文件夹并复制所有组件：

```
src/app/register/components/
├── InviteCodeStep.tsx          ← 从 InviteCodeStep.tsx
├── Step1BasicInfo.tsx           ← 从 Step1BasicInfo.tsx
├── Step2QdezInfo.tsx            ← 从 REGISTER_COMPONENTS.md
├── Step3StudyInfo.tsx           ← 从 REGISTER_COMPONENTS.md
└── Step4ProfileInfo.tsx         ← 从 REGISTER_COMPONENTS.md
```

---

## 🚀 快速部署步骤

### 步骤 1: 创建目录结构

在 IDEA 中：
1. 右键 `src/app` 文件夹
2. 选择 `New` → `Directory`
3. 输入 `register`
4. 在 `register` 文件夹内再创建 `components` 目录

### 步骤 2: 复制主页面文件

1. 创建 `src/app/register/page.tsx`
2. 复制 `page.tsx` 的内容

### 步骤 3: 复制组件文件

在 `src/app/register/components/` 目录下创建以下文件：

#### 3.1 InviteCodeStep.tsx
复制 `InviteCodeStep.tsx` 的内容

#### 3.2 Step1BasicInfo.tsx
复制 `Step1BasicInfo.tsx` 的内容

#### 3.3 Step2QdezInfo.tsx
打开 `REGISTER_COMPONENTS.md`，复制 "Step 2: 二中身份信息" 部分的代码

#### 3.4 Step3StudyInfo.tsx
从 `REGISTER_COMPONENTS.md` 复制 "Step 3: 留学信息" 的代码

#### 3.5 Step4ProfileInfo.tsx
从 `REGISTER_COMPONENTS.md` 复制 "Step 4: 完善资料" 的代码

---

## 🎨 确保全局样式已配置

检查 `src/app/globals.css` 是否包含以下样式（如果没有，请添加）：

```css
/* 像素风格样式 */
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

.error-text {
  @apply text-red-400 text-xs mt-2;
  text-shadow: 1px 1px 0 #000;
}

.success-text {
  @apply text-green-400 text-xs mt-2;
  text-shadow: 1px 1px 0 #000;
}
```

---

## ✅ 验证部署

### 1. 启动开发服务器

```bash
pnpm dev
```

### 2. 访问注册页面

在浏览器打开：
- **直接访问**: http://localhost:3000/register
- **带邀请码**: http://localhost:3000/register?code=QDEZ-2025-BOSTON3K

### 3. 测试流程

#### ✓ 邀请码验证（Step 0）
- [ ] 输入邀请码
- [ ] 点击 CONTINUE
- [ ] 看到验证成功/失败提示

#### ✓ 基础账号（Step 1）
- [ ] 输入邮箱，看到实时可用性检查
- [ ] 输入用户名，看到实时可用性检查
- [ ] 输入密码和确认密码
- [ ] 密码不一致时显示错误
- [ ] 点击 NEXT 进入下一步

#### ✓ 二中身份（Step 2）
- [ ] 填写真实姓名
- [ ] 选择入学年份
- [ ] 填写班级
- [ ] 可以返回上一步
- [ ] 点击 NEXT 继续

#### ✓ 留学信息（Step 3）
- [ ] 所有字段都是可选的
- [ ] 可以跳过直接 NEXT

#### ✓ 完善资料（Step 4）
- [ ] 填写可选信息
- [ ] 配置隐私设置
- [ ] 点击 COMPLETE 提交注册
- [ ] 注册成功后跳转到登录页

---

## 🎯 功能特性

### ✨ 实时验证
- ✅ 用户名可用性实时检查（防抖500ms）
- ✅ 邮箱可用性实时检查（防抖500ms）
- ✅ 密码一致性实时验证
- ✅ 表单字段格式验证

### 🎨 用户体验
- ✅ 像素风格 UI
- ✅ 进度条显示当前步骤
- ✅ 流畅的步骤切换
- ✅ 友好的错误提示
- ✅ 加载状态显示
- ✅ 扫描线背景效果

### 🔒 数据安全
- ✅ 密码不会明文显示
- ✅ 前端基础验证
- ✅ 后端完整验证（Zod）
- ✅ SQL 注入防护（Prisma）
- ✅ 密码加密（bcrypt）

---

## 🐛 常见问题

### Q1: 组件导入报错

**错误**: `Cannot find module './components/InviteCodeStep'`

**解决**:
1. 确认文件路径正确
2. 确认文件名大小写匹配
3. 重启 TypeScript 服务器（在 IDEA 中）

### Q2: 样式不生效

**解决**:
1. 确认 `globals.css` 包含所有像素样式
2. 确认 Tailwind CSS 配置正确
3. 重启开发服务器：`pnpm dev`

### Q3: API 调用失败

**检查**:
1. 后端服务器是否运行
2. API 路由是否正确部署
3. 数据库是否连接
4. 查看浏览器控制台错误

### Q4: 实时验证不工作

**检查**:
1. API 端点 `/api/auth/check-availability` 是否存在
2. 网络请求是否成功（查看 Network 标签）
3. 防抖是否生效（应该等待500ms）

---

## 📊 项目结构总览

```
src/app/
├── globals.css                    # 全局样式（像素风格）
├── layout.tsx                     # 根布局
├── page.tsx                       # 首页
├── api/                          # API 路由
│   ├── invite-codes/
│   │   └── validate/route.ts     # 邀请码验证
│   └── auth/
│       ├── check-availability/route.ts  # 可用性检查
│       └── register/route.ts     # 用户注册
└── register/                     # 注册页面
    ├── page.tsx                  # 主页面
    └── components/               # 组件
        ├── InviteCodeStep.tsx
        ├── Step1BasicInfo.tsx
        ├── Step2QdezInfo.tsx
        ├── Step3StudyInfo.tsx
        └── Step4ProfileInfo.tsx
```

---

## 🎓 下一步

注册页面完成后，您可以：

1. **创建登录页面** - 让用户登录系统
2. **个人中心页面** - 查看和编辑用户资料
3. **校友地图** - 展示所有注册用户
4. **论坛系统** - 开始社区功能

---

## 💡 优化建议

### 短期优化
- [ ] 添加表单自动保存（localStorage）
- [ ] 添加返回顶部按钮
- [ ] 优化移动端体验
- [ ] 添加键盘快捷键（Enter 下一步）

### 长期优化
- [ ] 添加邮箱验证功能
- [ ] 支持 OAuth 登录（Google, GitHub）
- [ ] 添加头像上传功能
- [ ] 多语言支持

---

## ✅ 部署完成检查清单

- [ ] 所有文件已复制到正确位置
- [ ] 全局样式已配置
- [ ] 开发服务器已启动
- [ ] 能访问注册页面
- [ ] 邀请码验证正常
- [ ] 用户名/邮箱检查正常
- [ ] 4步注册流程顺畅
- [ ] 提交注册成功
- [ ] 错误提示友好清晰

---

🎉 **恭喜！注册页面前端开发完成！**

现在用户可以通过邀请码注册成为QDEZ校友平台的成员了！

需要我帮您实现其他功能吗？
- 🔐 登录页面
- 👤 个人中心
- 🗺️ 校友地图
- 📝 论坛系统
