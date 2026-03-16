/**
 * shader-motion-profiles.ts
 *
 * Per-skin motion personalities for SolarShaderBg.
 *
 * This is the creative core of the background shader system. Colors come from
 * each skin's shaderPalettes — motion comes from here. Together they define
 * a complete atmospheric identity per skin per phase.
 *
 * Motion axes:
 *   distortion   — organic mesh noise. High = liquid, flowing. Low = crystalline, still.
 *   swirl        — vortex pull. High = spiral drama. Low = gentle drift.
 *   speed        — animation rate. 0 = frozen. 1 = reference. >1 = fast.
 *   grainOverlay — film grain. High in dark/still skins, low in bright/active ones.
 *
 * ─── Design intent per skin ───────────────────────────────────────────────────
 *
 *   VOID        The anti-skin. Barely alive. Night = almost nothing moves.
 *               Noon nudges up slightly — but "slightly" for Void is still near-zero.
 *               Grain is highest at midnight because darkness has texture.
 *
 *   PARCHMENT   A document. Documents don't move. speed=0 everywhere.
 *               The only "motion" is the CSS transition on color as the phase shifts.
 *
 *   SIGNAL      Brutalist terminal. No organic drift — that would feel wrong.
 *               Instead: very low distortion, almost-zero swirl, high grain.
 *               The background is raw, not smooth.
 *
 *   MERIDIAN    Airy and clean. Moves gently but constantly — like a well-ventilated
 *               room. Half the universal values throughout.
 *
 *   SUNDIAL     Ancient, measured. The dial shadow moves once per hour.
 *               Low speed, low swirl. Grain is stone-textured.
 *
 *   PAPER       Uncoated stock breathes. Organic, unhurried. Medium everything —
 *               never dramatic, never static.
 *
 *   FOUNDRY     The reference skin. Uses the universal phase-energy curve:
 *               low at night, high at noon, dramatic at sunrise/sunset.
 *               Closest to the default PHASE_MOTION values.
 *
 *   MINERAL     Gemstones don't flow — they refract. Low distortion (facets, not
 *               liquid), moderate swirl (internal light scattering), medium speed.
 *               Grain is low — stones are smooth.
 *
 *   TIDE        The sea rolls. High distortion at all phases (waves never stop),
 *               moderate swirl, speed follows tidal rhythm. Low grain — water is clear.
 *
 *   AURORA      The most variable. At midnight/night: maximum everything —
 *               the lights are dancing. During day: gentle and warm, the aurora
 *               is invisible. At dusk/sunset: the bands return.
 */

import type { SolarPhase } from '../hooks/useSolarPosition';
import type { DesignMode, ShaderMotion } from '../skins/types/widget-skin.types';

// ─── Type ─────────────────────────────────────────────────────────────────────

export type MotionProfile = Record<SolarPhase, ShaderMotion>;

// ─── Universal fallback — used when a skin has no shaderMotion ────────────────
// The energy arc of the sun: slow at night, rising through dawn,
// peaking near noon/sunset, unwinding through dusk.

export const UNIVERSAL_PHASE_MOTION: MotionProfile = {
  midnight: { distortion: 0.2, swirl: 0.04, speed: 0.1, grainOverlay: 0.18 },
  night: { distortion: 0.28, swirl: 0.06, speed: 0.15, grainOverlay: 0.15 },
  dawn: { distortion: 0.52, swirl: 0.14, speed: 0.26, grainOverlay: 0.1 },
  sunrise: { distortion: 0.68, swirl: 0.22, speed: 0.38, grainOverlay: 0.07 },
  morning: { distortion: 0.54, swirl: 0.13, speed: 0.5, grainOverlay: 0.05 },
  'solar-noon': { distortion: 0.36, swirl: 0.07, speed: 0.64, grainOverlay: 0.04 },
  afternoon: { distortion: 0.44, swirl: 0.1, speed: 0.5, grainOverlay: 0.05 },
  sunset: { distortion: 0.72, swirl: 0.3, speed: 0.34, grainOverlay: 0.08 },
  dusk: { distortion: 0.44, swirl: 0.18, speed: 0.2, grainOverlay: 0.14 },
};

// ─── Per-skin motion profiles ─────────────────────────────────────────────────

// VOID — barely alive. The orb is the only presence; the background should
// not compete. Maximum grain at midnight because pure black has texture.
const VOID_MOTION: MotionProfile = {
  midnight: { distortion: 0.08, swirl: 0.01, speed: 0.04, grainOverlay: 0.28 },
  night: { distortion: 0.1, swirl: 0.02, speed: 0.05, grainOverlay: 0.22 },
  dawn: { distortion: 0.14, swirl: 0.03, speed: 0.07, grainOverlay: 0.16 },
  sunrise: { distortion: 0.16, swirl: 0.04, speed: 0.09, grainOverlay: 0.12 },
  morning: { distortion: 0.14, swirl: 0.03, speed: 0.1, grainOverlay: 0.1 },
  'solar-noon': { distortion: 0.1, swirl: 0.02, speed: 0.12, grainOverlay: 0.08 },
  afternoon: { distortion: 0.12, swirl: 0.03, speed: 0.1, grainOverlay: 0.1 },
  sunset: { distortion: 0.18, swirl: 0.05, speed: 0.08, grainOverlay: 0.14 },
  dusk: { distortion: 0.12, swirl: 0.03, speed: 0.06, grainOverlay: 0.2 },
};

// PARCHMENT — a document doesn't move. speed=0 everywhere.
// The phase shift is expressed only through the CSS color transition.
const PARCHMENT_MOTION: MotionProfile = {
  midnight: { distortion: 0.0, swirl: 0.0, speed: 0.0, grainOverlay: 0.06 },
  night: { distortion: 0.0, swirl: 0.0, speed: 0.0, grainOverlay: 0.05 },
  dawn: { distortion: 0.0, swirl: 0.0, speed: 0.0, grainOverlay: 0.04 },
  sunrise: { distortion: 0.0, swirl: 0.0, speed: 0.0, grainOverlay: 0.03 },
  morning: { distortion: 0.0, swirl: 0.0, speed: 0.0, grainOverlay: 0.02 },
  'solar-noon': { distortion: 0.0, swirl: 0.0, speed: 0.0, grainOverlay: 0.02 },
  afternoon: { distortion: 0.0, swirl: 0.0, speed: 0.0, grainOverlay: 0.02 },
  sunset: { distortion: 0.0, swirl: 0.0, speed: 0.0, grainOverlay: 0.03 },
  dusk: { distortion: 0.0, swirl: 0.0, speed: 0.0, grainOverlay: 0.05 },
};

// SIGNAL — brutalist terminal. No organic drift. Raw grain, mechanical.
// Distortion is very low (pixels don't flow in a terminal).
// Grain is high — CRT texture, not smoothness.
const SIGNAL_MOTION: MotionProfile = {
  midnight: { distortion: 0.06, swirl: 0.0, speed: 0.06, grainOverlay: 0.32 },
  night: { distortion: 0.06, swirl: 0.0, speed: 0.06, grainOverlay: 0.3 },
  dawn: { distortion: 0.08, swirl: 0.01, speed: 0.08, grainOverlay: 0.26 },
  sunrise: { distortion: 0.08, swirl: 0.01, speed: 0.08, grainOverlay: 0.24 },
  morning: { distortion: 0.1, swirl: 0.01, speed: 0.1, grainOverlay: 0.22 },
  'solar-noon': { distortion: 0.1, swirl: 0.01, speed: 0.1, grainOverlay: 0.2 },
  afternoon: { distortion: 0.1, swirl: 0.01, speed: 0.1, grainOverlay: 0.22 },
  sunset: { distortion: 0.08, swirl: 0.01, speed: 0.08, grainOverlay: 0.26 },
  dusk: { distortion: 0.06, swirl: 0.0, speed: 0.06, grainOverlay: 0.3 },
};

// MERIDIAN — clean and airy. Constant gentle drift. Never dramatic.
// Half the universal values across all phases.
const MERIDIAN_MOTION: MotionProfile = {
  midnight: { distortion: 0.12, swirl: 0.02, speed: 0.08, grainOverlay: 0.08 },
  night: { distortion: 0.14, swirl: 0.03, speed: 0.1, grainOverlay: 0.07 },
  dawn: { distortion: 0.24, swirl: 0.06, speed: 0.14, grainOverlay: 0.05 },
  sunrise: { distortion: 0.3, swirl: 0.09, speed: 0.2, grainOverlay: 0.04 },
  morning: { distortion: 0.26, swirl: 0.06, speed: 0.26, grainOverlay: 0.03 },
  'solar-noon': { distortion: 0.18, swirl: 0.04, speed: 0.32, grainOverlay: 0.02 },
  afternoon: { distortion: 0.22, swirl: 0.05, speed: 0.26, grainOverlay: 0.03 },
  sunset: { distortion: 0.32, swirl: 0.12, speed: 0.18, grainOverlay: 0.04 },
  dusk: { distortion: 0.22, swirl: 0.08, speed: 0.12, grainOverlay: 0.06 },
};

// SUNDIAL — ancient, measured. The gnomon shadow moves once per hour.
// Low speed, low swirl. Stone grain.
const SUNDIAL_MOTION: MotionProfile = {
  midnight: { distortion: 0.18, swirl: 0.03, speed: 0.07, grainOverlay: 0.2 },
  night: { distortion: 0.2, swirl: 0.04, speed: 0.08, grainOverlay: 0.18 },
  dawn: { distortion: 0.28, swirl: 0.07, speed: 0.14, grainOverlay: 0.12 },
  sunrise: { distortion: 0.34, swirl: 0.1, speed: 0.18, grainOverlay: 0.09 },
  morning: { distortion: 0.28, swirl: 0.06, speed: 0.22, grainOverlay: 0.08 },
  'solar-noon': { distortion: 0.2, swirl: 0.04, speed: 0.28, grainOverlay: 0.06 },
  afternoon: { distortion: 0.24, swirl: 0.05, speed: 0.22, grainOverlay: 0.07 },
  sunset: { distortion: 0.36, swirl: 0.14, speed: 0.16, grainOverlay: 0.1 },
  dusk: { distortion: 0.24, swirl: 0.08, speed: 0.1, grainOverlay: 0.14 },
};

// PAPER — uncoated stock breathes. Organic, unhurried. Medium everything.
// Never dramatic, never static. Grain increases slightly at night.
const PAPER_MOTION: MotionProfile = {
  midnight: { distortion: 0.22, swirl: 0.04, speed: 0.1, grainOverlay: 0.22 },
  night: { distortion: 0.26, swirl: 0.06, speed: 0.14, grainOverlay: 0.18 },
  dawn: { distortion: 0.38, swirl: 0.1, speed: 0.22, grainOverlay: 0.12 },
  sunrise: { distortion: 0.46, swirl: 0.14, speed: 0.3, grainOverlay: 0.09 },
  morning: { distortion: 0.38, swirl: 0.09, speed: 0.38, grainOverlay: 0.07 },
  'solar-noon': { distortion: 0.28, swirl: 0.05, speed: 0.46, grainOverlay: 0.05 },
  afternoon: { distortion: 0.34, swirl: 0.07, speed: 0.38, grainOverlay: 0.06 },
  sunset: { distortion: 0.5, swirl: 0.2, speed: 0.26, grainOverlay: 0.1 },
  dusk: { distortion: 0.34, swirl: 0.12, speed: 0.16, grainOverlay: 0.14 },
};

// FOUNDRY — the reference skin. Full universal energy arc.
// Rich, heavy, machined. Slightly more swirl than the bare universal.
const FOUNDRY_MOTION: MotionProfile = {
  midnight: { distortion: 0.22, swirl: 0.04, speed: 0.1, grainOverlay: 0.16 },
  night: { distortion: 0.3, swirl: 0.07, speed: 0.16, grainOverlay: 0.13 },
  dawn: { distortion: 0.55, swirl: 0.16, speed: 0.28, grainOverlay: 0.09 },
  sunrise: { distortion: 0.7, swirl: 0.26, speed: 0.4, grainOverlay: 0.06 },
  morning: { distortion: 0.56, swirl: 0.15, speed: 0.52, grainOverlay: 0.04 },
  'solar-noon': { distortion: 0.38, swirl: 0.08, speed: 0.66, grainOverlay: 0.03 },
  afternoon: { distortion: 0.46, swirl: 0.12, speed: 0.52, grainOverlay: 0.04 },
  sunset: { distortion: 0.74, swirl: 0.34, speed: 0.36, grainOverlay: 0.07 },
  dusk: { distortion: 0.46, swirl: 0.2, speed: 0.22, grainOverlay: 0.12 },
};

// MINERAL — gemstones refract, they don't flow. Low distortion, moderate swirl
// (internal scattering), medium speed. Grain is very low — facets are sharp.
const MINERAL_MOTION: MotionProfile = {
  midnight: { distortion: 0.14, swirl: 0.1, speed: 0.12, grainOverlay: 0.06 },
  night: { distortion: 0.16, swirl: 0.12, speed: 0.14, grainOverlay: 0.05 },
  dawn: { distortion: 0.22, swirl: 0.18, speed: 0.22, grainOverlay: 0.04 },
  sunrise: { distortion: 0.28, swirl: 0.24, speed: 0.32, grainOverlay: 0.03 },
  morning: { distortion: 0.22, swirl: 0.18, speed: 0.4, grainOverlay: 0.02 },
  'solar-noon': { distortion: 0.16, swirl: 0.14, speed: 0.5, grainOverlay: 0.02 },
  afternoon: { distortion: 0.2, swirl: 0.16, speed: 0.4, grainOverlay: 0.02 },
  sunset: { distortion: 0.3, swirl: 0.28, speed: 0.28, grainOverlay: 0.03 },
  dusk: { distortion: 0.2, swirl: 0.2, speed: 0.18, grainOverlay: 0.04 },
};

// TIDE — the sea rolls. High distortion at all phases (waves never stop).
// Speed follows a tidal rhythm: slower at dead of night, building through dawn.
// Grain is very low — water is clear, not grainy.
const TIDE_MOTION: MotionProfile = {
  midnight: { distortion: 0.5, swirl: 0.08, speed: 0.18, grainOverlay: 0.03 },
  night: { distortion: 0.54, swirl: 0.1, speed: 0.22, grainOverlay: 0.03 },
  dawn: { distortion: 0.64, swirl: 0.16, speed: 0.34, grainOverlay: 0.02 },
  sunrise: { distortion: 0.72, swirl: 0.2, speed: 0.44, grainOverlay: 0.02 },
  morning: { distortion: 0.68, swirl: 0.16, speed: 0.54, grainOverlay: 0.01 },
  'solar-noon': { distortion: 0.6, swirl: 0.12, speed: 0.62, grainOverlay: 0.01 },
  afternoon: { distortion: 0.64, swirl: 0.14, speed: 0.54, grainOverlay: 0.01 },
  sunset: { distortion: 0.74, swirl: 0.24, speed: 0.4, grainOverlay: 0.02 },
  dusk: { distortion: 0.6, swirl: 0.18, speed: 0.28, grainOverlay: 0.03 },
};

// AURORA — the most variable. At midnight/night the lights dance at full
// intensity. During the day the aurora is invisible — calm, warm sky.
// At dusk/sunset the bands return. Grain is very low — aurora is luminous.
const AURORA_MOTION: MotionProfile = {
  midnight: { distortion: 0.8, swirl: 0.44, speed: 0.7, grainOverlay: 0.02 },
  night: { distortion: 0.86, swirl: 0.5, speed: 0.8, grainOverlay: 0.02 },
  dawn: { distortion: 0.62, swirl: 0.32, speed: 0.52, grainOverlay: 0.03 },
  sunrise: { distortion: 0.38, swirl: 0.16, speed: 0.3, grainOverlay: 0.04 },
  morning: { distortion: 0.18, swirl: 0.05, speed: 0.18, grainOverlay: 0.04 },
  'solar-noon': { distortion: 0.14, swirl: 0.03, speed: 0.14, grainOverlay: 0.03 },
  afternoon: { distortion: 0.18, swirl: 0.05, speed: 0.18, grainOverlay: 0.04 },
  sunset: { distortion: 0.46, swirl: 0.24, speed: 0.42, grainOverlay: 0.03 },
  dusk: { distortion: 0.68, swirl: 0.38, speed: 0.6, grainOverlay: 0.02 },
};

// ─── Skin → profile map ───────────────────────────────────────────────────────

export const SKIN_MOTION_PROFILES: Record<DesignMode, MotionProfile> = {
  void: VOID_MOTION,
  parchment: PARCHMENT_MOTION,
  signal: SIGNAL_MOTION,
  meridian: MERIDIAN_MOTION,
  sundial: SUNDIAL_MOTION,
  paper: PAPER_MOTION,
  foundry: FOUNDRY_MOTION,
  mineral: MINERAL_MOTION,
  tide: TIDE_MOTION,
  aurora: AURORA_MOTION,
};
