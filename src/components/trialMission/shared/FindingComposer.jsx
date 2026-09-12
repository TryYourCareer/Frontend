import React from "react";
import { Plus, BookmarkPlus, Loader2 } from "lucide-react";

/**
 * Reusable Finding Composer allowing creation and display of evidence-backed findings.
 */
export default function FindingComposer({
  findings = [],
  resources = [],
  showFindingForm = false,
  setShowFindingForm = () => {},
  findingStatement = "",
  setFindingStatement = () => {},
  findingResource = "",
  setFindingResource = () => {},
  findingExplanation = "",
  setFindingExplanation = () => {},
  findingUncertainty = "",
  setFindingUncertainty = () => {},
  handleSaveNewFinding = () => {},
  workspaceLoading = false,
  actionLoading = false,
  title = "Recorded Findings",
  description = "Structured evidence-backed findings submitted for your recommendation.",
  statementPlaceholder = "e.g., Major drop-off concentrated at the payment method selection step.",
}) {
  return (
    <div className="rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        {!showFindingForm && (
          <button
            type="button"
            onClick={() => setShowFindingForm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#7B4A28] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#633B20]"
          >
            <Plus size={14} /> Add Finding
          </button>
        )}
      </div>

      {showFindingForm && (
        <form
          onSubmit={handleSaveNewFinding}
          className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-4"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Record New Evidence Finding
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Statement *</label>
            <input
              type="text"
              required
              value={findingStatement}
              onChange={(e) => setFindingStatement(e.target.value)}
              placeholder={statementPlaceholder}
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
                placeholder="e.g. Latency metrics need confirmation"
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
              placeholder="Explain what the data shows..."
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
              {actionLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <BookmarkPlus size={13} />
              )}
              Save Finding
            </button>
          </div>
        </form>
      )}

      {workspaceLoading ? (
        <div className="py-6 text-center text-xs text-slate-500">Loading findings...</div>
      ) : findings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
          No findings recorded yet. Inspect resources and click "Add Finding" to capture evidence.
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
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] text-emerald-800">
                  Finding #{idx + 1}
                </span>
              </div>
              {Array.isArray(f.evidence) && f.evidence.length > 0 && (
                <p className="text-[11px] text-slate-600">
                  <strong className="text-slate-700">Evidence:</strong>{" "}
                  {f.evidence[0].explanation || f.evidence[0].resource_id}
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
  );
}
