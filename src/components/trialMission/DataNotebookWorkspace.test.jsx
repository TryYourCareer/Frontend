import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DataNotebookWorkspace, {
  parseDatasetContent,
  executeAnalyticalOperation,
} from "./DataNotebookWorkspace";

describe("DataNotebookWorkspace - Analytical Operations Engine", () => {
  const sampleCsvContent = `user_id,device,predicted_score,latency_ms,outcome
u1,iOS,0.85,120,1
u2,Android,0.40,95,0
u3,iOS,0.92,150,1
u4,iOS,0.30,110,0
u5,Android,0.75,85,1`;

  const sampleJsonContent = JSON.stringify([
    { user_id: "u1", device: "iOS", predicted_score: 0.85, latency_ms: 120, outcome: 1 },
    { user_id: "u2", device: "Android", predicted_score: 0.40, latency_ms: 95, outcome: 0 },
    { user_id: "u3", device: "iOS", predicted_score: 0.92, latency_ms: 150, outcome: 1 },
    { user_id: "u4", device: "iOS", predicted_score: 0.30, latency_ms: 110, outcome: 0 },
    { user_id: "u5", device: "Android", predicted_score: 0.75, latency_ms: 85, outcome: 1 },
  ]);

  test("parseDatasetContent parses CSV text correctly", () => {
    const parsed = parseDatasetContent(sampleCsvContent, {});
    expect(parsed.isTabular).toBe(true);
    expect(parsed.columns).toEqual(["user_id", "device", "predicted_score", "latency_ms", "outcome"]);
    expect(parsed.rows.length).toBe(5);
    expect(parsed.rows[0].device).toBe("iOS");
    expect(parsed.rows[0].latency_ms).toBe(120);
    expect(parsed.rows[0].predicted_score).toBe(0.85);
  });

  test("parseDatasetContent parses JSON array correctly", () => {
    const parsed = parseDatasetContent(sampleJsonContent, {});
    expect(parsed.isTabular).toBe(true);
    expect(parsed.columns).toEqual(["user_id", "device", "predicted_score", "latency_ms", "outcome"]);
    expect(parsed.rows.length).toBe(5);
    expect(parsed.rows[1].device).toBe("Android");
    expect(parsed.rows[1].latency_ms).toBe(95);
  });

  test("parseDatasetContent gracefully handles unstructured text and metadata", () => {
    const textContent = "This is a descriptive document without tabular structure.";
    const parsed = parseDatasetContent(textContent, {});
    expect(parsed.isTabular).toBe(false);
    expect(parsed.rows.length).toBe(0);
    expect(parsed.raw).toBe(textContent);

    const emptyParsed = parseDatasetContent("", null);
    expect(emptyParsed.isTabular).toBe(false);
    expect(emptyParsed.columns).toEqual([]);
  });

  test("filter_cohort produces deterministic filtered results", () => {
    const parsed = parseDatasetContent(sampleCsvContent, {});
    
    // Filter device equals iOS
    const resIos = executeAnalyticalOperation(parsed.rows, "filter_cohort", {
      column: "device",
      operator: "equals",
      value: "iOS",
    });

    expect(resIos.success).toBe(true);
    expect(resIos.data.totalRows).toBe(5);
    expect(resIos.data.matchedRows).toBe(3);
    expect(resIos.data.matchPercent).toBe(60.0);
    expect(resIos.data.rows.every((r) => r.device === "iOS")).toBe(true);

    // Filter latency_ms greater_than 100
    const resLatency = executeAnalyticalOperation(parsed.rows, "filter_cohort", {
      column: "latency_ms",
      operator: "greater_than",
      value: "100",
    });

    expect(resLatency.success).toBe(true);
    expect(resLatency.data.matchedRows).toBe(3); // 120, 150, 110
  });

  test("aggregate_metrics produces deterministic summary statistics", () => {
    const parsed = parseDatasetContent(sampleCsvContent, {});

    // Overall aggregate for latency_ms: [85, 95, 110, 120, 150]
    // sum = 560, mean = 112.00, median = 110, min = 85, max = 150
    const agg = executeAnalyticalOperation(parsed.rows, "aggregate_metrics", {
      metricColumn: "latency_ms",
    });

    expect(agg.success).toBe(true);
    expect(agg.data.stats.count).toBe(5);
    expect(agg.data.stats.mean).toBe(112.0);
    expect(agg.data.stats.median).toBe(110.0);
    expect(agg.data.stats.min).toBe(85.0);
    expect(agg.data.stats.max).toBe(150.0);
    expect(agg.data.stats.sum).toBe(560.0);

    // Grouped aggregate for latency_ms by device
    const groupedAgg = executeAnalyticalOperation(parsed.rows, "aggregate_metrics", {
      metricColumn: "latency_ms",
      groupByColumn: "device",
    });

    expect(groupedAgg.success).toBe(true);
    expect(groupedAgg.data.groups.length).toBe(2);
    const androidGroup = groupedAgg.data.groups.find((g) => g.group === "Android");
    const iosGroup = groupedAgg.data.groups.find((g) => g.group === "iOS");
    
    // Android: 85, 95 -> mean = 90.0, median = 90.0
    expect(androidGroup.count).toBe(2);
    expect(androidGroup.mean).toBe(90.0);
    // iOS: 120, 150, 110 -> sorted [110, 120, 150] -> mean = 126.67, median = 120.0
    expect(iosGroup.count).toBe(3);
    expect(iosGroup.mean).toBe(126.67);
    expect(iosGroup.median).toBe(120.0);
  });

  test("compare_distributions calculates cohort differences deterministically", () => {
    const parsed = parseDatasetContent(sampleCsvContent, {});

    const comp = executeAnalyticalOperation(parsed.rows, "compare_distributions", {
      splitColumn: "device",
      cohortA: "Android",
      cohortB: "iOS",
      metricColumn: "predicted_score",
    });

    expect(comp.success).toBe(true);
    // Android predicted_scores: [0.40, 0.75] -> sum 1.15
    expect(comp.data.cohortA.count).toBe(2);
    expect(comp.data.cohortA.min).toBe(0.4);
    expect(comp.data.cohortA.max).toBe(0.75);
    // iOS predicted_scores: [0.85, 0.92, 0.30] -> sorted [0.30, 0.85, 0.92] -> mean = 0.69, median = 0.85
    expect(comp.data.cohortB.count).toBe(3);
    expect(comp.data.cohortB.mean).toBe(0.69);
    expect(comp.data.cohortB.median).toBe(0.85);
  });

  test("handles invalid parameters and empty dataset gracefully without crashing", () => {
    expect(executeAnalyticalOperation([], "filter_cohort", {}).success).toBe(false);
    expect(executeAnalyticalOperation(null, "aggregate_metrics", {}).success).toBe(false);

    const parsed = parseDatasetContent(sampleCsvContent, {});
    const missingColRes = executeAnalyticalOperation(parsed.rows, "filter_cohort", {});
    expect(missingColRes.success).toBe(false);
    expect(missingColRes.error).toContain("Select a column");

    const unsupportedRes = executeAnalyticalOperation(parsed.rows, "unknown_op", {});
    expect(unsupportedRes.success).toBe(false);
    expect(unsupportedRes.error).toContain("Unsupported analytical operation");
  });
});

describe("DataNotebookWorkspace Component", () => {
  const mockProps = {
    session: {
      id: "sess_data_test_123",
      mission_title: "Audit Prediction Model Drift",
      current_phase: "investigate",
      workspace_type: "data_notebook",
    },
    manager: {
      name: "Dr. Elena Vance",
      title: "VP of Data & AI",
    },
    briefing: {
      task: "Analyze the feature shift across iOS and Android cohorts and log statistical findings.",
    },
    resources: [
      {
        id: "res_feature_store",
        type: "dataset_table",
        title: "Model Inference Logs v2",
        content: `user_id,device,predicted_score,latency_ms,outcome\nu1,iOS,0.85,120,1\nu2,Android,0.40,95,0\nu3,iOS,0.92,150,1\nu4,iOS,0.30,110,0\nu5,Android,0.75,85,1`,
        metadata: { format: "csv" },
      },
      {
        id: "res_architecture_doc",
        type: "document",
        title: "Model Architecture Spec",
        content: "Detailed description of XGBoost feature pipeline and retraining constraints.",
        metadata: {},
      },
    ],
    accessedResourceIds: new Set(["res_feature_store"]),
    activeResource: {
      id: "res_feature_store",
      type: "dataset_table",
      title: "Model Inference Logs v2",
      content: `user_id,device,predicted_score,latency_ms,outcome\nu1,iOS,0.85,120,1\nu2,Android,0.40,95,0\nu3,iOS,0.92,150,1\nu4,iOS,0.30,110,0\nu5,Android,0.75,85,1`,
      metadata: { format: "csv" },
    },
    setActiveResource: jest.fn(),
    handleAccessResource: jest.fn(),
    notesValue: "Hypothesis: iOS cohort exhibits significant variance.",
    setNotesValue: jest.fn(),
    notesStatus: "saved",
    findings: [
      {
        id: "find_1",
        statement: "iOS cohort latency averages 126.7ms, 40% higher than Android.",
        evidence: [{ resource_id: "res_feature_store", explanation: "Calculated from inference logs" }],
        uncertainty: "Small sample size",
      },
    ],
    workspaceLoading: false,
    showFindingForm: false,
    setShowFindingForm: jest.fn(),
    findingStatement: "",
    setFindingStatement: jest.fn(),
    findingResource: "",
    setFindingResource: jest.fn(),
    findingExplanation: "",
    setFindingExplanation: jest.fn(),
    findingUncertainty: "",
    setFindingUncertainty: jest.fn(),
    handleSaveNewFinding: jest.fn((e) => e?.preventDefault && e.preventDefault()),
    handleCompleteInvestigation: jest.fn(),
    requiredFindingsCount: 1,
    requiredResourceAccess: ["res_feature_store"],
    actionLoading: false,
    isInvestigationPhase: true,
  };

  test("renders from configuration props without hardcoded assumptions", () => {
    render(<DataNotebookWorkspace {...mockProps} />);

    expect(screen.getByTestId("data-notebook-workspace")).toBeInTheDocument();
    expect(screen.getByText("Audit Prediction Model Drift")).toBeInTheDocument();
    expect(screen.getByText("Dr. Elena Vance")).toBeInTheDocument();
    expect(screen.getAllByText("Model Inference Logs v2").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Model Architecture Spec")).toBeInTheDocument();
    expect(screen.getByText("Hypothesis: iOS cohort exhibits significant variance.")).toBeInTheDocument();
    expect(screen.getByText("iOS cohort latency averages 126.7ms, 40% higher than Android.")).toBeInTheDocument();
  });

  test("triggers handleAccessResource when clicking resource inspect button", () => {
    render(<DataNotebookWorkspace {...mockProps} />);

    const inspectButtons = screen.getAllByRole("button", { name: /inspect/i });
    fireEvent.click(inspectButtons[0]);
    expect(mockProps.handleAccessResource).toHaveBeenCalledWith("res_feature_store");
  });

  test("allows running analytical operation and pinning result to finding form", () => {
    render(<DataNotebookWorkspace {...mockProps} />);

    // Click Run Analysis
    const runBtn = screen.getByRole("button", { name: /Run Analysis/i });
    fireEvent.click(runBtn);

    // Pin as Finding should appear in results
    const pinBtn = screen.getByRole("button", { name: /Pin as Finding/i });
    expect(pinBtn).toBeInTheDocument();

    fireEvent.click(pinBtn);
    expect(mockProps.setShowFindingForm).toHaveBeenCalledWith(true);
    expect(mockProps.setFindingResource).toHaveBeenCalledWith("res_feature_store");
    expect(mockProps.setFindingStatement).toHaveBeenCalled();
  });

  test("triggers handleCompleteInvestigation when complete button clicked", () => {
    render(<DataNotebookWorkspace {...mockProps} />);

    const completeBtn = screen.getByRole("button", { name: /Complete investigation/i });
    fireEvent.click(completeBtn);
    expect(mockProps.handleCompleteInvestigation).toHaveBeenCalledTimes(1);
  });

  test("degrades gracefully when non-tabular resource is active", () => {
    const nonTabularProps = {
      ...mockProps,
      activeResource: {
        id: "res_architecture_doc",
        type: "document",
        title: "Model Architecture Spec",
        content: "Detailed description of XGBoost feature pipeline and retraining constraints.",
        metadata: {},
      },
    };

    render(<DataNotebookWorkspace {...nonTabularProps} />);
    expect(screen.getByText(/Non-tabular document evidence/i)).toBeInTheDocument();
    expect(screen.getByText(/Detailed description of XGBoost feature pipeline/i)).toBeInTheDocument();
  });

  test("binds notes scratchpad input and triggers setNotesValue on change", () => {
    render(<DataNotebookWorkspace {...mockProps} />);

    const notesTextarea = screen.getByPlaceholderText(/Record feature hypotheses/i);
    expect(notesTextarea).toHaveValue("Hypothesis: iOS cohort exhibits significant variance.");

    fireEvent.change(notesTextarea, { target: { value: "Updated hypothesis note." } });
    expect(mockProps.setNotesValue).toHaveBeenCalledWith("Updated hypothesis note.");
  });

  test("submits finding form through handleSaveNewFinding", () => {
    const formOpenProps = {
      ...mockProps,
      showFindingForm: true,
      findingStatement: "Drift verified.",
    };

    render(<DataNotebookWorkspace {...formOpenProps} />);

    const saveBtn = screen.getByRole("button", { name: /Save Finding/i });
    fireEvent.submit(saveBtn.closest("form"));
    expect(mockProps.handleSaveNewFinding).toHaveBeenCalled();
  });

  test("contains zero localStorage usage for mission state", () => {
    const localStorageSpy = jest.spyOn(Storage.prototype, "setItem");
    render(<DataNotebookWorkspace {...mockProps} />);
    expect(localStorageSpy).not.toHaveBeenCalled();
    localStorageSpy.mockRestore();
  });
});
