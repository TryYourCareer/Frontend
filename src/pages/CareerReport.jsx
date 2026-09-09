import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCareerFitReport, triggerMatchAnalysis } from "../services/discoveryTest";
import { 
  Sparkles, Award, Star, ArrowRight, CheckCircle2, TrendingUp, 
  Target, Shield, Compass, RefreshCw, BarChart2, Briefcase, Zap, BookOpen 
} from "lucide-react";

export default function CareerReport() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCareerFitReport(sessionId);
      setReport(data);
    } catch (err) {
      console.warn("Direct report fetch failed, triggering on-demand analysis...", err);
      try {
        await triggerMatchAnalysis(sessionId);
        const retryData = await getCareerFitReport(sessionId);
        setReport(retryData);
      } catch (retryErr) {
        setError(retryErr.message || "Failed to load career fit report.");
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleRetry = () => {
    setRetrying(true);
    fetchReport();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] flex flex-col items-center justify-center p-6 text-[#0b1a36] font-sans">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xs border border-[#D3E3F5] max-w-md w-full text-center space-y-6 animate-pulse">
          <div className="w-16 h-16 bg-[#F0F6FC] text-[#1E88E5] rounded-2xl flex items-center justify-center mx-auto border border-[#D3E3F5]">
            <RefreshCw className="animate-spin" size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-[#0b1a36]">Analyzing Your Profile</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Matching your 6D RIASEC diagnostic responses against 150+ career vectors...
            </p>
          </div>
          <div className="w-full bg-[#edf3fb] h-2 rounded-full overflow-hidden">
            <div className="bg-[#0b1a36] h-full w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] flex flex-col items-center justify-center p-6 text-[#0b1a36] font-sans">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xs border border-red-200 max-w-md w-full text-center space-y-6">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200">
            <Compass size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-serif font-bold text-[#0b1a36]">Unable to Load Report</h2>
            <p className="text-xs sm:text-sm text-slate-600">{error || "No report found for this session."}</p>
          </div>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full py-3 px-6 bg-[#0b1a36] hover:bg-[#122b59] text-white font-bold rounded-full shadow-xs transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
          >
            <RefreshCw size={16} className={retrying ? "animate-spin" : ""} />
            <span>{retrying ? "Retrying..." : "Retry Analysis"}</span>
          </button>
        </div>
      </div>
    );
  }

  const { personality_summary, top_matches, dimension_vector, strengths, development_areas, action_steps } = report;

  const vectorDims = [
    { key: "technical", label: "Technical", icon: Zap, color: "bg-[#1E88E5]" },
    { key: "investigative", label: "Investigative", icon: Target, color: "bg-emerald-500" },
    { key: "entrepreneurial", label: "Entrepreneurial", icon: TrendingUp, color: "bg-amber-500" },
    { key: "creative", label: "Creative", icon: Sparkles, color: "bg-purple-500" },
    { key: "social", label: "Social", icon: Compass, color: "bg-rose-500" },
    { key: "leadership", label: "Leadership", icon: Shield, color: "bg-[#0b1a36]" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f8fd] via-[#edf3fb] to-[#dfeaf7] text-[#0b1a36] py-10 px-4 sm:px-6 font-sans text-left">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Top Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D3E3F5] shadow-xs space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1E88E5]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-[#1E88E5] px-3.5 py-1.5 rounded-full border border-sky-200 flex items-center gap-1.5">
                <Award size={14} />
                <span>Stride Diagnostic Result</span>
              </span>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-[#F0F6FC] hover:bg-slate-200 border border-[#D3E3F5] px-4 py-2 rounded-full transition shadow-2xs cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-[#0b1a36]">
              Your Career Fit Report
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              {personality_summary}
            </p>
          </div>
        </div>

        {/* 6D Dimension Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D3E3F5] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#D3E3F5] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-[#F0F6FC] text-[#1E88E5] rounded-2xl border border-[#D3E3F5]">
                <BarChart2 size={20} />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#0b1a36]">Your 6D Dimension Vector</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Normalized RIASEC Score</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vectorDims.map((dim) => {
              const val = dimension_vector?.[dim.key] || 0;
              const pct = Math.round(val * 100);
              const Icon = dim.icon;
              return (
                <div key={dim.key} className="bg-[#F0F6FC] p-4 rounded-2xl border border-[#D3E3F5] space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2 text-slate-800">
                      <Icon size={16} className="text-[#1E88E5]" />
                      <span>{dim.label}</span>
                    </div>
                    <span className="text-[#0b1a36]">{pct}%</span>
                  </div>
                  <div className="w-full bg-[#edf3fb] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${dim.color} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Matched Careers */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-[#F0F6FC] text-[#1E88E5] rounded-2xl border border-[#D3E3F5]">
                <Briefcase size={20} />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#0b1a36]">Top Matched Careers</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">{top_matches?.length || 0} Recommended Roles</span>
          </div>

          <div className="grid gap-6">
            {top_matches?.map((match, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D3E3F5] shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 space-y-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#D3E3F5] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-[#1E88E5] px-3 py-0.5 rounded-full border border-sky-200">
                        Rank #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-500">{match.sector || match.cluster}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0b1a36]">{match.career_name}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-amber-500 justify-end">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < Math.floor(match.star_rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-1">{match.star_rating}</span>
                      </div>
                      <div className="text-xs font-bold text-emerald-600">
                        {match.similarity_score}% Compatibility Match
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-650 leading-relaxed font-medium">
                  {match.why_it_fits}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex flex-wrap gap-2">
                    {match.key_skills?.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-xs font-semibold bg-[#F0F6FC] text-slate-700 px-3 py-1 rounded-full border border-[#D3E3F5]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate(`/career-details/${encodeURIComponent(match.career_name)}`)}
                    className="py-2.5 px-5 bg-[#0b1a36] hover:bg-[#122b59] text-white text-xs font-bold rounded-full transition flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
                  >
                    <span>Explore Career Roadmap</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Qualitative Reflection Insights */}
        {report.reflection_insights && report.reflection_insights.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D3E3F5] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-[#1E88E5]">
              <div className="p-2.5 bg-[#F0F6FC] text-[#1E88E5] rounded-2xl border border-[#D3E3F5]">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#0b1a36]">Stage 2 Reflection Insights</h3>
                <p className="text-xs text-slate-500">Qualitative themes synthesized from open-text reflection answers</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {report.reflection_insights.map((insight, idx) => (
                <div key={idx} className="bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl p-4 text-xs text-slate-700 leading-relaxed font-medium shadow-2xs">
                  {insight}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths & Development Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D3E3F5] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <CheckCircle2 size={22} />
              <h3 className="font-serif text-lg font-bold text-[#0b1a36]">Key Strengths</h3>
            </div>
            <ul className="space-y-3">
              {strengths?.map((item, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D3E3F5] shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-amber-700">
              <TrendingUp size={22} />
              <h3 className="font-serif text-lg font-bold text-[#0b1a36]">Development Areas</h3>
            </div>
            <ul className="space-y-3">
              {development_areas?.map((item, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Roadmap */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D3E3F5] shadow-xs space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#F0F6FC] text-[#1E88E5] rounded-2xl border border-[#D3E3F5]">
              <BookOpen size={20} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#0b1a36]">Recommended Next Steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {action_steps?.map((step, i) => (
              <div key={i} className="bg-[#F0F6FC] p-5 rounded-2xl border border-[#D3E3F5] space-y-3 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-[#1E88E5] bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                  Step 0{i + 1}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}