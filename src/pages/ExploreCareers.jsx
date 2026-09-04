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
  "from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7]",
  "from-[#f0f4fd] via-[#e8effc] to-[#dbe7f9]",
  "from-[#f2f7fc] via-[#e9f2fa] to-[#dceaf7]",
  "from-[#f5f9fe] via-[#edf5fc] to-[#e0effb]",
  "from-[#eef5fc] via-[#e4effa] to-[#d6e7f7]",
  "from-[#f1f6fd] via-[#e7f0fb] to-[#dbe8f8]",
  "from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7]",
  "from-[#f0f4fd] via-[#e8effc] to-[#dbe7f9]",
  "from-[#f2f7fc] via-[#e9f2fa] to-[#dceaf7]",
  "from-[#f5f9fe] via-[#edf5fc] to-[#e0effb]",
];

const hoverColors = [
  "hover:shadow-blue-200/40",
  "hover:shadow-sky-200/40",
  "hover:shadow-indigo-200/40",
  "hover:shadow-blue-200/40",
  "hover:shadow-cyan-200/40",
  "hover:shadow-sky-200/40",
  "hover:shadow-blue-200/40",
  "hover:shadow-indigo-200/40",
  "hover:shadow-sky-200/40",
  "hover:shadow-blue-200/40",
];

const borderColors = [
  "border-[#D3E3F5] bg-sky-50 text-[#1E88E5]",
  "border-[#D3E3F5] bg-blue-50 text-[#1E88E5]",
  "border-[#D3E3F5] bg-indigo-50 text-indigo-700",
  "border-[#D3E3F5] bg-sky-50 text-[#1E88E5]",
  "border-[#D3E3F5] bg-cyan-50 text-cyan-700",
  "border-[#D3E3F5] bg-blue-50 text-[#1E88E5]",
  "border-[#D3E3F5] bg-sky-50 text-[#1E88E5]",
  "border-[#D3E3F5] bg-indigo-50 text-indigo-700",
  "border-[#D3E3F5] bg-blue-50 text-[#1E88E5]",
  "border-[#D3E3F5] bg-sky-50 text-[#1E88E5]",
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

  const filteredCareers = useMemo(() => {
    let result = [...careers];

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

    if (filterClusterId !== "all") {
      result = result.filter((c) => {
        const cNum = String(c.clusterId).toLowerCase().replace(/[^\d]/g, "");
        const fNum = String(filterClusterId).toLowerCase().replace(/[^\d]/g, "");
        return cNum === fNum;
      });
    }

    if (filterDemand.length > 0) {
      result = result.filter((c) => filterDemand.includes(c.demand));
    }

    if (filterAiImpact !== "all") {
      result = result.filter((c) => String(c.aiImpact).toLowerCase() === filterAiImpact.toLowerCase());
    }

    if (filterSalary !== "all") {
      result = result.filter((c) => {
        const val = parseNumberFromText(c.entrySalary);
        if (val === null) return false;
        if (filterSalary === "low") return val < 5;
        if (filterSalary === "mid") return val >= 5 && val <= 12;
        if (filterSalary === "high") return val > 12;
        return true;
      });
    }

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

  const handleDemandToggle = (demand) => {
    setFilterDemand((prev) => 
      prev.includes(demand) ? prev.filter((d) => d !== demand) : [...prev, demand]
    );
  };

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
        <label className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase mb-2">SORT BY</label>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl px-3 py-2 text-xs font-semibold text-[#0b1a36] focus:border-slate-400 focus:bg-white focus:outline-none appearance-none font-sans cursor-pointer shadow-2xs"
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
        <label className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase mb-2">DEMAND LEVEL</label>
        <div className="flex flex-col gap-1.5">
          {["Very High", "High", "Medium", "Low"].map((level) => {
            const isChecked = filterDemand.includes(level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => handleDemandToggle(level)}
                className={`flex items-center justify-between text-xs font-semibold px-3 py-2 rounded-2xl border text-left transition-all font-sans cursor-pointer shadow-2xs ${
                  isChecked 
                    ? "bg-[#0b1a36] border-[#0b1a36] text-white" 
                    : "bg-[#F0F6FC] border-[#D3E3F5] hover:bg-white text-[#0b1a36]"
                }`}
              >
                <span>{level}</span>
                {isChecked && <Check className="h-3 w-3 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Impact Filter */}
      <div>
        <label className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase mb-2">AI IMPACT</label>
        <div className="grid grid-cols-3 gap-1 bg-[#F0F6FC] p-1 rounded-2xl border border-[#D3E3F5] font-sans">
          {["all", "Low", "High"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilterAiImpact(opt)}
              className={`text-center py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterAiImpact === opt 
                  ? "bg-white text-[#0b1a36] shadow-2xs" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {opt === "all" ? "All" : opt}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Bracket Filter */}
      <div>
        <label className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase mb-2">ENTRY SALARY</label>
        <div className="flex flex-col gap-1.5 font-sans">
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
              className={`flex items-center gap-2.5 text-xs font-semibold px-3 py-2 rounded-2xl text-left border transition-all cursor-pointer shadow-2xs ${
                filterSalary === opt.id 
                  ? "bg-[#0b1a36] border-[#0b1a36] text-white" 
                  : "bg-[#F0F6FC] border-[#D3E3F5] hover:bg-white text-[#0b1a36]"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                filterSalary === opt.id ? "bg-[#1E88E5]" : "bg-slate-300"
              }`} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] text-[#0b1a36] font-sans">
      {/* Header */}
      <header className="border-b border-[#D3E3F5] bg-white/85 backdrop-blur-md sticky top-0 z-20 transition-all">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-left">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-full border border-[#D3E3F5] bg-white px-4 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-2 text-[#0b1a36]">Explore Careers</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Test-drive different options and find your perfect path using real-world validation.
            </p>
          </div>
          
          {/* Main search bar */}
          <div className="relative w-full max-w-md md:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search careers, skills, industries..."
              className="w-full rounded-full border border-[#D3E3F5] bg-[#F0F6FC] py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#0b1a36] placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none shadow-2xs transition"
            />
            {globalSearch && (
              <button 
                onClick={() => setGlobalSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Interactive Cluster Selector Cards */}
        <section className="mb-10 text-left">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold flex items-center gap-2 text-[#0b1a36]">
              <Compass className="h-5 w-5 text-[#1E88E5]" />
              Filter by Career Cluster
            </h2>
            {filterClusterId !== "all" && (
              <button 
                onClick={() => setFilterClusterId("all")}
                className="text-xs font-bold text-[#1E88E5] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" /> Clear selection
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {enrichedClusters.map((cluster, index) => {
              const isSelected = filterClusterId === cluster.id;
              
              return (
                <motion.button
                  key={cluster.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilterClusterId(isSelected ? "all" : cluster.id)}
                  className={`relative overflow-hidden rounded-3xl bg-white p-4 text-left shadow-xs border transition-all cursor-pointer ${
                    isSelected 
                      ? "ring-2 ring-[#0b1a36] border-transparent shadow-md" 
                      : "border-[#D3E3F5] hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">
                    {cluster.id}
                  </span>
                  <h3 className="font-serif font-bold text-sm leading-snug mt-1 text-[#0b1a36] line-clamp-1">
                    {cluster.name}
                  </h3>
                  
                  <div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                    <span>{cluster.count} options</span>
                    <span className="text-[#1E88E5]">{cluster.demandMix} Demand</span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-3 right-3 bg-[#0b1a36] text-white rounded-full p-0.5 shadow-2xs">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Mobile Filters Toggle Button */}
        <div className="flex lg:hidden items-center justify-between mb-4 w-full px-1">
          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 rounded-full border border-[#D3E3F5] bg-white px-4 py-2.5 text-xs font-bold text-[#0b1a36] shadow-xs w-full justify-center transition hover:bg-slate-50 cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#1E88E5]" />
            Filters & Sorting
            {(filterClusterId !== "all" || filterDemand.length > 0 || filterAiImpact !== "all" || filterSalary !== "all") && (
              <span className="ml-1 px-2 py-0.5 text-[9px] bg-[#0b1a36] text-white rounded-full font-bold">
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
                className="fixed inset-0 z-40 bg-[#0b1a36]/40 backdrop-blur-xs lg:hidden"
                onClick={() => setShowMobileFilters(false)}
              />
              {/* Drawer Panel */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white p-6 shadow-2xl overflow-y-auto flex flex-col justify-between lg:hidden text-left border-r border-[#D3E3F5]"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#D3E3F5]">
                    <span className="font-bold text-xs tracking-wider flex items-center gap-2 text-[#0b1a36]">
                      <SlidersHorizontal className="h-4 w-4 text-[#1E88E5]" /> FILTERS
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMobileFilters(false)}
                      className="rounded-full border border-[#D3E3F5] p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-6 mt-6">
                    {filterContent}
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-[#D3E3F5] flex gap-2">
                  <button
                    type="button"
                    onClick={() => { resetFilters(); setShowMobileFilters(false); }}
                    className="flex-1 text-center py-2.5 text-xs font-bold bg-[#F0F6FC] hover:bg-white rounded-full transition border border-[#D3E3F5] text-slate-700 cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 text-center py-2.5 text-xs font-bold bg-[#0b1a36] text-white rounded-full transition hover:bg-[#122b59] cursor-pointer shadow-xs"
                  >
                    Apply
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 bg-white/90 backdrop-blur-md border border-[#D3E3F5] rounded-3xl p-5 shadow-xs sticky top-24 z-10 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-[#D3E3F5]">
              <span className="font-bold text-xs tracking-wider flex items-center gap-2 text-[#0b1a36]">
                <SlidersHorizontal className="h-4 w-4 text-[#1E88E5]" /> FILTERS
              </span>
              {(filterClusterId !== "all" || filterDemand.length > 0 || filterAiImpact !== "all" || filterSalary !== "all") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-bold text-[#1E88E5] hover:underline transition cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>
            <div className="space-y-6 mt-5">
              {filterContent}
            </div>
          </aside>

          {/* Careers Main Grid */}
          <section className="flex-1 w-full text-left">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-[#1E88E5] animate-spin" />
                <p className="text-xs sm:text-sm font-bold text-slate-500">Loading careers database...</p>
              </div>
            )}
            
            {error && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-xs">
                <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <h3 className="font-bold">Error Loading Data</h3>
                <p className="text-xs sm:text-sm mt-1">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs sm:text-sm font-semibold text-slate-500">
                    Showing <span className="text-[#0b1a36] font-bold">{filteredCareers.length}</span> careers matching criteria
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  <AnimatePresence>
                    {filteredCareers.map((career) => {
                      return (
                        <motion.article
                          key={career.id}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.25 }}
                          className="rounded-3xl border border-[#D3E3F5] bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5"
                        >
                          <div>
                            {/* Card Top */}
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-[10px] font-bold tracking-wider uppercase border border-sky-200 bg-sky-50 text-[#1E88E5] px-2.5 py-0.5 rounded-full">
                                {career.clusterId || "Cluster"}
                              </span>
                              <span className="text-xs font-bold text-slate-400">
                                #{career.id}
                              </span>
                            </div>

                            {/* Title & One-line */}
                            <h3 className="font-serif text-base font-bold text-[#0b1a36] mt-3 line-clamp-1">
                              {career.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px] leading-relaxed">
                              {career.summary}
                            </p>

                            {/* Tech and salary metrics */}
                            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-bold">
                              <div className="flex items-center gap-2 bg-[#F0F6FC] rounded-2xl p-2.5 border border-[#D3E3F5]">
                                <DollarSign className="h-3.5 w-3.5 text-[#d97706]" />
                                <div>
                                  <span className="text-[9px] text-slate-400 block font-bold leading-none uppercase">ENTRY SALARY</span>
                                  <span className="text-[#0b1a36] leading-none mt-1 block">{career.entrySalary || "NA"}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-[#F0F6FC] rounded-2xl p-2.5 border border-[#D3E3F5]">
                                <Zap className="h-3.5 w-3.5 text-[#1E88E5]" />
                                <div>
                                  <span className="text-[9px] text-slate-400 block font-bold leading-none uppercase">DEMAND</span>
                                  <span className="text-[#0b1a36] leading-none mt-1 block">{career.demand || "NA"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Core skills preview */}
                            <div className="mt-4">
                              <span className="text-[9px] font-bold tracking-wider text-slate-400 block uppercase">CORE SKILLS</span>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {String(career.coreSkills || "")
                                  .split(",")
                                  .slice(0, 3)
                                  .map((skill, i) => (
                                    <span 
                                      key={i} 
                                      className="text-[10px] font-semibold bg-[#F0F6FC] text-slate-700 px-2.5 py-0.5 rounded-full border border-[#D3E3F5] truncate max-w-[110px]"
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
                          <div className="mt-5 pt-4 border-t border-[#D3E3F5] flex gap-2">
                            <button
                              onClick={() => setQuickViewCareer(career)}
                              className="flex-1 text-center py-2 text-xs font-bold bg-[#F0F6FC] hover:bg-white rounded-full transition border border-[#D3E3F5] text-slate-700 shadow-2xs cursor-pointer"
                            >
                              Quick View
                            </button>
                            <button
                              onClick={() => navigate(`/career-details/${encodeURIComponent(career.name)}`)}
                              className="flex-1 text-center py-2 text-xs font-bold bg-[#0b1a36] hover:bg-[#122b59] rounded-full transition border border-transparent text-white shadow-xs cursor-pointer"
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
                  <div className="rounded-3xl border border-dashed border-[#D3E3F5] bg-white/70 p-12 text-center text-slate-500 max-w-lg mx-auto mt-10 shadow-xs">
                    <Briefcase className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                    <h3 className="font-serif font-bold text-[#0b1a36]">No Matching Careers</h3>
                    <p className="text-xs sm:text-sm mt-1 leading-relaxed">
                      We couldn't find any career options matching your selected search query or filters. Try resetting the filters or broadening your search parameters.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#0b1a36] hover:bg-[#122b59] text-white px-5 py-2 text-xs font-bold transition shadow-xs cursor-pointer"
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
              className="fixed inset-0 z-40 bg-[#0b1a36]/40 backdrop-blur-xs"
              onClick={() => setQuickViewCareer(null)}
            />

            {/* Sidebar drawer content */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl border-l border-[#D3E3F5] flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-[#D3E3F5] bg-white/90 backdrop-blur-md px-6 py-5 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-bold bg-sky-50 text-[#1E88E5] px-2.5 py-0.5 rounded-full tracking-wider border border-sky-200 uppercase">
                      {quickViewCareer.clusterId}
                    </span>
                    <h2 className="font-serif text-xl font-bold text-[#0b1a36] mt-1">{quickViewCareer.name}</h2>
                  </div>
                  <button
                    onClick={() => setQuickViewCareer(null)}
                    className="rounded-full border border-[#D3E3F5] p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Details Section */}
                <div className="space-y-6 px-6 py-6 text-left">
                  {/* One-Liner Description */}
                  <div>
                    <h4 className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase mb-1">ONE-LINE SUMMARY</h4>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                      {quickViewCareer.summary}
                    </p>
                  </div>

                  {/* What they do details */}
                  <div>
                    <h4 className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase mb-1">WHAT THEY DO</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {quickViewCareer.whatTheyDo}
                    </p>
                  </div>

                  {/* High level metrics dashboard */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F0F6FC] p-4 rounded-3xl border border-[#D3E3F5] shadow-2xs">
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 block font-bold leading-none uppercase">DEMAND LEVEL</span>
                      <span className="text-[#0b1a36] text-xs font-bold mt-1.5 block">{quickViewCareer.demand}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 block font-bold leading-none uppercase">GROWTH RATE</span>
                      <span className="text-[#0b1a36] text-xs font-bold mt-1.5 block">{quickViewCareer.growthRate}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 block font-bold leading-none uppercase">AI IMPACT</span>
                      <span className="text-[#0b1a36] text-xs font-bold mt-1.5 block">{quickViewCareer.aiImpact}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 block font-bold leading-none uppercase">WORK-LIFE</span>
                      <span className="text-[#0b1a36] text-xs font-bold mt-1.5 block">{quickViewCareer.workLifeBalance}</span>
                    </div>
                  </div>

                  {/* Salary Bracket grid */}
                  <div>
                    <h4 className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase mb-2">SALARY PATHWAY (LPA)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { title: "Entry", val: quickViewCareer.entrySalary },
                        { title: "Mid", val: quickViewCareer.midSalary },
                        { title: "Senior", val: quickViewCareer.seniorSalary },
                        { title: "Top Earnings", val: quickViewCareer.topEarnings },
                      ].map((sal) => (
                        <div key={sal.title} className="bg-[#F0F6FC] p-3 rounded-2xl border border-[#D3E3F5] text-center shadow-2xs">
                          <span className="text-[9px] text-slate-400 block font-bold leading-none uppercase">{sal.title}</span>
                          <span className="text-[#0b1a36] text-xs font-bold mt-1.5 block">{sal.val || "NA"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verdict and scores */}
                  <div className="bg-[#F0F6FC] border border-[#D3E3F5] rounded-3xl p-5 shadow-xs">
                    <h4 className="text-xs font-bold tracking-wider text-[#1E88E5] block uppercase mb-1 flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-[#1E88E5]" /> STRIDE VERDICT & SCORES
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold italic mt-1">
                      "{quickViewCareer.verdict}"
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                      <div className="bg-white px-2 py-2.5 rounded-2xl border border-[#D3E3F5] shadow-2xs">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Money</span>
                        <span className="text-[#0b1a36] text-sm font-bold mt-1.5 block">{quickViewCareer.moneyScore}/10</span>
                      </div>
                      <div className="bg-white px-2 py-2.5 rounded-2xl border border-[#D3E3F5] shadow-2xs">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Growth</span>
                        <span className="text-[#0b1a36] text-sm font-bold mt-1.5 block">{quickViewCareer.growthScore}/10</span>
                      </div>
                      <div className="bg-white px-2 py-2.5 rounded-2xl border border-[#D3E3F5] shadow-2xs">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Stability</span>
                        <span className="text-[#0b1a36] text-sm font-bold mt-1.5 block">{quickViewCareer.stabilityScore}/10</span>
                      </div>
                    </div>
                  </div>

                  {/* Industries & Skills lists */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase mb-1.5">INDUSTRIES</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {quickViewCareer.industries}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase mb-1.5">CORE SKILLS</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {quickViewCareer.coreSkills}
                      </p>
                    </div>
                  </div>

                  {/* Certifications and Entry Path */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <h4 className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" /> CERTIFICATIONS
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {quickViewCareer.keyCertifications || "No specific certifications listed."}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold tracking-wider text-slate-400 block uppercase mb-1 flex items-center gap-1.5">
                        <Brain className="h-4 w-4 text-[#1E88E5]" /> ENTRY PATH
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {quickViewCareer.entryPath || "No standard entry path documented."}
                      </p>
                    </div>
                  </div>

                  {/* Who should choose vs avoid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-slate-700 shadow-2xs">
                      <span className="text-[10px] font-bold text-emerald-800 tracking-wider block uppercase mb-1">WHO SHOULD CHOOSE</span>
                      <p className="text-xs leading-relaxed font-medium">{quickViewCareer.whoShouldChoose}</p>
                    </div>
                    <div className="bg-red-50/70 p-4 rounded-2xl border border-red-200 text-slate-700 shadow-2xs">
                      <span className="text-[10px] font-bold text-red-800 tracking-wider block uppercase mb-1">WHO SHOULD AVOID</span>
                      <p className="text-xs leading-relaxed font-medium">{quickViewCareer.whoShouldAvoid}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action footer */}
              <div className="sticky bottom-0 bg-white border-t border-[#D3E3F5] px-6 py-4 flex gap-3 shadow-md">
                <button
                  onClick={() => setQuickViewCareer(null)}
                  className="flex-1 text-center py-3 text-xs font-bold bg-[#F0F6FC] hover:bg-slate-100 rounded-full transition border border-[#D3E3F5] text-slate-700 shadow-2xs cursor-pointer"
                >
                  Close Quick View
                </button>
                <button
                  onClick={() => {
                    const name = quickViewCareer.name;
                    setQuickViewCareer(null);
                    navigate(`/career-details/${encodeURIComponent(name)}`);
                  }}
                  className="flex-1 text-center py-3 text-xs font-bold bg-[#0b1a36] hover:bg-[#122b59] rounded-full transition border border-transparent text-white shadow-xs cursor-pointer"
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