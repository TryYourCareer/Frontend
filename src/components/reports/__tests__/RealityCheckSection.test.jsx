import React from "react";
import { render, screen } from "@testing-library/react";
import RealityCheckSection from "../RealityCheckSection";

describe("RealityCheckSection", () => {
  const fullRealityCheck = {
    summary: {
      headline: "Strong investigative interest with emerging process optimization competency.",
      narrative: "Your high scientific inquiry aligns well with bioprocess requirements, while systems simulation highlights a targeted development opportunity.",
      exploration_maturity: "HIGH",
      evidence_sufficiency: "SUFFICIENT",
    },
    discovery_interest: {
      interest_summary: "Analytical problem solver with strong investigative drive.",
      defining_dimensions: ["Investigative", "Realistic"],
    },
    demonstrated_evidence: {
      trial_strengths: [
        {
          target_key: "comp_systems_modeling",
          title: "Systems Modeling",
          demonstrated_level: 3.0,
        },
      ],
      work_behaviors: [
        { signal_type: "deep_analysis", score: 0.88 },
      ],
    },
    career_requirements: {
      required_competencies: ["Systems Modeling", "Process Control"],
      key_work_activities: [
        { title: "Bioreactor Maintenance" },
        { title: "Quality Control Testing" },
      ],
      work_dna: {
        cognitive_complexity: 4,
        quantitative_intensity: 4,
      },
    },
    areas_of_alignment: [
      {
        key: "comp_systems_modeling",
        title: "Systems Modeling",
        level: 3.0,
        rationale: "Demonstrated solid competence during bioreactor simulation.",
      },
    ],
    development_gaps: [
      {
        target_key: "comp_process_control",
        title: "Process Control Optimization",
        state: "DEMONSTRATED_GROWTH_AREA",
        current_level: 2.0,
        target_level: 3.0,
        rationale: "Demonstrated Level 2.0 is below target Level 3.0.",
      },
    ],
    areas_not_yet_tested: [
      {
        key: "comp_fermentation",
        title: "Industrial Fermentation",
        rationale: "Not evaluated in current trial mission version.",
      },
    ],
    uncertainty: {
      classification: "LOW",
      evidence_coverage_ratio: 0.85,
      rationale: "Evidence basis is robust across Discovery and hands-on simulation.",
    },
    evidence_limitations: "Additional trial repetitions recommended to confirm long-term consistency.",
  };

  test("1. Reality Check renders when backend data exists", () => {
    render(<RealityCheckSection realityCheck={fullRealityCheck} />);
    expect(screen.getByText("Reality Check")).toBeInTheDocument();
    expect(screen.getByText(/03 — Evidence Synthesis/i)).toBeInTheDocument();
  });

  test("2. Backend headline/summary is displayed", () => {
    render(<RealityCheckSection realityCheck={fullRealityCheck} />);
    expect(
      screen.getByText("Strong investigative interest with emerging process optimization competency.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Your high scientific inquiry aligns well with bioprocess requirements/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Maturity: HIGH")).toBeInTheDocument();
    expect(screen.getByText("Evidence: SUFFICIENT")).toBeInTheDocument();
  });

  test("3. Discovery evidence is displayed when supplied", () => {
    render(<RealityCheckSection realityCheck={fullRealityCheck} />);
    expect(screen.getByText("Discovery Evidence")).toBeInTheDocument();
    expect(
      screen.getByText('"Analytical problem solver with strong investigative drive."')
    ).toBeInTheDocument();
    expect(screen.getByText("Investigative")).toBeInTheDocument();
    expect(screen.getByText("Realistic")).toBeInTheDocument();
  });

  test("4. Trial evidence is displayed when supplied", () => {
    render(<RealityCheckSection realityCheck={fullRealityCheck} />);
    expect(screen.getByText("Demonstrated Evidence")).toBeInTheDocument();
    expect(screen.getAllByText("Systems Modeling").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Level 3").length).toBeGreaterThanOrEqual(1);
  });

  test("5. Career requirement evidence is displayed when supplied", () => {
    render(<RealityCheckSection realityCheck={fullRealityCheck} />);
    expect(screen.getByText("Career Requirements")).toBeInTheDocument();
    expect(screen.getByText("Process Control")).toBeInTheDocument();
    expect(screen.getByText("Bioreactor Maintenance")).toBeInTheDocument();
    expect(screen.getByText("Quality Control Testing")).toBeInTheDocument();
  });

  test("6. Development gaps are displayed when supplied with exact backend state", () => {
    render(<RealityCheckSection realityCheck={fullRealityCheck} />);
    expect(screen.getByText("Development Gaps")).toBeInTheDocument();
    expect(screen.getByText("Process Control Optimization")).toBeInTheDocument();
    expect(screen.getByText("Demonstrated Growth Area")).toBeInTheDocument();
    expect(screen.getByText("Current: 2 • Target: 3")).toBeInTheDocument();
    expect(
      screen.getByText("Demonstrated Level 2.0 is below target Level 3.0.")
    ).toBeInTheDocument();
  });

  test("7. Uncertainty/evidence strength is displayed when supplied", () => {
    render(<RealityCheckSection realityCheck={fullRealityCheck} />);
    expect(screen.getByText("Evidence Strength & Limitations")).toBeInTheDocument();
    expect(screen.getByText("LOW Uncertainty")).toBeInTheDocument();
    expect(screen.getByText("Coverage: 85%")).toBeInTheDocument();
  });

  test("8. Evidence limitations are displayed when supplied", () => {
    render(<RealityCheckSection realityCheck={fullRealityCheck} />);
    expect(
      screen.getByText("Additional trial repetitions recommended to confirm long-term consistency.")
    ).toBeInTheDocument();
  });

  test("9. Missing optional fields do not crash", () => {
    const minimalRealityCheck = {
      summary: {
        headline: "Preliminary Overview",
      },
    };
    render(<RealityCheckSection realityCheck={minimalRealityCheck} />);
    expect(screen.getByText("Preliminary Overview")).toBeInTheDocument();
    expect(screen.getByText("Narrative summary not available yet.")).toBeInTheDocument();
  });

  test("10. Empty/null evidence does not become fake zero values", () => {
    const emptyEvidenceRealityCheck = {
      summary: {
        headline: "Initial Assessment",
      },
      development_gaps: [],
      uncertainty: null,
    };
    render(<RealityCheckSection realityCheck={emptyEvidenceRealityCheck} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  test("11. No frontend-generated poor fit or strong fit conclusion is introduced", () => {
    render(<RealityCheckSection realityCheck={fullRealityCheck} />);
    expect(screen.queryByText(/poor fit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/not suitable/i)).not.toBeInTheDocument();
  });

  test("12. No new score is calculated", () => {
    render(<RealityCheckSection realityCheck={fullRealityCheck} />);
    expect(screen.queryByText(/Reality Check Score/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Fit Percentage/i)).not.toBeInTheDocument();
  });

  test("13. Null Reality Check has an explicit unavailable state", () => {
    render(<RealityCheckSection realityCheck={null} />);
    expect(
      screen.getByText("Reality Check evidence is not available yet.")
    ).toBeInTheDocument();
  });

  test("14. Regression: Never leaks internal target_key into UI when title exists", () => {
    const internalKeyRealityCheck = {
      summary: {
        headline: "Calibration Overview",
      },
      demonstrated_evidence: {
        trial_strengths: [
          {
            target_key: "comp_secret_internal_strength_key",
            title: "Fermentation Monitoring",
            demonstrated_level: 2.5,
          },
        ],
      },
      development_gaps: [
        {
          target_key: "comp_secret_internal_gap_key",
          title: "Process Control Optimization",
          state: "DEMONSTRATED_GROWTH_AREA",
          rationale: "Target level exceeds demonstrated level.",
        },
      ],
      areas_of_alignment: [
        {
          key: "comp_secret_internal_alignment_key",
          title: "Aseptic Technique",
        },
      ],
      areas_not_yet_tested: [
        {
          key: "comp_secret_internal_untested_key",
          title: "Scale-up Architecture",
        },
      ],
    };

    render(<RealityCheckSection realityCheck={internalKeyRealityCheck} />);

    // Assert human-readable titles are rendered
    expect(screen.getByText("Fermentation Monitoring")).toBeInTheDocument();
    expect(screen.getByText("Process Control Optimization")).toBeInTheDocument();
    expect(screen.getByText("Aseptic Technique")).toBeInTheDocument();
    expect(screen.getByText("Scale-up Architecture")).toBeInTheDocument();

    // Assert internal keys are NOT rendered
    expect(screen.queryByText("comp_secret_internal_strength_key")).not.toBeInTheDocument();
    expect(screen.queryByText("comp_secret_internal_gap_key")).not.toBeInTheDocument();
    expect(screen.queryByText("comp_secret_internal_alignment_key")).not.toBeInTheDocument();
    expect(screen.queryByText("comp_secret_internal_untested_key")).not.toBeInTheDocument();
  });

  test("15. Regression: Never leaks internal target_key when title is missing", () => {
    const missingTitleRealityCheck = {
      summary: {
        headline: "Calibration Overview",
      },
      demonstrated_evidence: {
        trial_strengths: [
          {
            target_key: "comp_secret_internal_strength_key",
            demonstrated_level: 2.0,
          },
        ],
      },
      development_gaps: [
        {
          target_key: "comp_secret_internal_gap_key",
          state: "DEMONSTRATED_GROWTH_AREA",
          rationale: "Growth opportunity identified.",
        },
      ],
      areas_of_alignment: [
        {
          key: "comp_secret_internal_alignment_key",
        },
      ],
      areas_not_yet_tested: [
        {
          key: "comp_secret_internal_untested_key",
        },
      ],
    };

    render(<RealityCheckSection realityCheck={missingTitleRealityCheck} />);

    // Assert human-safe fallbacks are rendered
    expect(screen.getByText("Demonstrated Competency")).toBeInTheDocument();
    expect(screen.getByText("Development Area")).toBeInTheDocument();
    expect(screen.getByText("Aligned Competency")).toBeInTheDocument();
    expect(screen.getByText("Untested Area")).toBeInTheDocument();

    // Assert internal keys are NOT rendered
    expect(screen.queryByText("comp_secret_internal_strength_key")).not.toBeInTheDocument();
    expect(screen.queryByText("comp_secret_internal_gap_key")).not.toBeInTheDocument();
    expect(screen.queryByText("comp_secret_internal_alignment_key")).not.toBeInTheDocument();
    expect(screen.queryByText("comp_secret_internal_untested_key")).not.toBeInTheDocument();
  });
});
