// ===== 状態ストア =====
// ・localStorage に永続化（リロード・オフライン対応）
// ・BroadcastChannel で同一オリジンの他タブ/他端末画面とリアルタイム同期
//   → 「フロアスタッフが入力した内容を運営も別タブで見れる」をローカルで再現。
//   将来 Supabase Realtime に差し替え可能なよう、購読/発行インターフェースに集約。

import type { Tournament } from '../engine/types';

export interface AppState {
  tournaments: Tournament[];
}

const STORAGE_KEY = 'swiss-ops:v1';
const CHANNEL_NAME = 'swiss-ops';

type Listener = () => void;

const channel: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch (e) {
    console.warn('状態の読み込みに失敗:', e);
  }
  return { tournaments: [] };
}

let state: AppState = load();
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('状態の保存に失敗:', e);
  }
}

// 他タブからの更新を受信
if (channel) {
  channel.onmessage = (ev: MessageEvent) => {
    if (ev.data?.type === 'state') {
      state = ev.data.state as AppState;
      persist();
      notify();
    }
  };
}

// 同一タブ内で localStorage が他経由で変わった場合にも追従
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (ev) => {
    if (ev.key === STORAGE_KEY && ev.newValue) {
      try {
        state = JSON.parse(ev.newValue);
        notify();
      } catch {
        /* noop */
      }
    }
  });
}

export const store = {
  getState(): AppState {
    return state;
  },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** 状態を更新し、永続化・購読者通知・他タブ同期を行う */
  set(updater: (s: AppState) => AppState) {
    state = updater(state);
    persist();
    notify();
    channel?.postMessage({ type: 'state', state });
  },
};

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
