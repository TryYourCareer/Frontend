import { useState, useCallback, useEffect } from "react";
import {
  getTrialMissions,
  createMissionSession,
  getMissionSession,
  transitionSession,
  accessMissionResource,
  getWorkingNotes,
  saveWorkingNotes,
  getFindings,
  createFinding,
  completeInvestigation,
  submitDecision,
  generateConsequence,
  getRealityEvent,
  respondToRealityEvent,
  getOutput,
  saveOutput,
  reviewOutput,
  finaliseOutput,
  submitOutput,
  getReflection,
  saveReflection,
  submitReflection,
  getEvaluation,
  pauseSession,
  resumeSession,
  abandonSession,
} from "../services/trialMission";

export function useTrialMissionSession(initialSessionId = null) {
  const [missions, setMissions] = useState([]);
  const [session, setSession] = useState(null);
  const [workingNotes, setWorkingNotes] = useState("");
  const [findings, setFindings] = useState([]);
  const [currentDecision, setCurrentDecision] = useState(null);
  const [consequenceData, setConsequenceData] = useState(null);
  const [realityEventData, setRealityEventData] = useState(null);
  const [outputData, setOutputData] = useState(null);
  const [reflectionData, setReflectionData] = useState(null);
  const [evaluationData, setEvaluationData] = useState(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [evaluationError, setEvaluationError] = useState(null);
  const [accessedResourceIds, setAccessedResourceIds] = useState(new Set());
  const [activeResource, setActiveResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrialMissions();
      setMissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load mission catalog.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWorkspaceData = useCallback(async (sessionId) => {
    if (!sessionId) return;
    setWorkspaceLoading(true);
    try {
      const [notesRes, findingsRes] = await Promise.allSettled([
        getWorkingNotes(sessionId),
        getFindings(sessionId),
      ]);

      if (notesRes.status === "fulfilled" && notesRes.value) {
        setWorkingNotes(notesRes.value.content || notesRes.value.working_notes || "");
      }
      if (findingsRes.status === "fulfilled" && Array.isArray(findingsRes.value)) {
        setFindings(findingsRes.value);
      }
    } catch (err) {
      console.error("Failed loading workspace data:", err);
    } finally {
      setWorkspaceLoading(false);
    }
  }, []);

  const handleLoadOutput = useCallback(async (sessionId) => {
    const sId = sessionId || session?.id;
    if (!sId) return;
    try {
      const data = await getOutput(sId);
      if (data) {
        setOutputData(data);
      }
      return data;
    } catch (err) {
      console.error("Failed to load output:", err);
    }
  }, [session?.id]);

  const handleLoadReflection = useCallback(async (sessionId) => {
    const sId = sessionId || session?.id;
    if (!sId) return;
    try {
      const data = await getReflection(sId);
      if (data) {
        setReflectionData(data);
      }
      return data;
    } catch (err) {
      console.error("Failed to load reflection:", err);
    }
  }, [session?.id]);

  const handleLoadEvaluation = useCallback(async (sessionId) => {
    const sId = sessionId || session?.id;
    if (!sId) return;
    setEvaluationLoading(true);
    setEvaluationError(null);
    try {
      const data = await getEvaluation(sId);
      if (data) {
        setEvaluationData(data);
      }
      return data;
    } catch (err) {
      console.error("Failed to load evaluation:", err);
      setEvaluationError(err?.message || "Failed to load evaluation.");
    } finally {
      setEvaluationLoading(false);
    }
  }, [session?.id]);

  const loadSession = useCallback(async (sessionId) => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMissionSession(sessionId);
      setSession(data);
      if (data?.current_phase === "investigate" || data?.current_phase === "investigation") {
        await loadWorkspaceData(sessionId);
      } else if (data?.current_phase === "deliver" || data?.current_phase === "output" || data?.current_phase === "memo") {
        await handleLoadOutput(sessionId);
      } else if (data?.current_phase === "reflect" || data?.current_phase === "reflection" || data?.state === "REFLECTION_ACTIVE") {
        await handleLoadReflection(sessionId);
      } else if (data?.state === "SESSION_COMPLETED" || data?.state === "COMPLETED") {
        await handleLoadEvaluation(sessionId);
      }
    } catch (err) {
      setError(err?.message || "Failed to load mission session.");
    } finally {
      setLoading(false);
    }
  }, [loadWorkspaceData, handleLoadOutput, handleLoadReflection, handleLoadEvaluation]);

  const startSession = useCallback(async (missionId) => {
    if (!missionId) return;
    setActionLoading(true);
    setError(null);
    try {
      const data = await createMissionSession(missionId);
      setSession(data);
      return data;
    } catch (err) {
      setError(err?.message || "Failed to create mission session.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const handleTransition = useCallback(async (actionOrState) => {
    if (!session?.id) return;
    setActionLoading(true);
    setError(null);
    try {
      let target = actionOrState;
      if (typeof target === "string" && target.startsWith("transition:")) {
        target = target.replace("transition:", "");
      }
      const payload = typeof target === "string" ? { target_state: target } : target;
      const updated = await transitionSession(session.id, payload);
      setSession(updated);
      if (updated?.current_phase === "investigate" || updated?.current_phase === "investigation") {
        await loadWorkspaceData(session.id);
      }
      return updated;
    } catch (err) {
      setError(err?.message || "Failed to transition mission stage.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [session?.id, loadWorkspaceData]);

  const handleAccessResource = useCallback(async (resourceId) => {
    if (!session?.id || !resourceId) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await accessMissionResource(session.id, resourceId);
      setAccessedResourceIds((prev) => new Set([...prev, resourceId]));
      setActiveResource(res);
      return res;
    } catch (err) {
      setError(err?.message || "Failed to access mission resource.");
    } finally {
      setActionLoading(false);
    }
  }, [session?.id]);

  const handleSaveNotes = useCallback(async (content) => {
    if (!session?.id) return;
    const res = await saveWorkingNotes(session.id, content);
    setWorkingNotes(content);
    return res;
  }, [session?.id]);

  const handleAddFinding = useCallback(async (payload) => {
    if (!session?.id) return;
    setActionLoading(true);
    setError(null);
    try {
      const newFinding = await createFinding(session.id, payload);
      setFindings((prev) => [...prev, newFinding]);
      return newFinding;
    } catch (err) {
      setError(err?.message || "Failed to save finding.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [session?.id]);

  const handleCompleteInvestigation = useCallback(async () => {
    if (!session?.id) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await completeInvestigation(session.id);
      setSession(updated);
      return updated;
    } catch (err) {
      setError(err?.message || "Failed to complete investigation.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [session?.id]);

  const handleSubmitDecision = useCallback(async (payload) => {
    if (!session?.id) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await submitDecision(session.id, payload);
      if (res?.session) {
        setSession(res.session);
      }
      if (res?.decision) {
        setCurrentDecision(res.decision);
      }
      return res;
    } catch (err) {
      setError(err?.message || "Failed to submit recommendation.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [session?.id]);

  const handleGenerateConsequence = useCallback(async () => {
    if (!session?.id) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await generateConsequence(session.id);
      setConsequenceData(res);
      if (res?.session) {
        setSession(res.session);
      }
      return res;
    } catch (err) {
      setError(err?.message || "Failed to generate consequence.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [session?.id]);

  const handleFetchRealityEvent = useCallback(async () => {
    if (!session?.id) return;
    try {
      const res = await getRealityEvent(session.id);
      setRealityEventData(res);
      return res;
    } catch (err) {
      console.error("Failed to get reality event:", err);
    }
  }, [session?.id]);

  const handleRealityEventResponse = useCallback(async (payload) => {
    if (!session?.id) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await respondToRealityEvent(session.id, payload);
      if (res?.session) {
        setSession(res.session);
        if (res.session.current_phase === "deliver" || res.session.current_phase === "output" || res.session.current_phase === "memo") {
          await handleLoadOutput(session.id);
        }
      }
      if (res?.decision) {
        setCurrentDecision(res.decision);
      }
      return res;
    } catch (err) {
      setError(err?.message || "Failed to respond to reality event.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [session?.id, handleLoadOutput]);

  const handleSaveOutput = useCallback(async (payload) => {
    if (!session?.id) return;
    try {
      const res = await saveOutput(session.id, payload);
      if (res) {
        setOutputData(res);
      }
      return res;
    } catch (err) {
      console.error("Failed to save output draft:", err);
      throw err;
    }
  }, [session?.id]);

  const handleReviewOutput = useCallback(async () => {
    if (!session?.id) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await reviewOutput(session.id);
      if (res) {
        setOutputData(res);
      }
      return res;
    } catch (err) {
      setError(err?.message || "Failed to review output.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [session?.id]);

  const handleFinaliseOutput = useCallback(async () => {
    if (!session?.id) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await finaliseOutput(session.id);
      if (res) {
        setOutputData(res);
      }
      return res;
    } catch (err) {
      setError(err?.message || "Failed to finalise output.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [session?.id]);

  const handleSubmitOutput = useCallback(async () => {
    if (!session?.id) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await submitOutput(session.id);
      if (res?.session) {
        setSession(res.session);
        if (res.session.current_phase === "reflect" || res.session.current_phase === "reflection" || res.session.state === "REFLECTION_ACTIVE") {
          await handleLoadReflection(session.id);
        }
      }
      if (res?.output) {
        setOutputData(res.output);
      }
      return res;
    } catch (err) {
      setError(err?.message || "Failed to submit output.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [session?.id, handleLoadReflection]);

  const handleSaveReflection = useCallback(async (payload) => {
    if (!session?.id) return;
    try {
      const res = await saveReflection(session.id, payload);
      if (res) {
        setReflectionData(res);
      }
      return res;
    } catch (err) {
      console.error("Failed to save reflection draft:", err);
      throw err;
    }
  }, [session?.id]);

  const handleSubmitReflection = useCallback(async (payload) => {
    if (!session?.id) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await submitReflection(session.id, payload);
      if (res?.session) {
        setSession(res.session);
      }
      if (res?.reflection) {
        setReflectionData(res.reflection);
      }
      if (res?.evaluation) {
        setEvaluationData(res.evaluation);
      } else if (res?.session?.state === "SESSION_COMPLETED" || res?.session?.state === "COMPLETED") {
        await handleLoadEvaluation(session.id);
      }
      return res;
    } catch (err) {
      setError(err?.message || "Failed to submit reflection.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [session?.id, handleLoadEvaluation]);

  const handlePause = useCallback(async () => {
    if (!session?.id) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await pauseSession(session.id);
      setSession(updated);
    } catch (err) {
      setError(err?.message || "Failed to pause session.");
    } finally {
      setActionLoading(false);
    }
  }, [session?.id]);

  const handleResume = useCallback(async () => {
    if (!session?.id) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await resumeSession(session.id);
      setSession(updated);
    } catch (err) {
      setError(err?.message || "Failed to resume session.");
    } finally {
      setActionLoading(false);
    }
  }, [session?.id]);

  const handleAbandon = useCallback(async () => {
    if (!session?.id) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await abandonSession(session.id);
      setSession(updated);
    } catch (err) {
      setError(err?.message || "Failed to abandon session.");
    } finally {
      setActionLoading(false);
    }
  }, [session?.id]);

  const resetToCatalog = useCallback(() => {
    setSession(null);
    setWorkingNotes("");
    setFindings([]);
    setCurrentDecision(null);
    setConsequenceData(null);
    setRealityEventData(null);
    setOutputData(null);
    setReflectionData(null);
    setEvaluationData(null);
    setEvaluationLoading(false);
    setEvaluationError(null);
    setAccessedResourceIds(new Set());
    setActiveResource(null);
    setError(null);
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (initialSessionId) {
      loadSession(initialSessionId);
    } else {
      loadCatalog();
    }
  }, [initialSessionId, loadSession, loadCatalog]);

  return {
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
    handleLoadOutput,
    handleSaveOutput,
    handleReviewOutput,
    handleFinaliseOutput,
    handleSubmitOutput,
    handleLoadReflection,
    handleSaveReflection,
    handleSubmitReflection,
    handleLoadEvaluation,
    loadSession,
    loadCatalog,
    handlePause,
    handleResume,
    handleAbandon,
    resetToCatalog,
    setError,
  };
}

export default useTrialMissionSession;
