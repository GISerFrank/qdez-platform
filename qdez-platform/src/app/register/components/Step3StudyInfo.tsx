'use client';

interface Step3Props {
    formData: any;
    errors: Record<string, string>;
    updateFormData: (field: string, value: any) => void;
    onNext: () => void;
    onBack: () => void;
    isLoading: boolean;
}

export default function Step3StudyInfo({
                                           formData,
                                           errors,
                                           updateFormData,
                                           onNext,
                                           onBack,
                                           isLoading,
                                       }: Step3Props) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, i) => currentYear - 10 + i);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <div className="pixel-container p-8 md:p-12">
            {/* 步骤标题区域 */}
            <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-yellow-400 text-lg">◆</span>
                    <span className="text-2xl">STEP 3</span>
                    <span className="text-yellow-400 text-lg">◆</span>
                </div>
                <h2 className="text-lg mb-3">留学信息</h2>
                <p className="text-xs text-gray-400">告诉我们您的留学情况</p>

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

                {/* 分组1: 地理位置 */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl">🌍</span>
                        <h3 className="text-sm text-cyan-300">地理位置</h3>
                    </div>

                    <div className="space-y-5 pl-8">
                        {/* 国家和城市 - 两列布局 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* 国家 */}
                            <div>
                                <label className="flex items-center gap-2 text-xs mb-3">
                                    <span className="text-gray-400">🏳️</span>
                                    <span>留学国家</span>
                                </label>
                                <input
                                    type="text"
                                    className="pixel-input w-full py-4"
                                    placeholder="例如: 美国、英国..."
                                    value={formData.country}
                                    onChange={(e) => updateFormData('country', e.target.value)}
                                />
                            </div>

                            {/* 城市 */}
                            <div>
                                <label className="flex items-center gap-2 text-xs mb-3">
                                    <span className="text-gray-400">🏙️</span>
                                    <span>城市</span>
                                </label>
                                <input
                                    type="text"
                                    className="pixel-input w-full py-4"
                                    placeholder="例如: 波士顿、伦敦..."
                                    value={formData.city}
                                    onChange={(e) => updateFormData('city', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 视觉分隔 */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-700"></div>
                    <span className="text-gray-600 text-xs">◇</span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                {/* 分组2: 学术信息 */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl">🎓</span>
                        <h3 className="text-sm text-cyan-300">学术信息</h3>
                    </div>

                    <div className="space-y-5 pl-8">
                        {/* 学校 */}
                        <div>
                            <label className="flex items-center gap-2 text-xs mb-3">
                                <span className="text-gray-400">🏫</span>
                                <span>当前学校</span>
                            </label>
                            <input
                                type="text"
                                className="pixel-input w-full py-4"
                                placeholder="例如: MIT、Stanford..."
                                value={formData.currentSchool}
                                onChange={(e) => updateFormData('currentSchool', e.target.value)}
                            />
                        </div>

                        {/* 专业和学位 - 两列布局 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* 专业 */}
                            <div>
                                <label className="flex items-center gap-2 text-xs mb-3">
                                    <span className="text-gray-400">📚</span>
                                    <span>专业</span>
                                </label>
                                <input
                                    type="text"
                                    className="pixel-input w-full py-4"
                                    placeholder="例如: 计算机科学..."
                                    value={formData.major}
                                    onChange={(e) => updateFormData('major', e.target.value)}
                                />
                            </div>

                            {/* 学位 */}
                            <div>
                                <label className="flex items-center gap-2 text-xs mb-3">
                                    <span className="text-gray-400">🎖️</span>
                                    <span>学位</span>
                                </label>
                                <select
                                    className="pixel-input w-full py-4"
                                    value={formData.degree}
                                    onChange={(e) => updateFormData('degree', e.target.value)}
                                >
                                    <option value="">请选择</option>
                                    <option value="本科">本科</option>
                                    <option value="硕士">硕士</option>
                                    <option value="博士">博士</option>
                                    <option value="其他">其他</option>
                                </select>
                            </div>
                        </div>

                        {/* 入学年份和毕业年份 - 两列布局 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="flex items-center gap-2 text-xs mb-3">
                                    <span className="text-gray-400">📅</span>
                                    <span>入学年份</span>
                                </label>
                                <select
                                    className="pixel-input w-full py-4"
                                    value={formData.enrollmentYear || ''}
                                    onChange={(e) => updateFormData('enrollmentYear', e.target.value ? parseInt(e.target.value) : undefined)}
                                >
                                    <option value="">请选择</option>
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs mb-3">
                                    <span className="text-gray-400">🎯</span>
                                    <span>预计毕业年份</span>
                                </label>
                                <select
                                    className="pixel-input w-full py-4"
                                    value={formData.expectedGradYear || ''}
                                    onChange={(e) => updateFormData('expectedGradYear', e.target.value ? parseInt(e.target.value) : undefined)}
                                >
                                    <option value="">请选择</option>
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
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
                        className="pixel-btn flex-1 py-4 text-sm"
                        disabled={isLoading}
                    >
                        {isLoading ? '⏳ PROCESSING...' : 'NEXT →'}
                    </button>
                </div>
            </form>
        </div>
    );
}