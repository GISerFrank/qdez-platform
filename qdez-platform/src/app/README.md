# QDEZ 青岛二中留学互助平台 - React 版本

## 项目简介

这是青岛二中留学互助平台的 React/Next.js 重构版本，保留了原始 HTML 版本的所有功能和像素风格设计。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + 自定义像素风格
- **地图**: Leaflet + Leaflet.markercluster
- **可视化**: D3.js
- **字体**: Press Start 2P (像素字体)

## 功能模块

- ✅ **首页** - 统计数据展示和最新动态
- ✅ **论坛** - 帖子浏览、发布、回复
- ✅ **问答** - 提问、回答、已解决标记
- ✅ **资源库** - 学习资料、文书模板、简历模板分享
- ✅ **活动日历** - 活动发布、报名、参与
- ✅ **校友网络** - 地图展示 + 专业关系网络图
- ✅ **个人中心** - 用户资料、活动统计、成就系统

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 2. 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

### 3. 打开浏览器

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
qdez-react/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 主页面（包含所有功能）
│   │   └── globals.css         # 全局样式
│   ├── components/
│   │   ├── Navigation.tsx      # 导航栏
│   │   ├── HomePage.tsx        # 首页
│   │   ├── ForumPage.tsx       # 论坛
│   │   ├── QAPage.tsx          # 问答
│   │   ├── ResourcesPage.tsx   # 资源
│   │   ├── EventsPage.tsx      # 活动
│   │   ├── NetworkPage.tsx     # 网络（地图+关系图）
│   │   ├── ProfilePage.tsx     # 个人中心
│   │   └── Footer.tsx          # 页脚
│   └── lib/
│       └── mockData.ts         # 模拟数据
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 设计特色

### 像素风格

- 使用 Press Start 2P 像素字体
- 复古按钮和边框效果
- 扫描线背景动画
- 闪烁光标效果

### 主题系统

支持多个地区主题色：
- 默认蓝色主题
- 亚利桑那（橙色）
- 东京（粉色）
- 伦敦（红色）
- 巴黎（紫色）
- 悉尼（蓝色）

## 数据说明

当前使用的是模拟数据（`src/lib/mockData.ts`），包含：

- 校友信息
- 论坛帖子
- 问答内容
- 资源列表
- 活动信息
- 成就系统

后续可以替换为真实的 API 接口。

## 用户登录

目前支持从 localStorage 读取用户信息（与原 HTML 版本兼容）：

```javascript
// 用户信息格式
{
  name: "张三",
  className: "高三3班",
  location: "arizona",
  locationData: {
    chinese: "美国亚利桑那",
    localName: "Arizona",
    icon: "🌵"
  },
  theme: "arizona"
}
```

## 后续开发计划

- [ ] 添加登录注册功能
- [ ] 连接后端 API
- [ ] 添加实时通知系统
- [ ] 完善活动日历视图
- [ ] 添加搜索功能
- [ ] 优化移动端体验
- [ ] 添加更多交互动画

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT

---

Made with ❤️ by QDEZ Alumni
