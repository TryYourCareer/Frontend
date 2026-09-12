import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ProcessWorkflowWorkspace from "./ProcessWorkflowWorkspace";
import { getWorkspaceComponent, WORKSPACE_COMPONENTS } from "./WorkspaceRegistry";

describe("ProcessWorkflowWorkspace & WorkspaceRegistry Integration", () => {
  const mockConfig = {
    title: "Supply Chain Bottleneck Analysis",
    workspace: {
      type: "process_workflow",
      process: {
        process_name: "Warehouse Order Fulfillment Pipeline",
        description: "Order picking, packing, customs clearance, and last-mile dispatch.",
        stages: [
          {
            id: "picking",
            name: "1. Inventory Picking",
            owner: "Warehouse Agent",
            sla_target_minutes: 20,
            latency_minutes: 15,
            inputs: ["Order Ticket"],
            outputs: ["Picked Goods Box"],
            dependencies: [],
            risk_flag: false
          },
          {
            id: "customs",
            name: "2. Customs Documentation & Gate",
            owner: "Compliance Officer",
            sla_target_minutes: 30,
            latency_minutes: 50,
            inputs: ["Picked Goods Box"],
            outputs: ["Cleared Shipping Pallet"],
            dependencies: ["picking"],
            risk_flag: true
          }
        ]
      }
    },
    resources: [
      { id: "sop_doc", title: "Warehouse SOP", type: "document" }
    ],
    investigation: {
      checklist: [{ id: "check_1", label: "Inspect customs bottleneck" }],
      required_resource_ids: ["sop_doc"]
    }
  };

  const mockSession = {
    session_id: "test-session-123",
    current_phase: "investigate",
    accessed_resource_ids: ["sop_doc"]
  };

  test("WorkspaceRegistry resolves process_workflow correctly", () => {
    expect(WORKSPACE_COMPONENTS.process_workflow).toBe(ProcessWorkflowWorkspace);
    const resolved = getWorkspaceComponent("process_workflow");
    expect(resolved).toBe(ProcessWorkflowWorkspace);
  });

  test("renders process stages, latency, and SLA information strictly from configuration", () => {
    render(
      <ProcessWorkflowWorkspace
        session={mockSession}
        configuration={mockConfig}
        activeResource={null}
        notesValue=""
        setNotesValue={() => {}}
        notesStatus="Saved"
        findingsList={[]}
        handleAccessResource={() => {}}
        handleSaveNewFinding={() => {}}
        handleCompleteInvestigation={() => {}}
        isCompletingInvestigation={false}
      />
    );

    expect(screen.getByText(/Warehouse Order Fulfillment Pipeline/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1. Inventory Picking/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2. Customs Documentation & Gate/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/BOTTLENECK/i)).toBeInTheDocument();
    expect(screen.getByText(/65 mins/i)).toBeInTheDocument(); // 15 + 50
  });

  test("Pin Finding for Stage prepopulates stage statement without auto-selecting a resource", () => {
    const mockSaveFinding = jest.fn();

    render(
      <ProcessWorkflowWorkspace
        session={mockSession}
        configuration={mockConfig}
        activeResource={null}
        notesValue=""
        setNotesValue={() => {}}
        notesStatus="Saved"
        findingsList={[]}
        handleAccessResource={() => {}}
        handleSaveNewFinding={mockSaveFinding}
        handleCompleteInvestigation={() => {}}
        isCompletingInvestigation={false}
      />
    );

    const pinBtn = screen.getByText(/Pin Finding for Stage/i);
    fireEvent.click(pinBtn);

    // Finding statement is prefilled with stage context
    expect(screen.getByDisplayValue(/\[Process Finding - 1. Inventory Picking\]/i)).toBeInTheDocument();

    // Supporting resource select option must NOT be auto-selected (remains unselected "Select Resource...")
    const resourceSelect = screen.getByRole("combobox");
    expect(resourceSelect.value).toBe("");
  });

  test("renders safe unavailable state when process configuration is missing or invalid", () => {
    const emptyConfig = {
      title: "Empty Workflow Mission"
    };

    render(
      <ProcessWorkflowWorkspace
        session={mockSession}
        configuration={emptyConfig}
        activeResource={null}
        notesValue=""
        setNotesValue={() => {}}
        notesStatus="Saved"
        findingsList={[]}
        handleAccessResource={() => {}}
        handleSaveNewFinding={() => {}}
        handleCompleteInvestigation={() => {}}
        isCompletingInvestigation={false}
      />
    );

    expect(screen.getByText(/Process Configuration Unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/No valid process workflow pipeline was provided/i)).toBeInTheDocument();
    expect(screen.queryByText(/Standard Operational Workflow/i)).not.toBeInTheDocument();
  });
});
