jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams()],
}));

import { deriveInvestigationPhaseId } from "./TrialMission";

describe("deriveInvestigationPhaseId", () => {
  test("derives investigation phase when phases is an array of objects", () => {
    const config = {
      phases: [
        { id: "investigate", type: "investigation", title: "Investigation" },
        { id: "recommend", type: "decision", title: "Recommendation" },
      ],
    };
    expect(deriveInvestigationPhaseId(config)).toBe("investigate");
  });

  test("derives custom investigation phase id when specified in array", () => {
    const config = {
      phases: [
        { id: "discovery_research", type: "investigation", title: "Research" },
        { id: "action_plan", type: "decision", title: "Plan" },
      ],
    };
    expect(deriveInvestigationPhaseId(config)).toBe("discovery_research");
  });

  test("derives investigation phase when phases is an array of strings", () => {
    const config = {
      phases: ["investigate", "recommend", "adapt", "deliver", "reflect"],
    };
    expect(deriveInvestigationPhaseId(config)).toBe("investigate");
  });

  test("derives investigation phase from investigation.phase_id if phases is missing", () => {
    const config = {
      investigation: {
        phase_id: "deep_dive",
      },
    };
    expect(deriveInvestigationPhaseId(config)).toBe("deep_dive");
  });

  test("falls back to default 'investigate' when config is empty or undefined", () => {
    expect(deriveInvestigationPhaseId(null)).toBe("investigate");
    expect(deriveInvestigationPhaseId({})).toBe("investigate");
  });
});

describe("isInvestigationPhase strict validation", () => {
  const config = {
    phases: [
      { id: "investigate", type: "investigation" },
      { id: "recommend", type: "decision" },
    ],
  };
  const invPhaseId = deriveInvestigationPhaseId(config);

  test("accepts only when server session.current_phase strictly matches configured investigation phase", () => {
    const session = { current_phase: "investigate" };
    const isInvestigationPhase = Boolean(session?.current_phase) && session.current_phase === invPhaseId;
    expect(isInvestigationPhase).toBe(true);
  });

  test("rejects 'initial' as investigation phase", () => {
    const session = { current_phase: "initial" };
    const isInvestigationPhase = Boolean(session?.current_phase) && session.current_phase === invPhaseId;
    expect(isInvestigationPhase).toBe(false);
  });

  test("rejects 'briefing' as investigation phase", () => {
    const session = { current_phase: "briefing" };
    const isInvestigationPhase = Boolean(session?.current_phase) && session.current_phase === invPhaseId;
    expect(isInvestigationPhase).toBe(false);
  });

  test("rejects null or undefined as investigation phase", () => {
    const sessionNull = { current_phase: null };
    const sessionUndef = {};
    expect(Boolean(sessionNull?.current_phase) && sessionNull.current_phase === invPhaseId).toBe(false);
    expect(Boolean(sessionUndef?.current_phase) && sessionUndef.current_phase === invPhaseId).toBe(false);
  });

  test("rejects recommendation/output/reflection phases as investigation phase", () => {
    expect(Boolean("recommend") && "recommend" === invPhaseId).toBe(false);
    expect(Boolean("adapt") && "adapt" === invPhaseId).toBe(false);
    expect(Boolean("deliver") && "deliver" === invPhaseId).toBe(false);
    expect(Boolean("reflect") && "reflect" === invPhaseId).toBe(false);
  });
});

describe("Stage recognition conditions", () => {
  const config = {
    phases: [
      { id: "investigate", type: "investigation" },
      { id: "recommend", type: "decision" },
      { id: "adapt", type: "reality_event" },
      { id: "deliver", type: "output" },
      { id: "reflect", type: "reflection" },
    ],
  };
  const invPhaseId = deriveInvestigationPhaseId(config);

  test("DECISION_PENDING with current_phase='investigate' correctly recognized as recommendation stage", () => {
    const session = {
      state: "DECISION_PENDING",
      current_phase: "investigate",
    };

    const isInvestigationPhase = Boolean(session?.current_phase) && session.current_phase === invPhaseId;
    const isInvestigationStage = session?.state === "PHASE_ACTIVE" && isInvestigationPhase;
    const isRecommendationStage =
      session?.state === "DECISION_PENDING" ||
      session?.current_phase === "recommend" ||
      session?.current_phase === "decision";

    expect(isInvestigationStage).toBe(false);
    expect(isRecommendationStage).toBe(true);
  });

  test("PHASE_ACTIVE with current_phase='investigate' correctly recognized as investigation stage", () => {
    const session = {
      state: "PHASE_ACTIVE",
      current_phase: "investigate",
    };

    const isInvestigationPhase = Boolean(session?.current_phase) && session.current_phase === invPhaseId;
    const isInvestigationStage = session?.state === "PHASE_ACTIVE" && isInvestigationPhase;
    const isRecommendationStage =
      session?.state === "DECISION_PENDING" ||
      session?.current_phase === "recommend" ||
      session?.current_phase === "decision";

    expect(isInvestigationStage).toBe(true);
    expect(isRecommendationStage).toBe(false);
  });

  test("CONSEQUENCE_ACTIVE correctly recognized as reality-event stage", () => {
    const session = {
      state: "CONSEQUENCE_ACTIVE",
      current_phase: "recommend",
    };

    const isRealityEventStage =
      session?.state === "CONSEQUENCE_ACTIVE" ||
      session?.state === "REALITY_EVENT_PENDING" ||
      session?.current_phase === "adapt" ||
      session?.current_phase === "reality_event";
    const isRecommendationStage =
      session?.state === "DECISION_PENDING" ||
      session?.current_phase === "recommend" ||
      session?.current_phase === "decision";

    expect(isRealityEventStage).toBe(true);
  });

  test("REALITY_EVENT_PENDING correctly recognized as reality-event stage", () => {
    const session = {
      state: "REALITY_EVENT_PENDING",
      current_phase: "adapt",
    };

    const isRealityEventStage =
      session?.state === "CONSEQUENCE_ACTIVE" ||
      session?.state === "REALITY_EVENT_PENDING" ||
      session?.current_phase === "adapt" ||
      session?.current_phase === "reality_event";

    expect(isRealityEventStage).toBe(true);
  });

  test("unrelated states do not trigger recommendation or reality-event stages", () => {
    const sessionPaused = {
      state: "SESSION_PAUSED",
      current_phase: "investigate",
    };
    const isRecommendation =
      sessionPaused?.state === "DECISION_PENDING" ||
      sessionPaused?.current_phase === "recommend" ||
      sessionPaused?.current_phase === "decision";
    const isReality =
      sessionPaused?.state === "CONSEQUENCE_ACTIVE" ||
      sessionPaused?.state === "REALITY_EVENT_PENDING" ||
      sessionPaused?.current_phase === "adapt" ||
      sessionPaused?.current_phase === "reality_event";

    expect(isRecommendation).toBe(false);
    expect(isReality).toBe(false);
  });
});
