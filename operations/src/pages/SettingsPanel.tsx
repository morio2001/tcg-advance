import React from 'react';
import type { Tournament } from '../engine/types';
import { updateSettings, deleteTournament, recommendedRounds } from '../store/actions';

export const SettingsPanel: React.FC<{ t: Tournament; onDeleted: () => void }> = ({ t, onDeleted }) => {
  const locked = t.currentRound > 0;
  const activeCount = t.players.filter((p) => !p.dropped).length;

  return (
    <div className="panel">
      <h3 className="section-title">大会設定</h3>

      <div className="grid2" style={{ marginBottom: 12 }}>
        <label>
          <div className="dim" style={{ fontSize: 11, marginBottom: 4 }}>大会名</div>
          <input value={t.name} onChange={(e) => updateSettings(t.id, { name: e.target.value })} style={{ width: '100%' }} />
        </label>
        <label>
          <div className="dim" style={{ fontSize: 11, marginBottom: 4 }}>タイトル / ゲーム</div>
          <input value={t.game} onChange={(e) => updateSettings(t.id, { game: e.target.value })} style={{ width: '100%' }} />
        </label>
      </div>

      <div className="grid2" style={{ marginBottom: 12 }}>
        <label>
          <div className="dim" style={{ fontSize: 11, marginBottom: 4 }}>マッチ形式</div>
          <select value={t.bestOf} disabled={locked} onChange={(e) => updateSettings(t.id, { bestOf: Number(e.target.value) })} style={{ width: '100%' }}>
            <option value={1}>1本勝負（BO1）</option>
            <option value={3}>2本先取（BO3）</option>
            <option value={5}>3本先取（BO5）</option>
          </select>
        </label>
        <label>
          <div className="dim" style={{ fontSize: 11, marginBottom: 4 }}>制限時間（分）</div>
          <input type="number" min={5} max={120} value={t.matchMinutes} onChange={(e) => updateSettings(t.id, { matchMinutes: Number(e.target.value) })} style={{ width: '100%' }} />
        </label>
      </div>

      <label style={{ display: 'block', marginBottom: 12 }}>
        <div className="dim" style={{ fontSize: 11, marginBottom: 4 }}>
          予定ラウンド数（0 = 参加人数から自動 ／ 現在 {activeCount}名で推奨 {recommendedRounds(activeCount)} ラウンド）
        </div>
        <input type="number" min={0} max={20} value={t.plannedRounds} onChange={(e) => updateSettings(t.id, { plannedRounds: Number(e.target.value) })} style={{ width: 160 }} />
      </label>

      {locked && <div className="banner" style={{ marginBottom: 12 }}>大会開始後はマッチ形式を変更できません。</div>}

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, marginTop: 4 }}>
        <button className="btn danger" onClick={() => { if (confirm('この大会を削除しますか？元に戻せません。')) { deleteTournament(t.id); onDeleted(); } }}>
          大会を削除
        </button>
      </div>
    </div>
  );
};
