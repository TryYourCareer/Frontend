import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Sparkles,
  AlertTriangle,
  Lock,
  Clock,
  CheckCircle2,
  Calendar
} from "lucide-react";
import reportsService, { getPublicSharedParentReport } from "../services/reports";

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
import SEO from "../components/SEO";

export default function SharedParentReport() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedReport = async () => {
      if (!token) {
        setError("Invalid or missing share link token.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const fn = getPublicSharedParentReport || reportsService?.getPublicSharedParentReport;
        const res = await fn(token);
        if (res && res.parent_report) {
          setReportData(res);
        } else if (res && res.snapshot) {
          // Direct parent report structure
          setReportData({ parent_report: res, career_id: res.career_id, report_version: res.report_version });
        } else {
          setError("Report data is unavailable or could not be loaded.");
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 404 || status === 410) {
          setError(err.response?.data?.detail || "This shared report link is expired or does not exist.");
        } else {
          setError(err.message || "Unable to load shared report. Please check your link.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSharedReport();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6" data-testid="shared-parent-loading">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Loading secure parent report...</p>
      </div>
    );
  }

  if (error || !reportData?.parent_report) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6" data-testid="shared-parent-error">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied or Expired</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {error || "This parent report link is no longer active or the share token is invalid."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md hover:shadow-indigo-500/25"
          >
            Go to TryYourCareer
          </Link>
        </div>
      </div>
    );
  }

  const parent = reportData.parent_report;
  const careerName = reportData.career_title || parent.career_name || reportData.career_id || "Career Option";
  const expiresAt = reportData.expires_at ? new Date(reportData.expires_at).toLocaleDateString() : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#1E88E5] selection:text-white" data-testid="shared-parent-report-container">
      <SEO
        title={`Career Brief: ${careerName}`}
        description="Private student career report shared securely."
        noindex={true}
      />
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Security & Access Banner */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Secure Parent View</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-200 shadow-2xs">Read-Only</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Shared privately with you. Direct assessment answers and student notes are isolated.
              </p>
            </div>
          </div>
          {expiresAt && (
            <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-emerald-200/70 shadow-2xs shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Valid through {expiresAt}</span>
            </div>
          )}
        </div>

        {/* Report Header */}
        <header className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-[#1E88E5] text-xs font-bold mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executive Parent Briefing</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0b1a36] tracking-tight">
                {careerName}
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                A verified breakdown of career viability, return on investment, AI durability, and backup pathways.
              </p>
            </div>
            
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 text-xs font-medium text-slate-500 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Evidence Complete</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Generated {reportData.created_at ? new Date(reportData.created_at).toLocaleDateString() : "Recently"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Section 1: Executive Snapshot */}
        {parent.snapshot && (
          <section data-testid="shared-parent-snapshot">
            <ParentSnapshotSection snapshot={parent.snapshot} />
          </section>
        )}

        {/* Section 2: Verified Evidence */}
        {(parent.evidence || parent.evidence_not_just_enthusiasm) && (
          <section data-testid="shared-parent-evidence">
            <ParentEvidenceSection evidence={parent.evidence_not_just_enthusiasm || parent.evidence} />
          </section>
        )}

        {/* Section 3: Comparative Analysis */}
        {(parent.comparisons || parent.how_this_compares) && (
          <section data-testid="shared-parent-comparisons">
            <ParentHowThisComparesSection howThisCompares={parent.how_this_compares || parent.comparisons} comparisons={parent.comparisons || parent.how_this_compares} />
          </section>
        )}

        {/* Section 4: AI Preparedness */}
        {(parent.ai_preparedness || parent.will_ai_replace_job) && (
          <section data-testid="shared-parent-ai">
            <ParentAIPreparednessSection aiPreparedness={parent.will_ai_replace_job || parent.ai_preparedness} />
          </section>
        )}

        {/* Section 5: Financial Realities & ROI */}
        {(parent.financial_realities || parent.financial_outlook || parent.cost_and_payoff) && (
          <section data-testid="shared-parent-financial">
            <ParentFinancialSection financialOutlook={parent.financial_outlook || parent.financial_realities || parent.cost_and_payoff} financial={parent.financial_realities} />
          </section>
        )}

        {/* Section 6: Backup Pathways */}
        {(parent.backup_pathways || parent.if_it_doesnt_work_out) && (
          <section data-testid="shared-parent-backup">
            <ParentIfItDoesntWorkOutSection ifItDoesntWorkOut={parent.if_it_doesnt_work_out || parent.backup_pathways} backupPathways={parent.backup_pathways} />
          </section>
        )}

        {/* Section 7: Parent FAQ */}
        {(parent.faq || parent.parent_faq) && (
          <section data-testid="shared-parent-faq">
            <ParentFAQSection parentFaq={parent.parent_faq || parent.faq} faq={parent.faq || parent.parent_faq} parentReport={parent} reportData={parent} />
          </section>
        )}

        {/* Section 8: What Child Needs */}
        {parent.what_child_needs && (
          <section data-testid="shared-parent-what-child-needs">
            <ParentWhatChildNeedsSection whatChildNeeds={parent.what_child_needs} />
          </section>
        )}

        {/* Section 9: Executive Bottom Line */}
        {(parent.bottom_line || parent.executive_bottom_line) && (
          <section data-testid="shared-parent-bottom-line">
            <ParentBottomLineSection bottomLine={parent.bottom_line || parent.executive_bottom_line} executiveBottomLine={parent.executive_bottom_line} />
          </section>
        )}

        {/* Read-Only Footer */}
        <footer className="pt-6 pb-12 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TryYourCareer. Shared under secure read-only token.</p>
        </footer>
      </div>
    </div>
  );
}
