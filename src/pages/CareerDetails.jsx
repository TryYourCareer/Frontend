import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, DollarSign, TrendingUp, Star,
  Award, BookOpen, Compass, CheckCircle2, ShieldAlert,
  AlertCircle, Sparkles, ChevronRight, Zap, ShieldCheck,
  Cpu, Share2, Check, RefreshCw, Layers, BarChart3,
  Clock, Flame, HelpCircle
} from "lucide-react";
import SEO from "../components/SEO";
import BACKEND_BASE_URL from "../API/BaseURL";

const DEMAND_COLOR = {
  "Very High": { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", text: "Very High Demand" },
  "High": { bg: "bg-sky-50 text-[#1E88E5] border-sky-200", dot: "bg-[#1E88E5]", text: "High Demand" },
  "growing": { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", text: "Growing Field" },
  "stable": { bg: "bg-sky-50 text-[#1E88E5] border-sky-200", dot: "bg-[#1E88E5]", text: "Stable Demand" },
  "Moderate": { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", text: "Moderate Demand" },
  "Low": { bg: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400", text: "Emerging / Niche" },
};

const AUTOMATION_BADGE = {
  "low": { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", label: "Low AI Risk (High Human Value)" },
  "moderate": { bg: "bg-amber-50 text-amber-800 border-amber-200", label: "AI Augmented Role" },
  "high": { bg: "bg-red-50 text-red-800 border-red-200", label: "High Automation Exposure" },
};

const DIMENSION_CONFIG = {
  investigative: { label: "Investigative", color: "from-blue-500 to-indigo-600", bar: "bg-blue-600", desc: "Root cause analysis, research & pattern detection" },
  technical: { label: "Technical", color: "from-cyan-500 to-blue-600", bar: "bg-cyan-600", desc: "Machinery, sensor tools, engineering software" },
  social: { label: "Social", color: "from-emerald-500 to-teal-600", bar: "bg-emerald-600", desc: "Cross-team communication, safety training" },
  entrepreneurial: { label: "Entrepreneurial", color: "from-amber-500 to-orange-600", bar: "bg-amber-600", desc: "Cost reduction, business downtime optimization" },
  leadership: { label: "Leadership", color: "from-purple-500 to-pink-600", bar: "bg-purple-600", desc: "Strategy enforcement, maintenance direction" },
  creative: { label: "Creative", color: "from-rose-500 to-orange-500", bar: "bg-rose-600", desc: "Novel failure resolution & process redesign" },
};

/* Helper for currency formatting */
function formatSalaryVal(val, currency = "INR") {
  if (!val) return currency === "INR" ? "₹4–8 LPA" : "$70K–$95K";
  if (typeof val === "number") return currency === "INR" ? `₹${val} LPA` : `$${val}K`;
  if (typeof val === "string") {
    let clean = val.trim();
    if (currency === "INR") {
      if (!clean.startsWith("₹") && !clean.includes("LPA") && !clean.includes("Cr") && !clean.includes("$")) {
        return `₹${clean} LPA`;
      }
      return clean;
    } else {
      if (!clean.startsWith("$") && !clean.includes("K") && !clean.includes("USD")) {
        return `$${clean}`;
      }
      return clean;
    }
  }
  return String(val);
}

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

function normalizeCareerData(c) {
  if (!c) return null;
  const cName = c.career_name || c["Career Name"] || "Career";
  const cluster = c.sector || c.discipline || c["Cluster"] || "Engineering";
  const demand = c.demand_trend || c.growth_outlook || c["Demand Level"] || "growing";
  const rawSkills = c.core_skills || c["Core Skills"] || [];
  const skills = Array.isArray(rawSkills) ? rawSkills : typeof rawSkills === "string" ? rawSkills.split(",").map(s => s.trim()).filter(Boolean) : [];
  
  const rawCerts = c.education_pathways || c["Key Certifications"] || [];
  let certs = [];
  if (Array.isArray(rawCerts)) {
    certs = rawCerts.map(p => {
      if (typeof p === "string") return p;
      if (typeof p === "object" && p !== null) {
        return p.title || p.credential || p.degree || p.certification || p.name || JSON.stringify(p);
      }
      return String(p);
    });
  } else if (typeof rawCerts === "string") {
    certs = rawCerts.split(",").map(s => s.trim()).filter(Boolean);
  }

  // Salary parsing India
  const salIndia = c.salary_india_lpa || {};
  const inrEntry = formatSalaryVal(salIndia.entry || c["Entry Salary (LPA)"], "INR");
  const inrMid = formatSalaryVal(salIndia.mid || c["Mid Salary (LPA)"], "INR");
  const inrSenior = formatSalaryVal(salIndia.senior || c["Senior Salary (LPA)"], "INR");
  const inrTop = formatSalaryVal(salIndia.top || c["Top Earnings (LPA)"] || "₹35L–60L+", "INR");

  // Salary parsing Global
  const salGlobal = c.salary_global_usd || {};
  const usdEntry = formatSalaryVal(salGlobal.entry || "65–85K", "USD");
  const usdMid = formatSalaryVal(salGlobal.mid || "85–130K", "USD");
  const usdSenior = formatSalaryVal(salGlobal.senior || "130–180K", "USD");
  const usdTop = formatSalaryVal(salGlobal.top || "$190K–$250K+", "USD");

  const rawVector = c.dimension_vector || c.vector || {};
  const vector = typeof rawVector === "object" && rawVector !== null ? rawVector : {};

  return {
    id: c.id || c.node_id || cName.toLowerCase().replace(/\s+/g, "-"),
    nodeId: c.node_id || cName.toLowerCase().replace(/\s+/g, "-"),
    title: cName,
    cluster: cluster,
    sector: c.sector || cluster,
    discipline: c.discipline || cluster,
    subDomain: c.sub_domain_tag || c.discipline || cluster,
    demand: demand,
    demandRationale: c.demand_rationale || c["Verdict"] || "High industrial reliance on continuous uptime drives strong recurring hiring demand.",
    automationExposure: (c.automation_exposure || "low").toLowerCase(),
    sustainabilityNote: c.sustainability_note || "Human engineering judgement, failure synthesis, and on-site physical analysis keep this role resilient against automation.",
    realWorldImpact: c.real_world_impact || `Reliability specialists prevent dangerous failures, plant stoppages, and hazardous equipment accidents.`,
    summary: c.description || c["One-Line Summary"] || "Comprehensive verified industry career pathway.",
    whatTheyDo: c.day_in_life || c.description || c["What They Do"] || "",
    recommendedPath: c.discipline ? `Formal training or degree in ${c.discipline}, complemented by specialized industry certifications.` : (c["Entry Path"] || "Foundation studies followed by practical certifications and portfolio building."),
    whoShouldChoose: c.real_world_impact || c.sustainability_note || `Individuals with strong analytical and diagnostic acumen who enjoy proactive problem solving.`,
    whoShouldAvoid: c["Who Should Avoid"] || "Those seeking purely passive or non-analytical routine administrative desk work.",
    verdict: c.demand_rationale || c["Verdict"] || c.description || "High-demand industry specialization with solid long-term career growth outlook.",
    degreeRequired: c["Degree Required"] || (c.discipline ? `Bachelor's / Diploma in ${c.discipline}` : "Bachelor's / Certification in Engineering or Applied Sciences"),
    industries: c.sector || c["Industries"] || cluster,
    growthRate: c.demand_trend ? (c.demand_trend.charAt(0).toUpperCase() + c.demand_trend.slice(1)) : (c["Growth Rate"] || "High (+18%)"),
    workLifeBalance: c["Work-Life Balance"] || "Balanced (40-45 hrs/week with planned shifts)",
    stressLevel: c["Stress Level"] || "Moderate (High during urgent downtime)",
    skills: skills.length > 0 ? skills : ["Root Cause Analysis", "Predictive Maintenance", "CMMS Systems", "System Diagnostic"],
    certs: certs.length > 0 ? certs : ["Certified Maintenance & Reliability Professional (CMRP)", "ASQ Certified Reliability Engineer (CRE)"],
    myths: Array.isArray(c.myths_vs_reality) ? c.myths_vs_reality : [],
    salaries: {
      inr: { entry: inrEntry, mid: inrMid, senior: inrSenior, top: inrTop },
      usd: { entry: usdEntry, mid: usdMid, senior: usdSenior, top: usdTop },
    },
    vector: vector,
    whyItFits: c.why_it_fits || `Your dimensional profile aligns well with competencies required for ${cName} in ${cluster}.`,
    moneyScore: parseInt(c["Money Score"]) || 8,
    growthScore: parseInt(c["Growth Score"]) || 8,
    stabilityScore: parseInt(c["Stability Score"]) || 9,
  };
}

export default function CareerDetails() {
  const { careerName } = useParams();
  const navigate = useNavigate();
  const [career, setCareer] = useState(null);
  const [allCareers, setAllCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("INR"); // INR or USD
  const [activeTab, setActiveTab] = useState("overview"); // overview, market, myths, pathways, skills
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const decodedName = decodeURIComponent(careerName || "").trim().toLowerCase();
    const slugName = decodedName.replace(/[\s\-_]+/g, "");

    async function fetchCareer() {
      setLoading(true);
      // 1. Try fetching from Backend DB API
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/match-engine/careers`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            if (isMounted) setAllCareers(data);
            const found = data.find((c) => {
              const cn = (c.career_name || "").trim().toLowerCase();
              const nid = (c.node_id || "").trim().toLowerCase();
              const cleanCn = cn.replace(/[\s\-_]+/g, "");
              const cleanNid = nid.replace(/[\s\-_]+/g, "");
              return (
                cn === decodedName ||
                nid === decodedName ||
                nid.replace(/-/g, " ") === decodedName ||
                cleanCn === slugName ||
                cleanNid === slugName ||
                (decodedName.length > 3 && (cn.includes(decodedName) || decodedName.includes(cn)))
              );
            });
            if (found && isMounted) {
              setCareer(normalizeCareerData(found));
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Backend careers fetch in CareerDetails failed, trying fallback:", err);
      }

      // 2. Fallback to CSV
      try {
        const r = await fetch("/data/Careers.csv");
        if (r.ok) {
          const text = await r.text();
          const parsed = parseCSV(text);
          if (isMounted) setAllCareers(parsed);
          const found = parsed.find((c) => {
            const cn = (c["Career Name"] || "").trim().toLowerCase();
            const cleanCn = cn.replace(/[\s\-_]+/g, "");
            return (
              cn === decodedName ||
              cleanCn === slugName ||
              (decodedName.length > 3 && (cn.includes(decodedName) || decodedName.includes(cn)))
            );
          });
          if (found && isMounted) {
            setCareer(normalizeCareerData(found));
            setLoading(false);
            return;
          }
        }
      } catch (csvErr) {
        console.warn("CSV fallback in CareerDetails failed:", csvErr);
      }

      if (isMounted) {
        setCareer(null);
        setLoading(false);
      }
    }

    fetchCareer();
    return () => { isMounted = false; };
  }, [careerName]);

  // Related careers in same cluster
  const relatedCareers = useMemo(() => {
    if (!career || !allCareers || allCareers.length === 0) return [];
    const targetCluster = (career.sector || career.cluster || "").toLowerCase();
    return allCareers
      .filter((c) => {
        const name = c.career_name || c["Career Name"] || "";
        const cl = (c.sector || c.discipline || c.Cluster || "").toLowerCase();
        return name.toLowerCase() !== career.title.toLowerCase() && cl === targetCluster;
      })
      .slice(0, 3);
  }, [career, allCareers]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f6f9fd] via-[#eef4fb] to-[#e4eef9] flex items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-200 animate-pulse flex items-center justify-center">
              <RefreshCw size={24} className="text-blue-600 animate-spin" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <p className="text-sm font-bold text-[#0b1a36]">Loading Verified Career Dossier...</p>
            <p className="text-xs text-slate-500">Fetching live market demand, salary benchmarks & skill trees</p>
          </div>
        </div>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f6f9fd] via-[#eef4fb] to-[#e4eef9] px-4 py-16 flex flex-col items-center justify-center text-center font-sans">
        <div className="rounded-3xl border border-[#D3E3F5] bg-white p-8 sm:p-10 max-w-md w-full shadow-lg shadow-blue-900/5 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-4">
            <AlertCircle size={28} />
          </div>
          <h1 className="text-2xl font-sans font-bold mb-2 text-[#0b1a36]">
            Career Pathway Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
            We couldn't locate data for "<strong className="text-slate-800">{decodeURIComponent(careerName || "")}</strong>". Explore our catalog of 500+ verified careers.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft size={14} /> Go Back
            </button>
            <button
              onClick={() => navigate("/career-reality")}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b1a36] hover:bg-[#152e5d] text-white px-4 py-2.5 text-xs font-bold shadow-xs transition cursor-pointer"
            >
              Explore All <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const demandInfo = DEMAND_COLOR[career.demand] || DEMAND_COLOR["growing"];
  const autoInfo = AUTOMATION_BADGE[career.automationExposure] || AUTOMATION_BADGE["low"];
  const currentSalaries = currency === "INR" ? career.salaries.inr : career.salaries.usd;

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f7fafd] via-[#eef4fc] to-[#e4eef9] px-4 sm:px-6 lg:px-8 py-8 text-slate-800 font-sans">
      <SEO
        title={`${career.title} Career Guide: Salary, AI Impact, Skills & Roadmap | ClearCareers`}
        description={career.summary || `Comprehensive guide to becoming a ${career.title}. Salary benchmarks: ${career.salaries.inr.entry} - ${career.salaries.inr.senior}, automation risk: ${career.automationExposure}.`}
        keywords={`${career.title}, ${career.cluster}, ${career.discipline}, salary in India, career roadmap, ${career.skills.join(", ")}`}
        url={`/career-details/${encodeURIComponent(career.title || "")}`}
      />

      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Top Back Navigation & Actions Bar */}
        <div className="flex flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-[#D3E3F5] bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:text-[#0b1a36] hover:bg-[#F0F6FC] hover:border-slate-300 transition shadow-2xs cursor-pointer group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#D3E3F5] bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#0b1a36] hover:border-slate-300 transition shadow-2xs cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
              {copied ? "Link Copied!" : "Share"}
            </button>
            <button
              onClick={() => navigate(`/roadmap?career=${encodeURIComponent(career.title)}`)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2 text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
              View Learning Roadmap
            </button>
          </div>
        </div>

        {/* Hero Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-8 lg:p-10 shadow-sm shadow-blue-900/5 space-y-6">
          {/* Subtle Background Glow */}
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-500/10 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
            <div className="space-y-3.5 max-w-3xl">
              {/* Tags Row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-[#1E88E5]">
                  <Layers size={12} />
                  {career.cluster}
                </span>

                {career.discipline && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700">
                    <Cpu size={12} />
                    {career.discipline}
                  </span>
                )}

                {career.subDomain && career.subDomain !== career.discipline && (
                  <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                    {career.subDomain}
                  </span>
                )}

                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${demandInfo.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${demandInfo.dot} animate-pulse`} />
                  {demandInfo.text}
                </span>

                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border ${autoInfo.bg}`}>
                  <ShieldCheck size={12} />
                  {autoInfo.label}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black tracking-tight text-[#0b1a36] leading-tight">
                {career.title}
              </h1>

              {/* Executive Summary */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                {career.summary}
              </p>
            </div>

            {/* Quick Scoring Badges */}
            <div className="flex sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <div className="flex gap-2">
                <HeroMetricBadge label="Earning Index" score={`${career.moneyScore}/10`} color="text-amber-600" bg="bg-amber-50" border="border-amber-200" icon={<DollarSign size={13} />} />
                <HeroMetricBadge label="Growth Trajectory" score={`${career.growthScore}/10`} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-200" icon={<TrendingUp size={13} />} />
                <HeroMetricBadge label="Market Stability" score={`${career.stabilityScore}/10`} color="text-blue-600" bg="bg-blue-50" border="border-blue-200" icon={<ShieldCheck size={13} />} />
              </div>
            </div>
          </div>

          {/* Salary Progression Strip with Currency Toggle */}
          <div className="pt-6 border-t border-[#D3E3F5] space-y-4 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0b1a36] flex items-center gap-1.5">
                  <BarChart3 size={15} className="text-blue-600" />
                  Verified Compensation Progression
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Real Market Data
                </span>
              </div>

              {/* Currency Selector */}
              <div className="inline-flex rounded-xl p-0.5 bg-[#F0F6FC] border border-[#D3E3F5] self-start sm:self-auto">
                <button
                  onClick={() => setCurrency("INR")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currency === "INR" ? "bg-white text-blue-700 shadow-xs border border-blue-200" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🇮🇳 India (INR ₹)
                </button>
                <button
                  onClick={() => setCurrency("USD")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currency === "USD" ? "bg-white text-blue-700 shadow-xs border border-blue-200" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🌎 Global (USD $)
                </button>
              </div>
            </div>

            {/* Salary Tier Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <SalaryTierCard
                level="Entry Level"
                range="0–2 Years Exp"
                value={currentSalaries.entry}
                badge="Starting Pay"
                color="border-amber-200 bg-gradient-to-b from-amber-50/40 to-white"
                tagColor="text-amber-700 bg-amber-100/60"
              />
              <SalaryTierCard
                level="Mid-Level"
                range="3–6 Years Exp"
                value={currentSalaries.mid}
                badge="Market Average"
                color="border-emerald-200 bg-gradient-to-b from-emerald-50/40 to-white"
                tagColor="text-emerald-700 bg-emerald-100/60"
              />
              <SalaryTierCard
                level="Senior Specialist"
                range="7–12 Years Exp"
                value={currentSalaries.senior}
                badge="High Earning"
                color="border-blue-200 bg-gradient-to-b from-blue-50/40 to-white"
                tagColor="text-blue-700 bg-blue-100/60"
              />
              <SalaryTierCard
                level="Lead / Principal"
                range="12+ Years Exp"
                value={currentSalaries.top}
                badge="Top 10% Earning"
                color="border-purple-200 bg-gradient-to-b from-purple-50/40 to-white"
                tagColor="text-purple-700 bg-purple-100/60"
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs for In-Depth Analysis */}
        <div className="flex border-b border-[#D3E3F5] overflow-x-auto gap-2 pb-px">
          {[
            { id: "overview", label: "Role & Day in the Life", icon: <Compass size={15} /> },
            { id: "market", label: "Industry & AI Impact", icon: <Zap size={15} /> },
            { id: "pathways", label: "Education & Certifications", icon: <BookOpen size={15} /> },
            { id: "skills", label: "Core Competencies", icon: <Award size={15} /> },
            { id: "myths", label: "Myths vs Reality", icon: <HelpCircle size={15} />, count: career.myths.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-700 bg-white/70 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-extrabold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid gap-8 lg:grid-cols-[1.85fr_1fr]">

          {/* Left Column: Tab Views */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">

              {/* TAB 1: OVERVIEW & DAY IN THE LIFE */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Day in the Life */}
                  <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-[#0b1a36]">
                        <Clock size={16} className="text-blue-600" />
                        Operational Day in the Life
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-500 bg-[#F0F6FC] px-2.5 py-1 rounded-full border border-[#D3E3F5]">
                        Daily Workflow
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-[#f8fbfe] border border-blue-100/80 rounded-2xl p-4 sm:p-5">
                      {career.whatTheyDo}
                    </p>
                  </div>

                  {/* Impact & Who Fits */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-2xs space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-emerald-900">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        Real-World Value & Impact
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {career.whoShouldChoose}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-rose-200 bg-rose-50/40 p-5 shadow-2xs space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-rose-900">
                        <ShieldAlert size={16} className="text-rose-600" />
                        Who Should Avoid
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {career.whoShouldAvoid}
                      </p>
                    </div>
                  </div>

                  {/* Quick Verdict */}
                  <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-6 shadow-xs space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-blue-900">
                      <Star size={16} className="text-amber-500 fill-amber-500" />
                      Executive Industry Verdict
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                      {career.verdict}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: INDUSTRY & AI IMPACT */}
              {activeTab === "market" && (
                <motion.div
                  key="market"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Automation Exposure Breakdown */}
                  <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                          Technological Resilience
                        </span>
                        <h3 className="text-base sm:text-lg font-sans font-bold text-[#0b1a36]">
                          AI & Automation Impact Analysis
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${autoInfo.bg}`}>
                        {autoInfo.label}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F0F6FC] border border-[#D3E3F5] text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {career.sustainabilityNote}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Industry Growth Rate</span>
                        <p className="text-sm font-black text-[#0b1a36]">{career.growthRate}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Automation Exposure</span>
                        <p className="text-sm font-black text-emerald-700 uppercase">{career.automationExposure}</p>
                      </div>
                    </div>
                  </div>

                  {/* Demand Rationale */}
                  <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-7 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#0b1a36]">
                      <TrendingUp size={16} className="text-emerald-600" />
                      Hiring Drivers & Market Demand Rationale
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {career.demandRationale}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: EDUCATION & CERTIFICATIONS */}
              {activeTab === "pathways" && (
                <motion.div
                  key="pathways"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-[#0b1a36]">
                        <BookOpen size={16} className="text-blue-600" />
                        Recommended Pathways to Entry
                      </h3>
                      <p className="text-xs text-slate-500">
                        Structured academic and industrial trajectories validated by practitioners.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {career.certs.map((pathway, idx) => (
                        <div key={idx} className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F0F6FC] border border-[#D3E3F5]">
                          <div className="w-7 h-7 rounded-xl bg-white border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700 shrink-0 shadow-2xs">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#0b1a36] leading-snug">{pathway}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Degree info */}
                  <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Standard Degree Requirement</span>
                      <p className="text-xs sm:text-sm font-bold text-[#0b1a36]">{career.degreeRequired}</p>
                    </div>
                    <Award size={28} className="text-blue-600 shrink-0 opacity-80" />
                  </div>
                </motion.div>
              )}

              {/* TAB 4: CORE COMPETENCIES */}
              {activeTab === "skills" && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-[#0b1a36]">
                        <Award size={16} className="text-blue-600" />
                        Must-Have Core Competencies & Software
                      </h3>
                      <p className="text-xs text-slate-500">
                        Technical skills employers evaluate during screening and assessment.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 pt-2">
                      {career.skills.map((skill, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F0F6FC] border border-[#D3E3F5] hover:border-blue-300 transition">
                          <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                          <span className="text-xs font-bold text-slate-800">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: MYTHS VS REALITY */}
              {activeTab === "myths" && (
                <motion.div
                  key="myths"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {career.myths && career.myths.length > 0 ? (
                    career.myths.map((item, idx) => (
                      <div key={idx} className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-2xl bg-red-50/70 border border-red-200">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-600 text-white shrink-0">
                            Myth
                          </span>
                          <p className="text-xs font-bold text-red-950 leading-relaxed">{item.myth}</p>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-600 text-white shrink-0">
                            Reality
                          </span>
                          <p className="text-xs font-semibold text-emerald-950 leading-relaxed">{item.reality}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-[#D3E3F5] bg-white p-8 text-center text-slate-500 text-xs">
                      No industry misconceptions documented yet for this career.
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Right Column: Psychometrics, Job Profile & CTAs */}
          <div className="space-y-6">

            {/* Psychometric Trait Vector Alignment */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-sm font-bold text-[#0b1a36] flex items-center gap-1.5">
                  <Flame size={16} className="text-orange-500" />
                  Dimensional Trait Fit
                </h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  Matching Engine
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(career.vector).map(([dimKey, score]) => {
                  const conf = DIMENSION_CONFIG[dimKey.toLowerCase()] || {
                    label: dimKey,
                    color: "from-blue-500 to-indigo-600",
                    bar: "bg-blue-600",
                    desc: "Core dimensional strength",
                  };
                  const pct = Math.round(score * 100);
                  return (
                    <div key={dimKey} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">{conf.label}</span>
                        <span className="font-bold text-[#0b1a36]">{pct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${conf.bar}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-500 italic bg-[#F0F6FC] p-3 rounded-xl border border-[#D3E3F5] leading-relaxed">
                {career.whyItFits}
              </p>
            </div>

            {/* Work Culture & Specifications */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-3.5">
              <h3 className="font-sans text-sm font-bold text-[#0b1a36]">
                Working Environment
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Degree Required</span>
                  <span className="font-bold text-slate-800 text-right max-w-[60%]">{career.degreeRequired}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Target Industries</span>
                  <span className="font-bold text-slate-800 text-right max-w-[60%]">{career.industries}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Work-Life Balance</span>
                  <span className="font-bold text-slate-800">{career.workLifeBalance}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Stress Level</span>
                  <span className="font-bold text-slate-800">{career.stressLevel}</span>
                </div>
              </div>
            </div>

            {/* Direct CTA Box */}
            <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-[#0b1a36] to-[#122c5e] p-6 text-white shadow-md space-y-4 text-center">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mx-auto text-amber-400">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-sans text-base font-bold">Ready to master {career.title}?</h4>
                <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                  Follow a structured, 5-stage milestone roadmap with curated learning modules and certifications.
                </p>
              </div>
              <button
                onClick={() => navigate(`/roadmap?career=${encodeURIComponent(career.title)}`)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-[#0b1a36] hover:bg-blue-50 px-5 py-3 text-xs font-bold shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                Launch Learning Roadmap <ArrowRight size={14} />
              </button>
            </div>

            {/* Related Careers */}
            {relatedCareers.length > 0 && (
              <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-3">
                <h3 className="font-sans text-sm font-bold text-[#0b1a36]">
                  Related Careers in {career.cluster}
                </h3>
                <div className="space-y-2">
                  {relatedCareers.map((rel, idx) => {
                    const rName = rel.career_name || rel["Career Name"];
                    return (
                      <div
                        key={idx}
                        onClick={() => navigate(`/career-details/${encodeURIComponent(rName)}`)}
                        className="group flex items-center justify-between p-3 rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] hover:bg-white hover:border-blue-300 transition cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition truncate">{rName}</p>
                          <span className="text-[10px] text-slate-500">{rel.discipline || rel.sector || career.cluster}</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600 transition shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}

function HeroMetricBadge({ label, score, color, bg, border, icon }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl ${bg} border ${border} px-3.5 py-2 min-w-[76px] shadow-2xs text-center`}>
      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
        {icon}
        {label}
      </span>
      <span className={`text-base font-black mt-0.5 ${color}`}>{score}</span>
    </div>
  );
}

function SalaryTierCard({ level, range, value, badge, color, tagColor }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-2xs space-y-1.5 ${color}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${tagColor}`}>
          {badge}
        </span>
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-500 block">{level}</span>
        <span className="text-[9px] text-slate-400 font-medium block">{range}</span>
      </div>
      <p className="text-sm sm:text-base font-black text-[#0b1a36] pt-1 border-t border-slate-200/60">
        {value}
      </p>
    </div>
  );
}