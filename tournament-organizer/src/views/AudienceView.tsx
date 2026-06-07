import React from 'react';
import type { Match, Role, Tournament } from '../types';
import { C } from '../theme';
import { champion, currentRound, maxRound, participant } from '../lib/bracket';
import { hhmm } from '../lib/format';
import { useNow, useStore } from '../store';
import { Card, Icon, ICONS, StatusPill, Tag } from '../components/ui';
import { MatchCard } from './MatchCard';
import { AnnouncementsPanel } from './AnnouncementsPanel';
import { Bracket } from './Bracket';

const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 11.5, color: C.textFaint, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 14, border: `1px dashed ${C.border}` }}>
    {children}
  </div>
);

const Grid: React.FC<{ items: Match[]; t: Tournament; now: number }> = ({ items, t, now }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 10 }}>
    {items.map((m) => (
      <MatchCard key={m.id} match={m} t={t} now={now} />
    ))}
  </div>
);

const order = (m: Match) => (m.status === 'live' || m.status === 'overtime' ? 0 : m.status === 'ready' ? 1 : m.status === 'pending' ? 2 : 3);

export const AudienceView: React.FC<{ t: Tournament; role: Role }> = ({ t, role }) => {
  const now = useNow();
  const { state, dispatch } = useStore();
  const main = t.matches.filter((m) => m.bracket === 'main');

  // ----- Broadcast: stream tables, now/next -----
  if (role === 'broadcast') {
    const stream = t.matches.filter((m) => m.isStream).sort((a, b) => order(a) - order(b));
    return (
      <Layout side={<AnnouncementsPanel t={t} now={now} editable={false} audience="broadcast" />}>
        <Note>配信スタッフ向けプレビュー（読み取り）。配信卓フラグ・選手のデッキ/所属など、テロップ素材になる情報を優先表示します。配信状況の入力は今後このロールに追加予定です。</Note>
        <SectionTitle icon={ICONS.monitor} color={C.stream} label={`配信卓 (${stream.length})`} />
        {stream.length === 0 ? (
          <Empty>配信卓フラグの付いた試合はありません。</Empty>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stream.map((m) => {
              const pa = participant(t, m.slots[0].participantId);
              const pb = participant(t, m.slots[1].participantId);
              return (
                <Card key={m.id} style={{ padding: 12, borderColor: `${C.stream}55` }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    {m.table && <Tag color={C.accent}>卓{m.table}</Tag>}
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.textDim }}>{m.label}</span>
                    {m.streamNote && <span style={{ fontSize: 11, color: C.stream }}>{m.streamNote}</span>}
                    <div style={{ flex: 1 }} />
                    <MatchCardStatus m={m} now={now} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[pa, pb].map((p, i) => (
                      <div key={i} style={{ flex: 1, padding: 10, borderRadius: 9, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 10, color: C.textFaint }}>SEED {p?.seed ?? '–'}</div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{p?.name ?? '未定'}</div>
                        <div style={{ fontSize: 12, color: C.accent }}>{p?.deck ?? ''}</div>
                        <div style={{ fontSize: 11, color: C.textDim }}>{p?.affiliation ?? ''}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Layout>
    );
  }

  // ----- Floor: per-table -----
  if (role === 'floor') {
    const tables = Array.from(new Set(t.matches.map((m) => m.table).filter(Boolean) as string[])).sort(
      (a, b) => Number(a) - Number(b),
    );
    const sel = state.selectedTable;
    const items = main.filter((m) => (sel ? m.table === sel : true)).sort((a, b) => order(a) - order(b));
    return (
      <Layout side={<AnnouncementsPanel t={t} now={now} editable={false} audience="floor" />}>
        <Note>フロアスタッフ向けプレビュー（読み取り）。担当卓を選ぶとその卓の試合だけ表示します。開始/結果/インシデント報告の入力は今後このロールに追加予定です。</Note>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <TableChip label="全卓" active={!sel} onClick={() => dispatch({ type: 'SET_TABLE', table: null })} />
          {tables.map((tb) => (
            <TableChip key={tb} label={`卓${tb}`} active={sel === tb} onClick={() => dispatch({ type: 'SET_TABLE', table: tb })} />
          ))}
        </div>
        {items.length === 0 ? <Empty>この卓の試合はありません。</Empty> : <Grid items={items} t={t} now={now} />}
      </Layout>
    );
  }

  // ----- Stage: timeline -----
  if (role === 'stage') {
    const items = main.filter((m) => !m.isBye).sort((a, b) => order(a) - order(b) || a.round - b.round || a.order - b.order);
    return (
      <Layout side={<AnnouncementsPanel t={t} now={now} editable={false} audience="stage" />}>
        <Note>ステージ進行向けプレビュー（読み取り）。進行中→待機→未確定の順で、開始時刻・残り時間・延長を一覧します。登壇呼び出しの目安に。</Note>
        <SectionTitle icon={ICONS.clock} color={C.accent} label="進行タイムライン" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((m) => (
            <Card key={m.id} style={{ padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              {m.table && <Tag color={C.accent}>卓{m.table}</Tag>}
              {m.isStream && <Tag color={C.stream}>配信</Tag>}
              <span style={{ fontSize: 12, color: C.textDim, width: 90 }}>{m.label}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {participant(t, m.slots[0].participantId)?.name ?? '未定'} vs {participant(t, m.slots[1].participantId)?.name ?? '未定'}
              </span>
              {m.startedAt && <span style={{ fontSize: 11, color: C.textFaint }}>開始 {hhmm(m.startedAt)}</span>}
              <MatchCardStatus m={m} now={now} />
            </Card>
          ))}
        </div>
      </Layout>
    );
  }

  // ----- Client: curated summary -----
  const champ = champion(t);
  const mr = maxRound(t);
  const cur = currentRound(t);
  const realTotal = main.filter((m) => !m.isBye).length;
  const realDone = main.filter((m) => m.status === 'done' && !m.isBye).length;
  const progress = realTotal ? Math.round((realDone / realTotal) * 100) : 0;
  const roundName = mr - cur === 0 ? '決勝' : mr - cur === 1 ? '準決勝' : mr - cur === 2 ? '準々決勝' : `${cur}回戦`;
  const featured = t.matches.filter((m) => m.isStream).sort((a, b) => order(a) - order(b));

  return (
    <Layout side={<AnnouncementsPanel t={t} now={now} editable={false} audience="client" />}>
      <Note>クライアント / 代理店 / 制作向けプレビュー（読み取り）。運用ノイズを除いた進捗サマリーと注目試合のみを表示します。</Note>
      <Card style={{ padding: 18, marginBottom: 14, display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <Big label="進捗" value={`${progress}%`} color={C.accent} />
        <Big label="現在" value={champ ? '終了' : roundName} />
        <Big label="完了試合" value={`${realDone}/${realTotal}`} />
        {champ && <Big label="優勝" value={champ.name} color={C.warn} />}
      </Card>
      <SectionTitle icon={ICONS.monitor} color={C.stream} label="注目試合（配信卓）" />
      {featured.length === 0 ? <Empty>注目試合は未設定です。</Empty> : <Grid items={featured} t={t} now={now} />}
      <div style={{ marginTop: 18 }}>
        <SectionTitle icon={ICONS.grid} color={C.accent} label="トーナメント表" />
        <div style={{ overflowX: 'auto', border: `1px solid ${C.border}`, borderRadius: 12 }}>
          <Bracket t={t} now={now} scale={0.9} />
        </div>
      </div>
    </Layout>
  );
};

// --- small helpers ---
const Layout: React.FC<{ children: React.ReactNode; side: React.ReactNode }> = ({ children, side }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 16, alignItems: 'start' }}>
    <div>{children}</div>
    <div style={{ position: 'sticky', top: 16 }}>{side}</div>
  </div>
);

const SectionTitle: React.FC<{ icon: string; color: string; label: string }> = ({ icon, color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
    <Icon d={icon} size={15} color={color} />
    <span style={{ fontSize: 13, fontWeight: 800 }}>{label}</span>
  </div>
);

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: 24, textAlign: 'center', color: C.textFaint, fontSize: 13 }}>{children}</div>
);

const Big: React.FC<{ label: string; value: React.ReactNode; color?: string }> = ({ label, value, color = C.text }) => (
  <div>
    <div style={{ fontSize: 24, fontWeight: 900, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{label}</div>
  </div>
);

const TableChip: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '6px 12px',
      borderRadius: 999,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 700,
      border: `1px solid ${active ? C.accent : C.border}`,
      background: active ? 'rgba(0,224,224,0.12)' : 'transparent',
      color: active ? C.accent : C.textDim,
    }}
  >
    {label}
  </button>
);

const MatchCardStatus: React.FC<{ m: Match; now: number }> = ({ m }) => <StatusPill status={m.status} />;
