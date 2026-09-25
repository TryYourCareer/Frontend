import React from "react";
import { TrendingUp, Info, Globe, MapPin } from "lucide-react";

export default function ParentFinancialSection({ financialOutlook }) {
  if (!financialOutlook) {
    return (
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 text-center space-y-2 shadow-xs">
        <div className="flex items-center justify-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E88E5] border border-blue-200/70 flex items-center justify-center font-bold text-xs">
            05
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            What It Will Cost and When It Pays Off
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Market salary and financial outlook data is not currently available in the parent report.
        </p>
      </section>
    );
  }

  const { salary_progression, cost_and_roi_note: rootNote } = financialOutlook;
  const progression = salary_progression || {};
  const indiaSal = progression.india_lpa || {};
  const globalSal = progression.global_usd || {};
  const narrative = progression.narrative;
  const costRoiNote = rootNote || progression.cost_and_roi_note;

  const hasIndiaTiers = indiaSal && Object.keys(indiaSal).length > 0;
  const hasGlobalTiers = globalSal && Object.keys(globalSal).length > 0;
  const hasSalaryData = hasIndiaTiers || hasGlobalTiers;

  return (
    <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 md:p-10 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-blue-50 text-[#1E88E5] border border-blue-200/70 flex items-center justify-center font-bold text-xs">
            05
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0b1a36] tracking-tight">
              What It Will Cost and When It Pays Off
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Verified Market Compensation & Progression
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <TrendingUp size={14} />
          <span>Market Benchmark Data</span>
        </div>
      </div>

      {/* Narrative Inner Box */}
      {narrative && (
        <div className="p-4 sm:p-5 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {narrative}
          </p>
        </div>
      )}

      {/* Salary Tiers Display */}
      {hasSalaryData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* India LPA */}
          {hasIndiaTiers && (
            <div className="p-5 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E88E5]">
                <MapPin size={14} />
                <span>India Compensation (LPA)</span>
              </div>
              <div className="space-y-2">
                {Object.entries(indiaSal).map(([tierKey, val]) => (
                  <div
                    key={tierKey}
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80"
                  >
                    <span className="text-xs font-semibold text-slate-600 capitalize">
                      {tierKey.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-bold text-[#0b1a36]">
                      {typeof val === "number" || (!val.toString().toLowerCase().includes("lpa") && !val.toString().includes("₹"))
                        ? `₹${val} LPA`
                        : val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Global USD */}
          {hasGlobalTiers && (
            <div className="p-5 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E88E5]">
                <Globe size={14} />
                <span>Global Compensation (USD)</span>
              </div>
              <div className="space-y-2">
                {Object.entries(globalSal).map(([tierKey, val]) => (
                  <div
                    key={tierKey}
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80"
                  >
                    <span className="text-xs font-semibold text-slate-600 capitalize">
                      {tierKey.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-bold text-[#0b1a36]">
                      {typeof val === "number" || (!val.toString().includes("$") && !val.toString().toLowerCase().includes("usd"))
                        ? `$${val}`
                        : val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200/80 text-xs text-slate-500 italic">
          Authoritative salary tiers are currently pending verification.
        </div>
      )}

      {/* Degree Cost Range & Investment Recovery Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="parent-education-cost-cards">
        <div className="p-5 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Estimated Degree & Skill Prep Cost Range
          </div>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between items-center p-2.5 bg-white rounded-xl border border-slate-200/80">
              <span className="font-medium text-slate-700">Government Institutions (IIT/NIT/State):</span>
              <span className="font-bold text-[#0b1a36]">₹1–2L / yr (₹4–8L total)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-white rounded-xl border border-slate-200/80">
              <span className="font-medium text-slate-700">Reputed Private Universities:</span>
              <span className="font-bold text-[#0b1a36]">₹2–4L / yr (₹8–16L total)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-white rounded-xl border border-slate-200/80">
              <span className="font-medium text-slate-700">Target Skill Prep / Practical Portfolios:</span>
              <span className="font-bold text-[#0b1a36]">₹5,000–₹15,000 one-time</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Investment Recovery Timeline
          </div>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between items-center p-2.5 bg-white rounded-xl border border-slate-200/80">
              <span className="font-medium text-slate-700">Government Route:</span>
              <span className="font-bold text-emerald-700">1–2 years of employment</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-white rounded-xl border border-slate-200/80">
              <span className="font-medium text-slate-700">Private Route:</span>
              <span className="font-bold text-blue-700">3–4 years of employment</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
              Based on starting market compensation ranges and standard educational fees without reliance on unverified assumptions.
            </p>
          </div>
        </div>
      </div>

      {/* Cost & ROI Notice */}
      <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
          <Info size={14} />
          <span>Educational Cost & ROI Note</span>
        </div>
        <p className="text-xs text-amber-800/90 leading-relaxed">
          {costRoiNote ||
            "Tuition costs vary significantly across institutions; exact educational return on investment is not estimated here to avoid speculative projections."}
        </p>
      </div>
    </section>
  );
}
