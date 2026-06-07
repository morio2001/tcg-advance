// Domain model for the tournament information-sharing hub.
// The data here is the single source of truth that every audience view reads from.

export type TournamentFormat = 'single';

export type Role = 'admin' | 'floor' | 'broadcast' | 'stage' | 'client';

export type MatchStatus =
  | 'pending'   // at least one player slot still unresolved
  | 'ready'     // both players known, not started
  | 'live'      // started, timer running
  | 'overtime'  // time expired but result not yet reported
  | 'done'      // winner decided
  | 'void';     // bye / no contest

export type PenaltyType = 'caution' | 'warning' | 'game_loss' | 'match_loss' | 'dq';

/** Pre-stream appearance check (clothing / tattoos / other-IP apparel). Per person. */
export type Appearance = 'ok' | 'ng' | 'pending';

export type SlotSource =
  | { kind: 'seed'; participantId: string | null } // null = bye
  | { kind: 'winner'; matchId: string }
  | { kind: 'loser'; matchId: string };

export interface Slot {
  source: SlotSource;
  participantId: string | null; // resolved entrant (null once known to be empty/bye)
  resolved: boolean;            // true when the feeder outcome is known
}

export interface Participant {
  id: string;
  name: string;
  seed: number;        // 1-based seed
  deck?: string;       // archetype, used for broadcast lower-thirds
  affiliation?: string; // shop / region / team
  appearance: Appearance; // pre-stream appearance check, managed in the roster
  photo?: string;      // data URL (downscaled), registered in the roster
}

export interface Penalty {
  id: string;
  type: PenaltyType;
  participantId: string | null; // null = applies to table/both
  note: string;
  at: number;          // epoch ms
  by: string;          // staff label
}

export interface Match {
  id: string;
  bracket: 'main' | 'third'; // 'third' = 3rd-place match
  round: number;             // 1-based within bracket
  order: number;             // position within the round (top-to-bottom layout)
  label: string;             // e.g. "1回戦-3", "準決勝", "決勝", "3位決定戦"
  slots: [Slot, Slot];
  winner: 'a' | 'b' | null;
  scoreA: number;
  scoreB: number;
  bestOf: number;
  status: MatchStatus;
  isBye: boolean;

  // sharing / operations metadata
  table: string | null;
  isStream: boolean;         // 配信卓フラグ
  streamNote?: string;       // e.g. caster notes / segment name

  // timer
  startedAt: number | null;  // epoch ms when started
  durationMin: number;       // base match length
  extensionMin: number;      // granted extension (additive)

  penalties: Penalty[];
}

/** Who produced an event. Set at "join" time (name + role), saved per browser. */
export interface EventSource {
  name: string;
  role: Role;
}

export type EventKind =
  | 'announcement' // 本部からのお知らせ（公開先つき・固定可）
  | 'status'       // 開始 / 停止 / 一斉開始
  | 'result'       // 結果確定 / 取消
  | 'extension'    // 延長付与
  | 'penalty'      // ペナルティ記録
  | 'stream'       // 配信卓フラグ変更
  | 'table'        // 卓割当変更
  | 'appearance'   // アピアランスチェック更新
  | 'message';     // スタッフの自由コメント（スレッド投稿）

/** A single entry in the shared activity log / threads. */
export interface ActivityEvent {
  id: string;
  at: number;
  kind: EventKind;
  source: EventSource;
  matchId: string | null;     // attached match (thread) or null = global
  body: string;
  audiences?: Role[];         // announcements: who should see it
  pinned?: boolean;           // announcements: pin to top / monitor ticker
}

export interface Tournament {
  id: string;
  name: string;
  format: TournamentFormat;
  venue: string;
  regulation: string;
  defaultDurationMin: number;
  defaultBestOf: number;
  hasThirdPlace: boolean;
  participants: Participant[];
  matches: Match[];
  events: ActivityEvent[];
  createdAt: number;
}
