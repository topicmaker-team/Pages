# 🔌 開発ツール・連携

← [一覧トップに戻る](README.md)

MCPサーバー・API・外部連携など、制作を支える開発・連携ツール。

---

## enHack 構文解析 MCP サーバー <a id="enhack-mcp"></a>
- **作成者**: 高橋 / **作成日・最終更新**: 2026-06-15
- **MCPエンドポイント**: https://enhackmcp.onrender.com/mcp （認証なし）
- **GitHub**: https://github.com/topicmaker-team/enHackMCP
- **概要**: 生成AIのチャット（Claude / ChatGPT など）から enHack の英文構文解析を直接呼び出す MCP サーバー。英文を渡すと品詞・係り受け・句構造・難易度指標が返る。
- **使い方**: Claude＝設定→コネクタ→「＋」で「enHack 構文解析」＋上記URLを追加。ChatGPT＝設定→Apps & Connectors→Advanced→デベロッパーモードON→新規コネクタにURL（認証なし）。チャットで「次の英文を enHack で構文解析して…」のように依頼。
- **応用案**: Gmailコネクタで特定アドレスの受信を監視し、コンテンツ生成サーバーへ転送するMCPサーバーなど。
