import React, { useState } from 'react';
import type { ActivityEvent, Match, PenaltyType, Role, Tournament } from '../types';
import { C, KIND_META, PENALTY_META } from '../theme';
import { ROLE_COLOR, ROLE_LABEL, ROLES } from '../roles';
import { participant, slotName } from '../lib/bracket';
import { clock, relTime, remainingMs } from '../lib/format';
import { useStore } from '../store';
import { Button, Icon, ICONS, TextArea, TextInput } from '../components/ui';

/* ---------------- match operation controls (shown when a match is selected) ---------------- */

const ControlBlock: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ padding: '10px 0', borderTop: `1px solid ${C.border}` }}>
    <div style={{ fontSize: 11, fontWeight: 800, color: C.textDim, marginBottom: 7 }}>{title}</div>
    {children}
  </div>
);

const MatchControls: React.FC<{ m: Match; t: Tournament; now: number }> = ({ m, t, now }) => {
  const { dispatch } = useStore();
  const pa = participant(t, m.slots[0].participantId);
  const pb = participant(t, m.slots[1].participantId);
  const canPlay = !!pa && !!pb;
  const rem = remainingMs(m, now);
  const over = m.status === 'overtime' || (m.status === 'live' && rem < 0);
  const live = m.status === 'live' || over;

  const [winSide, setWinSide] = useState<'a' | 'b' | null>(null);
  const [sa, setSa] = useState(2);
  const [sb, setSb] = useState(0);
  const [penType, setPenType] = useState<PenaltyType>('warning');
  const [penTarget, setPenTarget] = useState('');
  const [penNote, setPenNote] = useState('');

  const addPenalty = () => {
    dispatch({
      type: 'ADD_PENALTY',
      matchId: m.id,
      penalty: { id: `pn_${Date.now().toString(36)}`, type: penType, participantId: penTarget || null, note: penNote.trim(), at: Date.now(), by: '本部' },
    });
    setPenNote('');
  };

  return (
    <div>
      {/* timer */}
      <ControlBlock title="タイマー / 進行">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: over ? C.overtime : live ? C.live : C.textDim, fontVariantNumeric: 'tabular-nums' }}>
            {clock(live ? rem : (m.durationMin + m.extensionMin) * 60000)}
          </span>
          {m.extensionMin > 0 && <span style={{ fontSize: 11, color: C.overtime, fontWeight: 700 }}>延長 計+{m.extensionMin}分</span>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {!live && (
            <Button variant="primary" size="sm" disabled={!canPlay} onClick={() => dispatch({ type: 'START_MATCH', matchId: m.id, at: Date.now() })}>
              <Icon d={ICONS.play} size={12} /> 開始
            </Button>
          )}
          {live && (
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'STOP_MATCH', matchId: m.id })}>
              <Icon d={ICONS.stop} size={12} /> 停止
            </Button>
          )}
          {[3, 5, 10].map((min) => (
            <Button key={min} variant="warn" size="sm" onClick={() => dispatch({ type: 'ADD_EXTENSION', matchId: m.id, minutes: min })}>
              +{min}分
            </Button>
          ))}
        </div>
      </ControlBlock>

      {/* table / stream */}
      <ControlBlock title="卓 / 配信">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextInput value={m.table ?? ''} placeholder="卓番号" onChange={(e) => dispatch({ type: 'SET_TABLE', matchId: m.id, table: e.target.value || null })} style={{ width: 80 }} />
          <Button
            variant={m.isStream ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => dispatch({ type: 'TOGGLE_STREAM', matchId: m.id })}
            style={m.isStream ? { background: `linear-gradient(135deg, ${C.stream}, #b54bff)`, color: '#fff' } : undefined}
          >
            <Icon d={ICONS.monitor} size={12} /> {m.isStream ? '配信卓 ON' : '配信卓'}
          </Button>
        </div>
        {m.isStream && (
          <TextInput value={m.streamNote ?? ''} placeholder="配信メモ" onChange={(e) => dispatch({ type: 'SET_STREAM_NOTE', matchId: m.id, note: e.target.value })} style={{ marginTop: 6 }} />
        )}
      </ControlBlock>

      {/* result */}
      <ControlBlock title="結果">
        {m.status === 'done' && !m.isBye ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: C.win }}>
              {(m.winner === 'a' ? pa : pb)?.name} 勝利 ({m.scoreA}-{m.scoreB})
            </span>
            <Button variant="danger" size="sm" onClick={() => dispatch({ type: 'CLEAR_RESULT', matchId: m.id })}>取消</Button>
          </div>
        ) : canPlay ? (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {(['a', 'b'] as const).map((side) => {
                const p = side === 'a' ? pa : pb;
                const sel = winSide === side;
                return (
                  <button
                    key={side}
                    onClick={() => setWinSide(side)}
                    style={{ flex: 1, padding: '8px', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 12, border: `2px solid ${sel ? C.win : C.border}`, background: sel ? 'rgba(216,30,63,0.1)' : '#f7f9fc', color: sel ? C.win : C.text }}
                  >
                    {p?.name} 勝利
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: C.textDim }}>スコア</span>
              <TextInput type="number" value={sa} onChange={(e) => setSa(Number(e.target.value))} style={{ width: 56 }} />
              <span style={{ color: C.textFaint }}>-</span>
              <TextInput type="number" value={sb} onChange={(e) => setSb(Number(e.target.value))} style={{ width: 56 }} />
            </div>
            <Button variant="primary" size="sm" disabled={!winSide} onClick={() => winSide && dispatch({ type: 'SET_RESULT', matchId: m.id, winner: winSide, scoreA: sa, scoreB: sb })}>
              結果を確定
            </Button>
          </>
        ) : (
          <div style={{ fontSize: 12, color: C.textFaint }}>両者が確定すると入力できます。</div>
        )}
      </ControlBlock>

      {/* penalties */}
      <ControlBlock title={`ペナルティ (${m.penalties.length})`}>
        {m.penalties.map((p) => {
          const meta = PENALTY_META[p.type];
          const target = participant(t, p.participantId);
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: meta.color }}>{meta.short}</span>
              <span style={{ flex: 1, fontSize: 12 }}>{target ? target.name : '両者'} — {p.note || meta.label}</span>
              <button onClick={() => dispatch({ type: 'REMOVE_PENALTY', matchId: m.id, penaltyId: p.id })} style={{ background: 'none', border: 'none', color: C.textFaint, cursor: 'pointer', fontSize: 11 }}>削除</button>
            </div>
          );
        })}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '8px 0' }}>
          {(Object.keys(PENALTY_META) as PenaltyType[]).map((pt) => (
            <button key={pt} onClick={() => setPenType(pt)} style={{ padding: '4px 9px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700, border: `1px solid ${penType === pt ? PENALTY_META[pt].color : C.border}`, background: penType === pt ? `${PENALTY_META[pt].color}1e` : 'transparent', color: penType === pt ? PENALTY_META[pt].color : C.textDim }}>
              {PENALTY_META[pt].short}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
          {[{ id: '', name: '両者' }, ...(pa ? [{ id: pa.id, name: pa.name }] : []), ...(pb ? [{ id: pb.id, name: pb.name }] : [])].map((opt) => (
            <button key={opt.id || 'both'} onClick={() => setPenTarget(opt.id)} style={{ padding: '4px 9px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700, border: `1px solid ${penTarget === opt.id ? C.accent : C.border}`, background: penTarget === opt.id ? 'rgba(23,105,214,0.1)' : 'transparent', color: penTarget === opt.id ? C.accent : C.textDim }}>
              {opt.name}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <TextInput value={penNote} placeholder="状況メモ" onChange={(e) => setPenNote(e.target.value)} style={{ flex: 1 }} />
          <Button variant="warn" size="sm" onClick={addPenalty}>記録</Button>
        </div>
      </ControlBlock>
    </div>
  );
};

/* ---------------- activity feed ---------------- */

const EventItem: React.FC<{ e: ActivityEvent; t: Tournament; now: number; onOpenMatch: (id: string) => void; editable: boolean }> = ({ e, t, now, onOpenMatch, editable }) => {
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
        {editable && e.kind === 'announcement' && (
          <button onClick={() => dispatch({ type: 'TOGGLE_PIN', eventId: e.id })} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', fontSize: 10 }}>{e.pinned ? '固定解除' : '固定'}</button>
        )}
        {editable && (e.kind === 'announcement' || e.kind === 'message') && (
          <button onClick={() => dispatch({ type: 'REMOVE_EVENT', eventId: e.id })} style={{ background: 'none', border: 'none', color: C.textFaint, cursor: 'pointer', fontSize: 10 }}>削除</button>
        )}
      </div>
    </div>
  );
};

const SOURCE_FILTERS: (Role | 'all')[] = ['all', 'admin', 'broadcast', 'floor', 'stage'];

/* ---------------- main panel ---------------- */

export const ThreadPanel: React.FC<{ t: Tournament; now: number }> = ({ t, now }) => {
  const { state, dispatch } = useStore();
  const selId = state.selectedMatchId;
  const selected = selId ? t.matches.find((m) => m.id === selId) ?? null : null;

  const [srcFilter, setSrcFilter] = useState<Role | 'all'>('all');
  const [mode, setMode] = useState<'message' | 'announce'>('message');
  const [text, setText] = useState('');
  const [aud, setAud] = useState<Role[]>(['floor', 'broadcast', 'stage']);

  const pa = selected ? participant(t, selected.slots[0].participantId) : null;
  const pb = selected ? participant(t, selected.slots[1].participantId) : null;

  let feed = [...t.events].sort((a, b) => b.at - a.at);
  if (selected) feed = feed.filter((e) => e.matchId === selected.id);
  else if (srcFilter !== 'all') feed = feed.filter((e) => e.source.role === srcFilter);

  const post = () => {
    const body = text.trim();
    if (!body) return;
    if (selected) dispatch({ type: 'POST_MESSAGE', matchId: selected.id, body });
    else if (mode === 'announce') dispatch({ type: 'ADD_ANNOUNCEMENT', body, audiences: aud });
    else dispatch({ type: 'POST_MESSAGE', matchId: null, body });
    setText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 224px)', minHeight: 420, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: '0 1px 2px rgba(16,24,40,0.05)' }}>
      {/* header */}
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        {selected ? (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{selected.table ? `卓${selected.table} ` : ''}{selected.label}</div>
              <div style={{ fontSize: 11, color: C.textDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {pa ? pa.name : slotName(selected.slots[0], t)} vs {pb ? pb.name : slotName(selected.slots[1], t)}
              </div>
            </div>
            <Button variant="subtle" size="sm" onClick={() => dispatch({ type: 'SELECT_MATCH', matchId: null })}>
              <Icon d={ICONS.back} size={12} /> 全体へ
            </Button>
          </>
        ) : (
          <>
            <Icon d={ICONS.bullhorn} size={16} color={C.accent} />
            <span style={{ fontSize: 14, fontWeight: 800 }}>アクティビティ</span>
            <span style={{ fontSize: 11, color: C.textFaint }}>全イベントの共有ログ</span>
          </>
        )}
      </div>

      {/* controls when a match is selected */}
      {selected && (
        <div style={{ padding: '0 14px', maxHeight: '48%', overflowY: 'auto', borderBottom: `1px solid ${C.border}` }}>
          <MatchControls key={selected.id} m={selected} t={t} now={now} />
        </div>
      )}

      {/* source filter when global */}
      {!selected && (
        <div style={{ display: 'flex', gap: 5, padding: '8px 14px', flexWrap: 'wrap', borderBottom: `1px solid ${C.border}` }}>
          {SOURCE_FILTERS.map((s) => (
            <button key={s} onClick={() => setSrcFilter(s)} style={{ padding: '4px 10px', borderRadius: 999, cursor: 'pointer', fontSize: 11, fontWeight: 700, border: `1px solid ${srcFilter === s ? C.accent : C.border}`, background: srcFilter === s ? 'rgba(23,105,214,0.1)' : 'transparent', color: srcFilter === s ? C.accent : C.textDim }}>
              {s === 'all' ? 'すべて' : ROLE_LABEL[s]}
            </button>
          ))}
        </div>
      )}

      {/* feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 14px' }}>
        {feed.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: C.textFaint, fontSize: 12 }}>イベントはありません。</div>}
        {feed.map((e) => (
          <EventItem key={e.id} e={e} t={t} now={now} editable onOpenMatch={(id) => dispatch({ type: 'SELECT_MATCH', matchId: id })} />
        ))}
      </div>

      {/* composer */}
      <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}` }}>
        {!selected && (
          <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
            {(['message', 'announce'] as const).map((md) => (
              <button key={md} onClick={() => setMode(md)} style={{ padding: '3px 10px', borderRadius: 999, cursor: 'pointer', fontSize: 11, fontWeight: 700, border: `1px solid ${mode === md ? C.accent : C.border}`, background: mode === md ? 'rgba(23,105,214,0.1)' : 'transparent', color: mode === md ? C.accent : C.textDim }}>
                {md === 'message' ? 'コメント' : 'お知らせ'}
              </button>
            ))}
          </div>
        )}
        {!selected && mode === 'announce' && (
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
          <TextArea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={selected ? 'この試合のスレッドに投稿…' : mode === 'announce' ? '各所へのお知らせ…' : 'コメントを投稿…'}
            style={{ flex: 1 }}
          />
          <Button variant="primary" size="sm" onClick={post}>投稿</Button>
        </div>
      </div>
    </div>
  );
};
