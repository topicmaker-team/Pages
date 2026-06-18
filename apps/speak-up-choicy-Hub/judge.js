/* ============================================================
   judge.js — 採点の共通契約（§3-5）。ブラウザ / Node 両対応の小モジュール。
   採点バックエンド（Gemini直 / サーバAPI / 国内ASR）が必ずこの契約を満たすことで、
   どのエンジンでも同じ {words, said_text, comment, comment_mj, trap_hits} を返す。
     - buildJudgePrompt(): 音声採点モデルへ渡すプロンプト文字列を生成
     - normalizeJudge():   モデル/サーバ応答を統一形に正規化（欠損は安全に補完）
   この1ファイルをクライアント(app.js)とサーバ(score-proxy.js)が共有し、ロジック重複を防ぐ。
   ============================================================ */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;     // Node
  if (typeof window !== 'undefined') window.JUDGE = api;                          // Browser
})(typeof self !== 'undefined' ? self : this, function () {

  // 入力: text_en, chunks_en, wordList(配列), traps(配列 {word,error,target_ipa,error_ipa})
  function buildJudgePrompt(text_en, chunks_en, wordList, traps) {
    traps = traps || [];
    const dangerBlock = traps.length
      ? `\nDANGER WORDS — each of these target words turns into a DIFFERENT, often embarrassing word if mispronounced. For EACH, judge ONLY whether the learner's actual pronunciation sounded like the WRONG word:\n`
        + traps.map(t => `- "${t.word}" /${t.target_ipa}/ must NOT sound like "${t.error}" /${t.error_ipa}/`).join('\n')
      : '';
    const trapField = traps.length
      ? `,"trap_hits":[<array of the lowercase danger words above that actually sounded like the WRONG word; [] if none did>]`
      : '';
    return `You are an English pronunciation coach for a Japanese learner. Listen to the audio and compare it to the TARGET phrase.
TARGET: "${text_en}"
CHUNKS: "${chunks_en}"
Label EVERY target word in order (${JSON.stringify(wordList)}) with a level:
- "missing": the word is NOT clearly heard in the audio (e.g. the speaker stopped early or skipped it). Be strict: if you cannot actually hear that word, it is "missing", NOT "great".
- "great": clearly and correctly pronounced.
- "close": understandable but slightly off.
- "practice": hard to understand / clearly mispronounced.${dangerBlock}
Return ONLY compact JSON: {"said_text":"<exactly what you actually heard>","words":[{"word":string,"level":"missing"|"great"|"close"|"practice","weak":"<one IPA symbol to fix, or empty>"}],"comment":"<one short friendly coaching tip in ENGLISH, casual tone>","comment_mj":"<the same tip written in JAPANESE characters (hiragana/katakana/kanji), casual telegraphic style, English word order chunk by chunk, particles dropped. Do NOT use romaji.>"${trapField}}
If the audio is silent or unrelated, mark all words "missing".`;
  }

  // モデル/サーバ応答(任意形) → 統一形に正規化。欠損時は wordList から安全に補完。
  function normalizeJudge(parsed, wordList) {
    parsed = parsed || {};
    let words = Array.isArray(parsed.words) ? parsed.words : [];
    if (!words.length) words = (wordList || []).map(w => ({ word: w, level: 'practice', weak: '' }));
    return {
      words: words.map(w => ({ word: String(w.word == null ? '' : w.word), level: w.level, weak: w.weak || '' })),
      said_text: parsed.said_text || '',
      comment: parsed.comment || '',
      comment_mj: parsed.comment_mj || '',
      trap_hits: Array.isArray(parsed.trap_hits) ? parsed.trap_hits.map(s => String(s).toLowerCase()) : []
    };
  }

  // ```json フェンスを剥がして JSON.parse する補助（モデルがフェンスを付ける場合がある）
  function parseJsonLoose(text) {
    return JSON.parse(String(text == null ? '{}' : text).replace(/```json|```/g, '').trim());
  }

  return { buildJudgePrompt, normalizeJudge, parseJsonLoose };
});
