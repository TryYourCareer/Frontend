import React from "react";
import {
  Palette,
  Check,
  Eye,
  Plus,
  BookmarkPlus,
  CheckCircle2,
  Lock,
  Rocket,
  Loader2,
} from "lucide-react";

export default function UXDesignerWorkspace({
  session,
  manager,
  briefing,
  resources,
  accessedResourceIds,
  activeResource,
  setActiveResource,
  handleAccessResource,
  notesValue,
  setNotesValue,
  notesStatus,
  findings,
  workspaceLoading,
  showFindingForm,
  setShowFindingForm,
  findingStatement,
  setFindingStatement,
  findingResource,
  setFindingResource,
  findingExplanation,
  setFindingExplanation,
  findingUncertainty,
  setFindingUncertainty,
  handleSaveNewFinding,
  handleCompleteInvestigation,
  requiredFindingsCount,
  requiredResourceAccess,
  actionLoading,
  isInvestigationPhase,
}) {
  return (
    <div className="space-y-6" data-testid="ux-designer-workspace">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-3 py-0.5 text-xs font-bold text-purple-800 uppercase tracking-wider">
              <Palette size={12} /> UX Investigation Workspace
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Phase: {session?.current_phase}
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            {session?.mission_title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Notes Autosave:{" "}
            <strong className={notesStatus === "error" ? "text-rose-600" : "text-emerald-700 font-mono"}>
              {notesStatus === "saving" ? "Saving..." : notesStatus === "saved" ? "Saved" : notesStatus === "error" ? "Error" : "Ready"}
            </strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT PANEL: Research & Evidence */}
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-3xl border border-[#E5DEC9] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Research & Evidence
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
                        <span className="inline-block rounded bg-purple-100/70 px-1.5 py-0.5 font-mono text-[10px] text-purple-800 uppercase">
                          {res.type || "evidence"}
                        </span>
                      </div>
                      {isAccessed && <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />}
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
            <div className="rounded-3xl border border-purple-300 bg-purple-50/40 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
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

        {/* CENTER PANEL: Research Notes & Usability Findings */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Research Notes</h2>
                <p className="text-xs text-slate-500">
                  Private design scratchpad (autosaved to server).
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-600">
                {notesValue?.length || 0} chars
              </span>
            </div>

            <textarea
              rows={6}
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="Record observations on user friction, heuristic evaluation notes, and interaction barriers..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#7B4A28] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7B4A28]"
            />
          </div>

          <div className="rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Usability Findings</h2>
                <p className="text-xs text-slate-500">
                  Structured evidence-backed findings submitted for your design recommendation.
                </p>
              </div>
              {!showFindingForm && (
                <button
                  type="button"
                  onClick={() => setShowFindingForm(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#7B4A28] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#633B20]"
                >
                  <Plus size={14} /> Add Usability Finding
                </button>
              )}
            </div>

            {showFindingForm && (
              <form
                onSubmit={handleSaveNewFinding}
                className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-4"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Record Usability Finding
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Statement *</label>
                  <input
                    type="text"
                    required
                    value={findingStatement}
                    onChange={(e) => setFindingStatement(e.target.value)}
                    placeholder="e.g., Mandatory account creation gate blocks 83% of mobile checkout conversions."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Supporting Resource</label>
                    <select
                      value={findingResource}
                      onChange={(e) => setFindingResource(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                    >
                      <option value="">Select Resource...</option>
                      {resources.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Uncertainty Note</label>
                    <input
                      type="text"
                      value={findingUncertainty}
                      onChange={(e) => setFindingUncertainty(e.target.value)}
                      placeholder="e.g. Need confirmation on tablet viewport dropoff"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Evidence Explanation</label>
                  <textarea
                    rows={2}
                    value={findingExplanation}
                    onChange={(e) => setFindingExplanation(e.target.value)}
                    placeholder="Explain what the usability research or audit data shows..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-amber-200/60">
                  <button
                    type="button"
                    onClick={() => setShowFindingForm(false)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !findingStatement.trim()}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#7B4A28] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#633B20] disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <BookmarkPlus size={13} />}
                    Save Finding
                  </button>
                </div>
              </form>
            )}

            {workspaceLoading ? (
              <div className="py-6 text-center text-xs text-slate-500">Loading findings...</div>
            ) : findings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                No usability findings recorded yet. Inspect research artifacts and click "Add Usability Finding" to capture evidence.
              </div>
            ) : (
              <div className="space-y-3">
                {findings.map((f, idx) => (
                  <div
                    key={f.id || idx}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{f.statement}</h4>
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 font-mono text-[10px] text-purple-800">
                        Finding #{idx + 1}
                      </span>
                    </div>
                    {Array.isArray(f.evidence) && f.evidence.length > 0 && (
                      <p className="text-[11px] text-slate-600">
                        <strong className="text-slate-700">Evidence:</strong> {f.evidence[0].explanation || f.evidence[0].resource_id}
                      </p>
                    )}
                    {f.uncertainty && (
                      <p className="text-[11px] text-slate-500 italic">
                        Uncertainty: {f.uncertainty}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Design Lead, Task & Completion */}
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-3xl border border-[#E5DEC9] bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-sm font-bold text-purple-800">
                {manager.name ? manager.name[0] : "E"}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">{manager.name || "Elena Rostova"}</h3>
                <p className="text-[11px] text-slate-500">{manager.title || "Principal Product Designer"}</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              {briefing.task || "Review usability test recordings, identify key friction points, and deliver a prioritized UX design proposal."}
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
      </div>
    </div>
  );
}
