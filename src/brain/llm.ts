import { OpenAI } from "openai";
import { GoogleGenAI } from "@google/genai";
import type { ChatCompletionTool } from "openai/resources/chat/completions/completions";
import { MineAIConfig } from "../storage/config.js";

type Tool = ChatCompletionTool;

export class LLMClient {
  private openai?: OpenAI;
  private gemini?: GoogleGenAI;
  private config: MineAIConfig;

  constructor(config: MineAIConfig) {
    this.config = config;
    if (config.llm.provider === "openai") {
      this.openai = new OpenAI({ apiKey: config.llm.api_key });
    } else if (config.llm.provider === "groq") {
      this.openai = new OpenAI({
        apiKey: config.llm.api_key,
        baseURL: "https://api.groq.com/openai/v1",
      });
    } else if (config.llm.provider === "gemini") {
      this.gemini = new GoogleGenAI({ apiKey: config.llm.api_key });
    }
  }

  async generateAction(contextPrompt: string, tools: Tool[]): Promise<any> {
    const messages: any[] = [{ role: "system", content: contextPrompt }];

    if ((this.config.llm.provider === "openai" || this.config.llm.provider === "groq") && this.openai) {
      const completion = await this.openai.chat.completions.create({
        model: this.config.llm.model,
        messages,
        tools,
        tool_choice: "auto",
      });
      return completion.choices[0].message;
    }

    if (this.config.llm.provider === "gemini" && this.gemini) {
      // Gemini support is a work-in-progress
      console.warn("[mineAI LLM] Gemini provider is WIP — not yet functional.");
      return null;
    }

    throw new Error(
      `Unsupported or misconfigured LLM provider: "${this.config.llm.provider}". ` +
      `Supported: openai, groq. Gemini is WIP.`
    );
  }
}
