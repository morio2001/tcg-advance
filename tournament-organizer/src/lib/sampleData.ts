import type { Match, Participant, Tournament } from '../types';
import { generateSingleElim, resolveAll } from './bracket';

const NAMES: [string, string, string][] = [
  ['カミヤ ソウタ', 'リザードンex', '横浜CL'],
  ['タチバナ レン', 'ミライドンex', 'PALETTE'],
  ['シノミヤ ハル', 'サーナイトex', '大阪本部'],
  ['オオツキ ユウ', 'ロストギラティナ', 'CARD BASE'],
  ['クドウ リク', 'パオジアンex', '名古屋GYM'],
  ['ハヤカワ アサヒ', 'ルギアVSTAR', 'TOKYO62'],
  ['ナルセ カイ', 'サーフゴーex', 'PALETTE'],
  ['フジタ マコト', '古代バレット', '札幌CS'],
  ['イズミ ナギ', '未来バレット', '横浜CL'],
  ['サカモト ジン', 'ピジョットコントロール', 'CARD BASE'],
  ['モリ タクミ', 'カビゴンLO', '大阪本部'],
  ['アベ ショウ', 'タケルライコex', '福岡PARK'],
  ['ヤナギ ソラ', 'ドラパルトex', '名古屋GYM'],
  ['コバヤシ ハヤテ', 'オーガポンexテラス', 'TOKYO62'],
  ['ミウラ アオイ', 'テツノカイナex', '札幌CS'],
  ['エンドウ ツバサ', 'イダイナキバLO', '福岡PARK'],
];

function buildParticipants(): Participant[] {
  return NAMES.map(([name, deck, affiliation], i) => ({
    id: `seed${i + 1}`,
    name,
    seed: i + 1,
    deck,
    affiliation,
  }));
}

function setResult(m: Match, winner: 'a' | 'b', sa: number, sb: number) {
  m.winner = winner;
  m.scoreA = sa;
  m.scoreB = sb;
  m.status = 'done';
}

export function buildSampleTournament(now = Date.now()): Tournament {
  const participants = buildParticipants();
  const matches = generateSingleElim(participants, {
    defaultDurationMin: 50,
    defaultBestOf: 3,
    hasThirdPlace: true,
  });

  const main = matches.filter((m) => m.bracket === 'main');
  const r1 = main.filter((m) => m.round === 1).sort((a, b) => a.order - b.order);
  const r2 = main.filter((m) => m.round === 2).sort((a, b) => a.order - b.order);

  // Round 1 fully played (a couple of upsets), assign tables.
  const r1Results: ('a' | 'b')[] = ['a', 'a', 'a', 'b', 'a', 'a', 'b', 'a'];
  r1.forEach((m, i) => {
    setResult(m, r1Results[i], r1Results[i] === 'a' ? 2 : 1, r1Results[i] === 'a' ? 1 : 2);
    m.table = `${i + 1}`;
  });
  r1[0].isStream = true;

  resolveAll(matches);

  // Round 2 (quarterfinals): one done, one live, others assigned & waiting.
  if (r2.length >= 4) {
    r2[0].table = '1';
    r2[0].isStream = true;
    r2[0].streamNote = 'メイン配信 / 第1試合';
    setResult(r2[0], 'a', 2, 0);

    r2[1].table = '2';
    r2[1].status = 'live';
    r2[1].startedAt = now - 14 * 60_000; // 14 min in, 50min match
    r2[1].penalties = [
      {
        id: 'pn1',
        type: 'warning',
        participantId: r2[1].slots[1].participantId,
        note: '手札公開遅延 / プレイ速度警告',
        at: now - 6 * 60_000,
        by: 'ジャッジ田中',
      },
    ];

    r2[2].table = '3';
    r2[2].isStream = true;
    r2[2].streamNote = 'サブ配信卓';

    r2[3].table = '4';
  }

  const t: Tournament = {
    id: 'demo',
    name: 'ポケモンカード CHAMPIONS CUP 決勝トーナメント',
    format: 'single',
    venue: '東京ビッグサイト 西1ホール',
    regulation: 'スタンダード / BO3',
    defaultDurationMin: 50,
    defaultBestOf: 3,
    hasThirdPlace: true,
    participants,
    matches,
    announcements: [
      {
        id: 'a1',
        at: now - 25 * 60_000,
        by: '本部',
        body: '準々決勝を15:30に一斉開始します。各卓スタッフは選手の着席を確認してください。',
        audiences: ['floor', 'broadcast', 'stage'],
        pinned: true,
      },
      {
        id: 'a2',
        at: now - 8 * 60_000,
        by: '本部',
        body: '配信卓(卓1)の試合が長引いています。ステージ進行は巻きの想定で待機をお願いします。',
        audiences: ['broadcast', 'stage', 'client'],
        pinned: false,
      },
    ],
    createdAt: now - 3 * 60 * 60_000,
  };
  return t;
}
