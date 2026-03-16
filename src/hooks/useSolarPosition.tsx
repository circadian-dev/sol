/**
 * useSolarPosition.ts
 *
 * Computes real solar position (altitude, azimuth, sunrise, solar noon, sunset)
 * from geographic coordinates + current time. No external deps required.
 *
 * Algorithm: NOAA Solar Calculator equations (accurate to ~1 minute)
 * https://gml.noaa.gov/grad/solcalc/solareqns.PDF
 */

'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SolarTimes {
  /** Minutes from midnight (local) */
  sunrise: number;
  solarNoon: number;
  sunset: number;
  /** Civil twilight — when sky starts brightening */
  dawnCivil: number;
  /** Civil twilight — when sky finishes darkening */
  duskCivil: number;
}

export type SolarPhase =
  | 'night' // deep night, no twilight
  | 'dawn' // civil twilight before sunrise
  | 'sunrise' // ~20 min window around sunrise
  | 'morning' // post-sunrise to solar noon
  | 'solar-noon' // ~20 min window around noon
  | 'afternoon' // noon to pre-sunset
  | 'sunset' // ~20 min window around sunset
  | 'dusk' // civil twilight after sunset
  | 'midnight'; // deep night (00:00–03:00)

export interface SolarPosition {
  /** Sun altitude in degrees (-90 to 90). Negative = below horizon */
  altitude: number;
  /** Sun azimuth in degrees (0=N, 90=E, 180=S, 270=W) */
  azimuth: number;
  /** 0–1 progress of the day arc (0=sunrise, 0.5=solar noon, 1=sunset) */
  dayProgress: number;
  /** 0–1 progress of the night arc (0=sunset, 0.5=solar midnight, 1=next sunrise) */
  nightProgress: number;
  /** Whether the sun is above the horizon */
  isDaytime: boolean;
  /** Current named phase */
  phase: SolarPhase;
  /** Today's solar event times */
  times: SolarTimes;
  /** Minutes from midnight (local), 0–1440 */
  localMinutes: number;
}

export interface SolarBlend {
  phase: SolarPhase;
  nextPhase: SolarPhase;
  /** 0 = just entered phase, 1 = about to leave (ease-in-out applied) */
  t: number;
}

// ─── Core Solar Math ──────────────────────────────────────────────────────────

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

/** Day of year (1–366) */
function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

/**
 * Equation of time (minutes) and solar declination (degrees)
 * Based on NOAA simplified formula
 */
function equationOfTimeAndDeclination(doy: number): { eot: number; decl: number } {
  const B = (360 / 365) * (doy - 81) * RAD;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const declPrecise = 23.45 * Math.sin(((360 * (284 + doy)) / 365) * RAD);
  return { eot, decl: declPrecise };
}

/**
 * Solar hour angle (degrees) for a given local time
 */
function hourAngle(
  localMinutes: number,
  longitudeDeg: number,
  utcOffsetMinutes: number,
  eot: number,
): number {
  const solarTime = localMinutes + 4 * longitudeDeg + eot - utcOffsetMinutes;
  return solarTime / 4 - 180;
}

/**
 * Sun altitude (elevation) in degrees
 */
function sunAltitude(latRad: number, declRad: number, haRad: number): number {
  return (
    Math.asin(
      Math.sin(latRad) * Math.sin(declRad) + Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad),
    ) * DEG
  );
}

/**
 * Sun azimuth in degrees (0=N, 90=E, 180=S, 270=W)
 */
function sunAzimuth(latRad: number, declRad: number, haRad: number, altitude: number): number {
  const altRad = altitude * RAD;
  let az =
    Math.acos(
      (Math.sin(declRad) - Math.sin(latRad) * Math.sin(altRad)) /
        (Math.cos(latRad) * Math.cos(altRad)),
    ) * DEG;
  if (Math.sin(haRad) > 0) az = 360 - az;
  return az;
}

/**
 * Minutes-from-midnight for a given hour angle threshold
 */
function riseSetMinutes(
  latRad: number,
  declRad: number,
  altitudeDeg: number,
  longitudeDeg: number,
  utcOffsetMinutes: number,
  eot: number,
  rising: boolean,
): number | null {
  const cosHA =
    (Math.sin(altitudeDeg * RAD) - Math.sin(latRad) * Math.sin(declRad)) /
    (Math.cos(latRad) * Math.cos(declRad));

  if (cosHA < -1 || cosHA > 1) return null;

  const ha = Math.acos(cosHA) * DEG;
  const noon = 720 - 4 * longitudeDeg - eot + utcOffsetMinutes;
  return rising ? noon - ha * 4 : noon + ha * 4;
}

/**
 * Compute full solar position for a given date + location
 */
export function computeSolarPosition(
  date: Date,
  latitudeDeg: number,
  longitudeDeg: number,
  utcOffsetMinutes: number,
): SolarPosition {
  const doy = dayOfYear(date);
  const { eot, decl } = equationOfTimeAndDeclination(doy);

  const latRad = latitudeDeg * RAD;
  const declRad = decl * RAD;

  const localMinutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;

  const ha = hourAngle(localMinutes, longitudeDeg, utcOffsetMinutes, eot);
  const haRad = ha * RAD;

  const altitude = sunAltitude(latRad, declRad, haRad);
  const azimuth = sunAzimuth(latRad, declRad, haRad, altitude);

  const sunriseMin =
    riseSetMinutes(latRad, declRad, -0.833, longitudeDeg, utcOffsetMinutes, eot, true) ?? 360;
  const sunsetMin =
    riseSetMinutes(latRad, declRad, -0.833, longitudeDeg, utcOffsetMinutes, eot, false) ?? 1080;
  const dawnCivil =
    riseSetMinutes(latRad, declRad, -6, longitudeDeg, utcOffsetMinutes, eot, true) ??
    sunriseMin - 30;
  const duskCivil =
    riseSetMinutes(latRad, declRad, -6, longitudeDeg, utcOffsetMinutes, eot, false) ??
    sunsetMin + 30;
  const solarNoon = (sunriseMin + sunsetMin) / 2;

  const times: SolarTimes = {
    sunrise: sunriseMin,
    solarNoon,
    sunset: sunsetMin,
    dawnCivil,
    duskCivil,
  };

  const isDaytime = altitude > -0.833;

  const dayDuration = sunsetMin - sunriseMin;
  const dayProgress =
    dayDuration > 0 ? Math.max(0, Math.min(1, (localMinutes - sunriseMin) / dayDuration)) : 0.5;

  const nightDuration = 1440 - dayDuration;
  const minutesSinceSunset =
    localMinutes >= sunsetMin ? localMinutes - sunsetMin : localMinutes + (1440 - sunsetMin);
  const nightProgress =
    nightDuration > 0 ? Math.max(0, Math.min(1, minutesSinceSunset / nightDuration)) : 0.5;

  const phase = classifyPhase(localMinutes, times, isDaytime);

  return { altitude, azimuth, dayProgress, nightProgress, isDaytime, phase, times, localMinutes };
}

function classifyPhase(localMinutes: number, times: SolarTimes, isDaytime: boolean): SolarPhase {
  const { sunrise, solarNoon, sunset, dawnCivil, duskCivil } = times;

  if (localMinutes >= dawnCivil - 10 && localMinutes < sunrise - 10) return 'dawn';
  if (localMinutes >= sunrise - 10 && localMinutes < sunrise + 20) return 'sunrise';
  if (localMinutes >= sunrise + 20 && localMinutes < solarNoon - 10) return 'morning';
  if (localMinutes >= solarNoon - 10 && localMinutes < solarNoon + 10) return 'solar-noon';
  if (localMinutes >= solarNoon + 10 && localMinutes < sunset - 20) return 'afternoon';
  if (localMinutes >= sunset - 20 && localMinutes < sunset + 10) return 'sunset';
  if (localMinutes >= sunset + 10 && localMinutes < duskCivil + 20) return 'dusk';
  if (localMinutes >= 0 && localMinutes < 180) return 'midnight';
  return 'night';
}

// ─── Phase blending ───────────────────────────────────────────────────────────

function buildPhaseTimeline(times: SolarTimes): Array<{
  phase: string;
  startMinute: number;
  endMinute: number;
}> {
  const { dawnCivil, sunrise, solarNoon, sunset, duskCivil } = times;
  return [
    { phase: 'midnight', startMinute: 0, endMinute: 180 },
    { phase: 'night', startMinute: 180, endMinute: dawnCivil - 10 },
    { phase: 'dawn', startMinute: dawnCivil - 10, endMinute: sunrise - 10 },
    { phase: 'sunrise', startMinute: sunrise - 10, endMinute: sunrise + 20 },
    { phase: 'morning', startMinute: sunrise + 20, endMinute: solarNoon - 10 },
    { phase: 'solar-noon', startMinute: solarNoon - 10, endMinute: solarNoon + 10 },
    { phase: 'afternoon', startMinute: solarNoon + 10, endMinute: sunset - 20 },
    { phase: 'sunset', startMinute: sunset - 20, endMinute: sunset + 10 },
    { phase: 'dusk', startMinute: sunset + 10, endMinute: duskCivil + 20 },
    { phase: 'night2', startMinute: duskCivil + 20, endMinute: 1440 },
  ];
}

export function getSolarBlend(localMinutes: number, times: SolarTimes | undefined): SolarBlend {
  if (!times) return { phase: 'morning', nextPhase: 'solar-noon', t: 0 };
  const timeline = buildPhaseTimeline(times);
  for (let i = 0; i < timeline.length; i++) {
    const { phase, startMinute, endMinute } = timeline[i];
    if (localMinutes >= startMinute && localMinutes < endMinute) {
      const rawT = (localMinutes - startMinute) / Math.max(1, endMinute - startMinute);
      const t = rawT < 0.5 ? 2 * rawT * rawT : -1 + (4 - 2 * rawT) * rawT;
      const nextRaw = timeline[i + 1]?.phase ?? 'midnight';
      const nextPhase = (nextRaw === 'night2' ? 'night' : nextRaw) as SolarPhase;
      const resolvedPhase = (phase === 'night2' ? 'night' : phase) as SolarPhase;
      return { phase: resolvedPhase, nextPhase, t };
    }
  }
  return { phase: 'night', nextPhase: 'midnight', t: 0 };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseSolarPositionOptions {
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  updateIntervalMs?: number;
  simulatedDate?: Date;
}

export interface UseSolarPositionReturn extends SolarPosition {
  isReady: boolean;
  blend: SolarBlend;
}

function utcOffsetFromTimezone(tz: string, at?: Date): number {
  try {
    const now = at ?? new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
    const match = offsetPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) return 0;
    const sign = match[1] === '+' ? 1 : -1;
    const hours = Number.parseInt(match[2] ?? '0', 10);
    const minutes = Number.parseInt(match[3] ?? '0', 10);
    return sign * (hours * 60 + minutes);
  } catch {
    return 0;
  }
}

const DEFAULT_LAT = 51.5074;
const DEFAULT_LON = -0.1278;
const DEFAULT_TZ = 'Europe/London';

export function useSolarPosition(options: UseSolarPositionOptions = {}): UseSolarPositionReturn {
  const { latitude, longitude, timezone, updateIntervalMs = 10_000, simulatedDate } = options;

  const lat = latitude ?? DEFAULT_LAT;
  const lon = longitude ?? DEFAULT_LON;
  const tz = timezone ?? DEFAULT_TZ;
  const simulatedTs = simulatedDate?.getTime();

  // ── Initial state ────────────────────────────────────────────────────────
  // Start with a stable SSR-safe default so server and client hydration match
  // (no hydration warnings). The real position is computed in useLayoutEffect
  // below — which fires BEFORE the browser paints — so users never see the
  // default "morning" state.
  const [position, setPosition] = useState<SolarPosition>({
    altitude: 45,
    azimuth: 180,
    dayProgress: 0.5,
    nightProgress: 0.5,
    isDaytime: true,
    phase: 'morning' as SolarPhase,
    times: { sunrise: 360, solarNoon: 720, sunset: 1080, dawnCivil: 330, duskCivil: 1110 },
    localMinutes: 720,
  });
  const [isReady, setIsReady] = useState(false);

  // ── Compute real position before first paint ─────────────────────────────
  // useLayoutEffect runs after DOM mutations but before the browser paints,
  // so the user never sees the SSR default — the widget appears with the
  // correct phase immediately. Mount-only — the interval effect below handles
  // subsequent updates when coords/tz change.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only — interval effect handles updates
  useLayoutEffect(() => {
    const date = simulatedDate ?? new Date();
    const utcOff = utcOffsetFromTimezone(tz, date);
    setPosition(computeSolarPosition(date, lat, lon, utcOff));
    setIsReady(true);
  }, []);

  // ── Interval effect ──────────────────────────────────────────────────────
  // lat, lon, tz are in the dependency array so the interval restarts
  // immediately when coords change — no more waiting up to 5 seconds for
  // the next tick to pick up the new coordinates via refs.
  useEffect(() => {
    const update = (d: Date) => {
      const utcOff = utcOffsetFromTimezone(tz, d);
      const pos = computeSolarPosition(d, lat, lon, utcOff);
      setPosition(pos);
      setIsReady(true);
    };

    if (simulatedDate) {
      update(simulatedDate);
      return;
    }

    update(new Date());
    const id = setInterval(() => update(new Date()), updateIntervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon, tz, updateIntervalMs, simulatedDate]);

  const blend = getSolarBlend(position.localMinutes, position.times);
  return { ...position, isReady, blend };
}
