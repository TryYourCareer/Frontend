import React from "react";
import { Activity } from "lucide-react";
import WorkspaceHeader from "./shared/WorkspaceHeader";
import ResourceInspectorPanel from "./shared/ResourceInspectorPanel";
import WorkingNotesPanel from "./shared/WorkingNotesPanel";
import FindingComposer from "./shared/FindingComposer";
import WorkspaceTaskChecklistPanel from "./shared/WorkspaceTaskChecklistPanel";

export default function BusinessAnalystWorkspace({
  session,
  manager = {},
  briefing = {},
  resources = [],
  accessedResourceIds = new Set(),
  activeResource = null,
  setActiveResource = () => {},
  handleAccessResource = () => {},
  notesValue = "",
  setNotesValue = () => {},
  notesStatus = "saved",
  findings = [],
  workspaceLoading = false,
  showFindingForm = false,
  setShowFindingForm = () => {},
  findingStatement = "",
  setFindingStatement = () => {},
  findingResource = "",
  setFindingResource = () => {},
  findingExplanation = "",
  setFindingExplanation = () => {},
  findingUncertainty = "",
  setFindingUncertainty = () => {},
  handleSaveNewFinding = () => {},
  handleCompleteInvestigation = () => {},
  requiredFindingsCount = 1,
  requiredResourceAccess = [],
  actionLoading = false,
  isInvestigationPhase = true,
}) {
  return (
    <div className="space-y-6" data-testid="business-analyst-workspace">
      <WorkspaceHeader
        session={session}
        badgeLabel="Investigation Workspace"
        badgeColorClass="bg-emerald-50 border-emerald-200 text-emerald-800"
        badgeIcon={Activity}
        notesStatus={notesStatus}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ResourceInspectorPanel
          resources={resources}
          accessedResourceIds={accessedResourceIds}
          activeResource={activeResource}
          setActiveResource={setActiveResource}
          handleAccessResource={handleAccessResource}
          title="Resources"
          theme="emerald"
          actionLoading={actionLoading}
        />

        <div className="space-y-6 lg:col-span-6">
          <WorkingNotesPanel
            notesValue={notesValue}
            setNotesValue={setNotesValue}
            title="Working Notes"
            description="Private analytical scratchpad (autosaved to server)."
            placeholder="Record your observations, notes on checkout funnel drop-offs, and thoughts here..."
          />

          <FindingComposer
            findings={findings}
            resources={resources}
            showFindingForm={showFindingForm}
            setShowFindingForm={setShowFindingForm}
            findingStatement={findingStatement}
            setFindingStatement={setFindingStatement}
            findingResource={findingResource}
            setFindingResource={setFindingResource}
            findingExplanation={findingExplanation}
            setFindingExplanation={setFindingExplanation}
            findingUncertainty={findingUncertainty}
            setFindingUncertainty={setFindingUncertainty}
            handleSaveNewFinding={handleSaveNewFinding}
            workspaceLoading={workspaceLoading}
            actionLoading={actionLoading}
            title="Recorded Findings"
            description="Structured evidence-backed findings submitted for your recommendation."
            statementPlaceholder="e.g., Major drop-off concentrated at the payment method selection step."
          />
        </div>

        <WorkspaceTaskChecklistPanel
          manager={manager}
          briefing={briefing}
          findings={findings}
          requiredFindingsCount={requiredFindingsCount}
          requiredResourceAccess={requiredResourceAccess}
          accessedResourceIds={accessedResourceIds}
          handleCompleteInvestigation={handleCompleteInvestigation}
          actionLoading={actionLoading}
          isInvestigationPhase={isInvestigationPhase}
          defaultManagerName="Sarah"
          defaultManagerTitle="Product Manager"
          defaultTask="Identify the drop-off causes and record your findings."
        />
      </div>
    </div>
  );
}
