import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Shop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  checkin_radius_m: number;
}

export interface EventWithShop {
  id: string;
  name: string;
  description: string;
  date: string;
  time_start: string;
  time_end: string | null;
  capacity: number;
  fee: string;
  regulation: string;
  tags: string[];
  organizer: string;
  shop: Shop;
  checkin_count: number;
}

export function useEvents() {
  const [events, setEvents] = useState<EventWithShop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        shop:shops(*),
        check_ins(count)
      `)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('イベント取得エラー:', error.message);
    } else {
      const mapped = (data || []).map((e: any) => ({
        ...e,
        shop: e.shop,
        checkin_count: e.check_ins?.[0]?.count || 0,
      }));
      setEvents(mapped);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  return { events, loading, refetch: fetchEvents };
}

// GPS距離計算（ハバーサイン公式）
export function getDistanceMeters(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// チェックイン
export async function doCheckIn(
  userId: string,
  eventId: string,
  userLat: number,
  userLon: number
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('check_ins')
    .insert({
      user_id: userId,
      event_id: eventId,
      latitude: userLat,
      longitude: userLon,
    });

  if (error) {
    if (error.code === '23505') return { success: false, error: 'すでにチェックイン済みです' };
    return { success: false, error: error.message };
  }
  return { success: true };
}

// チェックイン済みか確認
export async function isCheckedIn(userId: string, eventId: string): Promise<boolean> {
  const { data } = await supabase
    .from('check_ins')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single();
  return !!data;
}

// 同じイベントにチェックインした参加者一覧（自分以外）
export async function getEventParticipants(
  eventId: string,
  currentUserId: string
): Promise<{ id: string; display_name: string; avatar_url: string }[]> {
  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('user_id')
    .eq('event_id', eventId)
    .neq('user_id', currentUserId);

  if (!checkIns || checkIns.length === 0) return [];

  const userIds = checkIns.map((c: any) => c.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', userIds);

  return (profiles ?? []) as { id: string; display_name: string; avatar_url: string }[];
}
