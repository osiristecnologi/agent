const WEBSITE_WORDS = ["site", "website", "landing page", "pagina", "página", "lp", "homepage"];
const API_WORDS = ["api", "backend", "servidor", "crud", "endpoint"];
const COMPONENT_WORDS = ["react", "componente", "component", "widget"];
const PYTHON_WORDS = ["python", "py"];
const JS_WORDS = ["javascript", "js", "node", "nodejs", "express", "typescript", "ts"];
const EXPLAIN_WORDS = ["explique", "explica", "como funciona", "conceito", "o que e", "o que é"];
const SUMMARY_WORDS = ["resuma", "resumir", "sumarize", "sintetize"];
const CALC_WORDS = ["calcule", "quanto e", "quanto é", "resolva", "resultado de"];
const DEBUG_WORDS = ["corrija", "debug", "refatore", "melhore esse codigo", "melhore esse código"];

function normalize(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text, words = []) {
  return words.some((word) => text.includes(word));
}

function cleanTopic(value = "") {
  return value
    .replace(/^(sobre|para|de|um|uma|o|a)\s+/i, "")
    .replace(/["'`]+/g, "")
    .trim();
}

function extractQuotedCode(input = "") {
  const fenced = input.match(/```([\s\S]*?)```/);
  return fenced ? fenced[1].trim() : "";
}

function extractRequirements(input = "") {
  const parts = input
    .split(/[,.\n;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item.length > 4);

  return [...new Set(parts)].slice(0, 6);
}

function detectLanguage(normalized) {
  if (includesAny(normalized, PYTHON_WORDS)) return "python";
  if (normalized.includes("react")) return "jsx";
  if (normalized.includes("typescript") || normalized.includes(" ts ")) return "ts";
  if (includesAny(normalized, JS_WORDS)) return "js";
  if (normalized.includes("html")) return "html";
  return "js";
}

function detectTarget(normalized, hasCodeBlock) {
  if (includesAny(normalized, WEBSITE_WORDS)) return "website";
  if (includesAny(normalized, API_WORDS)) return "api";
  if (includesAny(normalized, COMPONENT_WORDS)) return "component";
  if (hasCodeBlock || includesAny(normalized, DEBUG_WORDS)) return "debug";
  if (normalized.includes("funcao") || normalized.includes("função") || normalized.includes("script")) return "script";
  return "generic_code";
}

function extractTopic(rawInput, normalized, session) {
  const patterns = [
    /(?:site|website|landing page|pagina|página).*(?:sobre|para)\s+(.{3,120})/i,
    /(?:api|backend|crud|endpoint).*(?:para|de)\s+(.{3,120})/i,
    /(?:componente|react|script|função|funcao).*(?:para|de)\s+(.{3,120})/i,
    /(?:explique|resuma)\s+(.{3,180})/i,
    /(?:crie|criar|fa[çc]a|gere|monte|desenvolva)\s+(.{3,120})/i
  ];

  for (const pattern of patterns) {
    const match = rawInput.match(pattern);
    if (match?.[1]) {
      return cleanTopic(match[1]);
    }
  }

  if (/(agora|tambem|também|adicione|inclua|melhore|ajuste)/.test(normalized) && session?.context?.lastTopic) {
    return session.context.lastTopic;
  }

  return session?.context?.lastTopic || "projeto inteligente";
}

function detectCommand(normalized) {
  if (["/help", "ajuda", "comandos"].some((cmd) => normalized === cmd || normalized.includes(cmd))) return "help";
  if (["/history", "historico", "histórico"].some((cmd) => normalized === cmd || normalized.includes(cmd))) return "history";
  if (["/clear", "limpar", "reiniciar conversa"].some((cmd) => normalized === cmd || normalized.includes(cmd))) return "clear";
  if (normalized.startsWith("/remember") || normalized.includes("lembre") || normalized.includes("salve")) return "remember";
  return null;
}

function detectCategory(normalized, target, command) {
  if (command) return command;
  if (includesAny(normalized, EXPLAIN_WORDS)) return "explain";
  if (includesAny(normalized, SUMMARY_WORDS)) return "summarize";
  if (includesAny(normalized, CALC_WORDS) || /^[0-9\s+\-*/().,%]+$/.test(normalized)) return "calculate";
  if (target === "website") return "generate_website";
  if (["api", "component", "script", "generic_code", "debug"].includes(target)) return "generate_code";
  if (normalized.includes("codigo") || normalized.includes("código")) return "generate_code";
  return "help";
}

export function detectIntent(input = "", session = {}) {
  const rawInput = String(input || "").trim();
  const normalized = normalize(rawInput);
  const command = detectCommand(normalized);
  const codeBlock = extractQuotedCode(rawInput);
  const target = detectTarget(normalized, Boolean(codeBlock));
  const category = detectCategory(normalized, target, command);
  const language = detectLanguage(normalized);
  const topic = extractTopic(rawInput, normalized, session);
  const requirements = extractRequirements(rawInput);
  const isContinuation = /(agora|tambem|também|adicione|inclua|melhore|ajuste)/.test(normalized);

  return {
    rawInput,
    normalized,
    command,
    category,
    target,
    language,
    topic,
    requirements,
    codeBlock,
    isContinuation,
    theme: normalized.includes("claro") ? "light" : session?.context?.theme || "dark"
  };
}

