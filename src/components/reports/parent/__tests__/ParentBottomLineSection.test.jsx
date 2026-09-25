import React from "react";
import { render, screen } from "@testing-library/react";
import ParentBottomLineSection from "../ParentBottomLineSection";

describe("ParentBottomLineSection", () => {
  const mockBottomLine = {
    evidence_summary: "Alex demonstrates high aptitude and clear alignment with Software Engineering.",
    next_steps: [
      "Schedule a family discussion using the guided prompts.",
      "Review curriculum and stream prerequisites for upcoming academic terms.",
    ],
  };

  test("renders executive summary and next steps", () => {
    render(<ParentBottomLineSection bottomLine={mockBottomLine} />);
    expect(screen.getByText("The Bottom Line")).toBeInTheDocument();
    expect(
      screen.getByText("Alex demonstrates high aptitude and clear alignment with Software Engineering.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Schedule a family discussion using the guided prompts.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Review curriculum and stream prerequisites for upcoming academic terms.")
    ).toBeInTheDocument();
  });

  test("handles empty next steps safely", () => {
    render(
      <ParentBottomLineSection
        bottomLine={{ evidence_summary: "Alex is exploring.", next_steps: [] }}
      />
    );
    expect(screen.getByText("Alex is exploring.")).toBeInTheDocument();
    expect(
      screen.queryByText("Schedule a family discussion")
    ).not.toBeInTheDocument();
  });

  test("handles null prop safely", () => {
    render(<ParentBottomLineSection bottomLine={null} />);
    expect(screen.getByText("The Bottom Line")).toBeInTheDocument();
    expect(
      screen.getByText(/Summary takeaway is not currently available/i)
    ).toBeInTheDocument();
  });
});
