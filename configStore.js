import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../config/config");

const defaultConfig = {
  agentName: "Smart Agent",
  defaultTheme: "dark",
  supportedIntents: [
    "help",
    "generate_website",
    "generate_code",
    "explain",
    "summarize",
    "calculate",
    "remember",
    "history",
    "clear"
  ],
  commandAliases: {
    help: ["ajuda", "/help", "comandos", "o que voce faz", "o que você faz"],
    history: ["historico", "histórico", "/history"],
    clear: ["limpar", "/clear", "reiniciar conversa"],
    remember: ["lembre", "salve", "/remember"]
  },
  examples: [
    "crie um site sobre uma fintech moderna",
    "gere uma API em node para cadastro de produtos",
    "faça um componente React para cards de preço",
    "explique closures em JavaScript",
    "resuma este texto: ..."
  ]
};

function mergeConfig(base, custom) {
  return {
    ...base,
    ...custom,
    commandAliases: {
      ...base.commandAliases,
      ...(custom.commandAliases || {})
    },
    supportedIntents: custom.supportedIntents || base.supportedIntents,
    examples: custom.examples || base.examples
  };
}

export function loadConfig() {
  try {
    if (!fs.existsSync(configPath)) {
      return defaultConfig;
    }

    const raw = fs.readFileSync(configPath, "utf8").trim();
    if (!raw) {
      return defaultConfig;
    }

    const parsed = JSON.parse(raw);
    return mergeConfig(defaultConfig, parsed);
  } catch (error) {
    console.warn("Falha ao carregar config, usando padrão:", error.message);
    return defaultConfig;
  }
}
