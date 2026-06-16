/**
 * config.js — アプリの隣(同じフォルダ)に置くと自動で読み込まれます。
 *
 * モードは2通り。どちらか一方だけ設定してください。
 *
 * 【A. 本番(推奨)】サーバー側でキーを中継する
 *   - 公開ページにキーが出ません。安全です。
 *   - Cloudflare Worker をデプロイして、その URL を proxyBase に入れます。
 *
 *   const CONFIG = {
 *     proxyBase: 'https://あなたのWorker名.workers.dev'
 *   };
 *
 * 【B. 内部テストだけ】キーを直接埋め込む(公開ページでは使わない)
 *   - 注意: このファイルをコミット/公開すると、キーが誰でも読めます。
 *   - 鍵を共有したくない内部の検証用途のみ。公開リポジトリには入れないこと。
 *
 *   const CONFIG = {
 *     geminiApiKey: 'AIza...'
 *   };
 *
 * どちらも置かない場合: アプリは「各自が設定画面でキーを貼る」or「デモ採点」で動きます。
 * （公開ページで一番安全なのは、config.js を置かず、テスターが各自のキューを設定欄に入れる運用）
 */

const CONFIG = {
  // proxyBase: 'https://あなたのWorker名.workers.dev',
  // geminiApiKey: 'AIza...',
};
