/**
 * src/lib/reverse-geocode.ts
 *
 * Reverse geocoding for the SolarThemeProvider.
 *
 * Resolves a precise city/locality name from coordinates, used to refine the
 * instant timezone-centroid city once browser geolocation becomes available.
 *
 * Provider: BigDataCloud free reverse-geocode-client endpoint.
 *   - No API key required, CORS-enabled for browser use, high free quota.
 *   - Municipality-level granularity, very reliable.
 *   - Docs: https://www.bigdatacloud.com/geocoding-apis/free-reverse-geocode-to-city-api
 *
 * Consumers that need finer (village/hamlet-level) accuracy can inject their own
 * geocoder via the SolarThemeProvider `reverseGeocoder` prop — this keeps sol
 * dependency-free and free of any third-party attribution requirements by default.
 */

const BDC_ENDPOINT = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

interface BDCResponse {
  locality: string;
  city: string;
  principalSubdivision: string;
  countryName: string;
  countryCode: string;
}

async function fetchFromBigDataCloud(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<string | null> {
  const url = `${BDC_ENDPOINT}?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
  const res = await fetch(url, signal ? { signal } : undefined);
  if (!res.ok) return null;
  const data: BDCResponse = await res.json();
  return data.locality?.trim() || data.city?.trim() || data.principalSubdivision?.trim() || null;
}

/**
 * Fetches the nearest locality/city name for the given coordinates via
 * BigDataCloud. Returns null on failure so callers degrade cleanly.
 *
 * @param lat       Latitude (precise — from browser geolocation, not centroid)
 * @param lng       Longitude
 * @param signal    Optional AbortSignal to cancel in-flight requests on cleanup
 */
export async function fetchReverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<string | null> {
  return fetchFromBigDataCloud(lat, lng, signal);
}

/**
 * Parse an instant (no-fetch) city name from an IANA timezone string.
 * Used as the initial value before geolocation resolves.
 *
 * "Europe/Copenhagen" → "Copenhagen"
 * "America/New_York"  → "New York"
 * "Asia/Ho_Chi_Minh"  → "Ho Chi Minh"
 */
export function cityFromTimezone(tz: string | null | undefined): string | null {
  if (!tz) return null;
  const segment = tz.split('/').pop() ?? '';
  const name = segment.replace(/_/g, ' ').trim();
  return name || null;
}
