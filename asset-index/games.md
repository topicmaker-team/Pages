# 🎮 ゲーム

← [一覧トップに戻る](README.md)

英語学習用のゲーム・ミニゲーム（実験的・プロトタイプ含む）。生成ツール（GENERATOR）や公開アプリ（プロダクト）とは分けて管理します。

---

## 地雷発音 Pronunciation Minefield <a id="pronunciation-minefield"></a>
- **作成者**: 高橋 / **作成日・最終更新**: 2026-06-17
- **URL**: https://devel.enhack.app/static/playground/PronunciationMinefield/pronunciation_minefield.html
- **概要**: 「いい加減な発音が、身を滅ぼす」。日本人が発音しづらい“地雷発音”を含む例文を発話し、発音の良し悪しで相手の反応が変わるゲーム。島谷さんのオーストラリアでの実体験（clutch が現地で crotch と受け取られた）にインスパイアされて制作。
- **メモ**: Settings に Gemini API Key を設定すると、相手の英語がよりいきいきとした応答になる。

## Speak Up Choicy（音声認識・会話フレーズ練習） <a id="speak-up-choicy"></a>
- **作成者**: 鈴木 / **作成日・最終更新**: 2026-06-17
- **URL**: https://devel.enhack.app/static/playground/speak-up-choicy/
- **概要**: 音声認識タイプの会話フレーズ練習ゲーム。質問者・回答者のどちらかの役になって練習するスタイル（先日のMTGでの草薙案のイメージ）。現在は各シーン1フレーズの会話が3点用意され、ランダムで出題。
- **メモ**: 画像はダミー（シーン背景もほぼ1種類のため内容に合わないことあり。会話ごとに別画像の設定は可能）。ヘッダー右上の設定でBGM・日本語訳のON/OFF。初回は画像・音声の読み込みに時間がかかることあり。結果画面に発音記号、お手本と自分の声の聞き比べを搭載。

## Choiwood Games（発音ゲーム） <a id="choiwood-games"></a>
- **作成者**: 島谷 / **作成日・最終更新**: 2026-06-15
- **URL**: https://topicmaker-team.github.io/Pages/apps/choiwood-games/
- **概要**: 「フレーズで遊んで覚える」学習ゲームのハブ（スマホの Safari / Chrome 向け）。2種を収録:
  - フレーズレース: 語順チャンクを「道」にして、正しい順に選んで先生の車に勝つ。
  - Choiwood スタジオ: 発音チャレンジ＆ロールプレイ。声に出して、単語ごとに色で発音フィードバック。
- **メモ**: 録音にマイク許可が必要。発音採点は Gemini のキー設定（または中継）が必要で、未設定でもデモ採点で動作。topicmaker-team/Pages の GitHub Pages 上でホスト。

## ワードキャッチバトル（Word Catch Battle） <a id="word-catch-battle"></a>
- **作成者**: 島谷 / **作成日・最終更新**: 2026-06-15
- **URL**: https://claude.ai/public/artifacts/1ab8392e-6d5e-422a-829f-ab964002586f
- **概要**: 英単語のキャッチ系ゲーム。Claudeのアーティファクトとして制作。

## Choiwood Audition（choiwood-audition） <a id="choiwood-audition"></a>
- **作成者**: 鈴木 / **作成日・最終更新**: 2026-06-15
- **URL**: https://devel.enhack.app/static/playground/english-quiz-studio/choiwood-audition.html
- **概要**: スピーキング型ミニゲーム。映画オーディションの設定で、お題フレーズを演技指示に従って発声・録音し、Geminiが採点して結果表示。結果に応じてポイント付与・称号獲得。「Listen」でお手本再生、「Skip」でパス。現状はアニメ・音声控えめのシンプル版。
- **採点ロジック**: 録音(MediaRecorder)→AudioContextでデコード→16kHz mono WAV(PCM16)へ再エンコード→base64で gemini-2.5-flash にインライン送信（webm/opusは不確実なためWAVへ正規化）。テキスト化せず生音声で判定。評価軸は accuracy（発音の正確性）と expression（感情・トーン再現）各0–100。
- **設計の狙い**: 演技で感情を動かしエピソード記憶化、役割（オーディション受験者）で恥ずかしさを軽減、ダメ出しを「リテイク」と捉え直して再挑戦を促す、待ち時間をポイント獲得に転換、といった学習動機づけの設計。
- **更新（2026-06-15）**: 字幕オン時の日本語解説を万次郎語（調整中）に変更し英文にスラッシュを追加。accuracy / expression に単語単位の発音チェック（◎良い／△惜しい／×改善の余地あり）を追加。改善できる単語には「どこがどう違うか／どう直すべきか」の解説を表示。採点プロンプトの編集ツールは [choiwood-dev](#choiwood-dev)。

## Choiwood 採点プロンプト編集ツール（choiwood-dev） <a id="choiwood-dev"></a>
- **作成者**: 鈴木 / **作成日・最終更新**: 2026-06-15
- **URL**: https://devel.enhack.app/static/playground/english-quiz-studio/choiwood-dev.html
- **概要**: [Choiwood Audition](#choiwood-audition) の採点プロンプトを編集・シミュレーション・ダウンロードできる開発／編集ツール。採点プロンプト部分のみを抜き出して表示。
- **メモ**: 本ゲームのプロンプトは処理速度・出力精度を優先して英語表記。今後のミニゲームサンプルは編集しやすさを考慮し日本語プロンプト表記を検討。

## モグラたたきフレーズゲーム <a id="mogura-phrase-game"></a>
- **作成者**: 草薙（原案） / 肥後（見た目改良版） / **作成日・最終更新**: 2026-06-15
- **URL**:
  - 草薙 原案（モグラたたきフレーズゲーム.html）: https://drive.google.com/file/d/1aAJBK1dZ2MyzWODQchswcQrSsmFz9lpe/view?usp=drive_link
  - 肥後 改良版（モグラたたきフレーズゲーム_higo.html）: https://drive.google.com/file/d/1u0df7jLKAptmNukaXWkSBhIoA4fhXTVr/view?usp=drive_link
- **保存場所**: `H:\共有ドライブ\2026年\英語で英語を学ぶ`
- **概要**: キーフレーズを使ったモグラたたき型ゲーム。基本は並び替えで、時間切れもあるため瞬間英作ができないとクリアが難しい。良い点を取りたい動機でキーフレーズを暗記させる狙い。キーフレーズは開始時に設定可能（インバウンド応対カフェのキーフレーズ60個が初期データ）。草薙が「インバウンド応対」をキーフレーズベースで作り直したExcel（未校正）を共有ドライブに配置。
- **版・今後の案**: 肥後改良版は草薙版をClaudeチャットで読み込み見た目を改良。今後の案＝モグラに動き／選択肢を隠した状態での成立／叩く動作・ビジュアル／単語表示時間デフォルト30秒。

## word racer <a id="word-racer"></a>
- **作成者**: 高橋 / **作成日・最終更新**: 2026-06-13
- **URL**: https://claude.ai/public/artifacts/2060cd93-5530-4d3d-9fda-a9b085a406ec
- **概要**: 英単語のレーサー型ゲーム。Claudeのアーティファクトとして制作。
- **制作チャット**: https://claude.ai/share/1dce43d2-a3d1-469c-be8d-1bc459bf1694

## あいぼうトーク（aibou-talk） <a id="aibou-talk"></a>
- **作成者**: 鈴木 / **作成日・最終更新**: 2026-06-12
- **URL**: https://devel.enhack.app/static/playground/english-quiz-studio/aibou-talk.html
- **GitHub**: https://github.com/topicmaker-team/aibou-talk
- **概要**: 「英語で英語を学ぶ」をイメージし、友達キャラ（あいぼう）に英語を教わるスタイルの学習コンテンツ。授業のテキストと音声は、選んだトピック・難易度に合わせて Gemini が生成（クイズの答えに合わせて生成されることもある）。Claudeチャットで制作。
- **クイズ**: レベルに応じて、穴埋めに加え comprehension（内容理解の確認）、opinion（正誤なしの「どう思う？」）を出題。
- **ミニゲーム**: 生成待ちの間に遊べる2種を搭載（ホーム右上の設定ギアで切替）。(1) 英単語の野球ゲーム＝ボールがバットに近づいた瞬間に SWING! を押し、正解で加点・不正解で減点（空振り・見逃しも減点）。(2) 英単語落下タイプの瞬間英作ゲーム＝青いドット補助線と空欄の落下先に合わせ、下部ボタンで単語を操作。難易度で単語レベルや落下スピードが変わり、正解数が増えると速くなる。原稿はExcelから読み込み。
- **キャラ**: [えもつく](generators.md#emotsuku) 等のキャラ生成ツールで作成したものを利用。
- **メモ**: 効果音は mixkit（https://mixkit.co/free-sound-effects/ ）と soundeffect-lab（https://soundeffect-lab.info/sound/anime/ ）を使用。初回は効果音が出ない／遅れることがある。落下式ミニゲームは2026-06-12のMTGフィードバックを受けて追加。
