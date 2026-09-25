import React from "react";
import {
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  Info,
  Sparkles
} from "lucide-react";

/**
 * Safely renders text with markdown bold markers (**text**) rendered as <strong> elements.
 */
function renderFormattedText(text) {
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
 * Safely extract display title from an evidence item.
 */
function getItemTitle(item, fallback) {
  if (!item) return fallback;
  if (typeof item === "string") return item;
  return (
    item.title ||
    item.name ||
    item.target_title ||
    item.competency_name ||
    item.growth_action ||
    fallback
  );
}

/**
 * Safely extract display description/rationale from an evidence item.
 */
function getItemDescription(item) {
  if (!item || typeof item === "string") return null;
  return (
    item.description ||
    item.rationale ||
    item.gap_description ||
    item.observation ||
    item.reason ||
    null
  );
}

/**
 * Safely extract level badge score/string if present.
 */
function getItemLevel(item) {
  if (!item || typeof item === "string") return null;
  const lvl = item.demonstrated_level !== undefined ? item.demonstrated_level : item.current_level !== undefined ? item.current_level : item.level;
  if (lvl === null || lvl === undefined) return null;
  return typeof lvl === "number" ? `Level ${lvl.toFixed(1)}` : String(lvl);
}

export default function ParentEvidenceSection({ evidence }) {
  if (!evidence) {
    return (
      <div className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          02 — Demonstrated Evidence
        </h3>
        <p className="text-xs text-slate-400">
          Evidence details are not currently available in the parent report.
        </p>
      </div>
    );
  }

  const {
    what_the_evidence_shows,
    demonstrated_strengths = [],
    growth_areas = [],
    untested_areas = [],
  } = evidence;

  const strengthsList = Array.isArray(demonstrated_strengths) ? demonstrated_strengths : [];
  const growthList = Array.isArray(growth_areas) ? growth_areas : [];
  const untestedList = Array.isArray(untested_areas) ? untested_areas : [];

  const hasAnyData =
    Boolean(what_the_evidence_shows) ||
    strengthsList.length > 0 ||
    growthList.length > 0 ||
    untestedList.length > 0;

  if (!hasAnyData) {
    return (
      <div className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          02 — Demonstrated Evidence
        </h3>
        <p className="text-xs text-slate-400">
          Evidence details are not currently available in the parent report.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="parent-evidence-heading"
      className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Section Header                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-6">
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            02 — Evidence, Not Just Enthusiasm
          </span>
          <h2
            id="parent-evidence-heading"
            className="text-xl sm:text-2xl font-bold text-[#0b1a36]"
          >
            Evidence, Not Just Enthusiasm
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Distinguishing verified hands-on competencies from areas requiring development or further exploration.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-400">
          Practical Task Evidence
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Plain-Language Overview Narrative                                  */}
      {/* ------------------------------------------------------------------ */}
      {what_the_evidence_shows && (
        <div className="bg-gradient-to-br from-[#F0F6FC] to-[#e8f1fa] border border-[#D3E3F5] rounded-2xl p-5 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#1E88E5]" />
            <span>What the Evidence Shows</span>
          </span>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {renderFormattedText(what_the_evidence_shows)}
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Three Pillars of Evidence Grid                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Pillar 1: Demonstrated Evidence / Strengths */}
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b1a36]">
                  Demonstrated Evidence ({strengthsList.length})
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  Verified through trial tasks
                </span>
              </div>
            </div>

            {strengthsList.length > 0 ? (
              <ul className="space-y-2.5">
                {strengthsList.map((item, idx) => {
                  const title = getItemTitle(item, "Demonstrated Competency");
                  const desc = getItemDescription(item);
                  const lvl = getItemLevel(item);

                  return (
                    <li
                      key={idx}
                      className="bg-white border border-slate-200/90 rounded-xl p-3 space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#0b1a36] block">
                          {title}
                        </span>
                        {lvl && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            {lvl}
                          </span>
                        )}
                      </div>
                      {desc && (
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {renderFormattedText(desc)}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                No specific trial strengths recorded for this simulation.
              </p>
            )}
          </div>
        </div>

        {/* Pillar 2: Areas to Develop */}
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <TrendingUp size={14} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b1a36]">
                  Areas to Develop ({growthList.length})
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  Targeted growth opportunities
                </span>
              </div>
            </div>

            {growthList.length > 0 ? (
              <ul className="space-y-2.5">
                {growthList.map((item, idx) => {
                  const title = getItemTitle(item, "Development Focus");
                  const desc = getItemDescription(item);
                  const lvl = getItemLevel(item);

                  return (
                    <li
                      key={idx}
                      className="bg-white border border-slate-200/90 rounded-xl p-3 space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#0b1a36] block">
                          {title}
                        </span>
                        {lvl && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                            {lvl}
                          </span>
                        )}
                      </div>
                      {desc && (
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {renderFormattedText(desc)}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                No major growth gaps identified in baseline trial rubrics.
              </p>
            )}
          </div>
        </div>

        {/* Pillar 3: Not Yet Tested */}
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center">
                <HelpCircle size={14} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b1a36]">
                  Not Yet Tested ({untestedList.length})
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  Future practical horizons
                </span>
              </div>
            </div>

            {untestedList.length > 0 ? (
              <ul className="space-y-2.5">
                {untestedList.map((item, idx) => {
                  const title = getItemTitle(item, "Untested Dimension");
                  const desc = getItemDescription(item);

                  return (
                    <li
                      key={idx}
                      className="bg-white border border-slate-200/90 rounded-xl p-3 space-y-1 shadow-2xs"
                    >
                      <span className="text-xs font-bold text-[#0b1a36] block">
                        {title}
                      </span>
                      {desc && (
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {renderFormattedText(desc)}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                All primary simulation domains were exercised during the trial.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Evidence Attribution Notice                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <Info size={13} className="shrink-0 text-slate-400" />
        <span>
          Evaluations are grounded in rubric-scored trial mission tasks and objective problem-solving behaviors.
        </span>
      </div>
    </section>
  );
}
