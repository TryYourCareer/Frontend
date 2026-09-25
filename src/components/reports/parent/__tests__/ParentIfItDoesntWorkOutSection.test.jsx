import React from "react";
import { render, screen } from "@testing-library/react";
import ParentIfItDoesntWorkOutSection from "../ParentIfItDoesntWorkOutSection";

describe("ParentIfItDoesntWorkOutSection", () => {
  const mockAlternatives = {
    safe_pivot_alternatives: [
      {
        career_id: "data-scientist",
        career_name: "Data Scientist",
        rationale: "Strong mathematical foundation and analytical thinking overlap.",
        shared_competencies: ["Analytical Thinking", "Problem Solving"],
      },
      {
        career_id: "product-manager",
        career_name: "Product Manager",
        rationale: "Leverages technical literacy with cross-functional communication.",
        shared_competencies: ["Communication", "Decision Making"],
      },
    ],
  };

  test("renders full section with heading and alternatives", () => {
    render(<ParentIfItDoesntWorkOutSection ifItDoesntWorkOut={mockAlternatives} />);
    expect(screen.getByText("What If It Doesn't Work Out?")).toBeInTheDocument();
    expect(screen.getByText("Data Scientist")).toBeInTheDocument();
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
    expect(
      screen.getByText("Strong mathematical foundation and analytical thinking overlap.")
    ).toBeInTheDocument();
    expect(screen.getByText("Analytical Thinking")).toBeInTheDocument();
  });

  test("preserves backend ordering without re-ranking or similarity calculations", () => {
    render(<ParentIfItDoesntWorkOutSection ifItDoesntWorkOut={mockAlternatives} />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings[0]).toHaveTextContent("Data Scientist");
    expect(headings[1]).toHaveTextContent("Product Manager");
    expect(screen.queryByText(/best alternative/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/95% similarity/i)).not.toBeInTheDocument();
  });

  test("handles empty alternatives list safely", () => {
    render(
      <ParentIfItDoesntWorkOutSection
        ifItDoesntWorkOut={{ safe_pivot_alternatives: [] }}
      />
    );
    expect(
      screen.getByText(/No alternative career pivots are currently listed/i)
    ).toBeInTheDocument();
  });

  test("handles null prop safely", () => {
    render(<ParentIfItDoesntWorkOutSection ifItDoesntWorkOut={null} />);
    expect(screen.getByText("What If It Doesn't Work Out?")).toBeInTheDocument();
    expect(
      screen.getByText(/Alternative career pivot information is not currently available/i)
    ).toBeInTheDocument();
  });
});
