import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface FollowUser {
  id: string;
  display_name: string;
  avatar_url: string;
  favorite_tcg: string[];
  favorite_shop: string;
  level: number;
  xp: number;
}

export function useFollows(user: User | null) {
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // フォロー一覧取得
  const fetchFollowing = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);
    if (data) {
      setFollowingIds(data.map(d => d.following_id));
      setFollowingCount(data.length);
    }
  }, [user]);

  // フォロワー数取得
  const fetchFollowersCount = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user.id);
    setFollowersCount(count ?? 0);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([fetchFollowing(), fetchFollowersCount()]).finally(() => setLoading(false));
  }, [user, fetchFollowing, fetchFollowersCount]);

  // フォロー/アンフォロー切り替え
  const toggleFollow = useCallback(async (targetUserId: string) => {
    if (!user) return;
    const isFollowing = followingIds.includes(targetUserId);

    // 楽観的更新
    if (isFollowing) {
      setFollowingIds(prev => prev.filter(id => id !== targetUserId));
      setFollowingCount(prev => prev - 1);
    } else {
      setFollowingIds(prev => [...prev, targetUserId]);
      setFollowingCount(prev => prev + 1);
    }

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: targetUserId });
      }
    } catch {
      // ロールバック
      if (isFollowing) {
        setFollowingIds(prev => [...prev, targetUserId]);
        setFollowingCount(prev => prev + 1);
      } else {
        setFollowingIds(prev => prev.filter(id => id !== targetUserId));
        setFollowingCount(prev => prev - 1);
      }
    }
  }, [user, followingIds]);

  // 特定ユーザーのフォロワー数取得
  const getFollowersCount = useCallback(async (targetUserId: string): Promise<number> => {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId);
    return count ?? 0;
  }, []);

  return {
    followingIds,
    followersCount,
    followingCount,
    loading,
    toggleFollow,
    getFollowersCount,
    refresh: fetchFollowing,
  };
}
