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
      className="bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-[#D3E3F5] text-center max-w-xl mx-auto my-8 shadow-xs space-y-4"
      data-testid={`intelligence-state-${type}`}
    >
      <div className="flex justify-center">
        <div
          className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-2xs ${
            isError
              ? "bg-red-50 text-red-600 border border-red-200"
              : isUnclassified
              ? "bg-amber-50 text-amber-800 border border-amber-200"
              : "bg-[#F0F6FC] text-slate-600 border border-[#D3E3F5]"
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
        <h3 className="font-serif text-lg font-bold text-[#0b1a36]">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full bg-[#0b1a36] text-white hover:bg-[#122b59] transition shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        )}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full bg-[#F0F6FC] text-slate-700 hover:bg-white border border-[#D3E3F5] transition shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>{backLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}