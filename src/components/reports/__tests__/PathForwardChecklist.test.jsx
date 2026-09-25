import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PathForwardSection from "../PathForwardSection";
import { getChecklistStorageKey } from "../../../utils/checklistStorage";

describe("Persistent Action Checklist & PathForwardSection", () => {
  const samplePathForward = {
    stream_feasibility: "ELIGIBLE",
    student_stream: "Science (PCM)",
    required_streams: ["Science (PCM)"],
    degrees: ["B.Tech Biotechnology"],
    guidance: "Meets direct prerequisites.",
  };

  const sampleActionPlan = {
    ordered_steps: [
      {
        id: "step-1",
        title: "Deepen core chemistry and reaction kinetics understanding",
        category: "EXPLORATION",
        phase: "ORIENTATION",
        timeframe: "Month 1",
        source: "Discovery Test",
      },
      {
        id: "step-2",
        title: "Advance bioprocess parameter simulation skills",
        category: "SKILL_DEVELOPMENT",
        phase: "COMPETENCY_BUILDING",
        timeframe: "Month 2",
        source: "Decision Intelligence Recommendations",
      },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("1. existing actions render accurately without modifying content", () => {
    render(
      <PathForwardSection
        pathForward={samplePathForward}
        actionPlan={sampleActionPlan}
        careerId="bioprocess-engineer"
        userId="user-123"
      />
    );

    expect(screen.getByText("Deepen core chemistry and reaction kinetics understanding")).toBeInTheDocument();
    expect(screen.getByText("Advance bioprocess parameter simulation skills")).toBeInTheDocument();
    expect(screen.getByText("0 of 2 completed")).toBeInTheDocument();
  });

  test("2. unchecked state renders correctly initially", () => {
    render(
      <PathForwardSection
        pathForward={samplePathForward}
        actionPlan={sampleActionPlan}
        careerId="bioprocess-engineer"
        userId="user-123"
      />
    );

    const checkBtn1 = screen.getByRole("checkbox", {
      name: /Mark "Deepen core chemistry and reaction kinetics understanding" as complete/i,
    });
    expect(checkBtn1).toHaveAttribute("aria-checked", "false");
    expect(screen.queryByText("Completed")).not.toBeInTheDocument();
  });

  test("3. checking an action persists its completed state to storage", () => {
    render(
      <PathForwardSection
        pathForward={samplePathForward}
        actionPlan={sampleActionPlan}
        careerId="bioprocess-engineer"
        userId="user-123"
      />
    );

    const checkBtn1 = screen.getByRole("checkbox", {
      name: /Mark "Deepen core chemistry and reaction kinetics understanding" as complete/i,
    });

    fireEvent.click(checkBtn1);

    expect(checkBtn1).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("1 of 2 completed")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();

    const storageKey = getChecklistStorageKey("user-123", "bioprocess-engineer");
    const saved = JSON.parse(localStorage.getItem(storageKey));
    expect(saved["step-1"]).toBe(true);
  });

  test("4. unchecking an action persists updated state to storage", () => {
    render(
      <PathForwardSection
        pathForward={samplePathForward}
        actionPlan={sampleActionPlan}
        careerId="bioprocess-engineer"
        userId="user-123"
      />
    );

    const checkBtn1 = screen.getByRole("checkbox", {
      name: /Mark "Deepen core chemistry and reaction kinetics understanding" as complete/i,
    });

    // Check then uncheck
    fireEvent.click(checkBtn1);
    expect(checkBtn1).toHaveAttribute("aria-checked", "true");

    fireEvent.click(checkBtn1);
    expect(checkBtn1).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("0 of 2 completed")).toBeInTheDocument();

    const storageKey = getChecklistStorageKey("user-123", "bioprocess-engineer");
    const saved = JSON.parse(localStorage.getItem(storageKey));
    expect(saved["step-1"]).toBe(false);
  });

  test("5. state survives component remount", () => {
    const storageKey = getChecklistStorageKey("user-123", "bioprocess-engineer");
    localStorage.setItem(storageKey, JSON.stringify({ "step-1": true }));

    const { unmount } = render(
      <PathForwardSection
        pathForward={samplePathForward}
        actionPlan={sampleActionPlan}
        careerId="bioprocess-engineer"
        userId="user-123"
      />
    );

    expect(screen.getByText("1 of 2 completed")).toBeInTheDocument();

    unmount();

    // Remount
    render(
      <PathForwardSection
        pathForward={samplePathForward}
        actionPlan={sampleActionPlan}
        careerId="bioprocess-engineer"
        userId="user-123"
      />
    );

    expect(screen.getByText("1 of 2 completed")).toBeInTheDocument();
    const checkBtn1 = screen.getByRole("checkbox", {
      name: /Mark "Deepen core chemistry and reaction kinetics understanding" as incomplete/i,
    });
    expect(checkBtn1).toHaveAttribute("aria-checked", "true");
  });

  test("6. state is isolated by user and career identity", () => {
    // Setup state for User A / Career 1
    const keyUserA = getChecklistStorageKey("user-A", "career-1");
    localStorage.setItem(keyUserA, JSON.stringify({ "step-1": true }));

    // Render for User B / Career 2
    render(
      <PathForwardSection
        pathForward={samplePathForward}
        actionPlan={sampleActionPlan}
        careerId="career-2"
        userId="user-B"
      />
    );

    // Should NOT have User A's completed state
    expect(screen.getByText("0 of 2 completed")).toBeInTheDocument();
    const checkBtn1 = screen.getByRole("checkbox", {
      name: /Mark "Deepen core chemistry and reaction kinetics understanding" as complete/i,
    });
    expect(checkBtn1).toHaveAttribute("aria-checked", "false");
  });

  test("7. malformed stored state fails safely without crashing", () => {
    const storageKey = getChecklistStorageKey("user-123", "bioprocess-engineer");
    localStorage.setItem(storageKey, "INVALID_JSON_{{");

    render(
      <PathForwardSection
        pathForward={samplePathForward}
        actionPlan={sampleActionPlan}
        careerId="bioprocess-engineer"
        userId="user-123"
      />
    );

    expect(screen.getByText("0 of 2 completed")).toBeInTheDocument();
  });

  test("8. handles empty action list gracefully", () => {
    render(
      <PathForwardSection
        pathForward={samplePathForward}
        actionPlan={{ ordered_steps: [] }}
        careerId="bioprocess-engineer"
        userId="user-123"
      />
    );

    expect(
      screen.getByText(/No specific next steps are currently recorded for this career/i)
    ).toBeInTheDocument();
  });

  test("9. does NOT fabricate new actions or alter canonical steps", () => {
    render(
      <PathForwardSection
        pathForward={samplePathForward}
        actionPlan={sampleActionPlan}
        careerId="bioprocess-engineer"
        userId="user-123"
      />
    );

    expect(screen.getAllByTestId("action-checklist-item").length).toBe(2);
    expect(screen.queryByText(/Fabricated Step/i)).not.toBeInTheDocument();
  });
});
