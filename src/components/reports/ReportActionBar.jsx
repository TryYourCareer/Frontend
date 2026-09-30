import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Share2,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
  FileText,
  Users,
  Layers,
  UserCheck
} from "lucide-react";
import reportsService, {
  exportReportPdf,
  getExportStatus,
  createParentShareLink
} from "../../services/reports";
import BACKEND_BASE_URL from "../../API/BaseURL";

/**
 * Safely resolves a share URL or token to a complete absolute URL using the runtime origin.
 */
export function toAbsoluteShareUrl(rawUrl, token) {
  if (!rawUrl && !token) return "";
  const target = rawUrl || `/shared/parent/${token}`;
  if (/^https?:\/\//i.test(target)) {
    return target;
  }
  const origin =
    (typeof window !== "undefined" && window.location?.origin) ||
    (typeof window !== "undefined" && window.location?.protocol && window.location?.host
      ? `${window.location.protocol}//${window.location.host}`
      : "");
  const path = target.startsWith("/") ? target : `/${target}`;
  return `${origin}${path}`;
}

/**
 * Resolves a download URL (relative backend API path or absolute URL) to a complete backend URL.
 * Never resolves backend download routes against window.location.origin.
 */
export function toBackendDownloadUrl(rawUrl) {
  if (!rawUrl) return "";
  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }
  const base = (BACKEND_BASE_URL || "").replace(/\/+$/, "");
  const path = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  return `${base}${path}`;
}

/**
 * Generates an appropriate descriptive PDF filename based on career and export type.
 */
export function getExportFilename(careerName, type) {
  const safeName = (careerName || "Career")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const typeTag =
    type === "parent"
      ? "parent-briefing"
      : type === "student"
      ? "student-report"
      : "full-report";
  return `${safeName || "career"}-${typeTag}.pdf`;
}

/**
 * Triggers a browser file download safely without leaving orphan DOM elements.
 */
export function triggerBrowserDownload(urlOrBlob, filename = "career_report.pdf") {
  if (!urlOrBlob) return;

  if (typeof urlOrBlob === "string") {
    const link = document.createElement("a");
    link.href = urlOrBlob;
    link.setAttribute("download", filename);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body && document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 250);
  } else if (urlOrBlob instanceof Blob) {
    const blobUrl = window.URL.createObjectURL(urlOrBlob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body && document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(blobUrl);
    }, 250);
  }
}

/**
 * ReportActionBar
 * Production PDF Export & Secure Parent Read-Only Sharing
 */
export default function ReportActionBar({
  reportType = "student",
  activeView,
  onViewChange,
  careerName = "Career Option",
  careerId = "",
  isTeaser = false,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exportingType, setExportingType] = useState(null); // 'student' | 'parent' | 'both'
  const [exportJob, setExportJob] = useState(null);
  const [exportError, setExportError] = useState(null);
  const [downloadReadyUrl, setDownloadReadyUrl] = useState(null);

  // Parent Share Modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [shareError, setShareError] = useState(null);
  const [copied, setCopied] = useState(false);

  const pollAttemptsRef = useRef(0);
  const pollTimerRef = useRef(null);

  const currentView = activeView || reportType || "student";

  // Poll export status if in QUEUED, PROCESSING, or PENDING state with timeout protection
  useEffect(() => {
    const isPending =
      exportJob &&
      (exportJob.status === "QUEUED" ||
        exportJob.status === "PROCESSING" ||
        exportJob.status === "PENDING");

    if (isPending) {
      if (pollAttemptsRef.current >= 20) {
        setExportError("PDF generation timed out. Please try again.");
        setExportingType(null);
        setExportJob(null);
        return;
      }

      pollTimerRef.current = setTimeout(async () => {
        try {
          pollAttemptsRef.current += 1;
          const fn = getExportStatus || reportsService?.getExportStatus;
          const statusRes = await fn(exportJob.id);
          setExportJob(statusRes);

          const rawDownloadUrl =
            statusRes?.signed_url ||
            statusRes?.download_url ||
            statusRes?.url ||
            statusRes?.pdf_url;

          const isReady =
            statusRes?.status === "READY" ||
            statusRes?.status === "COMPLETED" ||
            statusRes?.status === "SUCCESS";

          if (isReady) {
            if (rawDownloadUrl) {
              const fullDownloadUrl = toBackendDownloadUrl(rawDownloadUrl);
              setDownloadReadyUrl(fullDownloadUrl);
              triggerBrowserDownload(
                fullDownloadUrl,
                getExportFilename(careerName, exportingType || exportJob.export_type)
              );
            } else {
              setExportError("PDF generation completed, but download URL is missing.");
            }
            setExportingType(null);
            setExportJob(null);
          } else if (statusRes?.status === "FAILED") {
            setExportError(
              statusRes.error_message || statusRes.error || "PDF generation failed on the server."
            );
            setExportingType(null);
            setExportJob(null);
          } else if (
            statusRes?.status !== "QUEUED" &&
            statusRes?.status !== "PROCESSING" &&
            statusRes?.status !== "PENDING"
          ) {
            if (rawDownloadUrl) {
              const fullDownloadUrl = toBackendDownloadUrl(rawDownloadUrl);
              setDownloadReadyUrl(fullDownloadUrl);
              triggerBrowserDownload(
                fullDownloadUrl,
                getExportFilename(careerName, exportingType || exportJob.export_type)
              );
            } else {
              setExportError("Unexpected export job status.");
            }
            setExportingType(null);
            setExportJob(null);
          }
        } catch (err) {
          setExportError(
            err.response?.data?.detail || err.message || "Unable to retrieve export status."
          );
          setExportingType(null);
          setExportJob(null);
        }
      }, 1500);
    }

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, [exportJob, careerName, exportingType]);

  const handleStartExport = async (type) => {
    setDropdownOpen(false);
    setExportError(null);
    setDownloadReadyUrl(null);
    setExportingType(type);
    pollAttemptsRef.current = 0;

    try {
      const fn = exportReportPdf || reportsService?.exportReportPdf;
      const res = await fn(careerId, type);

      if (res instanceof Blob) {
        triggerBrowserDownload(res, getExportFilename(careerName, type));
        setExportingType(null);
        setExportJob(null);
        return;
      }

      const rawDownloadUrl =
        res?.signed_url || res?.download_url || res?.url || res?.pdf_url;
      const isReady =
        res?.status === "READY" ||
        res?.status === "COMPLETED" ||
        res?.status === "SUCCESS";

      if (isReady) {
        if (rawDownloadUrl) {
          const fullDownloadUrl = toBackendDownloadUrl(rawDownloadUrl);
          setDownloadReadyUrl(fullDownloadUrl);
          triggerBrowserDownload(fullDownloadUrl, getExportFilename(careerName, type));
        } else {
          setExportError("PDF generation completed, but download URL is missing.");
        }
        setExportingType(null);
        setExportJob(null);
        return;
      }

      if (res?.status === "FAILED") {
        setExportError(
          res.error_message || res.error || "PDF generation failed on the server."
        );
        setExportingType(null);
        setExportJob(null);
        return;
      }

      const isPending =
        res?.status === "QUEUED" ||
        res?.status === "PROCESSING" ||
        res?.status === "PENDING";

      if (isPending && res?.id) {
        setExportJob(res);
      } else if (rawDownloadUrl) {
        const fullDownloadUrl = toBackendDownloadUrl(rawDownloadUrl);
        setDownloadReadyUrl(fullDownloadUrl);
        triggerBrowserDownload(fullDownloadUrl, getExportFilename(careerName, type));
        setExportingType(null);
        setExportJob(null);
      } else {
        setExportError("Unable to process PDF export request.");
        setExportingType(null);
        setExportJob(null);
      }
    } catch (err) {
      setExportError(
        err.response?.data?.detail || err.message || "Failed to start export job."
      );
      setExportingType(null);
      setExportJob(null);
    }
  };

  const handleOpenShareModal = async () => {
    setShareModalOpen(true);
    setShareLoading(true);
    setShareError(null);
    setCopied(false);

    try {
      const fn = createParentShareLink || reportsService?.createParentShareLink;
      const res = await fn(careerId);
      setShareData(res);
    } catch (err) {
      setShareError(err.response?.data?.detail || err.message || "Failed to generate parent share link.");
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const rawUrl = shareData?.share_url;
    const token = shareData?.token;
    const absoluteUrl = toAbsoluteShareUrl(rawUrl, token);
    if (!absoluteUrl) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(absoluteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else if (navigator?.share) {
        await navigator.share({
          title: `${careerName} - Parent Decision Report`,
          url: absoluteUrl,
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = absoluteUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      setShareError("Could not copy link to clipboard.");
    }
  };

  const counterpartPath =
    currentView === "parent"
      ? `/careers/${careerId}/decision-report`
      : `/careers/${careerId}/parent-report`;

  const counterpartLabel =
    currentView === "parent"
      ? "Switch to Student Decision Report"
      : "Parent Report";

  const targetView = currentView === "parent" ? "student" : "parent";
  const viewToggleTestId = currentView === "parent" ? "student-view-toggle" : "parent-view-toggle";

  return (
    <>
      <div
        className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 py-3 shadow-xs"
        data-testid="report-action-bar"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Provenance Badge */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1E88E5] border border-blue-200">
              Verified Canonical Report
            </span>
            <span className="hidden md:inline text-slate-600">
              {careerName} &bull; v2.1
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            
            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => !isTeaser && setDropdownOpen(!dropdownOpen)}
                disabled={isTeaser || !!exportingType}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs ${
                  isTeaser
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    : "bg-[#1E88E5] hover:bg-blue-600 text-white shadow-blue-500/20"
                }`}
                title={isTeaser ? "Complete Trial Mission to export" : "Export Server PDF"}
                data-testid="export-report-button"
              >
                {exportingType ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>
                  {exportingType
                    ? `Generating ${exportingType}...`
                    : exportJob?.status === "READY"
                    ? "Export Ready"
                    : "Export PDF"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && !isTeaser && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1"
                  data-testid="export-dropdown-menu"
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Select PDF Version
                  </div>
                  <button
                    onClick={() => handleStartExport("student")}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                    data-testid="export-student-pdf-btn"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="text-slate-900">Student Report PDF</div>
                      <div className="text-[10px] text-slate-400 font-normal">Student deep dive & scorecard</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleStartExport("parent")}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                    data-testid="export-parent-pdf-btn"
                  >
                    <Users className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="text-slate-900">Parent Briefing PDF</div>
                      <div className="text-[10px] text-slate-400 font-normal">ROI, AI impact & backup plans</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleStartExport("both")}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition border-t border-slate-100 mt-1"
                    data-testid="export-both-pdf-btn"
                  >
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <div>
                      <div className="text-slate-900">Complete Document</div>
                      <div className="text-[10px] text-slate-400 font-normal">Combined Student + Parent bundle</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Ready Download Link notification */}
            {/* {downloadReadyUrl && (
              <a
                href={downloadReadyUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition animate-bounce"
                data-testid="download-ready-link"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Download PDF</span>
              </a>
            )} */}

            {/* Share with Parent Button */}
            <button
              type="button"
              onClick={handleOpenShareModal}
              disabled={isTeaser}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition shadow-2xs ${
                isTeaser
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300"
              }`}
              title="Create a private read-only link for parents"
              data-testid="share-report-button"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Share with Parent</span>
            </button>

            {/* View Switcher: supports in-place toggle if onViewChange is provided, otherwise Link */}
            {typeof onViewChange === "function" ? (
              <button
                type="button"
                onClick={() => onViewChange(targetView)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-[#1E88E5] transition shadow-2xs"
                data-testid={viewToggleTestId}
                aria-label={counterpartLabel}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#1E88E5]" />
                <span>{counterpartLabel}</span>
              </button>
            ) : (
              <Link
                to={counterpartPath}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-[#1E88E5] transition shadow-2xs"
                data-testid={viewToggleTestId}
                aria-label={counterpartLabel}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#1E88E5]" />
                <span>{counterpartLabel}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Global Export Status / Error Bar */}
        {exportError && (
          <div
            className="max-w-6xl mx-auto mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between"
            data-testid="export-error-notice"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{exportError}</span>
            </div>
            <button onClick={() => setExportError(null)} className="text-red-500 hover:text-red-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Share With Parent Modal */}
      {shareModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          data-testid="share-with-parent-modal"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShareModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
              data-testid="close-share-modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900" data-testid="share-modal-title">
                  Share Report with Parent
                </h3>
                <p className="text-xs text-slate-500">
                  Read-only parent briefing with private student vector isolation
                </p>
              </div>
            </div>

            {shareLoading ? (
              <div className="py-8 text-center text-slate-500 text-sm flex flex-col items-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
                <span>Generating secure expiring token...</span>
              </div>
            ) : shareError ? (
              <div className="py-4 text-center">
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4">
                  {shareError}
                </div>
                <button
                  onClick={handleOpenShareModal}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
                >
                  Retry
                </button>
              </div>
            ) : shareData ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Expiring Read-Only Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={toAbsoluteShareUrl(shareData.share_url, shareData.token)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all focus:outline-none"
                      data-testid="share-link-input"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="shrink-0 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                      data-testid="copy-share-link-btn"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-1.5 bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link Valid For 7 Days</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Parents can view the financial overview, AI risk assessment, and discussion prompts without logging in. Student raw test answers remain private.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
