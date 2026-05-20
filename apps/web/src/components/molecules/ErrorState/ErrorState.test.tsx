import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ErrorState } from './ErrorState';

import { renderWithProviders } from '@/test/renderWithProviders';

describe('ErrorState', () => {
  it('renders an alert with the default copy', () => {
    renderWithProviders(<ErrorState />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders a custom title, body and recovery tip', () => {
    renderWithProviders(<ErrorState title="Boom" body="It broke" tip="Try a reset" />);
    expect(screen.getByText('Boom')).toBeInTheDocument();
    expect(screen.getByText('It broke')).toBeInTheDocument();
    expect(screen.getByText('Try a reset')).toBeInTheDocument();
  });

  it('calls onRetry when the retry button is pressed', async () => {
    const onRetry = vi.fn();
    const { user } = renderWithProviders(<ErrorState onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the technical detail of an Error', () => {
    renderWithProviders(<ErrorState technicalDetail={new Error('stack trace here')} />);
    expect(screen.getByText('stack trace here')).toBeInTheDocument();
  });

  it('renders an extra action node', () => {
    renderWithProviders(<ErrorState action={<button type="button">Custom action</button>} />);
    expect(screen.getByRole('button', { name: 'Custom action' })).toBeInTheDocument();
  });
});
