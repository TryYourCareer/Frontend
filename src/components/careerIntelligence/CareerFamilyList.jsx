import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import CareerFamilyCard from "./CareerFamilyCard";
import IntelligenceEmptyState from "./IntelligenceEmptyState";

export default function CareerFamilyList({ families = [], onSelectFamily }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFamilies = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return families;
    return families.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q)) ||
        f.key.toLowerCase().includes(q)
    );
  }, [families, searchTerm]);

  return (
    <div className="space-y-8" data-testid="career-family-list-view">
      {/* Page Header */}
      <div className="bg-white/80 rounded-3xl p-8 border border-[#e2d9c8] shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF2DB] text-slate-800 border border-[#e2d9c8]">
                Occupational Taxonomy & Architecture
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Career Intelligence
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore the 12 canonical Career Families, 5-dimension Work DNA cognitive profiles, and empirical professional activities across modern careers.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-72 relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search career families..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#fcfaf5] border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0b1a36]/20 focus:border-slate-500 transition"
              data-testid="family-search-input"
            />
          </div>
        </div>
      </div>

      {/* Families Grid */}
      {filteredFamilies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFamilies.map((family) => (
            <CareerFamilyCard
              key={family.key || family.id}
              family={family}
              onSelect={onSelectFamily}
            />
          ))}
        </div>
      ) : (
        <IntelligenceEmptyState
          title="No families found"
          description={`No career families matched "${searchTerm}". Try a different keyword.`}
          onRetry={() => setSearchTerm("")}
        />
      )}
    </div>
  );
}
