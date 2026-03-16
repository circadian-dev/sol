/**
 * skins/mineral/mineral.definition.ts
 *
 * Mineral skin — gemstone-inspired. Nine phases, nine stones.
 * midnight=Obsidian, night=Lapis, dawn=Rose Quartz, sunrise=Carnelian,
 * morning=Citrine, solar-noon=Aquamarine, afternoon=Amber, sunset=Garnet, dusk=Amethyst
 */

import type { SolarPhase } from '../../hooks/useSolarPosition';
import type {
  PhaseVars,
  ShaderPalette,
  SkinDefinition,
  WidgetPalette,
} from '../types/widget-skin.types';
import { MineralCompact } from './mineral.compact';
import { MINERAL_PALETTES, MineralWidget } from './mineral.component';

const PHASE_VARS: Record<SolarPhase, PhaseVars> = {
  midnight: {
    textPrimary: MINERAL_PALETTES.midnight.textPrimary,
    textSecondary: MINERAL_PALETTES.midnight.textSecondary,
    accent: MINERAL_PALETTES.midnight.accentColor,
    surface: MINERAL_PALETTES.midnight.bg[1],
    bgBase: MINERAL_PALETTES.midnight.bg[1],
    bgDeep: MINERAL_PALETTES.midnight.bg[0],
  },
  night: {
    textPrimary: MINERAL_PALETTES.night.textPrimary,
    textSecondary: MINERAL_PALETTES.night.textSecondary,
    accent: MINERAL_PALETTES.night.accentColor,
    surface: MINERAL_PALETTES.night.bg[1],
    bgBase: MINERAL_PALETTES.night.bg[1],
    bgDeep: MINERAL_PALETTES.night.bg[0],
  },
  dawn: {
    textPrimary: MINERAL_PALETTES.dawn.textPrimary,
    textSecondary: MINERAL_PALETTES.dawn.textSecondary,
    accent: MINERAL_PALETTES.dawn.accentColor,
    surface: MINERAL_PALETTES.dawn.bg[1],
    bgBase: MINERAL_PALETTES.dawn.bg[1],
    bgDeep: MINERAL_PALETTES.dawn.bg[0],
  },
  sunrise: {
    textPrimary: MINERAL_PALETTES.sunrise.textPrimary,
    textSecondary: MINERAL_PALETTES.sunrise.textSecondary,
    accent: MINERAL_PALETTES.sunrise.accentColor,
    surface: MINERAL_PALETTES.sunrise.bg[1],
    bgBase: MINERAL_PALETTES.sunrise.bg[1],
    bgDeep: MINERAL_PALETTES.sunrise.bg[0],
  },
  morning: {
    textPrimary: MINERAL_PALETTES.morning.textPrimary,
    textSecondary: MINERAL_PALETTES.morning.textSecondary,
    accent: MINERAL_PALETTES.morning.accentColor,
    surface: MINERAL_PALETTES.morning.bg[1],
    bgBase: MINERAL_PALETTES.morning.bg[1],
    bgDeep: MINERAL_PALETTES.morning.bg[0],
  },
  'solar-noon': {
    textPrimary: MINERAL_PALETTES['solar-noon'].textPrimary,
    textSecondary: MINERAL_PALETTES['solar-noon'].textSecondary,
    accent: MINERAL_PALETTES['solar-noon'].accentColor,
    surface: MINERAL_PALETTES['solar-noon'].bg[1],
    bgBase: MINERAL_PALETTES['solar-noon'].bg[1],
    bgDeep: MINERAL_PALETTES['solar-noon'].bg[0],
  },
  afternoon: {
    textPrimary: MINERAL_PALETTES.afternoon.textPrimary,
    textSecondary: MINERAL_PALETTES.afternoon.textSecondary,
    accent: MINERAL_PALETTES.afternoon.accentColor,
    surface: MINERAL_PALETTES.afternoon.bg[1],
    bgBase: MINERAL_PALETTES.afternoon.bg[1],
    bgDeep: MINERAL_PALETTES.afternoon.bg[0],
  },
  sunset: {
    textPrimary: MINERAL_PALETTES.sunset.textPrimary,
    textSecondary: MINERAL_PALETTES.sunset.textSecondary,
    accent: MINERAL_PALETTES.sunset.accentColor,
    surface: MINERAL_PALETTES.sunset.bg[1],
    bgBase: MINERAL_PALETTES.sunset.bg[1],
    bgDeep: MINERAL_PALETTES.sunset.bg[0],
  },
  dusk: {
    textPrimary: MINERAL_PALETTES.dusk.textPrimary,
    textSecondary: MINERAL_PALETTES.dusk.textSecondary,
    accent: MINERAL_PALETTES.dusk.accentColor,
    surface: MINERAL_PALETTES.dusk.bg[1],
    bgBase: MINERAL_PALETTES.dusk.bg[1],
    bgDeep: MINERAL_PALETTES.dusk.bg[0],
  },
};

const WIDGET_PALETTES: Record<SolarPhase, WidgetPalette> = Object.fromEntries(
  (Object.keys(MINERAL_PALETTES) as SolarPhase[]).map((phase) => [
    phase,
    {
      bg: MINERAL_PALETTES[phase].bg,
      textColor: MINERAL_PALETTES[phase].textPrimary,
      accentColor: MINERAL_PALETTES[phase].accentColor,
      orb: MINERAL_PALETTES[phase].facetFill,
      outerGlow: MINERAL_PALETTES[phase].outerGlow,
      mode: MINERAL_PALETTES[phase].mode,
    } satisfies WidgetPalette,
  ]),
) as Record<SolarPhase, WidgetPalette>;

// Mineral shaders: each phase gets the full stone color as the hero wash.
const SHADER_PALETTES: Record<SolarPhase, ShaderPalette> = {
  midnight: {
    colors: ['#0A0A0E', '#0E0E14', '#14141C', '#1C1C28'],
    colorBack: '#080808',
    opacity: 0.88,
    vignette: '#06060A',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 45%, #0A0A0E 0%, #14141C 55%, transparent 85%)',
  },
  night: {
    colors: ['#0C1240', '#102050', '#163060', '#1C3870'],
    colorBack: '#08103A',
    opacity: 0.82,
    vignette: '#060E30',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 38% 48%, #0E1848 0%, #163060 55%, transparent 85%)',
  },
  dawn: {
    colors: ['#E0B8BC', '#EAC8CC', '#F0D4D8', '#F8E8EA'],
    colorBack: '#D8B0B4',
    opacity: 0.38,
    vignette: '#D0A8AC',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 35% 58%, #DCC0C4 0%, #EAC8CC 50%, transparent 82%)',
  },
  sunrise: {
    colors: ['#A83010', '#C84020', '#E05030', '#F06848'],
    colorBack: '#982A0A',
    opacity: 0.68,
    vignette: '#7A2008',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 32% 60%, #B43818 0%, #D04828 48%, transparent 82%)',
  },
  morning: {
    colors: ['#D4A010', '#E8B820', '#F8D040', '#FFE870'],
    colorBack: '#C89808',
    opacity: 0.52,
    vignette: '#B88800',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 35% 60%, #D8A808 0%, #EEC020 48%, transparent 82%)',
  },
  'solar-noon': {
    colors: ['#38988A', '#48B0A0', '#58C8B8', '#70D8C8'],
    colorBack: '#309080',
    opacity: 0.55,
    vignette: '#288878',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 50% 50%, #3CA090 0%, #50B8A8 52%, transparent 85%)',
  },
  afternoon: {
    colors: ['#B87010', '#D08820', '#E8A030', '#F8B840'],
    colorBack: '#A86808',
    opacity: 0.62,
    vignette: '#986000',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 55% 58%, #C07818 0%, #D89028 48%, transparent 82%)',
  },
  sunset: {
    colors: ['#580818', '#780C20', '#981428', '#B82030'],
    colorBack: '#480612',
    opacity: 0.78,
    vignette: '#380410',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 44% 58%, #600A1C 0%, #880E24 48%, transparent 82%)',
  },
  dusk: {
    colors: ['#280840', '#380C58', '#501070', '#681488'],
    colorBack: '#200638',
    opacity: 0.8,
    vignette: '#180430',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 42% 52%, #300A4A 0%, #440E68 48%, transparent 82%)',
  },
};

export const mineralSkin: SkinDefinition = {
  id: 'mineral',
  label: 'Mineral',
  description: 'Gemstone surfaces. Nine phases, nine stones.',
  phaseVars: PHASE_VARS,
  widgetPalettes: WIDGET_PALETTES,
  shaderPalettes: SHADER_PALETTES,
  Component: MineralWidget,
  CompactComponent: MineralCompact,
  // Gemstone accents are already highly saturated and dramatic. The rays at
  // 0.15 add structural depth (carnelian sunrise, amethyst dusk) without
  // fighting the stone color story.
  defaultImage: {
    src: '/images/solar-rays.png',
    opacity: 0.15,
  },
};
