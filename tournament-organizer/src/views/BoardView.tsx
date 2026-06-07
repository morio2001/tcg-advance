import React from 'react';
import type { Tournament } from '../types';
import { C } from '../theme';
import { champion, currentRound, maxRound } from '../lib/bracket';
import { useNow, useStore } from '../store';
import { Button, Card, Icon, ICONS } from '../components/ui';
import { Bracket } from './Bracket';
import { ThreadPanel } from './ThreadPanel';

const Stat: React.FC<{ label: string; value: React.ReactNode; color?: string }> = ({ label, value, color = C.text }) => (
  <div style={{ minWidth: 78 }}>
    <div style={{ fontSize: 21, fontWeight: 800, color, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    <div style={{ fontSize: 10.5, color: C.textDim, marginTop: 2 }}>{label}</div>
  </div>
);

const roundName = (mr: number, r: number): string => {
  const fromEnd = mr - r;
  if (fromEnd === 0) return '決勝';
  if (fromEnd === 1) return '準決勝';
  if (fromEnd === 2) return '準々決勝';
  return `${r}回戦`;
};

export const BoardView: React.FC<{ t: Tournament }> = ({ t }) => {
  const now = useNow();
  const { state, dispatch } = useStore();

  const main = t.matches.filter((m) => m.bracket === 'main');
  const mr = maxRound(t);
  const cur = currentRound(t);
  const champ = champion(t);

  const live = main.filter((m) => m.status === 'live' || m.status === 'overtime').length;
  const ready = t.matches.filter((m) => m.status === 'ready').length;
  const realTotal = main.filter((m) => !m.isBye).length;
  const realDone = main.filter((m) => m.status === 'done' && !m.isBye).length;
  const progress = realTotal ? Math.round((realDone / realTotal) * 100) : 0;
  const readyInCur = main.filter((m) => m.round === cur && m.status === 'ready').length;

  return (
    <div>
      {/* summary strip */}
      <Card style={{ padding: '12px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <Stat label="進捗" value={`${progress}%`} color={C.accent} />
          <Stat label="現在" value={champ ? '完了' : roundName(mr, cur)} />
          <Stat label="進行中" value={live} color={C.live} />
          <Stat label="待機中" value={ready} color="#2f6feb" />
          <Stat label="完了" value={`${realDone}/${realTotal}`} />
          <div style={{ flex: 1 }} />
          {champ ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon d={ICONS.trophy} size={18} color={C.warn} />
              <span style={{ fontSize: 14, fontWeight: 800, color: C.warn }}>優勝: {champ.name}</span>
            </div>
          ) : (
            <Button variant="primary" disabled={readyInCur === 0} onClick={() => dispatch({ type: 'START_ROUND', round: cur, at: Date.now() })}>
              <Icon d={ICONS.play} size={13} /> {roundName(mr, cur)}を一斉開始 ({readyInCur})
            </Button>
          )}
        </div>
      </Card>

      {/* board: bracket (left) + thread (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 384px', gap: 14, alignItems: 'start' }}>
        <div style={{ overflow: 'auto', height: 'calc(100vh - 224px)', minHeight: 420, background: '#f4f6fa', border: `1px solid ${C.border}`, borderRadius: 14 }}>
          <Bracket t={t} now={now} onMatchClick={(id) => dispatch({ type: 'SELECT_MATCH', matchId: id })} selectedId={state.selectedMatchId} />
        </div>
        <ThreadPanel t={t} now={now} />
      </div>
    </div>
  );
};
