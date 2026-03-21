import React, { useState } from 'react';
import { IconBack, IconTrophy } from '../components/Icons';
import { MOCK_HISTORY, TCG_GAMES, MY_TCG_IDS } from '../data/mockData';

const MY_PROFILE = {
  name: 'シロ',
  initial: 'シ',
  avatarColor: 'linear-gradient(135deg, #00e0e0, #a064ff)',
  level: 12,
  levelXp: 450,
  levelXpMax: 600,
  following: 8,
  followers: 15,
  recentDeck: 'リザードンex',
  favoriteShop: 'カードラボ秋葉原',
  total: { events: 47, wins: 31, championships: 3, rankNational: 847, rankArea: 12 },
  season: { events: 3, wins: 8, championships: 1, rankNational: 234, rankArea: 8, label: '2026-1Q' },
};

const BADGES = [
  { icon: '🏆', label: '優勝経験者', color: '#ffc800' },
  { icon: '⚡', label: 'LV10突破', color: '#00e0e0' },
  { icon: '🔥', label: '月3大会参加', color: '#ff6020' },
  { icon: '🎯', label: '勝率60%超', color: '#a064ff' },
  { icon: '📅', label: '継続参加3ヶ月', color: '#00c878' },
];

const placementColor = (p: string) => {
  if (p.startsWith('優勝') || p.startsWith('1位')) return '#ffc800';
  if (p.startsWith('準優勝') || p.startsWith('2位')) return '#c0c8d8';
  if (p.startsWith('3位')) return '#c08040';
  return '#8899aa';
};

interface Props {
  goBack: () => void;
}

export const PublicProfilePage: React.FC<Props> = ({ goBack }) => {
  const [season, setSeason] = useState<'lifetime' | 'season'>('lifetime');
  const [instaCopied, setInstaCopied] = useState(false);
  const stats = season === 'lifetime' ? MY_PROFILE.total : MY_PROFILE.season;

  const profileUrl = 'https://tcg-advance.app/u/shiro';

  const xShareText = `TCGマイスターアドバンスでプレイ記録を公開中！\n\nLV.${MY_PROFILE.level} | 大会${MY_PROFILE.total.events}回参加 | 優勝${MY_PROFILE.total.championships}回\n全国ランク #${MY_PROFILE.total.rankNational}位\n\n${profileUrl}\n#TCGマイスターアドバンス #ポケカ`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xShareText)}`;

  const instaCaption = `✨ TCGトレーナープロフィール ✨\n\n🎮 ${MY_PROFILE.name} / LV.${MY_PROFILE.level}\n⚔️ 大会参加 ${MY_PROFILE.total.events}回\n🏆 優勝 ${MY_PROFILE.total.championships}回 / 勝利 ${MY_PROFILE.total.wins}回\n🗾 全国ランク #${MY_PROFILE.total.rankNational}位\n📍 エリアランク #${MY_PROFILE.total.rankArea}位\n🃏 使用デッキ: ${MY_PROFILE.recentDeck}\n\n${profileUrl}\n.\n.\n#TCGマイスターアドバンス #ポケカ #ポケモンカード #TCG #カードゲーム #ポケカ好きと繋がりたい`;

  const handleInstaShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'TCGプロフィール', text: instaCaption, url: profileUrl });
        return;
      } catch { /* cancelled */ }
    }
    navigator.clipboard.writeText(instaCaption).then(() => {
      setInstaCopied(true);
      setTimeout(() => setInstaCopied(false), 3000);
    });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: '#00e0e0', cursor: 'pointer', padding: '4px' }}>
          <IconBack />
        </button>
        <span style={{ fontSize: '16px', fontWeight: 700, flex: 1 }}>公開プロフィール</span>
        <span style={{ fontSize: '10px', color: '#445566', background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          👁 公開中
        </span>
      </div>

      <div style={{ padding: '0 16px 100px' }}>

        {/* Hero card */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 60%, #0a1628 100%)',
          borderRadius: '16px', padding: '24px', marginBottom: '12px',
          border: '1px solid rgba(0,224,224,0.15)', position: 'relative', overflow: 'hidden',
        }}>
          {/* BG glow */}
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,224,224,0.08), transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: MY_PROFILE.avatarColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 900, color: '#fff',
              boxShadow: '0 0 20px rgba(0,224,224,0.3)',
              flexShrink: 0,
            }}>{MY_PROFILE.initial}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#f0f8ff', letterSpacing: '-0.5px' }}>
                {MY_PROFILE.name}
              </div>
              <div style={{ fontSize: '11px', color: '#00e0e0', fontWeight: 700, marginBottom: '6px' }}>
                LV.{MY_PROFILE.level} トレーナー
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(MY_PROFILE.levelXp / MY_PROFILE.levelXpMax) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #00e0e0, #a064ff)',
                  borderRadius: '2px',
                }} />
              </div>
              <div style={{ fontSize: '9px', color: '#445566', marginTop: '2px' }}>
                {MY_PROFILE.levelXp} / {MY_PROFILE.levelXpMax} XP
              </div>
            </div>
          </div>

          {/* 推しショップ */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', padding: '5px 12px', marginBottom: '12px',
            fontSize: '12px', color: '#8899aa',
          }}>
            <span style={{ fontSize: '14px' }}>🏪</span>
            <span style={{ fontWeight: 700, color: '#a0b8c8' }}>{MY_PROFILE.favoriteShop}</span>
          </div>

          {/* TCG badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {MY_TCG_IDS.map(id => {
              const g = TCG_GAMES.find(g => g.id === id);
              if (!g) return null;
              return (
                <div key={id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: `${g.color}18`,
                  border: `1px solid ${g.color}45`,
                  borderRadius: '20px', padding: '5px 12px',
                  fontSize: '12px', fontWeight: 700, color: g.color,
                }}>
                  <span style={{ fontSize: '14px' }}>{g.emoji}</span>{g.short}
                </div>
              );
            })}
          </div>

          {/* Follow stats */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#e0e8f0' }}>{MY_PROFILE.following}</div>
              <div style={{ fontSize: '10px', color: '#556677' }}>フォロー</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#e0e8f0' }}>{MY_PROFILE.followers}</div>
              <div style={{ fontSize: '10px', color: '#556677' }}>フォロワー</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#a064ff' }}>{MY_PROFILE.recentDeck}</div>
              <div style={{ fontSize: '10px', color: '#556677' }}>使用デッキ</div>
            </div>
          </div>

          {/* Season toggle */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px',
            padding: '3px', marginBottom: '16px',
          }}>
            {(['lifetime', 'season'] as const).map(s => (
              <button key={s} onClick={() => setSeason(s)} style={{
                flex: 1, padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: season === s ? 'rgba(0,224,224,0.15)' : 'transparent',
                color: season === s ? '#00e0e0' : '#556677',
                fontSize: '11px', fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.2s',
              }}>
                {s === 'lifetime' ? 'Lifetime' : `Season ${MY_PROFILE.season.label}`}
              </button>
            ))}
          </div>

          {/* Stats grid */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            {[
              { label: '大会参加', value: stats.events, unit: '回', color: '#00e0e0' },
              { label: '勝利数', value: stats.wins, unit: '勝', color: '#00c878' },
              { label: '優勝数', value: stats.championships, unit: '回', color: '#ffc800' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
                padding: '10px 6px', textAlign: 'center',
                border: `1px solid ${s.color}22`,
              }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '9px', color: '#556677', marginTop: '2px' }}>{s.unit}</div>
                <div style={{ fontSize: '9px', color: '#445566', marginTop: '1px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Rankings */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { label: '全国ランク', value: stats.rankNational, color: '#ffc800', icon: '🗾' },
              { label: 'エリアランク', value: stats.rankArea, color: '#a064ff', icon: '📍' },
            ].map((r, i) => (
              <div key={i} style={{
                flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
                padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px',
                border: `1px solid ${r.color}22`,
              }}>
                <span style={{ fontSize: '16px' }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: '9px', color: '#556677' }}>{r.label}</div>
                  <div style={{ fontSize: '17px', fontWeight: 900, color: r.color, lineHeight: 1 }}>
                    #{r.value}<span style={{ fontSize: '10px', fontWeight: 400, color: '#445566' }}>位</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#c0d0e0', marginBottom: '10px' }}>
            バッジ
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {BADGES.map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'rgba(255,255,255,0.04)', borderRadius: '20px',
                padding: '5px 10px', border: `1px solid ${b.color}33`,
              }}>
                <span style={{ fontSize: '13px' }}>{b.icon}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: b.color }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent results */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <IconTrophy />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#c0d0e0' }}>最近の大会結果</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {MOCK_HISTORY.map(h => (
              <div key={h.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 10px', background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  fontSize: '13px', fontWeight: 800, color: placementColor(h.placement),
                  minWidth: '52px', textAlign: 'center',
                }}>{h.placement.split('/')[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#d0d8e0' }}>{h.eventName}</div>
                  <div style={{ fontSize: '10px', color: '#556677', marginTop: '1px' }}>
                    {h.date} · {h.deckName}
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#8899aa', fontWeight: 600 }}>{h.result}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Share section */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '12px', color: '#445566', textAlign: 'center', marginBottom: '8px' }}>
            プロフィールをシェア
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            {/* X */}
            <a
              href={xUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, padding: '12px 8px', borderRadius: '12px',
                background: '#1a1a2e',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#e0e8f0', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', textDecoration: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 900 }}>𝕏</span> Xに投稿
            </a>

            {/* Instagram */}
            <button
              onClick={handleInstaShare}
              style={{
                flex: 1, padding: '12px 8px', borderRadius: '12px',
                background: instaCopied
                  ? 'rgba(0,200,120,0.15)'
                  : 'linear-gradient(135deg, rgba(131,58,180,0.25), rgba(253,29,29,0.15), rgba(252,176,69,0.15))',
                border: instaCopied
                  ? '1px solid rgba(0,200,120,0.4)'
                  : '1px solid rgba(200,80,150,0.35)',
                color: instaCopied ? '#00c878' : '#e8a0c0',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              {instaCopied ? (
                <><span>✓</span> コピー済み</>
              ) : (
                <><InstaIcon /> インスタ用</>
              )}
            </button>
          </div>

          {instaCopied && (
            <div style={{
              background: 'rgba(0,200,120,0.08)', border: '1px solid rgba(0,200,120,0.2)',
              borderRadius: '10px', padding: '10px 14px',
              fontSize: '11px', color: '#00c878', textAlign: 'center', lineHeight: 1.6,
            }}>
              キャプションをコピーしました 📋<br />
              <span style={{ color: '#445566' }}>インスタの投稿作成画面に貼り付けてください</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

/* ─── Instagram Icon ─── */
const InstaIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig)" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="5" stroke="url(#ig2)" strokeWidth="2" fill="none"/>
    <circle cx="17.5" cy="6.5" r="1.5" fill="#e8a0c0"/>
    <defs>
      <linearGradient id="ig" x1="2" y1="22" x2="22" y2="2">
        <stop offset="0%" stopColor="#fcb045"/>
        <stop offset="50%" stopColor="#fd1d1d"/>
        <stop offset="100%" stopColor="#833ab4"/>
      </linearGradient>
      <linearGradient id="ig2" x1="7" y1="17" x2="17" y2="7">
        <stop offset="0%" stopColor="#fcb045"/>
        <stop offset="100%" stopColor="#833ab4"/>
      </linearGradient>
    </defs>
  </svg>
);
