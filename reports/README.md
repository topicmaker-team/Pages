# Pages

topicmaker-team の共有ナレッジ・レポート集約リポジトリです。
各種MDファイル・ビューア・チームメンバーのレポートをここに置きます。

このリポジトリのファイルは、GitHub Pages サイトのページとしてもアクセスできます。

URLは、https://topicmaker-team.github.io/Pages/{ファイルパス}

Markdownファイルに拡張子を省略したURLでアクセスすると、HTML に整形した状態で表示できます。

たとえば、[https://topicmaker-team.github.io/Pages/sample/index](https://topicmaker-team.github.io/Pages/sample/index) は、Pages/sample/index.md の内容を表示します。

## このリポジトリの構成

```
Pages/
├── README.md          ← このファイル
├── markdown.html      ← Mermaid付きMarkdownのビューア
├── mermaid.html       ← Mermaid図のビューア
├── svg.html           ← SVGビューア
├── reports/           ← 各メンバーのレポート・チャット記録
└── sample/            ← ビューアの動作確認用サンプル
```

## チーム全体の構成

```
topicmaker-team (org)
├── Pages                  ← このリポジトリ（共通ナレッジ）
├── choiMiniBookDataDev    ← ツール: ちょい英語ミニブック
├── tts-batch-generator    ← ツール: TTS一括音声化
├── WordImageMaker         ← ツール: 英単語コアイメージ画像生成
├── YouTubeShortsUploader  ← ツール: Shorts動画自動アップロード
└── ...
```

新しいツールを作ったときは `topicmaker-team` 組織直下に独立リポジトリを作成します（下記参照）。

## 何をどこに置くか

| 種類 | 置き場所 |
|---|---|
| 作業レポート・チャット記録（MD） | このリポジトリの `reports/` |
| Claude Codeで作ったツール本体 | `topicmaker-team/` 直下に新規リポジトリを作成 |
| ビューア・サンプル | このリポジトリの直下（更新時はオーナーに相談） |

## レポートの書き方

`reports/` に `YYYY-MM-DD-名前-内容.md` の形式でファイルを作成してください。
詳しくは [`reports/README.md`](./reports/README.md) を参照。

## 新しいツールを作ったら

1. `topicmaker-team` 組織のトップで **New repository** をクリック
2. リポジトリ名はツール内容がわかる名前で（例: `manjiro-translator`）
3. Visibility は内容に応じてPublic/Privateを選択
4. ツール内には必ず `README.md` を入れて、目的・使い方を1〜2行書く
5. 作成したら、このREADMEの「チーム全体の構成」リストにも追記してもらえると、全員が把握しやすくなります

## ビューア機能について

`markdown.html`、`mermaid.html`、`svg.html` は、Markdown / Mermaid / SVG をきれいに表示するためのビューアです。

使用例：
```
https://topicmaker-team.github.io/Pages/markdown.html?reports/README.md
```
