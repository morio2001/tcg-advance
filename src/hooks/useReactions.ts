import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export type ReactionType = 'gg' | 'good_manner' | 'good_organizer';

export interface Reaction {
  id: string;
  event_id: string;
  sender_id: string;
  receiver_id: string | null;
  type: ReactionType;
  created_at: string;
}

// GG成立：翌日12時（JST）以降に確定
function isConfirmedGG(createdAt: string): boolean {
  const nowJST = Date.now() + 9 * 60 * 60 * 1000;
  const created = new Date(new Date(createdAt).getTime() + 9 * 60 * 60 * 1000);
  const confirmedAt = new Date(created);
  confirmedAt.setDate(confirmedAt.getDate() + 1);
  confirmedAt.setHours(12, 0, 0, 0);
  return nowJST >= confirmedAt.getTime();
}

export function useReactions(user: User | null) {
  const [sentGGs, setSentGGs] = useState<Record<string, boolean>>({});
  const [receivedGGCount, setReceivedGGCount] = useState(0);
  const [receivedMannerCount, setReceivedMannerCount] = useState(0);
  const [confirmedGGCount, setConfirmedGGCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const ggKey = (eventId: string, receiverId: string) => `${eventId}_${receiverId}`;

  const fetchSentGGs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('reactions')
      .select('event_id, receiver_id')
      .eq('sender_id', user.id)
      .eq('type', 'gg');
    if (data) {
      const map: Record<string, boolean> = {};
      data.forEach((d: any) => { map[ggKey(d.event_id, d.receiver_id)] = true; });
      setSentGGs(map);
    }
  }, [user]);

  const fetchReceivedGGs = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from('reactions')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('type', 'gg');
    setReceivedGGCount(count ?? 0);
  }, [user]);

  const fetchReceivedManner = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from('reactions')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('type', 'good_manner');
    setReceivedMannerCount(count ?? 0);
  }, [user]);

  // GG成立数：お互いにGGしていて翌日12時確定済みのもの
  const fetchConfirmedGGs = useCallback(async () => {
    if (!user) return;

    const [{ data: received }, { data: sent }] = await Promise.all([
      supabase.from('reactions').select('sender_id, event_id, created_at')
        .eq('receiver_id', user.id).eq('type', 'gg'),
      supabase.from('reactions').select('receiver_id, event_id')
        .eq('sender_id', user.id).eq('type', 'gg'),
    ]);

    if (!received || !sent) return;

    const sentSet = new Set(sent.map((s: any) => `${s.receiver_id}_${s.event_id}`));
    let count = 0;
    for (const r of received as any[]) {
      if (sentSet.has(`${r.sender_id}_${r.event_id}`) && isConfirmedGG(r.created_at)) {
        count++;
      }
    }
    setConfirmedGGCount(count);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetchSentGGs(),
      fetchReceivedGGs(),
      fetchReceivedManner(),
      fetchConfirmedGGs(),
    ]).finally(() => setLoading(false));
  }, [user, fetchSentGGs, fetchReceivedGGs, fetchReceivedManner, fetchConfirmedGGs]);

  const toggleGG = useCallback(async (eventId: string, receiverId: string) => {
    if (!user || user.id === receiverId) return;
    const key = ggKey(eventId, receiverId);
    const alreadySent = sentGGs[key];
    setSentGGs(prev => ({ ...prev, [key]: !alreadySent }));
    try {
      if (alreadySent) {
        await supabase.from('reactions').delete()
          .eq('sender_id', user.id).eq('receiver_id', receiverId)
          .eq('event_id', eventId).eq('type', 'gg');
      } else {
        await supabase.from('reactions').insert({
          event_id: eventId, sender_id: user.id, receiver_id: receiverId, type: 'gg',
        });
      }
    } catch {
      setSentGGs(prev => ({ ...prev, [key]: alreadySent ?? false }));
    }
  }, [user, sentGGs]);

  const getGGCountForUser = useCallback(async (receiverId: string, eventId?: string): Promise<number> => {
    let query = supabase.from('reactions').select('*', { count: 'exact', head: true })
      .eq('receiver_id', receiverId).eq('type', 'gg');
    if (eventId) query = query.eq('event_id', eventId);
    const { count } = await query;
    return count ?? 0;
  }, []);

  const hasGGed = useCallback((eventId: string, receiverId: string): boolean => {
    return sentGGs[ggKey(eventId, receiverId)] ?? false;
  }, [sentGGs]);

  // ── 汎用リアクション ──
  const [sentReactions, setSentReactions] = useState<Record<string, boolean>>({});

  const rKey = (type: ReactionType, eventId: string, receiverId: string | null) =>
    `${type}_${eventId}_${receiverId ?? 'null'}`;

  const fetchSentReactions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('reactions')
      .select('type, event_id, receiver_id')
      .eq('sender_id', user.id);
    if (data) {
      const map: Record<string, boolean> = {};
      data.forEach((d: any) => { map[rKey(d.type, d.event_id, d.receiver_id)] = true; });
      setSentReactions(map);
    }
  }, [user]);

  useEffect(() => { fetchSentReactions(); }, [fetchSentReactions]);

  const hasReacted = useCallback((type: ReactionType, eventId: string, receiverId: string | null) =>
    sentReactions[rKey(type, eventId, receiverId)] ?? false,
  [sentReactions]);

  const toggleReaction = useCallback(async (
    type: ReactionType, eventId: string, receiverId: string | null
  ) => {
    if (!user) return;
    if (receiverId && user.id === receiverId) return;
    const key = rKey(type, eventId, receiverId);
    const already = sentReactions[key];
    setSentReactions(prev => ({ ...prev, [key]: !already }));
    try {
      if (already) {
        let q = supabase.from('reactions').delete()
          .eq('sender_id', user.id).eq('event_id', eventId).eq('type', type);
        if (receiverId) q = q.eq('receiver_id', receiverId);
        else q = (q as any).is('receiver_id', null);
        await q;
      } else {
        await supabase.from('reactions').insert({
          event_id: eventId, sender_id: user.id,
          receiver_id: receiverId ?? null, type,
        });
      }
    } catch {
      setSentReactions(prev => ({ ...prev, [key]: already ?? false }));
    }
  }, [user, sentReactions]);

  return {
    sentGGs,
    receivedGGCount,
    receivedMannerCount,
    confirmedGGCount,
    loading,
    toggleGG,
    hasGGed,
    getGGCountForUser,
    hasReacted,
    toggleReaction,
    refresh: () => Promise.all([
      fetchSentGGs(), fetchReceivedGGs(), fetchReceivedManner(),
      fetchConfirmedGGs(), fetchSentReactions(),
    ]),
  };
}
