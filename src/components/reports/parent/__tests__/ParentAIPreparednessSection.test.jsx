import React from "react";
import { render, screen } from "@testing-library/react";
import ParentAIPreparednessSection from "../ParentAIPreparednessSection";

describe("ParentAIPreparednessSection", () => {
  const mockAIPreparedness = {
    ai_risk_level: "Low",
    future_proof_score: 92,
    human_skills: [
      "Biological Systems Intuition",
      "Process Troubleshooting",
      "Sterile Environment Judgment",
    ],
    plain_language_guidance:
      "In Bioprocess Engineer, AI is primarily augmenting routine analytical and administrative workflows. Long-term career resilience is centered around core human strengths such as biological systems intuition and experimental troubleshooting.",
  };

  test("1. renders the full AI preparedness section with valid backend data", () => {
    render(<ParentAIPreparednessSection aiPreparedness={mockAIPreparedness} />);

    expect(screen.getByRole("heading", { name: /Will AI Replace This Job\?/i })).toBeInTheDocument();
    expect(screen.getByText(/04 — AI Preparedness/i)).toBeInTheDocument();
  });

  test("2. renders AI automation risk level correctly", () => {
    render(<ParentAIPreparednessSection aiPreparedness={mockAIPreparedness} />);

    expect(screen.getByText("Low Automation Risk")).toBeInTheDocument();
  });

  test("3. renders future-proof score when provided", () => {
    render(<ParentAIPreparednessSection aiPreparedness={mockAIPreparedness} />);

    expect(screen.getByText("92")).toBeInTheDocument();
    expect(screen.getByText("/ 100")).toBeInTheDocument();
  });

  test("4. handles null or missing future-proof score safely", () => {
    const dataWithoutScore = {
      ...mockAIPreparedness,
      future_proof_score: null,
    };
    render(<ParentAIPreparednessSection aiPreparedness={dataWithoutScore} />);

    expect(screen.getByText("Not Assigned")).toBeInTheDocument();
  });

  test("5. renders human skills identified by backend", () => {
    render(<ParentAIPreparednessSection aiPreparedness={mockAIPreparedness} />);

    expect(screen.getByText("Biological Systems Intuition")).toBeInTheDocument();
    expect(screen.getByText("Process Troubleshooting")).toBeInTheDocument();
  });

  test("6. renders multiple human skills cleanly", () => {
    render(<ParentAIPreparednessSection aiPreparedness={mockAIPreparedness} />);

    expect(screen.getByText("Biological Systems Intuition")).toBeInTheDocument();
    expect(screen.getByText("Process Troubleshooting")).toBeInTheDocument();
    expect(screen.getByText("Sterile Environment Judgment")).toBeInTheDocument();
  });

  test("7. renders plain-language guidance narrative faithfully", () => {
    render(<ParentAIPreparednessSection aiPreparedness={mockAIPreparedness} />);

    expect(
      screen.getByText(/In Bioprocess Engineer, AI is primarily augmenting routine analytical/i)
    ).toBeInTheDocument();
  });

  test("8. handles missing guidance narrative safely when other metrics exist", () => {
    const dataWithoutGuidance = {
      ai_risk_level: "Moderate",
      future_proof_score: 75,
      human_skills: ["Creative Problem Solving"],
    };
    render(<ParentAIPreparednessSection aiPreparedness={dataWithoutGuidance} />);

    expect(screen.getByText("Moderate Automation Risk")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("Creative Problem Solving")).toBeInTheDocument();
  });

  test("9. renders neutral state when entire AI section is null/missing", () => {
    render(<ParentAIPreparednessSection aiPreparedness={null} />);

    expect(screen.getByText(/04 — AI Preparedness/i)).toBeInTheDocument();
    expect(
      screen.getByText(/AI impact information is not currently available in the parent report/i)
    ).toBeInTheDocument();
  });

  test("10. does NOT generate definitive replacement probabilities", () => {
    const { container } = render(<ParentAIPreparednessSection aiPreparedness={mockAIPreparedness} />);

    expect(container.textContent).not.toMatch(/\b(85% chance|20% chance|Replacement Probability: \d+%|Job loss likelihood)\b/i);
  });

  test("11. does NOT generate definitive 'AI will replace this job' claims", () => {
    const { container } = render(<ParentAIPreparednessSection aiPreparedness={mockAIPreparedness} />);

    expect(container.textContent).not.toMatch(/\b(AI will definitely replace|This job will be eliminated|Will be automated away)\b/i);
  });

  test("12. does NOT fabricate 'AI-proof' or 'irreplaceable' claims", () => {
    const { container } = render(<ParentAIPreparednessSection aiPreparedness={mockAIPreparedness} />);

    expect(container.textContent).not.toMatch(/\b(AI-proof skills|skills AI can never replace|irreplaceable skills)\b/i);
  });

  test("13. does NOT introduce 'guaranteed' job security language", () => {
    const { container } = render(<ParentAIPreparednessSection aiPreparedness={mockAIPreparedness} />);

    expect(container.textContent).not.toMatch(/\b(Guaranteed future|100% safe career|Immune to technology)\b/i);
  });

  test("14. does NOT fabricate a 10-year replacement timeline", () => {
    const { container } = render(<ParentAIPreparednessSection aiPreparedness={mockAIPreparedness} />);

    expect(container.textContent).not.toMatch(/\b(in 10 years|by 2035|by 2040|within a decade)\b/i);
  });

  test("15. does NOT fabricate external macro statistics", () => {
    const { container } = render(<ParentAIPreparednessSection aiPreparedness={mockAIPreparedness} />);

    expect(container.textContent).not.toMatch(/\b(40% of jobs|80% of tasks automated|World Economic Forum report)\b/i);
  });

  test("16. does NOT calculate new scores or probability metrics", () => {
    const { container } = render(<ParentAIPreparednessSection aiPreparedness={mockAIPreparedness} />);

    expect(container.textContent).not.toMatch(/\b(Risk Index: \d+|Automation Quotient)\b/i);
  });

  test("17. does NOT leak internal field keys or snake_case names", () => {
    const { container } = render(<ParentAIPreparednessSection aiPreparedness={mockAIPreparedness} />);

    expect(container.textContent).not.toContain("ai_risk_level");
    expect(container.textContent).not.toContain("future_proof_score");
    expect(container.textContent).not.toContain("plain_language_guidance");
  });

  test("18. handles partial or malformed payload without runtime crashing", () => {
    const partialPayload = {
      human_skills: ["Adaptive Communication"],
    };
    render(<ParentAIPreparednessSection aiPreparedness={partialPayload} />);

    expect(screen.getByText("Adaptive Communication")).toBeInTheDocument();
  });
});
