import React, { useState, useMemo } from "react";
import { Activity, AlertTriangle, CheckCircle2, Lock, Rocket, Loader2 } from "lucide-react";
import WorkspaceHeader from "./shared/WorkspaceHeader";
import ResourceInspectorPanel from "./shared/ResourceInspectorPanel";
import WorkingNotesPanel from "./shared/WorkingNotesPanel";
import FindingComposer from "./shared/FindingComposer";
import WorkspaceTaskChecklistPanel from "./shared/WorkspaceTaskChecklistPanel";

export default function ProcessWorkflowWorkspace({
  session,
  configuration,
  activeResource,
  notesValue,
  setNotesValue,
  notesStatus,
  findings = [],
  findingsList,
  handleAccessResource,
  showFindingForm: externalShowFindingForm,
  setShowFindingForm: externalSetShowFindingForm,
  findingStatement: externalFindingStatement,
  setFindingStatement: externalSetFindingStatement,
  findingResource: externalFindingResource,
  setFindingResource: externalSetFindingResource,
  findingExplanation: externalFindingExplanation,
  setFindingExplanation: externalSetFindingExplanation,
  findingUncertainty: externalFindingUncertainty,
  setFindingUncertainty: externalSetFindingUncertainty,
  handleSaveNewFinding,
  handleCompleteInvestigation,
  isCompletingInvestigation,
  actionLoading = false,
  workspaceLoading = false,
}) {
  const rawProcess = configuration?.workspace?.process || configuration?.process;

  const processConfig = useMemo(() => {
    if (!rawProcess || typeof rawProcess !== "object") {
      return null;
    }
    if (!Array.isArray(rawProcess.stages) || rawProcess.stages.length === 0) {
      return null;
    }
    return {
      process_name: rawProcess.process_name || "Process Workflow",
      description: rawProcess.description || "",
      stages: rawProcess.stages
    };
  }, [rawProcess]);

  const [selectedStageId, setSelectedStageId] = useState(
    processConfig?.stages[0]?.id || ""
  );

  const effectiveFindings = findingsList !== undefined ? findingsList : (findings || []);

  const [localShowFindingForm, setLocalShowFindingForm] = useState(false);
  const [localFindingStatement, setLocalFindingStatement] = useState("");
  const [localFindingResource, setLocalFindingResource] = useState("");
  const [localFindingExplanation, setLocalFindingExplanation] = useState("");
  const [localFindingUncertainty, setLocalFindingUncertainty] = useState("");

  const showFindingForm = externalShowFindingForm !== undefined ? externalShowFindingForm : localShowFindingForm;
  const setShowFindingForm = externalSetShowFindingForm || setLocalShowFindingForm;

  const findingStatement = externalFindingStatement !== undefined ? externalFindingStatement : localFindingStatement;
  const setFindingStatement = externalSetFindingStatement || setLocalFindingStatement;

  const findingResource = externalFindingResource !== undefined ? externalFindingResource : localFindingResource;
  const setFindingResource = externalSetFindingResource || setLocalFindingResource;

  const findingExplanation = externalFindingExplanation !== undefined ? externalFindingExplanation : localFindingExplanation;
  const setFindingExplanation = externalSetFindingExplanation || setLocalFindingExplanation;

  const findingUncertainty = externalFindingUncertainty !== undefined ? externalFindingUncertainty : localFindingUncertainty;
  const setFindingUncertainty = externalSetFindingUncertainty || setLocalFindingUncertainty;

  const activeStage = useMemo(() => {
    if (!processConfig) return null;
    return (
      processConfig.stages.find((s) => s.id === selectedStageId) ||
      processConfig.stages[0] ||
      null
    );
  }, [processConfig, selectedStageId]);

  const processMetrics = useMemo(() => {
    if (!processConfig) return null;

    let totalCycleTime = 0;
    let totalTargetSla = 0;
    let maxRatio = 0;
    let bottleneckId = "";
    const stageMetrics = {};

    processConfig.stages.forEach((stage) => {
      const latency = Number(stage.latency_minutes ?? stage.base_latency_minutes ?? 0);
      const slaTarget = Number(stage.sla_target_minutes ?? 0);

      totalCycleTime += latency;
      totalTargetSla += slaTarget;

      const slaRatio = slaTarget > 0 ? latency / slaTarget : 0;
      if (slaRatio > maxRatio) {
        maxRatio = slaRatio;
        bottleneckId = stage.id;
      }

      stageMetrics[stage.id] = {
        latency,
        slaTarget,
        slaStatus: slaTarget > 0 && latency <= slaTarget ? "COMPLIANT" : "SLA_BREACH",
        slaRatio
      };
    });

    return {
      totalCycleTime,
      totalTargetSla,
      overallStatus:
        totalTargetSla > 0 && totalCycleTime <= totalTargetSla
          ? "SLA Compliant"
          : "SLA Breach Warning",
      bottleneckStageId: bottleneckId,
      stageMetrics
    };
  }, [processConfig]);

  const resourcesList = configuration?.resources || [];
  const requiredResourceIds = configuration?.investigation?.required_resource_ids || [];

  const accessedResourceIdsSet = useMemo(
    () => new Set(session?.accessed_resource_ids || []),
    [session?.accessed_resource_ids]
  );

  const handlePinStageFinding = (stage) => {
    if (!stage || !processMetrics) return;
    const metrics = processMetrics.stageMetrics[stage.id];
    const statementText = `[Process Finding - ${stage.name}] Configured Latency: ${metrics?.latency}m, SLA Target: ${metrics?.slaTarget}m (${metrics?.slaStatus}).`;

    setFindingStatement(statementText);
    setFindingResource("");
    setShowFindingForm(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6" data-testid="process-workflow-workspace">
      <WorkspaceHeader
        session={session}
        badgeLabel="Process Workflow Workspace"
        badgeColorClass="bg-blue-50 border-blue-200 text-blue-800"
        badgeIcon={Activity}
        notesStatus={notesStatus}
      />

      {!processConfig ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-2">Process Configuration Unavailable</h3>
          <p className="text-xs text-slate-500">
            No valid process workflow pipeline was provided in the mission configuration.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Overview Bar */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">{processConfig.process_name}</h3>
              {processConfig.description && (
                <p className="text-xs text-slate-400 mt-1">
                  {processConfig.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-6 text-right flex-wrap">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Estimated Cycle Time</div>
                <div className="text-lg font-black text-cyan-400 font-mono">
                  {processMetrics.totalCycleTime} mins
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Target SLA</div>
                <div className="text-lg font-black text-slate-200 font-mono">
                  {processMetrics.totalTargetSla} mins
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">System SLA Status</div>
                <span
                  className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold font-mono mt-1 ${
                    processMetrics.overallStatus === "SLA Compliant"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {processMetrics.overallStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Main 12-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 cols): Process Pipeline Diagram & Stage Inspector */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                  Process Pipeline Diagram
                </h4>
                <div className="space-y-2.5">
                  {processConfig.stages.map((stage) => {
                    const metrics = processMetrics.stageMetrics[stage.id];
                    const isSelected = stage.id === activeStage?.id;
                    const isBottleneck = stage.id === processMetrics.bottleneckStageId;

                    return (
                      <div
                        key={stage.id}
                        onClick={() => setSelectedStageId(stage.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/60 shadow-sm ring-1 ring-blue-400"
                            : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">{stage.name}</span>
                            {stage.risk_flag && (
                              <span className="rounded bg-amber-100 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                Risk Flag
                              </span>
                            )}
                            {isBottleneck && (
                              <span className="rounded bg-rose-100 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold text-rose-800">
                                Bottleneck
                              </span>
                            )}
                          </div>
                          {stage.owner && (
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              Owner: {stage.owner} • SLA Target: {metrics?.slaTarget}m
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`font-mono text-xs font-bold px-2.5 py-1 rounded-xl ${
                              metrics?.slaStatus === "COMPLIANT"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {metrics?.latency}m
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Stage Inspector Panel */}
              {activeStage && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                    Stage Inspector: {activeStage.name}
                  </h4>
                  <div className="text-xs text-slate-700 space-y-2">
                    {activeStage.owner && (
                      <div><strong className="text-slate-900">Owner:</strong> {activeStage.owner}</div>
                    )}
                    {Array.isArray(activeStage.inputs) && (
                      <div><strong className="text-slate-900">Inputs:</strong> {activeStage.inputs.join(", ") || "None"}</div>
                    )}
                    {Array.isArray(activeStage.outputs) && (
                      <div><strong className="text-slate-900">Outputs:</strong> {activeStage.outputs.join(", ") || "None"}</div>
                    )}
                    {Array.isArray(activeStage.dependencies) && (
                      <div><strong className="text-slate-900">Dependencies:</strong> {activeStage.dependencies.join(", ") || "None (Root Stage)"}</div>
                    )}
                    <div>
                      <strong className="text-slate-900">Configured Latency:</strong> {processMetrics.stageMetrics[activeStage.id]?.latency} mins |{" "}
                      <strong className="text-slate-900">SLA Target:</strong> {processMetrics.stageMetrics[activeStage.id]?.slaTarget} mins
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handlePinStageFinding(activeStage)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
                    >
                      Pin Finding for Stage
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (5 cols): Primitives (Resources, Notes, Findings, Checklist) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <ResourceInspectorPanel
                resources={resourcesList}
                activeResource={activeResource}
                accessedResourceIds={accessedResourceIdsSet}
                handleAccessResource={handleAccessResource}
                title="Process Evidence"
                theme="blue"
              />

              <WorkingNotesPanel
                notesValue={notesValue}
                setNotesValue={setNotesValue}
                notesStatus={notesStatus}
              />

              <FindingComposer
                findings={effectiveFindings}
                resources={resourcesList}
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
                actionLoading={actionLoading}
                workspaceLoading={workspaceLoading}
                title="Process Findings"
                description="Recorded findings and operational bottlenecks."
              />

              <WorkspaceTaskChecklistPanel
                manager={configuration?.manager || {}}
                briefing={configuration?.briefing || {}}
                findings={effectiveFindings}
                requiredFindingsCount={configuration?.investigation?.required_findings || 1}
                requiredResourceAccess={requiredResourceIds}
                accessedResourceIds={accessedResourceIdsSet}
                handleCompleteInvestigation={handleCompleteInvestigation}
                actionLoading={actionLoading || isCompletingInvestigation}
                isInvestigationPhase={true}
                defaultManagerName="Process Operations Lead"
                defaultManagerTitle="Operations Manager"
                defaultTask="Analyze stage latencies, identify bottlenecks, and record required findings."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}