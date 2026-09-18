import React, { useState, useMemo } from "react";
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
  findingsList = [],
  handleAccessResource,
  handleSaveNewFinding,
  handleCompleteInvestigation,
  isCompletingInvestigation,
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

  // Finding composer state
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [findingStatement, setFindingStatement] = useState("");
  const [findingResource, setFindingResource] = useState("");
  const [findingExplanation, setFindingExplanation] = useState("");
  const [findingUncertainty, setFindingUncertainty] = useState("");

  const activeStage = useMemo(() => {
    if (!processConfig) return null;
    return (
      processConfig.stages.find((s) => s.id === selectedStageId) ||
      processConfig.stages[0] ||
      null
    );
  }, [processConfig, selectedStageId]);

  // Configuration-driven process metrics
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

  const allRequiredAccessed = requiredResourceIds.every((id) =>
    accessedResourceIdsSet.has(id)
  );

  const handlePinStageFinding = (stage) => {
    if (!stage || !processMetrics) return;
    const metrics = processMetrics.stageMetrics[stage.id];
    const statementText = `[Process Finding - ${stage.name}] Configured Latency: ${metrics?.latency}m, SLA Target: ${metrics?.slaTarget}m (${metrics?.slaStatus}).`;

    setFindingStatement(statementText);
    setFindingResource(""); // Explicitly leave resource unselected for learner choice
    setShowFindingForm(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px" }}>
      <WorkspaceHeader
        missionTitle={session?.mission_title || configuration?.title || "Process Workflow Investigation"}
        currentPhase={session?.current_phase || "investigate"}
        customBadgeLabel="Process Workflow Workspace"
        notesStatus={notesStatus}
      />

      {!processConfig ? (
        <div
          style={{
            padding: "32px",
            textAlign: "center",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px dashed #cbd5e1",
            color: "#475569"
          }}
        >
          <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>Process Configuration Unavailable</h3>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b" }}>
            No valid process workflow pipeline was provided in the mission configuration.
          </p>
        </div>
      ) : (
        <>
          {/* Top Overview Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#1e293b",
              color: "#f8fafc",
              padding: "16px",
              borderRadius: "8px"
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{processConfig.process_name}</h3>
              {processConfig.description && (
                <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
                  {processConfig.description}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: "16px", textAlign: "right" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>ESTIMATED CYCLE TIME</div>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#38bdf8" }}>
                  {processMetrics.totalCycleTime} mins
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>TARGET SLA</div>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#cbd5e1" }}>
                  {processMetrics.totalTargetSla} mins
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>SYSTEM SLA STATUS</div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    marginTop: "2px",
                    backgroundColor:
                      processMetrics.overallStatus === "SLA Compliant" ? "#166534" : "#991b1b",
                    color: "#ffffff"
                  }}
                >
                  {processMetrics.overallStatus}
                </div>
              </div>
            </div>
          </div>

          {/* Main 3-Panel Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Left Column: Process Pipeline Diagram & Stage Inspector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "16px"
                }}
              >
                <h4 style={{ margin: "0 0 12px 0", fontSize: "1rem", color: "#0f172a" }}>
                  Process Pipeline Diagram
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {processConfig.stages.map((stage) => {
                    const metrics = processMetrics.stageMetrics[stage.id];
                    const isSelected = stage.id === activeStage?.id;
                    const isBottleneck = stage.id === processMetrics.bottleneckStageId;

                    return (
                      <div
                        key={stage.id}
                        onClick={() => setSelectedStageId(stage.id)}
                        style={{
                          padding: "12px",
                          borderRadius: "6px",
                          border: isSelected ? "2px solid #2563eb" : "1px solid #cbd5e1",
                          backgroundColor: isSelected ? "#eff6ff" : "#f8fafc",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "0.95rem", color: "#1e293b" }}>
                            {stage.name}{" "}
                            {stage.risk_flag && (
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  backgroundColor: "#fef3c7",
                                  color: "#92400e",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  marginLeft: "6px"
                                }}
                              >
                                Risk Flag
                              </span>
                            )}
                            {isBottleneck && (
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  backgroundColor: "#fee2e2",
                                  color: "#991b1b",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  marginLeft: "6px"
                                }}
                              >
                                BOTTLENECK
                              </span>
                            )}
                          </div>
                          {stage.owner && (
                            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
                              Owner: {stage.owner} | SLA Target: {metrics?.slaTarget}m
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                              color: metrics?.slaStatus === "COMPLIANT" ? "#166534" : "#dc2626"
                            }}
                          >
                            {metrics?.latency}m
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Stage Inspector Panel */}
              {activeStage && (
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "16px"
                  }}
                >
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "1rem", color: "#0f172a" }}>
                    Stage Inspector: {activeStage.name}
                  </h4>
                  <div style={{ fontSize: "0.85rem", color: "#334155", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {activeStage.owner && (
                      <div>
                        <strong>Owner:</strong> {activeStage.owner}
                      </div>
                    )}
                    {Array.isArray(activeStage.inputs) && (
                      <div>
                        <strong>Inputs:</strong> {activeStage.inputs.join(", ") || "None"}
                      </div>
                    )}
                    {Array.isArray(activeStage.outputs) && (
                      <div>
                        <strong>Outputs:</strong> {activeStage.outputs.join(", ") || "None"}
                      </div>
                    )}
                    {Array.isArray(activeStage.dependencies) && (
                      <div>
                        <strong>Dependencies:</strong> {activeStage.dependencies.join(", ") || "None (Root Stage)"}
                      </div>
                    )}
                    <div>
                      <strong>Configured Latency:</strong> {processMetrics.stageMetrics[activeStage.id]?.latency} mins |{" "}
                      <strong>SLA Target:</strong> {processMetrics.stageMetrics[activeStage.id]?.slaTarget} mins
                    </div>
                  </div>

                  <hr style={{ margin: "12px 0", borderColor: "#f1f5f9" }} />

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => handlePinStageFinding(activeStage)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "4px",
                        border: "1px solid #2563eb",
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "0.8rem",
                        cursor: "pointer"
                      }}
                    >
                      Pin Finding for Stage
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Shared Workspace Primitives */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Resource Inspector Panel */}
              <ResourceInspectorPanel
                resources={resourcesList}
                activeResource={activeResource}
                accessedResourceIds={accessedResourceIdsSet}
                handleAccessResource={handleAccessResource}
              />

              {/* Working Notes Panel */}
              <WorkingNotesPanel
                notesValue={notesValue}
                setNotesValue={setNotesValue}
                notesStatus={notesStatus}
              />

              {/* Finding Composer */}
              <FindingComposer
                findings={findingsList}
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
              />

              {/* Checklist & Complete Investigation */}
              <WorkspaceTaskChecklistPanel
                checklist={configuration?.investigation?.checklist || []}
                requiredResourceIds={requiredResourceIds}
                accessedResourceIds={accessedResourceIdsSet}
                allRequiredAccessed={allRequiredAccessed}
                handleCompleteInvestigation={handleCompleteInvestigation}
                isCompletingInvestigation={isCompletingInvestigation}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
