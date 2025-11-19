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
    <div className="pixel-container w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl mb-2">🎓 QDEZ ALUMNI</h1>
        <p className="text-xs text-gray-400">青岛二中校友平台</p>
      </div>

      <div className="mb-6">
        <div className="text-xs text-gray-400 text-center mb-4">
          请输入您的邀请码以继续注册
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            className="pixel-input w-full uppercase text-center text-lg tracking-wider"
            placeholder="QDEZ-2025-XXXXXX"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            disabled={isLoading}
            maxLength={20}
          />
          {error && <p className="error-text text-center">{error}</p>}
        </div>

        <button
          type="submit"
          className="pixel-btn w-full"
          disabled={isLoading || !inviteCode.trim()}
        >
          {isLoading ? 'VALIDATING...' : 'CONTINUE →'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          没有邀请码？
          <br />
          请联系已注册的校友获取邀请
        </p>
      </div>
    </div>
  );
}
