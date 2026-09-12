import React from "react";
import { CheckCircle2, Lock, Rocket, Loader2 } from "lucide-react";

/**
 * Reusable Right Panel for workspace manager briefing, task checklist, and investigation completion CTA.
 */
export default function WorkspaceTaskChecklistPanel({
  manager = {},
  briefing = {},
  findings = [],
  requiredFindingsCount = 1,
  requiredResourceAccess = [],
  accessedResourceIds = new Set(),
  handleCompleteInvestigation = () => {},
  actionLoading = false,
  isInvestigationPhase = true,
  defaultManagerName = "Manager",
  defaultManagerTitle = "Lead",
  defaultTask = "Identify the key issues and record your findings.",
}) {
  const managerName = manager.name || defaultManagerName;
  const managerTitle = manager.title || defaultManagerTitle;
  const managerInitial = managerName ? managerName[0] : "M";

  return (
    <div className="space-y-4 lg:col-span-3">
      <div className="rounded-3xl border border-[#E5DEC9] bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B4A28]/10 text-sm font-bold text-[#7B4A28]">
            {managerInitial}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{managerName}</h3>
            <p className="text-[11px] text-slate-500">{managerTitle}</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-slate-600">
          {briefing.task || defaultTask}
        </p>
      </div>

      <div className="rounded-3xl border border-[#E5DEC9] bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
          Completion Checklist
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-700">
              {findings.length >= requiredFindingsCount ? (
                <CheckCircle2 size={14} className="text-emerald-600" />
              ) : (
                <Lock size={14} className="text-slate-400" />
              )}
              Record at least {requiredFindingsCount} finding
            </span>
            <span className="font-mono text-slate-500">
              {findings.length}/{requiredFindingsCount}
            </span>
          </div>

          {requiredResourceAccess.map((reqId) => {
            const hasAccessed = accessedResourceIds.has(reqId);
            return (
              <div key={reqId} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  {hasAccessed ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : (
                    <Lock size={14} className="text-slate-400" />
                  )}
                  Inspect {reqId}
                </span>
                <span className="font-mono text-slate-500">
                  {hasAccessed ? "Done" : "Pending"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            disabled={actionLoading || !isInvestigationPhase}
            onClick={handleCompleteInvestigation}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7B4A28] px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#633B20] disabled:opacity-50"
          >
            {actionLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Completing...
              </>
            ) : (
              <>
                Complete investigation <Rocket size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
