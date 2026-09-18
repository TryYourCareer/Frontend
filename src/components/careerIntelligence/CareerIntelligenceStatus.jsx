import React from "react";
import { CheckCircle2, AlertTriangle, HelpCircle, Database, Calendar } from "lucide-react";

export function ClassificationBadge({ status }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase();
  if (normalized === "confident") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={13} className="shrink-0 text-emerald-600" />
        <span>Confident</span>
      </span>
    );
  }

  if (normalized === "needs_review") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle size={13} className="shrink-0 text-amber-600" />
        <span>Needs Review</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
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
    <div className="bg-[#FAF2DB]/70 rounded-xl p-3.5 border border-[#e2d9c8] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
      <div className="flex items-center gap-2">
        <Database size={15} className="text-slate-600 shrink-0" />
        <div>
          <span className="font-semibold text-slate-900">{label}: </span>
          <span className="font-mono text-slate-800 bg-white/60 px-1.5 py-0.5 rounded border border-[#e2d9c8]">
            {displaySource}
          </span>
        </div>
      </div>

      {formattedDate && (
        <div className="flex items-center gap-1.5 text-slate-600">
          <Calendar size={13} className="shrink-0 text-slate-500" />
          <span>Curated / Updated: {formattedDate}</span>
        </div>
      )}
    </div>
  );
}
