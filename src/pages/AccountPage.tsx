import React from 'react';

export const AccountPage: React.FC = () => (
  <div style={{ padding: '16px' }}>
    <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 16px', background: 'linear-gradient(135deg, #00c878, #00a0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      アカウント
    </h1>
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #00e0e0, #a064ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: 800, color: '#fff',
        }}>T</div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f0f0f0' }}>トレーナー</div>
          <div style={{ fontSize: '11px', color: '#556677' }}>trainer@example.com</div>
        </div>
      </div>
    </div>
    {['プロフィール編集', '通知設定', 'アプリについて', 'ログアウト'].map((item, i) => (
      <button key={i} style={{
        width: '100%', padding: '12px 16px', marginBottom: '4px',
        background: 'rgba(255,255,255,0.04)', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.06)', color: i === 3 ? '#ff5050' : '#c0d0e0',
        fontSize: '13px', cursor: 'pointer', textAlign: 'left' as const, fontFamily: 'inherit',
      }}>{item}</button>
    ))}
  </div>
);
