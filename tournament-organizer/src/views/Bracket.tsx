import React from 'react';
import type { Match, Tournament } from '../types';
import { C } from '../theme';
import { maxRound, winnerId } from '../lib/bracket';
import { MatchCard } from './MatchCard';

interface BracketProps {
  t: Tournament;
  now: number;
  onMatchClick?: (id: string) => void;
  onMatchGear?: (id: string) => void;
  selectedId?: string | null;
  scale?: number; // applied via CSS zoom (1 = board, 1.25 = monitor)
}

const CARD_W = 248;
const TITLE_H = 28;
const GAP_W = 40;

const roundTitle = (mr: number, r: number) => {
  const fromEnd = mr - r;
  if (fromEnd === 0) return '決勝';
  if (fromEnd === 1) return '準決勝';
  if (fromEnd === 2) return '準々決勝';
  return `${r}回戦`;
};

// An edge (feeder M -> next match N) is highlighted only when M's winner is also
// N's winner — i.e. the surviving player's route. This traces the champion's path
// up the bracket without lighting up eliminated players.
const Connector: React.FC<{ topBold: boolean; bottomBold: boolean }> = ({ topBold, bottomBold }) => {
  const thin = `1.5px solid ${C.border}`;
  const thick = `3px solid ${C.win}`;
  return (
    <div style={{ flex: 1, position: 'relative', minHeight: 1 }}>
      <div style={{ position: 'absolute', top: '25%', left: 0, width: '50%', borderTop: topBold ? thick : thin }} />
      <div style={{ position: 'absolute', top: '75%', left: 0, width: '50%', borderTop: bottomBold ? thick : thin }} />
      <div style={{ position: 'absolute', top: '25%', height: '25%', left: '50%', borderLeft: topBold ? thick : thin }} />
      <div style={{ position: 'absolute', top: '50%', height: '25%', left: '50%', borderLeft: bottomBold ? thick : thin }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: '50%', borderTop: topBold || bottomBold ? thick : thin }} />
    </div>
  );
};

export const Bracket: React.FC<BracketProps> = ({ t, now, onMatchClick, onMatchGear, selectedId, scale = 1 }) => {
  const mr = maxRound(t);
  const main = t.matches.filter((m) => m.bracket === 'main');
  const third = t.matches.find((m) => m.bracket === 'third');

  const card = (m: Match) => (
    <MatchCard
      match={m}
      t={t}
      now={now}
      selected={selectedId === m.id}
      onClick={onMatchClick ? () => onMatchClick(m.id) : undefined}
      onGear={onMatchGear ? () => onMatchGear(m.id) : undefined}
    />
  );

  const columns: React.ReactNode[] = [];
  for (let r = 1; r <= mr; r++) {
    const ms = main.filter((m) => m.round === r).sort((a, b) => a.order - b.order);
    columns.push(
      <div key={`r${r}`} style={{ display: 'flex', flexDirection: 'column', width: CARD_W, flexShrink: 0 }}>
        <div style={{ height: TITLE_H, textAlign: 'center', fontSize: 12, fontWeight: 800, color: r === mr ? C.win : C.accent, letterSpacing: 1 }}>
          {roundTitle(mr, r)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {ms.map((m) => (
            <div key={m.id} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%' }}>{card(m)}</div>
            </div>
          ))}
          {/* 3rd-place match shares the final's column, placed below it */}
          {r === mr && third && (
            <div style={{ marginTop: 18 }}>
              <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: C.textDim, marginBottom: 6 }}>3位決定戦</div>
              {card(third)}
            </div>
          )}
        </div>
      </div>,
    );

    if (r < mr) {
      const next = main.filter((m) => m.round === r + 1);
      columns.push(
        <div key={`c${r}`} style={{ display: 'flex', flexDirection: 'column', width: GAP_W, flexShrink: 0, paddingTop: TITLE_H }}>
          {next.map((n, i) => {
            const wN = winnerId(n);
            const wTop = ms[i * 2] ? winnerId(ms[i * 2]) : null;
            const wBot = ms[i * 2 + 1] ? winnerId(ms[i * 2 + 1]) : null;
            return (
              <Connector key={i} topBold={wN != null && wTop === wN} bottomBold={wN != null && wBot === wN} />
            );
          })}
        </div>,
      );
    }
  }

  const outer: React.CSSProperties & { zoom?: number } = {
    display: 'inline-flex',
    alignItems: 'stretch',
    padding: 16,
    minWidth: '100%',
  };
  if (scale !== 1) outer.zoom = scale;

  return <div style={outer}>{columns}</div>;
};
