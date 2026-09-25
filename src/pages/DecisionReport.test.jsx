let mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useParams: () => ({ careerId: "bioprocess-engineer" }),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import DecisionReport from "./DecisionReport";
import * as reportsService from "../services/reports";

jest.mock("../services/reports");

const MOCK_TEASER_RESPONSE = {
  is_teaser: true,
  career_id: "bioprocess-engineer",
  career_name: "Bioprocess Engineer",
  student_name: "Alex",
  eligibility_status: "DISCOVERY_COMPLETE_TRIAL_MISSION_LOCKED",
  dimension_averages: {
    interest: 85,
    personality: 78,
  },
};

const MOCK_DISCOVERY_INCOMPLETE_RESPONSE = {
  report_metadata: {
    report_status: "INCOMPLETE",
    is_teaser: false,
  },
  student_report: null,
  teaser_summary: {
    status: "INCOMPLETE",
    career_name: "Bioprocess Engineer",
    message: "Discovery Test must be completed before report insights can be generated.",
  },
};

const MOCK_INCOMPLETE_TRIAL_REQUIRED_RESPONSE = {
  report_metadata: {
    report_status: "INCOMPLETE",
    is_teaser: false,
  },
  student_report: null,
  teaser_summary: {
    status: "INCOMPLETE",
    career_name: "Bioprocess Engineer",
    eligibility_status: "TRIAL_MISSION_REQUIRED",
    message: "Trial Mission must be completed to unlock the decision report.",
  },
};

const MOCK_READY_RESPONSE = {
  is_teaser: false,
  student_report: {
    snapshot: {
      career_name: "Bioprocess Engineer",
      one_liner: "Design and optimize industrial biological manufacturing systems.",
      recommendation_category: "STRONG_FIT",
      fit_index: 88.5,
      fit_tier: "HIGH_FIT",
      uncertainty: "LOW",
      exploration_maturity: "COMPLETED",
    },
    who_you_are: {
      personality_summary: "Alex exhibits robust intrinsic motivation for systematic process optimization.",
      dimensions: [
        { name: "Investigative", score: 85, level: "High", description: "Enjoys research." },
      ],
      defining_dimensions: ["Investigative"],
      weaker_dimensions: ["Artistic"],
      strengths: ["Laboratory Analysis", "Critical Reasoning"],
    },
    reality_check: {
      summary: {
        headline: "High technical alignment with emerging systems capability.",
        exploration_maturity: "HIGH",
        evidence_sufficiency: "SUFFICIENT",
      },
      discovery_interest: {
        interest_summary: "Demonstrated preference for technical analysis and structured experiments.",
        defining_dimensions: ["Investigative", "Realistic"],
      },
      demonstrated_evidence: {
        trial_strengths: [
          { target_key: "comp_systems_modeling", title: "Systems Modeling", demonstrated_level: 3.0 },
        ],
      },
    },
    job_reality: {
      work_activities: [
        { title: "Bioreactor Design & Scale-up", frequency: "Daily", importance: "Critical" },
      ],
      core_competencies: [
        { title: "Upstream Bioprocessing", domain: "TECHNICAL", level_required: "Expert" },
      ],
      day_in_the_life: [
        { time_block: "Morning (09:00 - 12:00)", activity: "Fermentation parameter monitoring and sensor calibration." },
      ],
    },
    trial_scorecard: {
      performance_score: 88,
      readiness_level: "High Readiness",
      tasks_completed: 3,
      total_tasks: 3,
      task_results: [
        { name: "Task 1: Media Preparation", score: 90, status: "Passed" },
        { name: "Task 2: Inoculation Control", score: 85, status: "Passed" },
      ],
    },
    market_outlook: {
      india_salary: {
        entry: "₹6-8 LPA",
        mid: "₹14-18 LPA",
        senior: "₹28-45 LPA",
      },
      demand_trend: "High Growth",
      demand_score: 88,
      demand_rationale: "Accelerated capacity expansion across biomanufacturing facilities.",
    },
    ai_impact: {
      automation_risk: "Low",
      automation_exposure: "AI assists in process parameter optimization, while physical wet lab execution requires human oversight.",
      future_proof_score: 92,
      human_skills: ["Biological Systems Intuition", "Experimental Troubleshooting"],
      long_term_status: "UNAVAILABLE",
    },
    path_forward: {
      stream_feasibility: "ELIGIBLE",
      student_stream: "Science (PCM)",
      required_streams: ["Science (PCM)", "Science (PCB)"],
      degrees: ["B.Tech Biotechnology", "B.Sc Microbiology"],
      guidance: "Alex's academic stream meets direct prerequisites for undergraduate biotechnology programs.",
    },
    alternatives: [
      {
        career_id: "fermentation-scientist",
        career_name: "Fermentation Scientist",
        relation_type: "EVIDENCE_BASED_ALTERNATIVE",
        existing_fit_tier: "HIGH_FIT",
        key_differentiator: "Strong laboratory and microbial culturing overlap.",
        evidence_source: "Decision Intelligence Recommendations",
      },
      {
        career_id: "biochemical-engineer",
        career_name: "Biochemical Engineer",
        relation_type: "SAME_CAREER_FAMILY",
        existing_fit_tier: "MODERATE_FIT",
        key_differentiator: "Shared biotechnology domain and fundamentals.",
        evidence_source: "Career Family Classification",
      },
    ],
    action_plan: {
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
        },
      ],
      has_explicit_timeframes: false,
    },
  },
  meta: {
    generated_at: "2026-09-22T10:00:00Z",
    version: "1.0",
  },
};

describe("DecisionReport Page Component", () => {
  jest.setTimeout(15000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. shows loading spinner initially", () => {
    reportsService.getDecisionReport.mockReturnValue(new Promise(() => {}));

    render(<DecisionReport />);

    expect(screen.getByText(/Synthesizing your Decision Report/i)).toBeInTheDocument();
  });

  test("2. renders teaser view when report is locked / pre-trial mission", async () => {
    reportsService.getDecisionReport.mockResolvedValue(MOCK_TEASER_RESPONSE);

    render(<DecisionReport />);

    await waitFor(() => {
      expect(screen.getByText(/Unlock Your Full Decision Report for Bioprocess Engineer/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Report Locked • Trial Mission Required/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Trial Mission/i)).toBeInTheDocument();
  });

  test("3. renders full report sections when report is ready", async () => {
    reportsService.getDecisionReport.mockResolvedValue(MOCK_READY_RESPONSE);

    render(<DecisionReport />);

    await waitFor(() => {
      expect(screen.getByText("Bioprocess Engineer")).toBeInTheDocument();
    });

    // Section 1: Snapshot
    expect(screen.getByText("01 — Snapshot")).toBeInTheDocument();
    expect(screen.getAllByText("HIGH FIT").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("STRONG FIT")).toBeInTheDocument();

    // Section 2: Who You Are
    expect(screen.getByText("02 — Who You Are")).toBeInTheDocument();
    expect(screen.getByText(/Alex exhibits robust intrinsic motivation/i)).toBeInTheDocument();

    // Section 3: Reality Check
    expect(screen.getByText("03 — Evidence Synthesis")).toBeInTheDocument();
    expect(screen.getByText("Reality Check")).toBeInTheDocument();
    expect(screen.getByText(/High technical alignment with emerging systems capability/i)).toBeInTheDocument();

    // Section 4: Job Reality
    expect(screen.getByText(/04 — Job Reality/i)).toBeInTheDocument();
    expect(screen.getByText("What the Job Actually Looks Like")).toBeInTheDocument();
    expect(screen.getByText("Bioreactor Design & Scale-up")).toBeInTheDocument();

    // Section 5: Trial Scorecard
    expect(screen.getByText(/05 — Trial Scorecard/i)).toBeInTheDocument();
    expect(screen.getByText("Trial Mission Scorecard")).toBeInTheDocument();

    // Section 6: Market Outlook
    expect(screen.getByText(/06 — Market Outlook/i)).toBeInTheDocument();
    expect(screen.getByText(/External Market Outlook & Compensation/i)).toBeInTheDocument();
    expect(screen.getAllByText("₹6-8 LPA").length).toBeGreaterThanOrEqual(1);

    // Section 7: AI Impact
    expect(screen.getByText(/07 — AI Impact/i)).toBeInTheDocument();
    expect(screen.getByText("How AI Will Reshape This Career")).toBeInTheDocument();
    expect(screen.getByText("92/100")).toBeInTheDocument();
    expect(screen.getByText("Biological Systems Intuition")).toBeInTheDocument();

    // Section 8: Path Forward
    expect(screen.getByText(/08 — Path Forward/i)).toBeInTheDocument();
    expect(screen.getByText("Your Path Forward")).toBeInTheDocument();
    expect(screen.getByText("Pathway Status: Eligible")).toBeInTheDocument();
    expect(screen.getAllByText("Deepen core chemistry and reaction kinetics understanding").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Advance bioprocess parameter simulation skills").length).toBeGreaterThanOrEqual(1);

    // Section 9: Alternatives
    expect(screen.getByText(/09 — Alternatives/i)).toBeInTheDocument();
    expect(screen.getByText("If Not This, Then What?")).toBeInTheDocument();
    expect(screen.getByText("Fermentation Scientist")).toBeInTheDocument();
    expect(screen.getByText("Biochemical Engineer")).toBeInTheDocument();

    // Section 10: Next 6–12 Months
    expect(screen.getByText(/10 — Forward Horizon/i)).toBeInTheDocument();
    expect(screen.getByText("Your Next 6–12 Months")).toBeInTheDocument();
    expect(screen.getByText("Evidence-Building Actions")).toBeInTheDocument();
  });

  test("4. renders error state with retry button on failure", async () => {
    reportsService.getDecisionReport.mockRejectedValue(new Error("Network timeout"));

    render(<DecisionReport />);

    await waitFor(() => {
      expect(screen.getByText(/Unable to Load Report/i)).toBeInTheDocument();
    });

    expect(screen.getByText("Network timeout")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Retry/i })).toBeInTheDocument();
  });

  test("5. renders discovery test required teaser when discovery is incomplete", async () => {
    reportsService.getDecisionReport.mockResolvedValue(MOCK_DISCOVERY_INCOMPLETE_RESPONSE);

    render(<DecisionReport />);

    await waitFor(() => {
      expect(screen.getByText(/Report Locked • Discovery Test Required/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Discovery Test must be completed before report insights can be generated/i)).toBeInTheDocument();
    expect(screen.getByText(/Complete Discovery Test/i)).toBeInTheDocument();
  });

  test("6. renders trial mission required teaser when report is incomplete but trial mission is required", async () => {
    reportsService.getDecisionReport.mockResolvedValue(MOCK_INCOMPLETE_TRIAL_REQUIRED_RESPONSE);

    render(<DecisionReport />);

    await waitFor(() => {
      expect(screen.getByText(/Unlock Your Full Decision Report for Bioprocess Engineer/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Report Locked • Trial Mission Required/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Trial Mission/i)).toBeInTheDocument();
    expect(screen.queryByText(/Complete Discovery Test/i)).not.toBeInTheDocument();
  });

  test("7. renders stale report alert banner when metadata is_stale is true", async () => {
    const staleResponse = {
      ...MOCK_READY_RESPONSE,
      report_metadata: {
        ...MOCK_READY_RESPONSE.report_metadata,
        is_stale: true,
        report_version: 1,
        latest_version: 2,
      },
    };
    reportsService.getDecisionReport.mockResolvedValue(staleResponse);

    render(<DecisionReport />);

    await waitFor(() => {
      expect(screen.getByTestId("stale-report-banner")).toBeInTheDocument();
    });

    expect(screen.getByText(/Newer Report Available:/i)).toBeInTheDocument();
    expect(screen.getByText(/Load Latest/i)).toBeInTheDocument();
  });
});
