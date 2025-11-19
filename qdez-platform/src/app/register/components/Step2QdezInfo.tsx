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
        <div className="pixel-container">
            <div className="mb-6">
                <h2 className="text-xl mb-2">STEP 2: 二中身份</h2>
                <p className="text-xs text-gray-400">确认您的青岛二中校友身份</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 真实姓名 */}
                <div>
                    <label className="block text-xs mb-2">真实姓名 *</label>
                    <input
                        type="text"
                        className="pixel-input w-full"
                        placeholder="请输入真实姓名"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        required
                    />
                    {errors.name && <p className="error-text">{errors.name}</p>}
                </div>

                {/* 入学年份 */}
                <div>
                    <label className="block text-xs mb-2">入学年份 *</label>
                    <select
                        className="pixel-input w-full"
                        value={formData.qdezEnrollmentYear}
                        onChange={(e) => updateFormData('qdezEnrollmentYear', parseInt(e.target.value))}
                        required
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}年</option>
                        ))}
                    </select>
                    {errors.qdezEnrollmentYear && <p className="error-text">{errors.qdezEnrollmentYear}</p>}
                </div>

                {/* 毕业年份（可选） */}
                <div>
                    <label className="block text-xs mb-2">毕业年份（可选）</label>
                    <select
                        className="pixel-input w-full"
                        value={formData.qdezGraduationYear || ''}
                        onChange={(e) => updateFormData('qdezGraduationYear', e.target.value ? parseInt(e.target.value) : undefined)}
                    >
                        <option value="">未毕业/不填写</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}年</option>
                        ))}
                    </select>
                </div>

                {/* 班级 */}
                <div>
                    <label className="block text-xs mb-2">班级 *</label>
                    <input
                        type="text"
                        className="pixel-input w-full"
                        placeholder="例如: 高三3班"
                        value={formData.qdezClass}
                        onChange={(e) => updateFormData('qdezClass', e.target.value)}
                        required
                    />
                    {errors.qdezClass && <p className="error-text">{errors.qdezClass}</p>}
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
                        disabled={isLoading || !formData.name || !formData.qdezClass}
                    >
                        NEXT →
                    </button>
                </div>
            </form>
        </div>
    );
}