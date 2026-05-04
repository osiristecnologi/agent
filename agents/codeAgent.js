// agents/codeAgent.js

import { autoFormat } from "../utils/formatter.js";

export const codeAgent = {

  execute: async (input) => {

    // 🧠 versão simples (sem IA)
    if (input.includes("html") || input.includes("site")) {
      return autoFormat(generateHTML(input));
    }

    if (input.includes("botão")) {
      return autoFormat(generateButton());
    }

    return "Não consegui gerar código ainda 😅";
  }
};


// 🔧 funções internas

function generateHTML(prompt) {
  return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Site gerado</title>
  <style>
    body {
      font-family: Arial;
      background: #111;
      color: #fff;
      text-align: center;
      padding: 50px;
    }
  </style>
</head>
<body>

  <h1>Site criado pelo Agent 🚀</h1>
  <p>${prompt}</p>

</body>
</html>
`;
}

function generateButton() {
  return `
<button style="
  background: blue;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
">
  Clique aqui
</button>
`;
}
