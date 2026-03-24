export type CardCategory = 'pokemon' | 'goods' | 'support' | 'stadium' | 'energy';

export type TagColor = 'cyan' | 'yellow' | 'purple' | 'green' | 'red' | 'orange';

export interface DeckCard {
  name: string;
  count: number;
  cat?: CardCategory;
}

export interface Deck {
  id: string;
  name: string;
  cards: number;
  isPublic: boolean;
  cardList: DeckCard[];
}

export interface TcgEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  capacity: number;
  registered: number;
  fee: string;
  regulation: string;
  tags: string[];
  organizer: string;
  description: string;
}

export interface RegisteredEvent extends TcgEvent {
  deckId: string;
  deckName: string;
}

export interface DeckSnapshot {
  id: string;
  name: string;
  cards: number;
  cardList: { name: string; count: number }[];
}

export interface HistoryEntry {
  id: string;
  eventName: string;
  date: string;
  result: string;
  placement: string;
  deckName: string;
  deckSnapshot: DeckSnapshot;
  venue: string;
}

export interface Opponent {
  name: string;
  table: string;
}

export type BattleResult = 'win' | 'lose' | 'draw';

export interface RoundResult {
  round: number;
  opponent: string;
  result: BattleResult;
  first: boolean;
}

export interface TcgGame {
  id: string;
  name: string;
  short: string;
  color: string;
  emoji: string;
}

export interface SocialUser {
  id: string;
  name: string;
  avatarInitial: string;
  avatarColor: string;
  following: number;
  followers: number;
  // Lifetime
  totalEvents: number;
  totalWins: number;
  totalChampionships: number;
  // Season (current quarter)
  seasonEvents: number;
  seasonWins: number;
  seasonChampionships: number;
  // Level
  level: number;
  levelXp: number;
  levelXpMax: number;
  recentDeck: string;
  tcgs: string[]; // TCG game IDs
}

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  avatarInitial: string;
  avatarColor: string;
  eventName: string;
  eventDate: string;
  result: string;
  placement: string;
  deckName: string;
  kudosCount: number;
  postedAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  goal: number;
  unit: string;
  xpReward: number;
  completed: boolean;
  category: 'event' | 'battle' | 'social';
}

export type TabId = 'home' | 'events' | 'battle' | 'deck' | 'search' | 'account';

export type ViewId =
  | 'main'
  | 'search'
  | 'detail'
  | 'tournament'
  | 'history-detail'
  | 'deck-detail'
  | 'deck-edit'
  | 'deck-community'
  | 'user-profile'
  | 'public-profile'
  | 'ranking'
  | 'search-public'
  | 'profile-edit'
  | 'live-detail';
