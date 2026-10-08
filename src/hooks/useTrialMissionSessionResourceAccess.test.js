import { renderHook, act } from "@testing-library/react";
import { useTrialMissionSession } from "./useTrialMissionSession";
import * as api from "../services/trialMission";
import apiClient from "../lib/api";

jest.mock("../services/trialMission", () => ({
  __esModule: true,
  ...jest.requireActual("../services/trialMission"),
  getMissionSession: jest.fn(),
  accessMissionResource: jest.fn(),
  saveWorkingNotes: jest.fn(),
}));

describe("Trial Mission Resource Access Contract & Normalization Tests", () => {
  const mockSession = {
    id: "test-session-123",
    mission_id: "test-mission-456",
    mission_version_id: "test-version-789",
    state: "PHASE_ACTIVE",
    current_phase: "investigate",
    accessed_resource_ids: ["res_1"],
    mission_configuration: {
      resources: [
        { id: "res_1", title: "Resource 1", type: "document" },
        { id: "res_2", title: "Resource 2", type: "dataset" },
      ],
      investigation: {
        required_resource_access: ["res_1", "res_2"],
        completion: { required_findings: 0 },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    api.getMissionSession.mockResolvedValue(mockSession);
    api.accessMissionResource.mockResolvedValue({
      id: "res_2",
      title: "Resource 2",
      type: "dataset",
    });
  });

  test("1. string resource ID passed unchanged to accessMissionResource", async () => {
    const { result } = renderHook(() => useTrialMissionSession("test-session-123"));

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.handleAccessResource("res_2");
    });

    expect(api.accessMissionResource).toHaveBeenCalledWith("test-session-123", "res_2");
    expect(result.current.accessedResourceIds.has("res_2")).toBe(true);
  });

  test("2. resource object passed from workspace -> extracts canonical ID and never passes object", async () => {
    const { result } = renderHook(() => useTrialMissionSession("test-session-123"));

    await act(async () => {
      await Promise.resolve();
    });

    const resourceObj = { id: "res_2", title: "Resource 2", type: "dataset" };
    await act(async () => {
      await result.current.handleAccessResource(resourceObj);
    });

    expect(api.accessMissionResource).toHaveBeenCalledWith("test-session-123", "res_2");
    expect(api.accessMissionResource).not.toHaveBeenCalledWith(
      "test-session-123",
      expect.objectContaining({ title: "Resource 2" })
    );
  });

  test("3. accessMissionResource service helper normalizes object inputs without sending [object Object]", async () => {
    const actualAccessResource = jest.requireActual("../services/trialMission").accessMissionResource;
    const postSpy = jest.spyOn(apiClient, "post").mockResolvedValue({ data: { success: true } });

    // Passing object to accessMissionResource
    await actualAccessResource("test-session-123", { id: "res_polymer_spec" });

    expect(postSpy).toHaveBeenCalledWith(
      "/trial-missions/sessions/test-session-123/resources/res_polymer_spec/access"
    );

    // Ensure URL does not contain [object Object]
    const callUrl = postSpy.mock.calls[0][0];
    expect(callUrl).not.toContain("[object Object]");
    expect(callUrl).toBe("/trial-missions/sessions/test-session-123/resources/res_polymer_spec/access");

    postSpy.mockRestore();
  });

  test("4. accessMissionResource handles legacy resource_id or identifier in object", async () => {
    const actualAccessResource = jest.requireActual("../services/trialMission").accessMissionResource;
    const postSpy = jest.spyOn(apiClient, "post").mockResolvedValue({ data: { success: true } });

    await actualAccessResource("test-session-123", { resource_id: "res_legacy_1" });
    expect(postSpy).toHaveBeenCalledWith(
      "/trial-missions/sessions/test-session-123/resources/res_legacy_1/access"
    );

    await actualAccessResource("test-session-123", { identifier: "res_identifier_2" });
    expect(postSpy).toHaveBeenCalledWith(
      "/trial-missions/sessions/test-session-123/resources/res_identifier_2/access"
    );

    postSpy.mockRestore();
  });

  test("5. successful access updates accessedResourceIds and session.accessed_resource_ids immediately", async () => {
    const { result } = renderHook(() => useTrialMissionSession("test-session-123"));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.accessedResourceIds.has("res_1")).toBe(true);
    expect(result.current.accessedResourceIds.has("res_2")).toBe(false);

    await act(async () => {
      await result.current.handleAccessResource("res_2");
    });

    expect(result.current.accessedResourceIds.has("res_2")).toBe(true);
    expect(result.current.session.accessed_resource_ids).toContain("res_2");
  });

  test("6. session reload preserves accessedResourceIds from server", async () => {
    const { result } = renderHook(() => useTrialMissionSession("test-session-123"));

    await act(async () => {
      await Promise.resolve();
    });

    api.getMissionSession.mockResolvedValueOnce({
      ...mockSession,
      accessed_resource_ids: ["res_1", "res_2"],
    });

    await act(async () => {
      await result.current.loadSession("test-session-123");
    });

    expect(result.current.accessedResourceIds.has("res_1")).toBe(true);
    expect(result.current.accessedResourceIds.has("res_2")).toBe(true);
  });
});
