// lib/read-initial-skin.ts

import type { DesignMode } from '../skins';

const VALID_SKINS: DesignMode[] = ['foundry', 'paper', 'signal', 'meridian', 'mineral', 'aurora'];

/**
 * Reads the skin already written to data-solar-skin by the inline init script.
 * Safe to call during render — falls back to 'foundry' on SSR or unknown value.
 */
export function readInitialSkin(): DesignMode {
  if (typeof document === 'undefined') return 'foundry';
  const attr = document.documentElement.getAttribute('data-solar-skin') as DesignMode | null;
  if (attr && (VALID_SKINS as string[]).includes(attr)) return attr;
  return 'foundry';
}
