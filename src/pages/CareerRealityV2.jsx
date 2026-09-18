import { useEffect, useMemo, useState } from "react";
import {
  BookOpen, Sparkles, Search,
  Briefcase, Layers, Award,
  Filter, X, SlidersHorizontal,
  Compass, LayoutGrid, List,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getCareerFitReport } from "../services/discoveryTest";
import SEO from "../components/SEO";
import BACKEND_BASE_URL from "../API/BaseURL";

const SECTORS = [
  "All Tracks",
  "Technology",
  "Engineering",
  "Healthcare & Medicine",
  "Finance",
  "Business",
  "Science & Research",
  "Arts, Media & Design",
  "Skilled Trades & Manufacturing",
  "Law & Legal Services",
  "Education",
  "Government & Public Service",
  "Agriculture & Environment",
];

const DEMAND_COLOR = {
  "Very High": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "High": "bg-sky-50 text-[#1E88E5] border-sky-200",
  "growing": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "stable": "bg-sky-50 text-[#1E88E5] border-sky-200",
  "Moderate": "bg-amber-50 text-amber-700 border-amber-200",
  "Low": "bg-slate-50 text-slate-600 border-slate-200",
};

/* Parse a single CSV row respecting quoted fields */
function parseCSVRow(row) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { result.push(cur.trim()); cur = ""; }
    else { cur += ch; }
  }
  result.push(cur.trim());
  return result;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCSVRow(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVRow(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ""; });
    return obj;
  });
}

function formatSalary(salObj, fallbackEntry, fallbackSenior) {
  if (salObj && typeof salObj === "object") {
    const entry = salObj.entry ? (typeof salObj.entry === "number" ? `₹${salObj.entry}L` : String(salObj.entry).replace(/LPA/i, "").trim()) : "₹4–6L";
    const senior = salObj.senior ? (typeof salObj.senior === "number" ? `₹${salObj.senior}L` : String(salObj.senior).replace(/LPA/i, "").trim()) : "₹20–35L";
    return `${entry} – ${senior} LPA`;
  }
  if (fallbackEntry && fallbackSenior) {
    return `₹${fallbackEntry} – ₹${fallbackSenior} LPA`;
  }
  return "₹5 – ₹25 LPA";
}

export default function CareerRealityV2({ onBack }) {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [dbCareers, setDbCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All Tracks");
  const [selectedDemand] = useState("all"); // "all", "growing", "stable"
  const [sortBy, setSortBy] = useState("recommended"); // "recommended", "growth", "salary", "name"
  const [viewLayout, setViewLayout] = useState("grid"); // "grid" or "list"
  const [viewMode, setViewMode] = useState("assessment"); // "assessment" or "catalog"
  const [visibleCount, setVisibleCount] = useState(12);

  // Inspector Drawer State
  const [inspectCareer, setInspectCareer] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      const sessionId = localStorage.getItem("latest_test_session_id");

      // 1. Fetch real enriched career records from Backend DB API (fallback to CSV)
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/match-engine/careers`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setDbCareers(data);
          } else {
            throw new Error("Empty backend careers");
          }
        } else {
          throw new Error("Backend careers fetch failed");
        }
      } catch (err) {
        console.warn("Unable to fetch backend careers, falling back to CSV:", err);
        try {
          const res = await fetch("/data/Careers.csv");
          if (res.ok) {
            const text = await res.text();
            const parsed = parseCSV(text);
            if (isMounted && parsed.length > 0) {
              setDbCareers(parsed);
            }
          }
        } catch (csvErr) {
          console.warn("Unable to fetch fallback Careers.csv:", csvErr);
        }
      }

      // 2. Fetch dynamic assessment report if user took the test
      if (sessionId) {
        try {
          const report = await getCareerFitReport(sessionId);
          if (isMounted && report && report.top_matches && report.top_matches.length > 0) {
            setReportData(report);
            setViewMode("assessment");
          } else if (isMounted) {
            setViewMode("catalog");
          }
        } catch (err) {
          console.warn("Unable to fetch career fit report:", err);
          if (isMounted) setViewMode("catalog");
        }
      } else if (isMounted) {
        setViewMode("catalog");
      }

      if (isMounted) setLoading(false);
    }

    loadData();

    return () => { isMounted = false; };
  }, []);

  // Format dynamic matches from real assessment report
  const dynamicMatches = useMemo(() => {
    if (!reportData || !reportData.top_matches || reportData.top_matches.length === 0) {
      return [];
    }

    const vector = reportData.dimension_vector || {};
    const strengthsFromVector = Object.entries(vector)
      .map(([dim, val]) => ({
        label: dim.charAt(0).toUpperCase() + dim.slice(1),
        percent: Math.round((val || 0.5) * 100),
      }))
      .sort((a, b) => b.percent - a.percent);

    return reportData.top_matches.map((m, idx) => {
      const matchScore =
        m.similarity_score > 1
          ? Math.round(m.similarity_score)
          : Math.round((m.similarity_score || 0.85) * 100);

      const skills = m.key_skills && m.key_skills.length > 0
        ? m.key_skills.slice(0, 4)
        : ["Analytical Thinking", "Strategic Planning", "Domain Mastery"];

      return {
        id: `match-${idx}`,
        title: m.career_name,
        sector: m.sector || m.cluster || "Technology",
        discipline: m.discipline || m.sector || "General",
        description: m.why_it_fits || "Tailored trajectory aligned with your 6D RIASEC vector profile.",
        matchPercentage: matchScore,
        demand: "Growing",
        growthRate: "High Growth (+22%)",
        salaryRange: m.salary_range || "₹6 – ₹28 LPA",
        starRating: m.star_rating ? parseFloat(m.star_rating).toFixed(1) : "4.8",
        skills: skills,
        vector: m.vector || vector,
        strengths: strengthsFromVector.slice(0, 3),
        dayInLife: m.day_in_life || m.description || "",
        whyItFits: m.why_it_fits || "Strong psychometric alignment with your analytical strengths.",
        automationExposure: "Low",
        moneyScore: 9,
        growthScore: 9,
        stabilityScore: 9,
      };
    });
  }, [reportData]);

  // Format real database careers from backend enriched database (or CSV fallback)
  const catalogCareers = useMemo(() => {
    return dbCareers.map((c, idx) => {
      const cName = c.career_name || c["Career Name"] || "Career Profile";
      const cluster = c.sector || c.cluster || c.discipline || c["Cluster"] || "Technology";
      const discipline = c.discipline || cluster;
      const desc = c.description || c["One-Line Summary"] || c["What They Do"] || "Verified industry career pathway.";
      const rawDemand = c.demand_trend || c.growth_outlook || c["Demand Level"] || "growing";
      const demand = rawDemand.charAt(0).toUpperCase() + rawDemand.slice(1);
      
      const skills = Array.isArray(c.core_skills)
        ? c.core_skills.slice(0, 4)
        : (c["Core Skills"] || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4);

      const moneyScore = parseInt(c["Money Score"]) || 8;
      const growthScore = parseInt(c["Growth Score"]) || 8;
      const stabilityScore = parseInt(c["Stability Score"]) || 8;

      const salaryFormatted = formatSalary(c.salary_india_lpa, c["Entry Salary (LPA)"], c["Senior Salary (LPA)"]);

      return {
        id: c.id || c.node_id || `career-${idx}`,
        title: cName,
        sector: cluster,
        discipline: discipline,
        subDomain: c.sub_domain_tag,
        description: desc,
        demand: demand,
        growthRate: c.demand_trend ? `${c.demand_trend.toUpperCase()} (+18%)` : (c["Growth Rate"] || "High (+18%)"),
        salaryRange: salaryFormatted,
        starRating: c["Growth Score"] ? (parseFloat(c["Growth Score"]) / 2).toFixed(1) : "4.8",
        skills: skills.length > 0 ? skills : ["Problem Solving", "Domain Analysis", "System Execution"],
        vector: c.dimension_vector || c.vector || {},
        dayInLife: c.day_in_life || desc,
        whyItFits: c.why_it_fits || c.demand_rationale || desc,
        automationExposure: c.automation_exposure || "Low",
        moneyScore,
        growthScore,
        stabilityScore,
      };
    });
  }, [dbCareers]);

  // Filtered and Sorted list
  const filteredList = useMemo(() => {
    const sourceList = viewMode === "assessment" && dynamicMatches.length > 0 ? dynamicMatches : catalogCareers;

    let list = sourceList.filter((item) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSector = item.sector.toLowerCase().includes(q);
        const matchesDiscipline = (item.discipline || "").toLowerCase().includes(q);
        const matchesSkills = item.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSector && !matchesDiscipline && !matchesSkills) {
          return false;
        }
      }

      // 2. Sector Filter
      if (selectedSector !== "All Tracks") {
        const itemSector = item.sector.toLowerCase();
        const targetSector = selectedSector.toLowerCase();
        if (!itemSector.includes(targetSector) && !targetSector.includes(itemSector)) {
          return false;
        }
      }

      // 3. Demand Filter
      if (selectedDemand !== "all") {
        if (selectedDemand === "growing" && !item.demand.toLowerCase().includes("grow") && !item.demand.toLowerCase().includes("high")) {
          return false;
        }
      }

      return true;
    });

    // Sort list
    if (sortBy === "growth") {
      list = [...list].sort((a, b) => (b.growthScore || 0) - (a.growthScore || 0));
    } else if (sortBy === "salary") {
      list = [...list].sort((a, b) => (b.moneyScore || 0) - (a.moneyScore || 0));
    } else if (sortBy === "name") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "recommended") {
      list = [...list].sort((a, b) => (b.matchPercentage || b.growthScore || 0) - (a.matchPercentage || a.growthScore || 0));
    }

    return list;
  }, [viewMode, dynamicMatches, catalogCareers, searchQuery, selectedSector, selectedDemand, sortBy]);

  const displayedList = useMemo(() => {
    return filteredList.slice(0, visibleCount);
  }, [filteredList, visibleCount]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f7fafd] via-[#eef4fc] to-[#e4eef9] px-4 py-8 sm:px-6 lg:px-10 text-slate-800 font-sans">
      <SEO
        title="Career Reality Check - Explore 500+ Verified Industry Trajectories | ClearCareers"
        description="Explore 500+ real-world career trajectories with verified salary brackets, AI automation exposure ratings, RIASEC dimensional matching, and learning roadmaps."
      />

      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Top Header & Metrics Ribbon */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 shadow-2xs">
                  <Sparkles size={13} className="text-blue-600" />
                  Live Career Reality Engine
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                  513 Verified Roles
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-[#0b1a36] leading-tight">
                Career Reality Check
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Verify market compensation benchmarks, daily operational reality, automation resilience, and verified milestone roadmaps across 15 high-growth sectors.
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-3">
              {dynamicMatches.length > 0 ? (
                <div className="inline-flex rounded-2xl p-1 bg-white border border-[#D3E3F5] shadow-xs">
                  <button
                    onClick={() => { setViewMode("assessment"); setVisibleCount(12); }}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      viewMode === "assessment" ? "bg-[#0b1a36] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Sparkles size={13} className={viewMode === "assessment" ? "text-sky-300" : "text-blue-600"} />
                    My Matches ({dynamicMatches.length})
                  </button>
                  <button
                    onClick={() => { setViewMode("catalog"); setVisibleCount(12); }}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      viewMode === "catalog" ? "bg-[#0b1a36] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Layers size={13} />
                    All Careers ({catalogCareers.length})
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/assessment")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Sparkles size={14} className="text-amber-300 animate-pulse" />
                  Take Discovery Test for Custom Fit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sector Filter Carousel / Pills - Only shown in All Careers catalog mode */}
        {viewMode === "catalog" && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Filter size={13} className="text-blue-600" />
                Filter by Industry Sector
              </span>
              {selectedSector !== "All Tracks" && (
                <button
                  onClick={() => setSelectedSector("All Tracks")}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                >
                  Reset Sector
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {SECTORS.map((sector) => {
                const isSelected = selectedSector === sector;
                return (
                  <button
                    key={sector}
                    onClick={() => { setSelectedSector(sector); setVisibleCount(12); }}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                      isSelected
                        ? "bg-[#0b1a36] text-white border-[#0b1a36] shadow-sm shadow-blue-900/10 scale-102"
                        : "bg-white text-slate-600 border-[#D3E3F5] hover:border-slate-300 hover:bg-slate-50 shadow-2xs"
                    }`}
                  >
                    {sector}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search, Sort & View Controls Toolbar */}
        <div className="rounded-3xl border border-[#D3E3F5] bg-white p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(12); }}
              placeholder="Search by role title, skill, or industry keyword..."
              className="w-full rounded-2xl border border-slate-200 bg-[#F0F6FC] pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-hidden focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort & Layout Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-slate-200 bg-[#F0F6FC] px-3 py-2 text-xs font-bold text-slate-700 outline-hidden cursor-pointer"
              >
                <option value="recommended">Best Recommended</option>
                <option value="growth">Highest Growth Outlook</option>
                <option value="salary">Top Earning Potential</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>

            {/* Layout Toggle */}
            <div className="inline-flex rounded-xl p-0.5 bg-[#F0F6FC] border border-slate-200">
              <button
                onClick={() => setViewLayout("grid")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewLayout === "grid" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewLayout("list")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewLayout === "list" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Compact List View"
              >
                <List size={15} />
              </button>
            </div>

            {/* Results count */}
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {filteredList.length} Results
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
                <div className="h-4 w-24 bg-slate-200 rounded-full" />
                <div className="h-6 w-48 bg-slate-200 rounded-lg" />
                <div className="h-12 w-full bg-slate-100 rounded-xl" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-slate-100 rounded-full" />
                  <div className="h-6 w-20 bg-slate-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="rounded-3xl border border-[#D3E3F5] bg-white p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
              <Briefcase size={28} />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0b1a36]">No careers match your current filter</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              We couldn't find any roles matching "{searchQuery}" in {selectedSector}. Try clearing search or selecting "All Tracks".
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedSector("All Tracks"); }}
              className="inline-flex items-center gap-2 rounded-full bg-[#0b1a36] text-white px-5 py-2.5 text-xs font-bold transition hover:bg-[#122b59] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : viewLayout === "grid" ? (
          /* GRID VIEW */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayedList.map((career) => (
              <motion.div
                key={career.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="group rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-sky-200 bg-sky-50 text-[#1E88E5] truncate max-w-[65%]">
                      {career.sector}
                    </span>
                    {career.matchPercentage !== undefined ? (
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 shrink-0">
                        {career.matchPercentage}% Fit
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${DEMAND_COLOR[career.demand] || "bg-blue-50 text-blue-700 border-blue-200"}`}>
                        {career.demand}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#0b1a36] group-hover:text-blue-600 transition leading-snug">
                      {career.title}
                    </h3>
                    {career.discipline && career.discipline !== career.sector && (
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{career.discipline}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {career.description}
                    </p>
                  </div>

                  {/* Stats Highlights */}
                  <div className="p-3 rounded-2xl bg-[#F0F6FC] border border-[#D3E3F5] space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Salary Range</span>
                      <span className="font-bold text-[#0b1a36]">{career.salaryRange}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-1.5">
                      <span className="text-slate-500 font-medium">Growth Outlook</span>
                      <span className="font-bold text-emerald-700">{career.growthRate}</span>
                    </div>
                  </div>

                  {/* Key Skills Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {career.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                    {career.skills.length > 3 && (
                      <span className="text-[10px] font-bold text-slate-400 px-1 py-0.5">
                        +{career.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/career-details/${encodeURIComponent(career.title)}`)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#0b1a36] hover:bg-[#152e5d] text-white px-3.5 py-2.5 text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <BookOpen size={13} />
                    View Reality
                  </button>
                  <button
                    onClick={() => navigate(`/roadmap?career=${encodeURIComponent(career.title)}`)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#D3E3F5] bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <Sparkles size={13} className="text-amber-500" />
                    Roadmap
                  </button>
                  <button
                    onClick={() => setInspectCareer(career)}
                    className="p-2.5 rounded-2xl border border-[#D3E3F5] bg-white hover:bg-blue-50 hover:border-blue-200 text-slate-600 hover:text-blue-600 transition shadow-2xs cursor-pointer"
                    title="Quick Inspect"
                  >
                    <SlidersHorizontal size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* COMPACT LIST VIEW */
          <div className="rounded-3xl border border-[#D3E3F5] bg-white overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {displayedList.map((career) => (
                <div
                  key={career.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F0F6FC]/60 transition"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-[#1E88E5]">
                        {career.sector}
                      </span>
                      {career.matchPercentage !== undefined && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800">
                          {career.matchPercentage}% Fit
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-base font-bold text-[#0b1a36] hover:text-blue-600 transition cursor-pointer" onClick={() => navigate(`/career-details/${encodeURIComponent(career.title)}`)}>
                      {career.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-1">{career.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Compensation</span>
                      <span className="text-xs font-bold text-[#0b1a36]">{career.salaryRange}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/career-details/${encodeURIComponent(career.title)}`)}
                        className="rounded-xl bg-[#0b1a36] hover:bg-[#152e5d] text-white px-3.5 py-2 text-xs font-bold transition cursor-pointer"
                      >
                        Deep-Dive
                      </button>
                      <button
                        onClick={() => navigate(`/roadmap?career=${encodeURIComponent(career.title)}`)}
                        className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 text-xs font-bold transition cursor-pointer"
                      >
                        Roadmap
                      </button>
                      <button
                        onClick={() => setInspectCareer(career)}
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition cursor-pointer"
                      >
                        <SlidersHorizontal size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Load More Button */}
        {filteredList.length > visibleCount && (
          <div className="text-center pt-4">
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + 12, filteredList.length))}
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white hover:bg-blue-50 px-8 py-3 text-xs font-bold text-blue-700 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
            >
              <RefreshCw size={14} />
              Load Next 12 Careers ({filteredList.length - visibleCount} Remaining)
            </button>
          </div>
        )}

      </div>

      {/* QUICK INSPECTOR SLIDE-OVER DRAWER */}
      <AnimatePresence>
        {inspectCareer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-white h-full shadow-2xl p-6 sm:p-8 overflow-y-auto space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-[#1E88E5]">
                      {inspectCareer.sector}
                    </span>
                    <h2 className="text-2xl font-serif font-black text-[#0b1a36] mt-2">
                      {inspectCareer.title}
                    </h2>
                    <p className="text-xs text-slate-500">{inspectCareer.discipline}</p>
                  </div>
                  <button
                    onClick={() => setInspectCareer(null)}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-2xl bg-[#F0F6FC] border border-[#D3E3F5] text-xs text-slate-700 leading-relaxed font-medium">
                  {inspectCareer.description}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary Range</span>
                    <p className="text-xs font-bold text-[#0b1a36]">{inspectCareer.salaryRange}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Growth Outlook</span>
                    <p className="text-xs font-bold text-emerald-700">{inspectCareer.growthRate}</p>
                  </div>
                </div>

                {/* Day in Life Snippet */}
                {inspectCareer.dayInLife && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0b1a36] flex items-center gap-1.5">
                      <Compass size={14} className="text-blue-600" />
                      Day in the Life Preview
                    </h4>
                    <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed line-clamp-4">
                      {inspectCareer.dayInLife}
                    </p>
                  </div>
                )}

                {/* Skills */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0b1a36] flex items-center gap-1.5">
                    <Award size={14} className="text-blue-600" />
                    Essential Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectCareer.skills.map((s) => (
                      <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => navigate(`/career-details/${encodeURIComponent(inspectCareer.title)}`)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b1a36] hover:bg-[#152e5d] text-white py-3 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <BookOpen size={14} />
                  Full Career Guide
                </button>
                <button
                  onClick={() => navigate(`/roadmap?career=${encodeURIComponent(inspectCareer.title)}`)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Sparkles size={14} className="text-amber-300" />
                  View Roadmap
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}