import React, { useState } from 'react';
import { IconBack } from '../components/Icons';

const CURRENT_SEASON = '2026-1Q';

/* ─── Mock ranking data ─── */
interface RankPlayer {
  rank: number;
  id: string;
  name: string;
  initial: string;
  color: string;
  level: number;
  championships: number;
  wins: number;
  events: number;
  isMe?: boolean;
}

const NATIONAL_RANKING: RankPlayer[] = [
  { rank: 1,  id: 'u4', name: 'ヒカリ',    initial: 'ヒ', color: '#9040b0', level: 18, championships: 11, wins: 56, events: 89 },
  { rank: 2,  id: 'u2', name: 'カスミ',    initial: 'カ', color: '#4080d0', level: 14, championships: 7,  wins: 36, events: 62 },
  { rank: 3,  id: 'u1', name: 'タケシ',    initial: 'タ', color: '#c04040', level: 10, championships: 4,  wins: 28, events: 45 },
  { rank: 4,  id: 'r1', name: 'マサト',    initial: 'マ', color: '#206080', level: 13, championships: 3,  wins: 42, events: 71 },
  { rank: 5,  id: 'r2', name: 'アカネ',    initial: 'ア', color: '#c06080', level: 11, championships: 3,  wins: 30, events: 53 },
  { rank: 6,  id: 'r3', name: 'イブキ',    initial: 'イ', color: '#4060c0', level: 15, championships: 3,  wins: 44, events: 78 },
  { rank: 7,  id: 'r4', name: 'カンナ',    initial: 'カ', color: '#8040c0', level: 16, championships: 2,  wins: 38, events: 66 },
  { rank: 8,  id: 'r5', name: 'ツツジ',    initial: 'ツ', color: '#c04080', level: 12, championships: 2,  wins: 29, events: 48 },
  { rank: 9,  id: 'u3', name: 'シゲル',    initial: 'シ', color: '#40a040', level: 8,  championships: 2,  wins: 17, events: 31 },
  { rank: 10, id: 'r6', name: 'ジュン',    initial: 'ジ', color: '#a08000', level: 9,  championships: 1,  wins: 22, events: 40 },
  { rank: 11, id: 'r7', name: 'チェレン',  initial: 'チ', color: '#408060', level: 10, championships: 1,  wins: 19, events: 35 },
  { rank: 12, id: 'me', name: 'シロ',      initial: 'シ', color: '#00a0a0', level: 12, championships: 3,  wins: 31, events: 47, isMe: true },
  { rank: 13, id: 'u5', name: 'コトネ',    initial: 'コ', color: '#b06020', level: 7,  championships: 1,  wins: 14, events: 27 },
  { rank: 14, id: 'r8', name: 'ヒジュン',  initial: 'ヒ', color: '#6080b0', level: 8,  championships: 0,  wins: 18, events: 32 },
  { rank: 15, id: 'r9', name: 'コルニ',    initial: 'コ', color: '#e06040', level: 9,  championships: 0,  wins: 15, events: 28 },
];

const AREA_RANKING: RankPlayer[] = [
  { rank: 1,  id: 'u2', name: 'カスミ',    initial: 'カ', color: '#4080d0', level: 14, championships: 4,  wins: 20, events: 30 },
  { rank: 2,  id: 'u4', name: 'ヒカリ',    initial: 'ヒ', color: '#9040b0', level: 18, championships: 3,  wins: 18, events: 25 },
  { rank: 3,  id: 'r3', name: 'イブキ',    initial: 'イ', color: '#4060c0', level: 15, championships: 2,  wins: 22, events: 28 },
  { rank: 4,  id: 'r4', name: 'カンナ',    initial: 'カ', color: '#8040c0', level: 16, championships: 2,  wins: 19, events: 26 },
  { rank: 5,  id: 'u1', name: 'タケシ',    initial: 'タ', color: '#c04040', level: 10, championships: 2,  wins: 15, events: 22 },
  { rank: 6,  id: 'r7', name: 'チェレン',  initial: 'チ', color: '#408060', level: 10, championships: 1,  wins: 14, events: 20 },
  { rank: 7,  id: 'r5', name: 'ツツジ',    initial: 'ツ', color: '#c04080', level: 12, championships: 1,  wins: 13, events: 21 },
  { rank: 8,  id: 'r6', name: 'ジュン',    initial: 'ジ', color: '#a08000', level: 9,  championships: 1,  wins: 12, events: 18 },
  { rank: 9,  id: 'u3', name: 'シゲル',    initial: 'シ', color: '#40a040', level: 8,  championships: 1,  wins: 10, events: 16 },
  { rank: 10, id: 'r9', name: 'コルニ',    initial: 'コ', color: '#e06040', level: 9,  championships: 0,  wins: 11, events: 19 },
  { rank: 11, id: 'u5', name: 'コトネ',    initial: 'コ', color: '#b06020', level: 7,  championships: 0,  wins: 9,  events: 15 },
  { rank: 12, id: 'me', name: 'シロ',      initial: 'シ', color: '#00a0a0', level: 12, championships: 1,  wins: 8,  events: 10, isMe: true },
];

const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

interface Props {
  goBack: () => void;
}

export const RankingPage: React.FC<Props> = ({ goBack }) => {
  const [scope, setScope] = useState<'national' | 'area'>('national');
  const [tab, setTab] = useState<'season' | 'lifetime'>('season');
  const list = scope === 'national' ? NATIONAL_RANKING : AREA_RANKING;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', flexShrink: 0 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: '#00e0e0', cursor: 'pointer', padding: '4px' }}>
          <IconBack />
        </button>
        <span style={{ fontSize: '16px', fontWeight: 800, color: '#ffc800', flex: 1 }}>🏆 ランキング</span>
      </div>

      <div style={{ padding: '0 16px', flexShrink: 0 }}>
        {/* Scope tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '3px', marginBottom: '10px' }}>
          {([['national', '🗾 全国'], ['area', '📍 エリア']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setScope(val)} style={{
              flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: scope === val ? 'rgba(255,200,0,0.15)' : 'transparent',
              color: scope === val ? '#ffc800' : '#556677',
              fontSize: '12px', fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        {/* Season / Lifetime */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          {([['season', `Season ${CURRENT_SEASON}`], ['lifetime', 'Lifetime']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)} style={{
              padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: tab === val ? 'rgba(0,224,224,0.15)' : 'rgba(255,255,255,0.05)',
              color: tab === val ? '#00e0e0' : '#445566',
              fontSize: '11px', fontWeight: 700, fontFamily: 'inherit',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
        {list.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', marginBottom: '6px', borderRadius: '12px',
            background: p.isMe ? 'rgba(0,224,224,0.07)' : 'rgba(255,255,255,0.03)',
            border: p.isMe ? '1px solid rgba(0,224,224,0.25)' : '1px solid rgba(255,255,255,0.06)',
          }}>
            {/* Rank */}
            <div style={{ width: '28px', textAlign: 'center', flexShrink: 0 }}>
              {RANK_MEDAL[p.rank] ? (
                <span style={{ fontSize: '18px' }}>{RANK_MEDAL[p.rank]}</span>
              ) : (
                <span style={{
                  fontSize: '13px', fontWeight: 800,
                  color: p.rank <= 10 ? '#a0b8d0' : '#445566',
                }}>{p.rank}</span>
              )}
            </div>

            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: p.color, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700, color: '#fff',
              boxShadow: p.isMe ? '0 0 10px rgba(0,224,224,0.3)' : 'none',
            }}>{p.initial}</div>

            {/* Name + LV */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: p.isMe ? '#00e0e0' : '#e0e8f0', whiteSpace: 'nowrap' }}>
                  {p.name}
                </span>
                {p.isMe && <span style={{ fontSize: '9px', color: '#00e0e0', background: 'rgba(0,224,224,0.12)', border: '1px solid rgba(0,224,224,0.25)', borderRadius: '4px', padding: '1px 4px' }}>YOU</span>}
              </div>
              <div style={{ fontSize: '10px', color: '#445566' }}>LV.{p.level} · 大会{p.events}回</div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffc800' }}>{p.championships}</div>
                <div style={{ fontSize: '9px', color: '#445566' }}>優勝</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#00c878' }}>{p.wins}</div>
                <div style={{ fontSize: '9px', color: '#445566' }}>勝利</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
