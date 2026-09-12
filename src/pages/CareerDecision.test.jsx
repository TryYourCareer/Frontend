import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CareerDecision, {
  formatRecommendationCategory,
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

const MOCK_SNAPSHOT = {
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
      career_code: "cloud_architect",
      career_title: "Cloud Solutions Architect",
      rank: 2,
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

describe("Phase 15G-C1 — Career Decision Page Shell & Latest Snapshot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. Renders page title and header explanation with evidence-oriented language", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT);

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: /career decision/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/synthesizes empirical evidence from completed trial missions/i)).toBeInTheDocument();
    expect(screen.getByText(/do not represent personality profiles or guaranteed hiring outcomes/i)).toBeInTheDocument();
  });

  test("2. Successful latest snapshot renders candidates, metadata, and categories", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT);

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

  test("3. Displays loading skeleton while recommendation is in flight", () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockReturnValue(new Promise(() => {})); // pending

    render(<CareerDecision />);

    expect(screen.getByTestId("decision-loading-skeleton")).toBeInTheDocument();
  });

  test("4. Displays empty state when no recommendation snapshot exists (404 / null)", async () => {
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

    // Clicking Explore Trial Missions navigates to /trial-mission
    fireEvent.click(screen.getByRole("button", { name: /explore trial missions/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/trial-mission");
  });

  test("5. Displays error state on API failure and enables retry", async () => {
    const { getLatestRecommendation } = require("../services/decisionIntelligence");
    getLatestRecommendation.mockRejectedValueOnce(new Error("Network connection failure"));

    render(<CareerDecision />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-error-state")).toBeInTheDocument();
    });

    expect(screen.getByText(/failed to load recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/network connection failure/i)).toBeInTheDocument();

    // Retry calls API again
    getLatestRecommendation.mockResolvedValueOnce(MOCK_SNAPSHOT);
    fireEvent.click(screen.getByRole("button", { name: /retry evaluation/i }));

    await waitFor(() => {
      expect(screen.getByTestId("decision-snapshot-view")).toBeInTheDocument();
    });
  });

  test("6. Correctly renders null fit index as em dash without converting to 0 or 50", () => {
    expect(formatFitIndex(null)).toBe("—");
    expect(formatFitIndex(undefined)).toBe("—");
    expect(formatFitIndex(85.4)).toBe("85.4");
  });

  test("7. Correctly maps all four recommendation categories to user-facing labels", () => {
    expect(formatRecommendationCategory("VALIDATED_STRONG_ALIGNMENT")).toBe("Validated Strong Alignment");
    expect(formatRecommendationCategory("HIGH_POTENTIAL_EXPLORATORY")).toBe("High Potential (Exploratory)");
    expect(formatRecommendationCategory("DEVELOPING_TARGET")).toBe("Developing Target");
    expect(formatRecommendationCategory("EVIDENCE_DEFICIENT")).toBe("Evidence Deficient");
    expect(formatRecommendationCategory("UNKNOWN")).toBe("UNKNOWN");
  });
});
