import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ParentFAQSection from "../ParentFAQSection";

describe("ParentFAQSection & Interactive Parent AI Q&A", () => {
  const mockFaqs = [
    {
      question: "How reliable is this assessment for Software Engineer?",
      answer: "This report is based on hands-on trial mission decisions and rubric evaluations.",
    },
    {
      question: "What if my child changes their mind?",
      answer: "Core skills evaluated here are transferable to related fields.",
    },
  ];

  const mockParentReport = {
    snapshot: {
      career_name: "Bioprocess Engineer",
      student_name: "Alex",
      fit_tier: "HIGH_FIT",
      exploration_maturity: "Substantial Evidence",
      plain_language_summary: {
        narrative: "Alex demonstrates exceptionally high systems aptitude and analytical alignment with Bioprocess Engineering.",
      },
    },
    evidence_not_just_enthusiasm: {
      what_the_evidence_shows: "Hands-on bioreactor parameters optimization showed consistent methodical precision.",
      demonstrated_strengths: [
        "Parameter control and optimization",
        "Systematic problem solving under failure conditions",
      ],
      growth_areas: ["Advanced kinetic reaction kinetics modeling"],
      untested_areas: ["Cross-functional enterprise communication"],
    },
    how_this_compares: {
      career_reality_highlights: ["Laboratory scale-up simulations and chemical safety protocols."],
    },
    will_ai_replace_job: {
      ai_risk_level: "Low",
      future_proof_score: 92,
      plain_language_guidance: "Biological systems wet-lab execution and critical experimental intuition remain highly resistant to AI automation.",
      human_strengths: ["Wet-lab tactile manipulation", "Iterative hypothesis formation"],
    },
    financial_outlook: {
      salary_progression: {
        india_lpa: {
          entry: "₹6-8 LPA",
          median: "₹18-24 LPA",
          experienced: "₹35+ LPA",
        },
      },
      cost_and_roi_note: "Strong return on four-year B.Tech biotechnology programs in high-growth industrial biotechnology sectors.",
    },
    if_it_doesnt_work_out: {
      safe_pivot_alternatives: [
        {
          career_name: "Fermentation Scientist",
          key_differentiator: "Direct laboratory microbial culture overlap.",
        },
      ],
    },
    what_child_needs: {
      discussion_prompts: [
        {
          question: "How did you find the balance between computational models and wet-lab work?",
        },
      ],
      support_recommendations: ["Encourage small-scale DIY microbiology lab kits."],
    },
    bottom_line: {
      next_steps: ["Explore top biotechnology universities offering hands-on pilot plants."],
    },
  };

  test("1. question input and example question chips render", () => {
    render(<ParentFAQSection parentFaq={mockFaqs} parentReport={mockParentReport} />);

    expect(screen.getByTestId("parent-ai-qa-card")).toBeInTheDocument();
    expect(screen.getByTestId("parent-qa-input")).toBeInTheDocument();
    expect(screen.getByTestId("parent-qa-submit")).toBeInTheDocument();
    expect(screen.getByText("Why was this career identified for my child?")).toBeInTheDocument();
    expect(screen.getByText("What strengths did the trial mission demonstrate?")).toBeInTheDocument();
  });

  test("2. clicking an example question submits and renders a grounded answer", () => {
    render(<ParentFAQSection parentFaq={mockFaqs} parentReport={mockParentReport} />);

    const exampleBtn = screen.getByText("What strengths did the trial mission demonstrate?");
    fireEvent.click(exampleBtn);

    expect(screen.getByTestId("parent-qa-answer-container")).toBeInTheDocument();
    expect(screen.getByText(/Observed Trial Mission Evidence/i)).toBeInTheDocument();
    expect(screen.getByText(/Parameter control and optimization/i)).toBeInTheDocument();
    expect(screen.getByText(/Source: 02 • Evidence, Not Just Enthusiasm/i)).toBeInTheDocument();
  });

  test("3. typing a supported question renders grounded answer from canonical report data", () => {
    render(<ParentFAQSection parentFaq={mockFaqs} parentReport={mockParentReport} />);

    const input = screen.getByTestId("parent-qa-input");
    fireEvent.change(input, { target: { value: "Will AI replace this job?" } });

    const submitBtn = screen.getByTestId("parent-qa-submit");
    fireEvent.click(submitBtn);

    expect(screen.getByTestId("parent-qa-answer-container")).toBeInTheDocument();
    expect(screen.getByText(/Automation Exposure: Low • Future-Proof Score: 92\/100/i)).toBeInTheDocument();
    expect(screen.getByText(/Biological systems wet-lab execution and critical experimental intuition/i)).toBeInTheDocument();
    expect(screen.getByText(/Source: 04 • AI Impact & Career Durability/i)).toBeInTheDocument();
  });

  test("4. questions about financial salary render verified canonical salary figures", () => {
    render(<ParentFAQSection parentFaq={mockFaqs} parentReport={mockParentReport} />);

    const input = screen.getByTestId("parent-qa-input");
    fireEvent.change(input, { target: { value: "What is the expected salary and ROI?" } });

    fireEvent.click(screen.getByTestId("parent-qa-submit"));

    expect(screen.getByTestId("parent-qa-answer-container")).toBeInTheDocument();
    expect(screen.getByText(/Entry Level: ₹6-8 LPA/i)).toBeInTheDocument();
    expect(screen.getByText(/Median Level: ₹18-24 LPA/i)).toBeInTheDocument();
    expect(screen.getByText(/Experienced: ₹35\+ LPA/i)).toBeInTheDocument();
    expect(screen.getByText(/Source: 05 • Financial Realities & ROI/i)).toBeInTheDocument();
  });

  test("5. unsupported question produces an explicit unavailable response", () => {
    render(<ParentFAQSection parentFaq={mockFaqs} parentReport={mockParentReport} />);

    const input = screen.getByTestId("parent-qa-input");
    fireEvent.change(input, { target: { value: "What is the horoscope prediction for 2035?" } });

    fireEvent.click(screen.getByTestId("parent-qa-submit"));

    expect(screen.getByTestId("parent-qa-answer-container")).toBeInTheDocument();
    expect(
      screen.getByText(/This report does not currently contain enough verified evidence to answer that specific question/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Insufficient Report Evidence/i)).toBeInTheDocument();
  });

  test("6. missing data does NOT convert to 0 or fabricate percentiles/rankings", () => {
    const emptyParentReport = {
      snapshot: { career_name: "Pilot" },
    };

    render(<ParentFAQSection parentFaq={mockFaqs} parentReport={emptyParentReport} />);

    const input = screen.getByTestId("parent-qa-input");
    fireEvent.change(input, { target: { value: "What is the AI automation score?" } });
    fireEvent.click(screen.getByTestId("parent-qa-submit"));

    // Check that missing score did not become 0
    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^0\/100$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/percentile rank/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/AI impact and automation risk analysis is currently unavailable/i)
    ).toBeInTheDocument();
  });

  test("7. supports clearing the Q&A answer", () => {
    render(<ParentFAQSection parentFaq={mockFaqs} parentReport={mockParentReport} />);

    const exampleBtn = screen.getByText("Why was this career identified for my child?");
    fireEvent.click(exampleBtn);
    expect(screen.getByTestId("parent-qa-answer-container")).toBeInTheDocument();

    const clearBtn = screen.getByTestId("parent-qa-clear");
    fireEvent.click(clearBtn);

    expect(screen.queryByTestId("parent-qa-answer-container")).not.toBeInTheDocument();
  });

  test("8. standard FAQ accordion remains fully functional", () => {
    render(<ParentFAQSection parentFaq={mockFaqs} parentReport={mockParentReport} />);

    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
    expect(screen.getByText("How reliable is this assessment for Software Engineer?")).toBeInTheDocument();

    const questionBtn = screen.getByText("How reliable is this assessment for Software Engineer?");
    // Click to collapse
    fireEvent.click(questionBtn);
    expect(
      screen.queryByText("This report is based on hands-on trial mission decisions and rubric evaluations.")
    ).not.toBeInTheDocument();
    // Click to expand
    fireEvent.click(questionBtn);
    expect(
      screen.getByText("This report is based on hands-on trial mission decisions and rubric evaluations.")
    ).toBeInTheDocument();
  });

  test("9. handles empty or null parentFaq safely", () => {
    render(<ParentFAQSection parentFaq={null} parentReport={null} />);
    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
  });

  test("10. resolves backup options correctly from parentReport or reportData", () => {
    render(<ParentFAQSection parentFaq={mockFaqs} parentReport={mockParentReport} />);

    const input = screen.getByTestId("parent-qa-input");
    fireEvent.change(input, { target: { value: "What are the backup career options?" } });
    fireEvent.click(screen.getByTestId("parent-qa-submit"));

    expect(screen.getByTestId("parent-qa-answer-container")).toBeInTheDocument();
    expect(screen.getByText(/Evidence-Based Safe Pivot Alternatives/i)).toBeInTheDocument();
    expect(screen.getByText(/Fermentation Scientist/i)).toBeInTheDocument();
  });

  test("11. resolves grounded responses from reportData when parentReport is minimal", () => {
    const mockReportData = {
      career_name: "Typography Designer",
      student_name: "Alex",
      student_report: {
        snapshot: {
          one_liner: "Strong creative-technical design alignment.",
          fit_tier: "EXPLORATORY",
        },
        trial_scorecard: {
          what_the_evidence_shows: "Demonstrated strong layout hierarchy and font balancing.",
          demonstrated_strengths: ["Type Hierarchy", "Font Pairing"],
        },
        alternatives: [
          { career_name: "UI/UX Designer", match_reason: "Direct digital interface overlap" },
        ],
      },
    };

    render(<ParentFAQSection reportData={mockReportData} />);

    // Test Backup question
    const backupBtn = screen.getByText("What are the backup career options?");
    fireEvent.click(backupBtn);

    expect(screen.getByTestId("parent-qa-answer-container")).toBeInTheDocument();
    expect(screen.getByText(/UI\/UX Designer/i)).toBeInTheDocument();
    expect(screen.queryByText(/Insufficient Report Evidence/i)).not.toBeInTheDocument();
  });
});
