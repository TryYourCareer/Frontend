import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ReportsHub from "./ReportsHub";
import { getLatestRecommendation } from "../services/decisionIntelligence";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

jest.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user_123", email: "student@example.com" },
    profile: { name: "Alex Explorer" },
    loading: false,
  }),
}));

jest.mock("../services/decisionIntelligence", () => ({
  getLatestRecommendation: jest.fn(),
}));

describe("ReportsHub — Report Engine Hub", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. renders loading state initially", () => {
    getLatestRecommendation.mockReturnValue(new Promise(() => {})); // Never resolves

    render(<ReportsHub />);

    expect(screen.getByTestId("reports-hub-container")).toBeInTheDocument();
    expect(screen.getByTestId("reports-hub-loading")).toBeInTheDocument();
  });

  test("2. renders empty state when no reports are available with action CTAs", async () => {
    getLatestRecommendation.mockResolvedValue({
      ranked_career_candidates: [],
    });

    render(<ReportsHub />);

    await waitFor(() => {
      expect(screen.getByTestId("reports-hub-empty-state")).toBeInTheDocument();
      expect(screen.getByText("No Decision Reports Yet")).toBeInTheDocument();
    });

    const discoveryBtn = screen.getByTestId("empty-state-discovery-btn");
    fireEvent.click(discoveryBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/assessment");

    const exploreBtn = screen.getByTestId("empty-state-explore-btn");
    fireEvent.click(exploreBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/career-reality");
  });

  test("3. renders reports list correctly when candidates are available", async () => {
    getLatestRecommendation.mockResolvedValue({
      ranked_career_candidates: [
        {
          career_id: "c1-typography-designer",
          career_title: "Typography Designer",
          recommendation_category: "DEVELOPING_TARGET",
          fit_tier: "EXPLORATORY",
          fit_index: 33.33,
          rationale_summary: "Shows artistic flair and typography precision.",
        },
        {
          career_id: "c2-vfx-artist",
          career_title: "VFX Artist",
          recommendation_category: "STRONG_MATCH",
          fit_tier: "TARGET",
          fit_index: 85.0,
          rationale_summary: "High 3D modeling precision.",
        },
      ],
    });

    render(<ReportsHub />);

    await waitFor(() => {
      expect(screen.getByTestId("reports-hub-grid")).toBeInTheDocument();
      expect(screen.getByText("Typography Designer")).toBeInTheDocument();
      expect(screen.getByText("VFX Artist")).toBeInTheDocument();
      expect(screen.getByText("DEVELOPING TARGET")).toBeInTheDocument();
      expect(screen.getByText("33% Fit")).toBeInTheDocument();
      expect(screen.getByText("85% Fit")).toBeInTheDocument();
    });
  });

  test("4. navigates to Decision Report when 'View Decision Report' is clicked", async () => {
    getLatestRecommendation.mockResolvedValue({
      ranked_career_candidates: [
        {
          career_id: "2e21227e-1bbb-4c51-9c36-c4c4d6313a76",
          career_title: "Typography Designer",
          recommendation_category: "DEVELOPING_TARGET",
          fit_index: 33.33,
        },
      ],
    });

    render(<ReportsHub />);

    await waitFor(() => {
      expect(
        screen.getByTestId("view-decision-report-2e21227e-1bbb-4c51-9c36-c4c4d6313a76")
      ).toBeInTheDocument();
    });

    const viewBtn = screen.getByTestId("view-decision-report-2e21227e-1bbb-4c51-9c36-c4c4d6313a76");
    fireEvent.click(viewBtn);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/careers/2e21227e-1bbb-4c51-9c36-c4c4d6313a76/decision-report"
    );
  });

  test("5. navigates to Parent Report when Parent Report button is clicked", async () => {
    getLatestRecommendation.mockResolvedValue({
      ranked_career_candidates: [
        {
          career_id: "2e21227e-1bbb-4c51-9c36-c4c4d6313a76",
          career_title: "Typography Designer",
          recommendation_category: "DEVELOPING_TARGET",
          fit_index: 33.33,
        },
      ],
    });

    render(<ReportsHub />);

    await waitFor(() => {
      expect(
        screen.getByTestId("view-parent-report-2e21227e-1bbb-4c51-9c36-c4c4d6313a76")
      ).toBeInTheDocument();
    });

    const parentBtn = screen.getByTestId("view-parent-report-2e21227e-1bbb-4c51-9c36-c4c4d6313a76");
    fireEvent.click(parentBtn);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/careers/2e21227e-1bbb-4c51-9c36-c4c4d6313a76/parent-report"
    );
  });

  test("6. filters reports dynamically when searching", async () => {
    getLatestRecommendation.mockResolvedValue({
      ranked_career_candidates: [
        {
          career_id: "c1",
          career_title: "Typography Designer",
          recommendation_category: "DEVELOPING_TARGET",
        },
        {
          career_id: "c2",
          career_title: "VFX Artist",
          recommendation_category: "STRONG_MATCH",
        },
      ],
    });

    render(<ReportsHub />);

    await waitFor(() => {
      expect(screen.getByText("Typography Designer")).toBeInTheDocument();
      expect(screen.getByText("VFX Artist")).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId("reports-hub-search-input");
    fireEvent.change(searchInput, { target: { value: "Typography" } });

    expect(screen.getByText("Typography Designer")).toBeInTheDocument();
    expect(screen.queryByText("VFX Artist")).not.toBeInTheDocument();
  });

  test("7. renders error state and allows retry", async () => {
    getLatestRecommendation.mockRejectedValueOnce(new Error("Server error"));

    render(<ReportsHub />);

    await waitFor(() => {
      expect(screen.getByTestId("reports-hub-error")).toBeInTheDocument();
      expect(screen.getByText("Failed to Load Reports")).toBeInTheDocument();
    });

    getLatestRecommendation.mockResolvedValueOnce({
      ranked_career_candidates: [
        {
          career_id: "c1",
          career_title: "Recovered Career",
        },
      ],
    });

    const retryBtn = screen.getByTestId("reports-hub-retry-btn");
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText("Recovered Career")).toBeInTheDocument();
    });
  });
});
