import React from "react";
import {
  Users,
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
      className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Section Tag & Scope Header                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E88E5] border border-blue-200 text-xs font-bold uppercase tracking-wider">
          <Users size={13} />
          <span>01 — Snapshot for Parents</span>
        </div>

        <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <BookCheck size={14} className="text-emerald-600" />
          <span>Parent Interpretation</span>
        </div>
      </div>

      {/* Headline & Plain-Language Narrative */}
      <div className="space-y-3">
        <h1
          id="parent-snapshot-heading"
          className="text-2xl sm:text-3xl font-black text-[#0b1a36] tracking-tight leading-tight"
        >
          {headline}
        </h1>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl">
          {narrative}
        </p>

        {snapshot.trial_percentile && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span>Trial Evidence: Outperformed {snapshot.trial_percentile}% of students on simulated hands-on task</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Key Overview Cards                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 pt-2">
        {/* Child & Career Focus */}
        <div className="bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Student & Career
            </span>
            <GraduationCap size={16} className="text-[#1E88E5]" />
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-bold text-[#0b1a36] truncate">
              {student_name}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {career_name}
            </div>
          </div>
        </div>

        {/* Evaluation Maturity */}
        <div className="bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Evidence Maturity
            </span>
            <Sparkles size={16} className="text-[#1E88E5]" />
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full border text-xs font-bold bg-white text-[#0b1a36] border-[#D3E3F5]">
              {maturityLabel}
            </span>
          </div>
        </div>

        {/* Alignment / Fit Tier (When supplied) */}
        <div className="bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Alignment Level
            </span>
            <Award size={16} className="text-[#1E88E5]" />
          </div>
          <div>
            {fitTierLabel ? (
              <span className="inline-block px-2.5 py-0.5 rounded-full border text-xs font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                {fitTierLabel}
              </span>
            ) : (
              <span className="inline-block px-2.5 py-0.5 rounded-full border text-xs font-semibold bg-slate-100 text-slate-500 border-slate-200">
                In Review
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
