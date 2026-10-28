// Tests the hosted (HTTP) mode end to end. Run: node test/http-test.js
import { spawn } from "node:child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const PORT = 3999;
const base = `http://localhost:${PORT}`;
const proc = spawn("node", ["src/http.js"], { env: { ...process.env, PORT }, stdio: "ignore" });
let failed = 0;
const check = (name, ok) => { console.log(`${ok ? "PASS" : "FAIL"}  ${name}`); if (!ok) failed++; };

try {
  for (let i = 0; i < 40; i++) {
    try { await fetch(base, { headers: { accept: "text/html" } }); break; } catch { await new Promise((r) => setTimeout(r, 150)); }
  }
  const page = await fetch(base + "/mcp", { headers: { accept: "text/html" } });
  check("GET in a browser shows landing page", page.status === 200 && (await page.text()).includes("custom connector"));
  check("GET without html returns 405", (await fetch(base + "/mcp")).status === 405);
  check("Bad JSON returns 400", (await fetch(base + "/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: "{oops" })).status === 400);

  const client = new Client({ name: "http-test", version: "1.0.0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(base + "/mcp")));
  const tools = (await client.listTools()).tools.map((t) => t.name).sort();
  check("Lists 3 tools over HTTP", tools.join() === "list_models,recommend_model,review_model_choice");
  const r1 = JSON.parse((await client.callTool({ name: "recommend_model", arguments: { task: "Translate this WhatsApp line into Arabic", current_model: "Opus 5.5" } })).content[0].text);
  check("Translate on Opus -> switch down to Haiku", r1.recommended_model === "Haiku 5.5" && r1.verdict.startsWith("Switch down"));
  const r2 = JSON.parse((await client.callTool({ name: "recommend_model", arguments: { task: "Write a comprehensive build spec for a multi-agent CRM product", current_model: "Sonnet 5.5" } })).content[0].text);
  check("Build spec on Sonnet -> switch up to Opus", r2.recommended_model === "Opus 5.5");
  const r3 = JSON.parse((await client.callTool({ name: "review_model_choice", arguments: { task: "Translate a line", model_used: "Opus 5.5", output_size: "short" } })).content[0].text);
  check("Review says Haiku next time", r3.change === "down");
  let rejected = false;
  try {
    const big = await client.callTool({ name: "recommend_model", arguments: { task: "x".repeat(5000) } });
    rejected = big.isError === true;
  } catch { rejected = true; }
  check("Oversized task is rejected", rejected);
  await client.close();
} finally {
  proc.kill();
}
console.log(failed ? `\n${failed} FAILED` : "\nAll HTTP checks passed");
process.exit(failed ? 1 : 0);
