import React from "react";
import {
  Bot,
  Shield,
  Sparkles,
  Info,
  UserCheck
} from "lucide-react";

/**
 * Format AI risk level into clean human-readable text and badge styles.
 */
function formatRiskLevel(level) {
  if (!level) return { label: "Not Classified", classes: "bg-slate-100 text-slate-700 border-slate-200" };
  const upper = String(level).toUpperCase();
  if (upper === "LOW") {
    return { label: "Low Automation Risk", classes: "bg-emerald-50 text-emerald-800 border-emerald-200" };
  }
  if (upper === "MODERATE" || upper === "MEDIUM") {
    return { label: "Moderate Automation Risk", classes: "bg-amber-50 text-amber-800 border-amber-200" };
  }
  if (upper === "HIGH") {
    return { label: "High Automation Risk", classes: "bg-rose-50 text-rose-800 border-rose-200" };
  }
  return {
    label: String(level).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    classes: "bg-slate-100 text-slate-700 border-slate-200",
  };
}

export default function ParentAIPreparednessSection({ aiPreparedness }) {
  if (!aiPreparedness) {
    return (
      <div className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          04 — AI Preparedness
        </h3>
        <p className="text-xs text-slate-400">
          AI impact information is not currently available in the parent report.
        </p>
      </div>
    );
  }

  const {
    ai_risk_level = null,
    future_proof_score = null,
    human_skills = [],
    plain_language_guidance = null,
  } = aiPreparedness;

  const skillsList = Array.isArray(human_skills) ? human_skills : [];
  const riskInfo = formatRiskLevel(ai_risk_level);
  const hasScore = future_proof_score !== null && future_proof_score !== undefined;
  const hasSkills = skillsList.length > 0;
  const hasGuidance = Boolean(plain_language_guidance);

  if (!ai_risk_level && !hasScore && !hasSkills && !hasGuidance) {
    return (
      <div className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          04 — AI Preparedness
        </h3>
        <p className="text-xs text-slate-400">
          AI impact information is not currently available in the parent report.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="parent-ai-heading"
      className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E88E5] border border-blue-200 text-xs font-bold uppercase tracking-wider">
            <Bot size={13} />
            <span>04 — AI Preparedness</span>
          </div>
          <h2
            id="parent-ai-heading"
            className="text-xl sm:text-2xl font-black text-[#0b1a36] tracking-tight"
          >
            Will AI Replace This Job?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Understanding automation exposure, assistive AI integration, and the human capabilities that anchor long-term resilience.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-400">
          Technological Horizon
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Plain-Language Guidance Narrative                                  */}
      {/* ------------------------------------------------------------------ */}
      {hasGuidance && (
        <div className="bg-gradient-to-br from-[#F0F6FC] to-[#e8f1fa] border border-[#D3E3F5] rounded-2xl p-5 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Parent Guidance on AI Impact
          </span>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {plain_language_guidance}
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3-Pillar Practical AI Breakdown                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid gap-3.5 sm:grid-cols-3" data-testid="parent-ai-three-pillars">
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-slate-700">
            <Bot size={15} className="text-[#1E88E5]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              What AI Is Automating Today
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {aiPreparedness.automating_today ||
              "Routine code/content generation, boilerplate setup, repetitive syntax drafting, and standard data pipeline maintenance."}
          </p>
        </div>

        <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-slate-700">
            <UserCheck size={15} className="text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              What AI Is NOT Automating
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {aiPreparedness.not_automating ||
              "Deciding what to build, debugging complex real-world edge cases, translating human needs into architecture, and safety oversight."}
          </p>
        </div>

        <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-slate-700">
            <Sparkles size={15} className="text-purple-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Strategic Long-Term Outlook
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {aiPreparedness.strategic_outlook ||
              "Practitioners who combine strong core domain principles with practical AI tools will see enhanced leverage and sustained demand."}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Key Metrics Grid                                                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Automation Exposure Level */}
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Automation Risk Level
              </span>
              <Shield size={16} className="text-[#1E88E5]" />
            </div>
            <div className="pt-1">
              <span className={`inline-block px-3 py-1 rounded-full border text-xs font-bold ${riskInfo.classes}`}>
                {riskInfo.label}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-200/80">
            Assesses the current proportion of routine analytical and administrative workflows assisted by modern AI tooling.
          </p>
        </div>

        {/* Future-Proof Score (if present) */}
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Future-Proof Score
              </span>
              <Sparkles size={16} className="text-[#1E88E5]" />
            </div>
            <div className="pt-1">
              {hasScore ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-[#0b1a36]">
                    {future_proof_score}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                </div>
              ) : (
                <span className="inline-block px-2.5 py-0.5 rounded-full border text-xs font-semibold bg-slate-100 text-slate-500 border-slate-200">
                  Not Assigned
                </span>
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-200/80">
            Composite index reflecting occupational complexity, physical oversight demands, and human judgment dependency.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Enduring Human Capabilities                                        */}
      {/* ------------------------------------------------------------------ */}
      {hasSkills && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-[#1E88E5]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Core Human Capabilities
            </h3>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {skillsList.map((skill, idx) => (
              <div
                key={idx}
                className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5 flex items-center gap-2.5 hover:bg-white hover:border-[#D3E3F5] transition shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#1E88E5] shrink-0" />
                <span className="text-xs font-bold text-[#0b1a36]">
                  {typeof skill === "string" ? skill : String(skill?.title || skill?.name || skill)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Evidence Attribution Notice                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <Info size={13} className="shrink-0 text-slate-400" />
        <span>
          AI evaluations evaluate current workflow assistance and human judgment requirements rather than speculative elimination timelines.
        </span>
      </div>
    </section>
  );
}
