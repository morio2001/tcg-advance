// ===== スイスドロー 組み合わせエンジン =====
// ・スコアグループ（マッチポイント）順に並べ、上位から隣接ペアリング
// ・再戦（同一カード）を回避（バックトラッキングで完全マッチングを探索）
// ・奇数なら Bye を最下位かつ未Bye のプレイヤーに付与
// ・ドロップ済みプレイヤーは除外

import type { Tournament, Match, ID } from './types';
import { winsNeeded } from './types';
import { computeStandings } from './standings';

/** 推奨ラウンド数（参加人数の log2 切り上げ） */
export function recommendedRounds(playerCount: number): number {
  if (playerCount <= 1) return 0;
  if (playerCount <= 2) return 1;
  return Math.ceil(Math.log2(playerCount));
}

function pairKey(a: ID, b: ID): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** これまでに対戦したペアの集合 */
function playedPairs(t: Tournament): Set<string> {
  const set = new Set<string>();
  for (const m of t.matches) {
    if (m.p2 !== null) set.add(pairKey(m.p1, m.p2));
  }
  return set;
}

/** 既に Bye を受けたプレイヤー */
function hadByeSet(t: Tournament): Set<ID> {
  const set = new Set<ID>();
  for (const m of t.matches) {
    if (m.p2 === null) set.add(m.p1);
  }
  return set;
}

/**
 * 並び順 order を、再戦を避けつつ完全ペアリングする。
 * order は強さ順（上位が先頭）。先頭から最も近い相手を優先して試す。
 * 成立しなければ null。
 */
function pairList(order: ID[], played: Set<string>): [ID, ID][] | null {
  if (order.length === 0) return [];
  const [first, ...rest] = order;
  for (let i = 0; i < rest.length; i++) {
    const cand = rest[i];
    if (played.has(pairKey(first, cand))) continue;
    const remaining = rest.filter((_, j) => j !== i);
    const sub = pairList(remaining, played);
    if (sub) return [[first, cand], ...sub];
  }
  return null;
}

function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface RoundPlan {
  round: number;
  pairings: { p1: ID; p2: ID | null; table: number }[];
  byePlayer: ID | null;
}

/**
 * 次ラウンドの組み合わせを生成する（Match は作らず計画のみ返す）。
 * @param rng テスト用の乱数（省略時 Math.random）
 */
export function generatePairings(t: Tournament, rng: () => number = Math.random): RoundPlan {
  const round = t.currentRound + 1;
  const active = t.players.filter((p) => !p.dropped).map((p) => p.id);

  // 並び順を決定
  let order: ID[];
  if (t.currentRound === 0) {
    // 初回はランダム
    order = shuffle(active, rng);
  } else {
    // 2回戦以降は順位順（同点はランダムに崩す）
    const standings = computeStandings(t);
    const activeSet = new Set(active);
    order = standings
      .filter((s) => activeSet.has(s.player.id))
      .map((s) => s.player.id);
  }

  // Bye の決定（奇数時）
  let byePlayer: ID | null = null;
  if (order.length % 2 === 1) {
    const hadBye = hadByeSet(t);
    // 最下位から、まだ Bye をもらっていない人を探す
    for (let i = order.length - 1; i >= 0; i--) {
      if (!hadBye.has(order[i])) { byePlayer = order[i]; break; }
    }
    // 全員 Bye 経験済みなら最下位
    if (byePlayer === null) byePlayer = order[order.length - 1];
    order = order.filter((id) => id !== byePlayer);
  }

  const played = playedPairs(t);
  // まず再戦を完全回避して試す
  let pairs = pairList(order, played);
  // 不可能なら再戦を許容（プロトタイプ用フォールバック）
  if (!pairs) pairs = pairList(order, new Set());

  const pairings = (pairs ?? []).map(([p1, p2], i) => ({
    p1, p2, table: i + 1,
  }));

  return { round, pairings, byePlayer };
}

/** RoundPlan を Match[] に変換（id 採番は呼び出し側 idGen で） */
export function planToMatches(
  plan: RoundPlan,
  bestOf: number,
  idGen: () => string,
  startedAt: number,
): Match[] {
  const need = winsNeeded(bestOf);
  const matches: Match[] = plan.pairings.map((pr) => ({
    id: idGen(),
    round: plan.round,
    table: pr.table,
    p1: pr.p1,
    p2: pr.p2,
    p1GameWins: 0,
    p2GameWins: 0,
    status: 'playing',
    outcome: null,
    startedAt,
  }));

  if (plan.byePlayer) {
    matches.push({
      id: idGen(),
      round: plan.round,
      table: 0,
      p1: plan.byePlayer,
      p2: null,
      p1GameWins: need,
      p2GameWins: 0,
      status: 'done',
      outcome: 'p1',
      reportedBy: 'system',
      reportedAt: startedAt,
      note: 'Bye（不戦勝）',
    });
  }
  return matches;
}
