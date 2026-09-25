import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileCheck2,
  Compass, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  Layers, 
  Play, 
  X, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  Columns3, 
  CheckSquare, 
  Square 
} from "lucide-react";
import { getLatestRecommendation } from "../services/decisionIntelligence";
import SEO from "../components/SEO";

/**
 * Format recommendation category to authoritative human-readable label.
 */
export function formatRecommendationCategory(category) {
  switch (category) {
    case "VALIDATED_STRONG_ALIGNMENT":
      return "Validated Strong Alignment";
    case "HIGH_POTENTIAL_EXPLORATORY":
      return "High Potential (Exploratory)";
    case "DEVELOPING_TARGET":
      return "Developing Target";
    case "EVIDENCE_DEFICIENT":
      return "Evidence Deficient";
    default:
      return category || "Uncategorized";
  }
}

/**
 * Recommendation state neutral supporting copy.
 */
export function getRecommendationCategoryMessage(category) {
  switch (category) {
    case "VALIDATED_STRONG_ALIGNMENT":
      return "Strong alignment is supported by the available trial evidence.";
    case "HIGH_POTENTIAL_EXPLORATORY":
      return "Promising alignment, with additional evidence needed for stronger confidence.";
    case "DEVELOPING_TARGET":
      return "Current evidence indicates areas that can be developed through further practice.";
    case "EVIDENCE_DEFICIENT":
      return "There is not yet enough evidence to draw a strong conclusion.";
    default:
      return "Alignment evaluation based on available trial evidence.";
  }
}

/**
 * Category badge styling map.
 */
export function getCategoryBadgeClasses(category) {
  switch (category) {
    case "VALIDATED_STRONG_ALIGNMENT":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "HIGH_POTENTIAL_EXPLORATORY":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "DEVELOPING_TARGET":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "EVIDENCE_DEFICIENT":
      return "bg-slate-100 text-slate-700 border-slate-300";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

/**
 * Uncertainty badge styling map.
 */
export function getUncertaintyBadgeClasses(uncertainty) {
  switch (String(uncertainty).toUpperCase()) {
    case "LOW":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "MODERATE":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "HIGH":
      return "bg-slate-100 text-slate-700 border-slate-300";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

/**
 * Format Fit Index safely (null -> em dash).
 */
export function formatFitIndex(fitIndex) {
  if (fitIndex === null || fitIndex === undefined) {
    return "—";
  }
  const num = Number(fitIndex);
  if (isNaN(num)) return "—";
  return num.toFixed(1);
}

/**
 * Format Evidence Gap State to human-readable label.
 */
export function formatGapState(gapState) {
  switch (gapState) {
    case "DEMONSTRATED_GROWTH_AREA":
      return "Demonstrated Growth Area";
    case "INSUFFICIENT_EVIDENCE":
      return "Insufficient Evidence";
    case "UNTESTED_AREA":
      return "Untested Area";
    default:
      return gapState || "Unknown State";
  }
}

/**
 * Neutral interpretation copy for evidence gap states.
 */
export function getGapStateDescription(gapState) {
  switch (gapState) {
    case "DEMONSTRATED_GROWTH_AREA":
      return "Current evidence indicates a development opportunity.";
    case "INSUFFICIENT_EVIDENCE":
      return "More observations are needed before making a stronger conclusion.";
    case "UNTESTED_AREA":
      return "The area has not yet been sufficiently observed (neutral exploration).";
    default:
      return "Gap identified from evidence evaluation.";
  }
}

/**
 * Styling classes for gap states.
 */
export function getGapBadgeClasses(gapState) {
  switch (gapState) {
    case "DEMONSTRATED_GROWTH_AREA":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "INSUFFICIENT_EVIDENCE":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "UNTESTED_AREA":
      return "bg-slate-100 text-slate-700 border-slate-300";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

export default function CareerDecision() {
  const navigate = useNavigate();

  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedComparisonIds, setSelectedComparisonIds] = useState([]);

  const fetchLatest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLatestRecommendation();
      setSnapshot(data);
    } catch (err) {
      if (err.status === 404 || String(err.message).includes("No recommendation snapshot found")) {
        setSnapshot(null);
      } else {
        setError(err.message || "Failed to load the latest career decision recommendations.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedCandidate(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Comparison toggle handler (strictly 2-4 careers, preserving server order)
  const toggleComparisonSelection = (careerId) => {
    setSelectedComparisonIds((prev) => {
      if (prev.includes(careerId)) {
        return prev.filter((id) => id !== careerId);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, careerId];
    });
  };

  const clearComparisonSelection = () => {
    setSelectedComparisonIds([]);
  };

  // Selected comparison candidates in EXACT server-provided order
  const comparisonCandidates = (snapshot?.ranked_career_candidates || []).filter(
    (c) => selectedComparisonIds.includes(c.career_id)
  );

  const isComparisonActive = comparisonCandidates.length >= 2 && comparisonCandidates.length <= 4;
  const hasWorkDnaData = comparisonCandidates.some((c) => c.work_dna?.dimensions);

  return (
    <div className="min-h-screen bg-[#FAF6EC] px-4 py-8 sm:px-6 lg:px-8 text-[#0b1a36]">
      <SEO
        title="Career Decision & Multi-Track Comparison"
        description="Compare your top career candidates side-by-side across multidimensional RIASEC alignment, salary potential, and trial mission scores."
        url="/career-decision"
      />
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ================================================================= */}
        {/* 1. Page Header                                                    */}
        {/* ================================================================= */}
        <div className="bg-white/90 rounded-2xl p-6 sm:p-8 border border-[#e2d9c8] shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#7B4A28]/10 text-[#7B4A28] border border-[#7B4A28]/20">
                <Compass size={13} />
                <span>Decision Intelligence</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-sans text-slate-900">
                Career Decision
              </h1>
            </div>

            {snapshot && (
              <button
                type="button"
                onClick={fetchLatest}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 transition shadow-sm disabled:opacity-50"
                aria-label="Refresh latest recommendation"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            )}
          </div>

          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Synthesizes empirical evidence from completed Trial Missions and canonical Career Intelligence Work DNA profiles. 
            Evaluations reflect demonstrated performance on simulated tasks; they do not represent personality profiles or guaranteed hiring outcomes.
          </p>
        </div>

        {/* ================================================================= */}
        {/* 2. Loading State                                                  */}
        {/* ================================================================= */}
        {loading && (
          <div className="space-y-6 animate-pulse" data-testid="decision-loading-skeleton">
            <div className="bg-white/80 rounded-2xl p-6 border border-[#e2d9c8] space-y-4">
              <div className="h-5 w-48 bg-[#e8dfc8] rounded-md" />
              <div className="h-10 w-full bg-[#f0e9d8] rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-56 bg-white/80 rounded-2xl p-6 border border-[#e2d9c8] space-y-3">
                  <div className="h-5 w-36 bg-[#e8dfc8] rounded-md" />
                  <div className="h-6 w-24 bg-[#f0e9d8] rounded-full" />
                  <div className="h-16 bg-[#f0e9d8] rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. Error State                                                    */}
        {/* ================================================================= */}
        {!loading && error && (
          <div 
            className="bg-white/90 rounded-2xl p-8 border border-red-200 text-center max-w-xl mx-auto shadow-sm space-y-4"
            data-testid="decision-error-state"
          >
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-red-50 text-red-600 border border-red-200 mx-auto">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Failed to Load Recommendations</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchLatest}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#0b1a36] text-white hover:bg-[#142447] transition shadow-sm"
            >
              <RefreshCw size={15} />
              <span>Retry Evaluation</span>
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. No Data / Empty State                                          */}
        {/* ================================================================= */}
        {!loading && !error && !snapshot && (
          <div 
            className="bg-white/90 rounded-2xl p-8 sm:p-12 border border-[#e2d9c8] text-center max-w-2xl mx-auto shadow-sm space-y-6"
            data-testid="decision-empty-state"
          >
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-[#7B4A28]/10 text-[#7B4A28] border border-[#7B4A28]/20 mx-auto">
              <Layers size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-sans text-slate-900">
                No Decision Recommendations Yet
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Career decision recommendations are generated after you complete simulated Trial Missions. 
                Complete your first mission to produce empirical evidence and evaluate your alignment across target careers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/trial-mission")}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-[#0b1a36] text-white hover:bg-[#142447] transition shadow-sm"
            >
              <Play size={16} />
              <span>Explore Trial Missions</span>
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* 5. Latest Snapshot View (Ranked Candidate Cards & Selection)      */}
        {/* ================================================================= */}
        {!loading && !error && snapshot && (
          <div className="space-y-6" data-testid="decision-snapshot-view">
            
            {/* Snapshot Metadata Bar & Comparison Status */}
            <div className="bg-white/90 rounded-2xl p-4 sm:p-5 border border-[#e2d9c8] shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#7B4A28]" />
                  <span>
                    <strong>Evaluated:</strong>{" "}
                    {snapshot.generated_at ? new Date(snapshot.generated_at).toLocaleString() : "Latest"}
                  </span>
                </div>
                {snapshot.recommendation_engine_version && (
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-mono text-xs border border-slate-200">
                    Engine: {snapshot.recommendation_engine_version}
                  </span>
                )}
                <span>
                  <strong>Candidates:</strong> {snapshot.ranked_career_candidates?.length || 0}
                </span>
              </div>

              {/* Comparison Counter & Action */}
              <div className="flex items-center gap-3" data-testid="comparison-selection-bar">
                <span className="text-xs font-semibold text-slate-700">
                  Compare: <strong className="text-slate-900">{selectedComparisonIds.length}</strong> / 4 selected
                </span>
                {selectedComparisonIds.length > 0 && (
                  <button
                    type="button"
                    onClick={clearComparisonSelection}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2 transition"
                    data-testid="clear-comparison-button"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Candidates Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(snapshot.ranked_career_candidates || []).map((candidate) => {
                const isDeficient = candidate.recommendation_category === "EVIDENCE_DEFICIENT";
                const categoryLabel = formatRecommendationCategory(candidate.recommendation_category);
                const categoryMessage = getRecommendationCategoryMessage(candidate.recommendation_category);
                const categoryBadgeClass = getCategoryBadgeClasses(candidate.recommendation_category);
                const uncertaintyBadgeClass = getUncertaintyBadgeClasses(candidate.uncertainty_classification);
                const isSelectedForDetail = selectedCandidate?.career_id === candidate.career_id;
                const isSelectedForComparison = selectedComparisonIds.includes(candidate.career_id);
                const isComparisonDisabled = !isSelectedForComparison && selectedComparisonIds.length >= 4;

                return (
                  <div
                    key={candidate.career_id}
                    className={`bg-white/90 rounded-2xl p-6 border shadow-sm flex flex-col justify-between space-y-5 transition ${
                      isSelectedForComparison
                        ? "border-[#7B4A28] ring-2 ring-[#7B4A28]/20 bg-[#fdfbf7]"
                        : isSelectedForDetail 
                        ? "border-slate-400 ring-1 ring-slate-300"
                        : "border-[#e2d9c8] hover:border-slate-400"
                    }`}
                    data-testid={`candidate-card-${candidate.career_id}`}
                  >
                    <div className="space-y-4">
                      {/* Card Header: Rank, Category & Comparison Checkbox */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span 
                            className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold font-mono shadow-sm"
                            data-testid={`candidate-rank-${candidate.career_id}`}
                          >
                            Rank #{candidate.rank || 1}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${categoryBadgeClass}`}>
                            {categoryLabel}
                          </span>
                        </div>

                        {/* Compare Selection Checkbox Button */}
                        <button
                          type="button"
                          onClick={() => toggleComparisonSelection(candidate.career_id)}
                          disabled={isComparisonDisabled}
                          aria-pressed={isSelectedForComparison}
                          aria-label={`Select ${candidate.career_title || candidate.career_code} for comparison`}
                          className={`p-1.5 rounded-lg border transition ${
                            isSelectedForComparison
                              ? "bg-[#7B4A28] text-white border-[#7B4A28]"
                              : isComparisonDisabled
                              ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                              : "bg-white text-slate-400 border-slate-300 hover:border-slate-500 hover:text-slate-700"
                          }`}
                          data-testid={`compare-checkbox-${candidate.career_id}`}
                        >
                          {isSelectedForComparison ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </div>

                      {/* Career Title & Code */}
                      <div>
                        <h2 className="text-xl font-bold font-sans text-slate-900 leading-snug">
                          {candidate.career_title || candidate.career_code}
                        </h2>
                        {candidate.career_code && (
                          <p className="text-xs text-slate-500 font-mono pt-0.5">
                            {candidate.career_code}
                          </p>
                        )}
                      </div>

                      {/* Recommendation State Neutral Supporting Copy */}
                      <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80">
                        {categoryMessage}
                      </p>

                      {/* Metrics Box */}
                      <div className="bg-[#FAF6EC] rounded-xl p-3.5 border border-[#e8dfc8] space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Empirical Fit Index</span>
                          <span className="text-sm font-bold text-slate-900 font-mono" data-testid={`fit-index-${candidate.career_id}`}>
                            {formatFitIndex(candidate.fit_index)}
                            {candidate.fit_index !== null && candidate.fit_index !== undefined ? " / 100" : ""}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Fit Tier</span>
                          <span className="font-semibold text-slate-800">
                            {candidate.fit_tier || "—"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Uncertainty</span>
                          <span 
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${uncertaintyBadgeClass}`}
                            data-testid={`uncertainty-${candidate.career_id}`}
                          >
                            {candidate.uncertainty_classification || "—"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#e2d9c8]">
                          <span className="text-slate-600 font-medium">Dimension Coverage</span>
                          <span className="font-semibold text-slate-900" data-testid={`coverage-${candidate.career_id}`}>
                            {candidate.dimension_coverage_ratio !== undefined && candidate.dimension_coverage_ratio !== null
                              ? `${Math.round(candidate.dimension_coverage_ratio * 100)}%`
                              : "—"}
                          </span>
                        </div>
                      </div>

                      {/* Evidence Deficient Notice */}
                      {isDeficient && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                          Available simulated trial evidence is currently insufficient to evaluate fit. Complete missions for this career to gather evidence.
                        </p>
                      )}

                      {/* Strengths Preview */}
                      {!isDeficient && candidate.key_strengths && candidate.key_strengths.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-xs font-semibold text-slate-700">Key Strengths:</span>
                          <div className="flex flex-wrap gap-1.5" data-testid={`strengths-${candidate.career_id}`}>
                            {candidate.key_strengths.map((strength, sIdx) => (
                              <span 
                                key={sIdx} 
                                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                              >
                                {strength}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evidence Gaps Summary */}
                      {!isDeficient && candidate.primary_evidence_gaps && candidate.primary_evidence_gaps.length > 0 && (
                        <div className="text-xs text-slate-600 pt-0.5" data-testid={`gaps-count-${candidate.career_id}`}>
                          <span className="font-semibold text-slate-700">Evidence Gaps:</span>{" "}
                          <span className="text-slate-800 font-medium">
                            {candidate.primary_evidence_gaps.length} {candidate.primary_evidence_gaps.length === 1 ? "area" : "areas"} to test
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action: Select Career for Detail View */}
                    <div className="pt-2 border-t border-[#e2d9c8] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCandidate(candidate)}
                        className="w-1/2 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white text-slate-800 hover:bg-slate-50 border border-slate-300 transition shadow-sm"
                        aria-label={`View evidence details for ${candidate.career_title || candidate.career_code}`}
                        data-testid={`select-candidate-${candidate.career_id}`}
                      >
                        <span>Evidence Details</span>
                        <ChevronRight size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/careers/${candidate.career_id}/decision-report`)}
                        className="w-1/2 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-blue-50 text-[#1E88E5] hover:bg-blue-100 transition border border-blue-200"
                        aria-label={`View Decision Report for ${candidate.career_title || candidate.career_code}`}
                        data-testid={`decision-report-btn-${candidate.career_id}`}
                      >
                        <FileCheck2 size={13} />
                        <span>Decision Report</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ============================================================= */}
            {/* 7. Comparison Matrix View (Phase 15G-C5)                      */}
            {/* ============================================================= */}
            {isComparisonActive && (
              <div 
                className="bg-white/95 rounded-2xl p-6 sm:p-8 border border-[#7B4A28]/30 shadow-md space-y-6 transition"
                data-testid="career-comparison-matrix-section"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e2d9c8]">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-[#7B4A28]">
                      <Columns3 size={15} />
                      <span>Career Comparison Matrix</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold font-sans text-slate-900">
                      Comparing {comparisonCandidates.length} Careers
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Side-by-side evaluation using server-provided metrics and rankings. Interpret fit scores together with uncertainty classifications.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={clearComparisonSelection}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
                    data-testid="close-comparison-matrix-button"
                  >
                    <X size={14} />
                    <span>Close Comparison</span>
                  </button>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto">
                  <table 
                    className="w-full text-left text-xs border-collapse"
                    data-testid="career-comparison-table"
                  >
                    <thead>
                      <tr className="border-b border-[#e2d9c8]">
                        <th className="p-3.5 font-bold text-slate-700 bg-slate-50/80 rounded-l-xl w-44">
                          Metric / Dimension
                        </th>
                        {comparisonCandidates.map((candidate) => (
                          <th 
                            key={candidate.career_id} 
                            className="p-3.5 font-bold text-slate-900 bg-slate-50/80 min-w-[200px]"
                            data-testid={`comparison-column-${candidate.career_id}`}
                          >
                            <div className="space-y-1">
                              <span className="inline-block px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px]">
                                Rank #{candidate.rank || 1}
                              </span>
                              <div className="text-sm font-sans font-bold text-slate-900 leading-snug">
                                {candidate.career_title || candidate.career_code}
                              </div>
                              {candidate.career_code && (
                                <div className="text-[11px] font-mono text-slate-500 font-normal">
                                  {candidate.career_code}
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedCandidate(candidate)}
                                className="inline-flex items-center gap-1 text-[11px] text-[#7B4A28] font-semibold hover:underline pt-1"
                                aria-label={`View evidence details for ${candidate.career_title || candidate.career_code}`}
                                data-testid={`comparison-detail-link-${candidate.career_id}`}
                              >
                                <span>Evidence Details</span>
                                <ChevronRight size={12} />
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0e9d8]">
                      {/* Recommendation Category */}
                      <tr>
                        <td className="p-3.5 font-semibold text-slate-700 bg-slate-50/40">
                          Recommendation Category
                        </td>
                        {comparisonCandidates.map((candidate) => (
                          <td key={candidate.career_id} className="p-3.5" data-testid={`cmp-category-${candidate.career_id}`}>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getCategoryBadgeClasses(candidate.recommendation_category)}`}>
                              {formatRecommendationCategory(candidate.recommendation_category)}
                            </span>
                            <p className="text-[11px] text-slate-500 italic pt-1 leading-snug">
                              {getRecommendationCategoryMessage(candidate.recommendation_category)}
                            </p>
                          </td>
                        ))}
                      </tr>

                      {/* Empirical Fit Index */}
                      <tr>
                        <td className="p-3.5 font-semibold text-slate-700 bg-slate-50/40">
                          Empirical Fit Index
                        </td>
                        {comparisonCandidates.map((candidate) => (
                          <td key={candidate.career_id} className="p-3.5 font-mono text-sm font-bold text-slate-900" data-testid={`cmp-fit-${candidate.career_id}`}>
                            {formatFitIndex(candidate.fit_index)}
                            {candidate.fit_index !== null && candidate.fit_index !== undefined ? " / 100" : ""}
                          </td>
                        ))}
                      </tr>

                      {/* Fit Tier */}
                      <tr>
                        <td className="p-3.5 font-semibold text-slate-700 bg-slate-50/40">
                          Fit Tier
                        </td>
                        {comparisonCandidates.map((candidate) => (
                          <td key={candidate.career_id} className="p-3.5 font-medium text-slate-800" data-testid={`cmp-tier-${candidate.career_id}`}>
                            {candidate.fit_tier || "—"}
                          </td>
                        ))}
                      </tr>

                      {/* Uncertainty Classification */}
                      <tr>
                        <td className="p-3.5 font-semibold text-slate-700 bg-slate-50/40">
                          Uncertainty Classification
                        </td>
                        {comparisonCandidates.map((candidate) => (
                          <td key={candidate.career_id} className="p-3.5" data-testid={`cmp-uncertainty-${candidate.career_id}`}>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getUncertaintyBadgeClasses(candidate.uncertainty_classification)}`}>
                              {candidate.uncertainty_classification || "—"}
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* Dimension Coverage Ratio */}
                      <tr>
                        <td className="p-3.5 font-semibold text-slate-700 bg-slate-50/40">
                          Dimension Coverage
                        </td>
                        {comparisonCandidates.map((candidate) => (
                          <td key={candidate.career_id} className="p-3.5 font-semibold text-slate-800" data-testid={`cmp-dim-coverage-${candidate.career_id}`}>
                            {candidate.dimension_coverage_ratio !== undefined && candidate.dimension_coverage_ratio !== null
                              ? `${Math.round(candidate.dimension_coverage_ratio * 100)}%`
                              : "—"}
                          </td>
                        ))}
                      </tr>

                      {/* Activity Coverage Ratio (if present) */}
                      <tr>
                        <td className="p-3.5 font-semibold text-slate-700 bg-slate-50/40">
                          Activity Coverage
                        </td>
                        {comparisonCandidates.map((candidate) => (
                          <td key={candidate.career_id} className="p-3.5 text-slate-700 font-medium" data-testid={`cmp-act-coverage-${candidate.career_id}`}>
                            {candidate.activity_coverage_ratio !== undefined && candidate.activity_coverage_ratio !== null
                              ? `${Math.round(candidate.activity_coverage_ratio * 100)}%`
                              : "—"}
                          </td>
                        ))}
                      </tr>

                      {/* Key Strengths */}
                      <tr>
                        <td className="p-3.5 font-semibold text-slate-700 bg-slate-50/40">
                          Demonstrated Strengths
                        </td>
                        {comparisonCandidates.map((candidate) => (
                          <td key={candidate.career_id} className="p-3.5" data-testid={`cmp-strengths-${candidate.career_id}`}>
                            {candidate.key_strengths && candidate.key_strengths.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {candidate.key_strengths.map((st, sIdx) => (
                                  <span key={sIdx} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    {st}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">None recorded</span>
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* Evidence Gaps */}
                      <tr>
                        <td className="p-3.5 font-semibold text-slate-700 bg-slate-50/40">
                          Evidence Gaps
                        </td>
                        {comparisonCandidates.map((candidate) => (
                          <td key={candidate.career_id} className="p-3.5" data-testid={`cmp-gaps-${candidate.career_id}`}>
                            {candidate.primary_evidence_gaps && candidate.primary_evidence_gaps.length > 0 ? (
                              <div className="space-y-1">
                                <span className="font-semibold text-slate-800 text-[11px]">
                                  {candidate.primary_evidence_gaps.length} {candidate.primary_evidence_gaps.length === 1 ? "area" : "areas"} to test
                                </span>
                                <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                                  {candidate.primary_evidence_gaps.slice(0, 3).map((gap, gIdx) => (
                                    <li key={gIdx} className="truncate">
                                      {gap.target_title || gap.target_key}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">None recorded</span>
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* Work DNA Canonical Dimensions (ONLY if supplied in payload) */}
                      {hasWorkDnaData && (
                        <>
                          <tr className="bg-slate-100/80">
                            <td colSpan={comparisonCandidates.length + 1} className="p-2.5 font-bold text-slate-800 text-[11px]">
                              Work DNA Alignment (Demonstrated / Required)
                            </td>
                          </tr>
                          {[
                            ["cognitive_complexity", "Cognitive Complexity"],
                            ["quantitative_intensity", "Quantitative Intensity"],
                            ["systems_topography", "Systems Topography"],
                            ["visual_spatial_rigor", "Visual-Spatial Rigor"],
                            ["uncertainty_ambiguity", "Uncertainty & Ambiguity"],
                          ].map(([dimKey, dimLabel]) => (
                            <tr key={dimKey}>
                              <td className="p-3.5 font-semibold text-slate-700 bg-slate-50/40">
                                {dimLabel}
                              </td>
                              {comparisonCandidates.map((candidate) => {
                                const dim = candidate.work_dna?.dimensions?.[dimKey];
                                return (
                                  <td key={candidate.career_id} className="p-3.5 font-mono text-slate-800" data-testid={`cmp-dna-${dimKey}-${candidate.career_id}`}>
                                    {dim && typeof dim === "object"
                                      ? `${dim.demonstrated_level ?? "—"} / ${dim.career_required_level ?? "—"}`
                                      : dim !== undefined && dim !== null
                                      ? String(dim)
                                      : "—"}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* 6. Career Detail Drawer / Panel (Phase 15G-C3 & C4)               */}
        {/* ================================================================= */}
        {selectedCandidate && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-labelledby="career-detail-title"
            data-testid="career-detail-panel"
          >
            <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6 flex flex-col justify-between">
              
              <div className="space-y-6">
                {/* Detail Header & Close Button */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#e2d9c8]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold font-mono">
                        Rank #{selectedCandidate.rank || 1}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getCategoryBadgeClasses(selectedCandidate.recommendation_category)}`}>
                        {formatRecommendationCategory(selectedCandidate.recommendation_category)}
                      </span>
                    </div>

                    <h2 id="career-detail-title" className="text-2xl sm:text-3xl font-bold font-sans text-slate-900 leading-tight">
                      {selectedCandidate.career_title || selectedCandidate.career_code}
                    </h2>
                    
                    {selectedCandidate.career_code && (
                      <p className="text-xs text-slate-500 font-mono">
                        Code: {selectedCandidate.career_code}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCandidate(null)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                    aria-label="Close career detail view"
                    data-testid="close-detail-button"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Recommendation Interpretation Banner */}
                <div className="bg-[#FAF6EC] p-4 rounded-xl border border-[#e8dfc8] space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Info size={14} className="text-[#7B4A28]" />
                      <span>Evidence Assessment</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      {getRecommendationCategoryMessage(selectedCandidate.recommendation_category)}
                    </p>
                  </div>
                  {selectedCandidate.career_id && (
                    <button
                      type="button"
                      onClick={() => navigate(`/careers/${selectedCandidate.career_id}/decision-report`)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E88E5] text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-blue-600 transition"
                      data-testid="drawer-decision-report-button"
                    >
                      <FileCheck2 size={15} />
                      <span>View Comprehensive Decision Report</span>
                    </button>
                  )}
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Fit Index</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {formatFitIndex(selectedCandidate.fit_index)}
                      {selectedCandidate.fit_index !== null && selectedCandidate.fit_index !== undefined ? " / 100" : ""}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Fit Tier</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {selectedCandidate.fit_tier || "—"}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Uncertainty</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {selectedCandidate.uncertainty_classification || "—"}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block">Dimension Coverage</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {selectedCandidate.dimension_coverage_ratio !== undefined && selectedCandidate.dimension_coverage_ratio !== null
                        ? `${Math.round(selectedCandidate.dimension_coverage_ratio * 100)}%`
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* Key Strengths */}
                {selectedCandidate.key_strengths && selectedCandidate.key_strengths.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Demonstrated Strengths</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.key_strengths.map((s, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence Gaps Breakdown */}
                <div className="space-y-3" data-testid="detail-evidence-gaps-section">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers size={16} className="text-[#7B4A28]" />
                    <span>Diagnosed Evidence Gaps & Exploration Areas</span>
                  </h3>

                  {(!selectedCandidate.primary_evidence_gaps || selectedCandidate.primary_evidence_gaps.length === 0) ? (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                      No primary evidence gaps were recorded in this snapshot.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedCandidate.primary_evidence_gaps.map((gap, gIdx) => (
                        <div 
                          key={gIdx}
                          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs"
                          data-testid={`evidence-gap-item-${gIdx}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">
                                {gap.target_title || gap.target_key}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                {gap.target_type}
                              </span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getGapBadgeClasses(gap.gap_state)}`}>
                              {formatGapState(gap.gap_state)}
                            </span>
                          </div>

                          <p className="text-slate-600 leading-relaxed">
                            {getGapStateDescription(gap.gap_state)}
                          </p>

                          {gap.rationale && (
                            <p className="text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100 text-[11px]">
                              <strong>Rationale:</strong> {gap.rationale}
                            </p>
                          )}

                          {gap.target_type === "COMPETENCY" ? (
                            (gap.demonstrated_level !== null && gap.demonstrated_level !== undefined) && (
                              <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-600">
                                <span><strong>Status:</strong> Milestone Demonstrated</span>
                              </div>
                            )
                          ) : (
                            (gap.demonstrated_level !== null && gap.demonstrated_level !== undefined && gap.expected_level !== null && gap.expected_level !== undefined) && (
                              <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-600">
                                <span><strong>Demonstrated:</strong> Level {gap.demonstrated_level}</span>
                                <span><strong>Expected:</strong> Level {gap.expected_level}</span>
                              </div>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ================================================================= */}
                {/* Recommended Next Trial Mission Section (Phase 15G-C4 Authoritative) */}
                {/* ================================================================= */}
                {(() => {
                  const candidateMission = selectedCandidate.next_trial_mission || (
                    selectedCandidate.next_action?.action_type === "TRIAL_MISSION" ? selectedCandidate.next_action : null
                  );
                  const missionId = candidateMission?.suggested_mission_id || candidateMission?.id || null;
                  const missionTitle = candidateMission?.suggested_mission_title || candidateMission?.title || null;
                  const missionRationale = candidateMission?.rationale || candidateMission?.description || null;
                  const missionSlug = candidateMission?.suggested_mission_slug || null;
                  const workspaceType = candidateMission?.workspace_type || null;

                  return (
                    <div className="space-y-3 pt-4 border-t border-[#e2d9c8]" data-testid="detail-next-mission-section">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Play size={15} className="text-[#7B4A28]" />
                          <span>Recommended Next Trial Mission</span>
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Use another simulated work experience to build evidence in this career.
                        </p>
                      </div>

                      {candidateMission ? (
                        <div className="bg-[#FAF6EC] p-4 rounded-xl border border-[#e8dfc8] space-y-3 shadow-sm" data-testid="next-mission-card">
                          <div className="space-y-1">
                            {missionTitle && (
                              <h4 className="text-sm font-bold font-sans text-slate-900" data-testid="next-mission-title">
                                {missionTitle}
                              </h4>
                            )}
                            {missionSlug && (
                              <p className="text-[11px] font-mono text-slate-500">
                                {missionSlug}
                              </p>
                            )}
                            {workspaceType && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                Workspace: {workspaceType}
                              </span>
                            )}
                          </div>

                          {missionRationale && (
                            <p className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-[#e2d9c8] leading-relaxed">
                              <strong>Evidence Focus:</strong> {missionRationale}
                            </p>
                          )}

                          {missionId ? (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => navigate(`/trial-mission?missionId=${encodeURIComponent(missionId)}`)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#0b1a36] text-white hover:bg-[#142447] transition shadow-sm"
                                aria-label={`Start Trial Mission ${missionTitle || ""}`}
                                data-testid="start-trial-mission-cta"
                              >
                                <Play size={14} />
                                <span>Start Trial Mission</span>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-500 italic" data-testid="no-mission-available-notice">
                          No additional Trial Mission is currently available for this evidence area.
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Work DNA Canonical Dimensions (Rendered ONLY if supplied in candidate data) */}
                {selectedCandidate.work_dna && (
                  <div className="space-y-3" data-testid="detail-work-dna-section">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Compass size={16} className="text-[#7B4A28]" />
                      <span>Work DNA Dimension Alignment</span>
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                      {Object.entries(selectedCandidate.work_dna.dimensions || {}).map(([dimKey, dimVal]) => (
                        <div key={dimKey} className="flex items-center justify-between border-b border-slate-200 pb-1.5 last:border-0 last:pb-0">
                          <span className="text-slate-700 font-medium capitalize">{dimKey.replace(/_/g, " ")}</span>
                          <span className="font-mono font-semibold text-slate-900">
                            {typeof dimVal === "object" ? `${dimVal.demonstrated_level || "—"} / ${dimVal.career_required_level || "—"}` : String(dimVal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Competencies Breakdown (Rendered ONLY if supplied in candidate data) */}
                {selectedCandidate.evaluated_competencies && (
                  <div className="space-y-3" data-testid="detail-competencies-section">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Evaluated Competencies</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      {Object.entries(selectedCandidate.evaluated_competencies).map(([compKey, compVal]) => (
                        <div key={compKey} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                          <span className="font-medium text-slate-800">{compVal.title || compKey}</span>
                          <span className="font-mono text-slate-600">
                            {compVal.evaluated_level === 1 ? "Demonstrated" : (compVal.evaluated_level ? `Level ${compVal.evaluated_level}` : "—")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence Basis & Version Lineage */}
                {selectedCandidate.version_lineage && (
                  <div className="space-y-2 pt-2 border-t border-[#e2d9c8] text-xs text-slate-500">
                    <h3 className="font-bold text-slate-700">Authoritative Provenance Lineage</h3>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                      <div>Fit Algorithm: {selectedCandidate.version_lineage.fit_algorithm_version || "fit_algo_v1.0"}</div>
                      <div>Engine: {selectedCandidate.version_lineage.recommendation_engine_version || "rec_engine_v1.0"}</div>
                      <div>CTEP Extractor: {selectedCandidate.version_lineage.ctep_extractor_version || "ctep_v1.0.0"}</div>
                      <div>Taxonomy: {selectedCandidate.version_lineage.competency_taxonomy_version || "comp_tax_v1.0"}</div>
                      <div>Contributing CTEP Evidence: {selectedCandidate.contributing_evidence_ids?.length || 0} items</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button Footer */}
              <div className="pt-4 border-t border-[#e2d9c8]">
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition"
                  data-testid="detail-footer-close-button"
                >
                  Close Detail View
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
