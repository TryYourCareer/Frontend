import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DataNotebookWorkspace, {
  parseDatasetContent,
  executeAnalyticalOperation,
} from "./DataNotebookWorkspace";

describe("DataNotebookWorkspace Analytical Engine", () => {
  const sampleCsvContent = `user_id,device,predicted_score,latency_ms,outcome
u1,iOS,0.85,120,1
u2,Android,0.40,95,0
u3,iOS,0.92,150,1
u4,iOS,0.30,110,0
u5,Android,0.75,85,1`;

  test("parses CSV content into structured columns and typed rows", () => {
    const res = parseDatasetContent(sampleCsvContent, { format: "csv" });
    expect(res.isTabular).toBe(true);
    expect(res.columns).toEqual(["user_id", "device", "predicted_score", "latency_ms", "outcome"]);
    expect(res.rows).toHaveLength(5);
    expect(res.rows[0].predicted_score).toBe(0.85);
    expect(res.rows[0].outcome).toBe(1);
  });

  test("parses JSON array content into structured columns and rows", () => {
    const jsonStr = JSON.stringify([
      { model_id: "m1", accuracy: 0.94, latency: 45 },
      { model_id: "m2", accuracy: 0.89, latency: 30 },
    ]);
    const res = parseDatasetContent(jsonStr, {});
    expect(res.isTabular).toBe(true);
    expect(res.columns).toEqual(["model_id", "accuracy", "latency"]);
    expect(res.rows).toHaveLength(2);
  });

  test("parses metadata columns when explicit schema is supplied without CSV content", () => {
    const res = parseDatasetContent("", {
      columns: ["finding", "risk", "observation", "test_result"],
    });
    expect(res.isTabular).toBe(true);
    expect(res.columns).toEqual(["finding", "risk", "observation", "test_result"]);
  });

  test("executes filter_cohort operation deterministically", () => {
    const parsed = parseDatasetContent(sampleCsvContent, {});
    const filteredIos = executeAnalyticalOperation(parsed.rows, "filter_cohort", {
      column: "device",
      operator: "equals",
      value: "iOS",
    });

    expect(filteredIos.success).toBe(true);
    expect(filteredIos.data.totalRows).toBe(5);
    expect(filteredIos.data.matchedRows).toBe(3);
    expect(filteredIos.data.matchPercent).toBe(60);
    expect(filteredIos.summary).toContain("3 of 5 rows matched (60.0%)");
  });

  test("executes aggregate_metrics operation with mean, median, min, max stats", () => {
    const parsed = parseDatasetContent(sampleCsvContent, {});
    const agg = executeAnalyticalOperation(parsed.rows, "aggregate_metrics", {
      metricColumn: "latency_ms",
    });

    expect(agg.success).toBe(true);
    expect(agg.data.stats.count).toBe(5);
    expect(agg.data.stats.mean).toBe(112);
    expect(agg.data.stats.min).toBe(85);
    expect(agg.data.stats.max).toBe(150);
  });

  test("executes compare_distributions across two distinct cohorts", () => {
    const parsed = parseDatasetContent(sampleCsvContent, {});

    const comp = executeAnalyticalOperation(parsed.rows, "compare_distributions", {
      splitColumn: "device",
      cohortA: "Android",
      cohortB: "iOS",
      metricColumn: "predicted_score",
    });

    expect(comp.success).toBe(true);
    expect(comp.data.cohortA.count).toBe(2);
    expect(comp.data.cohortA.min).toBe(0.4);
    expect(comp.data.cohortA.max).toBe(0.75);
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

describe("DataNotebookWorkspace Dataset & Column Selector Data-Flow", () => {
  const datasetAssessment = {
    id: "res_assessment_findings",
    type: "dataset_table",
    title: "Assessment, observation, or test findings",
    content: "finding,risk,observation,test_result\nVariant A,High,Observed duplication,Positive\nVariant B,Low,Normal phenotype,Negative",
    metadata: {
      columns: ["finding", "risk", "observation", "test_result"],
    },
  };

  const datasetTelemetry = {
    id: "res_telemetry",
    type: "dataset_table",
    title: "Server Performance Telemetry",
    content: "server_id,region,cpu_pct,memory_gb\ns1,us-east,75,32\ns2,eu-west,45,16",
    metadata: {
      columns: ["server_id", "region", "cpu_pct", "memory_gb"],
    },
  };

  const datasetNoCols = {
    id: "res_doc_only",
    type: "document",
    title: "Plain Text Briefing",
    content: "Summary of observational criteria without columns.",
    metadata: {},
  };

  const baseProps = {
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
      task: "Analyze the dataset slices and verify column selectors.",
    },
    resources: [datasetAssessment, datasetTelemetry, datasetNoCols],
    accessedResourceIds: new Set(["res_assessment_findings"]),
    activeResource: null,
    setActiveResource: jest.fn(),
    handleAccessResource: jest.fn(),
    notesValue: "",
    setNotesValue: jest.fn(),
    notesStatus: "saved",
    findings: [],
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
    requiredResourceAccess: ["res_assessment_findings"],
    actionLoading: false,
    isInvestigationPhase: true,
  };

  test("1. when no dataset is selected, column selector shows '(Select dataset first)' and is disabled", () => {
    render(<DataNotebookWorkspace {...baseProps} activeResource={null} />);

    const columnSelect = screen.getByTestId("filter-column-select");
    expect(columnSelect).toBeDisabled();
    expect(columnSelect).toHaveValue("");
    expect(screen.getByText("(Select dataset first)")).toBeInTheDocument();
  });

  test("2. when 'Assessment, observation, or test findings' dataset is selected, its columns appear in the Column dropdown", () => {
    render(<DataNotebookWorkspace {...baseProps} activeResource={datasetAssessment} />);

    const columnSelect = screen.getByTestId("filter-column-select");
    expect(columnSelect).not.toBeDisabled();
    expect(screen.queryByText("(Select dataset first)")).not.toBeInTheDocument();

    const options = Array.from(columnSelect.querySelectorAll("option")).map((o) => o.value);
    expect(options).toEqual(["finding", "risk", "observation", "test_result"]);
    expect(columnSelect.value).toBe("finding");
  });

  test("3. user can select one of those columns and selection remains active", () => {
    render(<DataNotebookWorkspace {...baseProps} activeResource={datasetAssessment} />);

    const columnSelect = screen.getByTestId("filter-column-select");
    fireEvent.change(columnSelect, { target: { value: "observation" } });

    expect(columnSelect.value).toBe("observation");
  });

  test("4. switching to another existing structured dataset updates Column options accordingly", () => {
    const { rerender } = render(
      <DataNotebookWorkspace {...baseProps} activeResource={datasetAssessment} />
    );

    let columnSelect = screen.getByTestId("filter-column-select");
    expect(Array.from(columnSelect.querySelectorAll("option")).map((o) => o.value)).toEqual([
      "finding",
      "risk",
      "observation",
      "test_result",
    ]);

    // Switch to datasetTelemetry
    rerender(<DataNotebookWorkspace {...baseProps} activeResource={datasetTelemetry} />);

    columnSelect = screen.getByTestId("filter-column-select");
    expect(Array.from(columnSelect.querySelectorAll("option")).map((o) => o.value)).toEqual([
      "server_id",
      "region",
      "cpu_pct",
      "memory_gb",
    ]);
    expect(columnSelect.value).toBe("server_id");
  });

  test("5. previously selected column is cleared if it does not exist in the newly selected dataset", () => {
    const { rerender } = render(
      <DataNotebookWorkspace {...baseProps} activeResource={datasetAssessment} />
    );

    const columnSelect = screen.getByTestId("filter-column-select");
    fireEvent.change(columnSelect, { target: { value: "test_result" } });
    expect(columnSelect.value).toBe("test_result");

    // Switch to datasetTelemetry (does not have 'test_result')
    rerender(<DataNotebookWorkspace {...baseProps} activeResource={datasetTelemetry} />);

    // Resets to first column of the new dataset
    expect(screen.getByTestId("filter-column-select").value).toBe("server_id");
  });

  test("6. clicking left panel dataset card calls handleAccessResource and updates selection", () => {
    const mockAccess = jest.fn();
    const mockSetActive = jest.fn();

    render(
      <DataNotebookWorkspace
        {...baseProps}
        handleAccessResource={mockAccess}
        setActiveResource={mockSetActive}
        activeResource={null}
      />
    );

    const datasetCard = screen.getByTestId("dataset-card-res_assessment_findings");
    fireEvent.click(datasetCard);

    expect(mockAccess).toHaveBeenCalledWith("res_assessment_findings");
    expect(mockSetActive).toHaveBeenCalledWith(datasetAssessment);
  });
});
