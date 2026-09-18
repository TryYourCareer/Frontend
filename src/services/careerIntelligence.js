import api from "../lib/api";

/**
 * Career Intelligence Frontend API Service
 * Interacts with read-only endpoints:
 * - GET /careers/intelligence/families
 * - GET /careers/intelligence/families/{family_key}/careers
 * - GET /careers/intelligence/{career_id_or_slug}
 * - GET /careers/intelligence/{career_id_or_slug}/activities
 */

export const listCareerFamilies = () =>
  api.get("/careers/intelligence/families");

export const getFamilyCareers = (familyKey) =>
  api.get(`/careers/intelligence/families/${encodeURIComponent(familyKey)}/careers`);

export const getCareerIntelligence = (careerIdOrSlug) =>
  api.get(`/careers/intelligence/${encodeURIComponent(careerIdOrSlug)}`);

export const getCareerActivities = (careerIdOrSlug) =>
  api.get(`/careers/intelligence/${encodeURIComponent(careerIdOrSlug)}/activities`);

const careerIntelligenceService = {
  listCareerFamilies,
  getFamilyCareers,
  getCareerIntelligence,
  getCareerActivities,
};

export default careerIntelligenceService;
