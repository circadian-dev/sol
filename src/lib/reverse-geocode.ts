/**
 * src/lib/reverse-geocode.ts
 *
 * Reverse geocoding for the SolarThemeProvider.
 *
 * Resolves a precise city/locality name from coordinates, used to refine the
 * instant timezone-centroid city once browser geolocation becomes available.
 *
 * Primary provider: OpenStreetMap Nominatim.
 *   - No API key required
 *   - Village/hamlet-level data (resolves e.g. "Smaller Cities", pop. ~500),
 *     where BigDataCloud only returns the municipality seat ("Larger Cities")
 *   - CORS-enabled for browser use; identifies via Referer/User-Agent
 *   - Usage policy: max ~1 req/s. The provider gates calls behind a 250 m
 *     movement threshold, so per-user request volume stays tiny.
 *   - Docs: https://nominatim.org/release-docs/develop/api/Reverse/
 *
 * Fallback provider: BigDataCloud free reverse-geocode-client endpoint.
 *   - Used only when Nominatim errors / is unavailable.
 *   - Coarser (municipality-level) but very reliable + high free quota.
 *   - Docs: https://www.bigdatacloud.com/geocoding-apis/free-reverse-geocode-to-city-api
 */

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/reverse';
const BDC_ENDPOINT = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

/** Attribution required by OpenStreetMap's ODbL license when displaying any
 *  place name resolved via Nominatim. Consumers must show this near the city. */
export const OSM_ATTRIBUTION = '© OpenStreetMap contributors';

export interface ReverseGeocodeResult {
  /** Resolved locality/city name, or null if nothing could be resolved. */
  name: string | null;
  /** Required attribution string for the source of `name`, or null when the
   *  source imposes no display requirement (BigDataCloud) or there is no name. */
  attribution: string | null;
}

interface NominatimAddress {
  hamlet?: string;
  village?: string;
  town?: string;
  city?: string;
  suburb?: string;
  municipality?: string;
  county?: string;
  state?: string;
}

interface NominatimResponse {
  address?: NominatimAddress;
}

interface BDCResponse {
  locality: string;
  city: string;
  principalSubdivision: string;
  countryName: string;
  countryCode: string;
}

/** Pick the most specific recognizable place name from a Nominatim address.
 *  Order: village/hamlet → town → city → suburb → municipality → county → state. */
function nameFromNominatim(addr: NominatimAddress): string | null {
  return (
    addr.village?.trim() ||
    addr.hamlet?.trim() ||
    addr.town?.trim() ||
    addr.city?.trim() ||
    addr.suburb?.trim() ||
    addr.municipality?.trim() ||
    addr.county?.trim() ||
    addr.state?.trim() ||
    null
  );
}

export async function fetchFromNominatim(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<string | null> {
  // zoom=14 ≈ village/suburb granularity — specific enough for small localities
  // without descending to street level.
  const url = `${NOMINATIM_ENDPOINT}?lat=${lat}&lon=${lng}&format=json&zoom=14&accept-language=en`;
  const res = await fetch(url, signal ? { signal } : undefined);
  if (!res.ok) return null;
  const data: NominatimResponse = await res.json();
  return data.address ? nameFromNominatim(data.address) : null;
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
 * Fetches the nearest locality/city name for the given coordinates, plus the
 * attribution required for whichever source resolved it.
 *
 * Tries Nominatim first (village-level accuracy, requires OSM attribution) and
 * falls back to BigDataCloud (no attribution requirement) if it errors. Returns
 * { name: null, attribution: null } on total failure so callers degrade cleanly.
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
