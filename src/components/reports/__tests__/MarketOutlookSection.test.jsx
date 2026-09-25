import React from "react";
import { render, screen } from "@testing-library/react";
import MarketOutlookSection from "../MarketOutlookSection";

describe("MarketOutlookSection", () => {
  const fullMarketData = {
    india_salary: {
      entry: "₹6-8 LPA",
      mid: "₹14-18 LPA",
      senior: "₹28-45 LPA",
    },
    global_salary: {
      entry: "$85,000 USD",
      mid: "$125,000 USD",
      senior: "$175,000+ USD",
    },
    demand_trend: "High Growth",
    demand_score: 88,
    demand_rationale: "Accelerated capacity expansion across biomanufacturing facilities in India and APAC.",
    projected_growth: "Projected annual expansion of manufacturing capacity across commercial bioreactor plants.",
    sectors: [
      "Biotechnology",
      "Pharmaceuticals",
      "Industrial Biomanufacturing",
      "AgriTech",
    ],
    geography: "National (Pan-India) with major bioclusters in Hyderabad, Bengaluru, and Pune.",
    research_date: "2026-09-01",
    caveats: "Salary figures represent industry research medians across metropolitan biotech hubs.",
  };

  test("1. renders the Market Outlook section with valid backend data", () => {
    render(<MarketOutlookSection marketOutlook={fullMarketData} />);

    expect(screen.getByRole("heading", { name: /External Market Outlook & Compensation/i })).toBeInTheDocument();
    expect(screen.getByText(/06 — Market Outlook/i)).toBeInTheDocument();
  });

  test("2. renders demand trend badge and demand rationale summary", () => {
    render(<MarketOutlookSection marketOutlook={fullMarketData} />);

    expect(screen.getByText(/Demand Trend: High Growth/i)).toBeInTheDocument();
    expect(screen.getByText("Demand Index: 88/100")).toBeInTheDocument();
    expect(screen.getByText(/Accelerated capacity expansion across biomanufacturing facilities/i)).toBeInTheDocument();
  });

  test("3. renders India compensation tiers without modifying currency values", () => {
    render(<MarketOutlookSection marketOutlook={fullMarketData} />);

    expect(screen.getByText("India Compensation")).toBeInTheDocument();
    expect(screen.getByText("₹6-8 LPA")).toBeInTheDocument();
    expect(screen.getByText("₹14-18 LPA")).toBeInTheDocument();
    expect(screen.getByText("₹28-45 LPA")).toBeInTheDocument();
  });

  test("4. renders global compensation tiers without converting currencies", () => {
    render(<MarketOutlookSection marketOutlook={fullMarketData} />);

    expect(screen.getByText("Global Market Benchmarks")).toBeInTheDocument();
    expect(screen.getByText("$85,000 USD")).toBeInTheDocument();
    expect(screen.getByText("$125,000 USD")).toBeInTheDocument();
    expect(screen.getByText("$175,000+ USD")).toBeInTheDocument();
  });

  test("5. renders industry sectors list", () => {
    render(<MarketOutlookSection marketOutlook={fullMarketData} />);

    expect(screen.getByText("Biotechnology")).toBeInTheDocument();
    expect(screen.getByText("Pharmaceuticals")).toBeInTheDocument();
    expect(screen.getByText("Industrial Biomanufacturing")).toBeInTheDocument();
    expect(screen.getByText("AgriTech")).toBeInTheDocument();
  });

  test("6. renders growth dynamics and geographic scope", () => {
    render(<MarketOutlookSection marketOutlook={fullMarketData} />);

    expect(screen.getByText(/Projected annual expansion of manufacturing capacity/i)).toBeInTheDocument();
    expect(screen.getByText(/National \(Pan-India\) with major bioclusters in Hyderabad/i)).toBeInTheDocument();
  });

  test("7. renders research date and market caveats", () => {
    render(<MarketOutlookSection marketOutlook={fullMarketData} />);

    expect(screen.getByText(/Market benchmark research as of: 2026-09-01/i)).toBeInTheDocument();
    expect(screen.getByText(/Note: Salary figures represent industry research medians/i)).toBeInTheDocument();
  });

  test("8. handles null market_outlook safely with human-readable unavailable state", () => {
    render(<MarketOutlookSection marketOutlook={null} />);

    expect(screen.getByText(/06 — Market Outlook/i)).toBeInTheDocument();
    expect(screen.getByText(/Market and compensation data is not currently available for this career./i)).toBeInTheDocument();
  });

  test("9. handles missing salary data safely with clean placeholder messages", () => {
    const noSalary = {
      demand_trend: "Moderate",
      demand_rationale: "Stable industrial demand.",
    };
    render(<MarketOutlookSection marketOutlook={noSalary} />);

    expect(screen.getByText(/No salary data is available yet for this career./i)).toBeInTheDocument();
  });

  test("10. handles missing demand data safely without interpreting it as low demand", () => {
    const noDemand = {
      india_salary: { entry: "₹5-7 LPA" },
    };
    const { container } = render(<MarketOutlookSection marketOutlook={noDemand} />);

    expect(screen.getByText(/Market demand data is not currently available for this career./i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\b(Low Demand|Declining|Unfavorable)\b/i);
  });

  test("11. handles missing global salary while displaying India salary safely", () => {
    const indiaOnly = {
      india_salary: { entry: "₹6-8 LPA", mid: "₹14-18 LPA" },
      demand_trend: "High",
    };
    render(<MarketOutlookSection marketOutlook={indiaOnly} />);

    expect(screen.getByText("₹6-8 LPA")).toBeInTheDocument();
    expect(screen.getByText(/Global compensation data is not currently available./i)).toBeInTheDocument();
  });

  test("12. handles nested salary structure safely (e.g. salary.india and salary.global_salary)", () => {
    const nestedMarket = {
      salary: {
        india: { entry: "₹7-9 LPA" },
        global_salary: { entry: "$90,000 USD" },
      },
      demand: {
        trend: "Very High",
        rationale: "High demand in bio-processing.",
      },
    };
    render(<MarketOutlookSection marketOutlook={nestedMarket} />);

    expect(screen.getByText("₹7-9 LPA")).toBeInTheDocument();
    expect(screen.getByText("$90,000 USD")).toBeInTheDocument();
    expect(screen.getByText("Demand Trend: Very High")).toBeInTheDocument();
    expect(screen.getByText("High demand in bio-processing.")).toBeInTheDocument();
  });

  test("13. does not expose internal IDs or snake_case field names", () => {
    const dataWithSnakeKeys = {
      salary_india_lpa: { entry_level: "₹6-8 LPA" },
      demand_trend_raw: "high_growth",
      internal_career_id: "career-uuid-12345",
      demand_score: 85,
    };

    const { container } = render(<MarketOutlookSection marketOutlook={dataWithSnakeKeys} />);

    expect(container.textContent).not.toContain("salary_india_lpa");
    expect(container.textContent).not.toContain("demand_trend_raw");
    expect(container.textContent).not.toContain("internal_career_id");
    expect(screen.getByText("Entry Level")).toBeInTheDocument();
  });

  test("14. does not claim data is live or real-time unless stated", () => {
    const { container } = render(<MarketOutlookSection marketOutlook={fullMarketData} />);

    expect(container.textContent).not.toMatch(/\b(Live market data|Real-time salary data|Live hiring data)\b/i);
  });

  test("15. does not calculate artificial market scores or averages", () => {
    const { container } = render(<MarketOutlookSection marketOutlook={fullMarketData} />);

    expect(container.textContent).not.toMatch(/\b(Average Salary|CAGR|Salary Midpoint|Market Score:)\b/i);
  });
});
