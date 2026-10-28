// Test set: real-world prompts -> expected model. Run: npm test
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { recommend, review } from "../src/advisor.js";

const cases = [
  ["Translate this WhatsApp line to Arabic", "Haiku 5.5"],
  ["Rephrase this sentence to sound more polite", "Haiku 5.5"],
  ["Fix the typo in my subject line", "Haiku 5.5"],
  ["Draft a LinkedIn outreach message to a real estate broker in Dubai", "Sonnet 5.5"],
  ["Calculate landed cost and profit margin for 500 kurtis shipped to Sri Lanka", "Sonnet 5.5"],
  ["Research 20 logistics companies in Saudi Arabia and list their CEOs", "Sonnet 5.5"],
  ["Fix the bug in my contact form on the website", "Sonnet 5.5"],
  ["Write a comprehensive Antigravity build spec for a multi-agent CRM product", "Opus 5.5"],
  ["Review this founders agreement and flag risky clauses", "Opus 5.5"],
  ["Create a go-to-market strategy for SigmaMax across GCC", "Opus 5.5"],
  ["Design the system architecture for an agent OS with job queue and retries", "Opus 5.5"],
  ["I tried Opus and it couldn't solve this scheduling optimisation, novel algorithm needed", "Fable 5.1"],
];

let pass = 0;
for (const [task, want] of cases) {
  const got = recommend({ task }).recommended_model;
  const ok = got === want;
  if (ok) pass++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${want.padEnd(10)} got ${got.padEnd(10)} | ${task}`);
}

// Verdict / review checks
const v = recommend({ task: "Translate hello to Hindi", current_model: "Opus 5.5" });
console.assert(v.verdict.startsWith("Switch down"), "expected switch-down verdict");
const r = review({ task: "Translate hello to Hindi", model_used: "Opus 5.5", output_size: "short" });
console.assert(r.change === "down", "expected review change=down");
const t = recommend({ task: "Draft an email", chat_messages: 60 });
console.assert(t.tips.length > 0, "expected long-chat tip");

// End-to-end over MCP stdio
const client = new Client({ name: "test", version: "1.0.0" });
await client.connect(new StdioClientTransport({ command: "node", args: ["src/index.js"] }));
const tools = (await client.listTools()).tools.map((x) => x.name);
const res = await client.callTool({ name: "recommend_model", arguments: { task: "Write a PRD spec", current_model: "Sonnet 5.5" } });
const out = JSON.parse(res.content[0].text);
await client.close();

console.log(`\nTools: ${tools.join(", ")}`);
console.log(`MCP call -> ${out.one_liner}`);
console.log(`\n${pass}/${cases.length} recommendation cases passed`);
process.exit(pass === cases.length && tools.length === 3 ? 0 : 1);
