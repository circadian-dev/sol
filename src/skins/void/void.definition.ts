// FILE: skins/void/void.definition.ts
// ════════════════════════════════════════════════════════════════════════════

import type { SolarPhase } from '../../hooks/useSolarPosition';
import type {
  PhaseVars,
  ShaderPalette,
  SkinDefinition,
  WidgetPalette,
} from '../types/widget-skin.types';
import { VoidCompact } from './void.compact';
import { VOID_WIDGET_PALETTES, VoidWidget } from './void.component';

// ─── Phase vars ────────────────────────────────────────────────────────────────

const VOID_PHASE_VARS: Record<SolarPhase, PhaseVars> = Object.fromEntries(
  (Object.keys(VOID_WIDGET_PALETTES) as SolarPhase[]).map((p) => [
    p,
    {
      textPrimary: VOID_WIDGET_PALETTES[p].textPrimary,
      textSecondary: VOID_WIDGET_PALETTES[p].textSecondary,
      accent: VOID_WIDGET_PALETTES[p].orbCore,
      surface: VOID_WIDGET_PALETTES[p].bg[1],
      bgBase: VOID_WIDGET_PALETTES[p].bg[1],
      bgDeep: VOID_WIDGET_PALETTES[p].bg[0],
    } satisfies PhaseVars,
  ]),
) as Record<SolarPhase, PhaseVars>;

// ─── Widget palettes ───────────────────────────────────────────────────────────

const VOID_WIDGET_PAL: Record<SolarPhase, WidgetPalette> = Object.fromEntries(
  (Object.keys(VOID_WIDGET_PALETTES) as SolarPhase[]).map((p) => [
    p,
    {
      bg: [
        VOID_WIDGET_PALETTES[p].bg[0],
        VOID_WIDGET_PALETTES[p].bg[1],
        VOID_WIDGET_PALETTES[p].bg[1],
      ],
      textColor: VOID_WIDGET_PALETTES[p].textPrimary,
      accentColor: VOID_WIDGET_PALETTES[p].orbCore,
      orb: VOID_WIDGET_PALETTES[p].orbCore,
      outerGlow: VOID_WIDGET_PALETTES[p].outerGlow,
      mode: VOID_WIDGET_PALETTES[p].mode,
    } satisfies WidgetPalette,
  ]),
) as Record<SolarPhase, WidgetPalette>;

// ─── Shader palettes ───────────────────────────────────────────────────────────
// Void: near-black everywhere, extremely subtle. Vignette is near-invisible.

const VOID_SHADER_PALETTES: Record<SolarPhase, ShaderPalette> = {
  midnight: {
    colors: ['#040404', '#060608', '#070709', '#080810'],
    colorBack: '#020202',
    opacity: 0.96,
    vignette: '#010101',
    cssFallback:
      'radial-gradient(ellipse 100% 70% at 50% 50%, #040404 0%, #060608 60%, transparent 90%)',
  },
  night: {
    colors: ['#040608', '#060A0E', '#07090F', '#080A10'],
    colorBack: '#020304',
    opacity: 0.94,
    vignette: '#010202',
    cssFallback:
      'radial-gradient(ellipse 100% 70% at 50% 50%, #040608 0%, #060A0E 60%, transparent 90%)',
  },
  dawn: {
    colors: ['#070604', '#090806', '#0A0907', '#0C0A08'],
    colorBack: '#030302',
    opacity: 0.94,
    vignette: '#020201',
    cssFallback:
      'radial-gradient(ellipse 100% 70% at 50% 50%, #070604 0%, #0A0806 60%, transparent 90%)',
  },
  sunrise: {
    colors: ['#090604', '#0B0806', '#0C0907', '#0E0B09'],
    colorBack: '#040302',
    opacity: 0.93,
    vignette: '#030202',
    cssFallback:
      'radial-gradient(ellipse 100% 70% at 50% 50%, #090604 0%, #0B0806 60%, transparent 90%)',
  },
  morning: {
    colors: ['#050808', '#070A0A', '#08090B', '#090A0C'],
    colorBack: '#030404',
    opacity: 0.92,
    vignette: '#020303',
    cssFallback:
      'radial-gradient(ellipse 100% 70% at 50% 50%, #050808 0%, #070A0A 60%, transparent 90%)',
  },
  'solar-noon': {
    colors: ['#080808', '#0A0A0A', '#0C0C0C', '#0E0E0E'],
    colorBack: '#040404',
    opacity: 0.9,
    vignette: '#030303',
    cssFallback:
      'radial-gradient(ellipse 100% 70% at 50% 50%, #080808 0%, #0C0C0C 60%, transparent 90%)',
  },
  afternoon: {
    colors: ['#090706', '#0B0908', '#0D0B09', '#0F0D0B'],
    colorBack: '#040302',
    opacity: 0.92,
    vignette: '#030202',
    cssFallback:
      'radial-gradient(ellipse 100% 70% at 50% 50%, #090706 0%, #0D0B09 60%, transparent 90%)',
  },
  sunset: {
    colors: ['#0A0504', '#0C0706', '#0D0807', '#0F0A08'],
    colorBack: '#050302',
    opacity: 0.93,
    vignette: '#030201',
    cssFallback:
      'radial-gradient(ellipse 100% 70% at 50% 50%, #0A0504 0%, #0D0807 60%, transparent 90%)',
  },
  dusk: {
    colors: ['#060408', '#08060C', '#0A080E', '#0C0A10'],
    colorBack: '#030204',
    opacity: 0.94,
    vignette: '#020103',
    cssFallback:
      'radial-gradient(ellipse 100% 70% at 50% 50%, #060408 0%, #0A080E 60%, transparent 90%)',
  },
};

// ─── Export ────────────────────────────────────────────────────────────────────

export const voidSkin: SkinDefinition = {
  id: 'void',
  label: 'Void',
  description: 'The anti-skin. Near-black. Only the orb has presence. Thunder is the only drama.',
  phaseVars: VOID_PHASE_VARS,
  widgetPalettes: VOID_WIDGET_PAL,
  shaderPalettes: VOID_SHADER_PALETTES,
  Component: VoidWidget,
  CompactComponent: VoidCompact,
  // Atmospheric image layer — the rays are masked by the phase accent color
  // so they shift from cold silver at night to deep ember at dusk/sunrise,
  // all against Void's near-black shader. Keep opacity low — Void is minimal.
  defaultImage: {
    src: '/images/solar-rays.png',
    opacity: 0.12,
  },
};
