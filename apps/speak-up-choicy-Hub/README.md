# §3-5 スコアラ抽象化 ＋ APIパック

採点バックエンドを差し替え可能にし、本番では **Gemフキーをクライアントから排除**するための仕組み。

## 全体像

```
[ブラウザ app.js]  scoreUtterance(mine, blob)
        │  C.SCORER で分岐
        ├─ "gemini" : geminiJudge   … Gemini直叩き（開発用・キーが露出）
        ├─ "api"    : apiJudge ──POST──▶ [server/score-proxy.js] ──▶ Gemini（キーはサーバ環境変数）
        └─ "demo"   : demoJudge     … キー/マイク不要のダミー
```

すべてのバックエンドは **共通契約 `judge.js`** に従い、同じ統一形を返す：

```json
{ "words":[{"word":"rice","level":"great|close|practice|missing","weak":"<IPA1つ>"}],
  "said_text":"…", "comment":"…", "comment_mj":"…", "trap_hits":["rice"] }
```

`judge.js`（`buildJudgePrompt` / `normalizeJudge`）はクライアントとサーバが**同一ファイルを共有**するため、プロンプトと正規化のロジックが二重化しない。

## 使い方

### 1) これまで通り（Gemini直・開発用）
`config.js` を変更しなければ従来どおり `gemini` で動く（キーは `GEMINI_API_KEY`）。※静的配信ではキーが見えるので本番不可。

### 2) 本番（サーバ経由・キー秘匿）
サーバを起動：
```
GEMINI_API_KEY=xxxx GEMINI_MODEL=gemini-2.5-flash PORT=8787 node server/score-proxy.js
```
`config.js` に追記：
```js
SCORER: "api",
SCORER_API_URL: "http://localhost:8787/score",   // 本番は https の自ホストに
```
これでクライアントにキーは一切入らない。`config.js` の `GEMINI_API_KEY` は空でよい。

### 3) デモ（キー/マイク不要）
`DEMO_MODE: true` で全画面を試せる（採点はダミー）。`DEMO_MODE` は他設定より優先。

## 国内音声認識（ASR）に差し替える
`server/score-proxy.js` の `scoreWithGemini()` 内、コメント「国内ASRに差し替える場合はここを置換」の箇所を、
1. 国内ASRで `audio_b64` → transcript
2. transcript と `text_en` を突き合わせて `words/level` を生成（自前 or 別LLM）
3. `JUDGE.normalizeJudge({...}, wordList)` で返す

返り値が契約どおりなら **クライアントは無改修**。`SCORERS` に `jp_asr` を足してクライアント側で直接叩く構成も可。

## セキュリティ（§7-1 の解消）
- 本番は `SCORER:"api"` にして `config.js` から実キーを外す。
- サーバ `ALLOW_ORIGIN` をアプリのオリジンに限定（既定 `*` は開発用）。
- 直叩き(`gemini`)を残す場合は Google Cloud Console でリファラ制限・API制限・低い日次上限を設定。

## 契約（POST /score）
```
req  { text_en, chunks_en, audio_b64, audio_mime, traps:[{word,error,target_ipa,error_ipa}] }
res  { words, said_text, comment, comment_mj, trap_hits }
```
`GET /health` で `{ ok, model, keyConfigured }` を確認できる。
