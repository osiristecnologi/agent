// config/toolsMap.js

import { generateHTML } from "../tools/htmlGenerator.js";
import { fetchApi } from "../tools/fetchApi.js";

export const toolsMap = {
  
  generate_html: {
    name: "generate_html",
    description: "Gera um site HTML baseado em um prompt",
    execute: async (input) => {
      return generateHTML(input);
    }
  },

  fetch_crypto: {
    name: "fetch_crypto",
    description: "Busca preço de criptomoedas",
    execute: async () => {
      return await fetchApi(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );
    }
  },

  fetch_weather: {
    name: "fetch_weather",
    description: "Busca clima de uma cidade",
    execute: async (city) => {
      return await fetchApi(
        `https://api.open-meteo.com/v1/forecast?latitude=-16.3&longitude=-48.9&current_weather=true`
      );
    }
  }

};
