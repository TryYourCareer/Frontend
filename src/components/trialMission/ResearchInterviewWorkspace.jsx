import React, { useState, useMemo } from "react";
import WorkspaceHeader from "./shared/WorkspaceHeader";
import ResourceInspectorPanel from "./shared/ResourceInspectorPanel";
import WorkingNotesPanel from "./shared/WorkingNotesPanel";
import FindingComposer from "./shared/FindingComposer";
import WorkspaceTaskChecklistPanel from "./shared/WorkspaceTaskChecklistPanel";

export default function ResearchInterviewWorkspace({
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
  const rawInterview = configuration?.workspace?.interview;

  const interviewConfig = useMemo(() => {
    if (!rawInterview || typeof rawInterview !== "object") {
      return null;
    }

    const stakeholders =
      rawInterview.stakeholders ||
      rawInterview.personas ||
      rawInterview.categories;

    if (!Array.isArray(stakeholders) || stakeholders.length === 0) {
      return null;
    }

    return {
      title: rawInterview.title || rawInterview.research_name || rawInterview.interview_name || "Research & Stakeholder Inquiry",
      description: rawInterview.description || rawInterview.objective || "",
      stakeholders: stakeholders.map((st, idx) => ({
        id: st.id || `stakeholder-${idx}`,
        name: st.name || st.title || st.role || `Stakeholder ${idx + 1}`,
        role: st.role || st.department || st.title || "",
        topics: Array.isArray(st.topics || st.questions || st.inquiry_items)
          ? (st.topics || st.questions || st.inquiry_items).map((q, qIdx) => ({
              id: q.id || `q-${qIdx}`,
              question: q.question || q.topic || q.label || `Inquiry ${qIdx + 1}`,
              response: q.response || q.transcript || q.content || q.excerpt || "",
              theme: q.theme || q.key_takeaway || q.category || ""
            }))
          : []
      }))
    };
  }, [rawInterview]);

  const [selectedStakeholderId, setSelectedStakeholderId] = useState(
    interviewConfig?.stakeholders[0]?.id || ""
  );
  const [selectedTopicId, setSelectedTopicId] = useState("");

  // Finding composer state
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [findingStatement, setFindingStatement] = useState("");
  const [findingResource, setFindingResource] = useState("");
  const [findingExplanation, setFindingExplanation] = useState("");
  const [findingUncertainty, setFindingUncertainty] = useState("");

  const activeStakeholder = useMemo(() => {
    if (!interviewConfig) return null;
    return (
      interviewConfig.stakeholders.find((s) => s.id === selectedStakeholderId) ||
      interviewConfig.stakeholders[0] ||
      null
    );
  }, [interviewConfig, selectedStakeholderId]);

  const activeTopic = useMemo(() => {
    if (!activeStakeholder || !activeStakeholder.topics) return null;
    return (
      activeStakeholder.topics.find((t) => t.id === selectedTopicId) ||
      activeStakeholder.topics[0] ||
      null
    );
  }, [activeStakeholder, selectedTopicId]);

  const resourcesList = configuration?.resources || [];
  const requiredResourceIds = configuration?.investigation?.required_resource_ids || [];

  const accessedResourceIdsSet = useMemo(
    () => new Set(session?.accessed_resource_ids || []),
    [session?.accessed_resource_ids]
  );

  const allRequiredAccessed = requiredResourceIds.every((id) =>
    accessedResourceIdsSet.has(id)
  );

  const handlePinInquiryFinding = (topic, stakeholder) => {
    if (!topic || !stakeholder) return;
    const statementText = `[Interview Evidence - ${stakeholder.name}] Question: "${topic.question}" | Response Excerpt: "${topic.response}"`;

    setFindingStatement(statementText);
    setFindingResource(""); // Explicitly leave resource unselected for learner choice
    setShowFindingForm(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px" }}>
      <WorkspaceHeader
        missionTitle={session?.mission_title || configuration?.title || "Research & Interview Discovery"}
        currentPhase={session?.current_phase || "investigate"}
        customBadgeLabel="Research / Interview Workspace"
        notesStatus={notesStatus}
      />

      {!interviewConfig ? (
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
          <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>Research Configuration Unavailable</h3>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b" }}>
            No valid research or interview configuration was provided in the mission configuration.
          </p>
        </div>
      ) : (
        <>
          {/* Top Overview Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#0f172a",
              color: "#f8fafc",
              padding: "16px",
              borderRadius: "8px"
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{interviewConfig.title}</h3>
              {interviewConfig.description && (
                <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
                  {interviewConfig.description}
                </p>
              )}
            </div>
            <div style={{ textAlign: "right", fontSize: "0.85rem", color: "#cbd5e1" }}>
              <div>STAKEHOLDERS: <strong>{interviewConfig.stakeholders.length}</strong></div>
            </div>
          </div>

          {/* Main 3-Panel Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Left Column: Stakeholder Selector & Inquiry Inspector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Stakeholder Selector Tabs */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "16px"
                }}
              >
                <h4 style={{ margin: "0 0 12px 0", fontSize: "1rem", color: "#0f172a" }}>
                  Select Stakeholder / Target Persona
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {interviewConfig.stakeholders.map((st) => {
                    const isSelected = st.id === activeStakeholder?.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setSelectedStakeholderId(st.id);
                          setSelectedTopicId("");
                        }}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "6px",
                          border: isSelected ? "2px solid #0284c7" : "1px solid #cbd5e1",
                          backgroundColor: isSelected ? "#e0f2fe" : "#f8fafc",
                          color: isSelected ? "#0369a1" : "#334155",
                          fontWeight: "600",
                          fontSize: "0.85rem",
                          cursor: "pointer"
                        }}
                      >
                        {st.name} {st.role ? `(${st.role})` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inquiry Topics & Responses List */}
              {activeStakeholder && (
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "16px"
                  }}
                >
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "1rem", color: "#0f172a" }}>
                    Inquiry Topics for {activeStakeholder.name}
                  </h4>

                  {activeStakeholder.topics.length === 0 ? (
                    <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
                      No inquiry topics configured for this stakeholder.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {activeStakeholder.topics.map((t) => {
                        const isSelectedTopic = t.id === activeTopic?.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTopicId(t.id)}
                            style={{
                              padding: "12px",
                              borderRadius: "6px",
                              border: isSelectedTopic ? "2px solid #0284c7" : "1px solid #e2e8f0",
                              backgroundColor: isSelectedTopic ? "#f0f9ff" : "#ffffff",
                              cursor: "pointer"
                            }}
                          >
                            <div style={{ fontWeight: "600", fontSize: "0.9rem", color: "#0f172a" }}>
                              {t.question}
                              {t.theme && (
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    backgroundColor: "#e0e7ff",
                                    color: "#3730a3",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    marginLeft: "8px"
                                  }}
                                >
                                  {t.theme}
                                </span>
                              )}
                            </div>

                            {isSelectedTopic && t.response && (
                              <div
                                style={{
                                  marginTop: "10px",
                                  padding: "10px",
                                  backgroundColor: "#f8fafc",
                                  borderRadius: "6px",
                                  borderLeft: "4px solid #0284c7",
                                  fontSize: "0.85rem",
                                  color: "#334155",
                                  lineHeight: "1.4"
                                }}
                              >
                                <strong>Transcript Response:</strong>
                                <p style={{ margin: "4px 0 8px 0", fontStyle: "italic" }}>"{t.response}"</p>

                                <div style={{ display: "flex", justify: "flex-end" }}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePinInquiryFinding(t, activeStakeholder);
                                    }}
                                    style={{
                                      padding: "4px 10px",
                                      borderRadius: "4px",
                                      border: "1px solid #0284c7",
                                      backgroundColor: "#0284c7",
                                      color: "#ffffff",
                                      fontWeight: "600",
                                      fontSize: "0.75rem",
                                      cursor: "pointer"
                                    }}
                                  >
                                    Pin Finding from Response
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
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
