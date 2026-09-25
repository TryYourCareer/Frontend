import React from "react";
import { 
  Compass, 
  Sparkles, 
  Target,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from "lucide-react";

/**
 * Safely renders text with markdown bold markers (**text**) rendered as <strong> elements.
 */
export function renderFormattedText(text) {
  if (!text || typeof text !== "string") return text;
  const parts = text.split(/(\$\$|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-[#0b1a36]">
          {inner}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Format confidence/clarity scores safely for presentation.
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
 * Pure SVG Radar Chart for Multi-Dimension Visualization (3+ dimensions)
 */
function DiscoveryRadarChart({ dimensions }) {
  if (!dimensions || dimensions.length < 3) return null;

  const width = 340;
  const height = 300;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 95;
  const total = dimensions.length;

  // Levels: 20%, 40%, 60%, 80%, 100%
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Calculate polygon points for each level ring
  const ringPolygons = levels.map((lvl) => {
    const r = lvl * radius;
    const pts = dimensions.map((_, i) => {
      const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
      return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
    });
    return pts.join(" ");
  });

  // Calculate vertex coordinates for data polygon
  const dataCoords = dimensions.map((dim, i) => {
    const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
    const rawScore = typeof dim.score === "number" ? dim.score : (typeof dim.level === "number" ? dim.level : 50);
    const scorePct = rawScore <= 1.0 && rawScore > 0 ? rawScore : rawScore / 100;
    const clamped = Math.min(1.0, Math.max(0.05, scorePct));
    const r = clamped * radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y, angle, rawScore, name: dim.name || dim.dimension || `D${i + 1}` };
  });

  const dataPolygonPoints = dataCoords
    .map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");

  return (
    <div className="bg-white border border-[#D3E3F5] rounded-2xl p-4 flex flex-col items-center justify-center shadow-xs">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
        <Compass size={14} className="text-[#1E88E5]" />
        <span>Six-Dimension Discovery Profile</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[320px] h-auto overflow-visible select-none"
        aria-label="Six-Dimension Discovery Radar Chart"
      >
        {/* Background Grid Rings */}
        {ringPolygons.map((pts, idx) => (
          <polygon
            key={idx}
            points={pts}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1"
            strokeDasharray={idx === levels.length - 1 ? "none" : "2,2"}
          />
        ))}

        {/* Axis Spokes from center to outer ring */}
        {dimensions.map((_, i) => {
          const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
          const x2 = cx + radius * Math.cos(angle);
          const y2 = cy + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          );
        })}

        {/* Shaded Data Polygon */}
        <polygon
          points={dataPolygonPoints}
          fill="#1E88E5"
          fillOpacity="0.22"
          stroke="#1E88E5"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Data Vertices & Score Tooltip Dots */}
        {dataCoords.map((c, i) => (
          <g key={i}>
            <circle
              cx={c.x}
              cy={c.y}
              r="4.5"
              fill="#0b1a36"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* Axis Labels */}
        {dimensions.map((dim, i) => {
          const angle = (i * 2 * Math.PI) / total - Math.PI / 2;
          const labelDist = radius + 22;
          const lx = cx + labelDist * Math.cos(angle);
          const ly = cy + labelDist * Math.sin(angle);
          const name = dim.name || dim.dimension || `Dim ${i + 1}`;
          
          let textAnchor = "middle";
          if (Math.cos(angle) > 0.3) textAnchor = "start";
          else if (Math.cos(angle) < -0.3) textAnchor = "end";

          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor={textAnchor}
              dominantBaseline="central"
              className="text-[10px] font-bold fill-[#0b1a36]"
            >
              {name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default function WhoYouAreSection({ whoYouAre }) {
  if (!whoYouAre) {
    return (
      <div className="bg-white border border-[#D3E3F5] rounded-3xl p-6 text-center space-y-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">02 — Who You Are</h3>
        <p className="text-xs text-slate-400">Discovery evidence is not available yet.</p>
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

  const resolvedSummary = personality_summary || summary;
  const resolvedConfidence = confidence_score !== undefined ? confidence_score : confidence;
  const resolvedClarity = clarity_score !== undefined ? clarity_score : clarity;
  const formattedConfidence = formatDiagnosticScore(resolvedConfidence);
  const formattedClarity = formatDiagnosticScore(resolvedClarity);

  const hasAspiration = Boolean(declared_aspiration && typeof declared_aspiration === "string" && declared_aspiration.trim().length > 0);
  const hasDimensions = Array.isArray(dimensions) && dimensions.length > 0;
  const hasDefiningDimensions = Array.isArray(defining_dimensions) && defining_dimensions.length > 0;
  const hasWeakerDimensions = Array.isArray(weaker_dimensions) && weaker_dimensions.length > 0;
  const hasStrengths = Array.isArray(strengths) && strengths.length > 0;
  const hasDevelopmentAreas = Array.isArray(development_areas) && development_areas.length > 0;

  return (
    <section className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            02 — Who You Are
          </span>
        </div>
        {evidence_status && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
            <ShieldCheck size={14} className="text-blue-600" />
            <span>Evidence: {evidence_status}</span>
          </div>
        )}
      </div>

      {/* Stated Career Aspiration (Section 2 Requirement) */}
      {hasAspiration && (
        <div
          className="bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
          data-testid="declared-aspiration-card"
        >
          <div className="flex items-center gap-2">
            <Target size={16} className="text-[#1E88E5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Stated Career Aspiration
            </span>
          </div>
          <span className="text-sm font-bold text-[#0b1a36] bg-white px-3.5 py-1.5 rounded-xl border border-blue-200 shadow-2xs">
            {declared_aspiration.trim()}
          </span>
        </div>
      )}

      {/* Personality / Identity Summary */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#1E88E5]" />
          <h2 className="text-lg sm:text-xl font-bold text-[#0b1a36]">
            Personality & Natural Inclination
          </h2>
        </div>
        {resolvedSummary ? (
          <p className="text-sm text-slate-700 leading-relaxed bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl p-5">
            {renderFormattedText(resolvedSummary)}
          </p>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 italic">
            Personality summary is not available yet.
          </div>
        )}
      </div>

      {/* Discovery Dimensions with Radar Chart & Cards */}
      {hasDimensions && (
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Discovery Dimensions
          </h3>

          {/* Render Radar Chart when 3 or more dimensions are present */}
          {dimensions.length >= 3 && (
            <div className="mb-4">
              <DiscoveryRadarChart dimensions={dimensions} />
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {dimensions.map((dim, idx) => {
              const name = dim.name || dim.dimension || `Dimension ${idx + 1}`;
              const score = dim.score;
              const level = dim.level;
              const description = dim.description;
              const numScore = typeof score === "number" ? score : null;
              const pct = numScore !== null ? (numScore <= 1.0 ? numScore * 100 : numScore) : null;

              return (
                <div
                  key={idx}
                  className="bg-[#F0F6FC]/60 border border-[#D3E3F5] rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#0b1a36]">
                      {name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {level && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {level}
                        </span>
                      )}
                      {score !== undefined && score !== null && (
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {score}
                        </span>
                      )}
                    </div>
                  </div>
                  {pct !== null && (
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1E88E5] rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                      />
                    </div>
                  )}
                  {description && (
                    <p className="text-xs text-slate-600 leading-snug">
                      {renderFormattedText(description)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Defining Dimensions */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Target size={15} className="text-[#1E88E5]" />
          <span>Defining Dimensions</span>
        </h3>

        {hasDefiningDimensions ? (
          <div className="flex flex-wrap gap-2.5">
            {defining_dimensions.map((dim, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[#D3E3F5] shadow-xs"
              >
                <div className="h-2 w-2 rounded-full bg-[#1E88E5]" />
                <span className="text-xs sm:text-sm font-bold text-[#0b1a36]">
                  {typeof dim === "string" ? dim : dim.name || JSON.stringify(dim)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 italic">
            No defining dimensions identified.
          </div>
        )}
      </div>

      {/* Weaker / Development Dimensions (if provided) */}
      {hasWeakerDimensions && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <AlertCircle size={15} className="text-amber-500" />
            <span>Development Dimensions</span>
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {weaker_dimensions.map((dim, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-amber-200 shadow-xs"
              >
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs sm:text-sm font-bold text-[#0b1a36]">
                  {typeof dim === "string" ? dim : dim.name || JSON.stringify(dim)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Development Areas (if provided) */}
      {(hasStrengths || hasDevelopmentAreas) && (
        <div className="grid gap-3.5 sm:grid-cols-2 pt-2">
          {hasStrengths && (
            <div className="bg-[#F0F6FC]/60 border border-[#D3E3F5] rounded-2xl p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Strengths</span>
              </span>
              <ul className="space-y-1 text-xs text-slate-700">
                {strengths.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{renderFormattedText(typeof item === "string" ? item : item.title || JSON.stringify(item))}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasDevelopmentAreas && (
            <div className="bg-[#F0F6FC]/60 border border-[#D3E3F5] rounded-2xl p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-600" />
                <span>Development Areas</span>
              </span>
              <ul className="space-y-1 text-xs text-slate-700">
                {development_areas.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{renderFormattedText(typeof item === "string" ? item : item.title || JSON.stringify(item))}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Diagnostic Confidence & Clarity Metrics */}
      <div className="grid gap-3.5 sm:grid-cols-2 pt-2 border-t border-slate-100">
        {/* Confidence Metric */}
        <div className="bg-[#F0F6FC]/60 border border-[#D3E3F5] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Confidence Score
            </span>
          </div>
          <div>
            {formattedConfidence !== null ? (
              <span className="text-lg font-black text-[#0b1a36] font-mono">
                {formattedConfidence}
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">Not available yet</span>
            )}
          </div>
        </div>

        {/* Clarity Metric */}
        <div className="bg-[#F0F6FC]/60 border border-[#D3E3F5] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Clarity Score
            </span>
          </div>
          <div>
            {formattedClarity !== null ? (
              <span className="text-lg font-black text-[#0b1a36] font-mono">
                {formattedClarity}
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
