import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { brain } from "./brain/brain.js";
import { loadConfig } from "./brain/configStore.js";
import { clearSession, getSession } from "./memory/session.js";
// import { loadConfig } from "./brain/configStore.js";
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REMOTE_API_BASE = String(process.env.AGENT_API_BASE_URL || "https://agent-api-ex71.onrender.com").replace(/\/$/, "");

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

function detectTargetFromInput(input = "") {
  const normalized = String(input).toLowerCase();
  if (/(site|website|landing page|pagina|pÃ¡gina|html|doctype)/.test(normalized)) return "website";
  if (/(api|backend|endpoint|crud|servidor)/.test(normalized)) return "api";
  if (/(react|componente|component)/.test(normalized)) return "component";
  if (/(python|py)/.test(normalized)) return "python";
  return "assistant";
}

function detectLanguage(input = "", content = "") {
  const normalized = `${input} ${content}`.toLowerCase();
  if (normalized.includes("<!doctype html>") || normalized.includes("<html")) return "html";
  if (normalized.includes("python")) return "python";
  if (normalized.includes("react") || normalized.includes("jsx")) return "jsx";
  if (normalized.includes("typescript")) return "ts";
  return "js";
}

function looksLikeHtml(content = "") {
  return /<!doctype html>|<html[\s>]|<body[\s>]|<main[\s>]|<section[\s>]|<div[\s>]/i.test(String(content));
}

function ensureHtmlDocument(content = "") {
  const trimmed = String(content || "").trim();
  if (!trimmed) return trimmed;
  if (/<!doctype html>/i.test(trimmed)) return trimmed;
  if (/<html[\s>]/i.test(trimmed)) return `<!DOCTYPE html>\n${trimmed}`;
  return `<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Smart Agent</title>\n</head>\n<body>\n${trimmed}\n</body>\n</html>`;
}

function normalizeRemoteResult(data = {}, input = "") {
  const rawContent = typeof data?.content === "string" ? data.content : JSON.stringify(data ?? {}, null, 2);
  const htmlDetected = data?.type === "html" || looksLikeHtml(rawContent);
  const type = htmlDetected ? "html" : "text";
  const content = htmlDetected ? ensureHtmlDocument(rawContent) : rawContent;
  const target = detectTargetFromInput(input);

  return {
    ...data,
    type,
    content,
    summary: data?.summary || (type === "html" ? "HTML completo gerado com sucesso." : "Resposta textual gerada com sucesso."),
    intent: data?.intent || (type === "html" ? "generate_website" : "assistant"),
    meta: {
      ...(data?.meta || {}),
      source: "remote-api",
      target: data?.meta?.target || target,
      language: data?.meta?.language || detectLanguage(input, content),
      topic: data?.meta?.topic || String(input || "").slice(0, 120)
    }
  };
}

async function callRemoteAgent(input, sessionId) {
  const response = await fetch(`${REMOTE_API_BASE}/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, sessionId })
  });

  const rawText = await response.text();
  let parsed;

  try {
    parsed = rawText ? JSON.parse(rawText) : {};
  } catch {
    parsed = { type: "text", content: rawText || "Resposta vazia da API remota." };
  }

  if (!response.ok) {
    throw new Error(parsed?.error || parsed?.message || `Falha na API remota (${response.status}).`);
  }

  return normalizeRemoteResult(parsed, input);
}

app.get("/health", (req, res) => {
  const config = loadConfig();
  res.json({
    status: "online",
    agent: config.agentName,
    uptime: process.uptime(),
    mode: "remote-first",
    remoteApiBaseUrl: REMOTE_API_BASE
  });
});

app.get("/capabilities", (req, res) => {
  const config = loadConfig();
  res.json({
    agentName: config.agentName,
    mode: "remote-first",
    remoteApiBaseUrl: REMOTE_API_BASE,
    supportedIntents: config.supportedIntents,
    examples: config.examples
  });
});

app.post("/session/clear", (req, res) => {
  const sessionId = String(req.body?.sessionId || "default");
  clearSession(sessionId);
  res.json({ ok: true, message: "SessÃ£o limpa com sucesso." });
});

app.post("/agent", async (req, res) => {
  try {
    const input = String(req.body?.input || "").trim();
    const sessionId = String(req.body?.sessionId || "default");

    if (!input) {
      return res.status(400).json({
        type: "text",
        content: "Envie um comando ou descriÃ§Ã£o de tarefa para o agente processar."
      });
    }

    const session = getSession(sessionId);
    session.addTurn("user", input);

    try {
      const remoteResult = await callRemoteAgent(input, sessionId);

      session.setArtifact({
        intent: remoteResult.intent,
        topic: remoteResult.meta?.topic || input,
        artifactType: remoteResult.type,
        requirements: [input].filter(Boolean),
        content: remoteResult.content
      });
      session.addTurn("assistant", typeof remoteResult.content === "string" ? remoteResult.content.slice(0, 1200) : JSON.stringify(remoteResult));

      return res.json(remoteResult);
    } catch (remoteError) {
      console.warn("Falha na API remota, usando fallback local:", remoteError.message);
      const localResult = await brain(input, session);
      return res.json({
        ...localResult,
        meta: {
          ...(localResult.meta || {}),
          source: "local-fallback"
        },
        warning: "API remota indisponÃ­vel no momento; resposta gerada pelo fallback local."
      });
    }
  } catch (error) {
    console.error("Erro interno do agente:", error);
    res.status(500).json({
      type: "text",
      content: "Ocorreu um erro ao processar o comando.",
      error: error.message
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ðŸš€ Smart Agent rodando em http://localhost:${PORT}`);
  console.log(`ðŸ”— API remota principal: ${REMOTE_API_BASE}`);
});
