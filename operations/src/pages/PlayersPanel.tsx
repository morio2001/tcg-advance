import React, { useState } from 'react';
import type { Tournament } from '../engine/types';
import { addPlayer, addPlayersBulk, removePlayer, setPlayerDropped } from '../store/actions';
import { Avatar } from '../components/ui';

export const PlayersPanel: React.FC<{ t: Tournament }> = ({ t }) => {
  const [name, setName] = useState('');
  const [deck, setDeck] = useState('');
  const [bulk, setBulk] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  const started = t.currentRound > 0;
  const active = t.players.filter((p) => !p.dropped);

  const add = () => {
    if (!name.trim()) return;
    addPlayer(t.id, name, deck);
    setName('');
    setDeck('');
  };

  return (
    <div className="panel">
      <div className="row" style={{ marginBottom: 12 }}>
        <h3 className="section-title" style={{ margin: 0 }}>参加者</h3>
        <span className="chip cyan">{active.length}名 受付中</span>
        {t.players.length !== active.length && <span className="chip dim">drop {t.players.length - active.length}</span>}
        <div className="spacer" />
        <button className="btn ghost sm" onClick={() => setShowBulk((v) => !v)}>{showBulk ? '個別入力' : '一括追加'}</button>
      </div>

      {!showBulk ? (
        <div className="row" style={{ gap: 8, marginBottom: 14 }}>
          <input placeholder="プレイヤー名" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} style={{ flex: 2 }} />
          <input placeholder="デッキ名（任意）" value={deck} onChange={(e) => setDeck(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} style={{ flex: 2 }} />
          <button className="btn primary" onClick={add}>追加</button>
        </div>
      ) : (
        <div style={{ marginBottom: 14 }}>
          <textarea
            placeholder={'1行に1名。タブ/カンマでデッキ名を指定できます。\n例:\nカスミ, ミライドン\nタケシ, リザードン'}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            rows={5}
            style={{ width: '100%', resize: 'vertical', marginBottom: 8 }}
          />
          <button className="btn primary sm" onClick={() => { addPlayersBulk(t.id, bulk); setBulk(''); setShowBulk(false); }}>
            まとめて追加
          </button>
        </div>
      )}

      {t.players.length === 0 ? (
        <div className="empty">参加者を追加してください。</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>#</th>
              <th>プレイヤー</th>
              <th>デッキ</th>
              <th className="right">操作</th>
            </tr>
          </thead>
          <tbody>
            {t.players.map((p, i) => (
              <tr key={p.id} style={{ opacity: p.dropped ? 0.45 : 1 }}>
                <td className="dim">{i + 1}</td>
                <td>
                  <div className="row" style={{ gap: 8 }}>
                    <Avatar player={p} size={26} />
                    <span style={{ fontWeight: 700 }}>{p.name}</span>
                    {p.dropped && <span className="chip dim">drop（R{p.droppedRound}）</span>}
                  </div>
                </td>
                <td className="dim">{p.deck ?? '—'}</td>
                <td className="right">
                  {started ? (
                    <button className="btn ghost sm" onClick={() => setPlayerDropped(t.id, p.id, !p.dropped)}>
                      {p.dropped ? '復帰' : 'ドロップ'}
                    </button>
                  ) : (
                    <button className="btn ghost sm danger" onClick={() => removePlayer(t.id, p.id)}>削除</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
