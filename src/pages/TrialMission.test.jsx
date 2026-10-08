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
import { getCareerFitReport } from "../services/discoveryTest";

jest.mock("../services/discoveryTest", () => ({
  __esModule: true,
  getCareerFitReport: jest.fn(),
}));

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

describe("Discovery Recommended Missions, Explore More & Dynamic Sector Filter", () => {
  const mockMissions = [
    {
      id: "mission-ds-1",
      title: "Data Science Investigation",
      career_id: "career-uuid-ds",
      career: { id: "career-uuid-ds", name: "Data Scientist", sector: "Technology" },
      workspace_type: "data_notebook",
      description: "Analyze machine learning drift and models.",
    },
    {
      id: "mission-ux-1",
      title: "UX Flow Redesign",
      career_id: "career-uuid-ux",
      career: { id: "career-uuid-ux", name: "UX Designer", sector: "Creative & Design" },
      workspace_type: "ux_designer",
      description: "Optimize user checkout workflow.",
    },
    {
      id: "mission-ux-2",
      title: "UX Usability Audit",
      career_id: "career-uuid-ux",
      career: { id: "career-uuid-ux", name: "UX Designer", sector: "Creative & Design" },
      workspace_type: "ux_designer",
      description: "Conduct heuristic evaluation.",
    },
    {
      id: "mission-ba-1",
      title: "Business Process Optimization",
      career_id: "career-uuid-ba",
      career: { id: "career-uuid-ba", name: "Business Analyst", sector: "Business & Management" },
      workspace_type: "business_analyst",
      description: "Evaluate operational bottlenecks.",
    },
    {
      id: "mission-nurse-1",
      title: "Clinical Workflow Triage",
      career_id: "career-uuid-nurse",
      career: { id: "career-uuid-nurse", name: "Registered Nurse", sector: "Healthcare & Medicine" },
      workspace_type: "healthcare",
      description: "Review patient priority metrics.",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockSearchParams = new URLSearchParams();
    getSessionActivitySummary.mockResolvedValue({ categories: [] });
    getCareerFitReport.mockResolvedValue(null);
    useTrialMissionSession.mockReturnValue({
      ...defaultMockSessionHook,
      missions: mockMissions,
      startSession: mockStartSession,
    });
  });

  test("1. Reads completed Discovery recommendations from localStorage test session ID", async () => {
    localStorage.setItem("latest_test_session_id", "session-rec-abc");
    getCareerFitReport.mockResolvedValue({
      top_matches: [
        { career_id: "career-uuid-ds", career_name: "Data Scientist", sector: "Technology" },
      ],
    });

    render(<TrialMission />);

    await waitFor(() => {
      expect(getCareerFitReport).toHaveBeenCalledWith("session-rec-abc");
    });
  });

  test("2. Recommended missions are identified strictly by canonical career_id, not career_name", async () => {
    localStorage.setItem("latest_test_session_id", "session-canonical-test");
    // Discovery returns matching career_id with different name to prove ID matching
    getCareerFitReport.mockResolvedValue({
      top_matches: [
        {
          career_id: "career-uuid-ds",
          career_name: "Completely Different Name In Discovery",
          sector: "Technology",
        },
      ],
    });

    render(<TrialMission />);

    // Recommended section appears and contains Data Science Investigation because career_id matches
    expect(await screen.findByText("Recommended Trial Missions")).toBeInTheDocument();
    expect(screen.getByText("Data Science Investigation")).toBeInTheDocument();

    // Other missions whose career_id did NOT match are not shown in recommended section
    expect(screen.queryByText("Business Process Optimization")).not.toBeInTheDocument();
    expect(screen.queryByText("Clinical Workflow Triage")).not.toBeInTheDocument();
  });

  test("3. Recommended missions are shown initially and non-recommended missions are hidden", async () => {
    localStorage.setItem("latest_test_session_id", "session-initial-view");
    getCareerFitReport.mockResolvedValue({
      top_matches: [
        { career_id: "career-uuid-ds", career_name: "Data Scientist" },
      ],
    });

    render(<TrialMission />);

    expect(await screen.findByText("Recommended Trial Missions")).toBeInTheDocument();
    expect(screen.getByText("Data Science Investigation")).toBeInTheDocument();

    // Non-recommended missions are hidden before clicking Explore More
    expect(screen.queryByText("Business Process Optimization")).not.toBeInTheDocument();
    expect(screen.queryByText("Clinical Workflow Triage")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /explore more missions/i })).toBeInTheDocument();
  });

  test("4. Explore More reveals remaining active missions without duplicating recommended missions", async () => {
    localStorage.setItem("latest_test_session_id", "session-explore-test");
    getCareerFitReport.mockResolvedValue({
      top_matches: [
        { career_id: "career-uuid-ds", career_name: "Data Scientist" },
      ],
    });

    render(<TrialMission />);

    expect(await screen.findByText("Recommended Trial Missions")).toBeInTheDocument();
    const exploreBtn = screen.getByRole("button", { name: /explore more missions/i });
    fireEvent.click(exploreBtn);

    // Remaining missions are now visible under All Other Trial Missions
    expect(await screen.findByText("All Other Trial Missions")).toBeInTheDocument();
    expect(screen.getByText("Business Process Optimization")).toBeInTheDocument();
    expect(screen.getByText("Clinical Workflow Triage")).toBeInTheDocument();

    // Recommended mission remains in Recommended section and is NOT duplicated in Explore More
    const dsCards = screen.getAllByText("Data Science Investigation");
    expect(dsCards.length).toBe(1);
  });

  test("5. Preserves all active missions when a recommended career has multiple missions", async () => {
    localStorage.setItem("latest_test_session_id", "session-multi-mission");
    getCareerFitReport.mockResolvedValue({
      top_matches: [
        { career_id: "career-uuid-ux", career_name: "UX Designer" },
      ],
    });

    render(<TrialMission />);

    expect(await screen.findByText("Recommended Trial Missions")).toBeInTheDocument();
    // Both active missions for UX Designer are shown in the recommended section
    expect(screen.getByText("UX Flow Redesign")).toBeInTheDocument();
    expect(screen.getByText("UX Usability Audit")).toBeInTheDocument();
  });

  test("6. Derives dynamic sector filter options from returned mission data and filters correctly", async () => {
    localStorage.setItem("latest_test_session_id", "session-sector-filter");
    getCareerFitReport.mockResolvedValue({
      top_matches: [
        { career_id: "career-uuid-ds", career_name: "Data Scientist" },
      ],
    });

    render(<TrialMission />);

    const exploreBtn = await screen.findByRole("button", { name: /explore more missions/i });
    fireEvent.click(exploreBtn);

    // Sector select dropdown is present
    const sectorSelect = await screen.findByLabelText(/sector filter/i);
    expect(sectorSelect).toBeInTheDocument();

    // Check dynamically populated options
    const options = Array.from(sectorSelect.querySelectorAll("option")).map((o) => o.value);
    expect(options).toContain("all");
    expect(options).toContain("Business & Management");
    expect(options).toContain("Creative & Design");
    expect(options).toContain("Healthcare & Medicine");

    // Filter by "Healthcare & Medicine"
    fireEvent.change(sectorSelect, { target: { value: "Healthcare & Medicine" } });

    expect(screen.getByText("Clinical Workflow Triage")).toBeInTheDocument();
    expect(screen.queryByText("Business Process Optimization")).not.toBeInTheDocument();

    // Filter back to "all"
    fireEvent.change(sectorSelect, { target: { value: "all" } });
    expect(screen.getByText("Clinical Workflow Triage")).toBeInTheDocument();
    expect(screen.getByText("Business Process Optimization")).toBeInTheDocument();
  });

  test("7. Shows clear empty state when no recommended careers have active missions, but Explore More is available", async () => {
    localStorage.setItem("latest_test_session_id", "session-no-rec-missions");
    getCareerFitReport.mockResolvedValue({
      top_matches: [
        { career_id: "career-uuid-uncovered", career_name: "Uncovered Specialty" },
      ],
    });

    render(<TrialMission />);

    expect(
      await screen.findByText("No recommended Trial Missions are currently available for your top careers.")
    ).toBeInTheDocument();

    // All other trial missions are still accessible
    expect(screen.getByText("All Other Trial Missions")).toBeInTheDocument();
    expect(screen.getByText("Data Science Investigation")).toBeInTheDocument();
    expect(screen.getByText("Clinical Workflow Triage")).toBeInTheDocument();
  });

  test("8. Users without completed Discovery see standard catalog of all available simulations", async () => {
    getCareerFitReport.mockResolvedValue(null);

    render(<TrialMission />);

    expect(screen.getByRole("heading", { name: /Available Simulations/i })).toBeInTheDocument();
    expect(screen.queryByText("Recommended Trial Missions")).not.toBeInTheDocument();
    expect(screen.getByText("Data Science Investigation")).toBeInTheDocument();
    expect(screen.getByText("UX Flow Redesign")).toBeInTheDocument();
    expect(screen.getByText("Clinical Workflow Triage")).toBeInTheDocument();
  });

  test("9. Clicking Launch Simulation initiates the session with authoritative mission ID", async () => {
    localStorage.setItem("latest_test_session_id", "session-launch-test");
    getCareerFitReport.mockResolvedValue({
      top_matches: [
        { career_id: "career-uuid-ds", career_name: "Data Scientist" },
      ],
    });

    render(<TrialMission />);

    const launchBtn = await screen.findByRole("button", { name: /try this career/i });
    fireEvent.click(launchBtn);

    expect(mockStartSession).toHaveBeenCalledWith("mission-ds-1");
  });

  test("10. Discovery loading state is displayed and does not expose full catalog while in flight", async () => {
    localStorage.setItem("latest_test_session_id", "session-loading-test");
    // Return unresolved promise to simulate in-flight request
    let resolveReport;
    getCareerFitReport.mockImplementation(() => new Promise((resolve) => { resolveReport = resolve; }));

    render(<TrialMission />);

    // 1. Discovery loading indicator is shown
    expect(screen.getByText(/Loading your personalized career recommendations.../i)).toBeInTheDocument();

    // 2. Full catalog / non-recommended missions are NOT prematurely rendered
    expect(screen.queryByText("Available Simulations")).not.toBeInTheDocument();
    expect(screen.queryByText("Data Science Investigation")).not.toBeInTheDocument();
    expect(screen.queryByText("Clinical Workflow Triage")).not.toBeInTheDocument();

    // Resolve report
    resolveReport({
      top_matches: [
        { career_id: "career-uuid-ds", career_name: "Data Scientist" },
      ],
    });

    // 3. Recommended section appears after load
    expect(await screen.findByText("Recommended Trial Missions")).toBeInTheDocument();
    expect(screen.getByText("Data Science Investigation")).toBeInTheDocument();
  });

  test("11. Discovery report request failure displays non-blocking informative fallback banner", async () => {
    localStorage.setItem("latest_test_session_id", "session-failed-test");
    getCareerFitReport.mockRejectedValue(new Error("Network Error"));

    render(<TrialMission />);

    // 1. Non-blocking error banner is displayed
    expect(
      await screen.findByText(/Personalized recommendations could not be loaded/i)
    ).toBeInTheDocument();

    // 2. Falls back to showing all available simulations so user is not blocked
    expect(screen.getByRole("heading", { name: /Available Simulations/i })).toBeInTheDocument();
    expect(screen.getByText("Data Science Investigation")).toBeInTheDocument();
    expect(screen.getByText("Clinical Workflow Triage")).toBeInTheDocument();
  });
});
