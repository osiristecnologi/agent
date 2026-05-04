import { htmlAgent } from "../agents/htmlAgent.js";
import { apiAgent } from "../agents/apiAgent.js";

export function plan(intent) {

  switch (intent) {
    case "generate_html":
      return htmlAgent;

    case "fetch_api":
      return apiAgent;

    default:
      return {
        execute: async () => "Não entendi 😅"
      };
  }
}
