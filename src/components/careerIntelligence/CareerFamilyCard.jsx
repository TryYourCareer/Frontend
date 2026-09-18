import React from "react";
import {
  Code,
  Database,
  Palette,
  TrendingUp,
  Briefcase,
  HeartPulse,
  Scale,
  Truck,
  Building2,
  Globe2,
  GraduationCap,
  Shield,
  ChevronRight,
  Layers,
} from "lucide-react";

// Canonical icon lookup for the 12 taxonomy family keys
const FAMILY_ICONS = {
  software_engineering_cloud_systems: Code,
  data_ai_mathematical_modeling: Database,
  design_creative_systems_content: Palette,
  finance_investment_risk: TrendingUp,
  product_strategy_business_analysis: Briefcase,
  healthcare_clinical_life_sciences: HeartPulse,
  law_policy_ethics_governance: Scale,
  operations_logistics_supply_chain: Truck,
  physical_industrial_infrastructure_engineering: Building2,
  earth_agriculture_energy_sustainability: Globe2,
  education_advisory_social_impact: GraduationCap,
  defense_security_aviation: Shield,
};

export default function CareerFamilyCard({ family, onSelect }) {
  if (!family) return null;

  const IconComponent = FAMILY_ICONS[family.key] || Layers;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(family.key)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(family.key);
        }
      }}
      className="group bg-white/90 rounded-2xl p-6 border border-[#e2d9c8] hover:border-slate-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 focus:outline-none focus:ring-2 focus:ring-[#0b1a36]/20"
      data-testid={`career-family-card-${family.key}`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-11 w-11 rounded-xl bg-[#FAF2DB] border border-[#e2d9c8] flex items-center justify-center text-slate-800 group-hover:scale-105 transition">
            <IconComponent size={22} />
          </div>
          {typeof family.total_careers === "number" && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {family.total_careers} {family.total_careers === 1 ? "career" : "careers"}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0b1a36] transition">
            {family.name}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-3 mt-1.5 leading-relaxed">
            {family.description || "Occupational taxonomy family encompassing specialized roles and disciplines."}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 text-xs font-bold text-slate-700 group-hover:text-slate-900 border-t border-slate-100">
        <span>Explore Family Careers</span>
        <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
