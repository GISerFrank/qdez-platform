'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const EVENT_TYPES = [
    { value: '学术讲座', icon: '📚', label: '学术讲座' },
    { value: '美食探店', icon: '🍽️', label: '美食探店' },
    { value: '职业发展', icon: '💼', label: '职业发展' },
    { value: '运动健身', icon: '🏃', label: '运动健身' },
    { value: '社交聚会', icon: '🎉', label: '社交聚会' },
    { value: '文化活动', icon: '🎭', label: '文化活动' },
    { value: '其他', icon: '📌', label: '其他' },
]

export default function NewEventPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '',
        date: '',
        time: '',
        location: '',
        isOnline: false,
        maxAttendees: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // 验证
        const newErrors: Record<string, string> = {}
        if (!formData.title.trim()) newErrors.title = '请输入活动标题'
        if (!formData.description.trim()) newErrors.description = '请输入活动描述'
        if (!formData.type) newErrors.type = '请选择活动类型'
        if (!formData.date) newErrors.date = '请选择活动日期'
        if (!formData.time.trim()) newErrors.time = '请输入活动时间'
        if (!formData.location.trim()) newErrors.location = '请输入活动地点'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        try {
            setIsSubmitting(true)

            // 组合日期和时间
            const datetime = new Date(`${formData.date}T${formData.time}:00`)

            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    type: formData.type,
                    date: datetime.toISOString(),
                    time: formData.time,
                    location: formData.location.trim(),
                    isOnline: formData.isOnline,
                    maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
                })
            })

            const data = await res.json()

            if (data.success) {
                alert('活动创建成功！')
                router.push(`/events/${data.data.event.id}`)
            } else {
                alert(data.error || '创建失败')
            }
        } catch (error) {
            console.error('创建活动失败:', error)
            alert('创建失败，请重试')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h2 className="text-2xl mb-8">
                <span className="text-yellow-300">▸</span> 创建新活动
                <span className="text-yellow-300">◂</span>
            </h2>

            <form onSubmit={handleSubmit}>
                {/* 标题 */}
                <div className="post-card mb-6">
                    <label className="block text-xs mb-2 text-yellow-300">
                        活动标题 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        className="w-full bg-gray-900 border border-cyan-500 p-3 text-xs"
                        placeholder="例如：MIT校友经验分享会"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        maxLength={200}
                    />
                    {errors.title && <p className="error-text">{errors.title}</p>}
                </div>

                {/* 活动类型 */}
                <div className="post-card mb-6">
                    <label className="block text-xs mb-3 text-yellow-300">
                        活动类型 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {EVENT_TYPES.map(({ value, icon, label }) => (
                            <button
                                key={value}
                                type="button"
                                className={`pixel-btn text-xs ${
                                    formData.type === value ? '' : 'pixel-btn-secondary'
                                }`}
                                onClick={() => setFormData(prev => ({ ...prev, type: value }))}
                            >
                                {icon} {label}
                            </button>
                        ))}
                    </div>
                    {errors.type && <p className="error-text">{errors.type}</p>}
                </div>

                {/* 描述 */}
                <div className="post-card mb-6">
                    <label className="block text-xs mb-2 text-yellow-300">
                        活动描述 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        className="w-full bg-gray-900 border border-cyan-500 p-3 text-xs leading-relaxed"
                        rows={8}
                        placeholder="详细描述活动内容、流程、注意事项等..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        maxLength={5000}
                    />
                    {errors.description && <p className="error-text">{errors.description}</p>}
                </div>

                {/* 日期时间 */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="post-card">
                        <label className="block text-xs mb-2 text-yellow-300">
                            活动日期 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            className="w-full bg-gray-900 border border-cyan-500 p-3 text-xs"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        />
                        {errors.date && <p className="error-text">{errors.date}</p>}
                    </div>

                    <div className="post-card">
                        <label className="block text-xs mb-2 text-yellow-300">
                            开始时间 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            className="w-full bg-gray-900 border border-cyan-500 p-3 text-xs"
                            value={formData.time}
                            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        />
                        {errors.time && <p className="error-text">{errors.time}</p>}
                    </div>
                </div>

                {/* 地点 */}
                <div className="post-card mb-6">
                    <label className="block text-xs mb-2 text-yellow-300">
                        活动地点 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        className="w-full bg-gray-900 border border-cyan-500 p-3 text-xs"
                        placeholder="例如：Cambridge, MA 或 线上Zoom"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        maxLength={200}
                    />
                    <label className="flex items-center gap-2 mt-3 text-xs">
                        <input
                            type="checkbox"
                            checked={formData.isOnline}
                            onChange={(e) => setFormData(prev => ({ ...prev, isOnline: e.target.checked }))}
                        />
                        <span>这是线上活动</span>
                    </label>
                    {errors.location && <p className="error-text">{errors.location}</p>}
                </div>

                {/* 人数限制 */}
                <div className="post-card mb-6">
                    <label className="block text-xs mb-2 text-yellow-300">
                        人数限制（选填）
                    </label>
                    <input
                        type="number"
                        className="w-full bg-gray-900 border border-cyan-500 p-3 text-xs"
                        placeholder="不填表示不限制人数"
                        value={formData.maxAttendees}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                        min="1"
                    />
                </div>

                {/* 提交按钮 */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="pixel-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '创建中...' : '✅ 发布活动'}
                    </button>
                    <button
                        type="button"
                        className="pixel-btn pixel-btn-secondary"
                        onClick={() => router.back()}
                    >
                        ❌ 取消
                    </button>
                </div>
            </form>
        </div>
    )
}