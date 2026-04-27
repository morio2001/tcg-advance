const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, LevelFormat, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageBreak, Header, Footer, PageNumber,
  TabStopType, TabStopPosition,
} = require('docx');
const fs = require('fs');

// ─── カラーパレット ───
const C = {
  PRIMARY:   '006666', // ダークティール
  SECONDARY: '00a0a0',
  ACCENT:    '0066cc',
  HEADING:   '003366',
  SUBHEAD:   '005555',
  BG_LIGHT:  'EAF4F4',
  BG_ACCENT: 'E8F0F8',
  BG_GRAY:   'F5F5F5',
  WHITE:     'FFFFFF',
  BLACK:     '1A1A1A',
  MID:       '555555',
  LIGHT:     '888888',
  BORDER:    'CCDDDD',
  TABLE_HDR: '006666',
  TABLE_ROW: 'F0F8F8',
};

const A4_W = 11906; // DXA
const A4_H = 16838;
const MARGIN = 1134; // 2cm
const CONTENT_W = A4_W - MARGIN * 2; // 9638

// ─── ヘルパー ───
const sp = (before = 0, after = 0, line = null) => {
  const s = { before, after };
  if (line) s.line = line;
  return { spacing: s };
};

const para = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, font: 'Noto Sans JP', color: C.BLACK, ...opts })],
  ...sp(0, 0),
});

const hline = (color = C.BORDER, size = 6) => new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size, color, space: 1 } },
  ...sp(0, 120),
  children: [],
});

const blank = (before = 80) => new Paragraph({ children: [], ...sp(before, 0) });

const sectionLabel = (text) => new Paragraph({
  children: [new TextRun({
    text,
    font: 'Noto Sans JP',
    size: 22,
    bold: true,
    color: C.WHITE,
  })],
  shading: { fill: C.PRIMARY, type: ShadingType.CLEAR },
  ...sp(280, 80),
  indent: { left: 200, right: 200 },
  spacing: { before: 280, after: 80, line: 400 },
});

const subHead = (text) => new Paragraph({
  children: [new TextRun({
    text,
    font: 'Noto Sans JP',
    size: 22,
    bold: true,
    color: C.SUBHEAD,
  })],
  border: { left: { style: BorderStyle.SINGLE, size: 18, color: C.SECONDARY, space: 6 } },
  indent: { left: 180 },
  ...sp(220, 80),
});

const bodyText = (text, color = C.BLACK) => new Paragraph({
  children: [new TextRun({ text, font: 'Noto Sans JP', size: 20, color })],
  ...sp(60, 60),
  spacing: { before: 60, after: 60, line: 380 },
});

const bulletItem = (text, doc) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  children: [new TextRun({ text, font: 'Noto Sans JP', size: 20, color: C.BLACK })],
  spacing: { before: 60, after: 60, line: 360 },
});

// ─── テーブル ───
const border = (color = C.BORDER) => ({ style: BorderStyle.SINGLE, size: 4, color });
const borders = (color = C.BORDER) => ({
  top: border(color), bottom: border(color),
  left: border(color), right: border(color),
});
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'auto' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

const cellText = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, font: 'Noto Sans JP', size: 19, color: C.BLACK, ...opts })],
  spacing: { before: 60, after: 60, line: 340 },
});

// ─── Document 組み立て ───
const docx = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '●',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 520, hanging: 300 } } },
        }],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: 'Noto Sans JP', size: 20 } } },
  },
  sections: [{
    properties: {
      page: {
        size: { width: A4_W, height: A4_H },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [
            new TextRun({ text: 'TCG ADVANCE', font: 'Noto Sans JP', size: 16, bold: true, color: C.PRIMARY }),
            new TextRun({ text: '\t事業概要書', font: 'Noto Sans JP', size: 16, color: C.LIGHT }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.BORDER, space: 1 } },
          spacing: { before: 0, after: 80 },
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: '© 2026 TCG Advance  ', font: 'Noto Sans JP', size: 16, color: C.LIGHT }),
            new TextRun({ text: '\t', font: 'Noto Sans JP', size: 16 }),
            new TextRun({ children: [PageNumber.CURRENT], font: 'Noto Sans JP', size: 16, color: C.LIGHT }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.BORDER, space: 1 } },
          spacing: { before: 80, after: 0 },
        })],
      }),
    },
    children: [

      // ════════════════════════════════════════
      // 表紙
      // ════════════════════════════════════════
      blank(1400),
      new Paragraph({
        children: [new TextRun({
          text: 'TCG ADVANCE',
          font: 'Noto Sans JP', size: 64, bold: true, color: C.PRIMARY,
        })],
        alignment: AlignmentType.CENTER,
        ...sp(0, 80),
      }),
      new Paragraph({
        children: [new TextRun({
          text: 'トレーディングカードゲーマーのための\nコミュニティプラットフォーム',
          font: 'Noto Sans JP', size: 26, color: C.MID,
        })],
        alignment: AlignmentType.CENTER,
        ...sp(0, 600),
      }),
      hline(C.PRIMARY, 8),
      blank(400),
      new Paragraph({
        children: [
          new TextRun({ text: '事業概要書', font: 'Noto Sans JP', size: 36, bold: true, color: C.HEADING }),
        ],
        alignment: AlignmentType.CENTER,
        ...sp(0, 120),
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Business Overview', font: 'Arial', size: 22, color: C.LIGHT })],
        alignment: AlignmentType.CENTER,
        ...sp(0, 0),
      }),
      blank(600),
      new Paragraph({
        children: [
          new TextRun({ text: '2026年4月', font: 'Noto Sans JP', size: 20, color: C.MID }),
          new TextRun({ text: '\thttps://tcg-advance.vercel.app', font: 'Arial', size: 18, color: C.SECONDARY }),
        ],
        alignment: AlignmentType.CENTER,
        tabStops: [],
        ...sp(0, 0),
      }),

      // ════════════════════════════════════════
      // ページ区切り
      // ════════════════════════════════════════
      new Paragraph({ children: [new PageBreak()], ...sp(0, 0) }),

      // ════════════════════════════════════════
      // 1. サービス概要
      // ════════════════════════════════════════
      sectionLabel('1.  サービス概要'),
      blank(80),
      bodyText('TCG Advance（ティーシージーアドバンス）は、日本のトレーディングカードゲーム（TCG）プレイヤー・ショップ・大会主催者を1つのプラットフォームでつなぐコミュニティアプリです。'),
      blank(80),

      new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [2400, CONTENT_W - 2400],
        rows: [
          new TableRow({ children: [
            new TableCell({
              borders: borders(),
              width: { size: 2400, type: WidthType.DXA },
              shading: { fill: C.BG_LIGHT, type: ShadingType.CLEAR },
              margins: { top: 100, bottom: 100, left: 160, right: 160 },
              children: [cellText('サービス名', { bold: true, color: C.PRIMARY })],
            }),
            new TableCell({
              borders: borders(),
              width: { size: CONTENT_W - 2400, type: WidthType.DXA },
              margins: { top: 100, bottom: 100, left: 160, right: 160 },
              children: [cellText('TCG Advance')],
            }),
          ]}),
          new TableRow({ children: [
            new TableCell({
              borders: borders(),
              width: { size: 2400, type: WidthType.DXA },
              shading: { fill: C.BG_LIGHT, type: ShadingType.CLEAR },
              margins: { top: 100, bottom: 100, left: 160, right: 160 },
              children: [cellText('種別', { bold: true, color: C.PRIMARY })],
            }),
            new TableCell({
              borders: borders(),
              width: { size: CONTENT_W - 2400, type: WidthType.DXA },
              margins: { top: 100, bottom: 100, left: 160, right: 160 },
              children: [cellText('モバイルウェブアプリ（PWA形式、iOS / Android 対応）')],
            }),
          ]}),
          new TableRow({ children: [
            new TableCell({
              borders: borders(),
              width: { size: 2400, type: WidthType.DXA },
              shading: { fill: C.BG_LIGHT, type: ShadingType.CLEAR },
              margins: { top: 100, bottom: 100, left: 160, right: 160 },
              children: [cellText('URL', { bold: true, color: C.PRIMARY })],
            }),
            new TableCell({
              borders: borders(),
              width: { size: CONTENT_W - 2400, type: WidthType.DXA },
              margins: { top: 100, bottom: 100, left: 160, right: 160 },
              children: [cellText('https://tcg-advance.vercel.app')],
            }),
          ]}),
          new TableRow({ children: [
            new TableCell({
              borders: borders(),
              width: { size: 2400, type: WidthType.DXA },
              shading: { fill: C.BG_LIGHT, type: ShadingType.CLEAR },
              margins: { top: 100, bottom: 100, left: 160, right: 160 },
              children: [cellText('ステータス', { bold: true, color: C.PRIMARY })],
            }),
            new TableCell({
              borders: borders(),
              width: { size: CONTENT_W - 2400, type: WidthType.DXA },
              margins: { top: 100, bottom: 100, left: 160, right: 160 },
              children: [cellText('開発中（MVP稼働中、順次機能追加）')],
            }),
          ]}),
          new TableRow({ children: [
            new TableCell({
              borders: borders(),
              width: { size: 2400, type: WidthType.DXA },
              shading: { fill: C.BG_LIGHT, type: ShadingType.CLEAR },
              margins: { top: 100, bottom: 100, left: 160, right: 160 },
              children: [cellText('ログイン方法', { bold: true, color: C.PRIMARY })],
            }),
            new TableCell({
              borders: borders(),
              width: { size: CONTENT_W - 2400, type: WidthType.DXA },
              margins: { top: 100, bottom: 100, left: 160, right: 160 },
              children: [cellText('Google / X（Twitter）/ LINE / Facebook')],
            }),
          ]}),
        ],
      }),

      // ════════════════════════════════════════
      // 2. 解決する課題
      // ════════════════════════════════════════
      blank(200),
      sectionLabel('2.  解決する課題'),
      blank(80),
      bodyText('TCGの競技・交流シーンには以下の構造的な課題があります。'),
      blank(80),

      new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [3200, CONTENT_W - 3200],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: borders(C.TABLE_HDR),
                width: { size: 3200, type: WidthType.DXA },
                shading: { fill: C.TABLE_HDR, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                verticalAlign: VerticalAlign.CENTER,
                children: [cellText('課題', { bold: true, color: C.WHITE })],
              }),
              new TableCell({
                borders: borders(C.TABLE_HDR),
                width: { size: CONTENT_W - 3200, type: WidthType.DXA },
                shading: { fill: C.TABLE_HDR, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                verticalAlign: VerticalAlign.CENTER,
                children: [cellText('詳細', { bold: true, color: C.WHITE })],
              }),
            ],
          }),
          ...([
            ['イベント情報の分散', 'ショップの公式SNS・公式サイト・Googleマップ等に情報が散在しており、プレイヤーが1か所で確認できる場所がない。'],
            ['プレイヤー同士のつながりが薄い', '同じ大会に参加しても連絡先交換が難しく、交流が一時的で終わりやすい。仲間づくりの機能的な仕組みがない。'],
            ['マナー・競技品質の担保', '対戦相手のマナーや技術レベルを共有・評価できる仕組みがなく、不快な体験をしても報告先がない。'],
            ['戦績管理の手間', '自分の大会成績をスプレッドシートや手書きで管理しているプレイヤーが多く、振り返り・分析ができていない。'],
            ['ショップ・主催者の集客課題', 'SNS発信力のないショップは認知を広げる手段が限られ、参加者が固定化しやすい。'],
          ]).map(([issue, detail], i) => new TableRow({
            children: [
              new TableCell({
                borders: borders(),
                width: { size: 3200, type: WidthType.DXA },
                shading: { fill: i % 2 === 0 ? C.BG_LIGHT : C.WHITE, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                verticalAlign: VerticalAlign.CENTER,
                children: [cellText(issue, { bold: true, color: C.HEADING })],
              }),
              new TableCell({
                borders: borders(),
                width: { size: CONTENT_W - 3200, type: WidthType.DXA },
                shading: { fill: i % 2 === 0 ? C.BG_LIGHT : C.WHITE, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText(detail)],
              }),
            ],
          })),
        ],
      }),

      // ════════════════════════════════════════
      // 3. 主要機能
      // ════════════════════════════════════════
      blank(200),
      sectionLabel('3.  主要機能'),
      blank(80),

      subHead('■ 実装済み機能（2026年4月時点）'),
      blank(60),

      new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [2800, 4000, CONTENT_W - 6800],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: borders(C.TABLE_HDR),
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: C.TABLE_HDR, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText('機能', { bold: true, color: C.WHITE })],
              }),
              new TableCell({
                borders: borders(C.TABLE_HDR),
                width: { size: 4000, type: WidthType.DXA },
                shading: { fill: C.TABLE_HDR, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText('概要', { bold: true, color: C.WHITE })],
              }),
              new TableCell({
                borders: borders(C.TABLE_HDR),
                width: { size: CONTENT_W - 6800, type: WidthType.DXA },
                shading: { fill: C.TABLE_HDR, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText('特徴・価値', { bold: true, color: C.WHITE })],
              }),
            ],
          }),
          ...([
            ['GPSチェックイン', '会場から半径300〜500m以内でのみチェックイン可能', '位置偽造防止。実際に参加したことを証明できる'],
            ['GG / マナー評価', '同じイベントに参加した相手にGG・グッドマナーを送れる', '競技コミュニティ特有のリスペクト文化をデジタル化'],
            ['グッドオーガナイザー', '大会主催者へのチェックイン後評価', '良い大会運営者が可視化され、集客力が向上'],
            ['イベント一覧・詳細', 'Supabaseから実データ取得。日時・参加費・レギュ・主催者を表示', '店舗ごとのカード種別タグでフィルタリング可能'],
            ['ソーシャルフォロー', 'プレイヤー間のフォロー/フォロワー管理', '対戦相手や仲間とのゆるいつながりを維持'],
            ['参加者一覧', 'チェックイン後に同じイベントの参加者が見える', '大会会場での「知らない人への話しかけ」を後押し'],
            ['マルチログイン', 'Google / X / LINE / Facebookの4ソーシャルログイン', 'TCGプレイヤーが日常的に使うSNSに全対応'],
            ['プロフィール設定', 'ニックネーム・アバター・好きなTCG・お気に入り店舗', 'プレイヤーのアイデンティティを可視化'],
          ]).map(([feat, desc, value], i) => new TableRow({
            children: [
              new TableCell({
                borders: borders(),
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: i % 2 === 0 ? C.BG_LIGHT : C.WHITE, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                verticalAlign: VerticalAlign.CENTER,
                children: [cellText(feat, { bold: true, color: C.HEADING })],
              }),
              new TableCell({
                borders: borders(),
                width: { size: 4000, type: WidthType.DXA },
                shading: { fill: i % 2 === 0 ? C.BG_LIGHT : C.WHITE, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText(desc)],
              }),
              new TableCell({
                borders: borders(),
                width: { size: CONTENT_W - 6800, type: WidthType.DXA },
                shading: { fill: i % 2 === 0 ? C.BG_LIGHT : C.WHITE, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText(value)],
              }),
            ],
          })),
        ],
      }),

      blank(160),
      subHead('■ 開発予定機能（2026年内）'),
      blank(60),

      ...([
        ['イベント作成・管理', '近日リリース', 'ショップ・主催者がアプリ内から大会を登録できる。参加者管理・QRコードチェックイン連携も予定。'],
        ['戦績入力・表示', '2026年Q2', '大会成績（デッキ・対戦相手・順位）を記録。シーズン別・デッキ別の勝率グラフを表示。'],
        ['プレイヤー・デッキ検索', '2026年Q2', 'ニックネーム・TCG種別・地域でプレイヤーを検索。デッキレシピ公開・共有機能。'],
        ['プッシュ通知', '2026年Q3', '登録イベントのリマインダー、フォロワーの大会結果通知、GGを受け取った際の通知。'],
        ['UI/UXの全面刷新', '2026年Q3〜Q4', 'デザインシステム整備。ダークモード・ライトモード切替。アニメーション・微インタラクション強化。'],
      ]).map(([feat, timing, detail]) => [
        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          columnWidths: [2800, 1600, CONTENT_W - 4400],
          rows: [new TableRow({
            children: [
              new TableCell({
                borders: borders(),
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: C.BG_ACCENT, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                verticalAlign: VerticalAlign.CENTER,
                children: [cellText(feat, { bold: true, color: C.ACCENT })],
              }),
              new TableCell({
                borders: borders(),
                width: { size: 1600, type: WidthType.DXA },
                shading: { fill: C.BG_ACCENT, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                verticalAlign: VerticalAlign.CENTER,
                children: [cellText(timing, { color: C.SECONDARY })],
              }),
              new TableCell({
                borders: borders(),
                width: { size: CONTENT_W - 4400, type: WidthType.DXA },
                shading: { fill: C.WHITE, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText(detail)],
              }),
            ],
          })],
        }),
        blank(40),
      ]).flat(),

      // ════════════════════════════════════════
      // 4. ターゲットユーザー
      // ════════════════════════════════════════
      blank(160),
      sectionLabel('4.  ターゲットユーザー'),
      blank(80),

      new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [Math.floor(CONTENT_W / 3), Math.floor(CONTENT_W / 3), CONTENT_W - Math.floor(CONTENT_W / 3) * 2],
        rows: [
          new TableRow({
            children: [
              ...[
                ['🎮 プレイヤー', '大会に参加するTCGプレイヤー（全レベル）。仲間づくり・戦績管理・好きなショップへの動線を求めている。'],
                ['🏪 カードショップ', '定期的に大会・イベントを開催するカード専門店。集客・口コミ・常連化に課題を抱えている。'],
                ['🏆 大会主催者', '自主大会・チャンピオンシップを運営するオーガナイザー。参加者管理・評判向上の仕組みを必要としている。'],
              ].map(([title, desc]) => new TableCell({
                borders: borders(),
                width: { size: Math.floor(CONTENT_W / 3), type: WidthType.DXA },
                shading: { fill: C.BG_LIGHT, type: ShadingType.CLEAR },
                margins: { top: 140, bottom: 140, left: 160, right: 160 },
                children: [
                  cellText(title, { bold: true, color: C.PRIMARY, size: 22 }),
                  new Paragraph({ children: [], spacing: { before: 60, after: 0 } }),
                  cellText(desc),
                ],
              })),
            ],
          }),
        ],
      }),

      blank(140),
      bodyText('日本のTCG市場規模は推計1,000億円超（国内カード販売額ベース）。競技人口は遊戯王・ポケモンカード・MTG・デュエマ・ワンピカードなど主要タイトルだけで数百万人規模。カード専門店は全国3,000〜5,000店以上と推定される。', C.MID),

      // ════════════════════════════════════════
      // 5. ビジネスモデル（想定）
      // ════════════════════════════════════════
      blank(200),
      sectionLabel('5.  ビジネスモデル（想定）'),
      blank(80),
      bodyText('現フェーズはユーザー獲得・UX最適化優先のため無料提供。以下の収益化ルートを段階的に検討中。'),
      blank(80),

      new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [2600, 2200, CONTENT_W - 4800],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: borders(C.TABLE_HDR),
                width: { size: 2600, type: WidthType.DXA },
                shading: { fill: C.TABLE_HDR, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText('収益源', { bold: true, color: C.WHITE })],
              }),
              new TableCell({
                borders: borders(C.TABLE_HDR),
                width: { size: 2200, type: WidthType.DXA },
                shading: { fill: C.TABLE_HDR, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText('タイミング', { bold: true, color: C.WHITE })],
              }),
              new TableCell({
                borders: borders(C.TABLE_HDR),
                width: { size: CONTENT_W - 4800, type: WidthType.DXA },
                shading: { fill: C.TABLE_HDR, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText('概要', { bold: true, color: C.WHITE })],
              }),
            ],
          }),
          ...([
            ['ショップ向けSaaSプラン', 'Phase 2〜3', 'イベント作成・管理機能の高度化、参加者CSVエクスポート、QRコード受付、月額サブスクリプション。'],
            ['プレミアムプレイヤー', 'Phase 2〜3', '戦績詳細分析・デッキ統計・カスタムプロフィールなどの追加機能を月額課金で提供。'],
            ['大会スポンサー枠', 'Phase 3〜', 'カードメーカー・ショップのイベントスポンサー表示、プッシュ通知枠の販売。'],
            ['データ分析提供', 'Phase 3〜', '匿名化したイベント参加動向・デッキメタデータをTCGメーカー・小売向けに提供（BtoB）。'],
          ]).map(([src, timing, desc], i) => new TableRow({
            children: [
              new TableCell({
                borders: borders(),
                width: { size: 2600, type: WidthType.DXA },
                shading: { fill: i % 2 === 0 ? C.BG_LIGHT : C.WHITE, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                verticalAlign: VerticalAlign.CENTER,
                children: [cellText(src, { bold: true, color: C.HEADING })],
              }),
              new TableCell({
                borders: borders(),
                width: { size: 2200, type: WidthType.DXA },
                shading: { fill: i % 2 === 0 ? C.BG_LIGHT : C.WHITE, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                verticalAlign: VerticalAlign.CENTER,
                children: [cellText(timing, { color: C.SECONDARY })],
              }),
              new TableCell({
                borders: borders(),
                width: { size: CONTENT_W - 4800, type: WidthType.DXA },
                shading: { fill: i % 2 === 0 ? C.BG_LIGHT : C.WHITE, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText(desc)],
              }),
            ],
          })),
        ],
      }),

      // ════════════════════════════════════════
      // 6. 競合・差別化
      // ════════════════════════════════════════
      blank(200),
      sectionLabel('6.  競合との差別化'),
      blank(80),

      new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [2400, 2000, 2000, CONTENT_W - 6400],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: borders(C.TABLE_HDR),
                width: { size: 2400, type: WidthType.DXA },
                shading: { fill: C.TABLE_HDR, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 120, right: 120 },
                children: [cellText('機能・特性', { bold: true, color: C.WHITE })],
              }),
              new TableCell({
                borders: borders(C.TABLE_HDR),
                width: { size: 2000, type: WidthType.DXA },
                shading: { fill: C.TABLE_HDR, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 120, right: 120 },
                children: [cellText('TCG Advance', { bold: true, color: C.WHITE })],
              }),
              new TableCell({
                borders: borders(C.TABLE_HDR),
                width: { size: 2000, type: WidthType.DXA },
                shading: { fill: C.TABLE_HDR, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 120, right: 120 },
                children: [cellText('X / Twitter', { bold: true, color: C.WHITE })],
              }),
              new TableCell({
                borders: borders(C.TABLE_HDR),
                width: { size: CONTENT_W - 6400, type: WidthType.DXA },
                shading: { fill: C.TABLE_HDR, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 120, right: 120 },
                children: [cellText('既存スコアアプリ', { bold: true, color: C.WHITE })],
              }),
            ],
          }),
          ...([
            ['GPSチェックイン', '◎ あり', '✗ なし', '✗ なし'],
            ['プレイヤー間評価', '◎ GG / マナー', '△ いいね（一般用途）', '✗ なし'],
            ['TCG専用イベント管理', '◎ 専用設計', '✗ 汎用SNS', '△ スコアのみ'],
            ['ショップ側ツール', '◎ 統合', '✗ なし', '✗ なし'],
            ['全TCGタイトル対応', '◎ タイトル横断', '△ 分断', '△ タイトル依存'],
          ]).map(([feat, adv, x, existing], i) => new TableRow({
            children: [
              new TableCell({
                borders: borders(),
                width: { size: 2400, type: WidthType.DXA },
                shading: { fill: i % 2 === 0 ? C.BG_LIGHT : C.WHITE, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [cellText(feat, { bold: true })],
              }),
              new TableCell({
                borders: borders(),
                width: { size: 2000, type: WidthType.DXA },
                shading: { fill: i % 2 === 0 ? 'E0F4F4' : 'F0FAFA', type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [cellText(adv, { bold: true, color: C.PRIMARY })],
              }),
              new TableCell({
                borders: borders(),
                width: { size: 2000, type: WidthType.DXA },
                shading: { fill: i % 2 === 0 ? C.BG_LIGHT : C.WHITE, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [cellText(x, { color: C.LIGHT })],
              }),
              new TableCell({
                borders: borders(),
                width: { size: CONTENT_W - 6400, type: WidthType.DXA },
                shading: { fill: i % 2 === 0 ? C.BG_LIGHT : C.WHITE, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [cellText(existing, { color: C.LIGHT })],
              }),
            ],
          })),
        ],
      }),

      blank(140),
      bodyText('最大の差別化点は「GPS位置証明を使ったチェックイン」と「TCGプレイヤー文化に根ざした相互評価システム（GG / マナー）」の組み合わせ。参加したことを証明した上で評価を送り合う仕組みは既存サービスにない。', C.HEADING),

      // ════════════════════════════════════════
      // 7. 開発体制・技術構成
      // ════════════════════════════════════════
      blank(200),
      sectionLabel('7.  開発体制・技術構成'),
      blank(80),

      subHead('■ 開発体制'),
      blank(60),
      bodyText('個人開発（オーナー兼プロダクトマネージャー）+ AI開発支援（Claude）により、フルスタック開発を実施中。必要に応じてエンジニア採用・外注を検討。'),
      blank(100),

      subHead('■ 技術スタック'),
      blank(60),

      new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [2400, CONTENT_W - 2400],
        rows: [
          ...([
            ['フロントエンド', 'React 18 + TypeScript + Vite（PWA形式、モバイルファースト設計）'],
            ['バックエンド / DB', 'Supabase（PostgreSQL + RLS + Edge Functions / Deno）'],
            ['認証', 'Supabase Auth（Google / X / LINE / Facebook OAuth）'],
            ['ホスティング', 'Vercel（GitHub連携による自動デプロイ）'],
            ['GPS / 位置情報', 'Web Geolocation API + Haversine距離計算'],
          ]).map(([layer, stack], i) => new TableRow({
            children: [
              new TableCell({
                borders: borders(),
                width: { size: 2400, type: WidthType.DXA },
                shading: { fill: C.BG_LIGHT, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText(layer, { bold: true, color: C.PRIMARY })],
              }),
              new TableCell({
                borders: borders(),
                width: { size: CONTENT_W - 2400, type: WidthType.DXA },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText(stack)],
              }),
            ],
          })),
        ],
      }),

      // ════════════════════════════════════════
      // 8. 開発ロードマップ
      // ════════════════════════════════════════
      blank(200),
      sectionLabel('8.  開発ロードマップ'),
      blank(80),

      new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [1600, 2600, CONTENT_W - 4200],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: borders(C.TABLE_HDR),
                width: { size: 1600, type: WidthType.DXA },
                shading: { fill: C.TABLE_HDR, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText('フェーズ', { bold: true, color: C.WHITE })],
              }),
              new TableCell({
                borders: borders(C.TABLE_HDR),
                width: { size: 2600, type: WidthType.DXA },
                shading: { fill: C.TABLE_HDR, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText('期間（目安）', { bold: true, color: C.WHITE })],
              }),
              new TableCell({
                borders: borders(C.TABLE_HDR),
                width: { size: CONTENT_W - 4200, type: WidthType.DXA },
                shading: { fill: C.TABLE_HDR, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText('主要マイルストーン', { bold: true, color: C.WHITE })],
              }),
            ],
          }),
          ...([
            ['Phase 1\nMVP', '2026年4月\n（完了）', 'GPS チェックイン / GG評価 / イベント一覧 / ソーシャルフォロー / 4 Social Login'],
            ['Phase 2\nコア機能', '2026年Q2', 'イベント作成・管理 / 戦績入力・表示 / プレイヤー・デッキ検索'],
            ['Phase 3\nエンゲージメント', '2026年Q3', 'プッシュ通知 / ランキング / シーズン制 / デッキ公開・共有'],
            ['Phase 4\nUI/UX & 収益化', '2026年Q4〜', 'デザイン全面刷新 / ショップ向けSaaSプラン / プレミアムプレイヤー'],
          ]).map(([phase, timing, milestones], i) => new TableRow({
            children: [
              new TableCell({
                borders: borders(),
                width: { size: 1600, type: WidthType.DXA },
                shading: { fill: i === 0 ? 'D0EEEE' : (i % 2 === 0 ? C.BG_LIGHT : C.WHITE), type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                verticalAlign: VerticalAlign.CENTER,
                children: phase.split('\n').map((t, j) => cellText(t, { bold: j === 0, color: j === 0 ? C.PRIMARY : C.MID })),
              }),
              new TableCell({
                borders: borders(),
                width: { size: 2600, type: WidthType.DXA },
                shading: { fill: i === 0 ? 'D0EEEE' : (i % 2 === 0 ? C.BG_LIGHT : C.WHITE), type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                verticalAlign: VerticalAlign.CENTER,
                children: timing.split('\n').map((t, j) => cellText(t, { color: j === 1 ? C.SECONDARY : C.BLACK })),
              }),
              new TableCell({
                borders: borders(),
                width: { size: CONTENT_W - 4200, type: WidthType.DXA },
                shading: { fill: i === 0 ? 'D0EEEE' : (i % 2 === 0 ? C.BG_LIGHT : C.WHITE), type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 160 },
                children: [cellText(milestones)],
              }),
            ],
          })),
        ],
      }),

      // ════════════════════════════════════════
      // 9. お問い合わせ
      // ════════════════════════════════════════
      blank(200),
      sectionLabel('9.  お問い合わせ・連携のご相談'),
      blank(80),
      bodyText('カードショップ様のイベント登録・ベータ参加、ショップ・メーカー様との協業・提携については、以下よりお気軽にご相談ください。'),
      blank(120),
      new Paragraph({
        children: [new TextRun({
          text: 'TCG Advance  /  https://tcg-advance.vercel.app',
          font: 'Noto Sans JP', size: 22, bold: true, color: C.PRIMARY,
        })],
        alignment: AlignmentType.CENTER,
        ...sp(0, 0),
      }),
      blank(300),
    ],
  }],
});

Packer.toBuffer(docx).then(buf => {
  fs.writeFileSync('C:\\Users\\shiro\\Documents\\tcg-advance\\TCGアドバンス_事業概要書.docx', buf);
  console.log('✅ 完了: TCGアドバンス_事業概要書.docx');
});
