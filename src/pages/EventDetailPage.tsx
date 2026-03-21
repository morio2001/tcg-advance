import React, { useState } from 'react';
import type { ViewId, TcgEvent, RegisteredEvent } from '../types';
import { TODAY, MOCK_REGISTERED, MOCK_MY_DECKS } from '../data/mockData';
import { IconBack, IconClock, IconPin, IconUsers, IconCheck, IconSwords, IconMsg, IconAlert } from '../components/Icons';
import { Tag, REG_COLOR } from '../components/Shared';

interface Props {
  event: TcgEvent | RegisteredEvent | null;
  goBack: () => void;
  doCheckIn: (id: string) => void;
  checkedIn: Record<string, boolean>;
  nav: (view: ViewId, data?: any) => void;
}

export const EventDetailPage: React.FC<Props> = ({ event, goBack, doCheckIn, checkedIn, nav }) => {
  const [showDeckSel, setShowDeckSel] = useState(false);
  const [selDeck, setSelDeck] = useState<string | null>(null);
  if (!event) return null;

  const isReg = MOCK_REGISTERED.some(r => r.id === event.id);
  const today = event.date === TODAY;
  const isCheckedIn = checkedIn[event.id];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: '#00e0e0', cursor: 'pointer', padding: '4px' }}><IconBack /></button>
        <span style={{ fontSize: '16px', fontWeight: 700, flex: 1 }}>イベント詳細</span>
      </div>
      <div style={{ padding: '0 16px 100px' }}>
        {/* Info */}
        <div style={{
          background: today ? 'linear-gradient(135deg, rgba(0,224,224,0.07), rgba(0,160,255,0.04))' : 'rgba(255,255,255,0.04)',
          borderRadius: '12px', padding: '16px',
          border: today ? '1px solid rgba(0,224,224,0.2)' : '1px solid rgba(255,255,255,0.08)', marginBottom: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#f0f0f0', flex: 1 }}>{event.name}</h2>
            {today && <Tag color="orange">本日開催</Tag>}
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {event.tags?.map((t, i) => <Tag key={i} color="cyan">{t}</Tag>)}
            <Tag color={REG_COLOR[event.regulation] ?? 'cyan'}>{event.regulation}</Tag>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#8899aa' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><IconClock /> {event.date} {event.time}</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <span style={{ flexShrink: 0, marginTop: '1px' }}><IconPin /></span>
              <span>{event.venue}<br /><span style={{ color: '#556677' }}>{event.address}</span></span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><IconUsers /> {event.registered}/{event.capacity}人</div>
            <div style={{ fontWeight: 700, color: event.fee === '無料' ? '#00c878' : '#ffc800' }}>参加費: {event.fee}</div>
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#99aabb', lineHeight: 1.6 }}>{event.description}</div>
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#556677' }}>主催: {event.organizer}</div>
        </div>

        {/* Action */}
        {isReg ? (
          <div style={{ marginBottom: '12px' }}>
            {today && !isCheckedIn ? (
              <button onClick={() => doCheckIn(event.id)} style={{
                width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #00c878, #00a060)', color: '#fff',
                fontSize: '15px', fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 20px rgba(0,200,120,0.3)', animation: 'pulse 2s infinite',
              }}>
                <IconCheck /> チェックインする
              </button>
            ) : isCheckedIn ? (
              <button onClick={() => nav('tournament', event)} style={{
                width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #00c0c0, #00a0ff)', color: '#fff',
                fontSize: '15px', fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 20px rgba(0,160,255,0.3)',
              }}>
                <IconSwords /> 大会ページへ進む
              </button>
            ) : (
              <div style={{ background: 'rgba(0,224,224,0.06)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(0,224,224,0.15)', textAlign: 'center' }}>
                <span style={{ color: '#00e0e0', fontWeight: 700, fontSize: '13px' }}>参加登録済み</span>
                <div style={{ fontSize: '11px', color: '#556677', marginTop: '4px' }}>当日にチェックインできます</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: '12px' }}>
            {!showDeckSel ? (
              <button onClick={() => setShowDeckSel(true)} style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #00c0c0, #00a0ff)', color: '#fff',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              }}>参加登録する</button>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(0,224,224,0.2)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: '#00e0e0' }}>使用デッキを選択</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {MOCK_MY_DECKS.map(d => (
                    <button key={d.id} onClick={() => setSelDeck(d.id)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
                      border: '1px solid',
                      background: selDeck === d.id ? 'rgba(0,224,224,0.15)' : 'rgba(255,255,255,0.04)',
                      borderColor: selDeck === d.id ? 'rgba(0,224,224,0.4)' : 'rgba(255,255,255,0.08)',
                      color: '#e0e8f0', fontSize: '13px',
                    }}>
                      <span>{d.name}</span>
                      <span style={{ fontSize: '11px', color: '#556677' }}>{d.cards}/60</span>
                    </button>
                  ))}
                </div>
                <button disabled={!selDeck} style={{
                  width: '100%', padding: '10px', borderRadius: '8px', border: 'none', marginTop: '8px',
                  background: selDeck ? 'linear-gradient(135deg, #00c0c0, #00a0ff)' : 'rgba(255,255,255,0.1)',
                  color: selDeck ? '#fff' : '#556677', fontSize: '13px', fontWeight: 700, cursor: selDeck ? 'pointer' : 'default',
                }}>デッキを登録して参加</button>
                <div style={{ marginTop: '6px', fontSize: '10px', color: '#556677', textAlign: 'center' }}>※ デッキリストは大会用にスナップショット保存されます</div>
              </div>
            )}
          </div>
        )}

        {/* Support */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: '#c0d0e0' }}>お問い合わせ・サポート</div>
          {[
            { icon: <IconMsg />, label: '大会参加前のお問い合わせ', target: event.organizer },
            { icon: <IconAlert />, label: 'ルール・対戦に関する質問', target: 'ジャッジ' },
            { icon: <IconAlert />, label: 'テンポ・進行に関する報告', target: '主催者' },
            { icon: <IconAlert />, label: 'その他のお問い合わせ', target: '運営' },
          ].map((item, i) => (
            <button key={i} style={{
              width: '100%', padding: '10px 12px', borderRadius: '8px', marginBottom: i < 3 ? '6px' : 0,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#e0e8f0', fontSize: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit', textAlign: 'left',
            }}>
              {item.icon} <span style={{ flex: 1 }}>{item.label}</span>
              <span style={{ fontSize: '10px', color: '#556677', whiteSpace: 'nowrap' }}>→ {item.target}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
