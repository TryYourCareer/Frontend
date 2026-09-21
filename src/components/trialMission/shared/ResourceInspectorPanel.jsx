import React, { useState } from "react";
import { Check, Eye, FileText, X, ChevronDown, ChevronUp } from "lucide-react";

/**
 * Reusable Resource Inspector Panel displaying resource list, access checkmarks,
 * and an inspection modal/card for the active resource.
 * Optimized for mobile with a collapsible list on small screens and persistent desktop view.
 */
export default function ResourceInspectorPanel({
  resources = [],
  accessedResourceIds = new Set(),
  activeResource = null,
  setActiveResource = () => {},
  handleAccessResource = () => {},
  title = "Resources",
  theme = "blue", // "emerald" | "blue" | "purple"
  actionLoading = false,
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const themeStyles = {
    emerald: {
      border: "border-emerald-200",
      bg: "bg-emerald-50/50",
      text: "text-emerald-900",
      divider: "border-emerald-200",
    },
    blue: {
      border: "border-blue-200",
      bg: "bg-blue-50/50",
      text: "text-blue-900",
      divider: "border-blue-200",
    },
    purple: {
      border: "border-purple-200",
      bg: "bg-purple-50/50",
      text: "text-purple-900",
      divider: "border-purple-200",
    },
  }[theme] || {
    border: "border-blue-200",
    bg: "bg-blue-50/50",
    text: "text-blue-900",
    divider: "border-blue-200",
  };

  return (
    <div className="space-y-4 lg:col-span-3">
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-sm backdrop-blur-sm space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 sm:pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <FileText size={14} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0b1a36]">
                {title}
              </h2>
              <span className="text-[10px] text-slate-500 font-medium lg:hidden block truncate">
                {isMobileOpen ? "Tap arrow to collapse" : "Tap arrow to view files"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 font-mono">
              {resources.length}
            </span>
            <button
              type="button"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 lg:hidden hover:bg-slate-100 transition-colors"
              aria-label={isMobileOpen ? "Collapse resources" : "Expand resources"}
            >
              {isMobileOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Resource list: always shown on desktop (lg), collapsible on mobile */}
        <div className={`${isMobileOpen ? "block" : "hidden"} lg:block space-y-2.5`}>
          {resources.map((res) => {
            const isAccessed = accessedResourceIds.has(res.id);
            const isSelected = activeResource?.id === res.id;
            return (
              <div
                key={res.id}
                className={`rounded-xl sm:rounded-2xl border p-3 sm:p-3.5 transition-all duration-200 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-400"
                    : "border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-xs font-bold text-[#0b1a36] leading-snug break-words">{res.title}</h3>
                    <span className="inline-block rounded-md bg-white border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600 uppercase">
                      {res.type}
                    </span>
                  </div>
                  {isAccessed && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                      <Check size={12} />
                    </span>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex justify-end">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => {
                      handleAccessResource(res.id);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
                  >
                    <Eye size={12} /> {isAccessed ? "Re-open" : "Inspect Resource"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeResource && (
        <div
          className={`rounded-2xl sm:rounded-3xl border ${themeStyles.border} ${themeStyles.bg} p-4 sm:p-5 shadow-sm space-y-3`}
        >
          <div className={`flex items-center justify-between border-b ${themeStyles.divider} pb-2`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${themeStyles.text} truncate max-w-[220px] sm:max-w-xs`}>
              {activeResource.title}
            </span>
            <button
              type="button"
              onClick={() => setActiveResource(null)}
              aria-label="✕"
              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
              title="Close preview"
            >
              <X size={14} />
            </button>
          </div>
          <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap max-h-60 sm:max-h-72 overflow-y-auto overscroll-contain">
            {activeResource.content || "No raw content."}
          </div>
        </div>
      )}
    </div>
  );
}
