import { detectIntent } from "./intent.js";
import { plan } from "./planner.js";

export async function brain(input, session) {
  const intent = detectIntent(input, session);
  const action = plan(intent);
  const result = await action.execute(input, session);

  if (session?.addTurn) {
    session.addTurn("assistant", typeof result?.content === "string" ? result.content.slice(0, 1200) : JSON.stringify(result));
  }

  return {
    ...result,
    intent: intent.category,
    meta: {
      target: intent.target,
      language: intent.language,
      topic: intent.topic,
      continuation: intent.isContinuation
    }
  };
}
