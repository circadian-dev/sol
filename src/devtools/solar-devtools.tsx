'use client';

// src/devtools/solar-devtools.tsx
//
// Bottom-fixed dev pill for scrubbing solar phases.
// Reads the active skin's widgetPalettes so the timeline gradient
// changes colour automatically when the user switches skins.
//
// Calls ctx.setSimulatedDate when scrubbing so every SolarWidget and
// CompactWidget in the tree picks up the simulated time and moves its
// orb to the correct arc position — without requiring any prop wiring
// at the call site.

import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SolarPhase } from '../hooks/useSolarPosition';
import {
  clearSessionTimeMinutes,
  getSessionIsLive,
  getSessionTimeMinutes,
  setSessionLive,
  setSessionTimeMinutes,
} from '../lib/solar-phase-session';
import { useSolarTheme } from '../provider/solar-theme-provider';
import { buildSliderGradient, formatTime, phaseForMinutes } from './timeline';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SolarDevToolsProps {
  defaultOpen?: boolean;
  position?: 'bottom-left' | 'bottom-center' | 'bottom-right';
  enabled?: boolean;
}

// ─── Storage helpers for open/collapsed state ─────────────────────────────────

const OPEN_KEY = 'sol-devtools-open';

function getStoredOpen(fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(OPEN_KEY);
    if (v === '1') return true;
    if (v === '0') return false;
    return fallback;
  } catch {
    return fallback;
  }
}

function setStoredOpen(open: boolean): void {
  try {
    localStorage.setItem(OPEN_KEY, open ? '1' : '0');
  } catch {}
}

// ─── Positioning map ──────────────────────────────────────────────────────────

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  'bottom-left': { left: 16, right: 'auto' },
  'bottom-center': { left: '50%', transform: 'translateX(-50%)' },
  'bottom-right': { right: 16, left: 'auto' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SolarDevTools({
  defaultOpen = false,
  position = 'bottom-center',
  enabled = true,
}: SolarDevToolsProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!enabled || !mounted) return null;
  return createPortal(
    <DevToolsInner defaultOpen={defaultOpen} position={position} />,
    document.body,
  );
}

// ─── Inner (rendered inside portal) ───────────────────────────────────────────

function DevToolsInner({
  defaultOpen,
  position,
}: {
  defaultOpen: boolean;
  position: 'bottom-left' | 'bottom-center' | 'bottom-right';
}) {
  const { setOverridePhase, setSimulatedDate, activeSkin, solarPosition } = useSolarTheme();

  // ── Open / collapsed ────────────────────────────────────────────────────────
  const [open, setOpen] = useState(() => getStoredOpen(defaultOpen));
  const toggleOpen = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      setStoredOpen(next);
      return next;
    });
  }, []);

  // ── Time state ───────────────────────────────────────────────────────────────
  const [timeMinutes, setTimeMinutes] = useState(720);
  const [useLive, setUseLive] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: setSimulatedDate is stable
  useEffect(() => {
    if (getSessionIsLive()) {
      setUseLive(true);
      const now = new Date();
      setTimeMinutes(now.getHours() * 60 + now.getMinutes());
      return;
    }
    const saved = getSessionTimeMinutes();
    if (saved !== null) {
      setTimeMinutes(saved);
      setUseLive(false);
      // Restore simulatedDate on mount so widgets are immediately correct
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setMinutes(saved);
      setSimulatedDate(d);
      return;
    }
    const now = new Date();
    setTimeMinutes(now.getHours() * 60 + now.getMinutes());
    setUseLive(true);
    setSessionLive(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // ^ setSimulatedDate is stable (useCallback in provider), safe to omit

  // ── Phase resolution ────────────────────────────────────────────────────────
  const providerSolarPhase = solarPosition?.phase;
  const sliderPhase: SolarPhase = useLive
    ? (providerSolarPhase ?? phaseForMinutes(timeMinutes))
    : phaseForMinutes(timeMinutes);

  // ── Sync phase to provider ───────────────────────────────────────────────────
  useEffect(() => {
    setOverridePhase(sliderPhase);
  }, [sliderPhase, setOverridePhase]);

  // ── Go Live ─────────────────────────────────────────────────────────────────
  const goLive = useCallback(() => {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    setTimeMinutes(mins);
    setUseLive(true);
    setOverridePhase(null);
    setSimulatedDate(undefined); // clear — widgets return to real current time
    clearSessionTimeMinutes();
    setSessionLive(true);
  }, [setOverridePhase, setSimulatedDate]);

  // ── Slider onChange ──────────────────────────────────────────────────────────
  const handleSliderChange = useCallback(
    (val: number) => {
      setUseLive(false);
      setTimeMinutes(val);
      setSessionTimeMinutes(val);
      setSessionLive(false);
      // Push simulated date into context so every widget's orb moves
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setMinutes(val);
      setSimulatedDate(d);
    },
    [setSimulatedDate],
  );

  // ── Skin-aware palettes ─────────────────────────────────────────────────────
  const activePalettes = activeSkin.widgetPalettes;
  const currentPalette = activePalettes[sliderPhase];
  const gradient = useMemo(() => buildSliderGradient(activePalettes), [activePalettes]);

  // ── Accent from current skin + phase ────────────────────────────────────────
  const accent = currentPalette.accentColor;
  const textPrimary = currentPalette.textColor;
  const bgColor = currentPalette.bg[1];
  const isLight = currentPalette.mode === 'light';

  // ── Position styles ─────────────────────────────────────────────────────────
  const posStyles = POSITION_STYLES[position] ?? POSITION_STYLES['bottom-center'];

  // ── Collapsed pill ──────────────────────────────────────────────────────────
  if (!open) {
    return (
      <button
        type="button"
        onClick={toggleOpen}
        style={{
          position: 'fixed',
          bottom: 16,
          ...posStyles,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 9999,
          border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'}`,
          background: bgColor,
          color: textPrimary,
          fontSize: 13,
          fontWeight: 500,
          fontFamily: 'inherit',
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
          transition: 'background 0.3s, color 0.3s, border-color 0.3s',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: useLive ? '#22c55e' : '#f59e0b',
            flexShrink: 0,
          }}
        />
        <span style={{ textTransform: 'capitalize' }}>{sliderPhase.replace('-', ' ')}</span>
      </button>
    );
  }

  // ── Expanded panel ──────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        ...posStyles,
        zIndex: 99999,
        width: 380,
        maxWidth: 'calc(100vw - 32px)',
        borderRadius: 16,
        border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'}`,
        background: bgColor,
        color: textPrimary,
        boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
        fontFamily: 'inherit',
        transition: 'background 0.3s, color 0.3s, border-color 0.3s',
        overflow: 'hidden',
      }}
    >
      {/* Header — click to collapse */}
      <button
        type="button"
        onClick={toggleOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '12px 16px',
          background: 'none',
          border: 'none',
          color: 'inherit',
          fontSize: 13,
          fontWeight: 500,
          fontFamily: 'inherit',
          cursor: 'pointer',
          borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: useLive ? '#22c55e' : '#f59e0b',
            flexShrink: 0,
          }}
        />
        <span style={{ flex: 1, textAlign: 'left', textTransform: 'capitalize' }}>
          {sliderPhase.replace('-', ' ')}
        </span>
        <span style={{ fontSize: 11, opacity: 0.5 }}>▾ collapse</span>
      </button>

      {/* Panel body */}
      <div style={{ padding: 16 }}>
        {/* Live button + time display */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: 0.5,
            }}
          >
            Time of Day
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!useLive && (
              <span style={{ fontSize: 13, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(timeMinutes)}
                <span
                  style={{ marginLeft: 8, fontSize: 11, opacity: 0.6, textTransform: 'capitalize' }}
                >
                  {sliderPhase.replace('-', ' ')}
                </span>
              </span>
            )}
            <button
              type="button"
              onClick={goLive}
              disabled={useLive}
              style={{
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'inherit',
                border: `1px solid ${useLive ? 'transparent' : isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
                background: useLive
                  ? accent
                  : isLight
                    ? 'rgba(0,0,0,0.04)'
                    : 'rgba(255,255,255,0.06)',
                color: useLive
                  ? isLight
                    ? '#fff'
                    : '#000'
                  : isLight
                    ? 'rgba(0,0,0,0.5)'
                    : 'rgba(255,255,255,0.5)',
                cursor: useLive ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {useLive ? '● Live' : 'Go Live'}
            </button>
          </div>
        </div>

        {/* Gradient slider */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              height: 8,
              borderRadius: 9999,
              width: '100%',
              background: gradient,
              opacity: 0.6,
            }}
          />
          <input
            type="range"
            min={0}
            max={1439}
            step={5}
            value={timeMinutes}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
              margin: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              width: 16,
              height: 16,
              borderRadius: '50%',
              pointerEvents: 'none',
              left: `${(timeMinutes / 1439) * 100}%`,
              transform: 'translate(-50%, -50%)',
              background: accent,
              boxShadow: `0 0 8px ${accent}, 0 2px 8px rgba(0,0,0,0.3)`,
              border: '2px solid rgba(255,255,255,0.6)',
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
          />
        </div>

        {/* Hour markers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {[0, 6, 12, 18, 24].map((h) => (
            <span
              key={h}
              style={{
                fontSize: 10,
                fontVariantNumeric: 'tabular-nums',
                opacity: 0.4,
              }}
            >
              {String(h % 24).padStart(2, '0')}:00
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
