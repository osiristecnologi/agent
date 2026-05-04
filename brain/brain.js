import { detectIntent } from "./intent.js";
import { plan } from "./planner.js";

export async function brain(input, memory) {

  const intent = detectIntent(input);

  const action = plan(intent);

  const result = await action.execute(input, memory);

  return result;
}
