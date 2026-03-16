/**
 * skins/index.ts
 *
 * Single import point for all skin definitions.
 * Add new skins here — the widget shell and context read from SKINS.
 */

import { auroraSkin } from './aurora/aurora.definition.ts';
import { foundrySkin } from './foundry/foundry.definition.ts';
import { meridianSkin } from './meridian/meridian.definition.ts';
import { mineralSkin } from './mineral/mineral.definition.ts';
import { paperSkin } from './paper/paper.definition.ts';
import { parchmentSkin } from './parchment/parchment.definition.ts';
import { signalSkin } from './signal/signal.definition.ts';
import { sundialSkin } from './sundial/sundial.definition.ts';
import { tideSkin } from './tide/tide.definition.ts';
import { voidSkin } from './void/void.definition.ts';

import type { DesignMode, SkinDefinition } from './types/widget-skin.types';

export {
  foundrySkin,
  paperSkin,
  signalSkin,
  meridianSkin,
  mineralSkin,
  auroraSkin,
  tideSkin,
  voidSkin,
  sundialSkin,
};
export type { SkinDefinition, DesignMode };
export * from './types/widget-skin.types';

/**
 * All registered skins, keyed by DesignMode.
 * The widget shell and SolarThemeProvider read from here.
 *
 * To add a new skin:
 *   1. Create skins/myskin/myskin.definition.ts
 *   2. Create skins/myskin/myskin.component.tsx
 *   3. Add 'myskin' to DesignMode in widget-skin.types.ts
 *   4. Import and add it here
 */
export const SKINS: Record<DesignMode, SkinDefinition> = {
  foundry: foundrySkin,
  paper: paperSkin,
  signal: signalSkin,
  meridian: meridianSkin,
  mineral: mineralSkin,
  aurora: auroraSkin,
  tide: tideSkin,
  void: voidSkin,
  sundial: sundialSkin,
  parchment: parchmentSkin,
};

/**
 * Ordered list of skins for display in dropdowns/pickers.
 * Reorder here to change the UI order.
 */
export const SKIN_ORDER: DesignMode[] = [
  'foundry',
  'paper',
  'signal',
  'meridian',
  'mineral',
  'aurora',
  'tide',
  'sundial',
  'void',
  'parchment',
];
