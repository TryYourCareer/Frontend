import React from "react";
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Info,
  BrainCircuit,
  Target
} from "lucide-react";
import DataProvenanceTag from "./DataProvenanceTag";

/**
 * Format automation risk into a clean badge label.
 */
function formatAutomationRisk(risk) {
  if (!risk) return "Evaluated";
  const upper = String(risk).toUpperCase();
  if (upper === "LOW" || upper === "LOW_RISK") return "Low Automation Risk";
  if (upper === "MODERATE" || upper === "MODERATE_RISK" || upper === "MEDIUM") return "Moderate Automation Exposure";
  if (upper === "HIGH" || upper === "HIGH_RISK") return "High Automation Exposure";
  return risk.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Get badge classes for automation risk safely.
 */
function getRiskBadgeClasses(risk) {
  const upper = String(risk || "").toUpperCase();
  if (upper.includes("LOW")) {
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
  if (upper.includes("MODERATE") || upper.includes("MEDIUM")) {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }
  if (upper.includes("HIGH")) {
    return "bg-rose-50 text-rose-800 border-rose-200";
  }
  return "bg-blue-50 text-blue-800 border-blue-200";
}

/**
 * Format exposure dynamics text, translating raw keywords/enums into clear narrative explanations.
 */
function formatExposureDynamics(exposure) {
  if (!exposure) return null;
  const str = String(exposure).trim();
  const lower = str.toLowerCase();
  if (lower === "medium" || lower === "moderate" || lower === "moderate_exposure") {
    return "Selective task automation is active across routine workflows, while domain synthesis and high-level creative decisions remain primarily human-driven.";
  }
  if (lower === "low" || lower === "low_exposure") {
    return "Task automation exposure is currently low, with workflows heavily relying on nuanced manual, contextual, and domain expertise.";
  }
  if (lower === "high" || lower === "high_exposure") {
    return "High automation exposure across standard operational workflows, with significant AI tool adoption in core task execution.";
  }
  return str;
}

export default function AIImpactSection({ aiImpact, realityCheck }) {
  if (!aiImpact) {
    return (
      <div className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          07 — AI Impact
        </h3>
        <p className="text-xs text-slate-400">
          AI impact and automation analysis is not currently available for this career.
        </p>
      </div>
    );
  }

  const {
    automation_risk,
    automation_exposure,
    human_skills = [],
    future_proof_score,
    long_term_status,
    today,
    near_term,
    long_term,
    sustainability_note,
    core_skills,
    provenance,
    caveats,
    limitations,
  } = aiImpact;

  // Resolve properties across flat projection and nested canonical intelligence
  const risk = automation_risk || today?.automation_risk;
  const exposure = automation_exposure || today?.automation_exposure;
  const score = future_proof_score !== undefined ? future_proof_score : aiImpact.future_proof_score;
  const skillsList = Array.isArray(human_skills) && human_skills.length > 0
    ? human_skills
    : Array.isArray(core_skills) && core_skills.length > 0
    ? core_skills
    : [];

  const developmentGaps = Array.isArray(realityCheck?.development_gaps) && realityCheck.development_gaps.length > 0
    ? realityCheck.development_gaps
    : Array.isArray(realityCheck?.areas_needing_development) && realityCheck.areas_needing_development.length > 0
    ? realityCheck.areas_needing_development
    : [];

  const nearTermAvailable = Boolean(
    near_term?.content &&
    typeof near_term.content === "string" &&
    near_term.content.trim().length > 0 &&
    near_term?.available !== false
  );
  const nearTermContent = nearTermAvailable ? near_term.content : null;

  const longTermAvailable = Boolean(
    long_term?.content &&
    typeof long_term.content === "string" &&
    long_term.content.trim().length > 0 &&
    (long_term_status === "AVAILABLE" || long_term?.available === true)
  );
  const longTermContent = longTermAvailable ? long_term.content : null;

  const hasSkills = skillsList.length > 0;
  const hasExposure = Boolean(exposure);
  const caveatText = limitations || caveats || null;

  return (
    <section
      aria-labelledby="ai-impact-heading"
      className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xs space-y-6"
      data-testid="ai-impact-section"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E88E5] border border-blue-200/70 flex items-center justify-center font-bold text-xs">
              07
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              07 — AI Impact
            </span>
          </div>
          <h2
            id="ai-impact-heading"
            className="text-xl sm:text-2xl font-black text-[#0b1a36] tracking-tight"
          >
            How AI Will Reshape This Career
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Evidence-based evaluation of task automation, technological augmentation, human capabilities, and horizon progression.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {risk && (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 ${getRiskBadgeClasses(
                risk
              )}`}
            >
              <ShieldCheck size={14} />
              <span>{formatAutomationRisk(risk)}</span>
            </div>
          )}
          <DataProvenanceTag status={provenance?.status || "verified"} />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Overview Inner Box                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Automation Exposure Profile
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#0b1a36]">
              {risk ? `${formatAutomationRisk(risk)} & Augmentation` : "Occupational AI Analysis"}
            </h3>
          </div>

          {score !== undefined && score !== null && (
            <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 flex items-center gap-3 shrink-0 shadow-2xs">
              <div className="space-y-0.5 text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Future-Proof Score
                </span>
                <span className="text-base sm:text-lg font-black text-[#0b1a36]">
                  {score}/100
                </span>
              </div>
            </div>
          )}
        </div>

        {sustainability_note && (
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-2 border-t border-slate-200/70">
            {sustainability_note}
          </p>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Connected Progression Timeline: Today → Near-term → Long-term    */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BrainCircuit size={16} className="text-[#1E88E5]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            AI Evolution Horizon & Impact Stages
          </h3>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-blue-200/80">
          {/* Stage 1: Today */}
          <div className="relative">
            <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-[#1E88E5] text-white flex items-center justify-center font-bold text-[11px] ring-4 ring-white shadow-2xs">
              1
            </div>
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0b1a36]">Today</span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md">
                    Current Landscape
                  </span>
                </div>
                {risk && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/70">
                    Status: {formatAutomationRisk(risk)}
                  </span>
                )}
              </div>
              {hasExposure ? (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {formatExposureDynamics(exposure)}
                </p>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">
                  No task-level AI exposure data is currently recorded for this career.
                </p>
              )}
            </div>
          </div>

          {/* Stage 2: Near-Term (1-3 Years) */}
          <div className="relative">
            <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[11px] ring-4 ring-white shadow-2xs">
              2
            </div>
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0b1a36]">Near-Term (1–3 Years)</span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md">
                    Emerging Augmentation
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${nearTermAvailable ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-200/80 text-slate-600"}`}>
                  {nearTermAvailable ? "Available" : "Not Yet Available"}
                </span>
              </div>
              {nearTermAvailable ? (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {nearTermContent}
                </p>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">
                  Specific near-term outlook has not been established yet.
                </p>
              )}
            </div>
          </div>

          {/* Stage 3: Long-Term (5-10 Years) */}
          <div className="relative">
            <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-[11px] ring-4 ring-white shadow-2xs">
              3
            </div>
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0b1a36]">Long-Term (5–10 Years)</span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md">
                    Future Structural Shift
                  </span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${longTermAvailable ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-200/80 text-slate-600"}`}>
                  {longTermAvailable ? "Available" : "Not Yet Available"}
                </span>
              </div>
              {longTermAvailable && longTermContent ? (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {longTermContent}
                </p>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">
                  Specific long-term outlook has not been established yet. Longer-range AI changes are inherently uncertain.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Human Skills Identified in AI Assessment                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#1E88E5]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Human Skills Identified in the AI Assessment ({skillsList.length})
          </h3>
        </div>

        {hasSkills ? (
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {skillsList.map((skill, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-start gap-2.5 hover:border-slate-300 transition"
                >
                  <div className="p-1 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 mt-0.5 border border-emerald-200/80">
                    <CheckCircle2 size={13} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#0b1a36] block">
                      {typeof skill === "string" ? skill : skill?.name || skill?.title || JSON.stringify(skill)}
                    </span>
                    {typeof skill === "object" && skill?.description && (
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {skill.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-500">
            Human-skill analysis is not currently available for this career.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Bridging to Reality Check Gaps                                  */}
      {/* ------------------------------------------------------------------ */}
      {developmentGaps.length > 0 && (
        <div
          data-testid="ai-reality-check-bridge"
          className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E88E5]">
              <Target size={15} />
              <span>Connects to your Reality Check</span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              AI Skill Synergy
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            AI tools automate and accelerate routine task execution, making human mastery in your identified growth areas (
            <span className="font-bold text-[#0b1a36]">
              {developmentGaps.map((g) => g.title || g.name || "Target Competency").join(", ")}
            </span>
            ) even more decisive. Strengthening these competencies ensures you leverage AI as a productivity amplifier rather than facing automation exposure.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. Provenance & Limitations                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <Info size={13} className="text-slate-400 shrink-0" />
          <span>
            {provenance && provenance.source
              ? `AI impact assessment based on ${provenance.source}`
              : "AI impact assessment based on occupational task research."}
          </span>
        </div>
        {caveatText && (
          <span className="italic text-[10px] text-slate-400">
            {caveatText}
          </span>
        )}
      </div>
    </section>
  );
}
