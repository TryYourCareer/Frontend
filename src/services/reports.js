import api from "../lib/api";

/**
 * Decision Report & Parent Report Frontend API Service.
 *
 * Consumes the FastAPI backend report endpoints:
 * - GET /api/reports/careers/{career_id}/canonical -> Complete Canonical Report
 * - GET /api/reports/careers/{career_id}/decision-report -> Student Projection
 * - GET /api/reports/careers/{career_id}/parent-report -> Parent Projection
 * - POST /api/reports/careers/{career_id}/export -> Server-Side PDF Generation
 * - GET /api/reports/exports/{export_id} -> Export Job Status
 * - POST /api/reports/careers/{career_id}/share-parent -> Create Parent Share Token
 * - GET /api/reports/shared/{token} -> Public Parent Report View
 */

/**
 * Retrieves the complete canonical report for a career.
 */
export const getCanonicalReport = (careerId) => {
  if (!careerId) {
    return Promise.reject(new Error("careerId is required to fetch Canonical Report."));
  }
  return api.get(`/api/reports/careers/${encodeURIComponent(careerId)}/canonical`);
};

export const getReport = getCanonicalReport;

/**
 * Retrieves the student-facing Decision Report projection for a specific career.
 */
export const getDecisionReport = (careerId) => {
  if (!careerId) {
    return Promise.reject(new Error("careerId is required to fetch Decision Report."));
  }
  return api.get(`/api/reports/careers/${encodeURIComponent(careerId)}/decision-report`);
};

/**
 * Retrieves the parent-facing Parent Report projection for a specific career.
 */
export const getParentReport = (careerId) => {
  if (!careerId) {
    return Promise.reject(new Error("careerId is required to fetch Parent Report."));
  }
  return api.get(`/api/reports/careers/${encodeURIComponent(careerId)}/parent-report`);
};

/**
 * Triggers server-side PDF generation job (Student, Parent, or Both).
 *
 * @param {string} careerId - Career UUID.
 * @param {string} exportType - "student" | "parent" | "both"
 * @returns {Promise<Object>} Export record with status and signed download URL.
 */
export const exportReportPdf = (careerId, exportType = "both") => {
  if (!careerId) {
    return Promise.reject(new Error("careerId is required to export report."));
  }
  return api.post(`/api/reports/careers/${encodeURIComponent(careerId)}/export`, {
    export_type: exportType,
  });
};

/**
 * Checks the status of a PDF export job.
 *
 * @param {string} exportId - Export job UUID.
 * @returns {Promise<Object>} Export record with status.
 */
export const getExportStatus = (exportId) => {
  if (!exportId) {
    return Promise.reject(new Error("exportId is required."));
  }
  return api.get(`/api/reports/exports/${encodeURIComponent(exportId)}`);
};

/**
 * Generates a secure, expiring read-only share token for Parents.
 *
 * @param {string} careerId - Career UUID.
 * @param {number} expiryDays - Days until link expiration (1 to 30).
 * @returns {Promise<Object>} Share response with token, share_url, and expires_at.
 */
export const createParentShareLink = (careerId, expiryDays = 7) => {
  if (!careerId) {
    return Promise.reject(new Error("careerId is required to create share link."));
  }
  return api.post(`/api/reports/careers/${encodeURIComponent(careerId)}/share-parent`, {
    expiry_days: expiryDays,
  });
};

/**
 * Retrieves the read-only parent report using a public share token.
 *
 * @param {string} token - Cryptographically random share token.
 * @returns {Promise<Object>} Shared parent report payload.
 */
export const getPublicSharedParentReport = (token) => {
  if (!token) {
    return Promise.reject(new Error("token is required."));
  }
  return api.get(`/api/reports/shared/${encodeURIComponent(token)}`);
};

const reportService = {
  getReport,
  getCanonicalReport,
  getDecisionReport,
  getParentReport,
  exportReportPdf,
  getExportStatus,
  createParentShareLink,
  getPublicSharedParentReport,
};

export default reportService;
