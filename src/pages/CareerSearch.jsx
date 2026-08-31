import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search, ArrowLeft, TrendingUp, Briefcase,
  DollarSign, BarChart3, Zap, Star, ChevronRight
} from "lucide-react";


const LOGO_BLUE = "#5B7EC9";
const LOGO_DARK = "#3D1F08";
const LOGO_MID  = "#7B4A28";
const LOGO_TAN  = "#B8712E";

const DEMAND_COLOR = {
  "Very High": "#16a34a",
  "High":      "#5B7EC9",
  "Moderate":  "#B8712E",
  "Low":       "#94a3b8",
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

/* Skeleton card for loading state */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#e2d9c8] bg-white p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded-full bg-[#e8dfc8]" />
          <div className="h-5 w-48 rounded-xl bg-[#e8dfc8]" />
        </div>
        <div className="h-6 w-16 rounded-full bg-[#e8dfc8]" />
      </div>
      <div className="h-3 w-full rounded-full bg-[#e8dfc8]" />
      <div className="h-3 w-3/4 rounded-full bg-[#e8dfc8]" />
      <div className="flex gap-2 pt-1">
        {[...Array(3)].map((_, i) => <div key={i} className="h-5 w-20 rounded-full bg-[#e8dfc8]" />)}
      </div>
    </div>
  );
}

/* Single career result card */
function CareerCard({ career }) {
  const navigate = useNavigate();
  const demand = career["Demand Level"] || "";
  const demandColor = DEMAND_COLOR[demand] || "#94a3b8";
  const cluster = career["Cluster"] || "";
  const entryPay = career["Entry Salary (LPA)"] || "—";
  const seniorPay = career["Senior Salary (LPA)"] || "—";
  const growth = career["Growth Rate"] || "—";
  const aiImpact = career["AI Impact"] || "—";
  const summary = career["One-Line Summary"] || "";
  const skills = (career["Core Skills"] || "").split(",").slice(0, 4).map(s => s.trim()).filter(Boolean);
  const moneyScore = parseInt(career["Money Score"]) || 0;
  const growthScore = parseInt(career["Growth Score"]) || 0;

  return (
    <article
      className="group rounded-2xl border border-[#e2d9c8] bg-white p-5 shadow-sm hover:shadow-md hover:border-[#5B7EC9]/30 transition-all cursor-pointer"
      onClick={() => navigate(`/career-details/${encodeURIComponent(career["Career Name"] || "")}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
              style={{ color: LOGO_BLUE, borderColor: `${LOGO_BLUE}30`, backgroundColor: `${LOGO_BLUE}10` }}
            >
              {cluster}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ color: demandColor, backgroundColor: `${demandColor}15` }}
            >
              {demand} Demand
            </span>
          </div>
          <h2 className="text-base font-bold leading-snug" style={{ color: LOGO_DARK }}>
            {career["Career Name"]}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{summary}</p>
        </div>

        {/* Score badge */}
        <div
          className="shrink-0 flex flex-col items-center justify-center rounded-xl w-12 h-12 border"
          style={{ backgroundColor: `${LOGO_BLUE}10`, borderColor: `${LOGO_BLUE}25` }}
        >
          <span className="text-base font-black" style={{ color: LOGO_BLUE }}>{moneyScore}</span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Stat icon={<DollarSign size={11} />} label="Entry Pay" value={`₹${entryPay} LPA`} color={LOGO_TAN} />
        <Stat icon={<TrendingUp size={11} />} label="Senior Pay" value={`₹${seniorPay} LPA`} color="#16a34a" />
        <Stat icon={<BarChart3 size={11} />} label="Growth" value={growth} color={LOGO_BLUE} />
        <Stat icon={<Zap size={11} />} label="AI Impact" value={aiImpact} color={LOGO_MID} />
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold text-slate-600"
              style={{ borderColor: "#e2d9c8", backgroundColor: "#FAF6EC" }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-[#e2d9c8] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScoreDot label="Money" value={moneyScore} color={LOGO_TAN} />
          <ScoreDot label="Growth" value={growthScore} color="#16a34a" />
          <ScoreDot label="Stability" value={parseInt(career["Stability Score"]) || 0} color={LOGO_BLUE} />
        </div>
        <ChevronRight size={14} style={{ color: LOGO_BLUE }} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </article>
  );
}

function Stat({ icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-[#e2d9c8] bg-[#FAF6EC]/60 px-2.5 py-1.5">
      <div className="flex items-center gap-1 mb-0.5" style={{ color }}>
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs font-bold text-slate-700 truncate">{value}</p>
    </div>
  );
}

function ScoreDot({ label, value, color }) {
  return (
    <div className="flex items-center gap-1">
      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-slate-500">{label}: <strong style={{ color }}>{value}/10</strong></span>
    </div>
  );
}

export default function CareerSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [careers, setCareers] = useState([]);
  const [loadingCSV, setLoadingCSV] = useState(true);

  /* Load CSV once */
  useEffect(() => {
    fetch("/data/Careers.csv")
      .then((r) => r.text())
      .then((text) => {
        setCareers(parseCSV(text));
        setLoadingCSV(false);
      })
      .catch(() => setLoadingCSV(false));
  }, []);


  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || careers.length === 0) return [];
    return careers.filter((c) =>
      c["Career Name"]?.toLowerCase().includes(q) ||
      c["Industries"]?.toLowerCase().includes(q)
    );
  }, [query, careers]);




  return (
    <section className="min-h-screen bg-[#dfeaf7] px-4 sm:px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border border-[#e2d9c8] bg-white p-2 text-slate-500 hover:text-[#5B7EC9] hover:border-[#5B7EC9]/40 transition shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: LOGO_MID }}>
              Career Explorer
            </span>
            <h1 className="text-2xl font-serif font-bold leading-tight" style={{ color: LOGO_DARK }}>
              {query ? `Results for "${query}"` : "Search Careers"}
            </h1>
          </div>
        </div>



        {/* Result count */}
        {!loadingCSV && query && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Star size={12} style={{ color: LOGO_TAN }} />
            <span>
              Found <strong style={{ color: LOGO_DARK }}>{results.length}</strong> career{results.length !== 1 ? "s" : ""} matching{" "}
              <strong style={{ color: LOGO_BLUE }}>"{query}"</strong>
            </span>
          </div>
        )}

        {/* Loading skeletons */}
        {loadingCSV && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loadingCSV && query && results.length === 0 && (
          <div className="rounded-2xl border border-[#e2d9c8] bg-white p-10 text-center shadow-sm">
            <Briefcase size={36} className="mx-auto mb-3" style={{ color: `${LOGO_BLUE}60` }} />
            <p className="font-bold text-slate-800">No careers matched "{query}"</p>
            <p className="text-xs text-slate-500 mt-1">Try different keywords — e.g. "data", "design", or "healthcare"</p>
          </div>
        )}

        {/* No query yet */}
        {!loadingCSV && !query && (
          <div className="rounded-2xl border border-[#e2d9c8] bg-white p-10 text-center shadow-sm">
            <Search size={36} className="mx-auto mb-3" style={{ color: `${LOGO_BLUE}60` }} />
            <p className="font-bold text-slate-800">Start typing to explore 270+ careers</p>
            <p className="text-xs text-slate-500 mt-1">Search by career name, skill, cluster, or industry</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {["Software Engineer", "Data Science", "UX Design", "Finance", "Healthcare", "AI"].map((hint) => (
                <button
                  key={hint}
                  onClick={() => navigate(`/career-search?q=${encodeURIComponent(hint)}`)}

                  className="rounded-full border border-[#e2d9c8] bg-[#FAF6EC] px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-[#5B7EC9]/40 hover:text-[#5B7EC9] transition"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results grid */}
        {!loadingCSV && results.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((career) => (
              <CareerCard key={career["No."]} career={career} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
