import React from 'react';
import type { Appearance, Tournament } from '../types';
import { APPEARANCE_META, C } from '../theme';
import { useStore } from '../store';
import { Card } from '../components/ui';

const APPEARANCES: Appearance[] = ['ok', 'pending', 'ng'];

export const RosterView: React.FC<{ t: Tournament }> = ({ t }) => {
  const { dispatch } = useStore();
  const players = [...t.participants].sort((a, b) => a.seed - b.seed);

  const counts = players.reduce(
    (acc, p) => ((acc[p.appearance] = (acc[p.appearance] ?? 0) + 1), acc),
    {} as Record<Appearance, number>,
  );

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 15, fontWeight: 800 }}>選手名簿</div>
        <span style={{ fontSize: 12, color: C.textDim }}>{players.length}名</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: C.textDim }}>
          アピアランス: 👔可 {counts.ok ?? 0} ・ 未 {counts.pending ?? 0} ・ 不可 {counts.ng ?? 0}
        </span>
      </div>
      <div style={{ fontSize: 11.5, color: C.textFaint, marginBottom: 12 }}>
        配信に出す前の服装・タトゥー・他社IP衣装などのチェック状態を人単位で管理します（名前末尾の👔に反映）。
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: '#f4f6fa', fontSize: 10.5, color: C.textDim, fontWeight: 700, borderBottom: `1px solid ${C.border}` }}>
          <span style={{ width: 28 }}>#</span>
          <span style={{ flex: 1 }}>選手名</span>
          <span style={{ flex: 1 }}>デッキ</span>
          <span style={{ width: 110 }}>所属</span>
          <span style={{ width: 150, textAlign: 'center' }}>アピアランス</span>
        </div>
        {players.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', borderBottom: '1px solid #e7ecf2' }}>
            <span style={{ width: 28, fontSize: 12, fontWeight: 800, color: C.textFaint }}>{p.seed}</span>
            <input
              value={p.name}
              onChange={(e) => dispatch({ type: 'UPDATE_PARTICIPANT', participantId: p.id, patch: { name: e.target.value } })}
              style={inputCell(C, true)}
            />
            <input
              value={p.deck ?? ''}
              placeholder="—"
              onChange={(e) => dispatch({ type: 'UPDATE_PARTICIPANT', participantId: p.id, patch: { deck: e.target.value } })}
              style={inputCell(C, false)}
            />
            <input
              value={p.affiliation ?? ''}
              placeholder="—"
              onChange={(e) => dispatch({ type: 'UPDATE_PARTICIPANT', participantId: p.id, patch: { affiliation: e.target.value } })}
              style={{ ...inputCell(C, false), width: 110, flex: 'none' }}
            />
            <div style={{ width: 150, display: 'flex', gap: 4, justifyContent: 'center' }}>
              {APPEARANCES.map((a) => {
                const meta = APPEARANCE_META[a];
                const on = p.appearance === a;
                return (
                  <button
                    key={a}
                    onClick={() => dispatch({ type: 'SET_APPEARANCE', participantId: p.id, value: a })}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 7,
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 800,
                      border: `1px solid ${on ? meta.color : C.border}`,
                      background: on ? `${meta.color}1e` : 'transparent',
                      color: on ? meta.color : C.textFaint,
                    }}
                  >
                    👔{meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

const inputCell = (c: typeof C, bold: boolean): React.CSSProperties => ({
  flex: 1,
  minWidth: 0,
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: 6,
  padding: '5px 7px',
  fontSize: 13,
  fontWeight: bold ? 700 : 500,
  color: c.text,
  outline: 'none',
});
