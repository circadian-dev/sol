/**
 * tz-centroids.ts
 *
 * A lookup table mapping IANA timezone identifiers to approximate geographic
 * centroids (latitude, longitude). Used for instant initial solar phase
 * computation without waiting for geolocation.
 *
 * These are major city centroids - not exact timezone centers. Accuracy is
 * sufficient for solar phase (within ~15-30 min), and geolocation will
 * refine coordinates when available.
 */

export interface TZCentroid {
  lat: number;
  lon: number;
}

/**
 * TZ_CENTROIDS - IANA timezone → [lat, lon] mapping
 * Using major city coordinates for each timezone as approximate centroids.
 */
export const TZ_CENTROIDS: Record<string, TZCentroid> = {
  'America/New_York': { lat: 40.71, lon: -74.0 },
  'America/Chicago': { lat: 41.85, lon: -87.65 },
  'America/Denver': { lat: 39.74, lon: -104.98 },
  'America/Los_Angeles': { lat: 34.05, lon: -118.24 },
  'America/Phoenix': { lat: 33.45, lon: -112.07 },
  'America/Anchorage': { lat: 61.22, lon: -149.9 },
  'America/Honolulu': { lat: 21.31, lon: -157.86 },
  'America/Sao_Paulo': { lat: -23.55, lon: -46.63 },
  'America/Argentina/Buenos_Aires': { lat: -34.6, lon: -58.38 },
  'America/Bogota': { lat: 4.71, lon: -74.07 },
  'America/Lima': { lat: -12.05, lon: -77.04 },
  'America/Mexico_City': { lat: 19.43, lon: -99.13 },
  'America/Toronto': { lat: 43.65, lon: -79.38 },
  'America/Vancouver': { lat: 49.25, lon: -123.12 },
  'America/Dallas': { lat: 32.78, lon: -96.8 },
  'America/Houston': { lat: 29.76, lon: -95.37 },
  'America/Detroit': { lat: 42.33, lon: -83.05 },
  'America/Atlanta': { lat: 33.75, lon: -84.39 },
  'America/Miami': { lat: 25.76, lon: -80.19 },
  'America/Seattle': { lat: 47.61, lon: -122.33 },
  'America/Boston': { lat: 42.36, lon: -71.06 },
  'America/San_Francisco': { lat: 37.77, lon: -122.42 },
  'Europe/London': { lat: 51.51, lon: -0.13 },
  'Europe/Paris': { lat: 48.85, lon: 2.35 },
  'Europe/Berlin': { lat: 52.52, lon: 13.41 },
  'Europe/Madrid': { lat: 40.42, lon: -3.7 },
  'Europe/Rome': { lat: 41.9, lon: 12.5 },
  'Europe/Amsterdam': { lat: 52.37, lon: 4.9 },
  'Europe/Stockholm': { lat: 59.33, lon: 18.07 },
  'Europe/Oslo': { lat: 59.91, lon: 10.75 },
  'Europe/Helsinki': { lat: 60.17, lon: 24.94 },
  'Europe/Warsaw': { lat: 52.23, lon: 21.01 },
  'Europe/Prague': { lat: 50.08, lon: 14.44 },
  'Europe/Moscow': { lat: 55.75, lon: 37.62 },
  'Europe/Istanbul': { lat: 41.01, lon: 28.95 },
  'Europe/Athens': { lat: 37.97, lon: 23.73 },
  'Europe/Lisbon': { lat: 38.72, lon: -9.14 },
  'Europe/Dublin': { lat: 53.33, lon: -6.25 },
  'Europe/Copenhagen': { lat: 55.68, lon: 12.57 },
  'Europe/Vienna': { lat: 48.21, lon: 16.37 },
  'Europe/Zurich': { lat: 47.38, lon: 8.54 },
  'Europe/Brussels': { lat: 50.85, lon: 4.35 },
  'Europe/Barcelona': { lat: 41.39, lon: 2.17 },
  'Europe/Munich': { lat: 48.14, lon: 11.58 },
  'Europe/Milan': { lat: 45.46, lon: 9.19 },
  'Europe/Frankfurt': { lat: 50.11, lon: 8.68 },
  'Europe/Bratislava': { lat: 48.15, lon: 17.11 },
  'Europe/Budapest': { lat: 47.5, lon: 19.04 },
  'Europe/Bucharest': { lat: 44.43, lon: 26.1 },
  'Europe/Kiev': { lat: 50.45, lon: 30.52 },
  'Europe/Alexandroupoli': { lat: 40.85, lon: 25.87 },
  'Asia/Dubai': { lat: 25.2, lon: 55.27 },
  'Asia/Kolkata': { lat: 28.61, lon: 77.21 },
  'Asia/Singapore': { lat: 1.35, lon: 103.82 },
  'Asia/Tokyo': { lat: 35.68, lon: 139.69 },
  'Asia/Seoul': { lat: 37.57, lon: 126.98 },
  'Asia/Shanghai': { lat: 31.23, lon: 121.47 },
  'Asia/Hong_Kong': { lat: 22.32, lon: 114.17 },
  'Asia/Taipei': { lat: 25.04, lon: 121.56 },
  'Asia/Bangkok': { lat: 13.75, lon: 100.52 },
  'Asia/Jakarta': { lat: -6.21, lon: 106.85 },
  'Asia/Manila': { lat: 14.6, lon: 120.98 },
  'Asia/Karachi': { lat: 24.86, lon: 67.01 },
  'Asia/Tehran': { lat: 35.69, lon: 51.42 },
  'Asia/Riyadh': { lat: 24.69, lon: 46.72 },
  'Asia/Jerusalem': { lat: 31.77, lon: 35.22 },
  'Asia/Dhaka': { lat: 23.72, lon: 90.41 },
  'Asia/Colombo': { lat: 6.93, lon: 79.85 },
  'Asia/Ho_Chi_Minh': { lat: 10.82, lon: 106.63 },
  'Asia/Kuala_Lumpur': { lat: 3.14, lon: 101.69 },
  'Asia/Yangon': { lat: 16.87, lon: 96.2 },
  'Asia/Kathmandu': { lat: 27.72, lon: 85.32 },
  'Australia/Sydney': { lat: -33.87, lon: 151.21 },
  'Australia/Melbourne': { lat: -37.81, lon: 144.96 },
  'Australia/Brisbane': { lat: -27.47, lon: 153.03 },
  'Australia/Perth': { lat: -31.95, lon: 115.86 },
  'Australia/Adelaide': { lat: -34.93, lon: 138.6 },
  'Australia/Darwin': { lat: -12.46, lon: 130.84 },
  'Pacific/Auckland': { lat: -36.87, lon: 174.76 },
  'Pacific/Honolulu': { lat: 21.31, lon: -157.86 },
  'Pacific/Fiji': { lat: -18.14, lon: 178.44 },
  'Africa/Cairo': { lat: 30.06, lon: 31.25 },
  'Africa/Johannesburg': { lat: -26.2, lon: 28.04 },
  'Africa/Lagos': { lat: 6.45, lon: 3.4 },
  'Africa/Nairobi': { lat: -1.29, lon: 36.82 },
  'Africa/Casablanca': { lat: 33.59, lon: -7.62 },
  'Africa/Addis_Ababa': { lat: 9.03, lon: 38.75 },
  'Africa/Khartoum': { lat: 15.5, lon: 32.56 },
  'Africa/Dakar': { lat: 14.72, lon: -17.45 },
} as const;

// Fallback coordinates when timezone is not found (London)
const DEFAULT_COORDS: TZCentroid = { lat: 51.5074, lon: -0.1278 };

/**
 * Get centroid coordinates for a given IANA timezone string.
 * Returns null if the timezone is not in our lookup table.
 */
export function getCentroidForTimezone(tz: string): TZCentroid | null {
  return TZ_CENTROIDS[tz] ?? null;
}

/**
 * Get centroid coordinates for the current browser timezone.
 * Falls back to London if the timezone is not recognized.
 */
export function getBrowserTimezoneCoords(): TZCentroid {
  if (typeof Intl === 'undefined') return DEFAULT_COORDS;

  try {
    const browserTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TZ_CENTROIDS[browserTZ] ?? DEFAULT_COORDS;
  } catch {
    return DEFAULT_COORDS;
  }
}

/**
 * Get the current browser timezone string.
 */
export function getBrowserTimezone(): string {
  if (typeof Intl === 'undefined') return 'Europe/London';

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Europe/London';
  }
}
