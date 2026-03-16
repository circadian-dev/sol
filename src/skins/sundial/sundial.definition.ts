// FILE: skins/sundial/sundial.definition.ts
// ════════════════════════════════════════════════════════════════════════════

import type { SolarPhase } from '../../hooks/useSolarPosition';
import type {
  PhaseVars,
  ShaderPalette,
  SkinDefinition,
  WidgetPalette,
} from '../types/widget-skin.types';
import { SundialCompact } from './sundial.compact';
import { SUNDIAL_WIDGET_PALETTES, SundialWidget } from './sundial.component';

// ─── Phase vars ────────────────────────────────────────────────────────────────

const SUNDIAL_PHASE_VARS: Record<SolarPhase, PhaseVars> = Object.fromEntries(
  (Object.keys(SUNDIAL_WIDGET_PALETTES) as SolarPhase[]).map((p) => [
    p,
    {
      textPrimary: SUNDIAL_WIDGET_PALETTES[p].textPrimary,
      textSecondary: SUNDIAL_WIDGET_PALETTES[p].textSecondary,
      accent: SUNDIAL_WIDGET_PALETTES[p].orbFill,
      surface: SUNDIAL_WIDGET_PALETTES[p].bg[1],
      bgBase: SUNDIAL_WIDGET_PALETTES[p].bg[1],
      bgDeep: SUNDIAL_WIDGET_PALETTES[p].bg[0],
    } satisfies PhaseVars,
  ]),
) as Record<SolarPhase, PhaseVars>;

// ─── Widget palettes ───────────────────────────────────────────────────────────

const SUNDIAL_WIDGET_PAL: Record<SolarPhase, WidgetPalette> = Object.fromEntries(
  (Object.keys(SUNDIAL_WIDGET_PALETTES) as SolarPhase[]).map((p) => [
    p,
    {
      bg: SUNDIAL_WIDGET_PALETTES[p].bg,
      textColor: SUNDIAL_WIDGET_PALETTES[p].textPrimary,
      accentColor: SUNDIAL_WIDGET_PALETTES[p].orbFill,
      orb: SUNDIAL_WIDGET_PALETTES[p].orbFill,
      outerGlow: SUNDIAL_WIDGET_PALETTES[p].outerGlow,
      mode: SUNDIAL_WIDGET_PALETTES[p].mode,
    } satisfies WidgetPalette,
  ]),
) as Record<SolarPhase, WidgetPalette>;

// ─── Shader palettes ───────────────────────────────────────────────────────────
// Sundial: warm stone tones at day phases, cold moonstone at night.
// Heavy, diffuse ambient glow — like light bouncing off travertine.

const SUNDIAL_SHADER_PALETTES: Record<SolarPhase, ShaderPalette> = {
  midnight: {
    colors: ['#0E1018', '#141620', '#1A1C28', '#20222E'],
    colorBack: '#080A10',
    opacity: 0.88,
    vignette: '#060810',
    cssFallback:
      'radial-gradient(ellipse 120% 75% at 38% 45%, #0E1018 0%, #141620 50%, transparent 85%)',
  },
  night: {
    colors: ['#10141C', '#161C26', '#1E2430', '#242C3A'],
    colorBack: '#0A0E16',
    opacity: 0.85,
    vignette: '#080C14',
    cssFallback:
      'radial-gradient(ellipse 120% 75% at 36% 48%, #10141C 0%, #181E2C 50%, transparent 85%)',
  },
  dawn: {
    colors: ['#D8C0A0', '#E8D0B0', '#F0DCC0', '#F8E8D0'],
    colorBack: '#C0A888',
    opacity: 0.55,
    vignette: '#B89870',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 32% 52%, #D0B890 0%, #E4CCA8 50%, transparent 85%)',
  },
  sunrise: {
    colors: ['#E0C890', '#EED8A8', '#F8E8C0', '#FEF0D0'],
    colorBack: '#C8B070',
    opacity: 0.5,
    vignette: '#C0A860',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 30% 55%, #D8C080 0%, #EAD498 50%, transparent 85%)',
  },
  morning: {
    colors: ['#F0E8D0', '#F8F0E0', '#FFFDF4', '#FEFEF8'],
    colorBack: '#E0D0B0',
    opacity: 0.3,
    vignette: '#D8C8A0',
    cssFallback:
      'radial-gradient(ellipse 120% 75% at 40% 50%, #EAE0C4 0%, #F6ECD8 55%, transparent 88%)',
  },
  'solar-noon': {
    colors: ['#F8F4E8', '#FEFAEE', '#FFFEF8', '#FFFFFB'],
    colorBack: '#EEE8D0',
    opacity: 0.2,
    vignette: '#E8E0C8',
    cssFallback:
      'radial-gradient(ellipse 120% 75% at 50% 45%, #F4EED8 0%, #FDFAEC 58%, transparent 90%)',
  },
  afternoon: {
    colors: ['#EEE0C8', '#F8ECDA', '#FEF5E8', '#FFFAEA'],
    colorBack: '#E0CEB0',
    opacity: 0.28,
    vignette: '#D8C4A0',
    cssFallback:
      'radial-gradient(ellipse 120% 75% at 55% 52%, #E8D8BE 0%, #F4E8CC 55%, transparent 88%)',
  },
  sunset: {
    colors: ['#C89070', '#D8A888', '#E8C0A0', '#F0CEAE'],
    colorBack: '#B07858',
    opacity: 0.52,
    vignette: '#A06848',
    cssFallback:
      'radial-gradient(ellipse 130% 80% at 44% 56%, #C08868 0%, #D4A080 50%, transparent 85%)',
  },
  dusk: {
    colors: ['#201828', '#2A2038', '#343050', '#3C3860'],
    colorBack: '#141020',
    opacity: 0.8,
    vignette: '#100C1C',
    cssFallback:
      'radial-gradient(ellipse 120% 75% at 42% 50%, #201828 0%, #2C2238 50%, transparent 85%)',
  },
};

// ─── Export ────────────────────────────────────────────────────────────────────

export const sundialSkin: SkinDefinition = {
  id: 'sundial',
  label: 'Sundial',
  description:
    'Roman/classical instrument. Stone and marble. Carved arc. Gnomon shadow. Latin labels.',
  phaseVars: SUNDIAL_PHASE_VARS,
  widgetPalettes: SUNDIAL_WIDGET_PAL,
  shaderPalettes: SUNDIAL_SHADER_PALETTES,
  Component: SundialWidget,
  CompactComponent: SundialCompact,
  // Warm travertine and moonstone tones. The rays echo the gnomon casting
  // its shadow — thematically appropriate. Gentle at 0.15 because Sundial
  // is slow and ancient, not dramatic.
  defaultImage: {
    src: '/images/solar-rays.png',
    opacity: 0.15,
  },
};
