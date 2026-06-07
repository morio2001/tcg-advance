import * as XLSX from 'xlsx';
import type { Participant } from '../types';
import { MAX_PLAYERS } from './bracket';

let pid = 0;
const newId = () => `p_${Date.now().toString(36)}_${(pid++).toString(36)}`;

export interface ParsedRow {
  name: string;
  deck?: string;
  affiliation?: string;
}

/**
 * Parse pasted text. Accepts:
 *  - one name per line
 *  - CSV / TSV with optional header (name, deck, affiliation / 名前, デッキ, 所属)
 */
export function parsePasted(text: string): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const delim = lines[0].includes('\t') ? '\t' : lines[0].includes(',') ? ',' : null;

  if (!delim) {
    return lines.map((name) => ({ name }));
  }

  const split = (l: string) => l.split(delim).map((c) => c.trim());
  let startIdx = 0;
  let cols = { name: 0, deck: 1, affiliation: 2 };
  const header = split(lines[0]).map((h) => h.toLowerCase());
  const looksLikeHeader = header.some((h) =>
    ['name', '名前', 'player', 'プレイヤー', '選手', 'deck', 'デッキ', '所属', 'team', 'shop'].includes(h),
  );
  if (looksLikeHeader) {
    startIdx = 1;
    const find = (keys: string[]) => header.findIndex((h) => keys.includes(h));
    const nameIdx = find(['name', '名前', 'player', 'プレイヤー', '選手']);
    const deckIdx = find(['deck', 'デッキ', 'archetype']);
    const affIdx = find(['affiliation', '所属', 'team', 'shop', 'チーム', '店舗']);
    cols = {
      name: nameIdx >= 0 ? nameIdx : 0,
      deck: deckIdx >= 0 ? deckIdx : 1,
      affiliation: affIdx >= 0 ? affIdx : 2,
    };
  }

  const rows: ParsedRow[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const c = split(lines[i]);
    const name = c[cols.name]?.trim();
    if (!name) continue;
    rows.push({
      name,
      deck: c[cols.deck]?.trim() || undefined,
      affiliation: c[cols.affiliation]?.trim() || undefined,
    });
  }
  return rows;
}

/** Parse an uploaded .xlsx / .csv file. */
export async function parseFile(file: File): Promise<ParsedRow[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const csv = XLSX.utils.sheet_to_csv(sheet);
  return parsePasted(csv);
}

/** Turn parsed rows into seeded participants (import order = seed order). */
export function toParticipants(rows: ParsedRow[]): Participant[] {
  return rows.slice(0, MAX_PLAYERS).map((r, i) => ({
    id: newId(),
    name: r.name,
    seed: i + 1,
    deck: r.deck,
    affiliation: r.affiliation,
    appearance: 'pending' as const,
  }));
}
