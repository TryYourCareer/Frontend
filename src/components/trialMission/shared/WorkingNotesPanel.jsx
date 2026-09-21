import React from "react";
import { Edit3 } from "lucide-react";

/**
 * Reusable Working Notes scratchpad panel with autosave status and char counter.
 * Optimized with responsive padding and sizing.
 */
export default function WorkingNotesPanel({
  notesValue = "",
  setNotesValue = () => {},
  title = "Working Notes",
  description = "Private analytical scratchpad (autosaved to server).",
  placeholder = "Record your observations, notes on checkout funnel drop-offs, and thoughts here...",
  rows = 4,
}) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white/95 p-4 sm:p-6 shadow-sm backdrop-blur-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <Edit3 size={14} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-[#0b1a36] truncate">{title}</h2>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">{description}</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] font-semibold text-slate-600 shrink-0">
          {notesValue?.length || 0} chars
        </span>
      </div>

      <textarea
        rows={rows}
        value={notesValue}
        onChange={(e) => setNotesValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
      />
    </div>
  );
}
