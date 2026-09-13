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
  });

  test("renders View Career Decision & Fit CTA for SESSION_COMPLETED, clicking navigates to /career-decision, and existing actions remain intact", () => {
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
    const cta = screen.getByRole("button", { name: /view career decision & fit/i });
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
