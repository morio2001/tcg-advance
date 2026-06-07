import React from 'react';
import { C, STATUS_META } from '../theme';
import type { MatchStatus } from '../types';

type Variant = 'primary' | 'ghost' | 'danger' | 'warn' | 'subtle';

const variantStyle: Record<Variant, React.CSSProperties> = {
  primary: { background: `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`, color: '#fff', border: 'none' },
  warn: { background: `linear-gradient(135deg, #f0a020, ${C.overtime})`, color: '#fff', border: 'none' },
  danger: { background: '#fdecee', color: C.win, border: `1px solid #f3c2c8` },
  ghost: { background: 'rgba(0,0,0,0.05)', color: C.text, border: `1px solid ${C.border}` },
  subtle: { background: 'transparent', color: C.textDim, border: `1px solid ${C.border}` },
};

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' }
> = ({ variant = 'ghost', size = 'md', style, disabled, ...rest }) => (
  <button
    {...rest}
    disabled={disabled}
    style={{
      ...variantStyle[variant],
      padding: size === 'sm' ? '6px 10px' : '9px 14px',
      borderRadius: 9,
      fontSize: size === 'sm' ? 12 : 13,
      fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'filter 0.15s, opacity 0.15s',
      whiteSpace: 'nowrap',
      ...style,
    }}
  />
);

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ style, ...rest }) => (
  <div
    {...rest}
    style={{
      background: C.panel,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
      ...style,
    }}
  />
);

export const Tag: React.FC<{ color?: string; bg?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  color = C.accent,
  bg,
  children,
  style,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: 0.2,
      padding: '3px 8px',
      borderRadius: 999,
      color,
      background: bg ?? `${color}22`,
      border: `1px solid ${color}55`,
      ...style,
    }}
  >
    {children}
  </span>
);

export const StatusPill: React.FC<{ status: MatchStatus; style?: React.CSSProperties }> = ({ status, style }) => {
  const meta = STATUS_META[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        fontWeight: 800,
        padding: '3px 9px',
        borderRadius: 999,
        color: meta.color,
        background: meta.bg,
        ...style,
      }}
    >
      {(status === 'live' || status === 'overtime') && (
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: meta.color,
            animation: 'toBlink 1.1s infinite',
          }}
        />
      )}
      {meta.label}
    </span>
  );
};

export const Modal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode; width?: number }> = ({
  open,
  onClose,
  children,
  width = 520,
}) => {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,28,40,0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 16px',
        zIndex: 100,
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: width,
          background: C.panelSolid,
          border: `1px solid ${C.borderStrong}`,
          borderRadius: 16,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          animation: 'toFadeIn 0.2s',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({
  label,
  children,
  hint,
}) => (
  <label style={{ display: 'block', marginBottom: 12 }}>
    <div style={{ fontSize: 11, color: C.textDim, marginBottom: 5, fontWeight: 600 }}>{label}</div>
    {children}
    {hint && <div style={{ fontSize: 10.5, color: C.textFaint, marginTop: 4 }}>{hint}</div>}
  </label>
);

const inputBase: React.CSSProperties = {
  width: '100%',
  background: '#f7f9fc',
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  color: C.text,
  padding: '9px 11px',
  fontSize: 13,
  outline: 'none',
};

export const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ style, ...rest }) => (
  <input {...rest} style={{ ...inputBase, ...style }} />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ style, ...rest }) => (
  <textarea {...rest} style={{ ...inputBase, resize: 'vertical', ...style }} />
);

export const Icon: React.FC<{ d: string; size?: number; color?: string }> = ({ d, size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export const ICONS = {
  play: 'M5 3l14 9-14 9V3z',
  stop: 'M5 5h14v14H5z',
  clock: 'M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  plus: 'M12 5v14M5 12h14',
  flag: 'M4 21V4m0 0h11l-1.5 4L15 12H4',
  alert: 'M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.4 3.9a2 2 0 00-3.4 0z',
  bullhorn: 'M3 11v2a1 1 0 001 1h2l4 4V6L6 10H4a1 1 0 00-1 1zM15 8a4 4 0 010 8',
  monitor: 'M3 4h18v12H3zM8 20h8M12 16v4',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87',
  back: 'M19 12H5M12 19l-7-7 7-7',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM7 4H4v2a3 3 0 003 3M17 4h3v2a3 3 0 01-3 3',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  copy: 'M8 8h12v12H8zM4 16V4h12',
  table: 'M3 3h18v18H3zM3 9h18M9 9v12',
};
