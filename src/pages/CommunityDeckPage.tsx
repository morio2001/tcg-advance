import React, { useState } from 'react';
import { IconBack } from '../components/Icons';
import { TCG_GAMES } from '../data/mockData';

/* ─── Mock community deck data ─── */
interface CommunityDeck {
  id: string;
  name: string;
  creator: string;
  initial: string;
  color: string;
  cards: number;
  likes: number;
  views: number;
  tcg: string;
  tags: string[];
  updatedAt: string;
}

const COMMUNITY_DECKS: CommunityDeck[] = [
  { id: 'cd1', name: 'ミライドンex', creator: 'ヒカリ', initial: 'ヒ', color: '#9040b0', cards: 60, likes: 67, views: 312, tcg: 'ptcg', tags: ['環境トップ', '安定型'], updatedAt: '1時間前' },
  { id: 'cd2', name: 'パオジアンex', creator: 'カスミ', initial: 'カ', color: '#4080d0', cards: 60, likes: 54, views: 241, tcg: 'ptcg', tags: ['大会優勝', 'シティリーグ'], updatedAt: '3時間前' },
  { id: 'cd3', name: 'リザードンex', creator: 'タケシ', initial: 'タ', color: '#c04040', cards: 60, likes: 42, views: 198, tcg: 'ptcg', tags: ['環境', 'スタンダード'], updatedAt: '昨日' },
  { id: 'cd4', name: 'ルギアVSTAR',  creator: 'シゲル', initial: 'シ', color: '#40a040', cards: 60, likes: 28, views: 134, tcg: 'ptcg', tags: ['エクストラ'], updatedAt: '2日前' },
  { id: 'cd5', name: 'テツノカイナex', creator: 'コトネ', initial: 'コ', color: '#b06020', cards: 60, likes: 19, views: 88, tcg: 'ptcg', tags: ['個性派', 'トリッキー'], updatedAt: '3日前' },
  { id: 'cd6', name: 'サーナイトex', creator: 'アカネ', initial: 'ア', color: '#c06080', cards: 60, likes: 61, views: 277, tcg: 'ptcg', tags: ['tier1', '大会実績あり'], updatedAt: '4時間前' },
  { id: 'cd7', name: 'カビゴンLO', creator: 'マサト', initial: 'マ', color: '#206080', cards: 60, likes: 33, views: 156, tcg: 'ptcg', tags: ['コントロール', '上級者向け'], updatedAt: '2日前' },
  { id: 'cd8', name: 'ドラパルトex', creator: 'イブキ', initial: 'イ', color: '#4060c0', cards: 60, likes: 45, views: 203, tcg: 'ptcg', tags: ['最新弾', '注目株'], updatedAt: '5時間前' },
];

const SORT_OPTIONS = [
  { value: 'likes', label: 'いいね順' },
  { value: 'views', label: '閲覧数順' },
  { value: 'updated', label: '更新順' },
] as const;

interface Props {
  goBack: () => void;
}

export const CommunityDeckPage: React.FC<Props> = ({ goBack }) => {
  const [sort, setSort] = useState<'likes' | 'views' | 'updated'>('likes');
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [filterTcg, setFilterTcg] = useState<string | null>(null);

  const sorted = [...COMMUNITY_DECKS]
    .filter(d => filterTcg === null || d.tcg === filterTcg)
    .sort((a, b) => sort === 'likes' ? b.likes - a.likes : sort === 'views' ? b.views - a.views : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <button onClick={goBack} style={{ background: 'none', border: 'none', color: '#00e0e0', cursor: 'pointer', padding: '4px' }}>
            <IconBack />
          </button>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#e0e8f0', flex: 1 }}>🃏 シェアレシピ</span>
        </div>

        {/* TCG filter */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            onClick={() => setFilterTcg(null)}
            style={{
              padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: filterTcg === null ? 'rgba(0,224,224,0.15)' : 'rgba(255,255,255,0.05)',
              color: filterTcg === null ? '#00e0e0' : '#556677',
              fontSize: '11px', fontWeight: 700, fontFamily: 'inherit',
            }}
          >すべて</button>
          {TCG_GAMES.map(g => (
            <button
              key={g.id}
              onClick={() => setFilterTcg(g.id === filterTcg ? null : g.id)}
              style={{
                padding: '4px 10px', borderRadius: '20px', border: `1px solid ${filterTcg === g.id ? g.color + '60' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', whiteSpace: 'nowrap',
                background: filterTcg === g.id ? `${g.color}15` : 'rgba(255,255,255,0.03)',
                color: filterTcg === g.id ? g.color : '#445566',
                fontSize: '11px', fontWeight: 700, fontFamily: 'inherit',
              }}
            >{g.emoji} {g.short}</button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          {SORT_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => setSort(o.value)}
              style={{
                padding: '4px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                background: sort === o.value ? 'rgba(160,100,255,0.15)' : 'rgba(255,255,255,0.04)',
                color: sort === o.value ? '#a064ff' : '#445566',
                fontSize: '11px', fontWeight: 700, fontFamily: 'inherit',
              }}
            >{o.label}</button>
          ))}
        </div>
      </div>

      {/* Deck list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
        <div style={{ fontSize: '11px', color: '#445566', marginBottom: '8px' }}>{sorted.length}件</div>
        {sorted.map(deck => {
          const game = TCG_GAMES.find(g => g.id === deck.tcg);
          const isLiked = liked[deck.id] ?? false;
          const likeCount = deck.likes + (isLiked ? 1 : 0);
          return (
            <div key={deck.id} style={{
              padding: '14px', marginBottom: '8px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: deck.color, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px', fontWeight: 700, color: '#fff',
                }}>{deck.initial}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#e8f0f8' }}>{deck.name}</span>
                    {game && (
                      <span style={{ fontSize: '10px', color: game.color, background: `${game.color}18`, border: `1px solid ${game.color}35`, borderRadius: '10px', padding: '2px 7px' }}>
                        {game.emoji} {game.short}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#445566' }}>
                    {deck.creator} · {deck.cards}枚 · {deck.updatedAt}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {deck.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: '10px', color: '#8899aa', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '2px 7px',
                  }}>#{tag}</span>
                ))}
              </div>

              {/* Bottom: stats + actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Like button */}
                <button
                  onClick={() => setLiked(prev => ({ ...prev, [deck.id]: !prev[deck.id] }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    background: isLiked ? 'rgba(255,80,120,0.12)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isLiked ? 'rgba(255,80,120,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '20px', padding: '5px 12px',
                    color: isLiked ? '#ff5080' : '#556677',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{isLiked ? '♥' : '♡'}</span> {likeCount}
                </button>

                <span style={{ fontSize: '10px', color: '#334455' }}>👁 {deck.views}</span>

                <div style={{ flex: 1 }} />

                {/* View button */}
                <button style={{
                  padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit',
                  background: 'rgba(0,224,224,0.1)', border: '1px solid rgba(0,224,224,0.25)',
                  color: '#00e0e0', fontSize: '12px', fontWeight: 700,
                }}>
                  レシピを見る →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
