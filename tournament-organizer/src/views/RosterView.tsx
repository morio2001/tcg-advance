import React, { useRef } from 'react';
import type { Appearance, Participant, Tournament } from '../types';
import { APPEARANCE_META, C } from '../theme';
import { fileToThumbDataUrl } from '../lib/image';
import { useStore } from '../store';
import { Card } from '../components/ui';

const APPEARANCES: Appearance[] = ['ok', 'pending', 'ng'];

const PhotoCell: React.FC<{ p: Participant }> = ({ p }) => {
  const { dispatch } = useStore();
  const ref = useRef<HTMLInputElement>(null);

  const onFile = async (file?: File | null) => {
    if (!file) return;
    try {
      const photo = await fileToThumbDataUrl(file);
      dispatch({ type: 'UPDATE_PARTICIPANT', participantId: p.id, patch: { photo } });
    } catch {
      /* ignore unreadable image */
    }
  };

  return (
    <div style={{ width: 48, flex: 'none', position: 'relative' }}>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files?.[0])} />
      <button
        onClick={() => ref.current?.click()}
        title={p.photo ? '写真を変更' : '写真を登録'}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          cursor: 'pointer',
          overflow: 'hidden',
          padding: 0,
          border: `1px solid ${C.border}`,
          background: p.photo ? `center/cover no-repeat url(${p.photo})` : '#f0f3f8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!p.photo && <span style={{ fontSize: 16, color: C.textFaint }}>＋</span>}
      </button>
      {p.photo && (
        <button
          onClick={() => dispatch({ type: 'UPDATE_PARTICIPANT', participantId: p.id, patch: { photo: '' } })}
          title="写真を削除"
          style={{ position: 'absolute', top: -4, right: 0, width: 16, height: 16, borderRadius: '50%', border: 'none', cursor: 'pointer', background: C.lose, color: '#fff', fontSize: 10, lineHeight: '16px', padding: 0 }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export const RosterView: React.FC<{ t: Tournament }> = ({ t }) => {
  const { dispatch } = useStore();
  const players = [...t.participants].sort((a, b) => a.seed - b.seed);

  const counts = players.reduce(
    (acc, p) => ((acc[p.appearance] = (acc[p.appearance] ?? 0) + 1), acc),
    {} as Record<Appearance, number>,
  );

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 15, fontWeight: 800 }}>選手名簿</div>
        <span style={{ fontSize: 12, color: C.textDim }}>{players.length}名</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: C.textDim }}>
          アピアランス: 👔可 {counts.ok ?? 0} ・ 未 {counts.pending ?? 0} ・ 不可 {counts.ng ?? 0}
        </span>
      </div>
      <div style={{ fontSize: 11.5, color: C.textFaint, marginBottom: 12 }}>
        写真・配信前のアピアランスチェック（服装・タトゥー・他社IP衣装など）を人単位で管理します。写真は端末内に縮小保存されます。
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: '#f4f6fa', fontSize: 10.5, color: C.textDim, fontWeight: 700, borderBottom: `1px solid ${C.border}` }}>
          <span style={{ width: 28 }}>#</span>
          <span style={{ width: 48 }}>写真</span>
          <span style={{ flex: 1 }}>選手名</span>
          <span style={{ flex: 1 }}>デッキ</span>
          <span style={{ width: 110 }}>所属</span>
          <span style={{ width: 150, textAlign: 'center' }}>アピアランス</span>
        </div>
        {players.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', borderBottom: '1px solid #e7ecf2' }}>
            <span style={{ width: 28, fontSize: 12, fontWeight: 800, color: C.textFaint }}>{p.seed}</span>
            <PhotoCell p={p} />
            <input value={p.name} onChange={(e) => dispatch({ type: 'UPDATE_PARTICIPANT', participantId: p.id, patch: { name: e.target.value } })} style={inputCell(true)} />
            <input value={p.deck ?? ''} placeholder="—" onChange={(e) => dispatch({ type: 'UPDATE_PARTICIPANT', participantId: p.id, patch: { deck: e.target.value } })} style={inputCell(false)} />
            <input value={p.affiliation ?? ''} placeholder="—" onChange={(e) => dispatch({ type: 'UPDATE_PARTICIPANT', participantId: p.id, patch: { affiliation: e.target.value } })} style={{ ...inputCell(false), width: 110, flex: 'none' }} />
            <div style={{ width: 150, display: 'flex', gap: 4, justifyContent: 'center' }}>
              {APPEARANCES.map((a) => {
                const meta = APPEARANCE_META[a];
                const on = p.appearance === a;
                return (
                  <button
                    key={a}
                    onClick={() => dispatch({ type: 'SET_APPEARANCE', participantId: p.id, value: a })}
                    style={{ padding: '4px 8px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 800, border: `1px solid ${on ? meta.color : C.border}`, background: on ? `${meta.color}1e` : 'transparent', color: on ? meta.color : C.textFaint }}
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

const inputCell = (bold: boolean): React.CSSProperties => ({
  flex: 1,
  minWidth: 0,
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: 6,
  padding: '5px 7px',
  fontSize: 13,
  fontWeight: bold ? 700 : 500,
  color: C.text,
  outline: 'none',
});
