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
    `Apresentação clara sobre ${topic}`,
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
    .map((item, index) => `
      <article class="card">
        <span class="badge">0${index + 1}</span>
        <h3>${item}</h3>
      </article>
    `)
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
</head>
<body>
<h1>${pageTitle}</h1>
<div>${featureCards}</div>
</body>
</html>`;
}

/* ================= API ================= */

export function createNodeApi({ topic, entity = "item" }) {
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

app.listen(3000, () => {
  console.log("API pronta em http://localhost:3000");
});`;
}

/* ================= REACT ================= */

export function createReactComponent({ topic, requirements = [] }) {
  const title = toTitleCase(topic || "Meu Componente");

  const items = buildFeatureList(topic || "o projeto", requirements)
    .map((item) => `          <li>${item}</li>`)
    .join("\n");

  return `import React from "react";

export default function FeaturePanel() {
  return (
    <section>
      <h2>${title}</h2>
      <ul>
${items}
      </ul>
    </section>
  );
}`;
}

/* ================= PYTHON ================= */

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

if __name__ == "__main__":
    dados = ["entrada 1", "entrada 2", "entrada 3"]
    print(executar_${slug}(dados))
`;
}

/* ================= JS UTILITY ================= */

export function createJavaScriptUtility({ topic }) {
  const fn = slugify(topic || "processador").replace(/-/g, "_");

  return `export function ${fn}(items = []) {
  return items.map((item, index) => ({
    id: index + 1,
    value: item,
    createdAt: new Date().toISOString()
  }));
}`;
}
