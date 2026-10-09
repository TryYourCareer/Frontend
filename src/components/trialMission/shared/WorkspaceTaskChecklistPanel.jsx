import React from "react";
import { CheckCircle2, Lock, Rocket, Loader2, ListChecks } from "lucide-react";

/**
 * Reusable Right Panel for workspace manager briefing, task checklist, and investigation completion CTA.
 * Cleaned up card borders and removed nested visual clutter.
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
  const findingsMet = findings.length >= requiredFindingsCount;

  return (
    <div className="space-y-4 lg:col-span-3">
      {/* Manager Briefing Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm shrink-0">
            {managerInitial}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 truncate">{managerName}</h3>
            <p className="text-[11px] text-slate-500 font-medium truncate">{managerTitle}</p>
          </div>
        </div>
        <div className="rounded-xl bg-blue-50/40 border border-blue-100 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
            Current Objective
          </span>
          <p className="text-xs leading-relaxed text-slate-700">
            {briefing.task || defaultTask}
          </p>
        </div>
      </div>

      {/* Completion Checklist & CTA Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <ListChecks size={14} className="text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Checklist
            </h3>
          </div>
          <span className={`text-[11px] font-bold ${findingsMet ? "text-emerald-700" : "text-amber-700"}`}>
            {findingsMet ? "Ready to Complete" : "In Progress"}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-200">
            <span className="flex items-center gap-2 text-slate-700 font-medium">
              {findingsMet ? (
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              ) : (
                <Lock size={14} className="text-slate-400 shrink-0" />
              )}
              Record {requiredFindingsCount}+ finding
            </span>
            <span className="font-mono text-xs font-bold text-slate-600">
              {findings.length}/{requiredFindingsCount}
            </span>
          </div>

          {requiredResourceAccess.map((reqId) => {
            const hasAccessed = accessedResourceIds.has(reqId);
            return (
              <div key={reqId} className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-200">
                <span className="flex items-center gap-2 text-slate-700 font-medium truncate max-w-[170px]">
                  {hasAccessed ? (
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  ) : (
                    <Lock size={14} className="text-slate-400 shrink-0" />
                  )}
                  Inspect {reqId}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-500 shrink-0">
                  {hasAccessed ? "Done" : "Pending"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Prominent Primary CTA */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={actionLoading || !isInvestigationPhase}
            onClick={handleCompleteInvestigation}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {actionLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Completing...
              </>
            ) : (
              <>
                Complete investigation <Rocket size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}