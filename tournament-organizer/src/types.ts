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

export interface Announcement {
  id: string;
  at: number;
  by: string;
  body: string;
  audiences: Role[];   // which views should surface this
  pinned: boolean;
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
  announcements: Announcement[];
  createdAt: number;
}
