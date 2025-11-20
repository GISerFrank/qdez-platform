'use client';

interface Step4Props {
    formData: any;
    errors: Record<string, string>;
    updateFormData: (field: string, value: any) => void;
    onSubmit: () => void;
    onBack: () => void;
    isLoading: boolean;
}

export default function Step4ProfileInfo({
                                             formData,
                                             errors,
                                             updateFormData,
                                             onSubmit,
                                             onBack,
                                             isLoading,
                                         }: Step4Props) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="pixel-container p-8 md:p-12">
            {/* 步骤标题区域 */}
            <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-yellow-400 text-lg">◆</span>
                    <span className="text-2xl">STEP 4</span>
                    <span className="text-yellow-400 text-lg">◆</span>
                </div>
                <h2 className="text-lg mb-3">完善资料</h2>
                <p className="text-xs text-gray-400">最后一步！完善您的个人资料</p>

                {/* 可选提示 */}
                <div className="inline-block mt-4 px-4 py-2 bg-gray-800 border border-gray-600 rounded">
                    <p className="text-xs text-gray-400">💡 此页所有字段均为可选</p>
                </div>

                {/* 装饰分隔线 */}
                <div className="flex items-center justify-center gap-2 mt-6">
                    <div className="h-px w-12 bg-indigo-500"></div>
                    <span className="text-indigo-400 text-xs">▼</span>
                    <div className="h-px w-12 bg-indigo-500"></div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">

                {/* 分组1: 公开资料 */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl">✨</span>
                        <h3 className="text-sm text-cyan-300">公开资料</h3>
                    </div>

                    <div className="space-y-5 pl-8">
                        {/* 显示名称 */}
                        <div>
                            <label className="flex items-center gap-2 text-xs mb-3">
                                <span className="text-gray-400">🏷️</span>
                                <span>显示名称</span>
                            </label>
                            <input
                                type="text"
                                className="pixel-input w-full py-4"
                                placeholder="例如: 张三 | MIT CS"
                                value={formData.displayName}
                                onChange={(e) => updateFormData('displayName', e.target.value)}
                                maxLength={100}
                            />
                            <p className="text-xs text-gray-500 mt-2">公开显示的名称，留空则使用真实姓名</p>
                        </div>

                        {/* 个人简介 */}
                        <div>
                            <label className="flex items-center gap-2 text-xs mb-3">
                                <span className="text-gray-400">📝</span>
                                <span>个人简介</span>
                            </label>
                            <textarea
                                className="pixel-input w-full h-32 resize-none py-4"
                                placeholder="介绍一下自己..."
                                value={formData.bio}
                                onChange={(e) => updateFormData('bio', e.target.value)}
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-2 text-right">
                                {formData.bio.length}/500
                            </p>
                        </div>
                    </div>
                </div>

                {/* 视觉分隔 */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-700"></div>
                    <span className="text-gray-600 text-xs">◇</span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                {/* 分组2: 联系方式 */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl">📱</span>
                        <h3 className="text-sm text-cyan-300">联系方式</h3>
                    </div>

                    <div className="space-y-5 pl-8">
                        {/* 微信号 */}
                        <div>
                            <label className="flex items-center gap-2 text-xs mb-3">
                                <span className="text-gray-400">💬</span>
                                <span>微信号</span>
                            </label>
                            <input
                                type="text"
                                className="pixel-input w-full py-4"
                                placeholder="your_wechat_id"
                                value={formData.wechat}
                                onChange={(e) => updateFormData('wechat', e.target.value)}
                                maxLength={100}
                            />
                        </div>

                        {/* LinkedIn */}
                        <div>
                            <label className="flex items-center gap-2 text-xs mb-3">
                                <span className="text-gray-400">💼</span>
                                <span>LinkedIn</span>
                            </label>
                            <input
                                type="url"
                                className="pixel-input w-full py-4"
                                placeholder="https://linkedin.com/in/yourprofile"
                                value={formData.linkedin}
                                onChange={(e) => updateFormData('linkedin', e.target.value)}
                            />
                        </div>

                        {/* 个人网站 */}
                        <div>
                            <label className="flex items-center gap-2 text-xs mb-3">
                                <span className="text-gray-400">🌐</span>
                                <span>个人网站</span>
                            </label>
                            <input
                                type="url"
                                className="pixel-input w-full py-4"
                                placeholder="https://yourwebsite.com"
                                value={formData.website}
                                onChange={(e) => updateFormData('website', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 视觉分隔 */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-700"></div>
                    <span className="text-gray-600 text-xs">◇</span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                {/* 分组3: 隐私设置 */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl">🔒</span>
                        <h3 className="text-sm text-cyan-300">隐私设置</h3>
                    </div>

                    <div className="space-y-4 pl-8">
                        <label className="flex items-center gap-3 text-xs cursor-pointer p-3 bg-gray-800 bg-opacity-50 rounded hover:bg-opacity-70 transition-colors">
                            <input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={formData.privacySettings.profilePublic}
                                onChange={(e) =>
                                    updateFormData('privacySettings', {
                                        ...formData.privacySettings,
                                        profilePublic: e.target.checked,
                                    })
                                }
                            />
                            <span className="text-gray-400">👤</span>
                            <span>公开个人资料</span>
                        </label>

                        <label className="flex items-center gap-3 text-xs cursor-pointer p-3 bg-gray-800 bg-opacity-50 rounded hover:bg-opacity-70 transition-colors">
                            <input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={formData.privacySettings.locationPublic}
                                onChange={(e) =>
                                    updateFormData('privacySettings', {
                                        ...formData.privacySettings,
                                        locationPublic: e.target.checked,
                                    })
                                }
                            />
                            <span className="text-gray-400">📍</span>
                            <span>公开位置信息</span>
                        </label>

                        <label className="flex items-center gap-3 text-xs cursor-pointer p-3 bg-gray-800 bg-opacity-50 rounded hover:bg-opacity-70 transition-colors">
                            <input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={formData.privacySettings.contactPublic}
                                onChange={(e) =>
                                    updateFormData('privacySettings', {
                                        ...formData.privacySettings,
                                        contactPublic: e.target.checked,
                                    })
                                }
                            />
                            <span className="text-gray-400">📞</span>
                            <span>公开联系方式</span>
                        </label>

                        <label className="flex items-center gap-3 text-xs cursor-pointer p-3 bg-gray-800 bg-opacity-50 rounded hover:bg-opacity-70 transition-colors">
                            <input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={formData.privacySettings.searchable}
                                onChange={(e) =>
                                    updateFormData('privacySettings', {
                                        ...formData.privacySettings,
                                        searchable: e.target.checked,
                                    })
                                }
                            />
                            <span className="text-gray-400">🔍</span>
                            <span>允许其他用户搜索到我</span>
                        </label>
                    </div>
                </div>

                {/* 按钮组 */}
                <div className="flex gap-4 pt-6">
                    <button
                        type="button"
                        onClick={onBack}
                        className="pixel-btn pixel-btn-secondary flex-1 py-4 text-sm"
                        disabled={isLoading}
                    >
                        ← BACK
                    </button>
                    <button
                        type="submit"
                        className="pixel-btn pixel-btn-success flex-1 py-4 text-sm"
                        disabled={isLoading}
                    >
                        {isLoading ? '⏳ SUBMITTING...' : '✓ COMPLETE'}
                    </button>
                </div>
            </form>
        </div>
    );
}