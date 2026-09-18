import React, { useState, useMemo } from "react";
import { ArrowLeft, Search, ChevronRight } from "lucide-react";
import { ClassificationBadge } from "./CareerIntelligenceStatus";
import IntelligenceEmptyState from "./IntelligenceEmptyState";

export default function FamilyCareersList({
  familyData,
  onSelectCareer,
  onBack,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const family = familyData?.family;
  const rawCareers = familyData?.careers;
  const careers = useMemo(() => rawCareers || [], [rawCareers]);
  const totalCount = familyData?.total_careers ?? careers.length;

  const filteredCareers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return careers;
    return careers.filter((item) => {
      const name = item.career?.name || "";
      const slug = item.career?.slug || "";
      const sector = item.career?.sector_name || "";
      return (
        name.toLowerCase().includes(q) ||
        slug.toLowerCase().includes(q) ||
        sector.toLowerCase().includes(q)
      );
    });
  }, [careers, searchTerm]);

  if (!family) {
    return (
      <IntelligenceEmptyState
        title="Family Not Found"
        description="The requested career family does not exist or has been removed."
        type="error"
        onBack={onBack}
        backLabel="Back to All Families"
      />
    );
  }

  return (
    <div className="space-y-6" data-testid="family-careers-view">
      {/* Back Button & Breadcrumb */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white/80 px-3 py-1.5 rounded-xl border border-[#e2d9c8] transition hover:bg-white"
        >
          <ArrowLeft size={16} />
          <span>All Career Families</span>
        </button>
      </div>

      {/* Family Header */}
      <div className="bg-white/80 rounded-3xl p-8 border border-[#e2d9c8] shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF2DB] text-slate-800 border border-[#e2d9c8]">
                Career Family
              </span>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                {family.key}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {family.name}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {family.description || "Collection of classified careers under this taxonomy domain."}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {totalCount} {totalCount === 1 ? "Classified Career" : "Classified Careers"}
            </span>

            {/* In-family search */}
            <div className="w-full sm:w-64 relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search careers in family..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[#fcfaf5] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0b1a36]/20 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Careers Grid */}
      {filteredCareers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCareers.map((item) => {
            const car = item.career || {};
            const slug = car.slug;

            return (
              <div
                key={car.id || slug}
                role="button"
                tabIndex={0}
                onClick={() => onSelectCareer?.(slug)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectCareer?.(slug);
                  }
                }}
                className="group bg-white/90 rounded-2xl p-6 border border-[#e2d9c8] hover:border-slate-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 focus:outline-none focus:ring-2 focus:ring-[#0b1a36]/20"
                data-testid={`family-career-item-${slug}`}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <ClassificationBadge status={item.classification_status} />
                    {car.sector_name && (
                      <span className="text-xs text-slate-500 font-medium">
                        {car.sector_name}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0b1a36] transition">
                      {car.name}
                    </h3>
                    {car.one_liner ? (
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                        {car.one_liner}
                      </p>
                    ) : car.description ? (
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                        {car.description}
                      </p>
                    ) : null}
                  </div>

                  {item.rationale && (
                    <div className="text-xs text-slate-600 bg-[#FAF2DB]/40 p-2.5 rounded-lg border border-[#e2d9c8]">
                      <span className="font-semibold text-slate-800">Classification Rationale: </span>
                      <span>{item.rationale}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 text-xs font-bold text-slate-700 border-t border-slate-100">
                  <span>View Full Career Intelligence</span>
                  <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      ) : careers.length > 0 ? (
        <IntelligenceEmptyState
          title="No matching careers"
          description={`No careers matched "${searchTerm}".`}
          onRetry={() => setSearchTerm("")}
        />
      ) : (
        <IntelligenceEmptyState
          title="No Careers In Family Yet"
          description="There are currently no careers classified under this family."
          type="empty"
          onBack={onBack}
        />
      )}
    </div>
  );
}
