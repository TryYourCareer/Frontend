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
  accessedResourceIds: [],
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
