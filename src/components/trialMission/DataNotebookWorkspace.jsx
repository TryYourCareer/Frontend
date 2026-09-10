import React, { useState, useMemo } from "react";
import {
  Database,
  Check,
  Eye,
  Plus,
  BookmarkPlus,
  CheckCircle2,
  Lock,
  Rocket,
  Loader2,
  BarChart2,
  FileSpreadsheet,
  AlertCircle,
  Info,
  History,
} from "lucide-react";

/**
 * Safely parses structured data from resource content or metadata.
 * Returns { isTabular: boolean, columns: string[], rows: object[], raw: string }
 */
export function parseDatasetContent(content, metadata) {
  if (!content && !metadata?.data) {
    return { isTabular: false, columns: [], rows: [], raw: "" };
  }

  // If metadata explicitly contains structured data rows
  if (Array.isArray(metadata?.data) && metadata.data.length > 0) {
    const rows = metadata.data;
    const columns = Array.isArray(metadata.columns) && metadata.columns.length > 0
      ? metadata.columns
      : Object.keys(rows[0] || {});
    return { isTabular: true, columns, rows, raw: content || "" };
  }

  const trimmed = (typeof content === "string" ? content : "").trim();
  if (!trimmed) {
    return { isTabular: false, columns: [], rows: [], raw: "" };
  }

  // Check for JSON table
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) {
        const columns = Object.keys(parsed[0]);
        return { isTabular: true, columns, rows: parsed, raw: trimmed };
      }
      if (parsed && Array.isArray(parsed.rows) && parsed.rows.length > 0) {
        const columns = Array.isArray(parsed.columns) ? parsed.columns : Object.keys(parsed.rows[0] || {});
        return { isTabular: true, columns, rows: parsed.rows, raw: trimmed };
      }
    } catch {
      // Not JSON, continue to CSV parsing
    }
  }

  // Check for CSV format
  const lines = trimmed.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length >= 2 && lines[0].includes(",")) {
    const parseCsvLine = (line) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const columns = parseCsvLine(lines[0]);
    if (columns.length > 0) {
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        const row = {};
        columns.forEach((col, idx) => {
          let val = values[idx] !== undefined ? values[idx] : "";
          if (val !== "" && !isNaN(val) && !isNaN(parseFloat(val))) {
            val = Number(val);
          } else if (typeof val === "string" && val.toLowerCase() === "true") {
            val = true;
          } else if (typeof val === "string" && val.toLowerCase() === "false") {
            val = false;
          }
          row[col] = val;
        });
        rows.push(row);
      }
      if (rows.length > 0) {
        return { isTabular: true, columns, rows, raw: trimmed };
      }
    }
  }

  return { isTabular: false, columns: [], rows: [], raw: trimmed };
}

/**
 * Calculates deterministic analytical operations on parsed tabular rows.
 */
export function executeAnalyticalOperation(rows, operation, params = {}) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      success: false,
      error: "Dataset contains no rows to analyze.",
      operation,
      results: null,
    };
  }

  try {
    if (operation === "filter_cohort") {
      const { column, operator = "equals", value = "" } = params;
      if (!column) {
        return { success: false, error: "Select a column to filter by.", operation, results: null };
      }

      const strVal = String(value).trim().toLowerCase();
      const numVal = Number(value);
      const isNum = value !== "" && !isNaN(numVal);

      const filtered = rows.filter((r) => {
        const cell = r[column];
        if (cell === undefined || cell === null) return false;

        const cellStr = String(cell).trim().toLowerCase();
        const cellNum = Number(cell);

        switch (operator) {
          case "equals":
          case "eq":
            return isNum && typeof cell === "number" ? cellNum === numVal : cellStr === strVal;
          case "not_equals":
          case "neq":
            return isNum && typeof cell === "number" ? cellNum !== numVal : cellStr !== strVal;
          case "greater_than":
          case "gt":
            return !isNaN(cellNum) && cellNum > numVal;
          case "less_than":
          case "lt":
            return !isNaN(cellNum) && cellNum < numVal;
          case "greater_than_or_equal":
          case "gte":
            return !isNaN(cellNum) && cellNum >= numVal;
          case "less_than_or_equal":
          case "lte":
            return !isNaN(cellNum) && cellNum <= numVal;
          case "contains":
            return cellStr.includes(strVal);
          default:
            return cellStr === strVal;
        }
      });

      const matchPercent = rows.length > 0 ? ((filtered.length / rows.length) * 100).toFixed(1) : 0;
      return {
        success: true,
        operation: "filter_cohort",
        summary: `Filtered on [${column}] ${operator} "${value}": ${filtered.length} of ${rows.length} rows matched (${matchPercent}%).`,
        data: {
          totalRows: rows.length,
          matchedRows: filtered.length,
          matchPercent: Number(matchPercent),
          rows: filtered,
        },
      };
    }

    if (operation === "aggregate_metrics") {
      const { metricColumn, groupByColumn, aggFunction = "all_summary" } = params;
      if (!metricColumn) {
        return { success: false, error: "Select a target metric column to aggregate.", operation, results: null };
      }

      const computeStats = (values) => {
        const nums = values.map((v) => Number(v)).filter((v) => !isNaN(v)).sort((a, b) => a - b);
        if (nums.length === 0) {
          return { count: values.length, validNumericCount: 0, mean: null, sum: null, min: null, max: null, median: null };
        }
        const sum = nums.reduce((acc, v) => acc + v, 0);
        const mean = sum / nums.length;
        const min = nums[0];
        const max = nums[nums.length - 1];
        const mid = Math.floor(nums.length / 2);
        const median = nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;

        return {
          count: values.length,
          validNumericCount: nums.length,
          mean: Number(mean.toFixed(2)),
          sum: Number(sum.toFixed(2)),
          min: Number(min.toFixed(2)),
          max: Number(max.toFixed(2)),
          median: Number(median.toFixed(2)),
        };
      };

      if (groupByColumn) {
        const groups = {};
        rows.forEach((r) => {
          const grpKey = r[groupByColumn] !== undefined && r[groupByColumn] !== null ? String(r[groupByColumn]) : "(missing)";
          if (!groups[grpKey]) groups[grpKey] = [];
          groups[grpKey].push(r[metricColumn]);
        });

        const groupResults = Object.keys(groups).sort().map((grp) => {
          const stats = computeStats(groups[grp]);
          return {
            group: grp,
            ...stats,
          };
        });

        return {
          success: true,
          operation: "aggregate_metrics",
          summary: `Aggregated metric [${metricColumn}] grouped by [${groupByColumn}] across ${groupResults.length} cohorts.`,
          data: {
            metricColumn,
            groupByColumn,
            aggFunction,
            groups: groupResults,
          },
        };
      } else {
        const values = rows.map((r) => r[metricColumn]);
        const stats = computeStats(values);
        return {
          success: true,
          operation: "aggregate_metrics",
          summary: `Overall summary for [${metricColumn}]: Count = ${stats.count}, Mean = ${stats.mean}, Median = ${stats.median}, Min = ${stats.min}, Max = ${stats.max}.`,
          data: {
            metricColumn,
            aggFunction,
            stats,
          },
        };
      }
    }

    if (operation === "compare_distributions") {
      const { splitColumn, cohortA, cohortB, metricColumn } = params;
      if (!splitColumn || !cohortA || !cohortB || !metricColumn) {
        return {
          success: false,
          error: "Select split column, cohort A value, cohort B value, and metric column.",
          operation,
          results: null,
        };
      }

      const rowsA = rows.filter((r) => String(r[splitColumn]).trim().toLowerCase() === String(cohortA).trim().toLowerCase());
      const rowsB = rows.filter((r) => String(r[splitColumn]).trim().toLowerCase() === String(cohortB).trim().toLowerCase());

      const getNumericStats = (subset) => {
        const nums = subset.map((r) => Number(r[metricColumn])).filter((v) => !isNaN(v)).sort((a, b) => a - b);
        if (nums.length === 0) return { count: subset.length, mean: 0, median: 0, min: 0, max: 0 };
        const sum = nums.reduce((a, b) => a + b, 0);
        const mean = sum / nums.length;
        const mid = Math.floor(nums.length / 2);
        const median = nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
        return {
          count: subset.length,
          mean: Number(mean.toFixed(2)),
          median: Number(median.toFixed(2)),
          min: Number(nums[0].toFixed(2)),
          max: Number(nums[nums.length - 1].toFixed(2)),
        };
      };

      const statsA = getNumericStats(rowsA);
      const statsB = getNumericStats(rowsB);
      const deltaMean = Number((statsB.mean - statsA.mean).toFixed(2));
      const deltaPercent = statsA.mean !== 0 ? Number((((statsB.mean - statsA.mean) / statsA.mean) * 100).toFixed(1)) : 0;

      return {
        success: true,
        operation: "compare_distributions",
        summary: `Cohort comparison on [${metricColumn}] (${cohortA} vs ${cohortB}): Mean diff = ${deltaMean} (${deltaPercent > 0 ? "+" : ""}${deltaPercent}%).`,
        data: {
          splitColumn,
          metricColumn,
          cohortA: { name: cohortA, ...statsA },
          cohortB: { name: cohortB, ...statsB },
          deltaMean,
          deltaPercent,
        },
      };
    }

    return {
      success: false,
      error: `Unsupported analytical operation: "${operation}".`,
      operation,
      results: null,
    };
  } catch (err) {
    return {
      success: false,
      error: `Analytical calculation failed: ${err?.message || "Unknown error"}`,
      operation,
      results: null,
    };
  }
}

export default function DataNotebookWorkspace({
  session,
  manager,
  briefing,
  resources,
  accessedResourceIds,
  activeResource,
  setActiveResource,
  handleAccessResource,
  notesValue,
  setNotesValue,
  notesStatus,
  findings,
  workspaceLoading,
  showFindingForm,
  setShowFindingForm,
  findingStatement,
  setFindingStatement,
  findingResource,
  setFindingResource,
  findingExplanation,
  setFindingExplanation,
  findingUncertainty,
  setFindingUncertainty,
  handleSaveNewFinding,
  handleCompleteInvestigation,
  requiredFindingsCount,
  requiredResourceAccess,
  actionLoading,
  isInvestigationPhase,
}) {
  // Client-side transient notebook states
  const [selectedOp, setSelectedOp] = useState("filter_cohort");
  const [filterColumn, setFilterColumn] = useState("");
  const [filterOperator, setFilterOperator] = useState("equals");
  const [filterValue, setFilterValue] = useState("");

  const [aggMetricCol, setAggMetricCol] = useState("");
  const [aggGroupByCol, setAggGroupByCol] = useState("");
  const aggFunction = "all_summary";

  const [compareSplitCol, setCompareSplitCol] = useState("");
  const [compareCohortA, setCompareCohortA] = useState("");
  const [compareCohortB, setCompareCohortB] = useState("");
  const [compareMetricCol, setCompareMetricCol] = useState("");

  const [activeAnalysisResult, setActiveAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // Active resource parsed dataset
  const parsedData = useMemo(() => {
    if (!activeResource) return { isTabular: false, columns: [], rows: [], raw: "" };
    return parseDatasetContent(activeResource.content, activeResource.metadata);
  }, [activeResource]);

  // Handle running bounded analytical operation
  const handleRunAnalysis = (e) => {
    if (e) e.preventDefault();
    setAnalysisError(null);

    if (!activeResource) {
      setAnalysisError("Select a dataset resource from the left panel first.");
      return;
    }

    if (!parsedData.isTabular || parsedData.rows.length === 0) {
      setAnalysisError("The selected resource does not contain structured tabular rows for querying.");
      return;
    }

    let params = {};
    if (selectedOp === "filter_cohort") {
      params = {
        column: filterColumn || parsedData.columns[0],
        operator: filterOperator,
        value: filterValue,
      };
    } else if (selectedOp === "aggregate_metrics") {
      params = {
        metricColumn: aggMetricCol || parsedData.columns[0],
        groupByColumn: aggGroupByCol || undefined,
        aggFunction,
      };
    } else if (selectedOp === "compare_distributions") {
      params = {
        splitColumn: compareSplitCol || parsedData.columns[0],
        cohortA: compareCohortA,
        cohortB: compareCohortB,
        metricColumn: compareMetricCol || parsedData.columns[0],
      };
    }

    const res = executeAnalyticalOperation(parsedData.rows, selectedOp, params);
    if (!res.success) {
      setAnalysisError(res.error);
      setActiveAnalysisResult(null);
    } else {
      setActiveAnalysisResult(res);
      setAnalysisHistory((prev) => [
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          resourceTitle: activeResource.title,
          resourceId: activeResource.id,
          operation: selectedOp,
          summary: res.summary,
          result: res,
        },
        ...prev.slice(0, 9), // keep last 10
      ]);
    }
  };

  // Pin Analysis Result to Finding Form
  const handlePinAsFinding = (resultToPin) => {
    const resObj = resultToPin || activeAnalysisResult;
    if (!resObj) return;

    setShowFindingForm(true);
    setFindingResource(activeResource?.id || "");
    setFindingStatement(resObj.summary || "");
    setFindingExplanation(
      `Analytical finding derived from ${activeResource?.title || "dataset"}: ${resObj.summary}`
    );
  };

  return (
    <div className="space-y-6" data-testid="data-notebook-workspace">
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-0.5 text-xs font-bold text-indigo-800 uppercase tracking-wider">
              <Database size={12} /> Data Notebook Workspace
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Phase: {session?.current_phase || "investigate"}
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            {session?.mission_title || "Empirical Data Investigation"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Notes Autosave:{" "}
            <strong
              className={
                notesStatus === "error"
                  ? "text-rose-600"
                  : notesStatus === "saving"
                  ? "text-amber-600"
                  : "text-emerald-700 font-mono"
              }
            >
              {notesStatus === "saving"
                ? "Saving..."
                : notesStatus === "saved"
                ? "Saved"
                : notesStatus === "error"
                ? "Error"
                : "Ready"}
            </strong>
          </span>
        </div>
      </div>

      {/* 3-COLUMN DESKTOP WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ========================================================================= */}
        {/* LEFT PANEL: Datasets & Evidence Explorer                                  */}
        {/* ========================================================================= */}
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-3xl border border-[#E5DEC9] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Datasets & Evidence
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {resources.length}
              </span>
            </div>

            <div className="space-y-3">
              {resources.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-2">No resources provided.</div>
              ) : (
                resources.map((res) => {
                  const isAccessed = accessedResourceIds.has(res.id);
                  const isSelected = activeResource?.id === res.id;
                  const isDataset =
                    res.type === "dataset_table" ||
                    res.type === "dataset" ||
                    res.metadata?.format === "csv" ||
                    res.metadata?.format === "json";

                  return (
                    <div
                      key={res.id}
                      className={`rounded-2xl border p-3.5 transition ${
                        isSelected
                          ? "border-[#7B4A28] bg-amber-50/50 shadow-sm"
                          : "border-slate-200 bg-slate-50/80 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h3 className="text-xs font-bold text-slate-900">{res.title}</h3>
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 uppercase">
                              {res.type || "evidence"}
                            </span>
                            {isDataset && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-[10px] text-indigo-700">
                                <FileSpreadsheet size={10} /> Tabular
                              </span>
                            )}
                          </div>
                        </div>
                        {isAccessed && (
                          <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-end">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => {
                            handleAccessResource(res.id);
                            // Pre-fill filter/agg column defaults if empty
                            if (!filterColumn && res.metadata?.columns?.length > 0) {
                              setFilterColumn(res.metadata.columns[0]);
                              setAggMetricCol(res.metadata.columns[0]);
                              setCompareSplitCol(res.metadata.columns[0]);
                            }
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#7B4A28] hover:underline disabled:opacity-50"
                        >
                          <Eye size={12} /> {isAccessed ? "Inspect" : "Load & Inspect"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ACTIVE RESOURCE SCHEMA & PREVIEW */}
          {activeResource && (
            <div className="rounded-3xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-950 truncate max-w-[200px]">
                  {activeResource.title}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveResource(null)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                  aria-label="Close active resource"
                >
                  ✕
                </button>
              </div>

              {parsedData.isTabular ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-indigo-900 font-semibold">
                    <span>Columns ({parsedData.columns.length}):</span>
                    <span className="font-mono text-slate-600">{parsedData.rows.length} rows</span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1 bg-white/70 rounded-xl border border-indigo-100">
                    {parsedData.columns.map((col) => (
                      <span
                        key={col}
                        className="inline-block rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 font-mono text-[10px] text-indigo-800"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 font-semibold">
                    <Info size={12} /> Non-tabular document evidence
                  </div>
                  <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto bg-white/80 p-3 rounded-xl border border-slate-200">
                    {activeResource.content || "No raw content provided."}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CENTER PANEL: Interactive Analytical Workspace & Findings                 */}
        {/* ========================================================================= */}
        <div className="space-y-6 lg:col-span-6">
          {/* ANALYTICAL QUERY CELL */}
          <div className="rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Analytical Workspace</h2>
                <p className="text-xs text-slate-500">
                  Execute bounded statistical operations and cohort comparisons on active datasets.
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-1 font-mono text-[11px] font-semibold text-indigo-800">
                {activeResource ? activeResource.title : "No Dataset Loaded"}
              </span>
            </div>

            {/* OPERATION SELECTOR & FORM */}
            <form onSubmit={handleRunAnalysis} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label htmlFor="operation-selector" className="text-xs font-bold text-slate-700">Operation</label>
                  <select
                    id="operation-selector"
                    value={selectedOp}
                    onChange={(e) => {
                      setSelectedOp(e.target.value);
                      setActiveAnalysisResult(null);
                      setAnalysisError(null);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                  >
                    <option value="filter_cohort">Filter Cohort</option>
                    <option value="aggregate_metrics">Aggregate Metrics</option>
                    <option value="compare_distributions">Compare Distributions</option>
                  </select>
                </div>

                {/* DYNAMIC PARAMETERS: FILTER COHORT */}
                {selectedOp === "filter_cohort" && (
                  <>
                    <div className="space-y-1">
                      <label htmlFor="filter-column-select" className="text-xs font-bold text-slate-700">Column</label>
                      <select
                        id="filter-column-select"
                        value={filterColumn || (parsedData.columns[0] || "")}
                        onChange={(e) => setFilterColumn(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                      >
                        {parsedData.columns.length > 0 ? (
                          parsedData.columns.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))
                        ) : (
                          <option value="">(Select dataset first)</option>
                        )}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="filter-operator-select" className="text-xs font-bold text-slate-700">Operator</label>
                      <select
                        id="filter-operator-select"
                        value={filterOperator}
                        onChange={(e) => setFilterOperator(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                      >
                        <option value="equals">Equals (==)</option>
                        <option value="not_equals">Not Equals (!=)</option>
                        <option value="greater_than">Greater Than (&gt;)</option>
                        <option value="less_than">Less Than (&lt;)</option>
                        <option value="contains">Contains Substring</option>
                      </select>
                    </div>
                  </>
                )}

                {/* DYNAMIC PARAMETERS: AGGREGATE METRICS */}
                {selectedOp === "aggregate_metrics" && (
                  <>
                    <div className="space-y-1">
                      <label htmlFor="agg-metric-select" className="text-xs font-bold text-slate-700">Metric Column</label>
                      <select
                        id="agg-metric-select"
                        value={aggMetricCol || (parsedData.columns[0] || "")}
                        onChange={(e) => setAggMetricCol(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                      >
                        {parsedData.columns.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="agg-group-select" className="text-xs font-bold text-slate-700">Group By (Optional)</label>
                      <select
                        id="agg-group-select"
                        value={aggGroupByCol}
                        onChange={(e) => setAggGroupByCol(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                      >
                        <option value="">(None - Overall)</option>
                        {parsedData.columns.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* DYNAMIC PARAMETERS: COMPARE DISTRIBUTIONS */}
                {selectedOp === "compare_distributions" && (
                  <>
                    <div className="space-y-1">
                      <label htmlFor="compare-split-select" className="text-xs font-bold text-slate-700">Split Column</label>
                      <select
                        id="compare-split-select"
                        value={compareSplitCol || (parsedData.columns[0] || "")}
                        onChange={(e) => setCompareSplitCol(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                      >
                        {parsedData.columns.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="compare-metric-select" className="text-xs font-bold text-slate-700">Metric Column</label>
                      <select
                        id="compare-metric-select"
                        value={compareMetricCol || (parsedData.columns[0] || "")}
                        onChange={(e) => setCompareMetricCol(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                      >
                        {parsedData.columns.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* SECOND ROW FOR FILTER VALUE / COHORTS */}
              {selectedOp === "filter_cohort" && (
                <div className="space-y-1">
                  <label htmlFor="filter-target-value" className="text-xs font-bold text-slate-700">Target Filter Value *</label>
                  <input
                    id="filter-target-value"
                    type="text"
                    required
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder="e.g., iOS, 500, failed, true"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                  />
                </div>
              )}

              {selectedOp === "compare_distributions" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="cohort-a-input" className="text-xs font-bold text-slate-700">Cohort A Value *</label>
                    <input
                      id="cohort-a-input"
                      type="text"
                      required
                      value={compareCohortA}
                      onChange={(e) => setCompareCohortA(e.target.value)}
                      placeholder="e.g. baseline, control, US"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="cohort-b-input" className="text-xs font-bold text-slate-700">Cohort B Value *</label>
                    <input
                      id="cohort-b-input"
                      type="text"
                      required
                      value={compareCohortB}
                      onChange={(e) => setCompareCohortB(e.target.value)}
                      placeholder="e.g. treatment, v2.1, EU"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={actionLoading || !activeResource || !parsedData.isTabular}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-800 disabled:opacity-40"
                >
                  <BarChart2 size={13} /> Run Analysis
                </button>
              </div>
            </form>

            {/* ERROR DISPLAY */}
            {analysisError && (
              <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-800">
                <AlertCircle size={15} className="shrink-0 text-rose-600" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* DETERMINISTIC RESULT DISPLAY */}
            {activeAnalysisResult && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                    Operation Result Output
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePinAsFinding(activeAnalysisResult)}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#7B4A28] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-[#633B20]"
                  >
                    <BookmarkPlus size={11} /> Pin as Finding
                  </button>
                </div>

                <p className="text-xs font-medium text-slate-800 bg-white p-2.5 rounded-xl border border-indigo-100">
                  {activeAnalysisResult.summary}
                </p>

                {/* RESULT TABLE VIEW */}
                {activeAnalysisResult.operation === "filter_cohort" && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-600">
                      Matched {activeAnalysisResult.data.matchedRows} of {activeAnalysisResult.data.totalRows} rows ({activeAnalysisResult.data.matchPercent}%):
                    </div>
                    <div className="max-h-52 overflow-auto rounded-xl border border-slate-200 bg-white">
                      <table className="min-w-full divide-y divide-slate-200 text-left text-[11px]">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            {parsedData.columns.slice(0, 6).map((c) => (
                              <th key={c} className="px-3 py-1.5 font-bold text-slate-700 uppercase">
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeAnalysisResult.data.rows.slice(0, 20).map((r, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80">
                              {parsedData.columns.slice(0, 6).map((c) => (
                                <td key={c} className="px-3 py-1 text-slate-800 font-mono">
                                  {String(r[c] !== undefined ? r[c] : "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {activeAnalysisResult.data.rows.length > 20 && (
                      <p className="text-[10px] text-slate-400 italic text-right">
                        Showing first 20 rows
                      </p>
                    )}
                  </div>
                )}

                {activeAnalysisResult.operation === "aggregate_metrics" && (
                  <div className="space-y-2">
                    {activeAnalysisResult.data.groups ? (
                      <div className="max-h-52 overflow-auto rounded-xl border border-slate-200 bg-white">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-[11px]">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-1.5 font-bold text-slate-700">Cohort / Group</th>
                              <th className="px-3 py-1.5 font-bold text-slate-700">Count</th>
                              <th className="px-3 py-1.5 font-bold text-slate-700">Mean</th>
                              <th className="px-3 py-1.5 font-bold text-slate-700">Median</th>
                              <th className="px-3 py-1.5 font-bold text-slate-700">Min</th>
                              <th className="px-3 py-1.5 font-bold text-slate-700">Max</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {activeAnalysisResult.data.groups.map((g, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/80">
                                <td className="px-3 py-1 font-bold text-slate-900">{g.group}</td>
                                <td className="px-3 py-1 font-mono text-slate-700">{g.count}</td>
                                <td className="px-3 py-1 font-mono text-slate-700">{g.mean}</td>
                                <td className="px-3 py-1 font-mono text-slate-700">{g.median}</td>
                                <td className="px-3 py-1 font-mono text-slate-700">{g.min}</td>
                                <td className="px-3 py-1 font-mono text-slate-700">{g.max}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-bold">Count</span>
                          <p className="font-mono font-bold text-slate-800">{activeAnalysisResult.data.stats.count}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-bold">Mean</span>
                          <p className="font-mono font-bold text-slate-800">{activeAnalysisResult.data.stats.mean}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-bold">Median</span>
                          <p className="font-mono font-bold text-slate-800">{activeAnalysisResult.data.stats.median}</p>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-bold">Min / Max</span>
                          <p className="font-mono font-bold text-slate-800">
                            {activeAnalysisResult.data.stats.min} / {activeAnalysisResult.data.stats.max}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeAnalysisResult.operation === "compare_distributions" && (
                  <div className="max-h-52 overflow-auto rounded-xl border border-slate-200 bg-white">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-[11px]">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-1.5 font-bold text-slate-700">Cohort</th>
                          <th className="px-3 py-1.5 font-bold text-slate-700">Sample Size</th>
                          <th className="px-3 py-1.5 font-bold text-slate-700">Mean</th>
                          <th className="px-3 py-1.5 font-bold text-slate-700">Median</th>
                          <th className="px-3 py-1.5 font-bold text-slate-700">Range (Min - Max)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="px-3 py-1 font-bold text-slate-900">{activeAnalysisResult.data.cohortA.name}</td>
                          <td className="px-3 py-1 font-mono text-slate-700">{activeAnalysisResult.data.cohortA.count}</td>
                          <td className="px-3 py-1 font-mono text-slate-700">{activeAnalysisResult.data.cohortA.mean}</td>
                          <td className="px-3 py-1 font-mono text-slate-700">{activeAnalysisResult.data.cohortA.median}</td>
                          <td className="px-3 py-1 font-mono text-slate-700">
                            {activeAnalysisResult.data.cohortA.min} - {activeAnalysisResult.data.cohortA.max}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-1 font-bold text-slate-900">{activeAnalysisResult.data.cohortB.name}</td>
                          <td className="px-3 py-1 font-mono text-slate-700">{activeAnalysisResult.data.cohortB.count}</td>
                          <td className="px-3 py-1 font-mono text-slate-700">{activeAnalysisResult.data.cohortB.mean}</td>
                          <td className="px-3 py-1 font-mono text-slate-700">{activeAnalysisResult.data.cohortB.median}</td>
                          <td className="px-3 py-1 font-mono text-slate-700">
                            {activeAnalysisResult.data.cohortB.min} - {activeAnalysisResult.data.cohortB.max}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ANALYSIS HISTORY LOG */}
            {analysisHistory.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <History size={12} /> Recent Analyses ({analysisHistory.length})
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {analysisHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="truncate">
                        <span className="font-semibold text-slate-800">{item.operation}:</span>{" "}
                        <span className="text-slate-600 font-mono text-[11px]">{item.summary}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePinAsFinding(item.result)}
                        className="shrink-0 text-[10px] font-bold text-[#7B4A28] hover:underline"
                      >
                        Pin Finding
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* WORKING NOTES SCRATCHPAD */}
          <div className="rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Analysis Scratchpad</h2>
                <p className="text-xs text-slate-500">
                  Private analytical notes, hypotheses, and queries (autosaved to server).
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-600">
                {notesValue?.length || 0} chars
              </span>
            </div>

            <textarea
              rows={5}
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="Record feature hypotheses, distribution shifts, or modeling notes here..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#7B4A28] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#7B4A28]"
            />
          </div>

          {/* RECORDED FINDINGS */}
          <div className="rounded-3xl border border-[#E5DEC9] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recorded Findings</h2>
                <p className="text-xs text-slate-500">
                  Evidence-backed empirical findings submitted for your decision.
                </p>
              </div>
              {!showFindingForm && (
                <button
                  type="button"
                  onClick={() => setShowFindingForm(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#7B4A28] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#633B20]"
                >
                  <Plus size={14} /> Add Finding
                </button>
              )}
            </div>

            {/* FINDING FORM */}
            {showFindingForm && (
              <form
                onSubmit={handleSaveNewFinding}
                className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-4"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Record Empirical Finding
                </h3>

                <div className="space-y-1">
                  <label htmlFor="finding-statement-input" className="text-xs font-bold text-slate-700">Statement *</label>
                  <input
                    id="finding-statement-input"
                    type="text"
                    required
                    value={findingStatement}
                    onChange={(e) => setFindingStatement(e.target.value)}
                    placeholder="e.g. Model drift detected on iOS cohort with 34% drop in precision."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="finding-resource-select" className="text-xs font-bold text-slate-700">Supporting Resource</label>
                    <select
                      id="finding-resource-select"
                      value={findingResource}
                      onChange={(e) => setFindingResource(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                    >
                      <option value="">Select Resource...</option>
                      {resources.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="finding-uncertainty-input" className="text-xs font-bold text-slate-700">Uncertainty Note</label>
                    <input
                      id="finding-uncertainty-input"
                      type="text"
                      value={findingUncertainty}
                      onChange={(e) => setFindingUncertainty(e.target.value)}
                      placeholder="e.g. Small sample size in European region"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="finding-explanation-input" className="text-xs font-bold text-slate-700">Evidence Explanation</label>
                  <textarea
                    id="finding-explanation-input"
                    rows={2}
                    value={findingExplanation}
                    onChange={(e) => setFindingExplanation(e.target.value)}
                    placeholder="Explain the data evidence, metric comparison, or statistical calculation..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#7B4A28] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-amber-200/60">
                  <button
                    type="button"
                    onClick={() => setShowFindingForm(false)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !findingStatement.trim()}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#7B4A28] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#633B20] disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <BookmarkPlus size={13} />
                    )}
                    Save Finding
                  </button>
                </div>
              </form>
            )}

            {workspaceLoading ? (
              <div className="py-6 text-center text-xs text-slate-500">Loading findings...</div>
            ) : findings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                No findings recorded yet. Inspect datasets, perform cohort analysis, and pin or add findings.
              </div>
            ) : (
              <div className="space-y-3">
                {findings.map((f, idx) => (
                  <div
                    key={f.id || idx}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{f.statement}</h4>
                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-[10px] text-indigo-800">
                        Finding #{idx + 1}
                      </span>
                    </div>
                    {Array.isArray(f.evidence) && f.evidence.length > 0 && (
                      <p className="text-[11px] text-slate-600">
                        <strong className="text-slate-700">Evidence:</strong>{" "}
                        {f.evidence[0].explanation || f.evidence[0].resource_id}
                      </p>
                    )}
                    {f.uncertainty && (
                      <p className="text-[11px] text-slate-500 italic">
                        Uncertainty: {f.uncertainty}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: Task, Manager & Completion                                   */}
        {/* ========================================================================= */}
        <div className="space-y-4 lg:col-span-3">
          {/* MANAGER CARD */}
          <div className="rounded-3xl border border-[#E5DEC9] bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B4A28]/10 text-sm font-bold text-[#7B4A28]">
                {manager.name ? manager.name[0] : "M"}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">{manager.name || "Lead"}</h3>
                <p className="text-[11px] text-slate-500">{manager.title || "Data Science Lead"}</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              {briefing.task ||
                "Analyze the dataset slices, evaluate baseline vs production metrics, and prepare evidence-backed findings."}
            </p>
          </div>

          {/* COMPLETION CHECKLIST */}
          <div className="rounded-3xl border border-[#E5DEC9] bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Completion Checklist
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  {findings.length >= requiredFindingsCount ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : (
                    <Lock size={14} className="text-slate-400" />
                  )}
                  Record at least {requiredFindingsCount} finding
                </span>
                <span className="font-mono text-slate-500">
                  {findings.length}/{requiredFindingsCount}
                </span>
              </div>

              {requiredResourceAccess.map((reqId) => {
                const hasAccessed = accessedResourceIds.has(reqId);
                return (
                  <div key={reqId} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-700 truncate max-w-[160px]">
                      {hasAccessed ? (
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Lock size={14} className="text-slate-400 shrink-0" />
                      )}
                      Inspect {reqId}
                    </span>
                    <span className="font-mono text-slate-500">
                      {hasAccessed ? "Done" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={actionLoading || !isInvestigationPhase}
                onClick={handleCompleteInvestigation}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7B4A28] px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#633B20] disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Completing...
                  </>
                ) : (
                  <>
                    Complete investigation <Rocket size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
