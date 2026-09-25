import React from "react";
import { CheckCircle2, HelpCircle } from "lucide-react";

/**
 * DataProvenanceTag
 * Displays data confidence and provenance tag ("verified" | "estimated") on metrics and stat cards.
 */
export default function DataProvenanceTag({
  status = "verified",
  label = null,
  className = "",
}) {
  const norm = String(status || "").toLowerCase().trim();
  const isVerified = norm === "verified" || norm === "verified_data" || norm === "canonical";
  const displayLabel = label || (isVerified ? "Verified Benchmark" : "Estimated Benchmark");

  return (
    <span
      data-testid="data-provenance-tag"
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-tight shrink-0 select-none ${
        isVerified
          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
          : "bg-blue-50 text-[#1E88E5] border-blue-200"
      } ${className}`}
      title={isVerified ? "Evidence-backed occupational benchmark" : "Model-estimated occupational projection"}
    >
      {isVerified ? (
        <CheckCircle2 size={10} className="text-emerald-600 shrink-0" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-[#1E88E5] shrink-0" />
      )}
      <span>{displayLabel}</span>
    </span>
  );
}
