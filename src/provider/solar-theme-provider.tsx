'use client';

// sol/src/provider/solar-theme-provider.tsx
// pages to lose the phase override on reload, snapping to a wrong clock phase.
// Phase override now persists through reloads via localStorage (sol-last-phase).
// Explicit "Go Live" in the showcase calls setOverridePhase(null) to clear both.
//
// simulatedDate added to context so SolarDevTools can push a time into all
// widgets without requiring props to be threaded through the call site.
//
// isolated prop: when true, the provider renders a wrapper <div> and scopes
// all CSS vars + data attributes to that element instead of document.documentElement.
// Required when rendering multiple SolarThemeProvider instances on the same page
// (e.g. the local test page showing all 10 skins simultaneously).

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import tzlookup from 'tz-lookup';
import {
  type SolarBlend,
  type SolarPhase,
  type SolarPosition,
  type UseSolarPositionReturn,
  useSolarPosition,
} from '../hooks/useSolarPosition';
import {
  readGeoCacheEntry,
  useCountryCodeFromGeolocation,
  writeGeoCacheEntry,
} from '../lib/geolocation';
import { injectWidgetCSS } from '../lib/inject-widget-css';
import { cityFromTimezone, fetchReverseGeocode } from '../lib/reverse-geocode';
import {
  UNIVERSAL_SEASON_MODIFIERS,
  applySeasonalModifier,
  resolveSeasonalModifier,
} from '../lib/seasonal-blend';
import { lerpHex } from '../lib/solar-lerp';
import { getSessionPhaseOverride, setSessionPhaseOverride } from '../lib/solar-phase-session';
import { getBrowserTimezone, getCentroidForTimezone } from '../lib/tz-centroids';
import { type Season, type SeasonalBlend, useSeason } from '../lib/useSeason';
import {
  ANIMATION_PRESETS,
  type MotionProfile,
  type ShaderAnimationPreset,
} from '../shared/shader-animation-presets';
import { type DesignMode, SKINS, type SkinDefinition } from '../skins/index';
import { SKIN_COPY } from '../widgets/skin-copy';
import type { CustomPalettes } from '../widgets/solar-widget.shell';

// ─── Context shape ────────────────────────────────────────────────────────────

export interface SolarTheme {
  phase: SolarPhase;
  isDaytime: boolean;
  brightness: number;
  mode: 'light' | 'dim' | 'dark';
  accentColor: string;
  // ← was SolarPosition | null — changed to UseSolarPositionReturn so
  //   consumers can access .isReady and .blend without a type error.
  solarPosition: UseSolarPositionReturn | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
  coordsReady: boolean;
  /**
   * Nearest city or locality name for the user's current position.
   *
   * Resolution happens in two phases:
   *  1. Instant (no permission): parsed from the IANA timezone string.
   *     "Europe/Copenhagen" → "Copenhagen"  (available immediately)
   *  2. Precise (after geolocation): reverse-geocoded from exact lat/lng.
   *     55.86°N, 9.84°E → "Horsens"        (replaces the centroid value)
   *
   * null only during the brief SSR window before the provider mounts.
   */
  city: string | null;
  /**
   * ISO 3166-1 alpha-2 country code for the user's current position,
   * e.g. "DK", "GB", "US". Resolved via geolocation (same source as city).
   * null until geolocation resolves or if permission is denied.
   */
  countryCode: string | null;
  setOverridePhase: (phase: SolarPhase | null) => void;
  blend: SolarBlend;
  design: DesignMode;
  setDesign: (design: DesignMode) => void;
  activeSkin: SkinDefinition;
  /** Simulated date pushed by SolarDevTools when scrubbing the timeline.
   *  Widgets read this as a fallback when no simulatedDate prop is passed. */
  simulatedDate: Date | undefined;
  setSimulatedDate: (date: Date | undefined) => void;
  /** Custom palette overrides registered by the nearest widget. */
  customPalettes: CustomPalettes | undefined;
  setCustomPalettes: (palettes: CustomPalettes | undefined) => void;
  /** Current dominant season. */
  season: Season;
  /** Full seasonal blend state (season, nextSeason, crossfade t). */
  seasonalBlend: SeasonalBlend;
  /** Override the auto-detected season, or pass null to restore auto-detection. */
  setSeasonOverride: (season: Season | null) => void;

  animationPreset: ShaderAnimationPreset;
  setAnimationPreset: (preset: ShaderAnimationPreset) => void;
  customMotionProfile: MotionProfile | undefined;
  setCustomMotionProfile: (profile: MotionProfile | undefined) => void;

  /**
   * Fluted glass overlay — vertical-stripe prism refraction over the solar gradient.
   * Toggleable by the user; persisted to localStorage.
   */
  flutedGlass: boolean;
  setFlutedGlass: (enabled: boolean) => void;

  /**
   * Pebbled glass overlay — Voronoi/cellular omnidirectional scatter over the solar gradient.
   * Toggleable by the user; persisted to localStorage.
   */
  pebbledGlass: boolean;
  setPebbledGlass: (enabled: boolean) => void;
}

// ─── Static lookups ───────────────────────────────────────────────────────────

const BRIGHTNESS: Record<SolarPhase, number> = {
  midnight: 0,
  night: 0.02,
  dawn: 0.15,
  sunrise: 0.35,
  morning: 0.65,
  'solar-noon': 1,
  afternoon: 0.8,
  sunset: 0.3,
  dusk: 0.1,
};

const PHASE_IS_DAYTIME: Record<SolarPhase, boolean> = {
  midnight: false,
  night: false,
  dawn: false,
  sunrise: false,
  morning: true,
  'solar-noon': true,
  afternoon: true,
  sunset: false,
  dusk: false,
};

const ALL_PHASES: SolarPhase[] = [
  'midnight',
  'night',
  'dawn',
  'sunrise',
  'morning',
  'solar-noon',
  'afternoon',
  'sunset',
  'dusk',
];

let _scopeCounter = 0;
function nextScopeId(): string {
  return `sol-scope-${++_scopeCounter}`;
}

function isValidSkin(value: unknown): value is DesignMode {
  return typeof value === 'string' && value in SKINS;
}

// ─── DOM helpers ──────────────────────────────────────────────────────────────

function htmlClassFromMode(mode: 'light' | 'dim' | 'dark'): 'dark' | 'light' {
  return mode === 'light' ? 'light' : 'dark';
}

/** In global mode (scopeEl = null), writes data attrs + dark/light class to <html>.
 *  In isolated mode, writes only data attrs to the scope container — the
 *  dark/light class is intentionally skipped since it would still be global. */
function applyPhaseToDOM(
  phase: SolarPhase,
  skin: SkinDefinition,
  scopeEl: HTMLElement | null,
): void {
  if (typeof document === 'undefined') return;
  const target = scopeEl ?? document.documentElement;
  target.setAttribute('data-solar-phase', phase);
  target.setAttribute('data-solar-skin', skin.id);
  if (!scopeEl) {
    const mode = skin.widgetPalettes[phase].mode;
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(htmlClassFromMode(mode));
  }
}

function readPhaseFromDOM(): SolarPhase | null {
  if (typeof document === 'undefined') return null;
  const attr = document.documentElement.getAttribute('data-solar-phase') as SolarPhase | null;
  if (attr && (ALL_PHASES as string[]).includes(attr)) return attr;
  return null;
}

/**
 * Resolve the phase to use before `useSolarPosition` is ready.
 *
 * Precedence:
 *  1. The `data-solar-phase` DOM attribute (set by a blocking init script
 *     in the host app — most accurate, runs at real load time in the browser).
 *  2. The `initialPhase` prop (caller-supplied — e.g. Whisk passes the phase
 *     it computed in its own init script that writes `data-wsk-phase`).
 *  3. A final hardcoded 'morning' fallback.
 *
 * The previous implementation always fell back to 'morning' when the DOM
 * attribute was missing, which caused a one-frame morning flash for host
 * apps using a different init-script attribute (e.g. Whisk's `data-wsk-phase`).
 */
function resolveInitialPhase(initialPhase?: SolarPhase): SolarPhase {
  return readPhaseFromDOM() ?? initialPhase ?? 'morning';
}

function readSkinFromDOM(): DesignMode {
  if (typeof document === 'undefined') return 'foundry';
  const attr = document.documentElement.getAttribute('data-solar-skin');
  if (isValidSkin(attr)) return attr;
  return 'foundry';
}

function coordsToTimezone(lat: number, lon: number): string | null {
  try {
    return tzlookup(lat, lon);
  } catch {
    return null;
  }
}

function fallbackCoordsFromTZ(tz: string): [number, number] | null {
  const centroid = getCentroidForTimezone(tz);
  return centroid ? [centroid.lat, centroid.lon] : null;
}

/** Approximate distance in metres between two lat/lng points (equirectangular —
 *  accurate enough at the small distances we care about). */
function metersBetween(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * 111_000;
  const dLon = (lon2 - lon1) * 111_000 * Math.cos((lat1 * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

/** Minimum movement before we bother hitting the reverse-geocode API again.
 *  Prevents API spam + city flicker while `watch` streams near-identical fixes. */
const GEOCODE_MOVE_THRESHOLD_M = 250;

// ─── CSS var writer ───────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace('#', '');
  if (h.length !== 6) return null;
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ];
}

function hexAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(128,128,128,${alpha})`;
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
}

function getAccentFg(accent: string): string {
  const rgb = hexToRgb(accent);
  if (!rgb) return '#ffffff';
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 128 ? '#1a1a1a' : '#ffffff';
}

/** Writes CSS custom properties.
 *  - scopeId = undefined  →  writes to :root  (global / singleton mode)
 *  - scopeId = "sol-scope-3"  →  writes to #sol-scope-3  (isolated mode)
 *    The scoped vars override :root vars for all descendants of that wrapper div. */
function writeCssVars(
  skin: SkinDefinition,
  phase: SolarPhase,
  t = 0,
  nextPhase?: SolarPhase,
  scopeId?: string,
  seasonal?: { blend: SeasonalBlend; disabled: boolean },
): void {
  if (typeof document === 'undefined') return;
  const from = skin.phaseVars[phase];
  const to = skin.phaseVars[nextPhase ?? phase];
  const lerp = (a: string, b: string) => (t > 0 ? lerpHex(a, b, t) : a);

  const textPrimary = lerp(from.textPrimary, to.textPrimary);
  const textSecondary = lerp(from.textSecondary, to.textSecondary);
  const accent = lerp(from.accent, to.accent);
  const bgBase = lerp(from.bgBase, to.bgBase);
  const bgDeep = lerp(from.bgDeep, to.bgDeep);
  const surface = lerp(from.surface, to.surface);

  const shaderPalFrom = skin.shaderPalettes[phase];
  const shaderPalTo = skin.shaderPalettes[nextPhase ?? phase];

  let shaderVignette =
    t > 0 ? lerpHex(shaderPalFrom.vignette, shaderPalTo.vignette, t) : shaderPalFrom.vignette;
  let shaderColorBack =
    t > 0 ? lerpHex(shaderPalFrom.colorBack, shaderPalTo.colorBack, t) : shaderPalFrom.colorBack;
  const shaderFallback = shaderPalFrom.cssFallback;

  if (seasonal && !seasonal.disabled) {
    const mod = resolveSeasonalModifier(seasonal.blend, {
      ...UNIVERSAL_SEASON_MODIFIERS,
      ...skin.seasonalModifiers,
    });
    const tempPalette = applySeasonalModifier(
      { ...shaderPalFrom, vignette: shaderVignette, colorBack: shaderColorBack },
      mod,
    );
    shaderVignette = tempPalette.vignette;
    shaderColorBack = tempPalette.colorBack;
  }

  // In global mode, also keep the data-solar-skin attribute on <html> in sync.
  if (!scopeId) {
    const root = document.documentElement;
    if (root.getAttribute('data-solar-skin') !== skin.id) {
      root.setAttribute('data-solar-skin', skin.id);
    }
  }

  const selector = scopeId ? `#${scopeId}` : ':root';
  const styleId = scopeId ? `solar-runtime-theme-${scopeId}` : 'solar-runtime-theme';

  let sheet = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!sheet) {
    sheet = document.createElement('style');
    sheet.id = styleId;
    document.head.appendChild(sheet);
  }

  sheet.textContent = `${selector} {--solar-text-primary:${textPrimary} !important;--solar-text-secondary:${textSecondary} !important;--solar-accent:${accent} !important;--solar-surface:${surface} !important;--solar-bg-base:${bgBase} !important;--solar-bg-deep:${bgDeep} !important;--solar-text-faded:${hexAlpha(textSecondary, 0.5)} !important;--solar-input-bg:${hexAlpha(bgBase, 0.6)} !important;--solar-input-border:${hexAlpha(accent, 0.28)} !important;--solar-input-placeholder:${hexAlpha(textSecondary, 0.38)} !important;--solar-accent-fg:${getAccentFg(accent)} !important;--solar-headline-font:${SKIN_COPY[skin.id]?.headlineFont ?? 'inherit'} !important;--solar-body-font:${SKIN_COPY[skin.id]?.subtextFont ?? 'inherit'} !important;--solar-shader-fallback:${shaderFallback} !important;--solar-shader-vignette:radial-gradient(ellipse 85% 70% at 50% 50%, transparent 0%, ${shaderVignette} 100%) !important;--solar-shader-bg:${shaderColorBack} !important;}`;
}

// ─── Design persistence ───────────────────────────────────────────────────────

const DESIGN_STORAGE_KEY = 'solar-widget-design';

// ─── Glass effect persistence ─────────────────────────────────────────────────

const FLUTED_GLASS_STORAGE_KEY = 'solar-fluted-glass';
const PEBBLED_GLASS_STORAGE_KEY = 'solar-pebbled-glass';

// ─── Animation preset persistence ────────────────────────────────────────────

const ANIMATION_STORAGE_KEY = 'solar-animation-preset';

// ─── Context default ──────────────────────────────────────────────────────────

const noop = () => {};

const SSR_PHASE: SolarPhase = 'morning';
const SSR_SKIN: SkinDefinition = SKINS.foundry;

const SolarThemeCtx = createContext<SolarTheme>({
  phase: SSR_PHASE,
  isDaytime: PHASE_IS_DAYTIME[SSR_PHASE],
  brightness: BRIGHTNESS[SSR_PHASE],
  mode: SSR_SKIN.widgetPalettes[SSR_PHASE].mode,
  accentColor: SSR_SKIN.phaseVars[SSR_PHASE].accent,
  solarPosition: null,
  timezone: null,
  latitude: null,
  longitude: null,
  coordsReady: false,
  city: null,
  countryCode: null,
  setOverridePhase: noop,
  blend: { phase: SSR_PHASE, nextPhase: SSR_PHASE, t: 0 },
  design: 'foundry',
  setDesign: noop,
  activeSkin: SSR_SKIN,
  simulatedDate: undefined,
  setSimulatedDate: noop,
  customPalettes: undefined,
  setCustomPalettes: noop,
  season: 'spring',
  seasonalBlend: { season: 'spring', nextSeason: 'spring', t: 0 },
  setSeasonOverride: noop,
  animationPreset: 'foundry',
  setAnimationPreset: noop,
  customMotionProfile: undefined,
  setCustomMotionProfile: noop,
  flutedGlass: false,
  setFlutedGlass: noop,
  pebbledGlass: false,
  setPebbledGlass: noop,
});

export function useSolarTheme(): SolarTheme {
  return useContext(SolarThemeCtx);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface Props {
  children: ReactNode;
  initialDesign?: DesignMode;
  /**
   * Phase to use before the solar position has been computed.
   * The host app's blocking init script (e.g. Whisk's `data-wsk-phase` writer)
   * generally knows the correct phase before React mounts. Passing it here
   * prevents the one-frame 'morning' flash on first paint when neither the
   * DOM attribute (`data-solar-phase`) nor `solar.isReady` are available.
   */
  initialPhase?: SolarPhase;
  /**
   * When true, the provider renders a wrapper <div style="display:contents">
   * and scopes all CSS vars to that element via a unique #id selector rather
   * than :root. Use this when multiple providers exist on the same page
   * (e.g. a skin showcase / test page). Defaults to false.
   */
  isolated?: boolean;
  /**
   * Force a specific season, bypassing astronomical computation.
   * Useful for testing, user preferences, or themed marketing pages.
   */
  seasonOverride?: Season;
  /**
   * Opt out of seasonal palette blending entirely.
   * When true, palettes are exactly as defined in the skin. Default: false.
   */
  disableSeasonalBlend?: boolean;
  /**
   * Initial animation preset to use for the shader background.
   * Persisted across reloads (localStorage); falls back to 'foundry' if unset.
   */
  initialAnimationPreset?: ShaderAnimationPreset;
  /**
   * Initial state for the fluted glass overlay.
   * Persisted across reloads (localStorage); falls back to false if unset.
   */
  initialFlutedGlass?: boolean;
  /**
   * Initial state for the pebbled glass overlay.
   * Persisted across reloads (localStorage); falls back to false if unset.
   */
  initialPebbledGlass?: boolean;
  /**
   * Custom reverse geocoder. When provided, called instead of the built-in
   * BigDataCloud lookup to resolve a precise city/locality from coordinates.
   * Use this to inject a village-accurate geocoder (e.g. Nominatim) in your own
   * app while keeping sol dependency-free by default.
   */
  reverseGeocoder?: (lat: number, lng: number, signal?: AbortSignal) => Promise<string | null>;
}

export function SolarThemeProvider({
  children,
  initialDesign = 'foundry',
  initialPhase,
  isolated = false,
  seasonOverride: seasonOverrideProp,
  disableSeasonalBlend = false,
  initialAnimationPreset,
  initialFlutedGlass,
  initialPebbledGlass,
  reverseGeocoder,
}: Props) {
  const geo = useCountryCodeFromGeolocation({
    immediate: true,
    watch: true,
    // Force GPS instead of network/Wi-Fi/IP positioning. Without this the
    // browser defaults to coarse positioning that can land tens of km away
    // (e.g. on a regional ISP hub), making the nearest-city lookup resolve to
    // the wrong town. GPS gives ±5–20 m, which correctly resolves small
    // localities.
    enableHighAccuracy: true,
  });

  // Stable scope ID — only meaningful when isolated=true.
  const scopeIdRef = useRef<string | undefined>(isolated ? nextScopeId() : undefined);
  const scopeId = scopeIdRef.current;

  // Ref to the wrapper div — resolved after first paint in isolated mode.
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Tracks the last timezone we applied a coarse city for, and the last position
  // we reverse-geocoded. Both gate work in the watch:true geolocation effect so
  // streaming fixes don't re-flash the coarse city or spam the geocode API.
  const lastTzRef = useRef<string | null>(null);
  const lastGeocodeRef = useRef<{ lat: number; lon: number } | null>(null);

  // ── Coords state ────────────────────────────────────────────────────────────
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [timezone, setTimezone] = useState<string | null>(null);
  const [coordsReady, setCoordsReady] = useState(false);
  const [city, setCity] = useState<string | null>(null);

  // ── Simulated date — set by SolarDevTools when scrubbing ──────────────────
  const [simulatedDate, setSimulatedDate] = useState<Date | undefined>(undefined);

  // ── Custom palettes — registered by widgets so DevTools can read them ─────
  const [customPalettes, setCustomPalettes] = useState<CustomPalettes | undefined>(undefined);

  // ── Animation preset state ───────────────────────────────────────────────────
  const [animationPreset, setAnimationPresetState] = useState<ShaderAnimationPreset>(() => {
    if (typeof window === 'undefined' || isolated) {
      return initialAnimationPreset ?? 'foundry';
    }
    try {
      const stored = localStorage.getItem(ANIMATION_STORAGE_KEY) as ShaderAnimationPreset | null;
      if (stored && (stored === 'custom' || stored in ANIMATION_PRESETS)) return stored;
    } catch {}
    return initialAnimationPreset ?? 'foundry';
  });
  const [customMotionProfile, setCustomMotionProfile] = useState<MotionProfile | undefined>(
    undefined,
  );
  const setAnimationPreset = useCallback(
    (preset: ShaderAnimationPreset) => {
      setAnimationPresetState(preset);
      if (!isolated) {
        try {
          localStorage.setItem(ANIMATION_STORAGE_KEY, preset);
        } catch {}
      }
    },
    [isolated],
  );

  // ── Fluted glass state ────────────────────────────────────────────────────
  const [flutedGlass, setFlutedGlassState] = useState<boolean>(() => {
    if (typeof window === 'undefined' || isolated) return initialFlutedGlass ?? false;
    try {
      const stored = localStorage.getItem(FLUTED_GLASS_STORAGE_KEY);
      if (stored !== null) return stored === 'true';
    } catch {}
    return initialFlutedGlass ?? false;
  });
  const setFlutedGlass = useCallback(
    (enabled: boolean) => {
      setFlutedGlassState(enabled);
      if (!isolated) {
        try {
          localStorage.setItem(FLUTED_GLASS_STORAGE_KEY, String(enabled));
        } catch {}
      }
    },
    [isolated],
  );

  // ── Pebbled glass state ───────────────────────────────────────────────────
  const [pebbledGlass, setPebbledGlassState] = useState<boolean>(() => {
    if (typeof window === 'undefined' || isolated) return initialPebbledGlass ?? false;
    try {
      const stored = localStorage.getItem(PEBBLED_GLASS_STORAGE_KEY);
      if (stored !== null) return stored === 'true';
    } catch {}
    return initialPebbledGlass ?? false;
  });
  const setPebbledGlass = useCallback(
    (enabled: boolean) => {
      setPebbledGlassState(enabled);
      if (!isolated) {
        try {
          localStorage.setItem(PEBBLED_GLASS_STORAGE_KEY, String(enabled));
        } catch {}
      }
    },
    [isolated],
  );

  // ── Design state ─────────────────────────────────────────────────────────────
  const [design, setDesignState] = useState<DesignMode>(initialDesign);

  // ── Post-mount: persist the initial design to DOM + localStorage ────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only effect
  useEffect(() => {
    if (isolated) return;
    try {
      document.documentElement.setAttribute('data-solar-skin', design);
      localStorage.setItem(DESIGN_STORAGE_KEY, design);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Phase override — seeded from sessionStorage/localStorage on mount ─────
  const [overridePhase, setOverridePhaseState] = useState<SolarPhase | null>(() => {
    if (typeof window === 'undefined') return null;
    if (isolated) return null;
    return getSessionPhaseOverride();
  });

  // ── Inject critical CSS utilities (idempotent) ───────────────────────────────
  useLayoutEffect(() => {
    injectWidgetCSS();
  }, []);

  // ── Geo init: runs once before first paint ──────────────────────────────────
  useLayoutEffect(() => {
    const browserTZ = getBrowserTimezone();
    setTimezone(browserTZ);
    lastTzRef.current = browserTZ;

    // Phase 1 — instant city from the timezone string (e.g. "Copenhagen").
    setCity(cityFromTimezone(browserTZ));
    const coords = fallbackCoordsFromTZ(browserTZ);
    if (coords) {
      setLatitude(coords[0]);
      setLongitude(coords[1]);
      setCoordsReady(true);
    }

    // Phase 2 — override synchronously with the last known precise location from
    // localStorage so the FIRST render already shows the real city (e.g.
    // "Herning") instead of the timezone-centroid city, with no reload needed.
    // A fresh geolocation fix (watch:true) still refines this moments later.
    if (!isolated) {
      const cached = readGeoCacheEntry();
      if (cached) {
        setLatitude(cached.latitude);
        setLongitude(cached.longitude);
        setCoordsReady(true);
        if (cached.city) {
          setCity(cached.city);
        }
      }
    }
  }, [isolated]);

  // ── Design setter ────────────────────────────────────────────────────────────
  const setDesign = useCallback(
    (d: DesignMode) => {
      setDesignState(d);
      if (!isolated) {
        try {
          localStorage.setItem(DESIGN_STORAGE_KEY, d);
        } catch {}
        try {
          document.cookie = `solar-widget-design=${d}; Path=/; Max-Age=31536000; SameSite=Lax`;
        } catch {}
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-solar-skin', d);
        }
      }
    },
    [isolated],
  );

  const activeSkin = SKINS[design];

  // ── Seasonal blend ──────────────────────────────────────────────────────────
  const [seasonOverrideState, setSeasonOverrideState] = useState<Season | undefined>(
    seasonOverrideProp,
  );
  const effectiveSeasonOverride = seasonOverrideProp ?? seasonOverrideState;
  const seasonalBlend = useSeason(latitude, effectiveSeasonOverride, simulatedDate);
  const setSeasonOverride = useCallback(
    (s: Season | null) => setSeasonOverrideState(s ?? undefined),
    [],
  );

  // ── Override phase setter ────────────────────────────────────────────────────
  const setOverridePhase = useCallback(
    (phase: SolarPhase | null) => {
      setOverridePhaseState(phase);
      if (!isolated) setSessionPhaseOverride(phase);
    },
    [isolated],
  );

  // ── Geolocation updates ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!geo.position?.coords) return;

    const { latitude: lat, longitude: lon } = geo.position.coords;

    setLatitude(lat);
    setLongitude(lon);
    setCoordsReady(true);

    const tz = coordsToTimezone(lat, lon);
    if (tz) {
      setTimezone(tz);
      // Only fall back to the coarse timezone-city when the timezone actually
      // changes (e.g. the user travels to a new region). Re-applying it on
      // every watch fix would overwrite the precise reverse-geocoded city and
      // cause the Copenhagen↔Herning flicker.
      if (tz !== lastTzRef.current) {
        setCity(cityFromTimezone(tz));
        lastTzRef.current = tz;
      }
    }

    // Skip the reverse-geocode if we haven't meaningfully moved since the last
    // lookup — watch streams near-identical fixes every few seconds, and
    // re-fetching each time both flickers the city and burns the API quota.
    const last = lastGeocodeRef.current;
    if (last && metersBetween(lat, lon, last.lat, last.lon) < GEOCODE_MOVE_THRESHOLD_M) {
      return;
    }
    lastGeocodeRef.current = { lat, lon };

    // Precise reverse geocode — refines "Copenhagen" → "Horsens", etc.
    const controller = new AbortController();
    const geocode = reverseGeocoder ?? fetchReverseGeocode;
    geocode(lat, lon, controller.signal).then((name) => {
      if (name) setCity(name);
      // Cache the precise position so the next page load hydrates this city
      // instantly instead of falling back to the timezone-centroid city.
      if (!isolated) {
        writeGeoCacheEntry({
          latitude: lat,
          longitude: lon,
          city: name ?? null,
          countryCode: geo.countryCode ?? null,
        });
      }
    });
    return () => controller.abort();
  }, [geo.position, geo.countryCode, isolated, reverseGeocoder]);

  useEffect(() => {
    if (coordsReady) return;
    if (geo.permission === 'denied' || geo.error) {
      setCoordsReady(true);
      return;
    }
    const timer = setTimeout(() => setCoordsReady(true), 3000);
    return () => clearTimeout(timer);
  }, [coordsReady, geo.permission, geo.error]);

  // ── Solar position ────────────────────────────────────────────────────────────
  const solar = useSolarPosition({
    latitude,
    longitude,
    timezone,
    updateIntervalMs: 5_000,
    initialPhase,
  });

  const activePhase: SolarPhase =
    overridePhase ?? (solar.isReady ? solar.phase : resolveInitialPhase(initialPhase));
  const activeBlend: SolarBlend = overridePhase
    ? { phase: overridePhase, nextPhase: overridePhase, t: 0 }
    : solar.isReady
      ? solar.blend
      : { phase: activePhase, nextPhase: activePhase, t: 0 };

  // ── Apply phase + skin to DOM ──────────────────────────────────────────────
  useLayoutEffect(() => {
    applyPhaseToDOM(activePhase, activeSkin, isolated ? wrapperRef.current : null);
  }, [activePhase, activeSkin, isolated]);

  // ── Write CSS vars ─────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    writeCssVars(activeSkin, activeBlend.phase, activeBlend.t, activeBlend.nextPhase, scopeId, {
      blend: seasonalBlend,
      disabled: disableSeasonalBlend,
    });

    if (!isolated && !document.documentElement.hasAttribute('data-solar-ready')) {
      requestAnimationFrame(() => {
        document.documentElement.setAttribute('data-solar-ready', '');
      });
    }
  }, [activeSkin, activeBlend, scopeId, isolated, seasonalBlend, disableSeasonalBlend]);

  // ── Cleanup scoped style tag on unmount ────────────────────────────────────
  useEffect(() => {
    if (!scopeId) return;
    return () => {
      document.getElementById(`solar-runtime-theme-${scopeId}`)?.remove();
    };
  }, [scopeId]);

  // ── Theme value ────────────────────────────────────────────────────────────
  const palette = activeSkin.widgetPalettes[activePhase] ?? activeSkin.widgetPalettes.morning;
  const phaseVars = activeSkin.phaseVars[activePhase] ?? activeSkin.phaseVars.morning;

  const theme: SolarTheme = {
    phase: activePhase,
    isDaytime: PHASE_IS_DAYTIME[activePhase],
    brightness: BRIGHTNESS[activePhase],
    mode: palette.mode,
    accentColor: phaseVars.accent,
    solarPosition: solar, // solar is UseSolarPositionReturn — matches the updated interface type
    timezone,
    latitude,
    longitude,
    coordsReady,
    city,
    countryCode: geo.countryCode ?? null,
    setOverridePhase,
    blend: activeBlend,
    design,
    setDesign,
    activeSkin,
    simulatedDate,
    setSimulatedDate,
    customPalettes,
    setCustomPalettes,
    season: seasonalBlend.season,
    seasonalBlend,
    setSeasonOverride,
    animationPreset,
    setAnimationPreset,
    customMotionProfile,
    setCustomMotionProfile,
    flutedGlass,
    setFlutedGlass,
    pebbledGlass,
    setPebbledGlass,
  };

  if (isolated) {
    return (
      <SolarThemeCtx.Provider value={theme}>
        <div
          ref={wrapperRef}
          id={scopeId}
          data-solar-phase={activePhase}
          data-solar-skin={activeSkin.id}
          style={{ display: 'contents' }}
        >
          {children}
        </div>
      </SolarThemeCtx.Provider>
    );
  }

  return <SolarThemeCtx.Provider value={theme}>{children}</SolarThemeCtx.Provider>;
}
