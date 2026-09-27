import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClinicalEncounterWorkspace, {
  getVitalStatusBadge,
  getObservationStatusBadge
} from './ClinicalEncounterWorkspace';
import { getWorkspaceComponent, WORKSPACE_COMPONENTS } from './WorkspaceRegistry';

describe('ClinicalEncounterWorkspace & Registry Integration', () => {
  const mockConfig = {
    title: 'Acute Post-Surgical Ward Care',
    workspace: {
      type: 'clinical_encounter',
      title: 'Acute Post-Surgical Ward – Bed 4B',
      patient: {
        name: 'Robert Henderson',
        age: 64,
        gender: 'Male',
        setting: 'Acute Adult Medical-Surgical Inpatient Ward (Bed 4B)',
        chief_complaint: 'Acute onset shortness of breath and left calf tenderness',
        relevant_history: 'Type 2 Diabetes Mellitus, Essential Hypertension',
        admission_diagnosis: 'Post-operative Day 2 following elective left total knee arthroplasty (TKA)',
        allergies: ['Penicillin (Anaphylaxis)', 'Codeine (Nausea/Vomiting)'],
        code_status: 'Full Code (Resuscitation Permitted)'
      },
      score_indicator: {
        label: 'NEWS2 Score',
        value: '7 (High Clinical Risk)'
      },
      vitals: [
        {
          id: 'vit_rr',
          label: 'Respiratory Rate',
          value: '26',
          unit: 'breaths/min',
          target_range: '12 - 20 breaths/min',
          status: 'critical',
          trend: 'increasing',
          importance: 'primary'
        },
        {
          id: 'vit_spo2',
          label: 'SpO2 (Room Air)',
          value: '89',
          unit: '%',
          target_range: '96 - 100%',
          status: 'critical',
          trend: 'decreasing',
          importance: 'primary'
        },
        {
          id: 'vit_hr',
          label: 'Heart Rate',
          value: '114',
          unit: 'bpm',
          target_range: '60 - 100 bpm',
          status: 'warning',
          trend: 'increasing',
          importance: 'primary'
        },
        {
          id: 'vit_temp',
          label: 'Core Temperature',
          value: '37.8',
          unit: '°C',
          target_range: '36.5 - 37.5 °C',
          status: 'warning',
          trend: 'stable',
          importance: 'secondary'
        }
      ],
      observations: [
        {
          id: 'obs_1',
          system: 'Respiratory Assessment',
          finding: 'Tachypneic at 26 bpm with shallow rapid breathing.',
          status: 'critical',
          evidence_link: 'NEWS2 Observation Flowsheet'
        },
        {
          id: 'obs_2',
          system: 'Peripheral Vascular & Lower Extremity',
          finding: 'Left calf exhibits localized erythema, marked edema (+3cm circumference), and calf tenderness.',
          status: 'critical',
          evidence_link: 'Bedside Physical Assessment'
        }
      ]
    },
    resources: [
      {
        id: 'res_news2',
        title: 'NEWS2 Observation Flowsheet',
        type: 'flowsheet',
        content: 'Observation chart data...'
      },
      {
        id: 'res_abg',
        title: 'Arterial Blood Gas Panel',
        type: 'lab_result',
        content: 'pH 7.21, Lactate 4.8...'
      }
    ],
    investigation: {
      checklist: [{ id: 'chk_1', label: 'Review vital signs and NEWS2 telemetry' }],
      required_resource_ids: ['res_news2']
    }
  };

  const mockSession = {
    session_id: 'test-session-rn-101',
    current_phase: 'investigate',
    accessed_resource_ids: ['res_news2']
  };

  test('1. WorkspaceRegistry resolves clinical_encounter correctly', () => {
    expect(WORKSPACE_COMPONENTS.clinical_encounter).toBe(ClinicalEncounterWorkspace);
    const resolved = getWorkspaceComponent('clinical_encounter');
    expect(resolved).toBe(ClinicalEncounterWorkspace);
  });

  test('2. Status badge helpers return expected styles', () => {
    expect(getVitalStatusBadge('critical').label).toBe('Critical');
    expect(getVitalStatusBadge('warning').label).toBe('Warning');
    expect(getVitalStatusBadge('normal').label).toBe('Normal');

    expect(getObservationStatusBadge('critical')).toContain('rose');
    expect(getObservationStatusBadge('abnormal')).toContain('amber');
    expect(getObservationStatusBadge('normal')).toContain('emerald');
  });

  test('3. Renders patient header with synthetic demographics, setting, and alerts', () => {
    render(
      <ClinicalEncounterWorkspace
        session={mockSession}
        configuration={mockConfig}
        resources={mockConfig.resources}
      />
    );

    expect(screen.getByTestId('patient-name')).toHaveTextContent('Robert Henderson');
    expect(screen.getByText(/64 yrs/i)).toBeInTheDocument();
    expect(screen.getByText(/Male/i)).toBeInTheDocument();
    expect(screen.getByText(/Acute Adult Medical-Surgical Inpatient Ward/i)).toBeInTheDocument();
    expect(screen.getByText(/Full Code/i)).toBeInTheDocument();
    expect(screen.getByText(/Penicillin \(Anaphylaxis\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Acute onset shortness of breath/i)).toBeInTheDocument();
    expect(screen.getByText(/7 \(High Clinical Risk\)/i)).toBeInTheDocument();
  });

  test('4. Renders vitals monitor cards with values, target ranges, and trends', () => {
    render(
      <ClinicalEncounterWorkspace
        session={mockSession}
        configuration={mockConfig}
        resources={mockConfig.resources}
      />
    );

    expect(screen.getByTestId('vital-card-vit_rr')).toBeInTheDocument();
    expect(screen.getByText('Respiratory Rate')).toBeInTheDocument();
    expect(screen.getByText('26')).toBeInTheDocument();

    expect(screen.getByTestId('vital-card-vit_spo2')).toBeInTheDocument();
    expect(screen.getByText('SpO2 (Room Air)')).toBeInTheDocument();
    expect(screen.getByText('89')).toBeInTheDocument();

    expect(screen.getByTestId('vital-card-vit_rr')).toHaveTextContent('Target: 12 - 20 breaths/min');
    expect(screen.getByTestId('vital-card-vit_spo2')).toHaveTextContent('Target: 96 - 100%');
  });

  test('5. Tab navigation switches between Vitals, Observations, and Evidence', () => {
    render(
      <ClinicalEncounterWorkspace
        session={mockSession}
        configuration={mockConfig}
        resources={mockConfig.resources}
      />
    );

    // Initial tab is vitals
    expect(screen.getByTestId('vitals-panel')).toBeInTheDocument();

    // Switch to Observations
    const obsTabBtn = screen.getByTestId('tab-observations');
    fireEvent.click(obsTabBtn);
    expect(screen.getByTestId('observations-panel')).toBeInTheDocument();
    expect(screen.getByText('Respiratory Assessment')).toBeInTheDocument();
    expect(screen.getByText(/Tachypneic at 26 bpm with shallow rapid breathing/i)).toBeInTheDocument();

    // Switch to Evidence
    const evidenceTabBtn = screen.getByTestId('tab-evidence');
    fireEvent.click(evidenceTabBtn);
    expect(screen.getByTestId('evidence-panel')).toBeInTheDocument();
  });

  test('6. Clicking an observation cites it into finding statement and opens finding form', () => {
    const handleSetStatement = jest.fn();
    const handleSetShowForm = jest.fn();

    render(
      <ClinicalEncounterWorkspace
        session={mockSession}
        configuration={mockConfig}
        resources={mockConfig.resources}
        setFindingStatement={handleSetStatement}
        setShowFindingForm={handleSetShowForm}
      />
    );

    // Switch to observations tab
    const obsTabBtn = screen.getByTestId('tab-observations');
    fireEvent.click(obsTabBtn);

    const obsItem = screen.getByTestId('observation-item-0');
    fireEvent.click(obsItem);

    expect(handleSetStatement).toHaveBeenCalledWith(
      expect.stringContaining('Clinical observation in Respiratory Assessment: Tachypneic at 26 bpm')
    );
    expect(handleSetShowForm).toHaveBeenCalledWith(true);
  });

  test('7. Finding Composer renders and Add Finding button opens composer form', () => {
    const setShowFindingForm = jest.fn();

    render(
      <ClinicalEncounterWorkspace
        session={mockSession}
        configuration={mockConfig}
        resources={mockConfig.resources}
        findings={[]}
        showFindingForm={false}
        setShowFindingForm={setShowFindingForm}
      />
    );

    expect(screen.getByText('Synthesized Clinical Findings')).toBeInTheDocument();
    const addBtn = screen.getByRole('button', { name: /Add Finding/i });
    expect(addBtn).toBeInTheDocument();

    fireEvent.click(addBtn);
    expect(setShowFindingForm).toHaveBeenCalledWith(true);
  });

  test('8. Finding form allows input of statement, resource, and uncertainty, and invokes handleSaveNewFinding', () => {
    const handleSaveNewFinding = jest.fn((e) => e.preventDefault());
    const setFindingStatement = jest.fn();
    const setFindingResource = jest.fn();
    const setFindingUncertainty = jest.fn();

    render(
      <ClinicalEncounterWorkspace
        session={mockSession}
        configuration={mockConfig}
        resources={mockConfig.resources}
        findings={[]}
        showFindingForm={true}
        findingStatement="Arterial Blood Gas confirms severe refractory lactic acidosis"
        setFindingStatement={setFindingStatement}
        findingResource="res_abg"
        setFindingResource={setFindingResource}
        findingUncertainty="Repeat lactate in 2 hours"
        setFindingUncertainty={setFindingUncertainty}
        handleSaveNewFinding={handleSaveNewFinding}
      />
    );

    expect(screen.getByText('Record New Evidence Finding')).toBeInTheDocument();
    const statementInput = screen.getByDisplayValue('Arterial Blood Gas confirms severe refractory lactic acidosis');
    expect(statementInput).toBeInTheDocument();

    // Verify resource selector
    const resourceSelect = screen.getByRole('combobox');
    expect(resourceSelect).toHaveValue('res_abg');

    // Submit form
    const saveBtn = screen.getByRole('button', { name: /Save Finding/i });
    fireEvent.click(saveBtn);

    expect(handleSaveNewFinding).toHaveBeenCalledTimes(1);
  });

  test('9. Existing findings supplied via findings or findingsList render properly', () => {
    const mockFindings = [
      {
        id: 'f-101',
        statement: 'Arterial Line MAP is 54 mmHg indicating refractory septic shock',
        evidence: [{ resource_id: 'res_news2', explanation: 'NEWS2 hemodynamic score 7' }],
        uncertainty: 'Serial BP monitoring active'
      },
      {
        id: 'f-102',
        statement: 'PaO2/FiO2 ratio of 125 indicates moderate-to-severe ARDS',
        evidence: [{ resource_id: 'res_abg', explanation: 'pH 7.21, PaO2 65 mmHg on 50% FiO2' }]
      }
    ];

    render(
      <ClinicalEncounterWorkspace
        session={mockSession}
        configuration={mockConfig}
        resources={mockConfig.resources}
        findingsList={mockFindings}
      />
    );

    expect(screen.getByText('Arterial Line MAP is 54 mmHg indicating refractory septic shock')).toBeInTheDocument();
    expect(screen.getByText('PaO2/FiO2 ratio of 125 indicates moderate-to-severe ARDS')).toBeInTheDocument();
    expect(screen.getByText(/Finding #1/i)).toBeInTheDocument();
    expect(screen.getByText(/Finding #2/i)).toBeInTheDocument();
    expect(screen.getByText(/Serial BP monitoring active/i)).toBeInTheDocument();
  });
});
