import {
  handleCalculation,
  handleClear,
  handleCodeTask,
  handleExplanation,
  handleHelp,
  handleHistory,
  handleRemember,
  handleSummary,
  handleWebsiteTask
} from "./skills.js";

export function plan(intent) {
  const actions = {
    help: handleHelp,
    history: handleHistory,
    clear: handleClear,
    remember: handleRemember,
    explain: handleExplanation,
    summarize: handleSummary,
    calculate: handleCalculation,
    generate_website: handleWebsiteTask,
    generate_code: handleCodeTask
  };

  const selected = actions[intent.category] || handleHelp;

  return {
    name: intent.category,
    async execute(input, session) {
      return selected(intent, session, input);
    }
  };
}

