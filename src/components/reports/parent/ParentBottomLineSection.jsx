import React from "react";
import { Award, Info } from "lucide-react";

export default function ParentBottomLineSection({ bottomLine, executiveBottomLine }) {
  const data = bottomLine || executiveBottomLine;
  if (!data) {
    return (
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 text-center space-y-2 shadow-xs">
        <div className="flex items-center justify-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E88E5] border border-blue-200/70 flex items-center justify-center font-bold text-xs">
            09
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            The Bottom Line
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Summary takeaway is not currently available in the parent report.
        </p>
      </section>
    );
  }

  const { evidence_summary, next_steps } = data;
  const steps = Array.isArray(next_steps) ? next_steps : [];

  return (
    <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 md:p-8 space-y-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E88E5] border border-blue-200/70 flex items-center justify-center font-bold text-xs">
            09
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0b1a36] tracking-tight">The Bottom Line</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Evidence-Based Synthesis for Parents
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-bold">
          <Award size={14} className="text-emerald-600" />
          <span>Executive Takeaway</span>
        </div>
      </div>

      {/* Executive Takeaway Narrative Box */}
      {evidence_summary && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/50 via-[#F8FAFC] to-[#F8FAFC] border border-blue-200/60 rounded-2xl space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E88E5] block">
            Executive Summary
          </span>
          <p className="text-xs sm:text-sm font-semibold text-[#0b1a36] leading-relaxed">
            {evidence_summary}
          </p>
        </div>
      )}

      {/* Recommended Actionable Next Steps */}
      {steps.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Recommended Actionable Next Steps
          </h3>
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-3 sm:p-4 space-y-2">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200/80"
              >
                <div className="w-5 h-5 rounded-md bg-blue-50 text-[#1E88E5] border border-blue-200/70 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium block">
                  {step}
                </span>
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
