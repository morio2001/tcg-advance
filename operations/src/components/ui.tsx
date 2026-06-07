import React, { useEffect, useState } from 'react';
import type { Player } from '../engine/types';

const COLORS = ['#4080d0', '#c04040', '#00a0a0', '#9040b0', '#b06020', '#40a040', '#206080', '#d05080'];

export function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

export function Avatar({ player, size = 30 }: { player?: Player; size?: number }) {
  const name = player?.name ?? '?';
  const id = player?.id ?? '?';
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: colorFor(id), fontSize: size * 0.4 }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

/** 一定間隔で再レンダリングして経過時間表示を更新するフック */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** ネットワーク状態 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

/** 分:秒 表記。負なら超過。 */
export function formatClock(ms: number): string {
  const sign = ms < 0 ? '+' : '';
  const total = Math.floor(Math.abs(ms) / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${sign}${m}:${String(s).padStart(2, '0')}`;
}

/** localStorage に紐づく状態（スタッフ名など端末固有の設定用） */
export function useLocalStorage(key: string, initial: string): [string, (v: string) => void] {
  const [val, setVal] = useState<string>(() => {
    try {
      return localStorage.getItem(key) ?? initial;
    } catch {
      return initial;
    }
  });
  const set = (v: string) => {
    setVal(v);
    try {
      localStorage.setItem(key, v);
    } catch {
      /* noop */
    }
  };
  return [val, set];
}

export function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
