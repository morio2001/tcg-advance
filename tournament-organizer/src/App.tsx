import React, { useState } from 'react';
import { C } from './theme';
import { ROLE_COLOR, ROLE_LABEL } from './roles';
import { StoreProvider, useStore } from './store';
import { Button, Icon, ICONS } from './components/ui';
import { JoinGate } from './views/JoinGate';
import { SetupView } from './views/SetupView';
import { BoardView } from './views/BoardView';
import { RosterView } from './views/RosterView';
import { ShareView } from './views/ShareView';
import { PresentationView } from './views/PresentationView';

type Tab = 'board' | 'roster' | 'share';

const Shell: React.FC = () => {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<Tab>('board');
  const [presenting, setPresenting] = useState(false);
  const [editingId, setEditingId] = useState(false);

  const { identity, tournament: t } = state;

  if (!identity || editingId) {
    return <JoinGate initial={identity} onDone={() => setEditingId(false)} />;
  }
  if (!t) return <div style={{ minHeight: '100vh', padding: '24px 20px 60px' }}><SetupView /></div>;
  if (presenting) return <PresentationView t={t} onExit={() => setPresenting(false)} />;

  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${C.border}`,
          boxShadow: '0 1px 3px rgba(16,24,40,0.05)',
          padding: '10px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <Icon d={ICONS.trophy} size={20} color={C.accent} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 340 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: C.textDim }}>{t.venue || '会場未設定'}</div>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* identity */}
          <button
            onClick={() => setEditingId(true)}
            title="表示名・ロールを変更"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 11px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${C.border}`, background: '#fff' }}
          >
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: ROLE_COLOR[identity.role] }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{identity.name}</span>
            <span style={{ fontSize: 10, color: C.textDim }}>{ROLE_LABEL[identity.role]}</span>
          </button>

          <Button variant="ghost" size="sm" onClick={() => setPresenting(true)}>
            <Icon d={ICONS.monitor} size={13} /> モニター
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

        {/* tabs */}
        <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
          {([
            ['board', '進行ボード', ICONS.grid],
            ['roster', '選手名簿', ICONS.users],
            ['share', '共有スナップショット', ICONS.copy],
          ] as [Tab, string, string][]).map(([key, label, icon]) => (
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
                background: tab === key ? 'rgba(23,105,214,0.12)' : 'transparent',
                color: tab === key ? C.accent : C.textDim,
              }}
            >
              <Icon d={icon} size={13} color={tab === key ? C.accent : C.textDim} /> {label}
            </button>
          ))}
        </div>
      </header>

      <main style={{ padding: '18px 20px 40px', maxWidth: 1480, margin: '0 auto' }}>
        {tab === 'board' ? <BoardView t={t} /> : tab === 'roster' ? <RosterView t={t} /> : <ShareView t={t} />}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <StoreProvider>
    <Shell />
  </StoreProvider>
);

export default App;
