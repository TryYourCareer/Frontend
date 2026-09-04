import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, DollarSign, TrendingUp, Star,
  Award, BookOpen, Compass, CheckCircle, ShieldAlert,
  AlertCircle
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

export default function CareerDetails() {
  const { careerName } = useParams();
  const navigate = useNavigate();
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/Careers.csv")
      .then((r) => r.text())
      .then((text) => {
        const parsed = parseCSV(text);
        const decodedName = decodeURIComponent(careerName || "");
        const found = parsed.find(
          (c) => (c["Career Name"] || "").toLowerCase() === decodedName.toLowerCase()
        );
        setCareer(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [careerName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] flex items-center justify-center p-6 font-sans">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-slate-200" />
          <div className="h-6 w-48 rounded-xl bg-slate-200" />
          <div className="h-4 w-64 rounded-full bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 py-12 flex flex-col items-center justify-center text-center font-sans">
        <div className="rounded-3xl border border-[#D3E3F5] bg-white p-8 max-w-md w-full shadow-xs flex flex-col items-center">
          <AlertCircle size={44} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-serif font-bold mb-2 text-[#0b1a36]">
            Career Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
            We couldn't find details for the career "{decodeURIComponent(careerName || "")}".
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const demand = career["Demand Level"] || "";
  const demandColor = DEMAND_COLOR[demand] || "#94a3b8";
  const moneyScore = parseInt(career["Money Score"]) || 0;
  const growthScore = parseInt(career["Growth Score"]) || 0;
  const stabilityScore = parseInt(career["Stability Score"]) || 0;

  const skills = (career["Core Skills"] || "").split(",").map(s => s.trim()).filter(Boolean);
  const certs = (career["Key Certifications"] || "").split(",").map(c => c.trim()).filter(Boolean);

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] px-4 sm:px-8 lg:px-12 py-8 text-slate-800 text-left font-sans">
      <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
        {/* Navigation & Action Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-[#D3E3F5] bg-white p-2.5 text-slate-600 hover:text-[#0b1a36] hover:border-slate-400 transition shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-[#1E88E5]">
              {career["Cluster"]}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mt-1 leading-tight text-[#0b1a36]">
              {career["Career Name"]}
            </h1>
          </div>
        </div>

        {/* Hero Section Card */}
        <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-[#D3E3F5] pb-6">
            <div className="space-y-2">
              <span
                className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
                style={{
                  color: demandColor,
                  backgroundColor: `${demandColor}15`,
                  borderColor: `${demandColor}30`,
                }}
              >
                {demand} Demand
              </span>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                {career["One-Line Summary"]}
              </p>
            </div>
            
            {/* Aggregate Scores */}
            <div className="flex gap-2.5 shrink-0">
              <ScoreMetric label="Money" value={moneyScore} color="#d97706" />
              <ScoreMetric label="Growth" value={growthScore} color="#16a34a" />
              <ScoreMetric label="Stability" value={stabilityScore} color="#1E88E5" />
            </div>
          </div>

          {/* Quick Salaries & Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <HighlightCard icon={<DollarSign size={14} />} label="Entry Pay" value={`₹${career["Entry Salary (LPA)"]} LPA`} color="#d97706" />
            <HighlightCard icon={<TrendingUp size={14} />} label="Mid Pay" value={`₹${career["Mid Salary (LPA)"]} LPA`} color="#16a34a" />
            <HighlightCard icon={<TrendingUp size={14} />} label="Senior Pay" value={`₹${career["Senior Salary (LPA)"]} LPA`} color="#1E88E5" />
            <HighlightCard icon={<Award size={14} />} label="Top Earnings" value={career["Top Earnings (LPA)"]} color="#0b1a36" />
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid gap-6 md:grid-cols-[1.8fr_1fr]">
          
          {/* Main Info Body */}
          <div className="space-y-6">
            {/* What They Do */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#0b1a36]">
                <Compass size={16} className="text-[#1E88E5]" />
                What They Do
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {career["What They Do"]}
              </p>
            </div>

            {/* Entry Path */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#0b1a36]">
                <BookOpen size={16} className="text-[#d97706]" />
                Recommended Career Path
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {career["Entry Path"]}
              </p>
            </div>

            {/* Target Audience Profiles */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-2xs space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-emerald-800">
                  <CheckCircle size={15} /> Who Should Choose
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {career["Who Should Choose"]}
                </p>
              </div>

              <div className="rounded-3xl border border-red-200 bg-red-50/50 p-5 shadow-2xs space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-red-700">
                  <ShieldAlert size={15} /> Who Should Avoid
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {career["Who Should Avoid"]}
                </p>
              </div>
            </div>

            {/* Verdict */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#0b1a36]">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                ClearCareers Verdict
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl p-4">
                {career["Verdict"]}
              </p>
            </div>
          </div>

          {/* Sidebar Metrics & Requirements */}
          <div className="space-y-6">
            {/* Key Requirements */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-3.5">
              <h3 className="font-serif text-sm font-bold text-[#0b1a36]">
                Job Profile Details
              </h3>
              
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Degree Required</span>
                <span className="text-xs font-bold text-slate-800 leading-relaxed block mt-0.5">{career["Degree Required"]}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Industries</span>
                <span className="text-xs font-semibold text-slate-700 block mt-0.5">{career["Industries"]}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#D3E3F5] pt-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Growth Rate</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{career["Growth Rate"]}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Impact</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{career["AI Impact"]}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#D3E3F5] pt-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Work-Life Balance</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{career["Work-Life Balance"]}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stress Level</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{career["Stress Level"]}</span>
                </div>
              </div>
            </div>

            {/* Core Skills */}
            <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-3">
              <h3 className="font-serif text-sm font-bold text-[#0b1a36]">
                Core Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-[#D3E3F5] px-3 py-1 text-[11px] font-semibold text-slate-700 bg-[#F0F6FC]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Certifications */}
            {certs.length > 0 && (
              <div className="rounded-3xl border border-[#D3E3F5] bg-white p-6 shadow-xs space-y-3">
                <h3 className="font-serif text-sm font-bold text-[#0b1a36]">
                  Key Certifications
                </h3>
                <div className="flex flex-col gap-2">
                  {certs.map((cert) => (
                    <div key={cert} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700 bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl p-3">
                      <Award size={15} className="mt-0.5 shrink-0 text-[#1E88E5]" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ScoreMetric({ label, value, color }) {
  return (
    <div className="flex flex-col items-center bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl px-3 py-2 min-w-[64px] shadow-2xs">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-base font-black mt-0.5" style={{ color }}>{value}/10</span>
    </div>
  );
}

function HighlightCard({ icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-[#D3E3F5] bg-[#F0F6FC] p-3 text-center space-y-1 shadow-2xs">
      <div className="mx-auto w-7 h-7 rounded-full bg-white flex items-center justify-center border border-[#D3E3F5] shadow-2xs" style={{ color }}>
        {icon}
      </div>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
      <p className="text-xs font-bold text-slate-800 truncate">{value}</p>
    </div>
  );
}