import React, { useState } from 'react';
import type { TagColor, TcgEvent, RegisteredEvent } from '../types';
import { TODAY } from '../data/mockData';
import { IconClock, IconUsers, IconPin, IconDeck } from './Icons';

/* ─── Tag ─── */
const TAG_COLORS: Record<TagColor, { bg: string; fg: string; bd: string }> = {
  cyan:   { bg: 'rgba(0,224,224,0.15)', fg: '#00e0e0', bd: 'rgba(0,224,224,0.3)' },
  yellow: { bg: 'rgba(255,200,0,0.15)', fg: '#ffc800', bd: 'rgba(255,200,0,0.3)' },
  purple: { bg: 'rgba(160,100,255,0.15)', fg: '#a064ff', bd: 'rgba(160,100,255,0.3)' },
  green:  { bg: 'rgba(0,200,120,0.15)', fg: '#00c878', bd: 'rgba(0,200,120,0.3)' },
  red:    { bg: 'rgba(255,80,80,0.15)', fg: '#ff5050', bd: 'rgba(255,80,80,0.3)' },
  orange: { bg: 'rgba(255,160,0,0.15)', fg: '#ffa000', bd: 'rgba(255,160,0,0.3)' },
};

export const REG_COLOR: Record<string, TagColor> = {
  'スタンダード': 'cyan',
  '殿堂': 'purple',
  'エクストラ': 'yellow',
};

interface TagProps {
  children: React.ReactNode;
  color?: TagColor;
}

export const Tag: React.FC<TagProps> = ({ children, color = 'cyan' }) => {
  const c = TAG_COLORS[color] ?? TAG_COLORS.cyan;
  return (
    <span style={{
      background: c.bg, color: c.fg, border: `1px solid ${c.bd}`,
      fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
};

/* ─── SectionHeader ─── */
interface SectionHeaderProps {
  title: string;
  count?: number;
  icon?: React.ReactNode;
  subtitle?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, count, icon, subtitle }) => (
  <div style={{ marginBottom: '8px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {icon}
      <span style={{ fontSize: '14px', fontWeight: 700, color: '#c0d0e0' }}>{title}</span>
      {count != null && (
        <span style={{ fontSize: '11px', background: 'rgba(0,224,224,0.15)', color: '#00e0e0', padding: '1px 6px', borderRadius: '8px', fontWeight: 600 }}>
          {count}
        </span>
      )}
    </div>
    {subtitle && <div style={{ fontSize: '11px', color: '#556677', marginTop: '2px' }}>{subtitle}</div>}
  </div>
);

/* ─── EventCard ─── */
interface EventCardProps {
  event: TcgEvent | RegisteredEvent;
  onClick: () => void;
  showDeck?: boolean;
  isRegistered?: boolean;
  checkedIn?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick, showDeck, isRegistered, checkedIn }) => {
  const isFull = event.registered >= event.capacity;
  const today = event.date === TODAY;
  const [hovered, setHovered] = useState(false);

  const deckName = 'deckName' in event ? (event as RegisteredEvent).deckName : undefined;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? (today ? 'rgba(0,224,224,0.14)' : 'rgba(255,255,255,0.08)')
          : (today ? 'linear-gradient(135deg, rgba(0,224,224,0.10), rgba(0,160,255,0.07))' : 'rgba(255,255,255,0.04)'),
        borderRadius: '10px', padding: '10px 12px', cursor: 'pointer',
        border: `1px solid ${hovered
          ? (today ? 'rgba(0,224,224,0.4)' : 'rgba(0,224,224,0.3)')
          : (today ? 'rgba(0,224,224,0.25)' : 'rgba(255,255,255,0.08)')}`,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#f0f0f0', lineHeight: 1.3, flex: 1 }}>{event.name}</div>
        {today && <Tag color="orange">本日</Tag>}
        {checkedIn && <Tag color="green">チェックイン済</Tag>}
      </div>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '5px' }}>
        {event.tags?.map((t, i) => <Tag key={i} color="cyan">{t}</Tag>)}
        <Tag color={REG_COLOR[event.regulation] ?? 'cyan'}>{event.regulation}</Tag>
        {isFull && <Tag color="red">満員</Tag>}
        {isRegistered && !checkedIn && <Tag color="green">参加予定</Tag>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#8899aa', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><IconClock /> {event.date} {event.time}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><IconUsers /> {event.registered}/{event.capacity}</span>
        <span style={{ fontWeight: 600, color: event.fee === '無料' ? '#00c878' : '#ffc800' }}>{event.fee}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '3px', fontSize: '11px', color: '#7788a0', marginTop: '4px', lineHeight: 1.4 }}>
        <span style={{ flexShrink: 0, marginTop: '1px' }}><IconPin /></span>
        <span>{event.venue} — {event.address}</span>
      </div>
      {showDeck && deckName && (
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#a064ff', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <IconDeck /> 使用デッキ: {deckName}
        </div>
      )}
    </div>
  );
};
