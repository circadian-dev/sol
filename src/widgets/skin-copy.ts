import type { DesignMode } from '../skins';

export interface SkinCopy {
  text: string;
  fadedText: string;
  subtext: string;
  headlineFont: string;
  subtextFont: string;
  features: string[];
}

export const SKIN_COPY: Record<DesignMode, SkinCopy> = {
  foundry: {
    text: 'the sun is your',
    fadedText: 'design system.',
    headlineFont: "'SF Pro Display','Helvetica Neue',sans-serif",
    subtextFont: "'SF Pro Text','Helvetica Neue',sans-serif",
    subtext:
      'Nine phases. No toggles. Your interface adapts to the real position of the sun — dawn colours at dawn, midday clarity at noon, deep night after dark. Drop it in and the sky does the rest.',
    features: [
      '9 solar phases — dawn to midnight',
      'Geolocation-aware with country flags',
      'Live weather with animated overlays',
      'Fully customizable phase colors',
      'CSS variables for your entire app',
    ],
  },
  signal: {
    text: 'your interface',
    fadedText: 'reads the sky.',
    headlineFont: "'JetBrains Mono','Fira Code','Cascadia Code','Menlo',monospace",
    subtextFont: "'JetBrains Mono','Fira Code','Cascadia Code','Menlo',monospace",
    subtext:
      "Nine solar phases. One live signal. Sol reads the sun's position and broadcasts it straight to your UI — no config, no manual toggles, just raw environmental data driving your design.",
    features: [
      'PHASES: 9 // midnight → dawn → noon',
      'GEO: live coords + country ISO flag',
      'WX: animated overlays, 10 conditions',
      'PALETTE: override any phase bg[0–2]',
      'OUTPUT: --css-vars across your app',
    ],
  },
  paper: {
    text: 'light rewrites',
    fadedText: 'your interface.',
    headlineFont: "'Georgia','Times New Roman',serif",
    subtextFont: "'Georgia','Times New Roman',serif",
    subtext:
      'Nine phases, rendered like ink on uncoated stock. Sol tracks the sun and shifts your palette with it — warm morning cream, harsh midday white, deep night ink. Time, made visible.',
    features: [
      'Nine phases, dawn through midnight',
      'Location-aware, with country flags',
      'Live weather, softly illustrated',
      'Every phase colour, yours to set',
      'CSS custom properties, site-wide',
    ],
  },
  mineral: {
    text: 'every phase',
    fadedText: 'has a stone.',
    headlineFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtextFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtext:
      "Nine solar phases, each mapped to a mineral. Sol reads the sun's position and surfaces the right colour — obsidian at midnight, citrine at morning, rose quartz at dusk. The earth, in your UI.",
    features: [
      '9 phases — each mapped to a stone',
      'Geolocation with country flags',
      'Live weather with animated overlays',
      'Fully customizable phase colors',
      'CSS variables for your entire app',
    ],
  },
  meridian: {
    text: 'time of day,',
    fadedText: 'by design.',
    headlineFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtextFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtext:
      'Nine phases. Zero friction. Sol tracks the sun and keeps your interface in sync — light surfaces in the morning, dark ones after sunset. Clean, quiet, automatic. Design that knows the time.',
    features: [
      '9 solar phases, dawn to midnight',
      'Geolocation-aware with country flags',
      'Live weather with animated overlays',
      'Fully customizable phase colors',
      'CSS variables for your entire app',
    ],
  },
  aurora: {
    text: 'the sky moves',
    fadedText: 'through your app.',
    headlineFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtextFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtext:
      'Nine solar phases with aurora as their canvas. Sol reads the sun and shifts the atmosphere — bands fade in at dusk, reach peak saturation at midnight, dissolve quietly by dawn. The sky, inside your UI.',
    features: [
      '9 phases — dusk to midnight aurora',
      'Geolocation with country flags',
      'Live weather, animated overlays',
      'Customizable phase colors',
      'CSS variables across your app',
    ],
  },
  tide: {
    text: 'the coast knows',
    fadedText: 'what hour it is.',
    headlineFont:
      "'Barlow Condensed','Inter Condensed','SF Pro Display','Helvetica Neue',sans-serif",
    subtextFont: "'Barlow Condensed','Inter Condensed','SF Pro Text','Helvetica Neue',sans-serif",
    subtext:
      'Nine tidal phases. The orb rides a sine wave — deep swells at midnight, flat calm at noon, choppy at the turning of the tide. Bioluminescent at night. Surface shimmer by day. The ocean, in your interface.',
    features: [
      '9 phases — SLACK to STAND to DRIFT',
      'Sine wave arc, amplitude by phase',
      'Bioluminescent sparkles at night',
      'Live weather with tidal wave effects',
      'Geolocation with country flags',
    ],
  },
  sundial: {
    text: 'tempus fugit,',
    fadedText: 'by design.',
    headlineFont: "'Palatino Linotype','Palatino','Book Antiqua','Georgia',serif",
    subtextFont: "'Palatino Linotype','Palatino','Book Antiqua','Georgia',serif",
    subtext:
      'Nine phases carved in stone. Sol traces its arc across a travertine face — gnomon shadow shortening toward meridies, Roman numerals marking the hour. Warm marble by day. Cold moonstone by night.',
    features: [
      '9 phases — aurora to NOX to MERIDIES',
      'Carved arc with Roman numeral ticks',
      'Gnomon shadow — shortens at zenith',
      'Disappears at overcast (no sun to cast)',
      'Latin labels · Palatino italic typography',
    ],
  },
  void: {
    text: 'everything fades.',
    fadedText: 'except the sun.',
    headlineFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtextFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtext:
      'Near-black. The orb glows with real presence — a hard core and a soft bloom tracing a barely-there arc. Time and temperature are readable, but quiet. Thunder is the only drama: a full-card flash that swallows everything.',
    features: [
      'Near-black across all 9 phases',
      'Orb glow matches each phases hue',
      'Readable time & temperature at 38%',
      'Thunder: full-card white flash only',
      'Hover-reveal pill interaction',
    ],
  },
  parchment: {
    text: 'the sun,',
    fadedText: 'documented.',
    headlineFont: `ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif`,
    subtextFont: `ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif`,
    subtext:
      "Nine phases on a white surface. Sol tracks the sun and shifts the page — a faint semantic wash at dawn, clear white at noon, barely-there blue at night. No gradients. No glow. Just time, written in Notion's own hand.",
    features: [
      '9 phases — Notion semantic color washes',
      'Weather as a callout tint, not an overlay',
      'White surface · 1px hairline borders',
      'Geolocation with inline country mention',
      'Zero gradients, zero blur, zero glow',
    ],
  },
};

export const COMPACT_SKIN_COPY: Record<DesignMode, SkinCopy> = {
  foundry: {
    text: 'precision in',
    fadedText: 'every pixel.',
    headlineFont: "'SF Pro Display','Helvetica Neue',sans-serif",
    subtextFont: "'SF Pro Text','Helvetica Neue',sans-serif",
    subtext:
      'The full solar engine — nine phases, live geolocation, weather — machined down to a compact pill. Drop it into nav bars, headers, or status rows. Same signal, smaller footprint.',
    features: [
      'Compact pill for nav bars & headers',
      'Same 9 solar phases, dawn to midnight',
      'Live temperature & weather overlays',
      'Geolocation-aware with country flags',
      'Three sizes: sm, md, lg',
    ],
  },
  signal: {
    text: 'status bar',
    fadedText: 'for the sun.',
    headlineFont: "'JetBrains Mono','Fira Code','Cascadia Code','Menlo',monospace",
    subtextFont: "'JetBrains Mono','Fira Code','Cascadia Code','Menlo',monospace",
    subtext:
      'Nine phases. One readout. The full solar signal compressed into a single-line HUD element — raw environmental data at a glance. Built for toolbars, status bars, and control surfaces.',
    features: [
      'FORMAT: compact pill // inline',
      'PHASES: 9 // midnight → dawn → noon',
      'TEMP: live readout + weather icon',
      'GEO: coords + ISO country flag',
      'SIZE: sm | md | lg',
    ],
  },
  paper: {
    text: 'a quiet line',
    fadedText: 'in the margin.',
    headlineFont: "'Georgia','Times New Roman',serif",
    subtextFont: "'Georgia','Times New Roman',serif",
    subtext:
      'The full solar cycle, set in a single elegant line. Sol Compact sits in your interface like a running header — warm cream by morning, deep ink at night. Small, but never understated.',
    features: [
      'Compact pill, editorial proportions',
      'Nine phases, dawn through midnight',
      'Live temperature, softly rendered',
      'Location-aware, with country flags',
      'Three sizes to fit any measure',
    ],
  },
  mineral: {
    text: 'a gemstone',
    fadedText: 'in miniature.',
    headlineFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtextFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtext:
      'Every mineral palette from the full widget — obsidian, citrine, rose quartz, lapis — polished into a compact pill. The same stone-by-phase mapping, sized for toolbars and status rows.',
    features: [
      'Compact pill, mineral palettes',
      '9 phases — each mapped to a stone',
      'Live temperature display',
      'Geolocation with country flags',
      'Three sizes: sm, md, lg',
    ],
  },
  meridian: {
    text: 'system native,',
    fadedText: 'pill-sized.',
    headlineFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtextFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtext:
      'The same clean, system-native aesthetic — hairline borders, off-white surfaces, barely-there shadows — compressed into a compact pill. Fits seamlessly in toolbars, menus, and nav bars.',
    features: [
      'Compact pill, system-native feel',
      '9 solar phases, dawn to midnight',
      'Live temperature & weather data',
      'Geolocation-aware with country flags',
      'Three sizes: sm, md, lg',
    ],
  },
  aurora: {
    text: 'the bands',
    fadedText: 'go with you.',
    headlineFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtextFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtext:
      "Aurora's animated bands and neon corona, compressed into a compact pill. The light show follows the sun from dusk through midnight — now in a format that fits nav bars and headers.",
    features: [
      'Compact pill with aurora bands',
      '9 phases — dusk to midnight aurora',
      'Live temperature & weather overlays',
      'Geolocation with country flags',
      'Three sizes: sm, md, lg',
    ],
  },
  tide: {
    text: 'the wave,',
    fadedText: 'condensed.',
    headlineFont:
      "'Barlow Condensed','Inter Condensed','SF Pro Display','Helvetica Neue',sans-serif",
    subtextFont: "'Barlow Condensed','Inter Condensed','SF Pro Text','Helvetica Neue',sans-serif",
    subtext:
      'The full tidal sine wave compressed into a three-row compact instrument. SLACK, FLOOD, EBB — tidal phase labels, animated wave track, bioluminescent orb. Nautical precision for nav bars and headers.',
    features: [
      'Sine wave track with tidal labels',
      '9 phases — SLACK to STAND to DRIFT',
      'Animated wave amplitude by phase',
      'Live temperature in condensed type',
      'Three sizes: sm, md, lg',
    ],
  },
  sundial: {
    text: 'carpe',
    fadedText: 'horam.',
    headlineFont: "'Palatino Linotype','Palatino','Book Antiqua','Georgia',serif",
    subtextFont: "'Palatino Linotype','Palatino','Book Antiqua','Georgia',serif",
    subtext:
      'The parabolic arc and gnomon shadow, reduced to compact dimensions. Latin phase labels in Palatino italic. Roman numeral hour ticks. Stone warmth that works in any header, toolbar, or nav bar.',
    features: [
      'Parabolic arc with gnomon shadow',
      '9 phases — NOX to MERIDIES in Latin',
      'Roman numeral ticks along the arc',
      'Palatino italic throughout',
      'Three sizes: sm, md, lg',
    ],
  },
  void: {
    text: 'almost',
    fadedText: 'nothing.',
    headlineFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtextFont: "'Inter','SF Pro Display','Helvetica Neue',sans-serif",
    subtext:
      'A near-black pill with a visible orb glow and readable phase label. Temperature and time sit at 40% opacity — present, but not competing. The most minimal solar compact in the system.',
    features: [
      'Phase-colored orb glow always visible',
      'Time & temp at 40%, hover to 68%',
      '9 phases tracked silently',
      'Thunder: the only moment of drama',
      'Three sizes: sm, md, lg',
    ],
  },
  parchment: {
    text: 'a property',
    fadedText: 'that knows the time.',
    headlineFont: `ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif`,
    subtextFont: `ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif`,
    subtext:
      'Sol Compact, rendered as a Notion callout block. Phase name, live temperature, and a 1px hairline track — all on a white surface with a faint semantic tint. Fits any Notion-style dashboard or sidebar.',
    features: [
      'Callout block aesthetic, Notion-native',
      '9 phases with semantic color washes',
      'Weather tint — no animated overlays',
      'Geolocation with country flags',
      'Three sizes: sm, md, lg',
    ],
  },
};
