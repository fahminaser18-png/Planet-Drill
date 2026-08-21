import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TutorShell } from '../../../../src/features/tutor/components/TutorShell';
import type { SessionConfig } from '../../../../src/features/tutor/schemas/sessionConfig';
import React from 'react';

const mockConfig: SessionConfig = {
  id: 'stase-1',
  title: 'Konseling Hipertensi',
  type: 'komunikasi',
  durationMinutes: 8,
  instructions: 'Lakukan konseling',
  attachments: []
};

describe('TutorShell', () => {
  it('renders title and instructions', () => {
    render(<TutorShell config={mockConfig}><div>Child Content</div></TutorShell>);
    expect(screen.getByText('Konseling Hipertensi')).toBeInTheDocument();
    expect(screen.getByText('Lakukan konseling')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
