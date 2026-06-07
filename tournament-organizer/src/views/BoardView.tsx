import React, { useState } from 'react';
import type { Tournament } from '../types';
import { C } from '../theme';
import { champion, currentRound, maxRound } from '../lib/bracket';
import { useNow, useStore } from '../store';
import { Button, Icon, ICONS } from '../components/ui';
import { Bracket } from './Bracket';
import { ThreadPanel } from './ThreadPanel';
import { MatchSettingsModal } from './MatchSettingsModal';

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
  const [gearId, setGearId] = useState<string | null>(null);

  const main = t.matches.filter((m) => m.bracket === 'main');
  const mr = maxRound(t);
  const cur = currentRound(t);
  const champ = champion(t);
  const readyInCur = main.filter((m) => m.round === cur && m.status === 'ready').length;
  const gearMatch = gearId ? t.matches.find((m) => m.id === gearId) ?? null : null;

  return (
    <div style={{ height: 'calc(100vh - 104px)', display: 'flex', flexDirection: 'column' }}>
      {/* slim action row (no summary bar) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, minHeight: 30 }}>
        {champ ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: C.warn }}>
            <Icon d={ICONS.trophy} size={15} color={C.warn} /> 優勝: {champ.name}
          </span>
        ) : (
          <Button variant="primary" size="sm" disabled={readyInCur === 0} onClick={() => dispatch({ type: 'START_ROUND', round: cur, at: Date.now() })}>
            <Icon d={ICONS.play} size={12} /> {roundName(mr, cur)}を一斉開始 ({readyInCur})
          </Button>
        )}
        <span style={{ fontSize: 11, color: C.textFaint }}>カードをクリック→ログ絞り込み / ⚙→操作・ステータス変更</span>
      </div>

      {/* board: bracket (left) + activity (right) */}
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 384px', gap: 14 }}>
        <div style={{ overflow: 'auto', height: '100%', background: '#f4f6fa', border: `1px solid ${C.border}`, borderRadius: 14 }}>
          <Bracket
            t={t}
            now={now}
            selectedId={state.selectedMatchId}
            onMatchClick={(id) => dispatch({ type: 'SELECT_MATCH', matchId: state.selectedMatchId === id ? null : id })}
            onMatchGear={(id) => setGearId(id)}
          />
        </div>
        <div style={{ height: '100%' }}>
          <ThreadPanel t={t} now={now} />
        </div>
      </div>

      <MatchSettingsModal match={gearMatch} t={t} now={now} onClose={() => setGearId(null)} />
    </div>
  );
};
