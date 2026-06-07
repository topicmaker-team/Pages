# devide_eng — 英文チャンク分割 CLI

英文を「意味のまとまり（sense group）」ごとのチャンクに分割するコマンドラインツール。
分割は Claude API（`claude-sonnet-4-6`）に strict tool use でやらせ、構造化 JSON を
保証します。スラッシュリーディング（チャンクリーディング）の学習補助に使えます。

## セットアップ

```bash
pip install -r requirements.txt
cp .env.example .env        # .env に自分の ANTHROPIC_API_KEY を設定
```

API キーは [Anthropic Console](https://console.anthropic.com/) で発行できます。
`.env` は `.gitignore` 済みなので、キーがコミットされることはありません。

## 使い方

```bash
# 引数で渡す
python -m chunker "When I was a child, I lived in a small town near the sea."

# ファイルから読む + 1行ずつ + 和訳付き
python -m chunker --file input.txt --format lines --translate

# 標準入力 + JSON 出力
echo "I want to learn English to travel abroad." | python -m chunker --format json
```

### オプション

| オプション | 説明 |
| --- | --- |
| `text`（位置引数） | 分割する英文。省略時は `--file` か標準入力から読む。 |
| `-f, --file PATH` | 英文を読み込むファイル。 |
| `--format {slash,lines,json}` | 出力フォーマット（既定: `slash`）。 |
| `-t, --translate` | 各チャンクに和訳を併記する。 |
| `--model ID` | 使用する Claude モデル ID（既定: `claude-sonnet-4-6`）。 |

### 出力例

```
$ python -m chunker "When I was a child, I lived in a small town near the sea."
When I was a child / I lived in a small town / near the sea

$ python -m chunker --translate "I lived in a small town near the sea."
I lived in a small town (私は小さな町に住んでいた) / near the sea (海の近くの)
```

## 設計メモ

- ツール定義と system プロンプトは実行ごとにバイト不変に保ち、`cache_control` で
  プロンプトキャッシュを効かせています（繰り返し実行時のコスト削減）。
- `--translate` の有無による出し分けは整形側（`formatter.py`）のみで行うため、
  API へ送るプレフィックスは変わらずキャッシュが維持されます。
- エラー（API キー未設定・通信失敗・応答不整合）は握りつぶさず、`cli.py` で
  人間向けメッセージに変換し、終了コード 1 で終了します。

## テスト

整形ロジックは API なしでテストできます。

```bash
python -m unittest discover -s tests      # 標準ライブラリのみ
# または
python -m pytest tests/                    # pytest がある場合
```
