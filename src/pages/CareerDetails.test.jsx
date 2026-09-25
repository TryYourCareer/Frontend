const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useParams: () => ({ careerName: "Bioprocess Engineer" }),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

jest.mock("../services/trialMission", () => ({
  getTrialMissions: jest.fn(),
}));

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CareerDetails from "./CareerDetails";
import { getTrialMissions } from "../services/trialMission";

describe("CareerDetails — Trial Mission CTA Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes("/careers")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              career_name: "Bioprocess Engineer",
              cluster: "BIOTECHNOLOGY & LIFE SCIENCES",
              description: "Designs and scales upstream fermentation systems.",
              salary_india_lpa: { entry: 6, median: 14, senior: 28 },
              salary_global_usd: { entry: 60000, senior: 135000 },
              demand_level: "High",
              automation_risk: "low",
              core_skills: ["Bioreactor Operation", "Fermentation Kinetics"],
            },
          ],
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
  });

  test("1. displays 'Try Hands-on Simulator' CTA when a matching Trial Mission exists", async () => {
    getTrialMissions.mockResolvedValue([
      {
        id: "mission-bio-123",
        title: "Bioprocess Engineering Simulator",
        slug: "bioprocess-engineer-simulator",
        career: { name: "Bioprocess Engineer" },
      },
    ]);

    render(<CareerDetails />);

    await waitFor(() => {
      expect(screen.getByTestId("career-details-trial-mission-cta")).toBeInTheDocument();
      expect(screen.getByText("Try Hands-on Simulator")).toBeInTheDocument();
    });

    const ctaBtn = screen.getByTestId("career-details-trial-mission-cta");
    fireEvent.click(ctaBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/trial-mission?missionId=mission-bio-123");
  });

  test("2. does not display Trial Mission CTA when no matching mission exists", async () => {
    getTrialMissions.mockResolvedValue([
      {
        id: "mission-other-999",
        title: "UX Design Audit",
        slug: "ux-design-audit",
        career: { name: "Product Designer" },
      },
    ]);

    render(<CareerDetails />);

    await waitFor(() => {
      expect(screen.getByText("Bioprocess Engineer")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("career-details-trial-mission-cta")).not.toBeInTheDocument();
  });

  test("3. preserves existing Career Details action buttons", async () => {
    getTrialMissions.mockResolvedValue([]);

    render(<CareerDetails />);

    await waitFor(() => {
      expect(screen.getByText("View Learning Roadmap")).toBeInTheDocument();
      expect(screen.getByText("Share")).toBeInTheDocument();
    });
  });
});
