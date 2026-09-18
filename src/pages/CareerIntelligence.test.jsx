let mockParams = {};
let mockNavigate = jest.fn();
let mockLocation = { pathname: "/career-intelligence" };

jest.mock("react-router-dom", () => ({
  useParams: () => mockParams,
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CareerIntelligence from "./CareerIntelligence";
import careerIntelligenceService from "../services/careerIntelligence";
import trialMissionService from "../services/trialMission";

// Mock API service
jest.mock("../services/careerIntelligence", () => ({
  __esModule: true,
  default: {
    listCareerFamilies: jest.fn(),
    getFamilyCareers: jest.fn(),
    getCareerIntelligence: jest.fn(),
    getCareerActivities: jest.fn(),
  },
}));

jest.mock("../services/trialMission", () => ({
  __esModule: true,
  default: {
    getTrialMissions: jest.fn(),
  },
}));

const MOCK_FAMILIES = [
  {
    id: "f1111111-1111-1111-1111-111111111111",
    key: "software_engineering_cloud_systems",
    name: "Software Engineering & Cloud Systems",
    description: "Distributed software architectures, cloud infrastructure, and core systems engineering.",
  },
  {
    id: "f2222222-2222-2222-2222-222222222222",
    key: "data_ai_mathematical_modeling",
    name: "Data, AI & Mathematical Modeling",
    description: "Statistical modeling, machine learning systems, data engineering, and analytics.",
  },
];

const MOCK_FAMILY_CAREERS = {
  family: MOCK_FAMILIES[0],
  careers: [
    {
      career: {
        id: "c1111111-1111-1111-1111-111111111111",
        name: "Cloud Solutions Architect",
        slug: "cloud-solutions-architect",
        sector_name: "Information Technology",
        one_liner: "Designs enterprise multi-region cloud infrastructures.",
      },
      classification_status: "confident",
      rationale: "Enterprise cloud systems architecture domain.",
      reviewed_by: "curated_catalog_v1",
      sme_reviewed_at: "2026-03-01T00:00:00Z",
    },
  ],
  total_careers: 1,
};

const MOCK_CLASSIFIED_CAREER_DETAIL = {
  career: {
    id: "c1111111-1111-1111-1111-111111111111",
    name: "Cloud Solutions Architect",
    slug: "cloud-solutions-architect",
    description: "Architects resilient, secure, and scalable cloud systems.",
    sector_name: "Information Technology",
  },
  classification: {
    family_id: "f1111111-1111-1111-1111-111111111111",
    family_key: "software_engineering_cloud_systems",
    family_name: "Software Engineering & Cloud Systems",
    status: "confident",
    rationale: "Enterprise cloud systems architecture role.",
    reviewed_by: "curated_catalog_v1",
    sme_reviewed_at: "2026-03-01T00:00:00Z",
  },
  work_dna: {
    status: "confident",
    cognitive_complexity: 4,
    quantitative_intensity: 2,
    systems_topography: 4,
    visual_spatial_rigor: 3,
    uncertainty_ambiguity: 4,
    rationale: "Complex architectural tradeoffs, multi-region distributed topologies.",
    reviewed_by: "curated_catalog_v1",
    sme_reviewed_at: "2026-03-01T00:00:00Z",
  },
  activities: [
    {
      id: "a1111111-1111-1111-1111-111111111111",
      title: "Enterprise Disaster Recovery & Multi-Region Topology Planning",
      description: "Designs multi-region failover strategies and VPC peering architectures.",
      activity_type: "diagnostic",
      frequency_level: 3,
      importance_level: 3,
      trialability_tier: "tier_1_high",
      simulation_fidelity: 3,
      safety_liability_barrier: 1,
      cognitive_representation: 3,
      recommended_mission_type: "DEBUG_TRIAGE",
      trialability_rationale: "High fidelity architectural failure simulation.",
    },
  ],
};

const MOCK_UNCLASSIFIED_CAREER_DETAIL = {
  career: {
    id: "c2222222-2222-2222-2222-222222222222",
    name: "Unclassified Novel Career",
    slug: "unclassified-novel-career",
    description: "Novel emergent career pending taxonomy classification.",
    sector_name: "Emerging Fields",
  },
  classification: null,
  work_dna: null,
  activities: [],
};

const MOCK_PUBLISHED_MISSIONS = [
  {
    id: "m1111111-1111-1111-1111-111111111111",
    career_id: "c1111111-1111-1111-1111-111111111111",
    title: "Architect Active-Active Cross-Region Database Synchronization",
    slug: "architect-active-active-database-sync",
    description: "Distributed database architecture simulation.",
    workspace_type: "SYSTEM_TOPOLOGY",
    status: "published",
    is_active: true,
    career: {
      id: "c1111111-1111-1111-1111-111111111111",
      name: "Cloud Solutions Architect",
      slug: "cloud-solutions-architect",
    },
  },
];

describe("Phase 12E — Career Intelligence Frontend/UI", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {};
    mockNavigate.mockReset();
    mockLocation = { pathname: "/career-intelligence" };
    trialMissionService.getTrialMissions.mockResolvedValue([]);
  });

  // -------------------------------------------------------------------------
  // 1. Families Catalog View Tests
  // -------------------------------------------------------------------------
  test("loads and renders career families catalog dynamically from API", async () => {
    careerIntelligenceService.listCareerFamilies.mockResolvedValueOnce(MOCK_FAMILIES);

    render(<CareerIntelligence />);

    expect(screen.getByTestId("intelligence-skeleton-families")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Career Intelligence")).toBeInTheDocument();
      expect(screen.getByText("Software Engineering & Cloud Systems")).toBeInTheDocument();
      expect(screen.getByText("Data, AI & Mathematical Modeling")).toBeInTheDocument();
    });

    expect(careerIntelligenceService.listCareerFamilies).toHaveBeenCalledTimes(1);
  });

  test("handles family catalog API error and allows retry", async () => {
    careerIntelligenceService.listCareerFamilies
      .mockRejectedValueOnce(new Error("Network error connecting to API"))
      .mockResolvedValueOnce(MOCK_FAMILIES);

    render(<CareerIntelligence />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load Career Intelligence")).toBeInTheDocument();
      expect(screen.getByText("Network error connecting to API")).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText("Software Engineering & Cloud Systems")).toBeInTheDocument();
    });
    expect(careerIntelligenceService.listCareerFamilies).toHaveBeenCalledTimes(2);
  });

  test("filters career families client-side through search input", async () => {
    careerIntelligenceService.listCareerFamilies.mockResolvedValueOnce(MOCK_FAMILIES);

    render(<CareerIntelligence />);

    await waitFor(() => {
      expect(screen.getByText("Software Engineering & Cloud Systems")).toBeInTheDocument();
      expect(screen.getByText("Data, AI & Mathematical Modeling")).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId("family-search-input");
    fireEvent.change(searchInput, { target: { value: "Cloud" } });

    expect(screen.getByText("Software Engineering & Cloud Systems")).toBeInTheDocument();
    expect(screen.queryByText("Data, AI & Mathematical Modeling")).not.toBeInTheDocument();
  });

  test("clicking a family navigates to the family careers route", async () => {
    careerIntelligenceService.listCareerFamilies.mockResolvedValueOnce(MOCK_FAMILIES);

    render(<CareerIntelligence />);

    await waitFor(() => {
      expect(screen.getByText("Software Engineering & Cloud Systems")).toBeInTheDocument();
    });

    const familyCard = screen.getByTestId("career-family-card-software_engineering_cloud_systems");
    fireEvent.click(familyCard);

    expect(mockNavigate).toHaveBeenCalledWith("/career-intelligence/family/software_engineering_cloud_systems");
  });

  // -------------------------------------------------------------------------
  // 2. Family Careers View Tests
  // -------------------------------------------------------------------------
  test("loads and renders careers belonging to selected family", async () => {
    mockParams = { familyKey: "software_engineering_cloud_systems" };
    careerIntelligenceService.getFamilyCareers.mockResolvedValueOnce(MOCK_FAMILY_CAREERS);

    render(<CareerIntelligence />);

    expect(screen.getByTestId("intelligence-skeleton-careers")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Software Engineering & Cloud Systems" })).toBeInTheDocument();
      expect(screen.getByText("Cloud Solutions Architect")).toBeInTheDocument();
      expect(screen.getByText("Information Technology")).toBeInTheDocument();
      expect(screen.getByText("Confident")).toBeInTheDocument();
    });

    expect(careerIntelligenceService.getFamilyCareers).toHaveBeenCalledWith("software_engineering_cloud_systems");
  });

  test("clicking a career in family view navigates to career detail route", async () => {
    mockParams = { familyKey: "software_engineering_cloud_systems" };
    careerIntelligenceService.getFamilyCareers.mockResolvedValueOnce(MOCK_FAMILY_CAREERS);

    render(<CareerIntelligence />);

    await waitFor(() => {
      expect(screen.getByText("Cloud Solutions Architect")).toBeInTheDocument();
    });

    const careerCard = screen.getByTestId("family-career-item-cloud-solutions-architect");
    fireEvent.click(careerCard);

    expect(mockNavigate).toHaveBeenCalledWith("/career-intelligence/career/cloud-solutions-architect");
  });

  // -------------------------------------------------------------------------
  // 3. Career Detail & Work DNA & Activities Tests
  // -------------------------------------------------------------------------
  test("renders full Career Intelligence detail with all 5 Work DNA dimensions and activities", async () => {
    mockParams = { careerSlug: "cloud-solutions-architect" };
    careerIntelligenceService.getCareerIntelligence.mockResolvedValueOnce(MOCK_CLASSIFIED_CAREER_DETAIL);

    render(<CareerIntelligence />);

    expect(screen.getByTestId("intelligence-skeleton-detail")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Cloud Solutions Architect" })).toBeInTheDocument();
      expect(screen.getByText("Work DNA Profile")).toBeInTheDocument();
    });

    // Check all 5 Work DNA dimensions
    expect(screen.getByText("Cognitive Complexity")).toBeInTheDocument();
    expect(screen.getByText("Quantitative Intensity")).toBeInTheDocument();
    expect(screen.getByText("Systems Topography")).toBeInTheDocument();
    expect(screen.getByText("Visual-Spatial Rigor")).toBeInTheDocument();
    expect(screen.getByText("Uncertainty / Ambiguity")).toBeInTheDocument();

    // Check ordinal values representation (4/4, 2/4, 3/4)
    expect(screen.getAllByText("4/4").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2/4")).toBeInTheDocument();
    expect(screen.getByText("3/4")).toBeInTheDocument();

    // Check professional activities
    expect(screen.getByText("Enterprise Disaster Recovery & Multi-Region Topology Planning")).toBeInTheDocument();
    expect(screen.getByText("Tier 1: High Simulation Suitability")).toBeInTheDocument();
    expect(screen.getByText("Diagnostic")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 4. Provenance & Fabricated Reviewer Protection Tests
  // -------------------------------------------------------------------------
  test("displays curated_catalog_v1 provenance and strictly prohibits fabricated human reviewer identities", async () => {
    mockParams = { careerSlug: "cloud-solutions-architect" };
    careerIntelligenceService.getCareerIntelligence.mockResolvedValueOnce(MOCK_CLASSIFIED_CAREER_DETAIL);

    render(<CareerIntelligence />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Cloud Solutions Architect" })).toBeInTheDocument();
    });

    // Provenance must render curated_catalog_v1 identifier
    const provenanceBadges = screen.getAllByText("Curated Taxonomy Catalog V1");
    expect(provenanceBadges.length).toBeGreaterThanOrEqual(1);

    // Assert that no fictitious person names or titles exist anywhere in the rendered document
    const prohibitedSubstrings = ["dr. ", "sarah chen", "marcus vance", "lead sme", "expert reviewer"];
    const containerText = document.body.textContent.toLowerCase();
    for (const prohibited of prohibitedSubstrings) {
      expect(containerText).not.toContain(prohibited);
    }
  });

  // -------------------------------------------------------------------------
  // 5. Unclassified Career Graceful Handling Tests
  // -------------------------------------------------------------------------
  test("gracefully renders unclassified career without fabricating scores or dimensions", async () => {
    mockParams = { careerSlug: "unclassified-novel-career" };
    careerIntelligenceService.getCareerIntelligence.mockResolvedValueOnce(MOCK_UNCLASSIFIED_CAREER_DETAIL);

    render(<CareerIntelligence />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Unclassified Novel Career" })).toBeInTheDocument();
      expect(screen.getByTestId("unclassified-state-box")).toBeInTheDocument();
      expect(screen.getByText(/Career Intelligence Pending/i)).toBeInTheDocument();
    });

    // Work DNA and activities should not fabricate values
    expect(screen.queryByText("Work DNA Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Professional Activities (")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // 6. Trial Mission Connection Tests (3 Distinct States)
  // -------------------------------------------------------------------------
  test("State 1: Published mission exists -> renders 'Try a Trial Mission', mission title, and navigates to correct missionId", async () => {
    mockParams = { careerSlug: "cloud-solutions-architect" };
    careerIntelligenceService.getCareerIntelligence.mockResolvedValueOnce(MOCK_CLASSIFIED_CAREER_DETAIL);
    trialMissionService.getTrialMissions.mockResolvedValueOnce(MOCK_PUBLISHED_MISSIONS);

    render(<CareerIntelligence />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Cloud Solutions Architect" })).toBeInTheDocument();
      expect(screen.getByTestId("try-trial-mission-cta")).toBeInTheDocument();
    });

    // CTA and mission title assertion
    const ctaButton = screen.getByRole("button", { name: /try a trial mission/i });
    expect(ctaButton).toBeInTheDocument();
    expect(screen.getByText("Mission: Architect Active-Active Cross-Region Database Synchronization")).toBeInTheDocument();

    // Click CTA and verify navigation
    fireEvent.click(ctaButton);
    expect(mockNavigate).toHaveBeenCalledWith("/trial-mission?missionId=m1111111-1111-1111-1111-111111111111");

    // Ensure neither "coming soon" nor "unavailable" badges are rendered
    expect(screen.queryByTestId("trial-mission-coming-soon-badge")).not.toBeInTheDocument();
    expect(screen.queryByTestId("trial-mission-unavailable-badge")).not.toBeInTheDocument();
  });

  test("State 2: Mission lookup succeeded with no matching mission -> renders 'Trial Mission coming soon' without launch button", async () => {
    mockParams = { careerSlug: "cloud-solutions-architect" };
    careerIntelligenceService.getCareerIntelligence.mockResolvedValueOnce(MOCK_CLASSIFIED_CAREER_DETAIL);
    trialMissionService.getTrialMissions.mockResolvedValueOnce([]); // No published mission for this career

    render(<CareerIntelligence />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Cloud Solutions Architect" })).toBeInTheDocument();
    });

    // Non-interactive coming soon status
    expect(screen.getByTestId("trial-mission-coming-soon-badge")).toBeInTheDocument();
    expect(screen.getByText("Trial Mission coming soon")).toBeInTheDocument();
    expect(screen.getByText("A simulated work mission for this career is currently in development.")).toBeInTheDocument();

    // Ensure no launch button is present
    expect(screen.queryByTestId("try-trial-mission-cta")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /try a trial mission/i })).not.toBeInTheDocument();

    // Ensure unavailable badge is not shown
    expect(screen.queryByTestId("trial-mission-unavailable-badge")).not.toBeInTheDocument();
  });

  test("State 3: Mission lookup failure -> renders neutral unavailable state without 'coming soon', keeping Career Detail fully usable", async () => {
    mockParams = { careerSlug: "cloud-solutions-architect" };
    careerIntelligenceService.getCareerIntelligence.mockResolvedValueOnce(MOCK_CLASSIFIED_CAREER_DETAIL);
    trialMissionService.getTrialMissions.mockRejectedValueOnce(new Error("Trial mission service unavailable"));

    render(<CareerIntelligence />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Cloud Solutions Architect" })).toBeInTheDocument();
      expect(screen.getByText("Work DNA Profile")).toBeInTheDocument();
    });

    // Neutral availability-unavailable state must be rendered
    expect(screen.getByTestId("trial-mission-unavailable-badge")).toBeInTheDocument();
    expect(screen.getByText("Trial Mission availability unavailable")).toBeInTheDocument();
    expect(screen.getByText("Unable to determine Trial Mission availability right now.")).toBeInTheDocument();

    // "Trial Mission coming soon" must NOT be shown
    expect(screen.queryByTestId("trial-mission-coming-soon-badge")).not.toBeInTheDocument();
    expect(screen.queryByText("Trial Mission coming soon")).not.toBeInTheDocument();
    expect(screen.queryByText(/currently in development/i)).not.toBeInTheDocument();

    // No launch button present
    expect(screen.queryByTestId("try-trial-mission-cta")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /try a trial mission/i })).not.toBeInTheDocument();

    // Career detail content remains fully rendered and usable
    expect(screen.getByText("Cognitive Complexity")).toBeInTheDocument();
    expect(screen.getByText("Enterprise Disaster Recovery & Multi-Region Topology Planning")).toBeInTheDocument();
  });
});
