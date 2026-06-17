# 🧩 GENERATOR（生成ツール）

← [一覧トップに戻る](README.md)

画像・コンテンツを生成するブラウザツール／スクリプト。

---

## あいぼうトーク（aibou-talk） <a id="aibou-talk"></a>
- **作成者**: 鈴木 / **作成日・最終更新**: 2026-06-12
- **URL**: https://devel.enhack.app/static/playground/english-quiz-studio/aibou-talk.html
- **GitHub**: https://github.com/topicmaker-team/aibou-talk
- **概要**: 「英語で英語を学ぶ」をイメージし、友達キャラ（あいぼう）に英語を教わるスタイルの学習コンテンツ。授業のテキストと音声は、選んだトピック・難易度に合わせて Gemini が生成（クイズの答えに合わせて生成されることもある）。Claudeチャットで制作。
- **クイズ**: レベルに応じて、穴埋めに加え comprehension（内容理解の確認）、opinion（正誤なしの「どう思う？」）を出題。
- **ミニゲーム**: 生成待ちの間に遊べる英単語の野球ゲーム。ボールがバットに近づいた瞬間に SWING! を押し、正解で加点・不正解で減点（空振り・正解の見逃しも減点）。原稿はExcelから読み込み。
- **キャラ**: [えもつく](#emotsuku) 等のキャラ生成ツールで作成したものを利用。

## Gemini 3.5 Live Translate デモ <a id="gemini-live-translate"></a>
- **作成者**: 高橋 / **作成日・最終更新**: 2026-06-10
- **URL**: https://devel.enhack.app/static/playground/gemini/translate.html
- **概要**: Gemini 3.5 Live Translate をブラウザで試せる同時通訳デモ。マイクに向かって日本語を話すと英語や中国語へ、英語を話すと日本語へ、ほぼリアルタイムで訳す。Claude Codeで作成。※利用には Gemini の API キーが必要。
- **メモ**: 鈴木が実地テスト（ドジャース・ロバーツ監督インタビューの読み上げ）。同時通訳並みのスピードで英訳された。

## キャラクターイラスト ジェネレーター <a id="character-illustration-generator"></a>
- **作成者**: 鈴木・高橋 / **作成日**: 2026-06-05 / **最終更新**: 2026-06-10
- **URL（現）**: https://devel.enhack.app/static/playground/character-illustration-generator/
- **URL（旧名 stick-figure-generator）**: https://devel.enhack.app/static/playground/stick-figure-generator/
- **概要**: 参照画像（スタイル見本）＋「①描く対象」テキストから、タッチを固定して単体キャラ画像を生成する汎用ツール。棒人間から白黒イラスト全般へ拡張。参照画像を与えるとAIが基本設定プロンプトを自動調整することも可能。
- **更新履歴**:
  - 2026-06-10: 白黒キャラクターイラスト生成に拡張（「白黒イラスト」タブ）。トーン&マナーを「クリーン/シンプル/モダン/ライトモード/iOSカラー」に変更。動物キャラの実験も実施。
  - 2026-06-05: 同一スタイルで各種キャラを生成可能に（鈴木）。参照画像からプロンプト自動調整→キャラ→シーン展開という使い方を高橋が提示。
- **関連サンプル**: 「吾輩は猫である」キャラ https://drive.google.com/drive/folders/1W82H8Ra5sf5bv2GvIWklftT78Rb5dWlm?usp=sharing ／ 名探偵→ https://devel.enhack.app/static/playground/detective_casebook_lesson.html

## 挿絵イラスト量産ツール（stick-figure-illustrator） <a id="stick-figure-illustrator"></a>
- **作成者**: 鈴木 / **作成日**: 2026-06-04 / **最終更新**: 2026-06-10
- **URL**: https://devel.enhack.app/static/playground/stick-figure-illustrator/
- **概要**: 原稿Excel＋参照画像から、台本シーンごとの挿絵イラストを量産。生成画像付きの台本Excelもダウンロード可。モデル選択・概算コスト表示あり。
- **更新履歴**:
  - 2026-06-10: 白黒キャラクターイラストでの生成に拡張（「吾輩は猫である」キャラを参照画像に使用）。生成結果 → https://docs.google.com/spreadsheets/d/14F5gas8HNMigY6EZVbFu9FKpIFKxEYx3/edit
  - 2026-06-09: 使用モデル選択・概算コスト表示、画像付き台本ExcelのDL、複数キャラ対応プロンプトへ調整（話者名＝参照画像ファイル名で対応）、画面上に英語＋万次郎を表示。
  - 2026-06-04: 初版。プロンプト＋参照画像＋原稿Excelでシンプルな棒人間イラストを生成。
- **メモ**: モデルは2人以上の同一性維持で Pro（Nano Banana Pro）が Flash より得意。うまくいかない分のみPro再生成という運用も検討。

## YouTube Language Tutor <a id="youtube-language-tutor"></a>
- **作成者**: 鈴木 / **作成日**: 2026-05-22 / **最終更新**: 2026-06-04
- **URL（現）**: https://devel.enhack.app/static/playground/english-quiz-studio/youtube-language-tutor.html
- **URL（旧）**: https://devel.enhack.app/static/playground/youtube-english-tutor/index.html
- **GitHub**: https://github.com/topicmaker-team/YouTube-Language-Tutor ／ V2 https://github.com/topicmaker-team/YouTube-Language-Tutor-V2
- **概要**: YouTube動画の共有URLから会話フレーズ・解説を生成する語学学習ツール。生成コストは5〜10分動画で約$0.10〜$0.25。
- **更新履歴**:
  - 2026-06-04: YouTubeランキングから会話を選んで作る機能を追加（YouTube Data API v3をブラウザから直接呼出、topicmakerアカウントのAPIキー使用）。V2をGitHubに。
  - 2026-06-03: 解説の後にクイズを追加、会話にキャラ表示、初期画面をシンプル化（設定は「作成設定」内）、過去URL10件の保存・再読込。
  - 2026-05-22: 韓国語を追加（難易度は中国語HSK・韓国語TOPIK目安）。英語での解説生成、万次郎訳表示に対応。

## リップシンク テストツール <a id="lipsync-test"></a>
- **作成者**: 鈴木 / **作成日**: 2026-05-29 / **最終更新**: 2026-06-01
- **URL**: https://devel.enhack.app/static/playground/english-quiz-studio/lipsync-test.html
- **概要**: 保存済みキャラを読み込み、口形SVGパーツでリップシンクを試すツール。※「音声ソース」のTTSは未動作。
- **更新履歴**:
  - 2026-06-01: 動きが出るよう設定項目を追加（「あご連動量(px)」「輪郭の伸縮（あご）」など）。確認用サンプルキャラ追加。
  - 2026-05-29: 初版。

## 英語学習クイズ（english-quiz-studio） <a id="english-quiz-studio"></a>
- **作成者**: 鈴木 / **作成日**: 2026-05-22 / **最終更新**: 2026-05-28
- **URL**: https://devel.enhack.app/static/playground/english-quiz-studio/index.html
- **GitHub**: https://github.com/topicmaker-team/english-quiz-studio
- **概要**: Wikipedia英語記事をAIが要約し、その内容から4択クイズを生成するブラウザ向け英語学習ツール。10ジャンル×12キーワード＋自由キーワード。コンセプトは「ちょい英語」。万次郎訳はダミー。
- **更新履歴**:
  - 2026-05-28: キャラ作成機能・画面上のガイドキャラ（仮称「あいぼう」）を追加。たまご孵化システム、ロゴ・タグライン（仮）、読んだ記事タイトルの保存とメッセージ反映。キャラ作成ツール「えもつく」を単体作成後にindexへ統合。
  - 2026-05-25: ポイント獲得状況のビジュアル化（たまご→キャラ誕生）、回答後の関連キーワードリンクリスト、クイズ難易度（認知的難易度で調整）、要約元記事の画像表示。
  - 2026-05-22: 初版。まずは自分のポイント集計のみ。クイズ回数制限の撤廃などを修正。

## えもつく（キャラ作成ツール） <a id="emotsuku"></a>
- **作成者**: 鈴木 / **作成日・最終更新**: 2026-05-28
- **URL**: https://devel.enhack.app/static/playground/english-quiz-studio/emotsuku.html
- **概要**: english-quiz-studio のガイドキャラを作るツール。名称変更・保存後編集・透過PNG DL・ランダム作成。アクセサリーはポイントでアンロック。単体作成後にindexへ統合。

## 口形SVGパーツ生成（viseme-svg-generator） <a id="viseme-svg-generator"></a>
- **作成者**: 鈴木 / **作成日・最終更新**: 2026-05-29
- **URL**: https://devel.enhack.app/static/playground/english-quiz-studio/viseme-svg-generator.html
- **概要**: リップシンク用の口形SVGパーツを生成。コストは全20種の口×7形で約$1（約¥160）。

## 万次郎会話学習デモ / flashcards <a id="manjiro-flashcards"></a>
- **作成者**: 草薙（原案）・高橋（flashcards版） / **作成日・最終更新**: 2026-05-27
- **URL（flashcards版）**: https://drive.google.com/file/d/1owdGVuALvgwn46ORcCQ5pqWgRzHU53zJ/view
- **保存場所**: `H:\共有ドライブ\2026年\英語で英語を学ぶ`（「万次郎会話学習デモ」「万次郎会話学習デモ_flashcards」）
- **概要**: 会話ティップスのHTML学習アプリ。4会話2セットの構成、4択2問。誤答フレーズにも意味と解説をつけ、1問で4種のフレーズが学べる仕組み。高橋がソースを読ませてフラッシュカード型に。

## 日英単語のギャップ計測器 <a id="word-gap-meter"></a>
- **作成者**: 高橋 / **共有日**: 2026-05-25（原作 2026-03-07）
- **URL**: https://claude.ai/public/artifacts/a36d63ab-1474-4807-8283-ee7d5368e050
- **概要**: 任意の英単語が日本語話者の認知とどれだけズレているかを、意味範囲・アスペクト・格関係・認知フレーム・文化的含意の5軸で数値＋レーダーチャート表示。「出る順」ではなく「ズレ順」の単語集を作る発想。

## Excel→英語学習動画ジェネレーター <a id="excel-to-video"></a>
- **作成者**: 鈴木 / **作成日・最終更新**: 2026-05-22
- **URL**: https://devel.enhack.app/static/playground/excel-to-video/index.html
- **GitHub**: https://github.com/topicmaker-team/excel-to-video
- **概要**: ExcelからGemini TTSで音声、Veo 3.1 または Grok Imagine で背景ループ動画を生成し、字幕付き動画として再生・DL。Grokは抽象視覚メタファー、Veoは参照画像キャラのジェスチャーで表現。
- **生成例**: https://drive.google.com/file/d/1--iIem0FwTcEFuKqasMgxAndOsxo9ul6/view?usp=sharing

## Excel→英語学習動画ジェネレーター（画像版） <a id="excel-to-video-images"></a>
- **作成者**: 鈴木 / **作成日・最終更新**: 2026-05-22
- **URL**: https://devel.enhack.app/static/playground/excel-to-video-images/index.html
- **GitHub**: https://github.com/topicmaker-team/excel-to-video-images
- **概要**: 背景ループ動画ではなく4枚のイラストが切り替わるタイプ。画像は白背景・黒線のみ・アクセントカラー1色のシンプル仕様。参照画像をキャラのベースに使用可。
- **生成例**: https://drive.google.com/file/d/19N3MwhN9QIyqD4nIhTfCHqLbehXzqHwJ/view?usp=sharing

## ちょい英語ミニブック作成ツール（choiMiniBookDataDev） <a id="choi-minibook"></a>
- **作成者**: 高橋 / **作成日**: 2026-05-13 / **最終更新**: 2026-05-18
- **GitHub**: https://github.com/topicmaker-team/choiMiniBookDataDev
- **デモ**: 「だいすき！カービィ」 https://devel.enhack.app/static/playground/choi/miniDevBook.html?url=kirby%2Findex.json&build=bundle
- **概要**: Windows/Mac/Linuxで動くPythonスクリプト。Excelを読み込み、JSONデータとTTS音声を生成、サーバーへ自動アップロード。現状は開発サーバーでの実証実験フェーズ。
- **用途**: [企画系デッキ（カービィ）](apps.md#deck-kikaku)（公開アプリ）のデータ生成に使用。
- **設計元**: [デッキカード 基本構成 / 画面遷移](design.md#spec-deck-ui)（デッキ／カードのUI設計から実装）

## 新形式TOEFL 模擬試験アプリ <a id="toefl-test"></a>
- **作成者**: 堤（TSUTSUMI Katsutoshi） / **作成日・最終更新**: 2026-05-13
- **URL**: https://devel.enhack.app/static/playground/toefl_test/index.html
- **概要**: 2026年1月開始の新形式TOEFL iBT（Reading 3 / Listening 4 / Writing 3 / Speaking 2 の4技能12Task）の模擬試験を体験できるアプリ。Geminiとの対話で作成。

## 図解ガイド動画化ツール（構想） <a id="figure-guide-video"></a>
- **作成者**: 鈴木 / **作成日・最終更新**: 2026-04-24
- **参考URL**: https://devel.enhack.app/static/playground/figure-guide-video/index.html
- **概要**: 図解ガイド画像を自動生成し、音声を付けて動画化する構想。ジャンル・トピックはWikipedia等を利用し、まず50ジャンル程度＋サブカテゴリを想定。※現時点では利用不可のイメージ参考。
