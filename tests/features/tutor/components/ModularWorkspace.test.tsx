import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { ModularWorkspace } from '../../../../src/features/tutor/components/ModularWorkspace';
import type { SessionConfig } from '../../../../src/features/tutor/schemas/sessionConfig';
import React from 'react';

describe('ModularWorkspace', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders Voice UI for komunikasi type', () => {
    const config: SessionConfig = {
      id: '1', title: 'Test', type: 'komunikasi', durationMinutes: 8, instructions: 'test', attachments: []
    };
    render(<ModularWorkspace config={config} />);
    expect(screen.getByText('AI Voice Roleplay (Mock)')).toBeInTheDocument();
  });

  it('renders Form UI for dokumen type', () => {
    const config: SessionConfig = {
      id: '2', title: 'Test', type: 'dokumen', durationMinutes: 8, instructions: 'test', requiredForm: 'sp', attachments: []
    };
    render(<ModularWorkspace config={config} />);
    expect(screen.getByText('Interactive Form (Mock)')).toBeInTheDocument();
  });

  it('renders both Voice UI and Form UI for hybrid type', () => {
    const config: SessionConfig = {
      id: '3', title: 'Test Hybrid', type: 'hybrid', durationMinutes: 10, instructions: 'test hybrid', requiredForm: 'sp', attachments: []
    };
    render(<ModularWorkspace config={config} />);
    expect(screen.getByText('AI Voice Roleplay (Mock)')).toBeInTheDocument();
    expect(screen.getByText('Interactive Form (Mock)')).toBeInTheDocument();
  });
});
