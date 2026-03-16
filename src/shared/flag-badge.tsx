'use client';

/**
 * shared/flag-badge.tsx
 *
 * Per-skin flag badge component using raw SVG strings from
 * country-flag-icons/string/3x2 so we can manipulate the SVG itself —
 * not just its container.
 *
 * Technique: inject an SVG <filter> block into the flag's SVG markup,
 * then apply it to the root <svg> element via filter="url(#id)".
 * This means the color transformation happens on the actual flag paths,
 * not a CSS wrapper — producing genuinely skin-integrated flags rather
 * than tinted boxes.
 *
 * Per-skin treatments:
 *   aurora   — gentle desaturate + brightness pull + thin aurora tint screen wash
 *   foundry  — feColorMatrix warm sepia blend via soft-light; nighttime crushes gently
 *   meridian — feColorMatrix desaturate to ~45% min, then feBlend screen with accent wash
 *   mineral  — 55/45 blend of duotone and original: gem palette dominant, flag still readable
 *   sundial  — warm amber/sepia wash (day) or cool slate wash (night) via soft-light;
 *              reads as a flag carved into or resting on stone material
 *   tide     — screen wash at very low opacity; saturation 0.80/0.70/0.60 by mode;
 *              feels like a flag seen through salt water or wet glass — refracted,
 *              slightly cooled, surface-lit. Works across the full phase palette
 *              (cyan night → warm sunrise → teal morning → yellow-green afternoon)
 *              by keeping wash opacity low enough that warm accents tint rather than
 *              dominate. Saturation floor 0.60 (dark) stays above the 0.45 floor.
 *   [other]  — feColorMatrix gentle desaturate; mode-aware brightness
 *
 * Shape per skin:
 *   aurora   — stadium/pill shape (borderRadius = h/2)
 *   foundry  — rounded rect (borderRadius 3px) with inset highlight
 *   meridian — sharp rect (borderRadius 1px) with hairline outline
 *   mineral  — octagonal clipPath
 *   sundial  — tight rect (borderRadius 2px) with carved-recess inset shadow
 *   tide     — rounded rect (borderRadius 3px) with inset surface-light highlight
 *              at top + soft outer glow (diffuse bioluminescent water glow)
 *   [other]  — rounded rect (borderRadius 3px)
 *
 * FLAG RECOGNIZABILITY RULES:
 *   The minimum saturation threshold for hue identity to survive at small
 *   sizes is roughly 0.45. Below that, warm and cool hues converge visually
 *   and flags become indistinguishable (e.g. Germany ≈ France in dark mode).
 *
 *   Foundry previously used multiply blending for its warm overlay, which
 *   compounds desaturation — both darkening AND shifting hue. Switched to
 *   soft-light which adds the warm cast without destroying luminance structure.
 *
 *   Mineral previously applied a pure 100% duotone which completely replaced
 *   all flag colors. Now uses arithmetic feComposite to mix 55% duotone +
 *   45% original — the gem palette still dominates visually but stripes,
 *   crosses and color regions remain distinguishable.
 *
 *   Sundial uses soft-light for its stone wash rather than screen — soft-light
 *   shifts luminance rather than adding light, which feels embedded in material
 *   rather than tinted-over. Saturation floor is 0.50 (dark/night), preserving
 *   flag recognizability while reading as stone-weathered.
 *
 * AURORA FILTER FIX:
 *   The previous aurora filter used feColorMatrix hueRotate which — combined
 *   with the feComponentTransfer chain — caused the flag paths to render as a
 *   near-solid tinted shape rather than the recognisable flag. The filter is
 *   now the same proven saturate → brightness → screen-wash → composite
 *   pattern used by foundry/meridian/neutral, parameterised for aurora aesthetics.
 *
 * AURORA VIEWBOX FIX:
 *   Previous calculation: `${(3 - 2) * 0.5 * 0.5} 0 2 2` → "0.25 0 2 2"
 *   To center-crop a 3:2 flag into a 1:1 square the x-offset must be half the
 *   excess width: (3 − 2) / 2 = 0.5. Correct value: "0.5 0 2 2".
 *
 * Usage:
 *   <FlagBadge
 *     code="GB"
 *     skin="sundial"
 *     mode="dim"
 *     accent="#D09040"       // pal.orbFill — warm amber
 *     shadow="#0E1018"       // pal.bg[0]   — deepest stone dark
 *     highlight="#A8B0C8"    // pal.textPrimary
 *     glow="rgba(72,88,168,0.60)"  // pal.orbGlow
 *     size="pill"            // "pill" | "compact"
 *   />
 */

import { useMemo } from 'react';

// ─── Flag string import ───────────────────────────────────────────────────────
// /string/3x2 gives raw SVG markup — we own every path inside it.

import * as FlagStrings from 'country-flag-icons/string/3x2';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FlagSkin = 'aurora' | 'foundry' | 'meridian' | 'mineral' | 'sundial' | 'tide' | string; // any unknown skin falls through to neutral treatment

export type FlagSize = 'pill' | 'compact';
export type FlagMode = 'light' | 'dim' | 'dark';

export interface FlagBadgeProps {
  /** ISO 3166-1 alpha-2 country code, e.g. "GB", "US", "DE" */
  code: string;
  skin: FlagSkin;
  mode: FlagMode;
  /** Primary accent color of the current blended palette */
  accent: string;
  /**
   * Dark anchor for duotone (mineral) or tint overlay.
   * Pass pal.bg[0] — the deepest background shade.
   */
  shadow?: string;
  /**
   * Light anchor for duotone (mineral).
   * Pass pal.textPrimary or pal.luster for the bright end.
   */
  highlight?: string;
  /** Outer glow color — used for boxShadow / aurora glow ring */
  glow?: string;
  size?: FlagSize;
  className?: string;
}

// ─── Dimension constants ──────────────────────────────────────────────────────

const DIMS: Record<FlagSize, { w: number; h: number }> = {
  pill: { w: 20, h: 14 },
  compact: { w: 16, h: 11 },
};

// ─── Hex → rgb helper ─────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  // Handle rgba(...) strings gracefully — extract r,g,b
  if (clean.startsWith('rgb')) {
    const m = clean.match(/[\d.]+/g);
    if (m && m.length >= 3) return [+m[0] / 255, +m[1] / 255, +m[2] / 255];
    return [0.5, 0.5, 0.5];
  }
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.slice(0, 6);
  const n = Number.parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// ─── SVG filter builders ──────────────────────────────────────────────────────
// Each returns a filter block string to inject into the SVG.

/**
 * AURORA filter:
 *
 * Uses the same proven pattern as foundry/meridian/neutral:
 *   1. feColorMatrix saturate  — gentle desaturate so flags read as
 *      sky-lit rather than over-vivid
 *   2. feComponentTransfer     — mode-aware brightness pull (darken at night)
 *   3. feFlood + feBlend screen — hairline aurora tint wash at very low opacity
 *   4. feComposite operator=in — clip result to flag's own alpha shape
 *
 * Saturation stays at or above 0.82 in all modes — well above the 0.45
 * recognizability floor — so flag hue identity is never at risk.
 */
function buildAuroraFilter(filterId: string, accent: string, mode: FlagMode): string {
  const satScale = mode === 'light' ? '1.00' : mode === 'dim' ? '0.88' : '0.82';
  const bright = mode === 'dark' ? '0.84' : mode === 'dim' ? '0.92' : '1.00';
  const washOp = mode === 'dark' ? '0.10' : mode === 'dim' ? '0.07' : '0.04';

  return `
    <filter id="${filterId}" color-interpolation-filters="sRGB"
            x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="saturate" values="${satScale}" result="sat"/>
      <feComponentTransfer in="sat" result="bright">
        <feFuncR type="linear" slope="${bright}"/>
        <feFuncG type="linear" slope="${bright}"/>
        <feFuncB type="linear" slope="${bright}"/>
      </feComponentTransfer>
      <feFlood flood-color="${accent}" flood-opacity="${washOp}" result="wash"/>
      <feBlend in="wash" in2="bright" mode="screen" result="tinted"/>
      <feComposite in="tinted" in2="SourceGraphic" operator="in"/>
    </filter>
  `;
}

/**
 * FOUNDRY filter:
 * Industrial/material — warm sepia overlay at night, clean-but-muted in day.
 *
 * FIX: saturation floor raised to 0.72 in dark (was 0.52 — below the 0.45
 * recognizability threshold when combined with overlay).
 * FIX: warm overlay now uses soft-light instead of multiply.
 * FIX: overlay opacity reduced slightly since soft-light is punchier than multiply.
 */
function buildFoundryFilter(filterId: string, accent: string, mode: FlagMode): string {
  const satScale = mode === 'dark' ? '0.72' : mode === 'dim' ? '0.82' : '0.92';
  const bright = mode === 'dark' ? '0.76' : mode === 'dim' ? '0.88' : '1.02';
  const [ar, ag, ab] = hexToRgb(accent);
  const warmR = Math.min(1, ar * 0.6 + 0.4).toFixed(3);
  const warmG = Math.min(1, ag * 0.4 + 0.28).toFixed(3);
  const warmB = Math.min(1, ab * 0.2 + 0.12).toFixed(3);
  const warmOp = mode === 'dark' ? '0.18' : mode === 'dim' ? '0.10' : '0.05';

  return `
    <filter id="${filterId}" color-interpolation-filters="sRGB"
            x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="saturate" values="${satScale}" result="sat"/>
      <feComponentTransfer in="sat" result="bright">
        <feFuncR type="linear" slope="${bright}"/>
        <feFuncG type="linear" slope="${bright}"/>
        <feFuncB type="linear" slope="${bright}"/>
      </feComponentTransfer>
      <feFlood flood-color="rgb(${Math.round(+warmR * 255)},${Math.round(+warmG * 255)},${Math.round(+warmB * 255)})"
               flood-opacity="${warmOp}" result="warm"/>
      <feBlend in="warm" in2="bright" mode="soft-light" result="blended"/>
      <feComposite in="blended" in2="SourceGraphic" operator="in"/>
    </filter>
  `;
}

/**
 * MERIDIAN filter:
 * Extreme restraint — the flag is architectural, not decorative.
 * Desaturate heavily, then feBlend a very thin accent wash via screen.
 *
 * FIX: saturation floor raised to 0.45 in dark (was 0.28 — well below the
 * recognizability threshold).
 */
function buildMeridianFilter(filterId: string, accent: string, mode: FlagMode): string {
  const satScale = mode === 'light' ? '0.72' : mode === 'dim' ? '0.55' : '0.45';
  const bright = mode === 'dark' ? '0.72' : mode === 'dim' ? '0.82' : '0.95';
  const washOp = mode === 'light' ? '0.05' : '0.10';

  return `
    <filter id="${filterId}" color-interpolation-filters="sRGB"
            x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="saturate" values="${satScale}" result="sat"/>
      <feComponentTransfer in="sat" result="bright">
        <feFuncR type="linear" slope="${bright}"/>
        <feFuncG type="linear" slope="${bright}"/>
        <feFuncB type="linear" slope="${bright}"/>
      </feComponentTransfer>
      <feFlood flood-color="${accent}" flood-opacity="${washOp}" result="wash"/>
      <feBlend in="wash" in2="bright" mode="screen" result="tinted"/>
      <feComposite in="tinted" in2="SourceGraphic" operator="in"/>
    </filter>
  `;
}

/**
 * MINERAL duotone filter:
 * Gem-palette treatment — maps darks → shadow and lights → highlight.
 *
 * FIX: arithmetic feComposite mixes 55% duotone + 45% original.
 * Gem palette dominates visually but flag color regions remain distinguishable.
 */
function buildMineralFilter(filterId: string, shadow: string, highlight: string): string {
  const [sr, sg, sb] = hexToRgb(shadow);
  const [hr, hg, hb] = hexToRgb(highlight);

  const tR = [sr, (sr + hr) / 2, hr].map((v) => v.toFixed(4)).join(' ');
  const tG = [sg, (sg + hg) / 2, hg].map((v) => v.toFixed(4)).join(' ');
  const tB = [sb, (sb + hb) / 2, hb].map((v) => v.toFixed(4)).join(' ');

  return `
    <filter id="${filterId}" color-interpolation-filters="sRGB"
            x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="luminanceToAlpha" result="lum"/>
      <feColorMatrix in="lum" type="matrix"
        values="1 0 0 0 0
                1 0 0 0 0
                1 0 0 0 0
                0 0 0 1 0"
        result="grey"/>
      <feComponentTransfer in="grey" result="duotone">
        <feFuncR type="table" tableValues="${tR}"/>
        <feFuncG type="table" tableValues="${tG}"/>
        <feFuncB type="table" tableValues="${tB}"/>
      </feComponentTransfer>
      <feComposite in="duotone" in2="SourceGraphic" operator="arithmetic"
        k1="0" k2="0.55" k3="0.45" k4="0" result="mixed"/>
      <feComposite in="mixed" in2="SourceGraphic" operator="in"/>
    </filter>
  `;
}

/**
 * SUNDIAL filter:
 * Stone and marble material language — flags feel carved into or resting
 * on the same aged stone as the sundial face itself.
 *
 * The core technique is a soft-light material wash rather than a screen
 * overlay. Screen adds light on top (tinting); soft-light shifts luminance
 * within the material (embedding). This is the right choice for stone —
 * the flag colors are absorbed into the material, not painted over it.
 *
 * Day phases (light/dim): warm ochre-amber wash — sunlit limestone, aged
 *   sandstone, warm travertine. The wash color pushes toward the palette's
 *   own amber-gold tones regardless of flag hue.
 *
 * Night phases (dark): cool blue-grey slate wash — moonlit marble, cold
 *   granite. Shifts toward the palette's nocturnal stone blues.
 *
 * Saturation floor: 0.65 (light), 0.58 (dim), 0.50 (dark).
 *   All above the 0.45 recognizability threshold. Flags are desaturated
 *   enough to feel stone-embedded but stripes and color regions stay distinct.
 *   This is slightly more saturated than meridian (which is purely architectural)
 *   because stone has warm/cool material color that interacts with flag hues.
 *
 * Wash opacity: soft-light at 0.22–0.25 is strong enough to impart stone
 *   character without obliterating the flag. Comparable to the warm overlay
 *   in foundry, but the soft-light mode produces a different quality —
 *   it's denser and more embedded rather than surface-level.
 */
function buildSundialFilter(filterId: string, accent: string, mode: FlagMode): string {
  // Stone desaturation — above 0.45 floor throughout
  const satScale = mode === 'light' ? '0.65' : mode === 'dim' ? '0.58' : '0.50';
  // Brightness: stone absorbs slightly even in full sun; darkens at night
  const bright = mode === 'dark' ? '0.70' : mode === 'dim' ? '0.82' : '0.92';

  // Stone wash color: derived from accent but heavily redirected to stone character.
  // We blend the accent with fixed stone tones so the wash always reads as
  // material rather than hue-specific — the accent just personalises it slightly.
  const [ar, ag, ab] = hexToRgb(accent);

  let washR: number;
  let washG: number;
  let washB: number;
  if (mode === 'dark') {
    // Night: moonlit marble / cold granite — push toward blue-grey slate
    // Accent shifts it slightly (night palettes are already blue-stone toned)
    washR = Math.min(1, ar * 0.25 + 0.26); // ~0.28–0.34 range
    washG = Math.min(1, ag * 0.28 + 0.3); // ~0.32–0.38 range
    washB = Math.min(1, ab * 0.35 + 0.38); // ~0.40–0.48 range
  } else {
    // Day/dim: sunlit limestone / warm travertine — push toward ochre-amber
    // Night-derived accents (dim/sunset) shift toward burnt sienna naturally
    washR = Math.min(1, ar * 0.45 + 0.44); // ~0.48–0.60 range → warm
    washG = Math.min(1, ag * 0.35 + 0.26); // ~0.30–0.42 range → ochre
    washB = Math.min(1, ab * 0.18 + 0.06); // ~0.08–0.18 range → stone
  }

  // soft-light at 0.22–0.25: strong enough to impart stone character,
  // embedded enough not to obliterate flag recognizability
  const washOp = mode === 'dark' ? '0.22' : mode === 'dim' ? '0.20' : '0.25';

  return `
    <filter id="${filterId}" color-interpolation-filters="sRGB"
            x="0%" y="0%" width="100%" height="100%">
      <!-- Stone desaturate: day 0.65 / dim 0.58 / dark 0.50 (above 0.45 floor) -->
      <feColorMatrix type="saturate" values="${satScale}" result="sat"/>
      <!-- Material brightness: stone absorbs in sun, deepens at night -->
      <feComponentTransfer in="sat" result="bright">
        <feFuncR type="linear" slope="${bright}"/>
        <feFuncG type="linear" slope="${bright}"/>
        <feFuncB type="linear" slope="${bright}"/>
      </feComponentTransfer>
      <!--
        Stone material wash via soft-light.
        Day: warm ochre-amber (sunlit limestone).
        Night: cool slate (moonlit marble).
        soft-light shifts luminance within material — embeds rather than tints.
      -->
      <feFlood
        flood-color="rgb(${Math.round(washR * 255)},${Math.round(washG * 255)},${Math.round(washB * 255)})"
        flood-opacity="${washOp}"
        result="stone"/>
      <feBlend in="stone" in2="bright" mode="soft-light" result="stoned"/>
      <!-- Clip to original flag alpha shape -->
      <feComposite in="stoned" in2="SourceGraphic" operator="in"/>
    </filter>
  `;
}

/**
 * TIDE filter:
 * Coastal/oceanic — flags seen through salt water or wet glass.
 *
 * Technique: screen at very low opacity rather than soft-light or multiply.
 * Screen adds reflected surface light (like sunlight or bioluminescence
 * bouncing off water). It brightens without shifting hue structure, which
 * is correct for the refracted-through-water feel — the flag colors are
 * still readable, just slightly cooled and lit from above.
 *
 * The critical design challenge: Tide's accent palette spans the full
 * chromatic range across phases — cyan (night), orange-red (sunrise/sunset),
 * teal (morning/noon), yellow-green (afternoon). The wash opacity is kept
 * very low (0.08–0.12) so that warm accents tint rather than dominate.
 * At these opacities, the screen wash reads as atmospheric surface shimmer
 * regardless of its specific hue.
 *
 * Saturation floor: 0.80 (light), 0.70 (dim), 0.60 (dark).
 *   All well above the 0.45 recognizability threshold. Tide is the least
 *   aggressive treatment — water transmits color more faithfully than stone
 *   (sundial/foundry) or extreme restraint (meridian). The flags should
 *   feel like they're under a thin layer of clear seawater, not lost in it.
 *
 * Brightness: slight pull at night (water depths absorb light); neutral
 *   at midday when the surface is fully lit.
 */
function buildTideFilter(filterId: string, accent: string, mode: FlagMode): string {
  // Saturation — generous floor, water is more transmissive than stone
  const satScale = mode === 'light' ? '0.80' : mode === 'dim' ? '0.70' : '0.60';
  // Brightness — subtle pull at depth/night; neutral in open daylight
  const bright = mode === 'dark' ? '0.86' : mode === 'dim' ? '0.93' : '1.00';
  // Screen wash — very low so warm phases (sunrise orange, sunset red)
  // tint rather than dominate. Reads as surface shimmer at these opacities.
  const washOp = mode === 'dark' ? '0.12' : mode === 'dim' ? '0.10' : '0.08';

  return `
    <filter id="${filterId}" color-interpolation-filters="sRGB"
            x="0%" y="0%" width="100%" height="100%">
      <!-- Aqueous desaturation: generous floor — water transmits colour -->
      <feColorMatrix type="saturate" values="${satScale}" result="sat"/>
      <!-- Depth brightness: subtle pull at night, neutral at high sun -->
      <feComponentTransfer in="sat" result="bright">
        <feFuncR type="linear" slope="${bright}"/>
        <feFuncG type="linear" slope="${bright}"/>
        <feFuncB type="linear" slope="${bright}"/>
      </feComponentTransfer>
      <!--
        Surface-light screen wash — reflects the phase accent at very low opacity.
        screen mode adds light without shifting hue structure, producing the
        quality of sunlight or bioluminescence bouncing off the water surface.
        Low enough opacity that warm phases (sunrise/sunset orange) tint rather
        than dominate — reads as atmospheric shimmer across all phases.
      -->
      <feFlood flood-color="${accent}" flood-opacity="${washOp}" result="wash"/>
      <feBlend in="wash" in2="bright" mode="screen" result="tinted"/>
      <!-- Clip to original flag alpha shape -->
      <feComposite in="tinted" in2="SourceGraphic" operator="in"/>
    </filter>
  `;
}

function buildNeutralFilter(filterId: string, accent: string, mode: FlagMode): string {
  const satScale = mode === 'light' ? '0.90' : mode === 'dim' ? '0.75' : '0.62';
  const bright = mode === 'dark' ? '0.80' : mode === 'dim' ? '0.88' : '1.00';
  const washOp = mode === 'dark' ? '0.08' : '0.04';

  return `
    <filter id="${filterId}" color-interpolation-filters="sRGB"
            x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="saturate" values="${satScale}" result="sat"/>
      <feComponentTransfer in="sat" result="bright">
        <feFuncR type="linear" slope="${bright}"/>
        <feFuncG type="linear" slope="${bright}"/>
        <feFuncB type="linear" slope="${bright}"/>
      </feComponentTransfer>
      <feFlood flood-color="${accent}" flood-opacity="${washOp}" result="wash"/>
      <feBlend in="wash" in2="bright" mode="screen" result="tinted"/>
      <feComposite in="tinted" in2="SourceGraphic" operator="in"/>
    </filter>
  `;
}

// ─── Shape styles ─────────────────────────────────────────────────────────────

function getContainerStyle(
  skin: FlagSkin,
  mode: FlagMode,
  glow: string | undefined,
  w: number,
  h: number,
): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    width: w,
    height: h,
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative',
  };

  switch (skin) {
    case 'aurora':
      // Stadium/pill shape — full 3:2 flag visible with heavily rounded ends.
      return {
        ...base,
        borderRadius: Math.ceil(h / 2),
        boxShadow: glow ? `0 0 8px 2px ${glow}` : undefined,
      };

    case 'foundry':
      // Industrial bevelled rect; inset edge highlight + dark shadow
      return {
        ...base,
        borderRadius: 3,
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,${mode === 'dark' ? '0.12' : '0.06'}),
                    0 1px 4px rgba(0,0,0,0.38)`,
      };

    case 'meridian':
      // Hairline sharp rect — architectural restraint, no decoration
      return {
        ...base,
        borderRadius: 1,
        outline: `1px solid rgba(128,128,128,${mode === 'dark' ? '0.25' : '0.18'})`,
      };

    case 'mineral':
      // Octagonal — matches the widget's own faceted clipPath geometry exactly
      return {
        ...base,
        clipPath: 'polygon(0 22%, 22% 0, 78% 0, 100% 22%, 100% 78%, 78% 100%, 22% 100%, 0 78%)',
        boxShadow: glow ? `0 0 10px 2px ${glow}` : undefined,
      };

    case 'sundial':
      // Carved stone recess — tight border reads as a relief-carving edge.
      // The inset shadow mimics the shadow cast by a shallow carved slot in
      // stone (top/left darker = light source from upper-left as on a real
      // sundial face). The outer drop shadow grounds it on the stone surface.
      // 2px radius: fractionally softer than meridian's 1px hairline but
      // still reads as precise and architectural rather than rounded/modern.
      return {
        ...base,
        borderRadius: 2,
        boxShadow: [
          // Inset carved-slot shadow: directional, mimics upper-left light
          `inset 1px 1px 0px rgba(0,0,0,${mode === 'dark' ? '0.35' : '0.22'})`,
          `inset 0 0 0 1px rgba(0,0,0,${mode === 'dark' ? '0.28' : '0.18'})`,
          // Outer drop — subtle grounding on the stone surface
          `0 1px 3px rgba(0,0,0,${mode === 'dark' ? '0.32' : '0.16'})`,
        ].join(', '),
      };

    case 'tide':
      // Smooth wave-stone rounded rect — same radius as foundry but different edge treatment.
      // Inset highlight at top mimics light refracting off the water surface
      // (the flag appears lit from above, as if sunken just below the waterline).
      // Outer diffuse glow: bioluminescent water glow — soft and spreading,
      // not the sharp aurora ring. Wider blur radius than aurora's halo.
      return {
        ...base,
        borderRadius: 3,
        boxShadow: [
          // Inset surface-light: top edge brightens like refracted light from above
          `inset 0 1px 0px rgba(255,255,255,${mode === 'dark' ? '0.18' : mode === 'dim' ? '0.14' : '0.10'})`,
          `inset 0 0 0 1px rgba(255,255,255,${mode === 'dark' ? '0.10' : '0.06'})`,
          // Outer diffuse glow: wider and softer than aurora's tight ring
          glow ? `0 0 10px 3px ${glow}` : '0 1px 4px rgba(0,0,0,0.28)',
        ].join(', '),
      };

    default:
      return {
        ...base,
        borderRadius: 3,
        boxShadow: `0 0 6px 1px ${glow ?? 'transparent'}`,
      };
  }
}

// ─── SVG processor ────────────────────────────────────────────────────────────
// Injects the filter block and applies filter="url(#id)" to the root <svg>.

function processSvg(
  rawSvg: string,
  filterId: string,
  filterDefs: string,
  w: number,
  h: number,
  skin: FlagSkin,
): string {
  /**
   * VIEWBOX NOTE:
   * Flags in country-flag-icons/string/3x2 use large pixel coordinate spaces
   * (e.g. "0 0 900 600", "0 0 28 20") — NOT the literal "0 0 3 2" ratio units.
   * All non-aurora skins render the full 3:2 flag at the given w×h dimensions.
   * The aurora skin previously center-cropped to a square; it now uses a
   * stadium shape so the full flag is preserved.
   */

  let svg = rawSvg.trim();

  svg = svg.replace(/^<svg([^>]*)>/, (_, attrs) => {
    const a = attrs
      .replace(/\s*width="[^"]*"/, '')
      .replace(/\s*height="[^"]*"/, '')
      .replace(/\s*filter="[^"]*"/, '')
      .replace(/\s*preserveAspectRatio="[^"]*"/, '');
    return `<svg${a} width="${w}" height="${h}" filter="url(#${filterId})" style="display:block;">`;
  });

  const defsBlock = `<defs>${filterDefs}</defs>`;
  svg = svg.replace(/^(<svg[^>]*>)/, `$1${defsBlock}`);

  return svg;
}

// ─── FlagBadge ────────────────────────────────────────────────────────────────

export function FlagBadge({
  code,
  skin,
  mode,
  accent,
  shadow = '#0A0A0A',
  highlight = '#FFFFFF',
  glow,
  size = 'pill',
  className,
}: FlagBadgeProps) {
  const { w, h } = DIMS[size];

  const html = useMemo(() => {
    const raw = (FlagStrings as Record<string, string | undefined>)[code];
    if (!raw) return null;

    const filterId = `fb-${skin}-${code}-${mode}`;

    let filterDefs: string;
    switch (skin) {
      case 'aurora':
        filterDefs = buildAuroraFilter(filterId, accent, mode);
        break;
      case 'foundry':
        filterDefs = buildFoundryFilter(filterId, accent, mode);
        break;
      case 'meridian':
        filterDefs = buildMeridianFilter(filterId, accent, mode);
        break;
      case 'mineral':
        filterDefs = buildMineralFilter(filterId, shadow, highlight);
        break;
      case 'sundial':
        filterDefs = buildSundialFilter(filterId, accent, mode);
        break;
      case 'tide':
        filterDefs = buildTideFilter(filterId, accent, mode);
        break;
      default:
        filterDefs = buildNeutralFilter(filterId, accent, mode);
    }

    return processSvg(raw, filterId, filterDefs, w, h, skin);
  }, [code, skin, mode, accent, shadow, highlight, w, h]);

  if (!html) {
    return (
      <span
        className={className}
        style={{
          ...getContainerStyle(skin, mode, glow, w, h),
          background: 'rgba(128,128,128,0.20)',
        }}
      />
    );
  }

  return (
    <span
      className={className}
      style={getContainerStyle(skin, mode, glow, w, h)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG string is statically generated from controlled internal data, never from user input
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── PillFlagBadge ────────────────────────────────────────────────────────────
// Drop-in replacement for PillFlag in *.component.tsx files.
// Wraps FlagBadge with the outer glow halo for aurora, mineral, and tide skins.
// aurora   → tight sky-glow ring (blur 5px, inset -3)
// mineral  → angular gem halo (blur 5px, inset -3)
// tide     → wider diffuse water glow (blur 7px, inset -4, 70% opacity) — bioluminescent
// Sundial, meridian and foundry intentionally skip the halo:
//   their material languages (carved stone, blueprint, industrial metal) have
//   no soft light emission.

export function PillFlagBadge({
  code,
  skin,
  mode,
  accent,
  shadow,
  highlight,
  glow,
}: Omit<FlagBadgeProps, 'size' | 'className'>) {
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
    >
      {/* Glow halo — aurora, mineral, and tide only.
          aurora: tight ring (sky glow).
          mineral: angular gem halo.
          tide: wider diffuse glow (bioluminescent water — spreads more than aurora's ring). */}
      {glow && (skin === 'aurora' || skin === 'mineral' || skin === 'tide') && (
        <span
          style={{
            position: 'absolute',
            inset: skin === 'tide' ? -4 : -3,
            borderRadius: skin === 'aurora' ? '999px' : skin === 'tide' ? '6px' : '6px',
            background: glow,
            filter: skin === 'tide' ? 'blur(7px)' : 'blur(5px)',
            pointerEvents: 'none',
            opacity: skin === 'tide' ? 0.7 : 1,
          }}
        />
      )}
      <FlagBadge
        code={code}
        skin={skin}
        mode={mode}
        accent={accent}
        shadow={shadow}
        highlight={highlight}
        glow={glow}
        size="pill"
      />
    </span>
  );
}

// ─── CompactFlagBadge ─────────────────────────────────────────────────────────
// Drop-in replacement for CompactFlag in *.compact.tsx files.

export function CompactFlagBadge({
  code,
  skin,
  mode,
  accent,
  shadow,
  highlight,
  glow,
}: Omit<FlagBadgeProps, 'size' | 'className'>) {
  return (
    <FlagBadge
      code={code}
      skin={skin}
      mode={mode}
      accent={accent}
      shadow={shadow}
      highlight={highlight}
      glow={glow}
      size="compact"
    />
  );
}
