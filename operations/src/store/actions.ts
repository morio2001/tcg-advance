// ===== ストア操作（ドメインアクション） =====
// UI からはこの関数群だけを呼ぶ。エンジン（純粋ロジック）とストア（永続化/同期）を仲介。

import { store, uid } from './store';
import type {
  Tournament, Player, Match, MatchOutcome, MatchStatus, Penalty, PenaltyType,
} from '../engine/types';
import { winsNeeded } from '../engine/types';
import { generatePairings, planToMatches, recommendedRounds } from '../engine/swiss';

function updateTournament(id: string, fn: (t: Tournament) => Tournament) {
  store.set((s) => ({
    ...s,
    tournaments: s.tournaments.map((t) => (t.id === id ? fn(t) : t)),
  }));
}

export function createTournament(input: {
  name: string;
  game?: string;
  bestOf?: number;
  matchMinutes?: number;
  plannedRounds?: number;
}): string {
  const id = uid();
  const t: Tournament = {
    id,
    name: input.name.trim() || '無題の大会',
    game: input.game?.trim() || 'ポケモンカード',
    bestOf: input.bestOf ?? 1,
    matchMinutes: input.matchMinutes ?? 25,
    plannedRounds: input.plannedRounds ?? 0,
    players: [],
    matches: [],
    penalties: [],
    currentRound: 0,
    status: 'setup',
    createdAt: Date.now(),
  };
  store.set((s) => ({ ...s, tournaments: [t, ...s.tournaments] }));
  return id;
}

export function deleteTournament(id: string) {
  store.set((s) => ({ ...s, tournaments: s.tournaments.filter((t) => t.id !== id) }));
}

export function updateSettings(id: string, patch: Partial<Pick<Tournament, 'name' | 'game' | 'bestOf' | 'matchMinutes' | 'plannedRounds'>>) {
  updateTournament(id, (t) => ({ ...t, ...patch }));
}

// ---- 参加者 ----

export function addPlayer(tid: string, name: string, deck?: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const player: Player = { id: uid(), name: trimmed, deck: deck?.trim() || undefined, dropped: false };
  updateTournament(tid, (t) => ({ ...t, players: [...t.players, player] }));
}

/** 複数行テキストから一括追加（1行=1名、タブ/カンマでデッキ名） */
export function addPlayersBulk(tid: string, text: string) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const players: Player[] = lines.map((line) => {
    const [name, deck] = line.split(/[\t,]/).map((s) => s.trim());
    return { id: uid(), name, deck: deck || undefined, dropped: false };
  });
  updateTournament(tid, (t) => ({ ...t, players: [...t.players, ...players] }));
}

export function removePlayer(tid: string, pid: string) {
  updateTournament(tid, (t) => ({ ...t, players: t.players.filter((p) => p.id !== pid) }));
}

export function setPlayerDropped(tid: string, pid: string, dropped: boolean) {
  updateTournament(tid, (t) => ({
    ...t,
    players: t.players.map((p) =>
      p.id === pid ? { ...p, dropped, droppedRound: dropped ? t.currentRound : undefined } : p,
    ),
  }));
}

// ---- ラウンド進行 ----

export function startNextRound(tid: string) {
  updateTournament(tid, (t) => {
    if (t.players.filter((p) => !p.dropped).length < 2) return t;
    const plan = generatePairings(t);
    const newMatches = planToMatches(plan, t.bestOf, uid, Date.now());
    return {
      ...t,
      status: 'running',
      currentRound: plan.round,
      matches: [...t.matches, ...newMatches],
    };
  });
}

/** 現ラウンドが全て確定しているか */
export function isRoundComplete(t: Tournament, round: number): boolean {
  const ms = t.matches.filter((m) => m.round === round);
  return ms.length > 0 && ms.every((m) => m.status === 'done');
}

export function finishTournament(tid: string) {
  updateTournament(tid, (t) => ({ ...t, status: 'finished' }));
}

export function reopenTournament(tid: string) {
  updateTournament(tid, (t) => ({ ...t, status: 'running' }));
}

// ---- 試合（フロアスタッフ操作） ----

export function setMatchStatus(tid: string, matchId: string, status: MatchStatus) {
  updateTournament(tid, (t) => ({
    ...t,
    matches: t.matches.map((m) => (m.id === matchId ? { ...m, status } : m)),
  }));
}

/** 延長時間（分）を付与。終了予定はタイマー側で startedAt + matchMinutes + ext から算出 */
export function grantExtension(tid: string, matchId: string, minutes: number) {
  updateTournament(tid, (t) => ({
    ...t,
    matches: t.matches.map((m) =>
      m.id === matchId
        ? { ...m, extensionMinutes: (m.extensionMinutes ?? 0) + minutes, status: m.status === 'done' ? m.status : 'extension' }
        : m,
    ),
  }));
}

/** 結果入力（オフラインでもローカルに即時反映、復帰時に同期） */
export function reportResult(
  tid: string,
  matchId: string,
  input: { outcome: MatchOutcome; p1GameWins?: number; p2GameWins?: number; reportedBy?: string },
) {
  updateTournament(tid, (t) => {
    const need = winsNeeded(t.bestOf);
    return {
      ...t,
      matches: t.matches.map((m) => {
        if (m.id !== matchId) return m;
        let { p1GameWins, p2GameWins } = input;
        // ゲーム数未指定なら BO 設定から補完
        if (p1GameWins === undefined || p2GameWins === undefined) {
          if (input.outcome === 'p1') { p1GameWins = need; p2GameWins = 0; }
          else if (input.outcome === 'p2') { p1GameWins = 0; p2GameWins = need; }
          else { p1GameWins = Math.max(0, need - 1); p2GameWins = Math.max(0, need - 1); }
        }
        return {
          ...m,
          outcome: input.outcome,
          p1GameWins,
          p2GameWins,
          status: 'done' as MatchStatus,
          reportedBy: input.reportedBy || 'スタッフ',
          reportedAt: Date.now(),
        };
      }),
    };
  });
}

/** 結果取り消し（誤入力訂正） */
export function clearResult(tid: string, matchId: string) {
  updateTournament(tid, (t) => ({
    ...t,
    matches: t.matches.map((m) =>
      m.id === matchId && m.p2 !== null
        ? { ...m, outcome: null, p1GameWins: 0, p2GameWins: 0, status: 'playing', reportedBy: undefined, reportedAt: undefined }
        : m,
    ),
  }));
}

// ---- ペナルティ ----

export function addPenalty(tid: string, input: {
  playerId: string;
  type: PenaltyType;
  reason: string;
  staff: string;
  matchId?: string;
  round: number;
}) {
  const penalty: Penalty = {
    id: uid(),
    round: input.round,
    matchId: input.matchId,
    playerId: input.playerId,
    type: input.type,
    reason: input.reason.trim(),
    staff: input.staff.trim() || 'スタッフ',
    createdAt: Date.now(),
  };
  updateTournament(tid, (t) => ({ ...t, penalties: [penalty, ...t.penalties] }));

  // マッチロス/失格は自動で結果へ反映
  if (input.matchId && (input.type === 'match_loss' || input.type === 'disqualification')) {
    const t = store.getState().tournaments.find((x) => x.id === tid);
    const m = t?.matches.find((x) => x.id === input.matchId);
    if (m && m.p2 !== null) {
      const outcome: MatchOutcome = m.p1 === input.playerId ? 'p2' : 'p1';
      reportResult(tid, input.matchId, { outcome, reportedBy: `自動(${input.staff || 'スタッフ'})` });
    }
  }
}

export function removePenalty(tid: string, penaltyId: string) {
  updateTournament(tid, (t) => ({ ...t, penalties: t.penalties.filter((p) => p.id !== penaltyId) }));
}

export { recommendedRounds };
