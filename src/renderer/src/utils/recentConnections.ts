const STORAGE_KEY = "freessh.recentConnections";
const MAX_RECENTS = 10;

export function getRecentConnectionIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value) => typeof value === "string");
  } catch {
    return [];
  }
}

export function recordRecentConnection(connectionId: string): string[] {
  if (!connectionId) return getRecentConnectionIds();
  const existing = getRecentConnectionIds();
  const next = [connectionId, ...existing.filter((id) => id !== connectionId)].slice(0, MAX_RECENTS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore persistence failures.
  }
  return next;
}
