jest.mock("react-router-dom", () => ({
  useParams: () => ({ careerId: "software-engineer" }),
  useNavigate: () => jest.fn(),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

jest.mock("../../services/reports", () => ({
  getCanonicalReport: jest.fn(),
  getDecisionReport: jest.fn(),
  getParentReport: jest.fn(),
}));

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import DecisionReport from "../DecisionReport";
import * as reportsService from "../../services/reports";

describe("Phase 1: Canonical Report Architecture & Zero-Refetch Toggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const MOCK_CANONICAL_REPORT = {
    report_metadata: {
      report_id: "rep_canonical_001",
      is_teaser: false,
    },
    student_report: {
      snapshot: {
        career_name: "Software Engineer",
        one_liner: "Design and build software systems.",
        recommendation_category: "STRONG_FIT",
        fit_index: 91.0,
        fit_tier: "HIGH_FIT",
        uncertainty: "LOW",
        exploration_maturity: "COMPLETED",
      },
      who_you_are: {
        personality_summary: "Strong analytical builder profile.",
        dimensions: [{ name: "Investigative", score: 90, level: "High" }],
      },
      reality_check: {
        summary: { headline: "Strong technical alignment." },
        development_gaps: [],
      },
      job_reality: {
        work_activities: [{ title: "System Architecture Design" }],
      },
      trial_scorecard: {
        performance_score: 92,
      },
      market_outlook: {
        india_salary: { entry: "₹8-12 LPA" },
      },
      ai_impact: {
        automation_risk: "Low",
        future_proof_score: 90,
      },
      path_forward: {
        stream_feasibility: "ELIGIBLE",
      },
      alternatives: [],
      action_plan: {
        ordered_steps: [{ title: "Complete Advanced Simulation" }],
      },
    },
    parent_report: {
      snapshot: {
        career_name: "Software Engineer",
        student_name: "Alex",
        plain_language_summary: {
          headline: "Understanding Alex's Alignment with Software Engineer",
          narrative: "Alex demonstrates strong, evidence-backed alignment.",
        },
        fit_tier: "HIGH_FIT",
        exploration_maturity: "ADVANCED",
      },
      evidence_not_just_enthusiasm: {
        what_the_evidence_shows: "Simulation tasks indicate strong logical reasoning.",
        demonstrated_strengths: [],
        growth_areas: [],
        untested_areas: [],
      },
      how_this_compares: {},
      will_ai_replace_job: {
        ai_risk_level: "LOW",
      },
      financial_outlook: {},
      if_it_doesnt_work_out: {},
      parent_faq: [],
      what_child_needs: {
        discussion_prompts: [],
        support_recommendations: [],
      },
      bottom_line: {
        evidence_summary: "High aptitude and clear alignment.",
        next_steps: [],
      },
    },
  };

  test("A & F. Fetches canonical report exactly once on initial mount and shares payload across views", async () => {
    reportsService.getCanonicalReport.mockResolvedValue(MOCK_CANONICAL_REPORT);

    render(<DecisionReport initialView="student" />);

    await waitFor(() => {
      expect(screen.getByText("01 — Snapshot")).toBeInTheDocument();
    });

    // Exactly 1 fetch
    expect(reportsService.getCanonicalReport).toHaveBeenCalledTimes(1);
    expect(reportsService.getCanonicalReport).toHaveBeenCalledWith("software-engineer");
  });

  test("B. Student view renders student_report sections", async () => {
    reportsService.getCanonicalReport.mockResolvedValue(MOCK_CANONICAL_REPORT);

    render(<DecisionReport initialView="student" />);

    await waitFor(() => {
      expect(screen.getByText("01 — Snapshot")).toBeInTheDocument();
    });

    expect(screen.getByText("02 — Who You Are")).toBeInTheDocument();
    expect(screen.getByText("03 — Evidence Synthesis")).toBeInTheDocument();
    expect(screen.getByText(/04 — Job Reality/i)).toBeInTheDocument();
  });

  test("C. Parent view renders parent_report sections when initialView is parent", async () => {
    reportsService.getCanonicalReport.mockResolvedValue(MOCK_CANONICAL_REPORT);

    render(<DecisionReport initialView="parent" />);

    await waitFor(() => {
      expect(screen.getByText(/01 — Snapshot for Parents/i)).toBeInTheDocument();
    });

    expect(screen.getByText("Evidence, Not Just Enthusiasm")).toBeInTheDocument();
    expect(screen.getByText("Will AI Replace This Job?")).toBeInTheDocument();
    expect(screen.getByText("The Bottom Line")).toBeInTheDocument();
  });

  test("D & E. Switching Student ↔ Parent switches view immediately with ZERO additional API calls", async () => {
    reportsService.getCanonicalReport.mockResolvedValue(MOCK_CANONICAL_REPORT);

    render(<DecisionReport initialView="student" />);

    // 1. Initially student view loaded
    await waitFor(() => {
      expect(screen.getByText("01 — Snapshot")).toBeInTheDocument();
    });
    expect(reportsService.getCanonicalReport).toHaveBeenCalledTimes(1);

    // 2. Switch to Parent view
    const parentToggle = screen.getByTestId("parent-view-toggle");
    fireEvent.click(parentToggle);

    // Parent sections rendered immediately
    expect(screen.getByText(/01 — Snapshot for Parents/i)).toBeInTheDocument();
    expect(screen.getByText("Evidence, Not Just Enthusiasm")).toBeInTheDocument();

    // Verification: NO second API call
    expect(reportsService.getCanonicalReport).toHaveBeenCalledTimes(1);

    // 3. Switch back to Student view
    const studentToggle = screen.getByTestId("student-view-toggle");
    fireEvent.click(studentToggle);

    // Student sections rendered immediately
    expect(screen.getByText("01 — Snapshot")).toBeInTheDocument();

    // Verification: STILL NO additional API calls
    expect(reportsService.getCanonicalReport).toHaveBeenCalledTimes(1);
  });

  test("G. Teaser / incomplete report continues to render proper locked state", async () => {
    reportsService.getCanonicalReport.mockResolvedValue({
      report_metadata: { is_teaser: true, report_status: "TEASER" },
      teaser_summary: {
        status: "TEASER",
        career_name: "Software Engineer",
        message: "Complete the trial mission to unlock report.",
      },
    });

    render(<DecisionReport initialView="student" />);

    await waitFor(() => {
      expect(screen.getByTestId("decision-report-teaser")).toBeInTheDocument();
    });

    expect(screen.getByText("Unlock Your Full Decision Report for Software Engineer")).toBeInTheDocument();
  });
});
