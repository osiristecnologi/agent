// memory/session.js

const sessions = new Map();

// cria ou pega sessão existente
export function getSession(sessionId = "default") {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      history: [],
      context: {},
      createdAt: Date.now()
    });
  }

  return sessions.get(sessionId);
}
