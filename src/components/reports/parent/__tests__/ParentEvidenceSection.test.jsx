import React from "react";
import { render, screen } from "@testing-library/react";
import ParentEvidenceSection from "../ParentEvidenceSection";

describe("ParentEvidenceSection", () => {
  const fullEvidence = {
    what_the_evidence_shows: "The student performed exceptionally in **Visual Hierarchy** and **System Architecture** tasks.",
    demonstrated_strengths: [
      {
        title: "Visual Hierarchy",
        description: "Accurately aligned UI grid structures under timed simulation.",
        level: 3.5,
      },
      {
        title: "System Architecture",
        description: "Modeled component hierarchies cleanly.",
        demonstrated_level: 4.0,
      },
    ],
    growth_areas: [
      {
        title: "Edge Case Handling",
        description: "Requires additional testing when given conflicting design requirements.",
        level: 2.0,
      },
    ],
    untested_areas: [
      {
        title: "Large Team Collaboration",
        description: "Multi-stakeholder negotiation was not measured in this single-player trial.",
      },
    ],
  };

  test("1. Renders what_the_evidence_shows without literal markdown asterisks", () => {
    const { container } = render(<ParentEvidenceSection evidence={fullEvidence} />);
    expect(container.textContent).not.toContain("**Visual Hierarchy**");
    expect(container.textContent).not.toContain("**System Architecture**");
    
    const boldTags = container.querySelectorAll("strong");
    const boldTexts = Array.from(boldTags).map(t => t.textContent);
    expect(boldTexts).toContain("Visual Hierarchy");
    expect(boldTexts).toContain("System Architecture");
  });

  test("2. Renders all three evidence categories: Demonstrated Evidence, Areas to Develop, and Not Yet Tested", () => {
    render(<ParentEvidenceSection evidence={fullEvidence} />);
    expect(screen.getByText(/Demonstrated Evidence \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Areas to Develop \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Not Yet Tested \(1\)/i)).toBeInTheDocument();
  });

  test("3. Renders demonstrated strengths items with titles, descriptions, and level badges", () => {
    render(<ParentEvidenceSection evidence={fullEvidence} />);
    expect(screen.getAllByText("Visual Hierarchy").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Accurately aligned UI grid structures under timed simulation.")).toBeInTheDocument();
    expect(screen.getByText("Level 3.5")).toBeInTheDocument();

    expect(screen.getAllByText("System Architecture").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Modeled component hierarchies cleanly.")).toBeInTheDocument();
    expect(screen.getByText("Level 4.0")).toBeInTheDocument();
  });

  test("4. Renders growth areas with titles, descriptions, and level badges", () => {
    render(<ParentEvidenceSection evidence={fullEvidence} />);
    expect(screen.getByText("Edge Case Handling")).toBeInTheDocument();
    expect(screen.getByText("Requires additional testing when given conflicting design requirements.")).toBeInTheDocument();
    expect(screen.getByText("Level 2.0")).toBeInTheDocument();
  });

  test("5. Renders untested areas with titles and descriptions", () => {
    render(<ParentEvidenceSection evidence={fullEvidence} />);
    expect(screen.getByText("Large Team Collaboration")).toBeInTheDocument();
    expect(screen.getByText("Multi-stakeholder negotiation was not measured in this single-player trial.")).toBeInTheDocument();
  });

  test("6. Handles empty/missing categories gracefully with neutral placeholders without fabricating content", () => {
    const partialEvidence = {
      what_the_evidence_shows: "Baseline assessment conducted.",
      demonstrated_strengths: [],
      growth_areas: [],
      untested_areas: [],
    };
    render(<ParentEvidenceSection evidence={partialEvidence} />);
    expect(screen.getByText("Demonstrated Evidence (0)")).toBeInTheDocument();
    expect(screen.getByText("No specific trial strengths recorded for this simulation.")).toBeInTheDocument();
    expect(screen.getByText("Areas to Develop (0)")).toBeInTheDocument();
    expect(screen.getByText("No major growth gaps identified in baseline trial rubrics.")).toBeInTheDocument();
    expect(screen.getByText("Not Yet Tested (0)")).toBeInTheDocument();
    expect(screen.getByText("All primary simulation domains were exercised during the trial.")).toBeInTheDocument();
  });

  test("7. Handles null evidence safely", () => {
    render(<ParentEvidenceSection evidence={null} />);
    expect(screen.getByText("Evidence details are not currently available in the parent report.")).toBeInTheDocument();
  });
});
