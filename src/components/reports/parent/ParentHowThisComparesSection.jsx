import React from "react";
import {
  Compass,
  Briefcase,
  Layers,
  Info,
  CheckCircle2
} from "lucide-react";

/**
 * Format snake_case or raw keys into clean human-readable labels.
 */
function formatLabel(key) {
  if (!key) return "Characteristic";
  return String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Format value safely to string.
 */
function formatValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "boolean") return val ? "Aligned" : "Developing";
  if (typeof val === "object") return null;
  const str = String(val).trim();
  if (!str) return null;
  return str.replace(/_/g, " ");
}

export default function ParentHowThisComparesSection({ howThisCompares, comparisons }) {
  const data = howThisCompares || comparisons;

  if (!data || typeof data !== "object") {
    return (
      <div className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-xs" data-testid="parent-how-compares-empty">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          03 &bull; Occupational Context
        </h3>
        <p className="text-xs text-slate-400">
          Comparative career context is not currently available in the parent report.
        </p>
      </div>
    );
  }

  const highlights = Array.isArray(data.career_reality_highlights)
    ? data.career_reality_highlights
    : Array.isArray(data.highlights)
    ? data.highlights
    : [];

  const hasHighlights = highlights.length > 0;

  // Process Work DNA / Benchmark comparison entries
  const work_dna_alignment = data.work_dna_alignment || data.comparisons_data || {};
  let dimensionsList = [];
  let totalCount = 0;
  let assessedCount = 0;

  if (work_dna_alignment && typeof work_dna_alignment === "object") {
    if (Array.isArray(work_dna_alignment.dimensions) && work_dna_alignment.dimensions.length > 0) {
      dimensionsList = work_dna_alignment.dimensions.map((dim) => {
        const isAssessed = dim.demonstrated_level !== undefined && dim.demonstrated_level !== null;
        const hasBenchmark = dim.career_required_level !== undefined && dim.career_required_level !== null;
        const status = dim.status ? String(dim.status).toLowerCase() : "exploratory";
        return {
          key: dim.key || dim.dimension,
          label: formatLabel(dim.key || dim.dimension || dim.name),
          value: formatValue(dim.value) || formatValue(dim.demonstrated_level) || (isAssessed ? String(dim.demonstrated_level) : "Assessed during trial"),
          student_value: dim.demonstrated_level !== undefined && dim.demonstrated_level !== null ? String(dim.demonstrated_level).replace(/_/g, " ") : (dim.student_value !== undefined && dim.student_value !== null ? String(dim.student_value).replace(/_/g, " ") : null),
          benchmark_value: hasBenchmark ? String(dim.career_required_level).replace(/_/g, " ") : (dim.benchmark_value !== undefined && dim.benchmark_value !== null ? String(dim.benchmark_value).replace(/_/g, " ") : null),
          difference: dim.difference || dim.alignment_delta || null,
          isDimensional: true,
          status,
          statusLabel: isAssessed ? (status === "aligned" ? "Aligned" : "Developing") : "Exploratory",
          statusColor: isAssessed
            ? status === "aligned"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-slate-100 text-slate-500 border-slate-200",
          rationale: dim.rationale || "Evaluated through cognitive and operational demands.",
        };
      });
    } else {
      // Direct scalar entries
      dimensionsList = Object.entries(work_dna_alignment)
        .filter(([k, val]) => {
          if (k === "dimensions" || k === "total_dimensions_count" || k === "assessed_dimensions_count" || k === "work_dna_alignment_score" || k === "overlap_percentage") return false;
          return formatValue(val) !== null;
        })
        .map(([k, val]) => ({
          key: k,
          label: formatLabel(k),
          value: formatValue(val),
          student_value: formatValue(val),
          benchmark_value: null,
          difference: null,
          isDimensional: false,
          statusLabel: null,
          rationale: null,
        }));
    }

    if (work_dna_alignment.total_dimensions_count !== undefined) {
      totalCount = work_dna_alignment.total_dimensions_count;
    }
    if (work_dna_alignment.assessed_dimensions_count !== undefined) {
      assessedCount = work_dna_alignment.assessed_dimensions_count;
    }
  }

  const hasWorkDNA = dimensionsList.length > 0;

  if (!hasHighlights && !hasWorkDNA) {
    return (
      <div className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-xs" data-testid="parent-how-compares-empty">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          03 &bull; Occupational Context
        </h3>
        <p className="text-xs text-slate-400">
          Comparative career context is not currently available in the parent report.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="parent-how-compares-heading"
      className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8"
      data-testid="parent-how-compares-section"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E88E5] border border-blue-200 text-xs font-bold uppercase tracking-wider">
            <Compass size={13} />
            <span>03 &bull; Occupational Context</span>
          </div>
          <h2
            id="parent-how-compares-heading"
            className="text-xl sm:text-2xl font-black text-[#0b1a36] tracking-tight"
          >
            How This Compares
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Examining day-to-day work characteristics, occupational realities, and behavioral environment compatibility.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-400">
          Occupational Compatibility
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Comparative Common Pathways Table                                  */}
      {/* ------------------------------------------------------------------ */}
      {(() => {
        const comparativePaths = Array.isArray(data.comparative_pathways || data.benchmark_paths)
          ? (data.comparative_pathways || data.benchmark_paths)
          : [
              {
                path: data.career_name || "Selected Target Career",
                entry_route: data.target_entry_route || "Relevant B.Tech / Degree + Projects & Skill Validation",
                entry_salary: data.target_entry_salary || "₹6–18 LPA",
                stability: "High (High Growth & Innovation Demand)",
                is_target: true,
              },
              {
                path: "Core Engineering (Mech/Civil/EE)",
                entry_route: "B.Tech + Campus Placements / GATE",
                entry_salary: "₹4–8 LPA",
                stability: "Moderate–High",
                is_target: false,
              },
              {
                path: "Medicine / MBBS",
                entry_route: "NEET + 5.5 yrs MBBS + NEET-PG",
                entry_salary: "₹6–10 LPA (post-MD)",
                stability: "Very High (Long Gestation Period)",
                is_target: false,
              },
              {
                path: "Government Services / UPSC",
                entry_route: "Degree + UPSC CSE (1–3 yrs prep)",
                entry_salary: "₹7–10 LPA (Group A)",
                stability: "Maximum Stability (Low Success Rate)",
                is_target: false,
              },
            ];

        return (
          <div className="space-y-3" data-testid="comparative-pathways-container">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-[#1E88E5]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Comparison to Common Career Pathways
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Contextual Benchmark Analysis
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5 sm:px-4">Career Track</th>
                    <th className="p-3.5 sm:px-4">Typical Entry Route</th>
                    <th className="p-3.5 sm:px-4">Entry Salary (Illustrative)</th>
                    <th className="p-3.5 sm:px-4">Perceived Stability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {comparativePaths.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50/80 transition ${
                        row.is_target ? "bg-blue-50/40 font-semibold" : ""
                      }`}
                    >
                      <td className="p-3.5 sm:px-4">
                        <div className="flex items-center gap-2">
                          {row.is_target && (
                            <span className="w-2 h-2 rounded-full bg-[#1E88E5] shrink-0" />
                          )}
                          <span className={`text-[#0b1a36] ${row.is_target ? "font-bold text-[#1E88E5]" : "font-medium"}`}>
                            {row.path || row.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 sm:px-4 text-slate-600">
                        {row.entry_route || row.route}
                      </td>
                      <td className="p-3.5 sm:px-4 text-slate-800 font-bold">
                        {row.entry_salary || row.salary}
                      </td>
                      <td className="p-3.5 sm:px-4 text-slate-600">
                        {row.stability || row.perceived_stability}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* ------------------------------------------------------------------ */}
      {/* Career Reality Highlights                                          */}
      {/* ------------------------------------------------------------------ */}
      {hasHighlights && (
        <div className="space-y-3" data-testid="career-reality-highlights-container">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-[#1E88E5]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              What This Career Actually Involves
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((highlight, idx) => (
              <div
                key={idx}
                className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 hover:bg-white hover:border-[#D3E3F5] transition shadow-2xs"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1E88E5] border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={13} />
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {typeof highlight === "string" ? highlight : String(highlight?.text || highlight?.description || highlight)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Work Style & Benchmark Comparison                                  */}
      {/* ------------------------------------------------------------------ */}
      {hasWorkDNA && (
        <div className="space-y-4 pt-2" data-testid="work-dna-comparison-container">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#1E88E5]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Work Style & Environment Compatibility
              </h3>
            </div>
            {totalCount > 0 && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {assessedCount > 0 ? `${assessedCount} / ${totalCount} Dimensions Assessed` : `${totalCount} Core Dimensions Monitored`}
              </span>
            )}
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {dimensionsList.map((dim, idx) => {
              const hasExplicitBenchmark = dim.benchmark_value !== null && dim.benchmark_value !== undefined;
              const hasExplicitStudent = dim.student_value !== null && dim.student_value !== undefined;

              return (
                <div
                  key={dim.key || idx}
                  className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 space-y-2 hover:bg-white hover:border-[#D3E3F5] transition flex flex-col justify-between"
                  data-testid="dimension-comparison-card"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {dim.label}
                      </span>
                      {dim.statusLabel && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${dim.statusColor}`}>
                          {dim.statusLabel}
                        </span>
                      )}
                    </div>

                    {/* Standard scalar or primary value */}
                    {!hasExplicitBenchmark ? (
                      <div className="text-xs sm:text-sm font-bold text-[#0b1a36]">
                        {dim.value}
                      </div>
                    ) : null}

                    {/* Dual Student Profile vs Reference Benchmark presentation */}
                    {hasExplicitBenchmark && (
                      <div className="space-y-1.5 pt-1">
                        <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">Student profile:</span>
                            <span className="font-bold text-[#0b1a36]">
                              {hasExplicitStudent ? dim.student_value : "Demonstrated in trial"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] border-t border-slate-100 pt-1">
                            <span className="text-slate-500 font-medium">Reference benchmark:</span>
                            <span className="font-bold text-slate-700">
                              {dim.benchmark_value}
                            </span>
                          </div>
                          {dim.difference && (
                            <div className="flex items-center justify-between text-[10px] border-t border-slate-100 pt-1 text-slate-500">
                              <span>Difference:</span>
                              <span className="font-semibold text-slate-700">{dim.difference}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Benchmark unavailable fallback state when dimensional data is missing benchmark */}
                  {dim.isDimensional && !hasExplicitBenchmark && (
                    <div className="text-[10px] text-slate-400 italic pt-0.5">
                      Benchmark unavailable
                    </div>
                  )}

                  {dim.rationale && (
                    <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-100/80">
                      {dim.rationale}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Context Notice                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <Info size={13} className="shrink-0 text-slate-400" />
        <span>
          Contextual comparisons are derived from authentic occupational requirements and work style profiles.
        </span>
      </div>
    </section>
  );
}
