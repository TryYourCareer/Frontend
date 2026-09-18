import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Activity,
  ShieldCheck,
  Download,
  BookOpen,
  Sparkles,
  Star,
  Search,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Briefcase,
  Layers,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCareerFitReport } from "../services/discoveryTest";
import SEO from "../components/SEO";

/* Parse a single CSV row respecting quoted fields */
function parseCSVRow(row) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
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
    headers.forEach((h, i) => {
      obj[h] = values[i] || "";
    });
    return obj;
  });
}

export default function CareerRealityV2({ onBack }) {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [reportData, setReportData] = useState(null);
  const [csvCareers, setCsvCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCluster, setSelectedCluster] = useState("all");
  const [viewMode, setViewMode] = useState("assessment"); // "assessment" or "catalog"

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      const sessionId = localStorage.getItem("latest_test_session_id");

      // 1. Fetch real career records from CSV
      try {
        const res = await fetch("/data/Careers.csv");
        if (res.ok) {
          const text = await res.text();
          const parsed = parseCSV(text);
          if (isMounted && parsed.length > 0) {
            setCsvCareers(parsed);
          }
        }
      } catch (err) {
        console.warn("Unable to fetch Careers.csv:", err);
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

    return () => {
      isMounted = false;
    };
  }, []);

  // Format dynamic matches from real assessment report
  const dynamicMatches = useMemo(() => {
    if (!reportData || !reportData.top_matches || reportData.top_matches.length === 0) {
      return [];
    }

    const vector = reportData.dimension_vector || {};
    const strengthsFromVector = Object.entries(vector)
      .map(([dim, val]) => ({
        label: dim.charAt(0).toUpperCase() + dim.slice(1) + " Aptitude",
        percent: Math.round((val || 0.5) * 100),
      }))
      .sort((a, b) => b.percent - a.percent);

    return reportData.top_matches.map((m, idx) => {
      const matchScore =
        m.similarity_score > 1
          ? Math.round(m.similarity_score)
          : Math.round((m.similarity_score || 0.85) * 100);

      return {
        key: `match-${idx}`,
        title: m.career_name,
        subtitle: m.sector || m.cluster || "Specialization Track",
        category: m.sector || m.cluster || "Technology",
        description: m.why_it_fits || "Tailored trajectory aligned with your RIASEC behavioral indicators.",
        matchPercentage: matchScore,
        starRating: m.star_rating ? parseFloat(m.star_rating).toFixed(1) : "4.8",
        skillTags:
          m.key_skills && m.key_skills.length > 0
            ? m.key_skills.slice(0, 4)
            : ["Analytical Thinking", "Strategic Planning", "Domain Mastery"],
        strengths: strengthsFromVector.slice(0, 3),
        reports: [
          {
            label: "6D RIASEC Vector Fit",
            icon: BarChart3,
            desc: "Comprehensive behavioral alignment across 6 dimensions",
          },
          {
            label: "Interest & Trajectory Diagnostic",
            icon: Activity,
            desc: "Sector relevance and starting role recommendations",
          },
          {
            label: "Stage 2 Reflection Insights",
            icon: ShieldCheck,
            desc: "Validated qualitative strengths and motivation factors",
          },
        ],
        roadmapTitle: `Detailed Roadmap for ${m.career_name}`,
        roadmapDescription: m.why_it_fits || "Personalized progression plan with certified skill milestones and career benchmarks.",
      };
    });
  }, [reportData]);

  // Format real database careers from CSV
  const catalogCareers = useMemo(() => {
    return csvCareers.map((c, idx) => {
      const skills = (c["Core Skills"] || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4);

      const moneyScore = parseInt(c["Money Score"]) || 8;
      const growthScore = parseInt(c["Growth Score"]) || 8;
      const stabilityScore = parseInt(c["Stability Score"]) || 8;

      return {
        key: `csv-${c["No."] || idx}`,
        title: c["Career Name"] || "Career Profile",
        subtitle: c["Cluster"] || "Industry Track",
        category: c["Cluster"] || "General",
        description: c["One-Line Summary"] || c["What They Do"] || "High-demand industry career pathway.",
        demand: c["Demand Level"] || "High",
        growthRate: c["Growth Rate"] || "20%+",
        salaryRange:
          c["Entry Salary (LPA)"] && c["Senior Salary (LPA)"]
            ? `₹${c["Entry Salary (LPA)"]} - ${c["Senior Salary (LPA)"]} LPA`
            : "₹6 - 25 LPA",
        starRating: c["Growth Score"] ? (parseFloat(c["Growth Score"]) / 2).toFixed(1) : "4.8",
        skillTags: skills.length > 0 ? skills : ["Domain Expertise", "Technical Aptitude", "Problem Solving"],
        strengths: [
          { label: "Growth Potential", percent: Math.min(growthScore * 10, 100) },
          { label: "Earning Capacity", percent: Math.min(moneyScore * 10, 100) },
          { label: "Market Stability", percent: Math.min(stabilityScore * 10, 100) },
        ],
        reports: [
          {
            label: "Market Demand & Growth Outlook",
            icon: TrendingUp,
            desc: `${c["Demand Level"] || "High"} Demand • ${c["Growth Rate"] || "20%"} Growth Rate`,
          },
          {
            label: "Compensation & Salary Matrix",
            icon: DollarSign,
            desc: `Entry: ₹${c["Entry Salary (LPA)"] || 5} LPA → Senior: ₹${c["Senior Salary (LPA)"] || 25} LPA (Top: ${c["Top Earnings (LPA)"] || "50+ LPA"})`,
          },
          {
            label: "Key Certifications & Entry Path",
            icon: Award,
            desc: c["Key Certifications"] || c["Entry Path"] || "Industry-recognized credentials",
          },
        ],
        roadmapTitle: `Action Roadmap: ${c["Career Name"]}`,
        roadmapDescription:
          c["Verdict"] || c["What They Do"] || "Structured skill roadmap from foundation courses to senior leadership.",
      };
    });
  }, [csvCareers]);

  // Extract unique clusters for filtering
  const clusters = useMemo(() => {
    const set = new Set();
    csvCareers.forEach((c) => {
      if (c["Cluster"]) set.add(c["Cluster"]);
    });
    return Array.from(set);
  }, [csvCareers]);

  // Determine active displayed list based on active mode
  const activeList = useMemo(() => {
    const sourceList = viewMode === "assessment" && dynamicMatches.length > 0 ? dynamicMatches : catalogCareers;

    return sourceList.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.skillTags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCluster = selectedCluster === "all" || item.category === selectedCluster;

      return matchesSearch && matchesCluster;
    });
  }, [viewMode, dynamicMatches, catalogCareers, searchQuery, selectedCluster]);

  const activeCareer = activeList[selectedIndex] || activeList[0] || null;

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-8 sm:px-6 lg:px-10 text-left font-sans">
      <SEO
        title="Career Reality Check - Verified Industry Trajectories & Reality Checker"
        description="Verify real-world career trajectories, market compensation ranges, required competencies, and diagnostic assessments powered by dynamic RIASEC matching."
      />

      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header section */}
        <div className="flex flex-col gap-5 md:px-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1E88E5]">
                <Sparkles size={14} className="text-[#1E88E5]" />
                {reportData && viewMode === "assessment" ? "Dynamic Assessment Matches" : "Career Reality Check"}
              </span>
              <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-[#0b1a36] sm:text-4xl">
                {reportData && viewMode === "assessment"
                  ? "Your Tailored Career Matches"
                  : "Verified Career Trajectories"}
              </h1>
              <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600">
                {reportData && viewMode === "assessment"
                  ? "Dynamic recommendations computed from your real 6D RIASEC vector and Stage 2 assessment responses."
                  : "Explore real-world careers, verified compensation tiers, demand outlooks, and practical roadmaps from our database."}
              </p>
            </div>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-xs transition hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
          </div>

          {/* Mode Switcher if assessment data exists */}
          {dynamicMatches.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setViewMode("assessment");
                  setSelectedIndex(0);
                }}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer ${
                  viewMode === "assessment"
                    ? "bg-[#0b1a36] text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Sparkles size={13} className={viewMode === "assessment" ? "text-sky-300" : "text-[#1E88E5]"} />
                Your Assessment Matches ({dynamicMatches.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("catalog");
                  setSelectedIndex(0);
                }}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer ${
                  viewMode === "catalog"
                    ? "bg-[#0b1a36] text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Layers size={13} />
                Explore All Database Careers ({csvCareers.length})
              </button>
            </div>
          )}
        </div>

        {/* Discovery Test CTA Banner if user has not taken assessment yet */}
        {!reportData && !loading && (
          <div className="rounded-3xl border border-sky-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#0b1a36] uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#1E88E5]" />
                Unlock Personalized Match Scores
              </p>
              <p className="text-xs text-slate-600">
                Take the 15-minute Discovery Assessment to compute your dynamic 6D RIASEC career fit scores and strengths.
              </p>
            </div>
            <button
              onClick={() => navigate("/assessment")}
              className="px-5 py-2.5 bg-[#0b1a36] hover:bg-[#122b59] text-white text-xs font-bold rounded-full transition shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles size={14} />
              Take Discovery Test
            </button>
          </div>
        )}

        {/* Search & Cluster Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search careers, skills, or industries..."
              className="w-full rounded-full border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-hidden focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5]"
            />
          </div>

          {clusters.length > 0 && viewMode === "catalog" && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <button
                type="button"
                onClick={() => {
                  setSelectedCluster("all");
                  setSelectedIndex(0);
                }}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCluster === "all"
                    ? "bg-[#1E88E5] text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                All Clusters
              </button>
              {clusters.slice(0, 6).map((cl) => (
                <button
                  key={cl}
                  type="button"
                  onClick={() => {
                    setSelectedCluster(cl);
                    setSelectedIndex(0);
                  }}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCluster === cl
                      ? "bg-[#1E88E5] text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {cl}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((n) => (
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
        ) : activeList.length === 0 ? (
          <div className="rounded-3xl border border-[#D3E3F5] bg-white p-12 text-center space-y-4">
            <Briefcase size={40} className="mx-auto text-slate-400" />
            <h3 className="font-serif text-lg font-bold text-[#0b1a36]">No careers matched your search</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Try adjusting your search query or clear cluster filters to see available dynamic career trajectories.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCluster("all");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Career Cards Grid */
          <div className="grid gap-4 sm:grid-cols-2">
            {activeList.slice(0, 10).map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.key || idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`group flex flex-col justify-between rounded-3xl border p-5 cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? "border-[#1E88E5] bg-[#F0F6FC] shadow-xs"
                      : "border-[#D3E3F5] bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="rounded-full border border-[#D3E3F5] bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {item.subtitle}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.starRating && (
                          <div className="flex items-center text-amber-500 text-xs font-bold">
                            <Star size={12} className="fill-amber-400 text-amber-400 mr-0.5" />
                            <span>{item.starRating}</span>
                          </div>
                        )}
                        {item.matchPercentage !== undefined ? (
                          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                            {item.matchPercentage}% Match
                          </span>
                        ) : item.demand ? (
                          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-[#1E88E5]">
                            {item.demand} Demand
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <h4 className="font-serif text-base font-bold text-[#0b1a36]">{item.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.description}</p>

                    {item.salaryRange && (
                      <p className="text-[11px] font-bold text-slate-700">
                        Est. Range: <span className="text-[#0b1a36]">{item.salaryRange}</span>
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.skillTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#D3E3F5] bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIndex(idx);
                        navigate(`/career-details/${encodeURIComponent(item.title)}`);
                      }}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#0b1a36] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#122b59] shadow-xs cursor-pointer"
                    >
                      <BookOpen size={13} />
                      Explore Reality
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIndex(idx);
                        navigate(`/roadmap?career=${encodeURIComponent(item.title)}`);
                      }}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-50 shadow-2xs cursor-pointer"
                    >
                      <ArrowRight size={13} />
                      Roadmap
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Career Insights Panel */}
        {activeCareer && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Strengths / Aptitude Card */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    {reportData && viewMode === "assessment"
                      ? "Personal RIASEC Vector Fit"
                      : "Career Benchmark Scores"}
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-bold text-[#0b1a36]">{activeCareer.title}</h3>
                </div>
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1E88E5]">
                  {activeCareer.strengths[0]?.percent || 90}%{" "}
                  {reportData && viewMode === "assessment" ? "Aptitude" : "Rating"}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {activeCareer.strengths.map((strength) => (
                  <div key={strength.label} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <p className="font-semibold text-slate-700">{strength.label}</p>
                      <span className="font-bold text-[#0b1a36]">{strength.percent}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#edf3fb]">
                      <div
                        className="h-full rounded-full bg-[#1E88E5] transition-all duration-300"
                        style={{ width: `${strength.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic / Verification Reports Card */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    {reportData && viewMode === "assessment" ? "Diagnostic Insights" : "Reality Verification"}
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-bold text-[#0b1a36]">
                    {reportData && viewMode === "assessment" ? "Diagnostic Reports" : "Industry Metrics"}
                  </h3>
                </div>
                <span className="rounded-full border border-[#D3E3F5] bg-[#F0F6FC] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  {activeCareer.reports.length} Verified
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {activeCareer.reports.map((rep) => {
                  const Icon = rep.icon;
                  return (
                    <div
                      key={rep.label}
                      className="flex items-center justify-between rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] px-4 py-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#D3E3F5] bg-white text-[#1E88E5] shadow-2xs">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0b1a36]">{rep.label}</p>
                          <p className="text-[10px] text-slate-500">{rep.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const sid = localStorage.getItem("latest_test_session_id");
                          if (sid && viewMode === "assessment") {
                            navigate(`/career-report/${sid}`);
                          } else {
                            navigate(`/career-details/${encodeURIComponent(activeCareer.title)}`);
                          }
                        }}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-[#D3E3F5] text-slate-700 transition hover:bg-slate-50 shadow-2xs cursor-pointer"
                        title="View Details"
                      >
                        {reportData && viewMode === "assessment" ? <Download size={14} /> : <ArrowRight size={14} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Roadmap CTA Bar */}
        {activeCareer && (
          <div className="rounded-3xl border border-[#0b1a36] bg-[#0b1a36] p-6 text-white sm:p-8 shadow-xs">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E88E5]">Action Roadmap</p>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-white">
                  {activeCareer.roadmapTitle}
                </h3>
                <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-300">
                  {activeCareer.roadmapDescription}
                </p>
              </div>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  onClick={() => navigate(`/roadmap?career=${encodeURIComponent(activeCareer.title)}`)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-[#0b1a36] transition hover:bg-slate-100 shadow-xs cursor-pointer"
                >
                  <ArrowRight size={14} />
                  View Full Roadmap
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}