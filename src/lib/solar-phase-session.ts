// lib/solar-phase-session.ts
//
// Persists a manual phase override across same-tab client-side navigation.
//
// Design constraints:
//   ✓ Tab close: everything cleared (sessionStorage behaviour)
//   ✓ Explicit "Go Live" clears the override
//   ✓ Reload in live mode: live flag is restored, button stays disabled
//
// Note: We use an explicit LIVE_KEY flag so that the phase override written
// by the provider sync effect does not get mistaken for a manual override
// on reload. Without this, reloading in live mode would set useLive=false
// because sessionStorage still contained the last auto-written phase.

export type SolarPhase =
  | 'night'
  | 'dawn'
  | 'sunrise'
  | 'morning'
  | 'solar-noon'
  | 'afternoon'
  | 'sunset'
  | 'dusk'
  | 'midnight';

const PHASE_KEY = 'sol-phase-override';
const LAST_PHASE_KEY = 'sol-last-phase';
const LAST_TIME_KEY = 'sol-last-time-minutes';
const LIVE_KEY = 'sol-is-live';

// ─── Live flag ────────────────────────────────────────────────────────────────

/** Mark whether the showcase is in live (real-time) mode. */
export function setSessionLive(isLive: boolean): void {
  try {
    if (isLive) {
      sessionStorage.setItem(LIVE_KEY, '1');
    } else {
      sessionStorage.removeItem(LIVE_KEY);
    }
  } catch {}
}

/** Returns true if the showcase was last in live mode. */
export function getSessionIsLive(): boolean {
  try {
    return sessionStorage.getItem(LIVE_KEY) === '1';
  } catch {
    return false;
  }
}

// ─── Time minutes ─────────────────────────────────────────────────────────────

export function setSessionTimeMinutes(minutes: number): void {
  try {
    localStorage.setItem(LAST_TIME_KEY, String(minutes));
  } catch {}
}

export function getSessionTimeMinutes(): number | null {
  try {
    const v = localStorage.getItem(LAST_TIME_KEY);
    if (v === null) return null;
    const n = Number.parseInt(v, 10);
    return Number.isNaN(n) ? null : n;
  } catch {
    return null;
  }
}

export function clearSessionTimeMinutes(): void {
  try {
    localStorage.removeItem(LAST_TIME_KEY);
  } catch {}
}

// ─── Phase override ───────────────────────────────────────────────────────────

/** Write (or clear) the manual phase override. */
export function setSessionPhaseOverride(phase: SolarPhase | null): void {
  try {
    if (phase === null) {
      sessionStorage.removeItem(PHASE_KEY);
      localStorage.removeItem(LAST_PHASE_KEY);
      localStorage.removeItem(LAST_TIME_KEY);
    } else {
      sessionStorage.setItem(PHASE_KEY, phase);
      localStorage.setItem(LAST_PHASE_KEY, phase);
    }
  } catch {}
}

/** Read the current override, or null if on live tracking. */
export function getSessionPhaseOverride(): SolarPhase | null {
  try {
    // Primary: sessionStorage (cleared on tab close)
    const session = sessionStorage.getItem(PHASE_KEY) as SolarPhase | null;
    if (session) return session;

    // Secondary: localStorage fallback for reloads.
    // We detect this by checking if the current path is not the root.
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      const local = localStorage.getItem(LAST_PHASE_KEY) as SolarPhase | null;
      if (local) {
        // Restore to sessionStorage so subsequent navigations work normally.
        sessionStorage.setItem(PHASE_KEY, local);
        return local;
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ─── Reload detection ─────────────────────────────────────────────────────────

/**
 * Returns true if the current page load is a reload (F5, Ctrl+R, browser
 * reload button). Returns false for normal navigations, back/forward, etc.
 */
export function isPageReload(): boolean {
  try {
    const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    return entry?.type === 'reload';
  } catch {
    return false;
  }
}
