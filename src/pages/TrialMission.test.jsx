let mockSearchParams = new URLSearchParams();
let mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useSearchParams: () => [mockSearchParams, jest.fn()],
  useNavigate: () => mockNavigate,
}));

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TrialMission from "./TrialMission";
import { useTrialMissionSession } from "../hooks/useTrialMissionSession";
import { getSessionActivitySummary } from "../services/trialMission";

jest.mock("../services/trialMission", () => ({
  __esModule: true,
  default: {
    getSessionActivitySummary: jest.fn(),
  },
  getSessionActivitySummary: jest.fn(),
}));

jest.mock("../hooks/useTrialMissionSession");
jest.mock("../hooks/useDebounceAutosave", () => ({
  useDebounceAutosave: () => ({
    value: "",
    setValue: jest.fn(),
    status: "saved",
  }),
}));

const mockStartSession = jest.fn();

const defaultMockSessionHook = {
  missions: [
    {
      id: "mission-ds-1",
      title: "Data Science Investigation",
      career_id: "career-1",
      workspace_type: "data_notebook",
    },
  ],
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
  startSession: mockStartSession,
  handleTransition: jest.fn(),
  handleAccessResource: jest.fn(),
  handleSaveNotes: jest.fn(),
  handleAddFinding: jest.fn(),
  handleCompleteInvestigation: jest.fn(),
  handleSubmitDecision: jest.fn(),
  handleGenerateConsequence: jest.fn(),
  handleFetchRealityEvent: jest.fn(),
  handleRealityEventResponse: jest.fn(),
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

describe("Phase 15G-D — TrialMission Route & Session Query Param Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    getSessionActivitySummary.mockResolvedValue({ categories: [] });
    useTrialMissionSession.mockReturnValue({ ...defaultMockSessionHook, startSession: mockStartSession });
  });

  test("A. /trial-mission?missionId=<valid-id> causes exactly one startSession call with authoritative ID", async () => {
    mockSearchParams = new URLSearchParams("missionId=mission-ds-1");

    render(<TrialMission />);

    await waitFor(() => {
      expect(mockStartSession).toHaveBeenCalledTimes(1);
      expect(mockStartSession).toHaveBeenCalledWith("mission-ds-1");
    });
  });

  test("B. /trial-mission without missionId does NOT call startSession", async () => {
    mockSearchParams = new URLSearchParams();

    render(<TrialMission />);

    expect(mockStartSession).not.toHaveBeenCalled();
  });

  test("C. Re-rendering does not produce duplicate startSession calls", async () => {
    mockSearchParams = new URLSearchParams("missionId=mission-swe-2");

    const { rerender } = render(<TrialMission />);

    await waitFor(() => {
      expect(mockStartSession).toHaveBeenCalledTimes(1);
      expect(mockStartSession).toHaveBeenCalledWith("mission-swe-2");
    });

    // Force re-render of component
    rerender(<TrialMission />);

    // Must still remain exactly 1 call (no duplicate trigger)
    expect(mockStartSession).toHaveBeenCalledTimes(1);
  });

  test("D. Mission ID containing URL-sensitive characters is passed safely", async () => {
    const rawMissionId = "mission:ds-cache/alpha+v1";
    mockSearchParams = new URLSearchParams(`missionId=${encodeURIComponent(rawMissionId)}`);

    render(<TrialMission />);

    await waitFor(() => {
      expect(mockStartSession).toHaveBeenCalledTimes(1);
      expect(mockStartSession).toHaveBeenCalledWith(rawMissionId);
    });
  });
});

describe("Gap #1 — Step 2: Trial Mission completion screen CTA", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    getSessionActivitySummary.mockResolvedValue({ categories: [] });
  });

  test("renders View Career Decision & Fit CTA for SESSION_COMPLETED, clicking navigates to /career-decision, and existing actions remain intact", async () => {
    const mockResetToCatalog = jest.fn();
    useTrialMissionSession.mockReturnValue({
      ...defaultMockSessionHook,
      session: {
        id: "test-session-completed",
        state: "SESSION_COMPLETED",
        mission_title: "Investigate Checkout Abandonment",
      },
      evaluationData: {
        status: "completed",
      },
      resetToCatalog: mockResetToCatalog,
    });

    render(<TrialMission />);

    // 1. Primary CTA is rendered
    const cta = await screen.findByRole("button", { name: /view career decision & fit/i });
    expect(cta).toBeInTheDocument();

    // 2. Existing completion actions remain present
    const exploreBtn = screen.getByRole("button", { name: /explore more missions/i });
    expect(exploreBtn).toBeInTheDocument();

    const dashboardBtn = screen.getByRole("button", { name: /return to dashboard/i });
    expect(dashboardBtn).toBeInTheDocument();

    // 3. Clicking CTA navigates to /career-decision
    fireEvent.click(cta);
    expect(mockNavigate).toHaveBeenCalledWith("/career-decision");

    // 4. Existing actions still work as expected
    fireEvent.click(exploreBtn);
    expect(mockResetToCatalog).toHaveBeenCalledTimes(1);

    fireEvent.click(dashboardBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test("renders View My Decision Report button when career_id is present, and clicking navigates to /careers/:careerId/decision-report", async () => {
    useTrialMissionSession.mockReturnValue({
      ...defaultMockSessionHook,
      session: {
        id: "test-session-completed",
        career_id: "software-engineer",
        state: "SESSION_COMPLETED",
        mission_title: "Investigate Checkout Abandonment",
      },
      evaluationData: {
        status: "completed",
        career_id: "software-engineer",
      },
    });

    render(<TrialMission />);

    const reportBtn = await screen.findByRole("button", { name: /view my decision report/i });
    expect(reportBtn).toBeInTheDocument();

    fireEvent.click(reportBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/careers/software-engineer/decision-report");
  });

});

describe("Gap #2A — User-facing Trial Mission Activity Summary", () => {
  const mockActivitySummaryData = {
    categories: [
      {
        category: "Investigation & Discovery",
        observations: [
          "Consulted 3 investigation resources (Cart state reducer & debounce handler, Server API logs & latency traces, Incident brief & issue report).",
          "Recorded 1 key finding from your investigation.",
        ],
      },
      {
        category: "Decision & Adaptation",
        observations: [
          "Selected recommendation: Switch to server-authoritative polling queue",
          "Revisited and adapted your recommendation after receiving new information (1 revision).",
        ],
      },
      {
        category: "Synthesis & Delivery",
        observations: [
          "Finalized and submitted the incident deliverable memo.",
        ],
      },
      {
        category: "Reflection",
        observations: [
          "Completed self-reflection on strengths, challenges, and next steps.",
        ],
      },
    ],
    resource_access_count: 3,
    resources_consulted: [
      "Cart state reducer & debounce handler",
      "Server API logs & latency traces",
      "Incident brief & issue report",
    ],
    findings_count: 1,
    selected_recommendation: "Switch to server-authoritative polling queue",
    recommendation_revised: true,
    decision_revision_count: 1,
    deliverable_submitted: true,
    reflection_completed: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  test("renders WHAT WE OBSERVED section with plain-language categories and observations", async () => {
    getSessionActivitySummary.mockResolvedValue(mockActivitySummaryData);

    useTrialMissionSession.mockReturnValue({
      ...defaultMockSessionHook,
      session: {
        id: "d638713a-9bda-40d2-969a-dc676cfe3dd5",
        state: "SESSION_COMPLETED",
        mission_title: "Full Stack Web Developer Trial Mission",
      },
      evaluationData: {
        status: "completed",
      },
    });

    render(<TrialMission />);

    // 1. Header is rendered
    expect(await screen.findByText("WHAT WE OBSERVED")).toBeInTheDocument();

    // 2. All 4 categories are rendered
    expect(screen.getByText("Investigation & Discovery")).toBeInTheDocument();
    expect(screen.getByText("Decision & Adaptation")).toBeInTheDocument();
    expect(screen.getByText("Synthesis & Delivery")).toBeInTheDocument();
    expect(screen.getByText("Reflection")).toBeInTheDocument();

    // 3. Plain language user-facing observations are rendered
    expect(
      screen.getByText(/Consulted 3 investigation resources/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Selected recommendation: Switch to server-authoritative polling queue/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Finalized and submitted the incident deliverable memo/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Completed self-reflection on strengths, challenges, and next steps/)
    ).toBeInTheDocument();

    // 4. Raw internal identifiers must NOT be rendered
    expect(screen.queryByText(/ctep_evidence/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/event_type/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/rule_id/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/behavioral_signal/i)).not.toBeInTheDocument();

    // 5. Existing CTAs remain present
    expect(screen.getByRole("button", { name: /explore more missions/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /return to dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /view career decision & fit/i })).toBeInTheDocument();
  });

  test("failed activity-summary request does not block completion UI or CTAs", async () => {
    getSessionActivitySummary.mockRejectedValue(new Error("Network Error"));

    useTrialMissionSession.mockReturnValue({
      ...defaultMockSessionHook,
      session: {
        id: "d638713a-9bda-40d2-969a-dc676cfe3dd5",
        state: "SESSION_COMPLETED",
        mission_title: "Full Stack Web Developer Trial Mission",
      },
      evaluationData: {
        status: "completed",
      },
    });

    render(<TrialMission />);

    // 1. Mission completion banner is still displayed
    expect(screen.getByText("You've completed this Trial Mission")).toBeInTheDocument();

    // 2. Non-blocking error notice is displayed
    expect(await screen.findByText("Activity Summary Notice")).toBeInTheDocument();
    expect(
      screen.getByText("Activity summary is temporarily unavailable.")
    ).toBeInTheDocument();

    // 3. All completion action buttons remain completely accessible
    expect(screen.getByRole("button", { name: /explore more missions/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /return to dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /view career decision & fit/i })).toBeInTheDocument();
  });
});


describe("Trial Mission UI Refinement — Full-Screen Shell & Stopwatch Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  test("active Trial Mission renders in full-screen overlay shell with top stopwatch header bar", async () => {
    useTrialMissionSession.mockReturnValue({
      ...defaultMockSessionHook,
      session: {
        id: "active-session-123",
        state: "PHASE_ACTIVE",
        current_phase: "investigate",
        mission_title: "Incident Response Investigation",
        active_duration_seconds: 527,
        stage_durations: [
          { stage: "WORKSPACE", stage_display: "Investigation Workspace", formatted_duration: "08m 47s" }
        ]
      },
      formattedStopwatch: "08:47",
    });

    const { container } = render(<TrialMission />);

    // 1. Full-screen overlay container is present with fixed inset-0 z-[100]
    const rootShell = container.querySelector(".cc-trial-mission-root");
    expect(rootShell).toBeInTheDocument();
    expect(rootShell.className).toContain("fixed inset-0 z-[100]");

    // 2. Integrated top header renders Trial Mission title, current phase & formatted stopwatch
    expect(screen.getByText("Trial Mission")).toBeInTheDocument();
    expect(screen.getByText(/Incident Response Investigation/)).toBeInTheDocument();
    expect(screen.getByText("08:47")).toBeInTheDocument();

    // 3. Control buttons are rendered
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /exit/i })).toBeInTheDocument();
  });

  test("completion screen renders refined timing summary breakdown alongside existing completion experience", async () => {
    getSessionActivitySummary.mockResolvedValue({ categories: [] });

    useTrialMissionSession.mockReturnValue({
      ...defaultMockSessionHook,
      session: {
        id: "completed-session-789",
        state: "SESSION_COMPLETED",
        mission_title: "Business Analyst Trial Mission",
        formatted_active_duration: "22m 00s",
        stage_durations: [
          { stage: "WORKSPACE", stage_display: "Investigation Workspace", formatted_duration: "06m 37s" },
          { stage: "RECOMMENDATION", stage_display: "Recommendation Rationale", formatted_duration: "03m 12s" },
          { stage: "FINAL_MEMO", stage_display: "Final Executive Memo", formatted_duration: "05m 51s" },
          { stage: "REFLECTION", stage_display: "Self Reflection", formatted_duration: "02m 16s" },
        ],
      },
      evaluationData: { status: "completed" },
      formattedStopwatch: "22:00",
    });

    render(<TrialMission />);

    // 1. Timing Summary Card renders total time and stage breakdown
    expect(await screen.findByText("Mission Timing Summary")).toBeInTheDocument();
    expect(screen.getByText("22m 00s")).toBeInTheDocument();
    expect(screen.getByText("Investigation Workspace")).toBeInTheDocument();
    expect(screen.getByText("06m 37s")).toBeInTheDocument();
    expect(screen.getByText("Recommendation Rationale")).toBeInTheDocument();
    expect(screen.getByText("03m 12s")).toBeInTheDocument();
    expect(screen.getByText("Final Executive Memo")).toBeInTheDocument();
    expect(screen.getByText("05m 51s")).toBeInTheDocument();
    expect(screen.getByText("Self Reflection")).toBeInTheDocument();
    expect(screen.getByText("02m 16s")).toBeInTheDocument();

    // 2. Existing completion functionality remains intact
    expect(screen.getByText("You've completed this Trial Mission")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /explore more missions/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /return to dashboard/i })).toBeInTheDocument();
  });

  test("renders process_workflow workspace with valid process configuration from mission_configuration", async () => {
    mockSearchParams = new URLSearchParams("mission=mission-pw-1");

    useTrialMissionSession.mockReturnValue({
      ...defaultMockSessionHook,
      session: {
        id: "session-pw-123",
        mission_id: "mission-pw-1",
        state: "PHASE_ACTIVE",
        current_phase: "investigate",
        workspace_type: "process_workflow",
        mission_configuration: {
          role: { title: "Supply Chain Analyst" },
          workspace: {
            type: "process_workflow",
            process: {
              process_name: "Supply Chain Bottleneck Pipeline",
              description: "End-to-end routing analysis and SLA tracking.",
              stages: [
                {
                  id: "stage_1",
                  name: "Assess Inbound Freight",
                  owner: "Logistics Lead",
                  latency_minutes: 20,
                  sla_target_minutes: 30,
                  risk_flag: false,
                  inputs: ["Freight Manifest"],
                  outputs: ["Inbound Verification"],
                  dependencies: [],
                },
              ],
            },
          },
          resources: [{ id: "res_1", title: "Freight Manifest", type: "document" }],
          investigation: {
            completion: { required_findings: 0, required_resource_access: ["res_1"] },
          },
        },
      },
    });

    render(<TrialMission />);

    const startBtn = await screen.findByRole("button", { name: /start investigating/i });
    fireEvent.click(startBtn);

    expect(await screen.findByText(/Supply Chain Bottleneck Pipeline/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Assess Inbound Freight/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/Process Configuration Unavailable/i)).not.toBeInTheDocument();
  });
});
