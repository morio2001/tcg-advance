import type { User } from '@supabase/supabase-js';
import type { Profile } from '../hooks/useProfile';

// VITE_MOCK_AUTH=1 で Supabase なしの画面確認モードになる（npm run dev:mock）。
// デザインモックの確認・スクリーンショット撮影用で、本番ビルドでは使わない。
export const IS_MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === '1';

export const MOCK_AUTH_USER = {
  id: 'mock-user',
  email: 'mock@example.com',
  user_metadata: { name: 'シロ' },
  app_metadata: {},
  identities: [],
} as unknown as User;

export const MOCK_AUTH_PROFILE: Profile = {
  id: 'mock-user',
  display_name: 'シロ',
  avatar_url: '',
  favorite_shop: 'カードショップ渋谷',
  favorite_tcg: ['ptcg', 'dm'],
  level: 12,
  xp: 3400,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};
