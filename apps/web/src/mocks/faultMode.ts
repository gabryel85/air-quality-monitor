/**
 * Fault mode — per-endpoint switches that make chosen mock endpoints fail
 * with 503. Lets the UI be exercised against its unhappy paths (loading →
 * retry → error) one area at a time.
 *
 * It is a small external store: MSW handlers read it synchronously per
 * request; React components subscribe via useSyncExternalStore (useFaults).
 * The selection is persisted so it survives a reload.
 */

export const FAULT_TARGETS = [
  'countries',
  'years',
  'stats',
  'city',
  'series',
  'notes',
  'noteMutations',
] as const;

export type FaultTarget = (typeof FAULT_TARGETS)[number];

const STORAGE_KEY = 'aqm-faults';

function isFaultTarget(value: unknown): value is FaultTarget {
  return typeof value === 'string' && (FAULT_TARGETS as readonly string[]).includes(value);
}

function readPersisted(): ReadonlySet<FaultTarget> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter(isFaultTarget) : []);
  } catch {
    return new Set();
  }
}

let faults: ReadonlySet<FaultTarget> =
  typeof localStorage !== 'undefined' ? readPersisted() : new Set();

const listeners = new Set<() => void>();

function commit(next: ReadonlySet<FaultTarget>): void {
  faults = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {
    /* storage unavailable — the in-memory set still works this session */
  }
  for (const listener of listeners) listener();
}

/** Synchronous read for MSW handlers. */
export function isFaulty(target: FaultTarget): boolean {
  return faults.has(target);
}

/** Snapshot for useSyncExternalStore — stable reference until a mutation. */
export function getFaults(): ReadonlySet<FaultTarget> {
  return faults;
}

export function subscribeFaults(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setFault(target: FaultTarget, on: boolean): void {
  const next = new Set(faults);
  if (on) next.add(target);
  else next.delete(target);
  commit(next);
}

export function setAllFaults(on: boolean): void {
  commit(on ? new Set(FAULT_TARGETS) : new Set());
}
