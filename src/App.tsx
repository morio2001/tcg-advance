import { useState } from 'react';
import './index.css';
import type { TabId, ViewId, TcgEvent, RegisteredEvent, HistoryEntry, Deck } from './types';
import { IconHome, IconEvent, IconBattle, IconDeck, IconAccount, IconSearchNav } from './components/Icons';
import { EventsMain } from './pages/EventsMain';
import { EventSearchPage } from './pages/EventSearchPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { TournamentPage } from './pages/TournamentPage';
import { BattleMain, HistoryDetailPage } from './pages/BattlePages';
import { DeckMain, DeckDetailPage, DeckEditPage } from './pages/DeckPages';
import { AccountPage } from './pages/AccountPage';
import { HomeFeedPage, UserProfilePage } from './pages/SocialPages';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { RankingPage } from './pages/RankingPage';
import { PublicSearchPage, SearchHubPage } from './pages/PublicSearchPage';
import { CommunityDeckPage } from './pages/CommunityDeckPage';
import { LoginPage } from './pages/LoginPage';
import { ProfileEditPage } from './pages/ProfileEditPage';
import { LiveEventList, LiveEventDetail } from './pages/LiveEventPages';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { useEvents, type EventWithShop } from './hooks/useEvents';
import { useFollows } from './hooks/useFollows';
import { useReactions } from './hooks/useReactions';

export default function App() {
  const { user, loading, signInWithGoogle, signInWithFacebook, signInWithTwitter, signInWithLine, signOut, linkGoogle, linkTwitter, linkLine } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile(user);
  const { events: liveEvents, loading: eventsLoading } = useEvents();
  const { followingIds, followingCount, followersCount, toggleFollow: realToggleFollow } = useFollows(user);
  const { sentGGs, toggleGG: realToggleGG, hasGGed, receivedGGCount, receivedMannerCount, confirmedGGCount } = useReactions(user);

  const [tab, setTab] = useState<TabId>('home');
  const [view, setView] = useState<ViewId>('main');
  const [selEvent, setSelEvent] = useState<TcgEvent | RegisteredEvent | null>(null);
  const [selHistory, setSelHistory] = useState<HistoryEntry | null>(null);
  const [selDeck, setSelDeck] = useState<Deck | null>(null);
  const [checkedIn, setCheckedIn] = useState<Record<string, boolean>>({});
  const [tournamentEvent, setTournamentEvent] = useState<TcgEvent | null>(null);
  const [selUserId, setSelUserId] = useState<string | null>(null);
  const [ggPosts, setGgPosts] = useState<Record<string, boolean>>({});
  const [goingEvents, setGoingEvents] = useState<Record<string, boolean>>({});
  const [reservedEvents, setReservedEvents] = useState<Record<string, boolean>>({});
  const [selSearchTab, setSelSearchTab] = useState<'player' | 'deck'>('player');
  const [selLiveEvent, setSelLiveEvent] = useState<EventWithShop | null>(null);

  const nav = (v: ViewId, data?: any) => {
    setView(v);
    if (v === 'detail') setSelEvent(data);
    else if (v === 'history-detail') setSelHistory(data);
    else if (v === 'deck-detail' || v === 'deck-edit') setSelDeck(data);
    else if (v === 'tournament') setTournamentEvent(data);
    else if (v === 'user-profile') setSelUserId(data);
    else if (v === 'search-public') setSelSearchTab((data as 'player' | 'deck') || 'player');
    else if (v === 'live-detail') setSelLiveEvent(data);
  };

  const goBack = () => {
    setView('main');
    setSelEvent(null);
    setSelHistory(null);
    setSelDeck(null);
    setTournamentEvent(null);
    setSelUserId(null);
  };

  const goBackToDeckDetail = () => {
    setView('deck-detail');
  };

  const switchTab = (t: TabId) => {
    setTab(t);
    goBack();
  };

  const doCheckIn = (id: string) => {
    setCheckedIn(prev => ({ ...prev, [id]: true }));
  };

  const toggleFollow = (userId: string) => {
    realToggleFollow(userId);
  };

  const toggleGG = (postId: string) => {
    // モックフィードのGG（今はローカルstate、将来的にreactionsに移行）
    setGgPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleGoing = (eventId: string) => {
    setGoingEvents(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const toggleReserved = (eventId: string) => {
    setReservedEvents(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const handleUserClick = (userId: string) => {
    nav('user-profile', userId);
  };

  // 未ログインならログイン画面を表示
  if (!user) {
    return <LoginPage onGoogleLogin={signInWithGoogle} onFacebookLogin={signInWithFacebook} onTwitterLogin={signInWithTwitter} onLineLogin={signInWithLine} loading={loading} />;
  }

  // プロフィール読み込み中
  if (profileLoading) {
    return <LoginPage onGoogleLogin={signInWithGoogle} loading={true} />;
  }

  // プロフィール未設定（初回ログイン）
  if (profile && !profile.favorite_shop && (!profile.favorite_tcg || profile.favorite_tcg.length === 0)) {
    return (
      <div style={{
        width: '100%', maxWidth: '430px', margin: '0 auto', height: '100vh',
        display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1220 50%, #0a0e1a 100%)',
        color: '#e0e8f0', fontFamily: "'Noto Sans JP', -apple-system, sans-serif",
        overflow: 'auto',
      }}>
        <ProfileEditPage
          profile={profile}
          onSave={updateProfile}
          goBack={() => {}}
          isFirstSetup
        />
      </div>
    );
  }

  const UnderConstruction = ({ label }: { label: string }) => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '60vh', gap: '16px', padding: '32px',
    }}>
      <div style={{ fontSize: '48px' }}>🚧</div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#e0e8f0' }}>{label}</div>
      <div style={{ fontSize: '13px', color: '#556677', textAlign: 'center', lineHeight: 1.6 }}>
        現在開発中です。<br />もうしばらくお待ちください。
      </div>
    </div>
  );

  const renderContent = () => {
    if (tab === 'home') {
      if (view === 'main') return (
        <HomeFeedPage
          ggPosts={ggPosts}
          onGG={toggleGG}
          onUserClick={handleUserClick}
          goingEvents={goingEvents}
          reservedEvents={reservedEvents}
          userProfile={profile}
          followingCount={followingCount}
          followersCount={followersCount}
          receivedGGCount={receivedGGCount}
          receivedMannerCount={receivedMannerCount}
          confirmedGGCount={confirmedGGCount}
        />
      );
      if (view === 'user-profile' && selUserId) return (
        <UserProfilePage
          userId={selUserId}
          following={followingIds}
          ggPosts={ggPosts}
          onGG={toggleGG}
          onFollow={toggleFollow}
          goBack={goBack}
        />
      );
    }
    if (tab === 'search') {
      return <UnderConstruction label="検索" />;
    }
    if (tab === 'events') {
      if (view === 'main') return <LiveEventList events={liveEvents} loading={eventsLoading} onEventClick={(e) => nav('live-detail', e)} />;
      if (view === 'live-detail' && selLiveEvent) return <LiveEventDetail event={selLiveEvent} userId={user.id} goBack={goBack} />;
    }
    if (tab === 'battle') {
      return <UnderConstruction label="戦績" />;
    }
    if (tab === 'deck') {
      return <UnderConstruction label="デッキ" />;
    }
    if (tab === 'account') {
      if (view === 'main') return <AccountPage nav={nav} onSignOut={signOut} />;
      if (view === 'public-profile') return <PublicProfilePage goBack={goBack} />;
      if (view === 'profile-edit' && profile) return (
        <ProfileEditPage profile={profile} onSave={updateProfile} goBack={goBack} user={user} onLinkGoogle={linkGoogle} onLinkTwitter={linkTwitter} onLinkLine={linkLine} />
      );
    }
    return null;
  };

  const tabs: { id: TabId; label: string; Icon: React.FC }[] = [
    { id: 'home',    label: 'ホーム',     Icon: IconHome },
    { id: 'events',  label: 'イベント',   Icon: IconEvent },
    { id: 'battle',  label: '戦績',       Icon: IconBattle },
    { id: 'deck',    label: 'デッキ',     Icon: IconDeck },
    { id: 'search',  label: '検索',       Icon: IconSearchNav },
    { id: 'account', label: 'アカウント', Icon: IconAccount },
  ];

  return (
    <div style={{
      width: '100%', maxWidth: '430px', margin: '0 auto', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1220 50%, #0a0e1a 100%)',
      color: '#e0e8f0', fontFamily: "'Noto Sans JP', -apple-system, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: '70px' }}>
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '430px', display: 'flex', justifyContent: 'space-around',
        alignItems: 'center', padding: '8px 0 env(safe-area-inset-bottom, 16px)',
        background: 'linear-gradient(180deg, rgba(10,14,26,0.92) 0%, rgba(10,14,26,0.99) 100%)',
        backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', zIndex: 100,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => switchTab(t.id)} style={{
            background: 'none', border: 'none',
            color: tab === t.id ? '#00e0e0' : '#556677',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            cursor: 'pointer', padding: '4px 6px', transition: 'color 0.2s',
          }}>
            <t.Icon />
            <span style={{ fontSize: '10px', fontWeight: tab === t.id ? 700 : 500 }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
