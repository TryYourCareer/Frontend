import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  HelpCircle,
  Rocket,
  Clock,
  AlertCircle,
} from "lucide-react";
import WorkDNACard from "./WorkDNACard";
import CareerActivitiesList from "./CareerActivitiesList";
import { ClassificationBadge, ProvenanceCard } from "./CareerIntelligenceStatus";
import IntelligenceEmptyState from "./IntelligenceEmptyState";

export default function CareerIntelligenceDetail({
  detailData,
  publishedMission,
  missionLookupError,
  onBack,
  onNavigateFamily,
}) {
  const navigate = useNavigate();

  if (!detailData || !detailData.career) {
    return (
      <IntelligenceEmptyState
        title="Career Not Found"
        description="The requested career could not be found."
        type="error"
        onBack={onBack}
        backLabel="Back to Families"
      />
    );
  }

  const { career, classification, work_dna, activities = [] } = detailData;
  const isUnclassified = !classification && !work_dna && activities.length === 0;

  return (
    <div className="space-y-8" data-testid="career-intelligence-detail-view">
      {/* Navigation Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-white/80 px-3 py-1.5 rounded-xl border border-[#e2d9c8] transition hover:bg-white"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        {classification?.family_key && (
          <>
            <span className="text-slate-400">/</span>
            <button
              type="button"
              onClick={() => onNavigateFamily?.(classification.family_key)}
              className="text-slate-700 hover:text-[#0b1a36] hover:underline"
            >
              {classification.family_name || classification.family_key}
            </button>
          </>
        )}

        <span className="text-slate-400">/</span>
        <span className="text-slate-900 font-bold">{career.name}</span>
      </div>

      {/* Section A: Career Identity Header */}
      <div className="bg-white/80 rounded-3xl p-8 border border-[#e2d9c8] shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF2DB] text-slate-800 border border-[#e2d9c8]">
                Career Profile
              </span>
              {career.sector_name && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {career.sector_name}
                </span>
              )}
              {classification?.status && (
                <ClassificationBadge status={classification.status} />
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {career.name}
            </h1>

            {career.one_liner && (
              <p className="text-base font-semibold text-slate-800">
                {career.one_liner}
              </p>
            )}

            {career.description && (
              <p className="text-sm text-slate-600 leading-relaxed pt-1">
                {career.description}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:items-end gap-2 text-xs font-mono text-slate-500 bg-[#FAF2DB]/40 px-3 py-2 rounded-xl border border-[#e2d9c8]">
            <span>slug: {career.slug}</span>
            {career.id && <span className="text-[10px] text-slate-400">id: {career.id}</span>}
          </div>
        </div>

        {/* Action Block: Trial Mission Connection */}
        <div className="pt-4 border-t border-slate-200/80" data-testid="trial-mission-action-block">
          {publishedMission ? (
            /* Case 1: Published Mission Exists */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#fbf9f4] border border-[#e8dfc8]">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  Live Simulation Available
                </span>
                <p className="text-sm font-semibold text-slate-800" data-testid="published-mission-title">
                  Mission: {publishedMission.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/trial-mission?missionId=${encodeURIComponent(publishedMission.id)}`)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b1a36] text-white text-sm font-bold shadow-sm transition hover:bg-[#142447] focus:outline-none focus:ring-2 focus:ring-[#0b1a36]/30"
                aria-label={`Try a Trial Mission: ${publishedMission.title}`}
                data-testid="try-trial-mission-cta"
              >
                <Rocket size={16} />
                <span>Try a Trial Mission</span>
              </button>
            </div>
          ) : missionLookupError ? (
            /* Case 3: Mission Lookup Failed / Unavailable */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <AlertCircle size={15} className="text-slate-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700" data-testid="trial-mission-unavailable-badge">
                    Trial Mission availability unavailable
                  </span>
                </div>
                <p className="text-xs text-slate-500" data-testid="trial-mission-unavailable-text">
                  Unable to determine Trial Mission availability right now.
                </p>
              </div>
            </div>
          ) : (
            /* Case 2: Mission Lookup Succeeded & No Published Mission */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Clock size={15} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700" data-testid="trial-mission-coming-soon-badge">
                    Trial Mission coming soon
                  </span>
                </div>
                <p className="text-xs text-slate-500" data-testid="trial-mission-coming-soon-text">
                  A simulated work mission for this career is currently in development.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unclassified Notice if applicable */}
      {isUnclassified ? (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-6 text-center space-y-3" data-testid="unclassified-state-box">
          <div className="flex justify-center text-amber-600">
            <HelpCircle size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Career Intelligence Pending
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Career intelligence (Family Classification, Work DNA, and empirical Professional Activities) is not yet available for this career.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 2-Column Section for Family & Work DNA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Section B: Career Family Classification */}
            <div className="bg-white/90 rounded-2xl p-6 border border-[#e2d9c8] shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[#FAF2DB] border border-[#e2d9c8] flex items-center justify-center text-slate-800">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Career Family
                    </h3>
                    <p className="text-xs text-slate-500">Taxonomy Domain Classification</p>
                  </div>
                </div>

                {classification?.status && (
                  <ClassificationBadge status={classification.status} />
                )}
              </div>

              {classification ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#fbf9f4] border border-[#e8dfc8] space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-slate-900">
                        {classification.family_name || classification.family_key}
                      </h4>
                      {classification.family_key && onNavigateFamily && (
                        <button
                          type="button"
                          onClick={() => onNavigateFamily(classification.family_key)}
                          className="text-xs font-semibold text-[#0b1a36] hover:underline"
                        >
                          View Family
                        </button>
                      )}
                    </div>
                    {classification.family_description && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {classification.family_description}
                      </p>
                    )}
                  </div>

                  {classification.rationale && (
                    <div className="p-4 rounded-xl bg-[#FAF2DB]/50 border border-[#e2d9c8] space-y-1">
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Classification Rationale
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {classification.rationale}
                      </p>
                    </div>
                  )}

                  <ProvenanceCard
                    reviewedBy={classification.reviewed_by}
                    reviewedAt={classification.sme_reviewed_at}
                    label="Classification Provenance"
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Not classified into a Career Family.
                </p>
              )}
            </div>

            {/* Section C: Work DNA */}
            {work_dna ? (
              <WorkDNACard workDna={work_dna} />
            ) : (
              <div className="bg-white/90 rounded-2xl p-6 border border-[#e2d9c8] shadow-sm text-center">
                <p className="text-xs text-slate-500 italic">
                  Work DNA profile not yet completed for this career.
                </p>
              </div>
            )}
          </div>

          {/* Section D: Professional Activities */}
          <CareerActivitiesList activities={activities} />
        </div>
      )}
    </div>
  );
}
