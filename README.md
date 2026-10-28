# 🧭 Model Advisor MCP

**Pick the right Claude model for every task — better results, less wasted usage.**

Model Advisor is a free, open-source [MCP](https://modelcontextprotocol.io) server that tells you whether a task needs **Haiku**, **Sonnet**, **Opus** or **Fable** — at the start of a task, and again at the end if a lighter model would have done the job.

It runs locally, makes **zero API calls**, and costs **zero tokens** to compute a recommendation.

Built by [SigmaMax AI Solutions](https://sigmamaxaisolutions.com) — AI agents and automation for growing businesses.

---

## Why

Most people use their most powerful model for everything. A translation or a one-line reply doesn't need it — and a full product spec shouldn't be done on the lightest model. Model Advisor gives a one-line nudge so you match the model to the job.

| Model | Use for |
|---|---|
| **Haiku 5.5** | Quick, short output: rephrase, translate, format, quick facts |
| **Sonnet 5.5** (default) | Everyday work: emails, outreach, proposals, research, calculations, normal coding |
| **Opus 5.5** | Complex work: build specs, system architecture, strategy, contracts, hard debugging |
| **Fable 5.1** | Only the hardest problems, after Opus falls short |

## Tools

| Tool | When | Returns |
|---|---|---|
| `recommend_model` | Start of a task | Recommended model, a one-line verdict (e.g. *"Switch down to Haiku 5.5 — saves usage"*), confidence, tips |
| `review_model_choice` | End of a task | Whether a lighter or stronger model would be better next time |
| `list_models` | Any time | The model guide with API ids |

Example output:

```json
{
  "recommended_model": "Haiku 5.5",
  "model_id": "claude-haiku-5-5",
  "one_liner": "🧭 Model tip: Switch down to Haiku 5.5 — Opus 5.5 is more than this needs (saves usage).",
  "confidence": "high",
  "reason": "signals: translate, whatsapp line",
  "tips": []
}
```

## Install

Requires Node.js 18+.

```bash
git clone https://github.com/<your-username>/model-advisor-mcp.git
cd model-advisor-mcp
npm install
npm test   # runs the test set
```

### Claude Desktop / Claude Code

Add to your MCP config (`claude_desktop_config.json`, or `.mcp.json` for Claude Code):

```json
{
  "mcpServers": {
    "model-advisor": {
      "command": "node",
      "args": ["/absolute/path/to/model-advisor-mcp/src/index.js"]
    }
  }
}
```

### Antigravity, Cursor and other MCP clients

Use the same `command` + `args` in the client's MCP server settings.

### Tip: make it automatic

Add this line to your custom instructions or project instructions:

> At the start of each new task, call `recommend_model` and show its one_liner. At the end of a substantial task, call `review_model_choice` and show the note only if it suggests a change.

## Customize

All rules live in [`src/advisor.js`](src/advisor.js):

- `MODELS` — model names, API ids, descriptions.
- `RULES` — weighted keyword signals per model. Add your own industry terms.

Add a case to [`test/test.js`](test/test.js) for every rule you change, then run `npm test`.

## How it decides

1. Defaults to **Sonnet** — the best balance for most work.
2. Moves **down to Haiku** only for short, mechanical tasks.
3. Moves **up to Opus** for multi-step reasoning, long precise deliverables, or high-stakes work.
4. Suggests **Fable** only when Opus has been tried or the problem is at the frontier.
5. Warns when a chat is very long — starting a fresh chat saves tokens.

## Roadmap

- Usage log: track recommendations vs. model actually used, with a weekly savings summary
- Optional LLM-assisted classification for ambiguous tasks
- Per-team rule presets

## License

MIT © SigmaMax AI Solutions

---

**Need AI agents for your business?** SigmaMax builds lead-generation, CRM and operations agents for companies across the GCC, India and beyond.
🌐 [sigmamaxaisolutions.com](https://sigmamaxaisolutions.com) · ✉️ ahsansigmamaxai@gmail.com · WhatsApp +968 7694 1459
