import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  UserCheck
} from "lucide-react";
import reportsService, { getDecisionReport, getParentReport, getCanonicalReport, getReport } from "../services/reports";
import ReportActionBar from "../components/reports/ReportActionBar";

// Student Report Sections (Authoritative 10-Section Spec)
import DecisionReportSnapshot from "../components/reports/DecisionReportSnapshot";
import WhoYouAreSection from "../components/reports/WhoYouAreSection";
import RealityCheckSection from "../components/reports/RealityCheckSection";
import JobRealitySection from "../components/reports/JobRealitySection";
import TrialScorecardSection from "../components/reports/TrialScorecardSection";
import MarketOutlookSection from "../components/reports/MarketOutlookSection";
import AIImpactSection from "../components/reports/AIImpactSection";
import PathForwardSection from "../components/reports/PathForwardSection";
import AlternativesSection from "../components/reports/AlternativesSection";
import NextSixToTwelveMonthsSection from "../components/reports/NextSixToTwelveMonthsSection";

// Parent Report Sections
import ParentSnapshotSection from "../components/reports/parent/ParentSnapshotSection";
import ParentEvidenceSection from "../components/reports/parent/ParentEvidenceSection";
import ParentHowThisComparesSection from "../components/reports/parent/ParentHowThisComparesSection";
import ParentAIPreparednessSection from "../components/reports/parent/ParentAIPreparednessSection";
import ParentFinancialSection from "../components/reports/parent/ParentFinancialSection";
import ParentIfItDoesntWorkOutSection from "../components/reports/parent/ParentIfItDoesntWorkOutSection";
import ParentFAQSection from "../components/reports/parent/ParentFAQSection";
import ParentWhatChildNeedsSection from "../components/reports/parent/ParentWhatChildNeedsSection";
import ParentBottomLineSection from "../components/reports/parent/ParentBottomLineSection";

export default function DecisionReport({ initialView = "student" }) {
  const { careerId } = useParams();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState(initialView);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  // Sync activeView if initialView changes externally
  useEffect(() => {
    if (initialView) {
      setActiveView(initialView);
    }
  }, [initialView]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data = null;
      
      // 1. Try canonical report fetch first
      const canonicalFn = getCanonicalReport || getReport || reportsService?.getCanonicalReport || reportsService?.getReport;
      if (typeof canonicalFn === "function") {
        try {
          const res = await canonicalFn(careerId);
          if (res && (res.student_report || res.parent_report || res.report_metadata || res.is_teaser || res.teaser_summary)) {
            data = res;
          }
        } catch (e) {
          // Fall through to specific projection mocks if in a test harness
        }
      }

      // 2. Try projection fallbacks if canonical didn't return data
      if (!data) {
        const projectionFn = activeView === "parent"
          ? (getParentReport || reportsService?.getParentReport || getDecisionReport || reportsService?.getDecisionReport)
          : (getDecisionReport || reportsService?.getDecisionReport || getParentReport || reportsService?.getParentReport);
        
        if (typeof projectionFn === "function") {
          data = await projectionFn(careerId);
        }
      }

      if (!data) {
        throw new Error("No report data returned from server.");
      }

      setReportData(data);
    } catch (err) {
      console.error("Failed to load report:", err);
      setError(err?.message || "Failed to load the report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [careerId, activeView]);

  useEffect(() => {
    if (careerId) {
      fetchReport();
    }
  }, [careerId, fetchReport]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-[#1E88E5]/20 border-t-[#1E88E5] animate-spin" />
          <Sparkles className="w-5 h-5 text-[#1E88E5] absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-slate-600 animate-pulse">
          {activeView === "parent" ? "Synthesizing Parent Career Report..." : "Synthesizing your Decision Report..."}
        </p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-rose-200 rounded-3xl shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-xl font-bold text-[#0b1a36]">
          {activeView === "parent" ? "Unable to Load Parent Report" : "Unable to Load Report"}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">{error}</p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Go Back
          </button>
          <button
            onClick={fetchReport}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E88E5] text-white hover:bg-blue-600 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // Resolved Projections
  const studentReport = reportData?.student_report;
  const parentReport = reportData?.parent_report;
  const metadata = reportData?.report_metadata || {};
  const teaserSummary = reportData?.teaser_summary || {};

  // Teaser / Incomplete State
  const isTeaser = Boolean(
    metadata.is_teaser ||
    reportData?.is_teaser ||
    metadata.report_status === "INCOMPLETE" ||
    metadata.report_status === "TEASER" ||
    metadata.report_status === "NOT_ELIGIBLE" ||
    (!studentReport && !parentReport)
  );

  const careerName =
    teaserSummary.career_name ||
    studentReport?.snapshot?.career_name ||
    parentReport?.snapshot?.career_name ||
    reportData?.career_name ||
    metadata?.career_name ||
    "Target Career";

  if (isTeaser) {
    const status = teaserSummary.status || metadata.report_status || "TEASER";
    const dimensionAverages = teaserSummary.dimension_averages || reportData?.dimension_averages || null;

    const isDiscoveryRequired =
      status === "DISCOVERY_REQUIRED" ||
      teaserSummary.required_action === "DISCOVERY_TEST" ||
      teaserSummary.eligibility_status === "DISCOVERY_REQUIRED" ||
      (teaserSummary.message && teaserSummary.message.toLowerCase().includes("discovery test must be completed"));

    const isInsufficientEvidence =
      status === "INSUFFICIENT_EVIDENCE" ||
      teaserSummary.required_action === "ADDITIONAL_EVIDENCE" ||
      teaserSummary.eligibility_status === "INSUFFICIENT_EVIDENCE";

    let badgeText = "Report Locked • Trial Mission Required";
    if (isDiscoveryRequired) {
      badgeText = "Report Locked • Discovery Test Required";
    } else if (isInsufficientEvidence) {
      badgeText = "Report Preview • Incomplete Evidence";
    }

    let defaultMessage = "Complete the hands-on Trial Mission to unlock the full Decision Report and Parent Report.";
    if (isDiscoveryRequired) {
      defaultMessage = "Discovery Test must be completed before report insights can be generated.";
    } else if (isInsufficientEvidence) {
      defaultMessage = "Your Trial Mission has been submitted, but additional evidence is needed before generating the definitive report.";
    }

    const messageText = teaserSummary.message || defaultMessage;

    return (
      <div className="max-w-4xl mx-auto my-8 p-6 sm:p-10 space-y-8" data-testid={activeView === "parent" ? "parent-report-teaser" : "decision-report-teaser"}>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 hover:text-[#1E88E5] transition cursor-pointer"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span>/</span>
          <span className="text-slate-700">{activeView === "parent" ? "Parent Report" : "Decision Report Teaser"}</span>
        </div>

        <div className="bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 border border-[#D3E3F5] rounded-3xl p-8 sm:p-10 space-y-6 relative overflow-hidden shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <Lock size={12} />
            <span>{activeView === "parent" ? "Parent Report Locked • Trial Mission Required" : badgeText}</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0b1a36] tracking-tight">
              {activeView === "parent" ? `Parent Report for ${careerName}` : `Unlock Your Full Decision Report for ${careerName}`}
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {messageText}
            </p>
          </div>

          {dimensionAverages && Object.keys(dimensionAverages).length > 0 && activeView === "student" && (
            <div className="p-5 bg-white/80 border border-[#D3E3F5] rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Discovery Profile Strengths
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(dimensionAverages).map(([key, val]) => (
                  <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-lg font-black text-[#0b1a36]">{val}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            {isDiscoveryRequired ? (
              <Link
                to="/assessment"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#1E88E5] text-white text-sm font-bold hover:bg-blue-600 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Complete Discovery Test</span>
                <ChevronRight size={16} />
              </Link>
            ) : (
              <Link
                to={`/trial-mission?careerId=${encodeURIComponent(careerId)}`}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#1E88E5] text-white text-sm font-bold hover:bg-blue-600 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{activeView === "parent" ? "View Trial Mission" : isInsufficientEvidence ? "Resume Trial Mission" : "Start Trial Mission"}</span>
                <ChevronRight size={16} />
              </Link>
            )}
            <span className="text-xs text-slate-400">
              {activeView === "parent"
                ? "The full parent synthesis requires simulation data from the completed trial mission."
                : isDiscoveryRequired
                ? "Takes ~15 minutes • 6D RIASEC vector diagnostic"
                : "Takes ~15 minutes • Simulates real on-the-job tasks"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto my-8 px-4 sm:px-6 space-y-10 pb-16">
      {/* Top Header & Action Bar (Export, Share, Student ↔ Parent Switch) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 no-print">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 hover:text-[#1E88E5] transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>{activeView === "parent" ? "Back" : "Back to Overview"}</span>
          </button>

          {activeView === "parent" && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1E88E5] border border-blue-200 text-xs font-bold">
              <UserCheck size={13} />
              <span>Parent Overview</span>
            </div>
          )}
        </div>

        {/* Stale Report Version Alert Banner (if is_stale is true) */}
        {metadata?.is_stale && (
          <div
            data-testid="stale-report-banner"
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="text-amber-600 shrink-0" size={18} />
              <div className="text-xs text-amber-900">
                <span className="font-bold">Newer Report Available:</span> You are viewing historical Report v{metadata.report_version}. A newer version (v{metadata.latest_version}) is available with updated evidence.
              </div>
            </div>
            <button
              onClick={fetchReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer shrink-0 shadow-2xs"
            >
              <RefreshCw size={12} />
              <span>Load Latest</span>
            </button>
          </div>
        )}

        <ReportActionBar
          reportType={activeView}
          careerName={careerName}
          careerId={careerId}
          isTeaser={false}
          activeView={activeView}
          onViewChange={(newView) => setActiveView(newView)}
        />
      </div>

      {/* ================================================================== */}
      {/* PARENT VIEW PRESENTATION                                           */}
      {/* ================================================================== */}
      {activeView === "parent" ? (
        <>
          <ParentSnapshotSection snapshot={parentReport?.snapshot} />
          <ParentEvidenceSection evidence={parentReport?.evidence_not_just_enthusiasm} />
          <ParentHowThisComparesSection howThisCompares={parentReport?.how_this_compares} />
          <ParentAIPreparednessSection aiPreparedness={parentReport?.will_ai_replace_job} />
          <ParentFinancialSection financialOutlook={parentReport?.financial_outlook} />
          <ParentIfItDoesntWorkOutSection ifItDoesntWorkOut={parentReport?.if_it_doesnt_work_out} />
          <ParentFAQSection parentFaq={parentReport?.parent_faq} parentReport={parentReport} reportData={reportData} />
          <ParentWhatChildNeedsSection whatChildNeeds={parentReport?.what_child_needs} />
          <ParentBottomLineSection bottomLine={parentReport?.bottom_line} />
        </>
      ) : (
        /* ================================================================== */
        /* STUDENT VIEW PRESENTATION (Authoritative 10-Section Specification)  */
        /* ================================================================== */
        <>
          {/* 1. Snapshot */}
          <DecisionReportSnapshot snapshot={studentReport?.snapshot} />

          {/* 2. Who You Are */}
          <WhoYouAreSection whoYouAre={studentReport?.who_you_are} />

          {/* 3. Reality Check (Interest vs. Trial Performance) */}
          <RealityCheckSection realityCheck={studentReport?.reality_check} />

          {/* 4. What the Job Actually Looks Like */}
          <JobRealitySection jobReality={studentReport?.job_reality} />

          {/* 5. Trial Mission Scorecard */}
          <TrialScorecardSection trialScorecard={studentReport?.trial_scorecard} />

          {/* 6. Market Outlook */}
          <MarketOutlookSection marketOutlook={studentReport?.market_outlook} />

          {/* 7. How AI Will Reshape This Career */}
          <AIImpactSection aiImpact={studentReport?.ai_impact} realityCheck={studentReport?.reality_check} />

          {/* 8. Your Path Forward */}
          <PathForwardSection pathForward={studentReport?.path_forward} actionPlan={studentReport?.action_plan} />

          {/* 9. If Not This, Then What */}
          <AlternativesSection alternatives={studentReport?.alternatives} />

          {/* 10. Your Next 6–12 Months */}
          <NextSixToTwelveMonthsSection actionPlan={studentReport?.action_plan} realityCheck={studentReport?.reality_check} />
        </>
      )}
    </div>
  );
}
