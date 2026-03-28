import inquirer from "inquirer";
import { loadConfig, saveConfig, RoseGuardConfig } from "../storage/config.js";

export async function onboard() {
  console.log("Welcome to RoseGuard Onboarding Wizard! 🌹\n");
  const config = loadConfig();

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "provider",
      message: "Which AI provider do you want to use for the bot's brain?",
      choices: [
        { name: "OpenAI", value: "openai" },
        { name: "Google Gemini", value: "gemini" },
        { name: "Anthropic", value: "anthropic" },
        { name: "Groq", value: "groq" },
      ],
      default: config.llm.provider,
    },
    {
      type: "input",
      name: "api_key",
      message: "Enter the API Key for the selected provider:",
      default: config.llm.api_key,
    },
    {
      type: "list",
      name: "model",
      message: "Which model do you want to use?",
      choices: (answers: { provider: string }) => {
        if (answers.provider === "openai") return ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"];
        if (answers.provider === "gemini") return ["gemini-1.5-pro", "gemini-1.5-flash"];
        if (answers.provider === "anthropic") return ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"];
        if (answers.provider === "groq") return ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"];
        return [];
      },
      default: config.llm.model,
    },
    {
      type: "input",
      name: "host",
      message: "What is the Minecraft Server IP address?",
      default: config.minecraft.host,
    },
    {
      type: "number",
      name: "port",
      message: "What is the Minecraft Server port?",
      default: config.minecraft.port,
    },
    {
      type: "input",
      name: "username",
      message: "What should the bot's username be?",
      default: config.minecraft.username,
    },
    {
      type: "list",
      name: "auth",
      message: "What type of authentication does the server use?",
      choices: [
        { name: "Offline mode (LAN or cracked server)", value: "offline" },
        { name: "Microsoft Account (Official Online Servers)", value: "microsoft" },
      ],
      default: config.minecraft.auth,
    },
  ]);

  config.llm.provider = answers.provider;
  config.llm.api_key = answers.api_key;
  config.llm.model = answers.model;
  
  config.minecraft.host = answers.host;
  config.minecraft.port = answers.port;
  config.minecraft.username = answers.username;
  config.minecraft.auth = answers.auth;

  saveConfig(config);
  console.log("\n✅ Configuration saved to config.yaml!");
  console.log("You can now start the bot using: npm run start");
}
