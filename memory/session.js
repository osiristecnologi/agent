const sessions = new Map();
const MAX_HISTORY = 40;
const MAX_NOTES = 12;
const MESSAGE_TTL_MS = 5 * 24 * 60 * 60 * 1000;
const STALE_SESSION_TTL_MS = 10 * 24 * 60 * 60 * 1000;

function now() {
  return Date.now();
}

function isExpired(entry) {
  return !entry?.at || now() - entry.at > MESSAGE_TTL_MS;
}

function extractUserSignals(text = "") {
  const signals = {};
  const normalized = text.toLowerCase();

  const nameMatch = text.match(/meu nome e?\s+([a-zà-ÿ'\- ]{2,40})/i);
  if (nameMatch) {
    signals.name = nameMatch[1].trim();
  }

  const preferenceMatch = text.match(/(?:eu prefiro|prefiro|gosto de)\s+(.{3,120})/i);
  if (preferenceMatch) {
    signals.preference = preferenceMatch[1].trim();
  }

  if (normalized.includes("tema escuro") || normalized.includes("modo escuro")) {
    signals.theme = "dark";
  }

  if (normalized.includes("tema claro") || normalized.includes("modo claro")) {
    signals.theme = "light";
  }

  return signals;
}

function pruneSession(session) {
  if (!session) return session;

  session.history = (session.history || []).filter((item) => !isExpired(item)).slice(-MAX_HISTORY);
  session.context.notes = (session.context.notes || []).filter((item) => !isExpired(item)).slice(-MAX_NOTES);

  if (!session.history.length) {
    session.context.lastIntent = null;
    session.context.lastTopic = null;
    session.context.lastArtifactType = null;
    session.context.lastRequirements = [];
    session.context.lastContent = "";
  }

  if (session.updatedAt && now() - session.updatedAt > STALE_SESSION_TTL_MS) {
    session.history = [];
    session.context.lastIntent = null;
    session.context.lastTopic = null;
    session.context.lastArtifactType = null;
    session.context.lastRequirements = [];
    session.context.lastContent = "";
    session.context.notes = [];
    session.updatedAt = now();
  }

  return session;
}

function cleanupSessions() {
  for (const [sessionId, session] of sessions.entries()) {
    pruneSession(session);
    const hasHistory = Boolean(session.history?.length);
    const hasNotes = Boolean(session.context?.notes?.length);
    const isStale = now() - (session.updatedAt || session.createdAt || 0) > STALE_SESSION_TTL_MS;

    if (!hasHistory && !hasNotes && isStale) {
      sessions.delete(sessionId);
    }
  }
}

function createSession(sessionId) {
  return {
    id: sessionId,
    history: [],
    context: {
      name: null,
      preference: null,
      theme: "dark",
      lastIntent: null,
      lastTopic: null,
      lastArtifactType: null,
      lastRequirements: [],
      lastContent: "",
      notes: []
    },
    stats: {
      totalTurns: 0
    },
    createdAt: now(),
    updatedAt: now(),
    addTurn(role, content, meta = {}) {
      pruneSession(this);
      this.history.push({ role, content, meta, at: now() });
      this.updatedAt = now();
      this.stats.totalTurns += 1;

      if (role === "user") {
        const signals = extractUserSignals(content);
        if (signals.name) this.context.name = signals.name;
        if (signals.preference) this.context.preference = signals.preference;
        if (signals.theme) this.context.theme = signals.theme;
      }

      if (this.history.length > MAX_HISTORY) {
        this.history = this.history.slice(-MAX_HISTORY);
      }
    },
    setArtifact(payload = {}) {
      pruneSession(this);
      this.context.lastIntent = payload.intent || this.context.lastIntent;
      this.context.lastTopic = payload.topic || this.context.lastTopic;
      this.context.lastArtifactType = payload.artifactType || this.context.lastArtifactType;
      this.context.lastRequirements = payload.requirements || this.context.lastRequirements || [];
      this.context.lastContent = payload.content || this.context.lastContent || "";
      this.updatedAt = now();
    },
    remember(note) {
      pruneSession(this);
      if (!note) return;
      this.context.notes.push({ note, at: now() });
      this.context.notes = this.context.notes.slice(-MAX_NOTES);
      this.updatedAt = now();
    },
    clear() {
      this.history = [];
      this.context.lastIntent = null;
      this.context.lastTopic = null;
      this.context.lastArtifactType = null;
      this.context.lastRequirements = [];
      this.context.lastContent = "";
      this.context.notes = [];
      this.updatedAt = now();
    },
    getRecentHistory(limit = 6) {
      pruneSession(this);
      return this.history.slice(-limit);
    }
  };
}

export function getSession(sessionId = "default") {
  cleanupSessions();
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, createSession(sessionId));
  }
  return pruneSession(sessions.get(sessionId));
}

export function clearSession(sessionId = "default") {
  const session = getSession(sessionId);
  session.clear();
  return session;
}

