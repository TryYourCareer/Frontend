import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, DollarSign, TrendingUp, BarChart3, Zap, Star,
  Award, BookOpen, Briefcase, Compass, Users, CheckCircle, ShieldAlert,
  Calendar, AlertCircle
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
      <div className="min-h-screen bg-[#FAF6EC] flex items-center justify-center p-6">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-[#e8dfc8]" />
          <div className="h-6 w-48 rounded bg-[#e8dfc8]" />
          <div className="h-4 w-64 rounded bg-[#e8dfc8]" />
        </div>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="min-h-screen bg-[#FAF6EC] px-4 py-12 flex flex-col items-center justify-center text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-serif font-bold mb-2" style={{ color: LOGO_DARK }}>
          Career Not Found
        </h1>
        <p className="text-sm text-slate-500 mb-6 max-w-md">
          We couldn't find details for the career "{decodeURIComponent(careerName || "")}".
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl border border-[#e2d9c8] bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#5B7EC9]/40"
        >
          <ArrowLeft size={14} /> Go Back
        </button>
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
    <section className="min-h-screen bg-[#FAF6EC] px-4 sm:px-6 py-8 text-slate-800 text-left">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Navigation & Action Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border border-[#e2d9c8] bg-white p-2 text-slate-500 hover:text-[#5B7EC9] hover:border-[#5B7EC9]/40 transition shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border bg-white"
              style={{ color: LOGO_MID, borderColor: "#e2d9c8" }}
            >
              {career["Cluster"]}
            </span>
            <h1 className="text-3xl font-serif font-bold mt-1 leading-tight" style={{ color: LOGO_DARK }}>
              {career["Career Name"]}
            </h1>
          </div>
        </div>

        {/* Hero Section Card */}
        <div className="rounded-3xl border border-[#e2d9c8] bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-2">
              <span
                className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                style={{ color: demandColor, backgroundColor: `${demandColor}15` }}
              >
                {demand} Demand
              </span>
              <p className="text-base text-slate-600 font-medium">{career["One-Line Summary"]}</p>
            </div>
            
            {/* Aggregate Scores */}
            <div className="flex gap-3 shrink-0">
              <ScoreMetric label="Money" value={moneyScore} color={LOGO_TAN} />
              <ScoreMetric label="Growth" value={growthScore} color="#16a34a" />
              <ScoreMetric label="Stability" value={stabilityScore} color={LOGO_BLUE} />
            </div>
          </div>

          {/* Quick Salaries & Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HighlightCard icon={<DollarSign size={14} />} label="Entry Pay" value={`₹${career["Entry Salary (LPA)"]} LPA`} color={LOGO_TAN} />
            <HighlightCard icon={<TrendingUp size={14} />} label="Mid Pay" value={`₹${career["Mid Salary (LPA)"]} LPA`} color="#16a34a" />
            <HighlightCard icon={<TrendingUp size={14} />} label="Senior Pay" value={`₹${career["Senior Salary (LPA)"]} LPA`} color={LOGO_BLUE} />
            <HighlightCard icon={<Award size={14} />} label="Top Earnings" value={career["Top Earnings (LPA)"]} color={LOGO_MID} />
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid gap-6 md:grid-cols-[1.8fr_1fr]">
          
          {/* Main Info Body */}
          <div className="space-y-6">
            {/* What They Do */}
            <div className="rounded-2xl border border-[#e2d9c8] bg-white p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: LOGO_DARK }}>
                <Compass size={16} style={{ color: LOGO_BLUE }} />
                What They Do
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {career["What They Do"]}
              </p>
            </div>

            {/* Entry Path */}
            <div className="rounded-2xl border border-[#e2d9c8] bg-white p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: LOGO_DARK }}>
                <BookOpen size={16} style={{ color: LOGO_TAN }} />
                Recommended Career Path
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {career["Entry Path"]}
              </p>
            </div>

            {/* Target Audience Profiles */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#e2d9c8] bg-white p-6 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-green-700">
                  <CheckCircle size={14} /> Who Should Choose
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {career["Who Should Choose"]}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e2d9c8] bg-white p-6 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-red-700">
                  <ShieldAlert size={14} /> Who Should Avoid
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {career["Who Should Avoid"]}
                </p>
              </div>
            </div>

            {/* Verdict */}
            <div className="rounded-2xl border border-[#e2d9c8] bg-white p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: LOGO_DARK }}>
                <Star size={16} style={{ color: LOGO_TAN }} />
                ClearCareers Verdict
              </h3>
              <p className="text-sm text-slate-700 font-medium leading-relaxed bg-[#FAF6EC] border border-[#e2d9c8] rounded-xl p-4">
                {career["Verdict"]}
              </p>
            </div>
          </div>

          {/* Sidebar Metrics & Requirements */}
          <div className="space-y-6">
            {/* Key Requirements */}
            <div className="rounded-2xl border border-[#e2d9c8] bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: LOGO_DARK }}>
                Job Profile Details
              </h3>
              
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Degree Required</span>
                <span className="text-xs font-bold text-slate-700 leading-relaxed block mt-0.5">{career["Degree Required"]}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Industries</span>
                <span className="text-xs font-bold text-slate-600 block mt-0.5">{career["Industries"]}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Growth Rate</span>
                  <span className="text-xs font-bold text-slate-700 block mt-0.5">{career["Growth Rate"]}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Impact</span>
                  <span className="text-xs font-bold text-slate-700 block mt-0.5">{career["AI Impact"]}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Work-Life Balance</span>
                  <span className="text-xs font-bold text-slate-700 block mt-0.5">{career["Work-Life Balance"]}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stress Level</span>
                  <span className="text-xs font-bold text-slate-700 block mt-0.5">{career["Stress Level"]}</span>
                </div>
              </div>
            </div>

            {/* Core Skills */}
            <div className="rounded-2xl border border-[#e2d9c8] bg-white p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: LOGO_DARK }}>
                Core Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border px-3 py-1 text-xs font-semibold text-slate-700 bg-[#FAF6EC] border-[#e2d9c8]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Certifications */}
            {certs.length > 0 && (
              <div className="rounded-2xl border border-[#e2d9c8] bg-white p-6 shadow-sm space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: LOGO_DARK }}>
                  Key Certifications
                </h3>
                <div className="flex flex-col gap-2">
                  {certs.map((cert) => (
                    <div key={cert} className="flex items-start gap-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                      <Award size={14} className="mt-0.5 shrink-0 text-slate-400" />
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
    <div className="flex flex-col items-center bg-[#FAF6EC] border border-[#e2d9c8] rounded-xl px-2.5 py-1.5 min-w-[64px]">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-lg font-black mt-0.5" style={{ color }}>{value}/10</span>
    </div>
  );
}

function HighlightCard({ icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-[#e2d9c8] bg-[#FAF6EC]/50 p-3 text-center space-y-1">
      <div className="mx-auto w-6 h-6 rounded-full bg-white flex items-center justify-center border shadow-xs" style={{ color }}>
        {icon}
      </div>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
      <p className="text-xs font-bold text-slate-700 truncate">{value}</p>
    </div>
  );
}
