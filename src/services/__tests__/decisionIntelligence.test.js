import api from "../../lib/api";
import decisionIntelligenceService, {
  evaluateRecommendations,
  getLatestRecommendation,
  getRecommendationById,
} from "../decisionIntelligence";

// Mock api client
jest.mock("../../lib/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe("Decision Intelligence Frontend Service (Phase 15G-B)", () => {
  const CAREER_1_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const CAREER_2_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
  const SNAPSHOT_ID = "cccccccc-cccc-cccc-cccc-cccccccccccc";

  const MOCK_SNAPSHOT_RESPONSE = {
    id: SNAPSHOT_ID,
    user_id: "11111111-1111-1111-1111-111111111111",
    recommendation_engine_version: "rec_engine_v1.0",
    ranked_career_candidates: [
      {
        career_id: CAREER_1_ID,
        career_code: "data_scientist",
        career_title: "Data Scientist",
        fit_snapshot_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        competency_snapshot_id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
        career_work_dna_profile_id: "77777777-7777-7777-7777-777777777777",
        contributing_evidence_ids: ["66666666-6666-6666-6666-666666666666"],
        version_lineage: {
          ctep_extractor_version: "ctep_v1.0.0",
          mission_taxonomy_version: "mission_tax_v1.0",
          competency_taxonomy_version: "comp_tax_v1.0",
          mapping_rule_version: "map_v1.0",
          fit_algorithm_version: "fit_algo_v1.0",
          recommendation_engine_version: "rec_engine_v1.0",
        },
        fit_index: 85.0,
        fit_tier: "STRONG_ALIGNMENT",
        uncertainty_classification: "LOW",
        dimension_coverage_ratio: 0.8,
        activity_coverage_ratio: 0.5,
        recommendation_category: "VALIDATED_STRONG_ALIGNMENT",
        rank: 1,
        key_strengths: ["Analytical Thinking"],
        primary_evidence_gaps: [
          {
            target_type: "COMPETENCY",
            target_key: "comp_analytical",
            target_title: "Analytical Thinking",
            gap_state: "DEMONSTRATED_GROWTH_AREA",
            demonstrated_level: 1.0,
            expected_level: 3.0,
            rationale: "Demonstrated Level 1 of 3.",
          },
        ],
      },
    ],
    growth_recommendations: [
      {
        career_id: CAREER_1_ID,
        career_title: "Data Scientist",
        source_fit_snapshot_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        source_competency_snapshot_id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
        recommendation_engine_version: "rec_engine_v1.0",
        gap_item: {
          target_type: "COMPETENCY",
          target_key: "comp_analytical",
          target_title: "Analytical Thinking",
          gap_state: "DEMONSTRATED_GROWTH_AREA",
          demonstrated_level: 1.0,
          expected_level: 3.0,
          rationale: "Demonstrated Level 1 of 3.",
        },
        next_action: {
          action_type: "TRIAL_MISSION",
          gap_key: "comp_analytical",
          target_career_id: CAREER_1_ID,
          suggested_mission_id: "99999999-9999-9999-9999-999999999999",
          suggested_mission_slug: "data-scientist-churn",
          suggested_mission_title: "Customer Churn Analysis",
          suggested_mission_version_id: "88888888-8888-8888-8888-888888888888",
          rationale: "Complete Customer Churn Analysis to gather evidence.",
        },
      },
    ],
    supporting_fit_snapshot_ids: ["eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"],
    generated_at: "2026-09-12T19:00:00Z",
    created_at: "2026-09-12T19:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. evaluateRecommendations sends POST to the correct endpoint", async () => {
    api.post.mockResolvedValueOnce(MOCK_SNAPSHOT_RESPONSE);

    const result = await evaluateRecommendations([CAREER_1_ID]);

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith(
      "/api/v1/decision-intelligence/recommendations/evaluate",
      { target_career_ids: [CAREER_1_ID] }
    );
    expect(result).toEqual(MOCK_SNAPSHOT_RESPONSE);
  });

  test("2. Request body contains ONLY target_career_ids", async () => {
    api.post.mockResolvedValueOnce(MOCK_SNAPSHOT_RESPONSE);

    await evaluateRecommendations([CAREER_1_ID, CAREER_2_ID]);

    const callArgs = api.post.mock.calls[0];
    const requestPayload = callArgs[1];

    expect(Object.keys(requestPayload)).toEqual(["target_career_ids"]);
    expect(requestPayload.target_career_ids).toEqual([CAREER_1_ID, CAREER_2_ID]);
  });

  test("3. getLatestRecommendation sends GET to the correct endpoint", async () => {
    api.get.mockResolvedValueOnce(MOCK_SNAPSHOT_RESPONSE);

    const result = await getLatestRecommendation();

    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(
      "/api/v1/decision-intelligence/recommendations/latest"
    );
    expect(result).toEqual(MOCK_SNAPSHOT_RESPONSE);
  });

  test("4. getRecommendationById sends GET with correctly encoded snapshot ID", async () => {
    api.get.mockResolvedValueOnce(MOCK_SNAPSHOT_RESPONSE);

    const result = await getRecommendationById(SNAPSHOT_ID);

    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith(
      `/api/v1/decision-intelligence/recommendations/${SNAPSHOT_ID}`
    );
    expect(result).toEqual(MOCK_SNAPSHOT_RESPONSE);
  });

  test("5. Successful responses are returned faithfully", async () => {
    api.post.mockResolvedValueOnce(MOCK_SNAPSHOT_RESPONSE);

    const result = await evaluateRecommendations([CAREER_1_ID]);

    expect(result.id).toBe(SNAPSHOT_ID);
    expect(result.recommendation_engine_version).toBe("rec_engine_v1.0");
    expect(result.ranked_career_candidates[0].recommendation_category).toBe(
      "VALIDATED_STRONG_ALIGNMENT"
    );
    expect(
      result.ranked_career_candidates[0].version_lineage.fit_algorithm_version
    ).toBe("fit_algo_v1.0");
  });

  test("6. 400 Bad Request error propagates to caller", async () => {
    const error400 = new Error("Duplicate career ID found");
    error400.status = 400;
    api.post.mockRejectedValueOnce(error400);

    await expect(
      evaluateRecommendations([CAREER_1_ID, CAREER_1_ID])
    ).rejects.toThrow("Duplicate career ID found");
  });

  test("7. 401 Unauthorized error propagates to caller", async () => {
    const error401 = new Error("Invalid authentication token credentials.");
    error401.status = 401;
    api.get.mockRejectedValueOnce(error401);

    await expect(getLatestRecommendation()).rejects.toThrow(
      "Invalid authentication token credentials."
    );
  });

  test("8. 404 Not Found error propagates to caller", async () => {
    const error404 = new Error("No recommendation snapshot found for this user.");
    error404.status = 404;
    api.get.mockRejectedValueOnce(error404);

    await expect(getLatestRecommendation()).rejects.toThrow(
      "No recommendation snapshot found for this user."
    );
  });

  test("9. 500 Internal Server Error propagates to caller", async () => {
    const error500 = new Error("Decision Intelligence taxonomy configuration error.");
    error500.status = 500;
    api.post.mockRejectedValueOnce(error500);

    await expect(evaluateRecommendations([CAREER_1_ID])).rejects.toThrow(
      "Decision Intelligence taxonomy configuration error."
    );
  });

  test("10. recommendation_engine_version is NOT sent in client request", async () => {
    api.post.mockResolvedValueOnce(MOCK_SNAPSHOT_RESPONSE);

    await decisionIntelligenceService.evaluateRecommendations([CAREER_1_ID]);

    const sentPayload = api.post.mock.calls[0][1];
    expect(sentPayload).not.toHaveProperty("recommendation_engine_version");
    expect(sentPayload).not.toHaveProperty("user_id");
    expect(sentPayload).not.toHaveProperty("fit_algorithm_version");
    expect(sentPayload).not.toHaveProperty("taxonomy_version");
  });
});
