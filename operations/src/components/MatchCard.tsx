import React from 'react';
import type { Match, Player } from '../engine/types';
import { STATUS_LABELS } from '../engine/types';
import { Avatar, formatClock, useNow } from './ui';

interface Props {
  match: Match;
  p1?: Player;
  p2?: Player;
  matchMinutes: number;
  /** フロアスタッフ操作を表示するか */
  controls?: boolean;
  onStatus?: (status: Match['status']) => void;
  onExtend?: (minutes: number) => void;
  onReport?: () => void;
  onClearResult?: () => void;
  onPenalty?: () => void;
}

const outcomeLabel = (m: Match, p1?: Player, p2?: Player): { text: string; cls: string } => {
  if (m.outcome === 'p1') return { text: `${p1?.name ?? '?'} 勝利`, cls: 'win' };
  if (m.outcome === 'p2') return { text: `${p2?.name ?? '?'} 勝利`, cls: 'win' };
  if (m.outcome === 'draw') return { text: '引き分け', cls: 'draw' };
  return { text: '結果待ち', cls: 'dim' };
};

export const MatchCard: React.FC<Props> = ({
  match, p1, p2, matchMinutes, controls, onStatus, onExtend, onReport, onClearResult, onPenalty,
}) => {
  const now = useNow(1000);
  const isBye = match.p2 === null;

  // 残り時間（開始時刻＋制限＋延長）
  let remainCls = '';
  let clock = '';
  if (!isBye && match.startedAt && match.status !== 'done') {
    const limitMs = (matchMinutes + (match.extensionMinutes ?? 0)) * 60_000;
    const remain = match.startedAt + limitMs - now;
    clock = formatClock(remain);
    if (remain < 0) remainCls = 'over';
    else if (remain < 5 * 60_000) remainCls = 'warn';
  }

  const res = outcomeLabel(match, p1, p2);

  return (
    <div className={`match-card status-${match.status}`}>
      <div className="accent-bar" />
      <div className="row">
        <span className="chip dim" style={{ padding: '2px 8px' }}>
          {isBye ? 'BYE' : `T${match.table}`}
        </span>
        <span className={`chip ${match.status === 'extension' ? 'warn' : match.status === 'done' ? 'win' : 'cyan'}`}>
          {STATUS_LABELS[match.status]}
        </span>
        <div className="spacer" />
        {clock && <span className={`timer ${remainCls}`}>{clock}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="vs-row">
          <Avatar player={p1} size={26} />
          <span className="vs-name" style={{ color: match.outcome === 'p1' ? 'var(--win)' : undefined }}>{p1?.name ?? '?'}</span>
          {p1?.dropped && <span className="chip dim">drop</span>}
          {match.outcome && !isBye && <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{match.p1GameWins}</span>}
        </div>
        {!isBye ? (
          <div className="vs-row">
            <Avatar player={p2} size={26} />
            <span className="vs-name" style={{ color: match.outcome === 'p2' ? 'var(--win)' : undefined }}>{p2?.name ?? '?'}</span>
            {p2?.dropped && <span className="chip dim">drop</span>}
            {match.outcome && <span style={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{match.p2GameWins}</span>}
          </div>
        ) : (
          <div className="dim" style={{ fontSize: 12, paddingLeft: 34 }}>不戦勝（Bye）</div>
        )}
      </div>

      {match.status === 'done' && (
        <div className={`chip ${res.cls}`} style={{ alignSelf: 'flex-start' }}>
          {res.text}{match.reportedBy ? ` ・ 入力: ${match.reportedBy}` : ''}
        </div>
      )}

      {controls && !isBye && (
        <div className="row wrap" style={{ gap: 6, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          {match.status !== 'done' ? (
            <>
              <button className="btn primary sm" onClick={onReport}>結果入力</button>
              {match.status !== 'extension'
                ? <button className="btn sm" onClick={() => onExtend?.(5)}>＋延長5分</button>
                : <button className="btn sm" onClick={() => onExtend?.(5)}>さらに＋5分</button>}
              {match.status === 'pending'
                ? <button className="btn sm" onClick={() => onStatus?.('playing')}>開始</button>
                : null}
            </>
          ) : (
            <button className="btn ghost sm" onClick={onClearResult}>結果を訂正</button>
          )}
          <button className="btn ghost sm" onClick={onPenalty} style={{ color: 'var(--warn)' }}>ペナルティ</button>
        </div>
      )}
    </div>
  );
};
