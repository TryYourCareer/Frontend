import React from "react";
import { 
  HelpCircle, 
  Layers, 
  Award, 
  Activity, 
  TrendingUp,
  Sparkles
} from "lucide-react";

/**
 * Format Fit Tier styling based strictly on raw value.
 */
function getFitTierBadgeClasses(fitTier) {
  if (!fitTier) return "bg-slate-50 text-slate-700 border-slate-200";
  const upper = String(fitTier).toUpperCase();
  if (upper.includes("HIGH") || upper.includes("STRONG") || upper.includes("TIER_1") || upper.includes("TOP")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (upper.includes("MODERATE") || upper.includes("TIER_2") || upper.includes("POTENTIAL")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (upper.includes("LOW") || upper.includes("TIER_3") || upper.includes("DEVELOPING")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
}

/**
 * Format Uncertainty styling based strictly on raw value.
 */
function getUncertaintyBadgeClasses(uncertainty) {
  if (!uncertainty) return "bg-slate-50 text-slate-700 border-slate-200";
  const upper = String(uncertainty).toUpperCase();
  if (upper === "LOW") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (upper === "MODERATE" || upper === "MEDIUM") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (upper === "HIGH") {
    return "bg-slate-100 text-slate-700 border-slate-300";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
}

/**
 * Format Exploration Maturity styling based strictly on raw value.
 */
function getMaturityBadgeClasses(maturity) {
  if (!maturity) return "bg-slate-50 text-slate-700 border-slate-200";
  const upper = String(maturity).toUpperCase();
  if (upper === "HIGH" || upper === "COMPLETED" || upper === "MATURE") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (upper === "MODERATE" || upper === "MEDIUM" || upper === "DEVELOPING") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (upper === "LOW" || upper === "EARLY" || upper === "INITIAL") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
}

/**
 * Color helper for Fit Score Ring stroke.
 */
function getRingStrokeColor(score, fitTier) {
  if (score === null || score === undefined) return "#94A3B8";
  const tierUpper = fitTier ? String(fitTier).toUpperCase() : "";
  if (tierUpper.includes("HIGH") || tierUpper.includes("STRONG") || score >= 75) {
    return "#10B981"; // Emerald
  }
  if (tierUpper.includes("MODERATE") || tierUpper.includes("POTENTIAL") || score >= 50) {
    return "#1E88E5"; // Brand Blue
  }
  return "#F59E0B"; // Amber
}

/**
 * SVG-based Circular Fit Score Ring
 */
export function FitScoreRing({
  score,
  maxScore = 100,
  fitTier = "",
  size = 120,
  strokeWidth = 9,
}) {
  const hasValidScore = score !== null && score !== undefined && !isNaN(Number(score));
  const numericScore = hasValidScore ? Number(score) : null;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate percentage fill [0, 100]
  const clampedScore = hasValidScore ? Math.min(Math.max(numericScore, 0), maxScore) : 0;
  const progressRatio = hasValidScore ? clampedScore / maxScore : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const strokeColor = getRingStrokeColor(numericScore, fitTier);
  const accessibleLabel = hasValidScore
    ? `Fit Index: ${numericScore} out of ${maxScore}${fitTier ? `, ${fitTier.replace(/_/g, " ")}` : ""}`
    : "Fit Index not available";

  return (
    <div
      className="flex flex-col items-center justify-center relative select-none"
      data-testid="fit-score-ring-container"
    >
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
          role="img"
          aria-label={accessibleLabel}
          data-testid="fit-score-ring-svg"
        >
          {/* Background Track Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Filled Ring */}
          {hasValidScore && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out motion-reduce:transition-none"
              data-testid="fit-score-ring-progress"
            />
          )}
        </svg>

        {/* Center Content */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-2"
          data-testid="fit-score-ring-center"
        >
          {hasValidScore ? (
            <>
              <span
                className="text-2xl font-black text-[#0b1a36] font-mono leading-none tracking-tight"
                data-testid="fit-score-ring-value"
              >
                {numericScore}
              </span>
              <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                / {maxScore}
              </span>
            </>
          ) : (
            <span
              className="text-xs font-bold text-slate-400 italic px-1"
              data-testid="fit-score-ring-unavailable"
            >
              Not available yet
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DecisionReportSnapshot({ snapshot, metadata }) {
  if (!snapshot) {
    return (
      <section 
        className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs"
        data-testid="decision-report-snapshot"
      >
        <p className="text-sm text-slate-500 italic">Snapshot data is not available yet.</p>
      </section>
    );
  }

  const {
    career_name,
    one_liner,
    fit_tier,
    recommendation_category,
    fit_index,
    uncertainty,
    uncertainty_level,
    exploration_maturity,
  } = snapshot;

  const rawUncertainty = uncertainty || uncertainty_level;
  const version = metadata?.report_version;
  const generatedAt = metadata?.generated_at;

  const resolvedOneLiner =
    one_liner ||
    snapshot.summary ||
    snapshot.description ||
    metadata?.one_liner ||
    metadata?.career_summary ||
    null;

  return (
    <section
      className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
      data-testid="decision-report-snapshot"
    >
      {/* Header Metadata Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E88E5]">
            01 — Snapshot
          </span>
          {version && (
            <span className="text-xs text-slate-400">
              v{version}
            </span>
          )}
        </div>
        {generatedAt && (
          <span className="text-xs text-slate-400">
            Generated {new Date(generatedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Main Title & Executive Ring Hero Layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-2 flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0b1a36] tracking-tight">
            {career_name || "Career Decision Report"}
          </h1>
          {resolvedOneLiner ? (
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              {resolvedOneLiner}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Not available yet
            </p>
          )}
        </div>

        {/* Primary Circular Fit Score Ring Hero */}
        <div className="flex flex-col items-center sm:items-end shrink-0">
          <div className="bg-[#F8FAFC] border border-[#D3E3F5] rounded-3xl p-4 flex flex-col items-center space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              <Sparkles size={13} className="text-[#1E88E5]" />
              <span>Overall Fit Score</span>
            </div>
            <FitScoreRing
              score={fit_index}
              maxScore={100}
              fitTier={fit_tier}
              size={110}
              strokeWidth={8}
            />
            {fit_tier && (
              <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getFitTierBadgeClasses(fit_tier)}`}>
                {fit_tier.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Structured Key Indicators Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 pt-2 border-t border-slate-100">
        {/* 1. Fit Tier */}
        <div className="bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Fit Tier
            </span>
            <Award size={16} className="text-[#1E88E5]" />
          </div>
          <div>
            {fit_tier ? (
              <span className={`inline-block px-2.5 py-0.5 rounded-full border text-xs font-bold ${getFitTierBadgeClasses(fit_tier)}`}>
                {fit_tier.replace(/_/g, " ")}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">Not available yet</span>
            )}
          </div>
        </div>

        {/* 2. Recommendation Category */}
        <div className="bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Recommendation Category
            </span>
            <TrendingUp size={16} className="text-[#1E88E5]" />
          </div>
          <div>
            {recommendation_category ? (
              <span className="inline-block px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-800 text-xs font-bold">
                {recommendation_category.replace(/_/g, " ")}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">Not available yet</span>
            )}
          </div>
        </div>

        {/* 3. Fit Index */}
        <div className="bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Fit Index
            </span>
            <Activity size={16} className="text-[#1E88E5]" />
          </div>
          <div>
            {fit_index !== null && fit_index !== undefined ? (
              <span className="text-lg font-black text-[#0b1a36] font-mono">
                {fit_index}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">Not available yet</span>
            )}
          </div>
        </div>

        {/* 4. Uncertainty */}
        <div className="bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Uncertainty
            </span>
            <HelpCircle size={16} className="text-[#1E88E5]" />
          </div>
          <div>
            {rawUncertainty ? (
              <span className={`inline-block px-2.5 py-0.5 rounded-full border text-xs font-bold ${getUncertaintyBadgeClasses(rawUncertainty)}`}>
                {rawUncertainty}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">Not evaluated</span>
            )}
          </div>
        </div>

        {/* 5. Exploration Maturity */}
        <div className="bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Exploration Maturity
            </span>
            <Layers size={16} className="text-[#1E88E5]" />
          </div>
          <div>
            {exploration_maturity ? (
              <span className={`inline-block px-2.5 py-0.5 rounded-full border text-xs font-bold ${getMaturityBadgeClasses(exploration_maturity)}`}>
                {exploration_maturity}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">Not available yet</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
