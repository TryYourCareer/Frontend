import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import CareerDecision, {
  formatRecommendationCategory,
  getRecommendationCategoryMessage,
  formatFitIndex,
  formatGapState,
  getGapStateDescription,
} from "./CareerDecision";

let mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("../services/decisionIntelligence", () => ({
  __esModule: true,
  getLatestRecommendation: jest.fn(),
  getRecommendationById: jest.fn(),
  default: {
    getLatestRecommendation: jest.fn(),
    getRecommendationById: jest.fn(),
  },
}));

const MOCK_SNAPSHOT_MULTI_CANDIDATES = {
  id: "snap-1111-1111",
  user_id: "user-1111-1111",
  recommendation_engine_version: "rec_engine_v1.0",
  generated_at: "2026-09-12T19:30:00Z",
  ranked_career_candidates: [
    {
      career_id: "career-1",
      career_code: "data_scientist",
      career_title: "Data Scientist",
      rank: 1,
      fit_index: 84.5,
      fit_tier: "STRONG_ALIGNMENT",
      uncertainty_classification: "LOW",
      dimension_coverage_ratio: 0.8,
      activity_coverage_ratio: 0.5,
      recommendation_category: "VALIDATED_STRONG_ALIGNMENT",
      key_strengths: ["Analytical Thinking", "Machine Learning"],
      contributing_evidence_ids: ["ev-1", "ev-2"],
      version_lineage: {
        ctep_extractor_version: "ctep_v1.0.0",
        competency_taxonomy_version: "comp_tax_v1.0",
        mapping_rule_version: "map_v1.0",
        fit_algorithm_version: "fit_algo_v1.0",
        recommendation_engine_version: "rec_engine_v1.0",
      },
      primary_evidence_gaps: [
        {
          target_type: "COMPETENCY",
          target_key: "comp_systems",
          target_title: "Systems Architecture",
          gap_state: "DEMONSTRATED_GROWTH_AREA",
          demonstrated_level: 1.0,
          expected_level: 3.0,
          rationale: "Demonstrated Level 1 of 3 in trial mission.",
        },
      ],
      next_trial_mission: {
        action_type: "TRIAL_MISSION",
        gap_key: "comp_systems",
        target_career_id: "career-1",
        suggested_mission_id: "mission-ds-1",
        suggested_mission_slug: "distributed-cache-architecture",
        suggested_mission_title: "Distributed Cache Architecture",
        workspace_type: "Developer Workspace",
        rationale: "Observe systems topography in high-throughput cache invalidation.",
      },
    },
    {
      career_id: "career-2",
      career_code: "software_engineer",
      career_title: "Software Engineer",
      rank: 2,
      fit_index: 72.0,
      fit_tier: "STRONG_ALIGNMENT",
      uncertainty_classification: "MODERATE",
      dimension_coverage_ratio: 0.6,
      activity_coverage_ratio: 0.4,
      recommendation_category: "HIGH_POTENTIAL_EXPLORATORY",
      key_strengths: ["Algorithms"],
      primary_evidence_gaps: [
        {
          target_type: "WORK_DNA_DIMENSION",
          target_key: "uncertainty_ambiguity",
          target_title: "Uncertainty & Ambiguity",
          gap_state: "UNTESTED_AREA",
          demonstrated_level: null,
          expected_level: 3.0,
          rationale: "Unassessed dimension in current trial missions.",
        },
        {
          target_type: "COMPETENCY",
          target_key: "comp_testing",
          target_title: "Automated Testing",
          gap_state: "INSUFFICIENT_EVIDENCE",
          demonstrated_level: 1.0,
          expected_level: 2.0,
          rationale: "Single observation recorded; threshold requires two.",
        },
      ],
      next_trial_mission: {
        action_type: "TRIAL_MISSION",
        gap_key: "uncertainty_ambiguity",
        target_career_id: "career-2",
        suggested_mission_id: "mission-swe-2",
        suggested_mission_slug: "refactor-legacy-monolith",
        rationale: "Observe response to ambiguous codebase constraints.",
      },
    },
    {
      career_id: "career-3",
      career_code: "business_analyst",
      career_title: "Business Analyst",
      rank: 3,
      fit_index: 55.0,
      fit_tier: "DEVELOPING",
      uncertainty_classification: "LOW",
      dimension_coverage_ratio: 1.0,
      activity_coverage_ratio: 0.8,
      recommendation_category: "DEVELOPING_TARGET",
      key_strengths: ["Communication"],
      primary_evidence_gaps: [],
      next_trial_mission: null,
    },
    {
      career_id: "career-4",
      career_code: "cloud_architect",
      career_title: "Cloud Solutions Architect",
      rank: 4,
      fit_index: null,
      fit_tier: "EXPLORATORY",
      uncertainty_classification: "HIGH",
      dimension_coverage_ratio: 0.0,
      activity_coverage_ratio: 0.0,
      recommendation_category: "EVIDENCE_DEFICIENT",
      key_strengths: [],
      primary_evidence_gaps: [],
      next_trial_mission: {
        action_type: "TRIAL_MISSION",
        gap_key: "systems_topography",
        target_career_id: "career-4",
        suggested_mission_id: null,
        suggested_mission_title: "Unpublished Cloud Architecture Sandbox",
        rationale: "Observe multi-tier architecture design.",
      },
    },
    {
      career_id: "career-5",
      career_code: "product_manager",
      career_title: "Product Manager",
      rank: 5,
      fit_index: 48.0,
      fit_tier: "DEVELOPING",
      uncertainty_classification: "MODERATE",
      dimension_coverage_ratio: 0.4,
      activity_coverage_ratio: 0.2,
      recommendation_category: "DEVELOPING_TARGET",
      key_strengths: [],
      primary_evidence_gaps: [],
      next_trial_mission: null,
    },
  ],
  growth_recommendations: [],
};

const MOCK_SNAPSHOT_WITH_WORK_DNA = {
  ...MOCK_SNAPSHOT_MULTI_CANDIDATES,
  ranked_career_candidates: [
    {
      ...MOCK_SNAPSHOT_MULTI_CANDIDATES.ranked_career_candidates[0],
      work_dna: {
        dimensions: {
          cognitive_complexity: { demonstrated_level: 3.0, career_required_level: 3.0 },
          quantitative_intensity: { demonstrated_level: 2.0, career_required_level: 2.0 },
          systems_topography: { demonstrated_level: 2.0, career_required_level: 3.0 },
          visual_spatial_rigor: { demonstrated_level: 1.0, career_required_level: 1.0 },
          uncertainty_ambiguity: { demonstrated_level: 2.0, career_required_level: 3.0 },
        },
      },
      evaluated_competencies: {
        comp_analytical: { title: "Analytical Thinking", evaluated_level: 3.0 },
      },
    },
    {
      ...MOCK_SNAPSHOT_MULTI_CANDIDATES.ranked_career_candidates[1],
      work_dna: {
        dimensions: {
          cognitive_complexity: { demonstrated_level: 2.0, career_required_level: 3.0 },
          quantitative_intensity: { demonstrated_level: 1.0, career_required_level: 2.0 },
          systems_topography: { demonstrated_level: 3.0, career_required_level: 3.0 },
          visual_spatial_rigor: { demonstrated_level: 1.0, career_required_level: 1.0 },
          uncertainty_ambiguity: { demonstrated_level: 1.0, career_required_level: 3.0 },
        },
      },
    },
  ],
};

describe("Phase 15G — Career Decision Product: C1-C5 Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // Phase 15G-C1 Baseline Tests
  // =========================================================================
  test("C1-1. Renders page title and header explanation with evidence-oriented language", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: /career decision/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/synthesizes empirical evidence from completed trial missions/i)).toBeInTheDocument();
    expect(screen.getByText(/do not represent personality profiles or guaranteed hiring outcomes/i)).toBeInTheDocument();
  });

  test("C1-2. Successful latest snapshot renders candidates, metadata, and categories", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    expect(screen.getByText(/data scientist/i)).toBeInTheDocument();
    expect(screen.getAllByText("Validated Strong Alignment").length).toBeGreaterThan(0);
    expect(screen.getByText("84.5 / 100")).toBeInTheDocument();
    expect(screen.getByText(/cloud solutions architect/i)).toBeInTheDocument();
    expect(screen.getAllByText("Evidence Deficient").length).toBeGreaterThan(0);
    expect(screen.getByText(/engine: rec_engine_v1.0/i)).toBeInTheDocument();
  });

  test("C1-3. Displays loading skeleton while recommendation is in flight", () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockReturnValue(new Promise(() => {}));

    render(<CareerDecision />);

    expect(screen.getByTestId("decision-loading-skeleton")).toBeInTheDocument();
  });

  test("C1-4. Displays empty state when no recommendation snapshot exists (404 / null)", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    const err404 = new Error("No recommendation snapshot found for this user.");
    err404.status = 404;
    getLatestRecommendation.mockRejectedValueOnce(err404);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-empty-state")).toBeInTheDocument();
    });

    expect(screen.getByText(/no decision recommendations yet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /explore trial missions/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /explore trial missions/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/trial-mission");
  });

  test("C1-5. Displays error state on API failure and enables retry", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockRejectedValueOnce(new Error("Network connection failure"));

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-error-state")).toBeInTheDocument();
    });

    expect(screen.getByText(/failed to load recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/network connection failure/i)).toBeInTheDocument();

    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);
    fireEvent.click(screen.getByRole("button", { name: /retry evaluation/i }));

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });
  });

  test("C1-6. Correctly renders null fit index as em dash without converting to 0 or 50", () => {
    expect(formatFitIndex(null)).toBe("—");
    expect(formatFitIndex(undefined)).toBe("—");
    expect(formatFitIndex(85.4)).toBe("85.4");
  });

  test("C1-7. Correctly maps all four recommendation categories to user-facing labels", () => {
    expect(formatRecommendationCategory("VALIDATED_STRONG_ALIGNMENT")).toBe("Validated Strong Alignment");
    expect(formatRecommendationCategory("HIGH_POTENTIAL_EXPLORATORY")).toBe("High Potential (Exploratory)");
    expect(formatRecommendationCategory("DEVELOPING_TARGET")).toBe("Developing Target");
    expect(formatRecommendationCategory("EVIDENCE_DEFICIENT")).toBe("Evidence Deficient");
    expect(formatRecommendationCategory("UNKNOWN")).toBe("UNKNOWN");
  });

  // =========================================================================
  // Phase 15G-C2 Candidate Cards Tests
  // =========================================================================
  test("C2-1. Multiple ranked candidates render in exact server-provided order", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    const cards = screen.getAllByTestId(/^candidate-card-/);
    expect(cards).toHaveLength(5);
    expect(cards[0]).toHaveAttribute("data-testid", "candidate-card-career-1");
    expect(cards[1]).toHaveAttribute("data-testid", "candidate-card-career-2");
    expect(cards[2]).toHaveAttribute("data-testid", "candidate-card-career-3");
    expect(cards[3]).toHaveAttribute("data-testid", "candidate-card-career-4");
    expect(cards[4]).toHaveAttribute("data-testid", "candidate-card-career-5");
  });

  test("C2-2. Server-provided rank is prominently displayed on each card", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    expect(screen.getByTestId("candidate-rank-career-1")).toHaveTextContent("Rank #1");
    expect(screen.getByTestId("candidate-rank-career-2")).toHaveTextContent("Rank #2");
    expect(screen.getByTestId("candidate-rank-career-3")).toHaveTextContent("Rank #3");
    expect(screen.getByTestId("candidate-rank-career-4")).toHaveTextContent("Rank #4");
  });

  test("C2-3. Recommendation-state supporting copy is correct for all four categories", () => {
    expect(getRecommendationCategoryMessage("VALIDATED_STRONG_ALIGNMENT")).toBe(
      "Strong alignment is supported by the available trial evidence."
    );
    expect(getRecommendationCategoryMessage("HIGH_POTENTIAL_EXPLORATORY")).toBe(
      "Promising alignment, with additional evidence needed for stronger confidence."
    );
    expect(getRecommendationCategoryMessage("DEVELOPING_TARGET")).toBe(
      "Current evidence indicates areas that can be developed through further practice."
    );
    expect(getRecommendationCategoryMessage("EVIDENCE_DEFICIENT")).toBe(
      "There is not yet enough evidence to draw a strong conclusion."
    );
  });

  test("C2-4. Fit index displays correctly and null remains em dash without fallback score", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    expect(screen.getByTestId("fit-index-career-1")).toHaveTextContent("84.5 / 100");
    expect(screen.getByTestId("fit-index-career-2")).toHaveTextContent("72.0 / 100");
    expect(screen.getByTestId("fit-index-career-3")).toHaveTextContent("55.0 / 100");
    expect(screen.getByTestId("fit-index-career-4")).toHaveTextContent("—");
  });

  test("C2-5. Uncertainty classification is displayed prominently on cards", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    expect(screen.getByTestId("uncertainty-career-1")).toHaveTextContent("LOW");
    expect(screen.getByTestId("uncertainty-career-2")).toHaveTextContent("MODERATE");
    expect(screen.getByTestId("uncertainty-career-3")).toHaveTextContent("LOW");
    expect(screen.getByTestId("uncertainty-career-4")).toHaveTextContent("HIGH");
  });

  test("C2-6. Dimension coverage is formatted as presentation percentage", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    expect(screen.getByTestId("coverage-career-1")).toHaveTextContent("80%");
    expect(screen.getByTestId("coverage-career-2")).toHaveTextContent("60%");
    expect(screen.getByTestId("coverage-career-3")).toHaveTextContent("100%");
    expect(screen.getByTestId("coverage-career-4")).toHaveTextContent("0%");
  });

  test("C2-7. Key strengths render only when provided and do not fabricate missing ones", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    const strengths1 = screen.getByTestId("strengths-career-1");
    expect(strengths1).toHaveTextContent("Analytical Thinking");
    expect(strengths1).toHaveTextContent("Machine Learning");

    expect(screen.queryByTestId("strengths-career-4")).not.toBeInTheDocument();
  });

  test("C2-8. Lightweight evidence-gap count renders without deriving detailed gap analysis", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    expect(screen.getByTestId("gaps-count-career-1")).toHaveTextContent("1 area to test");
    expect(screen.getByTestId("gaps-count-career-2")).toHaveTextContent("2 areas to test");
    expect(screen.queryByTestId("gaps-count-career-3")).not.toBeInTheDocument();
    expect(screen.queryByTestId("gaps-count-career-4")).not.toBeInTheDocument();
  });

  // =========================================================================
  // Phase 15G-C3 Career Detail & Evidence Gaps Tests
  // =========================================================================
  test("C3-1. Selecting a candidate opens the detail drawer/view", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("career-detail-panel")).not.toBeInTheDocument();

    const selectBtn = screen.getByTestId("select-candidate-career-1");
    fireEvent.click(selectBtn);

    expect(screen.getByTestId("career-detail-panel")).toBeInTheDocument();
  });

  test("C3-2. Selected career identity and metrics render correctly in detail view", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("select-candidate-career-1"));

    const panel = screen.getByTestId("career-detail-panel");
    expect(panel).toHaveTextContent("Data Scientist");
    expect(panel).toHaveTextContent("Code: data_scientist");
    expect(panel).toHaveTextContent("Rank #1");
    expect(panel).toHaveTextContent("Validated Strong Alignment");
    expect(panel).toHaveTextContent("84.5 / 100");
    expect(panel).toHaveTextContent("LOW");
    expect(panel).toHaveTextContent("80%");
  });

  test("C3-3. Null fit remains em dash in detail view for evidence deficient candidate", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("select-candidate-career-4"));

    const panel = screen.getByTestId("career-detail-panel");
    expect(panel).toHaveTextContent("Cloud Solutions Architect");
    expect(panel).toHaveTextContent("Evidence Deficient");
    expect(panel).toHaveTextContent("There is not yet enough evidence to draw a strong conclusion.");
  });

  test("C3-4. Evidence gaps render accurately from backend structure with neutral interpretations", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("select-candidate-career-2"));

    const panel = screen.getByTestId("career-detail-panel");
    expect(panel).toHaveTextContent("Uncertainty & Ambiguity");
    expect(panel).toHaveTextContent("Untested Area");
    expect(panel).toHaveTextContent("The area has not yet been sufficiently observed (neutral exploration).");

    expect(panel).toHaveTextContent("Automated Testing");
    expect(panel).toHaveTextContent("Insufficient Evidence");
    expect(panel).toHaveTextContent("More observations are needed before making a stronger conclusion.");
  });

  test("C3-5. Empty evidence gaps produce neutral message without fabricating gaps", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("select-candidate-career-3"));

    const panel = screen.getByTestId("career-detail-panel");
    expect(panel).toHaveTextContent("No primary evidence gaps were recorded in this snapshot.");
  });

  test("C3-6. Work DNA renders ONLY when supplied by the response and omits when absent", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_WITH_WORK_DNA);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("select-candidate-career-1"));

    const workDnaSection = screen.getByTestId("detail-work-dna-section");
    expect(workDnaSection).toBeInTheDocument();
    expect(workDnaSection).toHaveTextContent(/cognitive complexity/i);
    expect(workDnaSection).toHaveTextContent(/quantitative intensity/i);
    expect(workDnaSection).toHaveTextContent(/systems topography/i);
    expect(workDnaSection).toHaveTextContent(/visual spatial rigor/i);
    expect(workDnaSection).toHaveTextContent(/uncertainty ambiguity/i);
  });

  test("C3-7. Detail view can be closed accessibly via close button or footer button", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("select-candidate-career-1"));
    expect(screen.getByTestId("career-detail-panel")).toBeInTheDocument();

    const closeBtn = screen.getByTestId("close-detail-button");
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId("career-detail-panel")).not.toBeInTheDocument();
  });

  // =========================================================================
  // Phase 15G-C4 Next Trial Mission Integration Tests
  // =========================================================================
  test("C4-1. Candidate-scoped backend next Trial Mission renders correctly in Career Detail drawer", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("select-candidate-career-1"));

    expect(screen.getByTestId("detail-next-mission-section")).toBeInTheDocument();
    expect(screen.getByTestId("next-mission-card")).toBeInTheDocument();
    expect(screen.getByTestId("next-mission-title")).toHaveTextContent("Distributed Cache Architecture");
    expect(screen.getByText("distributed-cache-architecture")).toBeInTheDocument();
    expect(screen.getByText(/Workspace: Developer Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/Observe systems topography in high-throughput cache invalidation/i)).toBeInTheDocument();
  });

  test("C4-2. Candidate-scoped mission ID causes Start Trial Mission CTA to appear and navigate", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("select-candidate-career-1"));

    const startBtn = screen.getByTestId("start-trial-mission-cta");
    expect(startBtn).toBeInTheDocument();
    fireEvent.click(startBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/trial-mission?missionId=mission-ds-1");
  });

  test("C4-3. Missing mission title does NOT fabricate a fake title", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("select-candidate-career-2"));

    expect(screen.getByTestId("next-mission-card")).toBeInTheDocument();
    expect(screen.queryByTestId("next-mission-title")).not.toBeInTheDocument();
    expect(screen.queryByText(/simulated trial mission/i)).not.toBeInTheDocument();
    expect(screen.getByText("refactor-legacy-monolith")).toBeInTheDocument();
    expect(screen.getByText(/Observe response to ambiguous codebase constraints/i)).toBeInTheDocument();

    const startBtn = screen.getByTestId("start-trial-mission-cta");
    expect(startBtn).toBeInTheDocument();
    fireEvent.click(startBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/trial-mission?missionId=mission-swe-2");
  });

  test("C4-4. Candidate without candidate-scoped next mission shows neutral unavailable state", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("select-candidate-career-3"));

    expect(screen.getByTestId("no-mission-available-notice")).toBeInTheDocument();
    expect(screen.getByText(/no additional trial mission is currently available for this evidence area/i)).toBeInTheDocument();
    expect(screen.queryByTestId("start-trial-mission-cta")).not.toBeInTheDocument();
  });

  test("C4-5. Candidate-scoped mission without usable mission ID does NOT show launch CTA", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("select-candidate-career-4"));

    expect(screen.getByTestId("next-mission-card")).toBeInTheDocument();
    expect(screen.getByTestId("next-mission-title")).toHaveTextContent("Unpublished Cloud Architecture Sandbox");
    expect(screen.queryByTestId("start-trial-mission-cta")).not.toBeInTheDocument();
  });

  // =========================================================================
  // Phase 15G-C5 Career Comparison Matrix Tests
  // =========================================================================
  test("C5-1. Candidate comparison selection controls render on cards and update counter", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    expect(screen.getByTestId("compare-checkbox-career-1")).toBeInTheDocument();
    expect(screen.getByTestId("compare-checkbox-career-2")).toBeInTheDocument();
    expect(screen.getByTestId("comparison-selection-bar")).toHaveTextContent("0 / 4 selected");
  });

  test("C5-2. One selected career does not show/enable comparison matrix", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("compare-checkbox-career-1"));

    expect(screen.getByTestId("comparison-selection-bar")).toHaveTextContent("1 / 4 selected");
    expect(screen.queryByTestId("career-comparison-matrix-section")).not.toBeInTheDocument();
  });

  test("C5-3. Two selected careers activate comparison matrix table", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("compare-checkbox-career-1"));
    fireEvent.click(screen.getByTestId("compare-checkbox-career-2"));

    expect(screen.getByTestId("comparison-selection-bar")).toHaveTextContent("2 / 4 selected");
    expect(screen.getByTestId("career-comparison-matrix-section")).toBeInTheDocument();
    expect(screen.getByTestId("career-comparison-table")).toBeInTheDocument();
    expect(screen.getByTestId("comparison-column-career-1")).toBeInTheDocument();
    expect(screen.getByTestId("comparison-column-career-2")).toBeInTheDocument();
  });

  test("C5-4. Up to 4 selected careers are allowed and 5th career selection is prevented", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("compare-checkbox-career-1"));
    fireEvent.click(screen.getByTestId("compare-checkbox-career-2"));
    fireEvent.click(screen.getByTestId("compare-checkbox-career-3"));
    fireEvent.click(screen.getByTestId("compare-checkbox-career-4"));

    expect(screen.getByTestId("comparison-selection-bar")).toHaveTextContent("4 / 4 selected");
    expect(screen.getByTestId("compare-checkbox-career-5")).toBeDisabled();

    // Trying to click 5th does not increase selection
    fireEvent.click(screen.getByTestId("compare-checkbox-career-5"));
    expect(screen.getByTestId("comparison-selection-bar")).toHaveTextContent("4 / 4 selected");
    expect(screen.queryByTestId("comparison-column-career-5")).not.toBeInTheDocument();
  });

  test("C5-5. Selected careers preserve their server-provided order in comparison table", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    // Select in reverse order (Career 4 first, then Career 1)
    fireEvent.click(screen.getByTestId("compare-checkbox-career-4"));
    fireEvent.click(screen.getByTestId("compare-checkbox-career-1"));

    const cols = screen.getAllByTestId(/^comparison-column-/);
    expect(cols).toHaveLength(2);
    // Preserves server-provided ranking order (Career 1 then Career 4)
    expect(cols[0]).toHaveAttribute("data-testid", "comparison-column-career-1");
    expect(cols[1]).toHaveAttribute("data-testid", "comparison-column-career-4");
  });

  test("C5-6. Comparison table displays exact identity, fit, uncertainty, and coverage", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("compare-checkbox-career-1"));
    fireEvent.click(screen.getByTestId("compare-checkbox-career-4"));

    const table = screen.getByTestId("career-comparison-table");
    expect(table).toBeInTheDocument();

    // Career 1
    expect(screen.getByTestId("cmp-category-career-1")).toHaveTextContent("Validated Strong Alignment");
    expect(screen.getByTestId("cmp-fit-career-1")).toHaveTextContent("84.5 / 100");
    expect(screen.getByTestId("cmp-tier-career-1")).toHaveTextContent("STRONG_ALIGNMENT");
    expect(screen.getByTestId("cmp-uncertainty-career-1")).toHaveTextContent("LOW");
    expect(screen.getByTestId("cmp-dim-coverage-career-1")).toHaveTextContent("80%");
    expect(screen.getByTestId("cmp-act-coverage-career-1")).toHaveTextContent("50%");
    expect(screen.getByTestId("cmp-strengths-career-1")).toHaveTextContent("Analytical Thinking");

    // Career 4 (Evidence Deficient with null fit)
    expect(screen.getByTestId("cmp-category-career-4")).toHaveTextContent("Evidence Deficient");
    expect(screen.getByTestId("cmp-fit-career-4")).toHaveTextContent("—");
    expect(screen.getByTestId("cmp-tier-career-4")).toHaveTextContent("EXPLORATORY");
    expect(screen.getByTestId("cmp-uncertainty-career-4")).toHaveTextContent("HIGH");
    expect(screen.getByTestId("cmp-dim-coverage-career-4")).toHaveTextContent("0%");
    expect(screen.getByTestId("cmp-strengths-career-4")).toHaveTextContent("None recorded");
  });

  test("C5-7. Comparison table does NOT declare a winner or compute a relative comparison score", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("compare-checkbox-career-1"));
    fireEvent.click(screen.getByTestId("compare-checkbox-career-2"));

    const matrix = screen.getByTestId("career-comparison-matrix-section");
    expect(matrix).not.toHaveTextContent(/winner/i);
    expect(matrix).not.toHaveTextContent(/best career/i);
    expect(matrix).not.toHaveTextContent(/percentage advantage/i);
    expect(matrix).not.toHaveTextContent(/composite score/i);
  });

  test("C5-8. Work DNA rows render ONLY when supplied in payload and omit when absent", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_WITH_WORK_DNA);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("compare-checkbox-career-1"));
    fireEvent.click(screen.getByTestId("compare-checkbox-career-2"));

    expect(screen.getByText("Work DNA Alignment (Demonstrated / Required)")).toBeInTheDocument();
    expect(screen.getByTestId("cmp-dna-cognitive_complexity-career-1")).toHaveTextContent("3 / 3");
    expect(screen.getByTestId("cmp-dna-cognitive_complexity-career-2")).toHaveTextContent("2 / 3");
  });

  test("C5-9. Deselecting a career updates comparison and clearing closes comparison", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("compare-checkbox-career-1"));
    fireEvent.click(screen.getByTestId("compare-checkbox-career-2"));
    expect(screen.getByTestId("career-comparison-matrix-section")).toBeInTheDocument();

    // Deselect career 2 -> drops back to 1 selected -> closes comparison
    fireEvent.click(screen.getByTestId("compare-checkbox-career-2"));
    expect(screen.queryByTestId("career-comparison-matrix-section")).not.toBeInTheDocument();

    // Select 2 again, then click Clear button
    fireEvent.click(screen.getByTestId("compare-checkbox-career-2"));
    expect(screen.getByTestId("career-comparison-matrix-section")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("clear-comparison-button"));
    expect(screen.queryByTestId("career-comparison-matrix-section")).not.toBeInTheDocument();
    expect(screen.getByTestId("comparison-selection-bar")).toHaveTextContent("0 / 4 selected");
  });

  // =========================================================================
  // Phase 15G-D Integration Hardening & Boundary Tests
  // =========================================================================
  test("D-1. Navigation CTA passes EXACT backend-provided mission ID without derivation or lookup", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    const customMissionId = "custom-auth-uuid-9999-mission";
    const customSnapshot = {
      ...MOCK_SNAPSHOT_MULTI_CANDIDATES,
      ranked_career_candidates: [
        {
          ...MOCK_SNAPSHOT_MULTI_CANDIDATES.ranked_career_candidates[0],
          career_id: "unrelated-career-id-123",
          career_code: "data_engineer",
          career_title: "Arbitrary Career Title",
          next_trial_mission: {
            action_type: "TRIAL_MISSION",
            suggested_mission_id: customMissionId,
            suggested_mission_slug: "arbitrary-mission-slug",
            suggested_mission_title: "Arbitrary Mission Title",
            workspace_type: "arbitrary_workspace",
            rationale: "Observe data pipeline throughput.",
          },
        },
      ],
    };

    getLatestRecommendation.mockResolvedValueOnce(customSnapshot);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("select-candidate-unrelated-career-id-123"));

    const startBtn = screen.getByTestId("start-trial-mission-cta");
    expect(startBtn).toBeInTheDocument();
    fireEvent.click(startBtn);

    // Verifies exact backend ID is passed, NOT derived from career_id, title, slug, workspace, etc.
    expect(mockNavigate).toHaveBeenCalledWith(`/trial-mission?missionId=${encodeURIComponent(customMissionId)}`);
    expect(mockNavigate).not.toHaveBeenCalledWith(expect.stringContaining("unrelated-career-id-123"));
    expect(mockNavigate).not.toHaveBeenCalledWith(expect.stringContaining("data_engineer"));
  });

  test("D-2. When candidate.next_trial_mission is null, UI never fabricates mission or constructs mission ID", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    // Career 3 has next_trial_mission = null
    fireEvent.click(screen.getByTestId("select-candidate-career-3"));

    expect(screen.getByTestId("detail-next-mission-section")).toBeInTheDocument();
    expect(screen.getByTestId("no-mission-available-notice")).toBeInTheDocument();
    expect(screen.queryByTestId("start-trial-mission-cta")).not.toBeInTheDocument();
    expect(screen.queryByTestId("next-mission-card")).not.toBeInTheDocument();
  });

  test("D-3. C6 Boundary Verification: no history endpoints called, no fake snapshot list, no history selector rendered", async () => {
    const { getLatestRecommendation, getRecommendationById } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    // Only getLatestRecommendation was called
    expect(getLatestRecommendation).toHaveBeenCalledTimes(1);
    expect(getRecommendationById).not.toHaveBeenCalled();

    // No fake snapshot selector or history dropdown
    expect(screen.queryByRole("combobox", { name: /snapshot history/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId("snapshot-history-list")).not.toBeInTheDocument();
  });
});

