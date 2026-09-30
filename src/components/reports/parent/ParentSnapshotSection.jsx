import React from "react";
import {
  Award,
  Sparkles,
  BookCheck,
  GraduationCap
} from "lucide-react";

/**
 * Format fit tier safely without assumptions.
 */
function formatFitTier(tier) {
  if (!tier) return null;
  return String(tier)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Format exploration maturity into human-friendly label.
 */
function formatMaturity(maturity) {
  if (!maturity) return "Evidence In Progress";
  const upper = String(maturity).toUpperCase();
  if (upper === "COMPLETED" || upper === "HIGH") return "High Evidence (Simulation Complete)";
  if (upper === "MODERATE") return "Moderate Evidence (Discovery & Trial)";
  if (upper === "INITIAL" || upper === "LOW") return "Initial Exploration";
  return maturity.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ParentSnapshotSection({ snapshot }) {
  if (!snapshot) {
    return (
      <div className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          01 — Snapshot for Parents
        </h3>
        <p className="text-xs text-slate-400">
          Parent snapshot summary is not currently available for this career.
        </p>
      </div>
    );
  }

  const {
    career_name = "Selected Career",
    student_name = "Your Child",
    plain_language_summary = {},
    fit_tier = null,
    exploration_maturity = null,
  } = snapshot;

  const headline =
    plain_language_summary?.headline ||
    `Understanding ${student_name}'s Alignment with ${career_name}`;

  const narrative =
    plain_language_summary?.narrative ||
    `${student_name} has completed practical evaluation tasks for ${career_name}. This report summarizes observed strengths and key growth areas.`;

  const fitTierLabel = formatFitTier(fit_tier);
  const maturityLabel = formatMaturity(exploration_maturity);

  return (
    <section
      aria-labelledby="parent-snapshot-heading"
      className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 md:p-8 shadow-xs space-y-5"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E88E5] border border-blue-200/70 flex items-center justify-center font-bold text-xs">
            01
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            01 — Snapshot for Parents
          </span>
        </div>

        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
          <BookCheck size={14} className="text-emerald-600" />
          <span>Parent Interpretation</span>
        </div>
      </div>

      {/* Main Grid: Primary interpretation on Left, Metadata & Indicators on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Headline & Plain-Language Narrative */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          <h1
            id="parent-snapshot-heading"
            className="text-xl sm:text-2xl font-black text-[#0b1a36] tracking-tight leading-tight"
          >
            {headline}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {narrative}
          </p>

          {snapshot.trial_percentile && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-semibold mt-1">
              <span>Trial Evidence: Outperformed {snapshot.trial_percentile}% of students on simulated hands-on task</span>
            </div>
          )}
        </div>

        {/* Right Column: Structured Key Indicators */}
        <div className="lg:col-span-5 xl:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
          {/* Child & Career Focus */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Student & Career
              </span>
              <div className="text-xs font-bold text-[#0b1a36] truncate">
                {student_name}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {career_name}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1E88E5] border border-blue-200/60 flex items-center justify-center shrink-0">
              <GraduationCap size={15} />
            </div>
          </div>

          {/* Evidence Maturity */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Evidence Maturity
              </span>
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full border text-[11px] font-bold bg-white text-[#0b1a36] border-slate-200 shadow-2xs">
                  {maturityLabel}
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1E88E5] border border-blue-200/60 flex items-center justify-center shrink-0">
              <Sparkles size={15} />
            </div>
          </div>

          {/* Alignment / Fit Tier */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Alignment Level
              </span>
              <div>
                {fitTierLabel ? (
                  <span className="inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                    {fitTierLabel}
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-semibold bg-white text-slate-500 border-slate-200">
                    In Review
                  </span>
                )}
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
              <Award size={15} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
