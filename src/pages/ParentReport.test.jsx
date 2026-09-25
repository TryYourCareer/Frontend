jest.mock("react-router-dom", () => ({
  useParams: () => ({ careerId: "software-engineer" }),
  useNavigate: () => jest.fn(),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

jest.mock("../services/reports", () => ({
  getParentReport: jest.fn(),
}));

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ParentReport from "./ParentReport";
import { getParentReport } from "../services/reports";

describe("ParentReport Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCompleteReport = {
    report_metadata: {
      report_id: "rep_123",
      is_teaser: false,
    },
    parent_report: {
      snapshot: {
        career_name: "Software Engineer",
        student_name: "Alex",
        plain_language_summary: {
          headline: "Understanding Alex's Alignment with Software Engineer",
          narrative: "Alex demonstrates strong, evidence-backed alignment with Software Engineer.",
          recommendation_tone: "SUPPORTIVE_EXPLORATION",
        },
        fit_tier: "HIGH_FIT",
        exploration_maturity: "ADVANCED",
      },
      evidence_not_just_enthusiasm: {
        what_the_evidence_shows: "Simulation tasks indicate strong logical reasoning.",
        demonstrated_strengths: [{ title: "Code Analysis", score: 85 }],
        growth_areas: [{ title: "System Architecture", score: 60 }],
        untested_areas: [{ title: "Team Leadership" }],
      },
      how_this_compares: {
        career_reality_highlights: [
          "Software engineers spend significant time on code maintenance and testing.",
        ],
        work_dna_alignment: {
          work_dna_alignment: "HIGH_FIT",
          overlap_percentage: 82,
        },
      },
      will_ai_replace_job: {
        ai_risk_level: "MODERATE",
        future_proof_score: 82,
        human_strengths: ["Complex Problem Solving", "Strategic Architecture"],
        plain_language_guidance: "AI augments routine code generation while human architectural judgment remains essential.",
      },
      financial_outlook: {
        salary_progression: {
          available: true,
          india_lpa: { entry: "4.5", median: "8.5", senior: "18.0" },
          global_usd: { entry: "65,000", senior: "140,000" },
          narrative: "Salaries range from entry to senior compensation.",
          cost_and_roi_note: "Tuition costs vary significantly across institutions.",
        },
      },
      if_it_doesnt_work_out: {
        safe_pivot_alternatives: [
          {
            career_id: "data-scientist",
            career_name: "Data Scientist",
            rationale: "Strong math foundation overlap.",
            shared_competencies: ["Analytical Thinking"],
          },
        ],
      },
      parent_faq: [
        {
          question: "How reliable is this assessment?",
          answer: "This report is based on hands-on trial mission decisions.",
        },
      ],
      what_child_needs: {
        discussion_prompts: [
          {
            prompt_id: "p1",
            category: "GROWTH_AREA",
            question: "Would Alex like to spend time strengthening systems architecture?",
            context: "Simulation identified architecture as an opportunity.",
          },
        ],
        support_recommendations: [
          "Review discussion prompts together in an open conversation.",
        ],
      },
      bottom_line: {
        evidence_summary: "Alex demonstrates high aptitude and clear alignment.",
        next_steps: [
          "Schedule a family discussion using the guided prompts.",
        ],
      },
    },
  };

  test("renders loading state initially", () => {
    getParentReport.mockReturnValue(new Promise(() => {}));
    render(<ParentReport />);
    expect(screen.getByText("Synthesizing Parent Career Report...")).toBeInTheDocument();
  });

  test("renders error state when API fails", async () => {
    getParentReport.mockRejectedValue(new Error("Network connection error"));
    render(<ParentReport />);
    await waitFor(() => {
      expect(screen.getByText("Unable to Load Parent Report")).toBeInTheDocument();
      expect(screen.getByText("Network connection error")).toBeInTheDocument();
    });
  });

  test("renders teaser state when trial mission is not completed", async () => {
    getParentReport.mockResolvedValue({
      report_metadata: { is_teaser: true },
      is_teaser: true,
      teaser_summary: {
        status: "TEASER",
        career_name: "Software Engineer",
        message: "Complete the hands-on Trial Mission to unlock the full Decision Report and Parent Report.",
      },
    });

    render(<ParentReport />);
    await waitFor(() => {
      expect(screen.getByText("Parent Report Locked • Trial Mission Required")).toBeInTheDocument();
      expect(screen.getByText("Parent Report for Software Engineer")).toBeInTheDocument();
      expect(screen.getByText("View Trial Mission")).toBeInTheDocument();
    });
  });


  test("renders Export Report and Share buttons in ParentReport", async () => {
    getParentReport.mockResolvedValue(mockCompleteReport);
    window.print = jest.fn();

    render(<ParentReport />);

    await waitFor(() => {
      expect(screen.getByTestId("export-report-button")).toBeInTheDocument();
      expect(screen.getByTestId("share-report-button")).toBeInTheDocument();
    });

  });

  test("renders complete report with all 9 sections and switch link", async () => {
    getParentReport.mockResolvedValue(mockCompleteReport);
    render(<ParentReport />);

    await waitFor(() => {
      // Switch link
      expect(screen.getByText("Switch to Student Decision Report")).toBeInTheDocument();

      // Section 1: Snapshot
      expect(screen.getByText(/01 — Snapshot for Parents/i)).toBeInTheDocument();

      // Section 2: Evidence
      expect(screen.getByText("Evidence, Not Just Enthusiasm")).toBeInTheDocument();

      // Section 3: How This Compares
      expect(screen.getByText("How This Compares")).toBeInTheDocument();

      // Section 4: Will AI Replace This Job?
      expect(screen.getByText("Will AI Replace This Job?")).toBeInTheDocument();

      // Section 5: Financial
      expect(screen.getByText("What It Will Cost and When It Pays Off")).toBeInTheDocument();

      // Section 6: Alternatives
      expect(screen.getByText("What If It Doesn't Work Out?")).toBeInTheDocument();

      // Section 7: Parent FAQ / Common Parent Questions
      expect(screen.getByText(/Common Parent Questions|Frequently Asked Questions/i)).toBeInTheDocument();

      // Section 8: What Your Child Needs From You
      expect(screen.getByText("What Your Child Needs From You")).toBeInTheDocument();

      // Section 9: Bottom Line
      expect(screen.getByText("The Bottom Line")).toBeInTheDocument();
    });
  });
});
