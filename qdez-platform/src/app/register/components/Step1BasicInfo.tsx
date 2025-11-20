'use client';

import { useState, useEffect } from 'react';

interface Step1Props {
  formData: any;
  errors: Record<string, string>;
  updateFormData: (field: string, value: any) => void;
  onNext: () => void;
  isLoading: boolean;
  inviteCodeInfo: any;
}

export default function Step1BasicInfo({
                                         formData,
                                         errors,
                                         updateFormData,
                                         onNext,
                                         isLoading,
                                         inviteCodeInfo,
                                       }: Step1Props) {
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState({ username: false, email: false });

  // 实时检查用户名
  useEffect(() => {
    if (formData.username.length >= 3) {
      const timer = setTimeout(async () => {
        setChecking(prev => ({ ...prev, username: true }));
        try {
          const response = await fetch('/api/auth/check-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: formData.username }),
          });
          const data = await response.json();
          setUsernameAvailable(data.available);
        } catch (error) {
          console.error('Username check error:', error);
        } finally {
          setChecking(prev => ({ ...prev, username: false }));
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setUsernameAvailable(null);
    }
  }, [formData.username]);

  // 实时检查邮箱
  useEffect(() => {
    if (formData.email.includes('@')) {
      const timer = setTimeout(async () => {
        setChecking(prev => ({ ...prev, email: true }));
        try {
          const response = await fetch('/api/auth/check-availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email }),
          });
          const data = await response.json();
          setEmailAvailable(data.available);
        } catch (error) {
          console.error('Email check error:', error);
        } finally {
          setChecking(prev => ({ ...prev, email: false }));
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setEmailAvailable(null);
    }
  }, [formData.email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (usernameAvailable === false || emailAvailable === false) {
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
            <span className="text-2xl">STEP 1</span>
            <span className="text-yellow-400 text-lg">◆</span>
          </div>
          <h2 className="text-lg mb-3">基础账号</h2>
          <p className="text-xs text-gray-400">创建您的登录凭证</p>

          {/* 装饰分隔线 */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="h-px w-12 bg-indigo-500"></div>
            <span className="text-indigo-400 text-xs">▼</span>
            <div className="h-px w-12 bg-indigo-500"></div>
          </div>
        </div>

        {/* 邀请码信息卡片 */}
        {inviteCodeInfo && (
            <div className="mb-10 p-5 bg-indigo-900 bg-opacity-30 border-2 border-indigo-600 rounded">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎟️</span>
                <div>
                  <p className="text-xs text-indigo-300 mb-1">邀请码已验证</p>
                  <p className="text-sm text-yellow-400">{formData.inviteCode}</p>
                  {inviteCodeInfo.generator && (
                      <p className="text-xs text-gray-400 mt-1">
                        来自 {inviteCodeInfo.generator.name || inviteCodeInfo.generator.username}
                      </p>
                  )}
                </div>
              </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* 分组1: 登录信息 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">📧</span>
              <h3 className="text-sm text-cyan-300">登录信息</h3>
            </div>

            <div className="space-y-5 pl-8">
              {/* 邮箱 */}
              <div>
                <label className="flex items-center gap-2 text-xs mb-3">
                  <span className="text-gray-400">✉️</span>
                  <span>邮箱地址</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                    type="email"
                    className="pixel-input w-full py-4"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    required
                />
                <div className="mt-2 min-h-[20px]">
                  {checking.email && <p className="text-xs text-gray-400">⏳ 检查中...</p>}
                  {emailAvailable === true && <p className="success-text">✓ 邮箱可用</p>}
                  {emailAvailable === false && <p className="error-text">✗ 邮箱已被注册</p>}
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>
              </div>

              {/* 用户名 */}
              <div>
                <label className="flex items-center gap-2 text-xs mb-3">
                  <span className="text-gray-400">👤</span>
                  <span>用户名</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    className="pixel-input w-full py-4"
                    placeholder="username (3-20字符)"
                    value={formData.username}
                    onChange={(e) => updateFormData('username', e.target.value)}
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_]+"
                />
                <div className="mt-2 min-h-[20px]">
                  {checking.username && <p className="text-xs text-gray-400">⏳ 检查中...</p>}
                  {usernameAvailable === true && <p className="success-text">✓ 用户名可用</p>}
                  {usernameAvailable === false && <p className="error-text">✗ 用户名已被占用</p>}
                  {errors.username && <p className="error-text">{errors.username}</p>}
                </div>
                <p className="text-xs text-gray-500 mt-2">只能包含字母、数字和下划线</p>
              </div>
            </div>
          </div>

          {/* 视觉分隔 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-600 text-xs">◇</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          {/* 分组2: 安全设置 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">🔐</span>
              <h3 className="text-sm text-cyan-300">安全设置</h3>
            </div>

            <div className="space-y-5 pl-8">
              {/* 密码 */}
              <div>
                <label className="flex items-center gap-2 text-xs mb-3">
                  <span className="text-gray-400">🔑</span>
                  <span>密码</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                    type="password"
                    className="pixel-input w-full py-4"
                    placeholder="至少8个字符"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    required
                    minLength={8}
                />
                <div className="mt-2 min-h-[20px]">
                  {errors.password && <p className="error-text">{errors.password}</p>}
                </div>
                <p className="text-xs text-gray-500 mt-2">至少8个字符，包含字母和数字</p>
              </div>

              {/* 确认密码 */}
              <div>
                <label className="flex items-center gap-2 text-xs mb-3">
                  <span className="text-gray-400">🔑</span>
                  <span>确认密码</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                    type="password"
                    className="pixel-input w-full py-4"
                    placeholder="再次输入密码"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    required
                />
                <div className="mt-2 min-h-[20px]">
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="error-text">✗ 两次密码不一致</p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="success-text">✓ 密码一致</p>
                  )}
                  {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* 下一步按钮 */}
          <div className="pt-6">
            <button
                type="submit"
                className="pixel-btn w-full py-4 text-sm"
                disabled={
                    isLoading ||
                    !formData.email ||
                    !formData.username ||
                    !formData.password ||
                    !formData.confirmPassword ||
                    formData.password !== formData.confirmPassword ||
                    usernameAvailable === false ||
                    emailAvailable === false ||
                    checking.username ||
                    checking.email
                }
            >
              {isLoading ? '⏳ PROCESSING...' : 'NEXT →'}
            </button>
          </div>
        </form>
      </div>
  );
}