# 🧭 Model Advisor

**Stop wasting your Claude usage. Get a one-line tip on which model to use for each task.**

Using the most powerful model for everything burns through your limits fast. A translation doesn't need Opus, and a full product spec shouldn't be done on Haiku. Model Advisor tells you which one fits, at the start of a task, and tells you at the end if a cheaper model would have done the job.

Free and open source. Built by [SigmaMax AI Solutions](https://sigmamaxaisolutions.com).

> 💡 **Honest note:** Claude can't switch models for you. Model Advisor gives the advice; you pick the model in Claude's model selector.

| Model | Best for |
|---|---|
| **Haiku 5.5** | Quick and short: rephrase, translate, format, quick facts |
| **Sonnet 5.5** *(default)* | Everyday work: emails, outreach, proposals, research, calculations, normal coding |
| **Opus 5.5** | Complex work: build specs, architecture, strategy, contracts, hard debugging |
| **Fable 5.1** | Only the hardest problems, after Opus falls short |

---

## 🚀 Start here: pick your path

| You use... | Use this | Setup time |
|---|---|---|
| **Claude.ai** (web or phone) | **Path 1: paste instructions** | 2 minutes, nothing to install |
| **Claude Desktop, Claude Code, Antigravity, Cursor** | **Path 2: MCP server** | 10 minutes |

### Path 1: Claude.ai (web / phone). No install.

1. In Claude, create a **Project** (or open Settings and find your personal preferences).
2. Paste this into the project instructions:

```
At the start of each new task, add ONE line at the top of your reply recommending the best Claude model for it:
"🧭 Model: <current> fits ✅" or "🧭 Model tip: switch to <model> — <reason, 10 words max>".
Guide: Haiku = quick/short/mechanical (translate, rephrase, format). Sonnet = default for everyday work (emails, research, calculations, normal coding). Opus = complex multi-step reasoning, build specs, architecture, strategy, contracts, hard debugging. Fable = only the hardest problems after Opus fell short.
At the end of a big task, add "🧭 Next time: <model> would be enough" only if a lighter model clearly would have done. If the chat is very long and the topic changed, suggest a new chat. Skip all of this for quick follow-ups.
```

3. Start any chat inside that project. Done.

Prefer a Claude *skill*? The same thing is packaged in [`skills/model-advisor/SKILL.md`](skills/model-advisor/SKILL.md).

### Path 2: Claude Desktop / Claude Code / Antigravity (MCP server)

Needs [Node.js 18+](https://nodejs.org) and [Git](https://git-scm.com).

```bash
git clone https://github.com/ahsanmassgazal-cmd/model-advisor-mcp.git
cd model-advisor-mcp
npm install
npm test        # should print: 12/12 recommendation cases passed
```

Add it to your MCP config. For **Claude Desktop**, open the config file:
- Windows: press `Win+R`, type `%APPDATA%\Claude`, open `claude_desktop_config.json`
- Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "model-advisor": {
      "command": "node",
      "args": ["C:\\Users\\YOU\\model-advisor-mcp\\src\\index.js"]
    }
  }
}
```

Use the real full path to `src/index.js`. On Windows, double every backslash (`\\`). On Mac, use `/Users/you/model-advisor-mcp/src/index.js`. If the file already lists other servers, add `model-advisor` inside the existing `mcpServers` block.

Fully quit and reopen Claude Desktop. **Claude Code:** `claude mcp add model-advisor -- node /full/path/to/src/index.js`. **Antigravity / Cursor:** add the same `node` command and path in the MCP settings.

**Make it automatic:** add this to your custom instructions so Claude calls it by itself:

> At the start of each new task, call `recommend_model` and show its `one_liner`. At the end of a substantial task, call `review_model_choice` and show the note only if it suggests a change.

---

## 🧪 Try it: examples

Just ask in plain words. Real outputs:

| You say | Model Advisor replies |
|---|---|
| *"Use recommend_model: translate this WhatsApp line into Arabic"* (on Opus) | 🧭 Model tip: Switch down to **Haiku 5.5**, Opus 5.5 is more than this needs (saves usage). |
| *"Draft a LinkedIn outreach message to a logistics CEO"* (on Opus) | 🧭 Model tip: Switch down to **Sonnet 5.5**, Opus 5.5 is more than this needs (saves usage). |
| *"Write a comprehensive build spec for a multi-agent CRM product"* (on Sonnet) | 🧭 Model tip: Switch up to **Opus 5.5**, Sonnet 5.5 may give weaker results here. |
| *"Review this founders agreement and flag risky clauses"* (on Haiku) | 🧭 Model tip: Switch up to **Opus 5.5**, Haiku 5.5 may give weaker results here. |
| *End of a task: "Use review_model_choice: translated one line, used Opus"* | 🧭 Next time: **Haiku 5.5** would be enough for this kind of task (saves usage). |
| A chat that has run 60+ messages | Start a new chat for a new topic to save tokens. |

## 🔧 Tools (Path 2)

| Tool | When | What you get |
|---|---|---|
| `recommend_model` | Start of a task | Best model, a one-line verdict, confidence, tips |
| `review_model_choice` | End of a task | Whether a lighter or stronger model fits next time |
| `list_models` | Any time | The model guide with API ids |

## ❓ Troubleshooting

- **Tool doesn't appear in Claude Desktop:** the config path or JSON is wrong. Check for single backslashes, missing commas, then fully quit (system tray) and reopen.
- **`node` not recognized:** install Node.js LTS, then reopen your terminal.
- **Web or phone Claude:** the MCP runs on your computer, so use Path 1 there.

## How it decides

1. Defaults to **Sonnet**, the best balance for most work.
2. Goes **down to Haiku** only for short, mechanical tasks.
3. Goes **up to Opus** for multi-step reasoning, long precise deliverables, or high-stakes work.
4. Suggests **Fable** only when Opus has been tried or the problem is at the frontier.
5. Runs locally with simple rules: **zero API calls, zero tokens**. Edit `MODELS` and `RULES` in [`src/advisor.js`](src/advisor.js) to tune it, and add a case in [`test/test.js`](test/test.js) for each change.

## Roadmap

- Usage log with a weekly "what you could have saved" summary
- Optional LLM-assisted classification for unclear tasks
- Team rule presets

## License

MIT © SigmaMax AI Solutions

---

**Need AI agents for your business?** SigmaMax builds AI agents and automation for companies across the GCC, India and beyond.
🌐 [sigmamaxaisolutions.com](https://sigmamaxaisolutions.com) · ✉️ ahsansigmamaxai@gmail.com · WhatsApp +968 7694 1459
