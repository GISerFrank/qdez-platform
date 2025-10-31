// ========== 用户相关类型 ==========

export interface UserInfo {
  className: string      // 班级信息，如 "高三3班"
  name: string          // 姓名
  namePinyin: string    // 拼音
  location: string      // 位置代码，如 "arizona"
  locationData: LocationData
  loginTime: string     // ISO 时间字符串
  theme: string        // 主题名称
}

export interface LocationData {
  chinese: string      // 中文名称
  localName: string    // 当地名称
  icon: string        // emoji 图标
}

export const LOCATIONS: Record<string, LocationData> = {
  arizona: { chinese: "美国亚利桑那", localName: "Arizona", icon: "🌵" },
  tokyo: { chinese: "日本东京", localName: "東京", icon: "🌸" },
  london: { chinese: "英国伦敦", localName: "London", icon: "🇬🇧" },
  paris: { chinese: "法国巴黎", localName: "Paris", icon: "🗼" },
  sydney: { chinese: "澳大利亚悉尼", localName: "Sydney", icon: "🦘" },
}

// ========== 校友相关类型 ==========

export interface AlumniData {
  name: string
  lat: number
  lng: number
  location: string
  school: string
  majors: string[]
  year: number
}

// ========== 帖子相关类型 ==========

export interface ForumPost {
  id: number
  title: string
  category: string
  content: string
  author: string
  school: string
  replies: number
  views: number
  likes: number
  time: string
  tags: string[]
  hot: boolean
}

// ========== 问答相关类型 ==========

export interface QAItem {
  id: number
  title: string
  category: string
  content: string
  author: string
  school: string
  answers: number
  views: number
  solved: boolean
  time: string
}

// ========== 资源相关类型 ==========

export interface Resource {
  id: number
  title: string
  type: string
  description: string
  author: string
  school: string
  downloads: number
  likes: number
  time: string
  featured: boolean
}

// ========== 活动相关类型 ==========

export interface Event {
  id: number
  title: string
  type: string
  date: string
  time: string
  location: string
  organizer: string
  attendees: number
  maxAttendees: number
  description: string
  status: 'upcoming' | 'past'
}

// ========== 通知相关类型 ==========

export interface Notification {
  id: number
  type: 'reply' | 'like' | 'achievement' | 'event' | 'answer'
  title: string
  content: string
  time: string
  read: boolean
  icon: string
}

// ========== 成就相关类型 ==========

export interface Achievement {
  id: number
  icon: string
  name: string
  desc: string
  unlocked: boolean
}

export interface AchievementData {
  contribution: Achievement[]
  learning: Achievement[]
  social: Achievement[]
}

// ========== 主题相关类型 ==========

export type ThemeType = 'default' | 'arizona' | 'tokyo' | 'london' | 'paris' | 'sydney'

export interface ThemeColors {
  primary: string
  bg: string
  inputBg: string
}
