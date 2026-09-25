import React from "react";
import { Link } from "react-router-dom";
import {
  GitFork,
  ArrowRight,
  Info
} from "lucide-react";

/**
 * Format relation_type enum into clean human-readable label.
 */
function formatRelationType(type) {
  if (!type) return "Related Direction";
  const upper = String(type).toUpperCase();
  if (upper === "EVIDENCE_BASED_ALTERNATIVE") return "Evidence-Supported Alternative";
  if (upper === "RELATED_CAREER") return "Related Discipline";
  if (upper === "SAME_CAREER_FAMILY") return "Same Career Family";
  if (upper === "WORK_DNA_OVERLAP") return "Work DNA Overlap";
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Get badge styling for relationship type.
 */
function getRelationBadgeClasses(type) {
  const upper = String(type || "").toUpperCase();
  if (upper === "EVIDENCE_BASED_ALTERNATIVE") {
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
  if (upper === "SAME_CAREER_FAMILY") {
    return "bg-blue-50 text-[#1E88E5] border-blue-200";
  }
  if (upper === "WORK_DNA_OVERLAP") {
    return "bg-purple-50 text-purple-800 border-purple-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

/**
 * Format fit tier safely if supplied by backend.
 */
function formatFitTier(tier) {
  if (!tier) return null;
  return tier.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AlternativesSection({ alternatives = [] }) {
  const items = Array.isArray(alternatives) ? alternatives : [];

  if (items.length === 0) {
    return (
      <div className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          09 — Alternatives
        </h3>
        <p className="text-xs text-slate-400">
          Alternative career directions are not currently available.
        </p>
      </div>
    );
  }

  return (
    <section aria-labelledby="alternatives-heading" className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E88E5] border border-blue-200 text-xs font-bold uppercase tracking-wider">
            <GitFork size={13} />
            <span>09 — Alternatives</span>
          </div>
          <h2 id="alternatives-heading" className="text-xl sm:text-2xl font-black text-[#0b1a36] tracking-tight">
            If Not This, Then What?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Other career directions supported by the current evidence and candidate evaluations.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-400">
          {items.length} {items.length === 1 ? "Direction" : "Directions"} Identified
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Alternatives Grid / Cards                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((alt, idx) => {
          const name = alt.career_name || alt.name || "Career Direction";
          const relLabel = formatRelationType(alt.relation_type);
          const badgeClasses = getRelationBadgeClasses(alt.relation_type);
          const differentiator = alt.key_differentiator || alt.differentiator || alt.rationale;
          const source = alt.evidence_source || alt.source;
          const fitTier = formatFitTier(alt.existing_fit_tier || alt.fit_tier);
          const careerId = alt.career_id || alt.id;
          const slug = alt.slug;

          const targetRoute = careerId
            ? `/careers/${encodeURIComponent(careerId)}/decision-report`
            : slug
            ? `/career-intelligence/career/${encodeURIComponent(slug)}`
            : null;

          return (
            <div
              key={idx}
              className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:bg-white hover:border-[#D3E3F5] transition shadow-2xs"
            >
              {/* Top Meta & Title */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold ${badgeClasses}`}>
                    {relLabel}
                  </span>
                  {fitTier && (
                    <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      {fitTier}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#0b1a36] leading-snug">
                  {name}
                </h3>

                {differentiator && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Evidence Context
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {differentiator}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer with Source & Link */}
              <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                {source && (
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span>Source:</span>
                    <span className="font-medium text-slate-500">{source}</span>
                  </div>
                )}

                {targetRoute ? (
                  <Link
                    to={targetRoute}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E88E5] hover:text-blue-700 transition"
                  >
                    <span>View Career Report</span>
                    <ArrowRight size={13} />
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Report link not available
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Evidence Notice                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <Info size={13} className="shrink-0 text-slate-400" />
        <span>
          Alternative directions are derived from multi-dimensional evaluation matching, occupational families, and demonstrated competency overlaps.
        </span>
      </div>
    </section>
  );
}
