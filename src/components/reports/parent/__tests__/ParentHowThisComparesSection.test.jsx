import React from "react";
import { render, screen } from "@testing-library/react";
import ParentHowThisComparesSection from "../ParentHowThisComparesSection";

describe("ParentHowThisComparesSection & Benchmark Comparison", () => {
  const mockHowThisCompares = {
    career_reality_highlights: [
      "Design and optimize industrial biological manufacturing systems.",
      "Directly impacts pharmaceutical scaling, biofuels, and life-saving biologics production.",
    ],
    work_dna_alignment: {
      cognitive_style: "Structured & Analytical",
      work_environment: "Laboratory & Pilot Plant",
      collaboration_mode: "Cross-Functional Engineering Teams",
    },
  };

  const mockBenchmarkData = {
    career_reality_highlights: [
      "Software architecture and system design tasks.",
    ],
    work_dna_alignment: {
      total_dimensions_count: 3,
      assessed_dimensions_count: 2,
      dimensions: [
        {
          key: "analytical_depth",
          dimension: "Analytical Depth",
          demonstrated_level: "High",
          career_required_level: "Very High",
          difference: "Within target range",
          status: "aligned",
          rationale: "Simulation demonstrated rigorous systematic reasoning.",
        },
        {
          key: "team_collaboration",
          dimension: "Team Collaboration",
          demonstrated_level: "Moderate",
          career_required_level: null, // Missing benchmark
          status: "developing",
          rationale: "Exploration opportunities available in paired missions.",
        },
      ],
    },
  };

  test("1. renders the full section with valid backend comparison data", () => {
    render(<ParentHowThisComparesSection howThisCompares={mockHowThisCompares} />);

    expect(screen.getByRole("heading", { name: /How This Compares/i })).toBeInTheDocument();
    expect(screen.getByText(/03 &bull; Occupational Context|03 \u2022 Occupational Context/i)).toBeInTheDocument();
  });

  test("2. renders career reality highlights faithfully", () => {
    render(<ParentHowThisComparesSection howThisCompares={mockHowThisCompares} />);

    expect(
      screen.getByText("Design and optimize industrial biological manufacturing systems.")
    ).toBeInTheDocument();
  });

  test("3. renders multiple highlights cleanly", () => {
    render(<ParentHowThisComparesSection howThisCompares={mockHowThisCompares} />);

    expect(
      screen.getByText("Design and optimize industrial biological manufacturing systems.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Directly impacts pharmaceutical scaling, biofuels/i)
    ).toBeInTheDocument();
  });

  test("4. renders Work DNA alignment attributes when supplied", () => {
    render(<ParentHowThisComparesSection howThisCompares={mockHowThisCompares} />);

    expect(screen.getByText("Cognitive Style")).toBeInTheDocument();
    expect(screen.getByText("Structured & Analytical")).toBeInTheDocument();
    expect(screen.getByText("Work Environment")).toBeInTheDocument();
    expect(screen.getByText("Laboratory & Pilot Plant")).toBeInTheDocument();
  });

  test("5. benchmark/reference value renders when available", () => {
    render(<ParentHowThisComparesSection howThisCompares={mockBenchmarkData} />);

    expect(screen.getByText("Reference benchmark:")).toBeInTheDocument();
    expect(screen.getByText("Very High")).toBeInTheDocument();
  });

  test("6. student observed profile renders correctly alongside benchmark", () => {
    render(<ParentHowThisComparesSection howThisCompares={mockBenchmarkData} />);

    expect(screen.getByText("Student profile:")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  test("7. comparison difference renders when both values exist", () => {
    render(<ParentHowThisComparesSection howThisCompares={mockBenchmarkData} />);

    expect(screen.getByText("Difference:")).toBeInTheDocument();
    expect(screen.getByText("Within target range")).toBeInTheDocument();
  });

  test("8. unavailable benchmark renders explicit unavailable state without converting to 0", () => {
    render(<ParentHowThisComparesSection howThisCompares={mockBenchmarkData} />);

    expect(screen.getByText("Benchmark unavailable")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  test("9. does NOT introduce percentile rankings or cohort metrics", () => {
    const { container } = render(<ParentHowThisComparesSection howThisCompares={mockHowThisCompares} />);

    expect(container.textContent).not.toMatch(/\b(Top 10%|Top 5%|Percentile: \d+|90th percentile)\b/i);
  });

  test("10. does NOT introduce comparative cohort rankings", () => {
    const { container } = render(<ParentHowThisComparesSection howThisCompares={mockHowThisCompares} />);

    expect(container.textContent).not.toMatch(/\b(Compared with other candidates|Above average student|Cohort rank)\b/i);
  });

  test("11. does NOT introduce peer comparison claims", () => {
    const { container } = render(<ParentHowThisComparesSection howThisCompares={mockHowThisCompares} />);

    expect(container.textContent).not.toMatch(/\b(Better than other students|Outperforms peers|Ranked #1)\b/i);
  });

  test("12. handles neutral state when entire section is missing or null", () => {
    render(<ParentHowThisComparesSection howThisCompares={null} />);

    expect(screen.getByText(/03 &bull; Occupational Context|03 \u2022 Occupational Context/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Comparative career context is not currently available in the parent report/i)
    ).toBeInTheDocument();
  });
});
