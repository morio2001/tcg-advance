import React, { useState } from 'react';
import { C } from './theme';
import { ROLE_COLOR, ROLE_LABEL } from './roles';
import { StoreProvider, useStore } from './store';
import { Icon, ICONS } from './components/ui';
import { JoinGate } from './views/JoinGate';
import { SetupView } from './views/SetupView';
import { BoardView } from './views/BoardView';
import { RosterView } from './views/RosterView';
import { ShareView } from './views/ShareView';
import { PresentationView } from './views/PresentationView';

type Tab = 'board' | 'roster' | 'share';
const TAB_LABEL: Record<Tab, string> = { board: '進行ボード', roster: '選手名簿', share: '共有スナップショット' };

const GearMenu: React.FC<{ onMonitor: () => void; onReset: () => void; onEditId: () => void }> = ({ onMonitor, onReset, onEditId }) => {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const id = state.identity!;
  const item: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: C.text, textAlign: 'left' };
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen((v) => !v)} title="メニュー" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 9px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', cursor: 'pointer' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: ROLE_COLOR[id.role] }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{id.name}</span>
        <span style={{ fontSize: 14 }}>⚙</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
          <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 61, minWidth: 210, background: '#fff', border: `1px solid ${C.borderStrong}`, borderRadius: 10, boxShadow: '0 12px 30px rgba(16,24,40,0.18)', overflow: 'hidden', padding: '4px 0' }}>
            <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 800 }}>{id.name}</div>
              <div style={{ fontSize: 10.5, color: C.textDim }}>{ROLE_LABEL[id.role]}</div>
            </div>
            <button style={item} onClick={() => { setOpen(false); onEditId(); }}><Icon d={ICONS.users} size={14} color={C.textDim} /> 表示名・ロールを変更</button>
            <button style={item} onClick={() => { setOpen(false); onMonitor(); }}><Icon d={ICONS.monitor} size={14} color={C.textDim} /> モニター表示</button>
            <button style={{ ...item, color: C.lose }} onClick={() => { setOpen(false); onReset(); }}><Icon d={ICONS.back} size={14} color={C.lose} /> 新規 / リセット</button>
          </div>
        </>
      )}
    </div>
  );
};

const Shell: React.FC = () => {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<Tab>('board');
  const [presenting, setPresenting] = useState(false);
  const [editingId, setEditingId] = useState(false);

  const { identity, tournament: t } = state;

  if (!identity || editingId) return <JoinGate initial={identity} onDone={() => setEditingId(false)} />;
  if (!t) return <div style={{ minHeight: '100vh', padding: '24px 20px 60px' }}><SetupView /></div>;
  if (presenting) return <PresentationView t={t} onExit={() => setPresenting(false)} />;

  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${C.border}`,
          padding: '7px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon d={ICONS.trophy} size={17} color={C.accent} />
          <span style={{ fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 420 }}>{t.name}</span>
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value as Tab)}
            style={{ fontSize: 12.5, fontWeight: 700, padding: '4px 8px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#f4f6fa', color: C.accent, cursor: 'pointer', outline: 'none' }}
          >
            {(Object.keys(TAB_LABEL) as Tab[]).map((k) => (
              <option key={k} value={k}>{TAB_LABEL[k]}</option>
            ))}
          </select>
          <div style={{ flex: 1 }} />
          <GearMenu
            onMonitor={() => setPresenting(true)}
            onEditId={() => setEditingId(true)}
            onReset={() => { if (confirm('現在の大会データを破棄して最初に戻りますか？')) dispatch({ type: 'RESET_ALL' }); }}
          />
        </div>
      </header>

      <main style={{ padding: tab === 'board' ? '12px 16px 0' : '18px 20px 40px', maxWidth: tab === 'board' ? undefined : 1480, margin: tab === 'board' ? undefined : '0 auto' }}>
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
