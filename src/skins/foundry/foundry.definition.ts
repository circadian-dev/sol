/**
 * skins/foundry/foundry.definition.ts
 *
 * Foundry skin — skeuomorphic machined-metal aesthetic.
 * This is the default skin. All token values migrated from the original
 * hardcoded constants in solar-theme-provider.client.tsx and QodinHeroShader.tsx.
 */

import type { SolarPhase } from '../../hooks/useSolarPosition';
import type {
  PhaseVars,
  ShaderPalette,
  SkinDefinition,
  WidgetPalette,
} from '../types/widget-skin.types';
import { FoundryCompact } from './foundry.compact';
import { FoundryWidget, PALETTES } from './foundry.component';

// ─── CSS variable tokens (driven by the rich PhasePalette in foundry.component) ──
// These map each phase's accent/text/bg to the CSS variables consumed by
// SolarThemeProvider. Values are derived from PALETTES to stay in sync.

const PHASE_VARS: Record<SolarPhase, PhaseVars> = {
  midnight: {
    textPrimary: PALETTES.midnight.textPrimary,
    textSecondary: PALETTES.midnight.textSecondary,
    accent: PALETTES.midnight.accentColor,
    surface: PALETTES.midnight.bg[0],
    bgBase: PALETTES.midnight.bg[1],
    bgDeep: PALETTES.midnight.bg[0],
  },
  night: {
    textPrimary: PALETTES.night.textPrimary,
    textSecondary: PALETTES.night.textSecondary,
    accent: PALETTES.night.accentColor,
    surface: PALETTES.night.bg[0],
    bgBase: PALETTES.night.bg[1],
    bgDeep: PALETTES.night.bg[0],
  },
  dawn: {
    textPrimary: PALETTES.dawn.textPrimary,
    textSecondary: PALETTES.dawn.textSecondary,
    accent: PALETTES.dawn.accentColor,
    surface: PALETTES.dawn.bg[0],
    bgBase: PALETTES.dawn.bg[1],
    bgDeep: PALETTES.dawn.bg[0],
  },
  sunrise: {
    textPrimary: PALETTES.sunrise.textPrimary,
    textSecondary: PALETTES.sunrise.textSecondary,
    accent: PALETTES.sunrise.accentColor,
    surface: PALETTES.sunrise.bg[0],
    bgBase: PALETTES.sunrise.bg[1],
    bgDeep: PALETTES.sunrise.bg[0],
  },
  morning: {
    textPrimary: PALETTES.morning.textPrimary,
    textSecondary: PALETTES.morning.textSecondary,
    accent: PALETTES.morning.accentColor,
    surface: PALETTES.morning.bg[2],
    bgBase: PALETTES.morning.bg[2],
    bgDeep: PALETTES.morning.bg[1],
  },
  'solar-noon': {
    textPrimary: PALETTES['solar-noon'].textPrimary,
    textSecondary: PALETTES['solar-noon'].textSecondary,
    accent: PALETTES['solar-noon'].accentColor,
    surface: PALETTES['solar-noon'].bg[2],
    bgBase: PALETTES['solar-noon'].bg[2],
    bgDeep: PALETTES['solar-noon'].bg[1],
  },
  afternoon: {
    textPrimary: PALETTES.afternoon.textPrimary,
    textSecondary: PALETTES.afternoon.textSecondary,
    accent: PALETTES.afternoon.accentColor,
    surface: PALETTES.afternoon.bg[2],
    bgBase: PALETTES.afternoon.bg[2],
    bgDeep: PALETTES.afternoon.bg[1],
  },
  sunset: {
    textPrimary: PALETTES.sunset.textPrimary,
    textSecondary: PALETTES.sunset.textSecondary,
    accent: PALETTES.sunset.accentColor,
    surface: PALETTES.sunset.bg[0],
    bgBase: PALETTES.sunset.bg[1],
    bgDeep: PALETTES.sunset.bg[0],
  },
  dusk: {
    textPrimary: PALETTES.dusk.textPrimary,
    textSecondary: PALETTES.dusk.textSecondary,
    accent: PALETTES.dusk.accentColor,
    surface: PALETTES.dusk.bg[0],
    bgBase: PALETTES.dusk.bg[1],
    bgDeep: PALETTES.dusk.bg[0],
  },
};

// ─── Widget palettes (thin adapters from PhasePalette → WidgetPalette) ────────
// The shell needs a WidgetPalette for blending; Foundry derives these from
// PALETTES so there's a single source of truth.

const WIDGET_PALETTES: Record<SolarPhase, WidgetPalette> = Object.fromEntries(
  (Object.keys(PALETTES) as SolarPhase[]).map((phase) => [
    phase,
    {
      bg: PALETTES[phase].bg,
      textColor: PALETTES[phase].textPrimary,
      accentColor: PALETTES[phase].accentColor,
      orb: PALETTES[phase].orb,
      outerGlow: PALETTES[phase].outerGlow,
      mode: PALETTES[phase].mode,
    } satisfies WidgetPalette,
  ]),
) as Record<SolarPhase, WidgetPalette>;

// ─── Shader palettes (was SHADER_PALETTES in QodinHeroShader) ────────────────

const SHADER_PALETTES: Record<SolarPhase, ShaderPalette> = {
  dawn: {
    colors: ['#200838', '#6B2048', '#C45845', '#EF9060'],
    colorBack: '#120420',
    opacity: 0.62,
    vignette: '#0C0318',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 35% 65%, #3B1054 0%, #C4614A 45%, transparent 82%)',
  },
  sunrise: {
    colors: ['#4A0C0C', '#B84025', '#E88040', '#F5B870'],
    colorBack: '#1C0505',
    opacity: 0.65,
    vignette: '#0E0303',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 30% 65%, #5A1A1A 0%, #D4552A 45%, transparent 82%)',
  },
  morning: {
    colors: ['#9A3A10', '#D87030', '#F0B050', '#FFD880'],
    colorBack: '#F8E8D0',
    opacity: 0.48,
    vignette: '#F5E5CC',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 30% 65%, #E87A3A 0%, #F5C06A 45%, transparent 82%)',
  },
  'solar-noon': {
    colors: ['#1060B8', '#3090D8', '#58B8F0', '#90D8FF'],
    colorBack: '#D8F0FF',
    opacity: 0.42,
    vignette: '#D0E8F8',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 50% 50%, #3A8FD4 0%, #62B8F0 50%, transparent 85%)',
  },
  afternoon: {
    colors: ['#A04800', '#D08020', '#EDB050', '#FFD880'],
    colorBack: '#FFF0D0',
    opacity: 0.45,
    vignette: '#F0D8A0',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 60% 60%, #C05800 0%, #E8A030 45%, transparent 82%)',
  },
  sunset: {
    colors: ['#5A0808', '#A02818', '#C84828', '#E06840'],
    colorBack: '#100404',
    opacity: 0.62,
    vignette: '#0A0404',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 45% 65%, #7A1010 0%, #C83020 45%, transparent 82%)',
  },
  dusk: {
    colors: ['#100530', '#241050', '#401870', '#602890'],
    colorBack: '#080318',
    opacity: 0.72,
    vignette: '#050210',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 55%, #1A0840 0%, #2E1864 45%, transparent 82%)',
  },
  night: {
    colors: ['#020508', '#060F1E', '#0C1830', '#182840'],
    colorBack: '#010408',
    opacity: 0.85,
    vignette: '#010408',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 45%, #040810 0%, #0A1428 50%, transparent 85%)',
  },
  midnight: {
    colors: ['#010103', '#020508', '#04090E', '#08101C'],
    colorBack: '#010103',
    opacity: 0.92,
    vignette: '#010103',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 45%, #010204 0%, #03070E 50%, transparent 85%)',
  },
};

// ─── Skin definition export ───────────────────────────────────────────────────

export const foundrySkin: SkinDefinition = {
  id: 'foundry',
  label: 'Foundry',
  description: 'Machined metal. Skeuomorphic depth.',
  phaseVars: PHASE_VARS,
  widgetPalettes: WIDGET_PALETTES,
  shaderPalettes: SHADER_PALETTES,
  Component: FoundryWidget,
  CompactComponent: FoundryCompact,
  // Full expression — Foundry is the default, most expressive skin.
  // Rich phase accents mean the rays read clearly across all nine phases.
  defaultImage: {
    src: '/images/solar-rays.png',
    opacity: 0.18,
  },
};
