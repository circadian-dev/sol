// lib/use-initial-skin.ts
'use client';

import { useSyncExternalStore } from 'react';
import type { DesignMode } from '../skins';

const VALID_SKINS: DesignMode[] = ['foundry', 'paper', 'signal', 'meridian', 'mineral', 'aurora'];

function getSnapshot(): DesignMode {
  const attr = document.documentElement.getAttribute('data-solar-skin') as DesignMode | null;
  if (attr && VALID_SKINS.includes(attr)) return attr;
  return 'foundry';
}

function getServerSnapshot(): DesignMode {
  return 'foundry'; // SSR always returns foundry — inline script corrects before paint
}

function subscribe(cb: () => void) {
  // The attribute is set once by the inline script and then by React state —
  // we don't need to observe mutations, but the API requires a subscribe fn.
  return () => {};
}

export function useInitialSkin(): DesignMode {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
