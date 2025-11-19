# 注册页面组件 - Steps 2-4

## Step 2: 二中身份信息

文件: `src/app/register/components/Step2QdezInfo.tsx`

```typescript
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
```

## Step 3: 留学信息

文件: `src/app/register/components/Step3StudyInfo.tsx`

```typescript
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
```

## Step 4: 完善资料

文件: `src/app/register/components/Step4ProfileInfo.tsx`

```typescript
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
```

## 部署步骤

1. 创建目录结构:
```
src/app/register/
├── page.tsx
└── components/
    ├── InviteCodeStep.tsx
    ├── Step1BasicInfo.tsx
    ├── Step2QdezInfo.tsx
    ├── Step3StudyInfo.tsx
    └── Step4ProfileInfo.tsx
```

2. 复制文件到对应位置

3. 测试注册流程:
   - 访问 http://localhost:3000/register
   - 或访问 http://localhost:3000/register?code=YOUR_CODE

4. 确保全局样式已配置（见 REGISTRATION_IMPLEMENTATION_GUIDE.md）
