import React from 'react';
import type { ViewId, TcgEvent, RegisteredEvent } from '../types';
import { MOCK_REGISTERED, MOCK_RECOMMENDED } from '../data/mockData';
import { IconSearch, IconSparkle } from '../components/Icons';
import { EventCard, SectionHeader } from '../components/Shared';

interface Props {
  nav: (view: ViewId, data?: any) => void;
  checkedIn: Record<string, boolean>;
}

export const EventsMain: React.FC<Props> = ({ nav, checkedIn }) => (
  <div style={{ padding: '16px 16px 110px' }}>
    <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 16px', background: 'linear-gradient(135deg, #00e0e0, #00b0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      イベント
    </h1>

    <SectionHeader title="参加予定" count={MOCK_REGISTERED.length} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
      {MOCK_REGISTERED.map(ev => (
        <EventCard key={ev.id} event={ev} showDeck isRegistered checkedIn={checkedIn[ev.id]}
          onClick={() => nav('detail', ev)} />
      ))}
    </div>

    <SectionHeader
      title="おすすめのイベント"
      icon={<span style={{ color: '#ffc800' }}><IconSparkle /></span>}
      subtitle="過去の参加履歴をもとに近隣のイベントを表示"
    />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {MOCK_RECOMMENDED.map(ev => (
        <EventCard key={ev.id} event={ev} onClick={() => nav('detail', ev)} />
      ))}
    </div>

    {/* Floating search bar */}
    <div style={{
      position: 'fixed', bottom: '70px', left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: '430px', padding: '0 16px 8px', zIndex: 50,
      background: 'linear-gradient(180deg, rgba(10,14,26,0) 0%, rgba(10,14,26,0.95) 40%)',
      pointerEvents: 'none',
    }}>
      <div onClick={() => nav('search')} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(18,24,40,0.97)', borderRadius: '12px',
        padding: '11px 14px', border: '1px solid rgba(0,224,224,0.2)',
        cursor: 'pointer', pointerEvents: 'auto',
        backdropFilter: 'blur(20px)', boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
      }}>
        <IconSearch />
        <span style={{ color: '#556677', fontSize: '14px', flex: 1 }}>イベント名・会場で検索...</span>
      </div>
    </div>
  </div>
);
