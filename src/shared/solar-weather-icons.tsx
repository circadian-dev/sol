'use client';

// shared/solar-weather-icons.tsx  [v4 — foundry pill phase-aware icons]
//
// Changes vs v3:
//   - Added `phaseIcon` prop to WeatherIconProps (only consumed by foundry skin pill)
//   - Added FoundryClearNight, FoundryClearHorizon, FoundryPartlyCloudyNight,
//     FoundryPartlyCloudyHorizon helper components
//   - ClearIcon and PartlyCloudyIcon branch on skin=foundry + phaseIcon to render
//     the appropriate moon/horizon variant instead of always showing the sun
//   - WeatherIcon dispatcher passes phaseIcon through
//   - All other icons and skins unchanged

import { motion } from 'motion/react';
import type { PhaseColors } from '../shared/weather-layer';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WeatherSkin =
  | 'foundry'
  | 'meridian'
  | 'mineral'
  | 'paper'
  | 'signal'
  | 'aurora'
  | 'tide'
  | 'sundial'
  | 'void';

export type WeatherIconKey =
  | 'clear'
  | 'partly-cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy-rain'
  | 'snow'
  | 'heavy-snow'
  | 'thunder'
  | 'live';

export interface WeatherIconProps {
  mode: 'light' | 'dim' | 'dark';
  accentColor: string;
  size?: number;
  animate?: boolean;
  skin?: WeatherSkin;
  phaseColors?: PhaseColors;
  /** Foundry-pill only — drives moon/horizon clear & partly-cloudy variants */
  phaseIcon?: 'sun' | 'moon' | 'dawn' | 'dusk';
}

// ─── Color derivation ──────────────────────────────────────────────────────────

function colors(mode: 'light' | 'dim' | 'dark', accentColor: string, skin: WeatherSkin) {
  if (skin === 'signal') {
    return {
      sun: accentColor,
      sunRay: accentColor,
      cloud: accentColor,
      rain: accentColor,
      snow: accentColor,
      fog: accentColor,
      bolt: accentColor,
      moon: accentColor,
      text: accentColor,
      isDark: true,
    };
  }

  if (mode === 'light') {
    return {
      sun: '#7A4A00',
      sunRay: '#9A6200',
      cloud: null,
      rain: '#4A6EA0',
      snow: '#7090C0',
      fog: 'rgba(100,120,160,0.55)',
      bolt: '#C07A00',
      moon: '#505880',
      text: 'rgba(50,60,80,0.70)',
      isDark: false,
    };
  }
  if (mode === 'dim') {
    return {
      sun: accentColor,
      sunRay: accentColor,
      cloud: null,
      rain: 'rgba(180,205,255,0.85)',
      snow: 'rgba(210,225,255,0.88)',
      fog: 'rgba(180,195,225,0.55)',
      bolt: 'rgba(255,220,120,0.95)',
      moon: 'rgba(220,230,255,0.85)',
      text: 'rgba(220,230,255,0.70)',
      isDark: false,
    };
  }
  return {
    sun: accentColor,
    sunRay: accentColor,
    cloud: 'dark',
    rain: 'rgba(140,185,255,0.80)',
    snow: 'rgba(200,218,255,0.85)',
    fog: 'rgba(155,175,215,0.50)',
    bolt: 'rgba(215,235,255,0.95)',
    moon: 'rgba(200,220,255,0.90)',
    text: 'rgba(160,195,255,0.65)',
    isDark: true,
  };
}

// ─── Resolved icon palette ────────────────────────────────────────────────────

interface IconPalette {
  cloudBase: string;
  cloudShadow: string;
  cloudHi: string;
  rain: string;
  snow: string;
  fog: string;
  bolt: string;
  boltGlow: string;
  sun: string;
  sunRay: string;
  moon: string;
  text: string;
  isDarkUI: boolean;
}

function resolvePalette(props: WeatherIconProps): IconPalette {
  const { mode, accentColor, skin = 'foundry', phaseColors } = props;
  const legacy = colors(mode, accentColor, skin);

  if (phaseColors) {
    return {
      cloudBase: phaseColors.cloudBase,
      cloudShadow: phaseColors.cloudShadow,
      cloudHi: phaseColors.cloudHi,
      rain: phaseColors.rainColor,
      snow: phaseColors.snowColor,
      fog: phaseColors.fogColor,
      bolt: phaseColors.boltColor,
      boltGlow: phaseColors.boltGlow,
      sun: typeof legacy.sun === 'string' ? legacy.sun : accentColor,
      sunRay: typeof legacy.sunRay === 'string' ? legacy.sunRay : accentColor,
      moon: typeof legacy.moon === 'string' ? legacy.moon : accentColor,
      text: typeof legacy.text === 'string' ? legacy.text : accentColor,
      isDarkUI: legacy.isDark,
    };
  }

  return {
    cloudBase: legacy.isDark ? 'rgba(125,140,175,0.90)' : 'rgba(255,255,255,0.93)',
    cloudShadow: legacy.isDark ? 'rgba(60,70,100,0.30)' : 'rgba(160,175,210,0.25)',
    cloudHi: legacy.isDark ? 'rgba(72,90,130,0.22)' : 'rgba(255,255,255,0.86)',
    rain: typeof legacy.rain === 'string' ? legacy.rain : accentColor,
    snow: typeof legacy.snow === 'string' ? legacy.snow : accentColor,
    fog: typeof legacy.fog === 'string' ? legacy.fog : accentColor,
    bolt: typeof legacy.bolt === 'string' ? legacy.bolt : accentColor,
    boltGlow: typeof legacy.bolt === 'string' ? legacy.bolt : accentColor,
    sun: typeof legacy.sun === 'string' ? legacy.sun : accentColor,
    sunRay: typeof legacy.sunRay === 'string' ? legacy.sunRay : accentColor,
    moon: typeof legacy.moon === 'string' ? legacy.moon : accentColor,
    text: typeof legacy.text === 'string' ? legacy.text : accentColor,
    isDarkUI: legacy.isDark,
  };
}

// ─── Sun rays ─────────────────────────────────────────────────────────────────

function SunRays({
  cx,
  cy,
  r,
  rayLen,
  stroke,
  strokeWidth = 1.2,
}: {
  cx: number;
  cy: number;
  r: number;
  rayLen: number;
  stroke: string;
  strokeWidth?: number;
}) {
  return (
    <>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const RAD = Math.PI / 180;
        const inner = r + 2.5;
        const outer = r + 2.5 + rayLen;
        return (
          <line
            key={deg}
            x1={cx + inner * Math.cos(deg * RAD)}
            y1={cy + inner * Math.sin(deg * RAD)}
            x2={cx + outer * Math.cos(deg * RAD)}
            y2={cy + outer * Math.sin(deg * RAD)}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PER-SKIN CLOUD SHAPES
// ─────────────────────────────────────────────────────────────────────────────

function FoundryCloud({
  isDark,
  small,
  palette,
}: { isDark: boolean; small?: boolean; palette?: IconPalette }) {
  const fill = palette
    ? palette.cloudBase
    : isDark
      ? 'rgba(125,140,175,0.90)'
      : 'rgba(255,255,255,0.93)';
  const shadow = palette
    ? palette.cloudShadow
    : isDark
      ? 'rgba(60,70,100,0.30)'
      : 'rgba(160,175,210,0.25)';
  const s = small ? 'translate(3,3) scale(0.75)' : undefined;
  return (
    <g transform={s}>
      <ellipse cx="12" cy="19.5" rx="7" ry="1.2" fill={shadow} />
      <path
        d="M5 17 Q3 17 3 14.5 Q3 12 5.5 11.5 Q5.5 8 9 7.5 Q10 5 13 5.5 Q15 4.5 16.5 6 Q18.5 5.5 19 7.5 Q21 7.5 21 10 Q21 12.5 19 13 L6 13 Q5 13 5 14.5 Q5 16 6 16.5Z"
        fill={fill}
      />
    </g>
  );
}

function MeridianCloud({
  isDark,
  small,
  palette,
}: { isDark: boolean; small?: boolean; palette?: IconPalette }) {
  const stroke = palette
    ? palette.cloudBase
    : isDark
      ? 'rgba(130,150,185,0.80)'
      : 'rgba(80,100,140,0.65)';
  const s = small ? 'translate(2,2) scale(0.80)' : undefined;
  return (
    <g transform={s}>
      <path
        d="M5 17 Q3 17 3 14.5 Q3 12 5.5 11.5 Q5.5 8 9 7.5 Q10 5 13 5.5 Q15 4.5 16.5 6 Q18.5 5.5 19 7.5 Q21 7.5 21 10 Q21 12.5 19 13 L6 13"
        fill="none"
        stroke={stroke}
        strokeWidth={0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 11.5 Q9 9 12 9 Q15 9 17 11"
        fill="none"
        stroke={stroke}
        strokeWidth={0.6}
        strokeLinecap="round"
        opacity={0.45}
      />
      <line x1="5" y1="13" x2="19" y2="13" stroke={stroke} strokeWidth={0.5} opacity={0.3} />
    </g>
  );
}

function MineralCloud({
  isDark,
  color,
  small,
  palette,
}: { isDark: boolean; color: string; small?: boolean; palette?: IconPalette }) {
  const fill = palette
    ? palette.cloudBase
    : isDark
      ? 'rgba(60,70,120,0.85)'
      : 'rgba(180,200,240,0.80)';
  const hi = palette ? palette.cloudHi : color;
  const s = small ? 'translate(2,3) scale(0.78)' : undefined;
  return (
    <g transform={s}>
      <path
        d="M4 16 L6 10 L10 7 L14 6 L18 8 L20 12 L20 16 Z"
        fill={fill}
        stroke={hi}
        strokeWidth={0.6}
        opacity={0.88}
      />
      <path
        d="M10 7 L14 6 L18 8"
        fill="none"
        stroke={hi}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.7}
      />
      <path
        d="M4 16 L6 10 L10 7"
        fill="none"
        stroke={hi}
        strokeWidth={0.8}
        strokeLinecap="round"
        opacity={0.35}
      />
      <line x1="10" y1="7" x2="10" y2="16" stroke={hi} strokeWidth={0.5} opacity={0.22} />
    </g>
  );
}

function PaperCloud({
  isDark,
  small,
  id,
  palette,
}: { isDark: boolean; small?: boolean; id: string; palette?: IconPalette }) {
  const fill = palette
    ? palette.cloudBase
    : isDark
      ? 'rgba(80,60,35,0.80)'
      : 'rgba(200,180,140,0.78)';
  const shadow = palette
    ? palette.cloudShadow
    : isDark
      ? 'rgba(40,28,14,0.60)'
      : 'rgba(140,118,80,0.50)';
  const hi = palette ? palette.cloudHi : isDark ? 'rgba(120,95,55,0.55)' : 'rgba(240,220,175,0.65)';
  const edge = palette
    ? palette.cloudShadow
    : isDark
      ? 'rgba(60,42,20,0.35)'
      : 'rgba(120,95,55,0.30)';
  const s = small ? 'translate(3,3) scale(0.74)' : undefined;
  return (
    <g transform={s}>
      <defs>
        <filter id={`${id}-pw`} x="-30%" y="-40%" width="160%" height="180%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <filter id={`${id}-pe`} x="-10%" y="-20%" width="120%" height="140%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
      </defs>
      <ellipse
        cx="12"
        cy="13"
        rx="9"
        ry="5.5"
        fill={fill}
        filter={`url(#${id}-pw)`}
        opacity={0.72}
      />
      <ellipse
        cx="12"
        cy="12"
        rx="7.5"
        ry="4.5"
        fill={fill}
        filter={`url(#${id}-pe)`}
        opacity={0.9}
        stroke={edge}
        strokeWidth={0.5}
      />
      <ellipse
        cx="10"
        cy="9.5"
        rx="4"
        ry="3.5"
        fill={fill}
        filter={`url(#${id}-pe)`}
        opacity={0.75}
      />
      <ellipse
        cx="15"
        cy="10"
        rx="3.2"
        ry="3"
        fill={fill}
        filter={`url(#${id}-pe)`}
        opacity={0.68}
      />
      <ellipse
        cx="9.5"
        cy="9"
        rx="2.5"
        ry="1.8"
        fill={hi}
        filter={`url(#${id}-pe)`}
        opacity={0.6}
      />
      <ellipse
        cx="12"
        cy="15"
        rx="7"
        ry="2.5"
        fill={shadow}
        filter={`url(#${id}-pw)`}
        opacity={0.42}
      />
    </g>
  );
}

function SignalCloud({ accent, small }: { accent: string; small?: boolean }) {
  const blocks = small
    ? [{ x: 6, y: 9, w: 12, h: 7 }]
    : [
        { x: 3, y: 14, w: 5, h: 5 },
        { x: 6, y: 10, w: 5, h: 9 },
        { x: 9, y: 7, w: 6, h: 12 },
        { x: 13, y: 9, w: 5, h: 10 },
        { x: 16, y: 12, w: 5, h: 7 },
      ];
  return (
    <g>
      {blocks.map((b) => (
        <rect
          key={`rect-${b.x}-${b.y}`}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          fill={accent}
          opacity={0.3}
        />
      ))}
      {blocks.map((b) => (
        <line
          key={`hline-${b.x}-${b.y}`}
          x1={b.x}
          y1={b.y}
          x2={b.x + b.w}
          y2={b.y}
          stroke={accent}
          strokeWidth={1}
          opacity={0.85}
        />
      ))}
      {blocks.map((b) => (
        <line
          key={`lline-${b.x}-${b.y}`}
          x1={b.x}
          y1={b.y}
          x2={b.x}
          y2={b.y + b.h}
          stroke={accent}
          strokeWidth={0.6}
          opacity={0.5}
        />
      ))}
    </g>
  );
}

function AuroraCloud({
  color,
  small,
  id,
  palette,
}: { color: string; small?: boolean; id: string; palette?: IconPalette }) {
  const s = small ? 'translate(3,4) scale(0.73)' : undefined;
  const baseFill = palette?.cloudBase ?? color;
  const hiFill = palette?.cloudHi ?? color;
  return (
    <g transform={s}>
      <defs>
        <filter id={`${id}-ag`} x="-40%" y="-60%" width="180%" height="220%">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
        <filter id={`${id}-ac`} x="-20%" y="-30%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>
      <ellipse
        cx="12"
        cy="13"
        rx="10"
        ry="5"
        fill={baseFill}
        filter={`url(#${id}-ag)`}
        opacity={0.35}
      />
      <ellipse
        cx="12"
        cy="12"
        rx="7"
        ry="3.5"
        fill={baseFill}
        filter={`url(#${id}-ac)`}
        opacity={0.5}
      />
      <ellipse
        cx="10"
        cy="10.5"
        rx="3.5"
        ry="2"
        fill={hiFill}
        filter={`url(#${id}-ac)`}
        opacity={0.4}
      />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLOUD ROUTER
// ─────────────────────────────────────────────────────────────────────────────

function CloudShape({
  skin,
  isDark,
  accent,
  small,
  uid,
  palette,
}: {
  skin: WeatherSkin;
  isDark: boolean;
  accent: string;
  small?: boolean;
  uid: string;
  palette?: IconPalette;
}) {
  switch (skin) {
    case 'meridian':
      return <MeridianCloud isDark={isDark} small={small} palette={palette} />;
    case 'mineral':
      return <MineralCloud isDark={isDark} color={accent} small={small} palette={palette} />;
    case 'paper':
      return <PaperCloud isDark={isDark} small={small} id={uid} palette={palette} />;
    case 'signal':
      return <SignalCloud accent={palette?.cloudBase ?? accent} small={small} />;
    case 'aurora':
      return (
        <AuroraCloud
          color={palette?.cloudBase ?? accent}
          small={small}
          id={uid}
          palette={palette}
        />
      );
    default:
      return <FoundryCloud isDark={isDark} small={small} palette={palette} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PER-SKIN DROP / FLAKE / FOG RENDERERS
// ─────────────────────────────────────────────────────────────────────────────

interface DropDef {
  x: number;
  y: number;
  delay: number;
}
interface FlakeDef {
  x: number;
  y: number;
  delay: number;
  size: number;
}

function renderDrop(
  d: DropDef,
  i: number,
  skin: WeatherSkin,
  color: string,
  heavy: boolean,
  animate: boolean,
) {
  const len = heavy ? 6.5 : 5;
  const anim = animate ? { y1: [d.y, d.y + 2, d.y], opacity: [0.85, 0.25, 0.85] } : undefined;
  const trans = {
    duration: heavy ? 0.4 : 0.6,
    delay: d.delay,
    repeat: Number.POSITIVE_INFINITY,
    ease: 'easeInOut' as const,
  };

  switch (skin) {
    case 'meridian':
      return (
        <motion.line
          key={i}
          x1={d.x}
          y1={d.y}
          x2={d.x}
          y2={d.y + len * 0.85}
          stroke={color}
          strokeWidth={0.7}
          strokeLinecap="round"
          animate={anim}
          transition={trans}
        />
      );
    case 'mineral':
      return (
        <motion.line
          key={i}
          x1={d.x}
          y1={d.y}
          x2={d.x - len * 0.3}
          y2={d.y + len * 0.9}
          stroke={color}
          strokeWidth={heavy ? 1.8 : 1.4}
          strokeLinecap="round"
          animate={anim}
          transition={trans}
        />
      );
    case 'paper':
      return (
        <motion.line
          key={i}
          x1={d.x}
          y1={d.y}
          x2={d.x - 0.3}
          y2={d.y + len * 0.9}
          stroke={color}
          strokeWidth={heavy ? 1.5 : 1.2}
          strokeLinecap="round"
          style={{ filter: 'blur(0.4px)' }}
          animate={anim}
          transition={trans}
        />
      );
    case 'signal':
      return (
        <motion.rect
          key={i}
          x={d.x - 0.5}
          y={d.y}
          width={1}
          height={len}
          fill={color}
          animate={animate ? { opacity: [0.9, 0.2, 0.9] } : undefined}
          transition={trans}
        />
      );
    case 'aurora':
      return (
        <motion.line
          key={i}
          x1={d.x}
          y1={d.y}
          x2={d.x - 0.5}
          y2={d.y + len * 1.1}
          stroke={color}
          strokeWidth={heavy ? 1.4 : 1.1}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 2px ${color})` }}
          animate={anim}
          transition={trans}
        />
      );
    default:
      return (
        <motion.line
          key={i}
          x1={d.x}
          y1={d.y}
          x2={d.x - 1}
          y2={d.y + len}
          stroke={color}
          strokeWidth={heavy ? 1.6 : 1.4}
          strokeLinecap="round"
          animate={anim}
          transition={trans}
        />
      );
  }
}

function renderFlake(f: FlakeDef, i: number, skin: WeatherSkin, color: string, animate: boolean) {
  const anim = animate ? { cy: [f.y, f.y + 1.5, f.y], opacity: [0.85, 0.3, 0.85] } : undefined;
  const trans = {
    duration: 1.8 + i * 0.25,
    delay: f.delay,
    repeat: Number.POSITIVE_INFINITY,
    ease: 'easeInOut' as const,
  };
  const r = f.size;

  switch (skin) {
    case 'meridian':
      return (
        <motion.circle
          key={i}
          cx={f.x}
          cy={f.y}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={0.7}
          animate={anim}
          transition={trans}
        />
      );
    case 'mineral':
      return (
        <motion.rect
          key={i}
          x={f.x - r}
          y={f.y - r}
          width={r * 2}
          height={r * 2}
          fill={color}
          transform={`rotate(45 ${f.x} ${f.y})`}
          style={{ filter: `drop-shadow(0 0 ${r}px ${color})` }}
          animate={animate ? { opacity: [0.9, 0.3, 0.9] } : undefined}
          transition={trans}
        />
      );
    case 'paper':
      return (
        <motion.ellipse
          key={i}
          cx={f.x}
          cy={f.y}
          rx={r * 0.9}
          ry={r * 1.1}
          fill={color}
          style={{ filter: 'blur(0.5px)' }}
          animate={anim}
          transition={trans}
        />
      );
    case 'signal':
      return (
        <motion.rect
          key={i}
          x={f.x - r * 0.8}
          y={f.y - r * 0.8}
          width={r * 1.6}
          height={r * 1.6}
          fill={color}
          animate={animate ? { opacity: [0.9, 0.2, 0.9] } : undefined}
          transition={trans}
        />
      );
    case 'aurora':
      return (
        <motion.circle
          key={i}
          cx={f.x}
          cy={f.y}
          r={r}
          fill={color}
          style={{ filter: `drop-shadow(0 0 ${r * 2}px ${color})` }}
          animate={anim}
          transition={trans}
        />
      );
    default:
      return (
        <motion.circle
          key={i}
          cx={f.x}
          cy={f.y}
          r={r}
          fill={color}
          animate={anim}
          transition={trans}
        />
      );
  }
}

function renderFogLine(i: number, y: number, skin: WeatherSkin, color: string, animate: boolean) {
  const anim = animate ? { opacity: [0.45, 0.85, 0.45], x: [0, 1, 0] } : undefined;
  const trans = {
    duration: 3 + i * 0.6,
    delay: i * 0.5,
    repeat: Number.POSITIVE_INFINITY,
    ease: 'easeInOut' as const,
  };
  const widths = [14, 18, 13];
  const xs = [5, 3, 5.5];
  const w = widths[i] ?? 14;
  const x = xs[i] ?? 5;

  if (skin === 'signal') {
    return (
      <motion.rect
        key={i}
        x={x}
        y={y - 0.5}
        width={w}
        height={1}
        fill={color}
        opacity={0.6}
        animate={animate ? { opacity: [0.35, 0.75, 0.35] } : undefined}
        transition={trans}
      />
    );
  }
  if (skin === 'meridian') {
    return (
      <motion.line
        key={i}
        x1={x}
        y1={y}
        x2={x + w}
        y2={y}
        stroke={color}
        strokeWidth={0.8}
        strokeLinecap="butt"
        animate={anim}
        transition={trans}
      />
    );
  }
  if (skin === 'aurora') {
    return (
      <motion.line
        key={i}
        x1={x}
        y1={y}
        x2={x + w}
        y2={y}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        animate={anim}
        transition={trans}
      />
    );
  }
  return (
    <motion.line
      key={i}
      x1={x}
      y1={y}
      x2={x + w}
      y2={y}
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      animate={anim}
      transition={trans}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUN — per-skin variants
// ─────────────────────────────────────────────────────────────────────────────

function SunShape({
  skin,
  sunColor,
  rayColor,
  accent,
  animate,
  uid,
}: {
  skin: WeatherSkin;
  sunColor: string;
  rayColor: string;
  accent: string;
  animate: boolean;
  uid: string;
}) {
  switch (skin) {
    case 'meridian':
      return (
        <>
          <circle cx="12" cy="12" r="4.5" fill="none" stroke={sunColor} strokeWidth={0.9} />
          <circle cx="12" cy="12" r="1.8" fill={sunColor} />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const r = Math.PI / 180;
            return (
              <line
                key={deg}
                x1={12 + 6.5 * Math.cos(deg * r)}
                y1={12 + 6.5 * Math.sin(deg * r)}
                x2={12 + 8.5 * Math.cos(deg * r)}
                y2={12 + 8.5 * Math.sin(deg * r)}
                stroke={sunColor}
                strokeWidth={0.8}
                strokeLinecap="round"
              />
            );
          })}
        </>
      );

    case 'mineral': {
      const size = 4.5;
      return (
        <>
          <defs>
            <filter id={`${uid}-mglow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <polygon
            points={[0, 1, 2, 3, 4, 5]
              .map((i) => {
                const a = ((i * 60 - 30) * Math.PI) / 180;
                return `${12 + (size + 3.5) * Math.cos(a)},${12 + (size + 3.5) * Math.sin(a)}`;
              })
              .join(' ')}
            fill="none"
            stroke={accent}
            strokeWidth={0.6}
            opacity={0.45}
          />
          <motion.polygon
            points={`12,${12 - size} ${12 + size},12 12,${12 + size} ${12 - size},12`}
            fill={accent}
            filter={`url(#${uid}-mglow)`}
            animate={animate ? { opacity: [0.85, 1, 0.85] } : undefined}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          />
          <polygon points={`12,${12 - size} ${12 + size},12 12,12`} fill="white" opacity={0.35} />
        </>
      );
    }

    case 'paper': {
      return (
        <>
          <defs>
            <filter id={`${uid}-pbloom`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <filter id={`${uid}-pcore`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1" />
            </filter>
          </defs>
          <circle
            cx="12"
            cy="12"
            r="6"
            fill={sunColor}
            filter={`url(#${uid}-pbloom)`}
            opacity={0.4}
          />
          <motion.circle
            cx="12"
            cy="12"
            r="3.8"
            fill={sunColor}
            filter={`url(#${uid}-pcore)`}
            animate={animate ? { r: [3.8, 4.2, 3.8] } : undefined}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          />
        </>
      );
    }

    case 'signal': {
      return (
        <>
          <circle
            cx="12"
            cy="12"
            r="6"
            fill="none"
            stroke={accent}
            strokeWidth={0.8}
            opacity={0.7}
          />
          <line x1="12" y1="3" x2="12" y2="7" stroke={accent} strokeWidth={0.9} />
          <line x1="12" y1="17" x2="12" y2="21" stroke={accent} strokeWidth={0.9} />
          <line x1="3" y1="12" x2="7" y2="12" stroke={accent} strokeWidth={0.9} />
          <line x1="17" y1="12" x2="21" y2="12" stroke={accent} strokeWidth={0.9} />
          <motion.circle
            cx="12"
            cy="12"
            r="2"
            fill={accent}
            animate={animate ? { opacity: [0.5, 1, 0.5] } : undefined}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          />
          <path
            d="M7 7 L7 9 M7 7 L9 7"
            stroke={accent}
            strokeWidth={0.6}
            fill="none"
            opacity={0.55}
          />
          <path
            d="M17 7 L17 9 M17 7 L15 7"
            stroke={accent}
            strokeWidth={0.6}
            fill="none"
            opacity={0.55}
          />
        </>
      );
    }

    case 'aurora': {
      return (
        <>
          <defs>
            <filter id={`${uid}-acorona`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <filter id={`${uid}-amid`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          <motion.ellipse
            cx="12"
            cy="12"
            rx="8"
            ry="6"
            fill={accent}
            filter={`url(#${uid}-acorona)`}
            animate={animate ? { ry: [5, 7, 5] } : undefined}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
            opacity={0.4}
          />
          <motion.ellipse
            cx="12"
            cy="12"
            rx="5"
            ry="3.5"
            fill={accent}
            filter={`url(#${uid}-amid)`}
            animate={animate ? { rx: [4, 5.5, 4] } : undefined}
            transition={{
              duration: 2.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              delay: 0.4,
            }}
            opacity={0.55}
          />
          <motion.circle
            cx="12"
            cy="12"
            r="2.5"
            fill="white"
            animate={animate ? { r: [2.2, 3, 2.2] } : undefined}
            transition={{
              duration: 1.8,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              delay: 0.2,
            }}
            opacity={0.9}
          />
        </>
      );
    }

    default:
      return (
        <>
          <motion.circle
            cx="12"
            cy="12"
            r="4.2"
            fill={sunColor}
            animate={animate ? { r: [4.2, 4.6, 4.2] } : undefined}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          />
          <SunRays cx={12} cy={12} r={4.2} rayLen={2.6} stroke={rayColor} strokeWidth={1.4} />
        </>
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FOUNDRY PILL — PHASE-AWARE CLEAR & PARTLY-CLOUDY ICONS
// ─────────────────────────────────────────────────────────────────────────────
//
// Only rendered when skin="foundry" and phaseIcon !== 'sun'.
// Designed to read cleanly at 22 px against the pill's glass surface.
// All four variants use palette-derived colors so they respond to
// the phase blend (midnight deep-blue moon vs dusk warm-amber horizon etc).

function FoundryClearNight({
  p,
  animate,
  size,
}: { p: IconPalette; animate: boolean; size: number }) {
  const moon = p.moon;
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      {/* Crescent moon */}
      <motion.path
        d="M15 10.5A5.5 5.5 0 0 1 8.5 4c0-.28.02-.56.06-.83A5.5 5.5 0 1 0 15 10.5z"
        fill={moon}
        animate={animate ? { opacity: [0.8, 1, 0.8] } : undefined}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />
      {/* Stars — three sizes, staggered twinkle */}
      <motion.circle
        cx="19.2"
        cy="5.8"
        r="0.90"
        fill={moon}
        animate={animate ? { opacity: [0.4, 0.9, 0.4] } : undefined}
        transition={{
          duration: 2.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
          delay: 0.3,
        }}
      />
      <motion.circle
        cx="20.8"
        cy="10.5"
        r="0.65"
        fill={moon}
        animate={animate ? { opacity: [0.25, 0.7, 0.25] } : undefined}
        transition={{
          duration: 3.0,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
          delay: 1.1,
        }}
      />
      <motion.circle
        cx="18.5"
        cy="15.5"
        r="0.55"
        fill={moon}
        animate={animate ? { opacity: [0.2, 0.55, 0.2] } : undefined}
        transition={{
          duration: 2.6,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
          delay: 0.7,
        }}
      />
    </svg>
  );
}

function FoundryClearHorizon({
  p,
  animate,
  isDusk,
  size,
}: { p: IconPalette; animate: boolean; isDusk: boolean; size: number }) {
  const RAD = Math.PI / 180;
  const sun = p.sun;
  const ray = p.sunRay;
  // Three rays above the horizon only
  const rayAngles = isDusk ? [270, 225, 315] : [270, 240, 300];
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      {/* Horizon line */}
      <line
        x1="2"
        y1="15.5"
        x2="22"
        y2="15.5"
        stroke={sun}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={0.8}
      />
      {/* Rising/setting arc */}
      <path
        d="M6 15.5 A6 6 0 0 1 18 15.5"
        stroke={sun}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Glow core at horizon centre */}
      <motion.circle
        cx="12"
        cy="15.5"
        r="2.4"
        fill={sun}
        animate={animate ? { r: [2.2, 2.7, 2.2] } : undefined}
        transition={{
          duration: 3.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />
      {/* Three short rays above horizon */}
      {rayAngles.map((a) => (
        <line
          key={a}
          x1={12 + 5.5 * Math.cos(a * RAD)}
          y1={15.5 + 5.5 * Math.sin(a * RAD)}
          x2={12 + 7.5 * Math.cos(a * RAD)}
          y2={15.5 + 7.5 * Math.sin(a * RAD)}
          stroke={ray}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function FoundryPartlyCloudyNight({
  p,
  animate,
  uid: id,
  size,
}: { p: IconPalette; animate: boolean; uid: string; size: number }) {
  const moon = p.moon;
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      {/* Crescent — smaller, offset top-left so cloud overlaps naturally */}
      <g transform="translate(-0.5, -1.5) scale(0.68)" style={{ transformOrigin: '10px 10px' }}>
        <path
          d="M15 10.5A5.5 5.5 0 0 1 8.5 4c0-.28.02-.56.06-.83A5.5 5.5 0 1 0 15 10.5z"
          fill={moon}
          opacity={0.88}
        />
      </g>
      {/* Foundry cloud in front */}
      <g transform="translate(2, 5) scale(0.80)">
        <FoundryCloud isDark={p.isDarkUI} palette={p} />
      </g>
    </svg>
  );
}

function FoundryPartlyCloudyHorizon({
  p,
  animate,
  uid: id,
  isDusk,
  size,
}: {
  p: IconPalette;
  animate: boolean;
  uid: string;
  isDusk: boolean;
  size: number;
}) {
  const sun = p.sun;
  const RAD = Math.PI / 180;
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      {/* Mini horizon — offset up-left, sits behind the cloud */}
      <g transform="translate(-3, -4) scale(0.68)" style={{ opacity: 0.88 }}>
        <line
          x1="2"
          y1="15.5"
          x2="22"
          y2="15.5"
          stroke={sun}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity={0.8}
        />
        <path
          d="M6 15.5 A6 6 0 0 1 18 15.5"
          stroke={sun}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="12" cy="15.5" r="2.6" fill={sun} />
        {[270, 240, 300].map((a) => (
          <line
            key={a}
            x1={12 + 5.5 * Math.cos(a * RAD)}
            y1={15.5 + 5.5 * Math.sin(a * RAD)}
            x2={12 + 7.5 * Math.cos(a * RAD)}
            y2={15.5 + 7.5 * Math.sin(a * RAD)}
            stroke={sun}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        ))}
      </g>
      {/* Cloud in front */}
      <g transform="translate(2, 5) scale(0.80)">
        <FoundryCloud isDark={p.isDarkUI} palette={p} />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INDIVIDUAL ICONS
// ─────────────────────────────────────────────────────────────────────────────

let _uid = 0;
function uid() {
  return `wi${++_uid}`;
}

export function ClearIcon({
  mode,
  accentColor,
  size = 20,
  animate = true,
  skin = 'foundry',
  phaseColors,
  phaseIcon,
}: WeatherIconProps) {
  const p = resolvePalette({
    mode,
    accentColor,
    skin,
    phaseColors,
    size,
    animate,
  });
  const id = uid();

  // Render phase-appropriate variant instead of always showing sun
  if (phaseIcon && phaseIcon !== 'sun') {
    if (phaseIcon === 'moon') {
      return <FoundryClearNight p={p} animate={animate} size={size ?? 20} />;
    }
    if (phaseIcon === 'dawn') {
      return <FoundryClearHorizon p={p} animate={animate} isDusk={false} size={size ?? 20} />;
    }
    if (phaseIcon === 'dusk') {
      return <FoundryClearHorizon p={p} animate={animate} isDusk={true} size={size ?? 20} />;
    }
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      <SunShape
        skin={skin}
        sunColor={p.sun}
        rayColor={p.sunRay}
        accent={accentColor}
        animate={animate}
        uid={id}
      />
    </svg>
  );
}

export function PartlyCloudyIcon({
  mode,
  accentColor,
  size = 20,
  animate = true,
  skin = 'foundry',
  phaseColors,
  phaseIcon,
}: WeatherIconProps) {
  const p = resolvePalette({
    mode,
    accentColor,
    skin,
    phaseColors,
    size,
    animate,
  });
  const id = uid();

  // Render phase-appropriate variant instead of always showing sun+cloud
  if (phaseIcon && phaseIcon !== 'sun') {
    if (phaseIcon === 'moon') {
      return <FoundryPartlyCloudyNight p={p} animate={animate} uid={id} size={size ?? 20} />;
    }
    if (phaseIcon === 'dawn') {
      return (
        <FoundryPartlyCloudyHorizon
          p={p}
          animate={animate}
          uid={id}
          isDusk={false}
          size={size ?? 20}
        />
      );
    }
    if (phaseIcon === 'dusk') {
      return (
        <FoundryPartlyCloudyHorizon
          p={p}
          animate={animate}
          uid={id}
          isDusk={true}
          size={size ?? 20}
        />
      );
    }
  }

  const sunScale = skin === 'foundry' ? 1 : 0.82;
  const sunOffset = skin === 'foundry' ? { x: -2, y: -2 } : { x: -3, y: -3 };
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      <g transform={`translate(${sunOffset.x}, ${sunOffset.y}) scale(${sunScale})`} opacity={0.85}>
        <SunShape
          skin={skin}
          sunColor={p.sun}
          rayColor={p.sunRay}
          accent={accentColor}
          animate={false}
          uid={`${id}s`}
        />
      </g>
      <g transform="translate(2, 5) scale(0.80)">
        <CloudShape
          skin={skin}
          isDark={p.isDarkUI}
          accent={accentColor}
          uid={`${id}c`}
          palette={p}
        />
      </g>
    </svg>
  );
}

export function OvercastIcon({
  mode,
  accentColor,
  size = 20,
  animate = true,
  skin = 'foundry',
  phaseColors,
}: WeatherIconProps) {
  const p = resolvePalette({
    mode,
    accentColor,
    skin,
    phaseColors,
    size,
    animate,
  });
  const id = uid();
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      <g transform="translate(1, -2) scale(0.84)" opacity={0.55}>
        <CloudShape
          skin={skin}
          isDark={p.isDarkUI}
          accent={accentColor}
          uid={`${id}b`}
          palette={p}
        />
      </g>
      <CloudShape skin={skin} isDark={p.isDarkUI} accent={accentColor} uid={`${id}f`} palette={p} />
    </svg>
  );
}

export function FogIcon({
  mode,
  accentColor,
  size = 20,
  animate = true,
  skin = 'foundry',
  phaseColors,
}: WeatherIconProps) {
  const p = resolvePalette({
    mode,
    accentColor,
    skin,
    phaseColors,
    size,
    animate,
  });
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      {[{ y: 8 }, { y: 12 }, { y: 16 }].map((l, i) => renderFogLine(i, l.y, skin, p.fog, animate))}
    </svg>
  );
}

export function DrizzleIcon({
  mode,
  accentColor,
  size = 20,
  animate = true,
  skin = 'foundry',
  phaseColors,
}: WeatherIconProps) {
  const p = resolvePalette({
    mode,
    accentColor,
    skin,
    phaseColors,
    size,
    animate,
  });
  const id = uid();
  const drops: DropDef[] = [
    { x: 7, y: 14, delay: 0 },
    { x: 12, y: 12, delay: 0.3 },
    { x: 17, y: 14, delay: 0.6 },
  ];
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <g transform="translate(0, -2) scale(0.90)">
        <CloudShape
          skin={skin}
          isDark={p.isDarkUI}
          accent={accentColor}
          small
          uid={id}
          palette={p}
        />
      </g>
      {drops.map((d, i) => renderDrop(d, i, skin, p.rain, false, animate))}
    </svg>
  );
}

export function RainIcon({
  mode,
  accentColor,
  size = 20,
  animate = true,
  skin = 'foundry',
}: WeatherIconProps) {
  const c = colors(mode, accentColor, skin);
  const id = uid();
  const rainC = typeof c.rain === 'string' ? c.rain : accentColor;
  const drops: DropDef[] = [
    { x: 6, y: 13, delay: 0 },
    { x: 10.5, y: 12, delay: 0.18 },
    { x: 15, y: 13, delay: 0.36 },
    { x: 8, y: 16, delay: 0.09 },
    { x: 13, y: 16, delay: 0.27 },
  ];
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <g transform="translate(0, -1)">
        <CloudShape skin={skin} isDark={c.isDark} accent={accentColor} uid={id} />
      </g>
      {drops.map((d, i) => renderDrop(d, i, skin, rainC, false, animate))}
    </svg>
  );
}

export function HeavyRainIcon({
  mode,
  accentColor,
  size = 20,
  animate = true,
  skin = 'foundry',
}: WeatherIconProps) {
  const c = colors(mode, accentColor, skin);
  const id = uid();
  const rainC = typeof c.rain === 'string' ? c.rain : accentColor;
  const drops: DropDef[] = [
    { x: 5, y: 12, delay: 0 },
    { x: 8.5, y: 11, delay: 0.1 },
    { x: 12, y: 12, delay: 0.2 },
    { x: 15.5, y: 11, delay: 0.3 },
    { x: 19, y: 12, delay: 0.4 },
    { x: 6.5, y: 16, delay: 0.05 },
    { x: 10, y: 15.5, delay: 0.15 },
    { x: 13.5, y: 16, delay: 0.25 },
    { x: 17, y: 15.5, delay: 0.35 },
  ];
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <CloudShape skin={skin} isDark={c.isDark} accent={accentColor} uid={id} />
      {drops.map((d, i) => renderDrop(d, i, skin, rainC, true, animate))}
    </svg>
  );
}

export function SnowIcon({
  mode,
  accentColor,
  size = 20,
  animate = true,
  skin = 'foundry',
}: WeatherIconProps) {
  const c = colors(mode, accentColor, skin);
  const id = uid();
  const snowC = typeof c.snow === 'string' ? c.snow : accentColor;
  const flakes: FlakeDef[] = [
    { x: 7, y: 14.5, delay: 0, size: 1.8 },
    { x: 12, y: 13.5, delay: 0.4, size: 2.2 },
    { x: 17, y: 14.5, delay: 0.8, size: 1.8 },
  ];
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <g transform="translate(0, -1)">
        <CloudShape skin={skin} isDark={c.isDark} accent={accentColor} uid={id} />
      </g>
      {flakes.map((f, i) => renderFlake(f, i, skin, snowC, animate))}
    </svg>
  );
}

export function HeavySnowIcon({
  mode,
  accentColor,
  size = 20,
  animate = true,
  skin = 'foundry',
}: WeatherIconProps) {
  const c = colors(mode, accentColor, skin);
  const id = uid();
  const snowC = typeof c.snow === 'string' ? c.snow : accentColor;
  const flakes: FlakeDef[] = [
    { x: 5, y: 13, delay: 0, size: 2.0 },
    { x: 9, y: 12, delay: 0.25, size: 2.4 },
    { x: 13, y: 13, delay: 0.5, size: 2.0 },
    { x: 17, y: 12, delay: 0.75, size: 2.4 },
    { x: 7, y: 17, delay: 0.15, size: 1.7 },
    { x: 11, y: 16, delay: 0.4, size: 2.0 },
    { x: 15, y: 17, delay: 0.65, size: 1.7 },
  ];
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <CloudShape skin={skin} isDark={c.isDark} accent={accentColor} uid={id} />
      {flakes.map((f, i) => renderFlake(f, i, skin, snowC, animate))}
    </svg>
  );
}

export function ThunderIcon({
  mode,
  accentColor,
  size = 20,
  animate = true,
  skin = 'foundry',
}: WeatherIconProps) {
  const c = colors(mode, accentColor, skin);
  const id = uid();
  const boltC = typeof c.bolt === 'string' ? c.bolt : accentColor;

  function BoltShape() {
    if (skin === 'meridian') {
      return (
        <path
          d="M13.5 11.5 L10 17 L13 17 L9.5 23 L16 15 L12.5 15Z"
          fill="none"
          stroke={boltC}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      );
    }
    if (skin === 'mineral') {
      return (
        <>
          <path d="M14 11 L9.5 18 L13 18 L9 23 L17 14.5 L12.5 14.5Z" fill={boltC} />
          <path
            d="M14 11 L12.5 14.5 L17 14.5"
            fill="none"
            stroke="white"
            strokeWidth={0.7}
            opacity={0.5}
          />
        </>
      );
    }
    if (skin === 'paper') {
      return (
        <path
          d="M13.5 11 L10 17.5 L13 17.5 L9.5 23.5 L16 15 L12.5 15Z"
          fill={boltC}
          style={{ filter: 'blur(0.3px)' }}
        />
      );
    }
    if (skin === 'signal') {
      return (
        <>
          <rect x="11" y="11" width="3" height="5" fill={boltC} />
          <rect x="10" y="15" width="5" height="5" fill={boltC} opacity={0.7} />
        </>
      );
    }
    if (skin === 'aurora') {
      return (
        <path
          d="M13.5 11 L10 17 L13 17 L9.5 23 L16 15 L12.5 15Z"
          fill={boltC}
          style={{ filter: `drop-shadow(0 0 4px ${boltC})` }}
        />
      );
    }
    return <path d="M13.5 11.5 L10 17 L13 17 L9.5 23 L16 15 L12.5 15Z" fill={boltC} />;
  }

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <CloudShape skin={skin} isDark={c.isDark} accent={accentColor} uid={id} />
      <motion.g
        animate={animate ? { opacity: [1, 0.3, 1, 0.2, 1] } : undefined}
        transition={{
          duration: 3.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
          times: [0, 0.4, 0.5, 0.6, 1],
        }}
        style={{
          filter: skin !== 'meridian' ? `drop-shadow(0 0 3px ${boltC})` : undefined,
        }}
      >
        <BoltShape />
      </motion.g>
    </svg>
  );
}

export function LiveIcon({ mode, accentColor, size = 20, skin = 'foundry' }: WeatherIconProps) {
  const c = colors(mode, accentColor, skin);
  const fogC = typeof c.fog === 'string' ? c.fog : accentColor;
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 19 Q4 14 8 10 Q12 6 17 7"
        stroke={fogC}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M7 17 Q6.5 13.5 9.5 10.5 Q12.5 7.5 16 8"
        stroke={accentColor}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
        opacity={0.7}
      />
      <motion.circle
        cx="17.5"
        cy="7.5"
        r="2.2"
        fill={accentColor}
        animate={{ opacity: [1, 0.4, 1], r: [2.2, 2.6, 2.2] }}
        transition={{
          duration: 1.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />
      <line x1="5" y1="19" x2="7" y2="17" stroke={fogC} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<WeatherIconKey, React.ComponentType<WeatherIconProps>> = {
  clear: ClearIcon,
  'partly-cloudy': PartlyCloudyIcon,
  overcast: OvercastIcon,
  fog: FogIcon,
  drizzle: DrizzleIcon,
  rain: RainIcon,
  'heavy-rain': HeavyRainIcon,
  snow: SnowIcon,
  'heavy-snow': HeavySnowIcon,
  thunder: ThunderIcon,
  live: LiveIcon,
};

export function WeatherIcon({
  type,
  mode,
  accentColor,
  size = 20,
  animate = true,
  skin = 'foundry',
  phaseColors,
  phaseIcon,
}: { type: WeatherIconKey } & WeatherIconProps) {
  const Icon = ICON_MAP[type];
  return (
    <Icon
      mode={mode}
      accentColor={accentColor}
      size={size}
      animate={animate}
      skin={skin}
      phaseColors={phaseColors}
      phaseIcon={phaseIcon}
    />
  );
}
