# 調査: ジャンル特化型SNSのリテンションフック

> 「SNS特化でPMFを目指す」方向転換（2026-07-31 オーナー発案）の検討材料。
> 趣味×記録×ライトな交流という構造がTCGと近い成功事例を調査し、
> リテンションを生む仕掛けをパターン化 → TCG Advance への示唆に落とす。
> 位置づけ: `10_business-plan.md` v0.2 改訂のインプット。

## 1. 調査対象と規模感

| サービス | ジャンル | 規模の根拠数字 |
| --- | --- | --- |
| Strava | ランニング/自転車 | 2025年に約140億Kudos（前年比+20%）。グループ活動のユーザーはソロのみより12か月後残存が高い |
| Untappd | クラフトビール | チェックイン累計10億件（2021）、バッジ獲得累計10億個（2022） |
| Letterboxd | 映画 | 4年でユーザー180万→1,700万人。累計10億本ログ、うち7億本が2024年 |
| YAMAP | 登山（国内） | プレミアム年会員の次年度継続率90%。MAU約60万に対し有料会員率約20%（一般的成功水準3〜5%の数倍） |
| アングラーズ | 釣り（国内） | MAU90万人（2021）、釣果投稿累計500万件超 |

## 2. リテンションフックの8パターン

事例を横断すると、フックは大きく「記録（単独価値）」「承認（対人価値)」「収集（達成価値)」「回帰理由（習慣化）」の4層×8パターンに整理できる。

### A. 記録層 — 「自分の趣味の歴史がここに貯まる」

**① ログが個人資産になる**
Letterboxdの日記（観た日付つき視聴史）、YAMAPの活動日記、アングラーズの釣果記録。
記録が貯まるほど乗り換えコストが上がり、SNSを見なくても開く理由が残る。
これが cdixon の [Come for the tool, stay for the network](https://cdixon.org/2015/01/31/come-for-the-tool-stay-for-the-network/) / Single Player Mode 論の実体:
**1人でも価値があるツールが先、ネットワークは後から効いてくる**。

**② 行動が自動でコンテンツになる（投稿の摩擦ゼロ）**
StravaはGPSが走行ログを自動生成、アングラーズは釣果に潮汐・天気・地図を自動付与。
「投稿を作る」創作コストがなく、趣味の活動をするだけでフィードが埋まる。
純SNSのコールドスタート（書くことがない問題）をジャンル特化SNSが回避できる最大の理由。

### B. 承認層 — 「見てくれる人がいるから続く」

**③ ライトな相互承認（Kudos型）**
Stravaの Kudos はコメント不要のワンタップ承認で年140億回。
「自分の活動が、意見を気にする相手に見えている」ことが行動の一貫性自体を高めるという分析もある。

**④ 治安のいい小さなフィード（アルゴレス）**
Letterboxdは友人の新着レビュー優先で、アルゴリズム駆動の無限フィードを持たない。
巨大SNSの毒性からの避難先であること自体が価値。YAMAPも「40代で友達が増えた」という交流価値が語られる。

### C. 収集・達成層 — 「上手くなくても積み上がる」

**⑤ バッジ・コレクション**
Untappdの中核。ユニークビール数・スタイル・地域・記念日などで多段階バッジを発行し、
アプリの話題の大半がバッジ関連になるほどの求心力。「未収集を埋めたい」が再訪動機になる。

**⑥ 実力でなく頻度に報いる仕組み**
StravaのLocal Legend（直近90日で最多回数走った人）は速さでなく通った回数の称号。
上位者以外の大多数に「自分でも取れる目標」を与え、リテンションに直結する頻度行動へ報酬を出す。

### D. 回帰層 — 「活動していない日にも開く理由」

**⑦ 趣味の実活動リズムとの同期＋実用コンテンツ**
アングラーズの潮見表、YAMAPの山情報・ルート検索は「次の活動の準備」で開かせる。
趣味自体に週次リズム（釣行・登山・大会）があるジャンルは、その周期がそのままアプリの利用周期になる。

**⑧ 未来の意図の置き場と振り返り**
Letterboxdのウォッチリスト（観たい映画）は未来の自分への予約。年間統計・振り返り（Strava/Letterboxdの year in review）は年単位の再訪と外部共有（=獲得）を生む。

## 3. ベンチマーク指標

- ソーシャル/コミュニケーション系アプリのD30残存は約15〜20%で、消費者向けアプリ中最も高い部類（ネットワーク効果が残存を担う）（[a16z](https://a16z.com/the-stickiest-most-addictive-most-engaging-and-fastest-growing-social-apps-and-how-to-measure-them/)）
- ツール→ネットワーク移行期は日次でなく**週次リテンション**で見るのが妥当（同上）。TCGの活動周期（週末大会）とも整合
- 有料転換の参考: YAMAPはMAUの約20%が有料（記録・地図というツール価値への課金）

## 4. TCG Advance への当てはめ

### 4.1 現状の持ち駒をパターンに対応させると

| パターン | 現状 | 評価 |
| --- | --- | --- |
| ② 行動→自動コンテンツ | GPSチェックイン＝「この大会に居た」が自動投稿になり得る | ✅ 部品あり（フィード未実装） |
| ③ ライト承認 | GG/マナー評価がKudosに相当 | ✅ 実装済み |
| ④ 小さなフィード | フォローは実装済み、フィードは「準備中」 | 🚧 |
| ① ログ資産 | 戦績・参加履歴の蓄積表示が未実装 | ❌ **最大の欠落** |
| ⑤⑥ 収集・頻度報酬 | なし（チェックイン回数は素材として既に貯まる） | ❌ |
| ⑦ 実用×週次リズム | イベント一覧が「次の大会探し」の実用枠。大会の週次リズムはTCGに元からある | ✅ 部品あり |
| ⑧ 未来意図・振り返り | 「行きたいイベント」ブックマーク、シーズン振り返りともに未実装 | ❌ |

### 4.2 示唆（v0.2の議論のたたき台）

1. **リテンションの背骨は「TCGライフの日記」になりそう**。事例横断で最も効いているのは①ログ資産（単独価値）。TCG Advanceで言えば「参加した大会・対戦・戦績が自動で貯まる個人アーカイブ」。SNSのフィードはその副産物として生える順序が、Letterboxd/YAMAP/アングラーズの共通構造
2. **TCG固有の強み: 記録がソーシャルグラフを内蔵する**。釣りや映画と違いTCGの1試合には必ず対戦相手がいる。戦績記録に相手をタグづけできれば「記録するほど繋がる」構造になり、Stravaで確認された「グループ活動ユーザーは残存が高い」効果を記録機能そのものに埋め込める
3. **チェックインはコンテンツ生成器として再定義**。「不正防止つき参加証明」(運営ツール文脈)から「摩擦ゼロの自動投稿+収集素材」(SNS文脈)へ。チェックイン履歴は⑤⑥のバッジ/頻度報酬（例: ○○店の常連、6タイトル制覇）の素材に直結
4. **KPIはD30より週次残存**。大会の週次リズムに合わせ、PMF指標は「4週後残存」「チェックインのリピート率」系が妥当（v0.1 §4の方向を補強）
5. **競合空白の確認**: 公式アプリ（BANDAI TCG+等）はタイトル縦割りの手続きツールで、①ログ資産も③承認も持たない。「TCG版Strava/Letterboxd」ポジションは引き続き空いている

## 5. 次の論点（オーナーと議論したいこと)

- 「日記(戦績・参加ログ)を単独価値の核に据える」ことに合意できるか → するなら Phase 2 の実装優先度は フィード より 戦績アーカイブ が先という逆転が起きる
- 戦績入力の摩擦をどこまで下げられるか（②の原則: 手入力が増えるほどフックは弱る。チェックイン済みイベントに紐づく簡易入力、対戦相手タグの相互確認など）
- バッジ/称号（⑤⑥）はどの時点で入れるか（実装は軽いが、乱発するとチープになる）

---

### 出典

- Strava: [Trophy: Strava Gamification Case Study](https://trophy.so/blog/strava-gamification-case-study) / [Trophy: Segmented Leaderboards](https://trophy.so/blog/how-strava-uses-segmented-leaderboards-to-drive-engagement) / [StriveCloud](https://www.strivecloud.io/blog/app-engagement-strava) / [SQ Magazine: Strava Statistics](https://sqmagazine.co.uk/strava-statistics/) / [startupsignals](https://startupsignals.substack.com/p/strava-if-its-not-on-strava-it-didnt)
- Untappd: [Wikipedia](https://en.wikipedia.org/wiki/Untappd) / [Untappd Lounge: Badges](https://lounge.untappd.com/everything-you-need-to-know-about-untappd-badges/) / [arXiv: Longitudinal Analysis of Gamification in Untappd](https://arxiv.org/html/2601.04841v1)
- Letterboxd: [Boston Globe: niche social media](https://www.bostonglobe.com/2025/11/01/business/strava-letterboxd-niche-social-media/) / [Variety](https://variety.com/vip/letterboxd-year-end-report-growth-1236277320/) / [expandedramblings: Letterboxd Statistics](https://expandedramblings.com/index.php/letterboxd-statistics-facts/)
- YAMAP: [ITmedia](https://www.itmedia.co.jp/business/articles/2212/09/news031.html) / [日経ビジネス](https://business.nikkei.com/atcl/seminar/19nv/120500136/040501007/) / [YAMAP BUSINESS](https://corporate.yamap.co.jp/business/municipality)
- アングラーズ: [PR TIMES](https://prtimes.jp/main/html/rd/p/000000035.000019379.html) / [App Store](https://apps.apple.com/jp/app/id581133214)
- 理論・ベンチマーク: [cdixon: Come for the tool, stay for the network](https://cdixon.org/2015/01/31/come-for-the-tool-stay-for-the-network/) / [馬田隆明: SNSを作る前に知っておきたい考え方](https://tumada.medium.com/sns-%E3%82%92%E4%BD%9C%E3%82%8B%E5%89%8D%E3%81%AB%E7%9F%A5%E3%81%A3%E3%81%A6%E3%81%8A%E3%81%8D%E3%81%9F%E3%81%84%E8%80%83%E3%81%88%E6%96%B9-single-player-mode-%E3%81%A8-come-for-the-tool-4941ceb71ad5) / [a16z: How to Measure Social Apps](https://a16z.com/the-stickiest-most-addictive-most-engaging-and-fastest-growing-social-apps-and-how-to-measure-them/) / [TechCrunch: reconsidered](https://techcrunch.com/2016/12/01/come-for-the-tool-stay-for-the-network-reconsidered/)
