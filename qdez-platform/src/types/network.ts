// src/types/network.ts
// 校友网络相关类型定义

// ==========================================
// 地图相关类型
// ==========================================

/**
 * 地图上显示的校友数据
 */
export interface AlumniMapData {
  id: string
  name: string
  displayName: string | null
  avatar: string | null
  lat: number
  lng: number
  city: string | null
  country: string | null
  school: string | null
  major: string | null
  qdezClass: string
  qdezEnrollmentYear: number
}

/**
 * 校友列表API响应
 */
export interface AlumniListResponse {
  success: boolean
  data?: {
    alumni: AlumniMapData[]
    total: number
  }
  error?: string
}

// ==========================================
// 校友详情类型
// ==========================================

/**
 * 校友详情数据（尊重隐私设置）
 */
export interface AlumniDetail {
  id: string
  name: string
  displayName: string | null
  avatar: string | null
  bio: string | null
  qdezClass: string
  qdezEnrollmentYear: number
  qdezGraduationYear: number | null
  
  // 根据隐私设置可能为null
  location?: {
    city: string | null
    country: string | null
    lat: number | null
    lng: number | null
  } | null
  
  // 根据隐私设置可能为null
  education?: {
    school: string | null
    major: string | null
    degree: string | null
    enrollmentYear: number | null
    expectedGradYear: number | null
  } | null
  
  // 根据隐私设置可能为null
  contact?: {
    wechat: string | null
    linkedin: string | null
    instagram: string | null
    github: string | null
    personalWebsite: string | null
  } | null
  
  // 统计数据（总是公开）
  stats: {
    posts: number
    comments: number
    questions: number
    answers: number
  }
  
  // 注册时间
  createdAt: string
}

/**
 * 校友详情API响应
 */
export interface AlumniDetailResponse {
  success: boolean
  data?: {
    user: AlumniDetail
  }
  error?: string
}

// ==========================================
// 关系网络图类型
// ==========================================

/**
 * 节点类型
 */
export type NodeType = 'major' | 'school' | 'city' | 'user'

/**
 * 连线类型
 */
export type LinkType = 'same-major' | 'same-school' | 'same-city'

/**
 * 关系网络图节点
 */
export interface GraphNode {
  id: string
  name: string
  type: NodeType
  count: number
  color: string
  // 可选：用于用户节点
  avatar?: string
}

/**
 * 关系网络图连线
 */
export interface GraphLink {
  source: string
  target: string
  value: number  // 连线权重（共同人数）
  type: LinkType
}

/**
 * 关系网络图数据
 */
export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

/**
 * 关系网络API响应
 */
export interface GraphResponse {
  success: boolean
  data?: {
    nodes: GraphNode[]
    links: GraphLink[]
    stats: {
      totalUsers: number
      totalMajors: number
      totalSchools: number
      totalCities: number
    }
  }
  error?: string
}

// ==========================================
// 搜索相关类型
// ==========================================

/**
 * 搜索结果项
 */
export interface SearchResultItem {
  id: string
  name: string
  displayName: string | null
  avatar: string | null
  school: string | null
  major: string | null
  city: string | null
  country: string | null
  qdezClass: string
  qdezEnrollmentYear: number
}

/**
 * 搜索API响应
 */
export interface SearchResponse {
  success: boolean
  data?: {
    results: SearchResultItem[]
    total: number
    page: number
    totalPages: number
  }
  error?: string
}

// ==========================================
// 统计相关类型
// ==========================================

/**
 * 分布统计项
 */
export interface DistributionItem {
  name: string
  count: number
  percentage?: number
}

/**
 * 网络统计数据
 */
export interface NetworkStats {
  totalAlumni: number
  byCountry: DistributionItem[]
  bySchool: DistributionItem[]
  byMajor: DistributionItem[]
  byCity: DistributionItem[]
  byQdezClass: DistributionItem[]
}

/**
 * 统计API响应
 */
export interface StatsResponse {
  success: boolean
  data?: NetworkStats
  error?: string
}

// ==========================================
// 筛选器类型
// ==========================================

/**
 * 网络筛选条件
 */
export interface NetworkFilters {
  country?: string
  city?: string
  school?: string
  major?: string
  qdezClass?: string
  qdezEnrollmentYear?: number
}

/**
 * 关系类型筛选
 */
export type RelationType = 'major' | 'school' | 'city' | 'all'

// ==========================================
// 颜色常量
// ==========================================

/**
 * 关系类型对应的颜色
 */
export const RELATION_COLORS: Record<LinkType, string> = {
  'same-major': '#4F46E5',   // 紫色 - 同专业
  'same-school': '#10B981',  // 绿色 - 同校
  'same-city': '#F59E0B',    // 橙色 - 同城
}

/**
 * 节点类型对应的颜色
 */
export const NODE_TYPE_COLORS: Record<NodeType, string> = {
  'major': '#4F46E5',   // 紫色
  'school': '#10B981',  // 绿色
  'city': '#F59E0B',    // 橙色
  'user': '#EC4899',    // 粉色
}

/**
 * 专业分类颜色（与现有mockData保持一致）
 */
export const MAJOR_CATEGORY_COLORS: Record<string, string> = {
  'STEM': '#4F46E5',
  '商科': '#EC4899',
  '人文社科': '#10B981',
  '艺术设计': '#F59E0B',
  '医学': '#EF4444',
  '法律': '#8B5CF6',
  '其他': '#6B7280',
}
