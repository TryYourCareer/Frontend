import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Rocket,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Pause,
  Play,
  FileCheck2,
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
  Timer,
  LogOut,
  Search,
  Clock,
  Zap,
  Award,
  Compass,
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
  const reflectionInitializedSessionIdRef = useRef(null);
  const latestReflectionFormRef = useRef({
    what_felt_natural: "",
    hardest_part: "",
    investigate_next: "",
  });

  const memoDirtyRef = useRef(false);
  const memoEditVersionRef = useRef(0);
  const memoSaveTimerRef = useRef(null);
  const memoInitializedSessionIdRef = useRef(null);
  const latestMemoFormRef = useRef({
    executive_summary: "",
    key_findings: "",
    evidence: "",
    recommendation: "",
    risks_limitations: "",
    next_steps: "",
  });

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

  // Catalog search & category filter state
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("all");

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
    startingMissionId,
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
    formattedStopwatch,
    handleRecordScreenTransition,
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

  // Sync memo draft from backend outputData - only initializes when session changes or when finalised
  useEffect(() => {
    const isNewSession = session?.id && memoInitializedSessionIdRef.current !== session.id;
    const isFinalised = outputData?.status === "finalised" || outputData?.status === "submitted";

    if (outputData) {
      // If memo is finalised, keep in sync with server. If unfinalised, only initialize once per session.
      if (isFinalised || isNewSession || !memoInitializedSessionIdRef.current) {
        if (memoDirtyRef.current && !isFinalised && !isNewSession) {
          return;
        }
        if (session?.id) {
          memoInitializedSessionIdRef.current = session.id;
        }
        setMemoForm((prev) => {
          const nextForm = {
            executive_summary: outputData.executive_summary ?? prev.executive_summary ?? "",
            key_findings: outputData.key_findings ?? prev.key_findings ?? "",
            evidence: outputData.evidence ?? prev.evidence ?? "",
            recommendation: outputData.recommendation ?? prev.recommendation ?? "",
            risks_limitations: outputData.risks_limitations ?? prev.risks_limitations ?? "",
            next_steps: outputData.next_steps ?? prev.next_steps ?? "",
          };
          latestMemoFormRef.current = nextForm;
          return nextForm;
        });
      }
    } else if (currentDecision && (isNewSession || !memoInitializedSessionIdRef.current)) {
      if (session?.id) {
        memoInitializedSessionIdRef.current = session.id;
      }
      setMemoForm((prev) => {
        if (memoDirtyRef.current) {
          return prev;
        }
        const nextRec = prev.recommendation || currentDecision.selected_option || "";
        const nextEvidence = prev.evidence || currentDecision.why || "";
        const nextRisks = prev.risks_limitations || currentDecision.uncertainty || "";
        const nextForm = {
          ...prev,
          recommendation: nextRec,
          evidence: nextEvidence,
          risks_limitations: nextRisks,
        };
        latestMemoFormRef.current = nextForm;
        return nextForm;
      });
    }
  }, [outputData, currentDecision, session?.id]);

  // Sync reflection draft from backend reflectionData - only initializes once per session
  useEffect(() => {
    const isNewSession = session?.id && reflectionInitializedSessionIdRef.current !== session.id;
    const isCompleted = session?.state === "SESSION_COMPLETED" || session?.state === "COMPLETED";

    if (reflectionData && (isCompleted || isNewSession || !reflectionInitializedSessionIdRef.current)) {
      if (reflectionDirtyRef.current && !isCompleted && !isNewSession) {
        return;
      }
      if (session?.id) {
        reflectionInitializedSessionIdRef.current = session.id;
      }
      setReflectionForm((prev) => {
        const nextForm = {
          what_felt_natural:
            reflectionData.what_felt_natural ??
            reflectionData.natural ??
            prev.what_felt_natural ??
            "",
          hardest_part:
            reflectionData.hardest_part ??
            reflectionData.hardest ??
            prev.hardest_part ??
            "",
          investigate_next:
            reflectionData.investigate_next ??
            reflectionData.next_investigation ??
            prev.investigate_next ??
            "",
        };
        latestReflectionFormRef.current = nextForm;
        return nextForm;
      });
    }
  }, [reflectionData, session?.id, session?.state]);

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

  const currentStageDisplay = useMemo(() => {
    if (isCreatedStage) return "Get Ready";
    if (isBriefingStage) return "Manager Briefing";
    if (isInvestigationStage) return "Investigation Workspace";
    if (isRecommendationStage) return "Recommendation Rationale";
    if (isRealityEventStage) return "Reality Event";
    if (isOutputStage) return "Final Executive Memo";
    if (isReflectionStage) return "Self Reflection";
    if (isCompletedStage) return "Mission Complete";
    return "";
  }, [
    isCreatedStage,
    isBriefingStage,
    isInvestigationStage,
    isRecommendationStage,
    isRealityEventStage,
    isOutputStage,
    isReflectionStage,
    isCompletedStage,
  ]);

  // Track stage transitions for authoritative timing
  const currentStageName = useMemo(() => {
    if (isCreatedStage) return "GET_READY";
    if (isBriefingStage) return "MEET_MANAGER";
    if (isInvestigationStage) return "WORKSPACE";
    if (isRecommendationStage) return "RECOMMENDATION";
    if (isRealityEventStage) return "REALITY_EVENT";
    if (isOutputStage) return "FINAL_MEMO";
    if (isReflectionStage) return "REFLECTION";
    return null;
  }, [
    isCreatedStage,
    isBriefingStage,
    isInvestigationStage,
    isRecommendationStage,
    isRealityEventStage,
    isOutputStage,
    isReflectionStage,
  ]);

  const lastRecordedStageRef = useRef(null);
  useEffect(() => {
    if (
      session?.id &&
      currentStageName &&
      lastRecordedStageRef.current !== currentStageName &&
      session.state !== "SESSION_PAUSED" &&
      session.state !== "SESSION_COMPLETED"
    ) {
      lastRecordedStageRef.current = currentStageName;
      if (typeof handleRecordScreenTransition === "function") {
        handleRecordScreenTransition(currentStageName);
      }
    }
  }, [session?.id, currentStageName, session?.state, handleRecordScreenTransition]);

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
    const snapshot = { ...latestMemoFormRef.current };

    setMemoSaveStatus("saving");
    const timer = setTimeout(async () => {
      try {
        await handleSaveOutput(snapshot);
        // Only mark clean if no new keystrokes occurred while the save request was in flight
        if (memoEditVersionRef.current === savingVersion) {
          memoDirtyRef.current = false;
          setMemoSaveStatus("saved");
        }
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
    setMemoForm((prev) => {
      const nextForm = { ...prev, [field]: value };
      latestMemoFormRef.current = nextForm;
      return nextForm;
    });
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

  const filteredMissions = useMemo(() => {
    if (!Array.isArray(missions)) return [];
    return missions.filter((m) => {
      const careerName = (m.career?.name || m.career_name || "").toLowerCase();
      const title = (m.title || "").toLowerCase();
      const desc = (m.description || "").toLowerCase();
      const wsType = (m.workspace_type || "").toLowerCase();
      const q = catalogSearch.toLowerCase().trim();

      const matchesSearch =
        !q ||
        careerName.includes(q) ||
        title.includes(q) ||
        desc.includes(q) ||
        wsType.includes(q);

      if (!matchesSearch) return false;
      if (selectedTrack === "all") return true;
      if (
        selectedTrack === "tech" &&
        (wsType.includes("dev") ||
          wsType.includes("architect") ||
          wsType.includes("data"))
      )
        return true;
      if (
        selectedTrack === "business" &&
        (wsType.includes("analyst") ||
          wsType.includes("process") ||
          wsType.includes("business"))
      )
        return true;
      if (selectedTrack === "design" && wsType.includes("design")) return true;
      return true;
    });
  }, [missions, catalogSearch, selectedTrack]);

  return (
    <div
      className={`cc-trial-mission-root ${
        session
          ? "fixed inset-0 z-[100] flex h-[100dvh] w-full max-w-full flex-col overflow-hidden bg-gradient-to-br from-[#f8fafc] via-[#edf3fa] to-[#e4eef9]"
          : "min-h-screen bg-gradient-to-br from-[#f7fafd] via-[#eef4fc] to-[#e4eef9] px-4 py-8 text-[#0b1a36] sm:px-8"
      }`}
    >
      {session && (
        <header className="sticky top-0 z-50 flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-3.5 py-2.5 sm:px-6 sm:py-3.5 shadow-sm">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20 shrink-0">
              <Rocket size={16} className="sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-base font-black text-[#0b1a36] tracking-tight truncate max-w-[110px] sm:max-w-xs">
                  Trial Mission
                </span>
                {session?.state === "SESSION_PAUSED" && (
                  <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 shrink-0">
                    Paused
                  </span>
                )}
                {isCompletedStage && (
                  <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 shrink-0">
                    Done
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate max-w-[120px] sm:max-w-xs md:max-w-md">
                {session?.mission_title || "Mission Workspace"}
                {currentStageDisplay ? ` • ${currentStageDisplay}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Stopwatch with live indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-blue-200/80 bg-blue-50/70 px-2.5 py-1 sm:px-4 sm:py-1.5 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <Timer size={12} className="text-blue-700 sm:w-3.5 sm:h-3.5" />
              <span className="font-mono text-xs sm:text-sm font-black tracking-wider text-blue-900">
                {formattedStopwatch || "00:00"}
              </span>
            </div>

            {/* Pause / Resume Controls */}
            {session && !isCompletedStage && (
              session.state === "SESSION_PAUSED" ? (
                <button
                  type="button"
                  onClick={handleResume}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1 rounded-lg sm:rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-sm"
                  title="Resume simulation"
                >
                  <Play size={12} /> <span className="hidden sm:inline">Resume</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors shadow-sm"
                  title="Pause simulation"
                >
                  <Pause size={12} /> <span className="hidden sm:inline">Pause</span>
                </button>
              )
            )}

            {/* Exit Control */}
            <button
              type="button"
              onClick={resetToCatalog}
              className="inline-flex items-center gap-1 rounded-lg sm:rounded-xl border border-slate-200 bg-white px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-all shadow-sm"
              title="Exit Trial Mission workspace"
            >
              <LogOut size={12} /> <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </header>
      )}

      <div className={session ? "flex-1 overflow-y-auto px-3 py-4 sm:px-8 sm:py-6 overscroll-contain" : ""}>
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
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <ArrowLeft size={14} />
              {session ? "Back to Mission Catalog" : "Back to Dashboard"}
            </button>

            {session && (
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 font-mono text-xs font-bold text-blue-800">
                  Phase: {session.current_phase || "initial"}
                </span>

                {/* Lifecycle Controls */}
                {canAbandon && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleAbandon}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
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
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-12 shadow-sm backdrop-blur-sm">
              <Loader2 className="animate-spin text-blue-600" size={36} />
              <p className="text-sm font-bold text-slate-700">
                Loading Trial Mission server state...
              </p>
            </div>
          ) : !session ? (
            /* ========================================================= */
            /* 1. Modern Mission Catalog                                 */
            /* ========================================================= */
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-sm backdrop-blur-sm sm:p-10">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                <div className="relative max-w-3xl space-y-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-800">
                    <Sparkles size={12} className="text-blue-600" /> Live Interactive Simulation Lab
                  </span>
                  <h1 className="text-3xl font-black tracking-tight text-[#0b1a36] sm:text-4xl">
                    Trial Missions & Role Simulations
                  </h1>
                  <p className="text-base leading-relaxed text-slate-600">
                    Step into day-in-the-life industry challenges. Investigate realistic anomalies, examine telemetry & user feedback, propose strategic recommendations under pressure, and receive detailed competency evaluation.
                  </p>

                  {/* Highlights strip */}
                  <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-left">
                      <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                        <Zap size={13} /> Interactive Canvas
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Real code, data & diagrams</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-left">
                      <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs">
                        <RefreshCw size={13} /> Reality Events
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Dynamic production surprises</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-left">
                      <div className="flex items-center gap-1.5 text-purple-600 font-bold text-xs">
                        <FileText size={13} /> Executive Memo
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Authentic deliverables</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-left">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                        <Award size={13} /> Capability Signal
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">AI competency feedback</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTrack("all")}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      selectedTrack === "all"
                        ? "bg-[#0b1a36] text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    All Tracks
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack("tech")}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      selectedTrack === "tech"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Tech & Systems
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack("business")}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      selectedTrack === "business"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Business & Strategy
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack("design")}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      selectedTrack === "design"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Design & UX
                  </button>
                </div>

                <div className="relative min-w-[240px]">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search missions or roles..."
                    className="w-full rounded-full border border-slate-200/90 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {catalogSearch && (
                    <button
                      type="button"
                      onClick={() => setCatalogSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Missions Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#0b1a36]">
                    Available Simulations ({filteredMissions.length})
                  </h2>
                </div>

                {filteredMissions.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-12 text-center text-sm text-slate-500 space-y-3">
                    <Compass size={32} className="mx-auto text-slate-400 animate-pulse" />
                    <p className="font-semibold text-slate-700">No trial missions found matching your search.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogSearch("");
                        setSelectedTrack("all");
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredMissions.map((m) => {
                      const careerName = m.career?.name || m.career_name || "Career Mission";
                      const workspaceLabel = formatWorkspaceType(m.workspace_type);
                      return (
                        <div
                          key={m.id}
                          className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="space-y-3.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3 py-1 text-xs font-bold text-blue-900">
                                <Briefcase size={12} className="text-blue-600" /> {careerName}
                              </span>
                              {m.estimated_duration_minutes && (
                                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                  <Clock size={12} /> ~{m.estimated_duration_minutes}m
                                </span>
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-[#0b1a36] group-hover:text-blue-600 transition-colors">
                                {m.title}
                              </h3>
                              <div className="mt-1.5 flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {workspaceLabel}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">
                              {m.description || "Take on real-world business challenges and test your analytical intuition in this interactive scenario."}
                            </p>
                          </div>

                          <div className="mt-6 pt-4 border-t border-slate-100">
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => startSession(m.id)}
                              aria-label="Try this career"
                              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-50"
                            >
                              {actionLoading && startingMissionId === m.id ? (
                                <>
                                  <Loader2 size={15} className="animate-spin" /> Launching Simulation...
                                </>
                              ) : (
                                <>
                                  Launch Simulation <Rocket size={15} />
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
              <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-sm sm:p-10 backdrop-blur-sm space-y-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-900">
                    <UserCheck size={12} className="text-blue-600" /> Mission Briefing Dossier
                  </span>
                  <h1 className="text-3xl font-black text-[#0b1a36] sm:text-4xl">
                    {session.mission_title}
                  </h1>
                  <p className="text-sm text-slate-500">
                    Simulated Role: <span className="font-bold text-[#0b1a36]">{role.title || "Business Analyst"}</span>
                    {role.company && ` • Company: ${role.company}`}
                  </p>
                </div>

                <div className="grid gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      Mission Context
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {briefing.context ||
                        "You are taking on the role of a specialist investigating system anomalies and critical performance signals."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                      Objective
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {objective.description ||
                        "Investigate where issues originate, evaluate supporting evidence, and recommend an actionable fix."}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer select-none rounded-2xl border border-blue-100 bg-blue-50/40 p-4 transition hover:bg-blue-50/80">
                    <input
                      type="checkbox"
                      checked={isReadyChecked}
                      onChange={(e) => setIsReadyChecked(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      I understand the context and I'm ready to enter the simulation workspace and investigate.
                    </span>
                  </label>

                  <div>
                    <button
                      type="button"
                      disabled={!isReadyChecked || actionLoading}
                      onClick={() => handleTransition(startTransitionAction)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Starting...
                        </>
                      ) : (
                        <>
                          I'm ready — Start Simulation <Rocket size={16} />
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
              <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-sm sm:p-10 backdrop-blur-sm space-y-8">
                <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-2xl shadow-md shadow-blue-500/20">
                    {manager.name ? manager.name[0] : "S"}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#0b1a36]">
                      Meet your manager: {manager.name || "Sarah"}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {manager.title || "Product Lead"} {role.company ? `at ${role.company}` : ""}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Manager Briefing & Instructions
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-800">
                    {briefing.task ||
                      "Review the telemetry analytics, examine customer feedback, and prepare your initial findings."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0b1a36]">
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
                          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition hover:bg-slate-100/80"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 text-blue-600">
                              <FileText size={16} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#0b1a36]">{res.title}</h4>
                              <span className="text-[10px] font-semibold text-slate-500 uppercase">{res.type}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleAccessResource(res.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 transition-colors"
                          >
                            {isAccessed ? (
                              <>
                                <Check size={13} className="text-emerald-600" /> Viewed
                              </>
                            ) : (
                              <>
                                <Eye size={13} /> View resource
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {activeResource && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                        Resource Content: {activeResource.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveResource(null)}
                        className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                      >
                        ✕ Close
                      </button>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {activeResource.content || "No detailed content provided for this resource."}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setBriefingDismissed(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
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
                configuration={config}
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
                className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white/95 p-4 sm:p-8 md:p-10 shadow-sm backdrop-blur-sm space-y-6 sm:space-y-8"
              >
                <div className="space-y-2 border-b border-slate-100 pb-4 sm:pb-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-900">
                    <Sparkles size={12} className="text-blue-600" /> Step 2: Decision Formulation
                  </span>
                  <h1 className="text-xl sm:text-3xl font-black text-[#0b1a36]">
                    Make your recommendation
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Based on the evidence you've investigated, select an intervention to propose to {manager.name || "Sarah"}.
                  </p>
                </div>

                {/* 1. Decision Options */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    1. Select Recommended Intervention *
                  </label>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {decisionOptions.map((opt) => {
                      const isSelected = selectedOption === opt;
                      return (
                        <label
                          key={opt}
                          className={`flex items-start gap-3 rounded-xl sm:rounded-2xl border p-3.5 sm:p-4 cursor-pointer transition-all duration-200 select-none ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-400"
                              : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/80"
                          }`}
                        >
                          <input
                            type="radio"
                            name="recommendation_option"
                            value={opt}
                            checked={isSelected}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            className="mt-0.5 text-blue-600 focus:ring-blue-500 shrink-0"
                          />
                          <span className="text-xs sm:text-sm font-bold text-[#0b1a36] leading-snug">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Supporting Evidence */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    2. Supporting Evidence & Findings
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {resources.map((res) => {
                      const isChecked = selectedEvidenceResources.includes(res.id);
                      return (
                        <label
                          key={res.id}
                          className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer text-xs font-semibold transition-colors ${
                            isChecked
                              ? "border-blue-400 bg-blue-50/60 text-blue-900"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleEvidenceResource(res.id, false)}
                            className="rounded text-blue-600 focus:ring-blue-500 shrink-0"
                          />
                          <span className="truncate">{res.title}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Strategic Rationale */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    3. Why are you recommending this? *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={whyRecommendation}
                    onChange={(e) => setWhyRecommendation(e.target.value)}
                    placeholder="Explain the root cause identified in the data and why this intervention will solve it..."
                    className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 sm:p-4 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                {/* 4. Uncertainty & Risks */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    4. What are you uncertain about? (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={recommendationUncertainty}
                    onChange={(e) => setRecommendationUncertainty(e.target.value)}
                    placeholder="Highlight any data gaps, latency dependencies, or alternative explanations..."
                    className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 sm:p-4 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                {/* Submit Decision Action */}
                <div className="pt-3 sm:pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoading || !selectedOption || !whyRecommendation.trim()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-40"
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
                <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-12 shadow-sm text-center backdrop-blur-sm">
                  <div className="relative flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-blue-100 animate-ping absolute opacity-75" />
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white relative">
                      <RefreshCw size={20} className="animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-[#0b1a36]">
                      Simulating Decision Impact...
                    </h3>
                    <p className="text-xs text-slate-600">
                      Evaluating consequences and preparing incoming reality event data.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-sm sm:p-10 backdrop-blur-sm space-y-8">
                  <div className="space-y-2 border-b border-slate-100 pb-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-300 bg-purple-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-900">
                      <RefreshCw size={12} className="text-purple-600" /> New Telemetry & Manager Feedback
                    </span>
                    <h1 className="text-3xl font-black text-[#0b1a36]">
                      {manager.name || "Sarah"}'s response & new evidence
                    </h1>
                    <p className="text-xs text-slate-600">
                      Your initial recommendation has been evaluated. New production signals have just arrived.
                    </p>
                  </div>

                  {consequenceData?.consequence && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                        Outcome Analysis
                      </h3>
                      <h4 className="text-sm font-bold text-[#0b1a36]">
                        {consequenceData.consequence.title}
                      </h4>
                      {consequenceData.consequence.description && (
                        <p className="text-xs leading-relaxed text-slate-700">
                          {consequenceData.consequence.description}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold">
                        {manager.name ? manager.name[0] : "S"}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-purple-950">
                          {manager.name || "Sarah"}: Response to Your Recommendation
                        </h3>
                        <p className="text-[11px] text-purple-800 font-mono">
                          Proposed: "{currentDecision?.selected_option || selectedOption}"
                        </p>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-purple-950">
                      {realityEventsConfig.manager_response ||
                        realityEventData?.manager_response ||
                        "New real-time telemetry arrived regarding system anomalies. Review whether you wish to maintain or revise your recommendation."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      New Information & Evidence
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-800">
                      {realityEventsConfig.information ||
                        realityEventData?.information ||
                        "A new production sample suggests specific subsystem concentration."}
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
                        className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
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
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
                      >
                        Update my recommendation <RefreshCw size={14} />
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleUpdateRecommendationSubmit}
                      className="rounded-2xl border border-blue-200 bg-blue-50/40 p-6 space-y-6"
                    >
                      <div className="flex items-center justify-between border-b border-blue-200 pb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                          Revise Recommendation Based on New Evidence
                        </h3>
                        <button
                          type="button"
                          onClick={() => setIsUpdatingRecommendation(false)}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800"
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
                                className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer select-none transition-all ${
                                  isSelected
                                    ? "border-blue-500 bg-white shadow-sm ring-1 ring-blue-400"
                                    : "border-slate-200 bg-white/70 hover:bg-white"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="updated_option"
                                  value={opt}
                                  checked={isSelected}
                                  onChange={(e) => setUpdatedOption(e.target.value)}
                                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs font-bold text-[#0b1a36]">{opt}</span>
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
                          className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                                className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer text-xs font-semibold transition-colors ${
                                  isChecked
                                    ? "border-blue-400 bg-blue-50 text-blue-900"
                                    : "border-slate-200 bg-white text-slate-800"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleEvidenceResource(res.id, true)}
                                  className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span>{res.title}</span>
                              </label>
                            );
                          })}
                        </div>
                        {updatedEvidenceResources.length === 0 && (
                          <p className="text-xs font-semibold text-amber-800">
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
                          className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-blue-200">
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
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
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
              <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white/95 p-4 sm:p-8 md:p-10 shadow-sm backdrop-blur-sm space-y-6 sm:space-y-8">
                {/* Header & Status Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 text-xs font-bold text-blue-800 uppercase tracking-wider">
                        <FileText size={12} className="text-blue-600" /> Deliverable: Executive Memo
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-xs font-semibold text-slate-700 uppercase">
                        Status: {outputStatus}
                      </span>
                    </div>
                    <h1 className="text-3xl font-black text-[#0b1a36]">
                      Finish the work: Executive Memo
                    </h1>
                  </div>

                  {!isMemoFinalised && (
                    <span className="text-xs text-slate-500">
                      Draft Autosave:{" "}
                      <strong
                        className={
                          memoSaveStatus === "error"
                            ? "text-rose-600"
                            : memoSaveStatus === "saving"
                            ? "text-blue-600 font-mono animate-pulse"
                            : "text-emerald-600 font-mono"
                        }
                      >
                        {memoSaveStatus === "saving"
                          ? "Saving..."
                          : memoSaveStatus === "saved"
                          ? "Saved"
                          : memoSaveStatus === "error"
                          ? "Save Error"
                          : "Ready"}
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
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-900 whitespace-pre-wrap">
                        {memoForm.executive_summary || "None provided"}
                      </div>
                    ) : (
                      <textarea
                        rows={3}
                        value={memoForm.executive_summary}
                        onChange={(e) => handleMemoFieldChange("executive_summary", e.target.value)}
                        placeholder="High-level overview of the investigation and core decision..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    )}
                  </div>

                  {/* 2. Key Findings */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      2. Key Findings *
                    </label>
                    {isMemoFinalised ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-900 whitespace-pre-wrap">
                        {memoForm.key_findings || "None provided"}
                      </div>
                    ) : (
                      <textarea
                        rows={3}
                        value={memoForm.key_findings}
                        onChange={(e) => handleMemoFieldChange("key_findings", e.target.value)}
                        placeholder="Synthesize the critical drop-off points discovered during investigation..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    )}
                  </div>

                  {/* 3. Evidence */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      3. Supporting Evidence *
                    </label>
                    {isMemoFinalised ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-900 whitespace-pre-wrap">
                        {memoForm.evidence || "None provided"}
                      </div>
                    ) : (
                      <textarea
                        rows={3}
                        value={memoForm.evidence}
                        onChange={(e) => handleMemoFieldChange("evidence", e.target.value)}
                        placeholder="Cite specific metrics, funnel logs, and customer feedback..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    )}
                  </div>

                  {/* 4. Recommendation */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      4. Recommendation *
                    </label>
                    {isMemoFinalised ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-900 whitespace-pre-wrap">
                        {memoForm.recommendation || "None provided"}
                      </div>
                    ) : (
                      <textarea
                        rows={3}
                        value={memoForm.recommendation}
                        onChange={(e) => handleMemoFieldChange("recommendation", e.target.value)}
                        placeholder="Detailed proposal and chosen intervention..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    )}
                  </div>

                  {/* 5. Risks / Limitations */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      5. Risks & Limitations *
                    </label>
                    {isMemoFinalised ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-900 whitespace-pre-wrap">
                        {memoForm.risks_limitations || "None provided"}
                      </div>
                    ) : (
                      <textarea
                        rows={3}
                        value={memoForm.risks_limitations}
                        onChange={(e) => handleMemoFieldChange("risks_limitations", e.target.value)}
                        placeholder="Outline uncertainties, technical dependencies, or trade-offs..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    )}
                  </div>

                  {/* 6. Next Steps */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      6. Next Steps *
                    </label>
                    {isMemoFinalised ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-900 whitespace-pre-wrap">
                        {memoForm.next_steps || "None provided"}
                      </div>
                    ) : (
                      <textarea
                        rows={3}
                        value={memoForm.next_steps}
                        onChange={(e) => handleMemoFieldChange("next_steps", e.target.value)}
                        placeholder="Action items for engineering, analytics, and rollout..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    )}
                  </div>
                </div>

                {/* Output Actions Bar */}
                <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 font-medium">
                    {outputStatus === "draft" && "Editing draft. When ready, review the memo document."}
                    {outputStatus === "review" && "Reviewed document. Finalising will lock all sections."}
                    {outputStatus === "finalised" && "Memo finalised and locked. Ready to submit to manager."}
                    {outputStatus === "submitted" && "Memo submitted to manager."}
                  </div>

                  <div className="flex items-center gap-3">
                    {outputStatus === "draft" && (
                      <button
                        type="button"
                        disabled={actionLoading || reviewLoading}
                        onClick={handleReviewMemoClick}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                      >
                        {actionLoading || reviewLoading ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                        Review memo
                      </button>
                    )}

                    {outputStatus === "review" && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleFinaliseOutput}
                        className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-amber-700 disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <LockKeyhole size={15} />}
                        Finalise memo
                      </button>
                    )}

                    {outputStatus === "finalised" && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleSubmitOutput}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                        Submit memo to {manager.name || "Sarah"}
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
                className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-sm sm:p-10 backdrop-blur-sm space-y-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-300 bg-purple-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-900">
                      <Sparkles size={12} className="text-purple-600" /> Final Metacognitive Reflection
                    </span>
                    <h1 className="text-3xl font-black text-[#0b1a36]">
                      Reflect on the experience
                    </h1>
                    <p className="text-xs text-slate-600">
                      Reflect on how you approached the simulation, the intuition you developed, and what you would explore further.
                    </p>
                  </div>

                  <span className="text-xs text-slate-500">
                    Reflection Autosave:{" "}
                    <strong
                      className={
                        reflectionSaveStatus === "error"
                          ? "text-rose-600"
                          : reflectionSaveStatus === "saving"
                          ? "text-blue-600 font-mono animate-pulse"
                          : "text-emerald-600 font-mono"
                      }
                    >
                      {reflectionSaveStatus === "saving"
                        ? "Saving..."
                        : reflectionSaveStatus === "saved"
                        ? "Saved"
                        : reflectionSaveStatus === "error"
                        ? "Save Error"
                        : "Ready"}
                    </strong>
                  </span>
                </div>

                <div className="space-y-6">
                  {reflectionQuestions.map((q, idx) => {
                    const canonicalKey = mapQuestionIdToCanonicalKey(q.id);
                    return (
                      <div key={q.id || idx} className="space-y-2">
                        <label className="text-xs font-bold text-[#0b1a36] flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-800 text-[11px]">
                            {idx + 1}
                          </span>
                          {q.prompt}
                        </label>
                        <textarea
                          rows={4}
                          value={reflectionForm[canonicalKey] ?? reflectionForm[q.id] ?? ""}
                          onChange={(e) => handleReflectionFieldChange(q.id, e.target.value)}
                          placeholder="Share your analytical reflections..."
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
                  >
                    {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
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
              <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white/95 p-4 sm:p-8 md:p-10 shadow-sm backdrop-blur-sm space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b border-slate-100 pb-4 sm:pb-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
                    <CheckCircle2 size={36} />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-900">
                      Mission Completed
                    </span>
                    <h1 className="text-3xl font-black text-[#0b1a36]">
                      You've completed this Trial Mission
                    </h1>
                    <p className="text-xs text-slate-600">
                      Your investigation findings, executive memo, and reflection have been submitted and evaluated.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Mission
                    </span>
                    <p className="font-bold text-[#0b1a36] text-xs">{session.mission_title}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Simulated Role
                    </span>
                    <p className="font-bold text-[#0b1a36] text-xs">
                      {role.title || "Business Analyst"} {role.company ? `(${role.company})` : ""}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </span>
                    <p className="font-mono text-xs font-bold text-emerald-700">
                      {session.state}
                    </p>
                  </div>
                </div>

                {/* Timing Summary Section */}
                {((session?.stage_durations && session.stage_durations.length > 0) ||
                  (activitySummary?.timing_summary?.stage_durations &&
                    activitySummary.timing_summary.stage_durations.length > 0)) && (
                  <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                          Mission Timing Summary
                        </span>
                        <h2 className="text-lg font-black text-[#0b1a36]">
                          Simulation Timing Breakdown
                        </h2>
                      </div>
                      <div className="sm:text-right rounded-2xl border border-blue-200 bg-blue-50/60 px-4 py-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Time</span>
                        <span className="font-mono text-lg font-black text-blue-900">
                          {session?.formatted_active_duration ||
                            activitySummary?.timing_summary?.formatted_active_duration ||
                            formattedStopwatch ||
                            "00m 00s"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                        Time by Stage
                      </h3>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {(
                          session?.stage_durations ||
                          activitySummary?.timing_summary?.stage_durations ||
                          []
                        ).map((sd, i) => (
                          <div
                            key={sd.stage || i}
                            className="flex items-center justify-between py-2.5 px-4 rounded-2xl bg-slate-50 border border-slate-100"
                          >
                            <span className="text-xs font-bold text-slate-800">
                              {sd.stage_display || sd.stage}
                            </span>
                            <span className="font-mono text-xs font-bold text-blue-700">
                              {sd.formatted_duration || "00m 00s"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Summary Section */}
                {activitySummaryLoading && (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 text-xs text-slate-600">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                    <span>Loading mission activity summary...</span>
                  </div>
                )}

                {!activitySummaryLoading && activitySummaryError && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800 mb-1">Activity Summary Notice</p>
                    {activitySummaryError}
                  </div>
                )}

                {!activitySummaryLoading &&
                  activitySummary &&
                  Array.isArray(activitySummary.categories) &&
                  activitySummary.categories.length > 0 && (
                    <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-8 space-y-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                          Activity Summary
                        </span>
                        <h2 className="text-lg font-black text-[#0b1a36]">
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
                            <h3 className="text-xs font-bold text-[#0b1a36] border-b border-slate-100 pb-2">
                              {cat.category}
                            </h3>
                            {Array.isArray(cat.observations) && cat.observations.length > 0 ? (
                              <ul className="space-y-2 text-xs leading-relaxed text-slate-700">
                                {cat.observations.map((obs, oIdx) => (
                                  <li key={oIdx} className="flex items-start gap-2">
                                    <span className="text-blue-500 select-none mt-0.5">•</span>
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
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 text-xs text-slate-600">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                    <span>Loading evaluation details...</span>
                  </div>
                )}

                {!evaluationLoading && evaluationData?.status === "pending" && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-blue-700" />
                      <h3 className="text-xs font-bold text-blue-950">
                        Your evaluation is being synthesized
                      </h3>
                    </div>
                    <p className="text-xs text-blue-900 leading-relaxed">
                      Synthesizing your investigation evidence, recommendation rationale, and reflections...
                    </p>
                  </div>
                )}

                {!evaluationLoading &&
                  (evaluationError || evaluationData?.status === "failed") && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800 mb-1">Evaluation Details Notice</p>
                      Evaluation feedback is currently unavailable. Your mission completion is securely recorded.
                    </div>
                  )}

                {!evaluationLoading &&
                  evaluationData &&
                  (evaluationData.status === "completed" ||
                    evaluationData.ai_evaluation ||
                    evaluationData.deterministic_evaluation) && (
                    <div className="space-y-6 pt-2">
                      <div className="space-y-1">
                        <h2 className="text-lg font-black text-[#0b1a36]">
                          Mission Evaluation & Competency Feedback
                        </h2>
                        <p className="text-xs text-slate-600">
                          Evidence-backed observations and development notes from your performance in this role.
                        </p>
                      </div>

                      {/* AI Evaluation Dimensions */}
                      {Array.isArray(evaluationData.ai_evaluation?.dimensions) &&
                        evaluationData.ai_evaluation.dimensions.length > 0 && (
                          <div className="space-y-4">
                            {evaluationData.ai_evaluation.dimensions.map((dim, idx) => (
                              <div
                                key={dim.key || idx}
                                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                  <h3 className="text-sm font-bold text-[#0b1a36]">
                                    {formatDimensionKey(dim.key)}
                                  </h3>
                                  <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
                                    Demonstrated Competency
                                  </span>
                                </div>

                                {dim.observation && (
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                      What you demonstrated
                                    </span>
                                    <p className="text-xs leading-relaxed text-slate-800">
                                      {dim.observation}
                                    </p>
                                  </div>
                                )}

                                {Array.isArray(dim.evidence_refs) && dim.evidence_refs.length > 0 && (
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                                      Development note
                                    </span>
                                    <p className="text-xs leading-relaxed text-blue-950">
                                      {dim.development_note}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Limitations */}
                      {Array.isArray(evaluationData.ai_evaluation?.limitations) &&
                        evaluationData.ai_evaluation.limitations.length > 0 && (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
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
                      {evaluationData.deterministic_evaluation?.dimensions &&
                        typeof evaluationData.deterministic_evaluation.dimensions === "object" && (
                          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                              Deterministic Signal Context
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {Object.entries(
                                evaluationData.deterministic_evaluation.dimensions
                              ).map(([dKey, dVal]) => (
                                <div
                                  key={dKey}
                                  className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1"
                                >
                                  <span className="text-xs font-bold text-[#0b1a36]">
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

{(() => {
                  const activeMission = missions?.find((m) => m.id === session?.mission_id);
                  const completedCareerId =
                    session?.career_id ||
                    session?.career?.id ||
                    evaluationData?.career_id ||
                    evaluationData?.career?.id ||
                    activeMission?.career_id ||
                    activeMission?.career?.id ||
                    session?.mission?.career_id ||
                    session?.mission?.career?.id;

                  return (
                    <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3">
                      <button
                        type="button"
                        onClick={resetToCatalog}
                        className="w-full sm:w-auto rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                      >
                        Explore More Missions
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="w-full sm:w-auto rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                      >
                        Return to Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/career-decision")}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                      >
                        View Career Decision & Fit
                      </button>
                      {completedCareerId ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/careers/${completedCareerId}/decision-report`)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[#1E88E5] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-600 transition-all"
                          data-testid="view-decision-report-button"
                        >
                          <FileCheck2 size={16} />
                          <span>View My Decision Report</span>
                        </button>
                      ) : null}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}