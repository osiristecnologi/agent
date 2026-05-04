import { generateHTML } from "../tools/htmlGenerator.js";

export const htmlAgent = {
  execute: async (input) => {
    return generateHTML(input);
  }
};
