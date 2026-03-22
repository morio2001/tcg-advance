import React from 'react';
import type { ViewId } from '../types';

interface Props {
  nav: (view: ViewId, data?: any) => void;
  onSignOut?: () => void;
}

export const AccountPage: React.FC<Props> = ({ nav, onSignOut }) => {
  const menuItems = [
    { label: 'プロフィール編集', icon: '✏️', action: () => nav('profile-edit') },
    { label: '公開プロフィールを見る', icon: '👤', action: () => nav('public-profile') },
    { label: '通知設定', icon: '🔔', action: () => {} },
    { label: 'アプリについて', icon: 'ℹ️', action: () => {} },
  ];

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 16px', background: 'linear-gradient(135deg, #00c878, #00a0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        アカウント
      </h1>

      {/* メニューリスト */}
      {menuItems.map((item, i) => (
        <button key={i} onClick={item.action} style={{
          width: '100%', padding: '14px 16px', marginBottom: '4px',
          background: 'rgba(255,255,255,0.04)', borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)', color: '#c0d0e0',
          fontSize: '13px', cursor: 'pointer', textAlign: 'left' as const,
          fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '16px' }}>{item.icon}</span>
          {item.label}
        </button>
      ))}

      {/* ログアウト */}
      <button onClick={onSignOut} style={{
        width: '100%', padding: '14px 16px', marginTop: '24px',
        background: 'rgba(255,80,80,0.06)', borderRadius: '8px',
        border: '1px solid rgba(255,80,80,0.15)', color: '#ff5050',
        fontSize: '13px', cursor: 'pointer', textAlign: 'center' as const,
        fontFamily: 'inherit', fontWeight: 700,
      }}>
        ログアウト
      </button>
    </div>
  );
};
