import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ResearchInterviewWorkspace from "./ResearchInterviewWorkspace";
import { getWorkspaceComponent, WORKSPACE_COMPONENTS } from "./WorkspaceRegistry";

describe("ResearchInterviewWorkspace & WorkspaceRegistry Integration", () => {
  const mockConfig = {
    title: "Enterprise User Research Investigation",
    workspace: {
      type: "research_interview",
      interview: {
        title: "B2B SaaS Onboarding Friction Discovery",
        description: "Qualitative stakeholder interviews across Product, Customer Success, and End Users.",
        stakeholders: [
          {
            id: "vp_product",
            name: "Sarah Chen",
            role: "VP of Product",
            topics: [
              {
                id: "q1",
                question: "What is the primary onboarding drop-off vector?",
                response: "Users struggle at the SSO SAML configuration step due to lack of domain verification guidance.",
                theme: "Technical Friction"
              }
            ]
          },
          {
            id: "cust_success",
            name: "Marcus Vance",
            role: "Head of Customer Success",
            topics: [
              {
                id: "q2",
                question: "How long does manual onboarding assistance take?",
                response: "CS spends an average of 4.5 hours per enterprise account guiding admin setup.",
                theme: "Operational Burden"
              }
            ]
          }
        ]
      }
    },
    resources: [
      { id: "transcript_pdf", title: "Full Interview Transcripts PDF", type: "document" }
    ],
    investigation: {
      checklist: [{ id: "check_1", label: "Inspect VP Product feedback" }],
      required_resource_ids: ["transcript_pdf"]
    }
  };

  const mockSession = {
    session_id: "test-session-456",
    current_phase: "investigate",
    accessed_resource_ids: ["transcript_pdf"]
  };

  test("WorkspaceRegistry resolves research_interview correctly", () => {
    expect(WORKSPACE_COMPONENTS.research_interview).toBe(ResearchInterviewWorkspace);
    const resolved = getWorkspaceComponent("research_interview");
    expect(resolved).toBe(ResearchInterviewWorkspace);
  });

  test("configured research/interview content renders stakeholder names and questions", () => {
    render(
      <ResearchInterviewWorkspace
        session={mockSession}
        configuration={mockConfig}
        activeResource={null}
        notesValue=""
        setNotesValue={() => {}}
        notesStatus="Saved"
        findingsList={[]}
        handleAccessResource={() => {}}
        handleSaveNewFinding={() => {}}
        handleCompleteInvestigation={() => {}}
        isCompletingInvestigation={false}
      />
    );

    expect(screen.getByText(/B2B SaaS Onboarding Friction Discovery/i)).toBeInTheDocument();
    expect(screen.getByText(/Sarah Chen \(VP of Product\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Marcus Vance \(Head of Customer Success\)/i)).toBeInTheDocument();
    expect(screen.getByText(/What is the primary onboarding drop-off vector\?/i)).toBeInTheDocument();
  });

  test("stakeholder and question selection reveals configured transcript response locally", () => {
    render(
      <ResearchInterviewWorkspace
        session={mockSession}
        configuration={mockConfig}
        activeResource={null}
        notesValue=""
        setNotesValue={() => {}}
        notesStatus="Saved"
        findingsList={[]}
        handleAccessResource={() => {}}
        handleSaveNewFinding={() => {}}
        handleCompleteInvestigation={() => {}}
        isCompletingInvestigation={false}
      />
    );

    // Click question to reveal transcript
    const questionCard = screen.getByText(/What is the primary onboarding drop-off vector\?/i);
    fireEvent.click(questionCard);

    expect(screen.getByText(/Users struggle at the SSO SAML configuration step/i)).toBeInTheDocument();

    // Switch to Marcus Vance
    const marcusBtn = screen.getByText(/Marcus Vance \(Head of Customer Success\)/i);
    fireEvent.click(marcusBtn);

    expect(screen.getByText(/How long does manual onboarding assistance take\?/i)).toBeInTheDocument();
  });

  test("FindingComposer can be used without automatically choosing an evidence resource", () => {
    const mockSaveFinding = jest.fn();

    render(
      <ResearchInterviewWorkspace
        session={mockSession}
        configuration={mockConfig}
        activeResource={null}
        notesValue=""
        setNotesValue={() => {}}
        notesStatus="Saved"
        findingsList={[]}
        handleAccessResource={() => {}}
        handleSaveNewFinding={mockSaveFinding}
        handleCompleteInvestigation={() => {}}
        isCompletingInvestigation={false}
      />
    );

    // Click question card to expand transcript
    const questionCard = screen.getByText(/What is the primary onboarding drop-off vector\?/i);
    fireEvent.click(questionCard);

    // Click "Pin Finding from Response"
    const pinBtn = screen.getByText(/Pin Finding from Response/i);
    fireEvent.click(pinBtn);

    // Finding statement contains prepopulated text
    expect(screen.getByDisplayValue(/\[Interview Evidence - Sarah Chen\]/i)).toBeInTheDocument();

    // Supporting resource select option must NOT be auto-selected (remains unselected "")
    const resourceSelect = screen.getByRole("combobox");
    expect(resourceSelect.value).toBe("");
  });

  test("renders safe unavailable state when research configuration is missing or invalid", () => {
    const emptyConfig = {
      title: "Empty Research Mission"
    };

    render(
      <ResearchInterviewWorkspace
        session={mockSession}
        configuration={emptyConfig}
        activeResource={null}
        notesValue=""
        setNotesValue={() => {}}
        notesStatus="Saved"
        findingsList={[]}
        handleAccessResource={() => {}}
        handleSaveNewFinding={() => {}}
        handleCompleteInvestigation={() => {}}
        isCompletingInvestigation={false}
      />
    );

    expect(screen.getByText(/Research Configuration Unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/No valid research or interview configuration was provided/i)).toBeInTheDocument();
    expect(screen.queryByText(/Standard Operational Workflow/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/B2B SaaS Onboarding Friction Discovery/i)).not.toBeInTheDocument();
  });

  test("renders safe unavailable state when workspace.interview exists but stakeholders array is missing or empty", () => {
    const invalidConfig = {
      title: "Invalid Interview Config Mission",
      workspace: {
        type: "research_interview",
        interview: {
          title: "Malformed Interview Setup",
          stakeholders: [] // empty array!
        }
      }
    };

    render(
      <ResearchInterviewWorkspace
        session={mockSession}
        configuration={invalidConfig}
        activeResource={null}
        notesValue=""
        setNotesValue={() => {}}
        notesStatus="Saved"
        findingsList={[]}
        handleAccessResource={() => {}}
        handleSaveNewFinding={() => {}}
        handleCompleteInvestigation={() => {}}
        isCompletingInvestigation={false}
      />
    );

    expect(screen.getByText(/Research Configuration Unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/No valid research or interview configuration was provided/i)).toBeInTheDocument();
  });
});
