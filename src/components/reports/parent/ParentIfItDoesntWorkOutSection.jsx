import React from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ParentIfItDoesntWorkOutSection({ ifItDoesntWorkOut }) {
  if (!ifItDoesntWorkOut) {
    return (
      <section className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center font-bold text-xs border border-slate-200">
            06
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0b1a36]">
              What If It Doesn't Work Out?
            </h2>
            <p className="text-xs text-slate-500 font-medium">Alternative Career Pathways & Transferability</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 italic">
          Alternative career pivot information is not currently available in the parent report.
        </p>
      </section>
    );
  }

  const { safe_pivot_alternatives } = ifItDoesntWorkOut;
  const alternatives = Array.isArray(safe_pivot_alternatives)
    ? safe_pivot_alternatives
    : [];

  return (
    <section className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1E88E5]/10 text-[#1E88E5] flex items-center justify-center font-bold text-xs">
            06
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0b1a36]">
              What If It Doesn't Work Out?
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Adjacent Options Sharing Foundational Strengths
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[#1E88E5] text-xs font-bold">
          <ShieldCheck size={14} />
          <span>Skill Transferability</span>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">
        If your child decides to pivot in the future, the foundational competencies evaluated in this report transfer directly to these backend-identified related careers.
      </p>

      {/* Alternatives List (Preserve Backend Ordering Strictly) */}
      {alternatives.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alternatives.map((alt, idx) => {
            const name = alt.career_name || alt.name || "Related Career";
            const rationale = alt.rationale || alt.fit_reason || alt.description;
            const shared = Array.isArray(alt.shared_competencies)
              ? alt.shared_competencies
              : Array.isArray(alt.shared_skills)
              ? alt.shared_skills
              : [];

            return (
              <div
                key={alt.career_id || idx}
                className="p-5 bg-gradient-to-br from-slate-50/70 to-blue-50/30 border border-slate-200 rounded-2xl space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-[#0b1a36]">{name}</h3>
                  {alt.fit_tier && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {alt.fit_tier.replace(/_/g, " ")}
                    </span>
                  )}
                </div>

                {rationale && (
                  <p className="text-xs text-slate-600 leading-relaxed">{rationale}</p>
                )}

                {shared.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Transferable Strengths
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {shared.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-700"
                        >
                          <CheckCircle2 size={10} className="text-emerald-500" />
                          <span>{typeof skill === "object" ? skill.title || skill.name : skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 italic">
          No alternative career pivots are currently listed in the report data.
        </div>
      )}
    </section>
  );
}
