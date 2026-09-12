import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Activity, Palette } from "lucide-react";
import WorkspaceHeader from "./WorkspaceHeader";
import ResourceInspectorPanel from "./ResourceInspectorPanel";
import WorkingNotesPanel from "./WorkingNotesPanel";
import FindingComposer from "./FindingComposer";
import WorkspaceTaskChecklistPanel from "./WorkspaceTaskChecklistPanel";

describe("Phase 16B — Shared Workspace Primitives", () => {
  describe("WorkspaceHeader", () => {
    test("renders mission title, current phase, custom badge label and notes autosave status", () => {
      render(
        <WorkspaceHeader
          session={{ mission_title: "Optimizing Microservices", current_phase: "investigate" }}
          badgeLabel="Dev Workspace"
          badgeColorClass="bg-blue-50 border-blue-200 text-blue-800"
          badgeIcon={Activity}
          notesStatus="saved"
        />
      );

      expect(screen.getByText("Optimizing Microservices")).toBeInTheDocument();
      expect(screen.getByText("Phase: investigate")).toBeInTheDocument();
      expect(screen.getByText("Dev Workspace")).toBeInTheDocument();
      expect(screen.getByText("Saved")).toBeInTheDocument();
    });

    test("renders notesStatus as Saving, Error, or Ready based on props", () => {
      const { rerender } = render(
        <WorkspaceHeader
          session={{ mission_title: "Mission A", current_phase: "investigate" }}
          notesStatus="saving"
        />
      );
      expect(screen.getByText("Saving...")).toBeInTheDocument();

      rerender(
        <WorkspaceHeader
          session={{ mission_title: "Mission A", current_phase: "investigate" }}
          notesStatus="error"
        />
      );
      expect(screen.getByText("Error")).toBeInTheDocument();
    });
  });

  describe("ResourceInspectorPanel", () => {
    const mockResources = [
      { id: "res-1", title: "API Latency Log", type: "telemetry", content: "Latency spikes at 14:00" },
      { id: "res-2", title: "DB Slow Query Report", type: "report", content: "Query unindexed" },
    ];
    const mockAccessResource = jest.fn();
    const mockSetActiveResource = jest.fn();

    test("renders resource list and handles inspect click", () => {
      render(
        <ResourceInspectorPanel
          resources={mockResources}
          accessedResourceIds={new Set(["res-1"])}
          activeResource={null}
          setActiveResource={mockSetActiveResource}
          handleAccessResource={mockAccessResource}
          title="Telemetry Data"
          theme="blue"
        />
      );

      expect(screen.getByText("Telemetry Data")).toBeInTheDocument();
      expect(screen.getByText("API Latency Log")).toBeInTheDocument();
      expect(screen.getByText("DB Slow Query Report")).toBeInTheDocument();

      const inspectBtns = screen.getAllByRole("button", { name: /(Inspect|Re-open)/i });
      fireEvent.click(inspectBtns[0]);
      expect(mockAccessResource).toHaveBeenCalledWith("res-1");
    });

    test("displays active resource preview and allows closing it", () => {
      render(
        <ResourceInspectorPanel
          resources={mockResources}
          accessedResourceIds={new Set(["res-1"])}
          activeResource={mockResources[0]}
          setActiveResource={mockSetActiveResource}
          handleAccessResource={mockAccessResource}
          title="Resources"
          theme="purple"
        />
      );

      expect(screen.getByText("Latency spikes at 14:00")).toBeInTheDocument();
      const closeBtn = screen.getByRole("button", { name: "✕" });
      fireEvent.click(closeBtn);
      expect(mockSetActiveResource).toHaveBeenCalledWith(null);
    });
  });

  describe("WorkingNotesPanel", () => {
    test("renders notes text, character count, and changes trigger setNotesValue", () => {
      const mockSetNotes = jest.fn();
      render(
        <WorkingNotesPanel
          notesValue="Initial notes text"
          setNotesValue={mockSetNotes}
          title="Analyst Scratchpad"
          description="Scratchpad description"
          placeholder="Type your notes..."
        />
      );

      expect(screen.getByText("Analyst Scratchpad")).toBeInTheDocument();
      expect(screen.getByText("Scratchpad description")).toBeInTheDocument();
      expect(screen.getByText("18 chars")).toBeInTheDocument();

      const textarea = screen.getByPlaceholderText("Type your notes...");
      expect(textarea.value).toBe("Initial notes text");

      fireEvent.change(textarea, { target: { value: "Updated note" } });
      expect(mockSetNotes).toHaveBeenCalledWith("Updated note");
    });
  });

  describe("FindingComposer", () => {
    const mockFindings = [
      {
        id: "f1",
        statement: "Drop-off is located at payment gateway",
        evidence: [{ resource_id: "res-1", explanation: "Funnel drop" }],
        uncertainty: "Low",
      },
    ];
    const mockResources = [{ id: "res-1", title: "Funnel Report" }];
    const mockSetShowForm = jest.fn();
    const mockSaveFinding = jest.fn((e) => e.preventDefault());

    test("renders findings list and toggle button to show finding form", () => {
      render(
        <FindingComposer
          findings={mockFindings}
          resources={mockResources}
          showFindingForm={false}
          setShowFindingForm={mockSetShowForm}
        />
      );

      expect(screen.getByText("Drop-off is located at payment gateway")).toBeInTheDocument();
      expect(screen.getByText(/Finding #1/i)).toBeInTheDocument();
      expect(screen.getByText(/Uncertainty: Low/i)).toBeInTheDocument();

      const addBtn = screen.getByRole("button", { name: /Add Finding/i });
      fireEvent.click(addBtn);
      expect(mockSetShowForm).toHaveBeenCalledWith(true);
    });

    test("renders finding form when showFindingForm is true and submits form", () => {
      const mockSetStatement = jest.fn();
      render(
        <FindingComposer
          findings={[]}
          resources={mockResources}
          showFindingForm={true}
          setShowFindingForm={mockSetShowForm}
          findingStatement="New statement"
          setFindingStatement={mockSetStatement}
          handleSaveNewFinding={mockSaveFinding}
        />
      );

      expect(screen.getByText("Record New Evidence Finding")).toBeInTheDocument();
      const statementInput = screen.getByDisplayValue("New statement");
      fireEvent.change(statementInput, { target: { value: "Edited statement" } });
      expect(mockSetStatement).toHaveBeenCalledWith("Edited statement");

      const saveBtn = screen.getByRole("button", { name: /Save Finding/i });
      fireEvent.click(saveBtn);
      expect(mockSaveFinding).toHaveBeenCalled();
    });
  });

  describe("WorkspaceTaskChecklistPanel", () => {
    const mockComplete = jest.fn();

    test("renders manager card, completion checklist items, and handles completion click", () => {
      render(
        <WorkspaceTaskChecklistPanel
          manager={{ name: "Alex Chen", title: "Lead Architect" }}
          briefing={{ task: "Identify bottleneck root-causes." }}
          findings={[{ id: "f1", statement: "Bottleneck found" }]}
          requiredFindingsCount={1}
          requiredResourceAccess={["res-1"]}
          accessedResourceIds={new Set(["res-1"])}
          handleCompleteInvestigation={mockComplete}
          actionLoading={false}
          isInvestigationPhase={true}
        />
      );

      expect(screen.getByText("Alex Chen")).toBeInTheDocument();
      expect(screen.getByText("Lead Architect")).toBeInTheDocument();
      expect(screen.getByText("Identify bottleneck root-causes.")).toBeInTheDocument();
      expect(screen.getByText("1/1")).toBeInTheDocument();
      expect(screen.getByText("Done")).toBeInTheDocument();

      const completeBtn = screen.getByRole("button", { name: /Complete investigation/i });
      expect(completeBtn).not.toBeDisabled();
      fireEvent.click(completeBtn);
      expect(mockComplete).toHaveBeenCalled();
    });
  });
});
