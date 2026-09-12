import React from "react";
import { Check, Eye } from "lucide-react";

/**
 * Reusable Resource Inspector Panel displaying resource list, access checkmarks,
 * and an inspection modal/card for the active resource.
 */
export default function ResourceInspectorPanel({
  resources = [],
  accessedResourceIds = new Set(),
  activeResource = null,
  setActiveResource = () => {},
  handleAccessResource = () => {},
  title = "Resources",
  theme = "emerald", // "emerald" | "blue" | "purple"
  actionLoading = false,
}) {
  const themeStyles = {
    emerald: {
      border: "border-emerald-300",
      bg: "bg-emerald-50/40",
      text: "text-emerald-900",
      divider: "border-emerald-200",
    },
    blue: {
      border: "border-blue-300",
      bg: "bg-blue-50/40",
      text: "text-blue-900",
      divider: "border-blue-200",
    },
    purple: {
      border: "border-purple-300",
      bg: "bg-purple-50/40",
      text: "text-purple-900",
      divider: "border-purple-200",
    },
  }[theme] || {
    border: "border-emerald-300",
    bg: "bg-emerald-50/40",
    text: "text-emerald-900",
    divider: "border-emerald-200",
  };

  return (
    <div className="space-y-4 lg:col-span-3">
      <div className="rounded-3xl border border-[#E5DEC9] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            {title}
          </h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {resources.length}
          </span>
        </div>

        <div className="space-y-3">
          {resources.map((res) => {
            const isAccessed = accessedResourceIds.has(res.id);
            const isSelected = activeResource?.id === res.id;
            return (
              <div
                key={res.id}
                className={`rounded-2xl border p-3.5 transition ${
                  isSelected
                    ? "border-[#7B4A28] bg-amber-50/50 shadow-sm"
                    : "border-slate-200 bg-slate-50/80 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-900">{res.title}</h3>
                    <span className="inline-block rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 uppercase">
                      {res.type}
                    </span>
                  </div>
                  {isAccessed && (
                    <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-end">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleAccessResource(res.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#7B4A28] hover:underline disabled:opacity-50"
                  >
                    <Eye size={12} /> {isAccessed ? "Re-open" : "Inspect"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeResource && (
        <div
          className={`rounded-3xl border ${themeStyles.border} ${themeStyles.bg} p-5 shadow-sm space-y-3`}
        >
          <div className={`flex items-center justify-between border-b ${themeStyles.divider} pb-2`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${themeStyles.text}`}>
              {activeResource.title}
            </span>
            <button
              type="button"
              onClick={() => setActiveResource(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
            {activeResource.content || "No raw content."}
          </div>
        </div>
      )}
    </div>
  );
}
