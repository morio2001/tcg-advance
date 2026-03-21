import React from 'react';
import type { FeedPost, SocialUser } from '../types';
import { MOCK_FEED_POSTS, MOCK_SOCIAL_USERS } from '../data/mockData';
import { IconBack } from '../components/Icons';
import { SectionHeader } from '../components/Shared';

const placementColor = (p: string): string => {
  if (p.startsWith('優勝') || p.startsWith('1位')) return '#ffc800';
  if (p.startsWith('準優勝') || p.startsWith('2位')) return '#b8c4d4';
  if (p.startsWith('3位')) return '#c08040';
  return '#8899aa';
};

/* ─── FeedCard ─── */
interface FeedCardProps {
  post: FeedPost;
  isKudosed: boolean;
  onKudos: (id: string) => void;
  onUserClick: (userId: string) => void;
}

const FeedCard: React.FC<FeedCardProps> = ({ post, isKudosed, onKudos, onUserClick }) => {
  const pColor = placementColor(post.placement);
  const kudosTotal = post.kudosCount + (isKudosed ? 1 : 0);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '14px',
      marginBottom: '10px',
    }}>
      {/* User row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div
          onClick={() => onUserClick(post.userId)}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: post.avatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', fontWeight: 700, color: '#fff',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          {post.avatarInitial}
        </div>
        <div style={{ flex: 1 }}>
          <div
            onClick={() => onUserClick(post.userId)}
            style={{ fontSize: '13px', fontWeight: 700, color: '#e0e8f0', cursor: 'pointer' }}
          >
            {post.userName}
          </div>
          <div style={{ fontSize: '11px', color: '#445566' }}>{post.postedAt} · {post.eventDate}</div>
        </div>
      </div>

      {/* Event name */}
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#c0d0e0', marginBottom: '8px' }}>
        {post.eventName}
      </div>

      {/* Result badge */}
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

      {/* Kudos row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => onKudos(post.id)}
          style={{
            background: isKudosed ? 'rgba(0,224,224,0.15)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isKudosed ? 'rgba(0,224,224,0.35)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: '20px',
            padding: '5px 14px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '5px',
            color: isKudosed ? '#00e0e0' : '#778899',
            fontSize: '12px', fontWeight: 700,
            transition: 'all 0.2s',
          }}
        >
          <span>⚡</span>
          <span>Kudos!</span>
        </button>
        {kudosTotal > 0 && (
          <span style={{ fontSize: '12px', color: '#556677' }}>{kudosTotal}人がKudos!</span>
        )}
      </div>
    </div>
  );
};

/* ─── HomeFeedPage ─── */
interface HomeFeedPageProps {
  kudosedPosts: Record<string, boolean>;
  onKudos: (id: string) => void;
  onUserClick: (userId: string) => void;
}

export const HomeFeedPage: React.FC<HomeFeedPageProps> = ({ kudosedPosts, onKudos, onUserClick }) => {
  const followingSuggestions = MOCK_SOCIAL_USERS.filter(u => !['u1', 'u2', 'u4'].includes(u.id));

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{
        fontSize: '22px', fontWeight: 800, color: '#00e0e0',
        marginBottom: '16px', letterSpacing: '-0.5px',
      }}>
        ホーム
      </h2>

      {/* Feed */}
      <SectionHeader title="フォロー中の大会結果" count={MOCK_FEED_POSTS.length} />
      <div style={{ marginBottom: '20px' }}>
        {MOCK_FEED_POSTS.map(post => (
          <FeedCard
            key={post.id}
            post={post}
            isKudosed={kudosedPosts[post.id] ?? false}
            onKudos={onKudos}
            onUserClick={onUserClick}
          />
        ))}
      </div>

      {/* Suggestions */}
      <SectionHeader title="おすすめのプレイヤー" subtitle="フォローしてみませんか？" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {followingSuggestions.map(user => (
          <div
            key={user.id}
            onClick={() => onUserClick(user.id)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '12px',
              display: 'flex', alignItems: 'center', gap: '12px',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: user.avatarColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {user.avatarInitial}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#e0e8f0' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: '#556677' }}>大会{user.totalEvents}回 · 勝率{user.winRate}</div>
            </div>
            <span style={{ fontSize: '11px', color: '#00e0e0', fontWeight: 600 }}>プロフィール →</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── UserProfilePage ─── */
interface UserProfilePageProps {
  userId: string;
  following: string[];
  kudosedPosts: Record<string, boolean>;
  onKudos: (id: string) => void;
  onFollow: (userId: string) => void;
  goBack: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  userId, following, kudosedPosts, onKudos, onFollow, goBack,
}) => {
  const user = MOCK_SOCIAL_USERS.find(u => u.id === userId);
  if (!user) return null;

  const isFollowing = following.includes(userId);
  const userPosts = MOCK_FEED_POSTS.filter(p => p.userId === userId);

  const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: '18px', fontWeight: 800, color: '#e0e8f0' }}>{value}</div>
      <div style={{ fontSize: '10px', color: '#556677', marginTop: '2px' }}>{label}</div>
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
          width: 64, height: 64, borderRadius: '50%',
          background: user.avatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {user.avatarInitial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#e0e8f0', marginBottom: '4px' }}>
            {user.name}
          </div>
          <div style={{ fontSize: '12px', color: '#556677' }}>最近のデッキ: {user.recentDeck}</div>
        </div>
        <button
          onClick={() => onFollow(userId)}
          style={{
            background: isFollowing ? 'rgba(255,255,255,0.06)' : 'rgba(0,224,224,0.15)',
            border: `1px solid ${isFollowing ? 'rgba(255,255,255,0.15)' : 'rgba(0,224,224,0.4)'}`,
            borderRadius: '20px', padding: '7px 16px',
            cursor: 'pointer',
            color: isFollowing ? '#778899' : '#00e0e0',
            fontSize: '12px', fontWeight: 700,
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
        >
          {isFollowing ? 'フォロー中' : 'フォローする'}
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '14px',
        marginBottom: '20px', gap: '4px',
      }}>
        <StatBox label="大会参加" value={user.totalEvents} />
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <StatBox label="勝率" value={user.winRate} />
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <StatBox label="フォロー" value={user.following} />
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <StatBox label="フォロワー" value={isFollowing ? user.followers + 1 : user.followers} />
      </div>

      {/* Recent results */}
      <SectionHeader title="大会結果" count={userPosts.length} />
      {userPosts.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#556677', padding: '24px', fontSize: '13px' }}>
          まだ記録がありません
        </div>
      ) : (
        userPosts.map(post => (
          <FeedCard
            key={post.id}
            post={post}
            isKudosed={kudosedPosts[post.id] ?? false}
            onKudos={onKudos}
            onUserClick={() => {}}
          />
        ))
      )}
    </div>
  );
};
