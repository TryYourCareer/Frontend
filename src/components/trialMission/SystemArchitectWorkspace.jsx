import React, { useState, useMemo } from "react";
import {
  Layers,
  Server,
  Database,
  Globe,
  Shield,
  Activity,
  Zap,
  Radio,
  Check,
  Eye,
  Plus,
  CheckCircle2,
  Rocket,
  Loader2,
  AlertCircle,
  Play,
  RotateCcw,
  ArrowRight,
  Sliders,
  Cpu,
  Network,
  Cloud,
  FileText,
} from "lucide-react";

/**
 * Returns an appropriate Lucide icon component based on component type.
 */
export function getComponentIcon(type) {
  if (!type || typeof type !== "string") return Server;
  const t = type.toLowerCase();
  if (t.includes("database") || t.includes("db") || t.includes("storage") || t.includes("sql")) {
    return Database;
  }
  if (t.includes("dns") || t.includes("gateway") || t.includes("router") || t.includes("edge") || t.includes("cdn")) {
    return Globe;
  }
  if (t.includes("security") || t.includes("firewall") || t.includes("auth") || t.includes("proxy") || t.includes("bastion")) {
    return Shield;
  }
  if (t.includes("queue") || t.includes("stream") || t.includes("kafka") || t.includes("mqtt") || t.includes("broker")) {
    return Radio;
  }
  if (t.includes("cloud") || t.includes("service") || t.includes("api") || t.includes("microservice")) {
    return Cloud;
  }
  if (t.includes("compute") || t.includes("worker") || t.includes("lambda") || t.includes("container")) {
    return Cpu;
  }
  return Server;
}

/**
 * Evaluates deterministic architecture validation rules against canvas state.
 */
export function validateArchitectureState(components, connections, rules = []) {
  if (!Array.isArray(rules) || rules.length === 0) {
    return { passed: true, results: [] };
  }

  const results = rules.map((rule) => {
    const { id, name, type, source, target, min_redundancy, required_region } = rule;
    let satisfied = true;
    let message = "";

    if (type === "require_connection") {
      const exists = connections.some(
        (c) => (c.source === source && c.target === target) || (c.source === target && c.target === source)
      );
      satisfied = exists;
      message = exists
        ? `Connection between [${source}] and [${target}] is verified.`
        : `Missing required connection between [${source}] and [${target}].`;
    } else if (type === "require_redundancy") {
      const matching = components.filter((c) => c.type === rule.component_type && c.status !== "failed");
      const requiredCount = min_redundancy || 2;
      satisfied = matching.length >= requiredCount;
      message = satisfied
        ? `Redundancy target met (${matching.length}/${requiredCount} instances active).`
        : `Insufficient redundancy: only ${matching.length}/${requiredCount} instances active.`;
    } else if (type === "require_region_isolation") {
      const comp = components.find((c) => c.id === rule.component_id);
      satisfied = comp && comp.region === required_region;
      message = satisfied
        ? `Component [${rule.component_id}] correctly isolated in [${required_region}].`
        : `Component [${rule.component_id}] must be located in [${required_region}].`;
    } else if (type === "prohibit_single_point_of_failure") {
      const criticalComps = components.filter((c) => c.is_critical && c.status !== "failed");
      const hasSinglePoint = criticalComps.some((c) => !c.has_standby);
      satisfied = !hasSinglePoint;
      message = satisfied
        ? "No unmitigated single points of failure detected."
        : "Critical component lacks redundant failover replica.";
    }

    return { id: id || name, name: name || type, satisfied, message };
  });

  const passed = results.every((r) => r.satisfied);
  return { passed, results };
}

export default function SystemArchitectWorkspace({
  session,
  manager,
  briefing,
  resources = [],
  accessedResourceIds = new Set(),
  activeResource,
  setActiveResource,
  handleAccessResource,
  notesValue,
  setNotesValue,
  notesStatus,
  findings = [],
  workspaceLoading,
  showFindingForm,
  setShowFindingForm,
  findingStatement,
  setFindingStatement,
  findingCategory,
  setFindingCategory,
  findingResourceRef,
  setFindingResourceRef,
  handleSaveNewFinding,
  handleCreateFinding,
  handleCompleteInvestigation,
  onCompletePhase,
  actionLoading = false,
  creatingFinding,
  completingInvestigation,
}) {
  const onSaveFinding = handleSaveNewFinding || handleCreateFinding;
  const onComplete = handleCompleteInvestigation || onCompletePhase;
  const isSavingFinding = creatingFinding ?? actionLoading;
  const isCompleting = completingInvestigation ?? actionLoading;
  // Extract workspace configuration from session
  const workspaceConfig = useMemo(() => {
    return (
      session?.mission_configuration?.workspace ||
      session?.configuration?.workspace ||
      {}
    );
  }, [session]);

  const rawCanvas = useMemo(() => workspaceConfig.canvas || {}, [workspaceConfig.canvas]);
  const initialRegions = useMemo(() => rawCanvas.regions || [], [rawCanvas]);
  const initialComponents = useMemo(() => rawCanvas.components || [], [rawCanvas]);
  const initialConnections = useMemo(() => rawCanvas.connections || [], [rawCanvas]);
  const simulations = useMemo(() => workspaceConfig.simulations || [], [workspaceConfig.simulations]);
  const validationRules = useMemo(() => workspaceConfig.validation_rules || [], [workspaceConfig.validation_rules]);

  // Local interactive topology state
  const [components, setComponents] = useState(initialComponents);
  const [connections, setConnections] = useState(initialConnections);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [activeSimulationId, setActiveSimulationId] = useState(null);
  const [activeSimulationLog, setActiveSimulationLog] = useState(null);
  const [telemetryDeltas, setTelemetryDeltas] = useState({});

  // Sync state if session config loads dynamically
  React.useEffect(() => {
    if (initialComponents.length > 0 && components.length === 0) {
      setComponents(initialComponents);
    }
    if (initialConnections.length > 0 && connections.length === 0) {
      setConnections(initialConnections);
    }
  }, [initialComponents, initialConnections, components.length, connections.length]);

  // Selected component object
  const selectedComponent = useMemo(() => {
    return components.find((c) => c.id === selectedComponentId) || null;
  }, [components, selectedComponentId]);

  // Active simulation object
  const activeSimulation = useMemo(() => {
    return simulations.find((s) => s.id === activeSimulationId) || null;
  }, [simulations, activeSimulationId]);

  // Validation report
  const validationReport = useMemo(() => {
    return validateArchitectureState(components, connections, validationRules);
  }, [components, connections, validationRules]);

  // Handle running a configured failure scenario
  const handleRunSimulation = (scenarioId) => {
    const scenario = simulations.find((s) => s.id === scenarioId);
    if (!scenario) return;

    setActiveSimulationId(scenario.id);
    const effects = scenario.effects || {};
    const failedIds = new Set(effects.failed_components || []);
    const degradedConnIds = new Set(effects.degraded_connections || []);

    // Update component statuses deterministically
    setComponents((prev) =>
      prev.map((c) => {
        if (failedIds.has(c.id)) {
          return { ...c, status: "failed", previous_status: c.status };
        }
        if (effects.degraded_components && effects.degraded_components.includes(c.id)) {
          return { ...c, status: "degraded", previous_status: c.status };
        }
        return c;
      })
    );

    // Update connection statuses
    setConnections((prev) =>
      prev.map((conn) => {
        if (degradedConnIds.has(conn.id)) {
          return { ...conn, status: "degraded", latency_ms: (conn.latency_ms || 10) * 4 };
        }
        return conn;
      })
    );

    setTelemetryDeltas(effects.telemetry_deltas || {});
    setActiveSimulationLog(effects.system_log || `Simulated event [${scenario.title}] executed.`);
  };

  // Reset simulation back to baseline
  const handleResetSimulation = () => {
    setActiveSimulationId(null);
    setActiveSimulationLog(null);
    setTelemetryDeltas({});
    setComponents(initialComponents);
    setConnections(initialConnections);
  };

  // Group components by region
  const componentsByRegion = useMemo(() => {
    const grouped = {};
    if (initialRegions.length > 0) {
      initialRegions.forEach((r) => {
        grouped[r.id] = { region: r, components: [] };
      });
    }
    grouped["default"] = { region: { id: "default", name: "Architecture Boundary", color: "slate" }, components: [] };

    components.forEach((c) => {
      const regKey = c.region && grouped[c.region] ? c.region : "default";
      grouped[regKey].components.push(c);
    });

    return grouped;
  }, [initialRegions, components]);

  const requiredResourceAccess = session?.mission_configuration?.investigation?.completion?.required_resource_access || [];
  const allRequiredAccessed = requiredResourceAccess.every((id) => accessedResourceIds.has(id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" data-testid="system-architect-workspace">
      {/* ========================================================================= */}
      {/* LEFT PANEL: Architecture Dossier & Evidence (Cols 3)                     */}
      {/* ========================================================================= */}
      <div className="lg:col-span-3 space-y-5">
        {/* Resource Dossier Card */}
        <div className="rounded-3xl border border-[#E5DEC9] bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Architecture Dossier</h3>
                <p className="text-[11px] text-slate-500">System Evidence & Specifications</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
              {accessedResourceIds.size}/{resources.length} Inspected
            </span>
          </div>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {resources.map((res) => {
              const isAccessed = accessedResourceIds.has(res.id);
              const isActive = activeResource?.id === res.id;
              const isRequired = requiredResourceAccess.includes(res.id);

              return (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => handleAccessResource(res)}
                  className={`w-full text-left p-3 rounded-2xl border transition flex items-start justify-between gap-2 ${
                    isActive
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600"
                      : isAccessed
                      ? "border-emerald-200 bg-emerald-50/20 hover:border-slate-300"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-800 line-clamp-1">{res.title}</span>
                      {isRequired && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{res.type?.replace(/_/g, " ")}</p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {isAccessed ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Eye size={12} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Resource Content Viewer */}
          {activeResource && (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{activeResource.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">{activeResource.type}</span>
              </div>
              <div className="text-xs leading-relaxed text-slate-700 font-mono whitespace-pre-wrap max-h-[160px] overflow-y-auto pr-1">
                {typeof activeResource.content === "string"
                  ? activeResource.content
                  : JSON.stringify(activeResource.content, null, 2)}
              </div>
            </div>
          )}
        </div>

        {/* Live Telemetry / Metric Indicators */}
        {Object.keys(telemetryDeltas).length > 0 && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 text-rose-800">
              <Activity size={16} />
              <h4 className="text-xs font-bold uppercase tracking-wider">Simulation Telemetry Alert</h4>
            </div>
            <div className="space-y-1.5">
              {Object.entries(telemetryDeltas).map(([metricKey, metricVal]) => (
                <div key={metricKey} className="flex items-center justify-between text-xs bg-white/80 p-2 rounded-xl border border-rose-100">
                  <span className="font-semibold text-slate-700">{metricKey.replace(/_/g, " ")}:</span>
                  <span className="font-mono font-bold text-rose-700">{String(metricVal)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CENTER PANEL: Interactive Topology Canvas (Cols 6)                        */}
      {/* ========================================================================= */}
      <div className="lg:col-span-6 space-y-4">
        <div className="rounded-3xl border border-[#E5DEC9] bg-white p-5 shadow-sm space-y-4">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Layers size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">System Topology Canvas</h2>
                <p className="text-[11px] text-slate-500">Infrastructure Components, Boundaries & Links</p>
              </div>
            </div>

            {/* Validation Pill */}
            {components.length === 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <AlertCircle size={12} />
                Topology Unavailable
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  validationReport.passed
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}
              >
                {validationReport.passed ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {validationReport.passed ? "Topology Valid" : "Constraint Warning"}
              </span>
            )}
          </div>

          {/* Active Simulation Notification Banner */}
          {activeSimulation && (
            <div className="flex items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-300 p-3 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Zap size={15} className="text-amber-600 animate-pulse shrink-0" />
                <div>
                  <span className="font-bold">Active Fault: </span>
                  <span>{activeSimulation.title}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetSimulation}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-white px-2 py-1 rounded-lg border border-amber-200 hover:bg-amber-50 transition"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          )}

          {/* Topology Canvas Graph View */}
          <div className="rounded-2xl border border-slate-200 bg-slate-900/5 p-4 min-h-[380px] space-y-4">
            {components.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[340px] text-center p-6 space-y-2 text-slate-400">
                <Layers size={36} className="opacity-40 text-slate-500" />
                <p className="text-xs font-bold text-slate-600">No Topology Configuration Available</p>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  This system architect mission does not have active component topology or boundary definitions configured.
                </p>
              </div>
            ) : (
              <>
                {Object.entries(componentsByRegion).map(([regId, { region, components: regComponents }]) => {
              if (regComponents.length === 0) return null;

              return (
                <div
                  key={regId}
                  className="rounded-2xl border border-slate-300/80 bg-white/80 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Globe size={14} className="text-blue-600" />
                      {region.name || regId}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-slate-500 uppercase">
                      {regComponents.length} Node{regComponents.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {/* Components Grid inside Region */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {regComponents.map((comp) => {
                      const IconComponent = getComponentIcon(comp.type);
                      const isSelected = selectedComponentId === comp.id;
                      const isFailed = comp.status === "failed";
                      const isDegraded = comp.status === "degraded";

                      return (
                        <div
                          key={comp.id}
                          onClick={() => {
                            setSelectedComponentId(comp.id);
                            setSelectedConnectionId(null);
                          }}
                          className={`cursor-pointer p-3 rounded-2xl border transition flex flex-col justify-between gap-2.5 ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500"
                              : isFailed
                              ? "border-rose-400 bg-rose-50/60 hover:border-rose-500"
                              : isDegraded
                              ? "border-amber-400 bg-amber-50/60 hover:border-amber-500"
                              : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-xl ${
                                  isFailed
                                    ? "bg-rose-100 text-rose-700"
                                    : isDegraded
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                <IconComponent size={15} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{comp.name}</h4>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{comp.type}</p>
                              </div>
                            </div>
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                                isFailed
                                  ? "bg-rose-100 text-rose-800"
                                  : isDegraded
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {comp.status || "healthy"}
                            </span>
                          </div>

                          {comp.zone && (
                            <div className="text-[10px] text-slate-500 font-medium">
                              Zone: <span className="font-semibold text-slate-700">{comp.zone}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Connections & Protocol Streams */}
            {connections.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Network size={14} className="text-indigo-600" />
                  Configured Communication Links
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {connections.map((conn) => {
                    const isSelected = selectedConnectionId === conn.id;
                    const isDegraded = conn.status === "degraded";

                    return (
                      <button
                        key={conn.id || `${conn.source}->${conn.target}`}
                        type="button"
                        onClick={() => {
                          setSelectedConnectionId(conn.id);
                          setSelectedComponentId(null);
                        }}
                        className={`text-left p-2 rounded-xl border text-xs flex items-center justify-between transition ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50"
                            : isDegraded
                            ? "border-rose-300 bg-rose-50"
                            : "border-slate-100 bg-slate-50/60 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono text-[11px] font-bold text-slate-800 truncate">{conn.source}</span>
                          <ArrowRight size={12} className="text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px] font-bold text-slate-800 truncate">{conn.target}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-1">
                          {conn.latency_ms ? `${conn.latency_ms}ms` : conn.protocol || "Link"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
              </>
            )}
          </div>

          {/* Component / Link Inspector Drawer */}
          {selectedComponent && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-blue-700" />
                  <h4 className="text-xs font-bold text-slate-900">Component Inspector: {selectedComponent.name}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedComponentId(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">ID:</span> <span className="font-mono font-bold text-slate-800">{selectedComponent.id}</span>
                </div>
                <div>
                  <span className="text-slate-500">Type:</span> <span className="font-semibold text-slate-800">{selectedComponent.type}</span>
                </div>
                <div>
                  <span className="text-slate-500">Region:</span> <span className="font-semibold text-slate-800">{selectedComponent.region || "Global"}</span>
                </div>
                <div>
                  <span className="text-slate-500">Status:</span>{" "}
                  <span className={`font-bold ${selectedComponent.status === "failed" ? "text-rose-700" : "text-emerald-700"}`}>
                    {selectedComponent.status || "healthy"}
                  </span>
                </div>
              </div>

              {selectedComponent.properties && Object.keys(selectedComponent.properties).length > 0 && (
                <div className="space-y-1.5 border-t border-blue-100 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Configured Properties:</span>
                  <div className="space-y-1">
                    {Object.entries(selectedComponent.properties).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-xs bg-white/80 p-1.5 rounded-lg border border-blue-100">
                        <span className="text-slate-600 font-medium">{k.replace(/_/g, " ")}:</span>
                        <span className="font-mono font-bold text-slate-800">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fault Simulation Control Tray */}
          {simulations.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap size={16} className="text-amber-600" />
                  <h4 className="text-xs font-bold text-slate-900">Bounded Fault Simulation Tray</h4>
                </div>
                {activeSimulation && (
                  <button
                    type="button"
                    onClick={handleResetSimulation}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <RotateCcw size={12} /> Reset Baseline
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {simulations.map((sim) => {
                  const isRunning = activeSimulationId === sim.id;
                  return (
                    <button
                      key={sim.id}
                      type="button"
                      disabled={isRunning}
                      onClick={() => handleRunSimulation(sim.id)}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                        isRunning
                          ? "border-amber-400 bg-amber-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30"
                      }`}
                    >
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{sim.title}</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{sim.description}</p>
                      </div>
                      <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <Play size={12} />
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeSimulationLog && (
                <div className="rounded-xl bg-slate-900 text-emerald-400 p-2.5 font-mono text-[11px] leading-relaxed">
                  &gt; {activeSimulationLog}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: Architect Workbench & Findings (Cols 3)                      */}
      {/* ========================================================================= */}
      <div className="lg:col-span-3 space-y-5">
        {/* Manager & Mission Objectives */}
        <div className="rounded-3xl border border-[#E5DEC9] bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 font-bold text-sm">
              {manager?.name ? manager.name.charAt(0) : "M"}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">{manager?.name || "Engineering Director"}</h4>
              <p className="text-xs text-slate-500 truncate">{manager?.title || "Infrastructure Lead"}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Architectural Mandate</span>
            <p className="text-slate-600 leading-relaxed">
              {briefing?.task || briefing?.context || "Evaluate the system topology, inspect failure modes, and formulate a resilient architecture recommendation."}
            </p>
          </div>
        </div>

        {/* Live Working Notes */}
        <div className="rounded-3xl border border-[#E5DEC9] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Architecture Notes</h3>
            <span className="text-[11px] text-slate-400 font-medium">
              {notesStatus === "saving" ? "Saving..." : notesStatus === "saved" ? "Saved" : "Autosave"}
            </span>
          </div>
          <textarea
            value={notesValue || ""}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="Record topology observations, single points of failure (SPOFs), and failover latency constraints..."
            className="w-full h-32 rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none font-mono"
          />
        </div>

        {/* Pinned Architecture Findings */}
        <div className="rounded-3xl border border-[#E5DEC9] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Architecture Findings</h3>
            <button
              type="button"
              onClick={() => setShowFindingForm(!showFindingForm)}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {showFindingForm && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3 space-y-2">
              <input
                type="text"
                value={findingStatement || ""}
                onChange={(e) => setFindingStatement(e.target.value)}
                placeholder="e.g. Asynchronous WAL stream exceeds 30s RTO..."
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="button"
                disabled={isSavingFinding || !findingStatement?.trim()}
                onClick={onSaveFinding}
                className="w-full rounded-xl bg-indigo-600 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {isSavingFinding ? "Saving Finding..." : "Pin Finding"}
              </button>
            </div>
          )}

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {findings.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No findings pinned yet.</p>
            ) : (
              findings.map((f, idx) => (
                <div key={f.id || idx} className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs space-y-1">
                  <p className="font-semibold text-slate-800 leading-snug">{f.statement}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Phase Completion Action */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Investigation Readiness</span>
            <p className="text-xs text-slate-600">
              {allRequiredAccessed
                ? "All required architectural specifications inspected. Ready to formulate recommendation."
                : "Inspect all required resources before proceeding."}
            </p>
          </div>

          <button
            type="button"
            disabled={!allRequiredAccessed || isCompleting}
            onClick={onComplete}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
          >
            {isCompleting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Completing...
              </>
            ) : (
              <>
                Complete Investigation <Rocket size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
