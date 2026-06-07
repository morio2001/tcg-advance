import type { Match } from '../types';

/** Total allotted milliseconds for a match (base + extension). */
export const totalMs = (m: Match) => (m.durationMin + m.extensionMin) * 60_000;

/** Remaining milliseconds at time `now` (can be negative when in overtime). */
export function remainingMs(m: Match, now: number): number {
  if (m.startedAt === null) return totalMs(m);
  return m.startedAt + totalMs(m) - now;
}

/** mm:ss, prefixed with "-" when overtime. */
export function clock(ms: number): string {
  const neg = ms < 0;
  const s = Math.floor(Math.abs(ms) / 1000);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${neg ? '-' : ''}${mm}:${String(ss).padStart(2, '0')}`;
}

export function hhmm(epoch: number): string {
  const d = new Date(epoch);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function relTime(epoch: number, now: number): string {
  const diff = Math.round((now - epoch) / 1000);
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  return hhmm(epoch);
}
