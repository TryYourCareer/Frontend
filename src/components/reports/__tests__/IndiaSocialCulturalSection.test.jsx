import React from "react";
import { render, screen } from "@testing-library/react";
import IndiaSocialCulturalSection from "../IndiaSocialCulturalSection";

describe("IndiaSocialCulturalSection & Social/Cultural Evidence", () => {
  const sampleSocialCultural = {
    india_specific_perception: "Rapidly growing demand in Indian tech clusters (Bengaluru, Hyderabad, Pune). Strong industry hiring for product-focused engineers.",
    has_social_stigma: false,
    benchmark_perception: "High professional recognition across both multinational corporations and Indian startups.",
    tier_differences: "Concentrated predominantly in Tier-1 metros with expanding remote roles in Tier-2 innovation hubs.",
    source: "Regional Career Intelligence & AISHE Survey",
    as_of: "2025-Q3",
    confidence: "HIGH",
    status: "AVAILABLE",
  };

  const sampleMarketOutlook = {
    india_salary: {
      entry: "₹6.0 - 8.5 LPA",
      median: "₹16.0 - 24.0 LPA",
      experienced: "₹35.0+ LPA",
    },
  };

  const samplePathForward = {
    required_streams: ["Science (PCM)", "Science (Computer Science)"],
    degrees: ["B.Tech in Computer Science", "B.E. Information Technology", "Integrated M.Tech"],
  };

  test("1. renders India-specific evidence when available", () => {
    render(
      <IndiaSocialCulturalSection
        socialCultural={sampleSocialCultural}
        marketOutlook={sampleMarketOutlook}
        pathForward={samplePathForward}
      />
    );

    expect(screen.getByTestId("india-social-cultural-section")).toBeInTheDocument();
    expect(screen.getByText(/India Occupational & Educational Context/i)).toBeInTheDocument();
    expect(screen.getByText(/Rapidly growing demand in Indian tech clusters/i)).toBeInTheDocument();
    expect(screen.getByText(/High professional recognition across both multinational corporations/i)).toBeInTheDocument();
    expect(screen.getByText(/Concentrated predominantly in Tier-1 metros/i)).toBeInTheDocument();
    expect(screen.getByText(/Science \(PCM\)/i)).toBeInTheDocument();
    expect(screen.getByText(/B.Tech in Computer Science/i)).toBeInTheDocument();
    expect(screen.getByText("₹6.0 - 8.5 LPA")).toBeInTheDocument();
    expect(screen.getByText("₹16.0 - 24.0 LPA")).toBeInTheDocument();
    expect(screen.getByText("₹35.0+ LPA")).toBeInTheDocument();
  });

  test("2. renders source and provenance when available", () => {
    render(
      <IndiaSocialCulturalSection
        socialCultural={sampleSocialCultural}
        marketOutlook={sampleMarketOutlook}
        pathForward={samplePathForward}
      />
    );

    expect(screen.getByText(/Source: Regional Career Intelligence & AISHE Survey/i)).toBeInTheDocument();
    expect(screen.getByText(/As of: 2025-Q3/i)).toBeInTheDocument();
    expect(screen.getByText(/Confidence: HIGH/i)).toBeInTheDocument();
  });

  test("3. handles unavailable perception note with explicit unavailable state without converting to 0", () => {
    const unavailableSocial = {
      india_specific_perception: null,
      status: "UNAVAILABLE",
      source: null,
    };

    render(
      <IndiaSocialCulturalSection
        socialCultural={unavailableSocial}
        marketOutlook={sampleMarketOutlook}
        pathForward={samplePathForward}
      />
    );

    expect(screen.getByTestId("india-perception-unavailable")).toBeInTheDocument();
    expect(
      screen.getByText(/India-specific occupational perception data is currently unavailable/i)
    ).toBeInTheDocument();

    // Verify missing data is NOT rendered as 0
    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^0%$/)).not.toBeInTheDocument();
  });

  test("4. does NOT render fabricated prestige rankings, social acceptance scores, or fake survey percentages", () => {
    render(
      <IndiaSocialCulturalSection
        socialCultural={sampleSocialCultural}
        marketOutlook={sampleMarketOutlook}
        pathForward={samplePathForward}
      />
    );

    // Verify absence of fabricated claims
    expect(screen.queryByText(/prestige rank/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/social acceptance score/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/society approval/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/percentile rank/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/parent sentiment score/i)).not.toBeInTheDocument();
  });

  test("5. handles completely empty/null data with a neutral unavailable fallback", () => {
    render(
      <IndiaSocialCulturalSection
        socialCultural={null}
        marketOutlook={null}
        pathForward={null}
      />
    );

    expect(screen.getByTestId("india-context-empty")).toBeInTheDocument();
    expect(
      screen.getByText(/India-specific regional and social context is currently unavailable/i)
    ).toBeInTheDocument();
  });

  test("6. adapts subtitle cleanly for Parent View presentation", () => {
    render(
      <IndiaSocialCulturalSection
        socialCultural={sampleSocialCultural}
        financialOutlook={{ india_lpa: sampleMarketOutlook.india_salary }}
        pathForward={samplePathForward}
        isParentView={true}
      />
    );

    expect(
      screen.getByText(/Verified regional intelligence on educational requirements, economic progression/i)
    ).toBeInTheDocument();
    expect(screen.getByText("₹6.0 - 8.5 LPA")).toBeInTheDocument();
  });
});
