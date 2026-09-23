import React from "react";
import { Dna, Layers, Activity, Binary, Eye, Compass } from "lucide-react";
import { ClassificationBadge, ProvenanceCard } from "./CareerIntelligenceStatus";

const DIMENSIONS_CONFIG = [
  {
    key: "cognitive_complexity",
    label: "Cognitive Complexity",
    icon: Binary,
    description: "Depth of conceptual reasoning, problem structuring, and abstract synthesis.",
    levels: ["Foundational reasoning", "Applied analysis", "High complexity", "Advanced multi-domain synthesis"],
  },
  {
    key: "quantitative_intensity",
    label: "Quantitative Intensity",
    icon: Activity,
    description: "Rigor of mathematical calculation, statistical modeling, and data manipulation.",
    levels: ["Basic quantitative", "Moderate calculations", "Intensive modeling", "Advanced mathematical rigor"],
  },
  {
    key: "systems_topography",
    label: "Systems Topography",
    icon: Layers,
    description: "Breadth of architectural interconnectivity, feedback loops, and component dependencies.",
    levels: ["Isolated components", "Local subsystem", "Distributed network", "Large-scale systemic ecosystem"],
  },
  {
    key: "visual_spatial_rigor",
    label: "Visual-Spatial Rigor",
    icon: Eye,
    description: "Requirements for spatial modeling, visual composition, and geometric layout.",
    levels: ["Low visual demand", "Applied layouts", "High visual precision", "Intensive spatial & 3D reasoning"],
  },
  {
    key: "uncertainty_ambiguity",
    label: "Uncertainty / Ambiguity",
    icon: Compass,
    description: "Tolerance for incomplete constraints, shifting objectives, and emergent tradeoffs.",
    levels: ["Structured & deterministic", "Bounded variability", "Moderate ambiguity", "High volatility & emergent conditions"],
  },
];

function OrdinalScaleIndicator({ value }) {
  const numValue = Number(value) || 0;

  return (
    <div className="flex items-center gap-1.5" aria-label={`Level ${numValue} of 4`}>
      {[1, 2, 3, 4].map((step) => {
        const isFilled = step <= numValue;
        return (
          <div
            key={step}
            className={`h-2.5 w-7 rounded-sm transition-all ${
              isFilled
                ? "bg-[#0b1a36]"
                : "bg-slate-200 border border-slate-300/60"
            }`}
            title={`Level ${step}`}
          />
        );
      })}
      <span className="ml-2 font-mono text-xs font-bold text-[#0b1a36] bg-[#F0F6FC] px-2.5 py-0.5 rounded-lg border border-[#D3E3F5] shadow-2xs">
        {numValue > 0 ? `${numValue}/4` : "N/A"}
      </span>
    </div>
  );
}

export default function WorkDNACard({ workDna }) {
  if (!workDna) return null;

  const {
    status,
    cognitive_complexity,
    quantitative_intensity,
    systems_topography,
    visual_spatial_rigor,
    uncertainty_ambiguity,
    rationale,
    reviewed_by,
    sme_reviewed_at,
  } = workDna;

  const valuesMap = {
    cognitive_complexity,
    quantitative_intensity,
    systems_topography,
    visual_spatial_rigor,
    uncertainty_ambiguity,
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-[#D3E3F5] shadow-xs space-y-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D3E3F5] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl bg-[#F0F6FC] border border-[#D3E3F5] flex items-center justify-center text-[#1E88E5] shadow-2xs">
            <Dna size={18} />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#0b1a36]">Work DNA Profile</h3>
            <p className="text-[11px] font-medium text-slate-500">5-dimension occupational cognitive and operational profile</p>
          </div>
        </div>

        <ClassificationBadge status={status} />
      </div>

      {/* 5 Dimensions Grid */}
      <div className="space-y-4">
        {DIMENSIONS_CONFIG.map(({ key, label, icon: Icon, description, levels }) => {
          const val = valuesMap[key];
          const levelText = val && val >= 1 && val <= 4 ? levels[val - 1] : null;

          return (
            <div
              key={key}
              className="p-4 rounded-2xl bg-[#F0F6FC] border border-[#D3E3F5] hover:border-slate-300 transition space-y-2 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon size={16} className="text-[#1E88E5] shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-[#0b1a36]">{label}</span>
                </div>
                <OrdinalScaleIndicator value={val} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <span className="leading-relaxed">{description}</span>
                {levelText && (
                  <span className="font-bold text-slate-800 italic bg-white px-2.5 py-0.5 rounded-xl border border-[#D3E3F5] shadow-2xs text-[11px]">
                    {levelText}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* General Rationale if present */}
      {rationale && (
        <div className="p-4 rounded-2xl bg-[#F0F6FC] border border-[#D3E3F5] space-y-1 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assessment Rationale</p>
          <p className="text-xs text-slate-700 leading-relaxed">{rationale}</p>
        </div>
      )}

      {/* Scale Notice & Provenance */}
      <div className="pt-2 space-y-3">
        <p className="text-[11px] text-slate-400 font-semibold italic">
          * Ordinal scale (1–4) derived from occupational domain analysis. Does not calculate a psychometric composite.
        </p>

        <ProvenanceCard
          reviewedBy={reviewed_by}
          reviewedAt={sme_reviewed_at}
          label="Work DNA Provenance"
        />
      </div>
    </div>
  );
}