import React from "react";
import { render, screen } from "@testing-library/react";
import ParentFinancialSection from "../ParentFinancialSection";

describe("ParentFinancialSection", () => {
  const mockFinancial = {
    salary_progression: {
      available: true,
      india_lpa: {
        entry: "4.5",
        median: "8.5",
        senior: "18.0",
      },
      global_usd: {
        entry: "65,000",
        senior: "140,000",
      },
      narrative: "Salaries for Software Engineer typically range from entry-level up to senior compensation.",
      cost_and_roi_note: "Tuition costs vary significantly across institutions; exact educational return on investment is not estimated here to avoid speculative projections.",
    },
    cost_and_roi_note: "Tuition costs vary significantly across institutions; exact educational return on investment is not estimated here to avoid speculative projections.",
  };

  test("renders full financial section with heading", () => {
    render(<ParentFinancialSection financialOutlook={mockFinancial} />);
    expect(
      screen.getByText("What It Will Cost and When It Pays Off")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Salaries for Software Engineer typically range from entry-level up to senior compensation.")
    ).toBeInTheDocument();
  });

  test("renders India and Global salary tiers accurately", () => {
    render(<ParentFinancialSection financialOutlook={mockFinancial} />);
    expect(screen.getByText("India Compensation (LPA)")).toBeInTheDocument();
    expect(screen.getByText("₹4.5 LPA")).toBeInTheDocument();
    expect(screen.getByText("₹8.5 LPA")).toBeInTheDocument();
    expect(screen.getByText("Global Compensation (USD)")).toBeInTheDocument();
    expect(screen.getByText("$65,000")).toBeInTheDocument();
  });

  test("renders cost and ROI disclaimer without fabricating calculations", () => {
    render(<ParentFinancialSection financialOutlook={mockFinancial} />);
    expect(
      screen.getByText(/Tuition costs vary significantly across institutions/i)
    ).toBeInTheDocument();
    // Verify no fabricated ROI calculation or loan repayment claims
    expect(screen.queryByText(/payback period/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/loan repayment/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/guaranteed salary/i)).not.toBeInTheDocument();
  });

  test("handles null or missing financialOutlook safely", () => {
    render(<ParentFinancialSection financialOutlook={null} />);
    expect(
      screen.getByText("What It Will Cost and When It Pays Off")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Market salary and financial outlook data is not currently available/i)
    ).toBeInTheDocument();
  });

  test("handles partial salary progression payload safely", () => {
    const partial = {
      salary_progression: {
        narrative: "Benchmark data in progress.",
      },
    };
    render(<ParentFinancialSection financialOutlook={partial} />);
    expect(screen.getByText("Benchmark data in progress.")).toBeInTheDocument();
    expect(
      screen.getByText(/Authoritative salary tiers are currently pending verification/i)
    ).toBeInTheDocument();
  });
});
