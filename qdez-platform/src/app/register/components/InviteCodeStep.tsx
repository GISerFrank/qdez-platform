'use client';

import { useState } from 'react';

interface InviteCodeStepProps {
  inviteCode: string;
  setInviteCode: (code: string) => void;
  onSuccess: (code: string, info: any) => void;
}

export default function InviteCodeStep({
                                         inviteCode,
                                         setInviteCode,
                                         onSuccess,
                                       }: InviteCodeStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      setError('请输入邀请码');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/invite-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode }),
      });

      const data = await response.json();

      if (data.valid) {
        // 验证成功
        onSuccess(inviteCode, data.inviteCode);
      } else {
        // 验证失败
        setError(data.error || '邀请码无效');
      }
    } catch (error) {
      console.error('Invite code validation error:', error);
      setError('验证失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="pixel-container w-full max-w-md mx-auto p-8 md:p-10">
        {/* ===== 头部区域 ===== */}
        <div className="text-center mb-8">
          {/* Logo / 标题 */}
          <div className="mb-4">
            <span className="text-4xl">🎓</span>
          </div>
          <h1 className="text-xl md:text-2xl mb-3 text-yellow-300">QDEZ ALUMNI</h1>
          <p className="text-xs text-gray-400">青岛二中校友平台</p>
        </div>

        {/* ===== 分隔装饰 ===== */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-px bg-gray-600 flex-1"></div>
          <div className="px-4 text-xs text-gray-500">INVITE CODE</div>
          <div className="h-px bg-gray-600 flex-1"></div>
        </div>

        {/* ===== 主要内容区域 ===== */}
        <div className="mb-8">
          <div className="text-xs text-gray-300 text-center mb-6 leading-relaxed">
            请输入您的邀请码以继续注册
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 邀请码输入框 */}
            <div>
              <input
                  type="text"
                  className="pixel-input w-full uppercase text-center text-sm md:text-base tracking-widest py-4"
                  placeholder="QDEZ-2025-XXXXXX"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  maxLength={20}
              />
              {error && (
                  <p className="error-text text-center mt-3">{error}</p>
              )}
            </div>

            {/* 提交按钮 */}
            <button
                type="submit"
                className="pixel-btn w-full py-4 text-sm"
                disabled={isLoading || !inviteCode.trim()}
            >
              {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                <span className="animate-pulse">⏳</span>
                VALIDATING...
              </span>
              ) : (
                  'CONTINUE →'
              )}
            </button>
          </form>
        </div>

        {/* ===== 分隔线 ===== */}
        <div className="border-t border-gray-700 mb-6"></div>

        {/* ===== 底部提示区域 ===== */}
        <div className="text-center bg-gray-800 bg-opacity-50 rounded p-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="text-yellow-400">💡</span> 没有邀请码？
          </p>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            请联系已注册的校友获取邀请
          </p>
        </div>
      </div>
  );
}