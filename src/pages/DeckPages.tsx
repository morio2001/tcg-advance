import React, { useState, useRef } from 'react';
import type { ViewId, Deck, CardCategory } from '../types';
import { MOCK_MY_DECKS, ALL_CARDS } from '../data/mockData';
import { IconBack, IconChevRight, IconChevDown, IconChevUp, IconEdit, IconSearch } from '../components/Icons';
import { Tag } from '../components/Shared';

/* ─── Deck Main ─── */
interface DeckMainProps {
  nav: (view: ViewId, data?: any) => void;
}

export const DeckMain: React.FC<DeckMainProps> = ({ nav }) => (
  <div style={{ padding: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, flex: 1, background: 'linear-gradient(135deg, #a064ff, #ff64a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>マイデッキ</h1>
      <button
        onClick={() => nav('deck-community')}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'rgba(160,100,255,0.1)', border: '1px solid rgba(160,100,255,0.25)',
          borderRadius: '20px', padding: '6px 12px',
          color: '#a064ff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >🃏 シェアレシピ</button>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {MOCK_MY_DECKS.map(deck => (
        <div key={deck.id} onClick={() => nav('deck-detail', deck)} style={{
          background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(160,100,255,0.3)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f0f0f0' }}>{deck.name}</div>
            <div style={{ fontSize: '11px', color: '#556677', marginTop: '2px' }}>{deck.cards}/60枚 · {deck.isPublic ? '公開' : '非公開'}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag color={deck.cards === 60 ? 'green' : 'yellow'}>{deck.cards === 60 ? '完成' : '構築中'}</Tag>
            <span style={{ color: '#556677' }}><IconChevRight /></span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Deck Detail ─── */
interface DeckDetailProps {
  deck: Deck | null;
  goBack: () => void;
  nav: (view: ViewId, data?: any) => void;
}

const CAT_META: Record<CardCategory, { label: string; color: string }> = {
  pokemon: { label: 'ポケモン', color: '#00e0e0' },
  goods:   { label: 'グッズ', color: '#ffc800' },
  support: { label: 'サポート', color: '#ff64a0' },
  stadium: { label: 'スタジアム', color: '#00c878' },
  energy:  { label: 'エネルギー', color: '#3c82ff' },
};
const CAT_ORDER: CardCategory[] = ['pokemon', 'goods', 'support', 'stadium', 'energy'];

export const DeckDetailPage: React.FC<DeckDetailProps> = ({ deck, goBack, nav }) => {
  if (!deck) return null;

  const grouped: Partial<Record<CardCategory, typeof deck.cardList>> = {};
  deck.cardList.forEach(c => {
    const cat = c.cat ?? 'pokemon';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat]!.push(c);
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: '#00e0e0', cursor: 'pointer', padding: '4px' }}><IconBack /></button>
        <span style={{ fontSize: '16px', fontWeight: 700, flex: 1 }}>{deck.name}</span>
        <span style={{ fontSize: '13px', color: '#556677' }}>{deck.cards}/60</span>
      </div>
      <div style={{ padding: '0 16px 80px' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
          <Tag color={deck.cards === 60 ? 'green' : 'yellow'}>{deck.cards === 60 ? '完成' : '構築中'}</Tag>
          <Tag color={deck.isPublic ? 'cyan' : 'purple'}>{deck.isPublic ? '公開' : '非公開'}</Tag>
        </div>
        {CAT_ORDER.map(key => {
          const cards = grouped[key];
          if (!cards?.length) return null;
          const meta = CAT_META[key];
          const total = cards.reduce((s, c) => s + c.count, 0);
          return (
            <div key={key} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: meta.color }}>{meta.label}</span>
                <span style={{ fontSize: '10px', color: '#556677' }}>{total}枚</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {cards.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '12px' }}>
                    <span style={{ color: '#c0d0e0' }}>{c.name}</span>
                    <span style={{ color: '#8899aa', fontWeight: 600 }}>×{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <button onClick={() => nav('deck-edit', deck)} style={{
          width: '100%', padding: '12px', borderRadius: '10px', border: 'none', marginTop: '8px',
          background: 'linear-gradient(135deg, #a064ff, #ff64a0)', color: '#fff',
          fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}>
          <IconEdit /> デッキを編集
        </button>
      </div>
    </div>
  );
};

/* ─── Deck Edit ─── */
interface DeckEditProps {
  deck: Deck | null;
  goBack: () => void;
}

export const DeckEditPage: React.FC<DeckEditProps> = ({ deck, goBack }) => {
  const [cards, setCards] = useState<{ name: string; count: number }[]>(() =>
    deck?.cardList?.map(c => ({ name: c.name, count: c.count })) ?? []
  );
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const totalCards = cards.reduce((s, c) => s + c.count, 0);

  const addCard = (name: string) => {
    if (totalCards >= 60) return;
    setCards(prev => {
      const existing = prev.find(c => c.name === name);
      if (existing) {
        if (existing.count >= 4 && !name.includes('エネルギー')) return prev;
        return prev.map(c => c.name === name ? { ...c, count: c.count + 1 } : c);
      }
      return [...prev, { name, count: 1 }];
    });
  };

  const removeCard = (name: string) => {
    setCards(prev => {
      const existing = prev.find(c => c.name === name);
      if (!existing) return prev;
      if (existing.count <= 1) return prev.filter(c => c.name !== name);
      return prev.map(c => c.name === name ? { ...c, count: c.count - 1 } : c);
    });
  };

  const searchResults = query.length > 0 ? ALL_CARDS.filter(c => c.includes(query)).slice(0, 8) : [];
  const getCount = (name: string) => cards.find(c => c.name === name)?.count ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', flexShrink: 0 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: '#00e0e0', cursor: 'pointer', padding: '4px' }}><IconBack /></button>
        <span style={{ fontSize: '16px', fontWeight: 700, flex: 1 }}>{deck?.name}</span>
        <span style={{
          fontSize: '13px', fontWeight: 700,
          color: totalCards === 60 ? '#00c878' : totalCards > 60 ? '#ff5050' : '#ffc800',
        }}>{totalCards}/60</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px' }}>
        {cards.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#556677', padding: '40px 0', fontSize: '13px' }}>カードを下の検索から追加してください</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingBottom: '180px' }}>
            {cards.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '12px' }}>
                <span style={{ flex: 1, color: '#c0d0e0' }}>{c.name}</span>
                <button onClick={() => removeCard(c.name)} style={{
                  width: '26px', height: '26px', borderRadius: '6px', border: '1px solid rgba(255,80,80,0.3)',
                  background: 'rgba(255,80,80,0.1)', color: '#ff5050', cursor: 'pointer',
                  fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'inherit', lineHeight: 1,
                }}>−</button>
                <span style={{ color: '#8899aa', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>×{c.count}</span>
                <button onClick={() => addCard(c.name)} style={{
                  width: '26px', height: '26px', borderRadius: '6px', border: '1px solid rgba(0,200,120,0.3)',
                  background: 'rgba(0,200,120,0.1)', color: '#00c878', cursor: 'pointer',
                  fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'inherit', lineHeight: 1,
                }}>+</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{
        position: 'fixed', bottom: '70px', left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '430px',
        background: 'rgba(10,14,26,0.96)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)', padding: '8px 16px', zIndex: 50,
      }}>
        {searchResults.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '6px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '180px', overflow: 'auto' }}>
            {searchResults.map((name, i) => {
              const cnt = getCount(name);
              return (
                <button key={i} onClick={() => addCard(name)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: '6px', border: 'none',
                  background: cnt > 0 ? 'rgba(0,224,224,0.08)' : 'transparent',
                  color: '#e0e8f0', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: 'left', marginBottom: '2px',
                }}>
                  <span>{name}</span>
                  <span style={{ fontSize: '11px', color: cnt > 0 ? '#00e0e0' : '#556677' }}>{cnt > 0 ? `×${cnt}` : '+ 追加'}</span>
                </button>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <IconSearch />
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="カード名で検索して追加..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e0e8f0', fontSize: '14px', fontFamily: 'inherit' }} />
        </div>
      </div>
    </div>
  );
};
