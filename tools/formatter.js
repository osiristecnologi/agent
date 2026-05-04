// utils/formatter.js

// Formata código HTML
export function formatHTML(html) {
  return html
    .replace(/\n/g, "")
    .replace(/>\s+</g, "><")
    .replace(/></g, ">\n<")
    .trim();
}

// Formata JSON bonito
export function formatJSON(data) {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return "Erro ao formatar JSON";
  }
}

// Formata resposta de texto
export function formatText(text) {
  return text.trim();
}

// Detecta tipo de saída automaticamente
export function autoFormat(output) {

  // JSON
  if (typeof output === "object") {
    return formatJSON(output);
  }

  if (typeof output === "string") {

    // HTML
    if (output.includes("<html") || output.includes("<div")) {
      return formatHTML(output);
    }

    // JSON string
    try {
      const parsed = JSON.parse(output);
      return formatJSON(parsed);
    } catch {}

    return formatText(output);
  }

  return output;
}
