'use client';

/**
 * shared/pill-weather-glyphs.tsx
 *
 * Purpose-built 20×20 weather glyphs for the collapsed pill state.
 *
 * Phase-awareness: pass phaseIcon={palette.icon} so that 'clear' and
 * 'partly-cloudy' glyphs swap their sun mark for a moon crescent during
 * night/nocturnal phases — a sun glyph at midnight looks wrong.
 *
 * Night phases are any palette.icon value that contains: moon, midnight,
 * night, lunar, crescent, gibbous, waning, waxing, new-moon, full-moon.
 *
 * Design philosophy per skin:
 *
 *   FOUNDRY   — Warm volumetric. Filled shapes with soft glow.
 *   MERIDIAN  — Hairline strokes only. 0.9px, no fill, geometric purity.
 *   MINERAL   — Hard faceted polygons. Crystal language, sharp edges.
 *   AURORA    — Soft layered arcs. Iridescent bands, glowing curves.
 *   PAPER     — Flat ink marks. Clean outlines, no gradients, editorial.
 *   SIGNAL    — Pixel/blocky. Chunky geometric, intentionally lo-fi.
 *   TIDE      — Fluid organic. Wave-influenced, curved soft paths.
 *   SUNDIAL   — Roman/classical. Clean geometric lines, shadow-dial aesthetic.
 *   VOID      — Minimal negative space. Single marks, near-invisible.
 *   PARCHMENT — Notion document strokes. 1px rgba(55,53,47) hairlines only.
 *               No fill on cloud body, no glow, no gradient, no accent color.
 *               Night variants swap sun disc for stroked crescent.
 *
 * Usage:
 *   <PillWeatherGlyph
 *     category={effectiveWeatherCategory}
 *     skin="foundry"
 *     color={palette.pillText}
 *     accentColor={palette.accentColor}
 *     phaseIcon={palette.icon}          ← REQUIRED for night-awareness
 *     size={20}
 *   />
 */

import type { WeatherCategory } from '../widgets/solar-widget.shell';
import type { WeatherSkin } from './weather-layer';

export interface PillWeatherGlyphProps {
  category: WeatherCategory;
  skin: WeatherSkin;
  /** Primary colour — used for fills and main strokes */
  color: string;
  /** Accent / secondary colour — used for glows, highlights */
  accentColor: string;
  /**
   * palette.icon — used to detect night phases.
   * Any icon string containing 'moon', 'night', 'midnight', 'lunar',
   * 'crescent', 'gibbous', 'waning', 'waxing', 'new-moon', 'full-moon'
   * is treated as a nocturnal phase → sun swapped for moon crescent.
   */
  phaseIcon?: string;
  size?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// NIGHT DETECTION
// ─────────────────────────────────────────────────────────────────────────────

const NIGHT_KEYWORDS =
  /moon|night|midnight|lunar|crescent|gibbous|waning|waxing|new-moon|full-moon/i;

/** Returns true if the palette.icon string indicates a nocturnal phase */
function isNightPhase(phaseIcon?: string): boolean {
  if (!phaseIcon) return false;
  return NIGHT_KEYWORDS.test(phaseIcon);
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED NIGHT GLYPH SUB-COMPONENTS
// These are used by multiple skin families for their clear/partly-cloudy night variants
// ─────────────────────────────────────────────────────────────────────────────

/** A simple crescent moon in the Foundry style (filled, volumetric) */
function FoundryCrescent({ color, accent, s }: { color: string; accent: string; s: number }) {
  const v = s;
  return (
    <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
      {/* Outer circle minus inner offset circle = crescent */}
      <path
        d={`M${v * 0.5},${v * 0.16} A${v * 0.34},${v * 0.34} 0 1 1 ${v * 0.5},${v * 0.84} A${v * 0.22},${v * 0.22} 0 1 0 ${v * 0.5},${v * 0.16} Z`}
        fill={color}
      />
      {/* Soft inner glow arc */}
      <path
        d={`M${v * 0.5},${v * 0.22} A${v * 0.16},${v * 0.16} 0 0 0 ${v * 0.5},${v * 0.78}`}
        stroke={accent}
        strokeWidth={v * 0.04}
        fill="none"
        opacity={0.35}
      />
    </svg>
  );
}

/** Moon crescent + cloud for Foundry partly-cloudy night */
function FoundryMoonCloud({ color, accent, s }: { color: string; accent: string; s: number }) {
  const v = s;
  return (
    <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
      {/* small crescent top-left */}
      <path
        d={`M${v * 0.28},${v * 0.12} A${v * 0.2},${v * 0.2} 0 1 1 ${v * 0.28},${v * 0.46} A${v * 0.13},${v * 0.13} 0 1 0 ${v * 0.28},${v * 0.12} Z`}
        fill={accent}
        opacity={0.9}
      />
      {/* cloud body */}
      <ellipse cx={v * 0.6} cy={v * 0.66} rx={v * 0.3} ry={v * 0.18} fill={color} />
      <ellipse cx={v * 0.52} cy={v * 0.58} rx={v * 0.18} ry={v * 0.17} fill={color} />
      <ellipse cx={v * 0.68} cy={v * 0.56} rx={v * 0.14} ry={v * 0.14} fill={color} />
    </svg>
  );
}

/** Stroke-only moon crescent for Meridian */
function MeridianCrescent({ color, s }: { color: string; s: number }) {
  const v = s;
  return (
    <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
      <path
        d={`M${v * 0.5},${v * 0.18} A${v * 0.32},${v * 0.32} 0 1 1 ${v * 0.5},${v * 0.82} A${v * 0.2},${v * 0.2} 0 1 0 ${v * 0.5},${v * 0.18} Z`}
        stroke={color}
        strokeWidth={v * 0.055}
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Stroke moon + hairline cloud for Meridian partly-cloudy night */
function MeridianMoonCloud({ color, accent, s }: { color: string; accent: string; s: number }) {
  const v = s;
  const sw = v * 0.055;
  return (
    <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
      {/* small stroked crescent */}
      <path
        d={`M${v * 0.28},${v * 0.1} A${v * 0.18},${v * 0.18} 0 1 1 ${v * 0.28},${v * 0.44} A${v * 0.11},${v * 0.11} 0 1 0 ${v * 0.28},${v * 0.1} Z`}
        stroke={accent}
        strokeWidth={sw * 0.85}
        fill="none"
        strokeLinejoin="round"
        opacity={0.8}
      />
      {/* hairline cloud */}
      <path
        d={`M${v * 0.32},${v * 0.68} Q${v * 0.22},${v * 0.68} ${v * 0.22},${v * 0.58} Q${v * 0.22},${v * 0.5} ${v * 0.34},${v * 0.49} Q${v * 0.36},${v * 0.42} ${v * 0.48},${v * 0.44} Q${v * 0.6},${v * 0.42} ${v * 0.64},${v * 0.5} Q${v * 0.76},${v * 0.5} ${v * 0.76},${v * 0.58} Q${v * 0.76},${v * 0.68} ${v * 0.66},${v * 0.68} Z`}
        stroke={color}
        strokeWidth={sw}
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Faceted polygon moon for Mineral */
function MineralCrescent({ color, accent, s }: { color: string; accent: string; s: number }) {
  const v = s;
  return (
    <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
      {/* Angular crescent approximated as polygon */}
      <polygon
        points={`${v * 0.5},${v * 0.14} ${v * 0.68},${v * 0.22} ${v * 0.74},${v * 0.4} ${v * 0.68},${v * 0.6} ${v * 0.5},${v * 0.68} ${v * 0.46},${v * 0.56} ${v * 0.54},${v * 0.4} ${v * 0.46},${v * 0.26}`}
        fill={color}
        stroke={accent}
        strokeWidth={v * 0.04}
        strokeLinejoin="round"
      />
      {/* catchlight */}
      <line
        x1={v * 0.5}
        y1={v * 0.14}
        x2={v * 0.6}
        y2={v * 0.22}
        stroke="rgba(255,255,255,0.40)"
        strokeWidth={v * 0.045}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOUNDRY GLYPHS — warm, volumetric, filled
// ─────────────────────────────────────────────────────────────────────────────

function FoundryGlyph({
  cat,
  color,
  accent,
  s,
  night,
}: { cat: WeatherCategory; color: string; accent: string; s: number; night: boolean }) {
  const v = s; // viewBox units = size

  switch (cat) {
    case 'clear':
      if (night) return <FoundryCrescent color={color} accent={accent} s={s} />;
      // Warm filled sun disc + short rays
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <circle cx={v / 2} cy={v / 2} r={v * 0.22} fill={color} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const R = Math.PI / 180;
            const i = v / 2 + v * 0.29 * Math.cos(a * R);
            const j = v / 2 + v * 0.29 * Math.sin(a * R);
            const x = v / 2 + v * 0.42 * Math.cos(a * R);
            const y = v / 2 + v * 0.42 * Math.sin(a * R);
            return (
              <line
                key={a}
                x1={i}
                y1={j}
                x2={x}
                y2={y}
                stroke={color}
                strokeWidth={v * 0.09}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      );

    case 'partly-cloudy': {
      if (night) return <FoundryMoonCloud color={color} accent={accent} s={s} />;
      // Small sun peeking from top-left, cloud body bottom-right
      const sw = v * 0.08;
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {/* sun disc */}
          <circle cx={v * 0.34} cy={v * 0.36} r={v * 0.16} fill={accent} opacity={0.9} />
          {[0, 72, 144, 216, 288].map((a) => {
            const R = Math.PI / 180;
            const i = v * 0.34 + v * 0.22 * Math.cos(a * R);
            const j = v * 0.36 + v * 0.22 * Math.sin(a * R);
            const x = v * 0.34 + v * 0.32 * Math.cos(a * R);
            const y = v * 0.36 + v * 0.32 * Math.sin(a * R);
            return (
              <line
                key={a}
                x1={i}
                y1={j}
                x2={x}
                y2={y}
                stroke={accent}
                strokeWidth={sw}
                strokeLinecap="round"
                opacity={0.75}
              />
            );
          })}
          {/* cloud body */}
          <ellipse cx={v * 0.6} cy={v * 0.66} rx={v * 0.3} ry={v * 0.18} fill={color} />
          <ellipse cx={v * 0.52} cy={v * 0.58} rx={v * 0.18} ry={v * 0.17} fill={color} />
          <ellipse cx={v * 0.68} cy={v * 0.56} rx={v * 0.14} ry={v * 0.14} fill={color} />
        </svg>
      );
    }

    case 'overcast': {
      // Two layered cloud blobs, slightly offset
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.56}
            rx={v * 0.35}
            ry={v * 0.22}
            fill={color}
            opacity={0.55}
          />
          <ellipse
            cx={v * 0.46}
            cy={v * 0.48}
            rx={v * 0.25}
            ry={v * 0.22}
            fill={color}
            opacity={0.65}
          />
          <ellipse
            cx={v * 0.62}
            cy={v * 0.46}
            rx={v * 0.2}
            ry={v * 0.19}
            fill={color}
            opacity={0.65}
          />
          <ellipse
            cx={v * 0.5}
            cy={v * 0.62}
            rx={v * 0.38}
            ry={v * 0.18}
            fill={color}
            opacity={0.9}
          />
        </svg>
      );
    }

    case 'fog': {
      // Three horizontal bars of varying width, slightly staggered
      const bars = [
        { y: v * 0.32, w: v * 0.62, x: v * 0.19, o: 0.55 },
        { y: v * 0.5, w: v * 0.72, x: v * 0.14, o: 0.72 },
        { y: v * 0.68, w: v * 0.55, x: v * 0.22, o: 0.45 },
      ];
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {bars.map((b, i) => (
            <rect
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x={b.x}
              y={b.y - v * 0.045}
              width={b.w}
              height={v * 0.09}
              rx={v * 0.045}
              fill={color}
              opacity={b.o}
            />
          ))}
        </svg>
      );
    }

    case 'drizzle': {
      // Cloud top + two thin short drops
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.42}
            rx={v * 0.3}
            ry={v * 0.18}
            fill={color}
            opacity={0.85}
          />
          <ellipse
            cx={v * 0.44}
            cy={v * 0.34}
            rx={v * 0.18}
            ry={v * 0.17}
            fill={color}
            opacity={0.85}
          />
          <ellipse
            cx={v * 0.6}
            cy={v * 0.33}
            rx={v * 0.14}
            ry={v * 0.14}
            fill={color}
            opacity={0.85}
          />
          {/* drops */}
          {[v * 0.36, v * 0.56].map((x, i) => (
            <path
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              d={`M${x},${v * 0.6} Q${x - v * 0.025},${v * 0.72} ${x},${v * 0.74} Q${x + v * 0.025},${v * 0.72} ${x},${v * 0.6}`}
              fill={accent}
              opacity={0.8 - i * 0.1}
            />
          ))}
        </svg>
      );
    }

    case 'rain': {
      // Cloud + three rounded teardrops at angles
      const drops = [
        { x: v * 0.3, y: v * 0.6, a: -12 },
        { x: v * 0.5, y: v * 0.58, a: -12 },
        { x: v * 0.7, y: v * 0.6, a: -12 },
      ];
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.4}
            rx={v * 0.3}
            ry={v * 0.18}
            fill={color}
            opacity={0.88}
          />
          <ellipse
            cx={v * 0.44}
            cy={v * 0.32}
            rx={v * 0.18}
            ry={v * 0.17}
            fill={color}
            opacity={0.88}
          />
          <ellipse
            cx={v * 0.6}
            cy={v * 0.31}
            rx={v * 0.14}
            ry={v * 0.14}
            fill={color}
            opacity={0.88}
          />
          {drops.map((d, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
            <g key={i} transform={`rotate(${d.a} ${d.x} ${d.y + v * 0.08})`}>
              <path
                d={`M${d.x},${d.y} Q${d.x - v * 0.03},${d.y + v * 0.11} ${d.x},${d.y + v * 0.145} Q${d.x + v * 0.03},${d.y + v * 0.11} ${d.x},${d.y}`}
                fill={accent}
                opacity={0.82 - i * 0.06}
              />
            </g>
          ))}
        </svg>
      );
    }

    case 'heavy-rain': {
      // Dark cloud + five fat angled drops
      const drops = [v * 0.22, v * 0.36, v * 0.5, v * 0.64, v * 0.78].map((x, i) => ({
        x,
        y: v * 0.57 + (i % 2) * v * 0.04,
      }));
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.36}
            rx={v * 0.34}
            ry={v * 0.2}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.42}
            cy={v * 0.27}
            rx={v * 0.2}
            ry={v * 0.19}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.62}
            cy={v * 0.26}
            rx={v * 0.16}
            ry={v * 0.15}
            fill={color}
            opacity={0.95}
          />
          {drops.map((d, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
            <g key={i} transform={`rotate(-14 ${d.x} ${d.y + v * 0.1})`}>
              <path
                d={`M${d.x},${d.y} Q${d.x - v * 0.035},${d.y + v * 0.13} ${d.x},${d.y + v * 0.165} Q${d.x + v * 0.035},${d.y + v * 0.13} ${d.x},${d.y}`}
                fill={accent}
                opacity={0.88 - (i % 2) * 0.12}
              />
            </g>
          ))}
        </svg>
      );
    }

    case 'snow': {
      // Cloud + three six-pointed snow stars
      const stars = [v * 0.3, v * 0.5, v * 0.7];
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.38}
            rx={v * 0.3}
            ry={v * 0.18}
            fill={color}
            opacity={0.82}
          />
          <ellipse
            cx={v * 0.44}
            cy={v * 0.3}
            rx={v * 0.18}
            ry={v * 0.17}
            fill={color}
            opacity={0.82}
          />
          <ellipse
            cx={v * 0.6}
            cy={v * 0.29}
            rx={v * 0.14}
            ry={v * 0.14}
            fill={color}
            opacity={0.82}
          />
          {stars.map((cx, i) => {
            const cy = v * 0.7 + (i % 2) * (-v * 0.04);
            const r = v * 0.065;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              <g key={i}>
                {[0, 60, 120].map((a) => {
                  const R = Math.PI / 180;
                  return (
                    <line
                      key={a}
                      x1={cx - r * Math.cos(a * R)}
                      y1={cy - r * Math.sin(a * R)}
                      x2={cx + r * Math.cos(a * R)}
                      y2={cy + r * Math.sin(a * R)}
                      stroke={color}
                      strokeWidth={v * 0.075}
                      strokeLinecap="round"
                      opacity={0.88 - i * 0.06}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      );
    }

    case 'heavy-snow': {
      // Low dark cloud + five snowflakes filling lower half
      const stars = [v * 0.2, v * 0.38, v * 0.56, v * 0.74, v * 0.46].map((x, i) => ({
        x,
        y: v * (0.6 + (i % 3) * 0.08),
      }));
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.34}
            rx={v * 0.36}
            ry={v * 0.22}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.42}
            cy={v * 0.24}
            rx={v * 0.22}
            ry={v * 0.2}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.64}
            cy={v * 0.23}
            rx={v * 0.17}
            ry={v * 0.16}
            fill={color}
            opacity={0.95}
          />
          {stars.slice(0, 4).map((d, i) => {
            const r = v * 0.06;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              <g key={i}>
                {[0, 60, 120].map((a) => {
                  const R = Math.PI / 180;
                  return (
                    <line
                      key={a}
                      x1={d.x - r * Math.cos(a * R)}
                      y1={d.y - r * Math.sin(a * R)}
                      x2={d.x + r * Math.cos(a * R)}
                      y2={d.y + r * Math.sin(a * R)}
                      stroke={accent}
                      strokeWidth={v * 0.07}
                      strokeLinecap="round"
                      opacity={0.85}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      );
    }

    case 'thunder': {
      // Dark low cloud + a single fat bolt — high contrast
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <defs>
            <filter id="fw-bolt-glow">
              <feGaussianBlur stdDeviation="1.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <ellipse
            cx={v * 0.5}
            cy={v * 0.34}
            rx={v * 0.36}
            ry={v * 0.21}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.42}
            cy={v * 0.24}
            rx={v * 0.22}
            ry={v * 0.2}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.63}
            cy={v * 0.23}
            rx={v * 0.17}
            ry={v * 0.16}
            fill={color}
            opacity={0.95}
          />
          {/* bolt */}
          <path
            d={`M${v * 0.56},${v * 0.48} L${v * 0.43},${v * 0.65} L${v * 0.52},${v * 0.65} L${v * 0.4},${v * 0.88} L${v * 0.62},${v * 0.62} L${v * 0.53},${v * 0.62} Z`}
            fill={accent}
            filter="url(#fw-bolt-glow)"
          />
        </svg>
      );
    }

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MERIDIAN GLYPHS — hairline strokes, no fill, geometric purity
// ─────────────────────────────────────────────────────────────────────────────

function MeridianGlyph({
  cat,
  color,
  accent,
  s,
  night,
}: { cat: WeatherCategory; color: string; accent: string; s: number; night: boolean }) {
  const v = s;
  const sw = v * 0.06; // primary stroke width (hairline)
  const sw2 = v * 0.045; // secondary

  switch (cat) {
    case 'clear':
      if (night) return <MeridianCrescent color={color} s={s} />;
      // Stroke-only sun: open circle + minimal rays
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <circle cx={v / 2} cy={v / 2} r={v * 0.2} stroke={color} strokeWidth={sw} />
          {[0, 60, 120, 180, 240, 300].map((a) => {
            const R = Math.PI / 180;
            const i = v / 2 + v * 0.28 * Math.cos(a * R);
            const j = v / 2 + v * 0.28 * Math.sin(a * R);
            const x = v / 2 + v * 0.4 * Math.cos(a * R);
            const y = v / 2 + v * 0.4 * Math.sin(a * R);
            return (
              <line
                key={a}
                x1={i}
                y1={j}
                x2={x}
                y2={y}
                stroke={color}
                strokeWidth={sw2}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      );

    case 'partly-cloudy':
      if (night) return <MeridianMoonCloud color={color} accent={accent} s={s} />;
      // Minimal arc over a hairline cloud outline
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <circle
            cx={v * 0.36}
            cy={v * 0.38}
            r={v * 0.16}
            stroke={accent}
            strokeWidth={sw2}
            fill="none"
            opacity={0.75}
          />
          <line
            x1={v * 0.36}
            y1={v * 0.18}
            x2={v * 0.36}
            y2={v * 0.12}
            stroke={accent}
            strokeWidth={sw2}
            strokeLinecap="round"
            opacity={0.6}
          />
          <line
            x1={v * 0.2}
            y1={v * 0.38}
            x2={v * 0.14}
            y2={v * 0.38}
            stroke={accent}
            strokeWidth={sw2}
            strokeLinecap="round"
            opacity={0.6}
          />
          <line
            x1={v * 0.52}
            y1={v * 0.38}
            x2={v * 0.58}
            y2={v * 0.38}
            stroke={accent}
            strokeWidth={sw2}
            strokeLinecap="round"
            opacity={0.6}
          />
          <path
            d={`M${v * 0.32},${v * 0.68} Q${v * 0.22},${v * 0.68} ${v * 0.22},${v * 0.58} Q${v * 0.22},${v * 0.5} ${v * 0.34},${v * 0.49} Q${v * 0.36},${v * 0.42} ${v * 0.48},${v * 0.44} Q${v * 0.6},${v * 0.42} ${v * 0.64},${v * 0.5} Q${v * 0.76},${v * 0.5} ${v * 0.76},${v * 0.58} Q${v * 0.76},${v * 0.68} ${v * 0.66},${v * 0.68} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'overcast':
      // Two overlapping hairline cloud outlines
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.26},${v * 0.56} Q${v * 0.16},${v * 0.56} ${v * 0.16},${v * 0.46} Q${v * 0.16},${v * 0.38} ${v * 0.28},${v * 0.37} Q${v * 0.3},${v * 0.3} ${v * 0.42},${v * 0.32} Q${v * 0.54},${v * 0.3} ${v * 0.58},${v * 0.38} Q${v * 0.7},${v * 0.38} ${v * 0.7},${v * 0.46} Q${v * 0.7},${v * 0.56} ${v * 0.6},${v * 0.56} Z`}
            stroke={color}
            strokeWidth={sw2}
            fill="none"
            strokeLinejoin="round"
            opacity={0.5}
          />
          <path
            d={`M${v * 0.34},${v * 0.72} Q${v * 0.22},${v * 0.72} ${v * 0.22},${v * 0.62} Q${v * 0.22},${v * 0.53} ${v * 0.36},${v * 0.52} Q${v * 0.38},${v * 0.44} ${v * 0.5},${v * 0.46} Q${v * 0.64},${v * 0.44} ${v * 0.68},${v * 0.52} Q${v * 0.8},${v * 0.52} ${v * 0.8},${v * 0.62} Q${v * 0.8},${v * 0.72} ${v * 0.7},${v * 0.72} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'fog':
      // Three precise horizontal lines, clean butt caps
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <line
            x1={v * 0.2}
            y1={v * 0.32}
            x2={v * 0.8}
            y2={v * 0.32}
            stroke={color}
            strokeWidth={sw}
            opacity={0.5}
          />
          <line
            x1={v * 0.14}
            y1={v * 0.5}
            x2={v * 0.86}
            y2={v * 0.5}
            stroke={color}
            strokeWidth={sw}
            opacity={0.72}
          />
          <line
            x1={v * 0.2}
            y1={v * 0.68}
            x2={v * 0.8}
            y2={v * 0.68}
            stroke={color}
            strokeWidth={sw}
            opacity={0.4}
          />
        </svg>
      );

    case 'drizzle':
      // Cloud arc + two very short diagonal slashes
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.3},${v * 0.56} Q${v * 0.2},${v * 0.56} ${v * 0.2},${v * 0.46} Q${v * 0.2},${v * 0.38} ${v * 0.32},${v * 0.37} Q${v * 0.34},${v * 0.28} ${v * 0.48},${v * 0.3} Q${v * 0.62},${v * 0.28} ${v * 0.66},${v * 0.38} Q${v * 0.8},${v * 0.38} ${v * 0.8},${v * 0.46} Q${v * 0.8},${v * 0.56} ${v * 0.68},${v * 0.56} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
          {[v * 0.36, v * 0.56].map((x, i) => (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x1={x}
              y1={v * 0.64}
              x2={x - v * 0.04}
              y2={v * 0.76}
              stroke={accent}
              strokeWidth={sw2}
              strokeLinecap="round"
              opacity={0.72 + i * 0.1}
            />
          ))}
        </svg>
      );

    case 'rain':
      // Cloud + three diagonal slashes, perfectly even spacing
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.28},${v * 0.5} Q${v * 0.18},${v * 0.5} ${v * 0.18},${v * 0.4} Q${v * 0.18},${v * 0.32} ${v * 0.3},${v * 0.31} Q${v * 0.32},${v * 0.22} ${v * 0.46},${v * 0.24} Q${v * 0.6},${v * 0.22} ${v * 0.64},${v * 0.31} Q${v * 0.78},${v * 0.31} ${v * 0.78},${v * 0.4} Q${v * 0.78},${v * 0.5} ${v * 0.68},${v * 0.5} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
          {[v * 0.28, v * 0.48, v * 0.68].map((x, i) => (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x1={x}
              y1={v * 0.6}
              x2={x - v * 0.055}
              y2={v * 0.78}
              stroke={accent}
              strokeWidth={sw}
              strokeLinecap="round"
              opacity={0.8 - i * 0.08}
            />
          ))}
        </svg>
      );

    case 'heavy-rain':
      // Heavier cloud outline + five lines + steeper angle
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.22},${v * 0.46} Q${v * 0.12},${v * 0.46} ${v * 0.12},${v * 0.36} Q${v * 0.12},${v * 0.26} ${v * 0.26},${v * 0.25} Q${v * 0.28},${v * 0.15} ${v * 0.44},${v * 0.17} Q${v * 0.6},${v * 0.15} ${v * 0.65},${v * 0.25} Q${v * 0.82},${v * 0.25} ${v * 0.84},${v * 0.36} Q${v * 0.84},${v * 0.46} ${v * 0.72},${v * 0.46} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
          {[v * 0.18, v * 0.33, v * 0.5, v * 0.66, v * 0.8].map((x, i) => (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x1={x}
              y1={v * 0.56}
              x2={x - v * 0.07}
              y2={v * 0.78}
              stroke={accent}
              strokeWidth={sw}
              strokeLinecap="round"
              opacity={0.85 - (i % 2) * 0.1}
            />
          ))}
        </svg>
      );

    case 'snow':
      // Cloud + three open asterisks (6-point, stroke only)
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.3},${v * 0.5} Q${v * 0.2},${v * 0.5} ${v * 0.2},${v * 0.4} Q${v * 0.2},${v * 0.32} ${v * 0.32},${v * 0.31} Q${v * 0.34},${v * 0.22} ${v * 0.48},${v * 0.24} Q${v * 0.62},${v * 0.22} ${v * 0.66},${v * 0.31} Q${v * 0.8},${v * 0.31} ${v * 0.8},${v * 0.4} Q${v * 0.8},${v * 0.5} ${v * 0.7},${v * 0.5} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
          {[v * 0.3, v * 0.5, v * 0.7].map((cx, i) => {
            const cy = v * 0.7 + (i % 2 ? -v * 0.03 : 0);
            const r = v * 0.075;
            return [0, 60, 120].map((a) => {
              const R = Math.PI / 180;
              return (
                <line
                  key={`${i}-${a}`}
                  x1={cx - r * Math.cos(a * R)}
                  y1={cy - r * Math.sin(a * R)}
                  x2={cx + r * Math.cos(a * R)}
                  y2={cy + r * Math.sin(a * R)}
                  stroke={accent}
                  strokeWidth={sw2}
                  strokeLinecap="round"
                  opacity={0.82 - i * 0.06}
                />
              );
            });
          })}
        </svg>
      );

    case 'heavy-snow':
      // Dense cloud outline + four asterisks
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.24},${v * 0.44} Q${v * 0.14},${v * 0.44} ${v * 0.14},${v * 0.34} Q${v * 0.14},${v * 0.24} ${v * 0.28},${v * 0.23} Q${v * 0.3},${v * 0.13} ${v * 0.46},${v * 0.15} Q${v * 0.62},${v * 0.13} ${v * 0.67},${v * 0.23} Q${v * 0.84},${v * 0.23} ${v * 0.84},${v * 0.34} Q${v * 0.84},${v * 0.44} ${v * 0.72},${v * 0.44} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
          {[v * 0.22, v * 0.42, v * 0.62, v * 0.8].map((cx, i) => {
            const cy = v * (0.62 + (i % 2) * 0.12);
            const r = v * 0.065;
            return [0, 60, 120].map((a) => {
              const R = Math.PI / 180;
              return (
                <line
                  key={`${i}-${a}`}
                  x1={cx - r * Math.cos(a * R)}
                  y1={cy - r * Math.sin(a * R)}
                  x2={cx + r * Math.cos(a * R)}
                  y2={cy + r * Math.sin(a * R)}
                  stroke={accent}
                  strokeWidth={sw2}
                  strokeLinecap="round"
                  opacity={0.8}
                />
              );
            });
          })}
        </svg>
      );

    case 'thunder':
      // Hairline cloud + single thin stroked bolt
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.26},${v * 0.48} Q${v * 0.16},${v * 0.48} ${v * 0.16},${v * 0.38} Q${v * 0.16},${v * 0.28} ${v * 0.3},${v * 0.27} Q${v * 0.32},${v * 0.17} ${v * 0.46},${v * 0.19} Q${v * 0.62},${v * 0.17} ${v * 0.66},${v * 0.27} Q${v * 0.82},${v * 0.27} ${v * 0.82},${v * 0.38} Q${v * 0.82},${v * 0.48} ${v * 0.7},${v * 0.48} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
          {/* bolt — stroked not filled, Meridian's mark */}
          <path
            d={`M${v * 0.56},${v * 0.52} L${v * 0.44},${v * 0.68} L${v * 0.52},${v * 0.68} L${v * 0.4},${v * 0.88} L${v * 0.62},${v * 0.65} L${v * 0.53},${v * 0.65} Z`}
            stroke={accent}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MINERAL GLYPHS — hard faceted polygons, crystal language
// ─────────────────────────────────────────────────────────────────────────────

function MineralGlyph({
  cat,
  color,
  accent,
  s,
  night,
}: { cat: WeatherCategory; color: string; accent: string; s: number; night: boolean }) {
  const v = s;
  const sw = v * 0.055;

  switch (cat) {
    case 'clear': {
      if (night) return <MineralCrescent color={color} accent={accent} s={s} />;
      // Diamond hexagon sun with facet catchlight
      const cx = v / 2;
      const cy = v / 2;
      const r = v * 0.24;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = ((i * 60 - 30) * Math.PI) / 180;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      }).join(' ');
      const inner = Array.from({ length: 6 }, (_, i) => {
        const a = ((i * 60 - 30) * Math.PI) / 180;
        return `${cx + r * 0.55 * Math.cos(a)},${cy + r * 0.55 * Math.sin(a)}`;
      }).join(' ');
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <polygon
            points={pts}
            fill={color}
            stroke={accent}
            strokeWidth={sw * 0.6}
            strokeLinejoin="round"
          />
          <polygon points={inner} fill={accent} opacity={0.3} />
          {/* catchlight — top-left facet */}
          <polygon
            points={`${cx},${cy - r} ${cx + r * 0.55 * Math.cos((-30 * Math.PI) / 180)},${cy + r * 0.55 * Math.sin((-30 * Math.PI) / 180)} ${cx + r * Math.cos(0)},${cy + r * Math.sin(0)}`}
            fill="rgba(255,255,255,0.32)"
          />
        </svg>
      );
    }

    case 'partly-cloudy': {
      if (night) {
        // Faceted moon crescent (top-left) + angular cloud slab (bottom-right)
        const bx = v * 0.52;
        const by = v * 0.52;
        return (
          <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
            {/* faceted crescent */}
            <polygon
              points={`${v * 0.22},${v * 0.12} ${v * 0.34},${v * 0.18} ${v * 0.36},${v * 0.3} ${v * 0.28},${v * 0.4} ${v * 0.16},${v * 0.34} ${v * 0.18},${v * 0.22}`}
              fill={accent}
              stroke={color}
              strokeWidth={sw * 0.5}
              strokeLinejoin="round"
              opacity={0.88}
            />
            <line
              x1={v * 0.22}
              y1={v * 0.12}
              x2={v * 0.32}
              y2={v * 0.18}
              stroke="rgba(255,255,255,0.40)"
              strokeWidth={sw * 0.6}
            />
            {/* angular cloud slab */}
            <path
              d={`M${bx - v * 0.28},${by + v * 0.22} L${bx - v * 0.32},${by} L${bx - v * 0.14},${by - v * 0.12} L${bx + v * 0.08},${by - v * 0.14} L${bx + v * 0.28},${by - v * 0.06} L${bx + v * 0.32},${by + v * 0.1} L${bx + v * 0.28},${by + v * 0.22} Z`}
              fill={color}
              stroke={accent}
              strokeWidth={sw * 0.5}
              strokeLinejoin="round"
              opacity={0.88}
            />
            <line
              x1={bx - v * 0.14}
              y1={by - v * 0.12}
              x2={bx + v * 0.08}
              y2={by - v * 0.14}
              stroke={accent}
              strokeWidth={sw}
              strokeLinecap="round"
              opacity={0.55}
            />
          </svg>
        );
      }
      // Small gem sun (top-left) + angular cloud slab (bottom-right)
      const bx = v * 0.52;
      const by = v * 0.52;
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {/* gem sun */}
          <polygon
            points={`${v * 0.28},${v * 0.18} ${v * 0.4},${v * 0.24} ${v * 0.4},${v * 0.36} ${v * 0.28},${v * 0.42} ${v * 0.16},${v * 0.36} ${v * 0.16},${v * 0.24}`}
            fill={accent}
            stroke={color}
            strokeWidth={sw * 0.5}
            strokeLinejoin="round"
            opacity={0.88}
          />
          <line
            x1={v * 0.22}
            y1={v * 0.18}
            x2={v * 0.34}
            y2={v * 0.24}
            stroke="rgba(255,255,255,0.40)"
            strokeWidth={sw * 0.6}
          />
          {/* angular cloud slab */}
          <path
            d={`M${bx - v * 0.28},${by + v * 0.22} L${bx - v * 0.32},${by} L${bx - v * 0.14},${by - v * 0.12} L${bx + v * 0.08},${by - v * 0.14} L${bx + v * 0.28},${by - v * 0.06} L${bx + v * 0.32},${by + v * 0.1} L${bx + v * 0.28},${by + v * 0.22} Z`}
            fill={color}
            stroke={accent}
            strokeWidth={sw * 0.5}
            strokeLinejoin="round"
            opacity={0.88}
          />
          <line
            x1={bx - v * 0.14}
            y1={by - v * 0.12}
            x2={bx + v * 0.08}
            y2={by - v * 0.14}
            stroke={accent}
            strokeWidth={sw}
            strokeLinecap="round"
            opacity={0.55}
          />
        </svg>
      );
    }

    case 'overcast': {
      // Two stacked angular slabs, gem-cut
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.12},${v * 0.48} L${v * 0.16},${v * 0.3} L${v * 0.34},${v * 0.22} L${v * 0.6},${v * 0.24} L${v * 0.76},${v * 0.3} L${v * 0.8},${v * 0.48} Z`}
            fill={color}
            stroke={accent}
            strokeWidth={sw * 0.5}
            strokeLinejoin="round"
            opacity={0.55}
          />
          <line
            x1={v * 0.34}
            y1={v * 0.22}
            x2={v * 0.6}
            y2={v * 0.24}
            stroke={accent}
            strokeWidth={sw * 0.8}
            strokeLinecap="round"
            opacity={0.3}
          />
          <path
            d={`M${v * 0.1},${v * 0.74} L${v * 0.14},${v * 0.54} L${v * 0.34},${v * 0.46} L${v * 0.62},${v * 0.48} L${v * 0.8},${v * 0.54} L${v * 0.84},${v * 0.74} Z`}
            fill={color}
            stroke={accent}
            strokeWidth={sw * 0.6}
            strokeLinejoin="round"
            opacity={0.9}
          />
          <line
            x1={v * 0.34}
            y1={v * 0.46}
            x2={v * 0.62}
            y2={v * 0.48}
            stroke={accent}
            strokeWidth={sw}
            strokeLinecap="round"
            opacity={0.55}
          />
        </svg>
      );
    }

    case 'fog': {
      // Three angular lines with tapered ends — like crystal layers
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.14},${v * 0.32} L${v * 0.18},${v * 0.28} L${v * 0.78},${v * 0.3} L${v * 0.82},${v * 0.34} L${v * 0.78},${v * 0.36} L${v * 0.14},${v * 0.34} Z`}
            fill={color}
            opacity={0.5}
          />
          <path
            d={`M${v * 0.1},${v * 0.5} L${v * 0.14},${v * 0.46} L${v * 0.84},${v * 0.48} L${v * 0.88},${v * 0.52} L${v * 0.84},${v * 0.54} L${v * 0.1},${v * 0.52} Z`}
            fill={color}
            opacity={0.75}
          />
          <path
            d={`M${v * 0.14},${v * 0.68} L${v * 0.18},${v * 0.64} L${v * 0.76},${v * 0.66} L${v * 0.8},${v * 0.7} L${v * 0.76},${v * 0.72} L${v * 0.14},${v * 0.7} Z`}
            fill={color}
            opacity={0.42}
          />
        </svg>
      );
    }

    case 'drizzle': {
      // Gem cloud slab + two angular teardrop shards
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.16},${v * 0.52} L${v * 0.2},${v * 0.34} L${v * 0.38},${v * 0.26} L${v * 0.6},${v * 0.28} L${v * 0.76},${v * 0.34} L${v * 0.8},${v * 0.52} Z`}
            fill={color}
            stroke={accent}
            strokeWidth={sw * 0.5}
            strokeLinejoin="round"
            opacity={0.85}
          />
          <line
            x1={v * 0.38}
            y1={v * 0.26}
            x2={v * 0.6}
            y2={v * 0.28}
            stroke={accent}
            strokeWidth={sw}
            strokeLinecap="round"
            opacity={0.5}
          />
          {[v * 0.36, v * 0.58].map((x, i) => (
            <path
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              d={`M${x},${v * 0.6} L${x - v * 0.04},${v * 0.72} L${x},${v * 0.76} L${x + v * 0.04},${v * 0.72} Z`}
              fill={accent}
              opacity={0.8 - i * 0.1}
            />
          ))}
        </svg>
      );
    }

    case 'rain': {
      // Angular cloud + three diamond shards
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.14},${v * 0.5} L${v * 0.18},${v * 0.32} L${v * 0.36},${v * 0.24} L${v * 0.6},${v * 0.26} L${v * 0.78},${v * 0.32} L${v * 0.82},${v * 0.5} Z`}
            fill={color}
            stroke={accent}
            strokeWidth={sw * 0.5}
            strokeLinejoin="round"
            opacity={0.88}
          />
          <line
            x1={v * 0.36}
            y1={v * 0.24}
            x2={v * 0.6}
            y2={v * 0.26}
            stroke={accent}
            strokeWidth={sw}
            strokeLinecap="round"
            opacity={0.55}
          />
          {[v * 0.26, v * 0.48, v * 0.7].map((x, i) => (
            <path
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              d={`M${x},${v * 0.58} L${x - v * 0.05},${v * 0.7} L${x},${v * 0.76} L${x + v * 0.05},${v * 0.7} Z`}
              fill={accent}
              opacity={0.85 - i * 0.07}
            />
          ))}
        </svg>
      );
    }

    case 'heavy-rain': {
      // Heavy angular cloud + five shards, steeper
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.1},${v * 0.46} L${v * 0.14},${v * 0.26} L${v * 0.34},${v * 0.18} L${v * 0.6},${v * 0.2} L${v * 0.78},${v * 0.26} L${v * 0.86},${v * 0.46} Z`}
            fill={color}
            stroke={accent}
            strokeWidth={sw * 0.6}
            strokeLinejoin="round"
            opacity={0.95}
          />
          <line
            x1={v * 0.34}
            y1={v * 0.18}
            x2={v * 0.6}
            y2={v * 0.2}
            stroke={accent}
            strokeWidth={sw * 1.2}
            strokeLinecap="round"
            opacity={0.6}
          />
          {[v * 0.16, v * 0.32, v * 0.5, v * 0.68, v * 0.82].map((x, i) => (
            <path
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              d={`M${x - v * 0.04},${v * 0.52} L${x - v * 0.1},${v * 0.68} L${x - v * 0.06},${v * 0.76} L${x},${v * 0.68} Z`}
              fill={accent}
              opacity={0.88 - (i % 2) * 0.1}
            />
          ))}
        </svg>
      );
    }

    case 'snow': {
      // Angular cloud + three crystal hexagonal stars
      const stars = [v * 0.28, v * 0.5, v * 0.72].map((cx, i) => ({
        cx,
        cy: v * 0.72 + (i % 2 ? -v * 0.04 : 0),
      }));
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.18},${v * 0.5} L${v * 0.22},${v * 0.32} L${v * 0.4},${v * 0.24} L${v * 0.62},${v * 0.26} L${v * 0.8},${v * 0.32} L${v * 0.82},${v * 0.5} Z`}
            fill={color}
            stroke={accent}
            strokeWidth={sw * 0.5}
            strokeLinejoin="round"
            opacity={0.82}
          />
          <line
            x1={v * 0.4}
            y1={v * 0.24}
            x2={v * 0.62}
            y2={v * 0.26}
            stroke={accent}
            strokeWidth={sw}
            strokeLinecap="round"
            opacity={0.5}
          />
          {stars.map((d, i) => {
            const r = v * 0.075;
            const pts = Array.from({ length: 6 }, (_, k) => {
              const a = (k * 60 * Math.PI) / 180;
              return `${d.cx + r * Math.cos(a)},${d.cy + r * Math.sin(a)}`;
            }).join(' ');
            return (
              <polygon
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
                key={i}
                points={pts}
                fill="none"
                stroke={accent}
                strokeWidth={sw * 0.8}
                strokeLinejoin="round"
                opacity={0.85 - i * 0.08}
              />
            );
          })}
        </svg>
      );
    }

    case 'heavy-snow': {
      // Dense angular cloud + four gem snowflakes
      const stars = [v * 0.18, v * 0.4, v * 0.62, v * 0.8].map((cx, i) => ({
        cx,
        cy: v * (0.64 + (i % 2) * 0.1),
      }));
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.1},${v * 0.44} L${v * 0.14},${v * 0.24} L${v * 0.34},${v * 0.16} L${v * 0.62},${v * 0.18} L${v * 0.8},${v * 0.24} L${v * 0.88},${v * 0.44} Z`}
            fill={color}
            stroke={accent}
            strokeWidth={sw * 0.6}
            strokeLinejoin="round"
            opacity={0.95}
          />
          <line
            x1={v * 0.34}
            y1={v * 0.16}
            x2={v * 0.62}
            y2={v * 0.18}
            stroke={accent}
            strokeWidth={sw * 1.1}
            strokeLinecap="round"
            opacity={0.6}
          />
          {stars.map((d, i) => {
            const r = v * 0.068;
            const pts = Array.from({ length: 6 }, (_, k) => {
              const a = (k * 60 * Math.PI) / 180;
              return `${d.cx + r * Math.cos(a)},${d.cy + r * Math.sin(a)}`;
            }).join(' ');
            return (
              <polygon
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
                key={i}
                points={pts}
                fill={accent}
                stroke={accent}
                strokeWidth={sw * 0.4}
                strokeLinejoin="round"
                opacity={0.8}
              />
            );
          })}
        </svg>
      );
    }

    case 'thunder': {
      // Faceted cloud slab + a bold polygonal bolt with catchlight
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <defs>
            <filter id="mw-glow">
              <feGaussianBlur stdDeviation="1.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={`M${v * 0.12},${v * 0.44} L${v * 0.16},${v * 0.26} L${v * 0.36},${v * 0.18} L${v * 0.62},${v * 0.2} L${v * 0.8},${v * 0.26} L${v * 0.86},${v * 0.44} Z`}
            fill={color}
            stroke={accent}
            strokeWidth={sw * 0.6}
            strokeLinejoin="round"
            opacity={0.95}
          />
          <line
            x1={v * 0.36}
            y1={v * 0.18}
            x2={v * 0.62}
            y2={v * 0.2}
            stroke={accent}
            strokeWidth={sw * 1.2}
            strokeLinecap="round"
            opacity={0.65}
          />
          {/* gem bolt — faceted polygon */}
          <path
            d={`M${v * 0.56},${v * 0.5} L${v * 0.42},${v * 0.68} L${v * 0.52},${v * 0.64} L${v * 0.38},${v * 0.88} L${v * 0.64},${v * 0.62} L${v * 0.54},${v * 0.66} Z`}
            fill={accent}
            filter="url(#mw-glow)"
          />
          {/* catchlight on bolt top facet */}
          <line
            x1={v * 0.56}
            y1={v * 0.5}
            x2={v * 0.48}
            y2={v * 0.58}
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={sw * 0.7}
            strokeLinecap="round"
          />
        </svg>
      );
    }

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AURORA GLYPHS — soft layered arcs, iridescent glow bands
// Clear = glowing orb with halo rings. Night = crescent with aurora arc.
// ─────────────────────────────────────────────────────────────────────────────

function AuroraGlyph({
  cat,
  color,
  accent,
  s,
  night,
}: { cat: WeatherCategory; color: string; accent: string; s: number; night: boolean }) {
  const v = s;
  const sw = v * 0.055;

  switch (cat) {
    case 'clear':
      if (night) {
        // Crescent + a soft arc aurora band behind it
        return (
          <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
            <path
              d={`M${v * 0.15},${v * 0.72} Q${v * 0.5},${v * 0.3} ${v * 0.85},${v * 0.72}`}
              stroke={accent}
              strokeWidth={sw * 0.8}
              fill="none"
              strokeLinecap="round"
              opacity={0.45}
            />
            <path
              d={`M${v * 0.2},${v * 0.78} Q${v * 0.5},${v * 0.4} ${v * 0.8},${v * 0.78}`}
              stroke={color}
              strokeWidth={sw * 0.6}
              fill="none"
              strokeLinecap="round"
              opacity={0.3}
            />
            <path
              d={`M${v * 0.5},${v * 0.16} A${v * 0.34},${v * 0.34} 0 1 1 ${v * 0.5},${v * 0.64} A${v * 0.22},${v * 0.22} 0 1 0 ${v * 0.5},${v * 0.16} Z`}
              fill={color}
              opacity={0.95}
            />
          </svg>
        );
      }
      // Warm orb with concentric halo rings
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <circle
            cx={v / 2}
            cy={v / 2}
            r={v * 0.38}
            stroke={accent}
            strokeWidth={sw * 0.5}
            opacity={0.2}
          />
          <circle
            cx={v / 2}
            cy={v / 2}
            r={v * 0.28}
            stroke={accent}
            strokeWidth={sw * 0.6}
            opacity={0.35}
          />
          <circle cx={v / 2} cy={v / 2} r={v * 0.19} fill={color} opacity={0.9} />
        </svg>
      );

    case 'partly-cloudy': {
      const moonOrSun = night ? (
        <path
          d={`M${v * 0.28},${v * 0.1} A${v * 0.2},${v * 0.2} 0 1 1 ${v * 0.28},${v * 0.44} A${v * 0.13},${v * 0.13} 0 1 0 ${v * 0.28},${v * 0.1} Z`}
          fill={accent}
          opacity={0.9}
        />
      ) : (
        <circle cx={v * 0.32} cy={v * 0.32} r={v * 0.16} fill={accent} opacity={0.88} />
      );
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {moonOrSun}
          {/* soft cloud — Aurora uses gentle filled blobs */}
          <ellipse
            cx={v * 0.6}
            cy={v * 0.66}
            rx={v * 0.28}
            ry={v * 0.16}
            fill={color}
            opacity={0.8}
          />
          <ellipse
            cx={v * 0.52}
            cy={v * 0.58}
            rx={v * 0.17}
            ry={v * 0.16}
            fill={color}
            opacity={0.8}
          />
          <ellipse
            cx={v * 0.67}
            cy={v * 0.57}
            rx={v * 0.13}
            ry={v * 0.13}
            fill={color}
            opacity={0.8}
          />
          {/* aurora shimmer arc above cloud */}
          <path
            d={`M${v * 0.36},${v * 0.52} Q${v * 0.6},${v * 0.38} ${v * 0.84},${v * 0.52}`}
            stroke={accent}
            strokeWidth={sw * 0.5}
            fill="none"
            strokeLinecap="round"
            opacity={0.3}
          />
        </svg>
      );
    }

    case 'overcast':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.56}
            rx={v * 0.35}
            ry={v * 0.22}
            fill={color}
            opacity={0.45}
          />
          <ellipse
            cx={v * 0.46}
            cy={v * 0.48}
            rx={v * 0.25}
            ry={v * 0.22}
            fill={color}
            opacity={0.6}
          />
          <ellipse
            cx={v * 0.62}
            cy={v * 0.46}
            rx={v * 0.2}
            ry={v * 0.19}
            fill={color}
            opacity={0.6}
          />
          <ellipse
            cx={v * 0.5}
            cy={v * 0.62}
            rx={v * 0.38}
            ry={v * 0.18}
            fill={color}
            opacity={0.85}
          />
          {/* aurora shimmer peeking through */}
          <path
            d={`M${v * 0.2},${v * 0.35} Q${v * 0.5},${v * 0.2} ${v * 0.8},${v * 0.35}`}
            stroke={accent}
            strokeWidth={sw * 0.5}
            fill="none"
            strokeLinecap="round"
            opacity={0.25}
          />
        </svg>
      );

    case 'fog':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {[
            { y: v * 0.32, w: v * 0.6, x: v * 0.2, o: 0.4 },
            { y: v * 0.5, w: v * 0.72, x: v * 0.14, o: 0.6 },
            { y: v * 0.68, w: v * 0.55, x: v * 0.22, o: 0.35 },
          ].map((b, i) => (
            <rect
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x={b.x}
              y={b.y - v * 0.045}
              width={b.w}
              height={v * 0.09}
              rx={v * 0.045}
              fill={color}
              opacity={b.o}
            />
          ))}
          <path
            d={`M${v * 0.14},${v * 0.5} Q${v * 0.5},${v * 0.3} ${v * 0.86},${v * 0.5}`}
            stroke={accent}
            strokeWidth={sw * 0.4}
            fill="none"
            opacity={0.2}
          />
        </svg>
      );

    case 'drizzle':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.42}
            rx={v * 0.3}
            ry={v * 0.18}
            fill={color}
            opacity={0.8}
          />
          <ellipse
            cx={v * 0.44}
            cy={v * 0.34}
            rx={v * 0.18}
            ry={v * 0.17}
            fill={color}
            opacity={0.8}
          />
          <ellipse
            cx={v * 0.6}
            cy={v * 0.33}
            rx={v * 0.14}
            ry={v * 0.14}
            fill={color}
            opacity={0.8}
          />
          {[v * 0.36, v * 0.56].map((x, i) => (
            <path
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              d={`M${x},${v * 0.6} Q${x - v * 0.025},${v * 0.72} ${x},${v * 0.74} Q${x + v * 0.025},${v * 0.72} ${x},${v * 0.6}`}
              fill={accent}
              opacity={0.7 - i * 0.1}
            />
          ))}
        </svg>
      );

    case 'rain': {
      const drops = [
        { x: v * 0.3, y: v * 0.6 },
        { x: v * 0.5, y: v * 0.58 },
        { x: v * 0.7, y: v * 0.6 },
      ];
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.4}
            rx={v * 0.3}
            ry={v * 0.18}
            fill={color}
            opacity={0.85}
          />
          <ellipse
            cx={v * 0.44}
            cy={v * 0.32}
            rx={v * 0.18}
            ry={v * 0.17}
            fill={color}
            opacity={0.85}
          />
          <ellipse
            cx={v * 0.6}
            cy={v * 0.31}
            rx={v * 0.14}
            ry={v * 0.14}
            fill={color}
            opacity={0.85}
          />
          {drops.map((d, i) => (
            <path
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              d={`M${d.x},${d.y} Q${d.x - v * 0.03},${d.y + v * 0.11} ${d.x},${d.y + v * 0.14} Q${d.x + v * 0.03},${d.y + v * 0.11} ${d.x},${d.y}`}
              fill={accent}
              opacity={0.8 - i * 0.06}
            />
          ))}
        </svg>
      );
    }

    case 'heavy-rain': {
      const drops = [v * 0.22, v * 0.36, v * 0.5, v * 0.64, v * 0.78].map((x, i) => ({
        x,
        y: v * 0.57 + (i % 2) * v * 0.04,
      }));
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.36}
            rx={v * 0.34}
            ry={v * 0.2}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.42}
            cy={v * 0.27}
            rx={v * 0.2}
            ry={v * 0.19}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.62}
            cy={v * 0.26}
            rx={v * 0.16}
            ry={v * 0.15}
            fill={color}
            opacity={0.95}
          />
          {drops.map((d, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
            <g key={i} transform={`rotate(-14 ${d.x} ${d.y + v * 0.1})`}>
              <path
                d={`M${d.x},${d.y} Q${d.x - v * 0.035},${d.y + v * 0.13} ${d.x},${d.y + v * 0.165} Q${d.x + v * 0.035},${d.y + v * 0.13} ${d.x},${d.y}`}
                fill={accent}
                opacity={0.85 - (i % 2) * 0.12}
              />
            </g>
          ))}
        </svg>
      );
    }

    case 'snow': {
      const stars = [v * 0.3, v * 0.5, v * 0.7];
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.38}
            rx={v * 0.3}
            ry={v * 0.18}
            fill={color}
            opacity={0.8}
          />
          <ellipse
            cx={v * 0.44}
            cy={v * 0.3}
            rx={v * 0.18}
            ry={v * 0.17}
            fill={color}
            opacity={0.8}
          />
          <ellipse
            cx={v * 0.6}
            cy={v * 0.29}
            rx={v * 0.14}
            ry={v * 0.14}
            fill={color}
            opacity={0.8}
          />
          {stars.map((cx, i) => {
            const cy = v * 0.7 + (i % 2) * (-v * 0.04);
            const r = v * 0.065;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              <g key={i}>
                {[0, 60, 120].map((a) => {
                  const R = Math.PI / 180;
                  return (
                    <line
                      key={a}
                      x1={cx - r * Math.cos(a * R)}
                      y1={cy - r * Math.sin(a * R)}
                      x2={cx + r * Math.cos(a * R)}
                      y2={cy + r * Math.sin(a * R)}
                      stroke={accent}
                      strokeWidth={v * 0.07}
                      strokeLinecap="round"
                      opacity={0.85 - i * 0.06}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      );
    }

    case 'heavy-snow': {
      const stars = [v * 0.2, v * 0.38, v * 0.56, v * 0.74].map((x, i) => ({
        x,
        y: v * (0.6 + (i % 3) * 0.08),
      }));
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.34}
            rx={v * 0.36}
            ry={v * 0.22}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.42}
            cy={v * 0.24}
            rx={v * 0.22}
            ry={v * 0.2}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.64}
            cy={v * 0.23}
            rx={v * 0.17}
            ry={v * 0.16}
            fill={color}
            opacity={0.95}
          />
          {stars.map((d, i) => {
            const r = v * 0.06;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              <g key={i}>
                {[0, 60, 120].map((a) => {
                  const R = Math.PI / 180;
                  return (
                    <line
                      key={a}
                      x1={d.x - r * Math.cos(a * R)}
                      y1={d.y - r * Math.sin(a * R)}
                      x2={d.x + r * Math.cos(a * R)}
                      y2={d.y + r * Math.sin(a * R)}
                      stroke={accent}
                      strokeWidth={v * 0.07}
                      strokeLinecap="round"
                      opacity={0.85}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      );
    }

    case 'thunder':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <defs>
            <filter id="au-glow">
              <feGaussianBlur stdDeviation="1.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <ellipse
            cx={v * 0.5}
            cy={v * 0.34}
            rx={v * 0.36}
            ry={v * 0.21}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.42}
            cy={v * 0.24}
            rx={v * 0.22}
            ry={v * 0.2}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.63}
            cy={v * 0.23}
            rx={v * 0.17}
            ry={v * 0.16}
            fill={color}
            opacity={0.95}
          />
          <path
            d={`M${v * 0.56},${v * 0.48} L${v * 0.43},${v * 0.65} L${v * 0.52},${v * 0.65} L${v * 0.4},${v * 0.88} L${v * 0.62},${v * 0.62} L${v * 0.53},${v * 0.62} Z`}
            fill={accent}
            filter="url(#au-glow)"
          />
        </svg>
      );

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PAPER GLYPHS — flat editorial ink marks. No gradient, no glow. Clean outlines.
// ─────────────────────────────────────────────────────────────────────────────

function PaperGlyph({
  cat,
  color,
  accent,
  s,
  night,
}: { cat: WeatherCategory; color: string; accent: string; s: number; night: boolean }) {
  const v = s;
  const sw = v * 0.07; // editorial stroke, slightly thicker than Meridian
  const sw2 = v * 0.05;

  switch (cat) {
    case 'clear':
      if (night) {
        // Simple filled ink crescent, no glow
        return (
          <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
            <path
              d={`M${v * 0.5},${v * 0.16} A${v * 0.34},${v * 0.34} 0 1 1 ${v * 0.5},${v * 0.84} A${v * 0.22},${v * 0.22} 0 1 0 ${v * 0.5},${v * 0.16} Z`}
              fill={color}
            />
          </svg>
        );
      }
      // Flat ink circle + rays, filled disc — like a woodcut sun
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <circle cx={v / 2} cy={v / 2} r={v * 0.2} fill={color} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const R = Math.PI / 180;
            const i = v / 2 + v * 0.28 * Math.cos(a * R);
            const j = v / 2 + v * 0.28 * Math.sin(a * R);
            const x = v / 2 + v * 0.42 * Math.cos(a * R);
            const y = v / 2 + v * 0.42 * Math.sin(a * R);
            return (
              <line
                key={a}
                x1={i}
                y1={j}
                x2={x}
                y2={y}
                stroke={color}
                strokeWidth={sw2}
                strokeLinecap="square"
              />
            );
          })}
        </svg>
      );

    case 'partly-cloudy': {
      const symbol = night ? (
        <path
          d={`M${v * 0.3},${v * 0.14} A${v * 0.2},${v * 0.2} 0 1 1 ${v * 0.3},${v * 0.46} A${v * 0.12},${v * 0.12} 0 1 0 ${v * 0.3},${v * 0.14} Z`}
          fill={color}
        />
      ) : (
        <>
          <circle cx={v * 0.32} cy={v * 0.32} r={v * 0.15} fill={accent} />
          {[0, 60, 120, 180, 240, 300].map((a) => {
            const R = Math.PI / 180;
            return (
              <line
                key={a}
                x1={v * 0.32 + v * 0.2 * Math.cos(a * R)}
                y1={v * 0.32 + v * 0.2 * Math.sin(a * R)}
                x2={v * 0.32 + v * 0.3 * Math.cos(a * R)}
                y2={v * 0.32 + v * 0.3 * Math.sin(a * R)}
                stroke={accent}
                strokeWidth={sw2}
                strokeLinecap="square"
              />
            );
          })}
        </>
      );
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {symbol}
          <path
            d={`M${v * 0.3},${v * 0.72} Q${v * 0.2},${v * 0.72} ${v * 0.2},${v * 0.62} Q${v * 0.2},${v * 0.53} ${v * 0.32},${v * 0.52} Q${v * 0.34},${v * 0.44} ${v * 0.48},${v * 0.46} Q${v * 0.62},${v * 0.44} ${v * 0.66},${v * 0.52} Q${v * 0.78},${v * 0.52} ${v * 0.78},${v * 0.62} Q${v * 0.78},${v * 0.72} ${v * 0.68},${v * 0.72} Z`}
            fill={color}
          />
        </svg>
      );
    }

    case 'overcast':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.26},${v * 0.56} Q${v * 0.16},${v * 0.56} ${v * 0.16},${v * 0.46} Q${v * 0.16},${v * 0.37} ${v * 0.28},${v * 0.36} Q${v * 0.3},${v * 0.28} ${v * 0.44},${v * 0.3} Q${v * 0.58},${v * 0.28} ${v * 0.62},${v * 0.36} Q${v * 0.76},${v * 0.36} ${v * 0.76},${v * 0.46} Q${v * 0.76},${v * 0.56} ${v * 0.66},${v * 0.56} Z`}
            fill={color}
            opacity={0.45}
          />
          <path
            d={`M${v * 0.32},${v * 0.72} Q${v * 0.2},${v * 0.72} ${v * 0.2},${v * 0.62} Q${v * 0.2},${v * 0.53} ${v * 0.34},${v * 0.52} Q${v * 0.36},${v * 0.44} ${v * 0.5},${v * 0.46} Q${v * 0.64},${v * 0.44} ${v * 0.68},${v * 0.52} Q${v * 0.8},${v * 0.52} ${v * 0.8},${v * 0.62} Q${v * 0.8},${v * 0.72} ${v * 0.7},${v * 0.72} Z`}
            fill={color}
          />
        </svg>
      );

    case 'fog':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <line
            x1={v * 0.14}
            y1={v * 0.32}
            x2={v * 0.86}
            y2={v * 0.32}
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="square"
            opacity={0.45}
          />
          <line
            x1={v * 0.1}
            y1={v * 0.5}
            x2={v * 0.9}
            y2={v * 0.5}
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="square"
            opacity={0.7}
          />
          <line
            x1={v * 0.14}
            y1={v * 0.68}
            x2={v * 0.86}
            y2={v * 0.68}
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="square"
            opacity={0.38}
          />
        </svg>
      );

    case 'drizzle':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.28},${v * 0.54} Q${v * 0.18},${v * 0.54} ${v * 0.18},${v * 0.44} Q${v * 0.18},${v * 0.36} ${v * 0.3},${v * 0.35} Q${v * 0.32},${v * 0.26} ${v * 0.48},${v * 0.28} Q${v * 0.64},${v * 0.26} ${v * 0.68},${v * 0.35} Q${v * 0.82},${v * 0.35} ${v * 0.82},${v * 0.44} Q${v * 0.82},${v * 0.54} ${v * 0.7},${v * 0.54} Z`}
            fill={color}
          />
          {[v * 0.34, v * 0.54].map((x, i) => (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x1={x}
              y1={v * 0.62}
              x2={x - v * 0.04}
              y2={v * 0.76}
              stroke={accent}
              strokeWidth={sw2}
              strokeLinecap="square"
              opacity={0.75}
            />
          ))}
        </svg>
      );

    case 'rain':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.28},${v * 0.5} Q${v * 0.18},${v * 0.5} ${v * 0.18},${v * 0.4} Q${v * 0.18},${v * 0.32} ${v * 0.3},${v * 0.31} Q${v * 0.32},${v * 0.22} ${v * 0.46},${v * 0.24} Q${v * 0.6},${v * 0.22} ${v * 0.64},${v * 0.31} Q${v * 0.78},${v * 0.31} ${v * 0.78},${v * 0.4} Q${v * 0.78},${v * 0.5} ${v * 0.68},${v * 0.5} Z`}
            fill={color}
          />
          {[v * 0.26, v * 0.46, v * 0.66].map((x, i) => (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x1={x}
              y1={v * 0.6}
              x2={x - v * 0.055}
              y2={v * 0.78}
              stroke={accent}
              strokeWidth={sw}
              strokeLinecap="square"
              opacity={0.8 - i * 0.08}
            />
          ))}
        </svg>
      );

    case 'heavy-rain':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.22},${v * 0.46} Q${v * 0.12},${v * 0.46} ${v * 0.12},${v * 0.36} Q${v * 0.12},${v * 0.26} ${v * 0.26},${v * 0.25} Q${v * 0.28},${v * 0.15} ${v * 0.44},${v * 0.17} Q${v * 0.6},${v * 0.15} ${v * 0.65},${v * 0.25} Q${v * 0.82},${v * 0.25} ${v * 0.84},${v * 0.36} Q${v * 0.84},${v * 0.46} ${v * 0.72},${v * 0.46} Z`}
            fill={color}
          />
          {[v * 0.18, v * 0.33, v * 0.5, v * 0.66, v * 0.8].map((x, i) => (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x1={x}
              y1={v * 0.56}
              x2={x - v * 0.07}
              y2={v * 0.78}
              stroke={accent}
              strokeWidth={sw}
              strokeLinecap="square"
              opacity={0.85 - (i % 2) * 0.1}
            />
          ))}
        </svg>
      );

    case 'snow': {
      const stars = [v * 0.3, v * 0.5, v * 0.7];
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.28},${v * 0.5} Q${v * 0.18},${v * 0.5} ${v * 0.18},${v * 0.4} Q${v * 0.18},${v * 0.32} ${v * 0.3},${v * 0.31} Q${v * 0.32},${v * 0.22} ${v * 0.46},${v * 0.24} Q${v * 0.6},${v * 0.22} ${v * 0.64},${v * 0.31} Q${v * 0.78},${v * 0.31} ${v * 0.78},${v * 0.4} Q${v * 0.78},${v * 0.5} ${v * 0.68},${v * 0.5} Z`}
            fill={color}
          />
          {stars.map((cx, i) => {
            const cy = v * 0.7 + (i % 2) * (-v * 0.04);
            const r = v * 0.065;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              <g key={i}>
                {[0, 60, 120].map((a) => {
                  const R = Math.PI / 180;
                  return (
                    <line
                      key={a}
                      x1={cx - r * Math.cos(a * R)}
                      y1={cy - r * Math.sin(a * R)}
                      x2={cx + r * Math.cos(a * R)}
                      y2={cy + r * Math.sin(a * R)}
                      stroke={accent}
                      strokeWidth={sw}
                      strokeLinecap="square"
                      opacity={0.85 - i * 0.06}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      );
    }

    case 'heavy-snow': {
      const stars = [v * 0.2, v * 0.38, v * 0.56, v * 0.74].map((x, i) => ({
        x,
        y: v * (0.6 + (i % 3) * 0.08),
      }));
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.12},${v * 0.44} L${v * 0.16},${v * 0.24} L${v * 0.36},${v * 0.16} L${v * 0.62},${v * 0.18} L${v * 0.8},${v * 0.24} L${v * 0.86},${v * 0.44} Q${v * 0.86},${v * 0.52} ${v * 0.7},${v * 0.52} Q${v * 0.7},${v * 0.58} ${v * 0.5},${v * 0.58} Q${v * 0.5},${v * 0.52} ${v * 0.3},${v * 0.52} Q${v * 0.14},${v * 0.52} ${v * 0.12},${v * 0.44} Z`}
            fill={color}
          />
          {stars.map((d, i) => {
            const r = v * 0.06;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              <g key={i}>
                {[0, 60, 120].map((a) => {
                  const R = Math.PI / 180;
                  return (
                    <line
                      key={a}
                      x1={d.x - r * Math.cos(a * R)}
                      y1={d.y - r * Math.sin(a * R)}
                      x2={d.x + r * Math.cos(a * R)}
                      y2={d.y + r * Math.sin(a * R)}
                      stroke={accent}
                      strokeWidth={sw}
                      strokeLinecap="square"
                      opacity={0.8}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      );
    }

    case 'thunder':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.22},${v * 0.46} Q${v * 0.12},${v * 0.46} ${v * 0.12},${v * 0.36} Q${v * 0.12},${v * 0.26} ${v * 0.26},${v * 0.25} Q${v * 0.28},${v * 0.15} ${v * 0.44},${v * 0.17} Q${v * 0.6},${v * 0.15} ${v * 0.65},${v * 0.25} Q${v * 0.82},${v * 0.25} ${v * 0.84},${v * 0.36} Q${v * 0.84},${v * 0.46} ${v * 0.72},${v * 0.46} Z`}
            fill={color}
          />
          {/* flat ink bolt — paper has no glow */}
          <path
            d={`M${v * 0.56},${v * 0.5} L${v * 0.43},${v * 0.67} L${v * 0.52},${v * 0.67} L${v * 0.4},${v * 0.88} L${v * 0.62},${v * 0.64} L${v * 0.53},${v * 0.64} Z`}
            fill={accent}
          />
        </svg>
      );

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL GLYPHS — pixel/blocky, lo-fi chunky geometry, square corners
// ─────────────────────────────────────────────────────────────────────────────

function SignalGlyph({
  cat,
  color,
  accent,
  s,
  night,
}: { cat: WeatherCategory; color: string; accent: string; s: number; night: boolean }) {
  const v = s;
  const u = v / 8; // pixel unit — everything snaps to this grid

  const px = (x: number, y: number, w: number, h: number, c: string, o = 1) => (
    <rect key={`${x}${y}`} x={x * u} y={y * u} width={w * u} height={h * u} fill={c} opacity={o} />
  );

  switch (cat) {
    case 'clear':
      if (night) {
        // Pixel crescent — filled L-shape approximation
        return (
          <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
            {px(2, 1, 4, 6, color)} {px(3, 1, 3, 1, color)} {px(3, 6, 3, 1, color)}
            {px(3, 2, 2, 4, 'transparent')} {/* inner cutout via overlay */}
            <rect x={3 * u} y={2 * u} width={2 * u} height={4 * u} fill="transparent" />
            {/* redraw cutout with background — pixel art trick: overdraw the inner part */}
            {px(3, 2, 3, 4, color, 0)} {/* placeholder — actual crescent via path */}
            <path
              d={`M${2 * u},${1 * u} h${4 * u} v${1 * u} h${1 * u} v${4 * u} h-${1 * u} v${1 * u} h-${4 * u} v-${1 * u} h${2 * u} v-${4 * u} h-${2 * u} Z`}
              fill={color}
            />
          </svg>
        );
      }
      // Pixel sun: square disc + 4 cardinal pixel rays
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {px(3, 3, 2, 2, color)} {/* core */}
          {px(3, 1, 2, 1, color)} {px(3, 6, 2, 1, color)} {/* top/bottom rays */}
          {px(1, 3, 1, 2, color)} {px(6, 3, 1, 2, color)} {/* side rays */}
          {px(2, 2, 1, 1, accent, 0.7)} {px(5, 2, 1, 1, accent, 0.7)} {/* diagonal hints */}
          {px(2, 5, 1, 1, accent, 0.7)} {px(5, 5, 1, 1, accent, 0.7)}
        </svg>
      );

    case 'partly-cloudy': {
      const sym = night ? (
        <>
          <rect x={1 * u} y={1 * u} width={3 * u} height={1 * u} fill={accent} />
          <rect x={1 * u} y={2 * u} width={1 * u} height={2 * u} fill={accent} />
          <rect x={1 * u} y={4 * u} width={3 * u} height={1 * u} fill={accent} />
        </>
      ) : (
        <>
          <rect x={1 * u} y={1 * u} width={2 * u} height={2 * u} fill={accent} />
          <rect x={2 * u} y={0} width={2 * u} height={1 * u} fill={accent} opacity={0.6} />
        </>
      );
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {sym}
          {/* pixel cloud */}
          {px(2, 5, 4, 1, color)} {px(1, 4, 2, 1, color)} {px(4, 4, 2, 1, color)}{' '}
          {px(2, 3, 4, 1, color, 0.7)}
        </svg>
      );
    }

    case 'overcast':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {px(2, 2, 4, 1, color, 0.5)} {px(1, 3, 2, 1, color, 0.5)} {px(4, 3, 2, 1, color, 0.5)}
          {px(2, 3, 4, 1, color, 0.5)}
          {px(1, 5, 6, 1, color)} {px(2, 4, 4, 1, color)} {px(1, 6, 6, 1, color, 0.85)}
        </svg>
      );

    case 'fog':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {px(1, 2, 6, 1, color, 0.45)} {px(0, 4, 8, 1, color, 0.7)} {px(1, 6, 6, 1, color, 0.35)}
        </svg>
      );

    case 'drizzle':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {px(1, 1, 6, 2, color)} {px(0, 2, 2, 1, color, 0.6)} {px(6, 2, 2, 1, color, 0.6)}
          {px(2, 4, 1, 2, accent, 0.8)} {px(5, 4, 1, 2, accent, 0.8)}
        </svg>
      );

    case 'rain':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {px(1, 1, 6, 2, color)} {px(0, 2, 2, 1, color, 0.6)} {px(6, 2, 2, 1, color, 0.6)}
          {px(1, 4, 1, 2, accent)} {px(3, 4, 1, 2, accent, 0.85)} {px(5, 4, 1, 2, accent, 0.7)}
        </svg>
      );

    case 'heavy-rain':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {px(0, 1, 8, 2, color)} {px(0, 2, 2, 1, color, 0.6)} {px(6, 2, 2, 1, color, 0.6)}
          {px(0, 4, 1, 3, accent)} {px(2, 4, 1, 3, accent, 0.9)} {px(4, 4, 1, 3, accent, 0.8)}{' '}
          {px(6, 4, 1, 3, accent, 0.7)}
        </svg>
      );

    case 'snow':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {px(1, 1, 6, 2, color)}
          {/* 3 pixel snowflakes */}
          {px(1, 4, 1, 1, accent)} {px(2, 5, 1, 1, accent)} {px(1, 6, 1, 1, accent)}
          {px(3, 4, 1, 1, accent, 0.85)} {px(4, 5, 1, 1, accent, 0.85)}{' '}
          {px(3, 6, 1, 1, accent, 0.85)}
          {px(5, 4, 1, 1, accent, 0.7)} {px(6, 5, 1, 1, accent, 0.7)} {px(5, 6, 1, 1, accent, 0.7)}
        </svg>
      );

    case 'heavy-snow':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {px(0, 1, 8, 2, color)}
          {px(0, 4, 1, 1, accent)} {px(1, 5, 1, 1, accent)} {px(0, 6, 1, 1, accent)}
          {px(2, 4, 1, 1, accent, 0.85)} {px(3, 5, 1, 1, accent, 0.85)}{' '}
          {px(2, 6, 1, 1, accent, 0.85)}
          {px(4, 4, 1, 1, accent, 0.75)} {px(5, 5, 1, 1, accent, 0.75)}{' '}
          {px(4, 6, 1, 1, accent, 0.75)}
          {px(6, 4, 1, 1, accent, 0.65)} {px(7, 5, 1, 1, accent, 0.65)}{' '}
          {px(6, 6, 1, 1, accent, 0.65)}
        </svg>
      );

    case 'thunder':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {px(0, 1, 8, 2, color)}
          {/* chunky pixel bolt */}
          {px(4, 3, 2, 1, accent)} {px(3, 4, 2, 1, accent)} {px(3, 5, 3, 1, accent)}{' '}
          {px(2, 6, 2, 1, accent)}
        </svg>
      );

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TIDE GLYPHS — fluid organic wave-influenced marks, curved soft paths
// ─────────────────────────────────────────────────────────────────────────────

function TideGlyph({
  cat,
  color,
  accent,
  s,
  night,
}: { cat: WeatherCategory; color: string; accent: string; s: number; night: boolean }) {
  const v = s;
  const sw = v * 0.06;

  switch (cat) {
    case 'clear':
      if (night) {
        // Crescent with a rippling water arc below
        return (
          <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
            <path
              d={`M${v * 0.5},${v * 0.14} A${v * 0.34},${v * 0.34} 0 1 1 ${v * 0.5},${v * 0.68} A${v * 0.22},${v * 0.22} 0 1 0 ${v * 0.5},${v * 0.14} Z`}
              fill={color}
              opacity={0.9}
            />
            <path
              d={`M${v * 0.1},${v * 0.82} Q${v * 0.3},${v * 0.74} ${v * 0.5},${v * 0.82} Q${v * 0.7},${v * 0.9} ${v * 0.9},${v * 0.82}`}
              stroke={accent}
              strokeWidth={sw * 0.7}
              fill="none"
              strokeLinecap="round"
              opacity={0.5}
            />
          </svg>
        );
      }
      // Sun disc with wave ring instead of rays
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <circle cx={v / 2} cy={v / 2} r={v * 0.2} fill={color} />
          <path
            d={`M${v * 0.14},${v * 0.5} Q${v * 0.25},${v * 0.38} ${v * 0.36},${v * 0.5} Q${v * 0.47},${v * 0.62} ${v * 0.58},${v * 0.5} Q${v * 0.69},${v * 0.38} ${v * 0.8},${v * 0.5} Q${v * 0.69},${v * 0.62} ${v * 0.58},${v * 0.5}`}
            stroke={accent}
            strokeWidth={sw * 0.6}
            fill="none"
            strokeLinecap="round"
            opacity={0.45}
          />
        </svg>
      );

    case 'partly-cloudy': {
      const sym = night ? (
        <path
          d={`M${v * 0.26},${v * 0.1} A${v * 0.2},${v * 0.2} 0 1 1 ${v * 0.26},${v * 0.44} A${v * 0.13},${v * 0.13} 0 1 0 ${v * 0.26},${v * 0.1} Z`}
          fill={accent}
          opacity={0.9}
        />
      ) : (
        <circle cx={v * 0.3} cy={v * 0.32} r={v * 0.16} fill={accent} opacity={0.88} />
      );
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {sym}
          {/* wave-influenced organic cloud */}
          <path
            d={`M${v * 0.28},${v * 0.72} Q${v * 0.14},${v * 0.72} ${v * 0.16},${v * 0.58} Q${v * 0.18},${v * 0.46} ${v * 0.32},${v * 0.48} Q${v * 0.36},${v * 0.38} ${v * 0.5},${v * 0.4} Q${v * 0.66},${v * 0.38} ${v * 0.7},${v * 0.5} Q${v * 0.84},${v * 0.5} ${v * 0.82},${v * 0.62} Q${v * 0.8},${v * 0.74} ${v * 0.66},${v * 0.72} Z`}
            fill={color}
            opacity={0.88}
          />
        </svg>
      );
    }

    case 'overcast':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.22},${v * 0.52} Q${v * 0.1},${v * 0.52} ${v * 0.12},${v * 0.4} Q${v * 0.14},${v * 0.28} ${v * 0.28},${v * 0.3} Q${v * 0.32},${v * 0.18} ${v * 0.48},${v * 0.2} Q${v * 0.64},${v * 0.18} ${v * 0.68},${v * 0.3} Q${v * 0.82},${v * 0.3} ${v * 0.84},${v * 0.42} Q${v * 0.84},${v * 0.52} ${v * 0.72},${v * 0.52} Z`}
            fill={color}
            opacity={0.5}
          />
          <path
            d={`M${v * 0.24},${v * 0.72} Q${v * 0.1},${v * 0.72} ${v * 0.12},${v * 0.58} Q${v * 0.14},${v * 0.46} ${v * 0.3},${v * 0.48} Q${v * 0.34},${v * 0.36} ${v * 0.5},${v * 0.38} Q${v * 0.68},${v * 0.36} ${v * 0.72},${v * 0.48} Q${v * 0.88},${v * 0.48} ${v * 0.88},${v * 0.6} Q${v * 0.88},${v * 0.72} ${v * 0.74},${v * 0.72} Z`}
            fill={color}
            opacity={0.92}
          />
        </svg>
      );

    case 'fog':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.1},${v * 0.32} Q${v * 0.3},${v * 0.26} ${v * 0.5},${v * 0.32} Q${v * 0.7},${v * 0.38} ${v * 0.9},${v * 0.32}`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
            opacity={0.5}
          />
          <path
            d={`M${v * 0.06},${v * 0.5} Q${v * 0.28},${v * 0.42} ${v * 0.5},${v * 0.5} Q${v * 0.72},${v * 0.58} ${v * 0.94},${v * 0.5}`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
            opacity={0.75}
          />
          <path
            d={`M${v * 0.1},${v * 0.68} Q${v * 0.3},${v * 0.62} ${v * 0.5},${v * 0.68} Q${v * 0.7},${v * 0.74} ${v * 0.9},${v * 0.68}`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
            opacity={0.4}
          />
        </svg>
      );

    case 'drizzle':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.26},${v * 0.52} Q${v * 0.14},${v * 0.52} ${v * 0.16},${v * 0.4} Q${v * 0.18},${v * 0.28} ${v * 0.34},${v * 0.3} Q${v * 0.38},${v * 0.18} ${v * 0.52},${v * 0.2} Q${v * 0.68},${v * 0.18} ${v * 0.72},${v * 0.3} Q${v * 0.86},${v * 0.3} ${v * 0.84},${v * 0.42} Q${v * 0.82},${v * 0.52} ${v * 0.68},${v * 0.52} Z`}
            fill={color}
            opacity={0.85}
          />
          {[v * 0.36, v * 0.56].map((x, i) => (
            <path
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              d={`M${x},${v * 0.6} Q${x - v * 0.025},${v * 0.72} ${x},${v * 0.74} Q${x + v * 0.025},${v * 0.72} ${x},${v * 0.6}`}
              fill={accent}
              opacity={0.78 - i * 0.1}
            />
          ))}
        </svg>
      );

    case 'rain': {
      const drops = [
        { x: v * 0.28, y: v * 0.58 },
        { x: v * 0.5, y: v * 0.56 },
        { x: v * 0.72, y: v * 0.58 },
      ];
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.26},${v * 0.52} Q${v * 0.14},${v * 0.52} ${v * 0.16},${v * 0.4} Q${v * 0.18},${v * 0.28} ${v * 0.34},${v * 0.3} Q${v * 0.38},${v * 0.18} ${v * 0.52},${v * 0.2} Q${v * 0.68},${v * 0.18} ${v * 0.72},${v * 0.3} Q${v * 0.86},${v * 0.3} ${v * 0.84},${v * 0.42} Q${v * 0.82},${v * 0.52} ${v * 0.68},${v * 0.52} Z`}
            fill={color}
            opacity={0.88}
          />
          {drops.map((d, i) => (
            <path
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              d={`M${d.x},${d.y} Q${d.x - v * 0.03},${d.y + v * 0.11} ${d.x},${d.y + v * 0.14} Q${d.x + v * 0.03},${d.y + v * 0.11} ${d.x},${d.y}`}
              fill={accent}
              opacity={0.8 - i * 0.06}
            />
          ))}
        </svg>
      );
    }

    case 'heavy-rain': {
      const drops = [v * 0.22, v * 0.36, v * 0.5, v * 0.64, v * 0.78].map((x, i) => ({
        x,
        y: v * 0.57 + (i % 2) * v * 0.04,
      }));
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.22},${v * 0.5} Q${v * 0.1},${v * 0.5} ${v * 0.12},${v * 0.36} Q${v * 0.14},${v * 0.22} ${v * 0.3},${v * 0.24} Q${v * 0.34},${v * 0.1} ${v * 0.5},${v * 0.12} Q${v * 0.68},${v * 0.1} ${v * 0.72},${v * 0.24} Q${v * 0.88},${v * 0.24} ${v * 0.88},${v * 0.38} Q${v * 0.88},${v * 0.5} ${v * 0.74},${v * 0.5} Z`}
            fill={color}
            opacity={0.95}
          />
          {drops.map((d, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
            <g key={i} transform={`rotate(-14 ${d.x} ${d.y + v * 0.1})`}>
              <path
                d={`M${d.x},${d.y} Q${d.x - v * 0.035},${d.y + v * 0.13} ${d.x},${d.y + v * 0.165} Q${d.x + v * 0.035},${d.y + v * 0.13} ${d.x},${d.y}`}
                fill={accent}
                opacity={0.88 - (i % 2) * 0.12}
              />
            </g>
          ))}
        </svg>
      );
    }

    case 'snow': {
      const stars = [v * 0.28, v * 0.5, v * 0.72];
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.26},${v * 0.52} Q${v * 0.14},${v * 0.52} ${v * 0.16},${v * 0.4} Q${v * 0.18},${v * 0.28} ${v * 0.34},${v * 0.3} Q${v * 0.38},${v * 0.18} ${v * 0.52},${v * 0.2} Q${v * 0.68},${v * 0.18} ${v * 0.72},${v * 0.3} Q${v * 0.86},${v * 0.3} ${v * 0.84},${v * 0.42} Q${v * 0.82},${v * 0.52} ${v * 0.68},${v * 0.52} Z`}
            fill={color}
            opacity={0.82}
          />
          {stars.map((cx, i) => {
            const cy = v * 0.7 + (i % 2) * (-v * 0.04);
            const r = v * 0.065;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              <g key={i}>
                {[0, 60, 120].map((a) => {
                  const R = Math.PI / 180;
                  return (
                    <line
                      key={a}
                      x1={cx - r * Math.cos(a * R)}
                      y1={cy - r * Math.sin(a * R)}
                      x2={cx + r * Math.cos(a * R)}
                      y2={cy + r * Math.sin(a * R)}
                      stroke={accent}
                      strokeWidth={v * 0.07}
                      strokeLinecap="round"
                      opacity={0.85 - i * 0.06}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      );
    }

    case 'heavy-snow': {
      const stars = [v * 0.2, v * 0.38, v * 0.56, v * 0.74].map((x, i) => ({
        x,
        y: v * (0.6 + (i % 3) * 0.08),
      }));
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.18},${v * 0.48} Q${v * 0.08},${v * 0.48} ${v * 0.1},${v * 0.34} Q${v * 0.12},${v * 0.2} ${v * 0.28},${v * 0.22} Q${v * 0.32},${v * 0.08} ${v * 0.5},${v * 0.1} Q${v * 0.68},${v * 0.08} ${v * 0.72},${v * 0.22} Q${v * 0.88},${v * 0.22} ${v * 0.88},${v * 0.36} Q${v * 0.88},${v * 0.48} ${v * 0.74},${v * 0.48} Z`}
            fill={color}
            opacity={0.95}
          />
          {stars.map((d, i) => {
            const r = v * 0.06;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              <g key={i}>
                {[0, 60, 120].map((a) => {
                  const R = Math.PI / 180;
                  return (
                    <line
                      key={a}
                      x1={d.x - r * Math.cos(a * R)}
                      y1={d.y - r * Math.sin(a * R)}
                      x2={d.x + r * Math.cos(a * R)}
                      y2={d.y + r * Math.sin(a * R)}
                      stroke={accent}
                      strokeWidth={v * 0.07}
                      strokeLinecap="round"
                      opacity={0.85}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      );
    }

    case 'thunder':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <defs>
            <filter id="td-glow">
              <feGaussianBlur stdDeviation="1.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={`M${v * 0.22},${v * 0.5} Q${v * 0.1},${v * 0.5} ${v * 0.12},${v * 0.36} Q${v * 0.14},${v * 0.22} ${v * 0.3},${v * 0.24} Q${v * 0.34},${v * 0.1} ${v * 0.5},${v * 0.12} Q${v * 0.68},${v * 0.1} ${v * 0.72},${v * 0.24} Q${v * 0.88},${v * 0.24} ${v * 0.88},${v * 0.38} Q${v * 0.88},${v * 0.5} ${v * 0.74},${v * 0.5} Z`}
            fill={color}
            opacity={0.95}
          />
          <path
            d={`M${v * 0.56},${v * 0.52} L${v * 0.43},${v * 0.68} L${v * 0.52},${v * 0.68} L${v * 0.4},${v * 0.88} L${v * 0.62},${v * 0.65} L${v * 0.53},${v * 0.65} Z`}
            fill={accent}
            filter="url(#td-glow)"
          />
        </svg>
      );

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUNDIAL GLYPHS — classical/Roman geometry, shadow-dial aesthetic
// Clean radial lines, arc segments, shadow indicators
// ─────────────────────────────────────────────────────────────────────────────

function SundialGlyph({
  cat,
  color,
  accent,
  s,
  night,
}: { cat: WeatherCategory; color: string; accent: string; s: number; night: boolean }) {
  const v = s;
  const sw = v * 0.055;

  switch (cat) {
    case 'clear':
      if (night) {
        // Arc + single gnomon line — like a nocturnal dial
        return (
          <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
            <path
              d={`M${v * 0.15},${v * 0.75} A${v * 0.36},${v * 0.36} 0 0 1 ${v * 0.85},${v * 0.75}`}
              stroke={color}
              strokeWidth={sw}
              fill="none"
              strokeLinecap="round"
              opacity={0.9}
            />
            <line
              x1={v * 0.5}
              y1={v * 0.75}
              x2={v * 0.5}
              y2={v * 0.2}
              stroke={accent}
              strokeWidth={sw * 0.8}
              strokeLinecap="round"
            />
            <line
              x1={v * 0.5}
              y1={v * 0.75}
              x2={v * 0.78}
              y2={v * 0.38}
              stroke={color}
              strokeWidth={sw * 0.5}
              strokeLinecap="round"
              opacity={0.5}
            />
            <line
              x1={v * 0.5}
              y1={v * 0.75}
              x2={v * 0.22}
              y2={v * 0.38}
              stroke={color}
              strokeWidth={sw * 0.5}
              strokeLinecap="round"
              opacity={0.5}
            />
            <circle cx={v * 0.5} cy={v * 0.75} r={v * 0.04} fill={accent} />
          </svg>
        );
      }
      // Classic sundial arc + gnomon casting a shadow
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.12},${v * 0.76} A${v * 0.38},${v * 0.38} 0 0 1 ${v * 0.88},${v * 0.76}`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
          />
          {[-60, -30, 0, 30, 60].map((a) => {
            const R = Math.PI / 180;
            const cx = v * 0.5;
            const cy = v * 0.76;
            return (
              <line
                key={a}
                x1={cx}
                y1={cy}
                x2={cx + v * 0.36 * Math.cos((a - 90) * R)}
                y2={cy + v * 0.36 * Math.sin((a - 90) * R)}
                stroke={color}
                strokeWidth={sw * 0.45}
                strokeLinecap="round"
                opacity={a === 0 ? 0.9 : 0.4}
              />
            );
          })}
          <line
            x1={v * 0.5}
            y1={v * 0.76}
            x2={v * 0.5}
            y2={v * 0.18}
            stroke={accent}
            strokeWidth={sw * 0.9}
            strokeLinecap="round"
          />
          <circle cx={v * 0.5} cy={v * 0.76} r={v * 0.04} fill={accent} />
        </svg>
      );

    case 'partly-cloudy': {
      // Half-sundial arc (bottom) + cloud blob (top-right)
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.12},${v * 0.82} A${v * 0.28},${v * 0.28} 0 0 1 ${v * 0.66},${v * 0.82}`}
            stroke={night ? accent : color}
            strokeWidth={sw * 0.8}
            fill="none"
            strokeLinecap="round"
            opacity={0.7}
          />
          <line
            x1={v * 0.38}
            y1={v * 0.82}
            x2={v * 0.38}
            y2={v * 0.46}
            stroke={accent}
            strokeWidth={sw * 0.7}
            strokeLinecap="round"
            opacity={0.8}
          />
          <circle cx={v * 0.38} cy={v * 0.82} r={v * 0.03} fill={accent} opacity={0.8} />
          {/* cloud */}
          <ellipse
            cx={v * 0.66}
            cy={v * 0.44}
            rx={v * 0.26}
            ry={v * 0.16}
            fill={color}
            opacity={0.85}
          />
          <ellipse
            cx={v * 0.6}
            cy={v * 0.36}
            rx={v * 0.16}
            ry={v * 0.15}
            fill={color}
            opacity={0.85}
          />
          <ellipse
            cx={v * 0.74}
            cy={v * 0.36}
            rx={v * 0.12}
            ry={v * 0.12}
            fill={color}
            opacity={0.85}
          />
        </svg>
      );
    }

    case 'overcast':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {/* dial arc barely visible through cloud */}
          <path
            d={`M${v * 0.18},${v * 0.78} A${v * 0.32},${v * 0.32} 0 0 1 ${v * 0.82},${v * 0.78}`}
            stroke={color}
            strokeWidth={sw * 0.5}
            fill="none"
            opacity={0.25}
          />
          <ellipse
            cx={v * 0.5}
            cy={v * 0.46}
            rx={v * 0.36}
            ry={v * 0.22}
            fill={color}
            opacity={0.55}
          />
          <ellipse
            cx={v * 0.44}
            cy={v * 0.38}
            rx={v * 0.25}
            ry={v * 0.22}
            fill={color}
            opacity={0.65}
          />
          <ellipse
            cx={v * 0.62}
            cy={v * 0.37}
            rx={v * 0.2}
            ry={v * 0.19}
            fill={color}
            opacity={0.65}
          />
          <ellipse
            cx={v * 0.5}
            cy={v * 0.56}
            rx={v * 0.38}
            ry={v * 0.17}
            fill={color}
            opacity={0.9}
          />
        </svg>
      );

    case 'fog':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {/* Dial lines barely emerging through fog bars */}
          <line
            x1={v * 0.5}
            y1={v * 0.72}
            x2={v * 0.5}
            y2={v * 0.28}
            stroke={color}
            strokeWidth={sw * 0.4}
            opacity={0.2}
          />
          <rect
            x={v * 0.1}
            y={v * 0.28}
            width={v * 0.8}
            height={v * 0.09}
            rx={v * 0.045}
            fill={color}
            opacity={0.5}
          />
          <rect
            x={v * 0.06}
            y={v * 0.46}
            width={v * 0.88}
            height={v * 0.09}
            rx={v * 0.045}
            fill={color}
            opacity={0.72}
          />
          <rect
            x={v * 0.12}
            y={v * 0.64}
            width={v * 0.76}
            height={v * 0.09}
            rx={v * 0.045}
            fill={color}
            opacity={0.4}
          />
        </svg>
      );

    case 'drizzle':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.38}
            rx={v * 0.3}
            ry={v * 0.18}
            fill={color}
            opacity={0.82}
          />
          <ellipse
            cx={v * 0.44}
            cy={v * 0.3}
            rx={v * 0.18}
            ry={v * 0.17}
            fill={color}
            opacity={0.82}
          />
          <ellipse
            cx={v * 0.6}
            cy={v * 0.29}
            rx={v * 0.14}
            ry={v * 0.14}
            fill={color}
            opacity={0.82}
          />
          {[v * 0.36, v * 0.56].map((x, i) => (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x1={x}
              y1={v * 0.6}
              x2={x - v * 0.04}
              y2={v * 0.76}
              stroke={accent}
              strokeWidth={sw * 0.8}
              strokeLinecap="round"
              opacity={0.72 + i * 0.1}
            />
          ))}
        </svg>
      );

    case 'rain':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.36}
            rx={v * 0.3}
            ry={v * 0.18}
            fill={color}
            opacity={0.88}
          />
          <ellipse
            cx={v * 0.44}
            cy={v * 0.28}
            rx={v * 0.18}
            ry={v * 0.17}
            fill={color}
            opacity={0.88}
          />
          <ellipse
            cx={v * 0.6}
            cy={v * 0.27}
            rx={v * 0.14}
            ry={v * 0.14}
            fill={color}
            opacity={0.88}
          />
          {[v * 0.28, v * 0.48, v * 0.68].map((x, i) => (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x1={x}
              y1={v * 0.56}
              x2={x - v * 0.055}
              y2={v * 0.76}
              stroke={accent}
              strokeWidth={sw}
              strokeLinecap="round"
              opacity={0.8 - i * 0.08}
            />
          ))}
        </svg>
      );

    case 'heavy-rain':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.32}
            rx={v * 0.36}
            ry={v * 0.21}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.42}
            cy={v * 0.22}
            rx={v * 0.22}
            ry={v * 0.2}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.64}
            cy={v * 0.21}
            rx={v * 0.17}
            ry={v * 0.16}
            fill={color}
            opacity={0.95}
          />
          {[v * 0.18, v * 0.34, v * 0.5, v * 0.66, v * 0.8].map((x, i) => (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x1={x}
              y1={v * 0.54}
              x2={x - v * 0.07}
              y2={v * 0.78}
              stroke={accent}
              strokeWidth={sw}
              strokeLinecap="round"
              opacity={0.85 - (i % 2) * 0.1}
            />
          ))}
        </svg>
      );

    case 'snow': {
      const stars = [v * 0.3, v * 0.5, v * 0.7];
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.36}
            rx={v * 0.3}
            ry={v * 0.18}
            fill={color}
            opacity={0.82}
          />
          <ellipse
            cx={v * 0.44}
            cy={v * 0.28}
            rx={v * 0.18}
            ry={v * 0.17}
            fill={color}
            opacity={0.82}
          />
          <ellipse
            cx={v * 0.6}
            cy={v * 0.27}
            rx={v * 0.14}
            ry={v * 0.14}
            fill={color}
            opacity={0.82}
          />
          {stars.map((cx, i) => {
            const cy = v * 0.7 + (i % 2) * (-v * 0.04);
            const r = v * 0.065;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              <g key={i}>
                {[0, 60, 120].map((a) => {
                  const R = Math.PI / 180;
                  return (
                    <line
                      key={a}
                      x1={cx - r * Math.cos(a * R)}
                      y1={cy - r * Math.sin(a * R)}
                      x2={cx + r * Math.cos(a * R)}
                      y2={cy + r * Math.sin(a * R)}
                      stroke={accent}
                      strokeWidth={sw}
                      strokeLinecap="round"
                      opacity={0.85 - i * 0.06}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      );
    }

    case 'heavy-snow': {
      const stars = [v * 0.2, v * 0.38, v * 0.56, v * 0.74].map((x, i) => ({
        x,
        y: v * (0.6 + (i % 3) * 0.08),
      }));
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <ellipse
            cx={v * 0.5}
            cy={v * 0.3}
            rx={v * 0.36}
            ry={v * 0.22}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.42}
            cy={v * 0.2}
            rx={v * 0.22}
            ry={v * 0.2}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.64}
            cy={v * 0.19}
            rx={v * 0.17}
            ry={v * 0.16}
            fill={color}
            opacity={0.95}
          />
          {stars.map((d, i) => {
            const r = v * 0.06;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              <g key={i}>
                {[0, 60, 120].map((a) => {
                  const R = Math.PI / 180;
                  return (
                    <line
                      key={a}
                      x1={d.x - r * Math.cos(a * R)}
                      y1={d.y - r * Math.sin(a * R)}
                      x2={d.x + r * Math.cos(a * R)}
                      y2={d.y + r * Math.sin(a * R)}
                      stroke={accent}
                      strokeWidth={sw}
                      strokeLinecap="round"
                      opacity={0.85}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      );
    }

    case 'thunder':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <defs>
            <filter id="sd-glow">
              <feGaussianBlur stdDeviation="1.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <ellipse
            cx={v * 0.5}
            cy={v * 0.32}
            rx={v * 0.36}
            ry={v * 0.21}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.42}
            cy={v * 0.22}
            rx={v * 0.22}
            ry={v * 0.2}
            fill={color}
            opacity={0.95}
          />
          <ellipse
            cx={v * 0.63}
            cy={v * 0.21}
            rx={v * 0.17}
            ry={v * 0.16}
            fill={color}
            opacity={0.95}
          />
          <path
            d={`M${v * 0.56},${v * 0.48} L${v * 0.43},${v * 0.65} L${v * 0.52},${v * 0.65} L${v * 0.4},${v * 0.88} L${v * 0.62},${v * 0.62} L${v * 0.53},${v * 0.62} Z`}
            fill={accent}
            filter="url(#sd-glow)"
          />
        </svg>
      );

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VOID GLYPHS — minimal negative space. Single sparse marks, near-invisible.
// As little ink as possible. The glyph is mostly air.
// ─────────────────────────────────────────────────────────────────────────────

function VoidGlyph({
  cat,
  color,
  accent,
  s,
  night,
}: { cat: WeatherCategory; color: string; accent: string; s: number; night: boolean }) {
  const v = s;
  const sw = v * 0.045; // very thin

  switch (cat) {
    case 'clear':
      if (night) {
        // Single thin crescent outline, barely there
        return (
          <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
            <path
              d={`M${v * 0.5},${v * 0.22} A${v * 0.28},${v * 0.28} 0 1 1 ${v * 0.5},${v * 0.78} A${v * 0.18},${v * 0.18} 0 1 0 ${v * 0.5},${v * 0.22} Z`}
              stroke={color}
              strokeWidth={sw}
              fill="none"
              opacity={0.65}
            />
          </svg>
        );
      }
      // Single open circle — nothing else
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <circle
            cx={v / 2}
            cy={v / 2}
            r={v * 0.22}
            stroke={color}
            strokeWidth={sw}
            opacity={0.7}
          />
        </svg>
      );

    case 'partly-cloudy':
      // Tiny arc (sun/moon) + single cloud outline
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {night ? (
            <path
              d={`M${v * 0.28},${v * 0.18} A${v * 0.14},${v * 0.14} 0 1 1 ${v * 0.28},${v * 0.42} A${v * 0.09},${v * 0.09} 0 1 0 ${v * 0.28},${v * 0.18} Z`}
              stroke={accent}
              strokeWidth={sw}
              fill="none"
              opacity={0.6}
            />
          ) : (
            <circle
              cx={v * 0.3}
              cy={v * 0.3}
              r={v * 0.12}
              stroke={accent}
              strokeWidth={sw}
              opacity={0.6}
            />
          )}
          <path
            d={`M${v * 0.36},${v * 0.72} Q${v * 0.26},${v * 0.72} ${v * 0.26},${v * 0.62} Q${v * 0.26},${v * 0.54} ${v * 0.36},${v * 0.53} Q${v * 0.38},${v * 0.46} ${v * 0.5},${v * 0.48} Q${v * 0.64},${v * 0.46} ${v * 0.68},${v * 0.54} Q${v * 0.8},${v * 0.54} ${v * 0.8},${v * 0.62} Q${v * 0.8},${v * 0.72} ${v * 0.68},${v * 0.72} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            opacity={0.65}
          />
        </svg>
      );

    case 'overcast':
      // Two faint arcs
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.22},${v * 0.48} Q${v * 0.22},${v * 0.34} ${v * 0.5},${v * 0.34} Q${v * 0.78},${v * 0.34} ${v * 0.78},${v * 0.48}`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            opacity={0.4}
          />
          <path
            d={`M${v * 0.18},${v * 0.64} Q${v * 0.18},${v * 0.5} ${v * 0.5},${v * 0.5} Q${v * 0.82},${v * 0.5} ${v * 0.82},${v * 0.64}`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            opacity={0.65}
          />
        </svg>
      );

    case 'fog':
      // Three hairlines
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <line
            x1={v * 0.22}
            y1={v * 0.34}
            x2={v * 0.78}
            y2={v * 0.34}
            stroke={color}
            strokeWidth={sw}
            opacity={0.4}
          />
          <line
            x1={v * 0.16}
            y1={v * 0.5}
            x2={v * 0.84}
            y2={v * 0.5}
            stroke={color}
            strokeWidth={sw}
            opacity={0.62}
          />
          <line
            x1={v * 0.22}
            y1={v * 0.66}
            x2={v * 0.78}
            y2={v * 0.66}
            stroke={color}
            strokeWidth={sw}
            opacity={0.35}
          />
        </svg>
      );

    case 'drizzle':
      // Cloud outline + two dots
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.3},${v * 0.52} Q${v * 0.2},${v * 0.52} ${v * 0.2},${v * 0.42} Q${v * 0.2},${v * 0.34} ${v * 0.32},${v * 0.33} Q${v * 0.34},${v * 0.24} ${v * 0.5},${v * 0.26} Q${v * 0.66},${v * 0.24} ${v * 0.68},${v * 0.33} Q${v * 0.8},${v * 0.33} ${v * 0.8},${v * 0.42} Q${v * 0.8},${v * 0.52} ${v * 0.7},${v * 0.52} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            opacity={0.65}
          />
          <circle cx={v * 0.38} cy={v * 0.68} r={v * 0.03} fill={accent} opacity={0.7} />
          <circle cx={v * 0.6} cy={v * 0.68} r={v * 0.03} fill={accent} opacity={0.6} />
        </svg>
      );

    case 'rain':
      // Cloud outline + three short lines
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.28},${v * 0.5} Q${v * 0.18},${v * 0.5} ${v * 0.18},${v * 0.4} Q${v * 0.18},${v * 0.32} ${v * 0.3},${v * 0.31} Q${v * 0.32},${v * 0.22} ${v * 0.46},${v * 0.24} Q${v * 0.6},${v * 0.22} ${v * 0.64},${v * 0.31} Q${v * 0.78},${v * 0.31} ${v * 0.78},${v * 0.4} Q${v * 0.78},${v * 0.5} ${v * 0.68},${v * 0.5} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            opacity={0.65}
          />
          {[v * 0.3, v * 0.5, v * 0.7].map((x, i) => (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x1={x}
              y1={v * 0.6}
              x2={x - v * 0.04}
              y2={v * 0.74}
              stroke={accent}
              strokeWidth={sw}
              strokeLinecap="round"
              opacity={0.6 - i * 0.06}
            />
          ))}
        </svg>
      );

    case 'heavy-rain':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.24},${v * 0.48} Q${v * 0.12},${v * 0.48} ${v * 0.12},${v * 0.36} Q${v * 0.12},${v * 0.24} ${v * 0.28},${v * 0.23} Q${v * 0.3},${v * 0.13} ${v * 0.46},${v * 0.15} Q${v * 0.62},${v * 0.13} ${v * 0.66},${v * 0.23} Q${v * 0.82},${v * 0.23} ${v * 0.84},${v * 0.36} Q${v * 0.84},${v * 0.48} ${v * 0.72},${v * 0.48} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            opacity={0.65}
          />
          {[v * 0.22, v * 0.38, v * 0.54, v * 0.7].map((x, i) => (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x1={x}
              y1={v * 0.58}
              x2={x - v * 0.06}
              y2={v * 0.76}
              stroke={accent}
              strokeWidth={sw}
              strokeLinecap="round"
              opacity={0.65 - (i % 2) * 0.1}
            />
          ))}
        </svg>
      );

    case 'snow':
      // Cloud outline + three tiny crosses (minimal snowflake marks)
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.28},${v * 0.5} Q${v * 0.18},${v * 0.5} ${v * 0.18},${v * 0.4} Q${v * 0.18},${v * 0.32} ${v * 0.3},${v * 0.31} Q${v * 0.32},${v * 0.22} ${v * 0.46},${v * 0.24} Q${v * 0.6},${v * 0.22} ${v * 0.64},${v * 0.31} Q${v * 0.78},${v * 0.31} ${v * 0.78},${v * 0.4} Q${v * 0.78},${v * 0.5} ${v * 0.68},${v * 0.5} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            opacity={0.65}
          />
          {[v * 0.3, v * 0.5, v * 0.7].map((cx, i) => {
            const cy = v * 0.7;
            const r = v * 0.055;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              <g key={i}>
                <line
                  x1={cx - r}
                  y1={cy}
                  x2={cx + r}
                  y2={cy}
                  stroke={accent}
                  strokeWidth={sw}
                  strokeLinecap="round"
                  opacity={0.6}
                />
                <line
                  x1={cx}
                  y1={cy - r}
                  x2={cx}
                  y2={cy + r}
                  stroke={accent}
                  strokeWidth={sw}
                  strokeLinecap="round"
                  opacity={0.6}
                />
              </g>
            );
          })}
        </svg>
      );

    case 'heavy-snow':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.24},${v * 0.48} Q${v * 0.12},${v * 0.48} ${v * 0.12},${v * 0.36} Q${v * 0.12},${v * 0.24} ${v * 0.28},${v * 0.23} Q${v * 0.3},${v * 0.13} ${v * 0.46},${v * 0.15} Q${v * 0.62},${v * 0.13} ${v * 0.66},${v * 0.23} Q${v * 0.82},${v * 0.23} ${v * 0.84},${v * 0.36} Q${v * 0.84},${v * 0.48} ${v * 0.72},${v * 0.48} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            opacity={0.65}
          />
          {[v * 0.2, v * 0.38, v * 0.56, v * 0.74].map((cx, i) => {
            const cy = v * (0.64 + (i % 2) * 0.1);
            const r = v * 0.05;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              <g key={i}>
                <line
                  x1={cx - r}
                  y1={cy}
                  x2={cx + r}
                  y2={cy}
                  stroke={accent}
                  strokeWidth={sw}
                  strokeLinecap="round"
                  opacity={0.6}
                />
                <line
                  x1={cx}
                  y1={cy - r}
                  x2={cx}
                  y2={cy + r}
                  stroke={accent}
                  strokeWidth={sw}
                  strokeLinecap="round"
                  opacity={0.6}
                />
              </g>
            );
          })}
        </svg>
      );

    case 'thunder':
      // Cloud outline + bolt outline — minimal
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.24},${v * 0.48} Q${v * 0.12},${v * 0.48} ${v * 0.12},${v * 0.36} Q${v * 0.12},${v * 0.24} ${v * 0.28},${v * 0.23} Q${v * 0.3},${v * 0.13} ${v * 0.46},${v * 0.15} Q${v * 0.62},${v * 0.13} ${v * 0.66},${v * 0.23} Q${v * 0.82},${v * 0.23} ${v * 0.84},${v * 0.36} Q${v * 0.84},${v * 0.48} ${v * 0.72},${v * 0.48} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            opacity={0.65}
          />
          <path
            d={`M${v * 0.56},${v * 0.52} L${v * 0.44},${v * 0.68} L${v * 0.52},${v * 0.68} L${v * 0.4},${v * 0.88} L${v * 0.62},${v * 0.65} L${v * 0.53},${v * 0.65} Z`}
            stroke={accent}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
            opacity={0.75}
          />
        </svg>
      );

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PARCHMENT GLYPHS — Notion-native 1px hairline strokes
//
// Design rules (non-negotiable):
//   · stroke = `color` only (resolves to N_TEXT_MED = rgba(55,53,47,0.65))
//   · strokeWidth = sw = s * 0.055  ≈ 1.1px at size 20 — Notion's border weight
//   · fill = "none" on every cloud body
//   · no filter, no boxShadow, no gradient, no accentColor usage
//   · rain = vertical lines only (no angle)
//   · snow = 6-point asterisk lines (stroke only)
//   · bolt = stroked outline, no fill
// ─────────────────────────────────────────────────────────────────────────────

function ParchmentGlyph({
  cat,
  color,
  s,
  night,
}: { cat: WeatherCategory; color: string; accent: string; s: number; night: boolean }) {
  const v = s;
  const sw = v * 0.055; // ~1.1px at size=20

  switch (cat) {
    // ── clear ────────────────────────────────────────────────────────────────
    case 'clear':
      if (night) {
        return (
          <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
            {/* Stroked crescent outline — no fill */}
            <path
              d={`M${v * 0.5},${v * 0.2} A${v * 0.3},${v * 0.3} 0 1 1 ${v * 0.5},${v * 0.8} A${v * 0.19},${v * 0.19} 0 1 0 ${v * 0.5},${v * 0.2} Z`}
              stroke={color}
              strokeWidth={sw}
              fill="none"
            />
          </svg>
        );
      }
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {/* Sun disc + 6 ray stubs — pure stroke */}
          <circle cx={v / 2} cy={v / 2} r={v * 0.19} stroke={color} strokeWidth={sw} />
          {[0, 60, 120, 180, 240, 300].map((a) => {
            const R = Math.PI / 180;
            return (
              <line
                key={a}
                x1={v / 2 + v * 0.28 * Math.cos(a * R)}
                y1={v / 2 + v * 0.28 * Math.sin(a * R)}
                x2={v / 2 + v * 0.39 * Math.cos(a * R)}
                y2={v / 2 + v * 0.39 * Math.sin(a * R)}
                stroke={color}
                strokeWidth={sw * 0.8}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      );

    // ── partly-cloudy ────────────────────────────────────────────────────────
    case 'partly-cloudy':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          {night ? (
            /* Tiny stroked crescent, top-left */
            <path
              d={`M${v * 0.28},${v * 0.12} A${v * 0.16},${v * 0.16} 0 1 1 ${v * 0.28},${v * 0.42} A${v * 0.1},${v * 0.1} 0 1 0 ${v * 0.28},${v * 0.12} Z`}
              stroke={color}
              strokeWidth={sw * 0.85}
              fill="none"
              opacity={0.7}
            />
          ) : (
            /* Tiny sun disc, top-left */
            <circle
              cx={v * 0.3}
              cy={v * 0.28}
              r={v * 0.12}
              stroke={color}
              strokeWidth={sw * 0.85}
              opacity={0.7}
            />
          )}
          {/* Cloud outline — stroked, no fill */}
          <path
            d={`M${v * 0.32},${v * 0.7} Q${v * 0.22},${v * 0.7} ${v * 0.22},${v * 0.6} Q${v * 0.22},${v * 0.52} ${v * 0.34},${v * 0.51} Q${v * 0.36},${v * 0.44} ${v * 0.48},${v * 0.46} Q${v * 0.62},${v * 0.44} ${v * 0.66},${v * 0.52} Q${v * 0.78},${v * 0.52} ${v * 0.78},${v * 0.6} Q${v * 0.78},${v * 0.7} ${v * 0.68},${v * 0.7} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
        </svg>
      );

    // ── overcast ─────────────────────────────────────────────────────────────
    case 'overcast':
      // Two stacked cloud outlines at different opacities — depth without fill
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.26},${v * 0.54} Q${v * 0.16},${v * 0.54} ${v * 0.16},${v * 0.44} Q${v * 0.16},${v * 0.36} ${v * 0.28},${v * 0.35} Q${v * 0.3},${v * 0.27} ${v * 0.44},${v * 0.29} Q${v * 0.58},${v * 0.27} ${v * 0.62},${v * 0.35} Q${v * 0.74},${v * 0.35} ${v * 0.74},${v * 0.44} Q${v * 0.74},${v * 0.54} ${v * 0.64},${v * 0.54} Z`}
            stroke={color}
            strokeWidth={sw * 0.75}
            fill="none"
            strokeLinejoin="round"
            opacity={0.4}
          />
          <path
            d={`M${v * 0.28},${v * 0.72} Q${v * 0.18},${v * 0.72} ${v * 0.18},${v * 0.62} Q${v * 0.18},${v * 0.53} ${v * 0.3},${v * 0.52} Q${v * 0.32},${v * 0.43} ${v * 0.48},${v * 0.45} Q${v * 0.64},${v * 0.43} ${v * 0.68},${v * 0.52} Q${v * 0.82},${v * 0.52} ${v * 0.82},${v * 0.62} Q${v * 0.82},${v * 0.72} ${v * 0.72},${v * 0.72} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
        </svg>
      );

    // ── fog ──────────────────────────────────────────────────────────────────
    case 'fog':
      // Three horizontal hairlines — mirrors Notion's separator language
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <line
            x1={v * 0.18}
            y1={v * 0.33}
            x2={v * 0.82}
            y2={v * 0.33}
            stroke={color}
            strokeWidth={sw}
            opacity={0.38}
          />
          <line
            x1={v * 0.12}
            y1={v * 0.5}
            x2={v * 0.88}
            y2={v * 0.5}
            stroke={color}
            strokeWidth={sw}
            opacity={0.62}
          />
          <line
            x1={v * 0.18}
            y1={v * 0.67}
            x2={v * 0.82}
            y2={v * 0.67}
            stroke={color}
            strokeWidth={sw}
            opacity={0.34}
          />
        </svg>
      );

    // ── drizzle ──────────────────────────────────────────────────────────────
    case 'drizzle':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.28},${v * 0.54} Q${v * 0.18},${v * 0.54} ${v * 0.18},${v * 0.44} Q${v * 0.18},${v * 0.36} ${v * 0.3},${v * 0.35} Q${v * 0.32},${v * 0.26} ${v * 0.48},${v * 0.28} Q${v * 0.64},${v * 0.26} ${v * 0.68},${v * 0.35} Q${v * 0.8},${v * 0.35} ${v * 0.8},${v * 0.44} Q${v * 0.8},${v * 0.54} ${v * 0.7},${v * 0.54} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
          {/* Two short vertical drops — orthogonal, no angle (Notion is grid-native) */}
          {[v * 0.38, v * 0.6].map((x, i) => (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x1={x}
              y1={v * 0.63}
              x2={x}
              y2={v * 0.76}
              stroke={color}
              strokeWidth={sw * 0.85}
              strokeLinecap="round"
              opacity={0.62}
            />
          ))}
        </svg>
      );

    // ── rain ─────────────────────────────────────────────────────────────────
    case 'rain':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.26},${v * 0.5} Q${v * 0.16},${v * 0.5} ${v * 0.16},${v * 0.4} Q${v * 0.16},${v * 0.32} ${v * 0.28},${v * 0.31} Q${v * 0.3},${v * 0.22} ${v * 0.46},${v * 0.24} Q${v * 0.62},${v * 0.22} ${v * 0.66},${v * 0.31} Q${v * 0.8},${v * 0.31} ${v * 0.8},${v * 0.4} Q${v * 0.8},${v * 0.5} ${v * 0.68},${v * 0.5} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
          {[v * 0.3, v * 0.5, v * 0.7].map((x, i) => (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x1={x}
              y1={v * 0.6}
              x2={x}
              y2={v * 0.78}
              stroke={color}
              strokeWidth={sw}
              strokeLinecap="round"
              opacity={0.72 - i * 0.06}
            />
          ))}
        </svg>
      );

    // ── heavy-rain ───────────────────────────────────────────────────────────
    case 'heavy-rain':
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.18},${v * 0.46} Q${v * 0.08},${v * 0.46} ${v * 0.08},${v * 0.34} Q${v * 0.08},${v * 0.22} ${v * 0.24},${v * 0.21} Q${v * 0.26},${v * 0.11} ${v * 0.44},${v * 0.13} Q${v * 0.62},${v * 0.11} ${v * 0.66},${v * 0.21} Q${v * 0.86},${v * 0.21} ${v * 0.88},${v * 0.34} Q${v * 0.88},${v * 0.46} ${v * 0.76},${v * 0.46} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
          {[v * 0.16, v * 0.32, v * 0.5, v * 0.68, v * 0.82].map((x, i) => (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array
              key={i}
              x1={x}
              y1={v * 0.56}
              x2={x}
              y2={v * 0.8}
              stroke={color}
              strokeWidth={sw}
              strokeLinecap="round"
              opacity={0.76 - (i % 2) * 0.1}
            />
          ))}
        </svg>
      );

    // ── snow ─────────────────────────────────────────────────────────────────
    case 'snow': {
      // Cloud outline + 3 six-point asterisks (stroke only, no fill)
      const cxs = [v * 0.28, v * 0.5, v * 0.72];
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.26},${v * 0.5} Q${v * 0.16},${v * 0.5} ${v * 0.16},${v * 0.4} Q${v * 0.16},${v * 0.32} ${v * 0.28},${v * 0.31} Q${v * 0.3},${v * 0.22} ${v * 0.46},${v * 0.24} Q${v * 0.6},${v * 0.22} ${v * 0.64},${v * 0.31} Q${v * 0.78},${v * 0.31} ${v * 0.78},${v * 0.4} Q${v * 0.78},${v * 0.5} ${v * 0.68},${v * 0.5} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
          {cxs.map((cx, i) => {
            const cy = v * 0.7 + (i % 2) * (-v * 0.04);
            const r = v * 0.07;
            return [0, 60, 120].map((a) => {
              const R = Math.PI / 180;
              return (
                <line
                  key={`${i}-${a}`}
                  x1={cx - r * Math.cos(a * R)}
                  y1={cy - r * Math.sin(a * R)}
                  x2={cx + r * Math.cos(a * R)}
                  y2={cy + r * Math.sin(a * R)}
                  stroke={color}
                  strokeWidth={sw * 0.85}
                  strokeLinecap="round"
                  opacity={0.7 - i * 0.04}
                />
              );
            });
          })}
        </svg>
      );
    }

    // ── heavy-snow ───────────────────────────────────────────────────────────
    case 'heavy-snow': {
      const stars = [v * 0.18, v * 0.38, v * 0.58, v * 0.78].map((x, i) => ({
        x,
        y: v * (0.62 + (i % 2) * 0.1),
      }));
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.18},${v * 0.46} Q${v * 0.08},${v * 0.46} ${v * 0.08},${v * 0.34} Q${v * 0.08},${v * 0.22} ${v * 0.24},${v * 0.21} Q${v * 0.26},${v * 0.11} ${v * 0.44},${v * 0.13} Q${v * 0.62},${v * 0.11} ${v * 0.66},${v * 0.21} Q${v * 0.86},${v * 0.21} ${v * 0.88},${v * 0.34} Q${v * 0.88},${v * 0.46} ${v * 0.76},${v * 0.46} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
          {stars.map((d, i) => {
            const r = v * 0.06;
            return [0, 60, 120].map((a) => {
              const R = Math.PI / 180;
              return (
                <line
                  key={`${i}-${a}`}
                  x1={d.x - r * Math.cos(a * R)}
                  y1={d.y - r * Math.sin(a * R)}
                  x2={d.x + r * Math.cos(a * R)}
                  y2={d.y + r * Math.sin(a * R)}
                  stroke={color}
                  strokeWidth={sw * 0.8}
                  strokeLinecap="round"
                  opacity={0.68}
                />
              );
            });
          })}
        </svg>
      );
    }

    // ── thunder ──────────────────────────────────────────────────────────────
    case 'thunder':
      // Stroked cloud outline + stroked bolt — no fill, no filter, no glow
      return (
        <svg aria-hidden="true" width={s} height={s} viewBox={`0 0 ${v} ${v}`} fill="none">
          <path
            d={`M${v * 0.2},${v * 0.48} Q${v * 0.1},${v * 0.48} ${v * 0.1},${v * 0.36} Q${v * 0.1},${v * 0.24} ${v * 0.26},${v * 0.23} Q${v * 0.28},${v * 0.13} ${v * 0.46},${v * 0.15} Q${v * 0.64},${v * 0.13} ${v * 0.68},${v * 0.23} Q${v * 0.86},${v * 0.23} ${v * 0.86},${v * 0.36} Q${v * 0.86},${v * 0.48} ${v * 0.74},${v * 0.48} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
          />
          {/* Bolt — stroked outline only, no fill */}
          <path
            d={`M${v * 0.56},${v * 0.52} L${v * 0.44},${v * 0.68} L${v * 0.52},${v * 0.68} L${v * 0.4},${v * 0.88} L${v * 0.62},${v * 0.65} L${v * 0.53},${v * 0.65} Z`}
            stroke={color}
            strokeWidth={sw}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTER — picks the right glyph family
// ─────────────────────────────────────────────────────────────────────────────

export function PillWeatherGlyph({
  category,
  skin,
  color,
  accentColor,
  phaseIcon,
  size = 20,
}: PillWeatherGlyphProps) {
  const night = isNightPhase(phaseIcon);
  const props = { cat: category, color, accent: accentColor, s: size, night };

  switch (skin) {
    case 'meridian':
      return <MeridianGlyph {...props} />;
    case 'mineral':
      return <MineralGlyph {...props} />;
    case 'aurora':
      return <AuroraGlyph {...props} />;
    case 'paper':
      return <PaperGlyph {...props} />;
    case 'signal':
      return <SignalGlyph {...props} />;
    case 'tide':
      return <TideGlyph {...props} />;
    case 'sundial':
      return <SundialGlyph {...props} />;
    case 'void':
      return <VoidGlyph {...props} />;
    case 'parchment':
      return <ParchmentGlyph {...props} />;
    default:
      return <FoundryGlyph {...props} />;
  }
}
