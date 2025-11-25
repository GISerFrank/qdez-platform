// src/lib/network/geocode.ts
// 城市坐标转换工具

import { CITY_COORDINATES, COUNTRY_CENTERS, CityCoordinate } from '@/lib/data/city-coordinates'

export interface Coordinates {
  lat: number
  lng: number
}

/**
 * 根据城市和国家获取坐标
 * 
 * 匹配优先级:
 * 1. 精确匹配 "city, country"
 * 2. 城市名模糊匹配
 * 3. 中文别名匹配
 * 4. 国家中心点（兜底）
 * 
 * @param city 城市名
 * @param country 国家名
 * @returns 坐标对象或null
 */
export function getCoordinates(city: string | null, country: string | null): Coordinates | null {
  if (!city && !country) return null
  
  // 标准化输入
  const normalizedCity = city?.trim().toLowerCase() || ''
  const normalizedCountry = country?.trim().toLowerCase() || ''
  
  // 1. 精确匹配 "city, country"
  if (normalizedCity && normalizedCountry) {
    const exactKey = `${normalizedCity}, ${normalizedCountry}`
    const exactMatch = CITY_COORDINATES[exactKey]
    if (exactMatch) {
      return { lat: exactMatch.lat, lng: exactMatch.lng }
    }
  }
  
  // 2. 只用城市名匹配（遍历所有条目）
  if (normalizedCity) {
    for (const [key, coord] of Object.entries(CITY_COORDINATES)) {
      const [cityPart] = key.split(',').map(s => s.trim())
      if (cityPart === normalizedCity) {
        return { lat: coord.lat, lng: coord.lng }
      }
    }
  }
  
  // 3. 检查中文别名
  if (normalizedCity) {
    for (const [key, coord] of Object.entries(CITY_COORDINATES)) {
      if (coord.aliases?.some(alias => alias.toLowerCase() === normalizedCity)) {
        return { lat: coord.lat, lng: coord.lng }
      }
    }
  }
  
  // 4. 模糊匹配城市名（包含关系）
  if (normalizedCity && normalizedCity.length >= 3) {
    for (const [key, coord] of Object.entries(CITY_COORDINATES)) {
      const [cityPart] = key.split(',').map(s => s.trim())
      if (cityPart.includes(normalizedCity) || normalizedCity.includes(cityPart)) {
        return { lat: coord.lat, lng: coord.lng }
      }
    }
  }
  
  // 5. 返回国家中心点（兜底）
  if (normalizedCountry) {
    const countryCenter = COUNTRY_CENTERS[normalizedCountry]
    if (countryCenter) {
      return { lat: countryCenter.lat, lng: countryCenter.lng }
    }
  }
  
  return null
}

/**
 * 批量转换用户数据的坐标
 * 如果用户已有lat/lng则使用，否则根据city/country转换
 */
export function enrichUserCoordinates<T extends {
  latitude?: number | null
  longitude?: number | null
  city?: string | null
  country?: string | null
}>(user: T): T & { lat: number | null, lng: number | null } {
  // 如果已有坐标，直接使用
  if (user.latitude != null && user.longitude != null) {
    return {
      ...user,
      lat: user.latitude,
      lng: user.longitude,
    }
  }
  
  // 否则根据城市转换
  const coords = getCoordinates(user.city || null, user.country || null)
  return {
    ...user,
    lat: coords?.lat || null,
    lng: coords?.lng || null,
  }
}

/**
 * 检查坐标是否有效
 */
export function isValidCoordinates(lat: number | null | undefined, lng: number | null | undefined): boolean {
  if (lat == null || lng == null) return false
  if (typeof lat !== 'number' || typeof lng !== 'number') return false
  if (isNaN(lat) || isNaN(lng)) return false
  if (lat < -90 || lat > 90) return false
  if (lng < -180 || lng > 180) return false
  return true
}

/**
 * 计算两点之间的距离（公里）
 * 使用 Haversine 公式
 */
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371 // 地球半径（公里）
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * 获取城市的标准化名称
 * 用于关系网络图中的节点ID
 */
export function normalizeCityName(city: string | null, country: string | null): string {
  if (!city) return 'Unknown'
  
  // 首字母大写
  const normalized = city.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
  
  // 如果有国家，添加国家缩写
  if (country) {
    const countryAbbr = getCountryAbbreviation(country)
    if (countryAbbr) {
      return `${normalized}, ${countryAbbr}`
    }
  }
  
  return normalized
}

/**
 * 获取国家缩写
 */
function getCountryAbbreviation(country: string): string {
  const abbrs: Record<string, string> = {
    'usa': 'US',
    'us': 'US',
    'united states': 'US',
    'uk': 'UK',
    'united kingdom': 'UK',
    'england': 'UK',
    'canada': 'CA',
    'australia': 'AU',
    'germany': 'DE',
    'france': 'FR',
    'japan': 'JP',
    'singapore': 'SG',
    'hong kong': 'HK',
    'netherlands': 'NL',
    'switzerland': 'CH',
    'ireland': 'IE',
    'south korea': 'KR',
    'korea': 'KR',
    'spain': 'ES',
    'italy': 'IT',
    'sweden': 'SE',
    'denmark': 'DK',
    'new zealand': 'NZ',
    'china': 'CN',
  }
  
  return abbrs[country.toLowerCase()] || country.toUpperCase().slice(0, 2)
}
