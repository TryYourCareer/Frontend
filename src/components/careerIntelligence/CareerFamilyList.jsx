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
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-[#D3E3F5] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl text-left">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-[#1E88E5] border border-sky-200">
                Occupational Taxonomy & Architecture
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#0b1a36] tracking-tight">
              Career Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Explore the 12 canonical Career Families, 5-dimension Work DNA cognitive profiles, and empirical professional activities across modern careers.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-72 relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search career families..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-[#F0F6FC] border border-[#D3E3F5] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b1a36]/15 focus:border-slate-400 focus:bg-white transition shadow-2xs"
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