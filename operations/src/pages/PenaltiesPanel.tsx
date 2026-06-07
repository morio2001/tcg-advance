import React, { useState } from 'react';
import type { Tournament } from '../engine/types';
import { PENALTY_LABELS } from '../engine/types';
import { addPenalty, removePenalty } from '../store/actions';
import { PenaltyModal } from '../components/PenaltyModal';
import { Avatar, useLocalStorage } from '../components/ui';

export const PenaltiesPanel: React.FC<{ t: Tournament }> = ({ t }) => {
  const [open, setOpen] = useState(false);
  const [staffName] = useLocalStorage('swiss-ops:staffName', '');
  const byId = new Map(t.players.map((p) => [p.id, p]));

  const severe = (ty: string) => ty === 'match_loss' || ty === 'disqualification';

  return (
    <div className="panel">
      <div className="row" style={{ marginBottom: 12 }}>
        <h3 className="section-title" style={{ margin: 0 }}>ペナルティ履歴</h3>
        <span className="chip warn">{t.penalties.length}件</span>
        <div className="spacer" />
        <button className="btn sm" disabled={t.players.length === 0} onClick={() => setOpen(true)}>＋ 記録する</button>
      </div>

      {t.penalties.length === 0 ? (
        <div className="empty">記録されたペナルティはありません。</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 50 }}>R</th>
              <th>プレイヤー</th>
              <th>種別</th>
              <th>理由</th>
              <th>記録者 / 時刻</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {t.penalties.map((pen) => {
              const p = byId.get(pen.playerId);
              return (
                <tr key={pen.id}>
                  <td className="dim">R{pen.round || '-'}</td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <Avatar player={p} size={24} />
                      <span style={{ fontWeight: 700 }}>{p?.name ?? '不明'}</span>
                    </div>
                  </td>
                  <td><span className={`chip ${severe(pen.type) ? 'lose' : 'warn'}`}>{PENALTY_LABELS[pen.type]}</span></td>
                  <td className="muted" style={{ maxWidth: 280 }}>{pen.reason || '—'}</td>
                  <td className="dim" style={{ fontSize: 12 }}>
                    {pen.staff}<br />
                    {new Date(pen.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="right">
                    <button className="btn ghost sm danger" onClick={() => removePenalty(t.id, pen.id)}>削除</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {open && (
        <PenaltyModal
          players={t.players}
          round={t.currentRound}
          staffName={staffName}
          onSubmit={(input) => { addPenalty(t.id, input); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};
