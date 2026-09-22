import React, { useState, useMemo } from "react";
import { FileText, CheckCircle2, Circle, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import WorkspaceHeader from "./shared/WorkspaceHeader";
import ResourceInspectorPanel from "./shared/ResourceInspectorPanel";
import WorkspaceTaskChecklistPanel from "./shared/WorkspaceTaskChecklistPanel";

export const CANONICAL_DOCUMENT_SECTIONS = [
  {
    id: "executive_summary",
    title: "Executive Summary",
    defaultDescription: "Provide a concise high-level synthesis of the business problem, context, and core proposal.",
    defaultPlaceholder: "Summarize the core problem and strategic objectives...",
  },
  {
    id: "key_findings",
    title: "Key Findings & Analysis",
    defaultDescription: "Detail specific quantitative metrics, user patterns, and diagnostic findings discovered in your investigation.",
    defaultPlaceholder: "State your empirical findings and analysis...",
  },
  {
    id: "evidence",
    title: "Evidence & Supporting Data",
    defaultDescription: "Reference the specific logs, benchmark reports, customer interviews, and telemetry that substantiate your findings.",
    defaultPlaceholder: "Detail the evidence sources and citations supporting your conclusions...",
  },
  {
    id: "recommendation",
    title: "Strategic Recommendation",
    defaultDescription: "Articulate the proposed intervention, requirements, architectural decisions, or policy change.",
    defaultPlaceholder: "Outline your concrete recommendation and required specifications...",
  },
  {
    id: "risks_limitations",
    title: "Risks & Constraints",
    defaultDescription: "Analyze potential edge cases, operational bottlenecks, regulatory constraints, and trade-offs.",
    defaultPlaceholder: "Identify key risks, assumptions, and mitigation strategies...",
  },
  {
    id: "next_steps",
    title: "Implementation & Next Steps",
    defaultDescription: "Outline the immediate rollout timeline, milestones, stakeholder ownership, and validation checkpoints.",
    defaultPlaceholder: "Define actionable next steps and rollout milestones...",
  },
];

export default function DocumentWorkbenchWorkspace({
  session,
  manager = {},
  briefing = {},
  resources = [],
  accessedResourceIds = new Set(),
  activeResource = null,
  setActiveResource = () => {},
  handleAccessResource = () => {},
  memoForm,
  setMemoForm,
  memoSaveStatus = "saved",
  notesStatus = "saved",
  handleSaveOutput = () => {},
  handleCompleteInvestigation = () => {},
  requiredResourceAccess = [],
  actionLoading = false,
  isInvestigationPhase = true,
}) {
  // Local state fallback for standalone usage or isolated tests
  const [localOutput, setLocalOutput] = useState({
    executive_summary: "",
    key_findings: "",
    evidence: "",
    recommendation: "",
    risks_limitations: "",
    next_steps: "",
  });

  const outputState = memoForm || localOutput;
  const updateOutput = setMemoForm || setLocalOutput;

  // Active section tab in the document workbench
  const [activeSectionId, setActiveSectionId] = useState("executive_summary");

  // Extract optional configuration overrides from session configuration
  const documentConfig = useMemo(() => {
    const rawDoc = session?.mission_configuration?.workspace?.document || session?.configuration?.workspace?.document;
    return rawDoc && typeof rawDoc === "object" ? rawDoc : {};
  }, [session]);

  const documentTitle = documentConfig.title || "Deliverable Specification Document";

  // Build merged section definitions with any custom titles/descriptions from config
  const sections = useMemo(() => {
    const configSections = Array.isArray(documentConfig.sections) ? documentConfig.sections : [];
    const configMap = new Map();
    configSections.forEach((s) => {
      if (s && typeof s === "object" && s.id) {
        configMap.set(s.id, s);
      }
    });

    return CANONICAL_DOCUMENT_SECTIONS.map((canonical) => {
      const override = configMap.get(canonical.id);
      return {
        id: canonical.id,
        title: override?.title || canonical.title,
        description: override?.description || canonical.defaultDescription,
        placeholder: override?.placeholder || canonical.defaultPlaceholder,
        minWords: override?.min_words || override?.minWords || 0,
        required: override?.required !== false,
      };
    });
  }, [documentConfig]);

  const currentSectionIndex = sections.findIndex((s) => s.id === activeSectionId);
  const currentSection = currentSectionIndex >= 0 ? sections[currentSectionIndex] : sections[0];
  const activeContent = outputState[currentSection.id] || "";

  // Calculate word and character counts
  const wordCount = useMemo(() => {
    const trimmed = activeContent.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [activeContent]);

  const charCount = activeContent.length;

  // Section completion helper
  const completedSectionsCount = useMemo(() => {
    return sections.filter((s) => (outputState[s.id] || "").trim().length > 0).length;
  }, [sections, outputState]);

  const handleSectionContentChange = (newText) => {
    const updated = { ...outputState, [currentSection.id]: newText };
    updateOutput(updated);
    if (handleSaveOutput) {
      handleSaveOutput(updated);
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setActiveSectionId(sections[currentSectionIndex - 1].id);
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setActiveSectionId(sections[currentSectionIndex + 1].id);
    }
  };

  return (
    <div className="space-y-6" data-testid="document-workbench-workspace">
      <WorkspaceHeader
        session={session}
        badgeLabel="Document Workbench"
        badgeColorClass="bg-indigo-50 border-indigo-200 text-indigo-800"
        badgeIcon={FileText}
        notesStatus={memoSaveStatus || notesStatus}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 1. Left Panel: Reference & Evidence Inspector */}
        <ResourceInspectorPanel
          resources={resources}
          accessedResourceIds={accessedResourceIds}
          activeResource={activeResource}
          setActiveResource={setActiveResource}
          handleAccessResource={handleAccessResource}
          title="Reference & Evidence"
          theme="blue"
          actionLoading={actionLoading}
        />

        {/* 2. Center Panel: Structured Document Editor */}
        <div className="space-y-6 lg:col-span-6">
          {/* Document Overview Banner */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-slate-50 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h2 className="font-sans text-lg font-bold text-slate-900">{documentTitle}</h2>
                  <p className="text-xs text-slate-500">
                    Drafting structured deliverable • {completedSectionsCount} of {sections.length} sections populated
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-indigo-100/80 px-3 py-1 font-mono text-xs font-bold text-indigo-900">
                {Math.round((completedSectionsCount / sections.length) * 100)}% Complete
              </div>
            </div>

            {/* Horizontal Section Navigation Tabs */}
            <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
              {sections.map((sec, idx) => {
                const isSelected = sec.id === currentSection.id;
                const isPopulated = (outputState[sec.id] || "").trim().length > 0;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-sm"
                        : isPopulated
                        ? "bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-50"
                        : "bg-white/80 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isPopulated ? <CheckCircle2 size={12} className={isSelected ? "text-white" : "text-emerald-600"} /> : <Circle size={12} className="text-slate-400" />}
                    <span>{idx + 1}. {sec.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Section Editor Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  Section {currentSectionIndex + 1} of {sections.length}
                </span>
                <h3 className="font-sans text-xl font-bold text-slate-900">{currentSection.title}</h3>
                <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{currentSection.description}</p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} chars</span>
              </div>
            </div>

            <div className="space-y-2">
              <textarea
                data-testid={`document-section-${currentSection.id}`}
                rows={10}
                value={activeContent}
                onChange={(e) => handleSectionContentChange(e.target.value)}
                placeholder={currentSection.placeholder}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 font-sans text-sm leading-relaxed text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Navigation Steppers */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrevSection}
                disabled={currentSectionIndex === 0}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Previous Section
              </button>
              <button
                type="button"
                onClick={handleNextSection}
                disabled={currentSectionIndex === sections.length - 1}
                className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 disabled:opacity-40"
              >
                Next Section <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Right Panel: Document Section Checklist & Completion Controls */}
        <div className="space-y-6 lg:col-span-3">
          {/* Section Completeness Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Document Outline Checklist</h4>
            <div className="space-y-2">
              {sections.map((sec, idx) => {
                const isPopulated = (outputState[sec.id] || "").trim().length > 0;
                const isSelected = sec.id === currentSection.id;
                return (
                  <div
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`flex items-center justify-between rounded-xl p-2.5 cursor-pointer text-xs transition ${
                      isSelected
                        ? "bg-indigo-50 border border-indigo-200 font-bold text-indigo-900"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isPopulated ? (
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Circle size={14} className="text-slate-300 shrink-0" />
                      )}
                      <span className="truncate">{idx + 1}. {sec.title}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {isPopulated ? `${(outputState[sec.id] || "").trim().split(/\s+/).length}w` : "Empty"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <WorkspaceTaskChecklistPanel
            manager={manager}
            briefing={briefing}
            findings={[]}
            requiredFindingsCount={0}
            requiredResourceAccess={requiredResourceAccess}
            accessedResourceIds={accessedResourceIds}
            handleCompleteInvestigation={handleCompleteInvestigation}
            actionLoading={actionLoading}
            isInvestigationPhase={isInvestigationPhase}
            defaultManagerName="Alex Chen"
            defaultManagerTitle="Product Strategy Lead"
            defaultTask="Draft and review the structured document specifications."
          />
        </div>
      </div>
    </div>
  );
}
