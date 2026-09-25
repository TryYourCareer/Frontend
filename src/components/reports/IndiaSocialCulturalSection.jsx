import React from "react";
import {
  MapPin,
  GraduationCap,
  IndianRupee,
  Building2,
  FileText,
  CheckCircle2
} from "lucide-react";

/**
 * Format string safely.
 */
function formatText(val) {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  return str.length > 0 ? str : null;
}

/**
 * IndiaSocialCulturalSection
 * Presents verified India-specific occupational, educational, economic, and regional context.
 * Strictly adheres to canonical data and avoids fabricated prestige rankings, social acceptance
 * scores, or cohort percentiles.
 */
export default function IndiaSocialCulturalSection({
  socialCultural,
  marketOutlook,
  financialOutlook,
  pathForward,
  careerName,
  isParentView = false,
}) {
  const sc = socialCultural || {};
  const perceptionNote = formatText(sc.india_specific_perception);
  const tierDifferences = formatText(sc.tier_differences);
  const benchmarkPerception = formatText(sc.benchmark_perception);
  const source = formatText(sc.source);
  const asOf = formatText(sc.as_of);
  const confidence = formatText(sc.confidence);
  const isAvailable = sc.status === "AVAILABLE" || Boolean(perceptionNote || tierDifferences || benchmarkPerception);

  // Extract India Salary info if available
  const indiaSal =
    marketOutlook?.india_salary ||
    marketOutlook?.salary_india_lpa ||
    financialOutlook?.india_lpa ||
    financialOutlook?.salary_progression?.india_lpa ||
    null;

  const hasSalary = Boolean(
    indiaSal &&
    typeof indiaSal === "object" &&
    (indiaSal.entry || indiaSal.median || indiaSal.experienced || indiaSal.entry_level)
  );

  // Extract stream & degree info if available
  const streams = Array.isArray(pathForward?.required_streams)
    ? pathForward.required_streams
    : [];
  const degrees = Array.isArray(pathForward?.degrees)
    ? pathForward.degrees
    : [];
  const hasEducationContext = streams.length > 0 || degrees.length > 0;

  // If no data at all is available across all dimensions
  const hasAnyData = isAvailable || hasSalary || hasEducationContext;

  if (!hasAnyData) {
    return (
      <section
        aria-labelledby="india-context-heading"
        className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-xs"
        data-testid="india-context-empty"
      >
        <h3 id="india-context-heading" className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          India Social & Regional Context
        </h3>
        <p className="text-xs text-slate-400">
          India-specific regional and social context is currently unavailable for this career.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="india-context-heading"
      className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8"
      data-testid="india-social-cultural-section"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E88E5] border border-blue-200 text-xs font-bold uppercase tracking-wider">
            <MapPin size={13} />
            <span>India Regional & Cultural Context</span>
          </div>
          <h2
            id="india-context-heading"
            className="text-xl sm:text-2xl font-black text-[#0b1a36] tracking-tight"
          >
            India Occupational & Educational Context
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {isParentView
              ? "Verified regional intelligence on educational requirements, economic progression, and industry ecosystem in India."
              : "Factual overview of how this career operates within India's educational framework and employment landscape."}
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-400">
          Regional Intelligence (India)
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Regional Industry & Cultural Perception Note                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3" data-testid="india-perception-block">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-[#1E88E5]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Regional Industry & Occupational Context
          </h3>
        </div>

        {perceptionNote ? (
          <div className="bg-[#F8FAFC] border border-[#D3E3F5] rounded-2xl p-5 sm:p-6 space-y-2 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1E88E5] border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={14} />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-[#0b1a36] leading-relaxed font-medium">
                  {perceptionNote}
                </p>
                {benchmarkPerception && (
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    {benchmarkPerception}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 text-xs text-slate-400 italic"
            data-testid="india-perception-unavailable"
          >
            India-specific occupational perception data is currently unavailable for this profile.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Tier Differences / Regional Availability                        */}
      {/* ------------------------------------------------------------------ */}
      {tierDifferences && (
        <div className="space-y-3" data-testid="india-tier-differences-block">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#1E88E5]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Metro vs. Regional Employment Distribution
            </h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-2xs">
            {tierDifferences}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. Stream & Degree Alignment (Indian Educational Framework)        */}
      {/* ------------------------------------------------------------------ */}
      {hasEducationContext && (
        <div className="space-y-4" data-testid="india-education-context-block">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-[#1E88E5]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Indian Educational & Stream Framework
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {streams.length > 0 && (
              <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Eligible High School Streams
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {streams.map((stream, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-white border border-[#D3E3F5] text-[#0b1a36] font-bold text-xs shadow-2xs"
                    >
                      {stream}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {degrees.length > 0 && (
              <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Recognized Degree Pathways
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {degrees.map((degree, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-xs shadow-2xs"
                    >
                      {degree}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. Salary & Economic Realities (LPA / INR Context)                 */}
      {/* ------------------------------------------------------------------ */}
      {hasSalary && (
        <div className="space-y-3" data-testid="india-salary-context-block">
          <div className="flex items-center gap-2">
            <IndianRupee size={16} className="text-[#1E88E5]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Compensation Benchmark (LPA in INR)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Entry Level (0-2 yrs)
              </span>
              <span className="text-base sm:text-lg font-black text-[#0b1a36]">
                {indiaSal.entry || indiaSal.entry_level || "Not specified"}
              </span>
            </div>

            <div className="bg-[#F8FAFC] border border-blue-200 rounded-2xl p-4 space-y-1 bg-blue-50/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                Median (3-7 yrs)
              </span>
              <span className="text-base sm:text-lg font-black text-[#0b1a36]">
                {indiaSal.median || "Not specified"}
              </span>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Experienced (8+ yrs)
              </span>
              <span className="text-base sm:text-lg font-black text-[#0b1a36]">
                {indiaSal.experienced || indiaSal.senior || "Not specified"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. Provenance & Source Metadata                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <FileText size={13} className="shrink-0 text-slate-400" />
          <span>
            {source ? `Source: ${source}` : "Source: Regional Occupational Taxonomy & Market Intelligence"}
          </span>
        </div>
        {(asOf || confidence) && (
          <div className="flex items-center gap-2 text-slate-400">
            {asOf && <span>As of: {asOf}</span>}
            {confidence && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                Confidence: {confidence}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
