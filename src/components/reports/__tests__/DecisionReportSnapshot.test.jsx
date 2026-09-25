import React from "react";
import { render, screen } from "@testing-library/react";
import DecisionReportSnapshot, { FitScoreRing } from "../DecisionReportSnapshot";

describe("DecisionReportSnapshot & FitScoreRing", () => {
  const fullSnapshot = {
    career_name: "Bioprocess Engineer",
    one_liner: "Design and optimize industrial biological manufacturing systems.",
    recommendation_category: "STRONG_FIT",
    fit_index: 88.5,
    fit_tier: "HIGH_FIT",
    uncertainty: "LOW",
    exploration_maturity: "COMPLETED",
  };

  const metadata = {
    report_version: 2,
    generated_at: "2026-02-15T10:00:00Z",
  };

  test("1. Fit ring renders with a valid score and SVG element exists", () => {
    render(<DecisionReportSnapshot snapshot={fullSnapshot} metadata={metadata} />);
    const ringSvg = screen.getByTestId("fit-score-ring-svg");
    expect(ringSvg).toBeInTheDocument();
    expect(screen.getByTestId("fit-score-ring-progress")).toBeInTheDocument();
  });

  test("2. Correct numerical score appears in the center of the ring", () => {
    render(<DecisionReportSnapshot snapshot={fullSnapshot} metadata={metadata} />);
    const centerValue = screen.getByTestId("fit-score-ring-value");
    expect(centerValue).toHaveTextContent("88.5");
    expect(screen.getByText("/ 100")).toBeInTheDocument();
  });

  test("3. Fit Tier remains clearly visible", () => {
    render(<DecisionReportSnapshot snapshot={fullSnapshot} metadata={metadata} />);
    expect(screen.getAllByText("HIGH FIT").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Fit Tier")).toBeInTheDocument();
  });

  test("4. Recommendation category remains visible when available", () => {
    render(<DecisionReportSnapshot snapshot={fullSnapshot} metadata={metadata} />);
    expect(screen.getByText("Recommendation Category")).toBeInTheDocument();
    expect(screen.getByText("STRONG FIT")).toBeInTheDocument();
  });

  test("5. Exploration maturity remains visible when available", () => {
    render(<DecisionReportSnapshot snapshot={fullSnapshot} metadata={metadata} />);
    expect(screen.getByText("Exploration Maturity")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
  });

  test("6. Null fit_index renders unavailable state without converting to 0", () => {
    const noFitIndexSnapshot = {
      ...fullSnapshot,
      fit_index: null,
    };
    render(<DecisionReportSnapshot snapshot={noFitIndexSnapshot} metadata={metadata} />);
    expect(screen.queryByTestId("fit-score-ring-value")).not.toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
    expect(screen.getByTestId("fit-score-ring-unavailable")).toHaveTextContent("Not available yet");
  });

  test("7. Accessible label contains the actual score and tier", () => {
    render(<FitScoreRing score={75.5} maxScore={100} fitTier="HIGH_FIT" />);
    const svg = screen.getByRole("img");
    expect(svg).toHaveAttribute("aria-label", "Fit Index: 75.5 out of 100, HIGH FIT");
  });

  test("8. Accessible label handles null/undefined score gracefully", () => {
    render(<FitScoreRing score={null} />);
    const svg = screen.getByRole("img");
    expect(svg).toHaveAttribute("aria-label", "Fit Index not available");
  });

  test("9. Renders career_name and one_liner", () => {
    render(<DecisionReportSnapshot snapshot={fullSnapshot} metadata={metadata} />);
    expect(screen.getByText("Bioprocess Engineer")).toBeInTheDocument();
    expect(
      screen.getByText("Design and optimize industrial biological manufacturing systems.")
    ).toBeInTheDocument();
  });

  test("10. Renders null snapshot fallback safely", () => {
    render(<DecisionReportSnapshot snapshot={null} />);
    expect(screen.getByText("Snapshot data is not available yet.")).toBeInTheDocument();
  });
});
