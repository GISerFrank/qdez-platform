// ========== 拼音转换工具 ==========

const PINYIN_MAP: Record<string, string> = {
  '张': 'Zhang', '王': 'Wang', '李': 'Li', '刘': 'Liu', '陈': 'Chen', 
  '杨': 'Yang', '赵': 'Zhao', '黄': 'Huang', '周': 'Zhou', '吴': 'Wu', 
  '徐': 'Xu', '孙': 'Sun', '胡': 'Hu', '朱': 'Zhu', '高': 'Gao', '林': 'Lin',
  '一': 'Yi', '二': 'Er', '三': 'San', '四': 'Si', '五': 'Wu', 
  '六': 'Liu', '七': 'Qi', '八': 'Ba', '九': 'Jiu',
  '明': 'Ming', '华': 'Hua', '强': 'Qiang', '伟': 'Wei', 
  '芳': 'Fang', '静': 'Jing', '丽': 'Li'
}

export function toPinyin(name: string): string {
  return name.split('').map(char => PINYIN_MAP[char] || char).join(' ')
}

// ========== 日期格式化 ==========

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return d.toLocaleDateString('zh-CN')
}

// ========== 本地存储工具 ==========

export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Storage error:', error)
    }
  },
  
  remove(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  },
  
  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.clear()
  }
}

// ========== 类名合并工具 ==========

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ========== 时间相关工具 ==========

export function getTimeOfDay(): 'night' | 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'evening' {
  const hour = new Date().getHours()
  
  if (hour >= 0 && hour < 5) return 'night'
  if (hour >= 5 && hour < 7) return 'dawn'
  if (hour >= 7 && hour < 9) return 'morning'
  if (hour >= 9 && hour < 12) return 'noon'
  if (hour >= 12 && hour < 15) return 'afternoon'
  if (hour >= 15 && hour < 18) return 'dusk'
  if (hour >= 18 && hour < 20) return 'evening'
  return 'night'
}

// ========== 数字格式化 ==========

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
