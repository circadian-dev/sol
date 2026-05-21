/**
 * src/lib/reverse-geocode.ts
 *
 * Reverse geocoding for the SolarThemeProvider.
 *
 * Resolves a precise city/locality name from coordinates, used to refine the
 * instant timezone-centroid city once browser geolocation becomes available.
 *
 * Provider: BigDataCloud free reverse-geocode-client endpoint.
 *   - No API key required
 *   - Free tier: 10k requests/month (ample for a widget library)
 *   - Covers localities, suburbs, and small towns globally
 *   - GDPR-compliant, no personal data stored
 *   - Docs: https://www.bigdatacloud.com/geocoding-apis/free-reverse-geocode-to-city-api
 *
 * Resolution priority (most → least specific):
 *   locality            "Horsens"           (neighbourhood / district / town)
 *   city                "Aarhus"            (nearest major city)
 *   principalSubdivision "Central Denmark Region"  (state / region fallback)
 */

interface BDCResponse {
  locality: string;
  city: string;
  principalSubdivision: string;
  countryName: string;
  countryCode: string;
}

const BDC_ENDPOINT = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

/**
 * Fetches the nearest locality/city name for the given coordinates.
 * Returns null on any error so callers can fall back gracefully.
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
  try {
    const url = `${BDC_ENDPOINT}?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const res = await fetch(url, signal ? { signal } : undefined);
    if (!res.ok) return null;

    const data: BDCResponse = await res.json();

    // Return the most specific non-empty name available
    return data.locality?.trim() || data.city?.trim() || data.principalSubdivision?.trim() || null;
  } catch {
    // Covers AbortError, network failure, parse error
    return null;
  }
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
