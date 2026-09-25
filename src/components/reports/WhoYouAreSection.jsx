import React, { useId } from "react";
import {
  Compass,
  Sparkles,
  Target,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

/**
 * Safely renders text with markdown bold markers.
 */
export function renderFormattedText(text) {
  if (!text || typeof text !== "string") return text;

  const parts = text.split(/(\$\$|\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (
      part.startsWith("**") &&
      part.endsWith("**") &&
      part.length >= 4
    ) {
      const inner = part.slice(2, -2);

      return (
        <strong
          key={index}
          className="font-bold text-[#0b1a36]"
        >
          {inner}
        </strong>
      );
    }

    return part;
  });
}

/**
 * Format confidence / clarity scores safely.
 */
function formatDiagnosticScore(score) {
  if (score === null || score === undefined) return null;

  const num = Number(score);

  if (isNaN(num)) return String(score);

  if (num > 0 && num <= 1.0) {
    return `${Math.round(num * 100)}%`;
  }

  return String(num);
}

/**
 * Six dimension visual identity.
 *
 * The colors are assigned consistently by dimension position.
 * They are visual identifiers only and do not change the data.
 */
const DIMENSION_COLORS = [
  {
    main: "#2563EB",
    soft: "#DBEAFE",
    text: "#1D4ED8",
  },
  {
    main: "#8B5CF6",
    soft: "#EDE9FE",
    text: "#7C3AED",
  },
  {
    main: "#0D9488",
    soft: "#CCFBF1",
    text: "#0F766E",
  },
  {
    main: "#F59E0B",
    soft: "#FEF3C7",
    text: "#B45309",
  },
  {
    main: "#10B981",
    soft: "#D1FAE5",
    text: "#047857",
  },
  {
    main: "#EC4899",
    soft: "#FCE7F3",
    text: "#BE185D",
  },
];

function getDimensionColor(index) {
  return DIMENSION_COLORS[index % DIMENSION_COLORS.length];
}

/**
 * Convert a dimension score into a normalized 0–1 value.
 */
function normalizeDimensionScore(dim) {
  const raw =
    typeof dim?.score === "number"
      ? dim.score
      : typeof dim?.level === "number"
        ? dim.level
        : 50;

  let normalized;

  if (raw <= 1 && raw > 0) {
    normalized = raw;
  } else {
    normalized = raw / 100;
  }

  return Math.min(1, Math.max(0.08, normalized));
}

/**
 * Format a score for display.
 */
function formatDimensionScore(dim) {
  const raw =
    typeof dim?.score === "number"
      ? dim.score
      : typeof dim?.level === "number"
        ? dim.level
        : null;

  if (raw === null) return null;

  if (raw > 0 && raw <= 1) {
    return Math.round(raw * 100);
  }

  return Math.round(raw);
}

/**
 * ============================================================
 * 6D VECTOR / ORBIT VISUALIZATION
 * ============================================================
 *
 * This intentionally moves away from a conventional radar chart.
 *
 * Visual structure:
 *
 *                Dimension
 *                   ●
 *              ╱         ╲
 *         ●                   ●
 *        ╱        6D           ╲
 *       ●        PROFILE         ●
 *        ╲                       ╱
 *         ●                   ●
 *              ╲         ╱
 *                 ●
 *
 * The actual polygon still represents the existing dimension
 * values. The surrounding orbit/circle is visual treatment only.
 */
function DiscoveryVector({ dimensions }) {
  const gradientId = `sixDGradient-${useId().replace(/:/g, "")}`;
  const glowId = `sixDGlow-${useId().replace(/:/g, "")}`;

  if (!dimensions || dimensions.length < 3) {
    return null;
  }

  const width = 520;
  const height = 460;

  const cx = width / 2;
  const cy = height / 2;

  /*
   * Outer orbit.
   *
   * Keep enough space around the circle for dimension labels.
   */
  const orbitRadius = 142;

  /*
   * The actual data point moves between the center and
   * the outer orbit depending on the student's score.
   */
  const dataMinRadius = 48;
  const dataMaxRadius = 130;

  const total = dimensions.length;

  const coords = dimensions.map((dim, index) => {
    const angle =
      (index * 2 * Math.PI) / total - Math.PI / 2;

    const normalized = normalizeDimensionScore(dim);

    const dataRadius =
      dataMinRadius +
      normalized *
        (dataMaxRadius - dataMinRadius);

    const orbitX =
      cx + orbitRadius * Math.cos(angle);

    const orbitY =
      cy + orbitRadius * Math.sin(angle);

    const dataX =
      cx + dataRadius * Math.cos(angle);

    const dataY =
      cy + dataRadius * Math.sin(angle);

    const labelRadius = orbitRadius + 42;

    const labelX =
      cx + labelRadius * Math.cos(angle);

    const labelY =
      cy + labelRadius * Math.sin(angle);

    return {
      index,
      angle,
      normalized,
      dataRadius,
      orbitX,
      orbitY,
      dataX,
      dataY,
      labelX,
      labelY,
      score: formatDimensionScore(dim),
      name:
        dim.name ||
        dim.dimension ||
        `Dimension ${index + 1}`,
      level: dim.level,
      description: dim.description,
      color: getDimensionColor(index),
    };
  });

  const polygonPoints = coords
    .map(
      (point) =>
        `${point.dataX.toFixed(1)},${point.dataY.toFixed(1)}`
    )
    .join(" ");

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[28px]
        border border-slate-200
        bg-white
        px-3
        py-5
        sm:px-6
        sm:py-7
      "
    >
      {/* ======================================================
          TOP LABEL
          ====================================================== */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-2 sm:px-1">
        <div className="flex items-center gap-2">
          <div
            className="
              flex h-8 w-8
              items-center justify-center
              rounded-xl
              bg-[#EFF6FF]
              border border-[#DBEAFE]
            "
          >
            <Compass
              size={16}
              className="text-[#2563EB]"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Discovery Profile
            </p>

            <h3 className="text-sm sm:text-base font-black text-[#0b1a36]">
              Your 6D Vector
            </h3>
          </div>
        </div>

        <span
          className="
            hidden sm:inline-flex
            items-center
            rounded-full
            border border-slate-200
            bg-slate-50
            px-2.5 py-1
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-slate-500
          "
        >
          6 Dimensions
        </span>
      </div>

      {/* ======================================================
          MAIN VECTOR
          ====================================================== */}
      <div className="relative mt-3 flex justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="
            w-full
            max-w-[540px]
            h-auto
            overflow-visible
            select-none
          "
          role="img"
          aria-label="Six-dimensional discovery profile"
        >
          <defs>
            {/* Main profile gradient */}
            <linearGradient
              id={gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="#2563EB"
                stopOpacity="0.28"
              />

              <stop
                offset="45%"
                stopColor="#8B5CF6"
                stopOpacity="0.20"
              />

              <stop
                offset="100%"
                stopColor="#EC4899"
                stopOpacity="0.14"
              />
            </linearGradient>

            {/* Soft center glow */}
            <radialGradient
              id={glowId}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop
                offset="0%"
                stopColor="#2563EB"
                stopOpacity="0.16"
              />

              <stop
                offset="65%"
                stopColor="#8B5CF6"
                stopOpacity="0.06"
              />

              <stop
                offset="100%"
                stopColor="#FFFFFF"
                stopOpacity="0"
              />
            </radialGradient>
          </defs>

          {/* ==================================================
              SOFT BACKGROUND GLOW
              ================================================== */}
          <circle
            cx={cx}
            cy={cy}
            r="185"
            fill={`url(#${glowId})`}
          />

          {/* ==================================================
              OUTER ORBIT
              ================================================== */}
          <circle
            cx={cx}
            cy={cy}
            r={orbitRadius}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            opacity="0.75"
          />

          {/* Secondary orbit */}
          <circle
            cx={cx}
            cy={cy}
            r={orbitRadius - 28}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1"
            strokeDasharray="2 8"
          />

          {/* ==================================================
              CENTER CIRCLE
              ================================================== */}
          <circle
            cx={cx}
            cy={cy}
            r="58"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.5"
          />

          <circle
            cx={cx}
            cy={cy}
            r="51"
            fill="#F8FAFC"
            stroke="#DBEAFE"
            strokeWidth="1"
          />

          {/* Center text */}
          <text
            x={cx}
            y={cy - 7}
            textAnchor="middle"
            className="fill-[#0b1a36] text-[20px] font-black"
          >
            6D
          </text>

          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            className="fill-slate-500 text-[9px] font-bold"
            letterSpacing="1.5"
          >
            VECTOR
          </text>

          {/* ==================================================
              AXIS CONNECTIONS
              ================================================== */}
          {coords.map((point) => (
            <line
              key={`axis-${point.index}`}
              x1={cx}
              y1={cy}
              x2={point.orbitX}
              y2={point.orbitY}
              stroke={point.color.main}
              strokeWidth="1"
              strokeDasharray="3 5"
              opacity="0.22"
            />
          ))}

          {/* ==================================================
              DATA PROFILE
              ================================================== */}
          <polygon
            points={polygonPoints}
            fill={`url(#${gradientId})`}
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="
              transition-all
              duration-700
              ease-out
              motion-reduce:transition-none
            "
          />

          {/* Profile inner line */}
          <polygon
            points={polygonPoints}
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="1"
            strokeLinejoin="round"
            opacity="0.5"
          />

          {/* ==================================================
              DATA POINTS + ORBIT POINTS
              ================================================== */}
          {coords.map((point) => (
            <g
              key={`point-${point.index}`}
              className="
                transition-all
                duration-500
                ease-out
                motion-reduce:transition-none
              "
            >
              {/* Orbit point halo */}
              <circle
                cx={point.orbitX}
                cy={point.orbitY}
                r="11"
                fill={point.color.main}
                fillOpacity="0.10"
              />

              {/* Orbit point */}
              <circle
                cx={point.orbitX}
                cy={point.orbitY}
                r="5"
                fill="#FFFFFF"
                stroke={point.color.main}
                strokeWidth="2.5"
              />

              {/* Data point halo */}
              <circle
                cx={point.dataX}
                cy={point.dataY}
                r="10"
                fill={point.color.main}
                fillOpacity="0.14"
              />

              {/* Data point */}
              <circle
                cx={point.dataX}
                cy={point.dataY}
                r="5"
                fill={point.color.main}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          ))}

          {/* ==================================================
              LABELS
              ================================================== */}
          {coords.map((point) => {
            let anchor = "middle";

            if (Math.cos(point.angle) > 0.35) {
              anchor = "start";
            } else if (Math.cos(point.angle) < -0.35) {
              anchor = "end";
            }

            return (
              <g key={`label-${point.index}`}>
                {/* Label pill */}
                <rect
                  x={
                    point.labelX -
                    (anchor === "middle"
                      ? 42
                      : anchor === "start"
                        ? 0
                        : 84)
                  }
                  y={point.labelY - 15}
                  width="84"
                  height="30"
                  rx="15"
                  fill="#FFFFFF"
                  stroke={point.color.soft}
                  strokeWidth="1.2"
                  opacity="0.98"
                />

                {/* Colored indicator */}
                <circle
                  cx={
                    point.labelX -
                    (anchor === "middle"
                      ? 27
                      : anchor === "start"
                        ? -15
                        : 69)
                  }
                  cy={point.labelY}
                  r="3"
                  fill={point.color.main}
                />

                {/* Dimension name */}
                <text
                  x={
                    point.labelX -
                    (anchor === "middle"
                      ? 17
                      : anchor === "start"
                        ? -25
                        : 59)
                  }
                  y={point.labelY + 3}
                  textAnchor="middle"
                  className="fill-[#0b1a36] text-[9px] font-bold"
                >
                  {point.name.length > 15
                    ? `${point.name.slice(0, 14)}…`
                    : point.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ======================================================
          SCORE SUMMARY
          ====================================================== */}
      <div
        className="
          relative z-10
          mx-auto
          mt-1
          grid
          max-w-[520px]
          grid-cols-3
          gap-2
        "
      >
        {coords.slice(0, 3).map((point) => (
          <div
            key={`summary-${point.index}`}
            className="
              rounded-xl
              border border-slate-100
              bg-slate-50/70
              px-2.5 py-2
              text-center
            "
          >
            <div className="flex items-center justify-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: point.color.main,
                }}
              />

              <span className="truncate text-[9px] font-bold uppercase tracking-wide text-slate-500">
                {point.name}
              </span>
            </div>

            {point.score !== null && (
              <p className="mt-0.5 text-xs font-black text-[#0b1a36]">
                {point.score}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Mobile label */}
      <p className="mt-3 text-center text-[10px] text-slate-400 sm:hidden">
        Each point represents one dimension of your
        discovery profile.
      </p>
    </div>
  );
}

/**
 * ============================================================
 * MAIN SECTION
 * ============================================================
 */
export default function WhoYouAreSection({
  whoYouAre,
}) {
  if (!whoYouAre) {
    return (
      <div className="bg-white border border-[#D3E3F5] rounded-3xl p-6 text-center space-y-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          02 — Who You Are
        </h3>

        <p className="text-xs text-slate-400">
          Discovery evidence is not available yet.
        </p>
      </div>
    );
  }

  const {
    personality_summary,
    summary,
    declared_aspiration,
    dimensions,
    defining_dimensions,
    weaker_dimensions,
    strengths,
    development_areas,
    confidence_score,
    confidence,
    clarity_score,
    clarity,
    evidence_status,
  } = whoYouAre;

  const resolvedSummary =
    personality_summary || summary;

  const resolvedConfidence =
    confidence_score !== undefined
      ? confidence_score
      : confidence;

  const resolvedClarity =
    clarity_score !== undefined
      ? clarity_score
      : clarity;

  const formattedConfidence =
    formatDiagnosticScore(resolvedConfidence);

  const formattedClarity =
    formatDiagnosticScore(resolvedClarity);

  const hasAspiration = Boolean(
    declared_aspiration &&
      typeof declared_aspiration === "string" &&
      declared_aspiration.trim().length > 0
  );

  const hasDimensions =
    Array.isArray(dimensions) &&
    dimensions.length > 0;

  const hasDefiningDimensions =
    Array.isArray(defining_dimensions) &&
    defining_dimensions.length > 0;

  const hasWeakerDimensions =
    Array.isArray(weaker_dimensions) &&
    weaker_dimensions.length > 0;

  const hasStrengths =
    Array.isArray(strengths) &&
    strengths.length > 0;

  const hasDevelopmentAreas =
    Array.isArray(development_areas) &&
    development_areas.length > 0;

  return (
    <section
      className="
        bg-white
        border border-[#D3E3F5]
        rounded-3xl
        px-5 py-6
        sm:px-7 sm:py-8
        shadow-sm
      "
    >
      {/* ======================================================
          SECTION HEADER
          ====================================================== */}
      <div
        className="
          flex flex-wrap
          items-center
          justify-between
          gap-3
          border-b border-slate-100
          pb-4
        "
      >
        <div className="flex items-center gap-2">
          <span
            className="
              flex h-7 w-7
              items-center justify-center
              rounded-xl
              bg-blue-50
              border border-blue-100
              text-[10px]
              font-black
              text-[#1E88E5]
            "
          >
            02
          </span>

          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            02 — Who You Are
          </span>
        </div>

        {evidence_status && (
          <div
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border border-blue-200
              bg-blue-50
              px-3 py-1
              text-[10px]
              font-bold
              text-blue-700
            "
          >
            <ShieldCheck
              size={13}
              className="text-blue-600"
            />

            <span>
              Evidence: {evidence_status}
            </span>
          </div>
        )}
      </div>

      {/* ======================================================
          STATED ASPIRATION
          ====================================================== */}
      {hasAspiration && (
        <div
          className="
            mt-5
            flex flex-col
            gap-2.5
            rounded-2xl
            border border-blue-200
            bg-gradient-to-r
            from-blue-50/80
            to-indigo-50/50
            px-4 py-3.5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
          data-testid="declared-aspiration-card"
        >
          <div className="flex items-center gap-2">
            <Target
              size={16}
              className="text-[#1E88E5]"
            />

            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Stated Career Aspiration
            </span>
          </div>

          <span
            className="
              inline-flex
              w-fit
              rounded-xl
              border border-blue-200
              bg-white
              px-3 py-1.5
              text-sm
              font-bold
              text-[#0b1a36]
            "
          >
            {declared_aspiration.trim()}
          </span>
        </div>
      )}

      {/* ======================================================
          PERSONALITY SUMMARY
          ====================================================== */}
      <div className="mt-5">
        <div className="flex items-center gap-2">
          <Sparkles
            size={17}
            className="text-[#1E88E5]"
          />

          <h2 className="text-lg sm:text-xl font-bold text-[#0b1a36]">
            Personality & Natural Inclination
          </h2>
        </div>

        {resolvedSummary ? (
          <p
            className="
              mt-3
              rounded-2xl
              border border-slate-200
              bg-slate-50
              px-4 py-3.5
              text-sm
              leading-relaxed
              text-slate-700
            "
          >
            {renderFormattedText(resolvedSummary)}
          </p>
        ) : (
          <div
            className="
              mt-3
              rounded-2xl
              border border-slate-200
              bg-slate-50
              p-4
              text-xs
              italic
              text-slate-500
            "
          >
            Personality summary is not available yet.
          </div>
        )}
      </div>

      {/* ======================================================
          6D VECTOR HERO
          ====================================================== */}
      {hasDimensions && (
        <div className="mt-6">
          <DiscoveryVector
            dimensions={dimensions}
          />
        </div>
      )}

      {/* ======================================================
          DEFINING DIMENSIONS
          ====================================================== */}
      <div className="mt-6">
        <h3
          className="
            flex items-center gap-1.5
            text-[10px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-slate-500
          "
        >
          <Target
            size={14}
            className="text-[#1E88E5]"
          />

          <span>Defining Dimensions</span>
        </h3>

        {hasDefiningDimensions ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {defining_dimensions.map(
              (dim, index) => {
                const label =
                  typeof dim === "string"
                    ? dim
                    : dim.name ||
                      JSON.stringify(dim);

                return (
                  <div
                    key={index}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border border-blue-100
                      bg-blue-50/60
                      px-3 py-1.5
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />

                    <span className="text-xs font-bold text-[#0b1a36]">
                      {label}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div
            className="
              mt-3
              rounded-2xl
              border border-slate-200
              bg-slate-50
              p-4
              text-xs
              italic
              text-slate-500
            "
          >
            No defining dimensions identified.
          </div>
        )}
      </div>

      {/* ======================================================
          DEVELOPMENT DIMENSIONS
          ====================================================== */}
      {hasWeakerDimensions && (
        <div className="mt-6">
          <h3
            className="
              flex items-center gap-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-slate-500
            "
          >
            <AlertCircle
              size={14}
              className="text-amber-500"
            />

            <span>Development Dimensions</span>
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            {weaker_dimensions.map(
              (dim, index) => {
                const label =
                  typeof dim === "string"
                    ? dim
                    : dim.name ||
                      JSON.stringify(dim);

                return (
                  <div
                    key={index}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border border-amber-200
                      bg-amber-50/70
                      px-3 py-1.5
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                    <span className="text-xs font-bold text-[#0b1a36]">
                      {label}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* ======================================================
          STRENGTHS / DEVELOPMENT AREAS
          ====================================================== */}
      {(hasStrengths || hasDevelopmentAreas) && (
        <div
          className="
            mt-6
            grid
            gap-3
            sm:grid-cols-2
          "
        >
          {hasStrengths && (
            <div
              className="
                rounded-2xl
                border border-emerald-100
                bg-emerald-50/40
                p-4
              "
            >
              <span
                className="
                  flex items-center gap-1.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                <CheckCircle2
                  size={14}
                  className="text-emerald-600"
                />

                Strengths
              </span>

              <ul className="mt-2 space-y-1.5">
                {strengths.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="
                        flex
                        items-start
                        gap-2
                        text-xs
                        leading-relaxed
                        text-slate-700
                      "
                    >
                      <span className="mt-0.5 font-bold text-emerald-600">
                        •
                      </span>

                      <span>
                        {renderFormattedText(
                          typeof item === "string"
                            ? item
                            : item.title ||
                              JSON.stringify(item)
                        )}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {hasDevelopmentAreas && (
            <div
              className="
                rounded-2xl
                border border-amber-100
                bg-amber-50/40
                p-4
              "
            >
              <span
                className="
                  flex items-center gap-1.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                <AlertCircle
                  size={14}
                  className="text-amber-600"
                />

                Development Areas
              </span>

              <ul className="mt-2 space-y-1.5">
                {development_areas.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="
                        flex
                        items-start
                        gap-2
                        text-xs
                        leading-relaxed
                        text-slate-700
                      "
                    >
                      <span className="mt-0.5 font-bold text-amber-600">
                        •
                      </span>

                      <span>
                        {renderFormattedText(
                          typeof item === "string"
                            ? item
                            : item.title ||
                              JSON.stringify(item)
                        )}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ======================================================
          CONFIDENCE / CLARITY
          ====================================================== */}
      <div
        className="
          mt-6
          grid
          gap-3
          border-t border-slate-100
          pt-5
          sm:grid-cols-2
        "
      >
        {/* Confidence */}
        <div
          className="
            flex items-center
            justify-between
            rounded-2xl
            border border-slate-200
            bg-slate-50/70
            px-4 py-3
          "
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Confidence Score
          </span>

          {formattedConfidence !== null ? (
            <span className="text-lg font-black font-mono text-[#0b1a36]">
              {formattedConfidence}
            </span>
          ) : (
            <span className="text-xs italic text-slate-400">
              Not available
            </span>
          )}
        </div>

        {/* Clarity */}
        <div
          className="
            flex items-center
            justify-between
            rounded-2xl
            border border-slate-200
            bg-slate-50/70
            px-4 py-3
          "
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Clarity Score
          </span>

          {formattedClarity !== null ? (
            <span className="text-lg font-black font-mono text-[#0b1a36]">
              {formattedClarity}
            </span>
          ) : (
            <span className="text-xs italic text-slate-400">
              Not available
            </span>
          )}
        </div>
      </div>
    </section>
  );
}