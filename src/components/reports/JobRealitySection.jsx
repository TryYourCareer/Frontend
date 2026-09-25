import React from 'react';
import {
  Briefcase,
  Clock,
  Globe2,
  CheckCircle2,
  Sparkles,
  Layers,
  Dna,
  Award,
  FileText,
  Check
} from 'lucide-react';

/**
 * Format internal Work DNA keys into human-readable dimension names.
 */
function formatWorkDnaName(key) {
  if (!key) return 'Dimension';
  const mapping = {
    cognitive_complexity: 'Cognitive Complexity',
    quantitative_intensity: 'Quantitative Intensity',
    systems_topography: 'Systems Topography',
    visual_spatial_rigor: 'Visual-Spatial Rigor',
    uncertainty_ambiguity: 'Uncertainty & Ambiguity',
  };
  return mapping[key] || String(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Format frequency values safely.
 */
function formatFrequency(freq) {
  if (freq === null || freq === undefined) return null;
  if (typeof freq === 'number') return `Level ${freq} Frequency`;
  return String(freq);
}

/**
 * Format importance values safely.
 */
function formatImportance(imp) {
  if (imp === null || imp === undefined) return null;
  if (typeof imp === 'number') return `${imp}/5`;
  return String(imp);
}

export default function JobRealitySection({ jobReality }) {
  if (!jobReality) {
    return (
      <div className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 text-center space-y-2 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          04 — What the Job Actually Looks Like
        </h3>
        <p className="text-xs text-slate-400">
          Job reality and occupational evidence is not available yet.
        </p>
      </div>
    );
  }

  const {
    real_world_impact,
    day_in_the_life,
    common_activities = [],
    trialable_activities = [],
    work_activities,
    description,
    one_liner,
    work_dna,
    required_competencies = [],
    competencies = [],
    provenance,
    evidence_status,
  } = jobReality;

  // Activities resolution
  const activitiesList = Array.isArray(common_activities) && common_activities.length > 0
    ? common_activities
    : Array.isArray(work_activities) && work_activities.length > 0
    ? work_activities
    : [];

  const trialableList = Array.isArray(trialable_activities) && trialable_activities.length > 0
    ? trialable_activities
    : activitiesList.filter((a) => a && (a.trialable === true || String(a.trialability_tier).toUpperCase() === 'HIGH'));

  // Competencies resolution
  const compList = Array.isArray(required_competencies) && required_competencies.length > 0
    ? required_competencies
    : Array.isArray(competencies) && competencies.length > 0
    ? competencies
    : [];

  // Day in the life resolution
  let parsedDaySchedule = [];
  let dayNarrative = null;
  if (typeof day_in_the_life === 'string') {
    try {
      const parsed = JSON.parse(day_in_the_life);
      if (Array.isArray(parsed)) {
        parsedDaySchedule = parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        parsedDaySchedule = Object.entries(parsed).map(([k, v]) => ({ time: k, activity: typeof v === 'string' ? v : JSON.stringify(v) }));
      } else {
        dayNarrative = day_in_the_life;
      }
    } catch {
      dayNarrative = day_in_the_life;
    }
  } else if (Array.isArray(day_in_the_life)) {
    parsedDaySchedule = day_in_the_life;
  } else if (typeof day_in_the_life === 'object' && day_in_the_life !== null) {
    parsedDaySchedule = Object.entries(day_in_the_life).map(([k, v]) => ({ time: k, activity: typeof v === 'string' ? v : JSON.stringify(v) }));
  }

  // Work DNA resolution
  const hasWorkDna = work_dna && typeof work_dna === 'object' && Object.keys(work_dna).length > 0;
  const workDnaEntries = hasWorkDna
    ? Object.entries(work_dna).filter(([k, v]) => k !== 'availability_status' && k !== 'status' && k !== 'rationale' && v !== null && v !== undefined)
    : [];

  return (
    <section aria-labelledby="job-reality-heading" className="bg-white border border-[#D3E3F5] rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E88E5] border border-blue-200 text-xs font-bold uppercase tracking-wider">
            <Briefcase size={13} />
            <span>04 — Job Reality</span>
          </div>
          <h2 id="job-reality-heading" className="text-xl sm:text-2xl font-black text-[#0b1a36] tracking-tight">
            What the Job Actually Looks Like
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            An objective breakdown of daily operational realities, core work activities, occupational demands, and simulated tasks for this career.
          </p>
        </div>

        {evidence_status && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 shrink-0">
            <Sparkles size={14} className="text-[#1E88E5]" />
            <span>Occupational Profile Verified</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Real-World Impact & Role Overview                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Globe2 size={16} className="text-[#1E88E5]" />
          Real-World Impact & Purpose
        </h3>

        {real_world_impact || description || one_liner ? (
          <div className="bg-gradient-to-br from-[#F0F6FC] to-[#e8f1fa] border border-[#D3E3F5] rounded-2xl p-5 sm:p-6 space-y-3">
            {one_liner && (
              <p className="text-sm sm:text-base font-bold text-[#0b1a36] leading-snug">
                {one_liner}
              </p>
            )}
            {real_world_impact && (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {real_world_impact}
              </p>
            )}
            {!real_world_impact && description && (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500">
            No occupational impact description is available yet.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Day in the Life                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Clock size={16} className="text-[#1E88E5]" />
          Day-to-Day Workflow & Schedule
        </h3>

        {parsedDaySchedule.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {parsedDaySchedule.map((item, idx) => {
              const isObj = typeof item === 'object' && item !== null;
              const timeLabel = isObj ? (item.time || item.period || item.hour || item.phase || `Step ${idx + 1}`) : null;
              const textContent = isObj ? (item.activity || item.task || item.description || item.title || JSON.stringify(item)) : String(item);

              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 hover:border-[#D3E3F5] transition shadow-2xs">
                  {timeLabel && (
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E88E5] text-[11px] font-bold">
                      {timeLabel}
                    </div>
                  )}
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {textContent}
                  </p>
                </div>
              );
            })}
          </div>
        ) : dayNarrative ? (
          <div className="bg-[#F0F6FC] border border-[#D3E3F5] rounded-2xl p-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {dayNarrative}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500">
            A structured daily schedule is not yet available for this role.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Common Occupational Activities                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Layers size={16} className="text-[#1E88E5]" />
          Key Work Activities ({activitiesList.length})
        </h3>

        {activitiesList.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {activitiesList.map((act, idx) => {
              const title = act?.title || act?.activity_name || act?.name || `Occupational Task ${idx + 1}`;
              const desc = act?.description || null;
              const category = act?.category || act?.activity_type || null;
              const importance = formatImportance(act?.importance || act?.importance_level || act?.importance_score);
              const frequency = formatFrequency(act?.frequency || act?.frequency_level || act?.frequency_score);
              const isTrialable = act?.trialable === true || String(act?.trialability_tier).toUpperCase() === 'HIGH';

              return (
                <div
                  key={idx}
                  className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2 hover:bg-white hover:border-[#D3E3F5] transition shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-[#0b1a36] leading-snug">
                        {title}
                      </h4>
                      {category && (
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                          {category}
                        </span>
                      )}
                    </div>
                    {isTrialable && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                        <CheckCircle2 size={11} />
                        <span>Simulated in Mission</span>
                      </span>
                    )}
                  </div>

                  {desc && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {desc}
                    </p>
                  )}

                  {(importance || frequency) && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 text-[11px] text-slate-600">
                      {importance && (
                        <span className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 font-medium">
                          Importance: <strong className="text-slate-800">{importance}</strong>
                        </span>
                      )}
                      {frequency && (
                        <span className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 font-medium">
                          Frequency: <strong className="text-slate-800">{frequency}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500">
            No occupational activities are currently recorded for this career.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Trialable Activities / Hands-on Exposure                         */}
      {/* ------------------------------------------------------------------ */}
      {trialableList.length > 0 && (
        <div className="space-y-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <Sparkles size={16} className="text-emerald-700" />
            <span>Hands-On Trialable Tasks ({trialableList.length})</span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            The following activities represent core operational tasks that are directly trialable within our simulation environment:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {trialableList.map((t, idx) => {
              const title = t?.title || t?.activity_name || t?.name || 'Simulation Task';
              return (
                <span
                  key={idx}
                  className="bg-white text-emerald-950 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs inline-flex items-center gap-1.5"
                >
                  <Check size={13} className="text-emerald-600" />
                  {title}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. Work DNA Attributes                                             */}
      {/* ------------------------------------------------------------------ */}
      {workDnaEntries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Dna size={16} className="text-[#1E88E5]" />
            Occupational Work DNA Profile
          </h3>
          <p className="text-xs text-slate-600">
            Authoritative cognitive and operational demands defined for this discipline:
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workDnaEntries.map(([key, val]) => (
              <div
                key={key}
                className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-3.5 space-y-1.5"
              >
                <span className="text-xs font-bold text-[#0b1a36] block">
                  {formatWorkDnaName(key)}
                </span>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Rating / Intensity:</span>
                  <span className="font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                    {typeof val === 'number' ? `${val} / 5` : String(val)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 6. Required Competencies                                           */}
      {/* ------------------------------------------------------------------ */}
      {compList.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Award size={16} className="text-[#1E88E5]" />
            Core Required Competencies ({compList.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {compList.map((comp, idx) => {
              const title = typeof comp === 'string' ? comp : comp?.title || comp?.name || 'Competency';
              return (
                <span
                  key={idx}
                  className="bg-[#F0F6FC] text-[#0b1a36] font-bold text-xs px-3 py-1.5 rounded-xl border border-[#D3E3F5] inline-flex items-center gap-1.5"
                >
                  <Award size={13} className="text-[#1E88E5]" />
                  {title}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 7. Provenance / Verification                                       */}
      {/* ------------------------------------------------------------------ */}
      {provenance && (
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <FileText size={13} className="text-slate-400" />
          <span>Occupational evidence source: {typeof provenance === 'string' ? provenance : (provenance.source || 'Industry Taxonomy v2.1')}</span>
        </div>
      )}
    </section>
  );
}
