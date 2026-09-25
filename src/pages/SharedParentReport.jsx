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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white" data-testid="shared-parent-report-container">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Security & Access Banner */}
        <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 backdrop-blur flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Secure Parent View</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">Read-Only</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Shared privately with you. Direct assessment evidence and student notes are isolated.
              </p>
            </div>
          </div>
          {expiresAt && (
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Valid through {expiresAt}</span>
            </div>
          )}
        </div>

        {/* Report Header */}
        <header className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executive Parent Briefing</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {careerName}
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
                A verified breakdown of career viability, return on investment, AI durability, and backup pathways.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Evidence Complete</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
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
        {parent.evidence && (
          <section data-testid="shared-parent-evidence">
            <ParentEvidenceSection evidence={parent.evidence} />
          </section>
        )}

        {/* Section 3: Comparative Analysis */}
        {parent.comparisons && (
          <section data-testid="shared-parent-comparisons">
            <ParentHowThisComparesSection comparisons={parent.comparisons} />
          </section>
        )}

        {/* Section 4: AI Preparedness */}
        {parent.ai_preparedness && (
          <section data-testid="shared-parent-ai">
            <ParentAIPreparednessSection aiPreparedness={parent.ai_preparedness} />
          </section>
        )}

        {/* Section 5: Financial Realities & ROI */}
        {parent.financial_realities && (
          <section data-testid="shared-parent-financial">
            <ParentFinancialSection financial={parent.financial_realities} />
          </section>
        )}

        {/* Section 6: Backup Pathways */}
        {parent.backup_pathways && (
          <section data-testid="shared-parent-backup">
            <ParentIfItDoesntWorkOutSection backupPathways={parent.backup_pathways} />
          </section>
        )}

        {/* Section 7: Parent FAQ */}
        {parent.faq && (
          <section data-testid="shared-parent-faq">
            <ParentFAQSection faq={parent.faq} parentReport={parent} reportData={parent} />
          </section>
        )}

        {/* Section 8: What Child Needs */}
        {parent.what_child_needs && (
          <section data-testid="shared-parent-what-child-needs">
            <ParentWhatChildNeedsSection whatChildNeeds={parent.what_child_needs} />
          </section>
        )}

        {/* Section 9: Executive Bottom Line */}
        {parent.bottom_line && (
          <section data-testid="shared-parent-bottom-line">
            <ParentBottomLineSection bottomLine={parent.bottom_line} />
          </section>
        )}

        {/* Read-Only Footer */}
        <footer className="pt-8 pb-12 border-t border-slate-900 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TryYourCareer. Shared under secure read-only token.</p>
        </footer>
      </div>
    </div>
  );
}
