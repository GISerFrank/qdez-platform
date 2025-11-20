'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InviteCodeStep from './components/InviteCodeStep';
import Step1BasicInfo from './components/Step1BasicInfo';
import Step2QdezInfo from './components/Step2QdezInfo';
import Step3StudyInfo from './components/Step3StudyInfo';
import Step4ProfileInfo from './components/Step4ProfileInfo';
import PixelCampusBackground from './components/PixelCampusBackground';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get('code');

  // 步骤控制：0=邀请码验证，1-4=注册步骤
  const [currentStep, setCurrentStep] = useState(codeFromUrl ? 1 : 0);
  const [inviteCode, setInviteCode] = useState(codeFromUrl || '');
  const [inviteCodeInfo, setInviteCodeInfo] = useState<any>(null);

  // 表单数据
  const [formData, setFormData] = useState({
    // Step 1: 基础账号
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    inviteCode: codeFromUrl || '',

    // Step 2: 二中身份
    name: '',
    qdezEnrollmentYear: new Date().getFullYear() - 3,
    qdezGraduationYear: undefined as number | undefined,
    qdezClass: '',

    // Step 3: 留学信息
    country: '',
    city: '',
    currentSchool: '',
    major: '',
    degree: '' as '' | '本科' | '硕士' | '博士' | '其他',
    enrollmentYear: undefined as number | undefined,
    expectedGradYear: undefined as number | undefined,

    // Step 4: 完善资料
    displayName: '',
    bio: '',
    wechat: '',
    linkedin: '',
    website: '',
    privacySettings: {
      profilePublic: true,
      locationPublic: true,
      contactPublic: false,
      searchable: true,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // 更新表单数据
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 邀请码验证成功回调
  const handleInviteCodeSuccess = (code: string, info: any) => {
    setInviteCode(code);
    setInviteCodeInfo(info);
    updateFormData('inviteCode', code);
    setCurrentStep(1);
  };

  // 下一步
  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  // 上一步
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // 最终提交注册
  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // 注册成功
        alert('注册成功！正在跳转到登录页...');
        router.push('/login');
      } else {
        // 注册失败
        if (data.details) {
          // Zod 验证错误
          const newErrors: Record<string, string> = {};
          data.details.forEach((err: any) => {
            newErrors[err.path[0]] = err.message;
          });
          setErrors(newErrors);
        } else {
          setErrors({ submit: data.error || '注册失败，请重试' });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: '网络错误，请稍后重试' });
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染当前步骤
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
            <InviteCodeStep
                inviteCode={inviteCode}
                setInviteCode={setInviteCode}
                onSuccess={handleInviteCodeSuccess}
            />
        );
      case 1:
        return (
            <Step1BasicInfo
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                onNext={handleNext}
                isLoading={isLoading}
                inviteCodeInfo={inviteCodeInfo}
            />
        );
      case 2:
        return (
            <Step2QdezInfo
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
                isLoading={isLoading}
            />
        );
      case 3:
        return (
            <Step3StudyInfo
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
                isLoading={isLoading}
            />
        );
      case 4:
        return (
            <Step4ProfileInfo
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                onSubmit={handleSubmit}
                onBack={handleBack}
                isLoading={isLoading}
            />
        );
      default:
        return null;
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        {/* 像素化校园背景 */}
        <PixelCampusBackground />

        {/* 内容层 */}
        <div className="w-full max-w-2xl relative z-10">
          {/* 进度条（步骤1-4时显示） */}
          {currentStep > 0 && (
              <div className="mb-8">
                <div className="progress-bar">
                  <div
                      className="progress-fill"
                      style={{ width: `${(currentStep / 4) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-center mt-2 text-gray-400">
                  STEP {currentStep}/4
                </p>
              </div>
          )}

          {/* 当前步骤内容 */}
          {renderStep()}

          {/* 全局错误提示 */}
          {errors.submit && (
              <div className="mt-4 text-center">
                <p className="error-text">{errors.submit}</p>
              </div>
          )}
        </div>
      </div>
  );
}