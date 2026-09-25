import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SystemArchitectWorkspace, {
  getComponentIcon,
  validateArchitectureState,
} from "./SystemArchitectWorkspace";

describe("SystemArchitectWorkspace Helpers", () => {
  test("getComponentIcon returns appropriate icons for component types", () => {
    expect(getComponentIcon("database")).toBeDefined();
    expect(getComponentIcon("aurora_postgresql")).toBeDefined();
    expect(getComponentIcon("dns_gateway")).toBeDefined();
    expect(getComponentIcon("firewall_proxy")).toBeDefined();
    expect(getComponentIcon("kafka_queue")).toBeDefined();
    expect(getComponentIcon("api_service")).toBeDefined();
    expect(getComponentIcon("worker_compute")).toBeDefined();
    expect(getComponentIcon("unknown_custom")).toBeDefined();
    expect(getComponentIcon(null)).toBeDefined();
  });

  test("validateArchitectureState validates connections, redundancy, and region isolation", () => {
    const components = [
      { id: "comp-1", type: "db", status: "healthy", region: "reg-a", is_critical: true, has_standby: true },
      { id: "comp-2", type: "db", status: "healthy", region: "reg-b", is_critical: true, has_standby: true },
      { id: "comp-3", type: "api", status: "healthy", region: "reg-a" },
    ];
    const connections = [
      { id: "conn-1", source: "comp-1", target: "comp-2" },
      { id: "conn-2", source: "comp-3", target: "comp-1" },
    ];
    const rules = [
      { id: "rule-1", type: "require_connection", source: "comp-1", target: "comp-2" },
      { id: "rule-2", type: "require_redundancy", component_type: "db", min_redundancy: 2 },
      { id: "rule-3", type: "require_region_isolation", component_id: "comp-1", required_region: "reg-a" },
      { id: "rule-4", type: "prohibit_single_point_of_failure" },
    ];

    const report = validateArchitectureState(components, connections, rules);
    expect(report.passed).toBe(true);
    expect(report.results.length).toBe(4);
    expect(report.results.every((r) => r.satisfied)).toBe(true);
  });

  test("validateArchitectureState detects unmet constraints", () => {
    const components = [
      { id: "comp-1", type: "db", status: "failed", region: "reg-b", is_critical: true, has_standby: false },
    ];
    const connections = [];
    const rules = [
      { id: "rule-conn", type: "require_connection", source: "comp-1", target: "comp-2" },
      { id: "rule-red", type: "require_redundancy", component_type: "db", min_redundancy: 2 },
      { id: "rule-reg", type: "require_region_isolation", component_id: "comp-1", required_region: "reg-a" },
      { id: "rule-spof", type: "prohibit_single_point_of_failure" },
    ];

    const report = validateArchitectureState(components, connections, rules);
    expect(report.passed).toBe(false);
    expect(report.results.some((r) => !r.satisfied)).toBe(true);
  });
});

describe("SystemArchitectWorkspace Component", () => {
  const mockSession = {
    id: "arch-session-1",
    workspace_type: "system_architect",
    mission_title: "High Availability Architecture Evaluation",
    mission_configuration: {
      investigation: {
        completion: {
          required_resource_access: ["res-arch-spec"],
        },
      },
      workspace: {
        type: "system_architect",
        canvas: {
          regions: [
            { id: "region-alpha", name: "Alpha Datacenter", color: "blue" },
            { id: "region-beta", name: "Beta Datacenter", color: "purple" },
          ],
          components: [
            {
              id: "node-load-balancer",
              name: "Global Edge Router",
              type: "dns_router",
              region: "region-alpha",
              zone: "Edge DMZ",
              status: "healthy",
              properties: {
                protocol: "HTTPS",
                capacity_qps: "50,000",
              },
            },
            {
              id: "node-primary-db",
              name: "Core Relational Cluster",
              type: "database",
              region: "region-alpha",
              zone: "Data Tier",
              status: "healthy",
              properties: {
                engine: "SQL Engine v2",
                storage_gb: "4000",
              },
            },
            {
              id: "node-standby-db",
              name: "Standby Replica Cluster",
              type: "database_replica",
              region: "region-beta",
              zone: "DR Tier",
              status: "healthy",
              properties: {
                replication: "Async Stream",
                lag_seconds: "2",
              },
            },
          ],
          connections: [
            {
              id: "link-router-primary",
              source: "node-load-balancer",
              target: "node-primary-db",
              protocol: "gRPC",
              latency_ms: 5,
            },
            {
              id: "link-replication",
              source: "node-primary-db",
              target: "node-standby-db",
              protocol: "Replication Stream",
              latency_ms: 45,
            },
          ],
        },
        simulations: [
          {
            id: "sim-failover-event",
            title: "Simulate Alpha Primary Outage",
            description: "Triggers catastrophic hardware fault on Alpha Core Relational Cluster.",
            effects: {
              failed_components: ["node-primary-db"],
              degraded_connections: ["link-replication"],
              telemetry_deltas: {
                replication_lag_ms: "Lost Connection",
                uncommitted_tx_count: 85,
              },
              system_log: "ALERT: Alpha Core Relational Cluster unreachable. Quorum election pending.",
            },
          },
        ],
        validation_rules: [
          { id: "v1", type: "require_connection", source: "node-load-balancer", target: "node-primary-db" },
        ],
      },
    },
  };

  const mockManager = {
    name: "Dr. Aris Thorne",
    title: "Chief Systems Architect",
  };

  const mockBriefing = {
    task: "Audit cross-datacenter replication lag and verify automated failover bounds.",
  };

  const mockResources = [
    {
      id: "res-arch-spec",
      title: "System Topology & RTO Specification",
      type: "architecture_spec",
      content: "RTO must remain below 30 seconds. RPO must remain 0 data loss.",
    },
    {
      id: "res-traffic-log",
      title: "Peak Hourly Traffic Distribution",
      type: "telemetry_log",
      content: "Average throughput 35,000 QPS with 14% burst spikes.",
    },
  ];

  test("renders 3-panel architecture layout, regions, components, and connections", () => {
    render(
      <SystemArchitectWorkspace
        session={mockSession}
        manager={mockManager}
        briefing={mockBriefing}
        resources={mockResources}
        accessedResourceIds={new Set()}
        activeResource={null}
        setActiveResource={jest.fn()}
        handleAccessResource={jest.fn()}
        notesValue=""
        setNotesValue={jest.fn()}
        notesStatus="ready"
        findings={[]}
      />
    );

    // Workspace container rendered
    expect(screen.getByTestId("system-architect-workspace")).toBeInTheDocument();

    // 1. Left Panel (Dossier)
    expect(screen.getByText("Architecture Dossier")).toBeInTheDocument();
    expect(screen.getByText("System Topology & RTO Specification")).toBeInTheDocument();
    expect(screen.getByText("Peak Hourly Traffic Distribution")).toBeInTheDocument();

    // 2. Center Panel (Topology Canvas & Regions)
    expect(screen.getByText("System Topology Canvas")).toBeInTheDocument();
    expect(screen.getByText("Alpha Datacenter")).toBeInTheDocument();
    expect(screen.getByText("Beta Datacenter")).toBeInTheDocument();

    // Configured Components rendered
    expect(screen.getByText("Global Edge Router")).toBeInTheDocument();
    expect(screen.getByText("Core Relational Cluster")).toBeInTheDocument();
    expect(screen.getByText("Standby Replica Cluster")).toBeInTheDocument();

    // 3. Right Panel (Manager & Workbench)
    expect(screen.getByText("Dr. Aris Thorne")).toBeInTheDocument();
    expect(screen.getByText("Chief Systems Architect")).toBeInTheDocument();
    expect(screen.getByText(/Audit cross-datacenter replication lag/i)).toBeInTheDocument();
    expect(screen.getByText("Architecture Notes")).toBeInTheDocument();
  });

  test("clicking resource invokes handleAccessResource handler", () => {
    const handleAccessResource = jest.fn();

    render(
      <SystemArchitectWorkspace
        session={mockSession}
        manager={mockManager}
        briefing={mockBriefing}
        resources={mockResources}
        accessedResourceIds={new Set()}
        activeResource={null}
        setActiveResource={jest.fn()}
        handleAccessResource={handleAccessResource}
        notesValue=""
        setNotesValue={jest.fn()}
        notesStatus="ready"
        findings={[]}
      />
    );

    const specButton = screen.getByText("System Topology & RTO Specification");
    fireEvent.click(specButton);
    expect(handleAccessResource).toHaveBeenCalledWith(mockResources[0]);
  });

  test("component inspection displays properties drawer", () => {
    render(
      <SystemArchitectWorkspace
        session={mockSession}
        manager={mockManager}
        briefing={mockBriefing}
        resources={mockResources}
        accessedResourceIds={new Set()}
        activeResource={null}
        setActiveResource={jest.fn()}
        handleAccessResource={jest.fn()}
        notesValue=""
        setNotesValue={jest.fn()}
        notesStatus="ready"
        findings={[]}
      />
    );

    // Click Core Relational Cluster node
    const dbNode = screen.getByText("Core Relational Cluster");
    fireEvent.click(dbNode);

    // Inspector opens with node details
    expect(screen.getByText(/Component Inspector: Core Relational Cluster/i)).toBeInTheDocument();
    expect(screen.getByText("SQL Engine v2")).toBeInTheDocument();
    expect(screen.getByText("4000")).toBeInTheDocument();
  });

  test("running fault simulation updates component state to failed and displays telemetry alert", () => {
    render(
      <SystemArchitectWorkspace
        session={mockSession}
        manager={mockManager}
        briefing={mockBriefing}
        resources={mockResources}
        accessedResourceIds={new Set()}
        activeResource={null}
        setActiveResource={jest.fn()}
        handleAccessResource={jest.fn()}
        notesValue=""
        setNotesValue={jest.fn()}
        notesStatus="ready"
        findings={[]}
      />
    );

    // Trigger simulation
    const simButton = screen.getByText("Simulate Alpha Primary Outage");
    fireEvent.click(simButton);

    // Simulation banner and system log appears
    expect(screen.getByText(/Active Fault:/i)).toBeInTheDocument();
    expect(screen.getByText(/ALERT: Alpha Core Relational Cluster unreachable/i)).toBeInTheDocument();
    expect(screen.getByText("Simulation Telemetry Alert")).toBeInTheDocument();
    expect(screen.getByText("Lost Connection")).toBeInTheDocument();

    // Reset simulation
    const resetBtn = screen.getAllByRole("button", { name: /Reset/i })[0];
    fireEvent.click(resetBtn);

    expect(screen.queryByText("Simulation Telemetry Alert")).not.toBeInTheDocument();
  });

  test("notes and findings handlers are reused properly", () => {
    const setNotesValue = jest.fn();
    const setShowFindingForm = jest.fn();
    const handleCreateFinding = jest.fn();

    render(
      <SystemArchitectWorkspace
        session={mockSession}
        manager={mockManager}
        briefing={mockBriefing}
        resources={mockResources}
        accessedResourceIds={new Set()}
        activeResource={null}
        setActiveResource={jest.fn()}
        handleAccessResource={jest.fn()}
        notesValue="Initial observation."
        setNotesValue={setNotesValue}
        notesStatus="ready"
        findings={[{ id: "f1", statement: "Replication lag violates 30s threshold." }]}
        showFindingForm={true}
        setShowFindingForm={setShowFindingForm}
        findingStatement="New architectural finding"
        setFindingStatement={jest.fn()}
        handleCreateFinding={handleCreateFinding}
      />
    );

    // Notes textarea
    const textarea = screen.getByPlaceholderText(/Record topology observations/i);
    fireEvent.change(textarea, { target: { value: "Updated topology analysis" } });
    expect(setNotesValue).toHaveBeenCalledWith("Updated topology analysis");

    // Existing finding rendered
    expect(screen.getByText("Replication lag violates 30s threshold.")).toBeInTheDocument();

    // Pin finding button
    const pinBtn = screen.getByRole("button", { name: /Pin Finding/i });
    fireEvent.click(pinBtn);
    expect(handleCreateFinding).toHaveBeenCalledTimes(1);
  });

  test("investigation completion is enabled only when required resources are accessed", () => {
    const onCompletePhase = jest.fn();

    const { rerender } = render(
      <SystemArchitectWorkspace
        session={mockSession}
        manager={mockManager}
        briefing={mockBriefing}
        resources={mockResources}
        accessedResourceIds={new Set()} // Missing required res-arch-spec
        activeResource={null}
        setActiveResource={jest.fn()}
        handleAccessResource={jest.fn()}
        notesValue=""
        setNotesValue={jest.fn()}
        notesStatus="ready"
        findings={[]}
        onCompletePhase={onCompletePhase}
      />
    );

    const completeBtn = screen.getByRole("button", { name: /Complete Investigation/i });
    expect(completeBtn).toBeDisabled();

    // Re-render with required resource accessed
    rerender(
      <SystemArchitectWorkspace
        session={mockSession}
        manager={mockManager}
        briefing={mockBriefing}
        resources={mockResources}
        accessedResourceIds={new Set(["res-arch-spec"])}
        activeResource={null}
        setActiveResource={jest.fn()}
        handleAccessResource={jest.fn()}
        notesValue=""
        setNotesValue={jest.fn()}
        notesStatus="ready"
        findings={[]}
        onCompletePhase={onCompletePhase}
      />
    );

    expect(completeBtn).not.toBeDisabled();
    fireEvent.click(completeBtn);
    expect(onCompletePhase).toHaveBeenCalledTimes(1);
  });

  test("gracefully handles empty or missing canvas configuration with Topology Unavailable badge", () => {
    const emptySession = {
      id: "empty-session",
      workspace_type: "system_architect",
      mission_configuration: {
        workspace: {
          type: "system_architect",
          // Canvas and simulations omitted
        },
      },
    };

    render(
      <SystemArchitectWorkspace
        session={emptySession}
        manager={mockManager}
        briefing={mockBriefing}
        resources={[]}
        accessedResourceIds={new Set()}
        activeResource={null}
        setActiveResource={jest.fn()}
        handleAccessResource={jest.fn()}
        notesValue=""
        setNotesValue={jest.fn()}
        notesStatus="ready"
        findings={[]}
      />
    );

    expect(screen.getByTestId("system-architect-workspace")).toBeInTheDocument();
    expect(screen.getByText("System Topology Canvas")).toBeInTheDocument();
    expect(screen.getByText("Topology Unavailable")).toBeInTheDocument();
    expect(screen.queryByText("Topology Valid")).not.toBeInTheDocument();
    expect(screen.getByText("No Topology Configuration Available")).toBeInTheDocument();
  });

  test("renders domain-specific Bioprocess Engineer topology canvas, components, and connections", () => {
    const bioprocessSession = {
      id: "session-bioprocess-1",
      workspace_type: "system_architect",
      mission_configuration: {
        workspace: {
          type: "system_architect",
          canvas: {
            regions: [
              { id: "reg_upstream", name: "Upstream Feed & Media Prep", status: "active", location: "upstream" },
              { id: "reg_core", name: "Core Production Cell", status: "active", location: "core" },
            ],
            components: [
              {
                id: "comp_seed_feed",
                name: "Seed Train Inoculum Skid",
                type: "feed_controller",
                zone: "Inoculation Suite",
                region: "reg_upstream",
                status: "healthy",
                properties: { operating_state: "nominal" },
                description: "Primary seed feed.",
              },
              {
                id: "comp_production_vessel",
                name: "Primary Production Bioreactor (2000L)",
                type: "bioreactor_vessel",
                zone: "Production Hall",
                region: "reg_core",
                status: "healthy",
                properties: { working_volume: "2000L" },
                description: "Scale-up production vessel.",
              },
            ],
            connections: [
              {
                id: "conn_seed_to_prod",
                source: "comp_seed_feed",
                target: "comp_production_vessel",
                protocol: "Aseptic Feed Stream",
                latency_ms: 8,
                status: "active",
              },
            ],
          },
          simulations: [],
          validation_rules: [],
        },
      },
    };

    render(
      <SystemArchitectWorkspace
        session={bioprocessSession}
        manager={mockManager}
        briefing={mockBriefing}
        resources={mockResources}
        accessedResourceIds={new Set(["res-arch-spec"])}
        activeResource={null}
        setActiveResource={jest.fn()}
        handleAccessResource={jest.fn()}
        notesValue=""
        setNotesValue={jest.fn()}
        notesStatus="ready"
        findings={[]}
      />
    );

    // Regions rendered
    expect(screen.getByText("Upstream Feed & Media Prep")).toBeInTheDocument();
    expect(screen.getByText("Core Production Cell")).toBeInTheDocument();

    // Components rendered
    expect(screen.getByText("Seed Train Inoculum Skid")).toBeInTheDocument();
    expect(screen.getByText("Primary Production Bioreactor (2000L)")).toBeInTheDocument();

    // Connection rendered
    expect(screen.getByText("comp_seed_feed")).toBeInTheDocument();
    expect(screen.getByText("comp_production_vessel")).toBeInTheDocument();
    expect(screen.getByText("8ms")).toBeInTheDocument();

    // Topology Valid
    expect(screen.getByText("Topology Valid")).toBeInTheDocument();
  });
  test("standard TrialMission props handleSaveNewFinding, handleCompleteInvestigation, and actionLoading work properly", () => {
    const handleSaveNewFinding = jest.fn();
    const handleCompleteInvestigation = jest.fn();

    const { rerender } = render(
      <SystemArchitectWorkspace
        session={mockSession}
        manager={mockManager}
        briefing={mockBriefing}
        resources={mockResources}
        accessedResourceIds={new Set(["res-arch-spec"])}
        activeResource={null}
        setActiveResource={jest.fn()}
        handleAccessResource={jest.fn()}
        notesValue=""
        setNotesValue={jest.fn()}
        notesStatus="ready"
        findings={[]}
        showFindingForm={true}
        setShowFindingForm={jest.fn()}
        findingStatement="Critical single point of failure in DB router"
        setFindingStatement={jest.fn()}
        handleSaveNewFinding={handleSaveNewFinding}
        handleCompleteInvestigation={handleCompleteInvestigation}
        actionLoading={false}
      />
    );

    // 1. Pin Finding invokes handleSaveNewFinding
    const pinBtn = screen.getByRole("button", { name: /Pin Finding/i });
    expect(pinBtn).not.toBeDisabled();
    fireEvent.click(pinBtn);
    expect(handleSaveNewFinding).toHaveBeenCalledTimes(1);

    // 2. Complete Investigation invokes handleCompleteInvestigation
    const completeBtn = screen.getByRole("button", { name: /Complete Investigation/i });
    expect(completeBtn).not.toBeDisabled();
    fireEvent.click(completeBtn);
    expect(handleCompleteInvestigation).toHaveBeenCalledTimes(1);

    // 3. actionLoading disables buttons and renders loading indicators
    rerender(
      <SystemArchitectWorkspace
        session={mockSession}
        manager={mockManager}
        briefing={mockBriefing}
        resources={mockResources}
        accessedResourceIds={new Set(["res-arch-spec"])}
        activeResource={null}
        setActiveResource={jest.fn()}
        handleAccessResource={jest.fn()}
        notesValue=""
        setNotesValue={jest.fn()}
        notesStatus="ready"
        findings={[]}
        showFindingForm={true}
        setShowFindingForm={jest.fn()}
        findingStatement="Critical single point of failure in DB router"
        setFindingStatement={jest.fn()}
        handleSaveNewFinding={handleSaveNewFinding}
        handleCompleteInvestigation={handleCompleteInvestigation}
        actionLoading={true}
      />
    );

    expect(screen.getByRole("button", { name: /Saving Finding.../i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Completing.../i })).toBeDisabled();
  });
});
