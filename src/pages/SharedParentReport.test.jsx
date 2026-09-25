jest.mock("react-router-dom", () => ({
  useParams: () => ({ token: "mock_parent_token_456" }),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

jest.mock("../services/reports", () => ({
  __esModule: true,
  default: {
    getPublicSharedParentReport: jest.fn(),
  },
  getPublicSharedParentReport: jest.fn(),
}));

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import SharedParentReport from "./SharedParentReport";
import { getPublicSharedParentReport } from "../services/reports";

describe("SharedParentReport Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading state initially", () => {
    getPublicSharedParentReport.mockReturnValue(new Promise(() => {})); // Never resolves
    render(<SharedParentReport />);
    expect(screen.getByTestId("shared-parent-loading")).toBeInTheDocument();
  });

  test("renders parent report sections when token is valid and data is returned", async () => {
    getPublicSharedParentReport.mockResolvedValueOnce({
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
    });

    render(<SharedParentReport />);

    await waitFor(() => {
      expect(screen.getByTestId("shared-parent-report-container")).toBeInTheDocument();
      expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      expect(screen.getByText(/Secure Parent View/i)).toBeInTheDocument();
    });
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
