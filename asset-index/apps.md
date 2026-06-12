# 📱 公開アプリ（プロダクト）

← [一覧トップに戻る](README.md)

「ちょい英語」の公開用アプリ本体（デッキ群）。実験ツール（GENERATOR）や設計資料（設計・UI）とは分けて管理します。各アプリは開発状況を併記します。

---

## 語彙系デッキ <a id="deck-goi"></a>
- **作成者**: 高橋 ほか / **状況**: 開発中（単語デッキはダミーデータ版でプレビュー可）
- **概要**: 公開用の語彙学習デッキ。会話問題（一般／タメ口の選択）と単語問題（日英／英日／スペルの選択）で構成。
- **現行の実装・プレビュー**:
  - 単語デッキ（ダミーデータ版）: https://devel.enhack.app/static/playground/choi/wordsTraining-bundle.html?mock=mock/wordsTraining.json
    本体（デッキ／投稿システム）が開発中のため、高橋が回避用に用意したダミーデータ版。`?mock=mock/wordsTraining.json` でモックを読み込んで表示する。
  - 会話デッキ: https://devel.enhack.app/static/playground/choi/dialogForWordDeck-bundle.html （現状は未動作）
- **設計元**: [デッキカード 基本構成 / 画面遷移](design.md#spec-deck-ui)

## 企画系デッキ（カービィ） <a id="deck-kikaku"></a>
- **作成者**: 高橋（デッキ化） / 鈴木（データ・画像） / **状況**: 開発サーバーで実証実験中
- **概要**: 企画テーマ単位の公開用デッキ。第1弾は「だいすき！カービィ」。
- **URL**: https://devel.enhack.app/static/playground/choi/miniDevBook.html?url=kirby%2Findex.json&build=bundle
- **データ生成**: [ちょい英語ミニブック作成ツール（choiMiniBookDataDev）](generators.md#choi-minibook)（Excel＋画像→JSON/TTS）
- **設計元**: [デッキカード 基本構成 / 画面遷移](design.md#spec-deck-ui)

## ニュース系デッキ <a id="deck-news"></a>
- **状況**: 開発中 / 実装URL未定
- **概要**: ニュース題材の公開用デッキ。
- **設計元**: [デッキカード 基本構成 / 画面遷移](design.md#spec-deck-ui)
