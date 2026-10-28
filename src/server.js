import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MODELS, recommend, review } from "./advisor.js";

const asText = (obj) => ({ content: [{ type: "text", text: JSON.stringify(obj, null, 2) }] });

export function createServer() {
  const server = new McpServer({ name: "model-advisor", version: "1.1.0" });

  server.registerTool(
    "recommend_model",
    {
      title: "Recommend a Claude model",
      description:
        "Call at the START of a new task. Returns which Claude model (Haiku, Sonnet, Opus, Fable) fits the task best, " +
        "so the user gets good results without wasting usage. Show the returned one_liner to the user.",
      inputSchema: {
        task: z.string().min(1).max(4000).describe("What the user wants to do, in their words"),
        current_model: z.string().max(100).optional().describe("Model in use now, e.g. 'Opus 5.5'"),
        chat_messages: z.number().int().nonnegative().optional().describe("Messages so far in this chat"),
        high_stakes: z.boolean().optional().describe("True if a mistake would be costly"),
      },
    },
    async (args) => asText(recommend(args))
  );

  server.registerTool(
    "review_model_choice",
    {
      title: "End-of-task model review",
      description:
        "Call at the END of a substantial task. Says whether a lighter (or stronger) model would have been better next time. " +
        "Show the returned note to the user only if change is 'up' or 'down'.",
      inputSchema: {
        task: z.string().min(1).max(4000).describe("What was done"),
        model_used: z.string().max(100).describe("Model that did the task, e.g. 'Opus 5.5'"),
        output_size: z.enum(["short", "medium", "long"]).optional(),
        result_was_good: z.boolean().optional().describe("False if the result fell short"),
      },
    },
    async (args) => asText(review(args))
  );

  server.registerTool(
    "list_models",
    {
      title: "List Claude models and when to use each",
      description: "Returns the model guide: each Claude model, its API id, and what it is best for.",
      inputSchema: {},
    },
    async () => asText(Object.values(MODELS))
  );

  return server;
}
