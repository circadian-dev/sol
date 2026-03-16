/**
 * skins/meridian/meridian.definition.ts
 *
 * Meridian skin — clean, modern, airy. The anti-Foundry.
 * Solar phases expressed as barely-there surface tints.
 * No texture, no grain, no heavy materiality.
 */

import type { SolarPhase } from '../../hooks/useSolarPosition';
import type {
  PhaseVars,
  ShaderPalette,
  SkinDefinition,
  WidgetPalette,
} from '../types/widget-skin.types';
import { MeridianCompact } from './meridian.compact';
import { MERIDIAN_PALETTES, MeridianWidget } from './meridian.component';

const PHASE_VARS: Record<SolarPhase, PhaseVars> = {
  midnight: {
    textPrimary: MERIDIAN_PALETTES.midnight.textPrimary,
    textSecondary: MERIDIAN_PALETTES.midnight.textSecondary,
    accent: MERIDIAN_PALETTES.midnight.accentColor,
    surface: MERIDIAN_PALETTES.midnight.surface,
    bgBase: MERIDIAN_PALETTES.midnight.bg[1],
    bgDeep: MERIDIAN_PALETTES.midnight.bg[0],
  },
  night: {
    textPrimary: MERIDIAN_PALETTES.night.textPrimary,
    textSecondary: MERIDIAN_PALETTES.night.textSecondary,
    accent: MERIDIAN_PALETTES.night.accentColor,
    surface: MERIDIAN_PALETTES.night.surface,
    bgBase: MERIDIAN_PALETTES.night.bg[1],
    bgDeep: MERIDIAN_PALETTES.night.bg[0],
  },
  dawn: {
    textPrimary: MERIDIAN_PALETTES.dawn.textPrimary,
    textSecondary: MERIDIAN_PALETTES.dawn.textSecondary,
    accent: MERIDIAN_PALETTES.dawn.accentColor,
    surface: MERIDIAN_PALETTES.dawn.surface,
    bgBase: MERIDIAN_PALETTES.dawn.bg[1],
    bgDeep: MERIDIAN_PALETTES.dawn.bg[0],
  },
  sunrise: {
    textPrimary: MERIDIAN_PALETTES.sunrise.textPrimary,
    textSecondary: MERIDIAN_PALETTES.sunrise.textSecondary,
    accent: MERIDIAN_PALETTES.sunrise.accentColor,
    surface: MERIDIAN_PALETTES.sunrise.surface,
    bgBase: MERIDIAN_PALETTES.sunrise.bg[1],
    bgDeep: MERIDIAN_PALETTES.sunrise.bg[0],
  },
  morning: {
    textPrimary: MERIDIAN_PALETTES.morning.textPrimary,
    textSecondary: MERIDIAN_PALETTES.morning.textSecondary,
    accent: MERIDIAN_PALETTES.morning.accentColor,
    surface: MERIDIAN_PALETTES.morning.surface,
    bgBase: MERIDIAN_PALETTES.morning.bg[1],
    bgDeep: MERIDIAN_PALETTES.morning.bg[0],
  },
  'solar-noon': {
    textPrimary: MERIDIAN_PALETTES['solar-noon'].textPrimary,
    textSecondary: MERIDIAN_PALETTES['solar-noon'].textSecondary,
    accent: MERIDIAN_PALETTES['solar-noon'].accentColor,
    surface: MERIDIAN_PALETTES['solar-noon'].surface,
    bgBase: MERIDIAN_PALETTES['solar-noon'].bg[1],
    bgDeep: MERIDIAN_PALETTES['solar-noon'].bg[0],
  },
  afternoon: {
    textPrimary: MERIDIAN_PALETTES.afternoon.textPrimary,
    textSecondary: MERIDIAN_PALETTES.afternoon.textSecondary,
    accent: MERIDIAN_PALETTES.afternoon.accentColor,
    surface: MERIDIAN_PALETTES.afternoon.surface,
    bgBase: MERIDIAN_PALETTES.afternoon.bg[1],
    bgDeep: MERIDIAN_PALETTES.afternoon.bg[0],
  },
  sunset: {
    textPrimary: MERIDIAN_PALETTES.sunset.textPrimary,
    textSecondary: MERIDIAN_PALETTES.sunset.textSecondary,
    accent: MERIDIAN_PALETTES.sunset.accentColor,
    surface: MERIDIAN_PALETTES.sunset.surface,
    bgBase: MERIDIAN_PALETTES.sunset.bg[1],
    bgDeep: MERIDIAN_PALETTES.sunset.bg[0],
  },
  dusk: {
    textPrimary: MERIDIAN_PALETTES.dusk.textPrimary,
    textSecondary: MERIDIAN_PALETTES.dusk.textSecondary,
    accent: MERIDIAN_PALETTES.dusk.accentColor,
    surface: MERIDIAN_PALETTES.dusk.surface,
    bgBase: MERIDIAN_PALETTES.dusk.bg[1],
    bgDeep: MERIDIAN_PALETTES.dusk.bg[0],
  },
};

const WIDGET_PALETTES: Record<SolarPhase, WidgetPalette> = Object.fromEntries(
  (Object.keys(MERIDIAN_PALETTES) as SolarPhase[]).map((phase) => [
    phase,
    {
      bg: MERIDIAN_PALETTES[phase].bg,
      textColor: MERIDIAN_PALETTES[phase].textPrimary,
      accentColor: MERIDIAN_PALETTES[phase].accentColor,
      orb: MERIDIAN_PALETTES[phase].orbFill,
      outerGlow: MERIDIAN_PALETTES[phase].orbRing,
      mode: MERIDIAN_PALETTES[phase].mode,
    } satisfies WidgetPalette,
  ]),
) as Record<SolarPhase, WidgetPalette>;

// Meridian shader: very restrained — light warm/cool washes, never dramatic.
const SHADER_PALETTES: Record<SolarPhase, ShaderPalette> = {
  midnight: {
    colors: ['#111318', '#141720', '#181C26', '#1C2030'],
    colorBack: '#0E1016',
    opacity: 0.7,
    vignette: '#0A0C12',
    cssFallback:
      'radial-gradient(ellipse 120% 80% at 45% 50%, #131620 0%, #181C28 55%, transparent 85%)',
  },
  night: {
    colors: ['#111520', '#141826', '#18202E', '#1C2438'],
    colorBack: '#0E1218',
    opacity: 0.68,
    vignette: '#0A0E14',
    cssFallback:
      'radial-gradient(ellipse 120% 80% at 45% 50%, #131828 0%, #18202E 55%, transparent 85%)',
  },
  dawn: {
    colors: ['#F0EAE0', '#F5EFE6', '#FAF5EE', '#FDF9F4'],
    colorBack: '#EDE4D8',
    opacity: 0.3,
    vignette: '#E8DDD0',
    cssFallback:
      'radial-gradient(ellipse 120% 80% at 35% 60%, #EDE0CC 0%, #F5EDE0 50%, transparent 85%)',
  },
  sunrise: {
    colors: ['#F2EAD8', '#F8F0E0', '#FDF8F0', '#FFFCF8'],
    colorBack: '#EFE4CC',
    opacity: 0.28,
    vignette: '#EAE0C8',
    cssFallback:
      'radial-gradient(ellipse 120% 80% at 32% 60%, #EEE0C4 0%, #F8F0E0 50%, transparent 85%)',
  },
  morning: {
    colors: ['#F5F5F0', '#F9F9F5', '#FDFDFB', '#FFFFFF'],
    colorBack: '#F2F2EC',
    opacity: 0.25,
    vignette: '#EEEEE8',
    cssFallback:
      'radial-gradient(ellipse 120% 80% at 40% 55%, #EEEEE8 0%, #F9F9F5 55%, transparent 88%)',
  },
  'solar-noon': {
    colors: ['#F4F6FA', '#F8FAFD', '#FCFDFF', '#FFFFFF'],
    colorBack: '#F0F4F8',
    opacity: 0.22,
    vignette: '#EBF0F6',
    cssFallback:
      'radial-gradient(ellipse 120% 80% at 50% 50%, #EEF3F9 0%, #F8FAFD 55%, transparent 88%)',
  },
  afternoon: {
    colors: ['#F5F2EC', '#F9F6F0', '#FDFAF6', '#FFFDF9'],
    colorBack: '#F2EDEA',
    opacity: 0.26,
    vignette: '#EEEAE4',
    cssFallback:
      'radial-gradient(ellipse 120% 80% at 55% 55%, #EEEBE2 0%, #F9F6F0 55%, transparent 88%)',
  },
  sunset: {
    colors: ['#EDE0D4', '#F2E8DC', '#F8F0E8', '#FDF6F0'],
    colorBack: '#E8D8C8',
    opacity: 0.32,
    vignette: '#E0D0C0',
    cssFallback:
      'radial-gradient(ellipse 120% 80% at 48% 60%, #E8D4C0 0%, #F2E8DC 50%, transparent 85%)',
  },
  dusk: {
    colors: ['#1A1C28', '#1E2030', '#222538', '#282C44'],
    colorBack: '#161820',
    opacity: 0.65,
    vignette: '#121420',
    cssFallback:
      'radial-gradient(ellipse 120% 80% at 42% 52%, #181A28 0%, #1E2030 55%, transparent 85%)',
  },
};

export const meridianSkin: SkinDefinition = {
  id: 'meridian',
  label: 'Meridian',
  description: 'Clean & airy. Solar intelligence, minimal presence.',
  phaseVars: PHASE_VARS,
  widgetPalettes: WIDGET_PALETTES,
  shaderPalettes: SHADER_PALETTES,
  Component: MeridianWidget,
  CompactComponent: MeridianCompact,
  // Meridian is the anti-Foundry — restrained, barely-there surface tints.
  // Shader opacities are already very low (0.22–0.30 at day phases). Rays at
  // 0.10 are present but subordinate, like light through frosted glass.
  defaultImage: {
    src: '/images/solar-rays.png',
    opacity: 0.1,
  },
};
