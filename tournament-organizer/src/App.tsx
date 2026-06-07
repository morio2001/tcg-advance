import React, { useState } from 'react';
import type { Role } from './types';
import { C } from './theme';
import { StoreProvider, useStore } from './store';
import { Button, Icon, ICONS } from './components/ui';
import { ROLE_LABEL } from './views/AnnouncementsPanel';
import { SetupView } from './views/SetupView';
import { AdminDashboard } from './views/AdminDashboard';
import { BracketView } from './views/BracketView';
import { ShareView } from './views/ShareView';
import { AudienceView } from './views/AudienceView';
import { PresentationView } from './views/PresentationView';

type AdminTab = 'dashboard' | 'bracket' | 'share';

const ROLES: Role[] = ['admin', 'floor', 'broadcast', 'stage', 'client'];
const ROLE_DESC: Record<Role, string> = {
  admin: '本部 — 唯一の更新者',
  floor: 'フロアスタッフ — 担当卓',
  broadcast: '配信 — 配信卓 / テロップ',
  stage: 'ステージ進行 — タイムライン',
  client: 'クライアント — 進捗サマリー',
};

const Shell: React.FC = () => {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [presenting, setPresenting] = useState(false);
  const t = state.tournament;

  if (!t) return <Page><SetupView /></Page>;

  if (presenting) return <PresentationView t={t} onExit={() => setPresenting(false)} />;

  const role = state.role;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* top bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(7,11,22,0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${C.border}`,
          padding: '10px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <Icon d={ICONS.trophy} size={20} color={C.accent} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 360 }}>
                {t.name}
              </div>
              <div style={{ fontSize: 11, color: C.textDim }}>{t.venue || '会場未設定'}</div>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* role switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: C.textFaint }}>表示:</span>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3, gap: 2 }}>
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => dispatch({ type: 'SET_ROLE', role: r })}
                  title={ROLE_DESC[r]}
                  style={{
                    padding: '6px 11px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                    background: role === r ? (r === 'admin' ? `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})` : 'rgba(255,255,255,0.1)') : 'transparent',
                    color: role === r ? (r === 'admin' ? '#04121c' : C.text) : C.textDim,
                  }}
                >
                  {ROLE_LABEL[r]}
                </button>
              ))}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setPresenting(true)}>
            <Icon d={ICONS.monitor} size={13} /> モニター表示
          </Button>
          <Button
            variant="subtle"
            size="sm"
            onClick={() => {
              if (confirm('現在の大会データを破棄して最初に戻りますか？')) dispatch({ type: 'RESET_ALL' });
            }}
          >
            新規 / リセット
          </Button>
        </div>

        {/* admin sub-tabs */}
        {role === 'admin' && (
          <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
            {([
              ['dashboard', 'ダッシュボード', ICONS.grid],
              ['bracket', 'トーナメント表', ICONS.table],
              ['share', '共有スナップショット', ICONS.copy],
            ] as [AdminTab, string, string][]).map(([key, label, icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 13px',
                  borderRadius: 9,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12.5,
                  fontWeight: 700,
                  background: tab === key ? 'rgba(0,224,224,0.12)' : 'transparent',
                  color: tab === key ? C.accent : C.textDim,
                }}
              >
                <Icon d={icon} size={13} color={tab === key ? C.accent : C.textDim} /> {label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main style={{ padding: '18px 20px 60px', maxWidth: 1400, margin: '0 auto' }}>
        {role === 'admin' ? (
          tab === 'dashboard' ? <AdminDashboard t={t} /> : tab === 'bracket' ? <BracketView t={t} /> : <ShareView t={t} />
        ) : (
          <AudienceView t={t} role={role} />
        )}
      </main>
    </div>
  );
};

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ minHeight: '100vh', padding: '24px 20px 60px' }}>{children}</div>
);

const App: React.FC = () => (
  <StoreProvider>
    <Shell />
  </StoreProvider>
);

export default App;
