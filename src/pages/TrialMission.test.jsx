let mockSearchParams = new URLSearchParams();
let mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useSearchParams: () => [mockSearchParams, jest.fn()],
  useNavigate: () => mockNavigate,
}));

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
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
