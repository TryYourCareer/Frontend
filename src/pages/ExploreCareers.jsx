import { useEffect, useMemo, useState, useRef } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Search, X, SlidersHorizontal, ArrowUpDown, 
  Brain, Compass, Check, Briefcase, Zap, ShieldAlert, DollarSign, Award, ShieldCheck, RefreshCw
} from "lucide-react";
import BACKEND_BASE_URL from "../API/BaseURL";

const API_BASE_URL = BACKEND_BASE_URL;
const API_TIMEOUT_MS = 3000;
const CSV_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

const cardColors = [
  "from-[#e9f6ff] via-[#dff0ff] to-[#d8e9ff]",
  "from-[#efeafe] via-[#e6dcff] to-[#ddd2ff]",
  "from-[#e8f9f1] via-[#dcf4ea] to-[#d2ede4]",
  "from-[#fff2e5] via-[#ffe9d8] to-[#ffdfcb]",
  "from-[#ffeff4] via-[#ffe3ec] to-[#ffd8e4]",
  "from-[#f2f7e6] via-[#e8f2d6] to-[#deebc6]",
  "from-[#e7f7f7] via-[#d9efef] to-[#cde6e6]",
  "from-[#f9f0ff] via-[#f0e3ff] to-[#e8d6ff]",
  "from-[#edf5ff] via-[#e3efff] to-[#d9e8ff]",
  "from-[#fff6e8] via-[#ffeed8] to-[#ffe4c6]",
];

const hoverColors = [
  "hover:shadow-blue-200/50",
  "hover:shadow-purple-200/50",
  "hover:shadow-emerald-200/50",
  "hover:shadow-orange-200/50",
  "hover:shadow-pink-200/50",
  "hover:shadow-lime-200/50",
  "hover:shadow-cyan-200/50",
  "hover:shadow-violet-200/50",
  "hover:shadow-indigo-200/50",
  "hover:shadow-amber-200/50",
];

const borderColors = [
  "border-blue-100 bg-[#e9f6ff]/30 text-blue-700",
  "border-purple-100 bg-[#efeafe]/30 text-purple-700",
  "border-emerald-100 bg-[#e8f9f1]/30 text-emerald-700",
  "border-orange-100 bg-[#fff2e5]/30 text-orange-700",
  "border-pink-100 bg-[#ffeff4]/30 text-pink-700",
  "border-lime-100 bg-[#f2f7e6]/30 text-lime-700",
  "border-cyan-100 bg-[#e7f7f7]/30 text-cyan-700",
  "border-violet-100 bg-[#f9f0ff]/30 text-violet-700",
  "border-indigo-100 bg-[#edf5ff]/30 text-indigo-700",
  "border-amber-100 bg-[#fff6e8]/30 text-amber-700",
];

function sortByClusterNumber(a, b) {
  const aNum = Number(String(a.cluster_id || a.id).replace(/\D/g, ""));
  const bNum = Number(String(b.cluster_id || b.id).replace(/\D/g, ""));
  return aNum - bNum;
}

function parseNumberFromText(value) {
  if (!value) return null;
  const cleaned = String(value).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function average(values) {
  if (!values.length) return null;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function collectTopItems(items, limit = 3) {
  const map = items.reduce((acc, item) => {
    if (!item) return acc;
    const key = String(item).trim();
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}


export default function ExploreCareers({ onBack, initialSearch = "", selectedClusterId, onClusterSelected }) {
  const navigate = useNavigate();
  const [clusters, setClusters] = useState([]);
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Interactive Filter & Sort States
  const [globalSearch, setGlobalSearch] = useState(initialSearch || "");
  const [filterClusterId, setFilterClusterId] = useState("all");
  const [filterDemand, setFilterDemand] = useState([]);
  const [filterAiImpact, setFilterAiImpact] = useState("all");
  const [filterSalary, setFilterSalary] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  
  // Quick View State
  const [quickViewCareer, setQuickViewCareer] = useState(null);
  
  // Mobile Collapsible Filters State
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    setGlobalSearch(initialSearch || "");
  }, [initialSearch]);

  useEffect(() => {
    let isMounted = true;

    function normalizeCluster(row) {
      return {
        id: row.cluster_id || row.id || "",
        name: row.cluster_name || row.name || "",
      };
    }

    function normalizeCareer(row) {
      return {
        id: Number(row.id || row["No."] || 0),
        clusterId: row.cluster || row.Cluster || "",
        name: row.title || row["Career Name"] || "",
        summary: row.one_line_summary || row["One-Line Summary"] || "",
        whatTheyDo: row.what_they_do || row["What They Do"] || "",
        industries: row.industries || row.Industries || "",
        demand: row.demand_level || row["Demand Level"] || "",
        entrySalary: row.entry_salary || row["Entry Salary (LPA)"] || "",
        midSalary: row.mid_salary || row["Mid Salary (LPA)"] || "",
        seniorSalary: row.senior_salary || row["Senior Salary (LPA)"] || "",
        topEarnings: row.top_earnings || row["Top Earnings (LPA)"] || "",
        growthRate: row.growth_rate || row["Growth Rate"] || "",
        aiImpact: row.ai_impact || row["AI Impact"] || "",
        coreSkills: row.core_skills || row["Core Skills"] || "",
        keyCertifications: row.key_certifications || row["Key Certifications"] || "",
        degreeRequired: row.degree_required || row["Degree Required"] || "",
        workLifeBalance: row.work_life_balance || row["Work-Life Balance"] || "",
        stressLevel: row.stress_level || row["Stress Level"] || "",
        entryPath: row.entry_path || row["Entry Path"] || "",
        whoShouldChoose: row.who_should_choose || row["Who Should Choose"] || "",
        whoShouldAvoid: row.who_should_avoid || row["Who Should Avoid"] || "",
        verdict: row.verdict || row.Verdict || "",
        moneyScore: row.money_score || row["Money Score"] || "",
        growthScore: row.growth_score || row["Growth Score"] || "",
        stabilityScore: row.stability_score || row["Stability Score"] || "",
      };
    }

    async function loadDatabaseData() {
      setLoading(true);
      setError("");

      try {
        let clustersResult = [];
        let careersResult = [];

        try {
          const [clustersResponse, careersResponse] = await Promise.all([
            fetchWithTimeout(`${API_BASE_URL}/clusters`, API_TIMEOUT_MS),
            fetchWithTimeout(`${API_BASE_URL}/careers/full`, API_TIMEOUT_MS),
          ]);

          if (!clustersResponse.ok || !careersResponse.ok) {
            throw new Error("Could not load database data");
          }

          [clustersResult, careersResult] = await Promise.all([
            clustersResponse.json(),
            careersResponse.json(),
          ]);
        } catch {
          const [clustersCsv, careersCsv] = await Promise.all([
            fetchWithTimeout("/data/ClusterSummary.csv", CSV_TIMEOUT_MS).then((res) => {
              if (!res.ok) throw new Error("Could not load ClusterSummary.csv");
              return res.text();
            }),
            fetchWithTimeout("/data/Careers.csv", CSV_TIMEOUT_MS).then((res) => {
              if (!res.ok) throw new Error("Could not load Careers.csv");
              return res.text();
            }),
          ]);

          const parsedClusters = Papa.parse(clustersCsv, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
          });
          const parsedCareers = Papa.parse(careersCsv, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
          });

          if (parsedClusters.errors.length > 0) {
            throw new Error(parsedClusters.errors[0].message || "Could not parse cluster data");
          }

          if (parsedCareers.errors.length > 0) {
            throw new Error(parsedCareers.errors[0].message || "Could not parse career data");
          }

          clustersResult = parsedClusters.data || [];
          careersResult = parsedCareers.data || [];
        }

        if (!isMounted) return;

        const parsedClusters = (clustersResult || [])
          .map(normalizeCluster)
          .filter((cluster) => cluster.id && cluster.name)
          .sort(sortByClusterNumber);

        const parsedCareers = (careersResult || [])
          .map(normalizeCareer)
          .filter((career) => career.id > 0 && career.clusterId && career.name)
          .sort((a, b) => a.id - b.id);

        setClusters(parsedClusters);
        setCareers(parsedCareers);
      } catch {
        if (!isMounted) return;
        setError("Could not load cluster/career data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDatabaseData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute cluster details dynamically (career count, averages)
  const enrichedClusters = useMemo(() => {
    const countMap = careers.reduce((acc, career) => {
      acc[career.clusterId] = (acc[career.clusterId] || 0) + 1;
      return acc;
    }, {});

    return clusters.map((cluster) => {
      const clusterCareers = careers.filter((career) => career.clusterId === cluster.id);
      const demandMix = collectTopItems(clusterCareers.map((career) => career.demand), 1)[0] || "NA";
      const avgEntry = average(
        clusterCareers
          .map((career) => parseNumberFromText(career.entrySalary))
          .filter((value) => value !== null)
      );
      const avgGrowth = average(
        clusterCareers
          .map((career) => parseNumberFromText(career.growthRate))
          .filter((value) => value !== null)
      );

      return {
        ...cluster,
        count: countMap[cluster.id] || 0,
        avgEntry,
        avgGrowth,
        demandMix,
      };
    });
  }, [clusters, careers]);

  // Handle Autoselected cluster via props
  useEffect(() => {
    if (!hasAutoSelected.current && selectedClusterId && !loading && clusters.length > 0) {
      const clusterNum = selectedClusterId.toLowerCase().replace(/[^\d]/g, "");
      const matching = clusters.find((c) =>
        String(c.id).toLowerCase().replace(/[^\d]/g, "") === clusterNum
      );
      if (matching) {
        hasAutoSelected.current = true;
        setFilterClusterId(matching.id);
        onClusterSelected?.();
      }
    }
  }, [selectedClusterId, loading, clusters, onClusterSelected]);

  // Filtering and Sorting logic for Careers
  const filteredCareers = useMemo(() => {
    let result = [...careers];

    // 1. Filter by Search Query
    const search = globalSearch.trim().toLowerCase();
    if (search) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.summary.toLowerCase().includes(search) ||
          c.coreSkills.toLowerCase().includes(search) ||
          c.industries.toLowerCase().includes(search) ||
          String(c.clusterId).toLowerCase().includes(search)
      );
    }

    // 2. Filter by Cluster
    if (filterClusterId !== "all") {
      result = result.filter((c) => {
        const cNum = String(c.clusterId).toLowerCase().replace(/[^\d]/g, "");
        const fNum = String(filterClusterId).toLowerCase().replace(/[^\d]/g, "");
        return cNum === fNum;
      });
    }

    // 3. Filter by Demand Level
    if (filterDemand.length > 0) {
      result = result.filter((c) => filterDemand.includes(c.demand));
    }

    // 4. Filter by AI Impact
    if (filterAiImpact !== "all") {
      result = result.filter((c) => String(c.aiImpact).toLowerCase() === filterAiImpact.toLowerCase());
    }

    // 5. Filter by Salary Range
    if (filterSalary !== "all") {
      result = result.filter((c) => {
        // Average Entry Salary Range
        const val = parseNumberFromText(c.entrySalary);
        if (val === null) return false;
        if (filterSalary === "low") return val < 5;
        if (filterSalary === "mid") return val >= 5 && val <= 12;
        if (filterSalary === "high") return val > 12;
        return true;
      });
    }

    // 6. Sort Results
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "salary-desc") {
      result.sort((a, b) => {
        const salaryA = parseNumberFromText(a.entrySalary) || 0;
        const salaryB = parseNumberFromText(b.entrySalary) || 0;
        return salaryB - salaryA;
      });
    } else if (sortBy === "growth-desc") {
      result.sort((a, b) => {
        const growthA = parseNumberFromText(a.growthRate) || 0;
        const growthB = parseNumberFromText(b.growthRate) || 0;
        return growthB - growthA;
      });
    } else if (sortBy === "money-desc") {
      result.sort((a, b) => (Number(b.moneyScore) || 0) - (Number(a.moneyScore) || 0));
    } else if (sortBy === "stability-desc") {
      result.sort((a, b) => (Number(b.stabilityScore) || 0) - (Number(a.stabilityScore) || 0));
    }

    return result;
  }, [careers, globalSearch, filterClusterId, filterDemand, filterAiImpact, filterSalary, sortBy]);

  // Toggle Demand selection
  const handleDemandToggle = (demand) => {
    setFilterDemand((prev) => 
      prev.includes(demand) ? prev.filter((d) => d !== demand) : [...prev, demand]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setGlobalSearch("");
    setFilterClusterId("all");
    setFilterDemand([]);
    setFilterAiImpact("all");
    setFilterSalary("all");
    setSortBy("name");
  };

  const handleBack = onBack || (() => navigate("/"));

  const filterContent = (
    <>
      {/* Sorting option */}
      <div>
        <label className="text-xs font-bold tracking-wider text-slate-400 block mb-2">SORT BY</label>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#0b1a36] focus:border-slate-400 focus:outline-none appearance-none font-sans"
          >
            <option value="name">Alphabetical (A - Z)</option>
            <option value="salary-desc">Entry Salary (High to Low)</option>
            <option value="growth-desc">Growth Rate (High to Low)</option>
            <option value="money-desc">Verdict: Money Score</option>
            <option value="stability-desc">Verdict: Stability Score</option>
          </select>
          <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Demand Level Filter */}
      <div>
        <label className="text-xs font-bold tracking-wider text-slate-400 block mb-2">DEMAND LEVEL</label>
        <div className="flex flex-col gap-2">
          {["Very High", "High", "Medium", "Low"].map((level) => {
            const isChecked = filterDemand.includes(level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => handleDemandToggle(level)}
                className={`flex items-center justify-between text-xs font-semibold px-3 py-2 rounded-xl border text-left transition-all font-sans cursor-pointer ${
                  isChecked 
                    ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100/60 text-[#0b1a36]"
                }`}
              >
                <span>{level}</span>
                {isChecked && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Impact Filter */}
      <div>
        <label className="text-xs font-bold tracking-wider text-slate-400 block mb-2">AI IMPACT</label>
        <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 font-sans">
          {["all", "Low", "High"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilterAiImpact(opt)}
              className={`text-center py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterAiImpact === opt 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {opt === "all" ? "All" : opt}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Bracket Filter */}
      <div>
        <label className="text-xs font-bold tracking-wider text-slate-400 block mb-2">ENTRY SALARY</label>
        <div className="flex flex-col gap-2 font-sans">
          {[
            { id: "all", label: "Any Salary" },
            { id: "low", label: "Starter (< 5 LPA)" },
            { id: "mid", label: "Mid-level (5-12 LPA)" },
            { id: "high", label: "Premium (12+ LPA)" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilterSalary(opt.id)}
              className={`flex items-center gap-2.5 text-xs font-semibold px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                filterSalary === opt.id 
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100/60 text-[#0b1a36]"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                filterSalary === opt.id ? "bg-amber-400" : "bg-slate-300"
              }`} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#dfeaf7] text-[#0b1d36]">
      {/* Header */}
      <header className="border-b border-[#d7e0ee] bg-[#edf3fb]/85 backdrop-blur-md sticky top-0 z-20 transition-all">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-[#0b1a36]">Explore Careers</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Test-drive different options and find your perfect path using real-world validation.
            </p>
          </div>
          
          {/* Main search bar next to title on wide viewports */}
          <div className="relative w-full max-w-md md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search careers, skills, industries..."
              className="w-full rounded-full border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-[#0b1a36] focus:border-slate-500 focus:outline-none shadow-sm transition"
            />
            {globalSearch && (
              <button 
                onClick={() => setGlobalSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Interactive Cluster Selector Cards */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Compass className="h-5 w-5 text-amber-500" />
              Filter by Career Cluster
            </h2>
            {filterClusterId !== "all" && (
              <button 
                onClick={() => setFilterClusterId("all")}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Clear selection
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {enrichedClusters.map((cluster, index) => {
              const isSelected = filterClusterId === cluster.id;
              
              return (
                <motion.button
                  key={cluster.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilterClusterId(isSelected ? "all" : cluster.id)}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cardColors[index % cardColors.length]} p-4 text-left shadow-sm border transition-all ${
                    isSelected 
                      ? "ring-2 ring-amber-500 border-transparent shadow-md" 
                      : "border-slate-200/60 hover:shadow-md"
                  }`}
                >
                  <span className="text-[10px] font-bold opacity-60 block tracking-wider">
                    {cluster.id}
                  </span>
                  <h3 className="font-extrabold text-sm leading-snug mt-1 text-[#0b1a36] line-clamp-1">
                    {cluster.name}
                  </h3>
                  
                  <div className="mt-3 flex items-center justify-between text-[11px] font-medium opacity-85">
                    <span>{cluster.count} options</span>
                    <span className="font-bold">{cluster.demandMix} Demand</span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Mobile Filters Toggle Button */}
        <div className="flex lg:hidden items-center justify-between mb-4 w-full px-2">
          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm w-full justify-center transition hover:bg-slate-50 cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4 text-amber-500" />
            Filters & Sorting
            {(filterClusterId !== "all" || filterDemand.length > 0 || filterAiImpact !== "all" || filterSalary !== "all") && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded-full font-bold">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Mobile Filters Drawer Overlay */}
        <AnimatePresence>
          {showMobileFilters && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-[#0b1a36]/40 backdrop-blur-sm lg:hidden"
                onClick={() => setShowMobileFilters(false)}
              />
              {/* Drawer Panel */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white p-6 shadow-2xl overflow-y-auto flex flex-col justify-between lg:hidden text-left"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <span className="font-extrabold text-sm tracking-wide flex items-center gap-2 text-slate-800">
                      <SlidersHorizontal className="h-4 w-4" /> FILTERS
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMobileFilters(false)}
                      className="rounded-lg border border-slate-200 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Filter Content */}
                  <div className="space-y-6 mt-6">
                    {filterContent}
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => { resetFilters(); setShowMobileFilters(false); }}
                    className="flex-1 text-center py-2.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 rounded-xl transition border border-slate-200 text-slate-700 cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 text-center py-2.5 text-xs font-bold bg-slate-900 text-white rounded-xl transition border border-transparent hover:bg-slate-800 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          {/* Desktop Filters Sidebar (lg screens only) */}
          <aside className="hidden lg:block w-64 shrink-0 bg-white/70 backdrop-blur-md border border-[#0b1a36]/5 rounded-3xl p-5 shadow-sm sticky top-28 z-10 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-extrabold text-sm tracking-wide flex items-center gap-2 text-slate-800">
                <SlidersHorizontal className="h-4 w-4" /> FILTERS
              </span>
              {(filterClusterId !== "all" || filterDemand.length > 0 || filterAiImpact !== "all" || filterSalary !== "all") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-bold text-amber-600 hover:text-[#0b1a36] transition cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>
            <div className="space-y-6 mt-6">
              {filterContent}
            </div>
          </aside>

          {/* Careers Main Grid */}
          <section className="flex-1 w-full">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="h-8 w-8 rounded-full border-4 border-slate-300 border-t-amber-500 animate-spin" />
                <p className="text-sm font-bold text-slate-500">Loading careers database...</p>
              </div>
            )}
            
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
                <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <h3 className="font-bold">Error Loading Data</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs sm:text-sm font-bold text-slate-500">
                    Showing <span className="text-[#0b1a36]">{filteredCareers.length}</span> careers matching criteria
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredCareers.map((career) => {
                      // Lookup cluster index to set corresponding border/color
                      const clusterIndex = enrichedClusters.findIndex(c => {
                        const careerCNum = String(career.clusterId).replace(/\D/g, "");
                        const clusterCNum = String(c.id).replace(/\D/g, "");
                        return careerCNum === clusterCNum;
                      });

                      const colorIdx = clusterIndex !== -1 ? clusterIndex : 0;
                      
                      return (
                        <motion.article
                          key={career.id}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.25 }}
                          className={`rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5 ${hoverColors[colorIdx]}`}
                        >
                          <div>
                            {/* Card Top */}
                            <div className="flex items-start justify-between gap-3">
                              <span className={`text-[10px] font-bold tracking-wider uppercase border px-2 py-0.5 rounded-full ${borderColors[colorIdx]}`}>
                                {career.clusterId || "Cluster"}
                              </span>
                              <span className="text-xs font-bold text-slate-400">
                                #{career.id}
                              </span>
                            </div>

                            {/* Title & One-line */}
                            <h3 className="text-base font-extrabold text-[#0b1a36] mt-3 line-clamp-1">
                              {career.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                              {career.summary}
                            </p>

                            {/* Tech and salary metrics */}
                            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-bold">
                              <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-2 border border-slate-100">
                                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                                <div>
                                  <span className="text-[9px] text-slate-400 block font-semibold leading-none">ENTRY SALARY</span>
                                  <span className="text-[#0b1a36] leading-none mt-0.5 block">{career.entrySalary || "NA"}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-2 border border-slate-100">
                                <Zap className="h-3.5 w-3.5 text-amber-500" />
                                <div>
                                  <span className="text-[9px] text-slate-400 block font-semibold leading-none">DEMAND</span>
                                  <span className="text-[#0b1a36] leading-none mt-0.5 block">{career.demand || "NA"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Core skills preview */}
                            <div className="mt-4">
                              <span className="text-[9px] font-bold tracking-wider text-slate-400 block uppercase">CORE SKILLS</span>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {String(career.coreSkills || "")
                                  .split(",")
                                  .slice(0, 3)
                                  .map((skill, i) => (
                                    <span 
                                      key={i} 
                                      className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md truncate max-w-[100px]"
                                    >
                                      {skill.trim()}
                                    </span>
                                  ))
                                }
                                {String(career.coreSkills || "").split(",").length > 3 && (
                                  <span className="text-[10px] font-bold text-slate-400 px-1 py-0.5">
                                    +{String(career.coreSkills || "").split(",").length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Card bottom actions */}
                          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                            <button
                              onClick={() => setQuickViewCareer(career)}
                              className="flex-1 text-center py-2 text-xs font-bold bg-slate-50 hover:bg-slate-100/80 rounded-xl transition border border-slate-200 text-slate-700"
                            >
                              Quick View
                            </button>
                            <button
                              onClick={() => navigate(`/career-details/${encodeURIComponent(career.name)}`)}
                              className="flex-1 text-center py-2 text-xs font-bold bg-[#FAF2DB] hover:bg-[#ebd08b] rounded-xl transition border border-transparent text-[#0b1a36]"
                            >
                              Full Roadmap
                            </button>
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {filteredCareers.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 p-12 text-center text-slate-500 max-w-lg mx-auto mt-10">
                    <Briefcase className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                    <h3 className="font-extrabold text-[#0b1a36]">No Matching Careers</h3>
                    <p className="text-xs sm:text-sm mt-1 leading-relaxed">
                      We couldn't find any career options matching your selected search query or filters. Try resetting the filters or broadening your search parameters.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Quick View Aside Drawer Overlay */}
      <AnimatePresence>
        {quickViewCareer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-[#0b1a36]/30 backdrop-blur-sm"
              onClick={() => setQuickViewCareer(null)}
            />

            {/* Sidebar drawer content */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl border-l border-slate-200/50 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50 px-6 py-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full tracking-wider border border-amber-100">
                      {quickViewCareer.clusterId}
                    </span>
                    <h2 className="text-xl font-extrabold text-[#0b1a36] mt-1">{quickViewCareer.name}</h2>
                  </div>
                  <button
                    onClick={() => setQuickViewCareer(null)}
                    className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Details Section */}
                <div className="space-y-6 px-6 py-6 text-left">
                  {/* One-Liner Description */}
                  <div>
                    <h4 className="text-xs font-bold tracking-wider text-slate-400 block uppercase mb-1">ONE-LINE SUMMARY</h4>
                    <p className="text-base text-slate-700 leading-relaxed font-medium">
                      {quickViewCareer.summary}
                    </p>
                  </div>

                  {/* What they do details */}
                  <div>
                    <h4 className="text-xs font-bold tracking-wider text-slate-400 block uppercase mb-1">WHAT THEY DO</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {quickViewCareer.whatTheyDo}
                    </p>
                  </div>

                  {/* High level metrics dashboard */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 block font-bold leading-none">DEMAND LEVEL</span>
                      <span className="text-[#0b1a36] text-xs font-extrabold mt-1 block">{quickViewCareer.demand}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 block font-bold leading-none">GROWTH RATE</span>
                      <span className="text-[#0b1a36] text-xs font-extrabold mt-1 block">{quickViewCareer.growthRate}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 block font-bold leading-none">AI IMPACT</span>
                      <span className="text-[#0b1a36] text-xs font-extrabold mt-1 block">{quickViewCareer.aiImpact}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 block font-bold leading-none">WORK-LIFE</span>
                      <span className="text-[#0b1a36] text-xs font-extrabold mt-1 block">{quickViewCareer.workLifeBalance}</span>
                    </div>
                  </div>

                  {/* Salary Bracket grid */}
                  <div>
                    <h4 className="text-xs font-bold tracking-wider text-slate-400 block uppercase mb-2">SALARY PATHWAY (LPA)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { title: "Entry", val: quickViewCareer.entrySalary },
                        { title: "Mid", val: quickViewCareer.midSalary },
                        { title: "Senior", val: quickViewCareer.seniorSalary },
                        { title: "Top Earnings", val: quickViewCareer.topEarnings },
                      ].map((sal) => (
                        <div key={sal.title} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-center">
                          <span className="text-[9px] text-slate-400 block font-bold leading-none uppercase">{sal.title}</span>
                          <span className="text-[#0b1a36] text-xs font-extrabold mt-1.5 block">{sal.val || "NA"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verdict and scores */}
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5">
                    <h4 className="text-xs font-bold tracking-wider text-amber-700 block uppercase mb-1 flex items-center gap-1.5">
                      <Award className="h-4 w-4" /> STRIDE VERDICT & SCORES
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-semibold italic mt-1">
                      "{quickViewCareer.verdict}"
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                      <div className="bg-white px-2 py-2.5 rounded-xl border border-amber-500/5">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Money</span>
                        <span className="text-[#0b1a36] text-sm font-extrabold mt-1.5 block">{quickViewCareer.moneyScore}/10</span>
                      </div>
                      <div className="bg-white px-2 py-2.5 rounded-xl border border-amber-500/5">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Growth</span>
                        <span className="text-[#0b1a36] text-sm font-extrabold mt-1.5 block">{quickViewCareer.growthScore}/10</span>
                      </div>
                      <div className="bg-white px-2 py-2.5 rounded-xl border border-amber-500/5">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Stability</span>
                        <span className="text-[#0b1a36] text-sm font-extrabold mt-1.5 block">{quickViewCareer.stabilityScore}/10</span>
                      </div>
                    </div>
                  </div>

                  {/* Industries & Skills lists */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-slate-400 block uppercase mb-1.5">INDUSTRIES</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {quickViewCareer.industries}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-slate-400 block uppercase mb-1.5">CORE SKILLS</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {quickViewCareer.coreSkills}
                      </p>
                    </div>
                  </div>

                  {/* Certifications and Entry Path */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-slate-400 block uppercase mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" /> CERTIFICATIONS
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {quickViewCareer.keyCertifications || "No specific certifications listed."}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-slate-400 block uppercase mb-1 flex items-center gap-1.5">
                        <Brain className="h-4 w-4 text-purple-600" /> ENTRY PATH
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {quickViewCareer.entryPath || "No standard entry path documented."}
                      </p>
                    </div>
                  </div>

                  {/* Who should choose vs avoid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-slate-700">
                      <span className="text-[10px] font-bold text-emerald-800 tracking-wider block uppercase mb-1">WHO SHOULD CHOOSE</span>
                      <p className="text-xs leading-relaxed font-medium">{quickViewCareer.whoShouldChoose}</p>
                    </div>
                    <div className="bg-red-50/30 p-4 rounded-xl border border-red-100 text-slate-700">
                      <span className="text-[10px] font-bold text-red-800 tracking-wider block uppercase mb-1">WHO SHOULD AVOID</span>
                      <p className="text-xs leading-relaxed font-medium">{quickViewCareer.whoShouldAvoid}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action footer */}
              <div className="sticky bottom-0 bg-slate-50 border-t border-slate-100 px-6 py-4 flex gap-3">
                <button
                  onClick={() => setQuickViewCareer(null)}
                  className="flex-1 text-center py-3 text-xs font-bold bg-white hover:bg-slate-50 rounded-xl transition border border-slate-200 text-slate-700"
                >
                  Close Quick View
                </button>
                <button
                  onClick={() => {
                    const name = quickViewCareer.name;
                    setQuickViewCareer(null);
                    navigate(`/career-details/${encodeURIComponent(name)}`);
                  }}
                  className="flex-1 text-center py-3 text-xs font-bold bg-[#FAF2DB] hover:bg-[#ebd08b] rounded-xl transition border border-transparent text-[#0b1a36] shadow-sm"
                >
                  View Full Career Roadmap
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
