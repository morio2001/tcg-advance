import React, { useState, useEffect, useCallback } from 'react';
import type { EventWithShop } from '../hooks/useEvents';
import { getDistanceMeters, doCheckIn, isCheckedIn, getEventParticipants } from '../hooks/useEvents';
import { supabase } from '../lib/supabase';
import type { ReactionType } from '../hooks/useReactions';

/* ─── イベント一覧（実データ） ─── */
interface LiveEventListProps {
  events: EventWithShop[];
  loading: boolean;
  onEventClick: (event: EventWithShop) => void;
}

export const LiveEventList: React.FC<LiveEventListProps> = ({ events, loading, onEventClick }) => {
  const [search, setSearch] = useState('');

  const filtered = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.shop?.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#556677' }}>
        読み込み中...
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#00e0e0', margin: '0 0 14px', letterSpacing: '-0.5px' }}>イベント</h2>

      {/* 検索バー */}
      <div style={{ marginBottom: '12px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 イベント・店舗名で検索"
          style={{
            width: '100%', padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', color: '#e0e8f0',
            fontSize: '14px', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* イベントリスト */}
      {filtered.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: '#445566' }}>
          イベントが見つかりません
        </div>
      ) : (
        filtered.map(event => (
          <button
            key={event.id}
            onClick={() => onEventClick(event)}
            style={{
              width: '100%', padding: '14px 16px', marginBottom: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', cursor: 'pointer',
              color: '#e0e8f0', textAlign: 'left',
              fontFamily: 'inherit', display: 'block',
            }}
          >
            {/* タグ */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
              {event.tags?.map((tag, i) => (
                <span key={i} style={{
                  fontSize: '10px', padding: '2px 8px',
                  background: 'rgba(0,224,224,0.1)',
                  border: '1px solid rgba(0,224,224,0.2)',
                  borderRadius: '10px', color: '#00e0e0',
                }}>{tag}</span>
              ))}
            </div>

            {/* イベント名 */}
            <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
              {event.name}
            </div>

            {/* 店舗・日時 */}
            <div style={{ fontSize: '12px', color: '#8090a0', marginBottom: '4px' }}>
              📍 {event.shop?.name}
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#556677' }}>
              <span>📅 {event.date}</span>
              {event.time_start && <span>🕐 {event.time_start.slice(0, 5)}</span>}
              {event.capacity && <span>👥 {event.checkin_count}/{event.capacity}</span>}
              {event.fee && <span>💰 {event.fee}</span>}
            </div>
          </button>
        ))
      )}
    </div>
  );
};

/* ─── イベント詳細（実データ + GPSチェックイン） ─── */
interface LiveEventDetailProps {
  event: EventWithShop;
  userId: string;
  goBack: () => void;
}

type Participant = { id: string; display_name: string; avatar_url: string };

export const LiveEventDetail: React.FC<LiveEventDetailProps> = ({ event, userId, goBack }) => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checking, setChecking] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'success' | 'too_far' | 'error'>('idle');
  const [errorDetail, setErrorDetail] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [checkLoading, setCheckLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sentReactions, setSentReactions] = useState<Record<string, boolean>>({});
  const [orgGood, setOrgGood] = useState(false);

  const rKey = (type: ReactionType, receiverId: string) => `${type}_${receiverId}`;

  const loadParticipants = useCallback(async () => {
    const list = await getEventParticipants(event.id, userId);
    setParticipants(list);
  }, [event.id, userId]);

  const loadSentReactions = useCallback(async () => {
    const { data } = await supabase
      .from('reactions')
      .select('type, receiver_id')
      .eq('sender_id', userId)
      .eq('event_id', event.id);
    if (data) {
      const map: Record<string, boolean> = {};
      data.forEach((d: any) => { map[rKey(d.type, d.receiver_id ?? 'null')] = true; });
      setSentReactions(map);
      setOrgGood(data.some((d: any) => d.type === 'good_organizer' && d.receiver_id === null));
    }
  }, [userId, event.id]);

  const toggleReaction = async (type: ReactionType, receiverId: string) => {
    if (userId === receiverId) return;
    const key = rKey(type, receiverId);
    const already = sentReactions[key];
    setSentReactions(prev => ({ ...prev, [key]: !already }));
    try {
      if (already) {
        await supabase.from('reactions').delete()
          .eq('sender_id', userId).eq('receiver_id', receiverId)
          .eq('event_id', event.id).eq('type', type);
      } else {
        await supabase.from('reactions').insert({
          event_id: event.id, sender_id: userId, receiver_id: receiverId, type,
        });
      }
    } catch {
      setSentReactions(prev => ({ ...prev, [key]: already ?? false }));
    }
  };

  const toggleOrgGood = async () => {
    const next = !orgGood;
    setOrgGood(next);
    try {
      if (!next) {
        await (supabase.from('reactions').delete()
          .eq('sender_id', userId).eq('event_id', event.id)
          .eq('type', 'good_organizer') as any).is('receiver_id', null);
      } else {
        await supabase.from('reactions').insert({
          event_id: event.id, sender_id: userId, receiver_id: null, type: 'good_organizer',
        });
      }
    } catch {
      setOrgGood(!next);
    }
  };

  // チェックイン状態確認
  useEffect(() => {
    isCheckedIn(userId, event.id).then(result => {
      setCheckedIn(result);
      setCheckLoading(false);
      if (result) {
        loadParticipants();
        loadSentReactions();
      }
    });
  }, [userId, event.id, loadParticipants, loadSentReactions]);

  const handleCheckIn = async () => {
    if (!event.shop?.latitude || !event.shop?.longitude) {
      setGpsStatus('error');
      setErrorDetail('店舗の位置情報が未設定です');
      return;
    }

    if (!navigator.geolocation) {
      setGpsStatus('error');
      setErrorDetail('このブラウザは位置情報に対応していません');
      return;
    }

    setChecking(true);
    setGpsStatus('locating');
    setErrorDetail('');

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

      const dist = getDistanceMeters(
        pos.coords.latitude, pos.coords.longitude,
        event.shop.latitude, event.shop.longitude
      );
      setDistance(Math.round(dist));

      const radius = event.shop.checkin_radius_m || 300;

      if (dist <= radius) {
        const result = await doCheckIn(userId, event.id, pos.coords.latitude, pos.coords.longitude);
        if (result.success) {
          setCheckedIn(true);
          setGpsStatus('success');
          loadParticipants();
          loadSentReactions();
        } else {
          if (result.error === 'すでにチェックイン済みです') {
            setCheckedIn(true);
            setGpsStatus('success');
          } else {
            setGpsStatus('error');
            setErrorDetail(result.error || 'チェックイン処理に失敗しました');
          }
        }
      } else {
        setGpsStatus('too_far');
      }
    } catch (err: any) {
      setGpsStatus('error');
      const code = err?.code;
      if (code === 1) {
        setErrorDetail('位置情報の使用が許可されていません。ブラウザの設定で位置情報を許可してください');
      } else if (code === 2) {
        setErrorDetail('位置情報を取得できませんでした。PCの場合はWi-Fiが有効か確認してください');
      } else if (code === 3) {
        setErrorDetail('位置情報の取得がタイムアウトしました。再度お試しください');
      } else {
        setErrorDetail(`エラー: ${err?.message || '不明なエラー'}`);
      }
    }
    setChecking(false);
  };

  // テスト用：GPS不要でチェックイン（開発環境のみ）
  const handleTestCheckIn = async () => {
    setChecking(true);
    const lat = event.shop?.latitude || 0;
    const lng = event.shop?.longitude || 0;
    const result = await doCheckIn(userId, event.id, lat, lng);
    if (result.success || result.error === 'すでにチェックイン済みです') {
      setCheckedIn(true);
      setGpsStatus('success');
      loadParticipants();
      loadSentReactions();
    } else {
      setGpsStatus('error');
      setErrorDetail(result.error || 'チェックイン処理に失敗しました');
    }
    setChecking(false);
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={goBack} style={{
          background: 'none', border: 'none', color: '#00e0e0',
          fontSize: '18px', cursor: 'pointer', padding: '4px 8px', marginRight: '8px',
        }}>←</button>
        <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, flex: 1 }}>
          イベント詳細
        </h2>
      </div>

      {/* イベント名 */}
      <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 12px', color: '#e8f4ff' }}>
        {event.name}
      </h3>

      {/* タグ */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {event.tags?.map((tag, i) => (
          <span key={i} style={{
            fontSize: '11px', padding: '3px 10px',
            background: 'rgba(0,224,224,0.1)',
            border: '1px solid rgba(0,224,224,0.2)',
            borderRadius: '12px', color: '#00e0e0',
          }}>{tag}</span>
        ))}
      </div>

      {/* 詳細情報 */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '16px', marginBottom: '16px',
      }}>
        {[
          { icon: '📍', label: '会場', value: event.shop?.name },
          { icon: '🗺️', label: '住所', value: event.shop?.address },
          { icon: '📅', label: '日付', value: event.date },
          { icon: '🕐', label: '時間', value: event.time_start ? event.time_start.slice(0, 5) + (event.time_end ? ' ~ ' + event.time_end.slice(0, 5) : '') : '' },
          { icon: '👥', label: '定員', value: event.capacity ? `${event.capacity}名` : '' },
          { icon: '💰', label: '参加費', value: event.fee },
          { icon: '📋', label: 'レギュ', value: event.regulation },
          { icon: '🏢', label: '主催', value: event.organizer },
        ].filter(item => item.value).map(item => (
          <div key={item.label} style={{
            display: 'flex', gap: '8px', padding: '6px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            fontSize: '13px',
          }}>
            <span style={{ width: '24px', textAlign: 'center' }}>{item.icon}</span>
            <span style={{ color: '#667788', width: '50px', flexShrink: 0 }}>{item.label}</span>
            <span style={{ color: '#c0d0e0' }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* グッドオーガナイザー */}
      {checkedIn && (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', padding: '14px 16px',
          marginBottom: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#c0d0e0' }}>主催者を評価</div>
            <div style={{ fontSize: '11px', color: '#556677', marginTop: '2px' }}>{event.organizer}</div>
          </div>
          <button
            onClick={toggleOrgGood}
            style={{
              padding: '7px 16px', fontSize: '12px', fontWeight: 700,
              borderRadius: '10px', cursor: 'pointer', border: 'none',
              background: orgGood ? '#ffd060' : 'rgba(255,255,255,0.08)',
              color: orgGood ? '#0a0e1a' : '#667788',
              transition: 'all 0.15s',
            }}
          >
            {orgGood ? '🏆 グッドオーガナイザー!' : '🏆 グッドオーガナイザー'}
          </button>
        </div>
      )}

      {/* 説明 */}
      {event.description && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px', padding: '14px', marginBottom: '16px',
          fontSize: '13px', color: '#8090a0', lineHeight: '1.6',
        }}>
          {event.description}
        </div>
      )}

      {/* 参加者一覧（チェックイン済みの場合） */}
      {checkedIn && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#8090a0', marginBottom: '10px' }}>
            同じイベントの参加者
          </div>
          {participants.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#445566', padding: '12px 0' }}>
              まだ他の参加者がいません
            </div>
          ) : (
            participants.map(p => {
              const initial = p.display_name?.charAt(0) || '?';
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', marginBottom: '6px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                }}>
                  {/* アバター */}
                  {p.avatar_url ? (
                    <img src={p.avatar_url} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00e0e0, #0080ff)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 800, color: '#0a0e1a', flexShrink: 0,
                    }}>{initial}</div>
                  )}
                  {/* 名前 */}
                  <div style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#c0d0e0', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.display_name || '名無し'}
                  </div>
                  {/* ボタン群 */}
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {([
                      { type: 'gg' as ReactionType, label: 'GG', color: '#00e0e0' },
                      { type: 'good_manner' as ReactionType, label: 'マナー👍', color: '#a0c0ff' },
                    ]).map(({ type, label, color }) => {
                      const active = sentReactions[rKey(type, p.id)];
                      return (
                        <button key={type} onClick={() => toggleReaction(type, p.id)} style={{
                          padding: '5px 10px', fontSize: '11px', fontWeight: 700,
                          borderRadius: '8px', cursor: 'pointer', border: 'none',
                          background: active ? color : 'rgba(255,255,255,0.08)',
                          color: active ? '#0a0e1a' : '#667788',
                          transition: 'all 0.15s',
                        }}>{label}</button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* チェックインボタン */}
      <div style={{
        background: checkedIn ? 'rgba(0,200,120,0.08)' : 'rgba(0,224,224,0.06)',
        border: `1px solid ${checkedIn ? 'rgba(0,200,120,0.2)' : 'rgba(0,224,224,0.15)'}`,
        borderRadius: '16px', padding: '20px', textAlign: 'center',
      }}>
        {checkLoading ? (
          <div style={{ color: '#556677', fontSize: '13px' }}>確認中...</div>
        ) : checkedIn ? (
          <>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#00c878' }}>
              チェックイン済み
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📍</div>
            <div style={{ fontSize: '13px', color: '#8090a0', marginBottom: '12px' }}>
              会場付近（{event.shop?.checkin_radius_m || 300}m以内）でチェックインできます
            </div>

            <button
              onClick={handleCheckIn}
              disabled={checking}
              style={{
                padding: '12px 32px',
                background: checking ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #00e0e0, #00b0d0)',
                border: 'none', borderRadius: '12px',
                color: checking ? '#556677' : '#0a0e1a',
                fontSize: '15px', fontWeight: 800, cursor: checking ? 'default' : 'pointer',
                boxShadow: checking ? 'none' : '0 4px 16px rgba(0,224,224,0.25)',
              }}
            >
              {checking ? (gpsStatus === 'locating' ? '📡 位置情報取得中...' : '処理中...') : 'チェックイン'}
            </button>

            {/* GPSステータス */}
            {gpsStatus === 'too_far' && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#ff6080' }}>
                ❌ 会場から{distance}m離れています（{event.shop?.checkin_radius_m || 300}m以内でチェックインできます）
              </div>
            )}
            {gpsStatus === 'error' && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#ff6080' }}>
                ❌ {errorDetail || '位置情報を取得できませんでした'}
              </div>
            )}

            {/* テスト用チェックインボタン（GPS不要） */}
            {(gpsStatus === 'error' || gpsStatus === 'too_far') && (
              <button
                onClick={handleTestCheckIn}
                disabled={checking}
                style={{
                  marginTop: '12px', padding: '8px 20px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px dashed rgba(255,255,255,0.2)',
                  borderRadius: '10px', cursor: 'pointer',
                  color: '#778899', fontSize: '12px', fontWeight: 600,
                }}
              >
                🧪 テスト用チェックイン（GPS不要）
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
