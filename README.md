# TCGマイスターアドバンス — プロトタイプ

カードショップと大会プレイヤーをつなぐLIFFアプリのUIプロトタイプです。

## セットアップ

```bash
# 依存インストール
npm install

# 開発サーバー起動（http://localhost:5173）
npm run dev

# 本番ビルド
npm run build
```

## プロジェクト構成

```
src/
├── main.tsx              # エントリーポイント
├── App.tsx               # ルーティング・状態管理
├── index.css             # グローバルスタイル・アニメーション
├── types/
│   └── index.ts          # TypeScript型定義
├── data/
│   └── mockData.ts       # モックデータ（イベント・デッキ・履歴等）
├── components/
│   ├── Icons.tsx          # SVGアイコンコンポーネント
│   └── Shared.tsx         # Tag, SectionHeader, EventCard等の共通UI
└── pages/
    ├── EventsMain.tsx     # イベントトップ（参加予定・おすすめ・検索バー）
    ├── EventSearchPage.tsx # イベント検索（詳細フィルター付き）
    ├── EventDetailPage.tsx # イベント詳細・チェックイン・参加登録
    ├── TournamentPage.tsx  # 大会進行（マッチング→対戦→結果入力）
    ├── BattlePages.tsx     # 戦績一覧・大会詳細（デッキスナップショット）
    ├── DeckPages.tsx       # デッキ一覧・詳細・編集
    └── AccountPage.tsx     # アカウント
```

## デモフロー

1. **イベント** タブ → 参加予定の「ジムバトル 渋谷」（本日開催）をタップ
2. **チェックイン** → 「大会ページへ進む」
3. **マッチング確認** → 対戦相手表示 → **対戦開始**
4. **結果入力**（勝ち/負け + 先攻/後攻）→ 次ラウンドへ
5. 全4ラウンド終了で最終成績表示

## 技術スタック

- **Vite** — ビルドツール
- **React 18** — UIライブラリ
- **TypeScript** — 型安全
