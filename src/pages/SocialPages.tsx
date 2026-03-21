import React, { useState } from 'react';
import type { FeedPost, SocialUser, Challenge } from '../types';
import { MOCK_FEED_POSTS, MOCK_SOCIAL_USERS, MOCK_CHALLENGES } from '../data/mockData';
import { IconBack } from '../components/Icons';
import { SectionHeader } from '../components/Shared';

const CURRENT_SEASON = '2026-1Q';

// My (logged-in user) stats
const MY_STATS = {
  lifetime: { events: 47, wins: 31, championships: 3, level: 12, levelXp: 450, levelXpMax: 600 },
  season:   { events: 3,  wins: 8,  championships: 1 },
};

// March 2026 event days (day number → type)
const MARCH_EVENTS: Record<number, 'registered' | 'other'> = {
  10: 'registered', 16: 'other', 17: 'other',
  18: 'other', 19: 'other', 21: 'other', 22: 'registered',
};
const CALENDAR_TODAY = 21;

const placementColor = (p: string): string => {
  if (p.startsWith('優勝') || p.startsWith('1位')) return '#ffc800';
  if (p.startsWith('準優勝') || p.startsWith('2位')) return '#b8c4d4';
  if (p.startsWith('3位')) return '#c08040';
  return '#8899aa';
};

/* ─── FeedCard ─── */
interface FeedCardProps {
  post: FeedPost;
  isGGed: boolean;
  onGG: (id: string) => void;
  onUserClick: (userId: string) => void;
  showUserLink?: boolean;
}

const FeedCard: React.FC<FeedCardProps> = ({ post, isGGed, onGG, onUserClick, showUserLink = true }) => {
  const pColor = placementColor(post.placement);
  const ggTotal = post.kudosCount + (isGGed ? 1 : 0);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px', padding: '14px', marginBottom: '10px',
    }}>
      {showUserLink && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div
            onClick={() => onUserClick(post.userId)}
            style={{
              width: 38, height: 38, borderRadius: '50%', background: post.avatarColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px', fontWeight: 700, color: '#fff', cursor: 'pointer', flexShrink: 0,
            }}
          >{post.avatarInitial}</div>
          <div style={{ flex: 1 }}>
            <div
              onClick={() => onUserClick(post.userId)}
              style={{ fontSize: '13px', fontWeight: 700, color: '#e0e8f0', cursor: 'pointer' }}
            >{post.userName}</div>
            <div style={{ fontSize: '11px', color: '#445566' }}>{post.postedAt} · {post.eventDate}</div>
          </div>
        </div>
      )}

      <div style={{ fontSize: '13px', fontWeight: 600, color: '#c0d0e0', marginBottom: '8px' }}>
        {post.eventName}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '8px', padding: '8px 12px', marginBottom: '12px',
      }}>
        <span style={{ fontSize: '15px', fontWeight: 800, color: pColor }}>{post.placement}</span>
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#b0c0d0' }}>{post.result}</div>
          <div style={{ fontSize: '11px', color: '#556677' }}>使用デッキ: {post.deckName}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => onGG(post.id)}
          style={{
            background: isGGed ? 'rgba(0,224,224,0.15)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isGGed ? 'rgba(0,224,224,0.35)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: '20px', padding: '5px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '5px',
            color: isGGed ? '#00e0e0' : '#778899',
            fontSize: '12px', fontWeight: 700, transition: 'all 0.2s',
          }}
        >
          <span>🎮</span><span>GG!</span>
        </button>
        {ggTotal > 0 && (
          <span style={{ fontSize: '12px', color: '#556677' }}>{ggTotal}人がGG!</span>
        )}
      </div>
    </div>
  );
};

/* ─── StatsCard ─── */
const StatsCard: React.FC = () => {
  const [mode, setMode] = useState<'lifetime' | 'season'>('lifetime');
  const isLifetime = mode === 'lifetime';
  const stats = isLifetime ? MY_STATS.lifetime : MY_STATS.season;
  const xpPct = (MY_STATS.lifetime.levelXp / MY_STATS.lifetime.levelXpMax) * 100;

  const StatBox: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div style={{ flex: 1, padding: '4px 6px' }}>
      <div style={{ fontSize: '10px', color: '#556677', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 800, color: '#e0e8f0', lineHeight: 1 }}>
        {value.toLocaleString()}
      </div>
    </div>
  );

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0,80,140,0.25), rgba(0,20,50,0.5))',
      border: '1px solid rgba(0,180,255,0.15)',
      borderRadius: '14px', padding: '14px', userSelect: 'none',
    }}>
      {/* Toggle */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
        {(['lifetime', 'season'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              background: mode === m ? 'rgba(0,224,224,0.18)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${mode === m ? 'rgba(0,224,224,0.4)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '20px', padding: '3px 12px', cursor: 'pointer',
              color: mode === m ? '#00e0e0' : '#556677',
              fontSize: '11px', fontWeight: 700, transition: 'all 0.2s',
            }}
          >
            {m === 'lifetime' ? 'Lifetime' : CURRENT_SEASON}
          </button>
        ))}
      </div>

      {/* LV + Stats layout */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
        {/* LV column */}
        <div style={{
          width: '96px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: '12px',
        }}>
          <div style={{ fontSize: '9px', color: '#445566', letterSpacing: '1.5px', marginBottom: '2px' }}>LEVEL</div>
          <div style={{ fontSize: '42px', fontWeight: 900, color: '#00e0e0', lineHeight: 1, marginBottom: '10px' }}>
            {MY_STATS.lifetime.level}
          </div>
          <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginBottom: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${xpPct}%`,
              background: 'linear-gradient(90deg, #0060a0, #00e0e0)',
              borderRadius: '3px',
            }} />
          </div>
          <div style={{ fontSize: '10px', color: '#334455' }}>
            {MY_STATS.lifetime.levelXp}/{MY_STATS.lifetime.levelXpMax} XP
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
          {/* Row 1 */}
          <div style={{ display: 'flex', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <StatBox label="大会参加" value={stats.events} />
            <StatBox label="勝利数" value={stats.wins} />
          </div>
          {/* Row 2 */}
          <div style={{ display: 'flex' }}>
            <StatBox label="優勝数" value={stats.championships} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── CalendarCard ─── */
const CalendarCard: React.FC = () => {
  const DAYS = ['日', '月', '火', '水', '木', '金', '土'];
  // March 2026 starts on Sunday (day 0)
  const cells: (number | null)[] = [
    ...Array(0).fill(null),
    ...Array.from({ length: 31 }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(80,0,140,0.2), rgba(20,0,50,0.5))',
      border: '1px solid rgba(140,60,255,0.15)',
      borderRadius: '14px', padding: '14px', userSelect: 'none',
    }}>
      <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#b090f0', marginBottom: '10px' }}>
        2026年3月
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
        {DAYS.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: '10px',
            color: i === 0 ? '#ff7777' : i === 6 ? '#7799ff' : '#445566',
            paddingBottom: '4px',
          }}>{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
        {cells.map((day, idx) => {
          const col = idx % 7;
          const isToday = day === CALENDAR_TODAY;
          const eventType = day ? MARCH_EVENTS[day] : undefined;
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0' }}>
              <div style={{
                width: 26, height: 26,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                background: isToday ? 'rgba(0,224,224,0.2)' : 'transparent',
                border: isToday ? '1px solid rgba(0,224,224,0.5)' : '1px solid transparent',
                fontSize: '11px',
                color: day == null ? 'transparent'
                  : col === 0 ? '#ff8888'
                  : col === 6 ? '#8899ff'
                  : '#a0b0c0',
                fontWeight: isToday ? 700 : 400,
              }}>
                {day ?? ''}
              </div>
              {eventType && (
                <div style={{
                  width: 4, height: 4, borderRadius: '50%', marginTop: '1px',
                  background: eventType === 'registered' ? '#00e0e0' : 'rgba(255,255,255,0.25)',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '14px', marginTop: '10px', justifyContent: 'center' }}>
        {[
          { color: '#00e0e0', label: '参加予定' },
          { color: 'rgba(255,255,255,0.3)', label: '大会あり' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#445566' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── ChallengeItem ─── */
const CAT_COLORS: Record<string, string> = {
  event: '#ffc800', battle: '#00e0e0', social: '#a064ff',
};

const ChallengeItem: React.FC<{ challenge: Challenge }> = ({ challenge }) => {
  const pct = Math.min((challenge.progress / challenge.goal) * 100, 100);
  const color = CAT_COLORS[challenge.category] ?? '#8899aa';

  return (
    <div style={{
      background: challenge.completed ? 'rgba(0,200,120,0.06)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${challenge.completed ? 'rgba(0,200,120,0.2)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '10px', padding: '12px', marginBottom: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#e0e8f0' }}>{challenge.title}</span>
            {challenge.completed && (
              <span style={{
                fontSize: '10px', background: 'rgba(0,200,120,0.2)', color: '#00c878',
                border: '1px solid rgba(0,200,120,0.3)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600,
              }}>達成済み</span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: '#556677' }}>{challenge.description}</div>
        </div>
        <div style={{ flexShrink: 0, marginLeft: '10px', textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: color, fontWeight: 700 }}>+{challenge.xpReward} XP</div>
        </div>
      </div>

      {challenge.completed ? (
        <div style={{ fontSize: '11px', color: '#00c878' }}>✓ クリア！経験値を獲得しました</div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', color: '#778899' }}>{challenge.progress} / {challenge.goal} {challenge.unit}</span>
            <span style={{ fontSize: '11px', color: '#445566' }}>{Math.round(pct)}%</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: `linear-gradient(90deg, ${color}66, ${color})`,
              borderRadius: '2px',
            }} />
          </div>
        </>
      )}
    </div>
  );
};

/* ─── HomeFeedPage ─── */
interface HomeFeedPageProps {
  ggPosts: Record<string, boolean>;
  onGG: (id: string) => void;
  onUserClick: (userId: string) => void;
}

export const HomeFeedPage: React.FC<HomeFeedPageProps> = ({ ggPosts, onGG, onUserClick }) => {
  const [slide, setSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const TOTAL_SLIDES = 2;

  const suggestions = MOCK_SOCIAL_USERS.filter(u => !['u1', 'u2', 'u4'].includes(u.id));
  const completedCount = MOCK_CHALLENGES.filter(c => c.completed).length;

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#00e0e0', marginBottom: '14px', letterSpacing: '-0.5px' }}>
        ホーム
      </h2>

      {/* Carousel */}
      <div
        style={{ overflow: 'hidden', marginBottom: '10px' }}
        onTouchStart={e => setTouchStartX(e.touches[0].clientX)}
        onTouchEnd={e => {
          if (touchStartX === null) return;
          const diff = touchStartX - e.changedTouches[0].clientX;
          if (diff > 40) setSlide(s => Math.min(s + 1, TOTAL_SLIDES - 1));
          else if (diff < -40) setSlide(s => Math.max(s - 1, 0));
          setTouchStartX(null);
        }}
      >
        <div style={{
          display: 'flex',
          transform: `translateX(-${slide * 100}%)`,
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <div style={{ minWidth: '100%' }}><StatsCard /></div>
          <div style={{ minWidth: '100%' }}><CalendarCard /></div>
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '22px' }}>
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <div
            key={i}
            onClick={() => setSlide(i)}
            style={{
              width: slide === i ? 18 : 6, height: 6, borderRadius: 3,
              background: slide === i ? '#00e0e0' : 'rgba(255,255,255,0.2)',
              transition: 'all 0.3s', cursor: 'pointer',
            }}
          />
        ))}
      </div>

      {/* Feed */}
      <SectionHeader title="フォロー中の大会結果" count={MOCK_FEED_POSTS.length} />
      <div style={{ marginBottom: '8px' }}>
        {MOCK_FEED_POSTS.map(post => (
          <FeedCard key={post.id} post={post} isGGed={ggPosts[post.id] ?? false} onGG={onGG} onUserClick={onUserClick} />
        ))}
      </div>

      {/* Suggestions */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: '#445566', marginBottom: '8px' }}>おすすめのプレイヤー</div>
        {suggestions.map(user => (
          <div
            key={user.id}
            onClick={() => onUserClick(user.id)}
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px', padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: '10px',
              cursor: 'pointer', marginBottom: '6px',
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: user.avatarColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>{user.avatarInitial}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#e0e8f0' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: '#445566' }}>
                LV.{user.level} · 大会{user.totalEvents}回 · {user.totalWins}勝
              </div>
            </div>
            <span style={{ fontSize: '11px', color: '#00e0e0', fontWeight: 600 }}>→</span>
          </div>
        ))}
      </div>

      {/* Challenges */}
      <SectionHeader
        title="チャレンジ"
        subtitle={`${completedCount}/${MOCK_CHALLENGES.length}クリア · クリアで経験値獲得！`}
      />
      {MOCK_CHALLENGES.map(ch => (
        <ChallengeItem key={ch.id} challenge={ch} />
      ))}
    </div>
  );
};

/* ─── UserProfilePage ─── */
interface UserProfilePageProps {
  userId: string;
  following: string[];
  ggPosts: Record<string, boolean>;
  onGG: (id: string) => void;
  onFollow: (userId: string) => void;
  goBack: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  userId, following, ggPosts, onGG, onFollow, goBack,
}) => {
  const [mode, setMode] = useState<'lifetime' | 'season'>('lifetime');
  const user = MOCK_SOCIAL_USERS.find(u => u.id === userId);
  if (!user) return null;

  const isFollowing = following.includes(userId);
  const userPosts = MOCK_FEED_POSTS.filter(p => p.userId === userId);
  const isLifetime = mode === 'lifetime';
  const xpPct = (user.levelXp / user.levelXpMax) * 100;

  const StatBox: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div style={{ flex: 1, padding: '4px 6px' }}>
      <div style={{ fontSize: '10px', color: '#556677', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 800, color: '#e0e8f0', lineHeight: 1 }}>{value}</div>
    </div>
  );

  return (
    <div style={{ padding: '16px' }}>
      {/* Back */}
      <button
        onClick={goBack}
        style={{
          background: 'none', border: 'none', color: '#00e0e0',
          display: 'flex', alignItems: 'center', gap: '4px',
          cursor: 'pointer', padding: '0', marginBottom: '20px',
          fontSize: '14px', fontWeight: 600,
        }}
      >
        <IconBack /> 戻る
      </button>

      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: user.avatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>{user.avatarInitial}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#e0e8f0', marginBottom: '2px' }}>{user.name}</div>
          <div style={{ fontSize: '12px', color: '#00e0e0', fontWeight: 700 }}>LV.{user.level}</div>
          <div style={{ fontSize: '11px', color: '#556677' }}>最近: {user.recentDeck}</div>
        </div>
        <button
          onClick={() => onFollow(userId)}
          style={{
            background: isFollowing ? 'rgba(255,255,255,0.06)' : 'rgba(0,224,224,0.15)',
            border: `1px solid ${isFollowing ? 'rgba(255,255,255,0.15)' : 'rgba(0,224,224,0.4)'}`,
            borderRadius: '20px', padding: '7px 16px', cursor: 'pointer',
            color: isFollowing ? '#778899' : '#00e0e0',
            fontSize: '12px', fontWeight: 700, transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
        >
          {isFollowing ? 'フォロー中' : 'フォローする'}
        </button>
      </div>

      {/* LV Bar */}
      <div style={{
        background: 'rgba(0,80,140,0.15)', border: '1px solid rgba(0,180,255,0.1)',
        borderRadius: '10px', padding: '10px 14px', marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: '#445566' }}>NEXT LEVEL</span>
          <span style={{ fontSize: '11px', color: '#445566' }}>{user.levelXp} / {user.levelXpMax} XP</span>
        </div>
        <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${xpPct}%`,
            background: 'linear-gradient(90deg, #0060a0, #00e0e0)', borderRadius: '3px',
          }} />
        </div>
      </div>

      {/* Stats toggle */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        {(['lifetime', 'season'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              background: mode === m ? 'rgba(0,224,224,0.18)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${mode === m ? 'rgba(0,224,224,0.4)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '20px', padding: '3px 12px', cursor: 'pointer',
              color: mode === m ? '#00e0e0' : '#556677',
              fontSize: '11px', fontWeight: 700, transition: 'all 0.2s',
            }}
          >{m === 'lifetime' ? 'Lifetime' : CURRENT_SEASON}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '12px', marginBottom: '20px',
      }}>
        <StatBox label="大会参加" value={isLifetime ? user.totalEvents : user.seasonEvents} />
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <StatBox label="勝利数" value={isLifetime ? user.totalWins : user.seasonWins} />
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <StatBox label="優勝数" value={isLifetime ? user.totalChampionships : user.seasonChampionships} />
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ flex: 1, textAlign: 'center', padding: '4px 6px' }}>
          <div style={{ fontSize: '10px', color: '#556677', marginBottom: '2px' }}>
            {isFollowing ? 'フォロワー' : 'フォロワー'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#e0e8f0', lineHeight: 1 }}>
            {isFollowing ? user.followers + 1 : user.followers}
          </div>
        </div>
      </div>

      {/* Recent results */}
      <SectionHeader title="大会結果" count={userPosts.length} />
      {userPosts.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#556677', padding: '24px', fontSize: '13px' }}>
          まだ記録がありません
        </div>
      ) : (
        userPosts.map(post => (
          <FeedCard key={post.id} post={post} isGGed={ggPosts[post.id] ?? false} onGG={onGG} onUserClick={() => {}} showUserLink={false} />
        ))
      )}
    </div>
  );
};
