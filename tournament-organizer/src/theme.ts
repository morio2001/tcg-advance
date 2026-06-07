// Shared visual tokens for the organizer mock.

export const C = {
  bg: '#070b16',
  panel: 'rgba(255,255,255,0.035)',
  panelSolid: '#0f1626',
  border: 'rgba(255,255,255,0.09)',
  borderStrong: 'rgba(255,255,255,0.16)',
  text: '#e6edf5',
  textDim: '#8a99ac',
  textFaint: '#56657a',
  accent: '#00e0e0',
  accentDeep: '#00a0ff',
  win: '#00d68a',
  lose: '#ff5a6a',
  warn: '#ffc24a',
  stream: '#ff5cc8',
  live: '#34d399',
  overtime: '#ff8c42',
} as const;

// Status -> presentation color/label
export const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '未確定', color: '#7e8aa0', bg: 'rgba(126,138,160,0.12)' },
  ready: { label: '待機中', color: '#5cc8ff', bg: 'rgba(92,200,255,0.12)' },
  live: { label: '進行中', color: '#34d399', bg: 'rgba(52,211,153,0.14)' },
  overtime: { label: '延長中', color: '#ff8c42', bg: 'rgba(255,140,66,0.16)' },
  done: { label: '終了', color: '#9aa6b8', bg: 'rgba(154,166,184,0.1)' },
  void: { label: '不戦', color: '#56657a', bg: 'rgba(86,101,122,0.1)' },
};

export const PENALTY_META: Record<string, { label: string; short: string; color: string }> = {
  caution: { label: '注意 (Caution)', short: '注意', color: '#8ad6ff' },
  warning: { label: '警告 (Warning)', short: '警告', color: '#ffc24a' },
  game_loss: { label: 'ゲームロス', short: 'GL', color: '#ff9a3c' },
  match_loss: { label: 'マッチロス', short: 'ML', color: '#ff5a6a' },
  dq: { label: '失格 (DQ)', short: 'DQ', color: '#ff3b5c' },
};
