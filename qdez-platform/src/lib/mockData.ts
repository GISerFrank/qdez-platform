// 校友数据
export const alumniData = [
  { name: "张三", lat: 42.3601, lng: -71.0589, location: "Boston, MA", school: "MIT", majors: ["计算机科学", "数学"], year: 2025 },
  { name: "李四", lat: 34.0522, lng: -118.2437, location: "Los Angeles, CA", school: "UCLA", majors: ["经济学"], year: 2024 },
  { name: "王五", lat: 37.8719, lng: -122.2585, location: "Berkeley, CA", school: "UC Berkeley", majors: ["计算机科学"], year: 2023 },
  { name: "赵六", lat: 42.3505, lng: -71.1054, location: "Boston, MA", school: "Boston University", majors: ["商业分析"], year: 2022 },
  { name: "孙七", lat: 40.7128, lng: -74.0060, location: "New York, NY", school: "Columbia", majors: ["金融"], year: 2025 },
  { name: "周八", lat: 37.4275, lng: -122.1697, location: "Palo Alto, CA", school: "Stanford", majors: ["计算机科学", "统计学"], year: 2024 },
];

// 学科分类
export const disciplines: Record<string, { category: string; color: string }> = {
  "计算机科学": { category: "STEM", color: "#4F46E5" },
  "数学": { category: "STEM", color: "#7C3AED" },
  "统计学": { category: "STEM", color: "#7C3AED" },
  "经济学": { category: "商科", color: "#EC4899" },
  "金融": { category: "商科", color: "#EC4899" },
  "商业分析": { category: "商科", color: "#F59E0B" },
};

// 地点数据
export const locations: Record<string, { chinese: string; localName: string; icon: string }> = {
  arizona: { chinese: "美国亚利桑那", localName: "Arizona", icon: "🌵" },
  tokyo: { chinese: "日本东京", localName: "東京", icon: "🌸" },
  london: { chinese: "英国伦敦", localName: "London", icon: "🇬🇧" },
  paris: { chinese: "法国巴黎", localName: "Paris", icon: "🗼" },
  sydney: { chinese: "澳大利亚悉尼", localName: "Sydney", icon: "🦘" }
};

// 通知数据
export const notificationsData = [
  {
    id: 1,
    type: "reply",
    title: "新回复",
    content: "张三 回复了你的帖子《CS申请经验分享》",
    time: "5分钟前",
    read: false,
    icon: "💬"
  },
  {
    id: 2,
    type: "like",
    title: "获得点赞",
    content: "你的回答获得了10个赞",
    time: "1小时前",
    read: false,
    icon: "👍"
  },
  {
    id: 3,
    type: "achievement",
    title: "解锁新成就",
    content: "恭喜你解锁成就：【热心助人】",
    time: "2小时前",
    read: false,
    icon: "🏆"
  },
  {
    id: 4,
    type: "event",
    title: "活动提醒",
    content: "你报名的《波士顿校友聚会》将在明天开始",
    time: "3小时前",
    read: true,
    icon: "📅"
  },
  {
    id: 5,
    type: "answer",
    title: "问题被解答",
    content: "你的问题《F1签证续签》有了新的回答",
    time: "1天前",
    read: true,
    icon: "✅"
  },
];

// 活动数据
export const eventsData = [
  {
    id: 1,
    title: "🎓 MIT校友经验分享会",
    type: "📚 学术讲座",
    date: "2025-10-25",
    time: "19:00",
    location: "线上Zoom",
    organizer: "张三",
    attendees: 45,
    maxAttendees: 100,
    description: "MIT在读学长分享CS专业申请经验、课程选择和科研机会",
    status: "upcoming"
  },
  {
    id: 2,
    title: "🍽️ 波士顿美食探店活动",
    type: "🍽️ 美食探店",
    date: "2025-10-28",
    time: "18:30",
    location: "Cambridge, MA",
    organizer: "赵六",
    attendees: 12,
    maxAttendees: 15,
    description: "一起探索波士顿的地道美食，结识新朋友",
    status: "upcoming"
  },
  {
    id: 3,
    title: "💼 秋招面试经验交流",
    type: "💼 职业发展",
    date: "2025-11-02",
    time: "15:00",
    location: "线上",
    organizer: "王五",
    attendees: 78,
    maxAttendees: 200,
    description: "已拿offer学长分享面试技巧、简历优化和谈判经验",
    status: "upcoming"
  },
  {
    id: 4,
    title: "🏃 周末徒步活动",
    type: "🏃 运动健身",
    date: "2025-11-05",
    time: "09:00",
    location: "Berkeley Hills",
    organizer: "周八",
    attendees: 20,
    maxAttendees: 30,
    description: "湾区徒步，欣赏美景，锻炼身体",
    status: "upcoming"
  },
  {
    id: 5,
    title: "🎉 中秋校友聚会",
    type: "🎉 社交聚会",
    date: "2025-09-15",
    time: "18:00",
    location: "New York",
    organizer: "孙七",
    attendees: 35,
    maxAttendees: 50,
    description: "纽约地区校友中秋聚会，已圆满结束",
    status: "past"
  },
];

// 成就系统数据
export const achievementsData = {
  contribution: [
    { id: 1, icon: "📝", name: "初出茅庐", desc: "发布第1篇帖子", unlocked: true },
    { id: 2, icon: "✏️", name: "笔耕不辍", desc: "发布10篇帖子", unlocked: true },
    { id: 3, icon: "📚", name: "内容大师", desc: "发布50篇帖子", unlocked: false },
    { id: 4, icon: "💬", name: "积极评论", desc: "评论100次", unlocked: true },
    { id: 5, icon: "🎯", name: "精准回答", desc: "10个回答被采纳", unlocked: false },
    { id: 6, icon: "🌟", name: "人气王", desc: "获得500个赞", unlocked: false },
  ],
  learning: [
    { id: 7, icon: "📖", name: "好学宝宝", desc: "下载10个资源", unlocked: true },
    { id: 8, icon: "🎓", name: "学习达人", desc: "下载50个资源", unlocked: false },
    { id: 9, icon: "📊", name: "数据分析", desc: "查看统计数据20次", unlocked: true },
    { id: 10, icon: "🔍", name: "探索者", desc: "浏览100个帖子", unlocked: false },
    { id: 11, icon: "⭐", name: "收藏家", desc: "收藏50个内容", unlocked: false },
    { id: 12, icon: "🎯", name: "目标明确", desc: "完成个人资料", unlocked: true },
  ],
  social: [
    { id: 13, icon: "👋", name: "新人报到", desc: "注册账号", unlocked: true },
    { id: 14, icon: "🤝", name: "社交新星", desc: "添加10个好友", unlocked: false },
    { id: 15, icon: "🎉", name: "派对达人", desc: "参加5个活动", unlocked: false },
    { id: 16, icon: "🏃", name: "活动组织者", desc: "创建3个活动", unlocked: false },
    { id: 17, icon: "👍", name: "热心助人", desc: "帮助他人50次", unlocked: true },
    { id: 18, icon: "🌈", name: "社区之星", desc: "获得社区认可", unlocked: false },
  ]
};

// 论坛帖子模拟数据
export const forumPosts = [
  {
    id: 1,
    title: "🎓 2025 Fall CS申请总结 - MIT/Stanford录取经验分享",
    category: "申请经验",
    content: "详细分享我的申请时间线、文书准备、推荐信策略以及面试经验...",
    author: "张三",
    school: "MIT'25",
    replies: 156,
    views: 2341,
    likes: 89,
    time: "2天前",
    tags: ["CS", "申请", "经验分享"],
    hot: true
  },
  {
    id: 2,
    title: "🏠 波士顿租房避坑指南 - 超详细区域分析",
    category: "生活攻略",
    content: "在波士顿生活3年，整理了各区域租房的优缺点、价格区间...",
    author: "赵六",
    school: "BU'22",
    replies: 45,
    views: 789,
    likes: 67,
    time: "5小时前",
    tags: ["波士顿", "租房", "生活"],
    hot: false
  },
  {
    id: 3,
    title: "💼 如何在美国找到第一份实习？我的求职经验",
    category: "实习求职",
    content: "从简历投递到面试准备，分享我拿到Google实习offer的全过程...",
    author: "王五",
    school: "Berkeley'23",
    replies: 98,
    views: 1567,
    likes: 134,
    time: "1天前",
    tags: ["实习", "求职", "Google"],
    hot: true
  },
  {
    id: 4,
    title: "📚 推荐几个学习CS的优质在线课程",
    category: "学习交流",
    content: "整理了一些我上过觉得很好的线上课程，包括算法、系统设计等...",
    author: "周八",
    school: "Stanford'24",
    replies: 34,
    views: 456,
    likes: 52,
    time: "3天前",
    tags: ["CS", "学习", "课程"],
    hot: false
  },
];

// 问答数据
export const qaData = [
  {
    id: 1,
    title: "📖 F1签证续签材料清单和注意事项？",
    category: "签证问题",
    content: "准备回国续签F1，想问下最新的材料要求和流程...",
    author: "李四",
    school: "UCLA'24",
    answers: 12,
    views: 234,
    solved: true,
    time: "1天前"
  },
  {
    id: 2,
    title: "🎯 GPA 3.5 申请Top30 CS有希望吗？",
    category: "选校定位",
    content: "本科GPA 3.5，有一些项目经历，想申请CS研究生...",
    author: "匿名用户",
    school: "某211",
    answers: 8,
    views: 456,
    solved: false,
    time: "6小时前"
  },
  {
    id: 3,
    title: "✈️ 入学前需要准备什么物品？",
    category: "入学准备",
    content: "拿到offer了，想问下去美国读书需要带什么东西...",
    author: "新生小白",
    school: "某高中",
    answers: 15,
    views: 789,
    solved: true,
    time: "2天前"
  },
];

// 资源数据
export const resourcesData = [
  {
    id: 1,
    title: "GRE词汇速记宝典 + Anki卡组分享",
    type: "📚 学习资料",
    description: "整理了一套高频GRE词汇，配合Anki记忆曲线，已帮助30+学长学姐...",
    author: "王五",
    school: "Berkeley'23",
    downloads: 289,
    likes: 156,
    time: "3天前",
    featured: true
  },
  {
    id: 2,
    title: "CS专业Personal Statement范文集合",
    type: "📄 文书模板",
    description: "收集了10篇成功申请Top10的PS范文，含详细点评...",
    author: "张三",
    school: "MIT'25",
    downloads: 421,
    likes: 234,
    time: "1周前",
    featured: true
  },
  {
    id: 3,
    title: "软件工程师简历模板（ATS友好）",
    type: "💼 简历模板",
    description: "针对北美科技公司优化的简历模板，通过率高...",
    author: "周八",
    school: "Stanford'24",
    downloads: 567,
    likes: 312,
    time: "5天前",
    featured: false
  },
];
