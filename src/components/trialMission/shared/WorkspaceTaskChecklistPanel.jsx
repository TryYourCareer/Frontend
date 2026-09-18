import { CheckCircle2, Lock, Rocket, Loader2, ListChecks } from "lucide-react";

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
      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-bold text-white shadow-sm shadow-blue-500/20">
            {managerInitial}
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0b1a36]">{managerName}</h3>
            <p className="text-[11px] text-slate-500 font-medium">{managerTitle}</p>
          </div>
        </div>
        <div className="rounded-xl bg-blue-50/50 border border-blue-100/60 p-3">
          <p className="text-xs leading-relaxed text-slate-700">
            {briefing.task || defaultTask}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <ListChecks size={14} className="text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b1a36]">
            Completion Checklist
          </h3>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-2.5 border border-slate-100">
            <span className="flex items-center gap-2 text-slate-700 font-medium">
              {findings.length >= requiredFindingsCount ? (
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              ) : (
                <Lock size={14} className="text-slate-400 shrink-0" />
              )}
              Record at least {requiredFindingsCount} finding
            </span>
            <span className="font-mono text-xs font-bold text-slate-600">
              {findings.length}/{requiredFindingsCount}
            </span>
          </div>

          {requiredResourceAccess.map((reqId) => {
            const hasAccessed = accessedResourceIds.has(reqId);
            return (
              <div key={reqId} className="flex items-center justify-between rounded-xl bg-slate-50/80 p-2.5 border border-slate-100">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  {hasAccessed ? (
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  ) : (
                    <Lock size={14} className="text-slate-400 shrink-0" />
                  )}
                  Inspect {reqId}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-500">
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-50"
          >
            {actionLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Completing...
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
