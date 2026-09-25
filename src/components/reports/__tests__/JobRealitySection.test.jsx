import React from 'react';
import { render, screen } from '@testing-library/react';
import JobRealitySection from '../JobRealitySection';

describe('JobRealitySection Component', () => {
  const mockJobReality = {
    real_world_impact: 'Designs sustainable biological products and bioprocesses that reduce carbon footprint.',
    day_in_the_life: [
      { time: '09:00 AM', activity: 'Review bioreactor sensor telemetry and dissolved oxygen levels' },
      { time: '11:30 AM', activity: 'Calibrate feed pumps and adjust nutrient flow rates' },
      { time: '02:00 PM', activity: 'Collaborate with downstream purification specialists' }
    ],
    common_activities: [
      {
        title: 'Optimize Fermentation Parameters',
        category: 'Biochemical Process Optimization',
        description: 'Adjust temperature and pH for maximal recombinant protein yield.',
        importance: 4.8,
        frequency: 'Daily',
        trialable: true,
      },
      {
        title: 'Process Scale-Up Modeling',
        category: 'Process Engineering',
        description: 'Translate 5L bench-scale protocols to 500L pilot reactors.',
        importance: 4.5,
        frequency: 'Weekly',
        trialable: false,
      }
    ],
    trialable_activities: [
      { title: 'Optimize Fermentation Parameters' }
    ],
    work_dna: {
      cognitive_complexity: 4,
      quantitative_intensity: 4,
      systems_topography: 3,
    },
    required_competencies: ['Bioprocess Engineering', 'Analytical Reasoning', 'Troubleshooting'],
    provenance: { source: 'Biochemical Engineering Industry Taxonomy v2.1' },
    evidence_status: 'AVAILABLE'
  };

  test('1. renders job reality header with section badge', () => {
    render(<JobRealitySection jobReality={mockJobReality} />);
    expect(screen.getByText(/04 — Job Reality/i)).toBeInTheDocument();
    expect(screen.getByText(/What the Job Actually Looks Like/i)).toBeInTheDocument();
  });

  test('2. renders real-world impact description', () => {
    render(<JobRealitySection jobReality={mockJobReality} />);
    expect(screen.getByText(/Designs sustainable biological products/i)).toBeInTheDocument();
  });

  test('3. renders day in the life timeline items', () => {
    render(<JobRealitySection jobReality={mockJobReality} />);
    expect(screen.getByText(/09:00 AM/i)).toBeInTheDocument();
    expect(screen.getByText(/Review bioreactor sensor telemetry/i)).toBeInTheDocument();
  });

  test('4. renders common occupational work activities', () => {
    render(<JobRealitySection jobReality={mockJobReality} />);
    expect(screen.getAllByText(/Optimize Fermentation Parameters/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Process Scale-Up Modeling/i)).toBeInTheDocument();
    expect(screen.getByText(/Biochemical Process Optimization/i)).toBeInTheDocument();
  });

  test('5. renders trialable simulated task badge', () => {
    render(<JobRealitySection jobReality={mockJobReality} />);
    expect(screen.getByText(/Simulated in Mission/i)).toBeInTheDocument();
  });

  test('6. renders hands-on trialable tasks callout box', () => {
    render(<JobRealitySection jobReality={mockJobReality} />);
    expect(screen.getByText(/Hands-On Trialable Tasks/i)).toBeInTheDocument();
  });

  test('7. proves Myths vs. Reality is NOT rendered in Student Decision Report', () => {
    render(<JobRealitySection jobReality={mockJobReality} />);
    expect(screen.queryByText(/Myths vs\. Reality/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Common Myth/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Actual Reality/i)).not.toBeInTheDocument();
  });

  test('8. renders Work DNA profile attributes', () => {
    render(<JobRealitySection jobReality={mockJobReality} />);
    expect(screen.getByText(/Occupational Work DNA Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Cognitive Complexity/i)).toBeInTheDocument();
    expect(screen.getByText(/Quantitative Intensity/i)).toBeInTheDocument();
  });

  test('9. renders core required competencies badges', () => {
    render(<JobRealitySection jobReality={mockJobReality} />);
    expect(screen.getByText(/Core Required Competencies/i)).toBeInTheDocument();
    expect(screen.getByText('Bioprocess Engineering')).toBeInTheDocument();
    expect(screen.getByText('Analytical Reasoning')).toBeInTheDocument();
  });

  test('10. renders provenance / verification footer', () => {
    render(<JobRealitySection jobReality={mockJobReality} />);
    expect(screen.getByText(/Biochemical Engineering Industry Taxonomy v2.1/i)).toBeInTheDocument();
  });

  test('11. renders empty state gracefully when jobReality is null', () => {
    render(<JobRealitySection jobReality={null} />);
    expect(screen.getByText(/Job reality and occupational evidence is not available yet/i)).toBeInTheDocument();
  });
});
