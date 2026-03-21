import React from 'react';
import type { ViewId } from '../types';

interface Props {
  nav: (view: ViewId, data?: any) => void;
}

export const AccountPage: React.FC<Props> = ({ nav }) => (
  <div style={{ padding: '16px' }}>
    <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 16px', background: 'linear-gradient(135deg, #00c878, #00a0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      アカウント
    </h1>
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #00e0e0, #a064ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: 800, color: '#fff',
        }}>シ</div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f0f0f0' }}>シロ</div>
          <div style={{ fontSize: '11px', color: '#556677' }}>wakayama@cheered.jp</div>
        </div>
      </div>
      <button
        onClick={() => nav('public-profile')}
        style={{
          width: '100%', padding: '9px', borderRadius: '8px', cursor: 'pointer',
          background: 'rgba(0,224,224,0.08)', border: '1px solid rgba(0,224,224,0.2)',
          color: '#00e0e0', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}
      >
        <span>👤</span> 公開プロフィールを見る
      </button>
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
