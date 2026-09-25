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
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReportActionBar from "../ReportActionBar";
import { exportReportPdf, getExportStatus, createParentShareLink } from "../../../services/reports";

describe("ReportActionBar Component (PDF Export & Parent Sharing)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  test("opens export menu and triggers PDF export job", async () => {
    exportReportPdf.mockResolvedValueOnce({
      id: "exp-123",
      status: "QUEUED",
      export_type: "student",
    });

    getExportStatus.mockResolvedValueOnce({
      id: "exp-123",
      status: "READY",
      download_url: "https://example.com/download.pdf",
    });

    render(
      <ReportActionBar
        reportType="student"
        careerName="Software Engineer"
        careerId="software-engineer"
      />
    );

    // Click dropdown trigger
    fireEvent.click(screen.getByTestId("export-report-button"));

    // Check dropdown options
    expect(screen.getByTestId("export-student-pdf-btn")).toBeInTheDocument();
    expect(screen.getByTestId("export-parent-pdf-btn")).toBeInTheDocument();
    expect(screen.getByTestId("export-both-pdf-btn")).toBeInTheDocument();

    // Click Student PDF export
    fireEvent.click(screen.getByTestId("export-student-pdf-btn"));

    await waitFor(() => {
      expect(exportReportPdf).toHaveBeenCalledWith("software-engineer", "student");
    });
  });

  test("opens share with parent modal and generates expiring share link", async () => {
    createParentShareLink.mockResolvedValueOnce({
      token: "secret_token_123",
      share_url: "https://tryyourcareer.com/shared/parent/secret_token_123",
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
  });
});
