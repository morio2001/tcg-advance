// ===== ドメインモデル =====
// スイスドロー大会運営のためのコア型。UI / 永続化 / 同期から独立した純粋データ。

export type ID = string;

export interface Player {
  id: ID;
  name: string;
  deck?: string;
  /** ドロップ（離脱）したか。ドロップ後は組み合わせ対象から外れる */
  dropped: boolean;
  /** ドロップしたラウンド（記録用） */
  droppedRound?: number;
}

/** マッチの勝敗。'p1' = p1 の勝ち / 'p2' = p2 の勝ち / 'draw' = 引き分け */
export type MatchOutcome = 'p1' | 'p2' | 'draw';

/**
 * 試合進行状況（フロアスタッフが更新）。
 * pending: 未開始 / playing: 対戦中 / extension: 延長中 / done: 結果確定
 */
export type MatchStatus = 'pending' | 'playing' | 'extension' | 'done';

export interface Match {
  id: ID;
  round: number;
  /** テーブル番号（1始まり）。Bye は 0 */
  table: number;
  p1: ID;
  /** null のとき p1 の Bye（不戦勝） */
  p2: ID | null;
  /** 取得ゲーム数（BO3 などのゲームカウント） */
  p1GameWins: number;
  p2GameWins: number;
  status: MatchStatus;
  /** 結果。未報告なら null。Bye は自動で 'p1' */
  outcome: MatchOutcome | null;
  /** ラウンド/試合開始時刻(epoch ms)。タイマー計算に使用 */
  startedAt?: number;
  /** 付与された延長時間（分） */
  extensionMinutes?: number;
  /** 結果を入力した端末/スタッフ名 */
  reportedBy?: string;
  reportedAt?: number;
  note?: string;
}

export type PenaltyType =
  | 'caution' // 注意
  | 'warning' // 警告
  | 'game_loss' // ゲームロス
  | 'match_loss' // マッチロス
  | 'disqualification' // 失格
  | 'tardiness' // 遅刻
  | 'deck_error' // デッキ登録ミス
  | 'slow_play' // 遅延行為
  | 'other';

export interface Penalty {
  id: ID;
  round: number;
  matchId?: ID;
  playerId: ID;
  type: PenaltyType;
  reason: string;
  /** 記録したスタッフ名 */
  staff: string;
  createdAt: number;
}

export type TournamentStatus = 'setup' | 'running' | 'finished';

export interface Tournament {
  id: ID;
  name: string;
  game: string;
  /** 1本勝負=1 / 2本先取=3 / 3本先取=5 */
  bestOf: number;
  /** 制限時間（分） */
  matchMinutes: number;
  /** 予定ラウンド数。0 のとき参加人数から自動算出 */
  plannedRounds: number;
  players: Player[];
  matches: Match[];
  penalties: Penalty[];
  /** 現在ラウンド。0 = 未開始 */
  currentRound: number;
  status: TournamentStatus;
  createdAt: number;
}

export const PENALTY_LABELS: Record<PenaltyType, string> = {
  caution: '注意',
  warning: '警告',
  game_loss: 'ゲームロス',
  match_loss: 'マッチロス',
  disqualification: '失格',
  tardiness: '遅刻',
  deck_error: 'デッキ登録ミス',
  slow_play: '遅延行為',
  other: 'その他',
};

export const STATUS_LABELS: Record<MatchStatus, string> = {
  pending: '未開始',
  playing: '対戦中',
  extension: '延長中',
  done: '確定',
};

/** BO設定から「勝利に必要なゲーム数」を返す（BO3→2, BO1→1） */
export function winsNeeded(bestOf: number): number {
  return Math.floor(bestOf / 2) + 1;
}
