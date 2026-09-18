import React from "react";
import { AlertCircle, RefreshCw, ArrowLeft, HelpCircle } from "lucide-react";

export default function IntelligenceEmptyState({
  title = "No information available",
  description = "There are no records matching your query.",
  type = "empty", // 'empty' | 'error' | 'unclassified'
  onRetry,
  onBack,
  backLabel = "Back to Families",
}) {
  const isError = type === "error";
  const isUnclassified = type === "unclassified";

  return (
    <div
      className="bg-white/90 rounded-2xl p-8 border border-[#e2d9c8] text-center max-w-xl mx-auto my-8 shadow-sm space-y-4"
      data-testid={`intelligence-state-${type}`}
    >
      <div className="flex justify-center">
        <div
          className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
            isError
              ? "bg-red-50 text-red-600 border border-red-200"
              : isUnclassified
              ? "bg-amber-50 text-amber-600 border border-amber-200"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          {isError ? (
            <AlertCircle size={28} />
          ) : isUnclassified ? (
            <HelpCircle size={28} />
          ) : (
            <AlertCircle size={28} />
          )}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">{description}</p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#0b1a36] text-white hover:bg-[#142447] transition shadow-sm"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        )}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 transition"
          >
            <ArrowLeft size={15} />
            <span>{backLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
