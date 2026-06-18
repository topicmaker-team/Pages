/* ============================================================
   drills.js — 発音特化ドリル集（§3-4）。軸ID をキーにフレーズ集を束ねる。
   各軸: { intro_mj, phrases:[ { text_en, chunks_en, manjiro_ja, note_mj } ] }
   text_en/chunks_en は既存の採点パイプライン(geminiScore/finalizeScore + beatsFor)へそのまま渡す。
   TH = 草薙さん「各位へ.md」の th 集中レッスン10本を移植。
   ============================================================ */
window.DRILLS = {
  "TH": {
    intro_mj: "th が連続するフレーズ集。無声 θ(think)は息だけ、有声 ð(this)は声も。舌先を軽く歯の間に。",
    phrases: [
      { text_en: "I think this is better than that.", chunks_en: "I think / this is better / than that.", manjiro_ja: "私 思う / これ より良い / あれ より", note_mj: "無声 think ↔ 有声 this/than/that の素早い切替" },
      { text_en: "The weather is worse today than yesterday.", chunks_en: "The weather / is worse today / than yesterday.", manjiro_ja: "天気 / 今日 もっと悪い / 昨日 より", note_mj: "the/weather/than すべて有声 ð。喉を震わせる" },
      { text_en: "My brother threw three things over there.", chunks_en: "My brother / threw three things / over there.", manjiro_ja: "私の兄 / 投げた 3つ / あそこ", note_mj: "threw three things は無声 θ の連続。brother/there は有声" },
      { text_en: "They walked through the thick forest on Thursday.", chunks_en: "They walked / through the thick forest / on Thursday.", manjiro_ja: "彼ら 歩いた / うっそうの森 抜けて / 木曜", note_mj: "through は th の直後に r。舌を引く練習" },
      { text_en: "The author gathered those thoughts in this book.", chunks_en: "The author / gathered those thoughts / in this book.", manjiro_ja: "著者 / それらの考え 集めた / この本", note_mj: "語中の th（author / gathered）の練習に最適" },
      { text_en: "Health is more important than wealth.", chunks_en: "Health is / more important / than wealth.", manjiro_ja: "健康 / もっと大事 / 富 より", note_mj: "語尾の無声 θ（health / wealth）↔ than の有声 ð" },
      { text_en: "I would rather go to the theater than stay home.", chunks_en: "I would rather / go to the theater / than stay home.", manjiro_ja: "私 むしろ / 劇場 行く / 家いる より", note_mj: "rather/the/than（有声）↔ theater（無声）" },
      { text_en: "Arthur thought the therapy was very smooth.", chunks_en: "Arthur thought / the therapy was / very smooth.", manjiro_ja: "アーサー 思った / その治療 / とても滑らか", note_mj: "Arthur/thought/therapy（無声）↔ the/smooth（有声）。smooth の語尾は ð" },
      { text_en: "There are thousands of things to think about.", chunks_en: "There are / thousands of things / to think about.", manjiro_ja: "ある / 何千の こと / 考える", note_mj: "thousands/things/think すべて無声 θ。口先の摩擦を連続で" },
      { text_en: "That thief stole their leather bags last month.", chunks_en: "That thief / stole their leather bags / last month.", manjiro_ja: "あの泥棒 / 彼らの革バッグ 盗んだ / 先月", note_mj: "thief/month（無声）↔ that/their/leather（有声）。語中の ð を滑らかに" }
    ]
  },
  "L_R": {
    intro_mj: "L と R の対比集。L は舌先を上の歯ぐきにしっかり当てる。R はどこにも当てず後ろへ引く。",
    phrases: [
      { text_en: "I really like rice.", chunks_en: "I really like / rice.", manjiro_ja: "私 本当に 好き / お米", note_mj: "rice を L で言うと lice（シラミ）。really の r も" },
      { text_en: "Please collect the correct list.", chunks_en: "Please collect / the correct list.", manjiro_ja: "どうぞ集めて / 正しいリスト", note_mj: "collect / correct / list で l と r が交互" },
      { text_en: "The little girl plays alone.", chunks_en: "The little girl / plays alone.", manjiro_ja: "その小さい女の子 / 一人で遊ぶ", note_mj: "little / girl / alone の l、plays の連続" },
      { text_en: "Fred will fly around the world.", chunks_en: "Fred will fly / around the world.", manjiro_ja: "フレッド 飛ぶ / 世界中", note_mj: "Fred/around/world の r ↔ will/fly の l" },
      { text_en: "We elected a real leader.", chunks_en: "We elected / a real leader.", manjiro_ja: "私たち 選んだ / 本当のリーダー", note_mj: "elected を r で言うと erection。real/leader の l↔r" },
      { text_en: "Pray for the players.", chunks_en: "Pray for / the players.", manjiro_ja: "祈る / 選手たち", note_mj: "pray ↔ play。子音連続の r/l がいちばん難しい" },
      { text_en: "The grass grows near the glass.", chunks_en: "The grass grows / near the glass.", manjiro_ja: "草 育つ / ガラス の近く", note_mj: "grass ↔ glass、grows の連続 r" },
      { text_en: "The brave driver arrived early.", chunks_en: "The brave driver / arrived early.", manjiro_ja: "勇敢な運転手 / 早く着いた", note_mj: "brave/driver/arrived/early の r を連続で" },
      { text_en: "Read the long list aloud.", chunks_en: "Read the long list / aloud.", manjiro_ja: "読む 長いリスト / 声に出して", note_mj: "read の r ↔ long/list/aloud の l" },
      { text_en: "Lock the door and rock the boat.", chunks_en: "Lock the door / and rock the boat.", manjiro_ja: "ドア 鍵 / 舟 揺らす", note_mj: "lock ↔ rock の語頭 l/r 対比" }
    ]
  },
  "VOWEL_LEN": {
    intro_mj: "iː（長いイー）と ɪ（短いイ）の対比。長さだけでなく口の構えで分ける。",
    phrases: [
      { text_en: "She lives by the sea.", chunks_en: "She lives / by the sea.", manjiro_ja: "彼女 住む / 海 そば", note_mj: "lives(ɪ) ↔ leaves(iː)、sea は iː" },
      { text_en: "Please sit in this seat.", chunks_en: "Please sit / in this seat.", manjiro_ja: "どうぞ座る / この席", note_mj: "sit(ɪ) ↔ seat(iː) を同じ文で対比" },
      { text_en: "Is it cheap to ship?", chunks_en: "Is it cheap / to ship?", manjiro_ja: "安い? / 送る", note_mj: "cheap(iː) / ship(ɪ)" },
      { text_en: "I feel a little ill.", chunks_en: "I feel / a little ill.", manjiro_ja: "感じる / 少し 具合悪い", note_mj: "feel(iː) ↔ fill、ill(ɪ)" },
      { text_en: "He eats a big meal.", chunks_en: "He eats / a big meal.", manjiro_ja: "彼 食べる / 大きい食事", note_mj: "eats/meal(iː) ↔ big(ɪ)" },
      { text_en: "Keep this clean sheet.", chunks_en: "Keep this / clean sheet.", manjiro_ja: "保つ / きれいなシーツ", note_mj: "sheet(iː) を ɪ で言うと shit。keep/clean も iː" }
    ]
  }
};
