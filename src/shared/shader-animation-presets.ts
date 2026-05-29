/**
 * shader-animation-presets.ts
 *
 * Named animation personalities, decoupled from skin color palettes.
 * Any skin can use any preset — colors come from the skin, movement
 * comes from here.
 *
 * Reuses the per-skin MotionProfiles as preset definitions since those
 * were always the creative source of truth for motion anyway.
 */

import type { SolarPhase } from '../hooks/useSolarPosition';
import type { ShaderMotion } from '../skins/types/widget-skin.types';
import {
  AURORA_MOTION,
  FOUNDRY_MOTION,
  MERIDIAN_MOTION,
  MINERAL_MOTION,
  PAPER_MOTION,
  PARCHMENT_MOTION,
  SIGNAL_MOTION,
  SUNDIAL_MOTION,
  TIDE_MOTION,
  VOID_MOTION,
} from './shader-motion-profiles';

// ─── Type ─────────────────────────────────────────────────────────────────────

export type MotionProfile = Record<SolarPhase, ShaderMotion>;

export type ShaderAnimationPreset =
  | 'aurora' //   dramatic at night, calm at day — light show
  | 'tide' //     rolling waves, high distortion, clear
  | 'foundry' //  full solar energy arc — reference
  | 'mineral' //  crystalline, low distortion, high swirl
  | 'paper' //    gentle organic breath, medium everything
  | 'meridian' // airy drift, half the universal values
  | 'sundial' //  ancient, measured — gnomon-like
  | 'signal' //   mechanical, heavy grain, no organic drift
  | 'void' //     barely alive, near-zero
  | 'still' //    parchment — completely frozen
  | 'custom'; //  caller supplies their own MotionProfile

// ─── Preset map ───────────────────────────────────────────────────────────────

export const ANIMATION_PRESETS: Record<Exclude<ShaderAnimationPreset, 'custom'>, MotionProfile> = {
  aurora: AURORA_MOTION,
  tide: TIDE_MOTION,
  foundry: FOUNDRY_MOTION,
  mineral: MINERAL_MOTION,
  paper: PAPER_MOTION,
  meridian: MERIDIAN_MOTION,
  sundial: SUNDIAL_MOTION,
  signal: SIGNAL_MOTION,
  void: VOID_MOTION,
  still: PARCHMENT_MOTION,
};

// ─── Human-readable labels (for UI pickers) ───────────────────────────────────

export const ANIMATION_PRESET_META: Record<
  ShaderAnimationPreset,
  { label: string; description: string }
> = {
  aurora: { label: 'Aurora', description: 'Dramatic at night, calm at noon — light show energy' },
  tide: { label: 'Tide', description: 'Rolling waves, continuous high distortion' },
  foundry: { label: 'Pulse', description: 'Full solar arc — calm at night, alive at noon' },
  mineral: { label: 'Mineral', description: 'Crystalline facets, internal light scattering' },
  paper: { label: 'Breathe', description: 'Gentle organic rhythm, never dramatic' },
  meridian: { label: 'Drift', description: 'Airy and clean, constant gentle movement' },
  sundial: { label: 'Sundial', description: 'Ancient, measured — like a gnomon shadow' },
  signal: { label: 'Static', description: 'Mechanical grain, no organic flow' },
  void: { label: 'Barely', description: 'Almost nothing moves — presence without motion' },
  still: { label: 'Still', description: 'Completely frozen — color transitions only' },
  custom: { label: 'Custom', description: 'User-defined motion profile' },
};

// ─── Resolver ─────────────────────────────────────────────────────────────────

export function resolveAnimationPreset(
  preset: ShaderAnimationPreset,
  customProfile?: MotionProfile,
): MotionProfile {
  if (preset === 'custom') {
    return customProfile ?? ANIMATION_PRESETS.foundry;
  }
  return ANIMATION_PRESETS[preset];
}
