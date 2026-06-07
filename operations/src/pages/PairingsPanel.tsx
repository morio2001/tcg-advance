import React, { useState } from 'react';
import type { Tournament } from '../engine/types';
import { startNextRound, isRoundComplete, finishTournament, recommendedRounds } from '../store/actions';
import { MatchCard } from '../components/MatchCard';

export const PairingsPanel: React.FC<{ t: Tournament }> = ({ t }) => {
  const byId = React.useMemo(() => new Map(t.players.map((p) => [p.id, p])), [t.players]);
  const [viewRound, setViewRound] = useState<number>(t.currentRound || 1);

  const activeCount = t.players.filter((p) => !p.dropped).length;
  const planned = t.plannedRounds > 0 ? t.plannedRounds : recommendedRounds(activeCount);
  const roundComplete = isRoundComplete(t, t.currentRound);
  const canStart = activeCount >= 2 && (t.currentRound === 0 || roundComplete) && t.status !== 'finished';
  const reachedPlanned = t.currentRound >= planned && planned > 0;

  const shownRound = Math.min(Math.max(1, viewRound), Math.max(1, t.currentRound));
  const matches = t.matches.filter((m) => m.round === shownRound).sort((a, b) => a.table - b.table);

  return (
    <>
      <div className="panel">
        <div className="row wrap" style={{ gap: 10 }}>
          <h3 className="section-title" style={{ margin: 0 }}>対戦表 / ラウンド進行</h3>
          <div className="spacer" />
          <span className="chip dim">アクティブ {activeCount}名</span>
          <span className="chip cyan">予定 {planned} ラウンド</span>
          <span className="chip purple">現在 R{t.currentRound}</span>
        </div>

        <div className="row wrap" style={{ gap: 8, marginTop: 14 }}>
          {t.currentRound === 0 ? (
            <button className="btn primary" disabled={!canStart} onClick={() => { startNextRound(t.id); setViewRound(1); }}>
              ▶ 第1ラウンド開始（組み合わせ生成）
            </button>
          ) : (
            <>
              <button
                className="btn primary"
                disabled={!canStart || reachedPlanned}
                onClick={() => { startNextRound(t.id); setViewRound(t.currentRound + 1); }}
                title={!roundComplete ? '現ラウンドの全結果入力が必要です' : reachedPlanned ? '予定ラウンド数に到達' : ''}
              >
                ▶ 第{t.currentRound + 1}ラウンドを生成
              </button>
              {!roundComplete && <span className="chip warn">現ラウンドに未確定の試合があります</span>}
              {reachedPlanned && t.status !== 'finished' && (
                <button className="btn" onClick={() => finishTournament(t.id)}>大会を終了する</button>
              )}
            </>
          )}
          {t.status === 'finished' && <span className="chip win">大会終了</span>}
        </div>
      </div>

      {t.currentRound > 0 && (
        <div className="panel">
          <div className="tabs" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
            {Array.from({ length: t.currentRound }, (_, i) => i + 1).map((r) => (
              <button key={r} className={`tab ${shownRound === r ? 'active' : ''}`} onClick={() => setViewRound(r)}>
                R{r}
              </button>
            ))}
          </div>
          <div className="board-grid">
            {matches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                p1={byId.get(m.p1)}
                p2={m.p2 ? byId.get(m.p2) : undefined}
                matchMinutes={t.matchMinutes}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};
