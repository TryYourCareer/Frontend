import React from "react";
import { render, screen } from "@testing-library/react";
import ParentWhatChildNeedsSection from "../ParentWhatChildNeedsSection";

describe("ParentWhatChildNeedsSection", () => {
  const mockNeeds = {
    discussion_prompts: [
      {
        prompt_id: "prompt_1",
        category: "GROWTH_AREA",
        question: "Would Alex like to spend time strengthening systems architecture through a project?",
        context: "Simulation results identified architecture as a growth opportunity.",
      },
      {
        prompt_id: "prompt_2",
        category: "PATHWAY",
        question: "Are there specific college degree programs in software engineering Alex wants to explore?",
        context: "Prerequisites require early course selection.",
      },
    ],
    support_recommendations: [
      "Review the identified discussion prompts together in an open conversation.",
      "Support hands-on exploration of related courses or projects.",
    ],
  };

  test("renders section with discussion prompts and support recommendations", () => {
    render(<ParentWhatChildNeedsSection whatChildNeeds={mockNeeds} />);
    expect(screen.getByText("What Your Child Needs From You")).toBeInTheDocument();
    expect(
      screen.getByText('"Would Alex like to spend time strengthening systems architecture through a project?"')
    ).toBeInTheDocument();
    expect(
      screen.getByText("Context: Simulation results identified architecture as a growth opportunity.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Review the identified discussion prompts together in an open conversation.")
    ).toBeInTheDocument();
  });

  test("handles empty prompts safely", () => {
    render(
      <ParentWhatChildNeedsSection
        whatChildNeeds={{ discussion_prompts: [], support_recommendations: [] }}
      />
    );
    expect(
      screen.getByText(/No specific discussion prompts generated/i)
    ).toBeInTheDocument();
  });

  test("handles null prop safely", () => {
    render(<ParentWhatChildNeedsSection whatChildNeeds={null} />);
    expect(screen.getByText("What Your Child Needs From You")).toBeInTheDocument();
    expect(
      screen.getByText(/Guidance on family discussion prompts is not currently available/i)
    ).toBeInTheDocument();
  });
});
