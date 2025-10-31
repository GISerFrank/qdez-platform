'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
// 确保 'leaflet/dist/leaflet.css' 已经按上一步建议移到了 app/layout.tsx
// import 'leaflet/dist/leaflet.css' // 确保这行已不在此处
import { alumniData } from '@/lib/mockData'

/**
 * (新) 更健壮的地图尺寸修复组件
 * * 这个组件使用 ResizeObserver 来监视地图容器的尺寸变化。
 * 只要容器尺寸（例如从 0 变为 600px）发生变化，
 * 它就会调用 map.invalidateSize() 来强制地图重绘。
 * 这比固定的 setTimeout(100) 可靠得多。
 */
function MapResizeFix() {
  const map = useMap()

  useEffect(() => {
    // 获取地图容器元素
    const mapContainer = map.getContainer()

    // 确保容器存在
    if (!mapContainer) return

    // 1. 创建一个 ResizeObserver 来监视容器尺寸变化
    const resizeObserver = new ResizeObserver(() => {
      // 当容器尺寸变化时，通知 Leaflet
      map.invalidateSize()
      // console.log('Map size invalidated by ResizeObserver') // 调试时可以取消注释
    })

    // 2. 开始监视
    resizeObserver.observe(mapContainer)

    // 3. 立即调用一次，以防我们错过了初始渲染
    //    我们将其放在一个短暂的 setTimeout(0) 中，以确保它在当前 React 渲染/提交周期之后执行
    const timer = setTimeout(() => {
      map.invalidateSize()
      // console.log('Map size invalidated by initial timeout') // 调试时可以取消注释
    }, 0)

    // 4. 清理：当组件卸载时，停止监视并清除 timeout
    return () => {
      clearTimeout(timer)
      resizeObserver.unobserve(mapContainer)
      resizeObserver.disconnect()
    }
  }, [map]) // 依赖项是 map 实例

  return null
}

export default function MapComponent() {
  // 修复 Leaflet 默认图标问题
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])

  return (
      <MapContainer
          center={[39.0, -95.0]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          preferCanvas={true}
      >
        {/* 使用新的修复组件 */}
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
          {alumniData.map((alumnus, index) => (
              <Marker
                  key={index}
                  position={[alumnus.lat, alumnus.lng]}
              >
                <Popup maxWidth={300}>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '10px',
                    lineHeight: '1.6',
                    color: '#1a1a35',
                    minWidth: '200px'
                  }}>
                    <strong style={{ color: '#4F46E5' }}>{alumnus.name}</strong><br />
                    <span style={{ color: '#666' }}>🎓 {alumnus.school}</span><br />
                    <span style={{ color: '#666' }}>📚 {alumnus.majors.join(', ')}</span><br />
                    <span style={{ color: '#666' }}>📍 {alumnus.location}</span>
                  </div>
                </Popup>
              </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
  )
}