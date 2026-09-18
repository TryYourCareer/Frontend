import React from "react";
import { Workflow } from "lucide-react";

export function formatActivityType(type) {
  if (!type) return "Professional Activity";
  const normalized = String(type).toLowerCase();
  switch (normalized) {
    case "diagnostic":
      return "Diagnostic";
    case "evaluative":
      return "Evaluative";
    case "generative":
      return "Generative";
    case "execution":
      return "Execution";
    default:
      return String(type)
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export function formatTrialabilityTier(tier) {
  if (!tier) return "Standard";
  const normalized = String(tier).toLowerCase();
  if (normalized.includes("tier_1") || normalized.includes("high")) {
    return {
      label: "Tier 1: High Simulation Suitability",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  if (normalized.includes("tier_2") || normalized.includes("moderate")) {
    return {
      label: "Tier 2: Moderate Simulation Suitability",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }
  if (normalized.includes("tier_3") || normalized.includes("low")) {
    return {
      label: "Tier 3: Low Simulation Suitability",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }
  return {
    label: tier.replace(/[_-]+/g, " "),
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  };
}

function NumericLevelBadge({ label, value, max = 3 }) {
  const num = Number(value) || 0;
  return (
    <div className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
      <span className="text-slate-600">{label}</span>
      <span className="font-mono font-bold text-slate-900 ml-2">
        {num}/{max}
      </span>
    </div>
  );
}

export default function CareerActivitiesList({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white/90 rounded-2xl p-6 border border-[#e2d9c8] shadow-sm text-center">
        <p className="text-sm text-slate-500">No professional activities cataloged yet for this career.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow size={18} className="text-slate-700" />
          <h3 className="text-base font-bold text-slate-900">
            Professional Activities ({activities.length})
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activities.map((act) => {
          const tierInfo = formatTrialabilityTier(act.trialability_tier);
          const typeLabel = formatActivityType(act.activity_type);

          return (
            <div
              key={act.id || act.title}
              className="bg-white/90 rounded-2xl p-6 border border-[#e2d9c8] shadow-sm space-y-4 hover:border-slate-300 transition"
              data-testid="career-activity-item"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {typeLabel}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tierInfo.badgeClass}`}
                    >
                      {tierInfo.label}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 pt-1">{act.title}</h4>
                </div>

                {act.recommended_mission_type && (
                  <div className="text-right">
                    <span className="text-[11px] uppercase font-bold text-slate-500 block">
                      Recommended Type
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-800 bg-[#FAF2DB] px-2 py-0.5 rounded border border-[#e2d9c8]">
                      {act.recommended_mission_type}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">{act.description}</p>

              {/* Characteristic Indicators Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-2">
                <NumericLevelBadge label="Frequency" value={act.frequency_level} />
                <NumericLevelBadge label="Importance" value={act.importance_level} />
                <NumericLevelBadge label="Sim Fidelity" value={act.simulation_fidelity} />
                <NumericLevelBadge label="Cognitive Rep" value={act.cognitive_representation} />
                <NumericLevelBadge label="Safety Barrier" value={act.safety_liability_barrier} />
              </div>

              {act.trialability_rationale && (
                <div className="text-xs text-slate-600 bg-[#FAF2DB]/40 p-3 rounded-xl border border-[#e2d9c8]">
                  <span className="font-semibold text-slate-800">Trialability Rationale: </span>
                  <span>{act.trialability_rationale}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
