// ===== 順位 / タイブレーク計算 =====
// MTG / ポケモンTCG で標準的に使われる方式に準拠：
//   1. マッチポイント（勝3 / 分1 / 負0、Bye=3）
//   2. OMW%  対戦相手のマッチ勝率の平均（各相手は下限33%）
//   3. GW%   自分のゲーム勝率（下限33%）
//   4. OGW%  対戦相手のゲーム勝率の平均（下限33%）
// Bye は自分の成績には勝ちとして含めるが、相手側の平均(OMW/OGW)には含めない。

import type { Tournament, Player, ID, Match } from './types';
import { winsNeeded } from './types';

export interface StandingRow {
  rank: number;
  player: Player;
  matchPoints: number;
  wins: number;
  losses: number;
  draws: number;
  byes: number;
  played: number; // 結果のついたマッチ数（Bye含む）
  mwp: number; // 自分のマッチ勝率
  omwp: number; // 対戦相手マッチ勝率
  gwp: number; // 自分のゲーム勝率
  ogwp: number; // 対戦相手ゲーム勝率
  opponentIds: ID[];
}

const FLOOR = 1 / 3; // タイブレーク下限 33.33%

/** 結果が確定しているマッチか（Bye または outcome あり） */
function isResolved(m: Match): boolean {
  return m.outcome !== null || m.p2 === null;
}

interface Raw {
  matchPoints: number;
  wins: number;
  losses: number;
  draws: number;
  byes: number;
  played: number;
  gameWins: number;
  gameLosses: number;
  opponentIds: ID[];
}

function blank(): Raw {
  return {
    matchPoints: 0, wins: 0, losses: 0, draws: 0, byes: 0,
    played: 0, gameWins: 0, gameLosses: 0, opponentIds: [],
  };
}

/** 各プレイヤーの素データを集計 */
function aggregate(t: Tournament): Map<ID, Raw> {
  const map = new Map<ID, Raw>();
  for (const p of t.players) map.set(p.id, blank());
  const need = winsNeeded(t.bestOf);

  for (const m of t.matches) {
    if (!isResolved(m)) continue;

    // Bye
    if (m.p2 === null) {
      const r = map.get(m.p1);
      if (!r) continue;
      r.matchPoints += 3;
      r.wins += 1;
      r.byes += 1;
      r.played += 1;
      r.gameWins += need; // Bye は need-0 の勝利として扱う
      continue;
    }

    const r1 = map.get(m.p1);
    const r2 = map.get(m.p2);
    if (!r1 || !r2) continue;

    r1.played += 1;
    r2.played += 1;
    r1.opponentIds.push(m.p2);
    r2.opponentIds.push(m.p1);
    r1.gameWins += m.p1GameWins;
    r1.gameLosses += m.p2GameWins;
    r2.gameWins += m.p2GameWins;
    r2.gameLosses += m.p1GameWins;

    if (m.outcome === 'draw') {
      r1.matchPoints += 1; r2.matchPoints += 1;
      r1.draws += 1; r2.draws += 1;
    } else if (m.outcome === 'p1') {
      r1.matchPoints += 3; r1.wins += 1;
      r2.losses += 1;
    } else {
      r2.matchPoints += 3; r2.wins += 1;
      r1.losses += 1;
    }
  }
  return map;
}

function matchWinPct(r: Raw): number {
  if (r.played === 0) return 0;
  return Math.max(FLOOR, r.matchPoints / (3 * r.played));
}

function gameWinPct(r: Raw): number {
  const total = r.gameWins + r.gameLosses;
  if (total === 0) return FLOOR;
  return Math.max(FLOOR, r.gameWins / total);
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function computeStandings(t: Tournament): StandingRow[] {
  const raw = aggregate(t);

  // 各プレイヤーの自己勝率を先に確定
  const ownMwp = new Map<ID, number>();
  const ownGwp = new Map<ID, number>();
  for (const [id, r] of raw) {
    ownMwp.set(id, matchWinPct(r));
    ownGwp.set(id, gameWinPct(r));
  }

  const rows: StandingRow[] = t.players.map((player) => {
    const r = raw.get(player.id)!;
    const omwp = avg(r.opponentIds.map((oid) => ownMwp.get(oid) ?? FLOOR));
    const ogwp = avg(r.opponentIds.map((oid) => ownGwp.get(oid) ?? FLOOR));
    return {
      rank: 0,
      player,
      matchPoints: r.matchPoints,
      wins: r.wins,
      losses: r.losses,
      draws: r.draws,
      byes: r.byes,
      played: r.played,
      mwp: ownMwp.get(player.id)!,
      omwp,
      gwp: ownGwp.get(player.id)!,
      ogwp,
      opponentIds: r.opponentIds,
    };
  });

  rows.sort((a, b) => {
    // ドロップは下に
    if (a.player.dropped !== b.player.dropped) return a.player.dropped ? 1 : -1;
    if (b.matchPoints !== a.matchPoints) return b.matchPoints - a.matchPoints;
    if (b.omwp !== a.omwp) return b.omwp - a.omwp;
    if (b.gwp !== a.gwp) return b.gwp - a.gwp;
    if (b.ogwp !== a.ogwp) return b.ogwp - a.ogwp;
    return a.player.name.localeCompare(b.player.name, 'ja');
  });

  rows.forEach((row, i) => { row.rank = i + 1; });
  return rows;
}

export const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
