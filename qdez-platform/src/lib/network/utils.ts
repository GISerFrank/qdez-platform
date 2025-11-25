// src/lib/network/utils.ts
// 校友网络工具函数

import { GraphNode, GraphLink, LinkType, NodeType, NODE_TYPE_COLORS, MAJOR_CATEGORY_COLORS } from '@/types/network'

// ==========================================
// 关系网络图构建工具
// ==========================================

/**
 * 用户数据接口（用于构建关系图）
 */
interface UserForGraph {
  id: string
  major: string | null
  currentSchool: string | null
  city: string | null
}

/**
 * 构建同专业关系网络
 */
export function buildMajorGraph(users: UserForGraph[]): { nodes: GraphNode[], links: GraphLink[] } {
  const majorCount = new Map<string, number>()
  const majorUsers = new Map<string, Set<string>>()

  // 统计每个专业的用户数
  users.forEach(user => {
    if (user.major) {
      const major = user.major.trim()
      majorCount.set(major, (majorCount.get(major) || 0) + 1)

      if (!majorUsers.has(major)) {
        majorUsers.set(major, new Set())
      }
      majorUsers.get(major)!.add(user.id)
    }
  })

  // 创建节点
  const nodes: GraphNode[] = Array.from(majorCount.entries())
      .filter(([_, count]) => count >= 1) // 至少1人
      .map(([major, count]) => ({
        id: `major:${major}`,
        name: major,
        type: 'major' as NodeType,
        count,
        color: getMajorColor(major),
      }))

  // 创建连线（同一用户学习多个专业的情况）
  // 对于同专业关系，我们连接有共同用户的专业
  const links: GraphLink[] = []
  const majors = Array.from(majorUsers.keys())

  for (let i = 0; i < majors.length; i++) {
    for (let j = i + 1; j < majors.length; j++) {
      const users1 = majorUsers.get(majors[i])!
      const users2 = majorUsers.get(majors[j])!

      // 计算交集（同时学这两个专业的人数）
      const intersection = new Set([...users1].filter(x => users2.has(x)))

      if (intersection.size > 0) {
        links.push({
          source: `major:${majors[i]}`,
          target: `major:${majors[j]}`,
          value: intersection.size,
          type: 'same-major',
        })
      }
    }
  }

  return { nodes, links }
}

/**
 * 构建同校关系网络
 */
export function buildSchoolGraph(users: UserForGraph[]): { nodes: GraphNode[], links: GraphLink[] } {
  const schoolCount = new Map<string, number>()
  const schoolUsers = new Map<string, Set<string>>()

  users.forEach(user => {
    if (user.currentSchool) {
      const school = user.currentSchool.trim()
      schoolCount.set(school, (schoolCount.get(school) || 0) + 1)

      if (!schoolUsers.has(school)) {
        schoolUsers.set(school, new Set())
      }
      schoolUsers.get(school)!.add(user.id)
    }
  })

  const nodes: GraphNode[] = Array.from(schoolCount.entries())
      .filter(([_, count]) => count >= 1)
      .map(([school, count]) => ({
        id: `school:${school}`,
        name: school,
        type: 'school' as NodeType,
        count,
        color: NODE_TYPE_COLORS.school,
      }))

  // 同校的连线：连接地理位置相近的学校（可选）
  // 这里我们不创建school之间的连线，而是在混合模式下连接school和其他类型
  const links: GraphLink[] = []

  return { nodes, links }
}

/**
 * 构建同城关系网络
 */
export function buildCityGraph(users: UserForGraph[]): { nodes: GraphNode[], links: GraphLink[] } {
  const cityCount = new Map<string, number>()
  const cityUsers = new Map<string, Set<string>>()

  users.forEach(user => {
    if (user.city) {
      const city = user.city.trim()
      cityCount.set(city, (cityCount.get(city) || 0) + 1)

      if (!cityUsers.has(city)) {
        cityUsers.set(city, new Set())
      }
      cityUsers.get(city)!.add(user.id)
    }
  })

  const nodes: GraphNode[] = Array.from(cityCount.entries())
      .filter(([_, count]) => count >= 1)
      .map(([city, count]) => ({
        id: `city:${city}`,
        name: city,
        type: 'city' as NodeType,
        count,
        color: NODE_TYPE_COLORS.city,
      }))

  const links: GraphLink[] = []

  return { nodes, links }
}

/**
 * 构建混合关系网络（all模式）
 * 显示专业、学校、城市三种节点，并建立它们之间的关联
 */
export function buildAllGraph(users: UserForGraph[]): { nodes: GraphNode[], links: GraphLink[] } {
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []

  // 收集统计数据
  const majorCount = new Map<string, number>()
  const schoolCount = new Map<string, number>()
  const cityCount = new Map<string, number>()

  // 收集关联关系
  const majorSchoolLinks = new Map<string, number>() // "major:school" -> count
  const schoolCityLinks = new Map<string, number>()   // "school:city" -> count
  const majorCityLinks = new Map<string, number>()    // "major:city" -> count

  users.forEach(user => {
    const major = user.major?.trim()
    const school = user.currentSchool?.trim()
    const city = user.city?.trim()

    if (major) majorCount.set(major, (majorCount.get(major) || 0) + 1)
    if (school) schoolCount.set(school, (schoolCount.get(school) || 0) + 1)
    if (city) cityCount.set(city, (cityCount.get(city) || 0) + 1)

    // 建立关联
    if (major && school) {
      const key = `major:${major}|school:${school}`
      majorSchoolLinks.set(key, (majorSchoolLinks.get(key) || 0) + 1)
    }
    if (school && city) {
      const key = `school:${school}|city:${city}`
      schoolCityLinks.set(key, (schoolCityLinks.get(key) || 0) + 1)
    }
    if (major && city) {
      const key = `major:${major}|city:${city}`
      majorCityLinks.set(key, (majorCityLinks.get(key) || 0) + 1)
    }
  })

  // 创建节点
  majorCount.forEach((count, major) => {
    if (count >= 1) {
      nodes.push({
        id: `major:${major}`,
        name: major,
        type: 'major',
        count,
        color: getMajorColor(major),
      })
    }
  })

  schoolCount.forEach((count, school) => {
    if (count >= 1) {
      nodes.push({
        id: `school:${school}`,
        name: school,
        type: 'school',
        count,
        color: NODE_TYPE_COLORS.school,
      })
    }
  })

  cityCount.forEach((count, city) => {
    if (count >= 1) {
      nodes.push({
        id: `city:${city}`,
        name: city,
        type: 'city',
        count,
        color: NODE_TYPE_COLORS.city,
      })
    }
  })

  // 创建连线（只保留权重>=1的）
  majorSchoolLinks.forEach((value, key) => {
    if (value >= 1) {
      const [source, target] = key.split('|')
      links.push({
        source,
        target,
        value,
        type: 'same-major', // major和school的关联
      })
    }
  })

  schoolCityLinks.forEach((value, key) => {
    if (value >= 1) {
      const [source, target] = key.split('|')
      links.push({
        source,
        target,
        value,
        type: 'same-school', // school和city的关联
      })
    }
  })

  // major和city的关联可选，可能会导致图太复杂
  // 这里我们只在用户数>=2时才添加
  majorCityLinks.forEach((value, key) => {
    if (value >= 2) {
      const [source, target] = key.split('|')
      links.push({
        source,
        target,
        value,
        type: 'same-city',
      })
    }
  })

  return { nodes, links }
}

// ==========================================
// 颜色工具
// ==========================================

/**
 * 根据专业名称获取颜色
 */
export function getMajorColor(major: string): string {
  // 根据专业关键词判断分类
  const majorLower = major.toLowerCase()

  // STEM
  if (
      majorLower.includes('computer') ||
      majorLower.includes('计算机') ||
      majorLower.includes('software') ||
      majorLower.includes('math') ||
      majorLower.includes('数学') ||
      majorLower.includes('statistics') ||
      majorLower.includes('统计') ||
      majorLower.includes('physics') ||
      majorLower.includes('物理') ||
      majorLower.includes('chemistry') ||
      majorLower.includes('化学') ||
      majorLower.includes('biology') ||
      majorLower.includes('生物') ||
      majorLower.includes('engineering') ||
      majorLower.includes('工程') ||
      majorLower.includes('data') ||
      majorLower.includes('数据') ||
      majorLower.includes('ai') ||
      majorLower.includes('机器学习')
  ) {
    return MAJOR_CATEGORY_COLORS['STEM']
  }

  // 商科
  if (
      majorLower.includes('business') ||
      majorLower.includes('商') ||
      majorLower.includes('finance') ||
      majorLower.includes('金融') ||
      majorLower.includes('economics') ||
      majorLower.includes('经济') ||
      majorLower.includes('accounting') ||
      majorLower.includes('会计') ||
      majorLower.includes('marketing') ||
      majorLower.includes('市场') ||
      majorLower.includes('management') ||
      majorLower.includes('管理') ||
      majorLower.includes('mba')
  ) {
    return MAJOR_CATEGORY_COLORS['商科']
  }

  // 人文社科
  if (
      majorLower.includes('psychology') ||
      majorLower.includes('心理') ||
      majorLower.includes('sociology') ||
      majorLower.includes('社会') ||
      majorLower.includes('political') ||
      majorLower.includes('政治') ||
      majorLower.includes('history') ||
      majorLower.includes('历史') ||
      majorLower.includes('philosophy') ||
      majorLower.includes('哲学') ||
      majorLower.includes('literature') ||
      majorLower.includes('文学') ||
      majorLower.includes('language') ||
      majorLower.includes('语言') ||
      majorLower.includes('education') ||
      majorLower.includes('教育')
  ) {
    return MAJOR_CATEGORY_COLORS['人文社科']
  }

  // 艺术设计
  if (
      majorLower.includes('art') ||
      majorLower.includes('艺术') ||
      majorLower.includes('design') ||
      majorLower.includes('设计') ||
      majorLower.includes('music') ||
      majorLower.includes('音乐') ||
      majorLower.includes('film') ||
      majorLower.includes('电影') ||
      majorLower.includes('media') ||
      majorLower.includes('传媒') ||
      majorLower.includes('architecture') ||
      majorLower.includes('建筑')
  ) {
    return MAJOR_CATEGORY_COLORS['艺术设计']
  }

  // 医学
  if (
      majorLower.includes('medicine') ||
      majorLower.includes('医') ||
      majorLower.includes('nursing') ||
      majorLower.includes('护理') ||
      majorLower.includes('pharmacy') ||
      majorLower.includes('药') ||
      majorLower.includes('health') ||
      majorLower.includes('健康') ||
      majorLower.includes('dental') ||
      majorLower.includes('牙')
  ) {
    return MAJOR_CATEGORY_COLORS['医学']
  }

  // 法律
  if (
      majorLower.includes('law') ||
      majorLower.includes('法') ||
      majorLower.includes('legal') ||
      majorLower.includes('juris')
  ) {
    return MAJOR_CATEGORY_COLORS['法律']
  }

  return MAJOR_CATEGORY_COLORS['其他']
}

// ==========================================
// 分页工具
// ==========================================

/**
 * 计算分页偏移量
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit
}

/**
 * 生成分页元数据
 */
export function generatePaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  }
}

// ==========================================
// 隐私设置工具
// ==========================================

/**
 * 隐私设置接口
 */
export interface PrivacySettings {
  profilePublic?: boolean
  locationPublic?: boolean
  contactPublic?: boolean
  searchable?: boolean
}

/**
 * 解析隐私设置JSON
 */
export function parsePrivacySettings(json: any): PrivacySettings {
  if (!json) {
    return {
      profilePublic: true,
      locationPublic: true,
      contactPublic: false,
      searchable: true,
    }
  }

  if (typeof json === 'string') {
    try {
      return JSON.parse(json)
    } catch {
      return {
        profilePublic: true,
        locationPublic: true,
        contactPublic: false,
        searchable: true,
      }
    }
  }

  return json as PrivacySettings
}

/**
 * 检查位置是否公开
 */
export function isLocationPublic(privacySettings: any): boolean {
  const settings = parsePrivacySettings(privacySettings)
  return settings.locationPublic !== false
}

/**
 * 检查联系方式是否公开
 */
export function isContactPublic(privacySettings: any): boolean {
  const settings = parsePrivacySettings(privacySettings)
  return settings.contactPublic === true
}

/**
 * 检查资料是否公开
 */
export function isProfilePublic(privacySettings: any): boolean {
  const settings = parsePrivacySettings(privacySettings)
  return settings.profilePublic !== false
}

/**
 * 检查用户是否可被搜索
 */
export function isSearchable(privacySettings: any): boolean {
  const settings = parsePrivacySettings(privacySettings)
  return settings.searchable !== false
}