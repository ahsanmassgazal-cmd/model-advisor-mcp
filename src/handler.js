// Hosted (HTTP) mode — stateless Streamable HTTP. Works on Vercel and any Node host.
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server.js";

const LANDING = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Model Advisor MCP</title>
<body style="font-family:system-ui,sans-serif;max-width:560px;margin:12vh auto;padding:0 20px;line-height:1.5">
<h1>🧭 Model Advisor MCP is running</h1>
<p>This is an MCP server, not a web page. Add this page's address to Claude as a <b>custom connector</b>:</p>
<p>Claude → Settings → Connectors → Add custom connector → paste this URL.</p>
<p>Free guide: <a href="https://github.com/ahsanmassgazal-cmd/model-advisor-mcp">github.com/ahsanmassgazal-cmd/model-advisor-mcp</a></p>
<p style="color:#666">By <a href="https://sigmamaxaisolutions.com">SigmaMax AI Solutions</a></p></body>`;

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 100_000) throw new Error("Request too large");
    chunks.push(c);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : undefined;
}

const sendJson = (res, status, obj, extra = {}) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  for (const [k, v] of Object.entries(extra)) res.setHeader(k, v);
  res.end(JSON.stringify(obj));
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, accept, mcp-session-id, mcp-protocol-version");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method === "GET" && String(req.headers.accept || "").includes("text/html")) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.end(LANDING);
  }
  if (req.method !== "POST") {
    return sendJson(res, 405, { jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null }, { Allow: "POST" });
  }

  let body;
  try {
    body = req.body ?? (await readJson(req));
  } catch {
    return sendJson(res, 400, { jsonrpc: "2.0", error: { code: -32700, message: "Invalid request body." }, id: null });
  }

  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (err) {
    if (!res.headersSent) sendJson(res, 500, { jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null });
  }
}
