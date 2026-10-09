import React, { useState, useMemo } from "react";
import { Activity, MessageSquare, CheckCircle2, Lock, Rocket, Loader2 } from "lucide-react";
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

  const handlePinInquiryFinding = (topic, stakeholder) => {
    if (!topic || !stakeholder) return;
    const statementText = `[Interview Evidence - ${stakeholder.name}] Question: "${topic.question}" | Response Excerpt: "${topic.response}"`;

    setFindingStatement(statementText);
    setFindingResource("");
    setShowFindingForm(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6" data-testid="research-interview-workspace">
      <WorkspaceHeader
        session={session}
        badgeLabel="Research / Interview Workspace"
        badgeColorClass="bg-blue-50 border-blue-200 text-blue-800"
        badgeIcon={Activity}
        notesStatus={notesStatus}
      />

      {!interviewConfig ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-2">Research Configuration Unavailable</h3>
          <p className="text-xs text-slate-500">
            No valid research or interview configuration was provided in the mission configuration.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Overview Header */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">{interviewConfig.title}</h3>
              {interviewConfig.description && (
                <p className="text-xs text-slate-400 mt-1">
                  {interviewConfig.description}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] uppercase font-bold text-slate-400">Stakeholders</div>
              <div className="text-lg font-black text-white font-mono">
                {interviewConfig.stakeholders.length}
              </div>
            </div>
          </div>

          {/* Main 12-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 cols): Stakeholder Selector & Inquiry Topics */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Stakeholder Selector Tabs */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                  Select Stakeholder / Target Persona
                </h4>
                <div className="flex flex-wrap gap-2">
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
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {st.name} {st.role ? `(${st.role})` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Inquiry Topics & Responses List */}
              {activeStakeholder && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                    Inquiry Topics for {activeStakeholder.name}
                  </h4>

                  {activeStakeholder.topics.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No inquiry topics configured for this stakeholder.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activeStakeholder.topics.map((t) => {
                        const isSelectedTopic = t.id === activeTopic?.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTopicId(t.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                              isSelectedTopic
                                ? "border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-400"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900">{t.question}</span>
                              {t.theme && (
                                <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-800">
                                  {t.theme}
                                </span>
                              )}
                            </div>

                            {isSelectedTopic && t.response && (
                              <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 border-l-4 border-l-blue-600 space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                  Transcript Response:
                                </span>
                                <p className="text-xs text-slate-700 italic leading-relaxed">
                                  "{t.response}"
                                </p>
                                <div className="flex justify-end pt-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePinInquiryFinding(t, activeStakeholder);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
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

            {/* Right Column (5 cols): Primitives (Resources, Notes, Findings, Checklist) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <ResourceInspectorPanel
                resources={resourcesList}
                activeResource={activeResource}
                accessedResourceIds={accessedResourceIdsSet}
                handleAccessResource={handleAccessResource}
                title="Research Evidence"
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
                title="Research Findings"
                description="Recorded stakeholder insights and interview evidence."
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
                defaultManagerName="Research Lead"
                defaultManagerTitle="User Research Director"
                defaultTask="Conduct stakeholder inquiries, analyze interview transcripts, and record required findings."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}