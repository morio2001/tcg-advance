import React, { useMemo, useState } from 'react';
import type { Tournament, Match } from '../engine/types';
import { MatchCard } from '../components/MatchCard';
import { ResultModal } from '../components/ResultModal';
import { PenaltyModal } from '../components/PenaltyModal';
import { reportResult, clearResult, setMatchStatus, grantExtension, addPenalty } from '../store/actions';

export const FloorStaffBoard: React.FC<{ t: Tournament; staffName: string }> = ({ t, staffName }) => {
  const byId = useMemo(() => new Map(t.players.map((p) => [p.id, p])), [t.players]);
  const [viewRound, setViewRound] = useState<number>(t.currentRound || 1);
  const [resultFor, setResultFor] = useState<Match | null>(null);
  const [penaltyFor, setPenaltyFor] = useState<{ match?: Match; playerId?: string } | null>(null);

  if (t.currentRound === 0) {
    return <div className="panel empty">まだラウンドが開始されていません。運営がラウンドを生成すると、ここに対戦カードが表示されます。</div>;
  }

  const shownRound = Math.min(Math.max(1, viewRound), t.currentRound);
  const matches = t.matches.filter((m) => m.round === shownRound).sort((a, b) => a.table - b.table);
  const playable = matches.filter((m) => m.p2 !== null);
  const done = playable.filter((m) => m.status === 'done').length;
  const extending = playable.filter((m) => m.status === 'extension').length;

  return (
    <>
      <div className="panel">
        <div className="row wrap" style={{ gap: 10 }}>
          <h3 className="section-title" style={{ margin: 0 }}>フロアスタッフ進行ボード</h3>
          <div className="spacer" />
          <span className="chip cyan">確定 {done}/{playable.length}</span>
          {extending > 0 && <span className="chip warn">延長中 {extending}</span>}
        </div>
        <div className="banner" style={{ marginTop: 12 }}>
          各カードの進行状況・延長・結果はこの端末で入力でき、同じ大会を開いている運営・他スタッフの画面にも即時反映されます（オフライン時はこの端末に保存され、復帰時に同期されます）。
        </div>
        <div className="tabs" style={{ marginTop: 12, flexWrap: 'wrap' }}>
          {Array.from({ length: t.currentRound }, (_, i) => i + 1).map((r) => (
            <button key={r} className={`tab ${shownRound === r ? 'active' : ''}`} onClick={() => setViewRound(r)}>
              R{r}{r === t.currentRound ? '（現在）' : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="board-grid">
          {matches.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              p1={byId.get(m.p1)}
              p2={m.p2 ? byId.get(m.p2) : undefined}
              matchMinutes={t.matchMinutes}
              controls
              onReport={() => setResultFor(m)}
              onClearResult={() => clearResult(t.id, m.id)}
              onStatus={(s) => setMatchStatus(t.id, m.id, s)}
              onExtend={(min) => grantExtension(t.id, m.id, min)}
              onPenalty={() => setPenaltyFor({ match: m, playerId: m.p1 })}
            />
          ))}
        </div>
      </div>

      {resultFor && resultFor.p2 && (
        <ResultModal
          match={resultFor}
          p1={byId.get(resultFor.p1)!}
          p2={byId.get(resultFor.p2)!}
          bestOf={t.bestOf}
          staffName={staffName}
          onSubmit={(input) => { reportResult(t.id, resultFor.id, input); setResultFor(null); }}
          onClose={() => setResultFor(null)}
        />
      )}

      {penaltyFor && (
        <PenaltyModal
          players={penaltyFor.match ? t.players.filter((p) => p.id === penaltyFor.match!.p1 || p.id === penaltyFor.match!.p2) : t.players}
          presetPlayerId={penaltyFor.playerId}
          matchId={penaltyFor.match?.id}
          round={shownRound}
          staffName={staffName}
          onSubmit={(input) => { addPenalty(t.id, input); setPenaltyFor(null); }}
          onClose={() => setPenaltyFor(null)}
        />
      )}
    </>
  );
};
