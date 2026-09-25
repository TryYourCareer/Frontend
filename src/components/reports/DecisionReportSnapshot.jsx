import React from "react";
import {
  HelpCircle,
  Layers,
  Award,
  Activity,
  TrendingUp,
  Sparkles,
} from "lucide-react";

/**
 * Format Fit Tier styling based strictly on raw value.
 */
function getFitTierBadgeClasses(fitTier) {
  if (!fitTier) {
    return "bg-slate-50 text-slate-700 border-slate-200";
  }

  const upper = String(fitTier).toUpperCase();

  if (
    upper.includes("HIGH") ||
    upper.includes("STRONG") ||
    upper.includes("TIER_1") ||
    upper.includes("TOP")
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (
    upper.includes("MODERATE") ||
    upper.includes("TIER_2") ||
    upper.includes("POTENTIAL")
  ) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (
    upper.includes("LOW") ||
    upper.includes("TIER_3") ||
    upper.includes("DEVELOPING")
  ) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
}

/**
 * Format Uncertainty styling based strictly on raw value.
 */
function getUncertaintyBadgeClasses(uncertainty) {
  if (!uncertainty) {
    return "bg-slate-50 text-slate-700 border-slate-200";
  }

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
  if (!maturity) {
    return "bg-slate-50 text-slate-700 border-slate-200";
  }

  const upper = String(maturity).toUpperCase();

  if (
    upper === "HIGH" ||
    upper === "COMPLETED" ||
    upper === "MATURE"
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (
    upper === "MODERATE" ||
    upper === "MEDIUM" ||
    upper === "DEVELOPING"
  ) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (
    upper === "LOW" ||
    upper === "EARLY" ||
    upper === "INITIAL"
  ) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
}

/**
 * Color helper for Fit Score Ring stroke.
 */
function getRingStrokeColor(score, fitTier) {
  if (score === null || score === undefined) {
    return "#94A3B8";
  }

  const tierUpper = fitTier ? String(fitTier).toUpperCase() : "";

  if (
    tierUpper.includes("HIGH") ||
    tierUpper.includes("STRONG") ||
    score >= 75
  ) {
    return "#10B981";
  }

  if (
    tierUpper.includes("MODERATE") ||
    tierUpper.includes("POTENTIAL") ||
    score >= 50
  ) {
    return "#1E88E5";
  }

  return "#F59E0B";
}

/**
 * SVG-based Circular Fit Score Ring
 */
export function FitScoreRing({
  score,
  maxScore = 100,
  fitTier = "",
  size = 104,
  strokeWidth = 8,
}) {
  const hasValidScore =
    score !== null &&
    score !== undefined &&
    !isNaN(Number(score));

  const numericScore = hasValidScore ? Number(score) : null;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const clampedScore = hasValidScore
    ? Math.min(Math.max(numericScore, 0), maxScore)
    : 0;

  const progressRatio = hasValidScore
    ? clampedScore / maxScore
    : 0;

  const strokeDashoffset =
    circumference - progressRatio * circumference;

  const strokeColor = getRingStrokeColor(
    numericScore,
    fitTier
  );

  const accessibleLabel = hasValidScore
    ? `Fit Index: ${numericScore} out of ${maxScore}${
        fitTier
          ? `, ${fitTier.replace(/_/g, " ")}`
          : ""
      }`
    : "Fit Index not available";

  return (
    <div
      className="relative flex items-center justify-center select-none"
      data-testid="fit-score-ring-container"
    >
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="img"
          aria-label={accessibleLabel}
          data-testid="fit-score-ring-svg"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Active Progress */}
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
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          data-testid="fit-score-ring-center"
        >
          {hasValidScore ? (
            <>
              <span
                className="text-[22px] sm:text-2xl font-black text-[#0b1a36] font-mono leading-none tracking-tight"
                data-testid="fit-score-ring-value"
              >
                {numericScore}
              </span>

              <span className="text-[10px] font-bold text-slate-400 mt-1">
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

/**
 * Compact Snapshot Indicator Box
 *
 * These are intentionally compact.
 * The Snapshot uses exactly 2 boxes per row on desktop.
 */
function SnapshotIndicator({
  label,
  icon: Icon,
  children,
}) {
  return (
    <div className="min-h-[76px] bg-[#F8FAFC] border border-slate-200/80 rounded-2xl px-4 py-3.5 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>

        {Icon && (
          <Icon
            size={15}
            strokeWidth={1.8}
            className="text-[#1E88E5] shrink-0"
          />
        )}
      </div>

      <div className="mt-2">
        {children}
      </div>
    </div>
  );
}

export default function DecisionReportSnapshot({
  snapshot,
  metadata,
}) {
  if (!snapshot) {
    return (
      <section
        className="bg-white border border-[#D3E3F5] rounded-3xl px-5 py-6 sm:px-7 sm:py-7 shadow-xs"
        data-testid="decision-report-snapshot"
      >
        <p className="text-sm text-slate-500 italic">
          Snapshot data is not available yet.
        </p>
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

  const rawUncertainty =
    uncertainty || uncertainty_level;

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
      className="
        bg-white
        border border-slate-200/90
        rounded-3xl
        px-5 py-6
        sm:px-7 sm:py-7
        shadow-xs
      "
      data-testid="decision-report-snapshot"
    >
      {/* =====================================================
          SECTION HEADER
          ===================================================== */}
      <div
        className="
          flex items-center justify-between
          gap-3
          border-b border-slate-100
          pb-4
        "
      >
        <div className="flex items-center gap-2">
          <span
            className="
              w-7 h-7
              rounded-xl
              bg-blue-50
              text-[#1E88E5]
              border border-blue-200/70
              flex items-center justify-center
              font-bold text-xs
              shrink-0
            "
          >
            01
          </span>

          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            01 — Snapshot
          </span>

          {version && (
            <span className="hidden sm:inline text-xs text-slate-400">
              v{version}
            </span>
          )}
        </div>

        {generatedAt && (
          <span className="hidden sm:block text-xs text-slate-400">
            Generated{" "}
            {new Date(generatedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* =====================================================
          MAIN SNAPSHOT LAYOUT
          
          Desktop:
          
          LEFT                              RIGHT
          ┌───────────────────────────┐    ┌──────────────┐
          │ Career title              │    │ Fit Score    │
          │ Description               │    │              │
          │                           │    │    33.33     │
          │ [box] [box]              │    │    /100      │
          │ [box] [box]              │    │ EXPLORATORY  │
          │ [box]                    │    │              │
          └───────────────────────────┘    └──────────────┘
          
          ===================================================== */}
      <div
        className="
          mt-5
          grid
          grid-cols-1
          lg:grid-cols-[minmax(0,1fr)_200px]
          gap-5
          lg:gap-6
          items-start
        "
      >
        {/* ===================================================
            LEFT CONTENT
            =================================================== */}
        <div className="min-w-0">
          {/* Career Title */}
          <div>
            <h1
              className="
                text-2xl
                sm:text-3xl
                font-black
                text-[#0b1a36]
                tracking-tight
                leading-tight
              "
            >
              {career_name || "Career Decision Report"}
            </h1>

            {resolvedOneLiner && (
              <p
                className="
                  mt-2
                  text-sm
                  text-slate-600
                  leading-relaxed
                  max-w-2xl
                "
              >
                {resolvedOneLiner}
              </p>
            )}
          </div>

          {/* =================================================
              TWO-COLUMN INDICATOR GRID

              IMPORTANT:
              Exactly 2 boxes per row on desktop.
              ================================================= */}
          <div
            className="
              mt-5
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-3
            "
          >
            {/* 1. Fit Tier */}
            <SnapshotIndicator
              label="Fit Tier"
              icon={Award}
            >
              {fit_tier ? (
                <span
                  className={`
                    inline-flex
                    items-center
                    px-2.5
                    py-1
                    rounded-full
                    border
                    text-[11px]
                    font-bold
                    ${getFitTierBadgeClasses(fit_tier)}
                  `}
                >
                  {fit_tier.replace(/_/g, " ")}
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Not available yet
                </span>
              )}
            </SnapshotIndicator>

            {/* 2. Recommendation Category */}
            <SnapshotIndicator
              label="Recommendation"
              icon={TrendingUp}
            >
              {recommendation_category ? (
                <span
                  className="
                    inline-flex
                    items-center
                    px-2.5
                    py-1
                    rounded-full
                    border
                    border-blue-200
                    bg-blue-50
                    text-blue-800
                    text-[11px]
                    font-bold
                  "
                >
                  {recommendation_category.replace(
                    /_/g,
                    " "
                  )}
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Not available yet
                </span>
              )}
            </SnapshotIndicator>

            {/* 3. Uncertainty */}
            <SnapshotIndicator
              label="Uncertainty"
              icon={HelpCircle}
            >
              {rawUncertainty ? (
                <span
                  className={`
                    inline-flex
                    items-center
                    px-2.5
                    py-1
                    rounded-full
                    border
                    text-[11px]
                    font-bold
                    ${getUncertaintyBadgeClasses(
                      rawUncertainty
                    )}
                  `}
                >
                  {rawUncertainty}
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Not evaluated
                </span>
              )}
            </SnapshotIndicator>

            {/* 4. Exploration Maturity */}
            <SnapshotIndicator
              label="Exploration Maturity"
              icon={Layers}
            >
              {exploration_maturity ? (
                <span
                  className={`
                    inline-flex
                    items-center
                    px-2.5
                    py-1
                    rounded-full
                    border
                    text-[11px]
                    font-bold
                    ${getMaturityBadgeClasses(
                      exploration_maturity
                    )}
                  `}
                >
                  {exploration_maturity}
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Not available yet
                </span>
              )}
            </SnapshotIndicator>

            {/* 5. Fit Index */}
            <SnapshotIndicator
              label="Fit Index"
              icon={Activity}
            >
              {fit_index !== null &&
              fit_index !== undefined ? (
                <span
                  className="
                    text-lg
                    font-black
                    text-[#0b1a36]
                    font-mono
                    leading-none
                  "
                >
                  {fit_index}
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Not available yet
                </span>
              )}
            </SnapshotIndicator>
          </div>
        </div>

        {/* ===================================================
            RIGHT — OVERALL FIT SCORE
            =================================================== */}
        <div
          className="
            order-first
            lg:order-none
            flex
            justify-center
            lg:justify-center
          "
        >
          <div
            className="
              w-full
              max-w-[200px]
              bg-[#F8FAFC]
              border border-slate-200/80
              rounded-2xl
              px-4 py-4
              flex flex-col
              items-center
              justify-center
            "
          >
            {/* Label */}
            <div
              className="
                flex
                items-center
                justify-center
                gap-1.5
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-slate-500
              "
            >
              <Sparkles
                size={13}
                className="text-[#1E88E5]"
              />

              <span>Overall Fit Score</span>
            </div>

            {/* Score Ring */}
            <div className="mt-2">
              <FitScoreRing
                score={fit_index}
                maxScore={100}
                fitTier={fit_tier}
                size={104}
                strokeWidth={8}
              />
            </div>

            {/* Fit Tier */}
            {fit_tier && (
              <span
                className={`
                  mt-2
                  inline-flex
                  items-center
                  px-2.5
                  py-1
                  rounded-full
                  border
                  text-[10px]
                  font-bold
                  ${getFitTierBadgeClasses(fit_tier)}
                `}
              >
                {fit_tier.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}