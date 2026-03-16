# Biome Lint Fix Agent

You are a TypeScript/React code fixer. Your job is to resolve all remaining Biome lint errors in this codebase without changing any logic or visual behavior.

## Context

This is a React/Next.js project using TypeScript, Tailwind CSS, and Framer Motion. It uses Biome for linting and formatting. There are currently ~78 lint errors across 3 rule categories.

Run `bun run lint 2>&1` first to see the current error list, then fix each one.

---

## Rules & How to Fix Them

### 1. `lint/a11y/noSvgWithoutTitle`

**All SVGs in this codebase are decorative** (icons, backgrounds, visual effects). The correct fix is always `aria-hidden="true"` — never add a `<title>` element.

**Pattern A — single-line SVG:**
```tsx
// Before
<svg width="16" height="16" viewBox="0 0 16 16" fill="none">

// After
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
```

**Pattern B — multi-line SVG (opening tag spans multiple lines):**
```tsx
// Before
<svg
  className="absolute inset-0"
  width={W}
  height={H}
  viewBox={`0 0 ${W} ${H}`}
>

// After
<svg
  aria-hidden="true"
  className="absolute inset-0"
  width={W}
  height={H}
  viewBox={`0 0 ${W} ${H}`}
>
```

Add `aria-hidden="true"` as the **first prop** on multi-line SVGs. Skip any SVG that already has `aria-hidden`, `aria-label`, `aria-labelledby`, or `role`.

---

### 2. `lint/suspicious/noArrayIndexKey`

**Case A — geometry arrays** (`solar-weather-icons.tsx`, `mineral.compact.tsx`):  
Arrays of computed geometry objects with unique coordinates. Use coordinate-based keys:

```tsx
// Before
{blocks.map((b, i) => (
  <rect key={i} x={b.x} y={b.y} ... />
))}
{blocks.map((b, i) => (
  <line key={`h${i}`} x1={b.x} ... />
))}
{blocks.map((b, i) => (
  <line key={`l${i}`} x1={b.x} ... />
))}

// After
{blocks.map((b) => (
  <rect key={`rect-${b.x}-${b.y}`} x={b.x} y={b.y} ... />
))}
{blocks.map((b) => (
  <line key={`hline-${b.x}-${b.y}`} x1={b.x} ... />
))}
{blocks.map((b) => (
  <line key={`lline-${b.x}-${b.y}`} x1={b.x} ... />
))}
```

Remove the unused `i` parameter from the map callback once the key no longer uses it.

**Case B — fixed-length decorative particle arrays** (`foundry.component.tsx`, `weather-layer.tsx`):  
These are `Array.from({ length: N })` arrays used purely for visual decoration where order never changes. Add a biome-ignore comment:

```tsx
// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative array, order is stable
{Array.from({ length: 32 }).map((_, i) => (
  <motion.div key={i} ... />
))}
```

---

### 3. `lint/complexity/noForEach`

**Location:** `aurora.component.tsx` around line 353.

Replace `.forEach` with `for...of`:

```tsx
// Before
const setPos = (x: number, y: number) => {
  [refs.coronaFar, refs.coronaNear, refs.center].forEach((r) => {
    r.current?.setAttribute('cx', String(x));
    r.current?.setAttribute('cy', String(y));
  });
};

// After
const setPos = (x: number, y: number) => {
  for (const r of [refs.coronaFar, refs.coronaNear, refs.center]) {
    r.current?.setAttribute('cx', String(x));
    r.current?.setAttribute('cy', String(y));
  }
};
```

---

## Files to Check

Focus on these files — they are known to have errors:

```
src/skins/aurora/aurora.component.tsx
src/skins/foundry/foundry.component.tsx
src/skins/void/void.component.tsx
src/skins/void/void.compact.tsx
src/skins/mineral/mineral.component.tsx
src/skins/mineral/mineral.compact.tsx
src/skins/meridian/meridian.component.tsx
src/skins/meridian/meridian.compact.tsx
src/shared/solar-weather-icons.tsx
src/shared/weather-layer.tsx
```

---

## Verification

After making all changes, run:

```bash
bun run lint
```

The expected output is:
```
Checked 57 files in Xms. No fixes applied.
Found 0 errors.
```

If errors remain, re-read the lint output and apply the same rules above to any newly visible errors (the 193 hidden diagnostics are the same patterns in other skin files not listed above — apply the same `aria-hidden="true"` fix).

---

## Constraints

- **Do not change any logic, props, styles, animations, or visual output**
- **Do not add `<title>` elements to SVGs** — always use `aria-hidden="true"`
- **Do not restructure components** — make the minimum change needed to satisfy the rule
- **Do not run `--unsafe` fixes** — all fixes here are safe and manual
- Preserve all existing `// biome-ignore` comments