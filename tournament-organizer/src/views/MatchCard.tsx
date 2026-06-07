import React from 'react';
import type { Match, MatchStatus, Tournament } from '../types';
import { participant, slotName } from '../lib/bracket';
import { clock, remainingMs, totalMs } from '../lib/format';
import { Icon, ICONS } from '../components/ui';

interface Props {
  match: Match;
  t: Tournament;
  now: number;
  onClick?: () => void;
  compact?: boolean;
}

// Light "ops board" card palette. The page stays dark (黒基調); cards are white
// so result reads at a glance: winner = bold red text, loser = grey, no color masks.
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
};

const STATUS_CHIP: Record<MatchStatus, { label: string; color: string; bg: string }> = {
  pending: { label: '未確定', color: '#8a93a3', bg: '#eef1f5' },
  ready: { label: '開始前', color: '#2f6feb', bg: '#eaf1ff' },
  live: { label: '対戦中', color: '#1769d6', bg: '#e7f0ff' },
  overtime: { label: '延長中', color: '#e8590c', bg: '#fff0e6' },
  done: { label: '終了', color: '#8a93a3', bg: '#eef1f5' },
  void: { label: '不戦', color: '#aab2bf', bg: '#f0f2f5' },
};

const PlayerRow: React.FC<{ m: Match; t: Tournament; side: 'a' | 'b' }> = ({ m, t, side }) => {
  const slot = side === 'a' ? m.slots[0] : m.slots[1];
  const p = participant(t, slot.participantId);
  const decided = m.status === 'done' && !m.isBye;
  const isWinner = m.winner === side;
  const isLoser = decided && !isWinner;
  const score = side === 'a' ? m.scoreA : m.scoreB;

  const nameColor = !p ? L.faint : isWinner ? L.win : isLoser ? L.lose : L.text;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px' }}>
      <span style={{ fontSize: 10, fontWeight: 800, color: L.faint, width: 18, textAlign: 'center', flexShrink: 0 }}>
        {p ? p.seed : '–'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: isWinner ? 800 : 600,
            color: nameColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {p ? p.name : slotName(slot, t)}
        </div>
        {p?.deck && (
          <div style={{ fontSize: 10, color: isLoser ? L.faint : L.textDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p.deck}
          </div>
        )}
      </div>
      {decided && (
        <span style={{ fontSize: 17, fontWeight: 800, color: isWinner ? L.win : L.lose, width: 16, textAlign: 'center' }}>
          {score}
        </span>
      )}
    </div>
  );
};

export const MatchCard: React.FC<Props> = ({ match: m, t, now, onClick }) => {
  const rem = remainingMs(m, now);
  const over = m.status === 'overtime' || (m.status === 'live' && rem < 0);
  const live = m.status === 'live' || over;
  const done = m.status === 'done' || m.status === 'void';
  const chip = STATUS_CHIP[over ? 'overtime' : m.status];

  // border: status only (NOT stream). live = bold frame, otherwise normal.
  const border = live
    ? `2.5px solid ${over ? L.timerOver : L.liveFrame}`
    : `1px solid ${L.border}`;

  const showTimer = live || m.status === 'ready' || m.status === 'pending';
  const showFooter = (showTimer && !done) || m.penalties.length > 0;

  return (
    <div
      onClick={onClick}
      style={{
        background: L.cardBg,
        border,
        borderRadius: 12,
        padding: live ? 8.5 : 10,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        color: L.text,
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        {m.table && (
          <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', background: L.tableBg, padding: '2px 8px', borderRadius: 6 }}>
            卓{m.table}
          </span>
        )}
        <span style={{ fontSize: 11, color: L.textDim, fontWeight: 700 }}>{m.label}</span>
        <div style={{ flex: 1 }} />
        {m.isStream && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 800, color: '#fff', background: L.stream, padding: '2px 7px', borderRadius: 999 }}>
            <Icon d={ICONS.monitor} size={10} color="#fff" /> 配信
          </span>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 800, color: chip.color, background: chip.bg, padding: '2px 8px', borderRadius: 999 }}>
          {live && <span style={{ width: 6, height: 6, borderRadius: '50%', background: chip.color, animation: 'toBlink 1.1s infinite' }} />}
          {chip.label}
        </span>
      </div>

      {/* players */}
      <PlayerRow m={m} t={t} side="a" />
      <div style={{ height: 1, background: L.divider, margin: '0 8px' }} />
      <PlayerRow m={m} t={t} side="b" />

      {/* footer: timer (prominent) + penalties */}
      {showFooter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${L.divider}` }}>
          {live ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 18, fontWeight: 800, color: over ? L.timerOver : L.timerLive, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              <Icon d={ICONS.clock} size={15} color={over ? L.timerOver : L.timerLive} />
              {clock(rem)}
              {m.extensionMin > 0 && <span style={{ fontSize: 10, color: L.timerOver, fontWeight: 700 }}>延長+{m.extensionMin}</span>}
            </span>
          ) : !done ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: L.faint, fontVariantNumeric: 'tabular-nums' }}>
              <Icon d={ICONS.clock} size={12} color={L.faint} />
              {clock(totalMs(m))} <span style={{ fontSize: 10 }}>予定</span>
            </span>
          ) : null}
          <div style={{ flex: 1 }} />
          {m.penalties.length > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 800, color: '#b5641a', background: '#fff3e0', padding: '2px 7px', borderRadius: 999 }}>
              <Icon d={ICONS.alert} size={10} color="#b5641a" /> {m.penalties.length}
            </span>
          )}
        </div>
      )}

      {/* done: cover the whole card with a light grey wash */}
      {done && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(108,120,138,0.52)', pointerEvents: 'none' }} />
      )}
    </div>
  );
};
