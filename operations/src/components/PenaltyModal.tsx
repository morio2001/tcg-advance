import React, { useState } from 'react';
import type { Player, PenaltyType } from '../engine/types';
import { PENALTY_LABELS } from '../engine/types';
import { Modal, Avatar } from './ui';

interface Props {
  players: Player[];
  /** 事前選択（試合カードから開いた場合の対象者候補） */
  presetPlayerId?: string;
  matchId?: string;
  round: number;
  staffName: string;
  onSubmit: (input: { playerId: string; type: PenaltyType; reason: string; staff: string; matchId?: string; round: number }) => void;
  onClose: () => void;
}

const TYPES: PenaltyType[] = ['caution', 'warning', 'game_loss', 'match_loss', 'disqualification', 'tardiness', 'deck_error', 'slow_play', 'other'];

export const PenaltyModal: React.FC<Props> = ({ players, presetPlayerId, matchId, round, staffName, onSubmit, onClose }) => {
  const [playerId, setPlayerId] = useState(presetPlayerId ?? players[0]?.id ?? '');
  const [type, setType] = useState<PenaltyType>('warning');
  const [reason, setReason] = useState('');

  const player = players.find((p) => p.id === playerId);
  const severe = type === 'match_loss' || type === 'disqualification';

  return (
    <Modal onClose={onClose}>
      <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>ペナルティ記録</h3>

      <label className="dim" style={{ fontSize: 11 }}>対象プレイヤー</label>
      <div className="row" style={{ gap: 8, margin: '6px 0 14px' }}>
        {player && <Avatar player={player} size={28} />}
        <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} style={{ flex: 1 }}>
          {players.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <label className="dim" style={{ fontSize: 11 }}>種別</label>
      <div className="row wrap" style={{ gap: 6, margin: '6px 0 14px' }}>
        {TYPES.map((ty) => (
          <button
            key={ty}
            className={`chip ${type === ty ? (ty === 'match_loss' || ty === 'disqualification' ? 'lose' : 'warn') : 'dim'}`}
            style={{ cursor: 'pointer', background: type === ty ? undefined : 'rgba(255,255,255,0.04)' }}
            onClick={() => setType(ty)}
          >
            {PENALTY_LABELS[ty]}
          </button>
        ))}
      </div>

      <label className="dim" style={{ fontSize: 11 }}>理由・メモ</label>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="例: 制限時間内に山札を切らなかった / 遅刻10分 など"
        style={{ width: '100%', margin: '6px 0 14px', resize: 'vertical' }}
      />

      {severe && (
        <div className="banner" style={{ marginBottom: 14, borderColor: 'rgba(255,90,90,0.35)', background: 'rgba(255,90,90,0.06)', color: 'var(--lose)' }}>
          ⚠ {PENALTY_LABELS[type]} は対戦結果に自動反映されます（相手の勝ち扱い）。
        </div>
      )}

      <div className="row" style={{ gap: 8 }}>
        <button className="btn ghost" onClick={onClose}>キャンセル</button>
        <div className="spacer" />
        <button
          className="btn primary"
          disabled={!playerId}
          onClick={() => onSubmit({ playerId, type, reason, staff: staffName || 'スタッフ', matchId, round })}
        >
          記録する
        </button>
      </div>
    </Modal>
  );
};
