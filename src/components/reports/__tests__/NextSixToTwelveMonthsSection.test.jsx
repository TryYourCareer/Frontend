import React from "react";
import { render, screen } from "@testing-library/react";
import NextSixToTwelveMonthsSection from "../NextSixToTwelveMonthsSection";

describe("NextSixToTwelveMonthsSection", () => {
  const standardActionPlan = {
    ordered_steps: [
      {
        title: "Deepen core chemistry and reaction kinetics understanding",
        category: "EXPLORATION",
        phase: "ORIENTATION",
        source: "Discovery Test",
        rationale: "Foundational chemistry inquiry score indicates readiness for advanced biochemical concepts.",
      },
      {
        title: "Advance bioprocess parameter simulation skills",
        category: "SKILL_DEVELOPMENT",
        phase: "COMPETENCY_BUILDING",
        source: "Decision Intelligence Recommendations",
        rationale: "Targeted skill development for scaling bioreactor operations.",
      },
      {
        title: "Strengthen foundational mastery in Microbial Physiology",
        category: "FOUNDATIONAL_SKILL",
        phase: "PRACTICE_AND_PROJECTS",
        source: "Career Requirements",
      },
    ],
    has_explicit_timeframes: false,
  };

  const standardRealityCheck = {
    development_gaps: [
      {
        competency_key: "comp_bioreactor_control",
        competency_name: "Bioreactor Control",
        observed_level: 2.0,
        required_level: 4.0,
        gap_description: "Targeted hands-on sensor feedback and dissolved oxygen control practice.",
      },
    ],
  };

  test("1. renders the Section with valid future/action data", () => {
    render(
      <NextSixToTwelveMonthsSection
        actionPlan={standardActionPlan}
        realityCheck={standardRealityCheck}
      />
    );

    expect(screen.getByRole("heading", { name: /Your Next 6–12 Months/i })).toBeInTheDocument();
    expect(screen.getByText(/10 — Forward Horizon/i)).toBeInTheDocument();
    expect(screen.getByText(/Evidence-Building Actions/i)).toBeInTheDocument();
  });

  test("2. preserves exact backend ordered steps sequence", () => {
    render(
      <NextSixToTwelveMonthsSection
        actionPlan={standardActionPlan}
        realityCheck={standardRealityCheck}
      />
    );

    const stepHeadings = screen.getAllByRole("heading", { level: 4 });
    expect(stepHeadings[0]).toHaveTextContent("Deepen core chemistry and reaction kinetics understanding");
    expect(stepHeadings[1]).toHaveTextContent("Advance bioprocess parameter simulation skills");
    expect(stepHeadings[2]).toHaveTextContent("Strengthen foundational mastery in Microbial Physiology");
  });

  test("3. renders explicit backend timeframes when explicitly supplied by backend", () => {
    const explicitPlan = {
      has_explicit_timeframes: true,
      timeframes: {
        next_30_days: [{ title: "Review introductory fermentation module" }],
        next_60_days: [{ title: "Complete bioreactor simulation lab" }],
        next_90_days: [{ title: "Participate in biochemistry symposium" }],
        next_6_12_months: [{ title: "Select undergraduate major electives" }],
      },
    };

    render(
      <NextSixToTwelveMonthsSection actionPlan={explicitPlan} />
    );

    expect(screen.getByText("Next 30 Days")).toBeInTheDocument();
    expect(screen.getByText("Review introductory fermentation module")).toBeInTheDocument();
    expect(screen.getByText("Next 60 Days")).toBeInTheDocument();
    expect(screen.getByText("Complete bioreactor simulation lab")).toBeInTheDocument();
    expect(screen.getByText("Next 90 Days")).toBeInTheDocument();
    expect(screen.getByText("Participate in biochemistry symposium")).toBeInTheDocument();
    expect(screen.getByText("Next 6–12 Months")).toBeInTheDocument();
    expect(screen.getByText("Select undergraduate major electives")).toBeInTheDocument();
  });

  test("4. does NOT generate fabricated timeframes when backend provides none", () => {
    const { container } = render(
      <NextSixToTwelveMonthsSection
        actionPlan={standardActionPlan}
        realityCheck={standardRealityCheck}
      />
    );

    expect(container.textContent).not.toMatch(/\b(0–3 months|3–6 months|First 30 days|By month 6|By month 12)\b/i);
  });

  test("5. does NOT fabricate '30 days' timeframe when not in backend data", () => {
    const { container } = render(
      <NextSixToTwelveMonthsSection actionPlan={standardActionPlan} />
    );

    expect(container.textContent).not.toMatch(/\b(Next 30 Days|30-day milestone|First 30 days)\b/i);
  });

  test("6. does NOT fabricate '60 days' timeframe when not in backend data", () => {
    const { container } = render(
      <NextSixToTwelveMonthsSection actionPlan={standardActionPlan} />
    );

    expect(container.textContent).not.toMatch(/\b(Next 60 Days|60-day milestone)\b/i);
  });

  test("7. does NOT fabricate '90 days' timeframe when not in backend data", () => {
    const { container } = render(
      <NextSixToTwelveMonthsSection actionPlan={standardActionPlan} />
    );

    expect(container.textContent).not.toMatch(/\b(Next 90 Days|90-day milestone)\b/i);
  });

  test("8. does NOT fabricate '6 months' schedule when absent", () => {
    const { container } = render(
      <NextSixToTwelveMonthsSection actionPlan={standardActionPlan} />
    );

    expect(container.textContent).not.toMatch(/\b(In 6 months|Month 6 milestone|By Month 6)\b/i);
  });

  test("9. does NOT fabricate '12 months' schedule when absent", () => {
    const { container } = render(
      <NextSixToTwelveMonthsSection actionPlan={standardActionPlan} />
    );

    expect(container.textContent).not.toMatch(/\b(In 12 months|Month 12 milestone|By Month 12)\b/i);
  });

  test("10. does NOT invent courses, certifications, or projects not in data", () => {
    const { container } = render(
      <NextSixToTwelveMonthsSection actionPlan={standardActionPlan} />
    );

    expect(container.textContent).not.toMatch(/\b(Coursera|edX|Udemy|AWS Certified|PMP|build a personal website)\b/i);
  });

  test("11. does NOT invent job applications or networking targets", () => {
    const { container } = render(
      <NextSixToTwelveMonthsSection actionPlan={standardActionPlan} />
    );

    expect(container.textContent).not.toMatch(/\b(Apply to 5 internships|Cold email 10 engineers|LinkedIn networking|Job portal)\b/i);
  });

  test("12. renders development areas / competencies to strengthen when supplied", () => {
    render(
      <NextSixToTwelveMonthsSection
        actionPlan={standardActionPlan}
        realityCheck={standardRealityCheck}
      />
    );

    expect(screen.getByText("Competencies to Strengthen")).toBeInTheDocument();
    expect(screen.getByText("Bioreactor Control")).toBeInTheDocument();
    expect(screen.getByText(/Targeted hands-on sensor feedback and dissolved oxygen control practice/i)).toBeInTheDocument();
  });

  test("13. renders evidence-building actions when supplied", () => {
    render(
      <NextSixToTwelveMonthsSection actionPlan={standardActionPlan} />
    );

    expect(screen.getByText("Deepen core chemistry and reaction kinetics understanding")).toBeInTheDocument();
    expect(screen.getByText(/Foundational chemistry inquiry score indicates readiness/i)).toBeInTheDocument();
    expect(screen.getByText("Decision Intelligence Recommendations")).toBeInTheDocument();
  });

  test("14. renders neutral state when action plan and reality check are missing", () => {
    render(
      <NextSixToTwelveMonthsSection actionPlan={null} realityCheck={null} />
    );

    expect(screen.getByText(/10 — Forward Horizon/i)).toBeInTheDocument();
    expect(screen.getByText(/Specific 6–12 month planning guidance is not currently available/i)).toBeInTheDocument();
  });

  test("15. renders neutral state when action plan has empty ordered_steps and no gaps", () => {
    render(
      <NextSixToTwelveMonthsSection
        actionPlan={{ ordered_steps: [], has_explicit_timeframes: false }}
        realityCheck={{ development_gaps: [] }}
      />
    );

    expect(screen.getByText(/Specific 6–12 month planning guidance is not currently available/i)).toBeInTheDocument();
  });

  test("16. handles partial action objects safely without runtime crashes", () => {
    const partialPlan = {
      ordered_steps: [
        {
          title: "Explore advanced computational models",
        },
      ],
    };

    render(
      <NextSixToTwelveMonthsSection actionPlan={partialPlan} />
    );

    expect(screen.getByText("Explore advanced computational models")).toBeInTheDocument();
  });

  test("17. does NOT leak internal enum strings or snake_case keys", () => {
    const { container } = render(
      <NextSixToTwelveMonthsSection
        actionPlan={standardActionPlan}
        realityCheck={standardRealityCheck}
      />
    );

    expect(container.textContent).not.toContain("SKILL_DEVELOPMENT");
    expect(container.textContent).not.toContain("COMPETENCY_BUILDING");
    expect(container.textContent).not.toContain("FOUNDATIONAL_SKILL");
    expect(container.textContent).not.toContain("PRACTICE_AND_PROJECTS");
  });

  test("18. does NOT calculate new scores or progress percentages", () => {
    const { container } = render(
      <NextSixToTwelveMonthsSection
        actionPlan={standardActionPlan}
        realityCheck={standardRealityCheck}
      />
    );

    expect(container.textContent).not.toMatch(/\b(Readiness Index|Probability of Success|Progress: \d+%|Completion: \d+%)\b/i);
  });

  test("19. does NOT introduce unsupported hyperbolic recommendations", () => {
    const { container } = render(
      <NextSixToTwelveMonthsSection
        actionPlan={standardActionPlan}
        realityCheck={standardRealityCheck}
      />
    );

    expect(container.textContent).not.toMatch(/\b(Guaranteed Entry|Must fix immediately|Fatal weakness|Crucial failure point)\b/i);
  });

  test("20. does NOT fabricate a synthetic reassessment schedule", () => {
    const { container } = render(
      <NextSixToTwelveMonthsSection
        actionPlan={standardActionPlan}
        realityCheck={standardRealityCheck}
      />
    );

    expect(container.textContent).not.toMatch(/\b(Retake the test in 6 months|Re-evaluate on Day 90)\b/i);
  });
  test("21. renders real competency names and deduplicates without Target Competency fallback", () => {
    const rcWithGaps = {
      development_gaps: [
        {
          target_key: "comp_adaptive_reasoning",
          title: "Adaptive Reasoning & Revision",
          state: "DEMONSTRATED_GROWTH_AREA",
          rationale: "Demonstrated Level 1.0 is below target proficiency 3.0",
        },
        {
          // Duplicate
          target_key: "comp_adaptive_reasoning",
          title: "Adaptive Reasoning & Revision",
          state: "DEMONSTRATED_GROWTH_AREA",
          rationale: "Demonstrated Level 1.0 is below target proficiency 3.0",
        },
      ],
    };

    render(
      <NextSixToTwelveMonthsSection
        actionPlan={standardActionPlan}
        realityCheck={rcWithGaps}
      />
    );

    expect(screen.getByText("Adaptive Reasoning & Revision")).toBeInTheDocument();
    expect(screen.queryByText("Target Competency")).not.toBeInTheDocument();
    // Ensure only 1 instance is rendered due to deduplication
    const elements = screen.getAllByText("Adaptive Reasoning & Revision");
    expect(elements).toHaveLength(1);
  });
});
