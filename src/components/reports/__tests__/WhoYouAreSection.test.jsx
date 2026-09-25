import React from "react";
import { render, screen } from "@testing-library/react";
import WhoYouAreSection, { renderFormattedText } from "../WhoYouAreSection";

describe("WhoYouAreSection", () => {
  const fullWhoYouAre = {
    personality_summary: "You demonstrate a strong profile as a **Creative Architect & Visionary** with prominent **Tech-Driven Builder** traits.",
    declared_aspiration: "Robotics Engineer",
    dimensions: [
      {
        name: "Investigative",
        score: 85,
        level: "High",
        description: "Enjoys research, mathematical models, and scientific inquiry.",
      },
      {
        name: "Realistic",
        score: 72,
        level: "Moderate",
        description: "Hands-on problem solving with physical apparatus.",
      },
    ],
    defining_dimensions: ["Investigative", "Realistic"],
    weaker_dimensions: ["Artistic", "Social"],
    strengths: ["Analytical Thinking", "Process Optimization"],
    development_areas: ["Ambiguity Navigation", "Stakeholder Communication"],
    confidence_score: 0.91,
    clarity_score: 0.87,
    evidence_status: "VERIFIED",
  };

  test("1. Renders personality summary without literal markdown asterisks and emphasizes bold text", () => {
    const { container } = render(<WhoYouAreSection whoYouAre={fullWhoYouAre} />);
    
    // Check literal asterisks are NOT present in the summary text
    expect(container.textContent).not.toContain("**Creative Architect & Visionary**");
    expect(container.textContent).not.toContain("**Tech-Driven Builder**");
    
    // Check the inner text is rendered inside strong tags
    const boldTexts = container.querySelectorAll("strong");
    const boldContents = Array.from(boldTexts).map(el => el.textContent);
    expect(boldContents).toContain("Creative Architect & Visionary");
    expect(boldContents).toContain("Tech-Driven Builder");
  });

  test("2. Renders all supplied dimensions with name", () => {
    render(<WhoYouAreSection whoYouAre={fullWhoYouAre} />);
    expect(screen.getByText("Discovery Dimensions")).toBeInTheDocument();
    expect(screen.getAllByText("Investigative").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Realistic").length).toBeGreaterThanOrEqual(1);
  });

  test("3. Renders dimension score", () => {
    render(<WhoYouAreSection whoYouAre={fullWhoYouAre} />);
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
  });

  test("4. Renders dimension level", () => {
    render(<WhoYouAreSection whoYouAre={fullWhoYouAre} />);
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Moderate")).toBeInTheDocument();
  });

  test("5. Renders dimension description", () => {
    render(<WhoYouAreSection whoYouAre={fullWhoYouAre} />);
    expect(
      screen.getByText("Enjoys research, mathematical models, and scientific inquiry.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Hands-on problem solving with physical apparatus.")
    ).toBeInTheDocument();
  });

  test("6. Renders defining dimensions without fabricated Primary badges", () => {
    render(<WhoYouAreSection whoYouAre={fullWhoYouAre} />);
    expect(screen.getByText("Defining Dimensions")).toBeInTheDocument();
    expect(screen.queryByText("Primary")).not.toBeInTheDocument();
  });

  test("7. Renders weaker/development dimensions when supplied", () => {
    render(<WhoYouAreSection whoYouAre={fullWhoYouAre} />);
    expect(screen.getByText("Development Dimensions")).toBeInTheDocument();
    expect(screen.getByText("Artistic")).toBeInTheDocument();
    expect(screen.getByText("Social")).toBeInTheDocument();
  });

  test("8. Renders strengths when supplied", () => {
    render(<WhoYouAreSection whoYouAre={fullWhoYouAre} />);
    expect(screen.getByText("Strengths")).toBeInTheDocument();
    expect(screen.getByText("Analytical Thinking")).toBeInTheDocument();
    expect(screen.getByText("Process Optimization")).toBeInTheDocument();
  });

  test("9. Renders development areas when supplied", () => {
    render(<WhoYouAreSection whoYouAre={fullWhoYouAre} />);
    expect(screen.getByText("Development Areas")).toBeInTheDocument();
    expect(screen.getByText("Ambiguity Navigation")).toBeInTheDocument();
    expect(screen.getByText("Stakeholder Communication")).toBeInTheDocument();
  });

  test("10. Renders confidence score accurately formatted", () => {
    render(<WhoYouAreSection whoYouAre={fullWhoYouAre} />);
    expect(screen.getByText("Confidence Score")).toBeInTheDocument();
    expect(screen.getByText("91%")).toBeInTheDocument();
  });

  test("11. Renders clarity score accurately formatted", () => {
    render(<WhoYouAreSection whoYouAre={fullWhoYouAre} />);
    expect(screen.getByText("Clarity Score")).toBeInTheDocument();
    expect(screen.getByText("87%")).toBeInTheDocument();
  });

  test("12. Renders evidence status when supplied", () => {
    render(<WhoYouAreSection whoYouAre={fullWhoYouAre} />);
    expect(screen.getByText("Evidence: VERIFIED")).toBeInTheDocument();
  });

  test("13. Renders student's stated career aspiration when present", () => {
    render(<WhoYouAreSection whoYouAre={fullWhoYouAre} />);
    expect(screen.getByTestId("declared-aspiration-card")).toBeInTheDocument();
    expect(screen.getByText("Stated Career Aspiration")).toBeInTheDocument();
    expect(screen.getByText("Robotics Engineer")).toBeInTheDocument();
  });

  test("14. Handles null/empty declared aspiration gracefully without fallback text", () => {
    const noAsp = { ...fullWhoYouAre, declared_aspiration: null };
    render(<WhoYouAreSection whoYouAre={noAsp} />);
    expect(screen.queryByTestId("declared-aspiration-card")).not.toBeInTheDocument();
    expect(screen.queryByText("Stated Career Aspiration")).not.toBeInTheDocument();
  });

  test("15. Handles null/empty optional fields gracefully without crashing", () => {
    const minimalWhoYouAre = {
      personality_summary: null,
      defining_dimensions: [],
      confidence_score: null,
      clarity_score: null,
    };
    render(<WhoYouAreSection whoYouAre={minimalWhoYouAre} />);
    expect(
      screen.getByText("Personality summary is not available yet.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("No defining dimensions identified.")
    ).toBeInTheDocument();
    const unavailableScores = screen.getAllByText("Not available yet");
    expect(unavailableScores.length).toBe(2);
  });

  test("16. Does not render fabricated explanatory interpretation text", () => {
    render(<WhoYouAreSection whoYouAre={fullWhoYouAre} />);
    expect(
      screen.queryByText(/Consistency of behavioral vector signals/i)
    ).not.toBeInTheDocument();
  });

  test("17. Renders null whoYouAre fallback", () => {
    render(<WhoYouAreSection whoYouAre={null} />);
    expect(
      screen.getByText("Discovery evidence is not available yet.")
    ).toBeInTheDocument();
  });

  test("18. Renders 6-dimension discovery profile radar chart when 3 or more dimensions are present", () => {
    const sixDimensionsWhoYouAre = {
      ...fullWhoYouAre,
      dimensions: [
        { name: "Realistic", score: 70, level: "Moderate" },
        { name: "Investigative", score: 85, level: "High" },
        { name: "Artistic", score: 60, level: "Moderate" },
        { name: "Social", score: 55, level: "Moderate" },
        { name: "Enterprising", score: 80, level: "High" },
        { name: "Conventional", score: 65, level: "Moderate" },
      ],
    };
    render(<WhoYouAreSection whoYouAre={sixDimensionsWhoYouAre} />);
    expect(screen.getByText("Six-Dimension Discovery Profile")).toBeInTheDocument();
    expect(screen.getByLabelText("Six-Dimension Discovery Radar Chart")).toBeInTheDocument();
  });
});
