//lib/country.ts
import { getName, registerLocale } from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

registerLocale(en);

export function normalizeCountryCode(countryCode?: string | null): string | null {
  const trimmed = countryCode?.trim();
  if (!trimmed) return null;
  return trimmed.toUpperCase();
}

export function getCountryName(countryCode?: string | null): string | null {
  const normalized = normalizeCountryCode(countryCode);
  if (!normalized) return null;

  return getName(normalized, 'en') || null;
}

export function formatCountryLabel(countryCode?: string | null): string | null {
  const normalized = normalizeCountryCode(countryCode);
  if (!normalized) return null;

  const name = getCountryName(normalized);
  if (!name) return normalized;

  return `${name} (${normalized})`;
}
