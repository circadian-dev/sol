/**
 * skins/parchment/parchment.definition.ts
 *
 * Parchment skin — Notion-native document aesthetic.
 *
 * This skin is philosophically opposite to all other skins in the library.
 * Where Foundry, Mineral, Aurora etc. compete for visual attention, Parchment
 * disappears into its host document. It is designed to be embedded in a
 * Notion page without drawing a single unnecessary pixel of attention.
 *
 * Design grammar:
 *   - Off-white surface (#FFFFFF / #F7F6F3)
 *   - Near-black text rgba(55,53,47,…) — exactly Notion's text color
 *   - 1px rgba(55,53,47,0.09) borders — exactly Notion's separator color
 *   - Zero gradients on card body
 *   - Zero glows, zero outer glow rings
 *   - Zero backdrop-filter blur
 *   - Zero shadow with any color component (only rgba(0,0,0,0.04-0.06))
 *   - Phase variation: a very faint semantic wash (0.05-0.08 opacity) from
 *     Notion's own six tag colors — the ONLY color in the entire skin
 *   - Weather: a single faint callout tint, no WeatherLayer or WeatherBackdrop
 *   - Arc: 1px hairline, N_BORDER_MED color, no filter
 *   - Orb: 5-6px filled dot, N_TEXT_MED color, no glow
 *
 * CSS variable tokens:
 *   These are intentionally flat — Parchment doesn't shift hue per phase.
 *   The only per-phase variation is the faint background wash, which is
 *   not expressible as a single CSS variable. PhaseVars use the same
 *   near-black / off-white palette throughout, matching Notion exactly.
 *
 * ShaderPalettes:
 *   Parchment uses the page background as its "shader" — no hero shader
 *   is appropriate. All shader entries point to a near-white cssFallback
 *   and minimal opacity so that any shader host degrades gracefully.
 */

import type { SolarPhase } from '../../hooks/useSolarPosition';
import type {
  PhaseVars,
  ShaderPalette,
  SkinDefinition,
  WidgetPalette,
} from '../types/widget-skin.types';
import { ParchmentCompact } from './parchment.compact';
import { ParchmentWidget } from './parchment.component';

// ─── Notion design tokens ─────────────────────────────────────────────────────

const N_TEXT = 'rgba(55,53,47,1)';
const N_TEXT_MED = 'rgba(55,53,47,0.65)';
const N_TEXT_LIGHT = 'rgba(55,53,47,0.45)';
const N_BORDER = 'rgba(55,53,47,0.09)';
const N_SURFACE = '#FFFFFF';
const N_SURFACE_2 = '#F7F6F3';

// ─── Phase semantic washes (Notion tag palette) ───────────────────────────────
// These are the ONLY per-phase colors. Used for background wash only.

const PHASE_WASH_HEX: Record<SolarPhase, string> = {
  midnight: '#FFFFFF', // no wash — pure white
  night: '#F5F8FA', // blue-tinted off-white
  dawn: '#FAF8FC', // purple-tinted off-white
  sunrise: '#FDF7F2', // orange-tinted off-white
  morning: '#FDFCF5', // yellow-tinted off-white
  'solar-noon': '#F5F8FA', // blue-tinted off-white
  afternoon: '#FDF7F2', // orange-tinted off-white
  sunset: '#FDF5F4', // red-tinted off-white
  dusk: '#FAF8FC', // purple-tinted off-white
};

// ─── PhaseVars ────────────────────────────────────────────────────────────────
// All phases share the same Notion text/border/surface tokens.
// The very subtle background shift is expressed via PHASE_WASH_HEX above.

const PHASE_VARS: Record<SolarPhase, PhaseVars> = Object.fromEntries(
  (
    [
      'midnight',
      'night',
      'dawn',
      'sunrise',
      'morning',
      'solar-noon',
      'afternoon',
      'sunset',
      'dusk',
    ] as SolarPhase[]
  ).map((phase) => [
    phase,
    {
      textPrimary: N_TEXT,
      textSecondary: N_TEXT_MED,
      accent: N_TEXT_LIGHT,
      surface: PHASE_WASH_HEX[phase],
      bgBase: PHASE_WASH_HEX[phase],
      bgDeep: N_SURFACE,
    } satisfies PhaseVars,
  ]),
) as Record<SolarPhase, PhaseVars>;

// ─── WidgetPalettes ───────────────────────────────────────────────────────────
// Parchment's palette is almost entirely constant — the skin deliberately
// avoids per-phase color shifts. The `bg` triple uses the phase wash hex
// for position[1] so that any blending infrastructure sees a smooth shift.

const WIDGET_PALETTES: Record<SolarPhase, WidgetPalette> = Object.fromEntries(
  (
    [
      'midnight',
      'night',
      'dawn',
      'sunrise',
      'morning',
      'solar-noon',
      'afternoon',
      'sunset',
      'dusk',
    ] as SolarPhase[]
  ).map((phase) => [
    phase,
    {
      bg: [N_SURFACE, PHASE_WASH_HEX[phase], N_SURFACE_2] as [string, string, string],
      textColor: N_TEXT,
      accentColor: N_TEXT_LIGHT,
      orb: N_TEXT_MED,
      outerGlow: 'transparent',
      mode: 'light' as const,
    } satisfies WidgetPalette,
  ]),
) as Record<SolarPhase, WidgetPalette>;

// ─── ShaderPalettes ───────────────────────────────────────────────────────────
// Parchment is document-native — a hero shader would be inappropriate.
// All entries use a near-white fallback at near-zero opacity so that any
// page-level shader host degrades to the page background gracefully.

const SHADER_PALETTES: Record<SolarPhase, ShaderPalette> = Object.fromEntries(
  (
    [
      'midnight',
      'night',
      'dawn',
      'sunrise',
      'morning',
      'solar-noon',
      'afternoon',
      'sunset',
      'dusk',
    ] as SolarPhase[]
  ).map((phase) => [
    phase,
    {
      colors: ['#F7F6F3', '#F7F6F3', '#FFFFFF', '#FFFFFF'],
      colorBack: '#F7F6F3',
      opacity: 0.04, // nearly invisible
      vignette: '#F7F6F3',
      cssFallback: `radial-gradient(ellipse 100% 80% at 50% 50%, ${PHASE_WASH_HEX[phase]} 0%, #FFFFFF 100%)`,
    } satisfies ShaderPalette,
  ]),
) as Record<SolarPhase, ShaderPalette>;

// ─── Skin definition export ───────────────────────────────────────────────────

export const parchmentSkin: SkinDefinition = {
  id: 'parchment',
  label: 'Parchment',
  description: 'Document-native. Notion-compatible restraint.',
  phaseVars: PHASE_VARS,
  widgetPalettes: WIDGET_PALETTES,
  shaderPalettes: SHADER_PALETTES,
  Component: ParchmentWidget,
  CompactComponent: ParchmentCompact,
};
