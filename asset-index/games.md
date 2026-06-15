# 🎮 ゲーム

← [一覧トップに戻る](README.md)

英語学習用のゲーム・ミニゲーム（実験的・プロトタイプ含む）。生成ツール（GENERATOR）や公開アプリ（プロダクト）とは分けて管理します。

---

## Choiwood Audition（choiwood-audition） <a id="choiwood-audition"></a>
- **作成者**: 鈴木 / **作成日・最終更新**: 2026-06-15
- **URL**: https://devel.enhack.app/static/playground/english-quiz-studio/choiwood-audition.html
- **概要**: スピーキング型ミニゲーム。映画オーディションの設定で、お題フレーズを演技指示に従って発声・録音し、Geminiが採点して結果表示。結果に応じてポイント付与・称号獲得。「Listen」でお手本再生、「Skip」でパス。現状はアニメ・音声控えめのシンプル版。
- **採点ロジック**: 録音(MediaRecorder)→AudioContextでデコード→16kHz mono WAV(PCM16)へ再エンコード→base64で gemini-2.5-flash にインライン送信（webm/opusは不確実なためWAVへ正規化）。テキスト化せず生音声で判定。評価軸は accuracy（発音の正確性）と expression（感情・トーン再現）各0–100。
- **設計の狙い**: 演技で感情を動かしエピソード記憶化、役割（オーディション受験者）で恥ずかしさを軽減、ダメ出しを「リテイク」と捉え直して再挑戦を促す、待ち時間をポイント獲得に転換、といった学習動機づけの設計。

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
