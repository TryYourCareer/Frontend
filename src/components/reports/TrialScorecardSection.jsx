import React from "react";
import {
  Award,
  Clock,
  ListChecks,
  Activity,
  Sparkles,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

/**
 * Format duration in seconds to clean human-readable minutes and seconds.
 */
function formatDuration(seconds) {
  if (!seconds || typeof seconds !== "number" || seconds <= 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins} min${mins > 1 ? "s" : ""}`;
  return `${mins}m ${secs}s`;
}

/**
 * Format mission execution state for UI badges.
 */
function formatMissionState(state) {
  if (!state) return "Completed";
  const norm = String(state).toUpperCase();
  if (norm === "SESSION_COMPLETED" || norm === "COMPLETED") return "Completed";
  if (norm === "IN_PROGRESS" || norm === "ACTIVE") return "In Progress";
  if (norm === "TRIAL_MISSION_COMPLETE_BUT_INSUFFICIENT_EVIDENCE") return "Submitted (Pending Analysis)";
  return state.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Format numbers with correct English ordinal suffix (1st, 2nd, 3rd, 82nd, etc.)
 */
function formatOrdinal(num) {
  if (num === null || num === undefined || isNaN(Number(num))) return null;
  const n = Math.round(Number(num));
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) {
    return `${n}th`;
  }
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export default function TrialScorecardSection({ trialScorecard }) {
  if (!trialScorecard) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-xs">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          05 — Trial Mission Scorecard
        </h3>
        <p className="text-xs text-slate-400">
          Complete the Trial Mission to see your evidence scorecard.
        </p>
      </div>
    );
  }

  const {
    mission_title,
    mission_state,
    duration_seconds,
    findings_count = 0,
    decisions_count = 0,
    deliverable_output,
    evaluated_competencies = {},
    trial_strengths = [],
    findings = [],
    decisions = [],
    percentile,
    uncertainty_classification,
  } = trialScorecard;

  // Normalized evaluated competencies list
  const compEntries = evaluated_competencies && typeof evaluated_competencies === "object"
    ? (Array.isArray(evaluated_competencies)
        ? evaluated_competencies
        : Object.entries(evaluated_competencies).map(([key, val]) => {
            if (val && typeof val === "object") {
              return { key, ...val };
            }
            return { key, title: key.replace(/_/g, " "), evaluated_level: val };
          }))
    : [];

  const formattedDuration = formatDuration(duration_seconds);
  const isLimitedEvidence = mission_state === "TRIAL_MISSION_COMPLETE_BUT_INSUFFICIENT_EVIDENCE" || uncertainty_classification === "HIGH";

  const hasFindings = Array.isArray(findings) && findings.length > 0;
  const hasDecisions = Array.isArray(decisions) && decisions.length > 0;
  const hasTrialStrengths = Array.isArray(trial_strengths) && trial_strengths.length > 0;
  const hasDeliverable = deliverable_output && typeof deliverable_output === "object" && Object.keys(deliverable_output).length > 0;

  const rawScore = typeof trialScorecard.score === "number"
    ? trialScorecard.score
    : typeof trialScorecard.overall_score === "number"
    ? trialScorecard.overall_score
    : null;
  const displayScore = rawScore !== null
    ? (rawScore <= 1.0 && rawScore > 0 ? Math.round(rawScore * 100) : Math.round(rawScore))
    : null;

  return (
    <section
      aria-labelledby="trial-scorecard-heading"
      className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 space-y-6 shadow-xs"
      data-testid="trial-scorecard-section"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Section Header                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E88E5] border border-blue-200/70 flex items-center justify-center font-bold text-xs">
              05
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              05 — Trial Scorecard
            </span>
          </div>
          <h2
            id="trial-scorecard-heading"
            className="text-xl sm:text-2xl font-black text-[#0b1a36] tracking-tight"
          >
            Trial Mission Scorecard
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Observable telemetry, demonstrated competencies, recorded findings, and simulation execution from your hands-on Trial Mission.
          </p>
        </div>

        {mission_state && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shrink-0">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>{formatMissionState(mission_state)}</span>
          </div>
        )}
      </div>

      {/* Limited Evidence Notice */}
      {isLimitedEvidence && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-blue-950">
          <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold">Limited Telemetry Recorded</h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              Trial Mission completed, but the available evidence is limited. Additional simulations will provide more comprehensive telemetry.
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 1. Overall Performance Inner Box                                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {displayScore !== null ? (
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#1E88E5"
                    strokeWidth="3.5"
                    strokeDasharray={88}
                    strokeDashoffset={88 - (88 * Math.min(100, Math.max(0, displayScore))) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out motion-reduce:transition-none"
                  />
                </svg>
                <span className="absolute text-sm font-black text-[#0b1a36]">
                  {displayScore}%
                </span>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/70 text-[#1E88E5] flex items-center justify-center shrink-0 font-black text-sm">
                <Award size={26} />
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Evaluated Simulation
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#0b1a36]">
                {mission_title || "Career Simulation Mission"}
              </h3>
              <p className="text-xs text-slate-600 leading-snug">
                Overall performance calculated across observed decisions and technical findings.
              </p>
            </div>
          </div>
        </div>

        {/* Telemetry Summary Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-200/80">
          <div className="bg-white border border-slate-200/70 rounded-xl p-3 space-y-0.5">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
              <Clock size={13} className="text-[#1E88E5]" />
              <span>Active Duration</span>
            </div>
            <p className="text-sm font-bold text-[#0b1a36]">
              {formattedDuration || "Recorded"}
            </p>
          </div>

          <div className="bg-white border border-slate-200/70 rounded-xl p-3 space-y-0.5">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
              <ListChecks size={13} className="text-[#1E88E5]" />
              <span>Findings</span>
            </div>
            <p className="text-sm font-bold text-[#0b1a36]">
              {findings_count || (hasFindings ? findings.length : 0)} Recorded
            </p>
          </div>

          <div className="bg-white border border-slate-200/70 rounded-xl p-3 space-y-0.5">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
              <Activity size={13} className="text-[#1E88E5]" />
              <span>Decisions</span>
            </div>
            <p className="text-sm font-bold text-[#0b1a36]">
              {decisions_count || (hasDecisions ? decisions.length : 0)} Executed
            </p>
          </div>

          <div className="bg-white border border-slate-200/70 rounded-xl p-3 space-y-0.5">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
              <Sparkles size={13} className="text-[#1E88E5]" />
              <span>Competencies</span>
            </div>
            <p className="text-sm font-bold text-[#0b1a36]">
              {compEntries.length} Evaluated
            </p>
          </div>
        </div>

        {/* Cohort Benchmark Indicator */}
        <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-600 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-[#1E88E5]" />
            Cohort Benchmark:
          </span>
          <span className="text-slate-700 font-medium" data-testid="cohort-percentile-display">
            {percentile !== null && percentile !== undefined && typeof percentile === "number"
              ? `${formatOrdinal(percentile)} Percentile`
              : "Cohort percentile calculation pending baseline dataset"}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Evaluated Competencies List/Rows                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Award size={15} className="text-[#1E88E5]" />
            Demonstrated Competencies ({compEntries.length})
          </h3>
          {compEntries.length > 0 && (
            <span className="text-xs text-slate-400 font-medium">
              Observable telemetry from simulation
            </span>
          )}
        </div>

        {compEntries.length > 0 ? (
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl divide-y divide-slate-200/60 overflow-hidden">
            {compEntries.map((comp, idx) => {
              const title = comp?.title || comp?.name || "Demonstrated Competency";
              const level = comp?.evaluated_level !== undefined && comp?.evaluated_level !== null
                ? comp.evaluated_level
                : comp?.level !== undefined && comp?.level !== null
                ? comp.level
                : null;
              const evidenceCount = comp?.contributing_evidence_count || comp?.evidence_count;
              const rationale = comp?.rationale;
              const compEvidence = Array.isArray(comp?.evidence) ? comp.evidence : [];

              return (
                <div
                  key={idx}
                  className="p-4 sm:p-5 space-y-2 hover:bg-white transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-[#0b1a36] leading-snug">
                      {title}
                    </h4>
                    {level !== null && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E88E5] border border-blue-200 text-xs font-bold shrink-0 self-start sm:self-auto">
                        Level {typeof level === "number" ? level.toFixed(1) : level}
                      </span>
                    )}
                  </div>

                  {rationale && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rationale}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between pt-1 text-[11px] text-slate-400 gap-2">
                    {evidenceCount !== undefined ? (
                      <span>{evidenceCount} contributing evidence signals recorded</span>
                    ) : (
                      <span>Rubric Evaluated</span>
                    )}
                    {compEvidence.length > 0 && (
                      <div className="flex flex-wrap gap-1 text-[10px] text-slate-500">
                        {compEvidence.map((evItem, evIdx) => (
                          <span key={evIdx} className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                            {typeof evItem === "string" ? evItem : JSON.stringify(evItem)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500">
            No competency evidence is available yet.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Demonstrated Trial Strengths                                     */}
      {/* ------------------------------------------------------------------ */}
      {hasTrialStrengths && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Sparkles size={15} className="text-[#1E88E5]" />
            Demonstrated Simulation Strengths
          </h3>

          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-2.5">
            {trial_strengths.map((str, idx) => {
              const title = typeof str === "string" ? str : (str?.title || str?.name || JSON.stringify(str));
              const rationale = str?.rationale || str?.description;

              return (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-xl bg-white border border-emerald-200/60 shadow-2xs"
                >
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                      {title}
                    </h4>
                    {rationale && (
                      <p className="text-xs text-emerald-900/80 leading-relaxed">
                        {rationale}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. Recorded Observations & Findings                                 */}
      {/* ------------------------------------------------------------------ */}
      {hasFindings && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <ListChecks size={15} className="text-[#1E88E5]" />
            Recorded Findings ({findings.length})
          </h3>

          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl divide-y divide-slate-200/60 overflow-hidden">
            {findings.map((f, idx) => {
              const title = f?.title || `Finding ${idx + 1}`;
              const desc = f?.description || f?.statement || f?.content;
              const imp = f?.implication;

              return (
                <div key={idx} className="p-4 space-y-1 hover:bg-white transition">
                  <h4 className="text-xs font-bold text-[#0b1a36]">
                    {title}
                  </h4>
                  {desc && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {desc}
                    </p>
                  )}
                  {imp && (
                    <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                      {imp}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. Executed Decisions                                              */}
      {/* ------------------------------------------------------------------ */}
      {hasDecisions && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Activity size={15} className="text-[#1E88E5]" />
            Simulation Decisions ({decisions.length})
          </h3>

          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl divide-y divide-slate-200/60 overflow-hidden">
            {decisions.map((d, idx) => {
              const dType = d?.decision_type || d?.title || `Decision ${idx + 1}`;
              const dChoice = d?.choice || d?.decision;
              const dRationale = d?.rationale;

              return (
                <div key={idx} className="p-4 space-y-1.5 hover:bg-white transition">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#0b1a36]">
                      {dType.replace(/_/g, " ")}
                    </h4>
                    {dChoice && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-[#1E88E5] border border-blue-200">
                        {dChoice}
                      </span>
                    )}
                  </div>
                  {dRationale && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {dRationale}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 6. Deliverable Output                                              */}
      {/* ------------------------------------------------------------------ */}
      {hasDeliverable && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <FileCheck2 size={15} className="text-[#1E88E5]" />
            Simulation Deliverable Output
          </h3>

          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-5 space-y-2">
            {deliverable_output.title && (
              <h4 className="text-sm font-bold text-[#0b1a36]">
                {deliverable_output.title}
              </h4>
            )}
            {deliverable_output.summary && (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {deliverable_output.summary}
              </p>
            )}
            {deliverable_output.status && (
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-600 border-t border-slate-200/60">
                <span className="font-semibold">Deliverable Status:</span>
                <span className="font-bold text-[#1E88E5]">{deliverable_output.status}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
