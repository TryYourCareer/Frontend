jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams()],
}));

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import TrialMission, { deriveInvestigationPhaseId, mapQuestionIdToCanonicalKey } from "./TrialMission";
import * as sessionHook from "../hooks/useTrialMissionSession";

jest.mock("../hooks/useTrialMissionSession");
jest.mock("../hooks/useDebounceAutosave", () => ({
  useDebounceAutosave: ({ initialValue }) => ({
    value: initialValue,
    setValue: jest.fn(),
    status: "ready",
  }),
}));

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

describe("Recommendation to Consequence to Reality Event Lifecycle", () => {
  const baseSessionHook = {
    missions: [],
    session: null,
    workingNotes: "",
    findings: [],
    currentDecision: null,
    consequenceData: null,
    realityEventData: null,
    outputData: null,
    reflectionData: null,
    evaluationData: null,
    evaluationLoading: false,
    evaluationError: null,
    accessedResourceIds: new Set(),
    activeResource: null,
    setActiveResource: jest.fn(),
    loading: false,
    workspaceLoading: false,
    actionLoading: false,
    error: null,
    startSession: jest.fn(),
    handleTransition: jest.fn(),
    handleAccessResource: jest.fn(),
    handleSaveNotes: jest.fn(),
    handleAddFinding: jest.fn(),
    handleCompleteInvestigation: jest.fn(),
    handleSubmitDecision: jest.fn(),
    handleGenerateConsequence: jest.fn().mockResolvedValue({}),
    handleFetchRealityEvent: jest.fn().mockResolvedValue({}),
    handleRealityEventResponse: jest.fn().mockResolvedValue({}),
    handleSaveOutput: jest.fn(),
    handleReviewOutput: jest.fn(),
    handleFinaliseOutput: jest.fn(),
    handleSubmitOutput: jest.fn(),
    handleSaveReflection: jest.fn(),
    handleSubmitReflection: jest.fn(),
    handlePause: jest.fn(),
    handleResume: jest.fn(),
    handleAbandon: jest.fn(),
    resetToCatalog: jest.fn(),
    setError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("CONSEQUENCE_ACTIVE does NOT fetch reality-event and triggers consequence generation", () => {
    const handleFetchRealityEvent = jest.fn();
    const handleGenerateConsequence = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "CONSEQUENCE_ACTIVE",
        current_phase: "investigate",
        mission_configuration: {
          phases: [
            { id: "investigate", type: "investigation" },
            { id: "recommend", type: "decision" },
            { id: "adapt", type: "reality_event" },
          ],
        },
      },
      handleFetchRealityEvent,
      handleGenerateConsequence,
    });

    render(<TrialMission />);

    expect(handleFetchRealityEvent).not.toHaveBeenCalled();
    expect(handleGenerateConsequence).toHaveBeenCalledTimes(1);
  });

  test("CONSEQUENCE_ACTIVE displays consequence-processing loading state and Keep/Update controls are unavailable", () => {
    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "CONSEQUENCE_ACTIVE",
        current_phase: "investigate",
        mission_configuration: {
          phases: [
            { id: "investigate", type: "investigation" },
            { id: "recommend", type: "decision" },
            { id: "adapt", type: "reality_event" },
          ],
        },
      },
    });

    render(<TrialMission />);

    expect(screen.getByText("Simulating Decision Impact...")).toBeInTheDocument();
    expect(screen.getByText("Evaluating consequences and preparing incoming reality event data.")).toBeInTheDocument();
    expect(screen.queryByText("Keep my recommendation")).not.toBeInTheDocument();
    expect(screen.queryByText(/Update my recommendation/i)).not.toBeInTheDocument();
  });

  test("REALITY_EVENT_PENDING fetches reality-event and displays Keep/Update controls", () => {
    const handleFetchRealityEvent = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REALITY_EVENT_PENDING",
        current_phase: "adapt",
        mission_configuration: {
          phases: [
            { id: "investigate", type: "investigation" },
            { id: "recommend", type: "decision" },
            { id: "adapt", type: "reality_event" },
          ],
          reality_events: [
            {
              manager_response: "New test data arrived from manager",
              information: "Test information for reality event",
            },
          ],
        },
      },
      handleFetchRealityEvent,
    });

    render(<TrialMission />);

    expect(handleFetchRealityEvent).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Sarah's response & new evidence")).toBeInTheDocument();
    expect(screen.getByText("Keep my recommendation")).toBeInTheDocument();
    expect(screen.getByText(/Update my recommendation/i)).toBeInTheDocument();
  });

  test("consequence generation is triggered after successful decision submission", async () => {
    const handleSubmitDecision = jest.fn().mockResolvedValue({
      session: {
        id: "test-session-id",
        state: "CONSEQUENCE_ACTIVE",
        current_phase: "investigate",
      },
    });
    const handleGenerateConsequence = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "DECISION_PENDING",
        current_phase: "investigate",
        mission_configuration: {
          phases: [
            { id: "investigate", type: "investigation" },
            { id: "recommend", type: "decision" },
            { id: "adapt", type: "reality_event" },
          ],
          decisions: [
            {
              options: ["Show delivery costs earlier", "Improve payment reliability"],
            },
          ],
        },
      },
      handleSubmitDecision,
      handleGenerateConsequence,
    });

    render(<TrialMission />);

    // Select option and enter why
    const optionRadio = screen.getByLabelText("Show delivery costs earlier");
    fireEvent.click(optionRadio);

    const whyInput = screen.getByPlaceholderText(/Explain the root cause identified in the data/i);
    fireEvent.change(whyInput, { target: { value: "Delivery fee surprise at checkout causes drop-offs" } });

    const submitBtn = screen.getByRole("button", { name: /Send recommendation/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmitDecision).toHaveBeenCalledWith(
        expect.objectContaining({
          selected_option: "Show delivery costs earlier",
          why: "Delivery fee surprise at checkout causes drop-offs",
        })
      );
      expect(handleGenerateConsequence).toHaveBeenCalled();
    });
  });

  test("Update recommendation with valid evidence sends non-empty evidence IDs and succeeds", async () => {
    const handleRealityEventResponse = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REALITY_EVENT_PENDING",
        current_phase: "adapt",
        mission_configuration: {
          phases: [
            { id: "investigate", type: "investigation" },
            { id: "recommend", type: "decision" },
            { id: "adapt", type: "reality_event" },
          ],
          decisions: [
            {
              options: [
                "Implement AbortController with request sequence IDs",
                "Introduce optimistic locking with version checks on server",
              ],
            },
          ],
          resources: [
            { id: "incident-brief", title: "Incident brief & issue report" },
            { id: "api-logs-latency", title: "Server API logs & latency traces" },
          ],
          reality_events: [
            {
              manager_response: "Marcus reviewed your proposed solution",
              information: "New telemetry confirms offline reconnect issues",
            },
          ],
        },
      },
      currentDecision: {
        selected_option: "Implement AbortController with request sequence IDs",
        why: "Initial race condition rationale",
        evidence: [{ resource_id: "incident-brief" }],
        uncertainty: "Initial uncertainty",
      },
      handleRealityEventResponse,
    });

    render(<TrialMission />);

    // Click "Update my recommendation"
    const updateBtn = screen.getByRole("button", { name: /Update my recommendation/i });
    fireEvent.click(updateBtn);

    // Verify update form is rendered with revised options and evidence checkboxes
    expect(screen.getByText("Revise Recommendation Based on New Evidence")).toBeInTheDocument();
    expect(screen.getByLabelText("Incident brief & issue report")).toBeInTheDocument();
    expect(screen.getByLabelText("Server API logs & latency traces")).toBeInTheDocument();

    // Select revised option
    const revisedOptionRadio = screen.getByLabelText("Introduce optimistic locking with version checks on server");
    fireEvent.click(revisedOptionRadio);

    // Update rationale and check new evidence checkbox
    const rationaleInput = screen.getByPlaceholderText(/Explain how the new information changed or refined your recommendation/i);
    fireEvent.change(rationaleInput, { target: { value: "Server version checks guard against concurrent overwrites" } });

    const newEvidenceCheckbox = screen.getByLabelText("Server API logs & latency traces");
    fireEvent.click(newEvidenceCheckbox);

    // Click Confirm Updated Recommendation
    const confirmBtn = screen.getByRole("button", { name: /Confirm Updated Recommendation/i });
    expect(confirmBtn).not.toBeDisabled();
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(handleRealityEventResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "update",
          selected_option: "Introduce optimistic locking with version checks on server",
          why: "Server version checks guard against concurrent overwrites",
          evidence: expect.arrayContaining([
            expect.objectContaining({ resource_id: "incident-brief" }),
            expect.objectContaining({ resource_id: "api-logs-latency" }),
          ]),
        })
      );
    });
  });

  test("Update recommendation without evidence does not call the API and shows validation warning", async () => {
    const handleRealityEventResponse = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REALITY_EVENT_PENDING",
        current_phase: "adapt",
        mission_configuration: {
          phases: [
            { id: "investigate", type: "investigation" },
            { id: "recommend", type: "decision" },
            { id: "adapt", type: "reality_event" },
          ],
          decisions: [
            {
              options: [
                "Implement AbortController with request sequence IDs",
                "Introduce optimistic locking with version checks on server",
              ],
            },
          ],
          resources: [
            { id: "incident-brief", title: "Incident brief & issue report" },
          ],
          reality_events: [
            {
              manager_response: "Marcus reviewed your proposed solution",
              information: "New telemetry confirms offline reconnect issues",
            },
          ],
        },
      },
      currentDecision: {
        selected_option: "Implement AbortController with request sequence IDs",
        why: "Initial why",
        evidence: [],
        uncertainty: "Initial uncertainty",
      },
      handleRealityEventResponse,
    });

    render(<TrialMission />);

    // Click "Update my recommendation"
    const updateBtn = screen.getByRole("button", { name: /Update my recommendation/i });
    fireEvent.click(updateBtn);

    // Ensure validation warning is visible when no evidence is checked
    expect(screen.getByText("Please select at least one supporting evidence resource.")).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: /Confirm Updated Recommendation/i });
    expect(confirmBtn).toBeDisabled();

    // Attempt to submit
    fireEvent.click(confirmBtn);

    expect(handleRealityEventResponse).not.toHaveBeenCalled();
  });
});

describe("Output to Reflection Lifecycle and Autosave", () => {
  const baseSessionHook = {
    missions: [],
    session: null,
    workingNotes: "",
    findings: [],
    currentDecision: null,
    consequenceData: null,
    realityEventData: null,
    outputData: null,
    reflectionData: null,
    evaluationData: null,
    evaluationLoading: false,
    evaluationError: null,
    accessedResourceIds: new Set(),
    activeResource: null,
    setActiveResource: jest.fn(),
    loading: false,
    workspaceLoading: false,
    actionLoading: false,
    error: null,
    startSession: jest.fn(),
    handleTransition: jest.fn(),
    handleAccessResource: jest.fn(),
    handleSaveNotes: jest.fn(),
    handleAddFinding: jest.fn(),
    handleCompleteInvestigation: jest.fn(),
    handleSubmitDecision: jest.fn(),
    handleGenerateConsequence: jest.fn().mockResolvedValue({}),
    handleFetchRealityEvent: jest.fn().mockResolvedValue({}),
    handleRealityEventResponse: jest.fn().mockResolvedValue({}),
    handleSaveOutput: jest.fn(),
    handleReviewOutput: jest.fn(),
    handleFinaliseOutput: jest.fn(),
    handleSubmitOutput: jest.fn(),
    handleSaveReflection: jest.fn().mockResolvedValue({}),
    handleSubmitReflection: jest.fn().mockResolvedValue({}),
    handlePause: jest.fn(),
    handleResume: jest.fn(),
    handleAbandon: jest.fn(),
    resetToCatalog: jest.fn(),
    setError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("when session.state is REFLECTION_ACTIVE and current_phase is deliver, Reflection stage renders and Output stage does not", () => {
    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REFLECTION_ACTIVE",
        current_phase: "deliver",
        mission_configuration: {
          phases: [
            { id: "investigate", type: "investigation" },
            { id: "recommend", type: "decision" },
            { id: "adapt", type: "reality_event" },
            { id: "deliver", type: "output" },
            { id: "reflect", type: "reflection" },
          ],
        },
      },
      outputData: { status: "submitted" },
      reflectionData: {
        what_felt_natural: "",
        hardest_part: "",
        investigate_next: "",
        questions: [
          { id: "what_felt_natural", prompt: "What felt natural?" },
        ],
      },
    });

    render(<TrialMission />);

    expect(screen.getByText("Reflect on the experience")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit reflection/i })).toBeInTheDocument();
    expect(screen.queryByText("Finish the work: Executive Memo")).not.toBeInTheDocument();
  });

  test("when session.state is SESSION_COMPLETED, neither Output nor Reflection editing stage is shown", () => {
    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "SESSION_COMPLETED",
        current_phase: "deliver",
        mission_configuration: {
          phases: [
            { id: "investigate", type: "investigation" },
            { id: "recommend", type: "decision" },
            { id: "adapt", type: "reality_event" },
            { id: "deliver", type: "output" },
            { id: "reflect", type: "reflection" },
          ],
        },
      },
      evaluationData: {
        overall_score: 85,
        summary: "Great job completing the mission!",
      },
    });

    render(<TrialMission />);

    expect(screen.getByText("Mission Completed")).toBeInTheDocument();
    expect(screen.queryByText("Finish the work: Executive Memo")).not.toBeInTheDocument();
    expect(screen.queryByText("Reflect on the experience")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Submit reflection/i })).not.toBeInTheDocument();
  });

  test("reflection data loaded from server does NOT automatically trigger PUT /reflection", () => {
    jest.useFakeTimers();
    const handleSaveReflection = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REFLECTION_ACTIVE",
        current_phase: "deliver",
      },
      reflectionData: {
        what_felt_natural: "Investigating the funnel data",
        hardest_part: "Trade-offs",
        investigate_next: "User surveys",
        questions: [
          { id: "what_felt_natural", prompt: "What felt natural?" },
        ],
      },
      handleSaveReflection,
    });

    render(<TrialMission />);

    // Fast-forward past debounce window
    jest.advanceTimersByTime(2000);

    expect(handleSaveReflection).not.toHaveBeenCalled();
  });

  test("user changing a reflection field DOES trigger debounced PUT /reflection", async () => {
    jest.useFakeTimers();
    const handleSaveReflection = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REFLECTION_ACTIVE",
        current_phase: "deliver",
      },
      reflectionData: {
        what_felt_natural: "",
        hardest_part: "",
        investigate_next: "",
        questions: [
          { id: "what_felt_natural", prompt: "What felt natural?" },
        ],
      },
      handleSaveReflection,
    });

    render(<TrialMission />);

    const textarea = screen.getByPlaceholderText("Share your analytical reflections...");
    fireEvent.change(textarea, { target: { value: "I understood the funnel easily" } });

    // Before debounce delay (800ms)
    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(handleSaveReflection).not.toHaveBeenCalled();

    // After debounce delay
    await act(async () => {
      jest.advanceTimersByTime(450);
    });
    expect(handleSaveReflection).toHaveBeenCalledTimes(1);
    expect(handleSaveReflection).toHaveBeenCalledWith(
      expect.objectContaining({
        what_felt_natural: "I understood the funnel easily",
      })
    );
  });

  test("successful PUT /reflection does not cause another PUT loop when reflectionData is synced back", async () => {
    jest.useFakeTimers();
    const handleSaveReflection = jest.fn().mockResolvedValue({
      what_felt_natural: "Updated content from user",
      hardest_part: "",
      investigate_next: "",
    });

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REFLECTION_ACTIVE",
        current_phase: "deliver",
      },
      reflectionData: {
        what_felt_natural: "",
        hardest_part: "",
        investigate_next: "",
        questions: [
          { id: "what_felt_natural", prompt: "What felt natural?" },
        ],
      },
      handleSaveReflection,
    });

    const { rerender } = render(<TrialMission />);

    const textarea = screen.getByPlaceholderText("Share your analytical reflections...");
    fireEvent.change(textarea, { target: { value: "Updated content from user" } });

    // Advance timer to trigger autosave
    await act(async () => {
      jest.advanceTimersByTime(850);
    });
    expect(handleSaveReflection).toHaveBeenCalledTimes(1);

    // Simulate backend response updating reflectionData to match the saved value
    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REFLECTION_ACTIVE",
        current_phase: "deliver",
      },
      reflectionData: {
        what_felt_natural: "Updated content from user",
        hardest_part: "",
        investigate_next: "",
        questions: [
          { id: "what_felt_natural", prompt: "What felt natural?" },
        ],
      },
      handleSaveReflection,
    });

    rerender(<TrialMission />);

    // Advance timers again - should NOT trigger another save
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(handleSaveReflection).toHaveBeenCalledTimes(1);
  });

  test("multiple user changes within the debounce period are coalesced into a single PUT", async () => {
    jest.useFakeTimers();
    const handleSaveReflection = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REFLECTION_ACTIVE",
        current_phase: "deliver",
      },
      reflectionData: {
        what_felt_natural: "",
        hardest_part: "",
        investigate_next: "",
        questions: [
          { id: "what_felt_natural", prompt: "What felt natural?" },
          { id: "hardest_part", prompt: "Hardest part?" },
        ],
      },
      handleSaveReflection,
    });

    render(<TrialMission />);

    const textareas = screen.getAllByPlaceholderText("Share your analytical reflections...");
    fireEvent.change(textareas[0], { target: { value: "First edit" } });

    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    fireEvent.change(textareas[0], { target: { value: "First edit updated" } });
    fireEvent.change(textareas[1], { target: { value: "Second field edit" } });

    await act(async () => {
      jest.advanceTimersByTime(850);
    });

    expect(handleSaveReflection).toHaveBeenCalledTimes(1);
    expect(handleSaveReflection).toHaveBeenCalledWith(
      expect.objectContaining({
        what_felt_natural: "First edit updated",
        hardest_part: "Second field edit",
      })
    );
  });

  test("failed PUT /reflection keeps dirty state and enables retry on next edit", async () => {
    jest.useFakeTimers();
    const handleSaveReflection = jest
      .fn()
      .mockRejectedValueOnce(new Error("Network failure"))
      .mockResolvedValueOnce({ what_felt_natural: "Retry value" });

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REFLECTION_ACTIVE",
        current_phase: "deliver",
      },
      reflectionData: {
        what_felt_natural: "",
        hardest_part: "",
        investigate_next: "",
        questions: [{ id: "what_felt_natural", prompt: "What felt natural?" }],
      },
      handleSaveReflection,
    });

    render(<TrialMission />);

    const textarea = screen.getByPlaceholderText("Share your analytical reflections...");
    fireEvent.change(textarea, { target: { value: "Initial attempt" } });

    await act(async () => {
      jest.advanceTimersByTime(850);
    });

    expect(handleSaveReflection).toHaveBeenCalledTimes(1);

    // After failure, user edits again
    fireEvent.change(textarea, { target: { value: "Retry value" } });

    await act(async () => {
      jest.advanceTimersByTime(850);
    });

    expect(handleSaveReflection).toHaveBeenCalledTimes(2);
    expect(handleSaveReflection).toHaveBeenLastCalledWith(
      expect.objectContaining({
        what_felt_natural: "Retry value",
      })
    );
  });

  test("edit during an in-flight PUT remains dirty and results in another save with the latest edit", async () => {
    jest.useFakeTimers();
    let resolveFirstPut;
    const firstPutPromise = new Promise((resolve) => {
      resolveFirstPut = resolve;
    });

    const handleSaveReflection = jest
      .fn()
      .mockImplementationOnce(() => firstPutPromise)
      .mockResolvedValueOnce({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REFLECTION_ACTIVE",
        current_phase: "deliver",
      },
      reflectionData: {
        what_felt_natural: "",
        hardest_part: "",
        investigate_next: "",
        questions: [{ id: "what_felt_natural", prompt: "What felt natural?" }],
      },
      handleSaveReflection,
    });

    render(<TrialMission />);

    const textarea = screen.getByPlaceholderText("Share your analytical reflections...");
    fireEvent.change(textarea, { target: { value: "Draft version 1" } });

    // Advance past debounce to launch 1st save (in-flight)
    await act(async () => {
      jest.advanceTimersByTime(850);
    });
    expect(handleSaveReflection).toHaveBeenCalledTimes(1);
    expect(handleSaveReflection).toHaveBeenCalledWith(
      expect.objectContaining({ what_felt_natural: "Draft version 1" })
    );

    // While 1st save is in flight, user types again
    fireEvent.change(textarea, { target: { value: "Draft version 2" } });

    // Now 1st save finishes
    await act(async () => {
      resolveFirstPut({ what_felt_natural: "Draft version 1" });
    });

    // Advance timer for 2nd save debounce
    await act(async () => {
      jest.advanceTimersByTime(850);
    });

    expect(handleSaveReflection).toHaveBeenCalledTimes(2);
    expect(handleSaveReflection).toHaveBeenLastCalledWith(
      expect.objectContaining({ what_felt_natural: "Draft version 2" })
    );
  });

  test("successful PUT with no newer edit clears dirty state so unrelated rerenders do not save again", async () => {
    jest.useFakeTimers();
    const handleSaveReflection = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REFLECTION_ACTIVE",
        current_phase: "deliver",
      },
      reflectionData: {
        what_felt_natural: "",
        hardest_part: "",
        investigate_next: "",
        questions: [{ id: "what_felt_natural", prompt: "What felt natural?" }],
      },
      handleSaveReflection,
    });

    const { rerender } = render(<TrialMission />);

    const textarea = screen.getByPlaceholderText("Share your analytical reflections...");
    fireEvent.change(textarea, { target: { value: "Saved value" } });

    await act(async () => {
      jest.advanceTimersByTime(850);
    });
    expect(handleSaveReflection).toHaveBeenCalledTimes(1);

    // Rerender with identical data or unrelated state change
    rerender(<TrialMission />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(handleSaveReflection).toHaveBeenCalledTimes(1);
  });

  test("submitting reflection cancels pending debounce timer and no PUT occurs after submit", async () => {
    jest.useFakeTimers();
    const handleSaveReflection = jest.fn().mockResolvedValue({});
    const handleSubmitReflection = jest.fn().mockResolvedValue({
      session: {
        id: "test-session-id",
        state: "SESSION_COMPLETED",
        current_phase: "deliver",
      },
    });

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REFLECTION_ACTIVE",
        current_phase: "deliver",
      },
      reflectionData: {
        what_felt_natural: "",
        hardest_part: "",
        investigate_next: "",
        questions: [{ id: "what_felt_natural", prompt: "What felt natural?" }],
      },
      handleSaveReflection,
      handleSubmitReflection,
    });

    render(<TrialMission />);

    const textarea = screen.getByPlaceholderText("Share your analytical reflections...");
    fireEvent.change(textarea, { target: { value: "Final reflection before submit" } });

    // Submit button clicked before 800ms timer fires
    const submitBtn = screen.getByRole("button", { name: /Submit reflection/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(handleSubmitReflection).toHaveBeenCalledTimes(1);
    expect(handleSubmitReflection).toHaveBeenCalledWith({
      what_felt_natural: "Final reflection before submit",
      hardest_part: "",
      investigate_next: "",
    });

    // Advance timer past the original 800ms debounce
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Stale timer must have been cancelled; no PUT /reflection occurs
    expect(handleSaveReflection).not.toHaveBeenCalled();
  });

  test("timeout callback refuses to save if session is no longer REFLECTION_ACTIVE", async () => {
    jest.useFakeTimers();
    const handleSaveReflection = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REFLECTION_ACTIVE",
        current_phase: "deliver",
      },
      reflectionData: {
        what_felt_natural: "",
        hardest_part: "",
        investigate_next: "",
        questions: [{ id: "what_felt_natural", prompt: "What felt natural?" }],
      },
      handleSaveReflection,
    });

    const { rerender } = render(<TrialMission />);

    const textarea = screen.getByPlaceholderText("Share your analytical reflections...");
    fireEvent.change(textarea, { target: { value: "Edit text" } });

    // Simulate session transitioning to completed externally before debounce fires
    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "SESSION_COMPLETED",
        current_phase: "deliver",
      },
      evaluationData: {
        overall_score: 90,
      },
      handleSaveReflection,
    });

    rerender(<TrialMission />);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(handleSaveReflection).not.toHaveBeenCalled();
  });

  test("component unmount cancels pending reflection autosave timer", async () => {
    jest.useFakeTimers();
    const handleSaveReflection = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REFLECTION_ACTIVE",
        current_phase: "deliver",
      },
      reflectionData: {
        what_felt_natural: "",
        hardest_part: "",
        investigate_next: "",
        questions: [{ id: "what_felt_natural", prompt: "What felt natural?" }],
      },
      handleSaveReflection,
    });

    const { unmount } = render(<TrialMission />);

    const textarea = screen.getByPlaceholderText("Share your analytical reflections...");
    fireEvent.change(textarea, { target: { value: "Unmounting edit" } });

    unmount();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(handleSaveReflection).not.toHaveBeenCalled();
  });

  test("dynamic question IDs map to canonical backend fields and payload contains only canonical keys", async () => {
    jest.useFakeTimers();
    const handleSaveReflection = jest.fn().mockResolvedValue({});
    const handleSubmitReflection = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "REFLECTION_ACTIVE",
        current_phase: "deliver",
      },
      reflectionData: {
        questions: [
          { id: "natural", prompt: "Natural part prompt" },
          { id: "hardest", prompt: "Hardest part prompt" },
          { id: "next_investigation", prompt: "Next investigation prompt" },
        ],
      },
      handleSaveReflection,
      handleSubmitReflection,
    });

    render(<TrialMission />);

    const textareas = screen.getAllByPlaceholderText("Share your analytical reflections...");
    fireEvent.change(textareas[0], { target: { value: "Natural answer" } });
    fireEvent.change(textareas[1], { target: { value: "Hardest answer" } });
    fireEvent.change(textareas[2], { target: { value: "Next answer" } });

    // Autosave payload
    await act(async () => {
      jest.advanceTimersByTime(850);
    });

    expect(handleSaveReflection).toHaveBeenCalledTimes(1);
    expect(handleSaveReflection).toHaveBeenCalledWith({
      what_felt_natural: "Natural answer",
      hardest_part: "Hardest answer",
      investigate_next: "Next answer",
    });
    // Ensure no dynamic keys exist in payload
    const savePayload = handleSaveReflection.mock.calls[0][0];
    expect(savePayload.natural).toBeUndefined();
    expect(savePayload.hardest).toBeUndefined();
    expect(savePayload.next_investigation).toBeUndefined();

    // Submit payload
    const submitBtn = screen.getByRole("button", { name: /Submit reflection/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(handleSubmitReflection).toHaveBeenCalledWith({
      what_felt_natural: "Natural answer",
      hardest_part: "Hardest answer",
      investigate_next: "Next answer",
    });
    const submitPayload = handleSubmitReflection.mock.calls[0][0];
    expect(submitPayload.natural).toBeUndefined();
    expect(submitPayload.hardest).toBeUndefined();
    expect(submitPayload.next_investigation).toBeUndefined();
  });

  test("mapQuestionIdToCanonicalKey correctly maps dynamic question IDs", () => {
    expect(mapQuestionIdToCanonicalKey("natural")).toBe("what_felt_natural");
    expect(mapQuestionIdToCanonicalKey("what_felt_natural")).toBe("what_felt_natural");
    expect(mapQuestionIdToCanonicalKey("hardest")).toBe("hardest_part");
    expect(mapQuestionIdToCanonicalKey("hardest_part")).toBe("hardest_part");
    expect(mapQuestionIdToCanonicalKey("next_investigation")).toBe("investigate_next");
    expect(mapQuestionIdToCanonicalKey("investigate_next")).toBe("investigate_next");
  });
});

describe("Professional Memo / Output Autosave and Review Lifecycle", () => {
  const baseSessionHook = {
    missions: [],
    session: null,
    workingNotes: "",
    findings: [],
    currentDecision: null,
    consequenceData: null,
    realityEventData: null,
    outputData: null,
    reflectionData: null,
    evaluationData: null,
    evaluationLoading: false,
    evaluationError: null,
    accessedResourceIds: new Set(),
    activeResource: null,
    setActiveResource: jest.fn(),
    loading: false,
    workspaceLoading: false,
    actionLoading: false,
    error: null,
    startSession: jest.fn(),
    handleTransition: jest.fn(),
    handleAccessResource: jest.fn(),
    handleSaveNotes: jest.fn(),
    handleAddFinding: jest.fn(),
    handleCompleteInvestigation: jest.fn(),
    handleSubmitDecision: jest.fn(),
    handleGenerateConsequence: jest.fn().mockResolvedValue({}),
    handleFetchRealityEvent: jest.fn().mockResolvedValue({}),
    handleRealityEventResponse: jest.fn().mockResolvedValue({}),
    handleSaveOutput: jest.fn().mockResolvedValue({}),
    handleReviewOutput: jest.fn().mockResolvedValue({}),
    handleFinaliseOutput: jest.fn().mockResolvedValue({}),
    handleSubmitOutput: jest.fn().mockResolvedValue({}),
    handleSaveReflection: jest.fn().mockResolvedValue({}),
    handleSubmitReflection: jest.fn().mockResolvedValue({}),
    handlePause: jest.fn(),
    handleResume: jest.fn(),
    handleAbandon: jest.fn(),
    resetToCatalog: jest.fn(),
    setError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("GET /output does not automatically trigger PUT /output", async () => {
    jest.useFakeTimers();
    const handleSaveOutput = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "PHASE_ACTIVE",
        current_phase: "deliver",
      },
      outputData: {
        executive_summary: "Loaded from server",
        key_findings: "Loaded findings",
        evidence: "Loaded evidence",
        recommendation: "Loaded rec",
        risks_limitations: "Loaded risks",
        next_steps: "Loaded steps",
        status: "draft",
      },
      handleSaveOutput,
    });

    render(<TrialMission />);

    // Fast-forward past debounce window
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(handleSaveOutput).not.toHaveBeenCalled();
  });

  test("server outputData containing empty strings does not overwrite newer dirty user input", async () => {
    jest.useFakeTimers();
    const handleSaveOutput = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "PHASE_ACTIVE",
        current_phase: "deliver",
      },
      outputData: {
        executive_summary: "",
        key_findings: "",
        evidence: "",
        recommendation: "",
        risks_limitations: "",
        next_steps: "",
        status: "draft",
      },
      handleSaveOutput,
    });

    const { rerender } = render(<TrialMission />);

    const nextStepsTextarea = screen.getByPlaceholderText("Action items for engineering, analytics, and rollout...");
    fireEvent.change(nextStepsTextarea, { target: { value: "latest user text" } });

    expect(nextStepsTextarea.value).toBe("latest user text");

    // Simulate stale server response arriving with empty string
    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "PHASE_ACTIVE",
        current_phase: "deliver",
      },
      outputData: {
        executive_summary: "",
        key_findings: "",
        evidence: "",
        recommendation: "",
        risks_limitations: "",
        next_steps: "",
        status: "draft",
      },
      handleSaveOutput,
    });

    rerender(<TrialMission />);

    // Dirty user text must NOT be replaced with empty string
    expect(nextStepsTextarea.value).toBe("latest user text");
  });

  test("user edits trigger one debounced PUT /output", async () => {
    jest.useFakeTimers();
    const handleSaveOutput = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "PHASE_ACTIVE",
        current_phase: "deliver",
      },
      outputData: {
        status: "draft",
      },
      handleSaveOutput,
    });

    render(<TrialMission />);

    const summaryTextarea = screen.getByPlaceholderText("High-level overview of the investigation and core decision...");
    fireEvent.change(summaryTextarea, { target: { value: "Executive overview draft" } });

    // Before debounce
    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(handleSaveOutput).not.toHaveBeenCalled();

    // After debounce
    await act(async () => {
      jest.advanceTimersByTime(450);
    });
    expect(handleSaveOutput).toHaveBeenCalledTimes(1);
    expect(handleSaveOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        executive_summary: "Executive overview draft",
      })
    );
  });

  test("successful PUT does not create a PUT loop", async () => {
    jest.useFakeTimers();
    const handleSaveOutput = jest.fn().mockResolvedValue({
      executive_summary: "Executive overview draft",
      status: "draft",
    });

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "PHASE_ACTIVE",
        current_phase: "deliver",
      },
      outputData: {
        status: "draft",
      },
      handleSaveOutput,
    });

    const { rerender } = render(<TrialMission />);

    const summaryTextarea = screen.getByPlaceholderText("High-level overview of the investigation and core decision...");
    fireEvent.change(summaryTextarea, { target: { value: "Executive overview draft" } });

    await act(async () => {
      jest.advanceTimersByTime(850);
    });
    expect(handleSaveOutput).toHaveBeenCalledTimes(1);

    // Backend syncs back saved data
    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "PHASE_ACTIVE",
        current_phase: "deliver",
      },
      outputData: {
        executive_summary: "Executive overview draft",
        status: "draft",
      },
      handleSaveOutput,
    });

    rerender(<TrialMission />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(handleSaveOutput).toHaveBeenCalledTimes(1);
  });

  test("failed PUT keeps the memo dirty and allows retry on next edit", async () => {
    jest.useFakeTimers();
    const handleSaveOutput = jest
      .fn()
      .mockRejectedValueOnce(new Error("Save failed"))
      .mockResolvedValueOnce({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "PHASE_ACTIVE",
        current_phase: "deliver",
      },
      outputData: {
        status: "draft",
      },
      handleSaveOutput,
    });

    render(<TrialMission />);

    const summaryTextarea = screen.getByPlaceholderText("High-level overview of the investigation and core decision...");
    fireEvent.change(summaryTextarea, { target: { value: "First attempt" } });

    await act(async () => {
      jest.advanceTimersByTime(850);
    });
    expect(handleSaveOutput).toHaveBeenCalledTimes(1);

    // Edit again to trigger retry
    fireEvent.change(summaryTextarea, { target: { value: "Second attempt" } });

    await act(async () => {
      jest.advanceTimersByTime(850);
    });
    expect(handleSaveOutput).toHaveBeenCalledTimes(2);
    expect(handleSaveOutput).toHaveBeenLastCalledWith(
      expect.objectContaining({
        executive_summary: "Second attempt",
      })
    );
  });

  test("user edits while PUT is in flight remain dirty and are subsequently saved", async () => {
    jest.useFakeTimers();
    let resolveFirstPut;
    const firstPutPromise = new Promise((resolve) => {
      resolveFirstPut = resolve;
    });

    const handleSaveOutput = jest
      .fn()
      .mockImplementationOnce(() => firstPutPromise)
      .mockResolvedValueOnce({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "PHASE_ACTIVE",
        current_phase: "deliver",
      },
      outputData: {
        status: "draft",
      },
      handleSaveOutput,
    });

    render(<TrialMission />);

    const summaryTextarea = screen.getByPlaceholderText("High-level overview of the investigation and core decision...");
    fireEvent.change(summaryTextarea, { target: { value: "Version 1" } });

    await act(async () => {
      jest.advanceTimersByTime(850);
    });
    expect(handleSaveOutput).toHaveBeenCalledTimes(1);

    // Edit while 1st save is in flight
    fireEvent.change(summaryTextarea, { target: { value: "Version 2" } });

    // 1st save completes
    await act(async () => {
      resolveFirstPut({ executive_summary: "Version 1" });
    });

    // Advance timer for 2nd save
    await act(async () => {
      jest.advanceTimersByTime(850);
    });

    expect(handleSaveOutput).toHaveBeenCalledTimes(2);
    expect(handleSaveOutput).toHaveBeenLastCalledWith(
      expect.objectContaining({ executive_summary: "Version 2" })
    );
  });

  test("multiple edits inside 800ms coalesce into the latest snapshot", async () => {
    jest.useFakeTimers();
    const handleSaveOutput = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "PHASE_ACTIVE",
        current_phase: "deliver",
      },
      outputData: {
        status: "draft",
      },
      handleSaveOutput,
    });

    render(<TrialMission />);

    const summaryTextarea = screen.getByPlaceholderText("High-level overview of the investigation and core decision...");
    const findingsTextarea = screen.getByPlaceholderText("Synthesize the critical drop-off points discovered during investigation...");

    fireEvent.change(summaryTextarea, { target: { value: "Summary v1" } });
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    fireEvent.change(summaryTextarea, { target: { value: "Summary v2" } });
    fireEvent.change(findingsTextarea, { target: { value: "Findings v1" } });

    await act(async () => {
      jest.advanceTimersByTime(850);
    });

    expect(handleSaveOutput).toHaveBeenCalledTimes(1);
    expect(handleSaveOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        executive_summary: "Summary v2",
        key_findings: "Findings v1",
      })
    );
  });

  test("clicking Review before 800ms debounce expires first saves latest memo and then calls /output/review", async () => {
    jest.useFakeTimers();
    const callOrder = [];
    const handleSaveOutput = jest.fn().mockImplementation(async () => {
      callOrder.push("save");
      return {};
    });
    const handleReviewOutput = jest.fn().mockImplementation(async () => {
      callOrder.push("review");
      return { status: "review" };
    });

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "PHASE_ACTIVE",
        current_phase: "deliver",
      },
      outputData: {
        status: "draft",
      },
      handleSaveOutput,
      handleReviewOutput,
    });

    render(<TrialMission />);

    const summaryTextarea = screen.getByPlaceholderText("High-level overview of the investigation and core decision...");
    fireEvent.change(summaryTextarea, { target: { value: "Complete memo content" } });

    // Click Review immediately before debounce fires
    const reviewBtn = screen.getByRole("button", { name: /Review memo/i });
    await act(async () => {
      fireEvent.click(reviewBtn);
    });

    expect(callOrder).toEqual(["save", "review"]);
    expect(handleSaveOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        executive_summary: "Complete memo content",
      })
    );
    expect(handleReviewOutput).toHaveBeenCalledTimes(1);
  });

  test("Review is NOT called if the required draft save fails", async () => {
    jest.useFakeTimers();
    const handleSaveOutput = jest.fn().mockRejectedValue(new Error("Save draft failed"));
    const handleReviewOutput = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "PHASE_ACTIVE",
        current_phase: "deliver",
      },
      outputData: {
        status: "draft",
      },
      handleSaveOutput,
      handleReviewOutput,
    });

    render(<TrialMission />);

    const summaryTextarea = screen.getByPlaceholderText("High-level overview of the investigation and core decision...");
    fireEvent.change(summaryTextarea, { target: { value: "Attempt to review" } });

    const reviewBtn = screen.getByRole("button", { name: /Review memo/i });
    await act(async () => {
      fireEvent.click(reviewBtn);
    });

    expect(handleSaveOutput).toHaveBeenCalledTimes(1);
    expect(handleReviewOutput).not.toHaveBeenCalled();
  });

  test("Review cannot be submitted twice while flush/review operation is in progress", async () => {
    jest.useFakeTimers();
    let resolveSave;
    const savePromise = new Promise((resolve) => {
      resolveSave = resolve;
    });
    const handleSaveOutput = jest.fn().mockImplementation(() => savePromise);
    const handleReviewOutput = jest.fn().mockResolvedValue({ status: "review" });

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "PHASE_ACTIVE",
        current_phase: "deliver",
      },
      outputData: {
        status: "draft",
      },
      handleSaveOutput,
      handleReviewOutput,
    });

    render(<TrialMission />);

    const summaryTextarea = screen.getByPlaceholderText("High-level overview of the investigation and core decision...");
    fireEvent.change(summaryTextarea, { target: { value: "Memo content" } });

    const reviewBtn = screen.getByRole("button", { name: /Review memo/i });
    
    // First click initiates save
    await act(async () => {
      fireEvent.click(reviewBtn);
    });
    expect(handleSaveOutput).toHaveBeenCalledTimes(1);

    // Second click while in progress
    await act(async () => {
      fireEvent.click(reviewBtn);
    });
    expect(handleSaveOutput).toHaveBeenCalledTimes(1);

    // Resolve save
    await act(async () => {
      resolveSave({});
    });

    expect(handleReviewOutput).toHaveBeenCalledTimes(1);
  });

  test("dirty local non-empty value is not overwritten by stale server non-empty value", async () => {
    jest.useFakeTimers();
    const handleSaveOutput = jest.fn().mockResolvedValue({});

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "PHASE_ACTIVE",
        current_phase: "deliver",
      },
      outputData: {
        next_steps: "old server text",
        status: "draft",
      },
      handleSaveOutput,
    });

    const { rerender } = render(<TrialMission />);

    const nextStepsTextarea = screen.getByPlaceholderText("Action items for engineering, analytics, and rollout...");
    fireEvent.change(nextStepsTextarea, { target: { value: "latest user text" } });

    expect(nextStepsTextarea.value).toBe("latest user text");

    // Stale server response arrives containing "old server text"
    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "PHASE_ACTIVE",
        current_phase: "deliver",
      },
      outputData: {
        next_steps: "old server text",
        status: "draft",
      },
      handleSaveOutput,
    });

    rerender(<TrialMission />);

    expect(nextStepsTextarea.value).toBe("latest user text");
  });

  test("Review with an edit during the in-flight save does not review stale data and saves newer edit", async () => {
    jest.useFakeTimers();
    let resolveFirstSave;
    const firstSavePromise = new Promise((resolve) => {
      resolveFirstSave = resolve;
    });

    const handleSaveOutput = jest
      .fn()
      .mockImplementationOnce(() => firstSavePromise)
      .mockResolvedValueOnce({});
    const handleReviewOutput = jest.fn().mockResolvedValue({ status: "review" });

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "test-session-id",
        state: "PHASE_ACTIVE",
        current_phase: "deliver",
      },
      outputData: {
        status: "draft",
      },
      handleSaveOutput,
      handleReviewOutput,
    });

    render(<TrialMission />);

    const summaryTextarea = screen.getByPlaceholderText("High-level overview of the investigation and core decision...");
    fireEvent.change(summaryTextarea, { target: { value: "Memo draft A" } });

    const reviewBtn = screen.getByRole("button", { name: /Review memo/i });
    
    // User clicks Review -> starts save for snapshot A
    await act(async () => {
      fireEvent.click(reviewBtn);
    });
    expect(handleSaveOutput).toHaveBeenCalledTimes(1);
    expect(handleSaveOutput).toHaveBeenCalledWith(
      expect.objectContaining({ executive_summary: "Memo draft A" })
    );

    // While save for A is in flight, user modifies memo to B
    fireEvent.change(summaryTextarea, { target: { value: "Memo draft B" } });

    // Now save for A completes
    await act(async () => {
      resolveFirstSave({});
    });

    // Review must NOT have been called because a newer edit occurred
    expect(handleReviewOutput).not.toHaveBeenCalled();

    // The newer edit B must be debounced and saved
    await act(async () => {
      jest.advanceTimersByTime(850);
    });

    expect(handleSaveOutput).toHaveBeenCalledTimes(2);
    expect(handleSaveOutput).toHaveBeenLastCalledWith(
      expect.objectContaining({ executive_summary: "Memo draft B" })
    );
  });
});

describe("Trial Mission Modular Workspace Architecture & Dispatch", () => {
  const baseSessionHook = {
    missions: [],
    session: null,
    workingNotes: "Initial note",
    findings: [
      {
        id: "f1",
        statement: "Dropoff at payment",
        resource_id: "res-1",
        explanation: "Analysis",
        uncertainty: "None",
      },
    ],
    currentDecision: null,
    consequenceData: null,
    realityEventData: null,
    outputData: null,
    reflectionData: null,
    evaluationData: null,
    evaluationLoading: false,
    evaluationError: null,
    accessedResourceIds: new Set(["res-1"]),
    activeResource: null,
    setActiveResource: jest.fn(),
    loading: false,
    workspaceLoading: false,
    actionLoading: false,
    error: null,
    startSession: jest.fn(),
    handleTransition: jest.fn(),
    handleAccessResource: jest.fn(),
    handleSaveNotes: jest.fn(),
    handleAddFinding: jest.fn(),
    handleCompleteInvestigation: jest.fn(),
    handleSubmitDecision: jest.fn(),
    handleGenerateConsequence: jest.fn().mockResolvedValue({}),
    handleFetchRealityEvent: jest.fn(),
    handleRespondRealityEvent: jest.fn(),
    handleSaveOutput: jest.fn(),
    handleReviewOutput: jest.fn(),
    handleFinaliseOutput: jest.fn(),
    handleSaveReflection: jest.fn(),
    handleSubmitReflection: jest.fn(),
    handlePause: jest.fn(),
    handleResume: jest.fn(),
    handleAbandon: jest.fn(),
    handleRetryEvaluation: jest.fn(),
    clearSession: jest.fn(),
  };

  test("dispatches to BusinessAnalystWorkspace when session.workspace_type is 'business_analyst'", () => {
    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "ba-session-id",
        workspace_type: "business_analyst",
        state: "PHASE_ACTIVE",
        current_phase: "investigate",
        mission_title: "Investigate Checkout Abandonment",
        mission_config: {
          phases: [{ id: "investigate", type: "investigation" }],
          briefing: {
            title: "BA Mission",
            manager: { name: "Sarah Lin", role: "VP Product" },
            resources: [
              { id: "res-1", title: "Funnel Analysis", type: "metric", content: "Data" },
            ],
          },
        },
      },
    });

    render(<TrialMission />);

    expect(screen.getByTestId("business-analyst-workspace")).toBeInTheDocument();
    expect(screen.queryByTestId("developer-workspace")).not.toBeInTheDocument();
    expect(screen.queryByTestId("unsupported-workspace")).not.toBeInTheDocument();
    expect(screen.getByText("Investigate Checkout Abandonment")).toBeInTheDocument();
  });

  test("dispatches to DeveloperWorkspace when session.workspace_type is 'developer'", () => {
    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "dev-session-id",
        workspace_type: "developer",
        state: "PHASE_ACTIVE",
        current_phase: "investigate",
        mission_title: "Debug Production Latency & Cart State Sync",
        mission_config: {
          phases: [{ id: "investigate", type: "investigation" }],
          briefing: {
            title: "Dev Mission",
            manager: { name: "Alex Mercer", role: "Staff Engineer" },
            resources: [
              { id: "res-1", title: "APM Traces & Flamegraph", type: "telemetry", content: "Trace" },
            ],
          },
        },
      },
    });

    render(<TrialMission />);

    expect(screen.getByTestId("developer-workspace")).toBeInTheDocument();
    expect(screen.queryByTestId("business-analyst-workspace")).not.toBeInTheDocument();
    expect(screen.queryByTestId("ux-designer-workspace")).not.toBeInTheDocument();
    expect(screen.queryByTestId("unsupported-workspace")).not.toBeInTheDocument();
    expect(screen.getByText("Debug Production Latency & Cart State Sync")).toBeInTheDocument();
    expect(screen.getByText("Developer Investigation Workspace")).toBeInTheDocument();
  });

  test("dispatches to UXDesignerWorkspace when session.workspace_type is 'ux_designer'", () => {
    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "ux-session-id",
        workspace_type: "ux_designer",
        state: "PHASE_ACTIVE",
        current_phase: "investigate",
        mission_title: "Audit Checkout Usability & Recommend a Redesign",
        mission_configuration: {
          phases: [{ id: "investigate", type: "investigation" }],
          role: {
            title: "UI / UX Designer",
            manager: { name: "Elena Rostova", title: "Principal Product Designer" },
          },
          briefing: {
            task: "Review usability research, identify interaction barriers, and prioritize redesign recommendations.",
          },
          resources: [
            { id: "design-heuristic-audit", title: "Heuristic Evaluation & Journey Map", type: "heuristic_evaluation", content: "Heuristic findings" },
            { id: "usability-test-session-notes", title: "Usability Testing Session Notes & Clips", type: "user_research", content: "Session clips" },
            { id: "accessibility-mobile-audit", title: "Mobile Interaction & Accessibility Audit", type: "accessibility_audit", content: "Accessibility details" },
          ],
          investigation: {
            completion: {
              required_findings: 1,
              required_resource_access: ["usability-test-session-notes"],
            },
          },
        },
      },
    });

    render(<TrialMission />);

    expect(screen.getByTestId("ux-designer-workspace")).toBeInTheDocument();
    expect(screen.queryByTestId("business-analyst-workspace")).not.toBeInTheDocument();
    expect(screen.queryByTestId("developer-workspace")).not.toBeInTheDocument();
    expect(screen.queryByTestId("unsupported-workspace")).not.toBeInTheDocument();
    expect(screen.getByText("Audit Checkout Usability & Recommend a Redesign")).toBeInTheDocument();
    expect(screen.getByText("UX Investigation Workspace")).toBeInTheDocument();

    // Verify configured UX resources render dynamically
    expect(screen.getByText("Heuristic Evaluation & Journey Map")).toBeInTheDocument();
    expect(screen.getByText("Usability Testing Session Notes & Clips")).toBeInTheDocument();
    expect(screen.getByText("Mobile Interaction & Accessibility Audit")).toBeInTheDocument();

    // Verify manager card displays Elena Rostova
    expect(screen.getByText("Elena Rostova")).toBeInTheDocument();
    expect(screen.getByText("Principal Product Designer")).toBeInTheDocument();

    // Verify completion checklist uses configured required resource
    expect(screen.getByText("Inspect usability-test-session-notes")).toBeInTheDocument();
  });

  test("unknown workspace_type does NOT silently render BA, Dev, or UX workspace", () => {
    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "unknown-session-id",
        workspace_type: "data_scientist",
        state: "PHASE_ACTIVE",
        current_phase: "investigate",
        mission_title: "Data Science Task",
        mission_config: {
          phases: [{ id: "investigate", type: "investigation" }],
        },
      },
    });

    render(<TrialMission />);

    expect(screen.getByTestId("unsupported-workspace")).toBeInTheDocument();
    expect(screen.queryByTestId("business-analyst-workspace")).not.toBeInTheDocument();
    expect(screen.queryByTestId("developer-workspace")).not.toBeInTheDocument();
    expect(screen.queryByTestId("ux-designer-workspace")).not.toBeInTheDocument();
    expect(screen.getByText(/Unsupported workspace type: "data_scientist"/i)).toBeInTheDocument();
  });

  test("null or undefined workspace_type renders unsupported message and does NOT fallback to BA", () => {
    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "null-session-id",
        workspace_type: null,
        state: "PHASE_ACTIVE",
        current_phase: "investigate",
        mission_title: "Legacy Mission",
        mission_config: {
          phases: [{ id: "investigate", type: "investigation" }],
        },
      },
    });

    render(<TrialMission />);

    expect(screen.getByTestId("unsupported-workspace")).toBeInTheDocument();
    expect(screen.queryByTestId("business-analyst-workspace")).not.toBeInTheDocument();
    expect(screen.queryByTestId("developer-workspace")).not.toBeInTheDocument();
    expect(screen.queryByTestId("ux-designer-workspace")).not.toBeInTheDocument();
    expect(screen.getByText(/Unsupported workspace type: "unspecified"/i)).toBeInTheDocument();
  });

  test("shared session lifecycle controls (pause, resume, abandon) function identically across workspaces", () => {
    const handlePause = jest.fn();
    const handleAbandon = jest.fn();

    sessionHook.useTrialMissionSession.mockReturnValue({
      ...baseSessionHook,
      session: {
        id: "dev-session-id",
        workspace_type: "developer",
        state: "PHASE_ACTIVE",
        current_phase: "investigate",
        allowed_actions: ["pause", "abandon"],
        mission_title: "Debug Production Latency & Cart State Sync",
        mission_config: {
          phases: [{ id: "investigate", type: "investigation" }],
        },
      },
      handlePause,
      handleAbandon,
    });

    render(<TrialMission />);

    const pauseBtn = screen.getByRole("button", { name: /Pause/i });
    fireEvent.click(pauseBtn);
    expect(handlePause).toHaveBeenCalledTimes(1);

    const abandonBtn = screen.getByRole("button", { name: /Abandon/i });
    fireEvent.click(abandonBtn);
    expect(handleAbandon).toHaveBeenCalledTimes(1);
  });
});

describe("WorkspaceRegistry", () => {
  const { WORKSPACE_COMPONENTS, getWorkspaceComponent } = require("../components/trialMission/WorkspaceRegistry");
  const BusinessAnalystWorkspace = require("../components/trialMission/BusinessAnalystWorkspace").default;
  const DeveloperWorkspace = require("../components/trialMission/DeveloperWorkspace").default;
  const UXDesignerWorkspace = require("../components/trialMission/UXDesignerWorkspace").default;

  test("contains valid mappings for all active workspace families", () => {
    expect(WORKSPACE_COMPONENTS.business_analyst).toBe(BusinessAnalystWorkspace);
    expect(WORKSPACE_COMPONENTS.developer).toBe(DeveloperWorkspace);
    expect(WORKSPACE_COMPONENTS.ux_designer).toBe(UXDesignerWorkspace);
  });

  test("getWorkspaceComponent resolves valid components", () => {
    expect(getWorkspaceComponent("business_analyst")).toBe(BusinessAnalystWorkspace);
    expect(getWorkspaceComponent("developer")).toBe(DeveloperWorkspace);
    expect(getWorkspaceComponent("ux_designer")).toBe(UXDesignerWorkspace);
  });

  test("getWorkspaceComponent returns null for unknown or invalid workspace types", () => {
    expect(getWorkspaceComponent("unknown_type")).toBeNull();
    expect(getWorkspaceComponent("data_science")).toBeNull();
    expect(getWorkspaceComponent(null)).toBeNull();
    expect(getWorkspaceComponent(undefined)).toBeNull();
    expect(getWorkspaceComponent("")).toBeNull();
  });
});



