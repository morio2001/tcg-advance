import React, { useEffect, useRef, useState } from 'react';
import type { Tournament } from '../types';
import { C } from '../theme';
import { champion } from '../lib/bracket';
import { hhmm } from '../lib/format';
import { useNow } from '../store';
import { Button, Icon, ICONS } from '../components/ui';
import { Bracket } from './Bracket';

export const PresentationView: React.FC<{ t: Tournament; onExit: () => void }> = ({ t, onExit }) => {
  const now = useNow();
  const rootRef = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(false);
  const champ = champion(t);

  const liveCount = t.matches.filter((m) => m.status === 'live' || m.status === 'overtime').length;
  const pinned = t.events.filter((e) => e.kind === 'announcement' && e.pinned);

  const toggleFs = async () => {
    try {
      if (!document.fullscreenElement) {
        await rootRef.current?.requestFullscreen();
        setFs(true);
      } else {
        await document.exitFullscreen();
        setFs(false);
      }
    } catch {
      /* fullscreen may be blocked */
    }
  };

  useEffect(() => {
    const onChange = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'radial-gradient(circle at 50% -10%, #ffffff, #e7ecf3 70%)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 28px', borderBottom: `1px solid ${C.border}` }}>
        <div
          style={{
            width: 8,
            height: 36,
            borderRadius: 4,
            background: `linear-gradient(${C.accent}, ${C.accentDeep})`,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {t.name}
          </div>
          <div style={{ fontSize: 13, color: C.textDim }}>
            {t.venue} ・ {t.regulation}
          </div>
        </div>
        {liveCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.live, animation: 'toBlink 1.1s infinite' }} />
            <span style={{ fontSize: 15, fontWeight: 800, color: C.live }}>{liveCount} 試合 進行中</span>
          </div>
        )}
        <div style={{ fontSize: 30, fontWeight: 900, color: C.accent, fontVariantNumeric: 'tabular-nums', letterSpacing: 1 }}>
          {hhmm(now)}
        </div>
        <Button variant="subtle" size="sm" onClick={toggleFs}>
          <Icon d={ICONS.monitor} size={13} /> {fs ? '全画面解除' : '全画面'}
        </Button>
        <Button variant="subtle" size="sm" onClick={onExit}>
          <Icon d={ICONS.back} size={13} /> 戻る
        </Button>
      </div>

      {/* champion banner */}
      {champ && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '12px', background: 'rgba(255,194,74,0.1)', borderBottom: `1px solid ${C.warn}44` }}>
          <Icon d={ICONS.trophy} size={26} color={C.warn} />
          <span style={{ fontSize: 22, fontWeight: 900, color: C.warn }}>優勝 {champ.name}</span>
          {champ.deck && <span style={{ fontSize: 15, color: C.textDim }}>{champ.deck}</span>}
        </div>
      )}

      {/* bracket */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Bracket t={t} now={now} scale={1.25} />
      </div>

      {/* ticker */}
      {pinned.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 28px', borderTop: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: C.accent, flexShrink: 0 }}>
            <Icon d={ICONS.bullhorn} size={13} color={C.accent} /> お知らせ
          </span>
          <div style={{ fontSize: 15, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {pinned.map((a) => a.body).join('　／　')}
          </div>
        </div>
      )}
    </div>
  );
};
