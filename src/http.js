// Run the hosted version locally or on any Node host: `npm run start:http`
import { createServer } from "node:http";
import handler from "./handler.js";

const port = process.env.PORT || 3000;
createServer((req, res) => handler(req, res)).listen(port, () => console.log(`Model Advisor MCP listening on http://localhost:${port}/mcp`));
