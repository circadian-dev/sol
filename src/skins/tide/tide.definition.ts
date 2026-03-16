// FILE: skins/tide/tide.definition.ts
// ════════════════════════════════════════════════════════════════════════════

import type { SolarPhase } from '../../hooks/useSolarPosition';
import type {
  PhaseVars,
  ShaderPalette,
  SkinDefinition,
  WidgetPalette,
} from '../types/widget-skin.types';
import { TideCompact } from './tide.compact';
import { TIDE_WIDGET_PALETTES, TideWidget } from './tide.component';

const TIDE_PHASE_VARS: Record<SolarPhase, PhaseVars> = Object.fromEntries(
  (Object.keys(TIDE_WIDGET_PALETTES) as SolarPhase[]).map((p) => [
    p,
    {
      textPrimary: TIDE_WIDGET_PALETTES[p].textPrimary,
      textSecondary: TIDE_WIDGET_PALETTES[p].textSecondary,
      accent: TIDE_WIDGET_PALETTES[p].accentColor,
      surface: TIDE_WIDGET_PALETTES[p].bg[1],
      bgBase: TIDE_WIDGET_PALETTES[p].bg[1],
      bgDeep: TIDE_WIDGET_PALETTES[p].bg[0],
    } satisfies PhaseVars,
  ]),
) as Record<SolarPhase, PhaseVars>;

const TIDE_WIDGET_PAL: Record<SolarPhase, WidgetPalette> = Object.fromEntries(
  (Object.keys(TIDE_WIDGET_PALETTES) as SolarPhase[]).map((p) => [
    p,
    {
      bg: TIDE_WIDGET_PALETTES[p].bg,
      textColor: TIDE_WIDGET_PALETTES[p].textPrimary,
      accentColor: TIDE_WIDGET_PALETTES[p].accentColor,
      orb: TIDE_WIDGET_PALETTES[p].orbFill,
      outerGlow: TIDE_WIDGET_PALETTES[p].outerGlow,
      mode: TIDE_WIDGET_PALETTES[p].mode,
    } satisfies WidgetPalette,
  ]),
) as Record<SolarPhase, WidgetPalette>;

const TIDE_SHADER_PALETTES: Record<SolarPhase, ShaderPalette> = {
  midnight: {
    colors: ['#030A16', '#06112A', '#0A1A3C', '#0E2450'],
    colorBack: '#010408',
    opacity: 0.88,
    vignette: '#010408',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 45%, #04101E 0%, #081A30 55%, transparent 85%)',
  },
  night: {
    colors: ['#040C18', '#081624', '#0C1E34', '#101E3C'],
    colorBack: '#020608',
    opacity: 0.85,
    vignette: '#020608',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 38% 48%, #060E1A 0%, #0A1828 55%, transparent 85%)',
  },
  dawn: {
    colors: ['#1A2A3C', '#2A3C52', '#3A5068', '#485870'],
    colorBack: '#101820',
    opacity: 0.7,
    vignette: '#0E1620',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 35% 50%, #1A2A3A 0%, #2C3E52 48%, transparent 82%)',
  },
  sunrise: {
    colors: ['#C04030', '#D86048', '#EC8860', '#F8A878'],
    colorBack: '#7A1C10',
    opacity: 0.65,
    vignette: '#7A2010',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 32% 58%, #C04030 0%, #D86048 45%, transparent 82%)',
  },
  morning: {
    colors: ['#42A8B4', '#58BCCC', '#72CCD8', '#8EDCE8'],
    colorBack: '#1E7888',
    opacity: 0.4,
    vignette: '#1A6878',
    cssFallback:
      'radial-gradient(ellipse 120% 80% at 40% 55%, #3AA0B0 0%, #54B8C8 50%, transparent 88%)',
  },
  'solar-noon': {
    colors: ['#D4EDE8', '#E4F5F0', '#F0FAF8', '#FAFFFE'],
    colorBack: '#88C8C0',
    opacity: 0.22,
    vignette: '#80C0B8',
    cssFallback:
      'radial-gradient(ellipse 120% 80% at 50% 48%, #D0EAE4 0%, #E4F4EE 55%, transparent 88%)',
  },
  afternoon: {
    colors: ['#B8C838', '#CCDC58', '#E0EC78', '#EEFF90'],
    colorBack: '#607010',
    opacity: 0.3,
    vignette: '#607010',
    cssFallback:
      'radial-gradient(ellipse 120% 80% at 55% 55%, #B0C230 0%, #CCDC58 50%, transparent 88%)',
  },
  sunset: {
    colors: ['#A02008', '#BC3020', '#D85038', '#E86850'],
    colorBack: '#580808',
    opacity: 0.65,
    vignette: '#600A0A',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 44% 58%, #A02010 0%, #C03028 45%, transparent 82%)',
  },
  dusk: {
    colors: ['#141828', '#1C2238', '#243048', '#2C3858'],
    colorBack: '#08090E',
    opacity: 0.82,
    vignette: '#060810',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 42% 50%, #141828 0%, #1C2238 50%, transparent 85%)',
  },
};

export const tideSkin: SkinDefinition = {
  id: 'tide',
  label: 'Tide',
  description: 'Coastal instrument. Sine wave. Bioluminescent at night.',
  phaseVars: TIDE_PHASE_VARS,
  widgetPalettes: TIDE_WIDGET_PAL,
  shaderPalettes: TIDE_SHADER_PALETTES,
  Component: TideWidget,
  CompactComponent: TideCompact,
  // Tide has the most saturated accent colors of all skins (crimson sunrise,
  // aqua morning, bioluminescent night). Rays at 0.16 add atmosphere without
  // competing with the strong phase shifts.
  defaultImage: {
    src: '/images/solar-rays.png',
    opacity: 0.16,
  },
};
