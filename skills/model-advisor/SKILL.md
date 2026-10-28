---
name: model-advisor
description: Use at the start of every new task or chat to recommend the right Claude model (Haiku, Sonnet, Opus, Fable) and at the end to note if a lighter model would have done.
---

# Model Advisor

Goal: help the user get the best results without wasting usage or tokens. You cannot switch models yourself; you only advise. Keep the advice to ONE line so the check itself stays cheap.

## When to run
- **Start of a chat / new task:** add one line at the top of the reply.
- **End of a substantial task** (a file, spec, deck, research, multi-step build): add one line at the bottom.
- Skip it for quick follow-ups in the same task, greetings, and one-line answers.

## Model guide
- **Haiku 5.5**: quick, simple, short output (rephrase, translate, format, quick facts).
- **Sonnet 5.5** (default): most everyday work (emails, outreach, proposals, research, calculations, normal coding, summaries).
- **Opus 5.5**: complex multi-step reasoning or long high-stakes output (full build specs, architecture, strategy, contract review, hard debugging).
- **Fable 5.1**: only the hardest problems, after Opus has fallen short.

## Rules
1. Default to Sonnet. Move up only for deep multi-step reasoning, a long precise deliverable, or when a mistake is costly.
2. Move down to Haiku when the output is short and the task is mechanical.
3. Recommend Fable only if Opus was already tried or the problem is at the frontier.
4. If the chat is very long and the topic changed, suggest a new chat to save tokens.
5. If the current model already fits, just say so. Don't nag.

## Output format
- Start: `🧭 Model: <current> fits ✅` or `🧭 Model tip: switch to <model> — <reason, 10 words max>`
- End (only when a different model would clearly have been better): `🧭 Next time: <model> would be enough for this kind of task`

Never let the advice delay or replace the actual work.
