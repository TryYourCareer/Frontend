import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CareerDecision, {
  formatRecommendationCategory,
  getRecommendationCategoryMessage,
  formatFitIndex,
} from "./CareerDecision";

let mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("../services/decisionIntelligence", () => ({
  __esModule: true,
  getLatestRecommendation: jest.fn(),
  default: {
    getLatestRecommendation: jest.fn(),
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
      primary_evidence_gaps: [
        {
          target_type: "COMPETENCY",
          target_key: "comp_systems",
          target_title: "Systems Architecture",
          gap_state: "DEMONSTRATED_GROWTH_AREA",
          demonstrated_level: 1.0,
          expected_level: 3.0,
          rationale: "Demonstrated Level 1 of 3.",
        },
      ],
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
          rationale: "Unassessed dimension.",
        },
        {
          target_type: "COMPETENCY",
          target_key: "comp_testing",
          target_title: "Automated Testing",
          gap_state: "DEMONSTRATED_GROWTH_AREA",
          demonstrated_level: 1.0,
          expected_level: 3.0,
          rationale: "Demonstrated Level 1 of 3.",
        },
      ],
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
      primary_evidence_gaps: [
        {
          target_type: "COMPETENCY",
          target_key: "comp_quant",
          target_title: "Quantitative Modeling",
          gap_state: "DEMONSTRATED_GROWTH_AREA",
          demonstrated_level: 1.0,
          expected_level: 3.0,
          rationale: "Demonstrated Level 1 of 3.",
        },
      ],
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
    },
  ],
};

describe("Phase 15G-C1 & Phase 15G-C2 — Career Decision Page & Candidate Cards", () => {
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
    expect(screen.getByText("Validated Strong Alignment")).toBeInTheDocument();
    expect(screen.getByText("84.5 / 100")).toBeInTheDocument();
    expect(screen.getByText(/cloud solutions architect/i)).toBeInTheDocument();
    expect(screen.getByText("Evidence Deficient")).toBeInTheDocument();
    expect(screen.getByText(/engine: rec_engine_v1.0/i)).toBeInTheDocument();
  });

  test("C1-3. Displays loading skeleton while recommendation is in flight", () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockReturnValue(new Promise(() => {})); // pending

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
  // Phase 15G-C2 Candidate Cards & Recommendation States Tests
  // =========================================================================
  test("C2-1. Multiple ranked candidates render in exact server-provided order", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT_MULTI_CANDIDATES);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });

    const cards = screen.getAllByTestId(/^candidate-card-/);
    expect(cards).toHaveLength(4);
    expect(cards[0]).toHaveAttribute("data-testid", "candidate-card-career-1");
    expect(cards[1]).toHaveAttribute("data-testid", "candidate-card-career-2");
    expect(cards[2]).toHaveAttribute("data-testid", "candidate-card-career-3");
    expect(cards[3]).toHaveAttribute("data-testid", "candidate-card-career-4");
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

    // Career 4 has empty strengths -> no strengths pill container
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
    expect(screen.getByTestId("gaps-count-career-3")).toHaveTextContent("1 area to test");
    expect(screen.queryByTestId("gaps-count-career-4")).not.toBeInTheDocument();
  });
});
