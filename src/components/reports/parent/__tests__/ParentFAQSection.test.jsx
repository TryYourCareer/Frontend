import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ParentFAQSection, { answerParentQuestion } from "../ParentFAQSection";

describe("ParentFAQSection", () => {
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
  };

  test("1. renders Common Parent Questions header and predefined questions in accordion", () => {
    render(<ParentFAQSection parentFaq={mockFaqs} parentReport={mockParentReport} />);

    expect(screen.getByTestId("parent-faq-section")).toBeInTheDocument();
    expect(screen.getByText(/Common Parent Questions/i)).toBeInTheDocument();
    expect(screen.getByText("How reliable is this assessment for Software Engineer?")).toBeInTheDocument();
    expect(screen.getByText("What if my child changes their mind?")).toBeInTheDocument();
  });

  test("2. does NOT render free-text search/input form on mobile or desktop", () => {
    render(<ParentFAQSection parentFaq={mockFaqs} parentReport={mockParentReport} />);

    expect(screen.queryByTestId("parent-qa-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("parent-qa-submit")).not.toBeInTheDocument();
    expect(screen.queryByTestId("parent-qa-form")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  test("3. expanding and collapsing predefined questions works properly", () => {
    render(<ParentFAQSection parentFaq={mockFaqs} parentReport={mockParentReport} />);

    // First question is initially open
    expect(
      screen.getByText("This report is based on hands-on trial mission decisions and rubric evaluations.")
    ).toBeInTheDocument();

    const firstQuestionBtn = screen.getByText("How reliable is this assessment for Software Engineer?");
    // Click to collapse
    fireEvent.click(firstQuestionBtn);
    expect(
      screen.queryByText("This report is based on hands-on trial mission decisions and rubric evaluations.")
    ).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(firstQuestionBtn);
    expect(
      screen.getByText("This report is based on hands-on trial mission decisions and rubric evaluations.")
    ).toBeInTheDocument();
  });

  test("4. expanding second question reveals its answer", () => {
    render(<ParentFAQSection parentFaq={mockFaqs} parentReport={mockParentReport} />);

    const secondQuestionBtn = screen.getByText("What if my child changes their mind?");
    fireEvent.click(secondQuestionBtn);

    expect(
      screen.getByText("Core skills evaluated here are transferable to related fields.")
    ).toBeInTheDocument();
  });

  test("5. handles empty or null parentFaq safely with defaults", () => {
    render(<ParentFAQSection parentFaq={null} parentReport={null} />);
    expect(screen.getByText(/Common Parent Questions/i)).toBeInTheDocument();
    expect(screen.getByText(/Is this just a trend\/phase, or a genuine career\?/i)).toBeInTheDocument();
  });

  test("6. deterministic grounding helper answerParentQuestion function still works if imported", () => {
    const res = answerParentQuestion("Why was this career identified for my child?", mockParentReport);
    expect(res).not.toBeNull();
    expect(res.isGrounded).toBe(true);
    expect(res.sourceSection).toBe("01 • Executive Snapshot");
  });
});
