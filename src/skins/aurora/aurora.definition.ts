/**
 * skins/aurora/aurora.definition.ts
 *
 * Aurora skin — animated northern lights aesthetic.
 * Active at night/dawn/dusk with CSS-animated band layers.
 * Dormant and sky-bright during daytime phases.
 *
 * Phase aurora status:
 *   midnight → deep violet/teal aurora (active)
 *   night    → classic green/cyan aurora (fully active)
 *   dawn     → rose/pink aurora fading (active)
 *   sunrise  → aurora residual (faint)
 *   morning  → dormant, warm sky (off)
 *   solar-noon → dormant, bright sky (off)
 *   afternoon → dormant, warm sky (off)
 *   sunset   → aurora bands re-emerging amber/rose (50%)
 *   dusk     → purple/magenta aurora rising (active)
 */

import type { SolarPhase } from '../../hooks/useSolarPosition';
import type {
  PhaseVars,
  ShaderPalette,
  SkinDefinition,
  WidgetPalette,
} from '../types/widget-skin.types';
import { AuroraCompact } from './aurora.compact';
import { AURORA_PALETTES, AuroraWidget } from './aurora.component';

const PHASE_VARS: Record<SolarPhase, PhaseVars> = {
  midnight: {
    textPrimary: AURORA_PALETTES.midnight.textPrimary,
    textSecondary: AURORA_PALETTES.midnight.textSecondary,
    accent: AURORA_PALETTES.midnight.accentColor,
    surface: AURORA_PALETTES.midnight.bg[1],
    bgBase: AURORA_PALETTES.midnight.bg[1],
    bgDeep: AURORA_PALETTES.midnight.bg[0],
  },
  night: {
    textPrimary: AURORA_PALETTES.night.textPrimary,
    textSecondary: AURORA_PALETTES.night.textSecondary,
    accent: AURORA_PALETTES.night.accentColor,
    surface: AURORA_PALETTES.night.bg[1],
    bgBase: AURORA_PALETTES.night.bg[1],
    bgDeep: AURORA_PALETTES.night.bg[0],
  },
  dawn: {
    textPrimary: AURORA_PALETTES.dawn.textPrimary,
    textSecondary: AURORA_PALETTES.dawn.textSecondary,
    accent: AURORA_PALETTES.dawn.accentColor,
    surface: AURORA_PALETTES.dawn.bg[1],
    bgBase: AURORA_PALETTES.dawn.bg[1],
    bgDeep: AURORA_PALETTES.dawn.bg[0],
  },
  sunrise: {
    textPrimary: AURORA_PALETTES.sunrise.textPrimary,
    textSecondary: AURORA_PALETTES.sunrise.textSecondary,
    accent: AURORA_PALETTES.sunrise.accentColor,
    surface: AURORA_PALETTES.sunrise.bg[1],
    bgBase: AURORA_PALETTES.sunrise.bg[1],
    bgDeep: AURORA_PALETTES.sunrise.bg[0],
  },
  morning: {
    textPrimary: AURORA_PALETTES.morning.textPrimary,
    textSecondary: AURORA_PALETTES.morning.textSecondary,
    accent: AURORA_PALETTES.morning.accentColor,
    surface: AURORA_PALETTES.morning.bg[1],
    bgBase: AURORA_PALETTES.morning.bg[1],
    bgDeep: AURORA_PALETTES.morning.bg[0],
  },
  'solar-noon': {
    textPrimary: AURORA_PALETTES['solar-noon'].textPrimary,
    textSecondary: AURORA_PALETTES['solar-noon'].textSecondary,
    accent: AURORA_PALETTES['solar-noon'].accentColor,
    surface: AURORA_PALETTES['solar-noon'].bg[1],
    bgBase: AURORA_PALETTES['solar-noon'].bg[1],
    bgDeep: AURORA_PALETTES['solar-noon'].bg[0],
  },
  afternoon: {
    textPrimary: AURORA_PALETTES.afternoon.textPrimary,
    textSecondary: AURORA_PALETTES.afternoon.textSecondary,
    accent: AURORA_PALETTES.afternoon.accentColor,
    surface: AURORA_PALETTES.afternoon.bg[1],
    bgBase: AURORA_PALETTES.afternoon.bg[1],
    bgDeep: AURORA_PALETTES.afternoon.bg[0],
  },
  sunset: {
    textPrimary: AURORA_PALETTES.sunset.textPrimary,
    textSecondary: AURORA_PALETTES.sunset.textSecondary,
    accent: AURORA_PALETTES.sunset.accentColor,
    surface: AURORA_PALETTES.sunset.bg[1],
    bgBase: AURORA_PALETTES.sunset.bg[1],
    bgDeep: AURORA_PALETTES.sunset.bg[0],
  },
  dusk: {
    textPrimary: AURORA_PALETTES.dusk.textPrimary,
    textSecondary: AURORA_PALETTES.dusk.textSecondary,
    accent: AURORA_PALETTES.dusk.accentColor,
    surface: AURORA_PALETTES.dusk.bg[1],
    bgBase: AURORA_PALETTES.dusk.bg[1],
    bgDeep: AURORA_PALETTES.dusk.bg[0],
  },
};

const WIDGET_PALETTES: Record<SolarPhase, WidgetPalette> = Object.fromEntries(
  (Object.keys(AURORA_PALETTES) as SolarPhase[]).map((phase) => [
    phase,
    {
      bg: AURORA_PALETTES[phase].bg,
      textColor: AURORA_PALETTES[phase].textPrimary,
      accentColor: AURORA_PALETTES[phase].accentColor,
      orb: AURORA_PALETTES[phase].orbFill,
      outerGlow: AURORA_PALETTES[phase].outerGlow,
      mode: AURORA_PALETTES[phase].mode,
    } satisfies WidgetPalette,
  ]),
) as Record<SolarPhase, WidgetPalette>;

// Aurora shaders: deep skies at night with subtle aurora color wash.
// Daytime phases get clean bright sky gradients.
const SHADER_PALETTES: Record<SolarPhase, ShaderPalette> = {
  midnight: {
    colors: ['#040814', '#060C1C', '#0A1028', '#0E1838'],
    colorBack: '#020610',
    opacity: 0.9,
    vignette: '#020508',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 45%, #060C1C 0%, #0A1028 55%, transparent 85%)',
  },
  night: {
    colors: ['#040C0C', '#060E10', '#081218', '#0C1820'],
    colorBack: '#020A08',
    opacity: 0.88,
    vignette: '#020806',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 38% 48%, #060E10 0%, #0A1418 55%, transparent 85%)',
  },
  dawn: {
    colors: ['#180820', '#241030', '#341840', '#442050'],
    colorBack: '#140618',
    opacity: 0.82,
    vignette: '#100412',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 35% 52%, #1E0C28 0%, #2E1438 50%, transparent 82%)',
  },
  sunrise: {
    colors: ['#2A1010', '#401820', '#602030', '#7A2840'],
    colorBack: '#200C0C',
    opacity: 0.72,
    vignette: '#180808',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 32% 58%, #341418 0%, #4E1C28 48%, transparent 82%)',
  },
  morning: {
    colors: ['#E8E0D0', '#F0E8D8', '#F8F4EC', '#FEFCF8'],
    colorBack: '#E0D8C8',
    opacity: 0.28,
    vignette: '#D8D0C0',
    cssFallback:
      'radial-gradient(ellipse 120% 80% at 40% 55%, #DEDAD0 0%, #F0E8D8 55%, transparent 88%)',
  },
  'solar-noon': {
    colors: ['#D8E8F4', '#E4F0F8', '#F0F8FF', '#FAFDFF'],
    colorBack: '#D0E0EC',
    opacity: 0.22,
    vignette: '#C8D8E8',
    cssFallback:
      'radial-gradient(ellipse 120% 80% at 50% 50%, #D4E8F4 0%, #E4F0F8 55%, transparent 88%)',
  },
  afternoon: {
    colors: ['#E4DCCC', '#EEE4D4', '#F6F0E4', '#FDFAF4'],
    colorBack: '#DCD4C4',
    opacity: 0.26,
    vignette: '#D4CCC0',
    cssFallback:
      'radial-gradient(ellipse 120% 80% at 55% 55%, #E0D6C8 0%, #EEE4D4 55%, transparent 88%)',
  },
  sunset: {
    colors: ['#180810', '#281018', '#3A1820', '#4E2028'],
    colorBack: '#140608',
    opacity: 0.8,
    vignette: '#100406',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 44% 56%, #1E0C14 0%, #2E1420 48%, transparent 82%)',
  },
  dusk: {
    colors: ['#100818', '#180C24', '#241030', '#30163C'],
    colorBack: '#0C0614',
    opacity: 0.84,
    vignette: '#080410',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 42% 52%, #160A1E 0%, #200E2A 48%, transparent 82%)',
  },
};

export const auroraSkin: SkinDefinition = {
  id: 'aurora',
  label: 'Aurora',
  description: 'Northern lights. Animated bands, alive at night.',
  phaseVars: PHASE_VARS,
  widgetPalettes: WIDGET_PALETTES,
  shaderPalettes: SHADER_PALETTES,
  Component: AuroraWidget,
  CompactComponent: AuroraCompact,
  // Aurora already has strong visual drama from the animated band layers
  // at night phases. The rays at 0.14 add depth without competing —
  // during day phases they provide subtle warmth; at night they're nearly
  // invisible against the dark shader (which is the right behaviour).
  defaultImage: {
    src: '/images/solar-rays.png',
    opacity: 0.14,
  },
};
