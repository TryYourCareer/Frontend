import React, { useState, useMemo } from 'react';
import {
  HeartPulse,
  Activity,
  User,
  AlertTriangle,
  Stethoscope,
  FileText,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  Bed,
  Thermometer,
  Pill,
  ClipboardList
} from 'lucide-react';
import WorkspaceHeader from './shared/WorkspaceHeader';
import ResourceInspectorPanel from './shared/ResourceInspectorPanel';
import WorkingNotesPanel from './shared/WorkingNotesPanel';
import FindingComposer from './shared/FindingComposer';
import WorkspaceTaskChecklistPanel from './shared/WorkspaceTaskChecklistPanel';

export function getVitalStatusBadge(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'critical' || s === 'emergency' || s === 'danger') {
    return {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-500 animate-pulse',
      label: 'Critical'
    };
  }
  if (s === 'warning' || s === 'elevated' || s === 'abnormal' || s === 'moderate') {
    return {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400',
      label: 'Warning'
    };
  }
  return {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
    label: 'Normal'
  };
}

export function getObservationStatusBadge(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'critical' || s === 'danger') {
    return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  }
  if (s === 'abnormal' || s === 'warning') {
    return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  }
  return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
}

export default function ClinicalEncounterWorkspace({
  session,
  configuration,
  manager = {},
  briefing = {},
  resources = [],
  accessedResourceIds = new Set(),
  activeResource = null,
  setActiveResource = () => {},
  handleAccessResource = () => {},
  notesValue = '',
  setNotesValue = () => {},
  notesStatus = 'saved',
  findings = [],
  findingsList,
  workspaceLoading = false,
  showFindingForm: externalShowFindingForm,
  setShowFindingForm: externalSetShowFindingForm,
  findingStatement: externalFindingStatement,
  setFindingStatement: externalSetFindingStatement,
  findingResource: externalFindingResource,
  setFindingResource: externalSetFindingResource,
  findingExplanation: externalFindingExplanation,
  setFindingExplanation: externalSetFindingExplanation,
  findingUncertainty: externalFindingUncertainty,
  setFindingUncertainty: externalSetFindingUncertainty,
  handleSaveNewFinding = () => {},
  handleCompleteInvestigation = () => {},
  requiredFindingsCount = 0,
  requiredResourceAccess = [],
  actionLoading = false,
  isCompletingInvestigation = false
}) {
  const effectiveFindings = findingsList || findings || [];
  const rawWorkspace = configuration?.workspace || {};

  // Extract patient metadata
  const patient = useMemo(() => {
    return (
      rawWorkspace.patient || {
        name: 'Patient (Unspecified)',
        age: 'N/A',
        gender: 'Unspecified',
        setting: 'Acute Inpatient Ward',
        chief_complaint: 'Clinical assessment required',
        admission_diagnosis: 'Medical/Surgical Inpatient',
        allergies: ['No Known Drug Allergies (NKDA)'],
        code_status: 'Full Code',
        relevant_history: 'None documented'
      }
    );
  }, [rawWorkspace.patient]);

  // Extract vitals stream
  const vitals = useMemo(() => {
    return Array.isArray(rawWorkspace.vitals) ? rawWorkspace.vitals : [];
  }, [rawWorkspace.vitals]);

  // Extract bedside observations
  const observations = useMemo(() => {
    return Array.isArray(rawWorkspace.observations) ? rawWorkspace.observations : [];
  }, [rawWorkspace.observations]);

  // Early warning score / primary indicator if configured
  const scoreIndicator = useMemo(() => {
    return rawWorkspace.score_indicator || rawWorkspace.early_warning_score || null;
  }, [rawWorkspace]);

  // Tab state for clinical center panel: 'vitals' | 'observations' | 'evidence'
  const [activeTab, setActiveTab] = useState('vitals');

  // Internal finding form fallback state
  const [internalShowFindingForm, setInternalShowFindingForm] = useState(false);
  const [internalStatement, setInternalStatement] = useState('');
  const [internalResource, setInternalResource] = useState('');
  const [internalExplanation, setInternalExplanation] = useState('');
  const [internalUncertainty, setInternalUncertainty] = useState('');

  const isFormOpen =
    externalShowFindingForm !== undefined
      ? externalShowFindingForm
      : internalShowFindingForm;
  const setIsFormOpen = externalSetShowFindingForm || setInternalShowFindingForm;

  const fStatement =
    externalFindingStatement !== undefined
      ? externalFindingStatement
      : internalStatement;
  const setFStatement = externalSetFindingStatement || setInternalStatement;

  const fResource =
    externalFindingResource !== undefined
      ? externalFindingResource
      : internalResource;
  const setFResource = externalSetFindingResource || setInternalResource;

  const fExplanation =
    externalFindingExplanation !== undefined
      ? externalFindingExplanation
      : internalExplanation;
  const setFExplanation = externalSetFindingExplanation || setInternalExplanation;

  const fUncertainty =
    externalFindingUncertainty !== undefined
      ? externalFindingUncertainty
      : internalUncertainty;
  const setFUncertainty = externalSetFindingUncertainty || setInternalUncertainty;

  // Normalize accessedResourceIds
  const safeAccessedResourceIds = useMemo(() => {
    if (accessedResourceIds instanceof Set) return accessedResourceIds;
    if (Array.isArray(accessedResourceIds)) return new Set(accessedResourceIds);
    return new Set();
  }, [accessedResourceIds]);

  // Checklist requirements
  const investigationConfig = configuration?.investigation || {};
  const completionRules = investigationConfig.completion || {};
  const effectiveRequiredFindingsCount =
    requiredFindingsCount || completionRules.required_findings || 0;
  const effectiveRequiredResourceAccess =
    (requiredResourceAccess && requiredResourceAccess.length > 0)
      ? requiredResourceAccess
      : (completionRules.required_resource_access || []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 py-6" data-testid="clinical-encounter-workspace">
      {/* 1. Header & Context */}
      <WorkspaceHeader
        title={rawWorkspace.title || configuration?.title || 'Clinical Encounter Workspace'}
        phaseName="Clinical Investigation & Telemetry"
        badgeText="Clinical Encounter"
      />

      {/* 2. Patient Banner / Presentation Strip */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg backdrop-blur-md flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight" data-testid="patient-name">
                  {patient.name}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {patient.age} yrs • {patient.gender}
                </span>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800 flex items-center gap-1.5">
                  <Bed className="w-3 h-3" />
                  {patient.setting}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                <span className="font-medium text-slate-300">Admission Dx:</span> {patient.admission_diagnosis}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center flex-wrap">
            {scoreIndicator && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-2 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <div className="text-xs font-bold">
                  <span className="text-amber-400/80 mr-1.5 uppercase tracking-wider text-[10px]">{scoreIndicator.label}:</span>
                  <span>{scoreIndicator.value}</span>
                </div>
              </div>
            )}
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-300 flex items-center gap-1.5 text-xs font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>Code Status: <strong className="text-white">{patient.code_status}</strong></span>
            </div>
          </div>
        </div>

        {/* Clinical alerts & chief complaint sub-strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-cyan-400" /> Chief Complaint
            </span>
            <p className="text-slate-200 font-medium leading-snug">
              {patient.chief_complaint}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Pill className="w-3 h-3 text-rose-400" /> Documented Allergies
            </span>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {Array.isArray(patient.allergies) && patient.allergies.length > 0 ? (
                patient.allergies.map((allg, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300 text-[11px] font-medium">
                    {allg}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">None documented</span>
              )}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <ClipboardList className="w-3 h-3 text-blue-400" /> Relevant History
            </span>
            <p className="text-slate-300 leading-snug truncate" title={patient.relevant_history || 'None documented'}>
              {patient.relevant_history || 'None documented'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Grid: Left Column (Telemetry & Clinical Evidence) vs Right Column (Findings & Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): Telemetry, Bedside Observations, and Evidence Documents */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Navigation Tabs for Center Clinical Panel */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <button
              onClick={() => setActiveTab('vitals')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'vitals'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              data-testid="tab-vitals"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              Vitals & Telemetry ({vitals.length})
            </button>
            <button
              onClick={() => setActiveTab('observations')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'observations'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              data-testid="tab-observations"
            >
              <Activity className="w-3.5 h-3.5" />
              Physical Observations ({observations.length})
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'evidence'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              data-testid="tab-evidence"
            >
              <FileText className="w-3.5 h-3.5" />
              Clinical Records ({resources.length})
            </button>
          </div>

          {/* TAB 1: Continuous Vitals Telemetry Monitor */}
          {activeTab === 'vitals' && (
            <div className="flex flex-col gap-3" data-testid="vitals-panel">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Continuous Bedside Telemetry Stream</span>
                <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry Feed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vitals.map((vital) => {
                  const badge = getVitalStatusBadge(vital.status);
                  return (
                    <div
                      key={vital.id}
                      className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-2 shadow-sm"
                      data-testid={`vital-card-${vital.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-300 truncate">
                          {vital.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase flex items-center gap-1.5 ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 my-1">
                        <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                          {vital.value}
                        </span>
                        {vital.unit && (
                          <span className="text-xs font-semibold text-slate-400 font-mono">
                            {vital.unit}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                        {vital.target_range && (
                          <span>
                            <strong className="text-slate-300">Target:</strong> {vital.target_range}
                          </span>
                        )}
                        {vital.trend && (
                          <span className="text-slate-400 font-mono">
                            Trend: {vital.trend}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Bedside Physical Observations */}
          {activeTab === 'observations' && (
            <div className="flex flex-col gap-3" data-testid="observations-panel">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Systematic Physical Assessment & Observations</span>
                <span className="text-[11px] text-slate-400">Click observation to cite in clinical finding</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {observations.map((obs, idx) => {
                  const badgeClass = getObservationStatusBadge(obs.status);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setFStatement(`Clinical observation in ${obs.system}: ${obs.finding}`);
                        setIsFormOpen(true);
                      }}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm group"
                      data-testid={`observation-item-${idx}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-slate-800 text-slate-300 shrink-0 group-hover:text-cyan-300 transition-colors">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              {obs.system}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase ${badgeClass}`}
                            >
                              {obs.status || 'abnormal'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {obs.finding}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium shrink-0 self-end sm:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Add Finding</span>
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Clinical Evidence Records & Inspector */}
          {activeTab === 'evidence' && (
            <div className="flex-1 flex flex-col min-h-[400px]" data-testid="evidence-panel">
              <ResourceInspectorPanel
                resources={resources}
                activeResource={activeResource}
                accessedResourceIds={safeAccessedResourceIds}
                onSelectResource={(res) => {
                  setActiveResource(res);
                  handleAccessResource(res.id);
                }}
              />
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Findings, Working Notes & Task Checklist */}
        <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">
          
          {/* Finding Composer */}
          <FindingComposer
            findings={effectiveFindings}
            resources={resources}
            showFindingForm={isFormOpen}
            setShowFindingForm={setIsFormOpen}
            findingStatement={fStatement}
            setFindingStatement={setFStatement}
            findingResource={fResource}
            setFindingResource={setFResource}
            findingExplanation={fExplanation}
            setFindingExplanation={setFExplanation}
            findingUncertainty={fUncertainty}
            setFindingUncertainty={setFUncertainty}
            handleSaveNewFinding={handleSaveNewFinding}
            actionLoading={actionLoading}
            workspaceLoading={workspaceLoading}
            title="Synthesized Clinical Findings"
            description="Synthesized evidence-backed clinical findings submitted for your care plan."
            statementPlaceholder="e.g., Arterial blood gas confirms severe refractory lactic acidosis and acute lung injury."
          />

          {/* Working Clinical Notes Panel */}
          <div className="flex-1 min-h-[220px]">
            <WorkingNotesPanel
              notesValue={notesValue}
              setNotesValue={setNotesValue}
              notesStatus={notesStatus}
            />
          </div>

          {/* Task Checklist & Investigation Completion */}
          <WorkspaceTaskChecklistPanel
            manager={manager}
            briefing={briefing}
            findings={effectiveFindings}
            requiredFindingsCount={effectiveRequiredFindingsCount}
            accessedResourceIds={safeAccessedResourceIds}
            requiredResourceAccess={effectiveRequiredResourceAccess}
            handleCompleteInvestigation={handleCompleteInvestigation}
            actionLoading={actionLoading || isCompletingInvestigation}
            isInvestigationPhase={true}
            defaultManagerName="Attending Physician"
            defaultManagerTitle="Clinical Preceptor"
            defaultTask="Review vitals, examine bedside physical observations, inspect clinical records, and record key clinical findings."
          />
        </div>
      </div>
    </div>
  );
}
