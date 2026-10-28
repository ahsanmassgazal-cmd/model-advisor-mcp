// Model Advisor — rule-based recommender. No API calls, zero token cost.
// Edit MODELS and RULES to tune recommendations.

export const MODELS = {
  haiku: {
    id: "claude-haiku-5-5",
    name: "Haiku 5.5",
    tier: 1,
    bestFor: "Quick, simple, short output: rephrasing, translation, formatting, quick facts, short replies.",
  },
  sonnet: {
    id: "claude-sonnet-5-5",
    name: "Sonnet 5.5",
    tier: 2,
    bestFor: "Most everyday work: drafting emails and outreach, proposals, research, calculations, normal coding, summaries.",
  },
  opus: {
    id: "claude-opus-5-5",
    name: "Opus 5.5",
    tier: 3,
    bestFor: "Complex multi-step reasoning or long, high-stakes output: full build specs, system architecture, strategy, contract review, hard debugging.",
  },
  fable: {
    id: "claude-fable-5-1",
    name: "Fable 5.1",
    tier: 4,
    bestFor: "Only the hardest problems where Opus has already fallen short or the task is at the frontier.",
  },
};

// Weighted keyword signals. Each match adds its weight to that model's score.
const RULES = {
  haiku: [
    [/\b(translate|translation)\b/i, 3],
    [/\b(rephrase|reword|paraphrase|shorten|proofread|fix (the )?(typo|grammar|spelling))\b/i, 3],
    [/\b(format|reformat|convert to (a )?(table|list|bullets))\b/i, 2],
    [/\b(one[- ]line|one sentence|quick (question|reply|answer)|short (reply|message|caption))\b/i, 3],
    [/\b(what is|define|meaning of|spell)\b/i, 1],
    [/\b(whatsapp (line|reply)|hashtags?|subject line|caption)\b/i, 2],
  ],
  sonnet: [
    [/\b(draft|write|email|message|outreach|linkedin|cold (email|message)|follow[- ]up)\b/i, 2],
    [/\b(proposal|pitch|summar(y|ize|ise)|report|blog|post|article)\b/i, 2],
    [/\b(research|compare|find|look up|list of|leads?)\b/i, 2],
    [/\b(calculate|calculation|landed cost|pricing|profit|margin|budget)\b/i, 2],
    [/\b(code|script|function|bug|fix|website|landing page|html|css|react|next\.?js)\b/i, 2],
    [/\b(canva|design plan|slides?|deck|presentation|spreadsheet|sheet)\b/i, 2],
  ],
  opus: [
    [/\b(spec|specification|prd|requirements doc|antigravity)\b/i, 3],
    [/\b(architecture|architect|system design|multi[- ]agent|agent os|orchestrat)/i, 3],
    [/\b(strategy|strategic|business plan|go[- ]to[- ]market|gtm|roadmap|fundrais|investor)\b/i, 3],
    [/\b(contract|agreement|nda|legal|terms|founders? agreement)\b/i, 3],
    [/\b(complex|deep(ly)?|thorough|comprehensive|end[- ]to[- ]end|full (build|system|product))\b/i, 2],
    [/\b(hard (bug|problem)|debug(ging)? .*(fail|stuck|hours)|root cause|refactor (the )?(whole|entire))\b/i, 3],
    [/\b(due diligence|financial model|dcf|valuation|competitor analysis|market analysis)\b/i, 3],
  ],
  fable: [
    [/\b(opus (failed|couldn'?t|could not|struggled|wasn'?t enough)|tried opus)\b/i, 6],
    [/\b(frontier|research[- ]level|novel (algorithm|proof|research)|unsolved)\b/i, 4],
    [/\b(extremely|hardest|most difficult|impossible)\b/i, 2],
  ],
};

function score(task) {
  const scores = { haiku: 0, sonnet: 0, opus: 0, fable: 0 };
  const matched = { haiku: [], sonnet: [], opus: [], fable: [] };
  for (const [model, rules] of Object.entries(RULES)) {
    for (const [re, w] of rules) {
      const m = task.match(re);
      if (m) {
        scores[model] += w;
        matched[model].push(m[0].toLowerCase());
      }
    }
  }
  // Length signal: long, detailed requests lean heavier; very short ones lean lighter.
  const words = task.trim().split(/\s+/).filter(Boolean).length;
  if (words <= 12) scores.haiku += 1;
  if (words >= 80) scores.opus += 1;
  if (words >= 200) scores.opus += 1;
  return { scores, matched, words };
}

function normalizeModel(name) {
  if (!name) return null;
  const n = String(name).toLowerCase();
  return Object.keys(MODELS).find((k) => n.includes(k)) ?? null;
}

/**
 * Recommend a model for a task.
 * @param {object} input
 * @param {string} input.task - what the user wants to do
 * @param {string} [input.current_model] - model in use now (e.g. "Opus 5.5")
 * @param {number} [input.chat_messages] - messages so far in this chat
 * @param {boolean} [input.high_stakes] - a mistake would be costly
 */
export function recommend({ task, current_model, chat_messages, high_stakes }) {
  const { scores, matched, words } = score(task);

  // Decision rules: default Sonnet; move up/down only on clear signals.
  let pick = "sonnet";
  if (scores.fable >= 6 || (scores.fable >= 4 && scores.opus >= 3)) pick = "fable";
  else if (scores.opus >= 3 && scores.opus >= scores.sonnet) pick = "opus";
  else if (scores.haiku >= 3 && scores.haiku > scores.sonnet && scores.opus === 0) pick = "haiku";

  if (high_stakes && MODELS[pick].tier < 3) pick = "opus";

  const top = Math.max(...Object.values(scores));
  const confidence = top >= 5 ? "high" : top >= 3 ? "medium" : "low";
  const reasons = matched[pick].length
    ? `signals: ${[...new Set(matched[pick])].slice(0, 4).join(", ")}`
    : pick === "sonnet"
      ? "no strong signal for a lighter or heavier model; Sonnet is the efficient default"
      : `request length (${words} words)`;

  const current = normalizeModel(current_model);
  let verdict;
  if (!current) verdict = `Use ${MODELS[pick].name}.`;
  else if (current === pick) verdict = `${MODELS[current].name} fits ✅`;
  else if (MODELS[current].tier > MODELS[pick].tier)
    verdict = `Switch down to ${MODELS[pick].name} — ${MODELS[current].name} is more than this needs (saves usage).`;
  else verdict = `Switch up to ${MODELS[pick].name} — ${MODELS[current].name} may give weaker results here.`;

  const tips = [];
  if (chat_messages && chat_messages >= 40)
    tips.push("This chat is long; every message re-reads the history. Start a new chat for a new topic to save tokens.");
  if (pick === "fable" && !/opus/i.test(task))
    tips.push("Try Opus first; move to Fable only if Opus falls short.");

  return {
    recommended_model: MODELS[pick].name,
    model_id: MODELS[pick].id,
    verdict,
    one_liner: current && current === pick ? `🧭 Model: ${verdict}` : `🧭 Model tip: ${verdict}`,
    confidence,
    reason: reasons,
    tips,
    scores,
  };
}

/**
 * End-of-task review: was the model used the right size?
 * @param {object} input
 * @param {string} input.task - what was done
 * @param {string} input.model_used
 * @param {"short"|"medium"|"long"} [input.output_size]
 * @param {boolean} [input.result_was_good]
 */
export function review({ task, model_used, output_size, result_was_good }) {
  const used = normalizeModel(model_used);
  const rec = recommend({ task });
  const recKey = normalizeModel(rec.recommended_model);
  let pick = recKey;
  if (output_size === "short" && MODELS[pick].tier > 1 && rec.scores.opus < 3) pick = "haiku";
  if (output_size === "long" && MODELS[pick].tier < 2) pick = "sonnet";

  if (!used) return { note: `Next time: ${MODELS[pick].name} suits this kind of task.`, suggested_model: MODELS[pick].name };

  if (result_was_good === false && MODELS[used].tier >= MODELS[pick].tier) {
    const up = Object.keys(MODELS).find((k) => MODELS[k].tier === Math.min(4, MODELS[used].tier + 1));
    return {
      note: `🧭 Next time: try ${MODELS[up].name} — the result fell short on ${MODELS[used].name}.`,
      suggested_model: MODELS[up].name,
      change: "up",
    };
  }
  if (MODELS[used].tier > MODELS[pick].tier)
    return {
      note: `🧭 Next time: ${MODELS[pick].name} would be enough for this kind of task (saves usage).`,
      suggested_model: MODELS[pick].name,
      change: "down",
    };
  if (MODELS[used].tier < MODELS[pick].tier)
    return {
      note: `🧭 Next time: consider ${MODELS[pick].name} for better results on this kind of task.`,
      suggested_model: MODELS[pick].name,
      change: "up",
    };
  return { note: `${MODELS[used].name} was the right fit ✅`, suggested_model: MODELS[used].name, change: "none" };
}
