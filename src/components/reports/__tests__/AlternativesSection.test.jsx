jest.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import AlternativesSection from "../AlternativesSection";

describe("AlternativesSection", () => {
  const fullAlternativesData = [
    {
      career_id: "fermentation-scientist",
      career_name: "Fermentation Scientist",
      slug: "fermentation-scientist",
      relation_type: "EVIDENCE_BASED_ALTERNATIVE",
      existing_fit_index: 86.4,
      existing_fit_tier: "HIGH_FIT",
      key_differentiator: "Strong laboratory and microbial culturing overlap with fewer engineering scale-up requirements.",
      evidence_source: "Decision Intelligence Recommendations",
    },
    {
      career_id: "biochemical-engineer",
      career_name: "Biochemical Engineer",
      slug: "biochemical-engineer",
      relation_type: "SAME_CAREER_FAMILY",
      existing_fit_index: 81.2,
      existing_fit_tier: "MODERATE_FIT",
      key_differentiator: "Shared biotechnology domain and bioprocessing fundamentals.",
      evidence_source: "Career Family Classification",
    },
    {
      career_id: "computational-biologist",
      career_name: "Computational Biologist",
      slug: "computational-biologist",
      relation_type: "WORK_DNA_OVERLAP",
      key_differentiator: "High quantitative problem-solving overlap with algorithmic focus.",
      evidence_source: "Discovery Test Career Matches",
    },
  ];

  test("1. renders the Alternatives section with valid backend data", () => {
    render(<AlternativesSection alternatives={fullAlternativesData} />);

    expect(screen.getByRole("heading", { name: /If Not This, Then What\?/i })).toBeInTheDocument();
    expect(screen.getByText(/09 — Alternatives/i)).toBeInTheDocument();
    expect(screen.getByText(/3 Directions Identified/i)).toBeInTheDocument();
  });

  test("2. preserves exact backend ordering of alternatives without frontend sorting", () => {
    render(<AlternativesSection alternatives={fullAlternativesData} />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings[0]).toHaveTextContent("Fermentation Scientist");
    expect(headings[1]).toHaveTextContent("Biochemical Engineer");
    expect(headings[2]).toHaveTextContent("Computational Biologist");
  });

  test("3. renders multiple alternatives correctly", () => {
    render(<AlternativesSection alternatives={fullAlternativesData} />);

    expect(screen.getByText("Fermentation Scientist")).toBeInTheDocument();
    expect(screen.getByText("Biochemical Engineer")).toBeInTheDocument();
    expect(screen.getByText("Computational Biologist")).toBeInTheDocument();
  });

  test("4. renders a single alternative when only one is provided without padding fake ones", () => {
    const singleAlt = [fullAlternativesData[0]];
    render(<AlternativesSection alternatives={singleAlt} />);

    expect(screen.getByText("Fermentation Scientist")).toBeInTheDocument();
    expect(screen.queryByText("Biochemical Engineer")).not.toBeInTheDocument();
    expect(screen.getByText(/1 Direction Identified/i)).toBeInTheDocument();
  });

  test("5. handles empty alternatives array with neutral unavailable state", () => {
    render(<AlternativesSection alternatives={[]} />);

    expect(screen.getByText(/09 — Alternatives/i)).toBeInTheDocument();
    expect(screen.getByText(/Alternative career directions are not currently available./i)).toBeInTheDocument();
  });

  test("6. handles null/undefined alternatives with neutral unavailable state", () => {
    render(<AlternativesSection alternatives={null} />);

    expect(screen.getByText(/09 — Alternatives/i)).toBeInTheDocument();
    expect(screen.getByText(/Alternative career directions are not currently available./i)).toBeInTheDocument();
  });

  test("7. renders backend-provided differentiator/rationale", () => {
    render(<AlternativesSection alternatives={fullAlternativesData} />);

    expect(screen.getByText(/Strong laboratory and microbial culturing overlap/i)).toBeInTheDocument();
    expect(screen.getByText(/Shared biotechnology domain and bioprocessing fundamentals/i)).toBeInTheDocument();
  });

  test("8. does NOT fabricate rationales when differentiator is missing", () => {
    const dataWithoutRationale = [
      {
        career_id: "biomedical-technician",
        career_name: "Biomedical Technician",
        relation_type: "RELATED_CAREER",
      },
    ];
    const { container } = render(<AlternativesSection alternatives={dataWithoutRationale} />);

    expect(screen.getByText("Biomedical Technician")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\b(Your personality is perfect for this|great choice|highly successful)\b/i);
  });

  test("9. renders relationship labels cleanly without raw enum underscores", () => {
    render(<AlternativesSection alternatives={fullAlternativesData} />);

    expect(screen.getByText("Evidence-Supported Alternative")).toBeInTheDocument();
    expect(screen.getByText("Same Career Family")).toBeInTheDocument();
    expect(screen.getByText("Work DNA Overlap")).toBeInTheDocument();
  });

  test("10. does NOT leak raw internal enum strings or snake_case keys", () => {
    const { container } = render(<AlternativesSection alternatives={fullAlternativesData} />);

    expect(container.textContent).not.toContain("EVIDENCE_BASED_ALTERNATIVE");
    expect(container.textContent).not.toContain("SAME_CAREER_FAMILY");
    expect(container.textContent).not.toContain("WORK_DNA_OVERLAP");
  });

  test("11. provides navigation link to trial mission experience using existing supported routing", () => {
    render(<AlternativesSection alternatives={fullAlternativesData} />);

    const links = screen.getAllByRole("link", { name: /View Career/i });
    expect(links.length).toBe(3);
    expect(links[0]).toHaveAttribute("href", "/trial-mission?careerId=fermentation-scientist");
  });

  test("12. handles missing career_id safely without rendering broken links", () => {
    const noIdData = [
      {
        relation_type: "RELATED_CAREER",
      },
    ];
    render(<AlternativesSection alternatives={noIdData} />);

    expect(screen.queryByRole("link", { name: /View Career/i })).not.toBeInTheDocument();
    expect(screen.getByText("Career link not available")).toBeInTheDocument();
  });

  test("13. does NOT calculate similarity scores or rank alternatives", () => {
    const { container } = render(<AlternativesSection alternatives={fullAlternativesData} />);

    expect(container.textContent).not.toMatch(/\b(Similarity Score|Career Distance|Match Percentage)\b/i);
  });

  test("14. does NOT introduce 'best', 'top', or 'winner' hyperbolic ranking language", () => {
    const { container } = render(<AlternativesSection alternatives={fullAlternativesData} />);

    expect(container.textContent).not.toMatch(/\b(Top Alternative|Best Alternative|Winner|Top 3 Careers)\b/i);
  });

  test("15. does NOT fabricate salary or hiring claims", () => {
    const { container } = render(<AlternativesSection alternatives={fullAlternativesData} />);

    expect(container.textContent).not.toMatch(/\b(LPA|USD Salary|Hiring Rate|Higher paying|Guaranteed placement)\b/i);
  });

  test("16. renders source provenance when available", () => {
    render(<AlternativesSection alternatives={fullAlternativesData} />);

    expect(screen.getByText("Decision Intelligence Recommendations")).toBeInTheDocument();
    expect(screen.getByText("Career Family Classification")).toBeInTheDocument();
    expect(screen.getByText("Discovery Test Career Matches")).toBeInTheDocument();
  });

  test("17. handles partial alternative objects without runtime errors", () => {
    const partialData = [
      {
        name: "Partial Alternative",
      },
    ];
    render(<AlternativesSection alternatives={partialData} />);

    expect(screen.getByText("Partial Alternative")).toBeInTheDocument();
  });

  test("18. does not display undefined or null strings in visible text", () => {
    const dataWithNulls = [
      {
        career_name: "Biostatistician",
        existing_fit_index: null,
        existing_fit_tier: null,
        key_differentiator: null,
        evidence_source: null,
      },
    ];
    const { container } = render(<AlternativesSection alternatives={dataWithNulls} />);

    expect(container.textContent).not.toContain("null");
    expect(container.textContent).not.toContain("undefined");
  });
});
