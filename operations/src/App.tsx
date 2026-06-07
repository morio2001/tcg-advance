import React, { useState } from 'react';
import { useAppState } from './store/useStore';
import { useOnline, useLocalStorage } from './components/ui';
import { HomePage } from './pages/HomePage';
import { PairingsPanel } from './pages/PairingsPanel';
import { StandingsPanel } from './pages/StandingsPanel';
import { PlayersPanel } from './pages/PlayersPanel';
import { PenaltiesPanel } from './pages/PenaltiesPanel';
import { SettingsPanel } from './pages/SettingsPanel';
import { FloorStaffBoard } from './pages/FloorStaffBoard';

type Role = 'organizer' | 'floor';
type OrgTab = 'pairings' | 'standings' | 'players' | 'penalties' | 'settings';

const ORG_TABS: { id: OrgTab; label: string }[] = [
  { id: 'pairings', label: '対戦表' },
  { id: 'standings', label: '順位' },
  { id: 'players', label: '参加者' },
  { id: 'penalties', label: 'ペナルティ' },
  { id: 'settings', label: '設定' },
];

export default function App() {
  const state = useAppState();
  const online = useOnline();
  const [selId, setSelId] = useState<string | null>(null);
  const [role, setRole] = useState<Role>('organizer');
  const [orgTab, setOrgTab] = useState<OrgTab>('pairings');
  const [staffName, setStaffName] = useLocalStorage('swiss-ops:staffName', '');

  const t = selId ? state.tournaments.find((x) => x.id === selId) ?? null : null;

  return (
    <div className="app">
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <span className="logo">◆</span>
            <button className="btn ghost" style={{ padding: '4px 8px', fontWeight: 800 }} onClick={() => setSelId(null)}>
              Swiss Ops
            </button>
          </div>

          {t && (
            <>
              <span className="dim" style={{ fontSize: 13, fontWeight: 700, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.name}
              </span>
              <div className="role-switch">
                <button className={role === 'organizer' ? 'on' : ''} onClick={() => setRole('organizer')}>運営</button>
                <button className={role === 'floor' ? 'on' : ''} onClick={() => setRole('floor')}>フロアスタッフ</button>
              </div>
            </>
          )}

          <div className="spacer" />

          {role === 'floor' && t && (
            <input
              placeholder="スタッフ名 / 端末名"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              style={{ width: 150, padding: '6px 10px' }}
            />
          )}
          <span className={`offline-pill ${online ? 'online' : 'offline'}`}>
            <span className="dot" />
            {online ? 'オンライン' : 'オフライン（ローカル保存）'}
          </span>
        </div>
      </header>

      {!t ? (
        <HomePage onOpen={(id) => { setSelId(id); setRole('organizer'); setOrgTab('pairings'); }} />
      ) : role === 'floor' ? (
        <div className="container" style={{ paddingTop: 18, paddingBottom: 60 }}>
          <FloorStaffBoard t={t} staffName={staffName} />
        </div>
      ) : (
        <div className="container" style={{ paddingTop: 14, paddingBottom: 60 }}>
          <div className="tabs" style={{ marginBottom: 16 }}>
            {ORG_TABS.map((tab) => (
              <button key={tab.id} className={`tab ${orgTab === tab.id ? 'active' : ''}`} onClick={() => setOrgTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
          {orgTab === 'pairings' && <PairingsPanel t={t} />}
          {orgTab === 'standings' && <StandingsPanel t={t} />}
          {orgTab === 'players' && <PlayersPanel t={t} />}
          {orgTab === 'penalties' && <PenaltiesPanel t={t} />}
          {orgTab === 'settings' && <SettingsPanel t={t} onDeleted={() => setSelId(null)} />}
        </div>
      )}
    </div>
  );
}
