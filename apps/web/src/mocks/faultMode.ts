/**
 * Fault mode — a global switch that makes every mock endpoint fail with 503.
 *
 * Lets the UI be exercised against its unhappy paths (loading → retry →
 * error states) on demand. The choice is persisted so it survives a reload;
 * handlers read it per request and the UI toggles it via useFaultMode.
 */

const STORAGE_KEY = 'aqm-fault-mode';

function readPersisted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

let faultMode = typeof localStorage !== 'undefined' ? readPersisted() : false;

export function isFaultMode(): boolean {
  return faultMode;
}

export function setFaultMode(next: boolean): void {
  faultMode = next;
  try {
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
  } catch {
    /* storage unavailable — the in-memory flag still works for this session */
  }
}
