//lib/geolocation-client.tsx
'use client';

import {
  type GeoPosition,
  type GeolocationError,
  type PermissionState,
  type UseGeolocationOptions,
  useGeolocation,
} from '@usefy/use-geolocation';
import * as ct from 'countries-and-timezones';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import tzlookup from 'tz-lookup';
import { normalizeCountryCode } from './country';

// ─── Last-known-position cache ────────────────────────────────────────────────
// Persists the most recent precise position to localStorage so that on the next
// page load the provider can hydrate the city/coords instantly instead of waiting
// for the browser geolocation permission prompt + GPS fix to resolve.

const GEO_CACHE_KEY = 'sol:geo-cache';

export interface GeoCacheEntry {
  latitude: number;
  longitude: number;
  city: string | null;
  countryCode: string | null;
  ts: number;
}

export function readGeoCacheEntry(): GeoCacheEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as GeoCacheEntry;
    // Accept stale entries — even a day-old position is a better instant
    // fallback than the timezone-centroid city.
    if (typeof entry.latitude !== 'number' || typeof entry.longitude !== 'number') return null;
    return entry;
  } catch {
    return null;
  }
}

export function writeGeoCacheEntry(entry: Omit<GeoCacheEntry, 'ts'>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ ...entry, ts: Date.now() }));
  } catch {}
}

export function coordinatesToCountryCode(latitude: number, longitude: number): string | null {
  try {
    const tz = tzlookup(latitude, longitude);
    const timezone = ct.getTimezone(tz);
    const country = timezone?.countries?.[0] ?? null;
    return normalizeCountryCode(country);
  } catch {
    return null;
  }
}

export interface UseCountryCodeFromGeolocationOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  /** Request geolocation immediately on mount (prompts user for permission) */
  immediate?: boolean;
  /**
   * Continuously watch position for live updates. When true the browser keeps
   * the geolocation source active and reports new positions as the device moves
   * — essential for the travel use case where the user changes cities without
   * reloading the page.
   */
  watch?: boolean;
}

export interface UseCountryCodeFromGeolocationReturn {
  countryCode: string | null;
  position: GeoPosition | null;
  loading: boolean;
  error: GeolocationError | null;
  permission: PermissionState;
  isSupported: boolean;
  requestCountryCode: () => Promise<string | null>;
}

export function useCountryCodeFromGeolocation(
  options: UseCountryCodeFromGeolocationOptions = {},
): UseCountryCodeFromGeolocationReturn {
  const [countryCode, setCountryCode] = useState<string | null>(null);

  const pendingResolveRef = useRef<((value: string | null) => void) | null>(null);
  const pendingPromiseRef = useRef<Promise<string | null> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPending = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingResolveRef.current = null;
    pendingPromiseRef.current = null;
  }, []);

  const geolocationOptions: UseGeolocationOptions = useMemo(
    () => ({
      enableHighAccuracy: options.enableHighAccuracy ?? false,
      // Accept a 30s-old cached fix so the first position resolves fast.
      maximumAge: options.maximumAge ?? 30_000,
      timeout: options.timeout ?? 5_000,
      immediate: false,
      watch: options.watch ?? false,
      onSuccess: (pos) => {
        const nextCountry = coordinatesToCountryCode(pos.coords.latitude, pos.coords.longitude);
        if (nextCountry) {
          setCountryCode(nextCountry);
        }

        if (pendingResolveRef.current) {
          pendingResolveRef.current(nextCountry);
          clearPending();
        }
      },
      // In watch mode the position streams in via onPositionChange; mirror the
      // country-code resolution so live moves update the country too.
      onPositionChange: (pos) => {
        const nextCountry = coordinatesToCountryCode(pos.coords.latitude, pos.coords.longitude);
        if (nextCountry) {
          setCountryCode(nextCountry);
        }
      },
      onError: () => {
        if (pendingResolveRef.current) {
          pendingResolveRef.current(null);
          clearPending();
        }
      },
    }),
    [clearPending, options.enableHighAccuracy, options.maximumAge, options.timeout, options.watch],
  );

  const { position, loading, error, permission, isSupported, getCurrentPosition } =
    useGeolocation(geolocationOptions);

  const requestCountryCode = useCallback((): Promise<string | null> => {
    if (!isSupported) return Promise.resolve(null);

    if (pendingPromiseRef.current) return pendingPromiseRef.current;

    const promise = new Promise<string | null>((resolve) => {
      pendingResolveRef.current = resolve;

      timeoutRef.current = setTimeout(() => {
        if (pendingResolveRef.current) {
          pendingResolveRef.current(null);
          clearPending();
        }
      }, options.timeout ?? 5_000);

      // getCurrentPosition returns void - callbacks handle success/error
      // The onSuccess and onError callbacks in geolocationOptions will resolve the promise
      try {
        getCurrentPosition();
      } catch {
        if (pendingResolveRef.current) {
          pendingResolveRef.current(null);
          clearPending();
        }
      }
    });

    pendingPromiseRef.current = promise;

    return promise;
  }, [clearPending, getCurrentPosition, isSupported, options.timeout]);

  // Auto-request geolocation on mount if immediate option is set
  const hasRequestedRef = useRef(false);
  useEffect(() => {
    if (options.immediate && isSupported && !hasRequestedRef.current) {
      hasRequestedRef.current = true;
      void requestCountryCode();
    }
  }, [options.immediate, isSupported, requestCountryCode]);

  return {
    countryCode,
    position,
    loading,
    error,
    permission,
    isSupported,
    requestCountryCode,
  };
}
