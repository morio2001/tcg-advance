import type { Role } from './types';

export const ROLES: Role[] = ['admin', 'floor', 'broadcast', 'stage', 'client'];

export const ROLE_LABEL: Record<Role, string> = {
  admin: '本部',
  floor: 'フロア',
  broadcast: '配信',
  stage: 'ステージ進行',
  client: 'クライアント',
};

export const ROLE_DESC: Record<Role, string> = {
  admin: '本部 — 大会運営の中枢',
  floor: 'フロアスタッフ — 各試合卓担当',
  broadcast: '配信スタッフ — 配信卓 / テロップ',
  stage: 'ステージ進行 — 登壇・タイムライン',
  client: 'クライアント / 代理店 / 制作',
};

export const ROLE_COLOR: Record<Role, string> = {
  admin: '#1769d6',
  floor: '#0f9d6b',
  broadcast: '#c81d8f',
  stage: '#e8590c',
  client: '#7a5af0',
};
