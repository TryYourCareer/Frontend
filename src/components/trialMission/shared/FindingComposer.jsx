import React from "react";
import { Plus, BookmarkPlus, Loader2, Sparkles, AlertCircle } from "lucide-react";

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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <Sparkles size={14} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{title}</h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">{description}</p>
          </div>
        </div>
        {!showFindingForm && (
          <button
            type="button"
            onClick={() => setShowFindingForm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all shrink-0"
          >
            <Plus size={13} /> Add Finding
          </button>
        )}
      </div>

      {showFindingForm && (
        <form
          onSubmit={handleSaveNewFinding}
          className="rounded-xl border border-blue-100 bg-slate-50/50 p-4 space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Record New Evidence Finding
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Capture Key Insight</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Statement *</label>
            <input
              type="text"
              required
              value={findingStatement}
              onChange={(e) => setFindingStatement(e.target.value)}
              placeholder={statementPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Supporting Resource</label>
              <select
                value={findingResource}
                onChange={(e) => setFindingResource(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Evidence Explanation</label>
            <textarea
              rows={2}
              value={findingExplanation}
              onChange={(e) => setFindingExplanation(e.target.value)}
              placeholder="Explain what the data or findings demonstrate..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowFindingForm(false)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading || !findingStatement.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-all"
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
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-xs text-slate-500">
          No findings recorded yet. Inspect resources and click "Add Finding" to capture evidence.
        </div>
      ) : (
        <div className="space-y-2">
          {findings.map((f, idx) => (
            <div
              key={f.id || idx}
              className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 transition hover:border-slate-300"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900 break-words">{f.statement}</h4>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600 shrink-0">
                  #{idx + 1}
                </span>
              </div>
              {Array.isArray(f.evidence) && f.evidence.length > 0 && (
                <p className="text-[11px] text-slate-600 break-words">
                  <strong className="text-slate-700">Evidence:</strong> {f.evidence[0].explanation || f.evidence[0].resource_id}
                </p>
              )}
              {f.uncertainty && (
                <p className="text-[11px] text-amber-700 flex items-center gap-1 mt-1 break-words">
                  <AlertCircle size={12} className="shrink-0" />
                  <span className="italic">Uncertainty: {f.uncertainty}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}