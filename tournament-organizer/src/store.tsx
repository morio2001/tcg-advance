import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import type { ActivityEvent, Appearance, EventKind, EventSource, Match, Penalty, Role, Tournament } from './types';
import { participant, resolveAll } from './lib/bracket';
import { hhmmKanji } from './lib/format';
import { buildSampleTournament } from './lib/sampleData';

const STORAGE_KEY = 'tournament-organizer:v2';
const IDENTITY_KEY = 'tournament-organizer:identity';

interface AppState {
  tournament: Tournament | null;
  identity: EventSource | null;
  selectedMatchId: string | null;
}

type Action =
  | { type: 'SET_IDENTITY'; identity: EventSource }
  | { type: 'CREATE'; tournament: Tournament }
  | { type: 'RESET_ALL' }
  | { type: 'SELECT_MATCH'; matchId: string | null }
  | { type: 'SET_RESULT'; matchId: string; winner: 'a' | 'b'; scoreA: number; scoreB: number }
  | { type: 'CLEAR_RESULT'; matchId: string }
  | { type: 'START_MATCH'; matchId: string; at: number }
  | { type: 'START_ROUND'; round: number; at: number }
  | { type: 'STOP_MATCH'; matchId: string }
  | { type: 'ADD_EXTENSION'; matchId: string; minutes: number }
  | { type: 'SET_TABLE'; matchId: string; table: string | null }
  | { type: 'TOGGLE_STREAM'; matchId: string }
  | { type: 'SET_STREAM_NOTE'; matchId: string; note: string }
  | { type: 'ADD_PENALTY'; matchId: string; penalty: Penalty }
  | { type: 'REMOVE_PENALTY'; matchId: string; penaltyId: string }
  | { type: 'SET_APPEARANCE'; participantId: string; value: Appearance }
  | { type: 'UPDATE_PARTICIPANT'; participantId: string; patch: Partial<{ name: string; deck: string; affiliation: string; photo: string }> }
  | { type: 'ADD_ANNOUNCEMENT'; body: string; audiences: Role[] }
  | { type: 'POST_MESSAGE'; matchId: string | null; body: string }
  | { type: 'TOGGLE_PIN'; eventId: string }
  | { type: 'REMOVE_EVENT'; eventId: string };

const FALLBACK_SOURCE: EventSource = { name: '本部', role: 'admin' };

const evId = () => `ev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

const mapMatches = (t: Tournament, fn: (m: Match) => Match): Tournament => ({ ...t, matches: t.matches.map(fn) });
const patchOne = (t: Tournament, id: string, patch: Partial<Match>): Tournament =>
  mapMatches(t, (m) => (m.id === id ? { ...m, ...patch } : m));

function withResolved(t: Tournament): Tournament {
  const clone: Tournament = { ...t, matches: structuredClone(t.matches) };
  resolveAll(clone.matches);
  return clone;
}

const matchRef = (t: Tournament, id: string): string => {
  const m = t.matches.find((x) => x.id === id);
  if (!m) return '';
  return `${m.table ? `卓${m.table} ` : ''}${m.label}`;
};
const pName = (t: Tournament, id: string | null) => participant(t, id)?.name ?? '未定';

function log(
  t: Tournament,
  source: EventSource,
  kind: EventKind,
  body: string,
  matchId: string | null = null,
  extra: Partial<ActivityEvent> = {},
): Tournament {
  const e: ActivityEvent = { id: evId(), at: Date.now(), kind, source, matchId, body, ...extra };
  return { ...t, events: [...t.events, e] };
}

function reducer(state: AppState, action: Action): AppState {
  const t = state.tournament;
  const src = state.identity ?? FALLBACK_SOURCE;
  const set = (next: Tournament): AppState => ({ ...state, tournament: next });

  switch (action.type) {
    case 'SET_IDENTITY':
      return { ...state, identity: action.identity };
    case 'CREATE':
      return { ...state, tournament: action.tournament, selectedMatchId: null };
    case 'RESET_ALL':
      return { ...state, tournament: null, selectedMatchId: null };
    case 'SELECT_MATCH':
      return { ...state, selectedMatchId: action.matchId };
  }

  if (!t) return state;

  switch (action.type) {
    case 'SET_RESULT': {
      const next = withResolved(
        patchOne(t, action.matchId, {
          winner: action.winner,
          scoreA: action.scoreA,
          scoreB: action.scoreB,
          status: 'done',
          startedAt: null,
        }),
      );
      const winId = action.winner === 'a' ? t.matches.find((m) => m.id === action.matchId)?.slots[0].participantId : t.matches.find((m) => m.id === action.matchId)?.slots[1].participantId;
      return set(
        log(next, src, 'result', `${matchRef(t, action.matchId)} 結果確定: ${pName(t, winId ?? null)} 勝利 (${action.scoreA}-${action.scoreB})`, action.matchId),
      );
    }
    case 'CLEAR_RESULT': {
      const next = withResolved(patchOne(t, action.matchId, { winner: null, scoreA: 0, scoreB: 0, status: 'ready', isBye: false }));
      return set(log(next, src, 'result', `${matchRef(t, action.matchId)} 結果を取り消し`, action.matchId));
    }
    case 'START_MATCH': {
      const next = mapMatches(t, (m) =>
        m.id === action.matchId && (m.status === 'ready' || m.status === 'pending') ? { ...m, status: 'live', startedAt: action.at } : m,
      );
      return set(log(next, src, 'status', `${matchRef(t, action.matchId)} 試合開始 (${hhmmKanji(action.at)})`, action.matchId));
    }
    case 'START_ROUND': {
      const targets = t.matches.filter((m) => m.bracket === 'main' && m.round === action.round && m.status === 'ready');
      const next = mapMatches(t, (m) =>
        m.bracket === 'main' && m.round === action.round && m.status === 'ready' ? { ...m, status: 'live', startedAt: action.at } : m,
      );
      return set(log(next, src, 'status', `第${action.round}ラウンドを一斉開始 (${targets.length}試合 / ${hhmmKanji(action.at)})`, null));
    }
    case 'STOP_MATCH': {
      const next = mapMatches(t, (m) => (m.id === action.matchId ? { ...m, status: 'ready', startedAt: null, extensionMin: 0 } : m));
      return set(log(next, src, 'status', `${matchRef(t, action.matchId)} を停止 / リセット`, action.matchId));
    }
    case 'ADD_EXTENSION': {
      const next = mapMatches(t, (m) => (m.id === action.matchId ? { ...m, extensionMin: m.extensionMin + action.minutes } : m));
      return set(log(next, src, 'extension', `${matchRef(t, action.matchId)} に延長 +${action.minutes}分`, action.matchId));
    }
    case 'SET_TABLE': {
      const next = patchOne(t, action.matchId, { table: action.table });
      return set(log(next, src, 'table', `${t.matches.find((m) => m.id === action.matchId)?.label} の卓を ${action.table ?? '未割当'} に設定`, action.matchId));
    }
    case 'TOGGLE_STREAM': {
      const m0 = t.matches.find((m) => m.id === action.matchId);
      const on = !(m0?.isStream ?? false);
      const next = patchOne(t, action.matchId, { isStream: on });
      return set(log(next, src, 'stream', `${matchRef(t, action.matchId)} を${on ? '配信卓に設定' : '配信卓から解除'}`, action.matchId));
    }
    case 'SET_STREAM_NOTE':
      return set(patchOne(t, action.matchId, { streamNote: action.note }));
    case 'ADD_PENALTY': {
      const next = mapMatches(t, (m) => (m.id === action.matchId ? { ...m, penalties: [...m.penalties, action.penalty] } : m));
      const target = pName(t, action.penalty.participantId);
      return set(log(next, src, 'penalty', `${matchRef(t, action.matchId)} ${target}: ${action.penalty.note || 'ペナルティ'}`, action.matchId));
    }
    case 'REMOVE_PENALTY':
      return set(mapMatches(t, (m) => (m.id === action.matchId ? { ...m, penalties: m.penalties.filter((p) => p.id !== action.penaltyId) } : m)));
    case 'SET_APPEARANCE': {
      const p = t.participants.find((x) => x.id === action.participantId);
      const next = { ...t, participants: t.participants.map((x) => (x.id === action.participantId ? { ...x, appearance: action.value } : x)) };
      const lbl = action.value === 'ok' ? '可' : action.value === 'ng' ? '不可' : '未';
      return set(log(next, src, 'appearance', `アピアランス更新: ${p?.name ?? ''} → ${lbl}`, null));
    }
    case 'UPDATE_PARTICIPANT':
      return set({ ...t, participants: t.participants.map((x) => (x.id === action.participantId ? { ...x, ...action.patch } : x)) });
    case 'ADD_ANNOUNCEMENT':
      return set(log(t, src, 'announcement', action.body, null, { audiences: action.audiences, pinned: false }));
    case 'POST_MESSAGE':
      return set(log(t, src, 'message', action.body, action.matchId));
    case 'TOGGLE_PIN':
      return set({ ...t, events: t.events.map((e) => (e.id === action.eventId ? { ...e, pinned: !e.pinned } : e)) });
    case 'REMOVE_EVENT':
      return set({ ...t, events: t.events.filter((e) => e.id !== action.eventId) });
    default:
      return state;
  }
}

function loadInitial(): AppState {
  let tournament: Tournament | null = null;
  let identity: EventSource | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) tournament = JSON.parse(raw) as Tournament;
  } catch {
    tournament = null;
  }
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (raw) identity = JSON.parse(raw) as EventSource;
  } catch {
    identity = null;
  }
  return { tournament, identity, selectedMatchId: null };
}

interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  loadSample: () => void;
}

const StoreContext = createContext<Ctx | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => {
    try {
      if (state.tournament) localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tournament));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [state.tournament]);

  useEffect(() => {
    try {
      if (state.identity) localStorage.setItem(IDENTITY_KEY, JSON.stringify(state.identity));
    } catch {
      /* ignore */
    }
  }, [state.identity]);

  const loadSample = () => dispatch({ type: 'CREATE', tournament: buildSampleTournament() });

  return <StoreContext.Provider value={{ state, dispatch, loadSample }}>{children}</StoreContext.Provider>;
};

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

/** A shared 1s ticking clock so timers across the app re-render together. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  const ref = useRef(now);
  useEffect(() => {
    const id = setInterval(() => {
      ref.current = Date.now();
      setNow(ref.current);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
