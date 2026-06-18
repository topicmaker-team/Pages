/* ============================================================
   taxonomy.js — 発音崩壊軸タクソノミー（接着スキーマ / §3-3）
   出典: remixed-1ddb3585.md「日本語話者の発音崩壊軸 タクソノミー」
   役割: 軸ID を単一キーに、ヒント・動画slug・対比例・ドリルID・崩壊タイプ・耳口を束ねる。
        判定の weak(IPA) も trap の axis も、すべてこの軸IDに解決される。
   ------------------------------------------------------------
   各軸: { label_ja, type:'正しく出す'|'し分ける', channel:'耳'|'口'|'両方',
           examples:[...], drill:'<ドリル集ID/§3-4>', slug:'<代表の調音slug>',
           members:{ '<IPA>': { slug, en, mj } },   // IPA→調音ヒント
           tip?:{ en, mj } }                          // memberが無い軸の軸レベルヒント
   members の en/mj/slug は ARTIC_TIPS から移植（既存挙動を維持）。
   slug は ARTIC_CFG / videos/phonemes の規約キーと一致させる。
   ============================================================ */
window.AXES = {
  /* ---------- 子音 ---------- */
  "L_R": {
    label_ja: "L と R", type: "し分ける", channel: "両方", drill: "L_R", slug: "r",
    examples: ["light / right", "play / pray", "rice / lice"],
    members: {
      "l": { slug: "l", en: "L: press the tip of your tongue firmly behind your upper front teeth.", mj: "Lは舌先を上の前歯の裏にしっかり当てる。" },
      "r": { slug: "r", en: "English R: pull your tongue back and keep it touching nothing — don't use the Japanese ら-row.", mj: "英語のRは舌をどこにも触れさせず後ろへ引く。ラ行にしない。" },
      "ɹ": { slug: "r", en: "English R: pull your tongue back and keep it touching nothing — don't use the Japanese ら-row.", mj: "英語のRは舌をどこにも触れさせず後ろへ引く。ラ行にしない。" }
    }
  },
  "S_SH": {
    label_ja: "s と sh（iの前）", type: "正しく出す", channel: "口", drill: "S_SH", slug: "sh",
    examples: ["sit / shit", "see / she", "sip / ship"],
    members: {
      "ʃ": { slug: "sh", en: "SH: round your lips and push air over the middle of your tongue.", mj: "shは唇を丸め、舌の中央から息を流す。" }
    }
  },
  "TH": {
    label_ja: "th（θ / ð）", type: "正しく出す", channel: "口", drill: "TH", slug: "th_voiceless",
    examples: ["think / sink", "three / free", "this / dis"],
    members: {
      "θ": { slug: "th_voiceless", en: "Unvoiced TH (think): put your tongue tip lightly between your teeth and blow air — no voice.", mj: "thは舌先を軽く歯の間に出し、息だけ出す（声は出さない）。" },
      "ð": { slug: "th_voiced", en: "Voiced TH (this): tongue tip between the teeth, but turn your voice on.", mj: "ðは舌先を歯の間に出し、声も出す。" }
    }
  },
  "B_V": {
    label_ja: "v と b", type: "正しく出す", channel: "口", drill: "B_V", slug: "v",
    examples: ["vote / boat", "van / ban"],
    members: {
      "v": { slug: "v", en: "V: rest your top teeth on your bottom lip and add voice.", mj: "vは上の歯を下唇に当てて声を出す。fと違い声あり。" }
    }
  },
  "F_P": {
    label_ja: "f（フ/ハ行化）", type: "正しく出す", channel: "口", drill: "F_P", slug: "f",
    examples: ["coffee / copy", "family の f"],
    members: {
      "f": { slug: "f", en: "F: top teeth on your bottom lip, blow air with no voice.", mj: "fは上の歯を下唇に当て、息だけ出す。" }
    }
  },
  "FINAL_NASAL": {
    label_ja: "語末の n / m / ng", type: "し分ける", channel: "口", drill: "FINAL_NASAL", slug: "ng",
    examples: ["sun / some / sung"],
    members: {
      "ŋ": { slug: "ng", en: "The 'ng' sound: let it resonate through your nose; don't add a hard 'g'.", mj: "ngは鼻に抜く音。最後に「グ」を付けない。" }
    }
  },
  "FINAL_VOICING": {
    label_ja: "語末の濁り (b/d/g)", type: "正しく出す", channel: "口", drill: "FINAL_VOICING", slug: "",
    examples: ["crab / crap", "bag / back"], members: {},
    tip: { en: "Keep your voice on through a final b/d/g so it doesn't flip to p/t/k.", mj: "語末の b/d/g は声を残して濁って終える。p/t/k にしない。" }
  },
  "EPENTHESIS": {
    label_ja: "子音に余計な母音", type: "正しく出す", channel: "口", drill: "EPENTHESIS", slug: "",
    examples: ["cut→カット", "desk"], members: {},
    tip: { en: "Don't add a vowel after a final consonant — stop the sound cleanly.", mj: "語末の子音のあとに母音を足さない。音を止めて終える。" }
  },
  "R_VOCAL": {
    label_ja: "母音のあとの r (car/fork)", type: "正しく出す", channel: "口", drill: "R_VOCAL", slug: "er",
    examples: ["car", "fork", "park"], members: {},
    tip: { en: "After a vowel, color it with R instead of a flat long 'aa'.", mj: "母音のあとは「アー」で終えず r の色をつける。" }
  },
  "R_COLORED": {
    label_ja: "r母音 ɜːr (bird/work)", type: "正しく出す", channel: "口", drill: "R_COLORED", slug: "er",
    examples: ["bird", "work"],
    members: {
      "ɝ": { slug: "er", en: "R-colored vowel (bird): say 'uh' while curling your tongue back.", mj: "「アー」と言いながら舌を後ろに丸める音。" },
      "ɜ": { slug: "er", en: "R-colored vowel (bird): say 'uh' while curling your tongue back.", mj: "「アー」と言いながら舌を後ろに丸める音。" }
    }
  },
  "W_GLIDE": {
    label_ja: "w（わたり音）", type: "正しく出す", channel: "口", drill: "W_GLIDE", slug: "w",
    examples: ["west", "wood"],
    members: {
      "w": { slug: "w", en: "W: round your lips tightly first, like a small う, then glide into the vowel.", mj: "wは唇を丸めて小さい「う」から始めて滑らかに。" }
    }
  },
  "SCHWA": {
    label_ja: "あいまい母音 ə（弱化）", type: "正しく出す", channel: "口", drill: "SCHWA", slug: "schwa",
    examples: ["about", "banana"],
    members: {
      "ə": { slug: "schwa", en: "Schwa: fully relax — a short, weak 'uh' with no stress.", mj: "あいまい母音は力を抜いた弱い「ア」。強く言わない。" }
    }
  },

  /* ---------- 母音 ---------- */
  "VOWEL_LEN": {
    label_ja: "iː ↔ ɪ（長さでごまかす）", type: "し分ける", channel: "耳", drill: "VOWEL_LEN", slug: "ih",
    examples: ["sheep / ship", "sheet / shit", "beach / bitch"],
    members: {
      "ɪ": { slug: "ih", en: "Short 'i' (sit): relax — shorter and looser than the Japanese イ.", mj: "短いイは日本語のイより短く緩めて。長い iː と質で分ける。" }
    }
  },
  "VOWEL_UU_UH": {
    label_ja: "uː ↔ ʊ", type: "し分ける", channel: "耳", drill: "VOWEL_UU_UH", slug: "uh",
    examples: ["fool / full"],
    members: {
      "ʊ": { slug: "uh", en: "Short 'u' (book): relax your lips — looser than the Japanese ウ.", mj: "短いウは唇を緩めて。長い uː と質で分ける。" }
    }
  },
  "VOWEL_AE_UH": {
    label_ja: "æ ↔ ʌ", type: "し分ける", channel: "両方", drill: "VOWEL_AE_UH", slug: "ae",
    examples: ["cat / cut", "can't / cunt", "ankle / uncle"],
    members: {
      "æ": { slug: "ae", en: "The 'a' in cat: open your mouth wide — a sound between Japanese ア and エ.", mj: "æは口を大きく開け、アとエの中間の音。ʌ（こもったア）と混ぜない。" }
    }
  },
  "VOWEL_AH_UH": {
    label_ja: "ɑː ↔ ʌ（最難）", type: "し分ける", channel: "両方", drill: "VOWEL_AH_UH", slug: "",
    examples: ["cart / cut"], members: {},
    tip: { en: "ɑː is a long open 'ah' from the back; ʌ is a short central 'uh'.", mj: "ɑː は奥から出す長い「アー」。ʌ は短い中央寄りの「ア」。" }
  },
  "VOWEL_AHR_OHR": {
    label_ja: "ɑː ↔ ɔː", type: "し分ける", channel: "耳", drill: "VOWEL_AHR_OHR", slug: "",
    examples: ["park / pork", "cart / caught"], members: {},
    tip: { en: "Keep ɑː (ah) open; don't round it into ɔː (aw).", mj: "ɑː（アー）は口を開く。ɔː（オー）に丸めない。" }
  },
  "VOWEL_UU_OU": {
    label_ja: "uː ↔ oʊ", type: "し分ける", channel: "耳", drill: "VOWEL_UU_OU", slug: "",
    examples: ["soup / soap"], members: {},
    tip: { en: "uː is a pure long 'oo'; oʊ glides toward 'w'.", mj: "uː は純粋な「ウー」。oʊ（オウ）にしない。" }
  },
  "VOWEL_E": {
    label_ja: "e（bed/pen）", type: "正しく出す", channel: "口", drill: "VOWEL_E", slug: "",
    examples: ["bed", "pen"], members: {},
    tip: { en: "e (bed): a clear 'eh', kept distinct from ɪ and æ.", mj: "e は はっきりした「エ」。ɪ・æ と分けて出す。" }
  },
  "VOWEL_O": {
    label_ja: "ɔː / ɒ / oʊ → オ", type: "正しく出す", channel: "耳", drill: "VOWEL_O", slug: "",
    examples: ["ball / cot / bowl"], members: {},
    tip: { en: "These three all collapse to Japanese オ — learn each mouth shape separately.", mj: "ɔː/ɒ/oʊ はどれも「オ」に潰れがち。口の形を別々に覚える。" }
  }
};
