import React from "react";
import { render, screen } from "@testing-library/react";
import ParentSnapshotSection from "../ParentSnapshotSection";

describe("ParentSnapshotSection", () => {
  const mockSnapshot = {
    career_name: "Bioprocess Engineer",
    student_name: "Alex",
    plain_language_summary: {
      headline: "Understanding Alex's Alignment with Bioprocess Engineer",
      narrative: "Alex demonstrates strong, evidence-backed alignment with Bioprocess Engineer. Hands-on simulation results confirm solid problem-solving ability in day-to-day tasks.",
      recommendation_tone: "SUPPORTIVE_EXPLORATION",
    },
    fit_tier: "HIGH_FIT",
    exploration_maturity: "COMPLETED",
  };

  test("1. renders the full parent snapshot with valid backend data", () => {
    render(<ParentSnapshotSection snapshot={mockSnapshot} />);

    expect(screen.getByRole("heading", { name: /Understanding Alex's Alignment with Bioprocess Engineer/i })).toBeInTheDocument();
    expect(screen.getByText(/01 — Snapshot for Parents/i)).toBeInTheDocument();
    expect(screen.getByText("Alex")).toBeInTheDocument();
    expect(screen.getByText("Bioprocess Engineer")).toBeInTheDocument();
  });

  test("2. renders the backend-provided headline faithfully", () => {
    render(<ParentSnapshotSection snapshot={mockSnapshot} />);

    expect(screen.getByText("Understanding Alex's Alignment with Bioprocess Engineer")).toBeInTheDocument();
  });

  test("3. renders the backend-provided plain-language narrative", () => {
    render(<ParentSnapshotSection snapshot={mockSnapshot} />);

    expect(
      screen.getByText(/Alex demonstrates strong, evidence-backed alignment with Bioprocess Engineer/i)
    ).toBeInTheDocument();
  });

  test("4. renders exploration maturity when supplied", () => {
    render(<ParentSnapshotSection snapshot={mockSnapshot} />);

    expect(screen.getByText(/High Evidence \(Simulation Complete\)/i)).toBeInTheDocument();
  });

  test("5. renders fit tier when supplied", () => {
    render(<ParentSnapshotSection snapshot={mockSnapshot} />);

    expect(screen.getByText("High Fit")).toBeInTheDocument();
  });

  test("6. handles null fit tier safely without fabricating a tier", () => {
    const snapshotWithoutTier = {
      ...mockSnapshot,
      fit_tier: null,
    };
    render(<ParentSnapshotSection snapshot={snapshotWithoutTier} />);

    expect(screen.queryByText("High Fit")).not.toBeInTheDocument();
    expect(screen.getByText("In Review")).toBeInTheDocument();
  });

  test("7. renders neutral state when snapshot is null/undefined", () => {
    render(<ParentSnapshotSection snapshot={null} />);

    expect(screen.getByText(/01 — Snapshot for Parents/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Parent snapshot summary is not currently available for this career./i)
    ).toBeInTheDocument();
  });

  test("8. handles missing optional fields safely", () => {
    const minimalSnapshot = {
      career_name: "Data Scientist",
      student_name: "Sam",
    };
    render(<ParentSnapshotSection snapshot={minimalSnapshot} />);

    expect(screen.getByText("Sam")).toBeInTheDocument();
    expect(screen.getByText("Data Scientist")).toBeInTheDocument();
    expect(screen.getByText(/Understanding Sam's Alignment with Data Scientist/i)).toBeInTheDocument();
  });

  test("9. does NOT leak internal enum strings or snake_case keys in visible text", () => {
    const { container } = render(<ParentSnapshotSection snapshot={mockSnapshot} />);

    expect(container.textContent).not.toContain("HIGH_FIT");
    expect(container.textContent).not.toContain("SUPPORTIVE_EXPLORATION");
    expect(container.textContent).not.toContain("plain_language_summary");
  });

  test("10. does NOT perform new scoring or numerical fit calculations", () => {
    const { container } = render(<ParentSnapshotSection snapshot={mockSnapshot} />);

    expect(container.textContent).not.toMatch(/\b(Fit Score: \d+|Match: \d+%|Percentile: \d+)\b/i);
  });

  test("11. does NOT introduce unsupported hyperbolic language", () => {
    const { container } = render(<ParentSnapshotSection snapshot={mockSnapshot} />);

    expect(container.textContent).not.toMatch(/\b(Best career|Perfect fit|Guaranteed|Highly likely to succeed)\b/i);
  });

  test("12. preserves parent-specific supportive tone from backend", () => {
    const moderateSnapshot = {
      career_name: "Biochemical Engineer",
      student_name: "Jordan",
      plain_language_summary: {
        headline: "Understanding Jordan's Alignment with Biochemical Engineer",
        narrative: "Jordan shows genuine interest and promising capability in Biochemical Engineer.",
        recommendation_tone: "SUPPORTIVE_EXPLORATION",
      },
      fit_tier: "MODERATE_FIT",
      exploration_maturity: "MODERATE",
    };
    render(<ParentSnapshotSection snapshot={moderateSnapshot} />);

    expect(screen.getByText(/Jordan shows genuine interest and promising capability/i)).toBeInTheDocument();
    expect(screen.getByText("Moderate Fit")).toBeInTheDocument();
    expect(screen.getByText(/Moderate Evidence/i)).toBeInTheDocument();
  });
});
