import React, { useState } from 'react';
import type { ViewId } from '../types';
import { IconBack, IconSearch } from '../components/Icons';
import { MOCK_SOCIAL_USERS, TCG_GAMES } from '../data/mockData';

/* ─── Mock community decks for search ─── */
const DECK_RESULTS = [
  { id: 'd1', name: 'リザードンex', creator: 'ヒカリ', initial: 'ヒ', color: '#9040b0', cards: 60, likes: 67, tcg: 'ptcg', tag: '環境トップ' },
  { id: 'd2', name: 'パオジアンex', creator: 'カスミ', initial: 'カ', color: '#4080d0', cards: 60, likes: 38, tcg: 'ptcg', tag: '大会優勝構築' },
  { id: 'd3', name: 'ミライドンex', creator: 'タケシ', initial: 'タ', color: '#c04040', cards: 60, likes: 42, tcg: 'ptcg', tag: '安定型' },
  { id: 'd4', name: 'ルギアVSTAR',  creator: 'シゲル', initial: 'シ', color: '#40a040', cards: 60, likes: 22, tcg: 'ptcg', tag: 'エクストラ' },
  { id: 'd5', name: 'テツノカイナex', creator: 'コトネ', initial: 'コ', color: '#b06020', cards: 60, likes: 15, tcg: 'ptcg', tag: '個性派' },
];

/* ─── SearchHubPage ─── */
interface SearchHubProps {
  nav: (view: ViewId, data?: any) => void;
}

export const SearchHubPage: React.FC<SearchHubProps> = ({ nav }) => {
  const CATEGORIES = [
    {
      icon: '👤',
      label: 'ユーザー検索',
      desc: 'プレイヤーを名前で探す',
      color: '#00e0e0',
      action: () => nav('search-public', 'player'),
    },
    {
      icon: '🃏',
      label: 'デッキ検索',
      desc: 'シェアされたレシピを探す',
      color: '#a064ff',
      action: () => nav('search-public', 'deck'),
    },
    {
      icon: '📅',
      label: 'イベント検索',
      desc: '大会・ジムバトルを探す',
      color: '#ffc800',
      action: () => nav('search'),
    },
  ];

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#00e0e0', margin: '0 0 6px', letterSpacing: '-0.5px' }}>検索</h2>
      <p style={{ fontSize: '12px', color: '#445566', margin: '0 0 20px' }}>何を検索しますか？</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.label}
            onClick={cat.action}
            style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '18px 16px', borderRadius: '14px', border: `1px solid ${cat.color}25`,
              background: `${cat.color}08`,
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${cat.color}15`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${cat.color}08`; }}
          >
            <span style={{ fontSize: '32px', lineHeight: 1 }}>{cat.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: cat.color, marginBottom: '3px' }}>
                {cat.label}
              </div>
              <div style={{ fontSize: '12px', color: '#556677' }}>{cat.desc}</div>
            </div>
            <span style={{ fontSize: '16px', color: cat.color, opacity: 0.6 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─── PublicSearchPage ─── */
interface Props {
  goBack: () => void;
  onUserClick: (userId: string) => void;
  initialTab?: 'player' | 'deck';
}

export const PublicSearchPage: React.FC<Props> = ({ goBack, onUserClick, initialTab = 'player' }) => {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'player' | 'deck'>(initialTab);

  const filteredUsers = MOCK_SOCIAL_USERS.filter(u =>
    query === '' || u.name.includes(query) || u.recentDeck.includes(query)
  );
  const filteredDecks = DECK_RESULTS.filter(d =>
    query === '' || d.name.includes(query) || d.creator.includes(query)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <button onClick={goBack} style={{ background: 'none', border: 'none', color: '#00e0e0', cursor: 'pointer', padding: '4px' }}>
            <IconBack />
          </button>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#e0e8f0', flex: 1 }}>公開検索</span>
        </div>

        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '10px 14px', marginBottom: '12px',
        }}>
          <span style={{ color: '#445566' }}><IconSearch /></span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={tab === 'player' ? 'プレイヤー名で検索...' : 'デッキ名・作者で検索...'}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#e0e8f0', fontSize: '14px', fontFamily: 'inherit',
            }}
          />
          {query !== '' && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: '#445566', cursor: 'pointer', fontSize: '16px', padding: '0' }}>×</button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '3px', marginBottom: '12px' }}>
          {([['player', '👤 プレイヤー'], ['deck', '🃏 デッキレシピ']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)} style={{
              flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: tab === val ? 'rgba(0,224,224,0.12)' : 'transparent',
              color: tab === val ? '#00e0e0' : '#556677',
              fontSize: '12px', fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
        {tab === 'player' && (
          <>
            <div style={{ fontSize: '11px', color: '#445566', marginBottom: '8px' }}>{filteredUsers.length}件</div>
            {filteredUsers.map(user => {
              const userTcgs = (user.tcgs || []).slice(0, 3).map(id => TCG_GAMES.find(g => g.id === id)).filter(Boolean);
              return (
                <div
                  key={user.id}
                  onClick={() => onUserClick(user.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px', marginBottom: '6px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: user.avatarColor, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 700, color: '#fff',
                  }}>{user.avatarInitial}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#e0e8f0', marginBottom: '3px' }}>{user.name}</div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', color: '#445566' }}>LV.{user.level}</span>
                      <span style={{ fontSize: '10px', color: '#334455' }}>·</span>
                      <span style={{ fontSize: '10px', color: '#445566' }}>優勝{user.totalChampionships}回</span>
                      {userTcgs.map(g => g && (
                        <span key={g.id} style={{ fontSize: '9px', color: g.color, background: `${g.color}15`, border: `1px solid ${g.color}30`, borderRadius: '8px', padding: '1px 5px' }}>
                          {g.emoji} {g.short}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#00e0e0' }}>→</span>
                </div>
              );
            })}
          </>
        )}

        {tab === 'deck' && (
          <>
            <div style={{ fontSize: '11px', color: '#445566', marginBottom: '8px' }}>{filteredDecks.length}件</div>
            {filteredDecks.map(deck => {
              const game = TCG_GAMES.find(g => g.id === deck.tcg);
              return (
                <div key={deck.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px', marginBottom: '6px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  {/* Creator avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: deck.color, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 700, color: '#fff',
                  }}>{deck.initial}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#e0e8f0' }}>{deck.name}</span>
                      {game && (
                        <span style={{ fontSize: '9px', color: game.color, background: `${game.color}15`, border: `1px solid ${game.color}30`, borderRadius: '8px', padding: '1px 5px' }}>
                          {game.emoji}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '10px', color: '#445566' }}>
                      {deck.creator} · {deck.cards}枚
                      {deck.tag && <span style={{ marginLeft: '6px', color: '#334455', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', padding: '1px 5px', fontSize: '9px' }}>{deck.tag}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#ff6080' }}>♥ {deck.likes}</div>
                    <div style={{ fontSize: '9px', color: '#445566' }}>いいね</div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
