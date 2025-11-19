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
        <div className="pixel-container">
            <div className="mb-6">
                <h2 className="text-xl mb-2">STEP 4: 完善资料</h2>
                <p className="text-xs text-gray-400">最后一步！完善您的个人资料（可选）</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 显示名称 */}
                <div>
                    <label className="block text-xs mb-2">显示名称</label>
                    <input
                        type="text"
                        className="pixel-input w-full"
                        placeholder="例如: 张三 | MIT CS"
                        value={formData.displayName}
                        onChange={(e) => updateFormData('displayName', e.target.value)}
                        maxLength={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">公开显示的名称，留空则使用真实姓名</p>
                </div>

                {/* 个人简介 */}
                <div>
                    <label className="block text-xs mb-2">个人简介</label>
                    <textarea
                        className="pixel-input w-full h-24 resize-none"
                        placeholder="介绍一下自己..."
                        value={formData.bio}
                        onChange={(e) => updateFormData('bio', e.target.value)}
                        maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                        {formData.bio.length}/500
                    </p>
                </div>

                {/* 社交信息 */}
                <div>
                    <label className="block text-xs mb-2">微信号</label>
                    <input
                        type="text"
                        className="pixel-input w-full"
                        placeholder="your_wechat_id"
                        value={formData.wechat}
                        onChange={(e) => updateFormData('wechat', e.target.value)}
                        maxLength={100}
                    />
                </div>

                <div>
                    <label className="block text-xs mb-2">LinkedIn</label>
                    <input
                        type="url"
                        className="pixel-input w-full"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={formData.linkedin}
                        onChange={(e) => updateFormData('linkedin', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs mb-2">个人网站</label>
                    <input
                        type="url"
                        className="pixel-input w-full"
                        placeholder="https://yourwebsite.com"
                        value={formData.website}
                        onChange={(e) => updateFormData('website', e.target.value)}
                    />
                </div>

                {/* 隐私设置 */}
                <div className="border-t border-gray-700 pt-4 mt-6">
                    <h3 className="text-sm mb-3">隐私设置</h3>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.privacySettings.profilePublic}
                                onChange={(e) =>
                                    updateFormData('privacySettings', {
                                        ...formData.privacySettings,
                                        profilePublic: e.target.checked,
                                    })
                                }
                            />
                            <span>公开个人资料</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.privacySettings.locationPublic}
                                onChange={(e) =>
                                    updateFormData('privacySettings', {
                                        ...formData.privacySettings,
                                        locationPublic: e.target.checked,
                                    })
                                }
                            />
                            <span>公开位置信息</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.privacySettings.contactPublic}
                                onChange={(e) =>
                                    updateFormData('privacySettings', {
                                        ...formData.privacySettings,
                                        contactPublic: e.target.checked,
                                    })
                                }
                            />
                            <span>公开联系方式</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.privacySettings.searchable}
                                onChange={(e) =>
                                    updateFormData('privacySettings', {
                                        ...formData.privacySettings,
                                        searchable: e.target.checked,
                                    })
                                }
                            />
                            <span>允许其他用户搜索到我</span>
                        </label>
                    </div>
                </div>

                {/* 按钮组 */}
                <div className="flex gap-4 mt-6">
                    <button
                        type="button"
                        onClick={onBack}
                        className="pixel-btn pixel-btn-secondary flex-1"
                        disabled={isLoading}
                    >
                        ← BACK
                    </button>
                    <button
                        type="submit"
                        className="pixel-btn pixel-btn-success flex-1"
                        disabled={isLoading}
                    >
                        {isLoading ? 'SUBMITTING...' : '✓ COMPLETE'}
                    </button>
                </div>
            </form>
        </div>
    );
}