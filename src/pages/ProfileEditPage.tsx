import React, { useState, useEffect } from 'react';
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
}

export const ProfileEditPage: React.FC<ProfileEditPageProps> = ({ profile, onSave, goBack, isFirstSetup }) => {
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
