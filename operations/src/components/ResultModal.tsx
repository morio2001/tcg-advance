import React, { useState } from 'react';
import type { Match, Player, MatchOutcome } from '../engine/types';
import { winsNeeded } from '../engine/types';
import { Modal, Avatar } from './ui';

interface Props {
  match: Match;
  p1: Player;
  p2: Player;
  bestOf: number;
  staffName: string;
  onSubmit: (input: { outcome: MatchOutcome; p1GameWins: number; p2GameWins: number; reportedBy: string }) => void;
  onClose: () => void;
}

export const ResultModal: React.FC<Props> = ({ match, p1, p2, bestOf, staffName, onSubmit, onClose }) => {
  const need = winsNeeded(bestOf);
  const [g1, setG1] = useState(match.p1GameWins);
  const [g2, setG2] = useState(match.p2GameWins);

  // ゲーム数から勝敗を自動判定（BO1 は明示ボタンで）
  const derived: MatchOutcome | null =
    g1 > g2 ? 'p1' : g2 > g1 ? 'p2' : g1 === g2 && g1 + g2 > 0 ? 'draw' : null;
  const [outcome, setOutcome] = useState<MatchOutcome | null>(match.outcome ?? null);
  const finalOutcome = bestOf > 1 ? derived : outcome;

  const Stepper = ({ value, set, max, label, who }: { value: number; set: (n: number) => void; max: number; label: string; who: Player }) => (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div className="row" style={{ justifyContent: 'center', gap: 6, marginBottom: 6 }}>
        <Avatar player={who} size={26} />
        <span style={{ fontWeight: 700, fontSize: 13 }}>{label}</span>
      </div>
      <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
        <button className="btn sm" onClick={() => set(Math.max(0, value - 1))}>−</button>
        <span style={{ fontSize: 28, fontWeight: 800, minWidth: 28, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        <button className="btn sm" onClick={() => set(Math.min(max, value + 1))}>＋</button>
      </div>
    </div>
  );

  return (
    <Modal onClose={onClose}>
      <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>結果入力</h3>
      <div className="dim" style={{ fontSize: 12, marginBottom: 16 }}>
        第{match.round}ラウンド ・ テーブル {match.table}
      </div>

      {bestOf > 1 ? (
        <>
          <div className="dim" style={{ fontSize: 11, marginBottom: 8 }}>取得ゲーム数（{need}本先取）</div>
          <div className="row" style={{ alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <Stepper value={g1} set={setG1} max={bestOf} label={p1.name} who={p1} />
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--dim)', alignSelf: 'center' }}>-</span>
            <Stepper value={g2} set={setG2} max={bestOf} label={p2.name} who={p2} />
          </div>
        </>
      ) : (
        <>
          <div className="dim" style={{ fontSize: 11, marginBottom: 8 }}>勝者を選択</div>
          <div className="row" style={{ gap: 8, marginBottom: 16 }}>
            <button className={`btn block ${outcome === 'p1' ? 'win' : ''}`} onClick={() => setOutcome('p1')}>
              {p1.name} の勝ち
            </button>
            <button className={`btn block ${outcome === 'p2' ? 'win' : ''}`} onClick={() => setOutcome('p2')}>
              {p2.name} の勝ち
            </button>
          </div>
          <button className={`btn block ${outcome === 'draw' ? 'draw' : ''}`} onClick={() => setOutcome('draw')} style={{ marginBottom: 16 }}>
            両者引き分け
          </button>
        </>
      )}

      <div className="banner" style={{ marginBottom: 16 }}>
        結果: {finalOutcome === 'p1' ? `${p1.name} の勝ち` : finalOutcome === 'p2' ? `${p2.name} の勝ち` : finalOutcome === 'draw' ? '引き分け' : '未確定'}
      </div>

      <div className="row" style={{ gap: 8 }}>
        <button className="btn ghost" onClick={onClose}>キャンセル</button>
        <div className="spacer" />
        <button
          className="btn primary"
          disabled={!finalOutcome}
          onClick={() => finalOutcome && onSubmit({ outcome: finalOutcome, p1GameWins: bestOf > 1 ? g1 : finalOutcome === 'p1' ? need : finalOutcome === 'draw' ? Math.max(0, need - 1) : 0, p2GameWins: bestOf > 1 ? g2 : finalOutcome === 'p2' ? need : finalOutcome === 'draw' ? Math.max(0, need - 1) : 0, reportedBy: staffName || 'スタッフ' })}
        >
          確定して送信
        </button>
      </div>
    </Modal>
  );
};
