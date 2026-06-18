import "dotenv/config";
import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import Anthropic from "@anthropic-ai/sdk";
import { toolDefinitions, callTool } from "./tools.js";
import { systemPrompt } from "./systemPrompt.js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
  return value;
}

requireEnv("ANTHROPIC_API_KEY");
requireEnv("META_ACCESS_TOKEN");
requireEnv("META_AD_ACCOUNT_ID");

const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const client = new Anthropic();

const messages: Anthropic.MessageParam[] = [];

async function runTurn(userInput: string) {
  messages.push({ role: "user", content: userInput });

  while (true) {
    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      tools: toolDefinitions,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    const textBlocks = response.content.filter((b) => b.type === "text");
    for (const block of textBlocks) {
      console.log(`\n${block.text}\n`);
    }

    if (response.stop_reason !== "tool_use") {
      break;
    }

    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of toolUseBlocks) {
      console.log(`[מריץ כלי] ${block.name}(${JSON.stringify(block.input)})`);
      try {
        const result = await callTool(block.name, block.input as Record<string, unknown>);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      } catch (err) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: `ERROR: ${err instanceof Error ? err.message : String(err)}`,
          is_error: true,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }
}

async function main() {
  console.log("Meta Campaign Agent - הסוכן שלך לקמפיינים במטא. כתוב 'exit' כדי לצאת.\n");
  const rl = readline.createInterface({ input: stdin, output: stdout });

  while (true) {
    const input = await rl.question("> ");
    if (input.trim().toLowerCase() === "exit") break;
    if (!input.trim()) continue;
    try {
      await runTurn(input);
    } catch (err) {
      console.error("שגיאה:", err instanceof Error ? err.message : err);
    }
  }

  rl.close();
}

main();
