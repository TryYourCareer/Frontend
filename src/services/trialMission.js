import api from "../lib/api";
import BACKEND_BASE_URL from "../API/BaseURL";

// Helper for PUT requests if api.put is not attached to the api client
async function putRequest(path, body) {
  if (typeof api.put === "function") {
    return api.put(path, body);
  }
  const token = localStorage.getItem("clearcareers_auth_token") || "";
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method: "PUT",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail || JSON.stringify(err);
    } catch {
      // ignore
    }
    const error = new Error(detail);
    error.status = res.status;
    throw error;
  }
  if (res.status === 204) return null;
  return res.json();
}

// Mission Catalog
export const getTrialMissions = () =>
  api.get("/trial-missions");

// Mission Definition
export const getTrialMission = (missionId) =>
  api.get(`/trial-missions/${missionId}`);

export const getTrialMissionVersion = (missionId, versionNumber) =>
  api.get(`/trial-missions/${missionId}/versions/${versionNumber}`);

// Session Lifecycle
export const createMissionSession = (missionId, payload = {}) =>
  api.post(`/trial-missions/${missionId}/sessions`, payload);

export const getMissionSession = (sessionId) =>
  api.get(`/trial-missions/sessions/${sessionId}`);

export const transitionSession = (sessionId, action) => {
  const payload = typeof action === "string" ? { target_state: action } : action;
  return api.post(`/trial-missions/sessions/${sessionId}/transition`, payload);
};

export const pauseSession = (sessionId, payload = {}) =>
  api.post(`/trial-missions/sessions/${sessionId}/pause`, payload);

export const resumeSession = (sessionId, payload = {}) =>
  api.post(`/trial-missions/sessions/${sessionId}/resume`, payload);

export const abandonSession = (sessionId, payload = {}) =>
  api.post(`/trial-missions/sessions/${sessionId}/abandon`, payload);

// Resources
export const accessMissionResource = (sessionId, resourceId) =>
  api.post(`/trial-missions/sessions/${sessionId}/resources/${resourceId}/access`);

// Working Notes
export const getWorkingNotes = (sessionId) =>
  api.get(`/trial-missions/sessions/${sessionId}/notes`);

export const saveWorkingNotes = (sessionId, content) => {
  const payload = typeof content === "string" ? { content } : content;
  return putRequest(`/trial-missions/sessions/${sessionId}/notes`, payload);
};

// Findings
export const getFindings = (sessionId) =>
  api.get(`/trial-missions/sessions/${sessionId}/findings`);

export const createFinding = (sessionId, payload) =>
  api.post(`/trial-missions/sessions/${sessionId}/findings`, payload);

// Investigation Completion
export const completeInvestigation = (sessionId) =>
  api.post(`/trial-missions/sessions/${sessionId}/complete-investigation`);

// Decision
export const submitDecision = (sessionId, payload) =>
  api.post(`/trial-missions/sessions/${sessionId}/decision`, payload);

// Consequence
export const generateConsequence = (sessionId) =>
  api.post(`/trial-missions/sessions/${sessionId}/consequence`);

// Reality Event
export const getRealityEvent = (sessionId) =>
  api.get(`/trial-missions/sessions/${sessionId}/reality-event`);

export const respondToRealityEvent = (sessionId, payload) =>
  api.post(`/trial-missions/sessions/${sessionId}/reality-event-response`, payload);

// Output (Memo)
export const getOutput = (sessionId) =>
  api.get(`/trial-missions/sessions/${sessionId}/output`);

export const saveOutput = (sessionId, payload) =>
  putRequest(`/trial-missions/sessions/${sessionId}/output`, payload);

export const reviewOutput = (sessionId) =>
  api.post(`/trial-missions/sessions/${sessionId}/output/review`);

export const finaliseOutput = (sessionId) =>
  api.post(`/trial-missions/sessions/${sessionId}/output/finalise`);

export const submitOutput = (sessionId) =>
  api.post(`/trial-missions/sessions/${sessionId}/output/submit`);

// Reflection
export const getReflection = (sessionId) =>
  api.get(`/trial-missions/sessions/${sessionId}/reflection`);

export const saveReflection = (sessionId, payload) =>
  putRequest(`/trial-missions/sessions/${sessionId}/reflection`, payload);

export const submitReflection = (sessionId, payload = {}) =>
  api.post(`/trial-missions/sessions/${sessionId}/reflection/submit`, payload);

// Evaluation
export const getEvaluation = (sessionId) =>
  api.get(`/trial-missions/sessions/${sessionId}/evaluation`);

// Activity Summary
export const getSessionActivitySummary = (sessionId) =>
  api.get(`/trial-missions/sessions/${sessionId}/activity-summary`);

export const recordScreenTransition = (sessionId, screen) =>
  api.post(`/trial-missions/sessions/${sessionId}/screen-transition`, { screen });

const trialMissionService = {
  getTrialMissions,
  getTrialMission,
  getTrialMissionVersion,
  createMissionSession,
  getMissionSession,
  transitionSession,
  pauseSession,
  resumeSession,
  abandonSession,
  accessMissionResource,
  getWorkingNotes,
  saveWorkingNotes,
  getFindings,
  createFinding,
  completeInvestigation,
  submitDecision,
  generateConsequence,
  getRealityEvent,
  respondToRealityEvent,
  getOutput,
  saveOutput,
  reviewOutput,
  finaliseOutput,
  submitOutput,
  getReflection,
  saveReflection,
  submitReflection,
  getEvaluation,
  getSessionActivitySummary,
  recordScreenTransition,
};

export default trialMissionService;
