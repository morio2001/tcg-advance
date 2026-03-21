import { useState } from 'react';
import './index.css';
import type { TabId, ViewId, TcgEvent, RegisteredEvent, HistoryEntry, Deck } from './types';
import { IconHome, IconEvent, IconBattle, IconDeck, IconAccount } from './components/Icons';
import { EventsMain } from './pages/EventsMain';
import { EventSearchPage } from './pages/EventSearchPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { TournamentPage } from './pages/TournamentPage';
import { BattleMain, HistoryDetailPage } from './pages/BattlePages';
import { DeckMain, DeckDetailPage, DeckEditPage } from './pages/DeckPages';
import { AccountPage } from './pages/AccountPage';
import { HomeFeedPage, UserProfilePage } from './pages/SocialPages';
import { MOCK_FOLLOWING_IDS } from './data/mockData';

export default function App() {
  const [tab, setTab] = useState<TabId>('home');
  const [view, setView] = useState<ViewId>('main');
  const [selEvent, setSelEvent] = useState<TcgEvent | RegisteredEvent | null>(null);
  const [selHistory, setSelHistory] = useState<HistoryEntry | null>(null);
  const [selDeck, setSelDeck] = useState<Deck | null>(null);
  const [checkedIn, setCheckedIn] = useState<Record<string, boolean>>({});
  const [tournamentEvent, setTournamentEvent] = useState<TcgEvent | null>(null);
  const [selUserId, setSelUserId] = useState<string | null>(null);
  const [following, setFollowing] = useState<string[]>(MOCK_FOLLOWING_IDS);
  const [kudosedPosts, setKudosedPosts] = useState<Record<string, boolean>>({});

  const nav = (v: ViewId, data?: any) => {
    setView(v);
    if (v === 'detail') setSelEvent(data);
    else if (v === 'history-detail') setSelHistory(data);
    else if (v === 'deck-detail' || v === 'deck-edit') setSelDeck(data);
    else if (v === 'tournament') setTournamentEvent(data);
    else if (v === 'user-profile') setSelUserId(data);
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
    setFollowing(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleKudos = (postId: string) => {
    setKudosedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleUserClick = (userId: string) => {
    nav('user-profile', userId);
  };

  const renderContent = () => {
    if (tab === 'home') {
      if (view === 'main') return (
        <HomeFeedPage
          kudosedPosts={kudosedPosts}
          onKudos={toggleKudos}
          onUserClick={handleUserClick}
        />
      );
      if (view === 'user-profile' && selUserId) return (
        <UserProfilePage
          userId={selUserId}
          following={following}
          kudosedPosts={kudosedPosts}
          onKudos={toggleKudos}
          onFollow={toggleFollow}
          goBack={goBack}
        />
      );
    }
    if (tab === 'events') {
      if (view === 'main') return <EventsMain nav={nav} checkedIn={checkedIn} />;
      if (view === 'search') return <EventSearchPage nav={nav} goBack={goBack} />;
      if (view === 'detail') return <EventDetailPage event={selEvent} goBack={goBack} doCheckIn={doCheckIn} checkedIn={checkedIn} nav={nav} />;
      if (view === 'tournament') return <TournamentPage event={tournamentEvent} goBack={goBack} />;
    }
    if (tab === 'battle') {
      if (view === 'main') return <BattleMain nav={nav} />;
      if (view === 'history-detail') return <HistoryDetailPage history={selHistory} goBack={goBack} />;
    }
    if (tab === 'deck') {
      if (view === 'main') return <DeckMain nav={nav} />;
      if (view === 'deck-detail') return <DeckDetailPage deck={selDeck} goBack={goBack} nav={nav} />;
      if (view === 'deck-edit') return <DeckEditPage deck={selDeck} goBack={goBackToDeckDetail} />;
    }
    if (tab === 'account') return <AccountPage />;
    return null;
  };

  const tabs: { id: TabId; label: string; Icon: React.FC }[] = [
    { id: 'home',    label: 'ホーム',     Icon: IconHome },
    { id: 'events',  label: 'イベント',   Icon: IconEvent },
    { id: 'battle',  label: '戦績',       Icon: IconBattle },
    { id: 'deck',    label: 'デッキ',     Icon: IconDeck },
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
            cursor: 'pointer', padding: '4px 10px', transition: 'color 0.2s',
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
