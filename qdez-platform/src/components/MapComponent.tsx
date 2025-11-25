// src/components/MapComponent.tsx
// 基于原代码修改：保留原有地图实现，添加API数据获取

'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
// 注意：leaflet.css 应该在 app/layout.tsx 中导入

// 校友数据类型
interface AlumniMapData {
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

// Props类型
interface MapComponentProps {
  onAlumniClick?: (alumniId: string) => void
  filters?: {
    country?: string
    city?: string
    school?: string
    major?: string
  }
}

/**
 * 地图尺寸修复组件（保留原有实现）
 * 使用 ResizeObserver 监视地图容器的尺寸变化
 */
function MapResizeFix() {
  const map = useMap()

  useEffect(() => {
    const mapContainer = map.getContainer()
    if (!mapContainer) return

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })

    resizeObserver.observe(mapContainer)

    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 0)

    return () => {
      clearTimeout(timer)
      resizeObserver.unobserve(mapContainer)
      resizeObserver.disconnect()
    }
  }, [map])

  return null
}

export default function MapComponent({ onAlumniClick, filters }: MapComponentProps) {
  const [alumni, setAlumni] = useState<AlumniMapData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 修复 Leaflet 默认图标问题（在 useEffect 中执行，避免 SSR 问题）
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])

  // 获取校友数据
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true)
        setError(null)

        // 构建查询参数
        const params = new URLSearchParams()
        if (filters?.country) params.append('country', filters.country)
        if (filters?.city) params.append('city', filters.city)
        if (filters?.school) params.append('school', filters.school)
        if (filters?.major) params.append('major', filters.major)

        const response = await fetch(`/api/network/alumni?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          setAlumni(data.data.alumni)
        } else {
          setError(data.error || '获取数据失败')
        }
      } catch (err) {
        console.error('Fetch alumni error:', err)
        setError('网络错误，请稍后重试')
      } finally {
        setLoading(false)
      }
    }

    fetchAlumni()
  }, [filters])

  // 加载状态
  if (loading) {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a35] text-yellow-300 text-xs">
          <div className="text-center">
            <div className="mb-2">⏳ 加载校友数据中...</div>
            <div className="text-xs opacity-70">请稍候</div>
          </div>
        </div>
    )
  }

  // 错误状态
  if (error) {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a35] text-red-400 text-xs">
          <div className="text-center">
            <div className="mb-2">❌ {error}</div>
            <button
                className="text-yellow-300 underline"
                onClick={() => window.location.reload()}
            >
              点击重试
            </button>
          </div>
        </div>
    )
  }

  // 空数据状态
  if (alumni.length === 0) {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a35] text-gray-400 text-xs">
          <div className="text-center">
            <div className="mb-2">🗺️ 暂无校友位置数据</div>
            <div className="text-xs opacity-70">完善个人资料后会在地图上显示</div>
          </div>
        </div>
    )
  }

  return (
      <MapContainer
          center={[39.0, -95.0]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          preferCanvas={true}
      >
        {/* 保留原有的修复组件 */}
        <MapResizeFix />

        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
            minZoom={2}
        />

        <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={(cluster) => {
              const count = cluster.getChildCount()
              return L.divIcon({
                html: `<div style="
              background: #4F46E5; 
              color: white; 
              border: 3px solid white; 
              width: 40px; 
              height: 40px; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-family: 'Press Start 2P', monospace; 
              font-size: 12px; 
              box-shadow: 4px 4px 0 #000;
            ">${count}</div>`,
                className: 'marker-cluster-custom',
                iconSize: L.point(40, 40)
              })
            }}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            maxClusterRadius={80}
        >
          {alumni.map((alumnus) => (
              <Marker
                  key={alumnus.id}
                  position={[alumnus.lat, alumnus.lng]}
                  eventHandlers={{
                    click: () => onAlumniClick?.(alumnus.id),
                  }}
              >
                <Popup maxWidth={300}>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '10px',
                    lineHeight: '1.6',
                    color: '#1a1a35',
                    minWidth: '200px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      {alumnus.avatar && (
                          <img
                              src={alumnus.avatar}
                              alt={alumnus.name}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '4px',
                                marginRight: '8px',
                                border: '2px solid #4F46E5'
                              }}
                          />
                      )}
                      <strong style={{ color: '#4F46E5' }}>
                        {alumnus.displayName || alumnus.name}
                      </strong>
                    </div>
                    <span style={{ color: '#666' }}>🎓 {alumnus.school || '未填写学校'}</span><br />
                    <span style={{ color: '#666' }}>📚 {alumnus.major || '未填写专业'}</span><br />
                    <span style={{ color: '#666' }}>📍 {[alumnus.city, alumnus.country].filter(Boolean).join(', ') || '未知位置'}</span>
                    <div style={{ color: '#888', fontSize: '8px', marginTop: '4px' }}>
                      二中 {alumnus.qdezClass} · {alumnus.qdezEnrollmentYear}级
                    </div>
                    {onAlumniClick && (
                        <button
                            onClick={() => onAlumniClick(alumnus.id)}
                            style={{
                              marginTop: '8px',
                              padding: '4px 8px',
                              background: '#4F46E5',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              fontFamily: "'Press Start 2P', monospace",
                              fontSize: '8px',
                            }}
                        >
                          查看详情 →
                        </button>
                    )}
                  </div>
                </Popup>
              </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
  )
}