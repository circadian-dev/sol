'use client';
// ════════════════════════════════════════════════════════════════════════════
// FILE: components/solar-shader-bg.client.tsx
// ════════════════════════════════════════════════════════════════════════════

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { SolarBlend, SolarPhase } from '../hooks/useSolarPosition';
import {
  UNIVERSAL_SEASON_MODIFIERS,
  applySeasonalModifier,
  resolveSeasonalModifier,
} from '../lib/seasonal-blend';
import { lerpColor } from '../lib/solar-lerp';
import type { SeasonalBlend } from '../lib/useSeason';
import { useSolarTheme } from '../provider/solar-theme-provider';
import type {
  ShaderImage,
  ShaderMotion,
  ShaderPalette,
  SkinDefinition,
} from '../skins/types/widget-skin.types';
import {
  type MotionProfile,
  type ShaderAnimationPreset,
  resolveAnimationPreset,
} from './shader-animation-presets';
import { SKIN_MOTION_PROFILES, UNIVERSAL_PHASE_MOTION } from './shader-motion-profiles';

// ─── Variant context ──────────────────────────────────────────────────────────

export type ShaderVariant = 'showcase' | 'dashboard' | 'editorial';

const ShaderVariantCtx = createContext<ShaderVariant>('showcase');

export function ShaderVariantProvider({
  variant,
  children,
}: {
  variant: ShaderVariant;
  children: React.ReactNode;
}) {
  return <ShaderVariantCtx.Provider value={variant}>{children}</ShaderVariantCtx.Provider>;
}

export function useShaderVariant(): ShaderVariant {
  return useContext(ShaderVariantCtx);
}

// ─── Dashboard motion modifier ────────────────────────────────────────────────

const DASHBOARD_MOTION_SCALE = {
  speed: 0.45,
  distortion: 0.5,
  swirl: 0.4,
  grainOverlay: 1.3,
} as const;

const DASHBOARD_OPACITY_SCALE = 0.65;

function applyDashboardMotion(m: ShaderMotion): ShaderMotion {
  return {
    speed: m.speed * DASHBOARD_MOTION_SCALE.speed,
    distortion: m.distortion * DASHBOARD_MOTION_SCALE.distortion,
    swirl: m.swirl * DASHBOARD_MOTION_SCALE.swirl,
    grainOverlay: Math.min(1, m.grainOverlay * DASHBOARD_MOTION_SCALE.grainOverlay),
  };
}

// ─── Editorial motion modifier ────────────────────────────────────────────────

const EDITORIAL_MOTION_SCALE = {
  speed: 0.3,
  distortion: 0.35,
  swirl: 0.25,
  grainOverlay: 1.4,
} as const;

const EDITORIAL_OPACITY_SCALE = 0.35;

function applyEditorialMotion(m: ShaderMotion): ShaderMotion {
  return {
    speed: m.speed * EDITORIAL_MOTION_SCALE.speed,
    distortion: m.distortion * EDITORIAL_MOTION_SCALE.distortion,
    swirl: m.swirl * EDITORIAL_MOTION_SCALE.swirl,
    grainOverlay: Math.min(1, m.grainOverlay * EDITORIAL_MOTION_SCALE.grainOverlay),
  };
}

function mixToward(hex: string, target: string, mix: number): string {
  return lerpColor(hex, target, mix);
}

function applyEditorialPalette(p: ShaderPalette): ShaderPalette {
  const darkBase = '#08080c';
  const darkVignette = '#030306';
  return {
    ...p,
    colors: p.colors.map((c) => mixToward(c, darkBase, 0.92)) as [string, string, string, string],
    colorBack: mixToward(p.colorBack, darkBase, 0.95),
    vignette: mixToward(p.vignette, darkVignette, 0.9),
    cssFallback: `linear-gradient(135deg, ${darkBase} 0%, #0c0c14 100%)`,
  };
}

// ─── Interpolation helpers ────────────────────────────────────────────────────

function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpMotion(a: ShaderMotion, b: ShaderMotion, t: number): ShaderMotion {
  return {
    distortion: lerpNum(a.distortion, b.distortion, t),
    swirl: lerpNum(a.swirl, b.swirl, t),
    speed: lerpNum(a.speed, b.speed, t),
    grainOverlay: lerpNum(a.grainOverlay, b.grainOverlay, t),
  };
}

function lerpPalette(a: ShaderPalette, b: ShaderPalette, t: number): ShaderPalette {
  return {
    colors: a.colors.map((ca, i) => lerpColor(ca, b.colors[i] ?? ca, t)) as [
      string,
      string,
      string,
      string,
    ],
    colorBack: lerpColor(a.colorBack, b.colorBack, t),
    opacity: lerpNum(a.opacity, b.opacity, t),
    vignette: lerpColor(a.vignette, b.vignette, t),
    cssFallback: a.cssFallback,
    image: a.image,
  };
}

// ─── Motion profile resolution ────────────────────────────────────────────────

function resolveMotionProfile(skin: SkinDefinition): Record<SolarPhase, ShaderMotion> {
  if (skin.shaderMotion) return skin.shaderMotion;
  return SKIN_MOTION_PROFILES[skin.id] ?? UNIVERSAL_PHASE_MOTION;
}

// ─── Image config resolution ──────────────────────────────────────────────────

function resolveImage(skin: SkinDefinition, palette: ShaderPalette): ShaderImage | undefined {
  return palette.image ?? skin.defaultImage;
}

// ─── Core config computation ──────────────────────────────────────────────────

function computeConfig(
  skin: SkinDefinition,
  blend: SolarBlend,
  seasonal?: { blend: SeasonalBlend; disabled: boolean },
  motionOverride?: MotionProfile,
) {
  const motionProfile = motionOverride ?? resolveMotionProfile(skin);
  const { phase, nextPhase, t } = blend;
  let palette = lerpPalette(skin.shaderPalettes[phase], skin.shaderPalettes[nextPhase], t);

  if (seasonal && !seasonal.disabled) {
    const mod = resolveSeasonalModifier(seasonal.blend, {
      ...UNIVERSAL_SEASON_MODIFIERS,
      ...skin.seasonalModifiers,
    });
    palette = applySeasonalModifier(palette, mod);
  }

  return {
    palette,
    motion: lerpMotion(motionProfile[phase], motionProfile[nextPhase], t),
  };
}

// ─── Hex → RGB helper ─────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        Number.parseInt(result[1], 16) / 255,
        Number.parseInt(result[2], 16) / 255,
        Number.parseInt(result[3], 16) / 255,
      ]
    : [0, 0, 0];
}

// ─── WebGL SolarFlare shader ──────────────────────────────────────────────────

const VS_SOURCE = `#version 300 es
  in vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FS_SOURCE = `#version 300 es
  precision highp float;

  uniform vec2 r;          // resolution
  uniform float t;         // time
  uniform vec3 u_bg;       // background color (colorBack)
  uniform vec3 u_c0;       // palette color 0
  uniform vec3 u_c1;       // palette color 1
  uniform vec3 u_c2;       // palette color 2
  uniform vec3 u_c3;       // palette color 3
  uniform float u_intensity;
  uniform float u_spread;
  uniform float u_pulseRate;
  uniform float u_speed;
  uniform float u_grain;

  out vec4 o;

  // Hash for grain
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec4 FC = gl_FragCoord;
    vec2 p = (FC.xy * 2. - r) / r.y;

    // Average all 4 palette colors
    vec3 avgColor = (u_c0 + u_c1 + u_c2 + u_c3) * 0.25;

    // Normalize to a fixed luminance so the flare shape is identical
    // across all skins regardless of how bright/dark the palette is.
    float lum = dot(avgColor, vec3(0.299, 0.587, 0.114));
    vec3 flareColor = lum > 0.001
      ? avgColor * (0.30 / lum)
      : vec3(0.30);

    // Solar flare radiance
    float l = u_intensity - length(p);

    o = tanh(
      vec4(flareColor, 0.0)
      / max(l, -l * u_spread)
      / exp(
        mod(dot(FC, sin(FC.yxyx)) + t * u_speed, 2.0)
        + sin(t * u_speed + sin(t * u_speed / u_pulseRate + p.y))
      )
    );

    // Film grain
    float grain = (hash(FC.xy + fract(t)) - 0.5) * u_grain;

    // Composite: background + flare glow + grain
    o = vec4(u_bg + o.rgb + grain, 1.0);
  }
`;

interface SolarFlareCanvasProps {
  backgroundColor: string;
  colors: [string, string, string, string];
  speed: number;
  intensity: number;
  spread: number;
  pulseRate: number;
  grain: number;
}

function SolarFlareCanvas({
  backgroundColor,
  colors,
  speed,
  intensity,
  spread,
  pulseRate,
  grain,
}: SolarFlareCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const configRef = useRef({
    backgroundColor,
    colors,
    speed,
    intensity,
    spread,
    pulseRate,
    grain,
  });

  useEffect(() => {
    configRef.current = {
      backgroundColor,
      colors,
      speed,
      intensity,
      spread,
      pulseRate,
      grain,
    };
  }, [backgroundColor, colors, speed, intensity, spread, pulseRate, grain]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = createShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const loc = {
      r: gl.getUniformLocation(program, 'r'),
      t: gl.getUniformLocation(program, 't'),
      bg: gl.getUniformLocation(program, 'u_bg'),
      c0: gl.getUniformLocation(program, 'u_c0'),
      c1: gl.getUniformLocation(program, 'u_c1'),
      c2: gl.getUniformLocation(program, 'u_c2'),
      c3: gl.getUniformLocation(program, 'u_c3'),
      intensity: gl.getUniformLocation(program, 'u_intensity'),
      spread: gl.getUniformLocation(program, 'u_spread'),
      pulseRate: gl.getUniformLocation(program, 'u_pulseRate'),
      speed: gl.getUniformLocation(program, 'u_speed'),
      grain: gl.getUniformLocation(program, 'u_grain'),
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(canvas.offsetWidth * dpr);
      canvas.height = Math.round(canvas.offsetHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const startTime = performance.now();

    const render = () => {
      const cfg = configRef.current;
      gl.useProgram(program);

      gl.uniform2f(loc.r, canvas.width, canvas.height);
      gl.uniform1f(loc.t, (performance.now() - startTime) / 1000);

      const bg = hexToRgb(cfg.backgroundColor);
      gl.uniform3f(loc.bg, bg[0], bg[1], bg[2]);

      const c0 = hexToRgb(cfg.colors[0]);
      const c1 = hexToRgb(cfg.colors[1]);
      const c2 = hexToRgb(cfg.colors[2]);
      const c3 = hexToRgb(cfg.colors[3]);
      gl.uniform3f(loc.c0, c0[0], c0[1], c0[2]);
      gl.uniform3f(loc.c1, c1[0], c1[1], c1[2]);
      gl.uniform3f(loc.c2, c2[0], c2[1], c2[2]);
      gl.uniform3f(loc.c3, c3[0], c3[1], c3[2]);

      gl.uniform1f(loc.intensity, cfg.intensity);
      gl.uniform1f(loc.spread, cfg.spread);
      gl.uniform1f(loc.pulseRate, cfg.pulseRate);
      gl.uniform1f(loc.speed, cfg.speed);
      gl.uniform1f(loc.grain, cfg.grain);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
}

// ─── Fluted Glass shader ──────────────────────────────────────────────────────
// Vertical-stripe prism refraction. Reads the solar gradient palette directly —
// no shared framebuffer needed. Parameters mirror @paper-design/shaders-react
// FlutedGlass props for familiarity: size, distortion, shadows, highlights, angle.

const FG_VS = `#version 300 es
  in vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const FG_FS = `#version 300 es
precision highp float;

uniform vec2  r;
uniform vec3  u_bg;
uniform vec3  u_c0, u_c1, u_c2, u_c3;
uniform float u_size;        // stripe width  (0–1)
uniform float u_distortion;  // refraction power
uniform float u_shadows;     // shadow intensity at stripe edges
uniform float u_highlights;  // highlight intensity at stripe centres
uniform float u_angle;       // stripe angle in radians

out vec4 o;

// Reconstruct the solar gradient from palette colors.
// Mirrors the luminance-normalisation in SolarFlareCanvas so the
// fluted texture always reads cleanly regardless of skin brightness.
vec3 sampleGradient(vec2 uv) {
  float d   = length(uv - vec2(0.5));
  vec3  mid = u_c0 * 0.4 + u_c1 * 0.3 + u_c2 * 0.2 + u_c3 * 0.1;
  float lum = dot(mid, vec3(0.299, 0.587, 0.114));
  mid = lum > 0.001 ? mid * (0.28 / lum) : vec3(0.28);
  return mix(mid + u_bg * 0.6, u_bg, smoothstep(0.1, 0.95, d * 1.7));
}

void main() {
  vec2 uv = gl_FragCoord.xy / r;
  uv.y = 1.0 - uv.y;

  // Rotate for angled stripes
  vec2  p  = uv - 0.5;
  float ca = cos(u_angle), sa = sin(u_angle);
  float sc = p.x * ca + p.y * sa;   // position along stripe axis
  vec2  perp = vec2(-sa, ca);        // perpendicular displacement direction

  // Stripe position and fractional offset within stripe (–0.5 → 0.5)
  float density = 1.0 / max(0.004, u_size * 0.10);
  float sf      = fract(sc * density) - 0.5;

  // Prism: displace sample UV along the perpendicular axis
  vec2 sUV = clamp(uv + perp * sf * u_distortion * 0.35, 0.0, 1.0);
  vec3 col  = sampleGradient(sUV);

  // Shadow at stripe edges
  float edge = abs(sf) * 2.0;
  col *= 1.0 - pow(edge, 2.5) * u_shadows * 0.65;

  // Highlight at stripe centre
  float hl = pow(max(0.0, 1.0 - edge * 6.0), 3.0) * u_highlights;
  col += hl * 0.35;

  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

interface FlutedGlassCanvasProps {
  colors: [string, string, string, string];
  backgroundColor: string;
  size: number;
  distortion: number;
  shadows: number;
  highlights: number;
  angle: number; // degrees
}

function FlutedGlassCanvas({
  colors,
  backgroundColor,
  size,
  distortion,
  shadows,
  highlights,
  angle,
}: FlutedGlassCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const cfgRef = useRef({ colors, backgroundColor, size, distortion, shadows, highlights, angle });

  useEffect(() => {
    cfgRef.current = { colors, backgroundColor, size, distortion, shadows, highlights, angle };
  }, [colors, backgroundColor, size, distortion, shadows, highlights, angle]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    const mkShader = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = mkShader(gl.VERTEX_SHADER, FG_VS);
    const fs = mkShader(gl.FRAGMENT_SHADER, FG_FS);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const loc = {
      r: gl.getUniformLocation(prog, 'r'),
      bg: gl.getUniformLocation(prog, 'u_bg'),
      c0: gl.getUniformLocation(prog, 'u_c0'),
      c1: gl.getUniformLocation(prog, 'u_c1'),
      c2: gl.getUniformLocation(prog, 'u_c2'),
      c3: gl.getUniformLocation(prog, 'u_c3'),
      size: gl.getUniformLocation(prog, 'u_size'),
      distortion: gl.getUniformLocation(prog, 'u_distortion'),
      shadows: gl.getUniformLocation(prog, 'u_shadows'),
      highlights: gl.getUniformLocation(prog, 'u_highlights'),
      angle: gl.getUniformLocation(prog, 'u_angle'),
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(canvas.offsetWidth * dpr);
      canvas.height = Math.round(canvas.offsetHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      const c = cfgRef.current;
      gl.useProgram(prog);
      gl.uniform2f(loc.r, canvas.width, canvas.height);

      const bg = hexToRgb(c.backgroundColor);
      gl.uniform3f(loc.bg, bg[0], bg[1], bg[2]);

      const [r0, g0, b0] = hexToRgb(c.colors[0]);
      const [r1, g1, b1] = hexToRgb(c.colors[1]);
      const [r2, g2, b2] = hexToRgb(c.colors[2]);
      const [r3, g3, b3] = hexToRgb(c.colors[3]);
      gl.uniform3f(loc.c0, r0, g0, b0);
      gl.uniform3f(loc.c1, r1, g1, b1);
      gl.uniform3f(loc.c2, r2, g2, b2);
      gl.uniform3f(loc.c3, r3, g3, b3);

      gl.uniform1f(loc.size, c.size);
      gl.uniform1f(loc.distortion, c.distortion);
      gl.uniform1f(loc.shadows, c.shadows);
      gl.uniform1f(loc.highlights, c.highlights);
      gl.uniform1f(loc.angle, c.angle * (Math.PI / 180));

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}

// ─── Pebbled Glass shader ─────────────────────────────────────────────────────
// Voronoi/cellular omnidirectional scatter. Each cell displaces the sample UV
// toward its centre, creating the organic hammered-glass look.
// No angle param — isotropic by definition.

const PG_VS = `#version 300 es
  in vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const PG_FS = `#version 300 es
precision highp float;

uniform vec2  r;
uniform vec3  u_bg;
uniform vec3  u_c0, u_c1, u_c2, u_c3;
uniform float u_size;        // cell density (0–1)
uniform float u_distortion;  // displacement strength
uniform float u_highlights;  // cell-edge specular brightness

out vec4 o;

// ── Helpers ────────────────────────────────────────────────────────────────

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

// Voronoi returning (displacement-toward-nearest-centre, distance-to-nearest-centre).
// Static — no time uniform — so the cell pattern is stable (no animation).
vec3 voronoi(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float minDist = 8.0;
  vec2  minDisp = vec2(0.0);

  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point    = hash2(i + neighbor);   // jittered cell centre
      vec2 diff     = neighbor + point - f;
      float dist    = length(diff);
      if (dist < minDist) {
        minDist = dist;
        minDisp = diff;
      }
    }
  }
  return vec3(minDisp, minDist);
}

// Reconstructs solar gradient — identical normalisation to SolarFlareCanvas.
vec3 sampleGradient(vec2 uv) {
  float d   = length(uv - vec2(0.5));
  vec3  mid = u_c0 * 0.4 + u_c1 * 0.3 + u_c2 * 0.2 + u_c3 * 0.1;
  float lum = dot(mid, vec3(0.299, 0.587, 0.114));
  mid = lum > 0.001 ? mid * (0.28 / lum) : vec3(0.28);
  return mix(mid + u_bg * 0.6, u_bg, smoothstep(0.1, 0.95, d * 1.7));
}

void main() {
  vec2 uv = gl_FragCoord.xy / r;
  uv.y = 1.0 - uv.y;

  float density = max(1.0, u_size * 80.0);
  vec3  vCell   = voronoi(uv * density);

  vec2  disp = vCell.xy;
  float dist = vCell.z;

  // Displace sample UV toward cell centre — omnidirectional
  vec2 sUV = clamp(uv + disp / density * u_distortion * 0.4, 0.0, 1.0);
  vec3 col  = sampleGradient(sUV);

  // Specular highlight at cell boundaries
  float edgeGlow = pow(smoothstep(0.3, 0.6, dist), 3.0) * u_highlights;
  col += edgeGlow * 0.3;

  // Soft interior shadow pocket
  float interior = pow(max(0.0, 1.0 - dist * 2.2), 2.0) * 0.15;
  col *= 1.0 - interior;

  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

interface PebbledGlassCanvasProps {
  colors: [string, string, string, string];
  backgroundColor: string;
  size: number;
  distortion: number;
  highlights: number;
}

function PebbledGlassCanvas({
  colors,
  backgroundColor,
  size,
  distortion,
  highlights,
}: PebbledGlassCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const cfgRef = useRef({ colors, backgroundColor, size, distortion, highlights });

  useEffect(() => {
    cfgRef.current = { colors, backgroundColor, size, distortion, highlights };
  }, [colors, backgroundColor, size, distortion, highlights]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    const mkShader = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = mkShader(gl.VERTEX_SHADER, PG_VS);
    const fs = mkShader(gl.FRAGMENT_SHADER, PG_FS);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const loc = {
      r: gl.getUniformLocation(prog, 'r'),
      bg: gl.getUniformLocation(prog, 'u_bg'),
      c0: gl.getUniformLocation(prog, 'u_c0'),
      c1: gl.getUniformLocation(prog, 'u_c1'),
      c2: gl.getUniformLocation(prog, 'u_c2'),
      c3: gl.getUniformLocation(prog, 'u_c3'),
      size: gl.getUniformLocation(prog, 'u_size'),
      distortion: gl.getUniformLocation(prog, 'u_distortion'),
      highlights: gl.getUniformLocation(prog, 'u_highlights'),
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(canvas.offsetWidth * dpr);
      canvas.height = Math.round(canvas.offsetHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      const c = cfgRef.current;
      gl.useProgram(prog);
      gl.uniform2f(loc.r, canvas.width, canvas.height);

      const bg = hexToRgb(c.backgroundColor);
      gl.uniform3f(loc.bg, bg[0], bg[1], bg[2]);

      const [r0, g0, b0] = hexToRgb(c.colors[0]);
      const [r1, g1, b1] = hexToRgb(c.colors[1]);
      const [r2, g2, b2] = hexToRgb(c.colors[2]);
      const [r3, g3, b3] = hexToRgb(c.colors[3]);
      gl.uniform3f(loc.c0, r0, g0, b0);
      gl.uniform3f(loc.c1, r1, g1, b1);
      gl.uniform3f(loc.c2, r2, g2, b2);
      gl.uniform3f(loc.c3, r3, g3, b3);

      gl.uniform1f(loc.size, c.size);
      gl.uniform1f(loc.distortion, c.distortion);
      gl.uniform1f(loc.highlights, c.highlights);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}

// ─── Client-side mount tracking ───────────────────────────────────────────────
let _hasHydrated = false;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SolarShaderBgProps {
  skinOverride?: SkinDefinition;
  blendOverride?: SolarBlend;
  opacityOverride?: number;
  variant?: ShaderVariant;
  /**
   * Force a specific animation preset for this background, ignoring whatever
   * the SolarThemeProvider context has set. Useful for previews / pickers.
   */
  animationPresetOverride?: ShaderAnimationPreset;
  /**
   * When `animationPresetOverride` (or the context preset) is `'custom'`,
   * this profile is used as the motion source. Ignored otherwise.
   */
  customMotionProfileOverride?: MotionProfile;
  className?: string;
  style?: React.CSSProperties;

  // ── Fluted glass overrides ──────────────────────────────────────────────
  /** Force fluted glass on/off for this instance, ignoring context. */
  flutedGlassOverride?: boolean;
  /** Stripe width. 0–1, default 0.5. */
  flutedGlassSize?: number;
  /** Refraction power. 0–1, default 0.5. */
  flutedGlassDistortion?: number;
  /** Shadow intensity at stripe edges. 0–1, default 0.25. */
  flutedGlassShadows?: number;
  /** Highlight intensity at stripe centres. 0–1, default 0.15. */
  flutedGlassHighlights?: number;
  /** Stripe angle in degrees. 0 = vertical, default 0. */
  flutedGlassAngle?: number;

  // ── Pebbled glass overrides ─────────────────────────────────────────────
  /** Force pebbled glass on/off for this instance, ignoring context. */
  pebbledGlassOverride?: boolean;
  /** Cell density. 0–1, default 0.5. */
  pebbledGlassSize?: number;
  /** Displacement strength. 0–1, default 0.4. */
  pebbledGlassDistortion?: number;
  /** Cell-edge specular brightness. 0–1, default 0.6. */
  pebbledGlassHighlights?: number;
}

// ─── SolarShaderBg ────────────────────────────────────────────────────────────

export function SolarShaderBg({
  skinOverride,
  blendOverride,
  opacityOverride,
  variant: variantProp,
  animationPresetOverride,
  customMotionProfileOverride,
  className,
  style,
  flutedGlassOverride,
  flutedGlassSize,
  flutedGlassDistortion,
  flutedGlassShadows,
  flutedGlassHighlights,
  flutedGlassAngle,
  pebbledGlassOverride,
  pebbledGlassSize,
  pebbledGlassDistortion,
  pebbledGlassHighlights,
}: SolarShaderBgProps = {}) {
  const theme = useSolarTheme();
  const {
    activeSkin,
    blend: contextBlend,
    seasonalBlend,
    animationPreset: contextPreset,
    customMotionProfile: contextCustom,
    flutedGlass: contextFluted,
    pebbledGlass: contextPebbled,
  } = theme;
  const contextVariant = useShaderVariant();

  const skin = skinOverride ?? activeSkin;
  const blend = blendOverride ?? contextBlend;
  const variant = variantProp ?? contextVariant;
  const seasonal = { blend: seasonalBlend, disabled: false };

  const effectivePreset = animationPresetOverride ?? contextPreset;
  const effectiveCustom = customMotionProfileOverride ?? contextCustom;
  const resolvedMotionProfile = effectivePreset
    ? resolveAnimationPreset(effectivePreset, effectiveCustom)
    : undefined;

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional fine-grained deps
  const { palette, motion: rawMotion } = useMemo(
    () => computeConfig(skin, blend, seasonal, resolvedMotionProfile),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      blend.phase,
      blend.nextPhase,
      blend.t,
      skin,
      seasonalBlend.season,
      seasonalBlend.t,
      effectivePreset,
      effectiveCustom,
    ],
  );

  const variantPalette = variant === 'editorial' ? applyEditorialPalette(palette) : palette;

  const shaderMotion =
    variant === 'dashboard'
      ? applyDashboardMotion(rawMotion)
      : variant === 'editorial'
        ? applyEditorialMotion(rawMotion)
        : rawMotion;

  const resolvedOpacity =
    opacityOverride ??
    (variant === 'dashboard'
      ? variantPalette.opacity * DASHBOARD_OPACITY_SCALE
      : variant === 'editorial'
        ? variantPalette.opacity * EDITORIAL_OPACITY_SCALE
        : variantPalette.opacity);

  const imageConfig = resolveImage(skin, variantPalette);

  const showFluted = flutedGlassOverride ?? contextFluted;
  const showPebbled = pebbledGlassOverride ?? contextPebbled;

  const [mounted, setMounted] = useState(_hasHydrated);
  useLayoutEffect(() => {
    _hasHydrated = true;
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--solar-shader-bg', variantPalette.colorBack);
    return () => {
      document.documentElement.style.removeProperty('--solar-shader-bg');
    };
  }, [variantPalette.colorBack]);

  // Map shader motion → SolarFlare parameters
  const flareSpeed = 0.6 + shaderMotion.speed * 0.8;
  const flareIntensity = 3.5 + shaderMotion.distortion * 0.5;
  const flareSpread = 8.0 + shaderMotion.swirl * 8.0;
  const flarePulseRate = 0.4 + (1.0 - shaderMotion.swirl) * 0.5;
  const flareGrain = shaderMotion.grainOverlay * 0.12;

  return (
    <div
      className={className}
      suppressHydrationWarning
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: variantPalette.cssFallback || variantPalette.colorBack,
        ...style,
      }}
    >
      {mounted && (
        <>
          {/* ── Layer 1: WebGL SolarFlare ──────────────────────────────── */}
          <div className="absolute inset-0" style={{ opacity: resolvedOpacity }}>
            <SolarFlareCanvas
              backgroundColor={variantPalette.colorBack}
              colors={variantPalette.colors}
              speed={flareSpeed}
              intensity={flareIntensity}
              spread={flareSpread}
              pulseRate={flarePulseRate}
              grain={flareGrain}
            />
          </div>

          {/* ── Layer 2: Atmospheric image ─────────────────────────────── */}
          {imageConfig && (
            <div
              className="absolute inset-0"
              aria-hidden
              style={{
                opacity: imageConfig.opacity ?? 0.18,
                pointerEvents: 'none',
                background: 'var(--solar-accent)',
                WebkitMaskImage: `url(${imageConfig.src})`,
                maskImage: `url(${imageConfig.src})`,
                WebkitMaskSize: 'cover',
                maskSize: 'cover',
                WebkitMaskPosition: imageConfig.objectPosition ?? 'center center',
                maskPosition: imageConfig.objectPosition ?? 'center center',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
              }}
            />
          )}

          {/* ── Layer 3: Vignette ──────────────────────────────────────── */}
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              pointerEvents: 'none',
              background: `radial-gradient(ellipse 85% 70% at 50% 50%, transparent 0%, ${variantPalette.vignette} 100%)`,
            }}
          />

          {/* ── Layer 4: Fluted glass (opt-in) ─────────────────────────── */}
          {showFluted && (
            <div className="absolute inset-0" aria-hidden style={{ pointerEvents: 'none' }}>
              <FlutedGlassCanvas
                colors={variantPalette.colors}
                backgroundColor={variantPalette.colorBack}
                size={flutedGlassSize ?? 0.5}
                distortion={flutedGlassDistortion ?? 0.5}
                shadows={flutedGlassShadows ?? 0.25}
                highlights={flutedGlassHighlights ?? 0.15}
                angle={flutedGlassAngle ?? 0}
              />
            </div>
          )}

          {/* ── Layer 5: Pebbled glass (opt-in) ────────────────────────── */}
          {showPebbled && (
            <div className="absolute inset-0" aria-hidden style={{ pointerEvents: 'none' }}>
              <PebbledGlassCanvas
                colors={variantPalette.colors}
                backgroundColor={variantPalette.colorBack}
                size={pebbledGlassSize ?? 0.5}
                distortion={pebbledGlassDistortion ?? 0.4}
                highlights={pebbledGlassHighlights ?? 0.6}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── SolarShaderBgFull ────────────────────────────────────────────────────────

export function SolarShaderBgFull(props: SolarShaderBgProps = {}) {
  return <SolarShaderBg {...props} style={{ zIndex: 0, ...props.style }} />;
}

// ─── useSolarShaderConfig ─────────────────────────────────────────────────────

export function useSolarShaderConfig(
  opts: {
    skinOverride?: SkinDefinition;
    blendOverride?: SolarBlend;
    animationPresetOverride?: ShaderAnimationPreset;
    customMotionProfileOverride?: MotionProfile;
  } = {},
) {
  const {
    activeSkin,
    blend: contextBlend,
    seasonalBlend,
    animationPreset: contextPreset,
    customMotionProfile: contextCustom,
  } = useSolarTheme();
  const skin = opts.skinOverride ?? activeSkin;
  const blend = opts.blendOverride ?? contextBlend;
  const seasonal = { blend: seasonalBlend, disabled: false };

  const effectivePreset = opts.animationPresetOverride ?? contextPreset;
  const effectiveCustom = opts.customMotionProfileOverride ?? contextCustom;
  const resolvedMotionProfile = effectivePreset
    ? resolveAnimationPreset(effectivePreset, effectiveCustom)
    : undefined;

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional fine-grained deps
  return useMemo(
    () => computeConfig(skin, blend, seasonal, resolvedMotionProfile),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      blend.phase,
      blend.nextPhase,
      blend.t,
      skin,
      seasonalBlend.season,
      seasonalBlend.t,
      effectivePreset,
      effectiveCustom,
    ],
  );
}
