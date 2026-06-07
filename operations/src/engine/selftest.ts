// エンジンの自己検証（npm run test で実行）。
// 完全なフルラウンドのスイス大会をシミュレートし、不変条件を検証する。

import type { Tournament, Match, MatchOutcome } from './types';
import { winsNeeded } from './types';
import { computeStandings } from './standings';
import { generatePairings, planToMatches, recommendedRounds } from './swiss';

let pass = 0;
let fail = 0;
function check(cond: boolean, msg: string) {
  if (cond) { pass++; }
  else { fail++; console.error('  ✗ FAIL:', msg); }
}

// 決定的乱数（再現可能）
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

let idCounter = 0;
const idGen = () => `id_${idCounter++}`;

function newTournament(playerCount: number, bestOf: number): Tournament {
  return {
    id: 't1',
    name: 'Self Test Cup',
    game: 'test',
    bestOf,
    matchMinutes: 30,
    plannedRounds: 0,
    players: Array.from({ length: playerCount }, (_, i) => ({
      id: `p${i + 1}`,
      name: `Player ${i + 1}`,
      dropped: false,
    })),
    matches: [],
    penalties: [],
    currentRound: 0,
    status: 'running',
    createdAt: Date.now(),
  };
}

/** 1ラウンドをシミュレート（rng で勝敗をランダムに決める。p1 やや有利） */
function playRound(t: Tournament, rng: () => number, bestOf: number) {
  const plan = generatePairings(t, rng);
  const matches = planToMatches(plan, bestOf, idGen, Date.now());
  const need = winsNeeded(bestOf);
  for (const m of matches) {
    if (m.status === 'done') continue; // Bye
    const roll = rng();
    let outcome: MatchOutcome;
    if (roll < 0.46) outcome = 'p1';
    else if (roll < 0.92) outcome = 'p2';
    else outcome = 'draw';
    m.outcome = outcome;
    m.status = 'done';
    if (outcome === 'p1') { m.p1GameWins = need; m.p2GameWins = Math.floor(rng() * need); }
    else if (outcome === 'p2') { m.p2GameWins = need; m.p1GameWins = Math.floor(rng() * need); }
    else { m.p1GameWins = need - 1; m.p2GameWins = need - 1; }
  }
  t.matches.push(...matches);
  t.currentRound = plan.round;
  return { plan, matches };
}

function runScenario(playerCount: number, bestOf: number, seed: number) {
  console.log(`\n— ${playerCount}人 / BO${bestOf} / seed ${seed} —`);
  const t = newTournament(playerCount, bestOf);
  const rounds = recommendedRounds(playerCount);
  const rng = makeRng(seed);

  const seenPairs = new Set<string>();
  const byeCount = new Map<string, number>();

  for (let r = 0; r < rounds; r++) {
    const { matches } = playRound(t, rng, bestOf);

    // 各ラウンド：アクティブ全員がちょうど1試合に割り当てられる
    const active = t.players.filter((p) => !p.dropped);
    const assigned = new Set<string>();
    for (const m of matches) {
      assigned.add(m.p1);
      if (m.p2) assigned.add(m.p2);
      if (m.p2 === null) byeCount.set(m.p1, (byeCount.get(m.p1) ?? 0) + 1);
    }
    check(assigned.size === active.length,
      `R${r + 1}: 全アクティブ参加者が割当(${assigned.size}/${active.length})`);

    // テーブル番号の重複なし（Bye=0除く）
    const tables = matches.filter((m) => m.table > 0).map((m) => m.table);
    check(new Set(tables).size === tables.length, `R${r + 1}: テーブル番号が一意`);
  }

  // 再戦が無いこと（人数 <= ラウンドで成立可能な範囲）
  for (const m of t.matches) {
    if (m.p2 === null) continue;
    const key = m.p1 < m.p2 ? `${m.p1}|${m.p2}` : `${m.p2}|${m.p1}`;
    check(!seenPairs.has(key), `再戦が発生していない (${m.p1} vs ${m.p2})`);
    seenPairs.add(key);
  }

  // Bye は1人1回まで
  for (const [pid, c] of byeCount) {
    check(c <= 1, `${pid} の Bye は1回以内 (${c})`);
  }

  // 順位：マッチポイント総和の検証
  const standings = computeStandings(t);
  check(standings.length === playerCount, '順位表に全員が含まれる');
  // ランクは1..nの連番
  check(standings.every((s, i) => s.rank === i + 1), 'ランクが連番');
  // マッチポイントは降順
  for (let i = 1; i < standings.length; i++) {
    check(standings[i - 1].matchPoints >= standings[i].matchPoints,
      'マッチポイントが降順に並ぶ');
  }
  // 各プレイヤーの勝+敗+分+bye = played
  for (const s of standings) {
    check(s.wins + s.losses + s.draws === s.played,
      `${s.player.name}: 勝敗分の合計=試合数`);
    check(s.matchPoints === s.wins * 3 + s.draws,
      `${s.player.name}: マッチポイント整合`);
  }
}

// 各種人数で実行
runScenario(8, 3, 1);
runScenario(16, 3, 42);
runScenario(7, 1, 7); // 奇数 → Bye 検証
runScenario(32, 3, 99);
runScenario(9, 1, 5); // 奇数

console.log(`\n=== 結果: ${pass} passed, ${fail} failed ===`);
if (fail > 0) {
  const g = globalThis as { process?: { exit: (code: number) => void } };
  g.process?.exit(1);
}
