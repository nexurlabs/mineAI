import { OpenAI } from "openai";
import { GoogleGenAI } from "@google/genai";
import { RoseGuardConfig } from "../storage/config.js";

type Tool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: object;
  };
};

export class LLMClient {
  private openai?: OpenAI;
  private gemini?: GoogleGenAI;
  private config: RoseGuardConfig;

  constructor(config: RoseGuardConfig) {
    this.config = config;
    if (config.llm.provider === "openai" || config.llm.provider === "anthropic") {
      // Anthropipc uses different SDK natively, but here we can mock OpenAI proxy if needed 
      // or implement Anthropic SDK. Using OpenAI for now.
      this.openai = new OpenAI({ apiKey: config.llm.api_key });
    } else if (config.llm.provider === "gemini") {
      this.gemini = new GoogleGenAI({ apiKey: config.llm.api_key });
    }
  }

  async generateAction(contextPrompt: string, tools: Tool[]): Promise<any> {
    const messages: any[] = [{ role: "system", content: contextPrompt }];

    if (this.config.llm.provider === "openai" && this.openai) {
      const completion = await this.openai.chat.completions.create({
        model: this.config.llm.model,
        messages,
        tools,
        tool_choice: "auto",
      });
      return completion.choices[0].message;
    } 
    
    if (this.config.llm.provider === "gemini" && this.gemini) {
      // Gemini equivalent
      console.log("[RoseGuard LLM] Gemini call triggered (WIP)");
      return null;
    }

    throw new Error("Unsupported or misconfigured LLM provider");
  }
}
