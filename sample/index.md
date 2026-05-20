# サンプル

ビューアの動作確認用サンプル。

- [https://topicmaker-team.github.io/Pages/markdown.html?sample/document.md](https://topicmaker-team.github.io/Pages/markdown.html?sample/document.md) — Markdown ビューア
- [https://topicmaker-team.github.io/Pages/mermaid.html?sample/diagram.mermaid](https://topicmaker-team.github.io/Pages/mermaid.html?sample/diagram.mermaid) — Mermaid ビューア
- [https://topicmaker-team.github.io/Pages/svg.html?sample/figure.svg](https://topicmaker-team.github.io/Pages/svg.html?sample/figure.svg) — SVG ビューア

---

## ビューアの使い方

3 種類のビューアはすべて **クエリ文字列で対象ファイルを指定する** 共通方式。
`window.location.search` の `?` 以降をデコードして、そのままファイルパスとして
`fetch()` する。同一オリジン配下のパスならどこでも対象にできる(深い階層、
日本語ファイル名も可)。

| ビューア | 対象拡張子 | URL 例 |
|---|---|---|
| `markdown.html` | `.md` | `markdown.html?sample/document.md` |
| `mermaid.html` | `.mermaid` | `mermaid.html?sample/diagram.mermaid` |
| `svg.html` | `.svg` | `svg.html?sample/figure.svg` |

共通機能:
- OS のダークモード設定に自動追従(`prefers-color-scheme`)
- 「ソース表示」トグルで生のファイル内容を確認可能

ビューア別の特徴:
- **markdown.html**: Markdown 内の ```mermaid``` コードブロックをインラインで描画する。
  見出しベースの目次、表、コードハイライト対応
- **mermaid.html**: `.mermaid` ファイル単体をパン/ズーム可能なキャンバスで描画
- **svg.html**: SVG をパン/ズーム表示

### ローカルでのプレビュー

`file://` で直接開くと `fetch()` が CORS でブロックされるため、必ずローカル
HTTP サーバ経由で開く:

```sh
python3 -m http.server 8000
# ブラウザで http://localhost:8000/markdown.html?sample/document.md などを開く
```
