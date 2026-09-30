jest.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

jest.mock("../../../services/reports", () => ({
  __esModule: true,
  default: {
    exportReportPdf: jest.fn(),
    getExportStatus: jest.fn(),
    createParentShareLink: jest.fn(),
  },
  exportReportPdf: jest.fn(),
  getExportStatus: jest.fn(),
  createParentShareLink: jest.fn(),
}));

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import ReportActionBar, { toBackendDownloadUrl } from "../ReportActionBar";
import { exportReportPdf, getExportStatus, createParentShareLink } from "../../../services/reports";
import BACKEND_BASE_URL from "../../../API/BaseURL";

describe("ReportActionBar Component (PDF Export & Parent Sharing)", () => {
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    Object.assign(navigator, {
      clipboard: originalClipboard,
    });
  });

  test("renders export dropdown trigger, parent share button, and view switcher", () => {
    render(
      <ReportActionBar
        reportType="student"
        careerName="Software Engineer"
        careerId="software-engineer"
      />
    );

    expect(screen.getByTestId("export-report-button")).toBeInTheDocument();
    expect(screen.getByTestId("share-report-button")).toBeInTheDocument();
    expect(screen.getByText("Parent Report")).toBeInTheDocument();
    expect(screen.getByText("Verified Canonical Report")).toBeInTheDocument();
  });

  test("renders parent switch label for parent report", () => {
    render(
      <ReportActionBar
        reportType="parent"
        careerName="Data Scientist"
        careerId="data-scientist"
      />
    );

    expect(screen.getByText("Switch to Student Decision Report")).toBeInTheDocument();
  });

  test("teaser report disables export trigger and share button", () => {
    render(
      <ReportActionBar
        reportType="student"
        careerName="Software Engineer"
        careerId="software-engineer"
        isTeaser={true}
      />
    );

    const exportBtn = screen.getByTestId("export-report-button");
    const shareBtn = screen.getByTestId("share-report-button");
    expect(exportBtn).toBeDisabled();
    expect(shareBtn).toBeDisabled();
  });

  test("A. POST /export returns READY + relative signed_url -> constructs backend download URL, triggers download, clears loading without polling", async () => {
    const relativeSignedUrl = "/api/reports/exports/924352a2-c895-4365-91ca-39f307dba183/download?token=sample_token_xyz";
    
    exportReportPdf.mockResolvedValueOnce({
      id: "924352a2-c895-4365-91ca-39f307dba183",
      export_type: "STUDENT",
      status: "READY",
      storage_path: "storage/report_exports/924352a2-c895-4365-91ca-39f307dba183.pdf",
      signed_url: relativeSignedUrl,
      error_message: null,
      completed_at: "2026-09-30T06:41:41.140543Z",
    });

    render(
      <ReportActionBar
        reportType="student"
        careerName="Software Engineer"
        careerId="035d8ee2-c9ef-41ee-bfd7-c77add64bcf7"
      />
    );

    // Click dropdown trigger
    fireEvent.click(screen.getByTestId("export-report-button"));
    // Click Student PDF export
    fireEvent.click(screen.getByTestId("export-student-pdf-btn"));

    await waitFor(() => {
      expect(exportReportPdf).toHaveBeenCalledWith("035d8ee2-c9ef-41ee-bfd7-c77add64bcf7", "student");
    });

    // Verify download ready link is rendered with BACKEND origin, not frontend origin
    const downloadLink = await screen.findByTestId("download-ready-link");
    expect(downloadLink).toBeInTheDocument();
    
    const expectedBase = (BACKEND_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");
    expect(downloadLink.getAttribute("href")).toBe(`${expectedBase}${relativeSignedUrl}`);
    expect(downloadLink.getAttribute("href")).not.toContain("http://localhost:3000");

    // Polling must NOT be initiated when already READY
    expect(getExportStatus).not.toHaveBeenCalled();

    // Loading indicator must clear immediately
    expect(screen.queryByText(/Generating/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("export-report-button")).not.toBeDisabled();
  });

  test("B & C. POST /export returns PROCESSING -> polls -> returns READY -> triggers download and stops polling", async () => {
    jest.useFakeTimers();
    try {
      const relativeSignedUrl = "/api/reports/exports/exp-poll-999/download?token=ready_token";

      // 1st call: exportReportPdf returns PROCESSING
      exportReportPdf.mockResolvedValueOnce({
        id: "exp-poll-999",
        export_type: "STUDENT",
        status: "PROCESSING",
      });

      // 2nd call: getExportStatus returns READY
      getExportStatus.mockResolvedValueOnce({
        id: "exp-poll-999",
        export_type: "STUDENT",
        status: "READY",
        signed_url: relativeSignedUrl,
      });

      render(
        <ReportActionBar
          reportType="student"
          careerName="Software Engineer"
          careerId="career-poll-1"
        />
      );

      fireEvent.click(screen.getByTestId("export-report-button"));
      fireEvent.click(screen.getByTestId("export-student-pdf-btn"));

      // Let initial export promise resolve and state update
      await act(async () => {
        await Promise.resolve();
      });

      expect(exportReportPdf).toHaveBeenCalledWith("career-poll-1", "student");

      // Advance timer by 1600ms to trigger the poll
      await act(async () => {
        jest.advanceTimersByTime(1600);
        await Promise.resolve();
      });

      expect(getExportStatus).toHaveBeenCalledWith("exp-poll-999");

      // Download ready link appears with resolved backend URL
      const downloadLink = screen.getByTestId("download-ready-link");
      expect(downloadLink).toBeInTheDocument();
      const expectedBase = (BACKEND_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");
      expect(downloadLink.getAttribute("href")).toBe(`${expectedBase}${relativeSignedUrl}`);

      // Loading should be finished
      expect(screen.queryByText(/Generating/i)).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  test("D. Export request failure terminates loading and displays error", async () => {
    exportReportPdf.mockRejectedValueOnce(new Error("Server PDF generation failed"));

    render(
      <ReportActionBar
        reportType="student"
        careerName="Software Engineer"
        careerId="software-engineer"
      />
    );

    fireEvent.click(screen.getByTestId("export-report-button"));
    fireEvent.click(screen.getByTestId("export-student-pdf-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("export-error-notice")).toBeInTheDocument();
      expect(screen.getByText(/Server PDF generation failed/i)).toBeInTheDocument();
    });

    // Button should not be stuck loading
    expect(screen.queryByText(/Generating/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("export-report-button")).not.toBeDisabled();
  });

  test("E. Malformed/missing signed_url when READY terminates loading and shows error", async () => {
    exportReportPdf.mockResolvedValueOnce({
      id: "exp-no-url",
      export_type: "STUDENT",
      status: "READY",
      signed_url: null,
      download_url: null,
    });

    render(
      <ReportActionBar
        reportType="student"
        careerName="Software Engineer"
        careerId="software-engineer"
      />
    );

    fireEvent.click(screen.getByTestId("export-report-button"));
    fireEvent.click(screen.getByTestId("export-student-pdf-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("export-error-notice")).toBeInTheDocument();
      expect(screen.getByText(/download URL is missing/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Generating/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("export-report-button")).not.toBeDisabled();
  });

  test("Verifies toBackendDownloadUrl helper resolves relative path against backend origin and keeps absolute URLs", () => {
    const expectedBase = (BACKEND_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");
    
    // Relative API path
    const relativePath = "/api/reports/exports/abc-123/download?token=xyz";
    expect(toBackendDownloadUrl(relativePath)).toBe(`${expectedBase}${relativePath}`);
    expect(toBackendDownloadUrl(relativePath)).not.toBe(`http://localhost:3000${relativePath}`);

    // Absolute S3 / external URL
    const absoluteUrl = "https://s3.amazonaws.com/my-bucket/report.pdf";
    expect(toBackendDownloadUrl(absoluteUrl)).toBe(absoluteUrl);

    // Empty URL
    expect(toBackendDownloadUrl("")).toBe("");
    expect(toBackendDownloadUrl(null)).toBe("");
  });

  test("opens share with parent modal and generates absolute expiring share link from relative path", async () => {
    createParentShareLink.mockResolvedValueOnce({
      token: "secret_token_123",
      share_url: "/shared/parent/secret_token_123",
      expires_at: "2026-10-01T00:00:00Z",
    });

    render(
      <ReportActionBar
        reportType="student"
        careerName="Software Engineer"
        careerId="software-engineer"
      />
    );

    // Click Share with Parent
    fireEvent.click(screen.getByTestId("share-report-button"));

    // Modal appears and triggers creation
    await waitFor(() => {
      expect(createParentShareLink).toHaveBeenCalledWith("software-engineer");
      expect(screen.getByTestId("share-modal-title")).toBeInTheDocument();
      expect(screen.getByText(/Link Valid For 7 Days/i)).toBeInTheDocument();
    });

    // Check that input contains complete absolute URL
    const input = screen.getByTestId("share-link-input");
    expect(input.value).toMatch(/^https?:\/\/.+\/shared\/parent\/secret_token_123$/);

    // Click Copy button and verify clipboard write
    fireEvent.click(screen.getByTestId("copy-share-link-btn"));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(input.value);
      expect(screen.getByText("Copied")).toBeInTheDocument();
    });
  });
});
