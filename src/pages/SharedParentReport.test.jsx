jest.mock("react-router-dom", () => ({
  useParams: () => ({ token: "mock_parent_token_456" }),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

jest.mock("../components/reports/ReportActionBar", () => ({
  __esModule: true,
  toBackendDownloadUrl: (url) => `http://localhost:8000${url}`,
  triggerBrowserDownload: jest.fn(),
}));

jest.mock("../services/reports", () => ({
  __esModule: true,
  default: {
    getPublicSharedParentReport: jest.fn(),
    getSharedParentPdfUrl: jest.fn((token) => `/api/reports/shared/${token}/pdf`),
  },
  getPublicSharedParentReport: jest.fn(),
  getSharedParentPdfUrl: jest.fn((token) => `/api/reports/shared/${token}/pdf`),
}));

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import SharedParentReport from "./SharedParentReport";
import { getPublicSharedParentReport, getSharedParentPdfUrl } from "../services/reports";
import { triggerBrowserDownload } from "../components/reports/ReportActionBar";

const mockReportData = {
  career_id: "software-engineer",
  career_title: "Software Engineer",
  report_version: "2.1",
  expires_at: "2026-10-01T00:00:00Z",
  created_at: "2026-09-24T00:00:00Z",
  parent_report: {
    career_name: "Software Engineer",
    report_version: "2.1",
    snapshot: {
      recommendation: "Strong Proceed",
      confidence_score: 91,
      verdict_summary: "High career viability observed across tests.",
      career_name: "Software Engineer",
    },
    evidence: {
      key_findings: ["Strong coding intuition"],
    },
    comparisons: {
      compared_to_peers: "Top 15%",
    },
    ai_preparedness: {
      exposure_level: "Moderate",
    },
    financial_realities: {
      starting_salary_range: "$85,000 - $110,000",
    },
    backup_pathways: {
      adjacent_roles: ["Systems Analyst", "Technical Product Manager"],
    },
    faq: {
      questions: [{ q: "What degrees are required?", a: "Computer Science BS or equivalent" }],
    },
    what_child_needs: {
      support_priorities: ["Portfolio development"],
    },
    bottom_line: {
      summary: "Recommended for immediate investment.",
    },
  },
};

describe("SharedParentReport Component", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    getPublicSharedParentReport.mockReset();
    getSharedParentPdfUrl.mockReset();
    getSharedParentPdfUrl.mockImplementation((token) => `/api/reports/shared/${token}/pdf`);
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test("shows loading state initially", () => {
    getPublicSharedParentReport.mockImplementation(() => new Promise(() => {}));
    render(<SharedParentReport />);
    expect(screen.getByTestId("shared-parent-loading")).toBeInTheDocument();
  });

  test("renders parent report sections and download action when token is valid and data is returned", async () => {
    getPublicSharedParentReport.mockResolvedValue(mockReportData);

    render(<SharedParentReport />);

    await waitFor(() => {
      expect(screen.getByTestId("shared-parent-report-container")).toBeInTheDocument();
      expect(screen.getAllByText("Software Engineer").length).toBeGreaterThan(0);
      expect(screen.getByText(/Secure Parent View/i)).toBeInTheDocument();
      expect(screen.getByTestId("shared-parent-download-btn")).toBeInTheDocument();
      expect(screen.getByText(/Download PDF Report/i)).toBeInTheDocument();
    });
  });

  test("clicking download button triggers correct PDF fetch and browser download", async () => {
    getPublicSharedParentReport.mockResolvedValue(mockReportData);
    const mockBlob = new Blob(["%PDF-1.4 mock"], { type: "application/pdf" });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    });

    render(<SharedParentReport />);

    await waitFor(() => {
      expect(screen.getByTestId("shared-parent-download-btn")).toBeInTheDocument();
    });

    const downloadBtn = screen.getByTestId("shared-parent-download-btn");
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/reports/shared/mock_parent_token_456/pdf"
      );
      expect(triggerBrowserDownload).toHaveBeenCalledWith(
        mockBlob,
        "software-engineer-parent-briefing.pdf"
      );
    });
  });

  test("handles download failure visibly and displays error banner", async () => {
    getPublicSharedParentReport.mockResolvedValue(mockReportData);
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        detail: "This career is subject to clinical governance restrictions.",
      }),
    });

    render(<SharedParentReport />);

    await waitFor(() => {
      expect(screen.getByTestId("shared-parent-download-btn")).toBeInTheDocument();
    });

    const downloadBtn = screen.getByTestId("shared-parent-download-btn");
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(screen.getByTestId("shared-parent-download-error")).toBeInTheDocument();
      expect(
        screen.getByText("This career is subject to clinical governance restrictions.")
      ).toBeInTheDocument();
    });

    // Dismiss error
    const dismissBtn = screen.getByLabelText("Dismiss error");
    fireEvent.click(dismissBtn);

    expect(screen.queryByTestId("shared-parent-download-error")).not.toBeInTheDocument();
  });

  test("renders error message on 404/expired token", async () => {
    const err = new Error("Link expired");
    err.response = { status: 404, data: { detail: "Shared parent link not found or expired" } };
    getPublicSharedParentReport.mockRejectedValueOnce(err);

    render(<SharedParentReport />);

    await waitFor(() => {
      expect(screen.getByTestId("shared-parent-error")).toBeInTheDocument();
      expect(screen.getByText(/Shared parent link not found or expired/i)).toBeInTheDocument();
    });
  });
});

