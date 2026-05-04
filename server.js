import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/**
 * =========================
 * 🧰 TOOLS (funções reais)
 * =========================
 */

// gera um HTML simples baseado no prompt
function generateHTML(prompt = "") {
  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Site gerado</title>
  <style>
    body { font-family: Arial; background:#0f172a; color:#e2e8f0; text-align:center; padding:40px; }
    h1 { color:#38bdf8; }
    button { padding:10px 20px; border:none; border-radius:8px; background:#38bdf8; color:#000; cursor:pointer; }
  </style>
</head>
<body>
  <h1>🚀 Site criado pelo Agent</h1>
  <p>${prompt}</p>
  <button onclick="alert('Funcionando!')">Clique</button>
</body>
</html>`;
}

// busca preço de crypto (Coingecko - sem chave)
async function getCryptoPrice(coin = "bitcoin") {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`;
  const res = await fetch(url);
  const data = await res.json();
  const price = data?.[coin]?.usd;
  return price ? `${coin} = $${price}` : "Não consegui buscar o preço 😅";
}

/**
 * =========================
 * 🧠 AGENT (decisão)
 * =========================
 */
async function agent(input = "") {
  const text = input.toLowerCase();

  // regras básicas (intenção)
  if (text.includes("nome")) {
    return { type: "text", content: "Eu sou o Agent 🚀" };
  }

  if (text.includes("oi") || text.includes("olá")) {
    return { type: "text", content: "Fala aí 😎" };
  }

  if (text.includes("site") || text.includes("html")) {
    const html = generateHTML(input);
    return { type: "html", content: html };
  }

  if (text.includes("bitcoin") || text.includes("crypto")) {
    const result = await getCryptoPrice("bitcoin");
    return { type: "text", content: result };
  }

  return { type: "text", content: "Não entendi ainda 😅 tenta pedir um site ou preço de bitcoin" };
}

/**
 * =========================
 * 🌐 ROTAS
 * =========================
 */

app.get("/", (req, res) => {
  res.json({ status: "Agent API online 🚀" });
});

app.post("/agent", async (req, res) => {
  try {
    const { input } = req.body;
    const result = await agent(input);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Erro interno", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 rodando na porta " + PORT));
