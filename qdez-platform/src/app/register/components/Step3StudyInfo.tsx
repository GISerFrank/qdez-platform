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
        <div className="pixel-container">
            <div className="mb-6">
                <h2 className="text-xl mb-2">STEP 3: 留学信息</h2>
                <p className="text-xs text-gray-400">告诉我们您的留学情况（可选）</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 国家 */}
                <div>
                    <label className="block text-xs mb-2">留学国家</label>
                    <input
                        type="text"
                        className="pixel-input w-full"
                        placeholder="例如: 美国、英国、加拿大..."
                        value={formData.country}
                        onChange={(e) => updateFormData('country', e.target.value)}
                    />
                </div>

                {/* 城市 */}
                <div>
                    <label className="block text-xs mb-2">城市</label>
                    <input
                        type="text"
                        className="pixel-input w-full"
                        placeholder="例如: 波士顿、伦敦..."
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                    />
                </div>

                {/* 学校 */}
                <div>
                    <label className="block text-xs mb-2">当前学校</label>
                    <input
                        type="text"
                        className="pixel-input w-full"
                        placeholder="例如: MIT、Stanford..."
                        value={formData.currentSchool}
                        onChange={(e) => updateFormData('currentSchool', e.target.value)}
                    />
                </div>

                {/* 专业 */}
                <div>
                    <label className="block text-xs mb-2">专业</label>
                    <input
                        type="text"
                        className="pixel-input w-full"
                        placeholder="例如: 计算机科学、金融..."
                        value={formData.major}
                        onChange={(e) => updateFormData('major', e.target.value)}
                    />
                </div>

                {/* 学位 */}
                <div>
                    <label className="block text-xs mb-2">学位</label>
                    <select
                        className="pixel-input w-full"
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

                {/* 入学年份 */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs mb-2">入学年份</label>
                        <select
                            className="pixel-input w-full"
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
                        <label className="block text-xs mb-2">预计毕业年份</label>
                        <select
                            className="pixel-input w-full"
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
                        className="pixel-btn flex-1"
                        disabled={isLoading}
                    >
                        NEXT →
                    </button>
                </div>
            </form>
        </div>
    );
}