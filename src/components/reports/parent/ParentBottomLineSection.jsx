import React from "react";
import { Award, Info } from "lucide-react";

export default function ParentBottomLineSection({ bottomLine }) {
  if (!bottomLine) {
    return (
      <section className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center font-bold text-xs border border-slate-200">
            09
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0b1a36]">The Bottom Line</h2>
            <p className="text-xs text-slate-500 font-medium">Executive Summary & Next Actions</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 italic">
          Summary takeaway is not currently available in the parent report.
        </p>
      </section>
    );
  }

  const { evidence_summary, next_steps } = bottomLine;
  const steps = Array.isArray(next_steps) ? next_steps : [];

  return (
    <section className="bg-gradient-to-br from-white via-blue-50/20 to-slate-50/50 border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1E88E5]/10 text-[#1E88E5] flex items-center justify-center font-bold text-xs">
            09
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0b1a36]">The Bottom Line</h2>
            <p className="text-xs text-slate-500 font-medium">
              Evidence-Based Synthesis for Parents
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <Award size={14} />
          <span>Executive Takeaway</span>
        </div>
      </div>

      {/* Summary Narrative */}
      {evidence_summary && (
        <div className="p-5 bg-white border border-[#D3E3F5] rounded-2xl shadow-xs">
          <p className="text-sm sm:text-base font-semibold text-[#0b1a36] leading-relaxed">
            {evidence_summary}
          </p>
        </div>
      )}

      {/* Recommended Actionable Next Steps (Guidance Cards without misleading click semantics) */}
      {steps.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recommended Actionable Next Steps
          </h3>
          <div className="space-y-2.5">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-blue-50 text-[#1E88E5] border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium block">
                    {step}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <Info size={13} className="shrink-0 text-slate-400" />
        <span>
          These next steps are structured recommendations designed to support constructive family planning conversations.
        </span>
      </div>
    </section>
  );
}
