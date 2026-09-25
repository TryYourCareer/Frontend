import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  ArrowRight,
  Search,
  Users,
  Compass,
  RefreshCw,
  Layers,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { getLatestRecommendation } from "../services/decisionIntelligence";
import SEO from "../components/SEO";

export default function ReportsHub() {
  const navigate = useNavigate();
    const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await getLatestRecommendation();
      const candidates = snap?.ranked_career_candidates || snap?.candidates || [];
      if (Array.isArray(candidates)) {
        setReports(candidates);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.warn("Could not load recommendation reports:", err);
      // If 404/empty, show empty state; for network error set error
      if (err?.response?.status === 404 || err?.status === 404) {
        setReports([]);
      } else {
        setError(err?.message || "Unable to load reports. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase().trim();
    return reports.filter((r) => {
      const title = (r.career_title || r.career_name || "").toLowerCase();
      const category = (r.recommendation_category || "").toLowerCase();
      return title.includes(q) || category.includes(q);
    });
  }, [reports, searchQuery]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#f7fafd] via-[#eef4fc] to-[#e4eef9] px-4 py-8 sm:px-6 lg:px-10 text-slate-800 font-sans text-left"
      data-testid="reports-hub-container"
    >
      <SEO
        title="Decision Report Engine | ClearCareers"
        description="Access and explore your multi-dimensional career decision reports and parent evidence summaries."
      />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-8 lg:p-10 shadow-sm shadow-blue-900/5 space-y-4">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1E88E5]">
                  <FileText size={13} className="text-[#1E88E5]" />
                  Authoritative Intelligence
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                  Report Engine
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-[#0b1a36] leading-tight">
                Career Decision Reports
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Comprehensive, multi-source evaluation reports synthesizing your RIASEC Discovery traits, rubric-scored Trial Missions, and CTEP industry benchmarks.
              </p>
            </div>

            {/* Quick Stats Pill */}
            {!loading && !error && (
              <div className="flex items-center gap-3 bg-[#F0F6FC] border border-[#D3E3F5] p-3.5 rounded-2xl shrink-0">
                <div className="p-2.5 bg-white text-[#1E88E5] rounded-xl shadow-2xs">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0b1a36]">
                    {reports.length} Evaluated {reports.length === 1 ? "Track" : "Tracks"}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {reports.length > 0 ? "Decision Profiles Ready" : "Start a Trial Mission"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search & Filter Controls */}
        {reports.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search evaluated careers..."
                className="w-full rounded-2xl border border-[#D3E3F5] bg-white pl-10 pr-4 py-2.5 text-xs text-[#0b1a36] placeholder-slate-400 focus:border-[#1E88E5] focus:outline-none focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
                data-testid="reports-hub-search-input"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
              Showing {filteredReports.length} of {reports.length} reports
            </div>
          </div>
        )}

        {/* Content States */}
        {loading ? (
          /* Loading Skeleton */
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="reports-hub-loading"
          >
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-3xl border border-[#D3E3F5] bg-white p-6 space-y-4 animate-pulse shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 w-24 bg-slate-200 rounded-full" />
                  <div className="h-5 w-16 bg-slate-200 rounded-full" />
                </div>
                <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
                <div className="h-12 w-full bg-slate-100 rounded-xl" />
                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <div className="h-9 flex-1 bg-slate-200 rounded-xl" />
                  <div className="h-9 w-24 bg-slate-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div
            className="rounded-3xl border border-rose-200 bg-rose-50/60 p-8 text-center space-y-4 shadow-sm"
            data-testid="reports-hub-error"
          >
            <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Failed to Load Reports</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">{error}</p>
            </div>
            <button
              onClick={fetchReports}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0b1a36] text-white text-xs font-bold rounded-full hover:bg-[#142447] transition cursor-pointer shadow-xs"
              data-testid="reports-hub-retry-btn"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        ) : reports.length === 0 ? (
          /* Empty State */
          <div
            className="rounded-3xl border border-[#D3E3F5] bg-white p-8 sm:p-12 text-center space-y-6 shadow-sm"
            data-testid="reports-hub-empty-state"
          >
            <div className="mx-auto w-16 h-16 rounded-3xl bg-[#F0F6FC] text-[#1E88E5] border border-[#D3E3F5] flex items-center justify-center shadow-xs">
              <FileText size={30} />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-[#0b1a36]">No Decision Reports Yet</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Decision reports are automatically generated once you complete your Discovery Test and simulated Trial Missions for target careers.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate("/assessment")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0b1a36] text-white text-xs font-bold rounded-full hover:bg-[#142447] transition cursor-pointer shadow-xs"
                data-testid="empty-state-discovery-btn"
              >
                <Compass size={15} />
                <span>Take Discovery Test</span>
              </button>

              <button
                onClick={() => navigate("/career-reality")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#D3E3F5] text-slate-700 text-xs font-bold rounded-full hover:bg-[#F0F6FC] transition cursor-pointer shadow-2xs"
                data-testid="empty-state-explore-btn"
              >
                <Layers size={15} />
                <span>Explore Career Tracks</span>
              </button>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          /* No search results */
          <div className="rounded-3xl border border-[#D3E3F5] bg-white p-8 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700">No reports matched "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-[#1E88E5] hover:underline cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          /* Reports Grid */
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="reports-hub-grid"
          >
            {filteredReports.map((rep) => {
              const careerId = rep.career_id || rep.id;
              const title = rep.career_title || rep.career_name || "Target Career";
              const category = rep.recommendation_category;
              const fitTier = rep.fit_tier;
              const fitIndex = rep.fit_index !== undefined ? rep.fit_index : rep.overall_fit_index;
              const rationale = rep.rationale_summary || rep.summary || null;

              return (
                <div
                  key={careerId}
                  className="rounded-3xl border border-[#D3E3F5] bg-white p-6 sm:p-7 flex flex-col justify-between hover:border-[#1E88E5]/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
                  data-testid={"report-hub-card-" + careerId}
                >
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {category ? category.replace(/_/g, " ") : "Decision Track"}
                      </span>

                      {(fitTier || (fitIndex !== undefined && fitIndex !== null)) && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {fitIndex !== undefined && fitIndex !== null
                            ? String(Math.round(fitIndex)) + "% Fit"
                            : fitTier.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>

                    {/* Career Title */}
                    <div>
                      <h3 className="text-lg font-bold font-sans text-[#0b1a36] group-hover:text-[#1E88E5] transition line-clamp-1">
                        {title}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Canonical Decision Evaluation
                      </span>
                    </div>

                    {/* Rationale / Summary */}
                    {rationale && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-[#F0F6FC]/60 p-3 rounded-xl border border-[#D3E3F5]">
                        {rationale}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      onClick={() => navigate("/careers/" + careerId + "/decision-report")}
                      className="flex-1 py-2.5 px-4 bg-[#0b1a36] hover:bg-[#122b59] text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      data-testid={"view-decision-report-" + careerId}
                    >
                      <span>View Decision Report</span>
                      <ArrowRight size={13} />
                    </button>

                    <button
                      onClick={() => navigate("/careers/" + careerId + "/parent-report")}
                      className="py-2.5 px-3.5 bg-white border border-[#D3E3F5] text-slate-700 hover:bg-[#F0F6FC] text-xs font-bold rounded-2xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      title="View Parent Summary Report"
                      data-testid={"view-parent-report-" + careerId}
                    >
                      <Users size={14} className="text-slate-500" />
                      <span className="sm:hidden lg:inline">Parent</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
