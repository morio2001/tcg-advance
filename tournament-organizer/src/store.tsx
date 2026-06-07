import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import type { Announcement, Match, Penalty, Role, Tournament } from './types';
import { resolveAll } from './lib/bracket';
import { buildSampleTournament } from './lib/sampleData';

const STORAGE_KEY = 'tournament-organizer:v1';

interface AppState {
  tournament: Tournament | null;
  role: Role;
  selectedTable: string | null; // for floor-staff scoping
}

type Action =
  | { type: 'LOAD'; tournament: Tournament | null }
  | { type: 'CREATE'; tournament: Tournament }
  | { type: 'RESET_ALL' }
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'SET_TABLE'; table: string | null }
  | { type: 'SET_RESULT'; matchId: string; winner: 'a' | 'b'; scoreA: number; scoreB: number }
  | { type: 'CLEAR_RESULT'; matchId: string }
  | { type: 'START_MATCH'; matchId: string; at: number }
  | { type: 'START_ROUND'; round: number; at: number }
  | { type: 'STOP_MATCH'; matchId: string }
  | { type: 'ADD_EXTENSION'; matchId: string; minutes: number }
  | { type: 'PATCH_MATCH'; matchId: string; patch: Partial<Match> }
  | { type: 'ADD_PENALTY'; matchId: string; penalty: Penalty }
  | { type: 'REMOVE_PENALTY'; matchId: string; penaltyId: string }
  | { type: 'ADD_ANNOUNCEMENT'; announcement: Announcement }
  | { type: 'REMOVE_ANNOUNCEMENT'; id: string }
  | { type: 'TOGGLE_PIN'; id: string };

const mapMatches = (t: Tournament, fn: (m: Match) => Match): Tournament => ({
  ...t,
  matches: t.matches.map(fn),
});

const patchOne = (t: Tournament, id: string, patch: Partial<Match>): Tournament =>
  mapMatches(t, (m) => (m.id === id ? { ...m, ...patch } : m));

function withResolved(t: Tournament): Tournament {
  // resolveAll mutates; operate on a structural clone so reducers stay pure.
  const clone: Tournament = { ...t, matches: structuredClone(t.matches) };
  resolveAll(clone.matches);
  return clone;
}

function reducer(state: AppState, action: Action): AppState {
  const t = state.tournament;
  switch (action.type) {
    case 'LOAD':
      return { ...state, tournament: action.tournament };
    case 'CREATE':
      return { ...state, tournament: action.tournament };
    case 'RESET_ALL':
      return { ...state, tournament: null, role: 'admin', selectedTable: null };
    case 'SET_ROLE':
      return { ...state, role: action.role };
    case 'SET_TABLE':
      return { ...state, selectedTable: action.table };

    case 'SET_RESULT': {
      if (!t) return state;
      const next = patchOne(t, action.matchId, {
        winner: action.winner,
        scoreA: action.scoreA,
        scoreB: action.scoreB,
        status: 'done',
        startedAt: null,
      });
      return { ...state, tournament: withResolved(next) };
    }
    case 'CLEAR_RESULT': {
      if (!t) return state;
      const next = patchOne(t, action.matchId, {
        winner: null,
        scoreA: 0,
        scoreB: 0,
        status: 'ready',
        isBye: false,
      });
      return { ...state, tournament: withResolved(next) };
    }
    case 'START_MATCH': {
      if (!t) return state;
      return {
        ...state,
        tournament: mapMatches(t, (m) =>
          m.id === action.matchId && (m.status === 'ready' || m.status === 'pending')
            ? { ...m, status: 'live', startedAt: action.at }
            : m,
        ),
      };
    }
    case 'START_ROUND': {
      if (!t) return state;
      return {
        ...state,
        tournament: mapMatches(t, (m) =>
          m.bracket === 'main' && m.round === action.round && m.status === 'ready'
            ? { ...m, status: 'live', startedAt: action.at }
            : m,
        ),
      };
    }
    case 'STOP_MATCH': {
      if (!t) return state;
      return {
        ...state,
        tournament: mapMatches(t, (m) =>
          m.id === action.matchId ? { ...m, status: 'ready', startedAt: null, extensionMin: 0 } : m,
        ),
      };
    }
    case 'ADD_EXTENSION': {
      if (!t) return state;
      return {
        ...state,
        tournament: mapMatches(t, (m) =>
          m.id === action.matchId ? { ...m, extensionMin: m.extensionMin + action.minutes } : m,
        ),
      };
    }
    case 'PATCH_MATCH':
      if (!t) return state;
      return { ...state, tournament: patchOne(t, action.matchId, action.patch) };

    case 'ADD_PENALTY':
      if (!t) return state;
      return {
        ...state,
        tournament: mapMatches(t, (m) =>
          m.id === action.matchId ? { ...m, penalties: [...m.penalties, action.penalty] } : m,
        ),
      };
    case 'REMOVE_PENALTY':
      if (!t) return state;
      return {
        ...state,
        tournament: mapMatches(t, (m) =>
          m.id === action.matchId
            ? { ...m, penalties: m.penalties.filter((p) => p.id !== action.penaltyId) }
            : m,
        ),
      };

    case 'ADD_ANNOUNCEMENT':
      if (!t) return state;
      return { ...state, tournament: { ...t, announcements: [action.announcement, ...t.announcements] } };
    case 'REMOVE_ANNOUNCEMENT':
      if (!t) return state;
      return {
        ...state,
        tournament: { ...t, announcements: t.announcements.filter((a) => a.id !== action.id) },
      };
    case 'TOGGLE_PIN':
      if (!t) return state;
      return {
        ...state,
        tournament: {
          ...t,
          announcements: t.announcements.map((a) =>
            a.id === action.id ? { ...a, pinned: !a.pinned } : a,
          ),
        },
      };
    default:
      return state;
  }
}

function loadInitial(): AppState {
  let tournament: Tournament | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) tournament = JSON.parse(raw) as Tournament;
  } catch {
    tournament = null;
  }
  return { tournament, role: 'admin', selectedTable: null };
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
      /* ignore quota / private-mode errors */
    }
  }, [state.tournament]);

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
