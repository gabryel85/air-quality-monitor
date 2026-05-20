import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OnboardingWizard } from './OnboardingWizard';

import { COUNTRIES } from '@/mocks/seed';
import { renderWithProviders } from '@/test/renderWithProviders';

const SUPPORTED = COUNTRIES.map((c) => c.id);
const CURRENT_YEAR = new Date().getFullYear();
const FOOTER = /back|skip setup|show dashboard|open /i;

describe('OnboardingWizard', () => {
  it('walks country → year → city and commits the selection', async () => {
    const { user, store } = renderWithProviders(<OnboardingWizard />);

    // Step 1 — country (geo resolves via the offline fallback in tests).
    expect(screen.getByText(/where do you want to look/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    // Step 2 — year. Pick a past (archived) year.
    expect(screen.getByText(/which year/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: new RegExp(String(CURRENT_YEAR - 1)) }));
    await user.click(screen.getByRole('button', { name: /^next$/i }));

    // Step 3 — city. The chips are every button that is not a footer control.
    expect(screen.getByText(/jump straight to a city/i)).toBeInTheDocument();
    const chip = screen
      .getAllByRole('button')
      .find(
        (b) => b.textContent !== null && b.textContent.length > 0 && !FOOTER.test(b.textContent),
      );
    if (!chip) throw new Error('no city chip found');
    await user.click(chip);

    // Finishing with a city dispatches the selection (then deep-links away).
    await user.click(screen.getByRole('button', { name: /^open /i }));

    const { country, year } = store.getState().filters;
    expect(SUPPORTED).toContain(country);
    expect(year).toBe(CURRENT_YEAR - 1);
  });

  it('skip setup commits the suggested country and current year', async () => {
    const { user, store } = renderWithProviders(<OnboardingWizard />);
    await user.click(screen.getByRole('button', { name: /skip setup/i }));

    const { country, year } = store.getState().filters;
    expect(SUPPORTED).toContain(country);
    expect(year).toBe(CURRENT_YEAR);
  });
});
