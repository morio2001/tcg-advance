import React, { useState } from 'react';
import type { ActivityEvent, Role, Tournament } from '../types';
import { C, KIND_META } from '../theme';
import { ROLE_COLOR, ROLE_LABEL, ROLES } from '../roles';
import { relTime } from '../lib/format';
import { useStore } from '../store';
import { Button, TextArea } from '../components/ui';

const EventItem: React.FC<{ e: ActivityEvent; t: Tournament; now: number; onOpenMatch: (id: string) => void }> = ({ e, t, now, onOpenMatch }) => {
  const { dispatch } = useStore();
  const kind = KIND_META[e.kind];
  const m = e.matchId ? t.matches.find((x) => x.id === e.matchId) : null;
  return (
    <div style={{ padding: '9px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: kind.color, background: `${kind.color}16`, padding: '1px 7px', borderRadius: 999 }}>{kind.label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: ROLE_COLOR[e.source.role] }}>{e.source.name}</span>
        <span style={{ fontSize: 9, color: C.textFaint }}>{ROLE_LABEL[e.source.role]}</span>
        {e.pinned && <span style={{ fontSize: 9, color: C.accent, fontWeight: 800 }}>📌固定</span>}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: C.textFaint }}>{relTime(e.at, now)}</span>
      </div>
      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{e.body}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
        {m && (
          <button onClick={() => onOpenMatch(m.id)} style={{ background: 'none', border: 'none', padding: 0, color: C.accent, cursor: 'pointer', fontSize: 10.5, fontWeight: 700 }}>
            → {m.table ? `卓${m.table} ` : ''}{m.label}
          </button>
        )}
        {e.audiences && e.audiences.length > 0 && (
          <span style={{ fontSize: 9, color: C.textFaint }}>共有: {e.audiences.map((r) => ROLE_LABEL[r]).join('・')}</span>
        )}
        <div style={{ flex: 1 }} />
        {e.kind === 'announcement' && (
          <button onClick={() => dispatch({ type: 'TOGGLE_PIN', eventId: e.id })} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', fontSize: 10 }}>{e.pinned ? '固定解除' : '固定'}</button>
        )}
        {(e.kind === 'announcement' || e.kind === 'message') && (
          <button onClick={() => dispatch({ type: 'REMOVE_EVENT', eventId: e.id })} style={{ background: 'none', border: 'none', color: C.textFaint, cursor: 'pointer', fontSize: 10 }}>削除</button>
        )}
      </div>
    </div>
  );
};

const SOURCE_FILTERS: (Role | 'all')[] = ['all', 'admin', 'broadcast', 'floor', 'stage'];

const chipStyle = (on: boolean): React.CSSProperties => ({
  padding: '4px 10px',
  borderRadius: 999,
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 700,
  border: `1px solid ${on ? C.accent : C.border}`,
  background: on ? 'rgba(23,105,214,0.1)' : 'transparent',
  color: on ? C.accent : C.textDim,
});

export const ThreadPanel: React.FC<{ t: Tournament; now: number }> = ({ t, now }) => {
  const { state, dispatch } = useStore();
  const matchFilter = state.selectedMatchId;
  const selected = matchFilter ? t.matches.find((m) => m.id === matchFilter) ?? null : null;

  const [srcFilter, setSrcFilter] = useState<Role | 'all'>('all');
  const [mode, setMode] = useState<'message' | 'announce'>('message');
  const [text, setText] = useState('');
  const [aud, setAud] = useState<Role[]>(['floor', 'broadcast', 'stage']);

  const matchOptions = t.matches
    .filter((m) => m.bracket === 'main' || m.bracket === 'third')
    .slice()
    .sort((a, b) => a.round - b.round || a.order - b.order);

  let feed = [...t.events].sort((a, b) => b.at - a.at);
  if (matchFilter) feed = feed.filter((e) => e.matchId === matchFilter);
  else if (srcFilter !== 'all') feed = feed.filter((e) => e.source.role === srcFilter);

  const post = () => {
    const body = text.trim();
    if (!body) return;
    if (mode === 'announce') dispatch({ type: 'ADD_ANNOUNCEMENT', body, audiences: aud });
    else dispatch({ type: 'POST_MESSAGE', matchId: matchFilter, body });
    setText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: '0 1px 2px rgba(16,24,40,0.05)', overflow: 'hidden' }}>
      {/* title */}
      <div style={{ padding: '10px 14px 8px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800 }}>アクティビティ</span>
          <span style={{ fontSize: 11, color: C.textFaint }}>共有ログ</span>
        </div>

        {/* match filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 10.5, color: C.textDim, fontWeight: 700, flexShrink: 0 }}>試合で絞り込み</span>
          <select
            value={matchFilter ?? ''}
            onChange={(e) => dispatch({ type: 'SELECT_MATCH', matchId: e.target.value || null })}
            style={{ flex: 1, minWidth: 0, fontSize: 12, padding: '5px 8px', borderRadius: 8, border: `1px solid ${matchFilter ? C.accent : C.border}`, background: matchFilter ? 'rgba(23,105,214,0.08)' : '#f7f9fc', color: C.text, outline: 'none' }}
          >
            <option value="">すべての試合</option>
            {matchOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.table ? `卓${m.table} / ` : ''}{m.label}
              </option>
            ))}
          </select>
          {matchFilter && (
            <button onClick={() => dispatch({ type: 'SELECT_MATCH', matchId: null })} style={{ ...chipStyle(true), padding: '4px 8px' }}>✕ 解除</button>
          )}
        </div>

        {/* source filter (only when not match-filtered) */}
        {!matchFilter && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {SOURCE_FILTERS.map((s) => (
              <button key={s} onClick={() => setSrcFilter(s)} style={chipStyle(srcFilter === s)}>
                {s === 'all' ? 'すべて' : ROLE_LABEL[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 14px' }}>
        {selected && (
          <div style={{ fontSize: 11, color: C.textDim, padding: '8px 0 2px' }}>
            {selected.table ? `卓${selected.table} ` : ''}{selected.label} のログ
          </div>
        )}
        {feed.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: C.textFaint, fontSize: 12 }}>イベントはありません。</div>}
        {feed.map((e) => (
          <EventItem key={e.id} e={e} t={t} now={now} onOpenMatch={(id) => dispatch({ type: 'SELECT_MATCH', matchId: id })} />
        ))}
      </div>

      {/* composer */}
      <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
          {(['message', 'announce'] as const).map((md) => (
            <button key={md} onClick={() => setMode(md)} style={{ ...chipStyle(mode === md), borderRadius: 999 }}>
              {md === 'message' ? (matchFilter ? 'この試合にコメント' : 'コメント') : 'お知らせ'}
            </button>
          ))}
        </div>
        {mode === 'announce' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, color: C.textDim }}>共有先:</span>
            {ROLES.filter((r) => r !== 'admin').map((r) => {
              const on = aud.includes(r);
              return (
                <button key={r} onClick={() => setAud((p) => (on ? p.filter((x) => x !== r) : [...p, r]))} style={{ padding: '2px 8px', borderRadius: 7, cursor: 'pointer', fontSize: 10, fontWeight: 700, border: `1px solid ${on ? C.accent : C.border}`, background: on ? 'rgba(23,105,214,0.1)' : 'transparent', color: on ? C.accent : C.textDim }}>
                  {ROLE_LABEL[r]}
                </button>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <TextArea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={mode === 'announce' ? '各所へのお知らせ…' : matchFilter ? 'この試合のスレッドに投稿…' : 'コメントを投稿…'} style={{ flex: 1 }} />
          <Button variant="primary" size="sm" onClick={post}>投稿</Button>
        </div>
      </div>
    </div>
  );
};
