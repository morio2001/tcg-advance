import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../hooks/useProfile';

const TCG_OPTIONS = [
  { id: 'pokemon', label: 'ポケモンカード', emoji: '⚡' },
  { id: 'onepiece', label: 'ワンピースカード', emoji: '🏴‍☠️' },
  { id: 'yugioh', label: '遊戯王', emoji: '🔮' },
  { id: 'duelmasters', label: 'デュエルマスターズ', emoji: '🔥' },
  { id: 'mtg', label: 'MTG', emoji: '🧙' },
  { id: 'vanguard', label: 'ヴァンガード', emoji: '⚔️' },
  { id: 'weiss', label: 'ヴァイスシュヴァルツ', emoji: '🎭' },
  { id: 'dragonball', label: 'ドラゴンボールカード', emoji: '🐉' },
];

interface ProfileEditPageProps {
  profile: Profile;
  onSave: (updates: { display_name: string; favorite_shop: string; favorite_tcg: string[] }) => Promise<{ error: string | null }>;
  goBack: () => void;
  isFirstSetup?: boolean;
  user?: User;
  onLinkGoogle?: () => void;
  onLinkTwitter?: () => void;
  onLinkLine?: () => void;
}

export const ProfileEditPage: React.FC<ProfileEditPageProps> = ({ profile, onSave, goBack, isFirstSetup, user, onLinkGoogle, onLinkTwitter, onLinkLine }) => {
  const [name, setName] = useState(profile.display_name || '');
  const [shop, setShop] = useState(profile.favorite_shop || '');
  const [tcgs, setTcgs] = useState<string[]>(profile.favorite_tcg || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(profile.display_name || '');
    setShop(profile.favorite_shop || '');
    setTcgs(profile.favorite_tcg || []);
  }, [profile]);

  const toggleTcg = (id: string) => {
    setTcgs(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { error } = await onSave({
      display_name: name.trim(),
      favorite_shop: shop.trim(),
      favorite_tcg: tcgs,
    });
    setSaving(false);
    if (!error) {
      if (isFirstSetup) {
        goBack();
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }
  };

  return (
    <div style={{ padding: '20px 16px' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
        {!isFirstSetup && (
          <button onClick={goBack} style={{
            background: 'none', border: 'none', color: '#00e0e0',
            fontSize: '18px', cursor: 'pointer', padding: '4px 8px', marginRight: '8px',
          }}>←</button>
        )}
        <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
          {isFirstSetup ? '🎉 プロフィール設定' : 'プロフィール編集'}
        </h2>
      </div>

      {isFirstSetup && (
        <div style={{
          background: 'rgba(0,224,224,0.06)', border: '1px solid rgba(0,224,224,0.15)',
          borderRadius: '12px', padding: '16px', marginBottom: '24px',
          fontSize: '13px', color: '#8090a0', lineHeight: '1.6',
        }}>
          ようこそ！まずはプロフィールを設定しましょう。<br />
          あとからいつでも変更できます。
        </div>
      )}

      {/* アバター表示 */}
      {profile.avatar_url && (
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src={profile.avatar_url}
            alt="avatar"
            style={{
              width: '80px', height: '80px', borderRadius: '50%',
              border: '3px solid rgba(0,224,224,0.3)',
              boxShadow: '0 0 20px rgba(0,224,224,0.15)',
            }}
          />
          <div style={{ fontSize: '11px', color: '#556677', marginTop: '8px' }}>
            Googleアカウントのアイコンが使用されます
          </div>
        </div>
      )}

      {/* 名前 */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block', fontSize: '12px', fontWeight: 700,
          color: '#8090a0', marginBottom: '8px', letterSpacing: '1px',
        }}>
          表示名 <span style={{ color: '#ff6080' }}>*</span>
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="プレイヤー名を入力"
          maxLength={20}
          style={{
            width: '100%', padding: '12px 16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', color: '#e0e8f0',
            fontSize: '15px', outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,224,224,0.4)'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
        <div style={{ fontSize: '11px', color: '#445566', marginTop: '4px', textAlign: 'right' }}>
          {name.length}/20
        </div>
      </div>

      {/* 推しショップ */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block', fontSize: '12px', fontWeight: 700,
          color: '#8090a0', marginBottom: '8px', letterSpacing: '1px',
        }}>
          🏪 推しショップ
        </label>
        <input
          value={shop}
          onChange={e => setShop(e.target.value)}
          placeholder="例: カードラボ秋葉原"
          maxLength={30}
          style={{
            width: '100%', padding: '12px 16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', color: '#e0e8f0',
            fontSize: '15px', outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,224,224,0.4)'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      </div>

      {/* プレイしているTCG */}
      <div style={{ marginBottom: '32px' }}>
        <label style={{
          display: 'block', fontSize: '12px', fontWeight: 700,
          color: '#8090a0', marginBottom: '12px', letterSpacing: '1px',
        }}>
          🃏 プレイしているTCG
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {TCG_OPTIONS.map(tcg => {
            const selected = tcgs.includes(tcg.id);
            return (
              <button
                key={tcg.id}
                onClick={() => toggleTcg(tcg.id)}
                style={{
                  padding: '8px 14px',
                  background: selected ? 'rgba(0,224,224,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selected ? 'rgba(0,224,224,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '20px', cursor: 'pointer',
                  color: selected ? '#00e0e0' : '#667788',
                  fontSize: '13px', fontWeight: selected ? 700 : 500,
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <span>{tcg.emoji}</span>
                {tcg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SNS連携 */}
      {!isFirstSetup && (
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8090a0', marginBottom: '12px', letterSpacing: '1px' }}>
            🔗 SNS連携
          </label>
          {[
            {
              key: 'google',
              label: 'Google',
              color: '#ffffff',
              bg: '#333',
              linked: user?.identities?.some(i => i.provider === 'google') ?? false,
              onLink: onLinkGoogle,
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              ),
            },
            {
              key: 'twitter',
              label: 'X (Twitter)',
              color: '#ffffff',
              bg: '#000000',
              linked: user?.identities?.some(i => i.provider === 'twitter') ?? false,
              onLink: onLinkTwitter,
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              ),
            },
            {
              key: 'line',
              label: 'LINE',
              color: '#ffffff',
              bg: '#06C755',
              linked: (user?.user_metadata?.line_user_id !== undefined) || (user?.email?.endsWith('@line.tcgadvance') ?? false),
              onLink: onLinkLine,
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
              ),
            },
          ].map(({ key, label, color, bg, linked, onLink, icon }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {icon}
                <span style={{ fontSize: '14px', color: '#c0d0e0' }}>{label}</span>
              </div>
              {linked ? (
                <span style={{ fontSize: '12px', color: '#00e0e0', fontWeight: 700 }}>✓ 連携済み</span>
              ) : (
                <button onClick={onLink} style={{ padding: '6px 14px', background: bg, color: color, border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  連携する
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        disabled={saving || !name.trim()}
        style={{
          width: '100%', padding: '14px',
          background: name.trim() ? 'linear-gradient(135deg, #00e0e0, #00b0d0)' : 'rgba(255,255,255,0.05)',
          border: 'none', borderRadius: '12px',
          color: name.trim() ? '#0a0e1a' : '#445566',
          fontSize: '16px', fontWeight: 800, cursor: name.trim() ? 'pointer' : 'default',
          transition: 'all 0.2s',
          boxShadow: name.trim() ? '0 4px 16px rgba(0,224,224,0.25)' : 'none',
        }}
      >
        {saving ? '保存中...' : saved ? '✓ 保存しました！' : isFirstSetup ? 'はじめる' : '保存する'}
      </button>
    </div>
  );
};
