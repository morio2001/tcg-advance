import React from 'react';
import type { Match, Tournament } from '../types';
import { C } from '../theme';
import { maxRound, participant, slotName } from '../lib/bracket';
import { clock, remainingMs } from '../lib/format';

interface BracketProps {
  t: Tournament;
  now: number;
  onMatchClick?: (id: string) => void;
  scale?: number; // 1 = admin, 1.3 = monitor
}

const roundTitle = (mr: number, r: number) => {
  const fromEnd = mr - r;
  if (fromEnd === 0) return '決勝';
  if (fromEnd === 1) return '準決勝';
  if (fromEnd === 2) return '準々決勝';
  return `${r}回戦`;
};

const PlayerLine: React.FC<{ m: Match; t: Tournament; side: 'a' | 'b'; f: number; showDeck: boolean }> = ({
  m,
  t,
  side,
  f,
  showDeck,
}) => {
  const slot = side === 'a' ? m.slots[0] : m.slots[1];
  const p = participant(t, slot.participantId);
  const isWinner = m.winner === side;
  const isLoser = m.winner !== null && m.winner !== side && !m.isBye;
  const score = side === 'a' ? m.scoreA : m.scoreB;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6 * f,
        padding: `${5 * f}px ${8 * f}px`,
        background: isWinner ? 'rgba(0,214,138,0.14)' : 'transparent',
        opacity: isLoser ? 0.45 : 1,
      }}
    >
      <span style={{ fontSize: 9 * f, fontWeight: 800, color: C.textFaint, width: 14 * f, textAlign: 'center', flexShrink: 0 }}>
        {p ? p.seed : ''}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12 * f,
            fontWeight: isWinner ? 800 : 600,
            color: p ? (isWinner ? C.win : C.text) : C.textFaint,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {p ? p.name : slotName(slot, t)}
        </div>
        {showDeck && p?.deck && (
          <div style={{ fontSize: 9 * f, color: C.textFaint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p.deck}
          </div>
        )}
      </div>
      {m.status === 'done' && !m.isBye && (
        <span style={{ fontSize: 13 * f, fontWeight: 800, color: isWinner ? C.win : C.textFaint, width: 14 * f, textAlign: 'center' }}>
          {score}
        </span>
      )}
    </div>
  );
};

const MatchBox: React.FC<{ m: Match; t: Tournament; now: number; f: number; onClick?: () => void }> = ({
  m,
  t,
  now,
  f,
  onClick,
}) => {
  const rem = remainingMs(m, now);
  const over = m.status === 'overtime' || (m.status === 'live' && rem < 0);
  const live = m.status === 'live' || over;
  const border = live ? (over ? C.overtime : C.live) : m.isStream ? `${C.stream}66` : C.border;
  return (
    <div
      onClick={onClick}
      style={{
        width: 190 * f,
        background: C.panelSolid,
        border: `1.5px solid ${border}`,
        borderRadius: 9 * f,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: live ? `0 0 12px ${over ? C.overtime : C.live}33` : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 * f, padding: `${3 * f}px ${8 * f}px`, background: 'rgba(255,255,255,0.03)' }}>
        {m.table && <span style={{ fontSize: 9 * f, fontWeight: 800, color: C.accent }}>卓{m.table}</span>}
        {m.isStream && <span style={{ fontSize: 9 * f, fontWeight: 800, color: C.stream }}>● 配信</span>}
        <div style={{ flex: 1 }} />
        {live && (
          <span style={{ fontSize: 10 * f, fontWeight: 800, color: over ? C.overtime : C.live, fontVariantNumeric: 'tabular-nums' }}>
            {clock(rem)}
          </span>
        )}
        {m.penalties.length > 0 && <span style={{ fontSize: 9 * f, color: C.warn }}>⚠{m.penalties.length}</span>}
      </div>
      <PlayerLine m={m} t={t} side="a" f={f} showDeck={f >= 1.2} />
      <div style={{ height: 1, background: C.border }} />
      <PlayerLine m={m} t={t} side="b" f={f} showDeck={f >= 1.2} />
    </div>
  );
};

// Connector cell drawing the "]‐" bracket that joins two source matches.
const Connector: React.FC<{ f: number }> = ({ f }) => {
  const line = `${Math.max(1.5, 1.5 * f)}px solid ${C.borderStrong}`;
  return (
    <div style={{ flex: 1, position: 'relative', minHeight: 1 }}>
      <div style={{ position: 'absolute', top: '25%', left: 0, width: '50%', borderTop: line }} />
      <div style={{ position: 'absolute', top: '75%', left: 0, width: '50%', borderTop: line }} />
      <div style={{ position: 'absolute', top: '25%', bottom: '25%', left: '50%', borderLeft: line }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: '50%', borderTop: line }} />
    </div>
  );
};

export const Bracket: React.FC<BracketProps> = ({ t, now, onMatchClick, scale = 1 }) => {
  const f = scale;
  const mr = maxRound(t);
  const main = t.matches.filter((m) => m.bracket === 'main');
  const third = t.matches.find((m) => m.bracket === 'third');

  const columns: React.ReactNode[] = [];
  for (let r = 1; r <= mr; r++) {
    const ms = main.filter((m) => m.round === r).sort((a, b) => a.order - b.order);
    columns.push(
      <div key={`r${r}`} style={{ display: 'flex', flexDirection: 'column', minWidth: 190 * f }}>
        <div style={{ textAlign: 'center', fontSize: 11 * f, fontWeight: 800, color: r === mr ? C.warn : C.accent, marginBottom: 8 * f, letterSpacing: 1 }}>
          {roundTitle(mr, r)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {ms.map((m) => (
            <div key={m.id} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <MatchBox m={m} t={t} now={now} f={f} onClick={onMatchClick ? () => onMatchClick(m.id) : undefined} />
            </div>
          ))}
        </div>
      </div>,
    );

    if (r < mr) {
      const nextCount = main.filter((m) => m.round === r + 1).length;
      columns.push(
        <div key={`c${r}`} style={{ display: 'flex', flexDirection: 'column', width: 34 * f, paddingTop: 27 * f }}>
          {Array.from({ length: nextCount }, (_, i) => (
            <Connector key={i} f={f} />
          ))}
        </div>,
      );
    }
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'stretch', gap: 0, padding: 8 }}>
      {columns}
      {third && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', marginLeft: 24 * f }}>
          <div style={{ textAlign: 'center', fontSize: 11 * f, fontWeight: 800, color: C.textDim, marginBottom: 8 * f }}>3位決定戦</div>
          <MatchBox m={third} t={t} now={now} f={f} onClick={onMatchClick ? () => onMatchClick(third.id) : undefined} />
        </div>
      )}
    </div>
  );
};
