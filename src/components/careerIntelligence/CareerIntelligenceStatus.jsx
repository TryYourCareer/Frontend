import React from "react";
import { CheckCircle2, AlertTriangle, HelpCircle, Database, Calendar } from "lucide-react";

export function ClassificationBadge({ status }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase();
  if (normalized === "confident") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
        <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
        <span>Confident</span>
      </span>
    );
  }

  if (normalized === "needs_review") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
        <AlertTriangle size={13} className="shrink-0 text-amber-600" />
        <span>Needs Review</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F0F6FC] text-slate-700 border border-[#D3E3F5] shadow-2xs">
      <HelpCircle size={13} className="shrink-0 text-slate-500" />
      <span>{status}</span>
    </span>
  );
}

export function ProvenanceCard({ reviewedBy, reviewedAt, label = "Data Provenance" }) {
  if (!reviewedBy && !reviewedAt) return null;

  // Format dataset identifier cleanly
  const isCuratedCatalog = reviewedBy === "curated_catalog_v1";
  const displaySource = isCuratedCatalog
    ? "Curated Taxonomy Catalog V1"
    : reviewedBy || "Authoritative Dataset";

  let formattedDate = null;
  if (reviewedAt) {
    try {
      const d = new Date(reviewedAt);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="bg-[#F0F6FC] rounded-2xl p-4 border border-[#D3E3F5] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 shadow-2xs">
      <div className="flex items-center gap-2">
        <Database size={15} className="text-[#1E88E5] shrink-0" />
        <div>
          <span className="font-bold text-[#0b1a36]">{label}: </span>
          <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-[#D3E3F5] shadow-2xs">
            {displaySource}
          </span>
        </div>
      </div>

      {formattedDate && (
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
          <Calendar size={13} className="shrink-0 text-slate-400" />
          <span>Curated / Updated: {formattedDate}</span>
        </div>
      )}
    </div>
  );
}