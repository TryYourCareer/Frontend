const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

jest.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user_123", email: "student@example.com" },
    profile: { name: "Alex Explorer", current_education: "High School" },
    loading: false,
  }),
}));

jest.mock("../services/users", () => ({
  getUserProfile: jest.fn().mockResolvedValue({ name: "Alex Explorer" }),
}));

jest.mock("../services/discoveryTest", () => ({
  getCareerFitReport: jest.fn().mockResolvedValue(null),
}));

jest.mock("../services/decisionIntelligence", () => ({
  getLatestRecommendation: jest.fn(),
}));

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import StudentDashboard from "./StudentDashboard";
import { getLatestRecommendation } from "../services/decisionIntelligence";

describe("StudentDashboard — Decision Reports Widget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  test("1. renders empty state when no completed reports exist", async () => {
    getLatestRecommendation.mockResolvedValue({ ranked_career_candidates: [] });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("dashboard-decision-reports-section")).toBeInTheDocument();
      expect(screen.getByTestId("dashboard-reports-empty-state")).toBeInTheDocument();
      expect(screen.getByText("No Completed Decision Reports Yet")).toBeInTheDocument();
    });

    const startBtn = screen.getByTestId("start-trial-from-empty-reports");
    fireEvent.click(startBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/trial-mission");
  });

  test("2. renders single completed decision report and navigates to correct report route", async () => {
    getLatestRecommendation.mockResolvedValue({
      ranked_career_candidates: [
        {
          career_id: "software-engineer",
          career_title: "Software Engineer",
          recommendation_category: "PRIMARY_RECOMMENDATION",
          fit_index: 92,
          fit_tier: "HIGH_FIT",
          rationale_summary: "Robust logic and systems modeling evidence from simulation.",
        },
      ],
    });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("dashboard-report-card-software-engineer")).toBeInTheDocument();
      expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      expect(screen.getByText("92% Fit")).toBeInTheDocument();
      expect(screen.getByText("PRIMARY RECOMMENDATION")).toBeInTheDocument();
    });

    const viewBtn = screen.getByTestId("view-decision-report-software-engineer");
    fireEvent.click(viewBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/careers/software-engineer/decision-report");
  });

  test("3. renders multiple completed reports without bias or altered ranking", async () => {
    getLatestRecommendation.mockResolvedValue({
      ranked_career_candidates: [
        {
          career_id: "bioprocess-engineer",
          career_title: "Bioprocess Engineer",
          recommendation_category: "PRIMARY_RECOMMENDATION",
          fit_index: 88,
          fit_tier: "HIGH_FIT",
        },
        {
          career_id: "data-scientist",
          career_title: "Data Scientist",
          recommendation_category: "STRONG_FIT",
          fit_index: 84,
          fit_tier: "STRONG_FIT",
        },
      ],
    });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("dashboard-report-card-bioprocess-engineer")).toBeInTheDocument();
      expect(screen.getByTestId("dashboard-report-card-data-scientist")).toBeInTheDocument();
      expect(screen.getByText("Bioprocess Engineer")).toBeInTheDocument();
      expect(screen.getByText("Data Scientist")).toBeInTheDocument();
    });
  });

  test("4. handles API error gracefully and falls back without breaking dashboard", async () => {
    getLatestRecommendation.mockRejectedValue(new Error("Network failure"));

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("dashboard-decision-reports-section")).toBeInTheDocument();
      expect(screen.getByTestId("dashboard-reports-empty-state")).toBeInTheDocument();
    });
  });
});
