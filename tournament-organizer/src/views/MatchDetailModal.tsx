import React, { useState } from 'react';
import type { Match, PenaltyType, Tournament } from '../types';
import { C, PENALTY_META } from '../theme';
import { participant, slotName } from '../lib/bracket';
import { clock, remainingMs } from '../lib/format';
import { useStore } from '../store';
import { Button, Field, Icon, ICONS, Modal, StatusPill, Tag, TextArea, TextInput } from '../components/ui';

interface Props {
  match: Match | null;
  t: Tournament;
  now: number;
  onClose: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode; right?: React.ReactNode }> = ({ title, children, right }) => (
  <div style={{ padding: '14px 18px', borderTop: `1px solid ${C.border}` }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 800, color: C.textDim, letterSpacing: 0.4 }}>{title}</span>
      <div style={{ flex: 1 }} />
      {right}
    </div>
    {children}
  </div>
);

export const MatchDetailModal: React.FC<Props> = ({ match: m, t, now, onClose }) => {
  const { dispatch } = useStore();
  const [winSide, setWinSide] = useState<'a' | 'b' | null>(null);
  const [sa, setSa] = useState(2);
  const [sb, setSb] = useState(0);
  const [penType, setPenType] = useState<PenaltyType>('warning');
  const [penTarget, setPenTarget] = useState<string>('');
  const [penNote, setPenNote] = useState('');

  if (!m) return null;

  const pa = participant(t, m.slots[0].participantId);
  const pb = participant(t, m.slots[1].participantId);
  const canPlay = !!pa && !!pb;
  const rem = remainingMs(m, now);
  const over = m.status === 'overtime' || (m.status === 'live' && rem < 0);

  const submitResult = () => {
    if (!winSide) return;
    dispatch({ type: 'SET_RESULT', matchId: m.id, winner: winSide, scoreA: sa, scoreB: sb });
    onClose();
  };

  const addPenalty = () => {
    dispatch({
      type: 'ADD_PENALTY',
      matchId: m.id,
      penalty: {
        id: `pn_${Date.now().toString(36)}`,
        type: penType,
        participantId: penTarget || null,
        note: penNote.trim(),
        at: Date.now(),
        by: '本部',
      },
    });
    setPenNote('');
  };

  return (
    <Modal open={!!m} onClose={onClose} width={560}>
      {/* header */}
      <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800 }}>{m.label}</span>
            <StatusPill status={m.status} />
            {m.isBye && <Tag color={C.textFaint}>不戦勝</Tag>}
          </div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 3 }}>
            {pa ? pa.name : slotName(m.slots[0], t)} <span style={{ color: C.textFaint }}>vs</span>{' '}
            {pb ? pb.name : slotName(m.slots[1], t)}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <Button variant="subtle" size="sm" onClick={onClose}>
          閉じる
        </Button>
      </div>

      {/* timer */}
      <Section
        title="タイマー / 進行"
        right={
          <span style={{ fontSize: 22, fontWeight: 800, color: over ? C.overtime : m.status === 'live' ? C.live : C.textDim, fontVariantNumeric: 'tabular-nums' }}>
            {clock(m.status === 'live' || over ? rem : (m.durationMin + m.extensionMin) * 60000)}
          </span>
        }
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {m.status !== 'live' && m.status !== 'overtime' && (
            <Button variant="primary" size="sm" disabled={!canPlay} onClick={() => dispatch({ type: 'START_MATCH', matchId: m.id, at: Date.now() })}>
              <Icon d={ICONS.play} size={12} /> 試合開始
            </Button>
          )}
          {(m.status === 'live' || over) && (
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'STOP_MATCH', matchId: m.id })}>
              <Icon d={ICONS.stop} size={12} /> 停止/リセット
            </Button>
          )}
          {[3, 5, 10].map((min) => (
            <Button key={min} variant="warn" size="sm" onClick={() => dispatch({ type: 'ADD_EXTENSION', matchId: m.id, minutes: min })}>
              +{min}分 延長
            </Button>
          ))}
          {m.extensionMin > 0 && <Tag color={C.warn}>延長 計 +{m.extensionMin}分</Tag>}
        </div>
      </Section>

      {/* table & stream */}
      <Section title="卓 / 配信">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: C.textDim }}>卓番号</span>
            <TextInput
              value={m.table ?? ''}
              placeholder="例: 1"
              onChange={(e) => dispatch({ type: 'PATCH_MATCH', matchId: m.id, patch: { table: e.target.value || null } })}
              style={{ width: 80 }}
            />
          </div>
          <Button
            variant={m.isStream ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => dispatch({ type: 'PATCH_MATCH', matchId: m.id, patch: { isStream: !m.isStream } })}
            style={m.isStream ? { background: `linear-gradient(135deg, ${C.stream}, #b54bff)`, color: '#fff' } : undefined}
          >
            <Icon d={ICONS.monitor} size={12} /> {m.isStream ? '配信卓 ON' : '配信卓にする'}
          </Button>
          {m.isStream && (
            <TextInput
              value={m.streamNote ?? ''}
              placeholder="配信メモ (例: メイン配信 第1試合)"
              onChange={(e) => dispatch({ type: 'PATCH_MATCH', matchId: m.id, patch: { streamNote: e.target.value } })}
              style={{ flex: 1, minWidth: 160 }}
            />
          )}
        </div>
      </Section>

      {/* result */}
      <Section title="結果入力">
        {m.status === 'done' && !m.isBye ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Tag color="#ff4d63">
              勝者: {(m.winner === 'a' ? pa : pb)?.name} ({m.scoreA}-{m.scoreB})
            </Tag>
            <Button variant="danger" size="sm" onClick={() => dispatch({ type: 'CLEAR_RESULT', matchId: m.id })}>
              結果を取り消し
            </Button>
          </div>
        ) : canPlay ? (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {(['a', 'b'] as const).map((side) => {
                const p = side === 'a' ? pa : pb;
                const sel = winSide === side;
                return (
                  <button
                    key={side}
                    onClick={() => setWinSide(side)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 13,
                      border: `2px solid ${sel ? '#ff4d63' : C.border}`,
                      background: sel ? 'rgba(255,77,99,0.16)' : 'rgba(0,0,0,0.04)',
                      color: sel ? '#ff4d63' : C.text,
                    }}
                  >
                    {p?.name} 勝利
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: C.textDim }}>スコア (BO{m.bestOf})</span>
              <TextInput type="number" value={sa} onChange={(e) => setSa(Number(e.target.value))} style={{ width: 64 }} />
              <span style={{ color: C.textFaint }}>-</span>
              <TextInput type="number" value={sb} onChange={(e) => setSb(Number(e.target.value))} style={{ width: 64 }} />
            </div>
            <Button variant="primary" disabled={!winSide} onClick={submitResult}>
              結果を確定
            </Button>
          </>
        ) : (
          <div style={{ fontSize: 12, color: C.textFaint }}>両者が確定すると結果を入力できます。</div>
        )}
      </Section>

      {/* penalties */}
      <Section title="ペナルティ履歴" right={<Tag color={C.warn}>{m.penalties.length}件</Tag>}>
        {m.penalties.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {m.penalties.map((p) => {
              const meta = PENALTY_META[p.type];
              const target = participant(t, p.participantId);
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${C.border}` }}>
                  <Tag color={meta.color}>{meta.short}</Tag>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: C.text }}>
                      {target ? target.name : '両者/卓'} — {p.note || meta.label}
                    </div>
                    <div style={{ fontSize: 10, color: C.textFaint }}>{p.by}</div>
                  </div>
                  <button onClick={() => dispatch({ type: 'REMOVE_PENALTY', matchId: m.id, penaltyId: p.id })} style={{ background: 'none', border: 'none', color: C.textFaint, cursor: 'pointer', fontSize: 11 }}>
                    削除
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <Field label="種別">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(Object.keys(PENALTY_META) as PenaltyType[]).map((pt) => (
              <button
                key={pt}
                onClick={() => setPenType(pt)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 700,
                  border: `1px solid ${penType === pt ? PENALTY_META[pt].color : C.border}`,
                  background: penType === pt ? `${PENALTY_META[pt].color}22` : 'transparent',
                  color: penType === pt ? PENALTY_META[pt].color : C.textDim,
                }}
              >
                {PENALTY_META[pt].short}
              </button>
            ))}
          </div>
        </Field>
        <Field label="対象選手">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { id: '', name: '両者 / 卓' },
              ...(pa ? [{ id: pa.id, name: pa.name }] : []),
              ...(pb ? [{ id: pb.id, name: pb.name }] : []),
            ].map((opt) => (
              <button
                key={opt.id || 'both'}
                onClick={() => setPenTarget(opt.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 700,
                  border: `1px solid ${penTarget === opt.id ? C.accent : C.border}`,
                  background: penTarget === opt.id ? 'rgba(23,105,214,0.12)' : 'transparent',
                  color: penTarget === opt.id ? C.accent : C.textDim,
                }}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </Field>
        <Field label="メモ">
          <TextArea rows={2} value={penNote} onChange={(e) => setPenNote(e.target.value)} placeholder="状況・対応内容" />
        </Field>
        <Button variant="warn" size="sm" onClick={addPenalty}>
          <Icon d={ICONS.alert} size={12} /> ペナルティを記録
        </Button>
      </Section>
    </Modal>
  );
};
