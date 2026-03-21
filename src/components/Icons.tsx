import React from 'react';

interface SvgProps {
  path: string;
  size?: number;
}

const SvgIcon: React.FC<SvgProps> = ({ path, size = 22 }) => (
  <span
    dangerouslySetInnerHTML={{
      __html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`,
    }}
    style={{ display: 'inline-flex', alignItems: 'center' }}
  />
);

export const IconEvent = () => <SvgIcon path='<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' />;
export const IconBattle = () => <SvgIcon path='<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' />;
export const IconDeck = () => <SvgIcon path='<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>' />;
export const IconAccount = () => <SvgIcon path='<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' />;
export const IconSearch = () => <SvgIcon path='<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' size={18} />;
export const IconBack = () => <SvgIcon path='<polyline points="15 18 9 12 15 6"/>' />;
export const IconChevDown = () => <SvgIcon path='<polyline points="6 9 12 15 18 9"/>' size={16} />;
export const IconChevUp = () => <SvgIcon path='<polyline points="18 15 12 9 6 15"/>' size={16} />;
export const IconChevRight = () => <SvgIcon path='<polyline points="9 18 15 12 9 6"/>' size={16} />;
export const IconPin = () => <SvgIcon path='<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>' size={14} />;
export const IconClock = () => <SvgIcon path='<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' size={14} />;
export const IconUsers = () => <SvgIcon path='<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' size={14} />;
export const IconTrophy = () => <SvgIcon path='<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>' size={16} />;
export const IconMsg = () => <SvgIcon path='<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' size={16} />;
export const IconAlert = () => <SvgIcon path='<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' size={16} />;
export const IconCheck = () => <SvgIcon path='<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' size={18} />;
export const IconEdit = () => <SvgIcon path='<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' size={14} />;
export const IconSwords = () => <SvgIcon path='<line x1="4" y1="20" x2="20" y2="4"/><line x1="4" y1="4" x2="20" y2="20"/><path d="M14.5 3.5L21 3l-.5 7.5"/><path d="M9.5 20.5L3 21l.5-7.5"/>' size={20} />;

export const IconHome = () => <SvgIcon path='<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' />;

export const IconSparkle = () => (
  <span
    dangerouslySetInnerHTML={{
      __html: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>',
    }}
    style={{ display: 'inline-flex' }}
  />
);
