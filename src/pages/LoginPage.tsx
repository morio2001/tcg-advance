import React from 'react';

interface LoginPageProps {
  onGoogleLogin: () => void;
  loading?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onGoogleLogin, loading }) => {
  if (loading) {
    return (
      <div style={{
        width: '100%', maxWidth: '430px', margin: '0 auto', height: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1220 50%, #0a0e1a 100%)',
        color: '#e0e8f0', fontFamily: "'Noto Sans JP', -apple-system, sans-serif",
      }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⚡</div>
        <div style={{ color: '#556677' }}>読み込み中...</div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', maxWidth: '430px', margin: '0 auto', height: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1220 50%, #0a0e1a 100%)',
      color: '#e0e8f0', fontFamily: "'Noto Sans JP', -apple-system, sans-serif",
      padding: '0 32px',
    }}>
      {/* ロゴエリア */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{
          fontSize: '48px', marginBottom: '16px',
          filter: 'drop-shadow(0 0 20px rgba(0,224,224,0.3))',
        }}>⚡</div>
        <h1 style={{
          fontSize: '28px', fontWeight: 900, margin: '0 0 8px',
          background: 'linear-gradient(135deg, #00e0e0, #a064ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '2px',
        }}>
          TCG Advance
        </h1>
        <p style={{
          fontSize: '13px', color: '#556677', margin: 0,
          letterSpacing: '1px',
        }}>
          カードゲーマーのためのSNS
        </p>
      </div>

      {/* ログインボタンエリア */}
      <div style={{ width: '100%', maxWidth: '300px' }}>
        {/* Googleログインボタン */}
        <button
          onClick={onGoogleLogin}
          style={{
            width: '100%', padding: '14px 20px',
            background: '#ffffff', color: '#333333',
            border: 'none', borderRadius: '12px',
            fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '12px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          }}
        >
          {/* Google アイコン */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Googleでログイン
        </button>

        {/* 将来のLINEログインボタン用スペース */}
        <div style={{
          marginTop: '16px', padding: '14px 20px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '12px', textAlign: 'center',
          color: '#445566', fontSize: '13px',
        }}>
          🟢 LINEログイン（近日追加予定）
        </div>
      </div>

      {/* フッター */}
      <div style={{
        position: 'absolute', bottom: '32px',
        fontSize: '11px', color: '#334455', textAlign: 'center',
      }}>
        ログインすることで利用規約に同意したものとします
      </div>
    </div>
  );
};
