export function detectIntent(input) {
  if (input.includes("site") || input.includes("html")) {
    return "generate_html";
  }

  if (input.includes("api") || input.includes("dados")) {
    return "fetch_api";
  }

  return "chat";
}
