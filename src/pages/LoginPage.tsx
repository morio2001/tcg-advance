import React, { useEffect, useState } from 'react';

// アプリ内ブラウザ（WebView）の検出
function isInAppBrowser(): boolean {
  const ua = navigator.userAgent || '';
  return /Line|FBAN|FBAV|Instagram|Twitter|Snapchat|MicroMessenger|WebView|wv/.test(ua)
    || (/(iPhone|iPod|iPad)/.test(ua) && !/Safari/.test(ua));
}

interface LoginPageProps {
  onGoogleLogin: () => void;
  onFacebookLogin?: () => void;
  onTwitterLogin?: () => void;
  onLineLogin?: () => void;
  loading?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onGoogleLogin, onFacebookLogin, onTwitterLogin, onLineLogin, loading }) => {
  const [inAppBrowser, setInAppBrowser] = useState(false);
  useEffect(() => { setInAppBrowser(isInAppBrowser()); }, []);

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

      {/* アプリ内ブラウザ警告 */}
      {inAppBrowser && (
        <div style={{
          width: '100%', maxWidth: '300px', marginBottom: '20px',
          background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.3)',
          borderRadius: '12px', padding: '12px 16px',
          fontSize: '12px', color: '#ffcc00', lineHeight: 1.6, textAlign: 'center',
        }}>
          ⚠️ アプリ内ブラウザではGoogleログインが使えません。<br />
          右下の「…」→「ブラウザで開く」でChromeまたはSafariから開いてください。
        </div>
      )}

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

        {/* Twitterログインボタン */}
        <button
          onClick={onTwitterLogin}
          style={{
            width: '100%', padding: '14px 20px', marginTop: '12px',
            background: '#000000', color: '#ffffff',
            border: 'none', borderRadius: '12px',
            fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X（Twitter）でログイン
        </button>

        {/* Facebookログインボタン */}
        <button
          onClick={onFacebookLogin}
          style={{
            width: '100%', padding: '14px 20px', marginTop: '12px',
            background: '#1877F2', color: '#ffffff',
            border: 'none', borderRadius: '12px',
            fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebookでログイン
        </button>

        {/* LINEログインボタン */}
        <button
          onClick={onLineLogin}
          style={{
            width: '100%', padding: '14px 20px', marginTop: '12px',
            background: '#06C755', color: '#ffffff',
            border: 'none', borderRadius: '12px',
            fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.477 2 2 6.145 2 11.243c0 4.557 3.582 8.364 8.438 9.111.328.07.775.216.888.495.102.255.067.653.033.91l-.144.864c-.044.255-.203 1.002.878.546 1.08-.456 5.837-3.44 7.964-5.89C21.522 15.47 22 13.43 22 11.243 22 6.145 17.523 2 12 2z"/>
          </svg>
          LINEでログイン
        </button>
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
