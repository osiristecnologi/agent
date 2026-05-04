import { fetchApi } from "../tools/fetchApi.js";

export const apiAgent = {
  execute: async (input) => {
    const data = await fetchApi("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
    return JSON.stringify(data, null, 2);
  }
};
