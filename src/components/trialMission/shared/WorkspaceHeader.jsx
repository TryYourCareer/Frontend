import React from "react";
import { Activity } from "lucide-react";

/**
 * Reusable Workspace Header displaying mission title, phase, badge, and autosave status.
 */
export default function WorkspaceHeader({
  session,
  badgeLabel = "Investigation Workspace",
  badgeColorClass = "bg-blue-50 border-blue-200 text-blue-800",
  badgeIcon: BadgeIcon = Activity,
  notesStatus = "saved",
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${badgeColorClass}`}
          >
            {BadgeIcon && <BadgeIcon size={12} />} {badgeLabel}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Phase: {session?.current_phase}
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#0b1a36] tracking-tight">
          {session?.mission_title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
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
