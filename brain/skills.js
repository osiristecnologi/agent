import { autoFormat } from "../tools/formatter.js";
import {
  createJavaScriptUtility,
  createLandingPage,
  createNodeApi,
  createPythonScript,
  createReactComponent,
  toTitleCase
} from "../tools/codeTemplates.js";
import { loadConfig } from "./configStore.js";

function textResponse(content, extras = {}) {
  return {
    type: "text",
    content: autoFormat(content),
    ...extras
  };
}

function htmlResponse(content, extras = {}) {
  return {
    type: "html",
    content,
    ...extras
  };
}

function updateSession(session, payload) {
  if (!session?.setArtifact) return;
  session.setArtifact(payload);
}

function buildNextSteps(items = []) {
  if (!items.length) return "";
  return `\n\nPróximos passos sugeridos:\n${items.map((item) => `- ${item}`).join("\n")}`;
}

function pickTopic(intent, session) {
  return intent.topic || session?.context?.lastTopic || "projeto inteligente";
}

function combineRequirements(intent, session) {
  const current = intent.requirements || [];
  const previous = intent.isContinuation ? session?.context?.lastRequirements || [] : [];
  return [...new Set([...previous, ...current])].slice(0, 8);
}

function extractRememberNote(rawInput = "") {
  return rawInput
    .replace(/\/remember/gi, "")
    .replace(/lembre(?:\s+que)?/gi, "")
    .replace(/salve(?:\s+que)?/gi, "")
    .trim();
}

function extractSummaryTarget(rawInput = "") {
  const match = rawInput.match(/:(.*)$/s);
  if (match?.[1]) return match[1].trim();
  return rawInput.replace(/^(resuma|resumir|sintetize)\s*/i, "").trim();
}

function summarizeText(text = "") {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 3) return cleaned;

  const first = sentences[0] || "";
  const middle = sentences[Math.floor(sentences.length / 2)] || "";
  const last = sentences[sentences.length - 1] || "";
  return [first, middle, last].filter(Boolean).join(" ");
}

function evaluateExpression(rawInput = "") {
  const expression = rawInput
    .replace(/^(calcule|quanto e|quanto é|resultado de|resolva)\s*/i, "")
    .replace(/,/g, ".")
    .replace(/%/g, "/100")
    .trim();

  if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
    throw new Error("Expressão contém caracteres não permitidos.");
  }

  const result = Function(`"use strict"; return (${expression});`)();
  if (!Number.isFinite(result)) {
    throw new Error("Não foi possível calcular a expressão.");
  }

  return { expression, result };
}

function buildConceptExplanation(topic = "conceito") {
  const label = toTitleCase(topic);
  return `${label} é um conceito que vale entender em três camadas:\n\n1. Ideia central\n${label} resolve um problema específico e organiza responsabilidades para reduzir complexidade.\n\n2. Quando usar\nEle faz sentido quando você precisa de previsibilidade, reutilização e uma forma clara de evoluir a solução sem reescrever tudo.\n\n3. Exemplo prático\nImagine um fluxo simples com entrada, processamento e saída. ${label} ajuda a definir o que entra, como transformar os dados e o que deve ser entregue ao final.\n\nSe quiser, eu também posso converter essa explicação em checklist, pseudocódigo ou exemplo real.`;
}

function analyzeCodeSnippet(code = "") {
  const suggestions = [];
  if (code.includes("var ")) suggestions.push("trocar var por const/let para melhorar escopo e previsibilidade");
  if (!code.includes("try") && (code.includes("await") || code.includes("fetch("))) suggestions.push("adicionar tratamento de erros com try/catch");
  if (!code.includes("return") && code.includes("function")) suggestions.push("verificar se a função precisa retornar algum valor");
  if (code.length < 40) suggestions.push("o trecho está curto; vale complementar com contexto de entrada, saída e erro esperado");
  if (!suggestions.length) suggestions.push("estrutura geral parece válida; foque em nomes mais claros, validação de entrada e testes");
  return suggestions;
}

function inferEntityName(topic = "item") {
  const tokens = topic
    .toLowerCase()
    .replace(/[^a-z0-9à-ÿ\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !["cadastro", "gestao", "gestão", "sistema", "plataforma", "para", "de", "do", "da"].includes(word));

  return tokens[tokens.length - 1] || "item";
}

function buildCodeOutput(summary, language, code) {
  return `${summary}\n\n\`\`\`${language}\n${code}\n\`\`\`${buildNextSteps([
    "peça uma versão com autenticação, banco de dados ou testes",
    "solicite refatoração para outra linguagem ou framework",
    "continue com: agora adicione validação e documentação"
  ])}`;
}

export async function handleHelp(intent, session) {
  const config = loadConfig();
  const greeting = session?.context?.name ? `Olá, ${session.context.name}!` : "Olá!";
  return textResponse(
    `${greeting} Eu consigo entender comandos em linguagem natural e transformar isso em tarefas práticas.\n\nRecursos principais:\n- criar landing pages em HTML prontas para visualizar\n- gerar código para API Node/Express, componente React, script Python e utilitários JavaScript\n- explicar conceitos técnicos\n- resumir textos\n- fazer cálculos simples\n- continuar tarefas usando o contexto da sessão\n\nExemplos rápidos:\n${config.examples.map((item) => `- ${item}`).join("\n")}`
  );
}

export async function handleHistory(intent, session) {
  const history = session?.getRecentHistory?.(8) || [];
  if (!history.length) {
    return textResponse("Ainda não há histórico nesta sessão.");
  }

  const lines = history.map((item, index) => `${index + 1}. [${item.role}] ${String(item.content).slice(0, 120)}`);
  return textResponse(`Histórico recente da sessão:\n${lines.join("\n")}`);
}

export async function handleClear(intent, session) {
  session?.clear?.();
  return textResponse("Sessão limpa. Pode enviar um novo comando que eu começo do zero.");
}

export async function handleRemember(intent, session) {
  const note = extractRememberNote(intent.rawInput);
  if (!note) {
    return textResponse("Envie algo como: lembre que meu projeto é uma plataforma de cursos.");
  }

  session?.remember?.(note);
  return textResponse(`Anotado para esta sessão: ${note}`);
}

export async function handleExplanation(intent) {
  return textResponse(buildConceptExplanation(intent.topic));
}

export async function handleSummary(intent) {
  const target = extractSummaryTarget(intent.rawInput);
  if (!target) {
    return textResponse("Envie o texto logo após o comando de resumo, por exemplo: resuma: seu texto aqui.");
  }

  return textResponse(`Resumo:\n${summarizeText(target)}`);
}

export async function handleCalculation(intent) {
  try {
    const { expression, result } = evaluateExpression(intent.rawInput);
    return textResponse(`Resultado de ${expression} = ${result}`);
  } catch (error) {
    return textResponse(`Não consegui calcular. Motivo: ${error.message}`);
  }
}

export async function handleWebsiteTask(intent, session) {
  const topic = pickTopic(intent, session);
  const requirements = combineRequirements(intent, session);
  const html = createLandingPage({
    topic,
    requirements,
    theme: intent.theme || session?.context?.theme || "dark"
  });

  updateSession(session, {
    intent: intent.category,
    topic,
    artifactType: "html",
    requirements,
    content: html
  });

  return htmlResponse(html, {
    summary: `Landing page gerada sobre ${topic}`
  });
}

export async function handleCodeTask(intent, session) {
  const topic = pickTopic(intent, session);
  const requirements = combineRequirements(intent, session);
  let code = "";
  let language = intent.language || "js";
  let summary = "Código gerado com sucesso.";

  if (intent.target === "api") {
    code = createNodeApi({ topic, entity: inferEntityName(topic) });
    language = "js";
    summary = `API base em Node/Express criada para ${topic}.`;
  } else if (intent.target === "component") {
    code = createReactComponent({ topic, requirements });
    language = "jsx";
    summary = `Componente React criado para ${topic}.`;
  } else if (intent.target === "debug" && intent.codeBlock) {
    const suggestions = analyzeCodeSnippet(intent.codeBlock);
    code = intent.codeBlock;
    language = intent.language || "js";
    summary = `Análise rápida do trecho enviado:\n- ${suggestions.join("\n- ")}`;
  } else if (intent.language === "python") {
    code = createPythonScript({ topic });
    language = "python";
    summary = `Script Python criado para ${topic}.`;
  } else {
    code = createJavaScriptUtility({ topic });
    language = "js";
    summary = `Utilitário JavaScript criado para ${topic}.`;
  }

  updateSession(session, {
    intent: intent.category,
    topic,
    artifactType: "code",
    requirements,
    content: code
  });

  return textResponse(buildCodeOutput(summary, language, code));
}
