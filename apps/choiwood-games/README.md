# Choiwood ゲーム 公開一式

このフォルダをそのまま GitHub Pages に置けば公開できます（ファイル名は英数字に統一済み）。

## 中身
- `index.html` … 入口。2つのゲームへのリンク（このページを開く）
- `race.html` … フレーズレース（語順チャンクを並べるゲーム）
- `studio.html` … Choiwood スタジオ（発音チャレンジ／ロールプレイ）
- `scenes.xlsx` … コンテンツ（カービィ会話・差し替え用。列＝チャプター名/シーン名/話者/英会話/語順訳/和訳）
- `config.example.js` … `config.js` にリネームして使う設定テンプレ
- `gemini-proxy-worker.js` … 本番用キー中継（Cloudflare Worker）
- `README.md` … この手順書

## 最短手順
1. このフォルダ一式を `topicmaker-team/Pages` の中（例 `apps/`）に入れて Commit & Push
2. Settings → Pages を有効化
3. 公開URL `https://topicmaker-team.github.io/Pages/apps/` をスマホの Safari / Chrome で開く
4. ゲームを選ぶ → 録音時にマイク許可

実際の発音採点を使うときだけ、下記のキー設定（フェーズ2）を行ってください。

---

# Choiwood スタジオ／フレーズレース 公開・録音・キー中継 手順

録音はサンドボックスの都合で **自分で HTTPS 配信したページ** でないと動きません。
GitHub Pages に置いて、まず録音を確認 → その後で本番用に「キーをサーバー側で中継」します。

---

## 事前メモ

- ファイル名は **英数字** に変えておくと URL が扱いやすいです。
  例) `Choiwoodスタジオ_発音ロールプレイ.html` → `studio.html` 、`フレーズレース.html` → `race.html`
- 同じフォルダに `config.js` を置くと自動で読み込まれます（中身は後述）。
- コンテンツ差し替えは、同じフォルダに `scenes.xlsx`（列＝チャプター名／シーン名／話者／英会話／語順訳／和訳）を置くだけ。

---

## フェーズ1：GitHub Pages に公開して録音を試す

これだけで「閲覧＋録音」が動きます（実採点はキーが要る／無ければデモ採点）。

1. **置き場所を用意**
   `topicmaker-team` の `Pages` リポジトリ（既存の GitHub Pages 用）を使うのが手軽です。
   その中に `apps/` などフォルダを作り、`studio.html` を入れます。

2. **GitHub Desktop でコミット＆プッシュ**
   - GitHub Desktop で該当リポジトリを開く
   - `studio.html` をローカルのフォルダにコピー → 変更が出る
   - Summary に「add studio app」など入力 → **Commit to master**
   - **Push origin**

3. **Pages を有効化**（初回のみ）
   - GitHub のリポジトリ画面 → **Settings → Pages**
   - Source を `Deploy from a branch`、Branch を `master` / フォルダ `/(root)` → Save
   - 数分待つと公開URLが表示されます

4. **スマホで開く**
   `https://topicmaker-team.github.io/Pages/apps/studio.html` のような URL を
   **iPhone は Safari、Android は Chrome** で開く
   → 録音ボタンを押すと初回に **マイク許可** が出る → 許可で録音できます

5. **この段階のキーの扱い（安全策）**
   - 一番安全なのは **config.js を置かず、テスターが各自で設定欄(⚙️)に自分のキーを貼る** 運用。
     キーは各端末のローカルにのみ保存され、ページやリポジトリには一切出ません。
   - 社内クローズドな検証だけなら `config.js` に直書き（フェーズ2の B）でも可。ただし公開リポジトリには入れないこと。

---

## フェーズ2：本番用に「キーを中継」する（公開URLにキーを出さない）

GitHub Pages は静的配信（サーバーが無い）ので、ページにキーを置くと誰でも読めてしまいます。
そこで **Cloudflare Worker** を小さなサーバーとして挟み、キーはそこに隠します。
（同梱の `gemini-proxy-worker.js` をそのまま使います）

1. **Cloudflare に無料登録** → ダッシュボードで **Workers & Pages → Create → Worker**

2. **コードを貼り付け**
   `gemini-proxy-worker.js` の中身を貼り、先頭の
   `const ALLOW_ORIGIN = 'https://topicmaker-team.github.io';`
   を**自分の Pages ドメイン**に合わせる（このままでOKなことが多いです）

3. **キーをシークレット登録**
   Worker の **Settings → Variables and Secrets** で
   - 名前：`GEMINI_KEY`
   - 値：あなたの Gemini API キー
   を **Secret** として追加 → Deploy

4. **Worker の URL を控える**
   例：`https://gemini-proxy.あなた.workers.dev`

5. **config.js を設定して置く**
   `config.example.js` を `config.js` にリネームし、中身を：
   ```js
   const CONFIG = {
     proxyBase: 'https://gemini-proxy.あなた.workers.dev'
   };
   ```
   これを `studio.html` と同じフォルダに置いて Commit & Push。
   → **このファイルにはキーが無い**ので、公開しても安全です。

6. **動作確認**
   公開URLをスマホで開く → 録音 → 採点（発音の色分け）が出れば成功。
   ページのソースを見てもキーは出てきません（Worker 側にだけ存在）。

---

## つまずきポイント

- **録音が始まらない**：HTTPS で開けているか、マイク許可を「許可」したか、別アプリがマイクを占有していないか。
- **採点が「デモ採点」になる**：キー（または proxyBase）が読めていない。設定欄に貼るか、config.js を確認。
- **Worker が CORS エラー**：`ALLOW_ORIGIN` が実際の Pages ドメインと一致しているか確認（末尾スラッシュ無し）。
- **日本語ファイル名**：動きはしますが URL がエンコードされて読みにくいので英数字推奨。

---

## まとめ

| やりたいこと | 方法 |
| --- | --- |
| とにかく録音を試す | フェーズ1（GitHub Pages公開＋各自キーを設定欄に貼る） |
| 公開してもキーを守る | フェーズ2（Cloudflare Worker で中継、config.js は proxyBase のみ） |
| コンテンツ差し替え | 同フォルダに `scenes.xlsx` を置く |
