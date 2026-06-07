import React, { useState } from 'react';
import type { Match, PenaltyType, Tournament } from '../types';
import { C, PENALTY_META } from '../theme';
import { participant } from '../lib/bracket';
import { clock, remainingMs } from '../lib/format';
import { useStore } from '../store';
import { Button, Icon, ICONS, TextInput } from '../components/ui';

const ControlBlock: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ padding: '12px 0', borderTop: `1px solid ${C.border}` }}>
    <div style={{ fontSize: 11, fontWeight: 800, color: C.textDim, marginBottom: 8 }}>{title}</div>
    {children}
  </div>
);

/** Operation controls for a single match (timer / table / stream / result / penalties). */
export const MatchControls: React.FC<{ m: Match; t: Tournament; now: number }> = ({ m, t, now }) => {
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
      <ControlBlock title="タイマー / 進行">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: over ? C.overtime : live ? C.live : C.textDim, fontVariantNumeric: 'tabular-nums' }}>
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

      <ControlBlock title="卓 / 配信">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextInput value={m.table ?? ''} placeholder="卓番号" onChange={(e) => dispatch({ type: 'SET_TABLE', matchId: m.id, table: e.target.value || null })} style={{ width: 90 }} />
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
                  <button key={side} onClick={() => setWinSide(side)} style={{ flex: 1, padding: '8px', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 12, border: `2px solid ${sel ? C.win : C.border}`, background: sel ? 'rgba(216,30,63,0.1)' : '#f7f9fc', color: sel ? C.win : C.text }}>
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
