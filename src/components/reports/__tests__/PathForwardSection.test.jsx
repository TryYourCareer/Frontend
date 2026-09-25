import React from "react";
import { render, screen } from "@testing-library/react";
import PathForwardSection from "../PathForwardSection";

describe("PathForwardSection", () => {
  const fullPathForwardData = {
    stream_feasibility: "ELIGIBLE",
    student_stream: "Science (PCM)",
    required_streams: ["Science (PCM)", "Science (PCB)"],
    degrees: ["B.Tech Biotechnology", "B.Sc Microbiology"],
    exams: ["JEE Main", "GATE"],
    duration: "4 Years (8 Semesters)",
    alternative_pathways: ["Diploma in Biotechnology followed by lateral admission"],
    certifications: ["Certified Bioprocess Associate (CBA)"],
    guidance: "Alex's academic background in Science (PCM) meets direct admission prerequisites for bioprocess engineering pathways.",
  };

  const fullActionPlanData = {
    ordered_steps: [
      {
        title: "Deepen core chemistry and reaction kinetics understanding",
        category: "EXPLORATION",
        phase: "ORIENTATION",
        source: "Discovery Test",
      },
      {
        title: "Advance bioprocess parameter simulation skills",
        category: "SKILL_DEVELOPMENT",
        phase: "COMPETENCY_BUILDING",
        source: "Decision Intelligence Recommendations",
        rationale: "Addresses the simulation gap observed during fermentation task analysis.",
        target_key: "secret_internal_target_key_123",
      },
      {
        title: "Strengthen foundational mastery in Analytical Wet Lab Techniques",
        category: "FOUNDATIONAL_SKILL",
        phase: "PRACTICE_AND_PROJECTS",
        source: "Career Requirements",
        timeframe: "Semester 1",
      },
    ],
    has_explicit_timeframes: false,
  };

  test("1. renders the Path Forward section with full backend data", () => {
    render(<PathForwardSection pathForward={fullPathForwardData} actionPlan={fullActionPlanData} />);

    expect(screen.getByRole("heading", { name: /Your Path Forward/i })).toBeInTheDocument();
    expect(screen.getByText(/08 — Path Forward/i)).toBeInTheDocument();
    expect(screen.getByText(/Pathway Status: Eligible/i)).toBeInTheDocument();
  });

  test("2. renders ordered_steps in exact backend sequence", () => {
    render(<PathForwardSection pathForward={fullPathForwardData} actionPlan={fullActionPlanData} />);

    const steps = screen.getAllByText(/(Deepen core chemistry|Advance bioprocess parameter|Strengthen foundational mastery)/i);
    expect(steps.length).toBe(3);
    expect(steps[0]).toHaveTextContent("Deepen core chemistry and reaction kinetics understanding");
    expect(steps[1]).toHaveTextContent("Advance bioprocess parameter simulation skills");
    expect(steps[2]).toHaveTextContent("Strengthen foundational mastery in Analytical Wet Lab Techniques");

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("3. renders backend-provided timeframe when present", () => {
    render(<PathForwardSection pathForward={fullPathForwardData} actionPlan={fullActionPlanData} />);

    expect(screen.getByText("Semester 1")).toBeInTheDocument();
  });

  test("4. does NOT invent fabricated timeframes when absent", () => {
    const dataWithoutTimeframes = {
      ordered_steps: [
        {
          title: "Explore biomanufacturing electives",
          category: "EXPLORATION",
        },
      ],
    };
    render(<PathForwardSection pathForward={fullPathForwardData} actionPlan={dataWithoutTimeframes} />);

    expect(screen.queryByText(/Semester 1/i)).not.toBeInTheDocument();
  });

  test("5. does NOT render artificial 30/60/90 days or 6–12 month milestones", () => {
    const { container } = render(<PathForwardSection pathForward={fullPathForwardData} actionPlan={fullActionPlanData} />);

    expect(container.textContent).not.toMatch(/\b(Next 30 days|30 days|60 days|90 days|6-12 months|6–12 months)\b/i);
  });

  test("6. renders ELIGIBLE status correctly", () => {
    render(<PathForwardSection pathForward={{ ...fullPathForwardData, stream_feasibility: "ELIGIBLE" }} actionPlan={fullActionPlanData} />);

    expect(screen.getByText("Pathway Status: Eligible")).toBeInTheDocument();
  });

  test("7. renders BRIDGE_REQUIRED status correctly", () => {
    const bridgeData = {
      stream_feasibility: "BRIDGE_REQUIRED",
      student_stream: "Commerce with Math",
      required_streams: ["Science (PCM)"],
      guidance: "A foundational bridge module in biology and chemistry is required prior to enrollment.",
    };
    render(<PathForwardSection pathForward={bridgeData} actionPlan={fullActionPlanData} />);

    expect(screen.getByText("Pathway Status: Bridge Required")).toBeInTheDocument();
    expect(screen.getByText(/A foundational bridge module in biology and chemistry is required/i)).toBeInTheDocument();
  });

  test("8. renders DIFFERENT_STREAM status correctly", () => {
    const diffStreamData = {
      stream_feasibility: "DIFFERENT_STREAM",
      student_stream: "Humanities",
      required_streams: ["Science (PCB)"],
      guidance: "Current occupational pathway requires a secondary education transition to biological sciences.",
    };
    render(<PathForwardSection pathForward={diffStreamData} actionPlan={fullActionPlanData} />);

    expect(screen.getByText("Pathway Status: Different Stream")).toBeInTheDocument();
    expect(screen.getByText(/Current occupational pathway requires a secondary education transition/i)).toBeInTheDocument();
  });

  test("9. renders UNKNOWN status correctly as a neutral unavailable state", () => {
    const unknownData = {
      stream_feasibility: "UNKNOWN",
      guidance: "Stream feasibility requirements are not yet mapped for this occupational profile.",
    };
    render(<PathForwardSection pathForward={unknownData} actionPlan={fullActionPlanData} />);

    expect(screen.getByText("Pathway Status: Pathway Status Unknown")).toBeInTheDocument();
  });

  test("10. renders backend pathway rationale and guidance", () => {
    render(<PathForwardSection pathForward={fullPathForwardData} actionPlan={fullActionPlanData} />);

    expect(screen.getByText(/Alex's academic background in Science \(PCM\) meets direct admission prerequisites/i)).toBeInTheDocument();
    expect(screen.getByText("B.Tech Biotechnology")).toBeInTheDocument();
    expect(screen.getByText("B.Sc Microbiology")).toBeInTheDocument();
  });

  test("11. renders entrance exams, certifications, duration and alternative pathways when provided", () => {
    render(<PathForwardSection pathForward={fullPathForwardData} actionPlan={fullActionPlanData} />);

    expect(screen.getByTestId("exams-certs-container")).toBeInTheDocument();
    expect(screen.getByText("JEE Main")).toBeInTheDocument();
    expect(screen.getByText("GATE")).toBeInTheDocument();
    expect(screen.getByText("Certified Bioprocess Associate (CBA)")).toBeInTheDocument();

    expect(screen.getByTestId("duration-container")).toBeInTheDocument();
    expect(screen.getByText("4 Years (8 Semesters)")).toBeInTheDocument();

    expect(screen.getByTestId("alternative-pathways-container")).toBeInTheDocument();
    expect(screen.getByText("Diploma in Biotechnology followed by lateral admission")).toBeInTheDocument();
  });

  test("12. does NOT render fake cost or duration when unavailable", () => {
    const pathWithoutCostOrDuration = {
      stream_feasibility: "ELIGIBLE",
      degrees: ["B.Tech Biotechnology"],
    };
    render(<PathForwardSection pathForward={pathWithoutCostOrDuration} actionPlan={fullActionPlanData} />);

    expect(screen.queryByTestId("cost-container")).not.toBeInTheDocument();
    expect(screen.queryByTestId("duration-container")).not.toBeInTheDocument();
  });

  test("13. handles missing action plan safely with clean fallback", () => {
    render(<PathForwardSection pathForward={fullPathForwardData} actionPlan={null} />);

    expect(screen.getByRole("heading", { name: /Your Path Forward/i })).toBeInTheDocument();
    expect(screen.getByText(/No specific next steps are currently recorded for this career./i)).toBeInTheDocument();
  });

  test("14. handles missing pathway data safely with clean fallback", () => {
    render(<PathForwardSection pathForward={null} actionPlan={fullActionPlanData} />);

    expect(screen.getByRole("heading", { name: /Your Path Forward/i })).toBeInTheDocument();
    expect(screen.getByText(/Pathway feasibility information is not currently available for this career./i)).toBeInTheDocument();
    expect(screen.getByText("Deepen core chemistry and reaction kinetics understanding")).toBeInTheDocument();
  });

  test("15. handles completely null inputs without runtime errors", () => {
    render(<PathForwardSection pathForward={null} actionPlan={null} />);

    expect(screen.getByText(/08 — Path Forward/i)).toBeInTheDocument();
    expect(screen.getByText(/Pathway guidance and action steps are not currently available for this career./i)).toBeInTheDocument();
  });
});
