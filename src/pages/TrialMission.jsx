import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Rocket,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Pause,
  Play,
  XCircle,
  Briefcase,
  ShieldAlert,
  UserCheck,
  FileText,
  Eye,
  Check,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Send,
  LockKeyhole,
} from "lucide-react";
import { useTrialMissionSession } from "../hooks/useTrialMissionSession";
import { useDebounceAutosave } from "../hooks/useDebounceAutosave";
import { WORKSPACE_COMPONENTS } from "../components/trialMission/WorkspaceRegistry";
import { getSessionActivitySummary } from "../services/trialMission";

export function formatWorkspaceType(type) {
  if (!type || typeof type !== "string") return "Interactive Workspace";
  switch (type.toLowerCase()) {
    case "business_analyst":
      return "Analysis Workspace";
    case "developer":
      return "Technical Workspace";
    case "ux_designer":
      return "Design Studio";
    case "data_notebook":
      return "Data Notebook";
    case "system_architect":
      return "Architecture Canvas";
    default:
      return type
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim();
  }
}

export function formatDimensionKey(key) {
  if (!key || typeof key !== "string") return "";
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export function deriveInvestigationPhaseId(config) {
  if (!config) return "investigate";
  const phases = config.phases;
  if (Array.isArray(phases)) {
    const invPhase = phases.find(
      (p) =>
        (typeof p === "object" &&
          p !== null &&
          (p.type === "investigation" ||
            p.phase_type === "investigation" ||
            p.category === "investigation" ||
            p.id === "investigate" ||
            p.id === "investigation")) ||
        (typeof p === "string" &&
          (p === "investigate" || p === "investigation" || p === "investigation_phase"))
    );
    if (invPhase) {
      return typeof invPhase === "string" ? invPhase : invPhase.id || "investigate";
    }
    if (phases.length > 0) {
      const first = phases[0];
      return typeof first === "string" ? first : first?.id || "investigate";
    }
  } else if (phases && typeof phases === "object") {
    const key = Object.keys(phases).find(
      (k) =>
        k === "investigate" ||
        k === "investigation" ||
        phases[k]?.type === "investigation" ||
        phases[k]?.phase_type === "investigation"
    );
    if (key) return key;
  }
  if (config.investigation?.phase_id) {
    return config.investigation.phase_id;
  }
  return "investigate";
}

export function mapQuestionIdToCanonicalKey(qId) {
  if (!qId) return "what_felt_natural";
  const idStr = String(qId).toLowerCase();
  if (idStr === "natural" || idStr === "what_felt_natural" || idStr.includes("natural")) {
    return "what_felt_natural";
  }
  if (idStr === "hardest" || idStr === "hardest_part" || idStr.includes("hardest") || idStr.includes("challenging")) {
    return "hardest_part";
  }
  if (idStr === "next_investigation" || idStr === "investigate_next" || idStr.includes("next") || idStr.includes("investigate")) {
    return "investigate_next";
  }
  return qId;
}

export default function TrialMission() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const querySessionId = searchParams.get("sessionId");
  const queryMissionId = searchParams.get("missionId");
  const autoStartedMissionRef = useRef(false);

  // Get Ready state
  const [isReadyChecked, setIsReadyChecked] = useState(false);
  const [briefingDismissed, setBriefingDismissed] = useState(false);

  // Findings form state
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [findingStatement, setFindingStatement] = useState("");
  const [findingResource, setFindingResource] = useState("");
  const [findingExplanation, setFindingExplanation] = useState("");
  const [findingUncertainty, setFindingUncertainty] = useState("");

  // Recommendation form state
  const [selectedOption, setSelectedOption] = useState("");
  const [whyRecommendation, setWhyRecommendation] = useState("");
  const [selectedEvidenceResources, setSelectedEvidenceResources] = useState([]);
  const [recommendationUncertainty, setRecommendationUncertainty] = useState("");

  // Reality event update mode state
  const [isUpdatingRecommendation, setIsUpdatingRecommendation] = useState(false);
  const [updatedOption, setUpdatedOption] = useState("");
  const [updatedWhy, setUpdatedWhy] = useState("");
  const [updatedEvidenceResources, setUpdatedEvidenceResources] = useState([]);
  const [updatedUncertainty, setUpdatedUncertainty] = useState("");

  // Consequence generation ref to avoid duplicate calls
  const consequenceGeneratedRef = useRef(false);
  const reflectionDirtyRef = useRef(false);
  const reflectionEditVersionRef = useRef(0);
  const reflectionSaveTimerRef = useRef(null);
  const memoDirtyRef = useRef(false);
  const memoEditVersionRef = useRef(0);
  const memoSaveTimerRef = useRef(null);

  // Memo form state
  const [memoForm, setMemoForm] = useState({
    executive_summary: "",
    key_findings: "",
    evidence: "",
    recommendation: "",
    risks_limitations: "",
    next_steps: "",
  });
  const [memoSaveStatus, setMemoSaveStatus] = useState("ready"); // "ready" | "saving" | "saved" | "error"
  const [reviewLoading, setReviewLoading] = useState(false);

  // Reflection form state
  const [reflectionForm, setReflectionForm] = useState({
    what_felt_natural: "",
    hardest_part: "",
    investigate_next: "",
  });
  const [reflectionSaveStatus, setReflectionSaveStatus] = useState("ready"); // "ready" | "saving" | "saved" | "error"

  // Activity Summary state
  const [activitySummary, setActivitySummary] = useState(null);
  const [activitySummaryLoading, setActivitySummaryLoading] = useState(false);
  const [activitySummaryError, setActivitySummaryError] = useState(null);

  const {
    missions,
    session,
    workingNotes,
    findings,
    currentDecision,
    consequenceData,
    realityEventData,
    outputData,
    reflectionData,
    evaluationData,
    evaluationLoading,
    evaluationError,
    accessedResourceIds,
    activeResource,
    setActiveResource,
    loading,
    workspaceLoading,
    actionLoading,
    error,
    startSession,
    handleTransition,
    handleAccessResource,
    handleSaveNotes,
    handleAddFinding,
    handleCompleteInvestigation,
    handleSubmitDecision,
    handleGenerateConsequence,
    handleFetchRealityEvent,
    handleRealityEventResponse,
    handleSaveOutput,
    handleReviewOutput,
    handleFinaliseOutput,
    handleSubmitOutput,
    handleSaveReflection,
    handleSubmitReflection,
    handlePause,
    handleResume,
    handleAbandon,
    resetToCatalog,
    setError,
  } = useTrialMissionSession(querySessionId);

  // Auto-start mission session if missionId query param provided from Career Decision
  useEffect(() => {
    if (queryMissionId && !querySessionId && !session && !autoStartedMissionRef.current && typeof startSession === "function") {
      autoStartedMissionRef.current = true;
      startSession(queryMissionId);
    }
  }, [queryMissionId, querySessionId, session, startSession]);

  useEffect(() => {
    if (session?.state === "SESSION_COMPLETED" && session?.id) {
      let isMounted = true;
      setActivitySummaryLoading(true);
      setActivitySummaryError(null);
      const req = getSessionActivitySummary(session.id);
      if (req && typeof req.then === "function") {
        req
          .then((data) => {
            if (isMounted) {
              setActivitySummary(data);
              setActivitySummaryLoading(false);
            }
          })
          .catch((err) => {
            if (isMounted) {
              console.error("Failed to load activity summary:", err);
              setActivitySummaryError("Activity summary is temporarily unavailable.");
              setActivitySummaryLoading(false);
            }
          });
      } else {
        setActivitySummaryLoading(false);
      }
      return () => {
        isMounted = false;
      };
    }
  }, [session?.state, session?.id]);

  // Debounced notes autosave
  const {
    value: notesValue,
    setValue: setNotesValue,
    status: notesStatus,
  } = useDebounceAutosave({
    initialValue: workingNotes,
    onSave: handleSaveNotes,
    delay: 800,
  });

  // Sync memo draft from backend outputData
  useEffect(() => {
    if (outputData) {
      setMemoForm((prev) => {
        if (memoDirtyRef.current) {
          return prev;
        }

        const nextExecutive = outputData.executive_summary ?? prev.executive_summary ?? "";
        const nextFindings = outputData.key_findings ?? prev.key_findings ?? "";
        const nextEvidence = outputData.evidence ?? prev.evidence ?? "";
        const nextRec = outputData.recommendation ?? prev.recommendation ?? "";
        const nextRisks = outputData.risks_limitations ?? prev.risks_limitations ?? "";
        const nextSteps = outputData.next_steps ?? prev.next_steps ?? "";

        if (
          prev.executive_summary === nextExecutive &&
          prev.key_findings === nextFindings &&
          prev.evidence === nextEvidence &&
          prev.recommendation === nextRec &&
          prev.risks_limitations === nextRisks &&
          prev.next_steps === nextSteps
        ) {
          return prev;
        }

        return {
          executive_summary: nextExecutive,
          key_findings: nextFindings,
          evidence: nextEvidence,
          recommendation: nextRec,
          risks_limitations: nextRisks,
          next_steps: nextSteps,
        };
      });
    } else if (currentDecision) {
      // Pre-fill recommendation from decision if empty
      setMemoForm((prev) => {
        if (memoDirtyRef.current) {
          return prev;
        }

        const nextRec = prev.recommendation || currentDecision.selected_option || "";
        const nextEvidence = prev.evidence || currentDecision.why || "";
        const nextRisks = prev.risks_limitations || currentDecision.uncertainty || "";

        if (
          prev.recommendation === nextRec &&
          prev.evidence === nextEvidence &&
          prev.risks_limitations === nextRisks
        ) {
          return prev;
        }

        return {
          ...prev,
          recommendation: nextRec,
          evidence: nextEvidence,
          risks_limitations: nextRisks,
        };
      });
    }
  }, [outputData, currentDecision]);

  // Sync reflection draft from backend reflectionData
  useEffect(() => {
    if (reflectionData) {
      setReflectionForm((prev) => {
        if (reflectionDirtyRef.current) {
          return prev;
        }

        const nextWhat =
          reflectionData.what_felt_natural ??
          reflectionData.natural ??
          prev.what_felt_natural ??
          "";
        const nextHardest =
          reflectionData.hardest_part ??
          reflectionData.hardest ??
          prev.hardest_part ??
          "";
        const nextInvestigate =
          reflectionData.investigate_next ??
          reflectionData.next_investigation ??
          prev.investigate_next ??
          "";

        if (
          prev.what_felt_natural === nextWhat &&
          prev.hardest_part === nextHardest &&
          prev.investigate_next === nextInvestigate
        ) {
          return prev;
        }
        return {
          what_felt_natural: nextWhat,
          hardest_part: nextHardest,
          investigate_next: nextInvestigate,
        };
      });
    }
  }, [reflectionData]);

  // Derive allowed actions from server session
  const allowedActions = Array.isArray(session?.allowed_actions)
    ? session.allowed_actions
    : [];

  const canPause =
    allowedActions.includes("pause") ||
    allowedActions.includes("transition:SESSION_PAUSED");
  const canResume =
    allowedActions.includes("resume") ||
    allowedActions.includes("transition:PHASE_ACTIVE") ||
    session?.state === "SESSION_PAUSED";
  const canAbandon =
    allowedActions.includes("abandon") ||
    allowedActions.includes("transition:SESSION_ABANDONED");

  // Determine transition action for "I'm ready — Start"
  const startTransitionAction =
    allowedActions.find((a) => a === "transition:PHASE_ACTIVE" || a === "PHASE_ACTIVE") ||
    "PHASE_ACTIVE";

  // Extract configuration
  const config = session?.mission_configuration || {};
  const role = config.role || {};
  const manager = role.manager || {};
  const briefing = config.briefing || {};
  const objective = config.objective || {};
  const resources = Array.isArray(config.resources) ? config.resources : [];
  const investigationConfig = config.investigation || {};
  const completionRules = investigationConfig.completion || {};
  const requiredFindingsCount = completionRules.required_findings || 1;
  const requiredResourceAccess = completionRules.required_resource_access || [];

  // Derive configured investigation phase ID from session.mission_configuration
  const investigationPhaseId = deriveInvestigationPhaseId(config);

  // Check current server stage
  const isCreatedStage = session?.state === "SESSION_CREATED";
  const isInvestigationPhase =
    Boolean(session?.current_phase) &&
    session.current_phase === investigationPhaseId;
  const isBriefingStage =
    session?.state === "PHASE_ACTIVE" &&
    isInvestigationPhase &&
    !briefingDismissed &&
    findings.length === 0 &&
    !workingNotes;
  const isInvestigationStage =
    session?.state === "PHASE_ACTIVE" &&
    isInvestigationPhase &&
    (briefingDismissed || findings.length > 0 || Boolean(workingNotes));
  const isRecommendationStage =
    session?.state === "DECISION_PENDING" ||
    session?.current_phase === "recommend" ||
    session?.current_phase === "decision";
  const isRealityEventStage =
    session?.state === "CONSEQUENCE_ACTIVE" ||
    session?.state === "REALITY_EVENT_PENDING" ||
    session?.current_phase === "adapt" ||
    session?.current_phase === "reality_event";
  const isCompletedStage =
    session?.state === "SESSION_COMPLETED" ||
    session?.state === "COMPLETED";
  const isReflectionStage =
    !isCompletedStage &&
    (session?.state === "REFLECTION_ACTIVE" ||
      session?.current_phase === "reflect" ||
      session?.current_phase === "reflection");
  const isOutputStage =
    session?.state !== "REFLECTION_ACTIVE" &&
    !isCompletedStage &&
    (session?.current_phase === "deliver" ||
      session?.current_phase === "output" ||
      session?.current_phase === "memo");

  const outputStatus = outputData?.status || "draft";
  const isMemoFinalised = outputStatus === "finalised" || outputStatus === "submitted";

  // Decision options from backend configuration
  const decisionsConfig = Array.isArray(config.decisions) && config.decisions.length > 0
    ? config.decisions[0]
    : {};
  const decisionOptions = Array.isArray(decisionsConfig.options)
    ? decisionsConfig.options
    : [
        "Show delivery costs earlier",
        "Improve payment reliability",
        "Simplify checkout experience",
        "Investigate further",
      ];

  const realityEventsConfig = Array.isArray(config.reality_events) && config.reality_events.length > 0
    ? config.reality_events[0]
    : {};

  // Resolve registered workspace component from registry based on session.workspace_type
  const WorkspaceComponent = WORKSPACE_COMPONENTS[session?.workspace_type];

  // Trigger consequence generation when state is CONSEQUENCE_ACTIVE
  useEffect(() => {
    if (
      session?.state === "CONSEQUENCE_ACTIVE" &&
      !actionLoading &&
      !consequenceGeneratedRef.current
    ) {
      consequenceGeneratedRef.current = true;
      Promise.resolve(handleGenerateConsequence?.()).catch(() => {
        consequenceGeneratedRef.current = false;
      });
    } else if (session?.state !== "CONSEQUENCE_ACTIVE") {
      consequenceGeneratedRef.current = false;
    }
  }, [session?.state, actionLoading, handleGenerateConsequence]);

  // Fetch reality event only once state is REALITY_EVENT_PENDING
  useEffect(() => {
    if (
      session?.state === "REALITY_EVENT_PENDING" &&
      !realityEventData &&
      !actionLoading
    ) {
      handleFetchRealityEvent();
    }
  }, [session?.state, realityEventData, actionLoading, handleFetchRealityEvent]);

  // Debounced autosave for memo draft
  useEffect(() => {
    if (!isOutputStage || isMemoFinalised) return;
    if (!memoDirtyRef.current) return;

    const savingVersion = memoEditVersionRef.current;
    const snapshot = memoForm;

    setMemoSaveStatus("saving");
    const timer = setTimeout(async () => {
      try {
        await handleSaveOutput(snapshot);
        if (memoEditVersionRef.current === savingVersion) {
          memoDirtyRef.current = false;
        }
        setMemoSaveStatus("saved");
      } catch {
        memoDirtyRef.current = true;
        setMemoSaveStatus("error");
      }
    }, 800);

    memoSaveTimerRef.current = timer;

    return () => {
      clearTimeout(timer);
      if (memoSaveTimerRef.current === timer) {
        memoSaveTimerRef.current = null;
      }
    };
  }, [memoForm, isOutputStage, isMemoFinalised, handleSaveOutput]);

  // Debounced autosave for reflection draft
  useEffect(() => {
    if (!isReflectionStage || isCompletedStage || session?.state !== "REFLECTION_ACTIVE") return;
    if (!reflectionDirtyRef.current) return;

    const savingVersion = reflectionEditVersionRef.current;
    const snapshot = {
      what_felt_natural: reflectionForm.what_felt_natural || "",
      hardest_part: reflectionForm.hardest_part || "",
      investigate_next: reflectionForm.investigate_next || "",
    };

    setReflectionSaveStatus("saving");
    const timer = setTimeout(async () => {
      try {
        // Defensive check: session must still be REFLECTION_ACTIVE, not completed, and dirty
        if (
          session?.state !== "REFLECTION_ACTIVE" ||
          isCompletedStage ||
          !reflectionDirtyRef.current
        ) {
          return;
        }

        await handleSaveReflection(snapshot);
        if (reflectionEditVersionRef.current === savingVersion) {
          reflectionDirtyRef.current = false;
        }
        setReflectionSaveStatus("saved");
      } catch {
        reflectionDirtyRef.current = true;
        setReflectionSaveStatus("error");
      } finally {
        if (reflectionSaveTimerRef.current === timer) {
          reflectionSaveTimerRef.current = null;
        }
      }
    }, 800);

    reflectionSaveTimerRef.current = timer;

    return () => {
      clearTimeout(timer);
      if (reflectionSaveTimerRef.current === timer) {
        reflectionSaveTimerRef.current = null;
      }
    };
  }, [reflectionForm, isReflectionStage, isCompletedStage, session?.state, handleSaveReflection]);

  const handleSaveNewFinding = async (e) => {
    e.preventDefault();
    if (!findingStatement.trim()) return;

    const payload = {
      statement: findingStatement.trim(),
      evidence: findingResource
        ? [{ resource_id: findingResource, explanation: findingExplanation.trim() }]
        : [],
      uncertainty: findingUncertainty.trim(),
    };

    try {
      await handleAddFinding(payload);
      setFindingStatement("");
      setFindingResource("");
      setFindingExplanation("");
      setFindingUncertainty("");
      setShowFindingForm(false);
    } catch {
      // Error handled by hook
    }
  };

  const handleRecommendationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOption || !whyRecommendation.trim()) return;

    const evidenceList = selectedEvidenceResources.map((resId) => ({
      resource_id: resId,
      explanation: `Supporting evidence from ${resId}`,
    }));

    const payload = {
      selected_option: selectedOption,
      why: whyRecommendation.trim(),
      evidence: evidenceList,
      uncertainty: recommendationUncertainty.trim(),
    };

    try {
      const res = await handleSubmitDecision(payload);
      if (res?.session?.state === "CONSEQUENCE_ACTIVE" || session?.state === "CONSEQUENCE_ACTIVE") {
        consequenceGeneratedRef.current = true;
        await Promise.resolve(handleGenerateConsequence?.());
      }
    } catch {
      // Error handled by hook
    }
  };

  const handleKeepRecommendation = async () => {
    const payload = {
      action: "keep",
      selected_option: currentDecision?.selected_option || selectedOption,
      why: currentDecision?.why || whyRecommendation,
      evidence: currentDecision?.evidence || [],
      uncertainty: currentDecision?.uncertainty || recommendationUncertainty,
    };
    await handleRealityEventResponse(payload);
  };

  const handleUpdateRecommendationSubmit = async (e) => {
    e.preventDefault();
    if (!updatedOption || !updatedWhy.trim() || updatedEvidenceResources.length === 0) return;

    const evidenceList = updatedEvidenceResources.map((resId) => ({
      resource_id: resId,
      explanation: `Updated evidence from ${resId}`,
    }));

    const payload = {
      action: "update",
      selected_option: updatedOption,
      why: updatedWhy.trim(),
      evidence: evidenceList,
      uncertainty: updatedUncertainty.trim(),
    };

    await handleRealityEventResponse(payload);
  };

  const toggleEvidenceResource = (resId, isUpdate = false) => {
    if (isUpdate) {
      setUpdatedEvidenceResources((prev) =>
        prev.includes(resId) ? prev.filter((id) => id !== resId) : [...prev, resId]
      );
    } else {
      setSelectedEvidenceResources((prev) =>
        prev.includes(resId) ? prev.filter((id) => id !== resId) : [...prev, resId]
      );
    }
  };

  const handleMemoFieldChange = (field, value) => {
    if (isMemoFinalised) return;
    memoDirtyRef.current = true;
    memoEditVersionRef.current += 1;
    setMemoForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleReviewMemoClick = async () => {
    if (actionLoading || reviewLoading || isMemoFinalised) return;
    setReviewLoading(true);

    // Clear any pending debounce timer to prevent duplicate save afterwards
    if (memoSaveTimerRef.current) {
      clearTimeout(memoSaveTimerRef.current);
      memoSaveTimerRef.current = null;
    }

    try {
      // If form is dirty, flush the save first
      if (memoDirtyRef.current) {
        const savingVersion = memoEditVersionRef.current;
        const snapshot = memoForm;
        setMemoSaveStatus("saving");
        await handleSaveOutput(snapshot);
        if (memoEditVersionRef.current === savingVersion) {
          memoDirtyRef.current = false;
        }
        setMemoSaveStatus("saved");

        // If newer edits occurred while explicit save was in flight, do not proceed with review
        if (memoEditVersionRef.current !== savingVersion) {
          return;
        }
      }

      // Now proceed with review
      await handleReviewOutput();
    } catch (err) {
      // If save or review failed, ensure dirty state is maintained and error status shown
      if (memoDirtyRef.current) {
        setMemoSaveStatus("error");
      }
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReflectionFieldChange = (field, value) => {
    if (isCompletedStage || session?.state !== "REFLECTION_ACTIVE") return;
    const canonicalKey = mapQuestionIdToCanonicalKey(field);
    reflectionDirtyRef.current = true;
    reflectionEditVersionRef.current += 1;
    setReflectionForm((prev) => ({ ...prev, [canonicalKey]: value }));
  };

  const handleReflectionSubmit = async (e) => {
    e.preventDefault();
    if (reflectionSaveTimerRef.current) {
      clearTimeout(reflectionSaveTimerRef.current);
      reflectionSaveTimerRef.current = null;
    }
    reflectionDirtyRef.current = false;

    const canonicalPayload = {
      what_felt_natural: reflectionForm.what_felt_natural || "",
      hardest_part: reflectionForm.hardest_part || "",
      investigate_next: reflectionForm.investigate_next || "",
    };

    await handleSubmitReflection(canonicalPayload);
  };

  const reflectionQuestions =
    Array.isArray(reflectionData?.questions) && reflectionData.questions.length > 0
      ? reflectionData.questions
      : [
          {
            id: "what_felt_natural",
            prompt: "What part of this investigation felt most natural to you?",
          },
          {
            id: "hardest_part",
            prompt: "What was the most challenging or uncertain aspect?",
          },
          {
            id: "investigate_next",
            prompt: "If you had more time, what would you investigate next?",
          },
        ];

  return (
    <div className="min-h-screen bg-[#FAF6EC] px-4 py-8 text-slate-800 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              if (session) {
                resetToCatalog();
              } else {
                navigate("/dashboard");
              }
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#7B4A28]/30"
          >
            <ArrowLeft size={16} />
            {session ? "Back to Catalog" : "Back to Dashboard"}
          </button>

          {session && (
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-200 px-3 py-1 font-mono text-xs text-slate-700">
                Phase: {session.current_phase || "initial"}
              </span>

              {/* Lifecycle Controls */}
              {canPause && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handlePause}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <Pause size={13} /> Pause
                </button>
              )}
              {canResume && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleResume}
                  className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-50"
                >
                  <Play size={13} /> Resume
                </button>
              )}
              {canAbandon && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleAbandon}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                >
                  <ShieldAlert size={13} /> Abandon
                </button>
              )}
            </div>
          )}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 shadow-sm">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-600 hover:text-rose-900"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-3xl border border-[#E5DEC9] bg-white p-12 shadow-sm">
            <Loader2 className="animate-spin text-[#7B4A28]" size={36} />
            <p className="text-sm font-semibold text-slate-600">
              Loading Trial Mission server state...
            </p>
          </div>
        ) : !session ? (
          /* ========================================================= */
          /* 1. Mission Catalog                                       */
          /* ========================================================= */
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-[#E5DEC9] bg-white p-8 shadow-sm sm:p-10">
              <div className="max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <Rocket size={12} /> Live Simulation Catalog
                </span>
                <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Trial Missions
                </h1>
                <p className="text-base leading-relaxed text-slate-600">
                  Step into real-world career simulations. Review evidence, make decisions, and receive structured evaluation directly from industry scenarios.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Available Missions</h2>
              {missions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
                  No active trial missions available at this moment.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {missions.map((m) => {
                    const careerName = m.career?.name || m.career_name || "Career Mission";
                    const workspaceLabel = formatWorkspaceType(m.workspace_type);
                    return (
                      <div
                        key={m.id}
                        className="flex flex-col justify-between rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm transition hover:shadow-md"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-xs font-bold text-amber-900">
                              <Briefcase size={12} className="text-amber-700" /> {careerName}
                            </span>
                            {m.estimated_duration_minutes && (
                              <span className="text-xs font-medium text-slate-500">
                                ~{m.estimated_duration_minutes} mins
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{m.title}</h3>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                {workspaceLabel}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed text-slate-600 line-clamp-3">
                            {m.description || "Take on real-world business challenges and test your analytical intuition."}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => startSession(m.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7B4A28] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#633B20] disabled:opacity-50"
                          >
                            {actionLoading ? (
                              <>
                                <Loader2 size={16} className="animate-spin" /> Starting...
                              </>
                            ) : (
                              <>
                                Try this career <Rocket size={16} />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : isCreatedStage ? (
          /* ========================================================= */
          /* 2. Get Ready Screen                                      */
          /* ========================================================= */
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#E5DEC9] bg-white p-8 shadow-sm sm:p-10 space-y-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <UserCheck size={12} /> Get Ready for Your Mission
                </span>
                <h1 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
                  {session.mission_title}
                </h1>
                <p className="text-sm text-slate-500">
                  Role: <span className="font-semibold text-slate-800">{role.title || "Business Analyst"}</span>
                  {role.company && ` • Company: ${role.company}`}
                </p>
              </div>

              <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Mission Context
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {briefing.context ||
                      "You are taking on the role of a Business Analyst investigating checkout drop-offs."}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Objective
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {objective.description ||
                      "Investigate where customers abandon checkout, evaluate evidence, and recommend an actionable fix."}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isReadyChecked}
                    onChange={(e) => setIsReadyChecked(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#7B4A28] focus:ring-[#7B4A28]"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    I'm ready to investigate this problem and explore this career scenario.
                  </span>
                </label>

                <div>
                  <button
                    type="button"
                    disabled={!isReadyChecked || actionLoading}
                    onClick={() => handleTransition(startTransitionAction)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7B4A28] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#633B20] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Starting...
                      </>
                    ) : (
                      <>
                        I'm ready — Start <Rocket size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : isBriefingStage ? (
          /* ========================================================= */
          /* 3. Meet Manager Screen                                   */
          /* ========================================================= */
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#E5DEC9] bg-white p-8 shadow-sm sm:p-10 space-y-8">
              <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7B4A28]/10 text-[#7B4A28] font-bold text-xl">
                  {manager.name ? manager.name[0] : "S"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Meet your manager: {manager.name || "Sarah"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {manager.title || "Product Manager"} {role.company ? `at ${role.company}` : ""}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Manager Briefing & Instructions
                </h3>
                <p className="text-sm leading-relaxed text-amber-950">
                  {briefing.task ||
                    "Review the checkout analytics, examine customer feedback, and prepare your initial findings."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    Available Mission Resources
                  </h3>
                  <span className="text-xs text-slate-500">
                    Click to inspect briefing resources
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {resources.map((res) => {
                    const isAccessed = accessedResourceIds.has(res.id);
                    return (
                      <div
                        key={res.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-slate-500 shrink-0" />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{res.title}</h4>
                            <span className="text-xs text-slate-500 uppercase">{res.type}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleAccessResource(res.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                        >
                          {isAccessed ? (
                            <>
                              <Check size={14} className="text-emerald-600" /> Viewed
                            </>
                          ) : (
                            <>
                              <Eye size={14} /> View resource
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {activeResource && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Resource Content: {activeResource.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveResource(null)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Close
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {activeResource.content || "No detailed content provided for this resource."}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setBriefingDismissed(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7B4A28] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#633B20]"
                >
                  Start investigating <Rocket size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : isInvestigationStage ? (
          /* ========================================================= */
          /* 4. Career-Specific Investigation Workspace Dispatch       */
          /* ========================================================= */
          WorkspaceComponent ? (
            <WorkspaceComponent
              session={session}
              manager={manager}
              briefing={briefing}
              resources={resources}
              accessedResourceIds={accessedResourceIds}
              activeResource={activeResource}
              setActiveResource={setActiveResource}
              handleAccessResource={handleAccessResource}
              notesValue={notesValue}
              setNotesValue={setNotesValue}
              notesStatus={notesStatus}
              findings={findings}
              workspaceLoading={workspaceLoading}
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
              handleCompleteInvestigation={handleCompleteInvestigation}
              requiredFindingsCount={requiredFindingsCount}
              requiredResourceAccess={requiredResourceAccess}
              actionLoading={actionLoading}
              isInvestigationPhase={isInvestigationPhase}
              memoForm={memoForm}
              setMemoForm={setMemoForm}
              memoSaveStatus={memoSaveStatus}
              handleSaveOutput={handleSaveOutput}
              handleReviewOutput={handleReviewOutput}
              handleFinaliseOutput={handleFinaliseOutput}
              outputData={outputData}
            />
          ) : (
            <div
              className="rounded-3xl border border-amber-200 bg-amber-50/60 p-8 text-center text-sm font-medium text-amber-900"
              data-testid="unsupported-workspace"
            >
              Unsupported workspace type: "{session?.workspace_type || "unspecified"}".
            </div>
          )
        ) : isRecommendationStage ? (
          /* ========================================================= */
          /* 5. Make Recommendation Screen                             */
          /* ========================================================= */
          <div className="space-y-6">
            <form
              onSubmit={handleRecommendationSubmit}
              className="rounded-3xl border border-[#E5DEC9] bg-white p-8 shadow-sm sm:p-10 space-y-8"
            >
              <div className="space-y-2 border-b border-slate-100 pb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <Sparkles size={12} /> Decision Stage
                </span>
                <h1 className="font-serif text-3xl font-bold text-slate-900">
                  Make your recommendation
                </h1>
                <p className="text-sm text-slate-600">
                  Based on the evidence you've investigated, select an intervention to propose to Sarah.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Intervention *
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {decisionOptions.map((opt) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <label
                        key={opt}
                        className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition select-none ${
                          isSelected
                            ? "border-[#7B4A28] bg-amber-50/50 shadow-sm ring-1 ring-[#7B4A28]"
                            : "border-slate-200 bg-slate-50/60 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="recommendation_option"
                          value={opt}
                          checked={isSelected}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="mt-0.5 text-[#7B4A28] focus:ring-[#7B4A28]"
                        />
                        <span className="text-sm font-semibold text-slate-900">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Why are you recommending this? *
                </label>
                <textarea
                  required
                  rows={4}
                  value={whyRecommendation}
                  onChange={(e) => setWhyRecommendation(e.target.value)}
                  placeholder="Explain the root cause identified in the data and why this intervention will solve it..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-900 focus:border-[#7B4A28] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Which evidence supports your recommendation?
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {resources.map((res) => {
                    const isChecked = selectedEvidenceResources.includes(res.id);
                    return (
                      <label
                        key={res.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer text-xs font-medium text-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleEvidenceResource(res.id, false)}
                          className="rounded text-[#7B4A28] focus:ring-[#7B4A28]"
                        />
                        <span>{res.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  What are you uncertain about?
                </label>
                <textarea
                  rows={3}
                  value={recommendationUncertainty}
                  onChange={(e) => setRecommendationUncertainty(e.target.value)}
                  placeholder="Highlight any data gaps, latency dependencies, or alternative explanations..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-900 focus:border-[#7B4A28] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={actionLoading || !selectedOption || !whyRecommendation.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7B4A28] px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#633B20] disabled:opacity-40"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      Send recommendation <Rocket size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : isRealityEventStage ? (
          /* ========================================================= */
          /* 6. Consequence & Reality Event Screen                      */
          /* ========================================================= */
          <div className="space-y-6">
            {session?.state === "CONSEQUENCE_ACTIVE" ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-3xl border border-[#E5DEC9] bg-white p-12 shadow-sm text-center">
                <Loader2 className="animate-spin text-[#7B4A28]" size={36} />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    Simulating Decision Impact...
                  </h3>
                  <p className="text-sm text-slate-600">
                    Evaluating consequences and preparing incoming reality event data.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-[#E5DEC9] bg-white p-8 shadow-sm sm:p-10 space-y-8">
                <div className="space-y-2 border-b border-slate-100 pb-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-300 bg-purple-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-900">
                    <RefreshCw size={12} /> New Information Received
                  </span>
                  <h1 className="font-serif text-3xl font-bold text-slate-900">
                    Sarah's response & new evidence
                  </h1>
                  <p className="text-sm text-slate-600">
                    Your initial recommendation has been reviewed. New production signals have just arrived.
                  </p>
                </div>

                {consequenceData?.consequence && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Outcome Analysis
                    </h3>
                    <h4 className="text-sm font-bold text-slate-900">
                      {consequenceData.consequence.title}
                    </h4>
                    {consequenceData.consequence.description && (
                      <p className="text-sm leading-relaxed text-slate-700">
                        {consequenceData.consequence.description}
                      </p>
                    )}
                  </div>
                )}

                <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-200 font-bold text-purple-900">
                      {manager.name ? manager.name[0] : "S"}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-purple-950">
                        {manager.name || "Sarah"}: Response to Your Recommendation
                      </h3>
                      <p className="text-xs text-purple-800 font-mono">
                        Proposed: "{currentDecision?.selected_option || selectedOption}"
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-purple-950">
                    {realityEventsConfig.manager_response ||
                      realityEventData?.manager_response ||
                      "Sarah shared new data regarding recent payment interruptions and asks whether you wish to maintain or revise your recommendation."}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    New Information & Evidence
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-800">
                    {realityEventsConfig.information ||
                      realityEventData?.information ||
                      "A new sample suggests payment interruptions are concentrated on one specific payment method."}
                  </p>
                  {Array.isArray(realityEventsConfig.evidence) && realityEventsConfig.evidence.length > 0 && (
                    <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                      {realityEventsConfig.evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {!isUpdatingRecommendation ? (
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleKeepRecommendation}
                      className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                    >
                      Keep my recommendation
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => {
                        setIsUpdatingRecommendation(true);
                        setUpdatedOption(currentDecision?.selected_option || selectedOption);
                        setUpdatedWhy(currentDecision?.why || whyRecommendation);
                        setUpdatedUncertainty(currentDecision?.uncertainty || recommendationUncertainty);
                        const existingEvidenceIds = Array.isArray(currentDecision?.evidence)
                          ? currentDecision.evidence
                              .map((ev) => (typeof ev === "string" ? ev : ev?.resource_id))
                              .filter(Boolean)
                          : selectedEvidenceResources;
                        setUpdatedEvidenceResources(existingEvidenceIds);
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#7B4A28] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#633B20] disabled:opacity-50"
                    >
                      Update my recommendation <RefreshCw size={14} />
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleUpdateRecommendationSubmit}
                    className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6 space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900">
                        Revise Recommendation Based on New Evidence
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsUpdatingRecommendation(false)}
                        className="text-xs text-slate-500 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Revised Option *
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {decisionOptions.map((opt) => {
                          const isSelected = updatedOption === opt;
                          return (
                            <label
                              key={opt}
                              className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer select-none ${
                                isSelected
                                  ? "border-[#7B4A28] bg-white shadow-sm ring-1 ring-[#7B4A28]"
                                  : "border-slate-200 bg-white/70 hover:bg-white"
                              }`}
                            >
                              <input
                                type="radio"
                                name="updated_option"
                                value={opt}
                                checked={isSelected}
                                onChange={(e) => setUpdatedOption(e.target.value)}
                                className="mt-0.5 text-[#7B4A28] focus:ring-[#7B4A28]"
                              />
                              <span className="text-sm font-semibold text-slate-900">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Updated Rationale *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={updatedWhy}
                        onChange={(e) => setUpdatedWhy(e.target.value)}
                        placeholder="Explain how the new information changed or refined your recommendation..."
                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Which evidence supports your revised recommendation? *
                      </label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {resources.map((res) => {
                          const isChecked = updatedEvidenceResources.includes(res.id);
                          return (
                            <label
                              key={res.id}
                              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 cursor-pointer text-xs font-medium text-slate-800"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleEvidenceResource(res.id, true)}
                                className="rounded text-[#7B4A28] focus:ring-[#7B4A28]"
                              />
                              <span>{res.title}</span>
                            </label>
                          );
                        })}
                      </div>
                      {updatedEvidenceResources.length === 0 && (
                        <p className="text-xs font-medium text-amber-800">
                          Please select at least one supporting evidence resource.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Remaining Uncertainty
                      </label>
                      <textarea
                        rows={2}
                        value={updatedUncertainty}
                        onChange={(e) => setUpdatedUncertainty(e.target.value)}
                        placeholder="Note any unresolved questions or risks..."
                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-amber-200">
                      <button
                        type="button"
                        onClick={() => setIsUpdatingRecommendation(false)}
                        className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={
                          actionLoading ||
                          !updatedOption ||
                          !updatedWhy.trim() ||
                          updatedEvidenceResources.length === 0
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#7B4A28] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#633B20] disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Confirm Updated Recommendation
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : isOutputStage ? (
          /* ========================================================= */
          /* 7. Professional Memo / Output Workflow                     */
          /* ========================================================= */
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#E5DEC9] bg-white p-8 shadow-sm sm:p-10 space-y-8">
              {/* Header & Status Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      <FileText size={12} /> Deliverable: Professional Memo
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-xs text-slate-700 uppercase">
                      Status: {outputStatus}
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl font-bold text-slate-900">
                    Finish the work: Executive Memo
                  </h1>
                </div>

                {!isMemoFinalised && (
                  <span className="text-xs text-slate-500">
                    Draft Autosave:{" "}
                    <strong className={memoSaveStatus === "error" ? "text-rose-600" : "text-emerald-700 font-mono"}>
                      {memoSaveStatus === "saving" ? "Saving..." : memoSaveStatus === "saved" ? "Saved" : memoSaveStatus === "error" ? "Save Error" : "Ready"}
                    </strong>
                  </span>
                )}
              </div>

              {/* Six Required Memo Sections */}
              <div className="space-y-6">
                {/* 1. Executive Summary */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    1. Executive Summary *
                  </label>
                  {isMemoFinalised ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-900 whitespace-pre-wrap">
                      {memoForm.executive_summary || "None provided"}
                    </div>
                  ) : (
                    <textarea
                      rows={3}
                      value={memoForm.executive_summary}
                      onChange={(e) => handleMemoFieldChange("executive_summary", e.target.value)}
                      placeholder="High-level overview of the investigation and core decision..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-900 focus:border-[#7B4A28] focus:bg-white focus:outline-none"
                    />
                  )}
                </div>

                {/* 2. Key Findings */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Key Findings *
                  </label>
                  {isMemoFinalised ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-900 whitespace-pre-wrap">
                      {memoForm.key_findings || "None provided"}
                    </div>
                  ) : (
                    <textarea
                      rows={3}
                      value={memoForm.key_findings}
                      onChange={(e) => handleMemoFieldChange("key_findings", e.target.value)}
                      placeholder="Synthesize the critical drop-off points discovered during investigation..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-900 focus:border-[#7B4A28] focus:bg-white focus:outline-none"
                    />
                  )}
                </div>

                {/* 3. Evidence */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    3. Supporting Evidence *
                  </label>
                  {isMemoFinalised ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-900 whitespace-pre-wrap">
                      {memoForm.evidence || "None provided"}
                    </div>
                  ) : (
                    <textarea
                      rows={3}
                      value={memoForm.evidence}
                      onChange={(e) => handleMemoFieldChange("evidence", e.target.value)}
                      placeholder="Cite specific metrics, funnel logs, and customer feedback..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-900 focus:border-[#7B4A28] focus:bg-white focus:outline-none"
                    />
                  )}
                </div>

                {/* 4. Recommendation */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    4. Recommendation *
                  </label>
                  {isMemoFinalised ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-900 whitespace-pre-wrap">
                      {memoForm.recommendation || "None provided"}
                    </div>
                  ) : (
                    <textarea
                      rows={3}
                      value={memoForm.recommendation}
                      onChange={(e) => handleMemoFieldChange("recommendation", e.target.value)}
                      placeholder="Detailed proposal and chosen intervention..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-900 focus:border-[#7B4A28] focus:bg-white focus:outline-none"
                    />
                  )}
                </div>

                {/* 5. Risks / Limitations */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    5. Risks & Limitations *
                  </label>
                  {isMemoFinalised ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-900 whitespace-pre-wrap">
                      {memoForm.risks_limitations || "None provided"}
                    </div>
                  ) : (
                    <textarea
                      rows={3}
                      value={memoForm.risks_limitations}
                      onChange={(e) => handleMemoFieldChange("risks_limitations", e.target.value)}
                      placeholder="Outline uncertainties, technical dependencies, or trade-offs..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-900 focus:border-[#7B4A28] focus:bg-white focus:outline-none"
                    />
                  )}
                </div>

                {/* 6. Next Steps */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    6. Next Steps *
                  </label>
                  {isMemoFinalised ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-900 whitespace-pre-wrap">
                      {memoForm.next_steps || "None provided"}
                    </div>
                  ) : (
                    <textarea
                      rows={3}
                      value={memoForm.next_steps}
                      onChange={(e) => handleMemoFieldChange("next_steps", e.target.value)}
                      placeholder="Action items for engineering, analytics, and rollout..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-900 focus:border-[#7B4A28] focus:bg-white focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Output Actions Bar */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  {outputStatus === "draft" && "Editing draft. When ready, review the memo document."}
                  {outputStatus === "review" && "Reviewed document. Finalising will lock all sections."}
                  {outputStatus === "finalised" && "Memo finalised and locked. Ready to submit to Sarah."}
                  {outputStatus === "submitted" && "Memo submitted to manager."}
                </div>

                <div className="flex items-center gap-3">
                  {outputStatus === "draft" && (
                    <button
                      type="button"
                      disabled={actionLoading || reviewLoading}
                      onClick={handleReviewMemoClick}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#7B4A28] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#633B20] disabled:opacity-50"
                    >
                      {actionLoading || reviewLoading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                      Review memo
                    </button>
                  )}

                  {outputStatus === "review" && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleFinaliseOutput}
                      className="inline-flex items-center gap-2 rounded-2xl bg-amber-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-amber-800 disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <LockKeyhole size={16} />}
                      Finalise memo
                    </button>
                  )}

                  {outputStatus === "finalised" && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleSubmitOutput}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#7B4A28] px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#633B20] disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      Submit memo to Sarah
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : isReflectionStage ? (
          /* ========================================================= */
          /* 8. Reflection Workflow                                    */
          /* ========================================================= */
          <div className="space-y-6">
            <form
              onSubmit={handleReflectionSubmit}
              className="rounded-3xl border border-[#E5DEC9] bg-white p-8 shadow-sm sm:p-10 space-y-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-300 bg-purple-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-900">
                    <Sparkles size={12} /> Final Reflection
                  </span>
                  <h1 className="font-serif text-3xl font-bold text-slate-900">
                    Reflect on the experience
                  </h1>
                  <p className="text-sm text-slate-600">
                    Reflect on how you approached the investigation, the analytical intuition you developed, and what you would explore further in a Business Analyst role.
                  </p>
                </div>

                <span className="text-xs text-slate-500">
                  Reflection Autosave:{" "}
                  <strong className={reflectionSaveStatus === "error" ? "text-rose-600" : "text-emerald-700 font-mono"}>
                    {reflectionSaveStatus === "saving" ? "Saving..." : reflectionSaveStatus === "saved" ? "Saved" : reflectionSaveStatus === "error" ? "Save Error" : "Ready"}
                  </strong>
                </span>
              </div>

              <div className="space-y-6">
                {reflectionQuestions.map((q, idx) => {
                  const canonicalKey = mapQuestionIdToCanonicalKey(q.id);
                  return (
                    <div key={q.id || idx} className="space-y-2">
                      <label className="text-sm font-bold text-slate-900">
                        {idx + 1}. {q.prompt}
                      </label>
                      <textarea
                        rows={4}
                        value={reflectionForm[canonicalKey] ?? reflectionForm[q.id] ?? ""}
                        onChange={(e) => handleReflectionFieldChange(q.id, e.target.value)}
                        placeholder="Share your analytical reflections..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-900 focus:border-[#7B4A28] focus:bg-white focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-slate-500">
                  Submitting your reflection completes the Trial Mission session.
                </p>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#7B4A28] px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#633B20] disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Submit reflection
                </button>
              </div>
            </form>
          </div>
        ) : isCompletedStage ? (
          /* ========================================================= */
          /* 9. Mission Completion Screen                              */
          /* ========================================================= */
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#E5DEC9] bg-white p-8 shadow-sm sm:p-10 space-y-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b border-slate-100 pb-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Mission Completed
                  </span>
                  <h1 className="font-serif text-3xl font-bold text-slate-900">
                    You've completed this Trial Mission
                  </h1>
                  <p className="text-sm text-slate-600">
                    Your investigation findings, executive memo, and reflection have been submitted and recorded.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Mission
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{session.mission_title}</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Simulated Role
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {role.title || "Business Analyst"} {role.company ? `(${role.company})` : ""}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </span>
                  <p className="font-mono text-sm font-bold text-emerald-700">
                    {session.state}
                  </p>
                </div>
              </div>

              {/* Activity Summary Section */}
              {activitySummaryLoading && (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 text-sm text-slate-600">
                  <Loader2 size={18} className="animate-spin text-[#7B4A28]" />
                  <span>Loading mission activity summary...</span>
                </div>
              )}

              {!activitySummaryLoading && activitySummaryError && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800 mb-1">Activity Summary Notice</p>
                  {activitySummaryError}
                </div>
              )}

              {!activitySummaryLoading && activitySummary && Array.isArray(activitySummary.categories) && activitySummary.categories.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 space-y-6">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7B4A28]">
                      Activity Summary
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">
                      WHAT WE OBSERVED
                    </h2>
                    <p className="text-xs text-slate-600">
                      A factual summary of the observable actions and work patterns recorded during your mission.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {activitySummary.categories.map((cat, idx) => (
                      <div
                        key={cat.category || idx}
                        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3"
                      >
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                          {cat.category}
                        </h3>
                        {Array.isArray(cat.observations) && cat.observations.length > 0 ? (
                          <ul className="space-y-2 text-xs leading-relaxed text-slate-700">
                            {cat.observations.map((obs, oIdx) => (
                              <li key={oIdx} className="flex items-start gap-2">
                                <span className="text-slate-400 select-none mt-0.5">•</span>
                                <span>{obs}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-500 italic">No activity recorded.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evaluation Section */}
              {evaluationLoading && (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 text-sm text-slate-600">
                  <Loader2 size={18} className="animate-spin text-[#7B4A28]" />
                  <span>Loading evaluation details...</span>
                </div>
              )}

              {!evaluationLoading && evaluationData?.status === "pending" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-amber-800" />
                    <h3 className="text-sm font-bold text-amber-950">
                      Your evaluation is being prepared
                    </h3>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Synthesizing your investigation evidence, recommendation rationale, and reflections...
                  </p>
                </div>
              )}

              {!evaluationLoading && (evaluationError || evaluationData?.status === "failed") && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800 mb-1">Evaluation Details Notice</p>
                  Evaluation feedback is currently unavailable. Your mission completion is securely recorded.
                </div>
              )}

              {!evaluationLoading && evaluationData && (evaluationData.status === "completed" || evaluationData.ai_evaluation || evaluationData.deterministic_evaluation) && (
                <div className="space-y-6 pt-2">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900">
                      Mission Evaluation & Feedback
                    </h2>
                    <p className="text-xs text-slate-600">
                      Evidence-backed observations and development notes from your performance in this role.
                    </p>
                  </div>

                  {/* AI Evaluation Dimensions */}
                  {Array.isArray(evaluationData.ai_evaluation?.dimensions) && evaluationData.ai_evaluation.dimensions.length > 0 && (
                    <div className="space-y-4">
                      {evaluationData.ai_evaluation.dimensions.map((dim, idx) => (
                        <div
                          key={dim.key || idx}
                          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">
                              {formatDimensionKey(dim.key)}
                            </h3>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                              Demonstrated Analysis
                            </span>
                          </div>

                          {dim.observation && (
                            <div className="space-y-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                What you demonstrated
                              </span>
                              <p className="text-sm leading-relaxed text-slate-800">
                                {dim.observation}
                              </p>
                            </div>
                          )}

                          {Array.isArray(dim.evidence_refs) && dim.evidence_refs.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Evidence from your work
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {dim.evidence_refs.map((ref, rIdx) => (
                                  <span
                                    key={rIdx}
                                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-700"
                                  >
                                    {ref}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {dim.development_note && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                                Development note
                              </span>
                              <p className="text-xs leading-relaxed text-amber-950">
                                {dim.development_note}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Limitations */}
                  {Array.isArray(evaluationData.ai_evaluation?.limitations) && evaluationData.ai_evaluation.limitations.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Evaluation Limitations & Context
                      </h4>
                      <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                        {evaluationData.ai_evaluation.limitations.map((lim, lIdx) => (
                          <li key={lIdx}>{lim}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Deterministic Evaluation Signals */}
                  {evaluationData.deterministic_evaluation?.dimensions && typeof evaluationData.deterministic_evaluation.dimensions === "object" && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Deterministic Signal Context
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {Object.entries(evaluationData.deterministic_evaluation.dimensions).map(([dKey, dVal]) => (
                          <div key={dKey} className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
                            <span className="text-xs font-bold text-slate-900">
                              {formatDimensionKey(dKey)}
                            </span>
                            {typeof dVal === "object" && dVal !== null ? (
                              <div className="text-xs text-slate-600 space-y-0.5">
                                {dVal.notes && <p>{dVal.notes}</p>}
                                {dVal.description && <p>{dVal.description}</p>}
                                {dVal.observation && <p>{dVal.observation}</p>}
                                {dVal.score !== undefined && (
                                  <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
                                    Signal Score: {dVal.score}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-600">{String(dVal)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetToCatalog}
                  className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Explore More Missions
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Return to Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/career-decision")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#7B4A28] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#633B20]"
                >
                  View Career Decision & Fit
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
