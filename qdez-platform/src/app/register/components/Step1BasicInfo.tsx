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
    
    // 基础验证
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
    <div className="pixel-container">
      <div className="mb-6">
        <h2 className="text-xl mb-2">STEP 1: 基础账号</h2>
        <p className="text-xs text-gray-400">创建您的登录账号</p>
        
        {inviteCodeInfo && (
          <div className="mt-4 p-3 bg-indigo-900 bg-opacity-30 rounded border border-indigo-700">
            <p className="text-xs text-indigo-300">
              ✅ 邀请码: <span className="text-yellow-400">{formData.inviteCode}</span>
              {inviteCodeInfo.generator && (
                <span className="ml-2">
                  （来自 {inviteCodeInfo.generator.name || inviteCodeInfo.generator.username}）
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 邮箱 */}
        <div>
          <label className="block text-xs mb-2">邮箱 *</label>
          <input
            type="email"
            className="pixel-input w-full"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            required
          />
          {checking.email && <p className="text-xs text-gray-400 mt-1">检查中...</p>}
          {emailAvailable === true && <p className="success-text">✓ 邮箱可用</p>}
          {emailAvailable === false && <p className="error-text">✗ 邮箱已被注册</p>}
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        {/* 用户名 */}
        <div>
          <label className="block text-xs mb-2">用户名 *</label>
          <input
            type="text"
            className="pixel-input w-full"
            placeholder="username (3-20字符)"
            value={formData.username}
            onChange={(e) => updateFormData('username', e.target.value)}
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
          />
          {checking.username && <p className="text-xs text-gray-400 mt-1">检查中...</p>}
          {usernameAvailable === true && <p className="success-text">✓ 用户名可用</p>}
          {usernameAvailable === false && <p className="error-text">✗ 用户名已被占用</p>}
          {errors.username && <p className="error-text">{errors.username}</p>}
          <p className="text-xs text-gray-500 mt-1">只能包含字母、数字和下划线</p>
        </div>

        {/* 密码 */}
        <div>
          <label className="block text-xs mb-2">密码 *</label>
          <input
            type="password"
            className="pixel-input w-full"
            placeholder="至少8个字符"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            required
            minLength={8}
          />
          {errors.password && <p className="error-text">{errors.password}</p>}
          <p className="text-xs text-gray-500 mt-1">至少8个字符，包含字母和数字</p>
        </div>

        {/* 确认密码 */}
        <div>
          <label className="block text-xs mb-2">确认密码 *</label>
          <input
            type="password"
            className="pixel-input w-full"
            placeholder="再次输入密码"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
            required
          />
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="error-text">✗ 两次密码不一致</p>
          )}
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="success-text">✓ 密码一致</p>
          )}
          {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
        </div>

        {/* 下一步按钮 */}
        <button
          type="submit"
          className="pixel-btn w-full mt-6"
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
          {isLoading ? 'PROCESSING...' : 'NEXT →'}
        </button>
      </form>
    </div>
  );
}
