import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string;
  favorite_shop: string;
  favorite_tcg: string[];
  level: number;
  xp: number;
  created_at: string;
  updated_at: string;
}

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // プロフィールを取得
  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('プロフィール取得エラー:', error.message);
      } else {
        setProfile(data);
      }
    } catch (e) {
      console.error('プロフィール取得例外:', e);
    } finally {
      setLoading(false);
    }
  };

  // プロフィールを更新
  const updateProfile = async (updates: Partial<Pick<Profile, 'display_name' | 'favorite_shop' | 'favorite_tcg' | 'avatar_url'>>) => {
    if (!user) return { error: 'ログインしていません' };

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('プロフィール更新エラー:', error.message);
      return { error: error.message };
    }

    setProfile(data);
    return { error: null };
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return { profile, loading, updateProfile, refetch: fetchProfile };
}
