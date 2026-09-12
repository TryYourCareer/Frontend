import React from "react";

/**
 * Reusable Working Notes scratchpad panel with autosave status and char counter.
 */
export default function WorkingNotesPanel({
  notesValue = "",
  setNotesValue = () => {},
  title = "Working Notes",
  description = "Private analytical scratchpad (autosaved to server).",
  placeholder = "Record your observations, notes on checkout funnel drop-offs, and thoughts here...",
  rows = 6,
}) {
  return (
    <div className="rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-600">
          {notesValue?.length || 0} chars
        </span>
      </div>

      <textarea
        rows={rows}
        value={notesValue}
        onChange={(e) => setNotesValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#7B4A28] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7B4A28]"
      />
    </div>
  );
}
