import React from "react";
import { MessageSquare, HeartHandshake, Sparkles } from "lucide-react";

export default function ParentWhatChildNeedsSection({ whatChildNeeds }) {
  if (!whatChildNeeds) {
    return (
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 text-center space-y-2 shadow-xs">
        <div className="flex items-center justify-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E88E5] border border-blue-200/70 flex items-center justify-center font-bold text-xs">
            08
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            What Your Child Needs From You
          </h2>
        </div>
        <p className="text-xs text-slate-400">
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
    <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 md:p-8 space-y-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E88E5] border border-blue-200/70 flex items-center justify-center font-bold text-xs">
            08
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0b1a36] tracking-tight">
              What Your Child Needs From You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Guided Family Discussion Prompts & Practical Support
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-800 text-xs font-bold">
          <HeartHandshake size={14} className="text-amber-600" />
          <span>Parent Action Guide</span>
        </div>
      </div>

      {/* Discussion Prompts: 3 Structured Blocks */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
          <MessageSquare size={14} className="text-[#1E88E5]" />
          <span>Recommended Discussion Topics</span>
        </div>

        {prompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {prompts.map((p, idx) => {
              const defaultCategories = ["Growth Area", "Trial Reflection", "Pathway"];
              const categoryLabel = p.category
                ? p.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                : (defaultCategories[idx] || "Discussion Topic");
              const question = p.question;
              const context = p.context;

              return (
                <div
                  key={p.prompt_id || idx}
                  className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#1E88E5] border border-blue-200/70 uppercase tracking-wider">
                      {categoryLabel}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-[#0b1a36] leading-snug">
                      "{question}"
                    </p>
                  </div>
                  {context && (
                    <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-200/60 pt-2.5 italic">
                      Context: {context}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200/80 text-xs text-slate-500 italic">
            No specific discussion prompts generated for this report.
          </div>
        )}
      </div>

      {/* Supportive Next Steps: Compact Numbered List */}
      {recommendations.length > 0 && (
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Sparkles size={14} className="text-amber-500" />
            <span>Supportive Next Steps</span>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-3 sm:p-4 space-y-2">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200/80 transition-colors"
              >
                <div className="w-5 h-5 rounded-md bg-blue-50 text-[#1E88E5] border border-blue-200/70 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </div>
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
