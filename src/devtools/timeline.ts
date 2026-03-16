// src/devtools/timeline.ts
//
// Extracted helpers from showcase-content.client.tsx for the devtools timeline.

import type { SolarPhase } from '../hooks/useSolarPosition';
import type { WidgetPalette } from '../skins/index';

export const PHASES: SolarPhase[] = [
  'midnight',
  'night',
  'dawn',
  'sunrise',
  'morning',
  'solar-noon',
  'afternoon',
  'sunset',
  'dusk',
];

export function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.round(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function phaseForMinutes(minutes: number): SolarPhase {
  if (minutes < 180) return 'midnight';
  if (minutes < 310) return 'night';
  if (minutes < 350) return 'dawn';
  if (minutes < 380) return 'sunrise';
  if (minutes < 710) return 'morning';
  if (minutes < 730) return 'solar-noon';
  if (minutes < 1020) return 'afternoon';
  if (minutes < 1080) return 'sunset';
  if (minutes < 1200) return 'dusk';
  return 'night';
}

export function buildSliderGradient(palettes: Record<SolarPhase, WidgetPalette>) {
  return `linear-gradient(90deg, ${[
    palettes.midnight.bg[1],
    palettes.night.bg[1],
    palettes.dawn.bg[1],
    palettes.sunrise.bg[1],
    palettes.morning.bg[1],
    palettes['solar-noon'].bg[1],
    palettes.afternoon.bg[1],
    palettes.sunset.bg[1],
    palettes.dusk.bg[1],
    palettes.night.bg[1],
    palettes.midnight.bg[1],
  ].join(', ')})`;
}
