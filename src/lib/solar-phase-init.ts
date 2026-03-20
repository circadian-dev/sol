// lib/solar-phase-init.ts

import type { SolarPhase } from '../hooks/useSolarPosition';
import type { DesignMode, SkinDefinition } from '../skins/types/widget-skin.types';
import { SKIN_COPY } from '../widgets/skin-copy';

const DESIGN_KEY = 'solar-widget-design';

function buildPhaseVarsLookup(skins: Record<DesignMode, SkinDefinition>): string {
  const PHASES: SolarPhase[] = [
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
  const lookup: Record<string, Record<string, string[]>> = {};
  for (const [skinId, skin] of Object.entries(skins)) {
    lookup[skinId] = {};
    for (const phase of PHASES) {
      const v = skin.phaseVars[phase];
      const mode = skin.widgetPalettes[phase].mode === 'light' ? 'l' : 'd';
      lookup[skinId][phase] = [
        v.textPrimary,
        v.textSecondary,
        v.accent,
        v.surface,
        v.bgBase,
        v.bgDeep,
        mode,
      ];
    }
  }
  return JSON.stringify(lookup);
}

export function getSolarPhaseInitScript(skins: Record<DesignMode, SkinDefinition>): string {
  const phaseVarsLookup = buildPhaseVarsLookup(skins);

  const fontLookup: Record<string, [string, string]> = {};
  for (const [skinId] of Object.entries(skins)) {
    const copy = SKIN_COPY[skinId as DesignMode];
    if (copy) fontLookup[skinId] = [copy.headlineFont, copy.subtextFont];
  }

  return `
(function() {
  try {
    var PV = ${phaseVarsLookup};
    var FL = ${JSON.stringify(fontLookup)};

    // ── 1. Read stored skin ──────────────────────────────────────────────────
    var DESIGN_KEY = '${DESIGN_KEY}';
    var skin = 'foundry';
    try {
      var stored = localStorage.getItem(DESIGN_KEY);
      if (stored && PV[stored]) skin = stored;
    } catch(e) {}

    // ── 2. Resolve phase ─────────────────────────────────────────────────────
    // Priority order:
    //   a) sessionStorage override (set by showcase time slider)
    //   b) localStorage 'last phase' fallback (survives reloads)
    //   c) Clock-computed phase (live fallback)
    //
    

    var PHASE_KEY      = 'sol-phase-override';
    var LAST_PHASE_KEY = 'sol-last-phase';
    var VALID_PHASES   = ['midnight','night','dawn','sunrise','morning','solar-noon','afternoon','sunset','dusk'];

    var phase = 'morning';
    var hasOverride = false;

    try {
      // a) sessionStorage first
      var ov = sessionStorage.getItem(PHASE_KEY);
      if (ov && VALID_PHASES.indexOf(ov) !== -1) {
        phase = ov;
        hasOverride = true;
      }

      // b) localStorage fallback — only on non-root pages
      if (!hasOverride && window.location.pathname !== '/') {
        var lv = localStorage.getItem(LAST_PHASE_KEY);
        if (lv && VALID_PHASES.indexOf(lv) !== -1) {
          phase = lv;
          hasOverride = true;
          // Restore to sessionStorage so client-side nav works
          try { sessionStorage.setItem(PHASE_KEY, lv); } catch(e) {}
        }
      }
    } catch(e) {}

    // c) Fall back to clock-computed phase if no override at all
    if (!hasOverride) {
      try {
        var now = new Date();
        var h = now.getHours() + now.getMinutes() / 60;
        if      (h >= 0   && h < 4)   phase = 'midnight';
        else if (h >= 4   && h < 5.5) phase = 'night';
        else if (h >= 5.5 && h < 6.5) phase = 'dawn';
        else if (h >= 6.5 && h < 8)   phase = 'sunrise';
        else if (h >= 8   && h < 11)  phase = 'morning';
        else if (h >= 11  && h < 13)  phase = 'solar-noon';
        else if (h >= 13  && h < 17)  phase = 'afternoon';
        else if (h >= 17  && h < 19)  phase = 'sunset';
        else if (h >= 19  && h < 21)  phase = 'dusk';
        else                           phase = 'night';
      } catch(e) {}
    }

    // ── 3. Read stored widget mode ───────────────────────────────────────────
    var widgetMode = 'solar';
    try {
      var wm = localStorage.getItem('sol-widget-mode');
      if (wm === 'solar' || wm === 'compact') widgetMode = wm;
    } catch(e) {}

    // ── 4. Write to <html> ───────────────────────────────────────────────────
    var root = document.documentElement;
    root.setAttribute('data-solar-phase', phase);
    root.setAttribute('data-solar-skin',  skin);
    root.setAttribute('data-widget-mode', widgetMode);

    // ── 5. Write CSS variables to :root with !important ──────────────────────
    var v = PV[skin] && PV[skin][phase];
    if (v) {
      root.classList.remove('dark','light');
      root.classList.add(v[6] === 'l' ? 'light' : 'dark');

      var sheet = document.getElementById('solar-runtime-theme');
      if (!sheet) {
        sheet = document.createElement('style');
        sheet.id = 'solar-runtime-theme';
        document.head.appendChild(sheet);
      }

      function hexToRgba(hex, a) {
        var h = hex.replace('#','');
        if (h.length !== 6) return 'rgba(128,128,128,' + a + ')';
        var r = parseInt(h.slice(0,2),16);
        var g = parseInt(h.slice(2,4),16);
        var b = parseInt(h.slice(4,6),16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
      }

      var ar = parseInt(v[2].replace('#','').slice(0,2),16);
      var ag = parseInt(v[2].replace('#','').slice(2,4),16);
      var ab = parseInt(v[2].replace('#','').slice(4,6),16);
      var accentFg = (ar*299+ag*587+ab*114)/1000 > 128 ? '#1a1a1a' : '#ffffff';

      sheet.textContent = ':root{' +
        '--solar-text-primary:'      + v[0] + ' !important;' +
        '--solar-text-secondary:'    + v[1] + ' !important;' +
        '--solar-accent:'            + v[2] + ' !important;' +
        '--solar-surface:'           + v[3] + ' !important;' +
        '--solar-bg-base:'           + v[4] + ' !important;' +
        '--solar-bg-deep:'           + v[5] + ' !important;' +
        '--solar-text-faded:'        + hexToRgba(v[1], 0.50) + ' !important;' +
        '--solar-input-bg:'          + hexToRgba(v[4], 0.60) + ' !important;' +
        '--solar-input-border:'      + hexToRgba(v[2], 0.28) + ' !important;' +
        '--solar-input-placeholder:' + hexToRgba(v[1], 0.38) + ' !important;' +
        '--solar-accent-fg:'         + accentFg               + ' !important;' +
        '--solar-headline-font:'     + (FL[skin] ? FL[skin][0] : 'inherit') + ' !important;' +
        '--solar-body-font:'         + (FL[skin] ? FL[skin][1] : 'inherit') + ' !important;' +
        '}';

      // Set data-solar-ready immediately in the init script so that the 2s
      // CSS transition (defined in globals.css for html[data-solar-ready] *)
      // starts from the CORRECT solar colors, not from browser/Tailwind defaults.
      // Without this, on reload the transition goes: black → solar-color (2s fade).
      // With this, colors are already correct before first paint — no flash.
      root.setAttribute('data-solar-ready', '');
    }

  } catch(e) {}
})();
  `.trim();
}
