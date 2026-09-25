import React from "react";
import { render, screen } from "@testing-library/react";
import TrialScorecardSection from "../TrialScorecardSection";

describe("TrialScorecardSection", () => {
  const fullScorecard = {
    mission_title: "Bioreactor Scale-Up Simulation",
    mission_state: "COMPLETED",
    duration_seconds: 3000,
    findings_count: 2,
    decisions_count: 2,
    percentile: 88,
    deliverable_output: {
      title: "Scale-Up Production Plan",
      summary: "Completed agitation and dissolved oxygen optimization roadmap.",
      status: "Submitted & Verified",
    },
    evaluated_competencies: {
      comp_systems_modeling: {
        title: "Systems Modeling",
        evaluated_level: 3.0,
        contributing_evidence_count: 3,
        rationale: "Demonstrated systematic variable balancing under load.",
        evidence: [
          "Optimized dissolved oxygen at 40%",
          "Maintained temperature within +/- 0.5C",
        ],
      },
      comp_process_control: {
        title: "Process Control Optimization",
        evaluated_level: 2.0,
        contributing_evidence_count: 2,
        rationale: "Emerging process control adjustments observed during telemetry drift.",
      },
    },
    trial_strengths: [
      {
        title: "Systems Modeling",
        demonstrated_level: 3.0,
        rationale: "Solid performance in bioreactor agitation and parameter balancing.",
      },
    ],
    findings: [
      {
        title: "Optimal Agitation Speed",
        description: "Agitation at 250 RPM yielded maximum dissolved oxygen stability.",
        implication: "Directly improves batch yield by preventing shear stress.",
      },
    ],
    decisions: [
      {
        decision_type: "dissolved_oxygen_target",
        choice: "40%",
        rationale: "Ensures aerobic cellular respiration without oxidative toxicity.",
      },
    ],
  };

  test("1. renders the Trial Mission Scorecard with valid backend data", () => {
    render(<TrialScorecardSection trialScorecard={fullScorecard} />);

    expect(screen.getByRole("heading", { name: /Trial Mission Scorecard/i })).toBeInTheDocument();
    expect(screen.getByText(/05 — Trial Scorecard/i)).toBeInTheDocument();
  });

  test("2. renders mission title and status badge", () => {
    render(<TrialScorecardSection trialScorecard={fullScorecard} />);

    expect(screen.getByText("Bioreactor Scale-Up Simulation")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  test("3. renders completion duration correctly formatted", () => {
    render(<TrialScorecardSection trialScorecard={fullScorecard} />);

    expect(screen.getByText("50 mins")).toBeInTheDocument();
  });

  test("4. renders evidence summary counts (findings, decisions, competencies)", () => {
    render(<TrialScorecardSection trialScorecard={fullScorecard} />);

    expect(screen.getByText("2 Recorded")).toBeInTheDocument();
    expect(screen.getByText("2 Executed")).toBeInTheDocument();
    expect(screen.getByText("2 Evaluated")).toBeInTheDocument();
  });

  test("5. renders evaluated competencies with exact levels from backend", () => {
    render(<TrialScorecardSection trialScorecard={fullScorecard} />);

    expect(screen.getAllByText("Systems Modeling").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Level 3.0").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Process Control Optimization")).toBeInTheDocument();
    expect(screen.getByText("Level 2.0")).toBeInTheDocument();
  });

  test("6. renders competency evidence and rationale", () => {
    render(<TrialScorecardSection trialScorecard={fullScorecard} />);

    expect(screen.getByText("Demonstrated systematic variable balancing under load.")).toBeInTheDocument();
    expect(screen.getByText("Optimized dissolved oxygen at 40%")).toBeInTheDocument();
    expect(screen.getByText("3 contributing evidence signals recorded")).toBeInTheDocument();
  });

  test("7. renders recorded findings with observation and implication", () => {
    render(<TrialScorecardSection trialScorecard={fullScorecard} />);

    expect(screen.getByText("Optimal Agitation Speed")).toBeInTheDocument();
    expect(screen.getByText(/Agitation at 250 RPM yielded maximum dissolved oxygen stability/i)).toBeInTheDocument();
    expect(screen.getByText(/Directly improves batch yield by preventing shear stress/i)).toBeInTheDocument();
  });

  test("8. renders executed decisions with choice and rationale", () => {
    render(<TrialScorecardSection trialScorecard={fullScorecard} />);

    expect(screen.getByText("dissolved oxygen target")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText(/Ensures aerobic cellular respiration without oxidative toxicity/i)).toBeInTheDocument();
  });

  test("9. renders mission deliverable output and status", () => {
    render(<TrialScorecardSection trialScorecard={fullScorecard} />);

    expect(screen.getByText("Scale-Up Production Plan")).toBeInTheDocument();
    expect(screen.getByText(/Completed agitation and dissolved oxygen optimization roadmap/i)).toBeInTheDocument();
    expect(screen.getByText("Submitted & Verified")).toBeInTheDocument();
  });

  test("10. renders demonstrated trial strengths", () => {
    render(<TrialScorecardSection trialScorecard={fullScorecard} />);

    expect(screen.getByText(/Demonstrated Simulation Strengths/i)).toBeInTheDocument();
    expect(screen.getByText(/Solid performance in bioreactor agitation/i)).toBeInTheDocument();
  });

  test("11. renders cohort benchmark percentile when available", () => {
    render(<TrialScorecardSection trialScorecard={fullScorecard} />);

    expect(screen.getByText("88th Percentile")).toBeInTheDocument();
  });

  test("12. displays pending calculation message when percentile is null", () => {
    const noPercentile = { ...fullScorecard, percentile: null };
    render(<TrialScorecardSection trialScorecard={noPercentile} />);

    expect(screen.getByText(/Cohort percentile calculation pending baseline dataset/i)).toBeInTheDocument();
  });

  test("13. handles missing/null scorecard safely", () => {
    render(<TrialScorecardSection trialScorecard={null} />);

    expect(screen.getByText(/05 — Trial Mission Scorecard/i)).toBeInTheDocument();
    expect(screen.getByText(/Complete the Trial Mission to see your evidence scorecard./i)).toBeInTheDocument();
  });

  test("14. handles empty findings safely", () => {
    const noFindings = { ...fullScorecard, findings: [], findings_count: 0 };
    render(<TrialScorecardSection trialScorecard={noFindings} />);

    expect(screen.queryByRole("heading", { name: /Recorded Findings/i })).not.toBeInTheDocument();
    expect(screen.getByText("0 Recorded")).toBeInTheDocument();
  });

  test("15. handles empty decisions safely", () => {
    const noDecisions = { ...fullScorecard, decisions: [], decisions_count: 0 };
    render(<TrialScorecardSection trialScorecard={noDecisions} />);

    expect(screen.queryByRole("heading", { name: /Simulation Decisions/i })).not.toBeInTheDocument();
    expect(screen.getByText("0 Executed")).toBeInTheDocument();
  });

  test("16. handles missing competencies safely", () => {
    const noCompetencies = { ...fullScorecard, evaluated_competencies: {} };
    render(<TrialScorecardSection trialScorecard={noCompetencies} />);

    expect(screen.getByText(/No competency evidence is available yet./i)).toBeInTheDocument();
  });

  test("17. handles TRIAL_MISSION_COMPLETE_BUT_INSUFFICIENT_EVIDENCE without negative failure language", () => {
    const limitedTelemetry = {
      mission_title: "Bioreactor Scale-Up Simulation",
      mission_state: "TRIAL_MISSION_COMPLETE_BUT_INSUFFICIENT_EVIDENCE",
      duration_seconds: 600,
      findings_count: 1,
      decisions_count: 1,
      evaluated_competencies: {},
    };

    const { container } = render(<TrialScorecardSection trialScorecard={limitedTelemetry} />);

    expect(screen.getByText(/Limited Telemetry Recorded/i)).toBeInTheDocument();
    expect(screen.getByText(/Trial Mission completed, but the available evidence is limited/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\b(Failed|Failure|Poor Fit|Unsuitable|Low Potential)\b/i);
  });
});
