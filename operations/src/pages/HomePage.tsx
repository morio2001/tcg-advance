import React, { useState } from 'react';
import { useAppState } from '../store/useStore';
import { createTournament, recommendedRounds } from '../store/actions';
import { computeStandings } from '../engine/standings';

export const HomePage: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => {
  const { tournaments } = useAppState();
  const [name, setName] = useState('');
  const [game, setGame] = useState('ポケモンカード');
  const [bestOf, setBestOf] = useState(1);
  const [matchMinutes, setMatchMinutes] = useState(25);

  const create = () => {
    const id = createTournament({ name, game, bestOf, matchMinutes });
    setName('');
    onOpen(id);
  };

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
      <div className="panel" style={{ marginBottom: 18 }}>
        <h3 className="section-title">新しい大会を作成</h3>
        <div className="grid2" style={{ marginBottom: 10 }}>
          <input placeholder="大会名（例: 渋谷ジムバトル 6/7）" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && name.trim() && create()} />
          <input placeholder="ゲームタイトル" value={game} onChange={(e) => setGame(e.target.value)} />
        </div>
        <div className="row wrap" style={{ gap: 10 }}>
          <label className="row" style={{ gap: 6 }}>
            <span className="dim" style={{ fontSize: 12 }}>形式</span>
            <select value={bestOf} onChange={(e) => setBestOf(Number(e.target.value))}>
              <option value={1}>BO1</option>
              <option value={3}>BO3</option>
              <option value={5}>BO5</option>
            </select>
          </label>
          <label className="row" style={{ gap: 6 }}>
            <span className="dim" style={{ fontSize: 12 }}>制限時間</span>
            <input type="number" min={5} max={120} value={matchMinutes} onChange={(e) => setMatchMinutes(Number(e.target.value))} style={{ width: 80 }} />
            <span className="dim" style={{ fontSize: 12 }}>分</span>
          </label>
          <div className="spacer" />
          <button className="btn primary" disabled={!name.trim()} onClick={create}>作成して開く</button>
        </div>
      </div>

      <h3 className="section-title">大会一覧</h3>
      {tournaments.length === 0 ? (
        <div className="panel empty">まだ大会がありません。上のフォームから作成してください。</div>
      ) : (
        <div className="board-grid">
          {tournaments.map((t) => {
            const active = t.players.filter((p) => !p.dropped).length;
            const top = t.currentRound > 0 ? computeStandings(t)[0] : null;
            const planned = t.plannedRounds > 0 ? t.plannedRounds : recommendedRounds(active);
            return (
              <button key={t.id} className="panel" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => onOpen(t.id)}>
                <div className="row" style={{ marginBottom: 8 }}>
                  <span className="chip cyan">{t.game}</span>
                  <div className="spacer" />
                  <span className={`chip ${t.status === 'finished' ? 'win' : t.status === 'running' ? 'purple' : 'dim'}`}>
                    {t.status === 'finished' ? '終了' : t.status === 'running' ? `R${t.currentRound}/${planned}` : '準備中'}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{t.name}</div>
                <div className="dim" style={{ fontSize: 12 }}>
                  {active}名 ・ BO{t.bestOf} ・ {t.matchMinutes}分
                  {top && <> ・ 首位 {top.player.name}</>}
                </div>
                <div className="dim" style={{ fontSize: 11, marginTop: 6 }}>
                  {new Date(t.createdAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
