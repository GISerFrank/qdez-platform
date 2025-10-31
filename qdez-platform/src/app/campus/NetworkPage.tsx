'use client'

// 导入 useRef，我们将用它来获取图表实例
import { useState, useMemo, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { alumniData, disciplines } from '@/lib/mockData'

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

export default function NetworkPage() {
  const [highlightNodes, setHighlightNodes] = useState(new Set())
  const [highlightLinks, setHighlightLinks] = useState(new Set())
  const [selectedNode, setSelectedNode] = useState<any>(null)

  // 【新增】创建 Ref 来访问 ForceGraph2D 的方法 (例如 zoomToFit)
  const fgRef = useRef<any>()

  // 准备网络图数据 (无变化)
  const graphData = useMemo(() => {
    // 收集所有专业
    const allMajors = new Set<string>()
    alumniData.forEach(alumnus => {
      alumnus.majors.forEach(major => allMajors.add(major))
    })

    // 创建节点
    const nodes = Array.from(allMajors).map(major => ({
      id: major,
      name: major,
      count: alumniData.filter(a => a.majors.includes(major)).length,
      category: disciplines[major]?.category || '其他',
      color: getCategoryColor(disciplines[major]?.category || '其他')
    }))

    // 创建连接
    const links: any[] = []
    const linkMap = new Map<string, any>()

    alumniData.forEach(alumnus => {
      if (alumnus.majors.length > 1) {
        for (let i = 0; i < alumnus.majors.length; i++) {
          for (let j = i + 1; j < alumnus.majors.length; j++) {
            const [source, target] = [alumnus.majors[i], alumnus.majors[j]].sort()
            const linkId = `${source}-${target}`

            if (linkMap.has(linkId)) {
              linkMap.get(linkId).value++
            } else {
              const link = { source, target, value: 1 }
              linkMap.set(linkId, link)
              links.push(link)
            }
          }
        }
      }
    })

    console.log('📊 网络图数据:', {
      nodes: nodes.length,
      links: links.length,
      nodesData: nodes,
      linksData: links
    })

    return { nodes, links }
  }, [])

  // 获取分类颜色 (无变化)
  function getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      'STEM': '#4F46E5',
      '商科': '#EC4899',
      '其他': '#10B981'
    }
    return colorMap[category] || '#06B6D4'
  }

  // 处理节点点击 (无变化)
  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node)

    // 高亮相关节点和连接
    const connectedNodes = new Set([node.id])
    const connectedLinks = new Set()

    graphData.links.forEach((link: any) => {
      if (link.source.id === node.id || link.target.id === node.id) {
        connectedLinks.add(link)
        connectedNodes.add(link.source.id === node.id ? link.target.id : link.source.id)
      }
    })

    setHighlightNodes(connectedNodes)
    setHighlightLinks(connectedLinks)
  }, [graphData.links])

  // 处理背景点击（清除高亮）(无变化)
  const handleBackgroundClick = useCallback(() => {
    setHighlightNodes(new Set())
    setHighlightLinks(new Set())
    setSelectedNode(null)
  }, [])

  // 【新增】自定义节点绘制函数
  const handleNodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const R = 6; // 必须与下面的 nodeRelSize 保持一致
    // 根据节点 count 计算半径 (与物理引擎一致)
    const radius = R * Math.sqrt(node.count);

    // 1. 绘制主圆圈
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color || 'grey';
    ctx.fill();

    // 2. 绘制边框 (高亮或默认)
    const isHighlighted = highlightNodes.has(node.id);
    // 使用应用主题中的亮黄色 (text-yellow-300)
    ctx.strokeStyle = isHighlighted ? '#fde047' : 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = isHighlighted ? (2 / globalScale) : (1 / globalScale);
    ctx.stroke();

    // 3. 绘制文本 (当缩放级别足够大时)
    const fontSize = 10 / globalScale; // 10px 基础字体
    if (fontSize > 5) { // 字体大于5px时才显示
      // 确保使用像素艺术字体，并取整防止模糊
      ctx.font = `${Math.round(fontSize)}px 'Press Start 2P', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF'; // 白色文字
      ctx.fillText(label, node.x, node.y);
    }
  }, [highlightNodes]); // 依赖 highlightNodes 状态

  return (
      <div className="container mx-auto px-4 py-16">
        {/* 地图部分 (无变化) */}
        <h2 className="text-2xl mb-8 text-center">
          <span className="text-yellow-300">▸</span> 校友网络地图
          <span className="text-yellow-300">◂</span>
        </h2>

        <div
            className="mb-16 border-4 border-[#4F46E5] shadow-[8px_8px_0_rgba(0,0,0,0.5)] overflow-hidden relative"
            style={{ height: '600px' }}
        >
          <MapComponent />
        </div>

        {/* 网络图部分 */}
        <h2 className="text-2xl mb-8 text-center mt-16">
          <span className="text-yellow-300">▸</span> 专业关系网络
          <span className="text-yellow-300">◂</span>
        </h2>

        <div
            className="relative w-full bg-[#1a1a35] border-4 border-[#4F46E5] shadow-[8px_8px_0_rgba(0,0,0,0.5)] overflow-hidden"
            style={{ height: '600px' }}
        >
          <ForceGraph2D
              // 【修改】添加 ref
              ref={fgRef}
              graphData={graphData}
              nodeId="id"
              nodeLabel="name" // 保留这个，它用于鼠标悬停时的原生 tooltip
              nodeVal={(node: any) => node.count}
              nodeColor={(node: any) => node.color}
              nodeRelSize={6} // 保持这个值，用于物理碰撞和半径计算

              // 【新增】使用自定义的节点绘制函数
              nodeCanvasObject={handleNodeCanvasObject}

              linkColor={(link: any) => {
                const isHighlighted = highlightLinks.size === 0 || highlightLinks.has(link)
                return isHighlighted ? '#4F46E5' : 'rgba(79, 70, 229, 0.1)'
              }}
              linkWidth={(link: any) => {
                const isHighlighted = highlightLinks.size === 0 || highlightLinks.has(link)
                return isHighlighted ? 2 : 1
              }}
              onNodeClick={handleNodeClick}
              onBackgroundClick={handleBackgroundClick}
              backgroundColor="#1a1a35"
              enableZoomInteraction={true}
              enablePanInteraction={true}
              enableNodeDrag={true}

              // 【修改】优化物理引擎参数
              cooldownTime={1500} // 减少稳定时间
              warmupTicks={200}  // 增加预热计算

              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
              width={undefined}
              height={600}

              // 【新增】当引擎停止时，自动缩放到合适视图
              onEngineStop={() => {
                if (fgRef.current) {
                  fgRef.current.zoomToFit(
                      400, // 400ms 动画时间
                      40   // 40px 内边距
                  );
                }
              }}
          />

          {/* 节点信息面板 (无变化) */}
          {selectedNode && (
              <div className="absolute top-4 right-4 bg-[#2a2a4a] border-3 border-[#4F46E5] p-4 rounded shadow-lg max-w-xs z-10">
                <h3 className="text-sm font-bold text-yellow-300 mb-2">{selectedNode.name}</h3>
                <p className="text-xs text-gray-300 mb-1">分类: {selectedNode.category}</p>
                <p className="text-xs text-gray-300 mb-2">校友数量: {selectedNode.count} 人</p>
                <button
                    className="text-xs px-2 py-1 bg-[#4F46E5] text-white rounded hover:bg-[#4338CA]"
                    onClick={handleBackgroundClick}
                >
                  关闭
                </button>
              </div>
          )}
        </div>

        {/* 图例 (无变化) */}
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
          <p>💡 提示: 地图可以用鼠标拖动平移和缩放 | 网络图可以拖拽节点，点击节点高亮相关连接</p>
          <p className="mt-2">🖱️ 拖动地图：按住鼠标左键拖动 | 📱 触摸设备：用手指滑动</p>
        </div>
      </div>
  )
}