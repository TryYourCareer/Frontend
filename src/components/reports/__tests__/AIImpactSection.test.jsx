import React from "react";
import { render, screen } from "@testing-library/react";
import AIImpactSection from "../AIImpactSection";

describe("AIImpactSection", () => {
  const fullAIData = {
    automation_risk: "Low",
    automation_exposure: "AI assists in process parameter optimization and data analytics, while physical wet lab execution and validation require human oversight.",
    future_proof_score: 92,
    sustainability_note: "High occupational resilience due to physical laboratory execution, biological complexity, and regulatory accountability.",
    human_skills: [
      "Biological Systems Intuition",
      "Experimental Troubleshooting",
      "Physical Validation & Quality Control",
      "Regulatory Accountability",
    ],
    long_term_status: "UNAVAILABLE",
    provenance: {
      source: "careers_enriched v1.0",
    },
  };

  test("1. renders the AI Impact section with valid backend data", () => {
    render(<AIImpactSection aiImpact={fullAIData} />);

    expect(screen.getByRole("heading", { name: /How AI Will Reshape This Career/i })).toBeInTheDocument();
    expect(screen.getByText(/07 — AI Impact/i)).toBeInTheDocument();
  });

  test("2. renders automation risk badge and future-proof score", () => {
    render(<AIImpactSection aiImpact={fullAIData} />);

    expect(screen.getByText("Low Automation Risk")).toBeInTheDocument();
    expect(screen.getByText("92/100")).toBeInTheDocument();
    expect(screen.getByText(/High occupational resilience due to physical laboratory execution/i)).toBeInTheDocument();
  });

  test("3. renders current automation and augmentation context (Today)", () => {
    render(<AIImpactSection aiImpact={fullAIData} />);

    expect(screen.getByText(/AI assists in process parameter optimization/i)).toBeInTheDocument();
  });

  test("4. renders human skills using neutral terminology without overstating resilience", () => {
    render(<AIImpactSection aiImpact={fullAIData} />);

    expect(screen.getByText("Human Skills Identified in the AI Assessment (4)")).toBeInTheDocument();
    expect(screen.getByText("Biological Systems Intuition")).toBeInTheDocument();
    expect(screen.getByText("Experimental Troubleshooting")).toBeInTheDocument();
    expect(screen.getByText("Physical Validation & Quality Control")).toBeInTheDocument();
    expect(screen.getByText("Regulatory Accountability")).toBeInTheDocument();
  });

  test("5. does not contain unsupported resilience claims or hyperbolic phrases", () => {
    const { container } = render(<AIImpactSection aiImpact={fullAIData} />);

    expect(container.textContent).not.toMatch(/\b(Irreplaceable Human Skills|AI-proof|guaranteed to remain|guaranteed to survive|Resilient human capabilities)\b/i);
  });

  test("6. renders near-term 1-3 years horizon when provided by backend", () => {
    const nearTermData = {
      ...fullAIData,
      near_term: {
        available: true,
        content: "Integration of real-time sensor copilots to assist batch yield modeling.",
      },
    };
    render(<AIImpactSection aiImpact={nearTermData} />);

    expect(screen.getByText(/Integration of real-time sensor copilots/i)).toBeInTheDocument();
  });

  test("7. when near_term is absent, does NOT render fabricated fallback text and displays unavailable", () => {
    const { container } = render(<AIImpactSection aiImpact={fullAIData} />);

    expect(container.textContent).not.toContain("AI tooling integrates primarily as decision-support, simulation accelerators, and analytical copilots.");
    expect(screen.getByText("Specific near-term outlook has not been established yet.")).toBeInTheDocument();
  });

  test("8. explicitly shows long-term 5-10 year outlook as unavailable without inventing predictions", () => {
    render(<AIImpactSection aiImpact={fullAIData} />);

    expect(screen.getByText(/Specific long-term outlook has not been established yet/i)).toBeInTheDocument();
    expect(screen.getAllByText("Not Yet Available").length).toBeGreaterThanOrEqual(1);
  });

  test("9. renders long-term horizon only when explicitly available from backend", () => {
    const longTermData = {
      ...fullAIData,
      long_term_status: "AVAILABLE",
      long_term: {
        available: true,
        content: "Autonomous closed-loop bioreactors supervised by senior human systems architects.",
      },
    };
    render(<AIImpactSection aiImpact={longTermData} />);

    expect(screen.getByText(/Autonomous closed-loop bioreactors/i)).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
  });

  test("10. handles null aiImpact safely with human-readable unavailable state", () => {
    render(<AIImpactSection aiImpact={null} />);

    expect(screen.getByText(/07 — AI Impact/i)).toBeInTheDocument();
    expect(screen.getByText(/AI impact and automation analysis is not currently available for this career./i)).toBeInTheDocument();
  });

  test("11. handles missing task-level AI exposure safely", () => {
    const noExposure = {
      automation_risk: "Moderate",
      future_proof_score: 75,
    };
    render(<AIImpactSection aiImpact={noExposure} />);

    expect(screen.getByText(/No task-level AI exposure data is currently recorded for this career./i)).toBeInTheDocument();
  });

  test("12. handles missing human-skill data safely with neutral text", () => {
    const noSkills = {
      automation_risk: "Low",
      automation_exposure: "AI analysis of documents.",
      human_skills: [],
    };
    render(<AIImpactSection aiImpact={noSkills} />);

    expect(screen.getByText(/Human-skill analysis is not currently available for this career./i)).toBeInTheDocument();
  });

  test("13. renders backend provenance when available", () => {
    render(<AIImpactSection aiImpact={fullAIData} />);

    expect(screen.getByText(/AI impact assessment based on careers_enriched v1.0/i)).toBeInTheDocument();
  });

  test("14. renders backend caveat/limitations if provided", () => {
    const dataWithCaveat = {
      ...fullAIData,
      limitations: "Analysis limited to published enterprise biopharma automation frameworks as of Q4 2024.",
    };
    render(<AIImpactSection aiImpact={dataWithCaveat} />);

    expect(screen.getByText("Analysis limited to published enterprise biopharma automation frameworks as of Q4 2024.")).toBeInTheDocument();
  });

  test("15. does NOT render generic hardcoded caveat when no backend caveat exists", () => {
    const { container } = render(<AIImpactSection aiImpact={fullAIData} />);

    expect(container.textContent).not.toContain("Subject to technological development & regulatory standards");
  });

  test("16. does not calculate replacement probabilities or fabricate job loss numbers", () => {
    const { container } = render(<AIImpactSection aiImpact={fullAIData} />);

    expect(container.textContent).not.toMatch(/\b(% of jobs eliminated|Replacement Probability|Displacement Rate)\b/i);
  });

  test("17. does not expose internal IDs or snake_case field names", () => {
    const dataWithSnakeKeys = {
      automation_risk: "low_risk",
      automation_exposure: "Assists with batch log verification.",
      internal_ai_model_id: "model-v2-uuid-secret",
      human_skills: ["Analysis"],
    };

    const { container } = render(<AIImpactSection aiImpact={dataWithSnakeKeys} />);

    expect(container.textContent).not.toContain("internal_ai_model_id");
    expect(container.textContent).not.toContain("model-v2-uuid-secret");
    expect(screen.getByText("Low Automation Risk")).toBeInTheDocument();
  });

  test("18. does not claim data is live or real-time without backend claim", () => {
    const { container } = render(<AIImpactSection aiImpact={fullAIData} />);

    expect(container.textContent).not.toMatch(/\b(Live AI telemetry|Real-time automation index)\b/i);
  });

  test("19. does not duplicate Market Outlook compensation or hiring demand", () => {
    const { container } = render(<AIImpactSection aiImpact={fullAIData} />);

    expect(container.textContent).not.toMatch(/\b(LPA|USD Salary|Hiring Demand:)\b/);
  });
});
