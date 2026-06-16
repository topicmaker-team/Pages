/**
 * Gemini キー中継プロキシ (Cloudflare Workers)
 * ------------------------------------------------------------
 * 役割: 公開ページ(GitHub Pages)からのリクエストを受け取り、
 *       サーバー側で保管した API キーを付けて Gemini に転送する。
 *       → 公開URLやページのソースにキーが一切出ない。
 *
 * 使い方(概要):
 *  1) Cloudflare で Worker を新規作成し、このコードを貼り付け
 *  2) 「設定 > 変数とシークレット」で GEMINI_KEY をシークレット登録
 *  3) ALLOW_ORIGIN を自分の GitHub Pages のドメインに変更
 *  4) デプロイし、できた https://xxxx.workers.dev を config.js の proxyBase に設定
 *
 * アプリ側は  {proxyBase}/v1beta/models/...:generateContent  を呼ぶので、
 * この Worker はパス以降をそのまま Google に中継するだけでよい。
 */

// 許可する公開元(あなたの Pages ドメインに変更してください)。
// 開発中だけ '*' でも動きますが、本番は必ず自分のドメインに絞ること。
const ALLOW_ORIGIN = 'https://topicmaker-team.github.io';

const GEMINI_HOST = 'https://generativelanguage.googleapis.com';

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    // プリフライト(OPTIONS)に応答
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // 中継は POST のみ受け付ける(generateContent は POST)
    if (request.method !== 'POST') {
      return json({ error: 'Only POST is allowed' }, 405, cors);
    }

    const key = env.GEMINI_KEY;
    if (!key) {
      return json({ error: 'Server is missing GEMINI_KEY secret' }, 500, cors);
    }

    // 受け取った URL のパス(/v1beta/models/....:generateContent)をそのまま転送
    const inUrl = new URL(request.url);
    if (!inUrl.pathname.startsWith('/v1beta/')) {
      return json({ error: 'Unexpected path' }, 400, cors);
    }
    const target = new URL(GEMINI_HOST + inUrl.pathname + inUrl.search);
    target.searchParams.set('key', key); // ここでだけキーを付与

    let body;
    try { body = await request.text(); } catch (e) { body = ''; }

    const upstream = await fetch(target.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    // Google の応答をそのまま返しつつ CORS を付ける
    const respHeaders = new Headers(cors);
    respHeaders.set('Content-Type', upstream.headers.get('Content-Type') || 'application/json');
    return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
  },
};

function corsHeaders(origin) {
  // ALLOW_ORIGIN が '*' のとき、またはリクエスト元が一致するときに許可
  const allow = ALLOW_ORIGIN === '*' ? '*' : (origin === ALLOW_ORIGIN ? origin : ALLOW_ORIGIN);
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
