import React, { useState, useEffect, useRef } from 'react';
import type { ViewId } from '../types';
import { MOCK_EVENTS } from '../data/mockData';
import { IconBack, IconSearch, IconChevDown, IconChevUp } from '../components/Icons';
import { EventCard } from '../components/Shared';

interface Props {
  nav: (view: ViewId, data?: any) => void;
  goBack: () => void;
}

const Chips: React.FC<{ items: string[]; value: string; set: (v: string) => void }> = ({ items, value, set }) => (
  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
    {items.map(r => (
      <button key={r} onClick={() => set(r)} style={{
        padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
        border: '1px solid', fontFamily: 'inherit',
        background: value === r ? 'rgba(0,224,224,0.2)' : 'rgba(255,255,255,0.04)',
        color: value === r ? '#00e0e0' : '#8899aa',
        borderColor: value === r ? 'rgba(0,224,224,0.4)' : 'rgba(255,255,255,0.1)',
      }}>{r}</button>
    ))}
  </div>
);

export const EventSearchPage: React.FC<Props> = ({ nav, goBack }) => {
  const [query, setQuery] = useState('');
  const [showAdv, setShowAdv] = useState(false);
  const [reg, setReg] = useState('すべて');
  const [dateR, setDateR] = useState('すべて');
  const [feeF, setFeeF] = useState('すべて');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const filtered = MOCK_EVENTS.filter(ev => {
    if (query && !ev.name.includes(query) && !ev.venue.includes(query) && !ev.address.includes(query)) return false;
    if (reg !== 'すべて' && ev.regulation !== reg) return false;
    if (feeF === '無料' && ev.fee !== '無料') return false;
    if (feeF === '有料' && ev.fee === '無料') return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', flexShrink: 0 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: '#00e0e0', cursor: 'pointer', padding: '4px' }}><IconBack /></button>
        <span style={{ fontSize: '16px', fontWeight: 700 }}>イベント検索</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px' }}>
        <div style={{ fontSize: '11px', color: '#556677', marginBottom: '8px' }}>{filtered.length}件のイベント</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '210px' }}>
          {filtered.map(ev => <EventCard key={ev.id} event={ev} onClick={() => nav('detail', ev)} />)}
          {filtered.length === 0 && <div style={{ textAlign: 'center', color: '#556677', padding: '40px 0', fontSize: '13px' }}>該当するイベントがありません</div>}
        </div>
      </div>
      <div style={{
        position: 'fixed', bottom: '70px', left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '430px',
        background: 'rgba(10,14,26,0.96)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)', padding: '8px 16px', zIndex: 50,
      }}>
        {showAdv && (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.08)', animation: 'slideUp 0.2s ease-out' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', color: '#8899aa', display: 'block', marginBottom: '4px' }}>レギュレーション</label>
              <Chips items={['すべて', 'スタンダード', 'エクストラ', '殿堂']} value={reg} set={setReg} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', color: '#8899aa', display: 'block', marginBottom: '4px' }}>開催日</label>
              <Chips items={['すべて', '今週', '今月', '来月']} value={dateR} set={setDateR} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#8899aa', display: 'block', marginBottom: '4px' }}>参加費</label>
              <Chips items={['すべて', '無料', '有料']} value={feeF} set={setFeeF} />
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <IconSearch />
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="イベント名・会場で検索..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e0e8f0', fontSize: '14px', fontFamily: 'inherit' }} />
        </div>
        <button onClick={() => setShowAdv(!showAdv)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
          width: '100%', padding: '6px', marginTop: '4px',
          background: 'none', border: 'none', color: showAdv ? '#00e0e0' : '#8899aa',
          fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
        }}>
          詳細設定 {showAdv ? <IconChevDown /> : <IconChevUp />}
        </button>
      </div>
    </div>
  );
};
