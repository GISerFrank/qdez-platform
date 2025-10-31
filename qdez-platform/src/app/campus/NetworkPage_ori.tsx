'use client'

import { useEffect, useRef, useState } from 'react'
import { alumniData, disciplines } from '@/lib/mockData'

export default function NetworkPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const chartCleanupRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [chartLoaded, setChartLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  const mapInitializedRef = useRef(false)
  const chartInitializedRef = useRef(false)
  const leafletLoadedRef = useRef(false)

  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // 组件卸载清理
  useEffect(() => {
    return () => {
      console.log('🧹 组件卸载，清理资源...')

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off()
          mapInstanceRef.current.remove()
          console.log('✅ 地图实例已清理')
        } catch (e) {
          console.warn('地图清理警告:', e)
        } finally {
          mapInstanceRef.current = null
        }
      }

      if (chartCleanupRef.current) {
        try {
          chartCleanupRef.current()
          console.log('✅ 图表已清理')
        } catch (e) {
          console.warn('图表清理警告:', e)
        } finally {
          chartCleanupRef.current = null
        }
      }

      mapInitializedRef.current = false
      chartInitializedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initializeMap = async () => {
      if (!mapRef.current) {
        console.log('⏳ 地图容器还未准备好')
        return
      }

      if (mapInstanceRef.current) {
        console.log('⚠️ 地图实例已存在，跳过初始化')
        return
      }

      if (mapInitializedRef.current) {
        console.log('⚠️ 地图正在初始化中，跳过')
        return
      }

      mapInitializedRef.current = true
      await initMap()
    }

    const initializeChart = async () => {
      if (!chartRef.current || chartInitializedRef.current) {
        return
      }
      chartInitializedRef.current = true
      await initNetworkChart()
    }

    initializeMap()
    initializeChart()
  }, []) // ✅ 空依赖数组

  const ensureLeafletLoaded = async () => {
    if (leafletLoadedRef.current && (window as any).L) {
      console.log('✅ Leaflet 已在全局可用')
      return (window as any).L
    }

    console.log('📦 开始加载 Leaflet 核心...')

    const L = await import('leaflet')
    const LeafletLib = L.default || L

    if (typeof window !== 'undefined') {
      (window as any).L = LeafletLib
      console.log('✅ Leaflet 已暴露到全局')

      await new Promise(resolve => setTimeout(resolve, 100))

      if ((window as any).L && (window as any).L.map) {
        console.log('✅ Leaflet 核心验证成功')
        leafletLoadedRef.current = true
      } else {
        throw new Error('Leaflet 暴露失败')
      }
    }

    return LeafletLib
  }

  const loadMarkerClusterPlugin = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!(window as any).L) {
        reject(new Error('Leaflet 未加载，无法加载插件'))
        return
      }

      if ((window as any).L?.markerClusterGroup) {
        console.log('✅ MarkerCluster 插件已存在')
        resolve()
        return
      }

      const existingScript = document.getElementById('leaflet-markercluster-script')
      if (existingScript) {
        console.log('⏳ MarkerCluster 脚本已在加载中，等待完成...')

        let attempts = 0
        const checkInterval = setInterval(() => {
          if ((window as any).L?.markerClusterGroup) {
            clearInterval(checkInterval)
            console.log('✅ MarkerCluster 插件已就绪')
            resolve()
          } else if (attempts++ > 50) {
            clearInterval(checkInterval)
            reject(new Error('等待插件超时'))
          }
        }, 100)
        return
      }

      console.log('📦 加载 MarkerCluster 插件脚本...')

      const script = document.createElement('script')
      script.id = 'leaflet-markercluster-script'
      script.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js'
      script.async = true

      script.onload = () => {
        console.log('📦 MarkerCluster 脚本下载完成')

        let attempts = 0
        const checkInterval = setInterval(() => {
          if ((window as any).L?.markerClusterGroup) {
            clearInterval(checkInterval)
            console.log('✅ MarkerCluster 插件附加成功')
            resolve()
          } else if (attempts++ > 30) {
            clearInterval(checkInterval)
            console.error('❌ 插件下载了但未附加')
            reject(new Error('插件未正确附加'))
          }
        }, 100)
      }

      script.onerror = (error) => {
        console.error('❌ MarkerCluster 脚本下载失败:', error)
        reject(new Error('脚本下载失败'))
      }

      document.head.appendChild(script)
    })
  }

// 在组件内部新增一个工具函数
  const isMapAlive = () => {
    const m = mapInstanceRef.current as any | null
    if (!m) return false
    // 尽量用公开 API；退化到 _container
    const c: HTMLElement | null | undefined = typeof m.getContainer === 'function'
        ? m.getContainer()
        : m._container
    return !!(c && document.body.contains(c))
  }

// 替换 forceMapInvalidateSize
  const forceMapInvalidateSize = () => {
    const m = mapInstanceRef.current as any | null
    if (!m || !isMapAlive()) {
      // 调试可留日志：console.debug('skip invalidate: map not alive')
      return
    }
    try {
      m.invalidateSize({ animate: false, pan: false })
    } catch (e) {
      console.warn('重绘警告(已忽略):', e)
    }
  }


  useEffect(() => {
    let rafId = 0
    const onResize = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        // 仅当地图“活着”时才触发
        if (isMapAlive()) {
          forceMapInvalidateSize()
        }
      })
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [])



  const initMap = async () => {
    if (!mapRef.current) {
      console.warn('⚠️ 地图容器不存在')
      mapInitializedRef.current = false
      return
    }

    if (mapInstanceRef.current) {
      console.warn('⚠️ 地图实例已存在，放弃初始化')
      return
    }

    try {
      console.log('🗺️ === 开始初始化地图 ===')
      setMapError(null)

      const cssLinks = [
        { id: 'leaflet-css', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' },
        { id: 'markercluster-css', href: 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css' },
        { id: 'markercluster-default-css', href: 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css' }
      ]

      cssLinks.forEach(({ id, href }) => {
        if (!document.getElementById(id)) {
          const link = document.createElement('link')
          link.id = id
          link.rel = 'stylesheet'
          link.href = href
          document.head.appendChild(link)
        }
      })

      await new Promise(resolve => setTimeout(resolve, 200))

      const L = await ensureLeafletLoaded()

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      await loadMarkerClusterPlugin()

      if (typeof (window as any).L.markerClusterGroup !== 'function') {
        throw new Error('MarkerCluster 插件验证失败')
      }
      console.log('✅ 所有依赖就绪')

      const container = mapRef.current

      if (!mapRef.current) {
        console.warn('⚠️ 地图容器在await后已不存在')
        mapInitializedRef.current = false
        return
      }

      const containerRect = container.getBoundingClientRect()
      console.log('📐 容器尺寸:', {
        width: containerRect.width,
        height: containerRect.height,
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight
      })

      if (containerRect.height === 0 || containerRect.width === 0) {
        console.warn('⚠️ 容器高度为 0，等待渲染...')
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // 清理容器上的 Leaflet 标记
      if ((container as any)._leaflet_id) {
        console.log('🧹 清理容器上的 Leaflet 标记')
        delete (container as any)._leaflet_id
      }

      // 清理容器内的所有子元素
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
      console.log('🧹 容器已清空')

      const map = L.map(container, {
        preferCanvas: true,
        zoomControl: true,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        boxZoom: true,
        keyboard: true,
        tap: false,
        inertia: true,
        inertiaDeceleration: 3000,
        inertiaMaxSpeed: 1500,
        worldCopyJump: false,
        zoomSnap: 0.5,
        zoomDelta: 1,
      }).setView([39.0, -95.0], 4)

      mapInstanceRef.current = map
      console.log('✅ 地图实例创建成功，已保存引用')

      if (map.dragging && map.dragging.enabled()) {
        console.log('✅ 地图拖动已启用')
      } else {
        console.warn('⚠️ 地图拖动未启用，尝试手动启用...')
        if (map.dragging) {
          map.dragging.enable()
          console.log('✅ 手动启用拖动成功')
        }
      }

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19,
        minZoom: 2,
      }).addTo(map)

      console.log('✅ 地图瓦片层添加成功')

      const markers = (window as any).L.markerClusterGroup({
        iconCreateFunction: function(cluster: any) {
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
        },
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        maxClusterRadius: 80,
      })

      alumniData.forEach(alumnus => {
        const marker = L.marker([alumnus.lat, alumnus.lng])

        marker.bindPopup(`
          <div style="
            font-family: 'Press Start 2P', monospace; 
            font-size: 10px; 
            line-height: 1.6; 
            color: #1a1a35;
            min-width: 200px;
          ">
            <strong style="color: #4F46E5;">${alumnus.name}</strong><br>
            <span style="color: #666;">🎓 ${alumnus.school}</span><br>
            <span style="color: #666;">📚 ${alumnus.majors.join(', ')}</span><br>
            <span style="color: #666;">📍 ${alumnus.location}</span>
          </div>
        `, {
          maxWidth: 300,
          className: 'custom-popup'
        })

        markers.addLayer(marker)
      })

      map.addLayer(markers)
      console.log('✅ 标记添加成功')

      // 初始化后调整大小
      setTimeout(() => {
        forceMapInvalidateSize()
      }, 300)

      // 监听容器尺寸变化（rAF 去抖 + 存活校验）
      if (typeof ResizeObserver !== 'undefined') {
        let roRaf = 0
        const ro = new ResizeObserver(() => {
          cancelAnimationFrame(roRaf)
          roRaf = requestAnimationFrame(() => {
            if (isMapAlive()) {
              forceMapInvalidateSize()
            }
          })
        })
        ro.observe(container)
        resizeObserverRef.current = ro
      }


      setMapLoaded(true)
      console.log('✅ 地图完全初始化成功')

    } catch (error: any) {
      console.error('❌ 地图初始化失败:', error)
      setMapError(error?.message || '未知错误')
      mapInitializedRef.current = false

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (e) {
          console.warn('清理失败的地图实例时出错:', e)
        }
        mapInstanceRef.current = null
      }
    }
  }

  const initNetworkChart = async () => {
    const container = chartRef.current
    if (!container) return

    try {
      console.log('📊 开始初始化网络图...')

      const d3 = await import('d3')
      const width = container.clientWidth
      const height = 600

      const zoom = d3.zoom()
          .scaleExtent([0.5, 3])
          .on('zoom', (event: any) => {
            g.attr('transform', event.transform)
          })

      const svg = d3.select(container)
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('viewBox', `0 0 ${width} ${height}`)
          .attr('preserveAspectRatio', 'xMidYMid meet')
          .style('cursor', 'grab')

      const g = svg.append('g')

      svg.call(zoom as any)
          .on('mousedown', function() {
            d3.select(this).style('cursor', 'grabbing')
          })
          .on('mouseup', function() {
            d3.select(this).style('cursor', 'grab')
          })

      const allMajors = new Set<string>()
      alumniData.forEach(alumnus => {
        alumnus.majors.forEach(major => allMajors.add(major))
      })

      const nodes = Array.from(allMajors).map(major => ({
        id: major,
        count: alumniData.filter(a => a.majors.includes(major)).length,
        category: disciplines[major] ? disciplines[major].category : '其他'
      }))

      const links: any[] = []
      const linkSet = new Set<string>()

      alumniData.forEach(alumnus => {
        if (alumnus.majors.length > 1) {
          for (let i = 0; i < alumnus.majors.length; i++) {
            for (let j = i + 1; j < alumnus.majors.length; j++) {
              const sortedMajors = [alumnus.majors[i], alumnus.majors[j]].sort()
              const linkId = `${sortedMajors[0]}-${sortedMajors[1]}`
              if (!linkSet.has(linkId)) {
                links.push({
                  source: sortedMajors[0],
                  target: sortedMajors[1],
                  value: 1
                })
                linkSet.add(linkId)
              } else {
                const existingLink = links.find(
                    l => l.source === sortedMajors[0] && l.target === sortedMajors[1]
                )
                if (existingLink) existingLink.value++
              }
            }
          }
        }
      })

      const categories = [...new Set(nodes.map(d => d.category))]
      const colorScale = d3.scaleOrdinal()
          .domain(categories)
          .range(['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'])

      const simulation = d3.forceSimulation(nodes as any)
          .force('link', d3.forceLink(links).id((d: any) => d.id).distance(120).strength((link: any) => link.value * 0.1))
          .force('charge', d3.forceManyBody().strength(-400))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collide', d3.forceCollide().radius((d: any) => 15 + Math.sqrt(d.count) * 4))

      const linkGroup = g.append('g')
      const nodeGroup = g.append('g')

      const link = linkGroup.selectAll('line')
          .data(links)
          .join('line')
          .attr('stroke', '#4F46E5')
          .attr('stroke-opacity', 0.4)
          .attr('stroke-width', 2)

      const node = nodeGroup.selectAll('g')
          .data(nodes)
          .join('g')
          .style('cursor', 'pointer')

      node.append('circle')
          .attr('r', (d: any) => 12 + Math.sqrt(d.count) * 3)
          .attr('fill', (d: any) => colorScale(d.category) as string)
          .attr('stroke', '#e0f8cf')
          .attr('stroke-width', 2)

      node.append('text')
          .attr('dy', (d: any) => -(15 + Math.sqrt(d.count) * 3))
          .attr('text-anchor', 'middle')
          .attr('fill', '#e0f8cf')
          .attr('font-size', '10px')
          .attr('font-family', "'Press Start 2P', monospace")
          .text((d: any) => d.id)
          .style('pointer-events', 'none')

      const drag = d3.drag()
          .on('start', (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event: any, d: any) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })

      node.call(drag as any)

      simulation.on('tick', () => {
        link
            .attr('x1', (d: any) => d.source.x)
            .attr('y1', (d: any) => d.source.y)
            .attr('x2', (d: any) => d.target.x)
            .attr('y2', (d: any) => d.target.y)

        node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      })

      node.on('click', (event: any, d: any) => {
        event.stopPropagation()

        node.style('opacity', (o: any) => {
          const isConnected = links.some(
              (l: any) =>
                  (l.source.id === d.id && l.target.id === o.id) ||
                  (l.target.id === d.id && l.source.id === o.id) ||
                  o.id === d.id
          )
          return isConnected ? 1 : 0.1
        })

        link.style('stroke-opacity', (l: any) =>
            l.source.id === d.id || l.target.id === d.id ? 0.6 : 0.1
        )
      })

      svg.on('click', () => {
        node.style('opacity', 1)
        link.style('stroke-opacity', 0.4)
      })

      chartCleanupRef.current = () => {
        try {
          simulation.stop()
          svg.remove()
        } catch (e) {
          console.warn('图表清理警告:', e)
        }
      }

      setChartLoaded(true)
      console.log('✅ 网络图初始化成功')

    } catch (error) {
      console.error('❌ 网络图初始化失败:', error)
      chartInitializedRef.current = false
      setChartLoaded(false)
    }
  }

  return (
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl mb-8 text-center">
          <span className="text-yellow-300">▸</span> 校友网络地图
          <span className="text-yellow-300">◂</span>
        </h2>

        <div
            className="mb-16 border-4 border-[#4F46E5] shadow-[8px_8px_0_rgba(0,0,0,0.5)] relative overflow-hidden"
            style={{
              height: '600px',
              minHeight: '600px',
              maxHeight: '600px',
              width: '100%'
            }}
        >
          <div
              ref={mapRef}
              className="absolute inset-0"
              data-map-container="true"
              style={{
                width: '100%',
                height: '100%',
                zIndex: 1,
                pointerEvents: 'auto',
              }}
          />

          {!mapLoaded && !mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a35] text-yellow-300 text-xs z-10">
                <div className="text-center">
                  <div className="mb-2">⏳ 地图加载中...</div>
                  <div className="text-xs opacity-70">正在初始化 Leaflet</div>
                </div>
              </div>
          )}

          {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a35] text-red-400 text-xs z-10">
                <div className="text-center max-w-md p-4">
                  <div className="mb-2">❌ 地图加载失败</div>
                  <div className="text-xs opacity-70 mb-4">{mapError}</div>
                  <button
                      className="px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      onClick={() => {
                        setMapError(null)
                        mapInitializedRef.current = false
                        leafletLoadedRef.current = false
                        if (mapInstanceRef.current) {
                          try {
                            mapInstanceRef.current.remove()
                          } catch (e) {
                            console.warn('清理地图时出错:', e)
                          }
                          mapInstanceRef.current = null
                        }
                        initMap()
                      }}
                  >
                    🔄 重试加载
                  </button>
                </div>
              </div>
          )}
        </div>

        <h2 className="text-2xl mb-8 text-center mt-16">
          <span className="text-yellow-300">▸</span> 专业关系网络
          <span className="text-yellow-300">◂</span>
        </h2>

        <div
            className="relative w-full bg-[#1a1a35] border-4 border-[#4F46E5] shadow-[8px_8px_0_rgba(0,0,0,0.5)] overflow-hidden"
            style={{
              height: '600px',
              minHeight: '600px'
            }}
        >
          <div ref={chartRef} className="absolute inset-0 h-full w-full" />

          {!chartLoaded && (
              <div className="absolute inset-0 flex items-center justify-center text-yellow-300 text-xs z-10">
                <div className="text-center">
                  <div className="mb-2">⏳ 网络图加载中...</div>
                  <div className="text-xs opacity-70">请稍候</div>
                </div>
              </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#4F46E5]"></div>
            <span>STEM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#EC4899]"></div>
            <span>商科</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#10B981]"></div>
            <span>其他</span>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          <p>💡 提示: 地图可以用鼠标拖动平移和缩放 | 节点图可以拖拽节点，点击高亮相关连接</p>
          <p className="mt-2">🖱️ 拖动地图：按住鼠标左键拖动 | 📱 触摸设备：用手指滑动</p>
        </div>
      </div>
  )
}