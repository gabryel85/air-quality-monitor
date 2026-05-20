import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FAULT_TARGETS,
  getFaults,
  isFaulty,
  setAllFaults,
  setFault,
  subscribeFaults,
} from './faultMode';

describe('faultMode store', () => {
  beforeEach(() => {
    setAllFaults(false);
    localStorage.clear();
  });
  afterEach(() => {
    setAllFaults(false);
  });

  it('starts with nothing faulty', () => {
    expect(getFaults().size).toBe(0);
    expect(isFaulty('stats')).toBe(false);
  });

  it('setFault toggles a single target without affecting others', () => {
    setFault('stats', true);
    expect(isFaulty('stats')).toBe(true);
    expect(isFaulty('notes')).toBe(false);

    setFault('stats', false);
    expect(isFaulty('stats')).toBe(false);
  });

  it('setAllFaults enables then disables every target', () => {
    setAllFaults(true);
    expect(getFaults().size).toBe(FAULT_TARGETS.length);
    for (const target of FAULT_TARGETS) expect(isFaulty(target)).toBe(true);

    setAllFaults(false);
    expect(getFaults().size).toBe(0);
  });

  it('exposes a fresh snapshot reference on every mutation', () => {
    const before = getFaults();
    setFault('city', true);
    expect(getFaults()).not.toBe(before);
  });

  it('persists the selection to localStorage', () => {
    setFault('series', true);
    expect(localStorage.getItem('aqm-faults')).toContain('series');
  });

  it('notifies subscribers on change and stops after unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeFaults(listener);

    setFault('years', true);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    setFault('years', false);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
