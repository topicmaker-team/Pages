/* ============================================================
   server/score-proxy.js — 採点APIパック 参照実装（§3-5 / 水さん）
   目的: GeminiキーをサーバE側に隠し、クライアントは音声+target+traps を送るだけにする。
        プロンプト/正規化は judge.js を共有（クライアントと完全一致）。
   依存: なし（Node 18+ の組み込み http と グローバル fetch を使用）。

   起動:
     GEMINI_API_KEY=xxxx  GEMINI_MODEL=gemini-2.5-flash  PORT=8787  node server/score-proxy.js
   クライアント側 config.js:
     SCORER: "api",
     SCORER_API_URL: "http://localhost:8787/score"

   契約（POST /score）:
     req  { text_en, chunks_en, audio_b64, audio_mime, traps:[{word,error,target_ipa,error_ipa}] }
     res  { words:[{word,level,weak}], said_text, comment, comment_mj, trap_hits:[...] }
   ============================================================ */
const http = require('http');
const JUDGE = require('../judge.js');   // ← クライアントと同じ契約を共有

const PORT = process.env.PORT || 8787;
const API_KEY = process.env.GEMINI_API_KEY || '';     // ← サーバ環境変数。クライアントには出さない
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*';  // 本番はアプリのオリジンに限定すること

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
function sendJSON(res, code, obj) { cors(res); res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); }

async function scoreWithGemini({ text_en, chunks_en, audio_b64, audio_mime, traps }) {
  const wordList = String(text_en || '').split(/\s+/).filter(Boolean);
  const prompt = JUDGE.buildJudgePrompt(text_en, chunks_en, wordList, traps || []);
  const body = {
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: audio_mime || 'audio/webm', data: audio_b64 } }] }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
  };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('Gemini HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  const txt = (j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts || []).map(p => p.text || '').join('') || '{}';
  return JUDGE.normalizeJudge(JUDGE.parseJsonLoose(txt), wordList);

  /* ───── 国内音声認識(ASR)に差し替える場合はここを置換 ─────
     例: 1) 国内ASR API に audio_b64 を投げて transcript を取得
         2) transcript と text_en を比較して words/level を作る（自前スコアリング or 別LLM）
         3) JUDGE.normalizeJudge({ words, said_text, comment, comment_mj, trap_hits }, wordList) で返す
     返り値の形さえ契約どおりなら、クライアントは無改修で動く。 */
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { cors(res); res.writeHead(204); return res.end(); }
  if (req.method === 'GET' && req.url === '/health') return sendJSON(res, 200, { ok: true, model: MODEL, keyConfigured: !!API_KEY });
  if (req.method !== 'POST' || req.url !== '/score') return sendJSON(res, 404, { error: 'not found' });
  if (!API_KEY) return sendJSON(res, 500, { error: 'GEMINI_API_KEY is not set on the server' });

  let raw = '';
  req.on('data', c => { raw += c; if (raw.length > 12 * 1024 * 1024) req.destroy(); });   // 12MB上限
  req.on('end', async () => {
    let payload;
    try { payload = JSON.parse(raw || '{}'); } catch (e) { return sendJSON(res, 400, { error: 'invalid JSON' }); }
    if (!payload.text_en || !payload.audio_b64) return sendJSON(res, 400, { error: 'text_en and audio_b64 are required' });
    try {
      const out = await scoreWithGemini(payload);
      sendJSON(res, 200, out);
    } catch (e) {
      console.error('score error:', e.message);
      sendJSON(res, 502, { error: 'scoring failed', detail: e.message });
    }
  });
});

server.listen(PORT, () => {
  console.log(`[score-proxy] listening on :${PORT}  model=${MODEL}  key=${API_KEY ? 'set' : 'MISSING'}  allowOrigin=${ALLOW_ORIGIN}`);
  if (!API_KEY) console.log('  ⚠ GEMINI_API_KEY が未設定です。 GEMINI_API_KEY=... node server/score-proxy.js で起動してください。');
});
