/**
 * Persistent Action Checklist Storage Utility.
 * Provides safe, isolated client-side persistence for report action completion.
 * Namespaces state by user ID and career ID to prevent state pollution.
 */

export function getChecklistStorageKey(userId, careerId) {
  const safeUser = userId ? String(userId).trim() : "guest";
  const safeCareer = careerId ? String(careerId).trim() : "default";
  return `tyc_report_checklist_${safeUser}_${safeCareer}`;
}

export function loadChecklistState(userId, careerId) {
  try {
    const key = getChecklistStorageKey(userId, careerId);
    const raw = typeof window !== "undefined" && window.localStorage ? window.localStorage.getItem(key) : null;
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch (err) {
    return {};
  }
}

export function saveChecklistState(userId, careerId, state) {
  try {
    const key = getChecklistStorageKey(userId, careerId);
    if (typeof window !== "undefined" && window.localStorage) {
      if (!state || Object.keys(state).length === 0) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(state));
      }
    }
  } catch (err) {
    // Fail safely without disrupting the UI
  }
}
