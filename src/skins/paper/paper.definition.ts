/**
 * skins/paper/paper.definition.ts
 *
 * Paper skin — uncoated stock aesthetic.
 * Cream pages in daylight, deep ink at night.
 * Soft emboss instead of chrome. Editorial texture.
 *
 * Design intent:
 *   - Surfaces feel like uncoated paper stock (slightly warm whites, never pure)
 *   - Night phases feel like dark ink on parchment, not black glass
 *   - Grain is coarser, more organic than Foundry's sandblast
 *   - Typography-forward: Redaction italic for time, looser tracking
 *   - No chrome rims — instead thin inset rules, like a printed border
 *   - Orb is a soft ink blot, not a metal sphere
 */

import type { SolarPhase } from '../../hooks/useSolarPosition';
import type {
  PhaseVars,
  ShaderPalette,
  SkinDefinition,
  WidgetPalette,
} from '../types/widget-skin.types';
import { PaperCompact } from './paper.compact';
import { PaperWidget } from './paper.component';

const PHASE_VARS: Record<SolarPhase, PhaseVars> = {
  midnight: {
    textPrimary: '#D8C8A8',
    textSecondary: '#8A7A60',
    accent: '#A08060',
    surface: '#100E08',
    bgBase: '#0A0804',
    bgDeep: '#060502',
  },
  night: {
    textPrimary: '#E0D0B0',
    textSecondary: '#9A8A6A',
    accent: '#B09070',
    surface: '#181408',
    bgBase: '#100C06',
    bgDeep: '#0A0804',
  },
  dawn: {
    textPrimary: '#6A4830',
    textSecondary: '#9A7050',
    accent: '#C89060',
    surface: '#F5E8D0',
    bgBase: '#F0DEC0',
    bgDeep: '#E8D0A8',
  },
  sunrise: {
    textPrimary: '#5A3820',
    textSecondary: '#8A6040',
    accent: '#D08040',
    surface: '#FAF0D8',
    bgBase: '#F5E8C8',
    bgDeep: '#EDD8A8',
  },
  morning: {
    textPrimary: '#3A2A10',
    textSecondary: '#705A30',
    accent: '#9A6820',
    surface: '#FDFAF0',
    bgBase: '#FAF6E8',
    bgDeep: '#F5F0D8',
  },
  'solar-noon': {
    textPrimary: '#1A1A0A',
    textSecondary: '#505030',
    accent: '#707040',
    surface: '#FDFDF5',
    bgBase: '#FAFAF0',
    bgDeep: '#F5F5E5',
  },
  afternoon: {
    textPrimary: '#302010',
    textSecondary: '#605030',
    accent: '#906030',
    surface: '#FBF5E0',
    bgBase: '#F8F0D0',
    bgDeep: '#F2E8C0',
  },
  sunset: {
    textPrimary: '#5A3020',
    textSecondary: '#8A5840',
    accent: '#C07048',
    surface: '#F5E0C8',
    bgBase: '#EED0B0',
    bgDeep: '#E4C098',
  },
  dusk: {
    textPrimary: '#4A3828',
    textSecondary: '#7A6048',
    accent: '#A07850',
    surface: '#E8D8B8',
    bgBase: '#D8C8A0',
    bgDeep: '#C8B888',
  },
};

const WIDGET_PALETTES: Record<SolarPhase, WidgetPalette> = {
  midnight: {
    bg: ['#060502', '#0A0804', '#100C06'],
    textColor: '#C8B890',
    accentColor: '#907860',
    orb: '#504030',
    outerGlow: 'rgba(80,64,48,0.20)',
    mode: 'dark',
  },
  night: {
    bg: ['#0A0804', '#100C06', '#180E08'],
    textColor: '#D8C8A0',
    accentColor: '#A08060',
    orb: '#685040',
    outerGlow: 'rgba(104,80,64,0.25)',
    mode: 'dark',
  },
  dawn: {
    bg: ['#E8D0A8', '#F0DEC0', '#F8EAD0'],
    textColor: '#5A3820',
    accentColor: '#C08050',
    orb: '#D09060',
    outerGlow: 'rgba(208,144,96,0.30)',
    mode: 'dim',
  },
  sunrise: {
    bg: ['#EDD8A8', '#F5E8C8', '#FBF2DC'],
    textColor: '#4A3010',
    accentColor: '#C07830',
    orb: '#D08840',
    outerGlow: 'rgba(208,136,64,0.30)',
    mode: 'dim',
  },
  morning: {
    bg: ['#F5F0D8', '#FAF6E8', '#FEFCF4'],
    textColor: '#2A1E08',
    accentColor: '#907030',
    orb: '#B08840',
    outerGlow: 'rgba(176,136,64,0.28)',
    mode: 'light',
  },
  'solar-noon': {
    bg: ['#F5F5E5', '#FAFAF0', '#FEFEFC'],
    textColor: '#141408',
    accentColor: '#686840',
    orb: '#808050',
    outerGlow: 'rgba(128,128,80,0.25)',
    mode: 'light',
  },
  afternoon: {
    bg: ['#F2E8C0', '#F8F0D0', '#FCF6E4'],
    textColor: '#281808',
    accentColor: '#885820',
    orb: '#A07030',
    outerGlow: 'rgba(160,112,48,0.28)',
    mode: 'light',
  },
  sunset: {
    bg: ['#E4C098', '#EED0B0', '#F5DEC4'],
    textColor: '#482818',
    accentColor: '#B06840',
    orb: '#C07850',
    outerGlow: 'rgba(192,120,80,0.30)',
    mode: 'dim',
  },
  dusk: {
    bg: ['#C8B888', '#D8C8A0', '#E4D4B0'],
    textColor: '#382818',
    accentColor: '#907050',
    orb: '#A08060',
    outerGlow: 'rgba(160,128,96,0.28)',
    mode: 'dark',
  },
};

const SHADER_PALETTES: Record<SolarPhase, ShaderPalette> = {
  midnight: {
    colors: ['#060502', '#0D0A04', '#1A1408', '#2A2010'],
    colorBack: '#040300',
    opacity: 0.88,
    vignette: '#030200',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 45%, #0A0806 0%, #1A1408 50%, transparent 85%)',
  },
  night: {
    colors: ['#0A0804', '#141008', '#201808', '#301E0C'],
    colorBack: '#080602',
    opacity: 0.82,
    vignette: '#060402',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 45%, #0E0C06 0%, #1E1608 50%, transparent 85%)',
  },
  dawn: {
    colors: ['#E0C890', '#EDD8A8', '#F5E8C0', '#FAECD8'],
    colorBack: '#D8C080',
    opacity: 0.4,
    vignette: '#D0B878',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 35% 65%, #D8B870 0%, #EDD8A8 45%, transparent 82%)',
  },
  sunrise: {
    colors: ['#E8D098', '#F0DEB0', '#F8ECC8', '#FEF4E0'],
    colorBack: '#E0C888',
    opacity: 0.38,
    vignette: '#D8C080',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 30% 65%, #E0C880 0%, #F0DEB0 45%, transparent 82%)',
  },
  morning: {
    colors: ['#F0E8C8', '#F8F2DC', '#FEFBF0', '#FFFDF8'],
    colorBack: '#FAF6E8',
    opacity: 0.32,
    vignette: '#F5F0E0',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 30% 65%, #EDE0B8 0%, #F8F2DC 45%, transparent 82%)',
  },
  'solar-noon': {
    colors: ['#F0F0D8', '#F8F8E8', '#FEFEFC', '#FFFFFF'],
    colorBack: '#FAFAF2',
    opacity: 0.28,
    vignette: '#F5F5E8',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 50% 50%, #EEEEDD 0%, #F8F8EC 50%, transparent 85%)',
  },
  afternoon: {
    colors: ['#EEE0B0', '#F5ECC8', '#FAF4DC', '#FEFBF0'],
    colorBack: '#F8F0D8',
    opacity: 0.35,
    vignette: '#F0E8C8',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 60% 60%, #E8D898 0%, #F5ECC8 45%, transparent 82%)',
  },
  sunset: {
    colors: ['#D8A878', '#E8C090', '#F0D0A8', '#F8E0C0'],
    colorBack: '#D0A070',
    opacity: 0.42,
    vignette: '#C89868',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 45% 65%, #C89060 0%, #E8C090 45%, transparent 82%)',
  },
  dusk: {
    colors: ['#B8A070', '#C8B080', '#D8C090', '#E4CCA0'],
    colorBack: '#B09868',
    opacity: 0.48,
    vignette: '#A89060',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 40% 55%, #A88858 0%, #C8B080 45%, transparent 82%)',
  },
};

export const paperSkin: SkinDefinition = {
  id: 'paper',
  label: 'Paper',
  description: 'Uncoated stock. Ink and warmth.',
  phaseVars: PHASE_VARS,
  widgetPalettes: WIDGET_PALETTES,
  shaderPalettes: SHADER_PALETTES,
  Component: PaperWidget,
  CompactComponent: PaperCompact,
  // Paper's warm cream-to-ink palette is the most naturally atmospheric skin.
  // The rays feel editorial here — like crepuscular light through a studio
  // skylight. Slightly warmer than Foundry's 0.18 because day phases are
  // very bright and the mask color is warm amber/gold.
  defaultImage: {
    src: '/images/solar-rays.png',
    opacity: 0.17,
  },
};
