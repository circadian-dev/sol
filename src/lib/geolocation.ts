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
      maximumAge: options.maximumAge ?? 5 * 60 * 1000,
      timeout: options.timeout ?? 5_000,
      immediate: false,
      watch: false,
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
      onError: () => {
        if (pendingResolveRef.current) {
          pendingResolveRef.current(null);
          clearPending();
        }
      },
    }),
    [clearPending, options.enableHighAccuracy, options.maximumAge, options.timeout],
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
