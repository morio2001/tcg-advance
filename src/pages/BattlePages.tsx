import React, { useState } from 'react';
import type { ViewId, HistoryEntry } from '../types';
import { MOCK_HISTORY } from '../data/mockData';
import { IconBack, IconClock, IconPin, IconTrophy, IconChevDown, IconChevUp } from '../components/Icons';
import { Tag, SectionHeader } from '../components/Shared';

interface BattleMainProps {
  nav: (view: ViewId, data?: any) => void;
}

export const BattleMain: React.FC<BattleMainProps> = ({ nav }) => (
  <div style={{ padding: '16px' }}>
    <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 16px', background: 'linear-gradient(135deg, #ffc800, #ff8000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>戦績</h1>
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

interface HistoryDetailProps {
  history: HistoryEntry | null;
  goBack: () => void;
}

export const HistoryDetailPage: React.FC<HistoryDetailProps> = ({ history, goBack }) => {
  const [showCards, setShowCards] = useState(false);
  if (!history) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: '#00e0e0', cursor: 'pointer', padding: '4px' }}><IconBack /></button>
        <span style={{ fontSize: '16px', fontWeight: 700 }}>大会詳細</span>
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
