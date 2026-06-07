import React from 'react';
import type { Match, Tournament } from '../types';
import { C } from '../theme';
import { maxRound } from '../lib/bracket';
import { MatchCard } from './MatchCard';

interface BracketProps {
  t: Tournament;
  now: number;
  onMatchClick?: (id: string) => void;
  scale?: number; // applied via CSS zoom (1 = admin, 1.25 = monitor, 0.9 = client)
}

const CARD_W = 234;
const TITLE_H = 28;
const GAP_W = 40;

const roundTitle = (mr: number, r: number) => {
  const fromEnd = mr - r;
  if (fromEnd === 0) return '決勝';
  if (fromEnd === 1) return '準決勝';
  if (fromEnd === 2) return '準々決勝';
  return `${r}回戦`;
};

const decided = (m: Match) => m.status === 'done' || m.status === 'void';

// Connector joining two source matches into one next-round match.
// The path of a *decided* (advanced) match is drawn as a 3px line so the
// winner's route up the bracket reads at a glance.
const Connector: React.FC<{ topDone: boolean; bottomDone: boolean }> = ({ topDone, bottomDone }) => {
  const thin = `1.5px solid ${C.border}`;
  const thick = `3px solid ${C.win}`;
  return (
    <div style={{ flex: 1, position: 'relative', minHeight: 1 }}>
      {/* incoming stubs from the two source matches */}
      <div style={{ position: 'absolute', top: '25%', left: 0, width: '50%', borderTop: topDone ? thick : thin }} />
      <div style={{ position: 'absolute', top: '75%', left: 0, width: '50%', borderTop: bottomDone ? thick : thin }} />
      {/* vertical riser, split so each half reflects its source */}
      <div style={{ position: 'absolute', top: '25%', height: '25%', left: '50%', borderLeft: topDone ? thick : thin }} />
      <div style={{ position: 'absolute', top: '50%', height: '25%', left: '50%', borderLeft: bottomDone ? thick : thin }} />
      {/* outgoing line to the next match */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: '50%', borderTop: topDone || bottomDone ? thick : thin }} />
    </div>
  );
};

export const Bracket: React.FC<BracketProps> = ({ t, now, onMatchClick, scale = 1 }) => {
  const mr = maxRound(t);
  const main = t.matches.filter((m) => m.bracket === 'main');
  const third = t.matches.find((m) => m.bracket === 'third');

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
              <div style={{ width: '100%' }}>
                <MatchCard match={m} t={t} now={now} onClick={onMatchClick ? () => onMatchClick(m.id) : undefined} />
              </div>
            </div>
          ))}
        </div>
      </div>,
    );

    if (r < mr) {
      const next = main.filter((m) => m.round === r + 1);
      columns.push(
        <div key={`c${r}`} style={{ display: 'flex', flexDirection: 'column', width: GAP_W, flexShrink: 0, paddingTop: TITLE_H }}>
          {next.map((_, i) => (
            <Connector
              key={i}
              topDone={!!ms[i * 2] && decided(ms[i * 2])}
              bottomDone={!!ms[i * 2 + 1] && decided(ms[i * 2 + 1])}
            />
          ))}
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

  return (
    <div style={outer}>
      {columns}
      {third && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: CARD_W, flexShrink: 0, marginLeft: 24 }}>
          <div style={{ height: TITLE_H, textAlign: 'center', fontSize: 12, fontWeight: 800, color: C.textDim }}>3位決定戦</div>
          <MatchCard match={third} t={t} now={now} onClick={onMatchClick ? () => onMatchClick(third.id) : undefined} />
        </div>
      )}
    </div>
  );
};
