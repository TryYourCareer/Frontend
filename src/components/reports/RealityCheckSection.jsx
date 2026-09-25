import React from "react";
import {
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Compass,
  Briefcase,
  Target,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

/**
 * Format gap state labels strictly based on backend enum/string.
 */
function formatGapState(state) {
  if (!state) return "Development Area";
  switch (String(state).toUpperCase()) {
    case "DEMONSTRATED_GROWTH_AREA":
      return "Demonstrated Growth Area";
    case "INSUFFICIENT_EVIDENCE":
      return "Insufficient Evidence";
    case "UNTESTED_AREA":
      return "Untested Area";
    default:
      return state.replace(/_/g, " ");
  }
}

/**
 * Get badge classes for gap state.
 */
function getGapStateBadgeClasses(state) {
  const upper = String(state || "").toUpperCase();
  if (upper === "DEMONSTRATED_GROWTH_AREA") {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }
  if (upper === "INSUFFICIENT_EVIDENCE") {
    return "bg-slate-100 text-slate-700 border-slate-300";
  }
  if (upper === "UNTESTED_AREA") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
}

/**
 * Presentation helper for coverage ratio without calculation or scoring interpretation.
 */
function formatCoverageRatio(ratio) {
  if (ratio === null || ratio === undefined) return null;
  const num = Number(ratio);
  if (isNaN(num)) return String(ratio);
  if (num >= 0 && num <= 1.0) {
    return `${Math.round(num * 100)}%`;
  }
  return `${num}%`;
}

export default function RealityCheckSection({ realityCheck }) {
  if (!realityCheck) {
    return (
      <div className="bg-white border border-[#D3E3F5] rounded-3xl p-6 text-center space-y-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          03 — Reality Check
        </h3>
        <p className="text-xs text-slate-400">
          Reality Check evidence is not available yet.
        </p>
      </div>
    );
  }

  const {
    summary,
    headline: directHeadline,
    narrative: directNarrative,
    evidence_sufficiency: directSufficiency,
    exploration_maturity: directMaturity,
    areas_of_alignment = [],
    areas_needing_development = [],
    areas_not_yet_tested = [],
    development_gaps = [],
    discovery_interest,
    career_requirements,
    demonstrated_evidence,
    uncertainty,
    evidence_limitations,
    limitations,
  } = realityCheck;

  const headline = summary?.headline || directHeadline;
  const narrative = summary?.narrative || directNarrative;
  const evidenceSufficiency = summary?.evidence_sufficiency || directSufficiency;
  const explorationMaturity = summary?.exploration_maturity || directMaturity;

  const hasAlignment = Array.isArray(areas_of_alignment) && areas_of_alignment.length > 0;
  const hasNeedingDev = Array.isArray(areas_needing_development) && areas_needing_development.length > 0;
  const hasNotTested = Array.isArray(areas_not_yet_tested) && areas_not_yet_tested.length > 0;
  const hasGaps = Array.isArray(development_gaps) && development_gaps.length > 0;

  // Discovery Evidence
  const hasDiscovery = discovery_interest && (
    discovery_interest.interest_summary ||
    (Array.isArray(discovery_interest.defining_dimensions) && discovery_interest.defining_dimensions.length > 0)
  );

  // Demonstrated Evidence
  const trialStrengths = demonstrated_evidence?.trial_strengths || [];
  const hasTrialEvidence = demonstrated_evidence && (
    (Array.isArray(trialStrengths) && trialStrengths.length > 0) ||
    (demonstrated_evidence.work_behaviors && demonstrated_evidence.work_behaviors.length > 0)
  );

  // Career Requirements
  const requiredCompetencies = career_requirements?.required_competencies || [];
  const keyActivities = career_requirements?.key_work_activities || [];
  const hasCareerReqs = career_requirements && (requiredCompetencies.length > 0 || keyActivities.length > 0 || career_requirements.work_dna);

  // Uncertainty / Limitations
  const resolvedLimitations = evidence_limitations || limitations || uncertainty?.rationale;
  const formattedCoverage = formatCoverageRatio(uncertainty?.evidence_coverage_ratio);

  return (
    <section className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            03 — Evidence Synthesis
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0b1a36]">
            Reality Check
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {explorationMaturity && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F0F6FC] text-[#1E88E5] border border-[#D3E3F5]">
              Maturity: {explorationMaturity}
            </span>
          )}
          {evidenceSufficiency && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Evidence: {evidenceSufficiency}
            </span>
          )}
        </div>
      </div>

      {/* Headline & Narrative Summary */}
      {(headline || narrative) ? (
        <div className="bg-gradient-to-br from-[#F0F6FC] to-white border border-[#D3E3F5] rounded-2xl p-5 sm:p-6 space-y-3">
          {headline && (
            <h3 className="text-base sm:text-lg font-bold text-[#0b1a36] flex items-center gap-2">
              <Sparkles size={18} className="text-[#1E88E5] shrink-0" />
              <span>{headline}</span>
            </h3>
          )}
          {narrative ? (
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
              {narrative}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">Narrative summary not available yet.</p>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 italic">
          Summary narrative is not available yet.
        </div>
      )}

      {/* Discovery vs. Trial Mission Demonstrated Evidence (if provided) */}
      {(hasDiscovery || hasTrialEvidence) && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Authoritative Evidence Comparison
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Discovery Evidence Card */}
            <div className="bg-[#F0F6FC]/60 border border-[#D3E3F5] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E88E5]">
                <Compass size={16} />
                <span>Discovery Evidence</span>
              </div>
              {discovery_interest?.interest_summary && (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  "{discovery_interest.interest_summary}"
                </p>
              )}
              {Array.isArray(discovery_interest?.defining_dimensions) && discovery_interest.defining_dimensions.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Defining Dimensions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {discovery_interest.defining_dimensions.map((dim, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-white border border-[#D3E3F5] text-xs font-bold text-[#0b1a36]"
                      >
                        {dim}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trial Mission Demonstrated Evidence Card */}
            <div className="bg-[#F0F6FC]/60 border border-[#D3E3F5] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E88E5]">
                <ShieldCheck size={16} />
                <span>Demonstrated Evidence</span>
              </div>
              {trialStrengths.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Demonstrated Competencies
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {trialStrengths.map((st, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-2 bg-white border border-[#D3E3F5] rounded-xl px-3 py-2">
                        <span className="font-bold text-[#0b1a36]">
                          {st.title || "Demonstrated Competency"}
                        </span>
                        {st.demonstrated_level !== undefined && (
                          <span className="font-mono text-[11px] font-bold text-[#1E88E5] shrink-0">
                            Level {st.demonstrated_level}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Additional trial evidence is needed to establish demonstrated competency levels.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Career Requirements (if provided) */}
      {hasCareerReqs && (
        <div className="bg-[#F0F6FC]/60 border border-[#D3E3F5] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E88E5]">
            <Briefcase size={16} />
            <span>Career Requirements</span>
          </div>
          {requiredCompetencies.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Required Core Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {requiredCompetencies.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-white border border-[#D3E3F5] text-xs font-medium text-slate-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {keyActivities.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Key Work Activities
              </span>
              <ul className="space-y-1 text-xs text-slate-700">
                {keyActivities.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#1E88E5] font-bold">•</span>
                    <span>{typeof act === "string" ? act : act.title || JSON.stringify(act)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Areas of Alignment */}
      {hasAlignment && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>Areas of Alignment</span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {areas_of_alignment.map((item, idx) => (
              <div
                key={idx}
                className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-4 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-emerald-950">
                    {item.title || "Aligned Competency"}
                  </span>
                  {item.level !== undefined && (
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Level {item.level}
                    </span>
                  )}
                </div>
                {item.rationale && (
                  <p className="text-xs text-emerald-900/80 leading-snug">
                    {item.rationale}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Development Gaps (DevelopmentGapItem list) */}
      {(hasGaps || hasNeedingDev) && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Target size={15} className="text-amber-600" />
            <span>Development Gaps</span>
          </h3>
          <div className="space-y-3">
            {(hasGaps ? development_gaps : areas_needing_development).map((gap, idx) => {
              const title = gap.title || "Development Area";
              const state = gap.state;
              const rationale = gap.rationale;
              const currentLevel = gap.current_level;
              const targetLevel = gap.target_level;

              return (
                <div
                  key={idx}
                  className="bg-white border border-[#D3E3F5] rounded-2xl p-4 sm:p-5 space-y-2 hover:border-amber-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#0b1a36]">
                      {title}
                    </span>
                    <div className="flex items-center gap-2">
                      {(currentLevel !== undefined || targetLevel !== undefined) && (
                        <span className="text-xs font-mono font-semibold text-slate-600">
                          {currentLevel !== undefined ? `Current: ${currentLevel}` : ""}
                          {currentLevel !== undefined && targetLevel !== undefined ? " • " : ""}
                          {targetLevel !== undefined ? `Target: ${targetLevel}` : ""}
                        </span>
                      )}
                      {state && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getGapStateBadgeClasses(state)}`}>
                          {formatGapState(state)}
                        </span>
                      )}
                    </div>
                  </div>
                  {rationale && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {rationale}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Untested Areas */}
      {hasNotTested && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <HelpCircle size={15} className="text-slate-400" />
            <span>Areas Not Yet Tested</span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {areas_not_yet_tested.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1"
              >
                <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                  {item.title || "Untested Area"}
                </span>
                {item.rationale && (
                  <p className="text-xs text-slate-600 leading-snug">
                    {item.rationale}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uncertainty & Evidence Limitations */}
      {(uncertainty || resolvedLimitations) && (
        <div className="bg-[#F0F6FC]/60 border border-[#D3E3F5] rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-500" />
              <span>Evidence Strength & Limitations</span>
            </span>
            {uncertainty?.classification && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {uncertainty.classification} Uncertainty
              </span>
            )}
          </div>
          {formattedCoverage && (
            <div className="text-xs text-slate-600 font-medium">
              Coverage: {formattedCoverage}
            </div>
          )}
          {resolvedLimitations && (
            <p className="text-xs text-slate-600 leading-relaxed italic">
              {resolvedLimitations}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
