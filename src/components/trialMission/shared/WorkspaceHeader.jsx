import React from "react";
import { Activity } from "lucide-react";

/**
 * Reusable Workspace Header displaying mission title, phase, badge, and autosave status.
 * Optimized with responsive padding and clear visual hierarchy.
 */
export default function WorkspaceHeader({
  session,
  badgeLabel = "Investigation Workspace",
  badgeColorClass = "bg-blue-50 border-blue-200 text-blue-800",
  badgeIcon: BadgeIcon = Activity,
  notesStatus = "saved",
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white/95 p-4 sm:p-6 shadow-sm backdrop-blur-sm">
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-0.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider ${badgeColorClass}`}
          >
            {BadgeIcon && <BadgeIcon size={12} />} {badgeLabel}
          </span>
          <span className="text-[11px] sm:text-xs text-slate-500 font-mono">
            Phase: {session?.current_phase}
          </span>
        </div>
        <h1 className="text-lg sm:text-2xl font-black text-[#0b1a36] tracking-tight truncate">
          {session?.mission_title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span className="text-xs text-slate-500">
          Notes Autosave:{" "}
          <strong
            className={
              notesStatus === "error"
                ? "text-rose-600"
                : notesStatus === "saving"
                ? "text-blue-600 font-mono animate-pulse"
                : "text-emerald-600 font-mono"
            }
          >
            {notesStatus === "saving"
              ? "Saving..."
              : notesStatus === "saved"
              ? "Saved"
              : notesStatus === "error"
              ? "Error"
              : "Ready"}
          </strong>
        </span>
      </div>
    </div>
  );
}
