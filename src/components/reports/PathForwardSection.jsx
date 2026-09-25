import React, { useState, useEffect } from "react";
import {
  Compass,
  GraduationCap,
  BookOpen,
  Clock,
  Layers,
  Info,
  Check,
  CheckCircle2,
  Award,
  GitFork,
  DollarSign
} from "lucide-react";
import { loadChecklistState, saveChecklistState } from "../../utils/checklistStorage";

function formatCategory(category) {
  if (!category) return null;
  const map = {
    EXPLORATION: "Exploration",
    SKILL_DEVELOPMENT: "Skill Development",
    FOUNDATIONAL_SKILL: "Foundational Skill",
    COURSE_PROJECT: "Course / Project",
    PRACTICE_PROJECTS: "Practice & Projects",
    COMPETENCY_BUILDING: "Competency Building",
    ORIENTATION: "Orientation",
  };
  if (map[category]) return map[category];
  return String(category)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Format stream feasibility status into clean badges and labels.
 */
function getFeasibilityInfo(feasibility, studentStream) {
  const norm = String(feasibility || "").toUpperCase();
  if (norm === "ELIGIBLE" || norm === "DIRECT") {
    return {
      label: "Directly Eligible",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    };
  }
  if (norm === "BRIDGE_REQUIRED" || norm === "BRIDGE") {
    return {
      label: "Bridge Required • Cross-Disciplinary Route",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }
  if (norm === "DIFFERENT_STREAM" || norm === "LATERAL_ENTRY") {
    return {
      label: "Different Stream • Lateral Transition Pathway",
      badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    };
  }
  if (studentStream) {
    return {
      label: "Cross-Stream Pathway Available",
      badgeClass: "bg-blue-50 text-[#1E88E5] border-blue-200",
    };
  }
  return {
    label: "Pathway Information Available",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  };
}

/**
 * Format cost estimate values cleanly, handling strings, JSON strings, and structured objects.
 */
function formatCostEstimate(cost) {
  if (!cost) return null;
  let parsed = cost;
  if (typeof cost === "string") {
    const trimmed = cost.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    } else {
      return trimmed;
    }
  }

  if (typeof parsed === "object" && parsed !== null) {
    const parts = [];
    if (parsed.govt || parsed.government || parsed.public) {
      parts.push(`Govt / Public: ${parsed.govt || parsed.government || parsed.public}`);
    }
    if (parsed.private) {
      parts.push(`Private: ${parsed.private}`);
    }
    if (parsed.min !== undefined && parsed.max !== undefined) {
      parts.push(`${parsed.min} – ${parsed.max} ${parsed.currency || ""}`.trim());
    }
    if (parts.length > 0) {
      return parts.join(" • ");
    }
    const generalEntries = Object.entries(parsed)
      .filter(([k, v]) => v !== null && v !== undefined && k !== "currency")
      .map(([k, v]) => `${k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}: ${v}`);
    if (generalEntries.length > 0) {
      return generalEntries.join(" • ");
    }
  }

  return String(cost);
}

export default function PathForwardSection({ pathForward, actionPlan, careerId, userId }) {
  const [completedMap, setCompletedMap] = useState(() => loadChecklistState(userId, careerId));

  useEffect(() => {
    setCompletedMap(loadChecklistState(userId, careerId));
  }, [userId, careerId]);

  const toggleStep = (stepKey) => {
    setCompletedMap((prev) => {
      const next = { ...prev, [stepKey]: !prev[stepKey] };
      saveChecklistState(userId, careerId, next);
      return next;
    });
  };

  if (!pathForward && !actionPlan) {
    return (
      <section className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-xs" data-testid="path-forward-empty">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          08 — Path Forward
        </h3>
        <p className="text-xs text-slate-400">
          Pathway guidance and action steps are not currently available for this career.
        </p>
      </section>
    );
  }

  // 1. Extract Academic & Stream Feasibility
  const stream_feasibility = pathForward?.stream_feasibility || "UNKNOWN";
  const student_stream = pathForward?.student_stream;
  const required_streams = Array.isArray(pathForward?.required_streams) ? pathForward.required_streams : [];
  const degrees = Array.isArray(pathForward?.degrees) ? pathForward.degrees : [];
  const exams = Array.isArray(pathForward?.exams) ? pathForward.exams : [];
  const duration = pathForward?.duration;
  const cost_estimate = pathForward?.cost_estimate;
  const alternative_pathways = Array.isArray(pathForward?.alternative_pathways) ? pathForward.alternative_pathways : [];
  const certifications = Array.isArray(pathForward?.certifications) ? pathForward.certifications : [];
  const guidance = pathForward?.guidance;

  const hasRequiredStreams = required_streams.length > 0;
  const hasDegrees = degrees.length > 0;
  const hasExamsOrCerts = exams.length > 0 || certifications.length > 0;
  const hasAlternativePathways = alternative_pathways.length > 0;
  const hasDuration = Boolean(duration);
  const hasCost = Boolean(cost_estimate && typeof cost_estimate === "object" && Object.keys(cost_estimate).length > 0);

  // Feasibility status badge
  let feasibilityLabel = "Pathway Status Unknown";
  if (stream_feasibility === "ELIGIBLE") {
    feasibilityLabel = "Eligible";
  } else if (stream_feasibility === "BRIDGE_REQUIRED") {
    feasibilityLabel = "Bridge Required";
  } else if (stream_feasibility === "DIFFERENT_STREAM") {
    feasibilityLabel = "Different Stream";
  }

  // 2. Extract Recommended Next Steps (Action Plan)
  const ordered_steps = Array.isArray(actionPlan?.ordered_steps)
    ? actionPlan.ordered_steps
    : Array.isArray(actionPlan)
    ? actionPlan
    : [];

  const hasSteps = ordered_steps.length > 0;
  const completedCount = hasSteps
    ? ordered_steps.filter((s, idx) => {
        const key = s.id || s.title || `step_${idx}`;
        return Boolean(completedMap[key]);
      }).length
    : 0;

  return (
    <section
      aria-labelledby="path-forward-heading"
      className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8"
      data-testid="path-forward-section"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E88E5] border border-blue-200 text-xs font-bold uppercase tracking-wider">
            <Compass size={13} />
            <span>08 — Path Forward</span>
          </div>
          <h2
            id="path-forward-heading"
            className="text-xl sm:text-2xl font-black text-[#0b1a36] tracking-tight"
          >
            Your Path Forward
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Educational prerequisites, stream feasibility analysis, and an evidence-backed sequential developmental action plan.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-400">
          Academic Feasibility &amp; Next Steps
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Pathway Feasibility & Educational Requirements                   */}
      {/* ------------------------------------------------------------------ */}
      {pathForward ? (
        <div className="bg-gradient-to-br from-[#F0F6FC] to-[#e8f1fa] border border-[#D3E3F5] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Academic &amp; Stream Feasibility
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#0b1a36]">
                Pathway Status: {feasibilityLabel}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {student_stream && (
                <div className="bg-white/90 border border-[#D3E3F5] rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium">
                  <span className="text-slate-400 text-[11px] mr-1">Your Stream:</span>
                  <span className="font-bold text-[#0b1a36]">{student_stream}</span>
                </div>
              )}
            </div>
          </div>

          {guidance && (
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-2 border-t border-[#D3E3F5]/80">
              {guidance}
            </p>
          )}

          {/* Required Streams & Degrees */}
          {(hasRequiredStreams || hasDegrees) && (
            <div className="pt-2 grid gap-3 sm:grid-cols-2">
              {hasRequiredStreams && (
                <div className="p-3.5 bg-white/80 rounded-xl border border-[#D3E3F5] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                    <BookOpen size={12} className="text-[#1E88E5]" />
                    Eligible Academic Streams
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {required_streams.map((stream, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1E88E5] border border-blue-200 text-xs font-semibold"
                      >
                        {stream}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hasDegrees && (
                <div className="p-3.5 bg-white/80 rounded-xl border border-[#D3E3F5] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                    <GraduationCap size={12} className="text-[#1E88E5]" />
                    Relevant Degree Pathways
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {degrees.map((degree, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold"
                      >
                        {typeof degree === "string" ? degree : (degree?.name || degree?.title || JSON.stringify(degree))}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Entrance Exams, Certifications & Duration (Section 8 Requirement) */}
          {(hasExamsOrCerts || hasDuration || hasCost) && (
            <div className="pt-2 grid gap-3 sm:grid-cols-2">
              {hasExamsOrCerts && (
                <div className="p-3.5 bg-white/80 rounded-xl border border-[#D3E3F5] space-y-1.5" data-testid="exams-certs-container">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                    <Award size={12} className="text-[#1E88E5]" />
                    Entrance Exams &amp; Key Certifications
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {exams.map((exam, idx) => (
                      <span
                        key={`exam-${idx}`}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold"
                      >
                        {exam}
                      </span>
                    ))}
                    {certifications.map((cert, idx) => (
                      <span
                        key={`cert-${idx}`}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hasDuration && (
                <div className="p-3.5 bg-white/80 rounded-xl border border-[#D3E3F5] space-y-1.5" data-testid="duration-container">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                    <Clock size={12} className="text-[#1E88E5]" />
                    Typical Duration / Timeline
                  </span>
                  <p className="text-xs font-bold text-[#0b1a36]">
                    {duration}
                  </p>
                </div>
              )}

              {hasCost && (
                <div className="p-3.5 bg-white/80 rounded-xl border border-[#D3E3F5] space-y-1.5" data-testid="cost-container">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                    <DollarSign size={12} className="text-[#1E88E5]" />
                    Estimated Tuition &amp; Program Cost
                  </span>
                  <div className="text-xs font-semibold text-slate-700">
                    {formatCostEstimate(cost_estimate)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Alternative & Lateral Entry Pathways */}
          {hasAlternativePathways && (
            <div className="pt-2 p-3.5 bg-white/80 rounded-xl border border-[#D3E3F5] space-y-1.5" data-testid="alternative-pathways-container">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                <GitFork size={12} className="text-[#1E88E5]" />
                Alternative &amp; Lateral Entry Routes
              </span>
              <ul className="space-y-1 text-xs text-slate-700">
                {alternative_pathways.map((route, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#1E88E5] font-bold">•</span>
                    <span>{route}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500">
          Pathway feasibility information is not currently available for this career.
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. Ordered Next Steps & Actions (Persistent Checklist)              */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-4" data-testid="action-checklist-container">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#1E88E5]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Recommended Next Steps {hasSteps ? `(${ordered_steps.length})` : ""}
            </h3>
          </div>
          {hasSteps && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                {completedCount} of {ordered_steps.length} completed
              </span>
            </div>
          )}
        </div>

        {hasSteps ? (
          <div className="space-y-3" role="list">
            {ordered_steps.map((step, idx) => {
              const title = step.title || step.growth_action || step.action || "Recommended Action Step";
              const category = formatCategory(step.category || step.phase);
              const rationale = step.rationale || step.description;
              const source = step.source;
              const timeframe = step.timeframe;
              const stepKey = step.id || step.title || `step_${idx}`;
              const isCompleted = Boolean(completedMap[stepKey]);

              return (
                <div
                  key={stepKey}
                  role="listitem"
                  className={`border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3.5 transition-all shadow-2xs ${
                    isCompleted
                      ? "bg-emerald-50/40 border-emerald-200"
                      : "bg-[#F8FAFC] border-slate-200 hover:bg-white hover:border-[#D3E3F5]"
                  }`}
                  data-testid="action-checklist-item"
                >
                  {/* Interactive Checkbox Control */}
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isCompleted}
                    aria-label={`Mark "${title}" as ${isCompleted ? "incomplete" : "complete"}`}
                    onClick={() => toggleStep(stepKey)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5 transition cursor-pointer ${
                      isCompleted
                        ? "bg-emerald-600 text-white shadow-xs border border-emerald-700"
                        : "bg-blue-50 text-[#1E88E5] border border-blue-200 hover:bg-blue-100"
                    }`}
                    data-testid={`checklist-toggle-${idx}`}
                  >
                    {isCompleted ? <Check size={14} strokeWidth={3} /> : idx + 1}
                  </button>

                  {/* Step Content */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs sm:text-sm font-bold transition-all ${
                          isCompleted ? "text-slate-500 line-through" : "text-[#0b1a36]"
                        }`}
                      >
                        {title}
                      </span>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                          <CheckCircle2 size={10} />
                          Completed
                        </span>
                      )}
                      {category && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
                          {category}
                        </span>
                      )}
                      {timeframe && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1E88E5] border border-blue-200 text-[10px] font-semibold inline-flex items-center gap-1">
                          <Clock size={10} />
                          {timeframe}
                        </span>
                      )}
                    </div>

                    {rationale && (
                      <p className={`text-xs leading-relaxed font-normal ${isCompleted ? "text-slate-400" : "text-slate-600"}`}>
                        {rationale}
                      </p>
                    )}

                    {source && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                        <span>Source:</span>
                        <span className="font-medium text-slate-500">{source}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500">
            No specific next steps are currently recorded for this career.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Evidence Notice                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <Info size={13} className="shrink-0 text-slate-400" />
        <span>
          Action steps are synthesized from your discovery responses, career competencies, and trial performance evidence.
        </span>
      </div>
    </section>
  );
}
