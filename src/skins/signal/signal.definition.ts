/**
 * skins/signal/signal.definition.ts
 *
 * Signal skin — brutalist terminal aesthetic.
 * Monochrome surfaces. Single accent hue shifts with solar phase.
 * No gradients, no chrome, no weather icons — pure structural text.
 */

import type { SolarPhase } from '../../hooks/useSolarPosition';
import type {
  PhaseVars,
  ShaderPalette,
  SkinDefinition,
  WidgetPalette,
} from '../types/widget-skin.types';
import { SignalCompact } from './signal.compact';
import { SIGNAL_PALETTES, SignalWidget } from './signal.component';

// ─── CSS variable tokens ──────────────────────────────────────────────────────
// Signal keeps all surfaces near-black. Only accent shifts.

const PHASE_VARS: Record<SolarPhase, PhaseVars> = {
  midnight: {
    textPrimary: SIGNAL_PALETTES.midnight.textPrimary,
    textSecondary: SIGNAL_PALETTES.midnight.textMuted,
    accent: SIGNAL_PALETTES.midnight.accent,
    surface: SIGNAL_PALETTES.midnight.bg[0],
    bgBase: SIGNAL_PALETTES.midnight.bg[1],
    bgDeep: SIGNAL_PALETTES.midnight.bg[0],
  },
  night: {
    textPrimary: SIGNAL_PALETTES.night.textPrimary,
    textSecondary: SIGNAL_PALETTES.night.textMuted,
    accent: SIGNAL_PALETTES.night.accent,
    surface: SIGNAL_PALETTES.night.bg[0],
    bgBase: SIGNAL_PALETTES.night.bg[1],
    bgDeep: SIGNAL_PALETTES.night.bg[0],
  },
  dawn: {
    textPrimary: SIGNAL_PALETTES.dawn.textPrimary,
    textSecondary: SIGNAL_PALETTES.dawn.textMuted,
    accent: SIGNAL_PALETTES.dawn.accent,
    surface: SIGNAL_PALETTES.dawn.bg[0],
    bgBase: SIGNAL_PALETTES.dawn.bg[1],
    bgDeep: SIGNAL_PALETTES.dawn.bg[0],
  },
  sunrise: {
    textPrimary: SIGNAL_PALETTES.sunrise.textPrimary,
    textSecondary: SIGNAL_PALETTES.sunrise.textMuted,
    accent: SIGNAL_PALETTES.sunrise.accent,
    surface: SIGNAL_PALETTES.sunrise.bg[0],
    bgBase: SIGNAL_PALETTES.sunrise.bg[1],
    bgDeep: SIGNAL_PALETTES.sunrise.bg[0],
  },
  morning: {
    textPrimary: SIGNAL_PALETTES.morning.textPrimary,
    textSecondary: SIGNAL_PALETTES.morning.textMuted,
    accent: SIGNAL_PALETTES.morning.accent,
    surface: SIGNAL_PALETTES.morning.bg[0],
    bgBase: SIGNAL_PALETTES.morning.bg[1],
    bgDeep: SIGNAL_PALETTES.morning.bg[0],
  },
  'solar-noon': {
    textPrimary: SIGNAL_PALETTES['solar-noon'].textPrimary,
    textSecondary: SIGNAL_PALETTES['solar-noon'].textMuted,
    accent: SIGNAL_PALETTES['solar-noon'].accent,
    surface: SIGNAL_PALETTES['solar-noon'].bg[0],
    bgBase: SIGNAL_PALETTES['solar-noon'].bg[1],
    bgDeep: SIGNAL_PALETTES['solar-noon'].bg[0],
  },
  afternoon: {
    textPrimary: SIGNAL_PALETTES.afternoon.textPrimary,
    textSecondary: SIGNAL_PALETTES.afternoon.textMuted,
    accent: SIGNAL_PALETTES.afternoon.accent,
    surface: SIGNAL_PALETTES.afternoon.bg[0],
    bgBase: SIGNAL_PALETTES.afternoon.bg[1],
    bgDeep: SIGNAL_PALETTES.afternoon.bg[0],
  },
  sunset: {
    textPrimary: SIGNAL_PALETTES.sunset.textPrimary,
    textSecondary: SIGNAL_PALETTES.sunset.textMuted,
    accent: SIGNAL_PALETTES.sunset.accent,
    surface: SIGNAL_PALETTES.sunset.bg[0],
    bgBase: SIGNAL_PALETTES.sunset.bg[1],
    bgDeep: SIGNAL_PALETTES.sunset.bg[0],
  },
  dusk: {
    textPrimary: SIGNAL_PALETTES.dusk.textPrimary,
    textSecondary: SIGNAL_PALETTES.dusk.textMuted,
    accent: SIGNAL_PALETTES.dusk.accent,
    surface: SIGNAL_PALETTES.dusk.bg[0],
    bgBase: SIGNAL_PALETTES.dusk.bg[1],
    bgDeep: SIGNAL_PALETTES.dusk.bg[0],
  },
};

// ─── Widget palettes ──────────────────────────────────────────────────────────

const WIDGET_PALETTES: Record<SolarPhase, WidgetPalette> = Object.fromEntries(
  (Object.keys(SIGNAL_PALETTES) as SolarPhase[]).map((phase) => [
    phase,
    {
      bg: SIGNAL_PALETTES[phase].bg,
      textColor: SIGNAL_PALETTES[phase].textPrimary,
      accentColor: SIGNAL_PALETTES[phase].accent,
      orb: SIGNAL_PALETTES[phase].accent, // reticle draws itself; shell uses this for blending
      outerGlow: SIGNAL_PALETTES[phase].accentDim,
      mode: 'dark' as const, // Signal is always dark-mode
    } satisfies WidgetPalette,
  ]),
) as Record<SolarPhase, WidgetPalette>;

// ─── Shader palettes ──────────────────────────────────────────────────────────
// Signal's shader stays very dark with only a faint accent-colored tint.
// No heavy atmospheric gradients — just raw structure.

const SHADER_PALETTES: Record<SolarPhase, ShaderPalette> = {
  midnight: {
    colors: ['#060610', '#080814', '#0C0C18', '#10101E'],
    colorBack: '#040408',
    opacity: 0.92,
    vignette: '#020208',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 45%, #060610 0%, #0C0C18 50%, transparent 85%)',
  },
  night: {
    colors: ['#060610', '#080814', '#0C0C18', '#10101E'],
    colorBack: '#040408',
    opacity: 0.9,
    vignette: '#020208',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 45%, #060610 0%, #0C0C18 50%, transparent 85%)',
  },
  dawn: {
    colors: ['#0C0A08', '#100E0A', '#14120C', '#181410'],
    colorBack: '#080604',
    opacity: 0.9,
    vignette: '#060402',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 45%, #0C0A08 0%, #14120C 50%, transparent 85%)',
  },
  sunrise: {
    colors: ['#0C0A08', '#100E0A', '#14120C', '#181410'],
    colorBack: '#080604',
    opacity: 0.9,
    vignette: '#060402',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 45%, #0C0A08 0%, #14120C 50%, transparent 85%)',
  },
  morning: {
    colors: ['#0C0A06', '#100E08', '#14120A', '#18160C'],
    colorBack: '#080602',
    opacity: 0.9,
    vignette: '#060400',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 45%, #0C0A06 0%, #14120A 50%, transparent 85%)',
  },
  'solar-noon': {
    colors: ['#0A0A0A', '#0E0E0E', '#121212', '#161616'],
    colorBack: '#080808',
    opacity: 0.9,
    vignette: '#060606',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 50% 50%, #0A0A0A 0%, #141414 50%, transparent 85%)',
  },
  afternoon: {
    colors: ['#0C0A06', '#100E08', '#14120A', '#18160C'],
    colorBack: '#080602',
    opacity: 0.9,
    vignette: '#060400',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 45%, #0C0A06 0%, #14120A 50%, transparent 85%)',
  },
  sunset: {
    colors: ['#0C0808', '#100C0A', '#14100C', '#181410'],
    colorBack: '#080404',
    opacity: 0.9,
    vignette: '#060202',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 45%, #0C0808 0%, #14100C 50%, transparent 85%)',
  },
  dusk: {
    colors: ['#0C0808', '#100C0A', '#14100C', '#181410'],
    colorBack: '#080404',
    opacity: 0.9,
    vignette: '#060202',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 45%, #0C0808 0%, #14100C 50%, transparent 85%)',
  },
};

// ─── Skin definition export ───────────────────────────────────────────────────

export const signalSkin: SkinDefinition = {
  id: 'signal',
  label: 'Signal',
  description: 'Brutalist terminal. Raw structure.',
  phaseVars: PHASE_VARS,
  widgetPalettes: WIDGET_PALETTES,
  shaderPalettes: SHADER_PALETTES,
  Component: SignalWidget,
  CompactComponent: SignalCompact,
  // Signal is structural and text-first. The rays at 0.08 are barely a
  // suggestion — just enough to prevent the background feeling completely dead
  // while preserving the brutalist, no-decoration philosophy.
  defaultImage: {
    src: '/images/solar-rays.png',
    opacity: 0.08,
  },
};
