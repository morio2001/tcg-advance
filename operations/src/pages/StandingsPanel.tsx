import React from 'react';
import type { Tournament } from '../engine/types';
import { computeStandings, pct } from '../engine/standings';
import { Avatar } from '../components/ui';

export const StandingsPanel: React.FC<{ t: Tournament }> = ({ t }) => {
  const rows = computeStandings(t);
  const showGames = t.bestOf > 1;

  if (t.currentRound === 0) {
    return <div className="panel empty">大会開始後に順位が表示されます。</div>;
  }

  return (
    <div className="panel">
      <div className="row" style={{ marginBottom: 12 }}>
        <h3 className="section-title" style={{ margin: 0 }}>順位表</h3>
        <div className="spacer" />
        <span className="dim" style={{ fontSize: 12 }}>第{t.currentRound}ラウンド終了時点 ・ {rows.length}名</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th className="num" style={{ width: 40 }}>#</th>
              <th>プレイヤー</th>
              <th className="num" title="勝-分-敗">成績</th>
              <th className="num" title="マッチポイント">点</th>
              <th className="right" title="対戦相手のマッチ勝率">OMW%</th>
              {showGames && <th className="right" title="ゲーム勝率">GW%</th>}
              {showGames && <th className="right" title="対戦相手のゲーム勝率">OGW%</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.player.id} style={{ opacity: r.player.dropped ? 0.45 : 1 }}>
                <td className="num" style={{ fontWeight: 800, color: r.rank <= 8 && !r.player.dropped ? 'var(--draw)' : 'var(--dim)' }}>{r.rank}</td>
                <td>
                  <div className="row" style={{ gap: 8 }}>
                    <Avatar player={r.player} size={26} />
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {r.player.name}
                        {r.player.dropped && <span className="chip dim" style={{ marginLeft: 6 }}>drop</span>}
                        {r.byes > 0 && <span className="chip cyan" style={{ marginLeft: 6 }}>bye{r.byes}</span>}
                      </div>
                      {r.player.deck && <div className="dim" style={{ fontSize: 11 }}>{r.player.deck}</div>}
                    </div>
                  </div>
                </td>
                <td className="num">
                  <span style={{ color: 'var(--win)', fontWeight: 700 }}>{r.wins}</span>
                  <span className="dim">-{r.draws}-</span>
                  <span style={{ color: 'var(--lose)', fontWeight: 700 }}>{r.losses}</span>
                </td>
                <td className="num" style={{ fontWeight: 800 }}>{r.matchPoints}</td>
                <td className="right dim">{pct(r.omwp)}</td>
                {showGames && <td className="right dim">{pct(r.gwp)}</td>}
                {showGames && <td className="right dim">{pct(r.ogwp)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="dim" style={{ fontSize: 11, marginTop: 10, lineHeight: 1.6 }}>
        タイブレーク順: マッチポイント → OMW%（相手マッチ勝率）{showGames && ' → GW%（自ゲーム勝率） → OGW%（相手ゲーム勝率）'}。各勝率は下限33.3%。
      </div>
    </div>
  );
};
