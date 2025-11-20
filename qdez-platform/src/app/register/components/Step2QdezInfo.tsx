'use client';

interface Step2Props {
    formData: any;
    errors: Record<string, string>;
    updateFormData: (field: string, value: any) => void;
    onNext: () => void;
    onBack: () => void;
    isLoading: boolean;
}

export default function Step2QdezInfo({
                                          formData,
                                          errors,
                                          updateFormData,
                                          onNext,
                                          onBack,
                                          isLoading,
                                      }: Step2Props) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.qdezClass) {
            return;
        }
        onNext();
    };

    return (
        <div className="pixel-container p-8 md:p-12">
            {/* 步骤标题区域 */}
            <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-yellow-400 text-lg">◆</span>
                    <span className="text-2xl">STEP 2</span>
                    <span className="text-yellow-400 text-lg">◆</span>
                </div>
                <h2 className="text-lg mb-3">二中身份</h2>
                <p className="text-xs text-gray-400">确认您的青岛二中校友身份</p>

                {/* 装饰分隔线 */}
                <div className="flex items-center justify-center gap-2 mt-6">
                    <div className="h-px w-12 bg-indigo-500"></div>
                    <span className="text-indigo-400 text-xs">▼</span>
                    <div className="h-px w-12 bg-indigo-500"></div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">

                {/* 分组1: 个人信息 */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl">👤</span>
                        <h3 className="text-sm text-cyan-300">个人信息</h3>
                    </div>

                    <div className="space-y-5 pl-8">
                        {/* 真实姓名 */}
                        <div>
                            <label className="flex items-center gap-2 text-xs mb-3">
                                <span className="text-gray-400">📝</span>
                                <span>真实姓名</span>
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                className="pixel-input w-full py-4"
                                placeholder="请输入真实姓名"
                                value={formData.name}
                                onChange={(e) => updateFormData('name', e.target.value)}
                                required
                            />
                            <div className="mt-2 min-h-[20px]">
                                {errors.name && <p className="error-text">{errors.name}</p>}
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

                {/* 分组2: 在校信息 */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl">🏫</span>
                        <h3 className="text-sm text-cyan-300">在校信息</h3>
                    </div>

                    <div className="space-y-5 pl-8">
                        {/* 入学年份 */}
                        <div>
                            <label className="flex items-center gap-2 text-xs mb-3">
                                <span className="text-gray-400">📅</span>
                                <span>入学年份</span>
                                <span className="text-red-400">*</span>
                            </label>
                            <select
                                className="pixel-input w-full py-4"
                                value={formData.qdezEnrollmentYear}
                                onChange={(e) => updateFormData('qdezEnrollmentYear', parseInt(e.target.value))}
                                required
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year}年</option>
                                ))}
                            </select>
                            <div className="mt-2 min-h-[20px]">
                                {errors.qdezEnrollmentYear && <p className="error-text">{errors.qdezEnrollmentYear}</p>}
                            </div>
                        </div>

                        {/* 毕业年份（可选） */}
                        <div>
                            <label className="flex items-center gap-2 text-xs mb-3">
                                <span className="text-gray-400">🎓</span>
                                <span>毕业年份</span>
                                <span className="text-gray-500 text-xs ml-2">(可选)</span>
                            </label>
                            <select
                                className="pixel-input w-full py-4"
                                value={formData.qdezGraduationYear || ''}
                                onChange={(e) => updateFormData('qdezGraduationYear', e.target.value ? parseInt(e.target.value) : undefined)}
                            >
                                <option value="">未毕业 / 不填写</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}年</option>
                                ))}
                            </select>
                        </div>

                        {/* 班级 */}
                        <div>
                            <label className="flex items-center gap-2 text-xs mb-3">
                                <span className="text-gray-400">🏠</span>
                                <span>班级</span>
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                className="pixel-input w-full py-4"
                                placeholder="例如: 高三3班"
                                value={formData.qdezClass}
                                onChange={(e) => updateFormData('qdezClass', e.target.value)}
                                required
                            />
                            <div className="mt-2 min-h-[20px]">
                                {errors.qdezClass && <p className="error-text">{errors.qdezClass}</p>}
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
                        disabled={isLoading || !formData.name || !formData.qdezClass}
                    >
                        {isLoading ? '⏳ PROCESSING...' : 'NEXT →'}
                    </button>
                </div>
            </form>
        </div>
    );
}