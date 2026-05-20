import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { FaultModeToggle } from './FaultModeToggle';

import { FAULT_TARGETS, setAllFaults } from '@/mocks/faultMode';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('FaultModeToggle', () => {
  afterEach(() => {
    setAllFaults(false);
    localStorage.clear();
  });

  it('opens a popover listing every fault target plus a master switch', async () => {
    const { user } = renderWithProviders(<FaultModeToggle />);
    await user.click(screen.getByRole('button', { name: /which mocks fail/i }));

    const switches = await screen.findAllByRole('switch');
    expect(switches).toHaveLength(FAULT_TARGETS.length + 1);
  });

  it('toggling a target switch records that fault', async () => {
    const { user } = renderWithProviders(<FaultModeToggle />);
    await user.click(screen.getByRole('button', { name: /which mocks fail/i }));

    const trendSwitch = await screen.findByRole('switch', { name: /trend chart/i });
    expect(trendSwitch).toHaveAttribute('aria-checked', 'false');
    await user.click(trendSwitch);
    expect(trendSwitch).toHaveAttribute('aria-checked', 'true');
  });

  it('the master switch flips every target at once', async () => {
    const { user } = renderWithProviders(<FaultModeToggle />);
    await user.click(screen.getByRole('button', { name: /which mocks fail/i }));

    await user.click(await screen.findByRole('switch', { name: /all endpoints/i }));
    for (const toggle of screen.getAllByRole('switch')) {
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    }
  });
});
