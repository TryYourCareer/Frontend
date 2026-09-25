import React from "react";
import { MessageSquare, HeartHandshake, Sparkles, CheckCircle2 } from "lucide-react";

export default function ParentWhatChildNeedsSection({ whatChildNeeds }) {
  if (!whatChildNeeds) {
    return (
      <section className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center font-bold text-xs border border-slate-200">
            08
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0b1a36]">
              What Your Child Needs From You
            </h2>
            <p className="text-xs text-slate-500 font-medium">Family Discussion & Support Guidance</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 italic">
          Guidance on family discussion prompts is not currently available in the parent report.
        </p>
      </section>
    );
  }

  const { discussion_prompts, support_recommendations } = whatChildNeeds;
  const prompts = Array.isArray(discussion_prompts) ? discussion_prompts : [];
  const recommendations = Array.isArray(support_recommendations)
    ? support_recommendations
    : [];

  return (
    <section className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1E88E5]/10 text-[#1E88E5] flex items-center justify-center font-bold text-xs">
            08
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0b1a36]">
              What Your Child Needs From You
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Guided Family Discussion Prompts & Practical Support
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          <HeartHandshake size={14} />
          <span>Parent Action Guide</span>
        </div>
      </div>

      {/* Discussion Prompts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E88E5]">
          <MessageSquare size={14} />
          <span>Recommended Discussion Prompts</span>
        </div>

        {prompts.length > 0 ? (
          <div className="space-y-3">
            {prompts.map((p, idx) => {
              const categoryLabel = p.category ? p.category.replace(/_/g, " ") : "Discussion Topic";
              const question = p.question;
              const context = p.context;

              return (
                <div
                  key={p.prompt_id || idx}
                  className="p-5 bg-gradient-to-br from-blue-50/30 to-indigo-50/20 border border-[#D3E3F5] rounded-2xl space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1E88E5]/10 text-[#1E88E5] uppercase tracking-wider">
                      {categoryLabel}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#0b1a36] leading-snug">
                    "{question}"
                  </p>
                  {context && (
                    <p className="text-xs text-slate-500 leading-relaxed italic">
                      Context: {context}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 italic">
            No specific discussion prompts generated for this report.
          </div>
        )}
      </div>

      {/* Support Recommendations */}
      {recommendations.length > 0 && (
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Sparkles size={14} className="text-amber-500" />
            <span>Supportive Next Steps</span>
          </div>

          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80"
              >
                <CheckCircle2 size={16} className="text-[#1E88E5] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {rec}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
