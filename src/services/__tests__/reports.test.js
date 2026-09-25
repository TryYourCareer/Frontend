import api from "../../lib/api";
import {
  getDecisionReport,
  getParentReport,
  getCanonicalReport,
} from "../reports";

jest.mock("../../lib/api");

describe("reports service API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDecisionReport", () => {
    test("calls GET /api/reports/careers/{careerId}/decision-report with encoded careerId", async () => {
      api.get.mockResolvedValue({ report_metadata: { report_id: "rep-1" } });

      const res = await getDecisionReport("bio-engineer/v1");

      expect(api.get).toHaveBeenCalledWith("/api/reports/careers/bio-engineer%2Fv1/decision-report");
      expect(res).toEqual({ report_metadata: { report_id: "rep-1" } });
    });

    test("rejects if careerId is not provided", async () => {
      await expect(getDecisionReport("")).rejects.toThrow("careerId is required to fetch Decision Report.");
    });
  });

  describe("getParentReport", () => {
    test("calls GET /api/reports/careers/{careerId}/parent-report with encoded careerId", async () => {
      api.get.mockResolvedValue({ parent_report: { snapshot: { career_name: "Bioprocess Engineer" } } });

      const res = await getParentReport("bioprocess-engineer");

      expect(api.get).toHaveBeenCalledWith("/api/reports/careers/bioprocess-engineer/parent-report");
      expect(res).toEqual({ parent_report: { snapshot: { career_name: "Bioprocess Engineer" } } });
    });

    test("rejects if careerId is not provided", async () => {
      await expect(getParentReport(null)).rejects.toThrow("careerId is required to fetch Parent Report.");
    });
  });

  describe("getCanonicalReport", () => {
    test("calls GET /api/reports/careers/{careerId}/canonical with encoded careerId", async () => {
      api.get.mockResolvedValue({ provenance: { engine_version: "4.0.0" } });

      const res = await getCanonicalReport("chem-eng");

      expect(api.get).toHaveBeenCalledWith("/api/reports/careers/chem-eng/canonical");
      expect(res).toEqual({ provenance: { engine_version: "4.0.0" } });
    });

    test("rejects if careerId is not provided", async () => {
      await expect(getCanonicalReport(undefined)).rejects.toThrow("careerId is required to fetch Canonical Report.");
    });
  });
});
