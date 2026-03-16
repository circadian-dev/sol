'use client';

/**
 * widgets/solar-widget.shell.tsx  (skin-aware shell)
 *
 * Weather fetch is now centralised here alongside the compact shell:
 *   - Fetches temperature + weather_code from open-meteo once per mount
 *   - Resolves liveWeatherCategory: weatherCategoryOverride ?? live category
 *   - Passes liveWeatherCategory + liveTemperatureC down to skin components
 *   - Skins should prefer these props over running their own fetch
 *
 * simulatedDate prop wins over ctx.simulatedDate (set by SolarDevTools),
 * which wins over undefined (live time). This means the devtools timeline
 * scrubber moves the orb in every widget without requiring any prop wiring.
 */

import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import type { SolarPhase } from '../hooks/useSolarPosition';
import { lerpHex } from '../lib/solar-lerp';
import { useSolarTheme } from '../provider/solar-theme-provider';
import type { DesignMode, WidgetPalette } from '../skins/types/widget-skin.types';

// ─── Re-exported types ────────────────────────────────────────────────────────

export type ExpandDirection =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type WidgetSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type WeatherCategory =
  | 'clear'
  | 'partly-cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy-rain'
  | 'snow'
  | 'heavy-snow'
  | 'thunder';

export type CustomPalettes = Partial<Record<SolarPhase, { bg: [string, string, string] }>>;

import { SKINS } from '../skins/index';
export const PALETTES = SKINS.foundry.widgetPalettes;

// ─── WMO weather code map ─────────────────────────────────────────────────────

const WMO_MAP: Record<number, WeatherCategory> = {
  0: 'clear',
  1: 'clear',
  2: 'partly-cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'fog',
  51: 'drizzle',
  53: 'drizzle',
  55: 'drizzle',
  61: 'rain',
  63: 'rain',
  65: 'heavy-rain',
  71: 'snow',
  73: 'snow',
  75: 'heavy-snow',
  80: 'rain',
  82: 'heavy-rain',
  85: 'snow',
  86: 'heavy-snow',
  95: 'thunder',
  96: 'thunder',
  99: 'thunder',
};

interface LiveWeather {
  temperatureC: number;
  category: WeatherCategory;
}

async function fetchWeather(lat: number, lon: number): Promise<LiveWeather> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', 'temperature_2m,weather_code');
  url.searchParams.set('forecast_days', '1');
  const data = (await fetch(url.toString()).then((r) => r.json())) as {
    current: { temperature_2m: number; weather_code: number };
  };
  return {
    temperatureC: Math.round(data.current.temperature_2m),
    category: WMO_MAP[data.current.weather_code] ?? 'clear',
  };
}

function useWeatherData(lat: number | null, lon: number | null) {
  const [weather, setWeather] = useState<LiveWeather | null>(null);
  useEffect(() => {
    if (!lat || !lon) return;
    let dead = false;
    fetchWeather(lat, lon)
      .then((w) => {
        if (!dead) setWeather(w);
      })
      .catch(() => {});
    const id = setInterval(
      () =>
        fetchWeather(lat, lon)
          .then((w) => {
            if (!dead) setWeather(w);
          })
          .catch(() => {}),
      30 * 60 * 1000,
    );
    return () => {
      dead = true;
      clearInterval(id);
    };
  }, [lat, lon]);
  return weather;
}

// ─── Widget props ─────────────────────────────────────────────────────────────

export interface SolarWidgetProps {
  expandDirection?: ExpandDirection;
  size?: WidgetSize;
  showFlag?: boolean;
  showWeather?: boolean;
  hoverEffect?: boolean;
  customPalettes?: CustomPalettes;
  phaseOverride?: SolarPhase;
  weatherCategoryOverride?: WeatherCategory | null;
  /** Explicit simulated date. Falls back to ctx.simulatedDate (from SolarDevTools)
   *  then to real current time. */
  simulatedDate?: Date;
  /** Lock the widget state: `true` = always expanded, `false` = always collapsed.
   *  Omit or pass `undefined` for default localStorage-driven behaviour. */
  forceExpanded?: boolean;
}

// ─── Palette blending helper ──────────────────────────────────────────────────

function blendWidgetPalette(from: WidgetPalette, to: WidgetPalette, t: number): WidgetPalette {
  return {
    bg: [
      lerpHex(from.bg[0], to.bg[0], t),
      lerpHex(from.bg[1], to.bg[1], t),
      lerpHex(from.bg[2], to.bg[2], t),
    ],
    textColor: lerpHex(from.textColor, to.textColor, t),
    accentColor: lerpHex(from.accentColor, to.accentColor, t),
    orb: lerpHex(from.orb, to.orb, t),
    outerGlow: from.outerGlow,
    mode: t < 0.5 ? from.mode : to.mode,
  };
}

// ─── Shell component ──────────────────────────────────────────────────────────

export function SolarWidget({
  expandDirection = 'bottom-right',
  size = 'lg',
  showFlag = false,
  showWeather = false,
  hoverEffect = false,
  customPalettes,
  phaseOverride,
  weatherCategoryOverride,
  simulatedDate: simulatedDateProp,
  forceExpanded,
}: SolarWidgetProps) {
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => setMounted(true), []);

  const {
    phase,
    blend,
    activeSkin,
    timezone,
    latitude,
    longitude,
    simulatedDate: ctxSimulatedDate,
  } = useSolarTheme();

  // prop wins → context (devtools) → undefined (live)
  const simulatedDate = simulatedDateProp ?? ctxSimulatedDate;

  const [expanded, setExpanded] = useState(false);

  const activePhase = phaseOverride ?? phase;
  const activeBlend = phaseOverride
    ? { phase: phaseOverride, nextPhase: phaseOverride, t: 0 }
    : blend;

  const fromPalette = activeSkin.widgetPalettes[activeBlend.phase];
  const toPalette = activeSkin.widgetPalettes[activeBlend.nextPhase];

  const blendedPalette = useMemo(
    () => blendWidgetPalette(fromPalette, toPalette, activeBlend.t),
    [fromPalette, toPalette, activeBlend.t],
  );

  const finalPalette: WidgetPalette = useMemo(() => {
    if (!customPalettes?.[activePhase]) return blendedPalette;
    return { ...blendedPalette, bg: customPalettes[activePhase]?.bg };
  }, [blendedPalette, customPalettes, activePhase]);

  const time = useMemo(() => {
    const d = simulatedDate ?? new Date();
    const opts: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    };
    if (timezone) opts.timeZone = timezone;
    const parts = new Intl.DateTimeFormat('en-GB', opts).formatToParts(d);
    const hh = parts.find((p) => p.type === 'hour')?.value ?? '00';
    const mm = parts.find((p) => p.type === 'minute')?.value ?? '00';
    return `${hh}:${mm}`;
  }, [simulatedDate, timezone]);

  // ── Centralised weather fetch ────────────────────────────────────────────
  const liveWeather = useWeatherData(latitude ?? null, longitude ?? null);

  const liveWeatherCategory: WeatherCategory | null = showWeather
    ? (weatherCategoryOverride ?? liveWeather?.category ?? null)
    : null;

  const liveTemperatureC: number | null = liveWeather?.temperatureC ?? null;

  const SkinComponent = activeSkin.Component;

  return (
    <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
      <SkinComponent
        phase={activePhase}
        blend={activeBlend}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        expandDirection={expandDirection}
        size={size}
        time={time}
        location=""
        showFlag={showFlag}
        showWeather={showWeather}
        hoverEffect={hoverEffect}
        weather={weatherCategoryOverride}
        liveWeatherCategory={liveWeatherCategory}
        liveTemperatureC={liveTemperatureC}
        palette={finalPalette}
        latitude={latitude}
        longitude={longitude}
        timezone={timezone}
        simulatedDate={simulatedDate}
        forceExpanded={forceExpanded}
      />
    </div>
  );
}
