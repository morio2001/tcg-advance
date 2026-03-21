import type { Deck, TcgEvent, RegisteredEvent, HistoryEntry, Opponent } from '../types';

export const TODAY = '2026-03-10';

export const MOCK_MY_DECKS: Deck[] = [
  { id: 'd1', name: 'リザードンex', cards: 60, isPublic: false, cardList: [
    { name: 'リザードンex', count: 2, cat: 'pokemon' }, { name: 'リザード', count: 2, cat: 'pokemon' },
    { name: 'ヒトカゲ', count: 3, cat: 'pokemon' }, { name: 'ピジョットex', count: 2, cat: 'pokemon' },
    { name: 'ピジョン', count: 2, cat: 'pokemon' }, { name: 'ポッポ', count: 3, cat: 'pokemon' },
    { name: 'ロトムV', count: 1, cat: 'pokemon' }, { name: 'マナフィ', count: 1, cat: 'pokemon' },
    { name: 'ネストボール', count: 4, cat: 'goods' }, { name: 'ハイパーボール', count: 4, cat: 'goods' },
    { name: 'ふしぎなアメ', count: 4, cat: 'goods' }, { name: 'すごいつりざお', count: 2, cat: 'goods' },
    { name: 'ともだちてちょう', count: 2, cat: 'goods' }, { name: '森の封印石', count: 1, cat: 'goods' },
    { name: 'ナンジャモ', count: 4, cat: 'support' }, { name: '博士の研究', count: 4, cat: 'support' },
    { name: 'ボスの指令', count: 3, cat: 'support' },
    { name: 'マグマの滝壺', count: 3, cat: 'stadium' },
    { name: '基本炎エネルギー', count: 10, cat: 'energy' }, { name: 'リバーサルエネルギー', count: 3, cat: 'energy' },
  ]},
  { id: 'd2', name: 'ルギアVSTAR', cards: 60, isPublic: true, cardList: [
    { name: 'ルギアVSTAR', count: 2, cat: 'pokemon' }, { name: 'ルギアV', count: 3, cat: 'pokemon' },
    { name: 'アーケオス', count: 4, cat: 'pokemon' }, { name: 'ネオラントV', count: 1, cat: 'pokemon' },
    { name: 'かがやくリザードン', count: 1, cat: 'pokemon' }, { name: 'イベルタル', count: 2, cat: 'pokemon' },
    { name: 'ハイパーボール', count: 4, cat: 'goods' }, { name: 'ネストボール', count: 4, cat: 'goods' },
    { name: 'すごいつりざお', count: 2, cat: 'goods' },
    { name: 'ナンジャモ', count: 4, cat: 'support' }, { name: '博士の研究', count: 4, cat: 'support' },
    { name: 'セレナ', count: 3, cat: 'support' },
    { name: '崩れたスタジアム', count: 2, cat: 'stadium' }, { name: '頂への雪道', count: 2, cat: 'stadium' },
    { name: '基本悪エネルギー', count: 8, cat: 'energy' }, { name: 'ジェットエネルギー', count: 4, cat: 'energy' },
    { name: 'ダブルターボエネルギー', count: 4, cat: 'energy' },
    { name: 'Vガードエネルギー', count: 2, cat: 'energy' }, { name: 'ギフトエネルギー', count: 3, cat: 'energy' },
  ]},
  { id: 'd3', name: 'ミライドンex', cards: 58, isPublic: false, cardList: [
    { name: 'ミライドンex', count: 3, cat: 'pokemon' }, { name: 'レジエレキVMAX', count: 2, cat: 'pokemon' },
    { name: 'レジエレキV', count: 2, cat: 'pokemon' }, { name: 'ライコウV', count: 1, cat: 'pokemon' },
    { name: 'マナフィ', count: 1, cat: 'pokemon' },
    { name: 'エレキジェネレーター', count: 4, cat: 'goods' }, { name: 'ネストボール', count: 4, cat: 'goods' },
    { name: 'ハイパーボール', count: 4, cat: 'goods' }, { name: 'ふしぎなアメ', count: 2, cat: 'goods' },
    { name: 'すごいつりざお', count: 2, cat: 'goods' }, { name: '森の封印石', count: 1, cat: 'goods' },
    { name: '勇気のおまもり', count: 2, cat: 'goods' }, { name: 'こだわりベルト', count: 2, cat: 'goods' },
    { name: 'ナンジャモ', count: 3, cat: 'support' }, { name: '博士の研究', count: 4, cat: 'support' },
    { name: 'ボスの指令', count: 2, cat: 'support' }, { name: 'メロン', count: 2, cat: 'support' },
    { name: 'ルチア', count: 1, cat: 'support' },
    { name: '嵐の山脈', count: 3, cat: 'stadium' },
    { name: '基本雷エネルギー', count: 12, cat: 'energy' },
  ]},
];

export const MOCK_EVENTS: TcgEvent[] = [
  { id: 'e1', name: 'ポケカ公式ジムバトル 渋谷', date: TODAY, time: '13:00', venue: 'カードショップ渋谷店', address: '東京都渋谷区神南1-2-3 渋谷パルコ5F', capacity: 32, registered: 28, fee: '無料', regulation: 'スタンダード', tags: ['ポケカ', 'ジムバトル'], organizer: 'カードショップ渋谷店', description: '毎週日曜開催のジムバトルです。初心者も大歓迎！' },
  { id: 'e2', name: 'シティリーグ シーズン3 新宿', date: '2026-03-22', time: '10:00', venue: 'TCGステーション新宿', address: '東京都新宿区西新宿1-5-1 新宿西口ハルク3F', capacity: 64, registered: 64, fee: '¥1,000', regulation: 'スタンダード', tags: ['ポケカ', 'シティリーグ'], organizer: 'TCGステーション新宿', description: 'シティリーグシーズン3の予選大会です。' },
  { id: 'e3', name: 'カジュアルバトル会 池袋', date: '2026-03-16', time: '14:00', venue: 'ゲームスペース池袋', address: '東京都豊島区東池袋1-28-1 タクトビル4F', capacity: 16, registered: 10, fee: '¥500', regulation: '殿堂', tags: ['ポケカ', 'カジュアル'], organizer: 'ゲームスペース池袋', description: '初心者歓迎のカジュアル大会です。' },
  { id: 'e4', name: 'トレーナーズリーグ 秋葉原', date: '2026-03-17', time: '15:00', venue: 'TCGアリーナ秋葉原', address: '東京都千代田区外神田3-15-5 ジーストア5F', capacity: 24, registered: 20, fee: '無料', regulation: 'スタンダード', tags: ['ポケカ', 'トレーナーズリーグ'], organizer: 'TCGアリーナ秋葉原', description: 'トレーナーズリーグ開催中！' },
  { id: 'e5', name: 'エクストラバトルの日 品川', date: '2026-03-18', time: '18:00', venue: 'カードラボ品川', address: '東京都港区高輪4-10-18 品川駅前ビル2F', capacity: 16, registered: 12, fee: '無料', regulation: 'エクストラ', tags: ['ポケカ', 'エクストラバトル'], organizer: 'カードラボ品川', description: 'エクストラレギュレーションの大会です。' },
  { id: 'e6', name: 'ジムバトル 中野', date: '2026-03-19', time: '13:00', venue: 'まんだらけ中野', address: '東京都中野区中野5-52-15 中野ブロードウェイ3F', capacity: 32, registered: 15, fee: '無料', regulation: 'スタンダード', tags: ['ポケカ', 'ジムバトル'], organizer: 'まんだらけ中野', description: '中野ブロードウェイ内で開催。' },
  { id: 'e7', name: '週末カジュアル大会 吉祥寺', date: '2026-03-21', time: '11:00', venue: 'カードショップ吉祥寺', address: '東京都武蔵野市吉祥寺本町2-4-18 ミドリビル3F', capacity: 20, registered: 8, fee: '¥300', regulation: 'スタンダード', tags: ['ポケカ', 'カジュアル'], organizer: 'カードショップ吉祥寺', description: '週末のカジュアル大会！' },
  { id: 'e8', name: 'チャンピオンズリーグ予選 東京', date: '2026-04-05', time: '09:00', venue: '東京ビッグサイト', address: '東京都江東区有明3-11-1 東展示棟', capacity: 512, registered: 512, fee: '¥2,000', regulation: 'スタンダード', tags: ['ポケカ', 'CL'], organizer: '株式会社ポケモン', description: 'チャンピオンズリーグ2026予選。' },
];

export const MOCK_REGISTERED: RegisteredEvent[] = [
  { ...MOCK_EVENTS[0], deckId: 'd1', deckName: 'リザードンex' },
  { ...MOCK_EVENTS[1], deckId: 'd2', deckName: 'ルギアVSTAR' },
];

export const MOCK_HISTORY: HistoryEntry[] = [
  { id: 'h1', eventName: 'ジムバトル 渋谷 2月', date: '2026-02-23', result: '3勝1敗', placement: '2位/16人', deckName: 'リザードンex', deckSnapshot: { id: 'snap1', name: 'リザードンex (2/23時点)', cards: 60, cardList: [{ name: 'リザードンex', count: 2 }, { name: 'リザード', count: 2 }, { name: 'ヒトカゲ', count: 3 }, { name: 'ピジョットex', count: 2 }, { name: 'ナンジャモ', count: 4 }, { name: '博士の研究', count: 4 }, { name: '基本炎エネルギー', count: 10 }] }, venue: 'カードショップ渋谷店' },
  { id: 'h2', eventName: 'トレーナーズリーグ 秋葉原', date: '2026-02-16', result: '2勝2敗', placement: '5位/12人', deckName: 'ルギアVSTAR', deckSnapshot: { id: 'snap2', name: 'ルギアVSTAR (2/16時点)', cards: 60, cardList: [{ name: 'ルギアVSTAR', count: 2 }, { name: 'ルギアV', count: 3 }, { name: 'アーケオス', count: 4 }, { name: 'ナンジャモ', count: 4 }] }, venue: 'TCGアリーナ秋葉原' },
  { id: 'h3', eventName: 'シティリーグ シーズン2', date: '2026-01-20', result: '4勝2敗', placement: '8位/64人', deckName: 'リザードンex', deckSnapshot: { id: 'snap3', name: 'リザードンex (1/20時点)', cards: 60, cardList: [{ name: 'リザードンex', count: 2 }, { name: 'ヒトカゲ', count: 3 }, { name: 'ネストボール', count: 4 }, { name: '博士の研究', count: 4 }] }, venue: 'TCGステーション新宿' },
];

export const MOCK_RECOMMENDED: TcgEvent[] = [MOCK_EVENTS[3], MOCK_EVENTS[5], MOCK_EVENTS[2]];

export const OPPONENTS: Opponent[] = [
  { name: 'タケシ', table: 'A-3' },
  { name: 'カスミ', table: 'B-1' },
  { name: 'シゲル', table: 'A-7' },
  { name: 'ヒカリ', table: 'C-2' },
];

export const ALL_CARDS: string[] = [
  'リザードンex', 'リザード', 'ヒトカゲ', 'ピジョットex', 'ピジョン', 'ポッポ',
  'ルギアVSTAR', 'ルギアV', 'アーケオス', 'ネオラントV', 'かがやくリザードン',
  'ミライドンex', 'レジエレキVMAX', 'レジエレキV', 'ライコウV', 'マナフィ',
  'ロトムV', 'イベルタル', 'ゲッコウガex', 'パオジアンex', 'テツノカイナex',
  'ネストボール', 'ハイパーボール', 'ふしぎなアメ', 'すごいつりざお',
  'ともだちてちょう', '森の封印石', 'エレキジェネレーター', '勇気のおまもり', 'こだわりベルト',
  'ナンジャモ', '博士の研究', 'ボスの指令', 'セレナ', 'メロン', 'ルチア',
  'マグマの滝壺', '嵐の山脈', '崩れたスタジアム', '頂への雪道',
  '基本炎エネルギー', '基本水エネルギー', '基本雷エネルギー', '基本悪エネルギー',
  'リバーサルエネルギー', 'ジェットエネルギー', 'ダブルターボエネルギー',
  'Vガードエネルギー', 'ギフトエネルギー',
];
