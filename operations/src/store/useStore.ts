import { useSyncExternalStore } from 'react';
import { store, type AppState } from './store';

/** アプリ全体の状態を購読（他タブ更新にも自動追従） */
export function useAppState(): AppState {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

/** 指定IDの大会を購読 */
export function useTournament(id: string | null) {
  const state = useAppState();
  if (!id) return null;
  return state.tournaments.find((t) => t.id === id) ?? null;
}
