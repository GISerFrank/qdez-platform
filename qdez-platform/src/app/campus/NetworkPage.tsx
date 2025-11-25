// src/app/campus/NetworkPage.tsx
// 更新版：支持三种关联类型（同专业、同校、同城）+ API数据

'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { GraphNode, GraphLink, RelationType, NODE_TYPE_COLORS } from '@/types/network'

// 动态导入 ForceGraph（避免 SSR 问题）
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
      <div className="absolute inset-0 flex items-center justify-center text-yellow-300 text-xs">
        <div className="text-center">
          <div className="mb-2">⏳ 网络图加载中...</div>
          <div className="text-xs opacity-70">请稍候</div>
        </div>
      </div>
  )
})

// 动态导入地图组件（避免 SSR 问题）
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a35] text-yellow-300 text-xs">
        <div className="text-center">
          <div className="mb-2">⏳ 地图加载中...</div>
          <div className="text-xs opacity-70">正在初始化...</div>
        </div>
      </div>
  )
})

// 关联类型配置
const RELATION_TYPE_CONFIG: Record<RelationType, { label: string, icon: string, color: string }> = {
  all: { label: '全部', icon: '🌐', color: '#6B7280' },
  major: { label: '同专业', icon: '📚', color: '#4F46E5' },
  school: { label: '同校', icon: '🎓', color: '#10B981' },
  city: { label: '同城', icon: '📍', color: '#F59E0B' },
}

// 校友详情Modal组件
function AlumniDetailModal({
                             alumniId,
                             onClose
                           }: {
  alumniId: string | null
  onClose: () => void
}) {
  const [detail, setDetail] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!alumniId) {
      setDetail(null)
      return
    }

    const fetchDetail = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/network/alumni/${alumniId}`)
        const data = await response.json()
        if (data.success) {
          setDetail(data.data.user)
        }
      } catch (err) {
        console.error('Fetch alumni detail error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [alumniId])

  if (!alumniId) return null

  return (
      <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
      >
        <div
            className="bg-[#2a2a4a] border-4 border-[#4F46E5] p-6 max-w-md w-full shadow-[8px_8px_0_rgba(0,0,0,0.5)]"
            onClick={e => e.stopPropagation()}
        >
          {loading ? (
              <div className="text-center text-yellow-300 py-8">
                <div className="mb-2">⏳ 加载中...</div>
              </div>
          ) : detail ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  {detail.avatar && (
                      <img
                          src={detail.avatar}
                          alt={detail.name}
                          className="w-16 h-16 rounded border-2 border-[#4F46E5]"
                      />
                  )}
                  <div>
                    <h3 className="text-lg text-yellow-300">{detail.displayName || detail.name}</h3>
                    <p className="text-xs text-gray-400">
                      二中 {detail.qdezClass} · {detail.qdezEnrollmentYear}级
                    </p>
                  </div>
                </div>

                {detail.bio && (
                    <p className="text-xs text-gray-300 mb-4 border-l-2 border-[#4F46E5] pl-3">
                      {detail.bio}
                    </p>
                )}

                {detail.education && (
                    <div className="mb-4">
                      <h4 className="text-xs text-yellow-300 mb-2">🎓 教育背景</h4>
                      <div className="text-xs text-gray-300 space-y-1">
                        {detail.education.school && <div>学校: {detail.education.school}</div>}
                        {detail.education.major && <div>专业: {detail.education.major}</div>}
                        {detail.education.degree && <div>学位: {detail.education.degree}</div>}
                      </div>
                    </div>
                )}

                {detail.location && (
                    <div className="mb-4">
                      <h4 className="text-xs text-yellow-300 mb-2">📍 位置</h4>
                      <div className="text-xs text-gray-300">
                        {[detail.location.city, detail.location.country].filter(Boolean).join(', ')}
                      </div>
                    </div>
                )}

                {detail.contact && (
                    <div className="mb-4">
                      <h4 className="text-xs text-yellow-300 mb-2">📞 联系方式</h4>
                      <div className="text-xs text-gray-300 space-y-1">
                        {detail.contact.wechat && <div>微信: {detail.contact.wechat}</div>}
                        {detail.contact.linkedin && (
                            <a href={detail.contact.linkedin} target="_blank" className="text-cyan-300 hover:underline block">
                              LinkedIn →
                            </a>
                        )}
                        {detail.contact.github && (
                            <a href={detail.contact.github} target="_blank" className="text-cyan-300 hover:underline block">
                              GitHub →
                            </a>
                        )}
                      </div>
                    </div>
                )}

                <div className="text-xs text-gray-500 border-t border-gray-600 pt-3 mt-4">
                  <div className="flex gap-4">
                    <span>📝 帖子 {detail.stats.posts}</span>
                    <span>💬 评论 {detail.stats.comments}</span>
                    <span>❓ 提问 {detail.stats.questions}</span>
                    <span>✅ 回答 {detail.stats.answers}</span>
                  </div>
                </div>

                <button
                    onClick={onClose}
                    className="mt-4 w-full py-2 bg-[#4F46E5] text-white text-xs hover:bg-[#4338CA] transition-colors"
                >
                  关闭
                </button>
              </>
          ) : (
              <div className="text-center text-red-400 py-8">
                <div>加载失败</div>
              </div>
          )}
        </div>
      </div>
  )
}

export default function NetworkPage() {
  // 状态
  const [relationType, setRelationType] = useState<RelationType>('all')
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] })
  const [graphLoading, setGraphLoading] = useState(true)
  const [graphError, setGraphError] = useState<string | null>(null)
  const [graphStats, setGraphStats] = useState<any>(null)
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>())
  const [highlightLinks, setHighlightLinks] = useState(new Set<any>())
  const [selectedAlumniId, setSelectedAlumniId] = useState<string | null>(null)

  // ForceGraph ref
  const fgRef = useRef<any>()

  // 筛选器状态
  const [filters, setFilters] = useState<{
    country?: string
    city?: string
    school?: string
    major?: string
  }>({})

  // 获取关系网络数据
  useEffect(() => {
    const fetchGraphData = async () => {
      setGraphLoading(true)
      setGraphError(null)

      try {
        const response = await fetch(`/api/network/graph?type=${relationType}`)
        const data = await response.json()

        if (data.success) {
          setGraphData({
            nodes: data.data.nodes,
            links: data.data.links,
          })
          setGraphStats(data.data.stats)
        } else {
          setGraphError(data.error || '获取数据失败')
        }
      } catch (err) {
        console.error('Fetch graph data error:', err)
        setGraphError('网络错误，请稍后重试')
      } finally {
        setGraphLoading(false)
      }
    }

    fetchGraphData()
  }, [relationType])

  // 高亮相关节点和连线
  const handleNodeHover = useCallback((node: any) => {
    if (!node) {
      setHighlightNodes(new Set())
      setHighlightLinks(new Set())
      return
    }

    const neighbors = new Set<string>()
    const links = new Set<any>()

    neighbors.add(node.id)

    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source
      const targetId = typeof link.target === 'object' ? link.target.id : link.target

      if (sourceId === node.id) {
        neighbors.add(targetId)
        links.add(link)
      } else if (targetId === node.id) {
        neighbors.add(sourceId)
        links.add(link)
      }
    })

    setHighlightNodes(neighbors)
    setHighlightLinks(links)
  }, [graphData.links])

  // 节点点击
  const handleNodeClick = useCallback((node: any) => {
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 500)
      fgRef.current.zoom(2, 500)
    }
  }, [])

  // 自定义节点绘制
  const handleNodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name
    const radius = 5 + Math.sqrt(node.count || 1) * 2

    // 绘制圆圈
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = node.color || '#6B7280'
    ctx.fill()

    // 边框
    const isHighlighted = highlightNodes.has(node.id)
    ctx.strokeStyle = isHighlighted ? '#fde047' : 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = isHighlighted ? (2 / globalScale) : (1 / globalScale)
    ctx.stroke()

    // 文字
    const fontSize = 10 / globalScale
    if (fontSize > 4) {
      ctx.font = `${Math.round(fontSize)}px 'Press Start 2P', monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(label, node.x, node.y - radius - fontSize)
    }
  }, [highlightNodes])

  // 校友点击处理
  const handleAlumniClick = useCallback((alumniId: string) => {
    setSelectedAlumniId(alumniId)
  }, [])

  return (
      <div className="container mx-auto px-4 py-16">
        {/* 地图部分 */}
        <h2 className="text-2xl mb-8 text-center">
          <span className="text-yellow-300">▸</span> 校友网络地图
          <span className="text-yellow-300">◂</span>
        </h2>

        <div
            className="mb-16 border-4 border-[#4F46E5] shadow-[8px_8px_0_rgba(0,0,0,0.5)] overflow-hidden relative"
            style={{ height: '600px' }}
        >
          <MapComponent
              filters={filters}
              onAlumniClick={handleAlumniClick}
          />
        </div>

        {/* 关系网络图部分 */}
        <h2 className="text-2xl mb-4 text-center mt-16">
          <span className="text-yellow-300">▸</span> 校友关系网络
          <span className="text-yellow-300">◂</span>
        </h2>

        {/* 关联类型切换按钮 */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {(Object.keys(RELATION_TYPE_CONFIG) as RelationType[]).map(type => {
            const config = RELATION_TYPE_CONFIG[type]
            const isActive = relationType === type
            return (
                <button
                    key={type}
                    onClick={() => setRelationType(type)}
                    className={`
                px-4 py-2 text-xs transition-all duration-200
                border-2 shadow-[4px_4px_0_rgba(0,0,0,0.5)]
                ${isActive
                        ? 'bg-[#4F46E5] border-[#4F46E5] text-white'
                        : 'bg-transparent border-gray-600 text-gray-300 hover:border-[#4F46E5]'
                    }
              `}
                    style={{
                      borderColor: isActive ? config.color : undefined,
                      backgroundColor: isActive ? config.color : undefined,
                    }}
                >
                  {config.icon} {config.label}
                </button>
            )
          })}
        </div>

        {/* 统计信息 */}
        {graphStats && (
            <div className="flex justify-center gap-6 mb-6 text-xs text-gray-400">
              <span>👥 {graphStats.totalUsers} 位校友</span>
              <span>📚 {graphStats.totalMajors} 个专业</span>
              <span>🎓 {graphStats.totalSchools} 所学校</span>
              <span>📍 {graphStats.totalCities} 个城市</span>
            </div>
        )}

        {/* 图例 */}
        <div className="flex justify-center gap-4 mb-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_TYPE_COLORS.major }}></span>
            <span className="text-gray-400">专业</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_TYPE_COLORS.school }}></span>
            <span className="text-gray-400">学校</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_TYPE_COLORS.city }}></span>
            <span className="text-gray-400">城市</span>
          </div>
        </div>

        {/* 网络图容器 */}
        <div
            className="relative w-full bg-[#1a1a35] border-4 border-[#4F46E5] shadow-[8px_8px_0_rgba(0,0,0,0.5)] overflow-hidden"
            style={{ height: '600px' }}
        >
          {graphLoading ? (
              <div className="absolute inset-0 flex items-center justify-center text-yellow-300 text-xs">
                <div className="text-center">
                  <div className="mb-2">⏳ 加载关系网络数据...</div>
                  <div className="text-xs opacity-70">请稍候</div>
                </div>
              </div>
          ) : graphError ? (
              <div className="absolute inset-0 flex items-center justify-center text-red-400 text-xs">
                <div className="text-center">
                  <div className="mb-2">❌ {graphError}</div>
                  <button
                      className="text-yellow-300 underline"
                      onClick={() => setRelationType(relationType)}
                  >
                    点击重试
                  </button>
                </div>
              </div>
          ) : graphData.nodes.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                <div className="text-center">
                  <div className="mb-2">🔗 暂无关系数据</div>
                  <div className="text-xs opacity-70">完善个人资料后会显示关系网络</div>
                </div>
              </div>
          ) : (
              <ForceGraph2D
                  ref={fgRef}
                  graphData={graphData}
                  nodeId="id"
                  nodeLabel="name"
                  nodeVal={(node: any) => node.count || 1}
                  nodeColor={(node: any) => node.color}
                  nodeRelSize={6}
                  nodeCanvasObject={handleNodeCanvasObject}
                  onNodeHover={handleNodeHover}
                  onNodeClick={handleNodeClick}
                  linkColor={(link: any) => {
                    const isHighlighted = highlightLinks.size === 0 || highlightLinks.has(link)
                    return isHighlighted ? 'rgba(79, 70, 229, 0.6)' : 'rgba(79, 70, 229, 0.1)'
                  }}
                  linkWidth={(link: any) => {
                    const isHighlighted = highlightLinks.size === 0 || highlightLinks.has(link)
                    return isHighlighted ? Math.sqrt(link.value || 1) : 0.5
                  }}
                  linkDirectionalParticles={2}
                  linkDirectionalParticleWidth={(link: any) => highlightLinks.has(link) ? 2 : 0}
                  d3AlphaDecay={0.02}
                  d3VelocityDecay={0.3}
                  warmupTicks={100}
                  cooldownTicks={200}
                  enableNodeDrag={true}
                  enableZoomInteraction={true}
                  enablePanInteraction={true}
              />
          )}
        </div>

        {/* 操作提示 */}
        <div className="text-center mt-4 text-xs text-gray-500">
          💡 提示：滚轮缩放 | 拖动平移 | 悬停查看详情 | 点击节点居中
        </div>

        {/* 校友详情Modal */}
        <AlumniDetailModal
            alumniId={selectedAlumniId}
            onClose={() => setSelectedAlumniId(null)}
        />
      </div>
  )
}