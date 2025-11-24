// src/app/profile/edit/page.tsx
// 个人资料编辑页面（单文件版本）

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface ProfileFormData {
    // 基础信息
    displayName: string
    bio: string

    // 留学信息
    country: string
    city: string
    location: string
    currentSchool: string
    major: string
    degree: string
    enrollmentYear: string
    expectedGradYear: string

    // 地理位置
    latitude: string
    longitude: string

    // 联系方式
    wechat: string
    linkedin: string
    instagram: string
    github: string
    personalWebsite: string
}

interface PrivacySettings {
    profilePublic: boolean
    locationPublic: boolean
    contactPublic: boolean
    searchable: boolean
}

export default function ProfileEditPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [formData, setFormData] = useState<ProfileFormData>({
        displayName: '',
        bio: '',
        country: '',
        city: '',
        location: '',
        currentSchool: '',
        major: '',
        degree: '',
        enrollmentYear: '',
        expectedGradYear: '',
        latitude: '',
        longitude: '',
        wechat: '',
        linkedin: '',
        instagram: '',
        github: '',
        personalWebsite: '',
    })

    const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
        profilePublic: true,
        locationPublic: true,
        contactPublic: false,
        searchable: true,
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // 加载用户资料
    useEffect(() => {
        const fetchProfile = async () => {
            if (status === 'loading') return

            if (status === 'unauthenticated') {
                router.push('/login')
                return
            }

            try {
                setLoading(true)
                const response = await fetch('/api/user/profile', {
                    credentials: 'include',
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch profile')
                }

                const data = await response.json()
                if (data.success) {
                    const user = data.user

                    // 填充表单数据
                    setFormData({
                        displayName: user.displayName || '',
                        bio: user.bio || '',
                        country: user.country || '',
                        city: user.city || '',
                        location: user.location || '',
                        currentSchool: user.currentSchool || '',
                        major: user.major || '',
                        degree: user.degree || '',
                        enrollmentYear: user.enrollmentYear ? String(user.enrollmentYear) : '',
                        expectedGradYear: user.expectedGradYear ? String(user.expectedGradYear) : '',
                        latitude: user.latitude ? String(user.latitude) : '',
                        longitude: user.longitude ? String(user.longitude) : '',
                        wechat: user.wechat || '',
                        linkedin: user.linkedin || '',
                        instagram: user.instagram || '',
                        github: user.github || '',
                        personalWebsite: user.personalWebsite || '',
                    })

                    // 填充隐私设置
                    if (user.privacySettings) {
                        setPrivacySettings(user.privacySettings)
                    }
                }
            } catch (err) {
                console.error('Error fetching profile:', err)
                setError('加载资料失败')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [status, router])

    // 处理表单字段变化
    const handleChange = (field: keyof ProfileFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setSuccessMessage(null) // 清除成功消息
    }

    // 处理隐私设置变化
    const handlePrivacyChange = (field: keyof PrivacySettings, value: boolean) => {
        setPrivacySettings(prev => ({ ...prev, [field]: value }))
    }

    // 保存基本资料
    const handleSaveProfile = async () => {
        try {
            setSaving(true)
            setError(null)
            setSuccessMessage(null)

            // ✅ 修复: 将空字符串转换为 null,避免验证错误
            const payload: any = {
                displayName: formData.displayName.trim() || null,  // ← 改这里
                bio: formData.bio.trim() || null,                  // ← 改这里
                country: formData.country.trim() || null,
                city: formData.city.trim() || null,
                location: formData.location.trim() || null,
                currentSchool: formData.currentSchool.trim() || null,
                major: formData.major.trim() || null,
                degree: formData.degree.trim() || null,
                enrollmentYear: formData.enrollmentYear ? parseInt(formData.enrollmentYear) : null,
                expectedGradYear: formData.expectedGradYear ? parseInt(formData.expectedGradYear) : null,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                wechat: formData.wechat.trim() || null,
                linkedin: formData.linkedin.trim() || null,
                instagram: formData.instagram.trim() || null,
                github: formData.github.trim() || null,
                personalWebsite: formData.personalWebsite.trim() || null,  // ← 重要!
            }

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || '保存失败')
            }

            setSuccessMessage('✅ 资料保存成功！')
            setTimeout(() => setSuccessMessage(null), 3000)

        } catch (err) {
            console.error('Error saving profile:', err)
            setError(err instanceof Error ? err.message : '保存失败')
        } finally {
            setSaving(false)
        }
    }

    // 保存隐私设置
    const handleSavePrivacy = async () => {
        try {
            setSaving(true)
            setError(null)
            setSuccessMessage(null)

            const response = await fetch('/api/user/privacy', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(privacySettings),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || '保存失败')
            }

            setSuccessMessage('✅ 隐私设置保存成功！')

            setTimeout(() => setSuccessMessage(null), 3000)

        } catch (err) {
            console.error('Error saving privacy:', err)
            setError(err instanceof Error ? err.message : '保存失败')
        } finally {
            setSaving(false)
        }
    }

    // 加载状态
    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1a35] text-gray-100 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">⏳</div>
                        <div className="text-sm text-gray-400">加载中...</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#1a1a35] text-gray-100 py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* 标题 */}
                <h1 className="text-2xl mb-8 text-center">
                    <span className="text-yellow-300">▸</span> 编辑资料
                    <span className="text-yellow-300">◂</span>
                </h1>

                {/* 成功/错误消息 */}
                {successMessage && (
                    <div className="pixel-container p-4 mb-6 bg-green-900 bg-opacity-50 border-green-500">
                        <p className="text-green-300 text-sm text-center">{successMessage}</p>
                    </div>
                )}

                {error && (
                    <div className="pixel-container p-4 mb-6 bg-red-900 bg-opacity-50 border-red-500">
                        <p className="text-red-300 text-sm text-center">{error}</p>
                    </div>
                )}

                {/* 基本信息 */}
                <div className="pixel-container p-6 mb-6">
                    <h2 className="text-lg mb-4 text-yellow-300">📝 基本信息</h2>

                    <div className="space-y-4">
                        {/* 显示昵称 */}
                        <div>
                            <label className="block text-xs mb-2">显示昵称</label>
                            <input
                                type="text"
                                className="pixel-input w-full"
                                placeholder="例如：Sam"
                                value={formData.displayName}
                                onChange={(e) => handleChange('displayName', e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">如果不设置，将显示真实姓名</p>
                        </div>

                        {/* 个人简介 */}
                        <div>
                            <label className="block text-xs mb-2">个人简介</label>
                            <textarea
                                className="pixel-input w-full h-24"
                                placeholder="介绍一下自己..."
                                value={formData.bio}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1 text-right">
                                {formData.bio.length} / 500
                            </p>
                        </div>
                    </div>
                </div>

                {/* 留学信息 */}
                <div className="pixel-container p-6 mb-6">
                    <h2 className="text-lg mb-4 text-yellow-300">🎓 留学信息</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 国家 */}
                        <div>
                            <label className="block text-xs mb-2">国家</label>
                            <input
                                type="text"
                                className="pixel-input w-full"
                                placeholder="例如：USA"
                                value={formData.country}
                                onChange={(e) => handleChange('country', e.target.value)}
                            />
                        </div>

                        {/* 城市 */}
                        <div>
                            <label className="block text-xs mb-2">城市</label>
                            <input
                                type="text"
                                className="pixel-input w-full"
                                placeholder="例如：Boston"
                                value={formData.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                            />
                        </div>

                        {/* 当前学校 */}
                        <div className="md:col-span-2">
                            <label className="block text-xs mb-2">当前学校</label>
                            <input
                                type="text"
                                className="pixel-input w-full"
                                placeholder="例如：Harvard University"
                                value={formData.currentSchool}
                                onChange={(e) => handleChange('currentSchool', e.target.value)}
                            />
                        </div>

                        {/* 专业 */}
                        <div>
                            <label className="block text-xs mb-2">专业</label>
                            <input
                                type="text"
                                className="pixel-input w-full"
                                placeholder="例如：Computer Science"
                                value={formData.major}
                                onChange={(e) => handleChange('major', e.target.value)}
                            />
                        </div>

                        {/* 学位 */}
                        <div>
                            <label className="block text-xs mb-2">学位</label>
                            <select
                                className="pixel-input w-full"
                                value={formData.degree}
                                onChange={(e) => handleChange('degree', e.target.value)}
                            >
                                <option value="">请选择</option>
                                <option value="BACHELOR">本科</option>
                                <option value="MASTER">硕士</option>
                                <option value="PHD">博士</option>
                                <option value="OTHER">其他</option>
                            </select>
                        </div>

                        {/* 入学年份 */}
                        <div>
                            <label className="block text-xs mb-2">入学年份</label>
                            <input
                                type="number"
                                className="pixel-input w-full"
                                placeholder="2020"
                                min="2000"
                                max="2050"
                                value={formData.enrollmentYear}
                                onChange={(e) => handleChange('enrollmentYear', e.target.value)}
                            />
                        </div>

                        {/* 预计毕业年份 */}
                        <div>
                            <label className="block text-xs mb-2">预计毕业</label>
                            <input
                                type="number"
                                className="pixel-input w-full"
                                placeholder="2024"
                                min="2000"
                                max="2050"
                                value={formData.expectedGradYear}
                                onChange={(e) => handleChange('expectedGradYear', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 联系方式 */}
                <div className="pixel-container p-6 mb-6">
                    <h2 className="text-lg mb-4 text-yellow-300">📱 联系方式</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 微信 */}
                        <div>
                            <label className="block text-xs mb-2">微信号</label>
                            <input
                                type="text"
                                className="pixel-input w-full"
                                placeholder="your-wechat-id"
                                value={formData.wechat}
                                onChange={(e) => handleChange('wechat', e.target.value)}
                            />
                        </div>

                        {/* LinkedIn */}
                        <div>
                            <label className="block text-xs mb-2">LinkedIn</label>
                            <input
                                type="url"
                                className="pixel-input w-full"
                                placeholder="https://linkedin.com/in/..."
                                value={formData.linkedin}
                                onChange={(e) => handleChange('linkedin', e.target.value)}
                            />
                        </div>

                        {/* Instagram */}
                        <div>
                            <label className="block text-xs mb-2">Instagram</label>
                            <input
                                type="text"
                                className="pixel-input w-full"
                                placeholder="@your_instagram"
                                value={formData.instagram}
                                onChange={(e) => handleChange('instagram', e.target.value)}
                            />
                        </div>

                        {/* GitHub */}
                        <div>
                            <label className="block text-xs mb-2">GitHub</label>
                            <input
                                type="text"
                                className="pixel-input w-full"
                                placeholder="github.com/username"
                                value={formData.github}
                                onChange={(e) => handleChange('github', e.target.value)}
                            />
                        </div>

                        {/* 个人网站 */}
                        <div className="md:col-span-2">
                            <label className="block text-xs mb-2">个人网站</label>
                            <input
                                type="url"
                                className="pixel-input w-full"
                                placeholder="https://yourwebsite.com"
                                value={formData.personalWebsite}
                                onChange={(e) => handleChange('personalWebsite', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 隐私设置 */}
                <div className="pixel-container p-6 mb-6">
                    <h2 className="text-lg mb-4 text-yellow-300">🔒 隐私设置</h2>

                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={privacySettings.profilePublic}
                                onChange={(e) => handlePrivacyChange('profilePublic', e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">公开我的资料（所有人可见）</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={privacySettings.locationPublic}
                                onChange={(e) => handlePrivacyChange('locationPublic', e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">公开我的位置（在地图上显示）</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={privacySettings.contactPublic}
                                onChange={(e) => handlePrivacyChange('contactPublic', e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">公开我的联系方式</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={privacySettings.searchable}
                                onChange={(e) => handlePrivacyChange('searchable', e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">允许其他人搜索到我</span>
                        </label>
                    </div>

                    <button
                        onClick={handleSavePrivacy}
                        disabled={saving}
                        className="pixel-btn pixel-btn-secondary w-full mt-4"
                    >
                        {saving ? '保存中...' : '保存隐私设置'}
                    </button>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-4">
                    <button
                        onClick={() => router.back()}
                        className="pixel-btn pixel-btn-secondary flex-1"
                    >
                        返回
                    </button>
                    <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="pixel-btn flex-1"
                    >
                        {saving ? '保存中...' : '💾 保存资料'}
                    </button>
                </div>
            </div>
        </div>
    )
}