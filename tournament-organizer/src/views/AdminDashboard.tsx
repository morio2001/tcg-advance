import React, { useMemo, useState } from 'react';
import type { Match, MatchStatus, Tournament } from '../types';
import { C } from '../theme';
import { champion, currentRound, maxRound } from '../lib/bracket';
import { useNow, useStore } from '../store';
import { Button, Card, Icon, ICONS } from '../components/ui';
import { MatchCard } from './MatchCard';
import { MatchDetailModal } from './MatchDetailModal';
import { AnnouncementsPanel } from './AnnouncementsPanel';

type Filter = 'all' | 'live' | 'ready' | 'stream' | 'done';

const Stat: React.FC<{ label: string; value: React.ReactNode; color?: string }> = ({ label, value, color = C.text }) => (
  <div style={{ flex: 1, minWidth: 92 }}>
    <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    <div style={{ fontSize: 10.5, color: C.textDim, marginTop: 2 }}>{label}</div>
  </div>
);

const roundName = (t: Tournament, r: number): string => {
  const mr = maxRound(t);
  const fromEnd = mr - r;
  if (fromEnd === 0) return '決勝';
  if (fromEnd === 1) return '準決勝';
  if (fromEnd === 2) return '準々決勝';
  return `${r}回戦`;
};

export const AdminDashboard: React.FC<{ t: Tournament }> = ({ t }) => {
  const now = useNow();
  const { dispatch } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const main = t.matches.filter((m) => m.bracket === 'main');
  const third = t.matches.find((m) => m.bracket === 'third');
  const mr = maxRound(t);
  const cur = currentRound(t);
  const champ = champion(t);

  const counts = useMemo(() => {
    const c: Record<MatchStatus, number> = { pending: 0, ready: 0, live: 0, overtime: 0, done: 0, void: 0 };
    for (const m of t.matches) c[m.status]++;
    const realLive = t.matches.filter((m) => m.status === 'live' || m.status === 'overtime').length;
    const realDone = t.matches.filter((m) => (m.status === 'done' && !m.isBye)).length;
    const realTotal = t.matches.filter((m) => !m.isBye && m.bracket === 'main').length;
    return { ...c, realLive, realDone, realTotal };
  }, [t.matches]);

  const match = openId ? t.matches.find((m) => m.id === openId) ?? null : null;

  const matchPasses = (m: Match) => {
    if (filter === 'all') return true;
    if (filter === 'stream') return m.isStream;
    if (filter === 'live') return m.status === 'live' || m.status === 'overtime';
    return m.status === filter;
  };

  const rounds: { r: number; matches: Match[] }[] = [];
  for (let r = 1; r <= mr; r++) {
    const ms = main.filter((m) => m.round === r && matchPasses(m)).sort((a, b) => a.order - b.order);
    if (ms.length) rounds.push({ r, matches: ms });
  }
  const thirdShown = third && matchPasses(third) ? third : null;

  const readyInCur = main.filter((m) => m.round === cur && m.status === 'ready').length;
  const progress = counts.realTotal ? Math.round((counts.realDone / counts.realTotal) * 100) : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 16, alignItems: 'start' }}>
      <div>
        {/* summary */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Stat label="進捗" value={`${progress}%`} color={C.accent} />
            <Stat label="現在" value={champ ? '完了' : roundName(t, cur)} />
            <Stat label="進行中" value={counts.realLive} color={C.live} />
            <Stat label="待機中" value={counts.ready} color={'#5cc8ff'} />
            <Stat label="完了" value={`${counts.realDone}/${counts.realTotal}`} />
            <div style={{ flex: 1 }} />
            {!champ && (
              <Button
                variant="primary"
                disabled={readyInCur === 0}
                onClick={() => dispatch({ type: 'START_ROUND', round: cur, at: Date.now() })}
              >
                <Icon d={ICONS.play} size={13} /> {roundName(t, cur)}を一斉開始 ({readyInCur})
              </Button>
            )}
          </div>
          {champ && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,194,74,0.1)', border: `1px solid ${C.warn}55`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon d={ICONS.trophy} size={20} color={C.warn} />
              <span style={{ fontSize: 14, fontWeight: 800, color: C.warn }}>優勝: {champ.name}</span>
              {champ.deck && <span style={{ fontSize: 12, color: C.textDim }}>{champ.deck}</span>}
            </div>
          )}
        </Card>

        {/* filters */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {([
            ['all', 'すべて'],
            ['live', '進行中'],
            ['ready', '待機中'],
            ['stream', '配信卓'],
            ['done', '完了'],
          ] as [Filter, string][]).map(([f, label]) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
                border: `1px solid ${filter === f ? C.accent : C.border}`,
                background: filter === f ? 'rgba(23,105,214,0.12)' : 'transparent',
                color: filter === f ? C.accent : C.textDim,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* matches by round */}
        {rounds.map(({ r, matches }) => (
          <div key={r} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: r === cur ? C.accent : C.textDim }}>{roundName(t, r)}</span>
              {r === cur && !champ && <span style={{ fontSize: 10, color: C.accent, background: 'rgba(23,105,214,0.12)', padding: '2px 7px', borderRadius: 6, fontWeight: 700 }}>現在</span>}
              <span style={{ fontSize: 11, color: C.textFaint }}>{matches.length}試合</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} t={t} now={now} onClick={() => setOpenId(m.id)} />
              ))}
            </div>
          </div>
        ))}
        {thirdShown && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.textDim, marginBottom: 8 }}>3位決定戦</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
              <MatchCard match={thirdShown} t={t} now={now} onClick={() => setOpenId(thirdShown.id)} />
            </div>
          </div>
        )}
        {rounds.length === 0 && !thirdShown && (
          <div style={{ padding: 30, textAlign: 'center', color: C.textFaint, fontSize: 13 }}>該当する試合がありません。</div>
        )}
      </div>

      {/* side: announcements */}
      <div style={{ position: 'sticky', top: 16 }}>
        <AnnouncementsPanel t={t} now={now} editable />
      </div>

      <MatchDetailModal match={match} t={t} now={now} onClose={() => setOpenId(null)} />
    </div>
  );
};
