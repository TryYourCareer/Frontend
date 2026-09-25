import React from "react";
import {
  Calendar,
  Target,
  Info,
  Layers
} from "lucide-react";

/**
 * Format category / phase codes into clean human-readable labels.
 */
function formatCategoryLabel(category) {
  if (!category) return null;
  const upper = String(category).toUpperCase();
  if (upper === "ORIENTATION") return "Orientation & Exploration";
  if (upper === "COMPETENCY_BUILDING") return "Competency Building";
  if (upper === "PRACTICE_AND_PROJECTS") return "Practice & Application";
  if (upper === "EXPLORATION") return "Exploration";
  if (upper === "SKILL_DEVELOPMENT") return "Skill Development";
  if (upper === "FOUNDATIONAL_SKILL") return "Foundational Mastery";
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Helper to check if an array has items.
 */
function hasItems(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

export default function NextSixToTwelveMonthsSection({ actionPlan, realityCheck }) {
  const {
    timeframes = null,
    ordered_steps = [],
    has_explicit_timeframes = false,
  } = actionPlan || {};

  const rawGaps = realityCheck?.development_gaps || [];
  const seenGapKeys = new Set();
  const developmentGaps = [];
  for (const gap of rawGaps) {
    const compName =
      gap.title ||
      gap.target_title ||
      gap.competency_name ||
      gap.name ||
      (gap.target_key && gap.target_key !== "unknown"
        ? gap.target_key.replace("comp_", "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : null);
    if (!compName) continue;
    const normKey = (gap.target_key || compName).toLowerCase().trim();
    if (!seenGapKeys.has(normKey)) {
      seenGapKeys.add(normKey);
      developmentGaps.push({
        ...gap,
        displayName: compName,
        displayDesc: gap.rationale || gap.gap_description || gap.description,
      });
    }
  }

  const hasExplicitTimeframes = Boolean(
    has_explicit_timeframes &&
    timeframes &&
    (hasItems(timeframes.next_30_days) ||
      hasItems(timeframes.next_60_days) ||
      hasItems(timeframes.next_90_days) ||
      hasItems(timeframes.next_6_12_months))
  );

  const hasOrderedSteps = hasItems(ordered_steps);
  const hasGaps = hasItems(developmentGaps);

  // If no action data and no development gaps exist, render neutral state
  if (!hasExplicitTimeframes && !hasOrderedSteps && !hasGaps) {
    return (
      <div className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          10 — Forward Horizon
        </h3>
        <p className="text-xs text-slate-400">
          Specific 6–12 month planning guidance is not currently available in the report data.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="future-horizon-heading"
      className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xs space-y-6"
      data-testid="next-6-12-months-section"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E88E5] border border-blue-200/70 flex items-center justify-center font-bold text-xs">
              10
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              10 — Forward Horizon
            </span>
          </div>
          <h2
            id="future-horizon-heading"
            className="text-xl sm:text-2xl font-black text-[#0b1a36] tracking-tight"
          >
            Your Next 6–12 Months
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Forward-looking development priorities, evidence-building focus areas, and actionable next steps supported by your evaluation results.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-400">
          Forward Action Blueprint
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CASE A: Explicit Backend Timeframes                                */}
      {/* ------------------------------------------------------------------ */}
      {hasExplicitTimeframes ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#1E88E5]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Structured Timeline Milestones
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {hasItems(timeframes.next_30_days) && (
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E88E5] block">
                  Next 30 Days
                </span>
                <ul className="space-y-2">
                  {timeframes.next_30_days.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E88E5] mt-1.5 shrink-0" />
                      <span>{typeof item === "string" ? item : item.title || item.action || JSON.stringify(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasItems(timeframes.next_60_days) && (
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E88E5] block">
                  Next 60 Days
                </span>
                <ul className="space-y-2">
                  {timeframes.next_60_days.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E88E5] mt-1.5 shrink-0" />
                      <span>{typeof item === "string" ? item : item.title || item.action || JSON.stringify(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasItems(timeframes.next_90_days) && (
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E88E5] block">
                  Next 90 Days
                </span>
                <ul className="space-y-2">
                  {timeframes.next_90_days.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E88E5] mt-1.5 shrink-0" />
                      <span>{typeof item === "string" ? item : item.title || item.action || JSON.stringify(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasItems(timeframes.next_6_12_months) && (
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E88E5] block">
                  Next 6–12 Months
                </span>
                <ul className="space-y-2">
                  {timeframes.next_6_12_months.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E88E5] mt-1.5 shrink-0" />
                      <span>{typeof item === "string" ? item : item.title || item.action || JSON.stringify(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/* CASE B: Evidence-Building Actions Inner Box                        */}
      {/* ------------------------------------------------------------------ */}
      {hasOrderedSteps && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-[#1E88E5]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Evidence-Building Actions
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Supported developmental focus
            </span>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-5">
            <div className="space-y-2.5">
              {ordered_steps.map((step, idx) => {
                const title = step.title || step.growth_action || step.action || "Development Step";
                const categoryLabel = formatCategoryLabel(step.category || step.phase);
                const rationale = step.rationale || step.description;
                const source = step.source;
                const timeframe = step.timeframe;

                return (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-2 hover:border-slate-300 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-50 text-[#1E88E5] border border-blue-200/70 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-[#0b1a36]">
                          {title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {categoryLabel && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1E88E5] border border-blue-200/70 text-[10px] font-bold">
                            {categoryLabel}
                          </span>
                        )}
                        {timeframe && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                            {timeframe}
                          </span>
                        )}
                      </div>
                    </div>

                    {rationale && (
                      <p className="text-xs text-slate-600 leading-relaxed font-normal pl-7">
                        {rationale}
                      </p>
                    )}

                    {source && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1.5 pl-7 border-t border-slate-100">
                        <span>Source:</span>
                        <span className="font-medium text-slate-500">{source}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Competencies to Strengthen / Development Gaps                      */}
      {/* ------------------------------------------------------------------ */}
      {hasGaps && (
        <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Target size={15} className="text-[#1E88E5]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Competencies to Strengthen
            </h3>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {developmentGaps.map((gap, idx) => {
              const compName = gap.displayName || gap.title || gap.target_title || gap.competency_name || gap.name || "Growth Area";
              const desc = gap.displayDesc || gap.rationale || gap.gap_description || gap.description;

              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0b1a36]">
                      {compName}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Growth Area
                    </span>
                  </div>
                  {desc && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Footer Notice & Evidence Synthesis Attribution                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <Info size={13} className="shrink-0 text-slate-400" />
        <span>
          Forward actions reflect evidence synthesized from your trial performance, discovery test, and career readiness evaluations.
        </span>
      </div>
    </section>
  );
}
