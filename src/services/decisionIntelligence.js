import api from "../lib/api";

/**
 * Decision Intelligence Frontend API Service (Phase 15G-B)
 *
 * Exposes the client-side interface to the Decision Intelligence API:
 * - POST /api/v1/decision-intelligence/recommendations/evaluate
 * - GET  /api/v1/decision-intelligence/recommendations/latest
 * - GET  /api/v1/decision-intelligence/recommendations/{snapshot_id}
 */

/**
 * Evaluates decision support recommendations for a bounded list of target career IDs.
 *
 * @param {string[]} targetCareerIds - Array of Career UUID strings to evaluate.
 * @returns {Promise<Object>} The evaluated CareerRecommendationSnapshot.
 */
export const evaluateRecommendations = (targetCareerIds) => {
  return api.post("/api/v1/decision-intelligence/recommendations/evaluate", {
    target_career_ids: targetCareerIds,
  });
};

/**
 * Retrieves the latest immutable recommendation snapshot for the authenticated user.
 *
 * @returns {Promise<Object>} The latest CareerRecommendationSnapshot.
 */
export const getLatestRecommendation = () => {
  return api.get("/api/v1/decision-intelligence/recommendations/latest");
};

/**
 * Retrieves a specific historical recommendation snapshot by its ID.
 *
 * @param {string} snapshotId - UUID string of the recommendation snapshot.
 * @returns {Promise<Object>} The historical CareerRecommendationSnapshot.
 */
export const getRecommendationById = (snapshotId) => {
  return api.get(
    `/api/v1/decision-intelligence/recommendations/${encodeURIComponent(snapshotId)}`
  );
};

const decisionIntelligenceService = {
  evaluateRecommendations,
  getLatestRecommendation,
  getRecommendationById,
};

export default decisionIntelligenceService;
