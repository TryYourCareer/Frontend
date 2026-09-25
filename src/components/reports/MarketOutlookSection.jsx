import React from "react";
import {
  DollarSign,
  TrendingUp,
  Globe,
  Building2,
  Calendar
} from "lucide-react";
import DataProvenanceTag from "./DataProvenanceTag";

/**
 * Format salary tier values safely without currency conversion or averaging.
 */
function formatSalaryValue(val, defaultSuffix = "") {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") return val;
  if (typeof val === "number") {
    if (val < 100) {
      // LPA notation (e.g. 6.5, 14, 28)
      return `${val} LPA`;
    }
    return `${val.toLocaleString()} ${defaultSuffix}`.trim();
  }
  if (typeof val === "object") {
    if (val.range) return val.range;
    if (val.min !== undefined && val.max !== undefined) {
      return `${val.min} – ${val.max} ${val.currency || defaultSuffix}`.trim();
    }
    if (val.amount !== undefined) {
      return `${val.amount} ${val.currency || defaultSuffix}`.trim();
    }
    return JSON.stringify(val);
  }
  return String(val);
}

/**
 * Extract salary breakdown tiers (entry, mid, senior) safely from salary dictionary.
 */
function extractSalaryTiers(salaryObj, defaultSuffix = "") {
  if (!salaryObj || typeof salaryObj !== "object") return null;

  const tiers = [];
  const keyMap = [
    { keys: ["entry", "entry_level", "fresher", "junior", "min"], label: "Entry Level" },
    { keys: ["mid", "mid_level", "intermediate", "median", "average"], label: "Mid-Career" },
    { keys: ["senior", "senior_level", "lead", "principal", "max"], label: "Senior / Lead" },
  ];

  for (const { keys, label } of keyMap) {
    for (const k of keys) {
      if (salaryObj[k] !== undefined && salaryObj[k] !== null) {
        tiers.push({
          label,
          value: formatSalaryValue(salaryObj[k], defaultSuffix),
        });
        break;
      }
    }
  }

  if (tiers.length > 0) return tiers;

  // Fallback for custom keys
  const customEntries = Object.entries(salaryObj).filter(
    ([k, v]) => v !== null && v !== undefined && k !== "currency" && k !== "source" && k !== "as_of"
  );
  if (customEntries.length > 0) {
    return customEntries.map(([k, v]) => ({
      label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: formatSalaryValue(v, defaultSuffix),
    }));
  }

  return null;
}

export default function MarketOutlookSection({ marketOutlook }) {
  if (!marketOutlook) {
    return (
      <div className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          06 — Market Outlook
        </h3>
        <p className="text-xs text-slate-400">
          Market and compensation data is not currently available for this career.
        </p>
      </div>
    );
  }

  const {
    india_salary,
    global_salary,
    salary_india_lpa,
    salary_global_usd,
    salary,
    demand_trend,
    demand_score,
    demand_rationale,
    demand,
    growth_rate,
    growth_trend,
    projected_growth,
    industries = [],
    sectors = [],
    geography,
    provenance,
    research_date,
    caveats,
    limitations,
  } = marketOutlook;

  // Resolve structured vs flat properties
  const indiaSal = india_salary || salary_india_lpa || salary?.india || salary?.salary_india_lpa;
  const globalSal = global_salary || salary_global_usd || salary?.global_salary || salary?.salary_global_usd;

  const trend = demand_trend || demand?.trend || demand?.demand_trend || marketOutlook.demand_trend_raw;
  const score = demand_score !== undefined ? demand_score : demand?.score;
  const rationale = demand_rationale || demand?.rationale || demand?.demand_rationale;

  const resDate = research_date || provenance?.research_date || marketOutlook.as_of;

  const indiaTiers = extractSalaryTiers(indiaSal, "LPA");
  const globalTiers = extractSalaryTiers(globalSal, "USD");

  const sectorList = Array.isArray(sectors) && sectors.length > 0
    ? sectors
    : Array.isArray(industries) && industries.length > 0
    ? industries
    : [];

  const hasSalaryData = indiaTiers !== null || globalTiers !== null;
  const hasDemandData = trend || score !== undefined || rationale;
  const hasGrowthData = growth_rate || growth_trend || projected_growth;

  return (
    <section
      aria-labelledby="market-outlook-heading"
      className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xs space-y-6"
      data-testid="market-outlook-section"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E88E5] border border-blue-200/70 flex items-center justify-center font-bold text-xs">
              06
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              06 — Market Outlook
            </span>
          </div>
          <h2
            id="market-outlook-heading"
            className="text-xl sm:text-2xl font-black text-[#0b1a36] tracking-tight"
          >
            External Market Outlook & Compensation
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Objective economic landscape, compensation benchmarks by experience tier, hiring demand signals, and sector applications.
          </p>
        </div>

        {trend && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-xs font-bold text-blue-900 shrink-0">
            <TrendingUp size={14} className="text-[#1E88E5]" />
            <span>Demand Trend: {trend}</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Market Demand & Hiring Landscape Inner Box                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-[#1E88E5]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Industry Demand & Hiring Dynamics
          </h3>
        </div>

        {hasDemandData ? (
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Hiring Trajectory:
                </span>
                <span className="text-sm font-bold text-[#0b1a36]">
                  {trend || "Moderate / Stable"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {score !== undefined && score !== null && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
                    Demand Index: {score}/100
                  </span>
                )}
                <DataProvenanceTag status={provenance?.status || "verified"} />
              </div>
            </div>

            {rationale ? (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                {rationale}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-500">
            Market demand data is not currently available for this career.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Compensation & Salary Benchmarks Inner Boxes                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-[#1E88E5]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Compensation Benchmarks
          </h3>
        </div>

        {hasSalaryData ? (
          <div className="grid gap-4 md:grid-cols-2">
            {/* India Salary Tiers */}
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E88E5] flex items-center justify-center font-bold text-xs border border-blue-200/70">
                    ₹
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0b1a36]">
                      India Compensation
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      Standard domestic LPA benchmarks
                    </span>
                  </div>
                </div>
                <DataProvenanceTag status="verified" label="Verified Data" />
              </div>

              {indiaTiers && indiaTiers.length > 0 ? (
                <div className="space-y-2">
                  {indiaTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-medium text-slate-600">
                        {tier.label}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#0b1a36]">
                        {tier.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200/80 rounded-xl p-3 text-xs text-slate-500">
                  No India compensation data is available yet.
                </div>
              )}
            </div>

            {/* Global Salary Tiers */}
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200/70">
                    <Globe size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0b1a36]">
                      Global Market Benchmarks
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      International compensation tiers
                    </span>
                  </div>
                </div>
                <DataProvenanceTag status="estimated" label="Global Benchmark" />
              </div>

              {globalTiers && globalTiers.length > 0 ? (
                <div className="space-y-2">
                  {globalTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-medium text-slate-600">
                        {tier.label}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#0b1a36]">
                        {tier.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200/80 rounded-xl p-3 text-xs text-slate-500">
                  Global compensation data is not currently available.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-500">
            No salary data is available yet for this career.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Industry Sectors & Growth Dynamics Inner Box                    */}
      {/* ------------------------------------------------------------------ */}
      {(sectorList.length > 0 || hasGrowthData || geography) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-[#1E88E5]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Industry Sectors & Growth Context
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {sectorList.length > 0 && (
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-[#0b1a36] block">
                  Primary Hiring Sectors ({sectorList.length})
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sectorList.map((sec, idx) => (
                    <span
                      key={idx}
                      className="bg-white text-slate-800 font-semibold text-xs px-2.5 py-1 rounded-lg border border-slate-200/80"
                    >
                      {typeof sec === "string" ? sec : sec?.name || JSON.stringify(sec)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hasGrowthData && (
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-[#0b1a36] block">
                  Projected Growth Dynamics
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {projected_growth || growth_trend || growth_rate}
                </p>
              </div>
            )}

            {geography && (
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-bold text-[#0b1a36] block">
                  Geographic Scope
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {typeof geography === "string" ? geography : (geography.scope || geography.region || JSON.stringify(geography))}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. Research Provenance, As-Of Date & Limitations                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-slate-400" />
          <span>
            {resDate
              ? `Market benchmark research as of: ${resDate}`
              : "Market benchmarks recorded from occupational research."}
          </span>
        </div>

        {caveats || limitations ? (
          <div className="text-[11px] text-slate-500 italic">
            Note: {caveats || limitations}
          </div>
        ) : null}
      </div>
    </section>
  );
}
