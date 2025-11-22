# 🎯 阶段二：个人中心 - API部署指南

## 📦 已创建的API文件

### 1. 用户资料管理
- **route.ts** → `src/app/api/user/profile/route.ts`
  - GET：获取当前用户完整资料
  - PUT：更新用户资料

### 2. 头像上传
- **route.ts** → `src/app/api/user/avatar/route.ts`
  - POST：上传用户头像
  - DELETE：删除头像

### 3. 隐私设置
- **route.ts** → `src/app/api/user/privacy/route.ts`
  - GET：获取隐私设置
  - PUT：更新隐私设置

---

## 🚀 部署步骤

### 第一步：创建目录结构

在您的项目中创建以下目录结构：

```bash
src/app/api/user/
├── profile/
│   └── route.ts       # 资料管理
├── avatar/
│   └── route.ts       # 头像上传
└── privacy/
    └── route.ts       # 隐私设置
```

在 IntelliJ IDEA 中：
1. 右键 `src/app/api` 文件夹
2. 选择 `New` → `Directory`
3. 输入 `user`
4. 在 `user` 文件夹内创建 `profile`、`avatar`、`privacy` 三个子目录
5. 在每个子目录中创建 `route.ts` 文件

---

### 第二步：复制文件内容

#### 1. 用户资料API
```
route.ts → src/app/api/user/profile/route.ts
```

#### 2. 头像上传API
```
route.ts → src/app/api/user/avatar/route.ts
```

#### 3. 隐私设置API
```
route.ts → src/app/api/user/privacy/route.ts
```

---

### 第三步：创建uploads目录

在项目根目录创建用于存储上传文件的目录：

```bash
# 在项目根目录
mkdir -p public/uploads/avatars
```

在 IDEA 中：
1. 右键 `public` 文件夹
2. 选择 `New` → `Directory`
3. 输入 `uploads/avatars`

---

### 第四步：更新.gitignore

将上传的文件排除在版本控制之外：

在 `.gitignore` 中添加：
```
# 用户上传的文件
/public/uploads/*
!/public/uploads/.gitkeep
```

在 `public/uploads/` 中创建 `.gitkeep` 文件以保持目录结构。

---

## ✅ 验证项目结构

完成后，您的项目结构应该是这样的：

```
src/app/api/
├── auth/
│   ├── [...nextauth]/
│   │   └── route.ts
│   ├── check-availability/
│   │   └── route.ts
│   └── register/
│       └── route.ts
├── invite-codes/
│   └── validate/
│       └── route.ts
└── user/                    ✅ 新增
    ├── profile/             ✅ 新增
    │   └── route.ts
    ├── avatar/              ✅ 新增
    │   └── route.ts
    └── privacy/             ✅ 新增
        └── route.ts

public/
└── uploads/                 ✅ 新增
    └── avatars/             ✅ 新增
        └── .gitkeep
```

---

## 🧪 测试API

### 1. 启动开发服务器

```bash
pnpm dev
```

### 2. 测试获取用户资料

**注意**：需要先登录获取session

```javascript
// 在浏览器控制台
fetch('http://localhost:3000/api/user/profile', {
  credentials: 'include',  // 重要：包含cookie
})
.then(r => r.json())
.then(console.log);
```

**预期响应**：
```json
{
  "success": true,
  "user": {
    "id": "xxx",
    "username": "zhangsan",
    "email": "zhangsan@example.com",
    "name": "张三",
    "displayName": null,
    "avatar": null,
    "bio": null,
    "qdezEnrollmentYear": 2018,
    "qdezClass": "高三3班",
    "country": "USA",
    "city": "Boston",
    "currentSchool": "Harvard University",
    "major": "Computer Science",
    "stats": {
      "posts": 0,
      "comments": 0,
      "questions": 0,
      "answers": 0,
      "resources": 0,
      "events": 0
    }
  }
}
```

### 3. 测试更新用户资料

```javascript
fetch('http://localhost:3000/api/user/profile', {
  method: 'PUT',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    displayName: "Sam Zhang",
    bio: "Hello, I'm a CS student!",
    wechat: "zhangsan123",
    linkedin: "https://linkedin.com/in/zhangsan"
  })
})
.then(r => r.json())
.then(console.log);
```

**预期响应**：
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "xxx",
    "username": "zhangsan",
    "displayName": "Sam Zhang",
    "bio": "Hello, I'm a CS student!",
    "wechat": "zhangsan123",
    "linkedin": "https://linkedin.com/in/zhangsan",
    ...
  }
}
```

### 4. 测试头像上传

在HTML中创建一个简单的测试表单：

```html
<!DOCTYPE html>
<html>
<body>
  <input type="file" id="avatar" accept="image/*">
  <button onclick="uploadAvatar()">Upload</button>

  <script>
    async function uploadAvatar() {
      const fileInput = document.getElementById('avatar');
      const file = fileInput.files[0];
      
      if (!file) {
        alert('Please select a file');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('http://localhost:3000/api/user/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const result = await response.json();
      console.log(result);
      
      if (result.success) {
        alert('Avatar uploaded: ' + result.avatar);
      }
    }
  </script>
</body>
</html>
```

**预期响应**：
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "avatar": "/uploads/avatars/xxx-1234567890.jpg",
  "user": {
    "id": "xxx",
    "username": "zhangsan",
    "avatar": "/uploads/avatars/xxx-1234567890.jpg"
  }
}
```

### 5. 测试隐私设置

```javascript
// 获取当前隐私设置
fetch('http://localhost:3000/api/user/privacy', {
  credentials: 'include',
})
.then(r => r.json())
.then(console.log);

// 更新隐私设置
fetch('http://localhost:3000/api/user/privacy', {
  method: 'PUT',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    profileVisibility: "ALUMNI_ONLY",
    contactVisibility: "ALUMNI_ONLY",
    locationVisibility: "PUBLIC"
  })
})
.then(r => r.json())
.then(console.log);
```

**预期响应**：
```json
{
  "success": true,
  "message": "Privacy settings updated successfully",
  "privacy": {
    "profileVisibility": "ALUMNI_ONLY",
    "contactVisibility": "ALUMNI_ONLY",
    "locationVisibility": "PUBLIC"
  }
}
```

---

## 📝 API端点总结

### 1. 获取用户资料
```
GET /api/user/profile
Authorization: Session Cookie
```

### 2. 更新用户资料
```
PUT /api/user/profile
Authorization: Session Cookie
Content-Type: application/json

Body: {
  "displayName": "string",
  "bio": "string",
  "country": "string",
  "city": "string",
  "currentSchool": "string",
  "major": "string",
  "degree": "BACHELOR|MASTER|PHD|OTHER",
  "graduationYear": number,
  "wechat": "string",
  "qq": "string",
  "instagram": "string",
  "linkedin": "string",
  "github": "string",
  "personalWebsite": "string"
}
```

### 3. 上传头像
```
POST /api/user/avatar
Authorization: Session Cookie
Content-Type: multipart/form-data

Body: FormData with "avatar" field
```

### 4. 删除头像
```
DELETE /api/user/avatar
Authorization: Session Cookie
```

### 5. 获取隐私设置
```
GET /api/user/privacy
Authorization: Session Cookie
```

### 6. 更新隐私设置
```
PUT /api/user/privacy
Authorization: Session Cookie
Content-Type: application/json

Body: {
  "profileVisibility": "PUBLIC|ALUMNI_ONLY|PRIVATE",
  "contactVisibility": "PUBLIC|ALUMNI_ONLY|PRIVATE",
  "locationVisibility": "PUBLIC|ALUMNI_ONLY|PRIVATE"
}
```

---

## 🔒 安全性说明

### 1. 认证保护
所有API都通过NextAuth Session进行保护：
- 未登录用户会收到401 Unauthorized
- 用户只能访问和修改自己的资料

### 2. 文件上传安全
- 限制文件类型：只允许图片格式（JPEG, PNG, GIF, WebP）
- 限制文件大小：最大5MB
- 文件名使用用户ID+时间戳，防止冲突
- 存储在public目录外的uploads文件夹

### 3. 数据验证
- 使用Zod进行严格的数据验证
- 字段长度限制
- URL格式验证
- Enum类型验证

### 4. 隐私保护
- 支持三级隐私设置：PUBLIC、ALUMNI_ONLY、PRIVATE
- 用户可以控制资料、联系方式、位置信息的可见性

---

## 🐛 常见问题

### Q1: 401 Unauthorized错误

**原因**：用户未登录或Session过期

**解决**：
1. 确保用户已登录
2. 确保请求包含`credentials: 'include'`
3. 检查NextAuth配置是否正确

### Q2: 文件上传失败

**原因**：目录权限问题或路径不存在

**解决**：
```bash
# 确保uploads目录存在且有写权限
mkdir -p public/uploads/avatars
chmod 755 public/uploads
```

### Q3: 数据库更新失败

**原因**：字段类型不匹配或Prisma schema不同步

**解决**：
```bash
# 同步Prisma schema
pnpm prisma db push

# 或重新生成Prisma Client
pnpm prisma generate
```

### Q4: CORS错误

**原因**：跨域请求被阻止

**解决**：
- 开发环境使用same-origin
- 确保前端和后端在同一域名
- 使用`credentials: 'include'`包含cookies

---

## 💡 下一步

后端API完成后，继续开发前端：

1. **个人中心页面** (`/profile`)
   - 展示用户资料
   - 统计数据卡片
   - 成就系统

2. **资料编辑页面** (`/profile/edit`)
   - 表单组件
   - 头像上传组件
   - 隐私设置切换

3. **像素风格UI组件**
   - 资料卡片
   - 编辑表单
   - 上传按钮

---

## ✅ 测试清单

部署完成后，请验证：

- [ ] 所有文件已复制到正确位置
- [ ] uploads目录已创建
- [ ] 开发服务器可以启动
- [ ] GET /api/user/profile 可以获取资料
- [ ] PUT /api/user/profile 可以更新资料
- [ ] POST /api/user/avatar 可以上传头像
- [ ] DELETE /api/user/avatar 可以删除头像
- [ ] GET /api/user/privacy 可以获取隐私设置
- [ ] PUT /api/user/privacy 可以更新隐私设置
- [ ] 未登录用户收到401错误
- [ ] 数据验证正常工作
- [ ] 文件大小和类型限制生效

---

## 🎉 完成！

您已经完成了**阶段二：个人中心**的后端API开发！

现在可以开始开发前端页面了 🚀

需要帮助吗？告诉我您想实现：
- 👤 个人中心前端页面
- ✏️ 资料编辑页面
- 🎨 像素风格UI组件
