import React from 'react';
import type { Match, Participant, Tournament } from '../types';
import { APPEARANCE_META } from '../theme';
import { participant, slotName } from '../lib/bracket';
import { clock, hhmmKanji, remainingMs, totalMs } from '../lib/format';
import { Icon, ICONS } from '../components/ui';

interface Props {
  match: Match;
  t: Tournament;
  now: number;
  onClick?: () => void;
  onGear?: () => void;
  selected?: boolean;
}

const L = {
  cardBg: '#ffffff',
  text: '#1b2330',
  textDim: '#6b7686',
  faint: '#9aa3af',
  border: '#d7dee8',
  divider: '#e7ecf2',
  win: '#d81e3f',
  lose: '#9aa3af',
  tableBg: '#1b2330',
  stream: '#c81d8f',
  timerLive: '#1769d6',
  timerOver: '#e8590c',
  liveFrame: '#1b2330',
  accent: '#1769d6',
};

const Chip: React.FC<{ color: string; bg: string; children: React.ReactNode; dot?: boolean }> = ({ color, bg, children, dot }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 800, color, background: bg, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, animation: 'toBlink 1.1s infinite' }} />}
    {children}
  </span>
);

const AppearanceMark: React.FC<{ p: Participant }> = ({ p }) => {
  const a = APPEARANCE_META[p.appearance];
  return (
    <span title={`アピアランス: ${a.label}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 10, fontWeight: 800, color: a.color, flexShrink: 0 }}>
      👔{a.label}
    </span>
  );
};

const PlayerRow: React.FC<{ m: Match; t: Tournament; side: 'a' | 'b' }> = ({ m, t, side }) => {
  const slot = side === 'a' ? m.slots[0] : m.slots[1];
  const p = participant(t, slot.participantId);
  const decidedReal = m.status === 'done' && !m.isBye;
  const isWinner = m.winner === side;
  const isLoser = decidedReal && !isWinner;
  const score = side === 'a' ? m.scoreA : m.scoreB;
  const nameColor = !p ? L.faint : isWinner ? L.win : isLoser ? L.lose : L.text;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px' }}>
      <span style={{ fontSize: 10, fontWeight: 800, color: L.faint, width: 16, textAlign: 'center', flexShrink: 0 }}>{p ? p.seed : '–'}</span>
      {p?.photo && (
        <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: `center/cover no-repeat url(${p.photo})`, border: `1px solid ${L.border}` }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 13.5, fontWeight: isWinner ? 800 : 600, color: nameColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p ? p.name : slotName(slot, t)}
          </span>
          {p && <AppearanceMark p={p} />}
        </div>
        {p?.deck && (
          <div style={{ fontSize: 10, color: isLoser ? L.faint : L.textDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.deck}</div>
        )}
      </div>
      {decidedReal && <span style={{ fontSize: 17, fontWeight: 800, color: isWinner ? L.win : L.lose, width: 16, textAlign: 'center' }}>{score}</span>}
    </div>
  );
};

export const MatchCard: React.FC<Props> = ({ match: m, t, now, onClick, onGear, selected }) => {
  const rem = remainingMs(m, now);
  const over = m.status === 'overtime' || (m.status === 'live' && rem < 0);
  const live = m.status === 'live' || over;
  const done = m.status === 'done' || m.status === 'void';

  // flag 1: match status (3 states; overtime folds into 対戦中)
  const statusFlag = live
    ? { label: '対戦中', color: over ? L.timerOver : '#0f9d6b', bg: over ? '#fff0e6' : '#e6f6ee', dot: true }
    : done
      ? { label: '終了', color: '#8a93a3', bg: '#eef1f5', dot: false }
      : { label: '試合前', color: '#2f6feb', bg: '#eaf1ff', dot: false };

  const border = live ? `2.5px solid ${over ? L.timerOver : L.liveFrame}` : `1px solid ${L.border}`;

  return (
    <div
      onClick={onClick}
      style={{
        background: L.cardBg,
        border,
        borderRadius: 12,
        padding: live ? 7.5 : 9,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        color: L.text,
        boxShadow: selected ? `0 0 0 3px ${L.accent}` : undefined,
      }}
    >
      {/* row 1: 卓 / 回戦 + 3 flags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
        {m.table && <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', background: L.tableBg, padding: '1px 7px', borderRadius: 5 }}>卓{m.table}</span>}
        <span style={{ fontSize: 11, color: L.textDim, fontWeight: 700, whiteSpace: 'nowrap' }}>{m.label}</span>
        <div style={{ flex: 1 }} />
        <Chip color={statusFlag.color} bg={statusFlag.bg} dot={statusFlag.dot}>{statusFlag.label}</Chip>
        {m.isStream && (
          <Chip color="#fff" bg={L.stream}>
            <Icon d={ICONS.monitor} size={9} color="#fff" />配信
          </Chip>
        )}
        {m.penalties.length > 0 && <Chip color="#b5641a" bg="#fff3e0">⚠{m.penalties.length}</Chip>}
        {onGear && (
          <button
            onClick={(e) => { e.stopPropagation(); onGear(); }}
            title="操作 / ステータス変更"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: '0 1px', color: L.textDim }}
          >
            ⚙
          </button>
        )}
      </div>

      {/* row 2: start time (kanji) / remaining (MM:SS) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '2px 8px 4px', minHeight: 18 }}>
        {m.startedAt && (
          <span style={{ fontSize: 11, color: L.textDim }}>
            開始 <span style={{ fontWeight: 700, color: L.text }}>{hhmmKanji(m.startedAt)}</span>
          </span>
        )}
        {live ? (
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3, marginLeft: 'auto' }}>
            <span style={{ fontSize: 10, color: L.textDim }}>残</span>
            <span style={{ fontSize: 17, fontWeight: 800, color: over ? L.timerOver : L.timerLive, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{clock(rem)}</span>
            {m.extensionMin > 0 && <span style={{ fontSize: 10, color: L.timerOver, fontWeight: 700 }}>+{m.extensionMin}</span>}
          </span>
        ) : done ? (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: L.faint, fontWeight: 700 }}>終了</span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3, marginLeft: 'auto' }}>
            <span style={{ fontSize: 10, color: L.faint }}>予定</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: L.faint, fontVariantNumeric: 'tabular-nums' }}>{clock(totalMs(m))}</span>
          </span>
        )}
      </div>

      {/* rows 3-4: players */}
      <PlayerRow m={m} t={t} side="a" />
      <div style={{ height: 1, background: L.divider, margin: '0 8px' }} />
      <PlayerRow m={m} t={t} side="b" />

      {done && <div style={{ position: 'absolute', inset: 0, background: 'rgba(108,120,138,0.52)', pointerEvents: 'none' }} />}
    </div>
  );
};
