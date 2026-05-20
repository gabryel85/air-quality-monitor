import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ResetDbButton } from './ResetDbButton';

import { renderWithProviders } from '@/test/renderWithProviders';

describe('ResetDbButton', () => {
  it('opens a confirmation popover before resetting', async () => {
    const { user } = renderWithProviders(<ResetDbButton />);
    await user.click(screen.getByRole('button', { name: /reset mock data/i }));
    expect(await screen.findByText(/reset mock data\?/i)).toBeInTheDocument();
  });

  it('confirms the reset and shows the success message', async () => {
    const { user } = renderWithProviders(<ResetDbButton />);
    await user.click(screen.getByRole('button', { name: /reset mock data/i }));

    const confirm = await screen.findByRole('button', { name: /^Reset data$/ });
    await user.click(confirm);

    expect(await screen.findByText(/mock data restored/i)).toBeInTheDocument();
  });

  it('cancelling closes the popover without resetting', async () => {
    const { user } = renderWithProviders(<ResetDbButton />);
    await user.click(screen.getByRole('button', { name: /reset mock data/i }));

    await user.click(await screen.findByRole('button', { name: /cancel/i }));
    expect(screen.queryByText(/reset mock data\?/i)).not.toBeInTheDocument();
  });
});
