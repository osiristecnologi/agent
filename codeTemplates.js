function normalizeWords(value = "") {
return value
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "")
.replace(/[^a-z0-9\s-]/g, " ")
.replace(/\s+/g, " ")
.trim();
}

export function slugify(value = "projeto") {
const slug = normalizeWords(value).replace(/\s+/g, "-");
return slug || "projeto";
}

export function toTitleCase(value = "Projeto") {
return String(value)
.split(/\s+/)
.filter(Boolean)
.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
.join(" ");
}

function buildFeatureList(topic, requirements = []) {
const defaults = [
Apresentação clara sobre ${topic},
"Seção com benefícios principais",
"Bloco de chamada para ação",
"Layout responsivo e moderno"
];

return [...new Set([...requirements.filter(Boolean), ...defaults])].slice(0, 6);
}

export function createLandingPage({ topic, requirements = [], theme = "dark" }) {
const pageTitle = toTitleCase(topic || "Nova Landing Page");
const features = buildFeatureList(topic || "o produto", requirements);
const featureCards = features
.map(
(item, index) =>    <article class="card">   <span class="badge">0${index + 1}</span>   <h3>${item}</h3>   <p>Uma explicação objetiva para mostrar valor rapidamente e orientar a próxima ação do usuário.</p>   </article>
)
.join("\n");

const accent = theme === "light" ? "#2563eb" : "#38bdf8";
const background = theme === "light" ? "#f8fafc" : "#020617";
const surface = theme === "light" ? "#ffffff" : "#0f172a";
const text = theme === "light" ? "#0f172a" : "#e2e8f0";
const muted = theme === "light" ? "#475569" : "#94a3b8";

return `<!DOCTYPE html>

<html lang="pt-BR">  
<head>  
  <meta charset="UTF-8" />  
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />  
  <title>${pageTitle}</title>  
  <style>  
    :root {  
      --bg: ${background};  
      --surface: ${surface};  
      --text: ${text};  
      --muted: ${muted};  
      --accent: ${accent};  
      --border: rgba(148, 163, 184, 0.2);  
    }  
    * { box-sizing: border-box; }  
    body {  
      margin: 0;  
      font-family: Inter, Arial, sans-serif;  
      background: radial-gradient(circle at top, rgba(56,189,248,0.16), transparent 30%), var(--bg);  
      color: var(--text);  
    }  
    .container { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }  
    header {  
      padding: 72px 0 40px;  
    }  
    nav {  
      display: flex;  
      justify-content: space-between;  
      align-items: center;  
      margin-bottom: 48px;  
    }  
    .logo {  
      font-weight: 800;  
      letter-spacing: 0.04em;  
    }  
    .hero {  
      display: grid;  
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));  
      gap: 28px;  
      align-items: center;  
    }  
    .hero-card, .panel, .card {  
      background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));  
      border: 1px solid var(--border);  
      border-radius: 24px;  
      padding: 24px;  
      backdrop-filter: blur(10px);  
    }  
    h1 { font-size: clamp(2.2rem, 5vw, 4rem); margin: 0 0 16px; line-height: 1.05; }  
    h2 { font-size: clamp(1.6rem, 3vw, 2.4rem); margin-bottom: 12px; }  
    p { color: var(--muted); line-height: 1.7; }  
    .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }  
    .btn {  
      padding: 14px 18px;  
      border-radius: 999px;  
      text-decoration: none;  
      font-weight: 700;  
      border: 1px solid transparent;  
    }  
    .btn-primary { background: var(--accent); color: #001018; }  
    .btn-secondary { border-color: var(--border); color: var(--text); }  
    main { padding-bottom: 72px; }  
    .grid {  
      display: grid;  
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));  
      gap: 18px;  
      margin-top: 28px;  
    }  
    .badge {  
      display: inline-flex;  
      width: 40px;  
      height: 40px;  
      align-items: center;  
      justify-content: center;  
      border-radius: 999px;  
      background: rgba(56, 189, 248, 0.12);  
      color: var(--accent);  
      font-weight: 800;  
    }  
    .stats {  
      display: grid;  
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));  
      gap: 14px;  
      margin-top: 18px;  
    }  
    .stat strong { display: block; font-size: 1.8rem; }  
    footer { padding: 32px 0 48px; color: var(--muted); text-align: center; }  
  </style>  
</head>  
<body>  
  <header>  
    <div class="container">  
      <nav>  
        <div class="logo">${pageTitle}</div>  
        <a class="btn btn-secondary" href="#solucao">Ver solução</a>  
      </nav>  <section class="hero">  
    <div>  
      <span class="badge">AI</span>  
      <h1>${pageTitle} com mensagem clara, foco em conversão e estrutura pronta para evoluir.</h1>  
      <p>Esta página foi gerada automaticamente para apresentar ${topic || "o seu projeto"} de forma moderna, objetiva e adaptável para próximos ajustes.</p>  
      <div class="actions">  
        <a class="btn btn-primary" href="#cta">Começar agora</a>  
        <a class="btn btn-secondary" href="#beneficios">Explorar recursos</a>  
      </div>  
    </div>  
    <div class="hero-card">  
      <h2>Resumo rápido</h2>  
      <p>Use este layout como base para MVP, validação de ideia, protótipo visual ou página institucional.</p>  
      <div class="stats">  
        <div class="panel stat"><strong>+3x</strong><span>mais clareza visual</span></div>  
        <div class="panel stat"><strong>1 base</strong><span>para iterar rápido</span></div>  
        <div class="panel stat"><strong>100%</strong><span>HTML pronto para editar</span></div>  
      </div>  
    </div>  
  </section>  
</div>

  </header>    <main class="container">  
    <section id="beneficios">  
      <h2>Benefícios principais</h2>  
      <p>Os blocos abaixo já organizam a proposta de valor e ajudam o agente a ampliar a página com novos módulos depois.</p>  
      <div class="grid">  
        ${featureCards}  
      </div>  
    </section>  <section id="solucao" style="margin-top:48px;">  
  <div class="panel">  
    <h2>Como usar</h2>  
    <p>Edite textos, ajuste cores, conecte formulários reais e continue pedindo melhorias incrementais como login, FAQ, integração com API ou painel administrativo.</p>  
  </div>  
</section>  

<section id="cta" style="margin-top:48px;">  
  <div class="panel">  
    <h2>Pronto para a próxima etapa</h2>  
    <p>Peça ao agente para transformar esta base em checkout, dashboard, blog, página de captura ou app com backend.</p>  
    <div class="actions">  
      <a class="btn btn-primary" href="mailto:contato@exemplo.com">Solicitar demo</a>  
      <a class="btn btn-secondary" href="#top">Voltar ao topo</a>  
    </div>  
  </div>  
</section>

  </main>    <footer>  
    Base inicial gerada para ${pageTitle}. Personalize textos, integração e analytics conforme o seu caso de uso.  
  </footer>  
</body>  
</html>`;  
}  export function createNodeApi({ topic, entity = "item" }) {
const entityName = slugify(entity).replace(/-/g, "_") || "item";
return `import express from "express";

const app = express();
app.use(express.json());

let ${entityName}s = [
{ id: 1, nome: "Exemplo", descricao: "Registro inicial de ${topic || "projeto"}" }
];

app.get("/api/${entityName}s", (req, res) => {
res.json(${entityName}s);
});

app.get("/api/${entityName}s/:id", (req, res) => {
const item = ${entityName}s.find((entry) => entry.id === Number(req.params.id));
if (!item) {
return res.status(404).json({ error: "Registro não encontrado" });
}
res.json(item);
});

app.post("/api/${entityName}s", (req, res) => {
const novo = {
id: Date.now(),
nome: req.body.nome || "Sem nome",
descricao: req.body.descricao || "Sem descrição"
};

${entityName}s.push(novo);
res.status(201).json(novo);
});

app.put("/api/${entityName}s/:id", (req, res) => {
const index = ${entityName}s.findIndex((entry) => entry.id === Number(req.params.id));
if (index === -1) {
return res.status(404).json({ error: "Registro não encontrado" });
}

${entityName}s[index] = {
...${entityName}s[index],
...req.body,
id: ${entityName}s[index].id
};

res.json(${entityName}s[index]);
});

app.delete("/api/${entityName}s/:id", (req, res) => {
const before = ${entityName}s.length;
${entityName}s = ${entityName}s.filter((entry) => entry.id !== Number(req.params.id));

if (${entityName}s.length === before) {
return res.status(404).json({ error: "Registro não encontrado" });
}

res.status(204).send();
});

app.listen(3000, () => {
console.log("API pronta em http://localhost:3000");
});`;
}

export function createReactComponent({ topic, requirements = [] }) {
const title = toTitleCase(topic || "Meu Componente");
const items = buildFeatureList(topic || "o projeto", requirements)
.map((item) =>           <li>${item}</li>)
.join("\n");

return `import React from "react";
import "./FeaturePanel.css";

export default function FeaturePanel() {
return (
<section className="feature-panel">
<header>
<span className="tag">Novo</span>
<h2>${title}</h2>
<p>Componente reutilizável com foco em clareza visual e fácil customização.</p>
</header>

<ul>

${items}
</ul>

<button type="button">Continuar</button>  
</section>

);
}`;
}

export function createPythonScript({ topic }) {
const slug = slugify(topic || "processador").replace(/-/g, "_");
return `from datetime import datetime

def executar_${slug}(itens):
resultado = []
for indice, item in enumerate(itens, start=1):
resultado.append({
"id": indice,
"valor": item,
"processado_em": datetime.utcnow().isoformat()
})
return resultado

if name == "main":
dados = ["entrada 1", "entrada 2", "entrada 3"]
print(executar_${slug}(dados))`;
}

export function createJavaScriptUtility({ topic }) {
const fn = slugify(topic || "processador").replace(/-/g, "_");
return export function ${fn}(items = []) {   return items.map((item, index) => ({   id: index + 1,   value: item,   createdAt: new Date().toISOString()   }));   };
          }
