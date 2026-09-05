import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search, ArrowLeft, TrendingUp, Briefcase,
  DollarSign, BarChart3, Zap, Star, ChevronRight
} from "lucide-react";

const DEMAND_COLOR = {
  "Very High": "#16a34a",
  "High":      "#1E88E5",
  "Moderate":  "#d97706",
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
    <div className="animate-pulse rounded-3xl border border-[#D3E3F5] bg-white p-5 space-y-3 shadow-xs">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded-full bg-slate-200" />
          <div className="h-5 w-48 rounded-xl bg-slate-200" />
        </div>
        <div className="h-6 w-16 rounded-full bg-slate-200" />
      </div>
      <div className="h-3 w-full rounded-full bg-slate-200" />
      <div className="h-3 w-3/4 rounded-full bg-slate-200" />
      <div className="flex gap-2 pt-1">
        {[...Array(3)].map((_, i) => <div key={i} className="h-5 w-20 rounded-full bg-slate-200" />)}
      </div>
    </div>
  );
}

/* Single career result card */
function CareerCard({ career }) {
  const navigate = useNavigate();
  const demand = career["Demand Level"] || "";
  const demandColor = DEMAND_COLOR[demand] || "#94a3b8";
  const sector = career["Sector"] || career["Cluster"] || "";
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
      className="group rounded-3xl border border-[#D3E3F5] bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all cursor-pointer text-left"
      onClick={() => navigate(`/career-details/${encodeURIComponent(career["Career Name"] || "")}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-[#1E88E5]">
              {sector}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
              style={{
                color: demandColor,
                backgroundColor: `${demandColor}15`,
                borderColor: `${demandColor}30`,
              }}
            >
              {demand} Demand
            </span>
          </div>
          <h2 className="font-serif text-base font-bold leading-snug text-[#0b1a36] group-hover:text-[#1E88E5] transition-colors">
            {career["Career Name"]}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{summary}</p>
        </div>

        {/* Score badge */}
        <div className="shrink-0 flex flex-col items-center justify-center rounded-2xl w-12 h-12 border border-sky-200 bg-sky-50 shadow-2xs">
          <span className="text-base font-black text-[#1E88E5]">{moneyScore}</span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Stat icon={<DollarSign size={11} />} label="Entry Pay" value={`₹${entryPay} LPA`} color="#d97706" />
        <Stat icon={<TrendingUp size={11} />} label="Senior Pay" value={`₹${seniorPay} LPA`} color="#16a34a" />
        <Stat icon={<BarChart3 size={11} />} label="Growth" value={growth} color="#1E88E5" />
        <Stat icon={<Zap size={11} />} label="AI Impact" value={aiImpact} color="#0b1a36" />
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-[#D3E3F5] bg-[#F0F6FC] px-2.5 py-0.5 text-[10px] font-semibold text-slate-700"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-[#D3E3F5] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScoreDot label="Money" value={moneyScore} color="#d97706" />
          <ScoreDot label="Growth" value={growthScore} color="#16a34a" />
          <ScoreDot label="Stability" value={parseInt(career["Stability Score"]) || 0} color="#1E88E5" />
        </div>
        <div className="grid h-6 w-6 place-items-center rounded-full bg-[#F0F6FC] border border-[#D3E3F5] text-slate-600 group-hover:bg-[#0b1a36] group-hover:border-[#0b1a36] group-hover:text-white transition shadow-2xs">
          <ChevronRight size={13} />
        </div>
      </div>
    </article>
  );
}

function Stat({ icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] px-2.5 py-1.5 shadow-2xs">
      <div className="flex items-center gap-1 mb-0.5" style={{ color }}>
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs font-bold text-slate-800 truncate">{value}</p>
    </div>
  );
}

function ScoreDot({ label, value, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-slate-500 font-medium">{label}: <strong style={{ color }}>{value}/10</strong></span>
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
    <section className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 sm:px-8 lg:px-12 py-8 font-sans text-left">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-[#D3E3F5] bg-white p-2.5 text-slate-600 hover:text-[#0b1a36] hover:border-slate-400 transition shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E88E5] block">
              Career Explorer
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-[#0b1a36]">
              {query ? `Results for "${query}"` : "Search Careers"}
            </h1>
          </div>
        </div>

        {/* Result count */}
        {!loadingCSV && query && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Star size={12} className="text-[#1E88E5]" />
            <span>
              Found <strong className="text-[#0b1a36]">{results.length}</strong> career{results.length !== 1 ? "s" : ""} matching{" "}
              <strong className="text-[#1E88E5]">"{query}"</strong>
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
          <div className="rounded-3xl border border-[#D3E3F5] bg-white p-10 text-center shadow-xs">
            <Briefcase size={36} className="mx-auto mb-3 text-[#1E88E5]/70" />
            <p className="font-serif text-base font-bold text-[#0b1a36]">No careers matched "{query}"</p>
            <p className="text-xs text-slate-500 mt-1">Try different keywords — e.g. "data", "design", or "healthcare"</p>
          </div>
        )}

        {/* No query yet */}
        {!loadingCSV && !query && (
          <div className="rounded-3xl border border-[#D3E3F5] bg-white p-10 text-center shadow-xs">
            <Search size={36} className="mx-auto mb-3 text-[#1E88E5]/70" />
            <p className="font-serif text-base font-bold text-[#0b1a36]">Start typing to explore 270+ careers</p>
            <p className="text-xs text-slate-500 mt-1">Search by career name, skill, cluster, or industry</p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {["Software Engineer", "Data Science", "UX Design", "Finance", "Healthcare", "AI"].map((hint) => (
                <button
                  key={hint}
                  onClick={() => navigate(`/career-search?q=${encodeURIComponent(hint)}`)}
                  className="rounded-full border border-[#D3E3F5] bg-[#F0F6FC] px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white hover:border-slate-400 hover:text-[#0b1a36] transition shadow-2xs cursor-pointer"
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