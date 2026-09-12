import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DocumentWorkbenchWorkspace, { CANONICAL_DOCUMENT_SECTIONS } from "./DocumentWorkbenchWorkspace";
import { getWorkspaceComponent, WORKSPACE_COMPONENTS } from "./WorkspaceRegistry";

describe("DocumentWorkbenchWorkspace", () => {
  const mockSession = {
    id: "test-session-id",
    workspace_type: "document_workbench",
    mission_title: "Product Strategy & Architecture Review",
    mission_configuration: {
      workspace: {
        type: "document_workbench",
        document: {
          title: "PRD: Real-Time Telemetry Specification",
          sections: [
            {
              id: "executive_summary",
              title: "Executive Summary",
              description: "Summarize the customer churn risk.",
              placeholder: "Enter summary here...",
            },
          ],
        },
      },
    },
  };

  const initialMemoForm = {
    executive_summary: "Initial summary",
    key_findings: "",
    evidence: "",
    recommendation: "",
    risks_limitations: "",
    next_steps: "",
  };

  it("is registered in WORKSPACE_COMPONENTS under document_workbench", () => {
    expect(WORKSPACE_COMPONENTS.document_workbench).toBe(DocumentWorkbenchWorkspace);
    expect(getWorkspaceComponent("document_workbench")).toBe(DocumentWorkbenchWorkspace);
  });

  it("renders the 6 canonical document sections", () => {
    render(
      <DocumentWorkbenchWorkspace
        session={mockSession}
        memoForm={initialMemoForm}
      />
    );

    expect(screen.getByTestId("document-workbench-workspace")).toBeInTheDocument();
    expect(screen.getByText("PRD: Real-Time Telemetry Specification")).toBeInTheDocument();

    // Verify all 6 section titles appear in the navigation or outline checklist
    expect(screen.getAllByText(/Executive Summary/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Key Findings & Analysis/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Evidence & Supporting Data/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Strategic Recommendation/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Risks & Constraints/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Implementation & Next Steps/i).length).toBeGreaterThan(0);
  });

  it("edits the active section and invokes handleSaveOutput directly without using working notes", () => {
    const handleSaveOutput = jest.fn();
    const setMemoForm = jest.fn();

    render(
      <DocumentWorkbenchWorkspace
        session={mockSession}
        memoForm={initialMemoForm}
        setMemoForm={setMemoForm}
        handleSaveOutput={handleSaveOutput}
      />
    );

    const textarea = screen.getByTestId("document-section-executive_summary");
    expect(textarea).toHaveValue("Initial summary");

    fireEvent.change(textarea, { target: { value: "Updated executive summary text with more details" } });

    expect(setMemoForm).toHaveBeenCalledWith({
      ...initialMemoForm,
      executive_summary: "Updated executive summary text with more details",
    });

    expect(handleSaveOutput).toHaveBeenCalledWith({
      ...initialMemoForm,
      executive_summary: "Updated executive summary text with more details",
    });
  });

  it("switches active sections and updates active editor", () => {
    const handleSaveOutput = jest.fn();
    const setMemoForm = jest.fn();

    render(
      <DocumentWorkbenchWorkspace
        session={mockSession}
        memoForm={initialMemoForm}
        setMemoForm={setMemoForm}
        handleSaveOutput={handleSaveOutput}
      />
    );

    // Click on 'Next Section'
    const nextBtn = screen.getByRole("button", { name: /Next Section/i });
    fireEvent.click(nextBtn);

    // Active textarea should now be key_findings
    const findingsTextarea = screen.getByTestId("document-section-key_findings");
    expect(findingsTextarea).toBeInTheDocument();

    fireEvent.change(findingsTextarea, { target: { value: "Latency spiked by 400ms during checkout" } });

    expect(handleSaveOutput).toHaveBeenCalledWith({
      ...initialMemoForm,
      key_findings: "Latency spiked by 400ms during checkout",
    });
  });
});

