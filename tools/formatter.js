export function formatHTML(html = "") {
  return String(html)
    .replace(/>\s+</g, ">\n<")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function formatJSON(data) {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return "Erro ao formatar JSON";
  }
}

export function formatText(text = "") {
  return String(text)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function autoFormat(output) {
  if (output && typeof output === "object" && !Array.isArray(output)) {
    return formatJSON(output);
  }

  if (typeof output === "string") {
    if (output.includes("<html") || output.includes("<!DOCTYPE html>")) {
      return formatHTML(output);
    }
    return formatText(output);
  }

  return String(output ?? "");
}
