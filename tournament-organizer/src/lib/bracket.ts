import type { Match, Participant, Slot, SlotSource, Tournament } from '../types';

export const MAX_PLAYERS = 32;

let idCounter = 0;
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;

const nextPow2 = (n: number) => {
  let p = 1;
  while (p < n) p *= 2;
  return p;
};

/**
 * Standard single-elimination seed order for a bracket of `size` (power of two).
 * e.g. size 8 -> [1,8,4,5,2,7,3,6]. Each adjacent pair is a first-round match.
 */
export function seedOrder(size: number): number[] {
  let order = [1, 2];
  while (order.length < size) {
    const n = order.length * 2;
    const next: number[] = [];
    for (const s of order) {
      next.push(s);
      next.push(n + 1 - s);
    }
    order = next;
  }
  return order;
}

const mkSlot = (source: SlotSource): Slot => {
  if (source.kind === 'seed') {
    return { source, participantId: source.participantId, resolved: true };
  }
  return { source, participantId: null, resolved: false };
};

const roundLabel = (round: number, totalRounds: number, indexInRound: number): string => {
  const fromEnd = totalRounds - round; // 0 = final
  if (fromEnd === 0) return '決勝';
  if (fromEnd === 1) return `準決勝-${indexInRound + 1}`;
  if (fromEnd === 2) return `準々決勝-${indexInRound + 1}`;
  return `${round}回戦-${indexInRound + 1}`;
};

interface GenerateOptions {
  defaultDurationMin: number;
  defaultBestOf: number;
  hasThirdPlace: boolean;
}

/**
 * Build a full single-elimination bracket (with byes for non-power-of-two fields
 * and an optional 3rd-place match), then auto-resolve byes.
 */
export function generateSingleElim(participants: Participant[], opts: GenerateOptions): Match[] {
  const n = participants.length;
  if (n < 2) return [];
  const size = Math.min(nextPow2(n), nextPow2(MAX_PLAYERS));
  const totalRounds = Math.log2(size);
  const order = seedOrder(size);
  const bySeed = new Map(participants.map((p) => [p.seed, p]));

  const matches: Match[] = [];
  // index matches per round so later rounds can reference earlier ones
  const byRound: Match[][] = [];

  const base = (round: number, order_: number, label: string, slots: [Slot, Slot]): Match => ({
    id: uid('m'),
    bracket: 'main',
    round,
    order: order_,
    label,
    slots,
    winner: null,
    scoreA: 0,
    scoreB: 0,
    bestOf: opts.defaultBestOf,
    status: 'pending',
    isBye: false,
    table: null,
    isStream: false,
    startedAt: null,
    durationMin: opts.defaultDurationMin,
    extensionMin: 0,
    penalties: [],
  });

  // Round 1 from seeds.
  const r1: Match[] = [];
  for (let i = 0; i < size / 2; i++) {
    const seedA = order[i * 2];
    const seedB = order[i * 2 + 1];
    const pa = bySeed.get(seedA) ?? null;
    const pb = bySeed.get(seedB) ?? null;
    const m = base(1, i, roundLabel(1, totalRounds, i), [
      mkSlot({ kind: 'seed', participantId: pa ? pa.id : null }),
      mkSlot({ kind: 'seed', participantId: pb ? pb.id : null }),
    ]);
    r1.push(m);
    matches.push(m);
  }
  byRound.push(r1);

  // Subsequent rounds reference winners of the previous round.
  for (let round = 2; round <= totalRounds; round++) {
    const prev = byRound[round - 2];
    const cur: Match[] = [];
    for (let i = 0; i < prev.length / 2; i++) {
      const m = base(round, i, roundLabel(round, totalRounds, i), [
        mkSlot({ kind: 'winner', matchId: prev[i * 2].id }),
        mkSlot({ kind: 'winner', matchId: prev[i * 2 + 1].id }),
      ]);
      cur.push(m);
      matches.push(m);
    }
    byRound.push(cur);
  }

  // Optional 3rd-place match: losers of the two semifinals.
  if (opts.hasThirdPlace && totalRounds >= 2) {
    const semis = byRound[totalRounds - 2];
    if (semis.length === 2) {
      const third: Match = {
        ...base(totalRounds, 1, '3位決定戦', [
          mkSlot({ kind: 'loser', matchId: semis[0].id }),
          mkSlot({ kind: 'loser', matchId: semis[1].id }),
        ]),
        bracket: 'third',
      };
      matches.push(third);
    }
  }

  resolveAll(matches);
  return matches;
}

const winnerId = (m: Match): string | null => {
  if (m.winner === 'a') return m.slots[0].participantId;
  if (m.winner === 'b') return m.slots[1].participantId;
  return null;
};
const loserId = (m: Match): string | null => {
  if (m.winner === 'a') return m.slots[1].participantId;
  if (m.winner === 'b') return m.slots[0].participantId;
  return null;
};

const isFinal = (m: Match) => m.status === 'done' || m.status === 'void';

/**
 * Recompute every slot and status from current results.
 *
 * Matches are produced in topological order (round 1, round 2, …, then the
 * 3rd-place match), and every slot source references an *earlier* match, so a
 * single forward pass fully resolves the bracket. This keeps editing/clearing
 * results consistent: derived slots are always re-fed from their (already
 * finalized) sources, and auto-byes are re-derived rather than sticking.
 *
 * Manually entered results ('done' with a winner) and in-progress matches
 * ('live' / 'overtime') are preserved; only their inputs are refreshed.
 */
export function resolveAll(matches: Match[]): void {
  const byId = new Map(matches.map((m) => [m.id, m]));

  for (const m of matches) {
    // 1) (re)feed derived slots from their finalized source matches
    for (const slot of m.slots) {
      const s = slot.source;
      if (s.kind === 'seed') continue;
      const src = byId.get(s.matchId);
      const final = src ? isFinal(src) : false;
      slot.resolved = final;
      slot.participantId = !final || !src ? null : s.kind === 'winner' ? winnerId(src) : loserId(src);
    }

    const [a, b] = m.slots;

    // 2) keep in-progress matches as-is (their players are already real)
    if (m.status === 'live' || m.status === 'overtime') continue;

    // 3) keep a manually entered result, but demote it if its inputs vanished
    const manualDone = m.winner !== null && !m.isBye && m.status === 'done';
    if (manualDone && a.resolved && b.resolved && a.participantId && b.participantId) continue;

    // 4) otherwise derive the status from the (now refreshed) slots
    if (!a.resolved || !b.resolved) {
      m.isBye = false;
      m.winner = null;
      m.status = 'pending';
    } else if (a.participantId === null && b.participantId === null) {
      m.isBye = false;
      m.winner = null;
      m.status = 'void';
    } else if (a.participantId === null || b.participantId === null) {
      m.winner = a.participantId !== null ? 'a' : 'b';
      m.isBye = true;
      m.status = 'done';
    } else {
      m.isBye = false;
      m.winner = null;
      m.status = 'ready';
    }
  }
}

/** Resolve participant name (or placeholder) for a slot. */
export function slotName(slot: Slot, t: Tournament): string {
  if (slot.participantId) {
    return t.participants.find((p) => p.id === slot.participantId)?.name ?? '???';
  }
  if (slot.resolved) return slot.source.kind === 'seed' ? 'BYE' : '不在';
  if (slot.source.kind === 'winner') return '勝者待ち';
  if (slot.source.kind === 'loser') return '敗者待ち';
  return '未定';
}

export function participant(t: Tournament, id: string | null): Participant | null {
  if (!id) return null;
  return t.participants.find((p) => p.id === id) ?? null;
}

export function champion(t: Tournament): Participant | null {
  const final = t.matches.find((m) => m.bracket === 'main' && m.round === maxRound(t) && m.status === 'done');
  if (!final) return null;
  return participant(t, winnerId(final));
}

export function maxRound(t: Tournament): number {
  return t.matches.reduce((mx, m) => (m.bracket === 'main' ? Math.max(mx, m.round) : mx), 0);
}

/** The first round that still has unfinished matches; used as "current round". */
export function currentRound(t: Tournament): number {
  const mr = maxRound(t);
  for (let r = 1; r <= mr; r++) {
    const inRound = t.matches.filter((m) => m.bracket === 'main' && m.round === r);
    if (inRound.some((m) => m.status !== 'done' && m.status !== 'void')) return r;
  }
  return mr;
}

export { winnerId, loserId };
