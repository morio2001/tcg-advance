import React from 'react';
import type { Match, Tournament } from '../types';
import { C } from '../theme';
import { participant, slotName } from '../lib/bracket';
import { clock, remainingMs } from '../lib/format';
import { Icon, ICONS, StatusPill, Tag } from '../components/ui';

interface Props {
  match: Match;
  t: Tournament;
  now: number;
  onClick?: () => void;
  compact?: boolean;
}

const PlayerRow: React.FC<{
  m: Match;
  t: Tournament;
  side: 'a' | 'b';
}> = ({ m, t, side }) => {
  const slot = side === 'a' ? m.slots[0] : m.slots[1];
  const p = participant(t, slot.participantId);
  const isWinner = m.winner === side;
  const isLoser = m.winner !== null && m.winner !== side && !m.isBye;
  const score = side === 'a' ? m.scoreA : m.scoreB;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 8px',
        borderRadius: 8,
        background: isWinner ? 'rgba(0,214,138,0.1)' : 'transparent',
        opacity: isLoser ? 0.5 : 1,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: C.textFaint,
          width: 20,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {p ? p.seed : '–'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: isWinner ? 800 : 600,
            color: p ? (isWinner ? C.win : C.text) : C.textFaint,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {p ? p.name : slotName(slot, t)}
        </div>
        {p?.deck && (
          <div style={{ fontSize: 10, color: C.textFaint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p.deck}
          </div>
        )}
      </div>
      {(m.status === 'done' && !m.isBye) && (
        <span style={{ fontSize: 16, fontWeight: 800, color: isWinner ? C.win : C.textFaint, width: 18, textAlign: 'center' }}>
          {score}
        </span>
      )}
      {isWinner && <Icon d={ICONS.trophy} size={13} color={C.win} />}
    </div>
  );
};

export const MatchCard: React.FC<Props> = ({ match: m, t, now, onClick }) => {
  const rem = remainingMs(m, now);
  const over = m.status === 'overtime' || (m.status === 'live' && rem < 0);
  const liveColor = over ? C.overtime : C.live;

  return (
    <div
      onClick={onClick}
      style={{
        background: C.panel,
        border: `1px solid ${m.isStream ? `${C.stream}66` : C.border}`,
        borderRadius: 13,
        padding: 10,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        boxShadow: m.status === 'live' || over ? `0 0 0 1px ${liveColor}44` : undefined,
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {m.table && (
          <span style={{ fontSize: 11, fontWeight: 800, color: C.accent, background: 'rgba(0,224,224,0.12)', padding: '2px 7px', borderRadius: 6 }}>
            卓{m.table}
          </span>
        )}
        <span style={{ fontSize: 11, color: C.textDim, fontWeight: 700 }}>{m.label}</span>
        <div style={{ flex: 1 }} />
        {m.isStream && (
          <Tag color={C.stream}>
            <Icon d={ICONS.monitor} size={10} color={C.stream} /> 配信
          </Tag>
        )}
        <StatusPill status={m.status} />
      </div>

      {/* players */}
      <PlayerRow m={m} t={t} side="a" />
      <div style={{ height: 1, background: C.border, margin: '2px 8px' }} />
      <PlayerRow m={m} t={t} side="b" />

      {/* footer: timer / penalties */}
      {(m.status === 'live' || over || m.penalties.length > 0 || m.streamNote) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7, paddingTop: 7, borderTop: `1px solid ${C.border}` }}>
          {(m.status === 'live' || over) && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 800, color: liveColor, fontVariantNumeric: 'tabular-nums' }}>
              <Icon d={ICONS.clock} size={13} color={liveColor} />
              {clock(rem)}
              {m.extensionMin > 0 && <span style={{ fontSize: 10, color: C.warn }}>+{m.extensionMin}</span>}
            </span>
          )}
          {m.streamNote && <span style={{ fontSize: 10, color: C.stream }}>{m.streamNote}</span>}
          <div style={{ flex: 1 }} />
          {m.penalties.length > 0 && (
            <Tag color={C.warn}>
              <Icon d={ICONS.alert} size={10} color={C.warn} /> {m.penalties.length}
            </Tag>
          )}
        </div>
      )}
    </div>
  );
};
