import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';

function ThemeProbe() {
  const { preference, effective, setPreference, cyclePreference } = useTheme();
  return (
    <div>
      <span data-testid="pref">{preference}</span>
      <span data-testid="eff">{effective}</span>
      <button type="button" onClick={cyclePreference}>
        cycle
      </button>
      <button
        type="button"
        onClick={() => {
          setPreference('dark');
        }}
      >
        set dark
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  );
}

describe('ThemeProvider', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('defaults to auto when nothing is stored', () => {
    renderProvider();
    expect(screen.getByTestId('pref')).toHaveTextContent('auto');
  });

  it('reads the stored preference and applies the dark class', () => {
    localStorage.setItem('theme', 'dark');
    renderProvider();
    expect(screen.getByTestId('pref')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('setPreference persists the choice', async () => {
    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'set dark' }));
    expect(screen.getByTestId('pref')).toHaveTextContent('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('cyclePreference walks light → dark → auto → light', async () => {
    localStorage.setItem('theme', 'light');
    renderProvider();
    const cycle = screen.getByRole('button', { name: 'cycle' });
    expect(screen.getByTestId('pref')).toHaveTextContent('light');

    await userEvent.click(cycle);
    expect(screen.getByTestId('pref')).toHaveTextContent('dark');
    await userEvent.click(cycle);
    expect(screen.getByTestId('pref')).toHaveTextContent('auto');
    await userEvent.click(cycle);
    expect(screen.getByTestId('pref')).toHaveTextContent('light');
  });

  it('useTheme throws when used outside the provider', () => {
    function Bare() {
      useTheme();
      return null;
    }
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Bare />)).toThrow(/ThemeProvider/);
    consoleError.mockRestore();
  });
});
