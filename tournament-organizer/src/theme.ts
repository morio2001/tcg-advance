// Shared visual tokens for the organizer mock — light "ops board" theme.
// Page is white-based (白基調); result reads via text color: win = red, lose = grey.

export const C = {
  bg: '#eceff4',
  panel: '#ffffff',
  panelSolid: '#ffffff',
  border: '#d7dee8',
  borderStrong: '#c2ccd9',
  text: '#1b2330',
  textDim: '#5b6675',
  textFaint: '#98a2b3',
  accent: '#1769d6',
  accentDeep: '#0a52c4',
  win: '#d81e3f',
  lose: '#9aa3af',
  warn: '#c77700',
  stream: '#c81d8f',
  live: '#1769d6',
  overtime: '#e8590c',
} as const;

// Status -> presentation color/label (tuned for white backgrounds)
export const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '未確定', color: '#8a93a3', bg: '#eef1f5' },
  ready: { label: '待機中', color: '#2f6feb', bg: '#eaf1ff' },
  live: { label: '進行中', color: '#1769d6', bg: '#e7f0ff' },
  overtime: { label: '延長中', color: '#e8590c', bg: '#fff0e6' },
  done: { label: '終了', color: '#8a93a3', bg: '#eef1f5' },
  void: { label: '不戦', color: '#aab2bf', bg: '#f0f2f5' },
};

export const APPEARANCE_META: Record<string, { label: string; color: string }> = {
  ok: { label: '可', color: '#1f9d57' },
  ng: { label: '不可', color: '#d81e3f' },
  pending: { label: '未', color: '#98a2b3' },
};

// Activity-log event kind -> short label + accent color (for feed/thread chips).
export const KIND_META: Record<string, { label: string; color: string }> = {
  announcement: { label: 'お知らせ', color: '#1769d6' },
  status: { label: '進行', color: '#0f9d6b' },
  result: { label: '結果', color: '#d81e3f' },
  extension: { label: '延長', color: '#e8590c' },
  penalty: { label: 'ペナルティ', color: '#c77700' },
  stream: { label: '配信', color: '#c81d8f' },
  table: { label: '卓', color: '#5b6675' },
  appearance: { label: 'アピアランス', color: '#7a5af0' },
  message: { label: 'コメント', color: '#5b6675' },
};

export const PENALTY_META: Record<string, { label: string; short: string; color: string }> = {
  caution: { label: '注意 (Caution)', short: '注意', color: '#2f86c2' },
  warning: { label: '警告 (Warning)', short: '警告', color: '#c77700' },
  game_loss: { label: 'ゲームロス', short: 'GL', color: '#e8590c' },
  match_loss: { label: 'マッチロス', short: 'ML', color: '#d81e3f' },
  dq: { label: '失格 (DQ)', short: 'DQ', color: '#c01030' },
};
