import React, { useState } from 'react';
import type { ViewId, HistoryEntry } from '../types';
import { MOCK_HISTORY } from '../data/mockData';
import { IconBack, IconClock, IconPin, IconTrophy, IconChevDown, IconChevUp } from '../components/Icons';
import { Tag, SectionHeader } from '../components/Shared';

/* ─── BattleInstaIcon ─── */
const BattleInstaIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#big)" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="5" stroke="url(#big2)" strokeWidth="2" fill="none"/>
    <circle cx="17.5" cy="6.5" r="1.5" fill="#e8a0c0"/>
    <defs>
      <linearGradient id="big" x1="2" y1="22" x2="22" y2="2">
        <stop offset="0%" stopColor="#fcb045"/>
        <stop offset="50%" stopColor="#fd1d1d"/>
        <stop offset="100%" stopColor="#833ab4"/>
      </linearGradient>
      <linearGradient id="big2" x1="7" y1="17" x2="17" y2="7">
        <stop offset="0%" stopColor="#fcb045"/>
        <stop offset="100%" stopColor="#833ab4"/>
      </linearGradient>
    </defs>
  </svg>
);

/* ─── ShareModal ─── */
interface ShareModalProps {
  history: HistoryEntry;
  onClose: () => void;
}

const placementColor = (p: string) => {
  if (p.startsWith('優勝') || p.startsWith('1位')) return '#ffc800';
  if (p.startsWith('準優勝') || p.startsWith('2位')) return '#c0c8d8';
  if (p.startsWith('3位')) return '#c08040';
  return '#8899aa';
};

const ShareModal: React.FC<ShareModalProps> = ({ history, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [instaCopied, setInstaCopied] = useState(false);
  const pColor = placementColor(history.placement);

  const shareText = `【大会結果】\n${history.eventName}\n${history.placement}（${history.result}）\n使用デッキ: ${history.deckName}\n\n#TCGマイスターアドバンス #ポケカ`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  const instaCaption = `🏆 大会結果報告 🏆\n\n📅 ${history.eventName}\n⚔️ ${history.placement}（${history.result}）\n🃏 使用デッキ: ${history.deckName}\n.\n.\n#TCGマイスターアドバンス #ポケカ #ポケモンカード #TCG #カードゲーム #ポケカ好きと繋がりたい`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleInstaShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: '大会結果', text: instaCaption });
        return;
      } catch { /* cancelled */ }
    }
    navigator.clipboard.writeText(instaCaption).then(() => {
      setInstaCopied(true);
      setTimeout(() => setInstaCopied(false), 3000);
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: '24px',
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '360px' }}>
        {/* Result card (share image preview) */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)',
          border: '1px solid rgba(0,224,224,0.2)',
          borderRadius: '16px', padding: '24px',
          marginBottom: '12px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 160, height: 160, borderRadius: '50%',
            background: `radial-gradient(circle, ${pColor}22, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* App header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
            <div style={{
              fontSize: '10px', fontWeight: 800, letterSpacing: '1px',
              color: '#00e0e0', opacity: 0.8,
            }}>
              ⚡ TCGマイスターアドバンス
            </div>
          </div>

          {/* Player */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#445566', marginBottom: '2px' }}>PLAYER</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#e0e8f0' }}>シロ</div>
            <div style={{ fontSize: '11px', color: '#00e0e0' }}>LV.12</div>
          </div>

          {/* Event */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#445566', marginBottom: '2px' }}>EVENT</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#c0d0e0' }}>{history.eventName}</div>
            <div style={{ fontSize: '11px', color: '#556677' }}>{history.date}</div>
          </div>

          {/* Result */}
          <div style={{
            background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
            padding: '14px 16px', marginBottom: '16px',
            border: `1px solid ${pColor}33`,
          }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: pColor, marginBottom: '4px' }}>
              {history.placement}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#b0c0d0' }}>{history.result}</div>
            <div style={{ fontSize: '11px', color: '#556677', marginTop: '2px' }}>
              使用デッキ: {history.deckName}
            </div>
          </div>

          {/* Tag */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#334455' }}>#TCGマイスターアドバンス</span>
            <span style={{ fontSize: '11px', color: '#334455' }}>#ポケカ</span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          {/* X */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, padding: '12px 6px', borderRadius: '10px',
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#e0e8f0', fontSize: '12px', fontWeight: 700,
              cursor: 'pointer', textAlign: 'center', textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 900 }}>𝕏</span> Xに投稿
          </a>

          {/* Instagram */}
          <button
            onClick={handleInstaShare}
            style={{
              flex: 1, padding: '12px 6px', borderRadius: '10px',
              background: instaCopied
                ? 'rgba(0,200,120,0.15)'
                : 'linear-gradient(135deg, rgba(131,58,180,0.25), rgba(253,29,29,0.15), rgba(252,176,69,0.15))',
              border: instaCopied
                ? '1px solid rgba(0,200,120,0.4)'
                : '1px solid rgba(200,80,150,0.3)',
              color: instaCopied ? '#00c878' : '#e8a0c0',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              transition: 'all 0.2s',
            }}
          >
            <BattleInstaIcon /> {instaCopied ? 'コピー済！' : 'インスタ用'}
          </button>
        </div>

        {/* Copy text (full width) */}
        <div style={{ marginBottom: instaCopied ? '8px' : '0' }}>
          <button
            onClick={handleCopy}
            style={{
              width: '100%', padding: '10px', borderRadius: '10px',
              background: copied ? 'rgba(0,200,120,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${copied ? 'rgba(0,200,120,0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: copied ? '#00c878' : '#778899',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {copied ? '✓ Xテキストをコピー済み' : 'テキストをコピー（X用）'}
          </button>
        </div>

        {instaCopied && (
          <div style={{
            background: 'rgba(0,200,120,0.08)', border: '1px solid rgba(0,200,120,0.2)',
            borderRadius: '10px', padding: '8px 12px',
            fontSize: '11px', color: '#00c878', textAlign: 'center', lineHeight: 1.6,
          }}>
            インスタ用キャプションをコピーしました 📋<br />
            <span style={{ color: '#445566' }}>投稿作成画面に貼り付けてください</span>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%', marginTop: '8px', padding: '10px',
            background: 'none', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', color: '#556677', fontSize: '12px',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

/* ─── BattleMain ─── */
const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const MINI_RANKING = {
  national: [
    { rank: 1,  name: 'ヒカリ', initial: 'ヒ', color: '#9040b0', championships: 11, wins: 56 },
    { rank: 2,  name: 'カスミ', initial: 'カ', color: '#4080d0', championships: 7,  wins: 36 },
    { rank: 3,  name: 'タケシ', initial: 'タ', color: '#c04040', championships: 4,  wins: 28 },
    { rank: 4,  name: 'マサト', initial: 'マ', color: '#206080', championships: 3,  wins: 42 },
    { rank: 5,  name: 'アカネ', initial: 'ア', color: '#c06080', championships: 3,  wins: 30 },
  ],
  area: [
    { rank: 1,  name: 'カスミ', initial: 'カ', color: '#4080d0', championships: 4,  wins: 20 },
    { rank: 2,  name: 'ヒカリ', initial: 'ヒ', color: '#9040b0', championships: 3,  wins: 18 },
    { rank: 3,  name: 'イブキ', initial: 'イ', color: '#4060c0', championships: 2,  wins: 22 },
    { rank: 4,  name: 'カンナ', initial: 'カ', color: '#8040c0', championships: 2,  wins: 19 },
    { rank: 5,  name: 'タケシ', initial: 'タ', color: '#c04040', championships: 2,  wins: 15 },
  ],
};
const MY_RANK = { national: 12, area: 12 };

interface BattleMainProps {
  nav: (view: ViewId, data?: any) => void;
}

export const BattleMain: React.FC<BattleMainProps> = ({ nav }) => {
  const [scope, setScope] = useState<'national' | 'area'>('national');
  const list = MINI_RANKING[scope];
  const myRank = MY_RANK[scope];

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 16px', background: 'linear-gradient(135deg, #ffc800, #ff8000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>戦績</h1>

      {/* ── Ranking section ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,200,0,0.07), rgba(20,10,0,0.5))',
        border: '1px solid rgba(255,200,0,0.18)',
        borderRadius: '14px', padding: '14px', marginBottom: '20px',
      }}>
        {/* Section title + scope toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffc800' }}>🏆 ランキング</span>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
            {(['national', 'area'] as const).map((s, i) => (
              <button key={s} onClick={() => setScope(s)} style={{
                padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: scope === s ? 'rgba(255,200,0,0.18)' : 'transparent',
                color: scope === s ? '#ffc800' : '#445566',
                fontSize: '11px', fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.2s',
              }}>{i === 0 ? '🗾 全国' : '📍 エリア'}</button>
            ))}
          </div>
        </div>

        {/* My rank highlight */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(0,224,224,0.07)', border: '1px solid rgba(0,224,224,0.2)',
          borderRadius: '10px', padding: '10px 12px', marginBottom: '10px',
        }}>
          <div style={{ fontSize: '11px', color: '#445566', width: '28px', textAlign: 'center' }}>#{myRank}</div>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: '#00a0a0', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: '#fff',
            boxShadow: '0 0 8px rgba(0,224,224,0.3)',
          }}>シ</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#00e0e0' }}>シロ</span>
              <span style={{ fontSize: '9px', color: '#00e0e0', background: 'rgba(0,224,224,0.12)', border: '1px solid rgba(0,224,224,0.25)', borderRadius: '4px', padding: '1px 4px' }}>YOU</span>
            </div>
            <div style={{ fontSize: '10px', color: '#445566' }}>LV.12</div>
          </div>
          <div style={{ fontSize: '10px', color: '#556677', textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffc800' }}>3</div>
            <div style={{ fontSize: '9px' }}>優勝</div>
          </div>
        </div>

        {/* Top 5 list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
          {list.map(p => (
            <div key={p.rank} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '7px 10px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ width: '24px', textAlign: 'center', flexShrink: 0 }}>
                {RANK_MEDAL[p.rank]
                  ? <span style={{ fontSize: '16px' }}>{RANK_MEDAL[p.rank]}</span>
                  : <span style={{ fontSize: '12px', fontWeight: 800, color: '#a0b8d0' }}>{p.rank}</span>}
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: p.color, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: '#fff',
              }}>{p.initial}</div>
              <div style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: '#e0e8f0' }}>{p.name}</div>
              <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#ffc800' }}>{p.championships}</div>
                  <div style={{ fontSize: '8px', color: '#445566' }}>優勝</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#00c878' }}>{p.wins}</div>
                  <div style={{ fontSize: '8px', color: '#445566' }}>勝利</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* See full ranking */}
        <button
          onClick={() => nav('ranking')}
          style={{
            width: '100%', padding: '8px', borderRadius: '8px', cursor: 'pointer',
            background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.2)',
            color: '#ffc800', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
          }}
        >
          ランキング全員みる →
        </button>
      </div>

      {/* ── History section ── */}
      <SectionHeader title="大会参加履歴" count={MOCK_HISTORY.length} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {MOCK_HISTORY.map(h => (
          <div key={h.id} onClick={() => nav('history-detail', h)} style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px',
            border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f0f0f0' }}>{h.eventName}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffc800' }}>{h.placement}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#8899aa', flexWrap: 'wrap' }}>
              <span>{h.date}</span><span>{h.result}</span>
              <span style={{ color: '#a064ff' }}>デッキ: {h.deckName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── HistoryDetailPage ─── */
interface HistoryDetailProps {
  history: HistoryEntry | null;
  goBack: () => void;
}

export const HistoryDetailPage: React.FC<HistoryDetailProps> = ({ history, goBack }) => {
  const [showCards, setShowCards] = useState(false);
  const [showShare, setShowShare] = useState(false);
  if (!history) return null;

  return (
    <div>
      {showShare && <ShareModal history={history} onClose={() => setShowShare(false)} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: '#00e0e0', cursor: 'pointer', padding: '4px' }}><IconBack /></button>
        <span style={{ fontSize: '16px', fontWeight: 700, flex: 1 }}>大会詳細</span>
        <button
          onClick={() => setShowShare(true)}
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px', padding: '5px 14px', cursor: 'pointer',
            color: '#c0d0e0', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}
        >
          <span>𝕏</span> シェア
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 8px', color: '#f0f0f0' }}>{history.eventName}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#8899aa' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><IconClock /> {history.date}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><IconPin /> {history.venue}</div>
            <div style={{ color: '#ffc800', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}><IconTrophy /> {history.placement} ({history.result})</div>
          </div>
        </div>
        <div style={{ background: 'rgba(160,100,255,0.08)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(160,100,255,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#a064ff' }}>使用デッキリスト</div>
            <Tag color="purple">スナップショット</Tag>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#e0e8f0', marginBottom: '4px' }}>{history.deckSnapshot.name}</div>
          <div style={{ fontSize: '11px', color: '#556677', marginBottom: '8px' }}>※ 大会参加時に保存されたリストです（マイデッキとは独立）</div>
          <button onClick={() => setShowCards(!showCards)} style={{
            padding: '8px 16px', borderRadius: '8px',
            background: 'rgba(160,100,255,0.15)', border: '1px solid rgba(160,100,255,0.3)',
            color: '#a064ff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            {showCards ? '閉じる' : 'デッキリストを表示'} {showCards ? <IconChevUp /> : <IconChevDown />}
          </button>
          {showCards && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {history.deckSnapshot.cardList?.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '12px' }}>
                  <span style={{ color: '#c0d0e0' }}>{c.name}</span>
                  <span style={{ color: '#8899aa' }}>×{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
